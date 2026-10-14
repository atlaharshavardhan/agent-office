// Agent Office hook (SubagentStart): tells a starting agent its team, which teams it can message,
// and the latest messages sent to its team. Teams live in .claude/agent-office/office.json.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  try {
    const e = JSON.parse(raw);
    const home = join(process.env.CLAUDE_PROJECT_DIR || e.cwd || process.cwd(), ".claude", "agent-office");
    const office = JSON.parse(readFileSync(join(home, "office.json"), "utf8"));
    const teams = office.teams || [];
    const team = teams.find((t) => (t.members || []).includes(e.agent_type));
    if (!team) return;
    const name = (id) => (id === "you" ? "the project owner" : id === "all" ? "everyone" : teams.find((t) => t.id === id)?.name || id);

    let files = [];
    try { files = readdirSync(join(home, "messages")).filter((f) => f.endsWith(".md")).sort(); } catch { /* no messages yet */ }
    const inbox = files
      .map((f) => { const [ts, from, to] = f.replace(/\.md$/, "").split("--"); return { f, ts, from, to }; })
      .filter((m) => m.to === team.id || m.to === "all").slice(-10)
      .map((m) => `- ${m.ts} from ${name(m.from)}: ${readFileSync(join(home, "messages", m.f), "utf8").trim()}`);

    const context = [
      `You are on the "${team.name}" team (id: ${team.id}). Lead: ${team.lead || "none"}. Members: ${team.members.join(", ")}.`,
      `Your team can message: ${(team.talksTo || []).map((id) => `${name(id)} (id: ${id})`).join(", ") || "no other teams"}.`,
      inbox.length ? `Latest messages to your team (act on any that affect your work):\n${inbox.join("\n")}` : "There are no messages to your team yet.",
      (team.talksTo || []).length
        ? `To message one of those teams, use Write to create .claude/agent-office/messages/<UTC time as YYYYMMDDTHHMMSSZ>--${team.id}--<team id>.md containing 1-5 plain sentences. Message when another team needs to know something (a decision, a caveat, a question), not just to say you are done.`
        : "",
    ].filter(Boolean).join("\n");

    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SubagentStart", additionalContext: context } }));
  } catch {
    // Best-effort: never stop an agent from starting
  }
});
