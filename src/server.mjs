// The Agent Office web server. Serves the office page and a small JSON API for one project.
// Binds to 127.0.0.1 and accepts changes only from its own page (see allowedWrite).
import { createServer } from "node:http";
import { readFile, writeFile, readdir, mkdir, rename } from "node:fs/promises";
import { join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  paths, exists, readText, UserError, clean, checkName, checkTools, checkLook, defaultLook,
  MODELS, COMMON_TOOLS, HAIR_STYLES, parseAgent, serializeAgent, listAgents, readOffice, writeOffice,
  checkTeams, stamp, parseMessageFile,
} from "./lib.mjs";

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
// Static files the page loads, by URL. A fixed list, so no request can reach other files.
const ASSETS = { "/vendor/hairline.js": ["vendor/hairline.js", "text/javascript; charset=utf-8"] };
const STALE_MS = 20 * 60 * 1000; // a "working" agent with no events for 20 minutes is treated as stopped

// ---------- live activity (written by hooks/activity.mjs) ----------
async function activity(root) {
  const events = (await readText(paths(root).activity)).trim().split("\n").slice(-800)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const agents = {};
  const get = (n) => (agents[n] ||= { working: false, actions: 0, doing: null, since: null, lastAt: null, lastDone: null });
  for (const e of events) {
    const a = get(e.agent);
    a.lastAt = e.t;
    if (e.event === "SubagentStart") Object.assign(a, { working: true, since: e.t, actions: 0, doing: "Getting started" });
    else if (e.event === "SubagentStop") Object.assign(a, { working: false, doing: null, lastDone: e.t });
    else if (e.event === "PreToolUse" && e.agent !== "main") { a.actions++; a.doing = e.detail; }
  }
  const now = Date.now();
  for (const a of Object.values(agents)) if (a.working && now - a.lastAt > STALE_MS) Object.assign(a, { working: false, doing: null });
  delete agents.main;
  return { agents, feed: events.filter((e) => e.event !== "PreToolUse" || e.detail).slice(-40).reverse() };
}

async function messages(root) {
  const dir = paths(root).messages;
  const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".md")).sort().slice(-100);
  return (await Promise.all(files.map(async (f) => ({ file: f, ...parseMessageFile(f), text: (await readText(join(dir, f))).trim() })))).reverse();
}

async function listNames(root, dir, ext) {
  const items = await readdir(join(root, ".claude", dir), { withFileTypes: true }).catch(() => []);
  return items.filter((d) => (ext ? d.name.endsWith(ext) : d.isDirectory() || d.isSymbolicLink())).map((d) => d.name.replace(ext || "", "")).sort();
}

export async function getState(root) {
  const [agents, office, live, msgs, commands, skills, hooked] = await Promise.all([
    listAgents(root), readOffice(root), activity(root), messages(root),
    listNames(root, "commands", ".md"), listNames(root, "skills"),
    readText(paths(root).settings).then((s) => s.includes("agent-office/hooks/")),
  ]);
  return {
    project: basename(root),
    office: { name: office.name, teams: office.teams },
    agents: agents.map((a) => ({ ...a, look: checkLook(office.looks[a.name] || defaultLook(a.name)), live: live.agents[a.name] || null })),
    messages: msgs,
    feed: live.feed,
    commands, skills,
    setup: { hooksInstalled: hooked },
    options: { models: MODELS, tools: COMMON_TOOLS, hairStyles: HAIR_STYLES },
  };
}

// ---------- changes ----------
async function saveOffice(root, body) {
  const office = await readOffice(root);
  if ("name" in body) {
    const n = clean(body.name, 60);
    if (!n) throw new UserError("The office name can't be empty.");
    office.name = n;
  }
  if ("teams" in body) {
    const names = new Set((await listAgents(root)).map((a) => a.name));
    office.teams = checkTeams(body.teams, names);
  }
  await writeOffice(root, office);
  return { ok: true };
}

function agentFields(body, base = {}) {
  const description = "description" in body ? clean(body.description, 400) : base.description;
  const instructions = "instructions" in body ? String(body.instructions ?? "").slice(0, 20000) : base.instructions;
  if (!description) throw new UserError("Add a one-sentence description of what the agent does.");
  if (!String(instructions || "").trim()) throw new UserError("Add instructions for the agent.");
  const model = "model" in body ? (body.model === "" ? "" : MODELS.includes(body.model) ? body.model : null) : base.model;
  if (model === null) throw new UserError(`Model must be one of: ${MODELS.join(", ")}.`);
  // An agent with no tools line may use every tool, so "all tools" has to be chosen on purpose
  let tools = base.tools || [];
  if (body.allTools === true) tools = [];
  else if ("tools" in body) {
    tools = checkTools(body.tools);
    if (!tools.length) throw new UserError("Pick at least one tool, or choose “All tools”.");
  }
  return { description, instructions, model, tools };
}

async function placeInTeam(office, name, teamId) {
  for (const t of office.teams) {
    t.members = t.members.filter((m) => m !== name);
    if (t.lead === name) t.lead = t.members[0] || "";
  }
  const team = office.teams.find((t) => t.id === teamId);
  if (team) { team.members.push(name); team.lead ||= name; }
}

