"""Calling Claude through Claude Code headless mode (`claude -p`), which uses the
owner's Claude subscription. No API key.

The prompt goes through stdin (Windows has a short command-line limit). We read
`--output-format stream-json` so the dashboard can light up tool badges (e.g.
vidIQ) while Claude is working.
"""
from __future__ import annotations

import json
import re
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Protocol

# Tools Claude may NEVER use from this pipeline unless the owner approved it.
# A bare server name blocks every tool of that MCP server.
ALWAYS_BLOCKED = ["mcp__Higgsfield", "mcp__higgsfield"]

ToolCallback = Callable[[str], None]


class ClaudeError(RuntimeError):
    pass


class ClaudeRunner(Protocol):
    def run(self, agent: str, prompt: str, allowed_tools: list[str],
            on_tool: ToolCallback | None = None) -> str: ...


def tool_badge(tool_name: str) -> str:
    """Map a Claude tool name to a dashboard badge."""
    n = tool_name.lower()
    if "vidiq" in n:
        return "vidIQ"
    if n.startswith("web"):
        return "Web"
    if "drive" in n:
        return "Drive"
    return "Claude"


@dataclass
class HeadlessClaude:
    bin: str = "claude"
    model: str = ""
    timeout: int = 900
    cwd: Path | None = None
    blocked: list[str] = field(default_factory=lambda: list(ALWAYS_BLOCKED))

    def command(self, allowed_tools: list[str]) -> list[str]:
        cmd = [self.bin, "-p", "--output-format", "stream-json", "--verbose", "--no-session-persistence"]
        if self.model:
            cmd += ["--model", self.model]
        if allowed_tools:
            cmd += ["--allowedTools", ",".join(allowed_tools)]
        if self.blocked:
            cmd += ["--disallowedTools", ",".join(self.blocked)]
        return cmd

    def run(self, agent: str, prompt: str, allowed_tools: list[str], on_tool: ToolCallback | None = None) -> str:
        if self.cwd:
            Path(self.cwd).mkdir(parents=True, exist_ok=True)
        try:
            proc = subprocess.Popen(
                self.command(allowed_tools), stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                stderr=subprocess.PIPE, text=True, encoding="utf-8", cwd=self.cwd,
            )
        except FileNotFoundError as e:
            raise ClaudeError(f"Claude Code CLI not found ({self.bin}). Install Claude Code and log in.") from e
        try:
            proc.stdin.write(prompt)
            proc.stdin.close()
        except BrokenPipeError:
            pass
        result, error = None, None
        import threading
        timer = threading.Timer(self.timeout, proc.kill)
        timer.start()
        try:
            for line in proc.stdout:
                line = line.strip()
                if not line:
                    continue
                try:
                    ev = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if ev.get("type") == "assistant" and on_tool:
                    for part in (ev.get("message") or {}).get("content") or []:
                        if isinstance(part, dict) and part.get("type") == "tool_use":
                            on_tool(part.get("name", ""))
                elif ev.get("type") == "result":
                    result = ev.get("result")
                    if ev.get("is_error"):
                        error = result or ev.get("subtype") or "unknown error"
            proc.wait()
        finally:
            timer.cancel()
        if error:
            raise ClaudeError(f"{agent}: Claude returned an error: {error}")
        if result is None:
            stderr = (proc.stderr.read() or "").strip()[-800:]
            raise ClaudeError(f"{agent}: no result from Claude (exit {proc.returncode}). {stderr}")
        return result


@dataclass
class FakeClaude:
    """For tests: canned replies per agent. A reply may be a string, a dict
    (sent as JSON) or a callable(prompt) -> str|dict. The last reply repeats."""
    replies: dict[str, list] = field(default_factory=dict)
    calls: list[dict] = field(default_factory=list)
    tools_used: dict[str, list[str]] = field(default_factory=dict)

    def run(self, agent: str, prompt: str, allowed_tools: list[str], on_tool: ToolCallback | None = None) -> str:
        self.calls.append({"agent": agent, "prompt": prompt, "allowed_tools": allowed_tools})
        for t in self.tools_used.get(agent, []):
            if on_tool:
                on_tool(t)
        queue = self.replies.get(agent)
        if not queue:
            raise ClaudeError(f"FakeClaude has no reply for {agent}")
        reply = queue.pop(0) if len(queue) > 1 else queue[0]
        if callable(reply):
            reply = reply(prompt)
        return reply if isinstance(reply, str) else json.dumps(reply)

    def count(self, agent: str) -> int:
        return sum(1 for c in self.calls if c["agent"] == agent)


def extract_json(text: str) -> dict:
    """Pull the JSON object out of a Claude reply (fenced or bare)."""
    fenced = re.findall(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.S)
    candidates = fenced + ([text[text.find("{"): text.rfind("}") + 1]] if "{" in text else [])
    for c in candidates:
        try:
            value = json.loads(c)
            if isinstance(value, dict):
                return value
        except json.JSONDecodeError:
            continue
    raise ClaudeError(f"Reply was not valid JSON: {text[:300]}")
