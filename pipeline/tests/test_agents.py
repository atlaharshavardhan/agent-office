import pytest

from invisitech.agents import ScriptReviewer, ScriptWriter, StoryboardArtist, TopicScout, load_specs
from invisitech.agents.script_reviewer import normalize_review
from invisitech.claude import ClaudeError
from invisitech.config import ROOT
from conftest import frames_reply


def test_all_agent_files_load():
    specs = load_specs(ROOT / "agents")
    assert set(specs) == {"topic_scout", "performance_analyst", "script_writer", "storyboard_artist",
                          "script_reviewer", "feedback_learner"}
    enabled = {n for n, s in specs.items() if s.enabled}
    assert enabled == {"topic_scout", "script_writer", "script_reviewer", "storyboard_artist"}
    assert specs["topic_scout"].team == "Research" and "vidIQ" in specs["topic_scout"].tools
    assert specs["script_reviewer"].team == "Quality"
    for s in specs.values():  # nobody gets Higgsfield by default
        assert not any("higgsfield" in t.lower() for t in s.claude_allowed_tools)


def test_prompt_includes_instructions_and_channel_guide(services, fake_claude):
    fake_claude.replies["topic_scout"] = [{"topics": [{"title": "A", "score": 50}]}]
    TopicScout(services).scout("2026-11")
    prompt = fake_claude.calls[0]["prompt"]
    assert "Topic Scout" in prompt and "InvisiTech Channel Guide" in prompt and "2026-11" in prompt
    assert any("vidIQ" in t for t in fake_claude.calls[0]["allowed_tools"])


def test_topic_scout_ranks_and_saves(services, fake_claude):
    fake_claude.replies["topic_scout"] = [{"topics": [
        {"title": "Low", "score": 40, "kind": "expected"},
        {"title": "High", "score": 90, "kind": "trending", "sources": ["vidIQ"]},
        {"title": "Odd kind", "score": "55", "kind": "viral"},
    ]}]
    fake_claude.tools_used["topic_scout"] = ["mcp__vidIQ__vidiq_keyword_research"]
    topics = TopicScout(services).scout("2026-11")
    assert [t["title"] for t in topics] == ["High", "Odd kind", "Low"]
    assert topics[1]["kind"] == "trending"
    run = services.db.one("SELECT * FROM agent_runs WHERE agent='topic_scout'")
    assert run["status"] == "done" and run["score"] == 90 and "High" in run["output"]


def test_topic_scout_empty_fails_and_records(services, fake_claude):
    fake_claude.replies["topic_scout"] = [{"topics": []}]
    with pytest.raises(ClaudeError):
        TopicScout(services).scout("2026-11")
    assert services.db.one("SELECT status FROM agent_runs")["status"] == "failed"


def test_script_writer_versions(services, fake_claude, otp_script):
    vid = services.db.create_video("OTP")
    fake_claude.replies["script_writer"] = [otp_script]
    w = ScriptWriter(services)
    sid1, v1, _ = w.write(vid, {"title": "OTP"})
    sid2, v2, _ = w.write(vid, {"title": "OTP"}, ["fix the hook"], otp_script)
    assert (v1, v2) == (1, 2)
    assert "fix the hook" in fake_claude.calls[-1]["prompt"] and "previous version" in fake_claude.calls[-1]["prompt"]
    assert services.db.script(sid2)["word_count"] > 600


def test_reviewer_normalization():
    ok = normalize_review({"score": 9, "pass": True, "issues": []}, 8)
    assert ok["pass"]
    low = normalize_review({"score": 7, "pass": True, "issues": []}, 8)
    assert not low["pass"]
    facts = normalize_review({"score": 9, "pass": True,
                              "issues": [{"area": "facts", "severity": "high", "problem": "wrong year"}]}, 8)
    assert not facts["pass"]
    junk = normalize_review({"score": "n/a", "issues": "x"}, 8)
    assert junk == {"score": 0.0, "pass": False, "issues": [], "summary": ""}


def test_reviewer_saves_review(services, fake_claude, otp_script):
    vid = services.db.create_video("OTP")
    sid, ver = services.db.add_script(vid, otp_script, 700, 280)
    fake_claude.replies["script_reviewer"] = [{"score": 9, "pass": True, "issues": [], "summary": "Tight."}]
    r = ScriptReviewer(services).review(vid, sid, otp_script, ver, {"words": 700, "seconds": 280, "scenes": 10})
    assert r["pass"]
    row = services.db.one("SELECT * FROM reviews WHERE script_id=?", (sid,))
    assert row["reviewer"] == "script_reviewer" and row["score"] == 9


def test_storyboard_one_frame_per_scene(services, fake_claude, otp_script):
    vid = services.db.create_video("OTP")
    sid, _ = services.db.add_script(vid, otp_script, 700, 280)
    fake_claude.replies["storyboard_artist"] = [frames_reply]
    frames = StoryboardArtist(services).draw(vid, sid, otp_script, "videos/001-otp")
    assert [f["scene"] for f in frames] == list(range(1, 11))
    rows = services.db.q("SELECT * FROM storyboards WHERE video_id=?", (vid,))
    assert len(rows) == 10 and all(r["width"] == 1920 and r["height"] == 1080 for r in rows)
    assert all(r["drive_link"].startswith("file://") for r in rows)  # DB keeps links, files live in "Drive"
    assert fake_claude.count("storyboard_artist") == 3  # batches of 4


def test_storyboard_refuses_to_stretch(services, fake_claude, otp_script):
    vid = services.db.create_video("OTP")
    sid, _ = services.db.add_script(vid, otp_script, 700, 280)
    fake_claude.replies["storyboard_artist"] = [lambda p: frames_reply(p, 1920, 1200)]
    with pytest.raises(ClaudeError, match="stretch"):
        StoryboardArtist(services).draw(vid, sid, otp_script, "videos/001-otp")
    assert fake_claude.count("storyboard_artist") == 2  # asked once more before giving up


def test_storyboard_retry_fixes_bad_frames(services, fake_claude, otp_script):
    vid = services.db.create_video("OTP")
    sid, _ = services.db.add_script(vid, otp_script, 700, 280)
    script = dict(otp_script, scenes=otp_script["scenes"][:2])
    fake_claude.replies["storyboard_artist"] = [lambda p: frames_reply(p, 1920, 1200), frames_reply]
    frames = StoryboardArtist(services).draw(vid, sid, script, "videos/001-otp")
    assert len(frames) == 2
