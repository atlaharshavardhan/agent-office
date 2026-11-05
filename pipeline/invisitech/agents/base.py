"""Shared agent plumbing: instruction files, channel guide, Claude calls, run records."""
from __future__ import annotations

import re
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Iterator

from ..claude import ClaudeRunner, extract_json, tool_badge
from ..config import Settings
from ..db import DB
from ..rules import check_spend


@dataclass
class AgentSpec:
    name: str
    display_name: str
    team: str
    tools: list[str]
    claude_allowed_tools: list[str]
    enabled: bool
    instructions: str


def _parse_list(value: str) -> list[str]:
    value = value.strip()
    if value.startswith("[") and value.endswith("]"):
        value = value[1:-1]
    return [v.strip().strip("'\"") for v in value.split(",") if v.strip()]


def parse_agent_file(path: Path) -> AgentSpec:
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", text, re.S)
    if not m:
        raise ValueError(f"{path.name}: missing front matter")
    meta: dict[str, str] = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            meta[k.strip()] = v.strip()
    return AgentSpec(
        name=meta["name"],
        display_name=meta.get("display_name", meta["name"]),
        team=meta.get("team", ""),
        tools=_parse_list(meta.get("tools", "")),
        claude_allowed_tools=_parse_list(meta.get("claude_allowed_tools", "")),
        enabled=meta.get("enabled", "true").lower() != "false",
        instructions=m.group(2).strip(),
    )


def load_specs(agents_dir: Path) -> dict[str, AgentSpec]:
    specs = {}
    for p in sorted(agents_dir.glob("*.md")):
        if p.name.lower() == "readme.md":
            continue
        spec = parse_agent_file(p)
        specs[spec.name] = spec
    return specs


@dataclass
class Services:
    """Everything an agent or the director needs. Swap parts out in tests."""
    settings: Settings
    db: DB
    claude: ClaudeRunner
    notifier: object
    drive: object
    specs: dict[str, AgentSpec] = field(default_factory=dict)

    def __post_init__(self):
        if not self.specs:
            self.specs = load_specs(self.settings.agents_dir)

    def channel_guide(self) -> str:
        p = self.settings.channel_guide
        return p.read_text(encoding="utf-8") if p.exists() else ""


class Agent:
    name = ""

    def __init__(self, sv: Services):
        self.sv = sv
        self.spec = sv.specs[self.name]

    @property
    def db(self) -> DB:
        return self.sv.db

    @contextmanager
    def record(self, task: str, video_id: int | None = None, tool: str | None = "Claude") -> Iterator[dict]:
        """Write an agent_runs row for the dashboard; the caller fills rec['output'/'score']."""
        run_id = self.db.start_run(self.name, self.spec.team, task, tool, video_id)
        rec = {"run_id": run_id, "output": "", "score": None}
        try:
            yield rec
        except Exception as e:
            self.db.end_run(run_id, "failed", rec["output"], rec["score"], error=str(e)[:1000])
            raise
        self.db.end_run(run_id, "done", rec["output"], rec["score"])

    def prompt(self, task: str) -> str:
        return (
            f"# Your instructions\n\n{self.spec.instructions}\n\n"
            f"# Channel guide (always follow)\n\n{self.sv.channel_guide()}\n\n"
            f"# Today\n\n{date.today().isoformat()}\n\n"
            f"# Task\n\n{task}\n\n"
            "Reply with only the JSON described in your instructions."
        )

    def ask_claude(self, task: str, run_id: int, video_id: int | None = None) -> dict:
        # Rule Validator gate: an agent may only be given paid tools with a recorded approval.
        # (vidIQ is free; Higgsfield or any unknown MCP server needs approval.)
        for t in self.spec.claude_allowed_tools:
            if t.startswith("mcp__"):
                check_spend(self.db, t.split("__")[1], f"{self.name} uses {t}", video_id, self.sv.notifier)
        self.db.set_tool(run_id, "Claude")

        def on_tool(name: str) -> None:
            self.db.set_tool(run_id, tool_badge(name))

        reply = self.sv.claude.run(self.name, self.prompt(task), self.spec.claude_allowed_tools, on_tool)
        self.db.set_tool(run_id, "Claude")
        self._keep_reply(run_id, reply)
        return extract_json(reply)

    def _keep_reply(self, run_id: int, reply: str) -> None:
        """Raw replies go to data/work/claude-replies/ for debugging (git-ignored)."""
        try:
            d = self.sv.settings.work_dir / "claude-replies"
            d.mkdir(parents=True, exist_ok=True)
            n = len(list(d.glob(f"run{run_id:05d}-*")))
            (d / f"run{run_id:05d}-{self.name}-{n + 1}.txt").write_text(reply, encoding="utf-8")
        except OSError:
            pass
