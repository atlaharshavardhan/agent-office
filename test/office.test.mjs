import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createOfficeServer } from "../src/server.mjs";
import { parseAgent, serializeAgent, splitTools } from "../src/lib.mjs";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
let root, server, base;

before(async () => {
  root = await mkdtemp(join(tmpdir(), "agent-office-"));
  await mkdir(join(root, ".claude", "agents"), { recursive: true });
  // An existing agent with a frontmatter key we don't manage, to check it survives edits
  await writeFile(join(root, ".claude", "agents", "writer.md"), "---\nname: writer\ndescription: Writes things\ntools: Read, Write\nmodel: opus\ncolor: blue\n---\n\nWrite well.\n");
  await writeFile(join(root, ".claude", "settings.json"), JSON.stringify({ permissions: { allow: ["Bash(ls)"] } }));
  execFileSync(process.execPath, [join(PKG, "bin", "agent-office.mjs"), "init", "--dir", root]);
  server = createOfficeServer(root);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { server.close(); await rm(root, { recursive: true, force: true }); });

const post = (path, body, headers = { "X-Agent-Office": "1" }) =>
  fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) })
    .then(async (r) => ({ status: r.status, body: await r.json() }));
const state = () => fetch(base + "/api/state").then((r) => r.json());

test("init keeps existing settings and adds hooks once", async () => {
  execFileSync(process.execPath, [join(PKG, "bin", "agent-office.mjs"), "init", "--dir", root]); // second run
  const s = JSON.parse(await readFile(join(root, ".claude", "settings.json"), "utf8"));
  assert.deepEqual(s.permissions, { allow: ["Bash(ls)"] });
  assert.equal(s.hooks.SubagentStart.length, 2);
  assert.equal(s.hooks.PreToolUse.length, 1);
  assert.ok((await state()).setup.hooksInstalled);
});

test("frontmatter round-trips and keeps unknown keys", () => {
  const a = parseAgent("---\nname: x\ndescription: \"Says: hi\"\ntools: Read, Agent(a, b)\ncolor: red\n---\n\nBody\n");
  assert.equal(a.description, "Says: hi");
  assert.deepEqual(a.tools, ["Read", "Agent(a, b)"]);
  assert.deepEqual(parseAgent(serializeAgent(a)), a);
  assert.deepEqual(splitTools("A, B(c, d),E"), ["A", "B(c, d)", "E"]);
});

test("rejects changes without the page header or from another site", async () => {
  assert.equal((await post("/api/office", { name: "x" }, {})).status, 403);
  assert.equal((await post("/api/office", { name: "x" }, { "X-Agent-Office": "1", Origin: "https://evil.example" })).status, 403);
});

test("renames the office", async () => {
  assert.equal((await post("/api/office", { name: "Studio HQ" })).status, 200);
  assert.equal((await state()).office.name, "Studio HQ");
});

test("creates an agent with a look and validates input", async () => {
  assert.equal((await post("/api/agents/create", { name: "../x", description: "d", instructions: "i", tools: ["Read"] })).status, 400);
  assert.equal((await post("/api/agents/create", { name: "writer", description: "d", instructions: "i", tools: ["Read"] })).status, 400);
  assert.equal((await post("/api/agents/create", { name: "bad-tools", description: "d", instructions: "i", tools: ["Read; rm -rf"] })).status, 400);
  assert.equal((await post("/api/agents/create", { name: "no-tools", description: "d", instructions: "i", tools: [] })).status, 400);
  const r = await post("/api/agents/create", {
    name: "researcher", description: "Finds facts: with sources", instructions: "Research carefully.", tools: ["Read", "WebSearch"], model: "sonnet",
    look: { skin: "#8d5524", hairStyle: "curly", hairColor: "#120d0a", outfit: "#ff9933", glasses: true },
  });
  assert.equal(r.status, 200);
  const md = await readFile(join(root, ".claude", "agents", "researcher.md"), "utf8");
  assert.match(md, /description: "Finds facts: with sources"/);
  const a = (await state()).agents.find((x) => x.name === "researcher");
  assert.equal(a.look.hairStyle, "curly");
  assert.equal(a.look.glasses, true);
});

