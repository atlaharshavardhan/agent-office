// Shared helpers: project paths, agent files (frontmatter + instructions) and the office config.
import { readFile, writeFile, readdir, mkdir, rename, stat } from "node:fs/promises";
import { join, basename } from "node:path";

export const paths = (root) => ({
  root,
  agents: join(root, ".claude", "agents"),
  home: join(root, ".claude", "agent-office"),
  config: join(root, ".claude", "agent-office", "office.json"),
  messages: join(root, ".claude", "agent-office", "messages"),
  activity: join(root, ".claude", "agent-office", "activity.jsonl"),
  trash: join(root, ".claude", "agent-office", "trash"),
  hooks: join(root, ".claude", "agent-office", "hooks"),
  settings: join(root, ".claude", "settings.json"),
});

export const exists = (p) => stat(p).then(() => true, () => false);
export const readText = (p) => readFile(p, "utf8").catch(() => "");

// ---------- validation ----------
export const SLUG = /^[a-z][a-z0-9-]{1,39}$/;
export const MODELS = ["sonnet", "opus", "haiku", "inherit"];
export const COMMON_TOOLS = ["Read", "Write", "Edit", "Glob", "Grep", "Bash", "WebSearch", "WebFetch", "Agent"];
// A tool entry: Name, Name(args) or mcp__server__tool
const TOOL = /^[A-Za-z][\w-]*(\([^()\n]{0,200}\))?$/;
export const HAIR_STYLES = ["short", "bun", "curly", "long", "side", "buzz", "ponytail", "bald"];
const HEX = /^#[0-9a-f]{6}$/i;

export class UserError extends Error {}
export const clean = (s, max) => String(s ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);

export function checkName(name) {
  const n = clean(name, 40).toLowerCase();
  if (!SLUG.test(n)) throw new UserError("Names use 2-40 lowercase letters, numbers and dashes, and start with a letter.");
  return n;
}

// Split "Read, Agent(a, b), Write" on commas that are not inside parentheses
export function splitTools(s) {
  const out = []; let depth = 0, cur = "";
  for (const ch of String(s ?? "")) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) { if (cur.trim()) out.push(cur.trim()); cur = ""; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

export function checkTools(list) {
  const tools = [...new Set((Array.isArray(list) ? list : splitTools(list)).map((t) => clean(t, 220)).filter(Boolean))];
  for (const t of tools) if (!TOOL.test(t)) throw new UserError(`"${t}" is not a valid tool name.`);
  return tools;
}

export function checkLook(look = {}) {
  return {
    skin: HEX.test(look.skin) ? look.skin : "#c68b59",
    hairColor: HEX.test(look.hairColor) ? look.hairColor : "#1b1b2f",
    hairStyle: HAIR_STYLES.includes(look.hairStyle) ? look.hairStyle : "short",
    outfit: HEX.test(look.outfit) ? look.outfit : "#7c4dff",
    glasses: !!look.glasses,
    beard: !!look.beard,
  };
}

// A stable default look so every agent has a face before anyone customises it
export function defaultLook(name) {
  let h = 0; for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const pick = (arr, shift) => arr[(h >>> shift) % arr.length];
  return checkLook({
    skin: pick(["#f1c27d", "#e0ac69", "#c68b59", "#a86b3c", "#8d5524", "#5c3a21"], 0),
    hairColor: pick(["#120d0a", "#2b1b14", "#5a3825", "#1b1b2f", "#b55239", "#d9c27a"], 3),
    hairStyle: pick(HAIR_STYLES.filter((s) => s !== "bald"), 6),
    outfit: pick(["#7c4dff", "#00b8cc", "#ff9933", "#2ee59d", "#ff5e8a", "#ffd166", "#4cc9f0"], 9),
    glasses: ((h >>> 12) & 3) === 0,
    beard: false,
  });
}

// ---------- agent files ----------
// Agent files are Markdown with YAML-style frontmatter. Known keys are parsed; any other
// frontmatter lines are kept verbatim so editing never drops settings we don't manage.
const KNOWN = ["name", "description", "tools", "model"];

function unquote(v) {
  v = v.trim();
  if (/^".*"$/.test(v)) { try { return JSON.parse(v); } catch { return v.slice(1, -1); } }
  if (/^'.*'$/.test(v)) return v.slice(1, -1).replace(/''/g, "'");
  return v;
}

export function parseAgent(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const fm = {}, extra = [];
  let body = md;
  if (m) {
    body = m[2];
    const lines = m[1].split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const k = /^([A-Za-z][\w-]*):(.*)$/.exec(line);
      if (k && KNOWN.includes(k[1])) {
        // Support block scalars (description: >) by joining indented continuation lines
        let v = k[2].trim();
        if (/^[>|][-+]?$/.test(v)) {
          const parts = [];
          while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) parts.push(lines[++i].trim());
          v = parts.join(k[2].trim().startsWith("|") ? "\n" : " ");
          fm[k[1]] = v;
        } else fm[k[1]] = unquote(v);
      } else extra.push(line);
    }
  }
  return {
    name: fm.name || "",
    description: fm.description || "",
    tools: fm.tools ? splitTools(fm.tools) : [],
    hasTools: "tools" in fm,
    model: fm.model || "",
    extra: extra.filter((l, i, a) => l.trim() || (i > 0 && a[i - 1].trim())),
    instructions: body.replace(/^\s*\n/, "").trimEnd(),
  };
}