async function createAgent(root, body) {
  const name = checkName(body.name);
  const file = join(paths(root).agents, `${name}.md`);
  if (await exists(file)) throw new UserError(`An agent called "${name}" already exists.`);
  const fields = agentFields(body);
  await mkdir(paths(root).agents, { recursive: true });
  await writeFile(file, serializeAgent({ name, ...fields, extra: [] }));
  const office = await readOffice(root);
  office.looks[name] = checkLook(body.look || defaultLook(name));
  if (body.team) await placeInTeam(office, name, clean(body.team, 40));
  await writeOffice(root, office);
  return { name, file: `.claude/agents/${name}.md` };
}

async function findAgentFile(root, name) {
  const dir = paths(root).agents;
  for (const f of await readdir(dir).catch(() => [])) {
    if (!f.endsWith(".md")) continue;
    const a = parseAgent(await readText(join(dir, f)));
    if ((a.name || basename(f, ".md")) === name) return { path: join(dir, f), agent: a };
  }
  throw new UserError(`No agent called "${name}".`);
}

async function updateAgent(root, body) {
  const name = clean(body.name, 40);
  const { path, agent } = await findAgentFile(root, name);
  const newName = body.newName ? checkName(body.newName) : name;
  const newPath = join(paths(root).agents, `${newName}.md`);
  if (newName !== name && (await exists(newPath))) throw new UserError(`An agent called "${newName}" already exists.`);
  const fields = agentFields(body, agent);
  await writeFile(path, serializeAgent({ ...agent, ...fields, name: newName }));
  if (newName !== name || basename(path) !== `${newName}.md`) await rename(path, newPath);

  const office = await readOffice(root);
  const look = "look" in body ? checkLook(body.look) : office.looks[name];
  delete office.looks[name];
  if (look) office.looks[newName] = look;
  for (const t of office.teams) {
    t.members = t.members.map((m) => (m === name ? newName : m));
    if (t.lead === name) t.lead = newName;
  }
  if ("team" in body) await placeInTeam(office, newName, clean(body.team, 40));
  await writeOffice(root, office);
  return { name: newName, file: `.claude/agents/${newName}.md` };
}

// Removing an agent moves its file to .claude/agent-office/trash/ so it can be restored by hand
async function removeAgent(root, body) {
  const name = clean(body.name, 40);
  const { path } = await findAgentFile(root, name);
  await mkdir(paths(root).trash, { recursive: true });
  const dest = join(paths(root).trash, `${stamp()}--${basename(path)}`);
  await rename(path, dest);
  const office = await readOffice(root);
  delete office.looks[name];
  await placeInTeam(office, name, null);
  await writeOffice(root, office);
  return { trashed: dest.slice(root.length + 1) };
}

async function sendMessage(root, body) {
  const office = await readOffice(root);
  const to = clean(body.to, 40);
  if (to !== "all" && !office.teams.some((t) => t.id === to)) throw new UserError("Pick a team to send the message to.");
  const text = clean(body.text, 2000);
  if (!text) throw new UserError("Write a message first.");
  await mkdir(paths(root).messages, { recursive: true });
  const f = `${stamp()}--you--${to}.md`;
  await writeFile(join(paths(root).messages, f), text + "\n");
  return { file: f };
}

// ---------- http ----------
// Accept changes only from this page: a custom header (which cross-site forms can't send) plus a same-host origin
function allowedWrite(req) {
  const host = req.headers.host || "";
  const origin = req.headers.origin || "";
  return req.headers["x-agent-office"] === "1"
    && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)
    && (origin === "" || origin === `http://${host}`);
}

async function readBody(req) {
  let body = "";
  for await (const c of req) { body += c; if (body.length > 200_000) throw new UserError("Request too large."); }
  try { return JSON.parse(body || "{}"); } catch { throw new UserError("Request body must be JSON."); }
}

const ROUTES = {
  "/api/office": saveOffice,
  "/api/agents/create": createAgent,
  "/api/agents/update": updateAgent,
  "/api/agents/remove": removeAgent,
  "/api/messages": sendMessage,
};

export function createOfficeServer(root) {
  return createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    const json = (code, data) => res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" }).end(JSON.stringify(data));
    try {
      if (req.method === "GET" && url.pathname === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(await readFile(join(PUBLIC, "index.html")));
      } else if (req.method === "GET" && ASSETS[url.pathname]) {
        const [file, type] = ASSETS[url.pathname];
        res.writeHead(200, { "Content-Type": type, "Cache-Control": "max-age=3600" }).end(await readFile(join(PUBLIC, file)));
      } else if (req.method === "GET" && url.pathname === "/api/state") {
        json(200, await getState(root));
      } else if (req.method === "POST" && ROUTES[url.pathname]) {
        if (!allowedWrite(req)) return json(403, { error: "Changes are only accepted from the Agent Office page on this computer." });
        json(200, await ROUTES[url.pathname](root, await readBody(req)));
      } else {
        json(404, { error: "Not found" });
      }
    } catch (e) {
      if (e instanceof UserError) json(400, { error: e.message });
      else { console.error(e); json(500, { error: "Something went wrong on the server. Check the terminal for details." }); }
    }
  });
}
