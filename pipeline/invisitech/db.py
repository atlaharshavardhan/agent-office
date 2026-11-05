"""SQLite shared memory. Short-lived connections so the pipeline, the Telegram bot
and the dashboard (separate processes/threads) can all use the same file."""
from __future__ import annotations

import json
import re
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from importlib import resources
from pathlib import Path
from typing import Any, Iterator


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:60] or "video"


def connect(path: Path | str) -> sqlite3.Connection:
    conn = sqlite3.connect(str(path), timeout=30, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=30000")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


class DB:
    def __init__(self, path: Path | str):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.conn() as c:
            c.executescript(resources.files("invisitech").joinpath("schema.sql").read_text())

    @contextmanager
    def conn(self) -> Iterator[sqlite3.Connection]:
        c = connect(self.path)
        try:
            yield c
            c.commit()
        finally:
            c.close()

    def q(self, sql: str, args: tuple = ()) -> list[dict]:
        with self.conn() as c:
            return [dict(r) for r in c.execute(sql, args).fetchall()]

    def one(self, sql: str, args: tuple = ()) -> dict | None:
        rows = self.q(sql, args)
        return rows[0] if rows else None

    def run(self, sql: str, args: tuple = ()) -> int:
        with self.conn() as c:
            cur = c.execute(sql, args)
            return cur.lastrowid

    # ---------- topics ----------
    def add_topics(self, month: str, topics: list[dict]) -> list[int]:
        ids = []
        for rank, t in enumerate(topics, 1):
            ids.append(self.run(
                "INSERT INTO topics (month, rank, title, thing, angle, kind, why_now, score, sources)"
                " VALUES (?,?,?,?,?,?,?,?,?)",
                (month, rank, t["title"], t.get("thing"), t.get("angle"), t.get("kind", "trending"),
                 t.get("why_now"), t.get("score"), json.dumps(t.get("sources", []))),
            ))
        return ids

    def topics_for_month(self, month: str, status: str | None = None) -> list[dict]:
        sql = "SELECT * FROM topics WHERE month=?" + (" AND status=?" if status else "") + " ORDER BY score DESC, rank"
        return self.q(sql, (month, status) if status else (month,))

    def covered_titles(self) -> list[str]:
        return [r["title"] for r in self.q("SELECT title FROM topics WHERE status IN ('picked','done')")]

    # ---------- videos ----------
    def create_video(self, title: str, topic_id: int | None = None) -> int:
        vid = self.run("INSERT INTO videos (topic_id, title, slug) VALUES (?,?,?)", (topic_id, title, slugify(title)))
        self.run("UPDATE videos SET thread_id=? WHERE id=?", (f"video-{vid}", vid))
        return vid

    def video(self, video_id: int) -> dict | None:
        return self.one("SELECT * FROM videos WHERE id=?", (video_id,))

    def set_video(self, video_id: int, **fields: Any) -> None:
        if not fields:
            return
        cols = ", ".join(f"{k}=?" for k in fields)
        self.run(f"UPDATE videos SET {cols}, updated_at=? WHERE id=?", (*fields.values(), now(), video_id))

    # ---------- scripts & reviews ----------
    def add_script(self, video_id: int, script: dict, word_count: int, est_seconds: float) -> tuple[int, int]:
        with self.conn() as c:
            version = c.execute("SELECT COALESCE(MAX(version),0)+1 FROM scripts WHERE video_id=?", (video_id,)).fetchone()[0]
            cur = c.execute(
                "INSERT INTO scripts (video_id, version, content, word_count, est_seconds, change_notes) VALUES (?,?,?,?,?,?)",
                (video_id, version, json.dumps(script), word_count, est_seconds, script.get("change_notes", "")),
            )
            return cur.lastrowid, version

    def script(self, script_id: int) -> dict | None:
        row = self.one("SELECT * FROM scripts WHERE id=?", (script_id,))
        if row:
            row["content"] = json.loads(row["content"])
        return row

    def set_script_status(self, script_id: int, status: str) -> None:
        self.run("UPDATE scripts SET status=? WHERE id=?", (status, script_id))

    def add_review(self, script_id: int, reviewer: str, score: float | None, passed: bool,
                   issues: list, summary: str = "") -> int:
        return self.run(
            "INSERT INTO reviews (script_id, reviewer, score, pass, issues, summary) VALUES (?,?,?,?,?,?)",
            (script_id, reviewer, score, int(passed), json.dumps(issues), summary),
        )

    # ---------- storyboards ----------
    def add_frame(self, video_id: int, script_id: int, scene_no: int, caption: str, method: str,
                  width: int, height: int, drive_link: str) -> int:
        return self.run(
            "INSERT INTO storyboards (video_id, script_id, scene_no, caption, method, width, height, drive_link)"
            " VALUES (?,?,?,?,?,?,?,?)",
            (video_id, script_id, scene_no, caption, method, width, height, drive_link),
        )

    # ---------- approvals ----------
    def request_approval(self, kind: str, video_id: int | None, agent: str, request_text: str,
                         subject_id: int | None = None, scope: str | None = None) -> int:
        return self.run(
            "INSERT INTO approvals (video_id, kind, subject_id, scope, agent, request_text) VALUES (?,?,?,?,?,?)",
            (video_id, kind, subject_id, scope, agent, request_text),
        )

    def approval(self, approval_id: int) -> dict | None:
        return self.one("SELECT * FROM approvals WHERE id=?", (approval_id,))

    def pending_approval(self, video_id: int, kind: str = "script") -> dict | None:
        return self.one("SELECT * FROM approvals WHERE video_id=? AND kind=? AND status='pending' ORDER BY id DESC LIMIT 1",
                        (video_id, kind))

    def decide(self, approval_id: int, status: str, notes: str = "", by: str = "owner") -> None:
        self.run("UPDATE approvals SET status=?, notes=?, decided_at=?, decided_by=? WHERE id=?",
                 (status, notes, now(), by, approval_id))

    # ---------- agent runs (dashboard) ----------
    def start_run(self, agent: str, team: str, task: str, tool: str | None = None, video_id: int | None = None) -> int:
        return self.run("INSERT INTO agent_runs (agent, team, task, tool, video_id) VALUES (?,?,?,?,?)",
                        (agent, team, task, tool, video_id))

    def set_tool(self, run_id: int, tool: str | None) -> None:
        self.run("UPDATE agent_runs SET tool=? WHERE id=?", (tool, run_id))

    def end_run(self, run_id: int, status: str = "done", output: str = "", score: float | None = None,
                error: str | None = None) -> None:
        self.run("UPDATE agent_runs SET status=?, output=?, score=?, error=?, tool=NULL, ended_at=? WHERE id=?",
                 (status, output[:2000], score, error, now(), run_id))