export function serializeAgent(a) {
  const lines = [`name: ${a.name}`, `description: ${JSON.stringify(a.description)}`];
  if (a.tools?.length) lines.push(`tools: ${a.tools.join(", ")}`);
  if (a.model) lines.push(`model: ${a.model}`);
  lines.push(...(a.extra || []));
  return `---\n${lines.join("\n")}\n---\n\n${a.instructions.trim()}\n`;
}

export async function listAgents(root) {
  const dir = paths(root).agents;
  const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".md")).sort();
  return Promise.all(files.map(async (f) => {
    const a = parseAgent(await readText(join(dir, f)));
    return { ...a, name: a.name || basename(f, ".md"), file: `.claude/agents/${f}` };
  }));
}

// ---------- office config ----------
export async function readOffice(root) {
  let cfg = {};
  try { cfg = JSON.parse(await readFile(paths(root).config, "utf8")); } catch { /* not initialised yet */ }
  return {
    name: cfg.name || `${basename(root)} office`,
    teams: Array.isArray(cfg.teams) ? cfg.teams : [],
    looks: cfg.looks && typeof cfg.looks === "object" ? cfg.looks : {},
  };
}

export async function writeOffice(root, office) {
  await mkdir(paths(root).home, { recursive: true });
  const tmp = paths(root).config + ".tmp";
  await writeFile(tmp, JSON.stringify(office, null, 2) + "\n");
  await rename(tmp, paths(root).config);
  return office;
}

export function checkTeams(teams, agentNames) {
  if (!Array.isArray(teams) || teams.length > 30) throw new UserError("Teams must be a list of up to 30 teams.");
  const ids = new Set();
  const out = teams.map((t) => {
    const id = clean(t.id, 40);
    if (!SLUG.test(id) || ids.has(id)) throw new UserError(`Team id "${id}" must be unique and use lowercase letters, numbers and dashes.`);
    ids.add(id);
    const members = [...new Set((t.members || []).map((m) => clean(m, 40)).filter((m) => agentNames.has(m)))];
    return {
      id,
      name: clean(t.name, 40) || id,
      color: HEX.test(t.color) ? t.color : "#7c4dff",
      lead: members.includes(t.lead) ? t.lead : members[0] || "",
      members,
      talksTo: [...new Set((t.talksTo || []).map((x) => clean(x, 40)))],
    };
  });
  // An agent belongs to one team; links point only at teams that exist
  const seen = new Set();
  for (const t of out) {
    t.members = t.members.filter((m) => !seen.has(m) && seen.add(m));
    if (!t.members.includes(t.lead)) t.lead = t.members[0] || "";
    t.talksTo = t.talksTo.filter((x) => ids.has(x) && x !== t.id);
  }
  return out;
}

// Message files: <YYYYMMDDTHHMMSSZ>--<from>--<to>.md
export const stamp = (d = new Date()) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
export function parseMessageFile(f) {
  const [ts, from, to] = f.replace(/\.md$/, "").split("--");
  return { ts, from, to };
}
