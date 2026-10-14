#!/usr/bin/env node
// agent-office: a live office for Claude Code agents.
//   agent-office init   set up the current project (hooks + office config)
//   agent-office        open the office for the current project
import { readFile, writeFile, mkdir, copyFile, readdir } from "node:fs/promises";
import { join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { paths, exists } from "../src/lib.mjs";
import { createOfficeServer } from "../src/server.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const HOOK_SRC = join(HERE, "..", "src", "hooks");

function args(argv) {
  const out = { cmd: "start", port: 4321, dir: process.cwd() };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--port" || a === "-p") out.port = Number(argv[++i]);
    else if (a === "--dir" || a === "-d") out.dir = resolve(argv[++i]);
    else if (a === "--help" || a === "-h") out.cmd = "help";
    else if (!a.startsWith("-")) out.cmd = a;
  }
  return out;
}

const HELP = `agent-office — a live office for your Claude Code agents

Usage
  npx github:atlaharshavardhan/agent-office init     Set up this project (run once)
  npx github:atlaharshavardhan/agent-office          Open the office at http://localhost:4321

Options
  --dir, -d <path>   Project folder (default: current folder)
  --port, -p <n>     Port (default: 4321; the next free port is used if it's taken)
  --help, -h         Show this help
`;

// Add our hooks to .claude/settings.json without touching anything else in it
async function installHooks(root) {
  const p = paths(root);
  let settings = {};
  if (await exists(p.settings)) {
    try { settings = JSON.parse(await readFile(p.settings, "utf8")); }
    catch { throw new Error(`${p.settings} isn't valid JSON, so I didn't change it. Fix it and run init again.`); }
  }
  const cmd = (script) => `node "$CLAUDE_PROJECT_DIR/.claude/agent-office/hooks/${script}"`;
  const want = [
    ["SubagentStart", null, "activity.mjs"],
    ["SubagentStart", null, "team-context.mjs"],
    ["SubagentStop", null, "activity.mjs"],
    ["PreToolUse", "*", "activity.mjs"],
  ];
  settings.hooks ||= {};
  let added = 0;
  for (const [event, matcher, script] of want) {
    const list = (settings.hooks[event] ||= []);
    const already = list.some((g) => (g.hooks || []).some((h) => String(h.command || "").includes(`agent-office/hooks/${script}`)));
    if (already) continue;
    const entry = { hooks: [{ type: "command", command: cmd(script) }] };
    if (matcher) entry.matcher = matcher;
    list.push(entry);
    added++;
  }
  await mkdir(dirname(p.settings), { recursive: true });
  await writeFile(p.settings, JSON.stringify(settings, null, 2) + "\n");
  return added;
}

async function init(root) {
  const p = paths(root);
  await mkdir(p.hooks, { recursive: true });
  await mkdir(p.messages, { recursive: true });
  for (const f of await readdir(HOOK_SRC)) await copyFile(join(HOOK_SRC, f), join(p.hooks, f));
  if (!(await exists(p.config))) {
    await writeFile(p.config, JSON.stringify({ name: `${basename(root)} office`, teams: [], looks: {} }, null, 2) + "\n");
  }
  await writeFile(join(p.home, ".gitignore"), "activity.jsonl\ntrash/\n");
  const added = await installHooks(root);
  console.log(`Agent Office is set up in ${root}

  .claude/agent-office/office.json   office name, teams and agent looks
  .claude/agent-office/messages/     messages between teams
  .claude/agent-office/hooks/        live activity + team briefing hooks
  .claude/settings.json              ${added ? `${added} hook${added === 1 ? "" : "s"} added` : "hooks already present"}

Next: run "npx github:atlaharshavardhan/agent-office" here to open the office.
Restart any running Claude Code session so it picks up the new hooks.`);
}

function listen(server, port, tries = 10) {
  return new Promise((ok, fail) => {
    server.once("error", (e) => (e.code === "EADDRINUSE" && tries > 0 ? listen(server, port + 1, tries - 1).then(ok, fail) : fail(e)));
    server.listen(port, "127.0.0.1", () => ok(port));
  });
}

async function start(root, port) {
  if (!(await exists(paths(root).config))) {
    console.log(`Tip: run "agent-office init" in ${root} first to turn on live activity and team messages.\n`);
  }
  const used = await listen(createOfficeServer(root), port);
  console.log(`Agent Office for ${basename(root)} → http://localhost:${used}\nPress Ctrl+C to stop.`);
}

const a = args(process.argv.slice(2));
try {
  if (a.cmd === "help") console.log(HELP);
  else if (a.cmd === "init") await init(a.dir);
  else if (a.cmd === "start") await start(a.dir, a.port);
  else { console.log(`Unknown command "${a.cmd}".\n\n${HELP}`); process.exitCode = 1; }
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
