import json

from fastapi.testclient import TestClient

from invisitech.dashboard.app import create_app, snapshot


def card(snap, name):
    return next(c for t in snap["teams"] for c in t["cards"] if c["name"] == name)


def test_cards_grouped_by_team(services):
    snap = snapshot(services.db, services.settings)
    assert [t["team"] for t in snap["teams"]] == ["Director", "Research", "Creative", "Quality"]
    research = next(t for t in snap["teams"] if t["team"] == "Research")
    assert {c["display_name"] for c in research["cards"]} == {"Topic Scout", "Performance Analyst"}
    assert card(snap, "topic_scout")["status"] == "idle"
    assert card(snap, "performance_analyst")["status"] == "not built yet"
    assert card(snap, "rule_validator")["team"] == "Quality"


def test_working_status_and_lit_tool_badge(services):
    db = services.db
    rid = db.start_run("topic_scout", "Research", "Scouting topics for 2026-11", "vidIQ")
    c = card(snapshot(db, services.settings), "topic_scout")
    assert c["status"] == "working" and c["tool_now"] == "vidIQ" and "Scouting" in c["task"]
    db.end_run(rid, "done", "10 topics. Top: OTP (92)", 92)
    c = card(snapshot(db, services.settings), "topic_scout")
    assert c["status"] == "idle" and c["tool_now"] is None and c["score"] == 92 and "OTP" in c["output"]


def test_waiting_for_approval(services):
    vid = services.db.create_video("OTP")
    services.db.request_approval("script", vid, "script_writer", "Script v1 ready")
    snap = snapshot(services.db, services.settings)
    assert card(snap, "script_writer")["status"] == "waiting for approval"
    assert snap["approvals"][0]["video_title"] == "OTP"


def test_failed_run_shows_error(services):
    rid = services.db.start_run("script_writer", "Creative", "Writing")
    services.db.end_run(rid, "failed", error="usage limit")
    assert card(snapshot(services.db, services.settings), "script_writer")["error"] == "usage limit"


def test_http_and_sse(services):
    client = TestClient(create_app(services.settings))
    assert "InvisiTech" in client.get("/").text
    assert client.get("/api/state").json()["teams"]
    with client.stream("GET", "/events?once=true") as r:
        assert r.headers["content-type"].startswith("text/event-stream")
        body = "".join(r.iter_text())
    assert body.startswith("event: state")
    data = json.loads(body.split("data: ", 1)[1])
    assert data["teams"]
