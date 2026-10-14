// Agent Office hook: records what each agent is doing to .claude/agent-office/activity.jsonl.
// Installed by `agent-office init` for SubagentStart, SubagentStop and PreToolUse. Never blocks Claude.
import { appendFileSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  try {
    const e = JSON.parse(raw);
    const agent = e.agent_type || "main";
    const tool = e.tool_name || "";
    const ti = e.tool_input || {};
    // Only agent activity is interesting; the main session is logged when it hands work to an agent
    if (e.hook_event_name === "PreToolUse" && agent === "main" && !["Agent", "Task"].includes(tool)) return;

    const file = (p) => basename(String(p || ""));
    const path = String(ti.file_path || "");
    const detail = {
      WebSearch: `Searching “${ti.query}”`,
      WebFetch: `Reading ${String(ti.url || "").replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}`,
      Read: `Reading ${file(path)}`,
      Write: /agent-office\/messages\//.test(path) ? `Messaging ${file(path).replace(/\.md$/, "").split("--")[2] || "a team"}` : `Writing ${file(path)}`,
      Edit: `Editing ${file(path)}`,
      Glob: `Looking for ${ti.pattern || "files"}`,
      Grep: `Searching the code for “${ti.pattern}”`,
      Agent: `Handing off to ${ti.subagent_type}`,
      Task: `Handing off to ${ti.subagent_type}`,
      Bash: ti.description || "Running a command",
    }[tool] || (tool ? `Using ${tool}` : "");

    const dir = join(process.env.CLAUDE_PROJECT_DIR || e.cwd || process.cwd(), ".claude", "agent-office");
    mkdirSync(dir, { recursive: true });
    const log = join(dir, "activity.jsonl");
    appendFileSync(log, JSON.stringify({ t: Date.now(), event: e.hook_event_name, agent, tool, detail }) + "\n");
    if (statSync(log).size > 1_000_000) writeFileSync(log, readFileSync(log, "utf8").trim().split("\n").slice(-2000).join("\n") + "\n");
  } catch {
    // Logging is best-effort
  }
});
