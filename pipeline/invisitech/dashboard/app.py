"""Live dashboard: FastAPI + server-sent events + one simple page.

Reads SQLite only, so it can run in its own process next to the pipeline.
Binds to 127.0.0.1 by default.
"""
from __future__ import annotations

import asyncio
import json
from importlib import resources

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse

from ..agents.base import load_specs
from ..config import Settings
from ..db import DB

TEAM_ORDER = ["Director", "Research", "Creative", "Quality"]
EXTRA = [  # not instruction-file agents, but shown on the board
    {"name": "harsha", "display_name": "Harsha", "team": "Director", "tools": ["Telegram"], "enabled": True,
     "kind": "director"},
    {"name": "rule_validator", "display_name": "Rule Validator", "team": "Quality", "tools": ["Code"],
     "enabled": True, "kind": "code"},
]


def snapshot(db: DB, settings: Settings) -> dict:
    specs = load_specs(settings.agents_dir)
    roster = EXTRA[:1] + [
        {"name": s.name, "display_name": s.display_name, "team": s.team, "tools": s.tools, "enabled": s.enabled,
         "kind": "agent"} for s in specs.values()] + EXTRA[1:]
    pending = db.q("SELECT a.*, v.title AS video_title FROM approvals a LEFT JOIN videos v ON v.id=a.video_id"
                   " WHERE a.status='pending' ORDER BY a.id")
    cards = []
    for a in roster:
        last = db.one("SELECT * FROM agent_runs WHERE agent=? ORDER BY id DESC LIMIT 1", (a["name"],))
        last_done = db.one("SELECT * FROM agent_runs WHERE agent=? AND status!='working' ORDER BY id DESC LIMIT 1",
                           (a["name"],))
        scored = db.one("SELECT score FROM agent_runs WHERE agent=? AND score IS NOT NULL ORDER BY id DESC LIMIT 1",
                        (a["name"],))
        waiting = [p for p in pending if p["agent"] == a["name"]]
        if not a["enabled"]:
            status = "not built yet"
        elif last and last["status"] == "working":
            status = "working"
        elif waiting:
            status = "waiting for approval"
        else:
            status = "idle"
        cards.append({
            **a,
            "status": status,
            "task": (last or {}).get("task") if status == "working" else
                    (f"Approval #{waiting[0]['id']}: {waiting[0]['video_title'] or ''}" if waiting else None),
            "tool_now": (last or {}).get("tool") if status == "working" else None,
            "output": (last_done or {}).get("output"),
            "error": (last_done or {}).get("error") if (last_done or {}).get("status") == "failed" else None,
            "score": (scored or {}).get("score"),
            "updated": (last or {}).get("ended_at") or (last or {}).get("started_at"),
        })
    teams = [{"team": t, "cards": sorted((c for c in cards if c["team"] == t), key=lambda c: not c["enabled"])}
             for t in TEAM_ORDER]
    teams = [t for t in teams if t["cards"]]
    videos = db.q("SELECT id, title, stage, drive_folder, updated_at FROM videos ORDER BY id DESC LIMIT 8")
    runs = db.q("SELECT agent, task, status, output, started_at FROM agent_runs ORDER BY id DESC LIMIT 15")
    return {"teams": teams, "videos": videos, "approvals": pending, "feed": runs}


def create_app(settings: Settings | None = None) -> FastAPI:
    st = settings or Settings.from_env()
    db = DB(st.db_path)
    app = FastAPI(title="InvisiTech Agents")
    page = resources.files("invisitech").joinpath("dashboard/static/index.html").read_text(encoding="utf-8")

    @app.get("/", response_class=HTMLResponse)
    def index():
        return page

    @app.get("/api/state")
    def state():
        return JSONResponse(snapshot(db, st))

    @app.get("/events")
    async def events(request: Request, once: bool = False):
        async def gen():
            last, idle = None, 0
            while True:
                if await request.is_disconnected():
                    break
                data = json.dumps(await asyncio.to_thread(snapshot, db, st), default=str)
                if data != last:
                    last, idle = data, 0
                    yield f"event: state\ndata: {data}\n\n"
                    if once:
                        break
                else:
                    idle += 1
                    if idle % 15 == 0:
                        yield ": keep-alive\n\n"
                await asyncio.sleep(1)
        return StreamingResponse(gen(), media_type="text/event-stream",
                                 headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

    return app
