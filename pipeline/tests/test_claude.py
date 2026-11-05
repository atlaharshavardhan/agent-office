import json
import os
import stat
import sys

import pytest

from invisitech.claude import ClaudeError, FakeClaude, HeadlessClaude, extract_json, tool_badge


def test_extract_json_variants():
    assert extract_json('{"a": 1}') == {"a": 1}
    assert extract_json('Here you go:\n```json\n{"a": 2}\n```\nThanks') == {"a": 2}
    assert extract_json('Sure! {"a": {"b": 3}} done') == {"a": {"b": 3}}
    with pytest.raises(ClaudeError):
        extract_json("no json here")


def test_tool_badges():
    assert tool_badge("mcp__vidIQ__vidiq_keyword_research") == "vidIQ"
    assert tool_badge("WebSearch") == "Web"
    assert tool_badge("Read") == "Claude"


def test_fake_claude_queue_and_tools():
    seen = []
    f = FakeClaude(replies={"a": [{"x": 1}, "second"]}, tools_used={"a": ["mcp__vidIQ__x"]})
    assert json.loads(f.run("a", "p", [], seen.append)) == {"x": 1}
    assert f.run("a", "p", []) == "second"
    assert f.run("a", "p", []) == "second"  # last reply repeats
    assert seen == ["mcp__vidIQ__x"] and f.count("a") == 3


def _fake_cli(tmp_path, lines, code=0):
    """A stand-in `claude` executable that prints stream-json lines."""
    script = tmp_path / "claude"
    body = "\n".join(f"print({json.dumps(json.dumps(l))})" for l in lines)
    script.write_text(f"#!{sys.executable}\nimport sys\nprompt = sys.stdin.read()\n"
                      f"open({str(tmp_path / 'argv.json')!r}, 'w').write(__import__('json').dumps(sys.argv))\n"
                      f"open({str(tmp_path / 'prompt.txt')!r}, 'w').write(prompt)\n{body}\nsys.exit({code})\n")
    script.chmod(script.stat().st_mode | stat.S_IEXEC)
    return str(script)


@pytest.mark.skipif(os.name == "nt", reason="uses a POSIX shebang script")
def test_headless_claude_parses_stream(tmp_path):
    lines = [
        {"type": "system", "subtype": "init"},
        {"type": "assistant", "message": {"content": [{"type": "tool_use", "name": "mcp__vidIQ__vidiq_outliers"}]}},
        {"type": "assistant", "message": {"content": [{"type": "text", "text": "thinking"}]}},
        {"type": "result", "subtype": "success", "is_error": False, "result": '{"topics": []}'},
    ]
    hc = HeadlessClaude(bin=_fake_cli(tmp_path, lines), model="sonnet")
    tools = []
    out = hc.run("topic_scout", "PROMPT TEXT", ["mcp__vidIQ__vidiq_outliers", "WebSearch"], tools.append)
    assert out == '{"topics": []}'
    assert tools == ["mcp__vidIQ__vidiq_outliers"]
    argv = json.loads((tmp_path / "argv.json").read_text())
    assert "-p" in argv and "stream-json" in argv and "--model" in argv
    assert argv[argv.index("--allowedTools") + 1] == "mcp__vidIQ__vidiq_outliers,WebSearch"
    assert "mcp__Higgsfield" in argv[argv.index("--disallowedTools") + 1]  # always blocked
    assert (tmp_path / "prompt.txt").read_text() == "PROMPT TEXT"  # prompt via stdin


@pytest.mark.skipif(os.name == "nt", reason="uses a POSIX shebang script")
def test_headless_claude_errors(tmp_path):
    bad = HeadlessClaude(bin=_fake_cli(tmp_path, [{"type": "result", "is_error": True, "result": "limit"}]))
    with pytest.raises(ClaudeError, match="limit"):
        bad.run("x", "p", [])
    silent = HeadlessClaude(bin=_fake_cli(tmp_path, [], code=1))
    with pytest.raises(ClaudeError, match="no result"):
        silent.run("x", "p", [])
    with pytest.raises(ClaudeError, match="not found"):
        HeadlessClaude(bin=str(tmp_path / "missing")).run("x", "p", [])
