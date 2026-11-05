"""Flow test on one sample topic (OTP) with fake Claude replies:
rule loop -> review loop -> approval pause -> stop -> new process -> changes ->
approval -> storyboard -> done. Plus crash/resume and the paid-call gate."""
import copy

import pytest

from invisitech.agents import Services
from invisitech.claude import ClaudeError
from invisitech.graph import Director
from conftest import frames_reply


def topics_reply():
    return {"topics": [
        {"title": "How your OTP reaches your phone", "thing": "the OTP code", "score": 92, "kind": "trending"},
        {"title": "How FASTag pays your toll", "thing": "the toll payment", "score": 85, "kind": "expected"},
    ]}


def too_short(script):
    s = copy.deepcopy(script)
    s["scenes"] = s["scenes"][:3] + s["scenes"][-1:]
    return s


def review(score, passed, summary="ok", issues=None):
    return {"score": score, "pass": passed, "summary": summary,
            "issues": issues or ([] if passed else [{"area": "pacing", "severity": "medium", "scene": 4,
                                                     "problem": "Scene 4 drags", "fix": "Cut the DLT detail"}])}


def restart(services):
    """Simulate stopping the program and starting a new process on the same DB."""
    sv = Services(settings=services.settings, db=services.db, claude=services.claude, notifier=services.notifier,
                  drive=services.drive)
    return Director(sv)


def test_full_flow_with_loops_pause_and_resume(services, fake_claude, notifier, otp_script):
    fake_claude.replies = {
        "topic_scout": [topics_reply()],
        # v1 breaks a rule (too short), v2 fails review, v3 passes, v4 = owner's changes
        "script_writer": [too_short(otp_script), otp_script, otp_script, otp_script],
        "script_reviewer": [review(6, False, "Pacing drags"), review(9, True, "Strong hook"), review(9, True)],
        "storyboard_artist": [frames_reply],
    }
    d = Director(services)
    vid = d.start(month="2026-11")
    st = d.status(vid)

    # Paused for owner approval after the loops
    assert st["waiting"] and list(st["next"]) == ["await_approval"]
    assert services.db.video(vid)["stage"] == "awaiting_script_approval"
    assert services.db.video(vid)["title"] == "How your OTP reaches your phone"  # Harsha picked top score
    assert fake_claude.count("script_writer") == 3 and fake_claude.count("script_reviewer") == 2
    scripts = services.db.q("SELECT version, status FROM scripts WHERE video_id=? ORDER BY version", (vid,))
    assert [s["status"] for s in scripts] == ["rule_failed", "review_failed", "reviewed"]
    # The rule feedback reached the writer
    assert "too short" in fake_claude.calls[2]["prompt"]
    assert "Scene 4 drags" in fake_claude.calls[4]["prompt"]
    # Routine steps just send updates
    updates = notifier.texts()
    assert any("reviewed 9/10" in u for u in updates) and any("reviewed 6/10" in u for u in updates)
    asks = [e for e in notifier.events if e[0] == "script_approval"]
    assert len(asks) == 1 and asks[0][3].exists()  # script file attached
    aid = st["waiting"][0]["approval_id"]
    assert services.db.approval(aid)["status"] == "pending"

    # --- stop the program; a new process picks up the same thread ---
    d.close()
    d2 = restart(services)
    st = d2.status(vid)
    assert st["waiting"][0]["approval_id"] == aid  # still waiting, nothing re-sent
    assert len([e for e in notifier.events if e[0] == "script_approval"]) == 1

    # Owner requests changes with typed notes
    d2.decide(aid, "changes", "Make the outro shorter and mention SIM swap fraud.")
    assert services.db.approval(aid)["status"] == "changes_requested"
    assert "SIM swap" in fake_claude.calls[-2]["prompt"]  # writer got the owner's notes
    st = d2.status(vid)
    aid2 = st["waiting"][0]["approval_id"]
    assert aid2 != aid

    # Owner approves -> storyboard -> done
    d2.decide(aid2, "approve")
    st = d2.status(vid)
    assert not st["next"]
    assert services.db.video(vid)["stage"] == "ready_for_render"
    assert services.db.q("SELECT status FROM scripts WHERE video_id=? ORDER BY version DESC LIMIT 1", (vid,))[0][
        "status"] == "approved"
    frames = services.db.q("SELECT * FROM storyboards WHERE video_id=?", (vid,))
    assert len(frames) == len(otp_script["scenes"])
    albums = [e for e in notifier.events if e[0] == "album"]
    assert len(albums) == 1 and len(albums[0][1]) == len(otp_script["scenes"])
    assert any("Pre-production done" in u for u in notifier.texts())
    assert services.db.one("SELECT status FROM topics WHERE title LIKE 'How your OTP%'")["status"] == "picked"
    # dashboard data: every agent recorded runs, nothing left "working"
    agents = {r["agent"] for r in services.db.q("SELECT DISTINCT agent FROM agent_runs")}
    assert {"harsha", "topic_scout", "script_writer", "rule_validator", "script_reviewer",
            "storyboard_artist"} <= agents
    assert not services.db.q("SELECT * FROM agent_runs WHERE status='working'")
    d2.close()