test("teams: membership is unique and links point at real teams", async () => {
  const r = await post("/api/office", { teams: [
    { id: "research", name: "Research", members: ["researcher", "writer", "ghost"], talksTo: ["writing", "nowhere"] },
    { id: "writing", name: "Writing", members: ["writer"], talksTo: ["research"] },
  ] });
  assert.equal(r.status, 200);
  const t = (await state()).office.teams;
  assert.deepEqual(t[0].members, ["researcher", "writer"]);
  assert.deepEqual(t[0].talksTo, ["writing"]);
  assert.deepEqual(t[1].members, []);
  assert.equal(t[0].lead, "researcher");
});

test("editing an agent renames its file, keeps unknown keys and follows it in teams", async () => {
  const r = await post("/api/agents/update", { name: "writer", newName: "scriptwriter", instructions: "Write scripts.", team: "writing" });
  assert.equal(r.status, 200);
  const files = await readdir(join(root, ".claude", "agents"));
  assert.ok(files.includes("scriptwriter.md") && !files.includes("writer.md"));
  const md = await readFile(join(root, ".claude", "agents", "scriptwriter.md"), "utf8");
  assert.match(md, /name: scriptwriter/);
  assert.match(md, /model: opus/);
  assert.match(md, /color: blue/);
  assert.match(md, /Write scripts\./);
  const t = (await state()).office.teams;
  assert.deepEqual(t.find((x) => x.id === "writing").members, ["scriptwriter"]);
  assert.ok(!t.find((x) => x.id === "research").members.includes("writer"));
});

test("all tools must be chosen on purpose", async () => {
  assert.equal((await post("/api/agents/update", { name: "scriptwriter", allTools: true })).status, 200);
  const md = await readFile(join(root, ".claude", "agents", "scriptwriter.md"), "utf8");
  assert.doesNotMatch(md, /^tools:/m);
});

test("messages are written as files and briefed to agents on start", async () => {
  assert.equal((await post("/api/messages", { to: "nowhere", text: "x" })).status, 400);
  assert.equal((await post("/api/messages", { to: "research", text: "Cite every number." })).status, 200);
  const out = execFileSync(process.execPath, [join(root, ".claude", "agent-office", "hooks", "team-context.mjs")], {
    input: JSON.stringify({ hook_event_name: "SubagentStart", agent_type: "researcher" }), env: { ...process.env, CLAUDE_PROJECT_DIR: root },
  }).toString();
  const ctx = JSON.parse(out).hookSpecificOutput.additionalContext;
  assert.match(ctx, /"Research" team/);
  assert.match(ctx, /Cite every number\./);
  assert.match(ctx, /--research--<team id>\.md/);
});

test("activity hook feeds the live office", async () => {
  const hook = join(root, ".claude", "agent-office", "hooks", "activity.mjs");
  const run = (e) => execFileSync(process.execPath, [hook], { input: JSON.stringify(e), env: { ...process.env, CLAUDE_PROJECT_DIR: root } });
  run({ hook_event_name: "SubagentStart", agent_type: "researcher" });
  run({ hook_event_name: "PreToolUse", agent_type: "researcher", tool_name: "WebSearch", tool_input: { query: "UPI volume" } });
  run({ hook_event_name: "PreToolUse", tool_name: "Read", tool_input: { file_path: "x" } }); // main session noise: ignored
  const a = (await state()).agents.find((x) => x.name === "researcher");
  assert.equal(a.live.working, true);
  assert.equal(a.live.doing, "Searching “UPI volume”");
  assert.equal(a.live.actions, 1);
});

test("removing an agent moves it to the trash and out of its team", async () => {
  const r = await post("/api/agents/remove", { name: "researcher" });
  assert.equal(r.status, 200);
  assert.ok(!(await readdir(join(root, ".claude", "agents"))).includes("researcher.md"));
  assert.equal((await readdir(join(root, ".claude", "agent-office", "trash"))).length, 1);
  const t = (await state()).office.teams;
  assert.ok(!t.some((x) => x.members.includes("researcher")));
});