def test_owner_topic_skips_scout(director, fake_claude, otp_script, services):
    fake_claude.replies = {"script_writer": [otp_script], "script_reviewer": [review(9, True)]}
    vid = director.start("How your OTP reaches your phone")
    assert fake_claude.count("topic_scout") == 0
    assert director.status(vid)["waiting"]
    assert services.db.one("SELECT kind FROM topics")["kind"] == "manual"


def test_crash_then_resume(services, fake_claude, otp_script):
    calls = {"n": 0}

    def flaky(prompt):
        calls["n"] += 1
        if calls["n"] == 1:
            raise ClaudeError("Claude usage limit reached")
        return frames_reply(prompt)

    fake_claude.replies = {"script_writer": [otp_script], "script_reviewer": [review(9, True)],
                           "storyboard_artist": [flaky]}
    d = Director(services)
    vid = d.start("How your OTP reaches your phone")
    aid = d.status(vid)["waiting"][0]["approval_id"]
    with pytest.raises(ClaudeError):
        d.decide(aid, "approve")
    assert services.db.video(vid)["stage"] == "failed"
    d.close()

    d2 = restart(services)  # new process
    st = d2.resume(vid)
    assert not st["next"] and services.db.video(vid)["stage"] == "ready_for_render"
    assert fake_claude.count("script_writer") == 1  # finished work was not redone
    d2.close()


def test_decision_recorded_before_crash_is_used_on_resume(services, fake_claude, otp_script):
    fake_claude.replies = {"script_writer": [otp_script], "script_reviewer": [review(9, True)],
                           "storyboard_artist": [frames_reply]}
    d = Director(services)
    vid = d.start("How your OTP reaches your phone")
    aid = d.status(vid)["waiting"][0]["approval_id"]
    services.db.decide(aid, "approved", "", "telegram")  # recorded, but the process died before resuming
    d.close()
    d2 = restart(services)
    assert not d2.resume(vid)["next"]
    d2.close()


def test_escalates_after_max_rounds(services, fake_claude, otp_script, notifier):
    services.settings.max_script_rounds = 2
    fake_claude.replies = {"script_writer": [otp_script], "script_reviewer": [review(5, False)]}
    d = Director(services)
    vid = d.start("How your OTP reaches your phone")
    st = d.status(vid)
    assert st["waiting"] and fake_claude.count("script_writer") == 2
    ask = [e for e in notifier.events if e[0] == "script_approval"][0]
    assert "still not passing" in ask[2]
    d.close()


def test_paid_tool_needs_approval(services, fake_claude, otp_script, notifier):
    # Someone gives the Script Writer a Higgsfield tool: the Rule Validator gate stops it.
    services.specs["script_writer"].claude_allowed_tools = ["mcp__Higgsfield__generate_image"]
    fake_claude.replies = {"script_writer": [otp_script], "script_reviewer": [review(9, True)]}
    d = Director(services)
    vid = d.start("How your OTP reaches your phone")
    assert fake_claude.count("script_writer") == 0  # Claude never called
    assert services.db.video(vid)["stage"] == "waiting_spend_approval"
    spend = [e for e in notifier.events if e[0] == "spend"]
    assert len(spend) == 1
    d.decide(spend[0][1], "approve")  # owner allows once
    assert fake_claude.count("script_writer") == 1
    assert d.status(vid)["waiting"]
    assert services.db.approval(spend[0][1])["status"] == "used"
    d.close()


def test_denied_spend_keeps_video_paused(director, services, fake_claude, otp_script):
    services.specs["script_writer"].claude_allowed_tools = ["mcp__Higgsfield__generate_image"]
    vid = director.start("How your OTP reaches your phone")
    aid = services.db.one("SELECT id FROM approvals WHERE kind='spend'")["id"]
    director.decide(aid, "deny")
    assert services.db.approval(aid)["status"] == "rejected"
    assert fake_claude.count("script_writer") == 0
