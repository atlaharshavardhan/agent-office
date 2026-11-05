"""Harsha, the director: the LangGraph flow for the pre-production ("trailer") phase.

Topic Scout -> Harsha picks topic -> Script Writer <-> Rule Validator + Script Reviewer
-> OWNER APPROVAL of script -> Storyboard Artist -> update to owner -> render stub -> done

State is checkpointed in the same SQLite file (thread = "video-<id>"), so a stopped
run continues with `invisitech resume <id>`.
"""
from __future__ import annotations

import json
import operator
import threading
from datetime import date
from pathlib import Path
from typing import Annotated, Any, Literal, TypedDict

from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt

from .agents import ScriptReviewer, ScriptWriter, Services, StoryboardArtist, TopicScout
from .db import connect, slugify
from .notify import script_markdown
from .rules import SpendBlocked, validate_script

DIRECTOR = "harsha"
VALIDATOR = "rule_validator"


class State(TypedDict, total=False):
    video_id: int
    requested_topic: str | None
    month: str
    topic: dict
    script_id: int
    script_version: int
    script: dict
    rounds: int                 # writer rounds since the last owner feedback
    feedback: list[str]
    validation: dict
    review: dict
    escalated: str               # why we asked the owner without a clean pass
    approval_id: int
    decision: str
    owner_notes: str
    frames: list[dict]
    log: Annotated[list[str], operator.add]


class Director:
    """Builds and runs the graph. One instance per process."""

    def __init__(self, sv: Services):
        self.sv = sv
        self.db = sv.db
        self.scout = TopicScout(sv)
        self.writer = ScriptWriter(sv)
        self.reviewer = ScriptReviewer(sv)
        self.artist = StoryboardArtist(sv)
        self._conn = connect(sv.settings.db_path)
        self.checkpointer = SqliteSaver(self._conn)
        self.graph = self.build().compile(checkpointer=self.checkpointer)
        self._locks: dict[int, threading.Lock] = {}
        self._locks_guard = threading.Lock()

    # ------------------------------------------------------------------ helpers
    def say(self, text: str) -> None:
        self.sv.notifier.update(text)

    def harsha(self, task: str, output: str, video_id: int | None = None) -> None:
        rid = self.db.start_run(DIRECTOR, "Director", task, None, video_id)
        self.db.end_run(rid, "done", output)

    def drive_prefix(self, video_id: int) -> str:
        v = self.db.video(video_id)
        return f"videos/{video_id:03d}-{v['slug']}"

    # ------------------------------------------------------------------ nodes
    def n_scout(self, s: State) -> dict:
        month = s.get("month") or date.today().strftime("%Y-%m")
        if s.get("requested_topic"):
            return {"month": month, "log": ["Owner chose the topic; scouting skipped."]}
        if self.db.topics_for_month(month, "new"):
            return {"month": month, "log": [f"Using this month's topic list ({month})."]}
        topics = self.scout.scout(month)
        top = "\n".join(f"{i}. {t['title']} ({t['score']:.0f})" for i, t in enumerate(topics[:5], 1))
        self.say(f"🔎 Topic Scout: {len(topics)} topics for {month}.\n{top}")
        return {"month": month, "log": [f"Scouted {len(topics)} topics."]}

    def n_pick_topic(self, s: State) -> dict:
        vid = s["video_id"]
        if s.get("requested_topic"):
            tid = self.db.add_topics(s["month"], [{"title": s["requested_topic"], "kind": "manual"}])[0]
            why = "your choice"
        else:
            options = self.db.topics_for_month(s["month"], "new")
            if not options:
                raise RuntimeError("No unused topics left this month. Run `invisitech scout --force`.")
            tid = options[0]["id"]
            why = f"top score {options[0]['score']:.0f}"
        self.db.run("UPDATE topics SET status='picked' WHERE id=?", (tid,))
        topic = self.db.one("SELECT * FROM topics WHERE id=?", (tid,))
        self.db.set_video(vid, topic_id=tid, title=topic["title"], slug=slugify(topic["title"]), stage="scripting")
        folder = self.sv.drive.folder_link(self.drive_prefix(vid))
        self.db.set_video(vid, drive_folder=folder)
        self.harsha("Pick topic", f"Picked “{topic['title']}” ({why})", vid)
        self.say(f"🎬 Harsha picked: “{topic['title']}” ({why}). Script Writer is on it.")
        return {"topic": topic, "rounds": 0, "feedback": [], "log": [f"Picked topic {topic['title']}"]}

    def n_write(self, s: State) -> dict:
        vid = s["video_id"]
        self.db.set_video(vid, stage="scripting")
        previous = s.get("script") if s.get("feedback") else None
        script_id, version, script = self.writer.write(vid, s["topic"], s.get("feedback"), previous)
        return {"script_id": script_id, "script_version": version, "script": script,
                "rounds": s.get("rounds", 0) + 1, "review": {}, "validation": {}, "escalated": "",
                "log": [f"Script v{version} written"]}

    def n_validate(self, s: State) -> dict:
        vid = s["video_id"]
        rid = self.db.start_run(VALIDATOR, "Quality", f"Checking rules on script v{s['script_version']}", "Code", vid)
        v = validate_script(s["script"], self.sv.settings.narration_wpm)
        self.db.add_review(s["script_id"], VALIDATOR, None, v.passed, v.issues, v.summary())
        self.db.end_run(rid, "done", f"v{s['script_version']}: {v.summary()}")
        out: dict[str, Any] = {"validation": {"passed": v.passed, "issues": v.issues, "stats": v.stats},
                               "log": [f"Rules v{s['script_version']}: {v.summary()}"]}
        if not v.passed:
            self.db.set_script_status(s["script_id"], "rule_failed")
            out["feedback"] = [f"[Rule Validator] {i['problem']}" + (f" (scene {i['scene']})" if i.get("scene") else "")
                               for i in v.errors]
            if s.get("rounds", 0) >= self.sv.settings.max_script_rounds:
                out["escalated"] = f"Rule Validator still failing after {s['rounds']} rounds"
        return out

    def n_review(self, s: State) -> dict:
        vid = s["video_id"]
        self.db.set_video(vid, stage="script_review")
        r = self.reviewer.review(vid, s["script_id"], s["script"], s["script_version"], s["validation"]["stats"])
        mark = "✅" if r["pass"] else "🔁"
        self.say(f"{mark} Script v{s['script_version']} reviewed {r['score']:.0f}/10. {r['summary']}")
        out: dict[str, Any] = {"review": r, "log": [f"Review v{s['script_version']}: {r['score']}/10"]}
        if r["pass"]:
            self.db.set_script_status(s["script_id"], "reviewed")
        else:
            self.db.set_script_status(s["script_id"], "review_failed")
            out["feedback"] = [f"[Reviewer · {i.get('area')}/{i.get('severity')}] {i.get('problem')} → {i.get('fix')}"
                               + (f" (scene {i['scene']})" if i.get("scene") else "") for i in r["issues"]]
            if s.get("rounds", 0) >= self.sv.settings.max_script_rounds:
                out["escalated"] = f"Reviewer still not passing after {s['rounds']} rounds"
        return out

    def n_request_approval(self, s: State) -> dict:
        """Files the approval and messages the owner. Separate from the wait so a
        resume never sends the request twice."""
        vid, ver = s["video_id"], s["script_version"]
        self.db.set_video(vid, stage="awaiting_script_approval")
        md = script_markdown(s["script"], ver, s.get("validation", {}).get("stats"), s.get("review"))
        path = self.sv.settings.work_dir / f"video-{vid}" / f"script-v{ver}.md"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(md, encoding="utf-8")
        r = s.get("review") or {}
        stats = s.get("validation", {}).get("stats", {})
        text = (f"📝 Script v{ver} for “{s['script'].get('title')}” is ready for your approval.\n"
                f"Reviewer: {r.get('score', '-')}/10 · {stats.get('seconds', 0) / 60:.1f} min · "
                f"{stats.get('scenes', '?')} scenes\nHook: {s['script'].get('hook_line', '')}")
        if s.get("escalated"):
            text += f"\n⚠️ {s['escalated']}. Please decide."
        aid = self.db.request_approval("script", vid, "script_writer", text, subject_id=s["script_id"])
        self.sv.notifier.ask_script_approval(aid, text, path)
        self.harsha("Ask owner to approve script", f"Approval #{aid} sent for v{ver}", vid)
        return {"approval_id": aid, "log": [f"Asked owner to approve v{ver} (#{aid})"]}

    def n_await_approval(self, s: State) -> dict:
        answer = interrupt({"kind": "script", "approval_id": s["approval_id"], "video_id": s["video_id"]})
        decision = answer.get("decision") if isinstance(answer, dict) else str(answer)
        notes = (answer.get("notes") or "").strip() if isinstance(answer, dict) else ""
        row = self.db.approval(s["approval_id"])
        if decision == "approve":
            if row and row["status"] == "pending":
                self.db.decide(s["approval_id"], "approved", notes)
            self.db.set_script_status(s["script_id"], "approved")
            return {"decision": "approve", "owner_notes": notes, "log": ["Owner approved the script"]}
        if row and row["status"] == "pending":
            self.db.decide(s["approval_id"], "changes_requested", notes)
        self.db.set_script_status(s["script_id"], "changes_requested")
        self.say(f"✏️ Got it. Script Writer is revising v{s['script_version']} with your notes.")
        return {"decision": "changes", "owner_notes": notes, "rounds": 0,
                "feedback": [f"[Owner] {notes or 'Owner requested changes (no notes given).'}"],
                "log": ["Owner requested changes"]}

    def n_storyboard(self, s: State) -> dict:
        vid = s["video_id"]
        self.db.set_video(vid, stage="storyboarding")
        prefix = self.drive_prefix(vid)
        md = self.sv.settings.work_dir / f"video-{vid}" / f"script-v{s['script_version']}.md"
        if md.exists():
            self.sv.drive.upload(md, f"{prefix}/{md.name}")
        frames = self.artist.draw(vid, s["script_id"], s["script"], prefix)
        v = self.db.video(vid)
        self.sv.notifier.album([Path(f["path"]) for f in frames],
                               f"🎨 Storyboard for “{s['script'].get('title')}”: {len(frames)} frames.\n"
                               f"Originals in Drive: {v.get('drive_folder')}")
        return {"frames": frames, "log": [f"{len(frames)} storyboard frames"]}

    def n_render_stub(self, s: State) -> dict:
        """High-quality renders will run later on the GCP VM (a paid resource, so it
        will go through rules.check_spend('gcp_vm', ...) first). Nothing runs here."""
        vid = s["video_id"]
        self.db.set_video(vid, stage="ready_for_render")
        self.harsha("Render (stub)", "Ready for high-quality render on GCP VM (not run)", vid)
        return {"log": ["Render step stubbed"]}

    def n_done(self, s: State) -> dict:
        v = self.db.video(s["video_id"])
        self.harsha("Wrap up", f"Pre-production done: {v['title']}", s["video_id"])
        self.say(f"✅ Pre-production done for “{v['title']}”. Script v{s['script_version']} approved, "
                 f"{len(s.get('frames', []))} storyboard frames. Ready for render on the GCP VM.")
        return {"log": ["Done"]}

    # ------------------------------------------------------------------ routing
    def after_validate(self, s: State) -> Literal["review", "write", "request_approval"]:
        if s["validation"]["passed"]:
            return "review"
        return "request_approval" if s.get("escalated") else "write"

    def after_review(self, s: State) -> Literal["write", "request_approval"]:
        if s["review"]["pass"] or s.get("escalated"):
            return "request_approval"
        return "write"

    def after_approval(self, s: State) -> Literal["storyboard", "write"]:
        return "storyboard" if s["decision"] == "approve" else "write"

    def build(self) -> StateGraph:
        g = StateGraph(State)
        g.add_node("scout", self.n_scout)
        g.add_node("pick_topic", self.n_pick_topic)
        g.add_node("write", self.n_write)
        g.add_node("validate", self.n_validate)
        g.add_node("review", self.n_review)
        g.add_node("request_approval", self.n_request_approval)
        g.add_node("await_approval", self.n_await_approval)
        g.add_node("storyboard", self.n_storyboard)
        g.add_node("render_stub", self.n_render_stub)
        g.add_node("done", self.n_done)
        g.add_edge(START, "scout")
        g.add_edge("scout", "pick_topic")
        g.add_edge("pick_topic", "write")
        g.add_edge("write", "validate")
        g.add_conditional_edges("validate", self.after_validate)
        g.add_conditional_edges("review", self.after_review)
        g.add_edge("request_approval", "await_approval")
        g.add_conditional_edges("await_approval", self.after_approval)
        g.add_edge("storyboard", "render_stub")
        g.add_edge("render_stub", "done")
        g.add_edge("done", END)
        return g

    # ------------------------------------------------------------------ running
    def _lock(self, video_id: int) -> threading.Lock:
        with self._locks_guard:
            return self._locks.setdefault(video_id, threading.Lock())

    @staticmethod
    def config(video_id: int) -> dict:
        return {"configurable": {"thread_id": f"video-{video_id}"}, "recursion_limit": 100}

    def _invoke(self, video_id: int, payload: Any) -> dict:
        with self._lock(video_id):
            try:
                self.graph.invoke(payload, self.config(video_id))
            except SpendBlocked as e:
                self.db.set_video(video_id, stage="waiting_spend_approval")
                self.say(f"⏸ Video #{video_id} paused: {e}")
            except Exception as e:
                self.db.set_video(video_id, stage="failed")
                self.say(f"⚠️ Video #{video_id} stopped: {e}\nFix it, then: invisitech resume {video_id}")
                raise
            return self.status(video_id)

    def start(self, topic: str | None = None, month: str | None = None) -> int:
        vid = self.db.create_video(topic or "(choosing topic)")
        state: State = {"video_id": vid, "requested_topic": topic, "log": []}
        if month:
            state["month"] = month
        self._invoke(vid, state)
        return vid

    def status(self, video_id: int) -> dict:
        snap = self.graph.get_state(self.config(video_id))
        waiting = [i.value for t in snap.tasks for i in (t.interrupts or ())]
        return {"video_id": video_id, "next": list(snap.next), "waiting": waiting,
                "stage": (self.db.video(video_id) or {}).get("stage"), "values": snap.values}

    def resume(self, video_id: int, decision: str | None = None, notes: str = "") -> dict:
        """Continue a stopped run, or answer a pending script approval."""
        st = self.status(video_id)
        if not st["next"]:
            return st
        if st["waiting"]:
            if decision is None:  # the decision may already be in the DB (e.g. recorded before a crash)
                row = self.db.approval(st["waiting"][0]["approval_id"])
                if row and row["status"] in ("approved", "changes_requested"):
                    decision = "approve" if row["status"] == "approved" else "changes"
                    notes = row["notes"] or ""
            if decision is None:
                return st
            return self._invoke(video_id, Command(resume={"decision": decision, "notes": notes}))
        return self._invoke(video_id, None)

    def decide(self, approval_id: int, decision: Literal["approve", "changes", "deny"], notes: str = "",
               by: str = "owner") -> dict | None:
        """Entry point for Telegram buttons and the CLI."""
        row = self.db.approval(approval_id)
        if not row:
            raise ValueError(f"No approval #{approval_id}")
        if row["status"] != "pending":
            raise ValueError(f"Approval #{approval_id} is already {row['status']}")
        if row["kind"] == "spend":
            self.db.decide(approval_id, "approved" if decision == "approve" else "rejected", notes, by)
            if decision == "approve" and row["video_id"]:
                return self.resume(row["video_id"])
            if row["video_id"]:
                self.db.set_video(row["video_id"], stage="failed")
                self.say(f"⛔ Spend denied. Video #{row['video_id']} stays paused.")
            return None
        if row["kind"] == "script":
            status = "approved" if decision == "approve" else "changes_requested"
            self.db.decide(approval_id, status, notes, by)
            return self.resume(row["video_id"], "approve" if decision == "approve" else "changes", notes)
        raise ValueError(f"Unknown approval kind {row['kind']}")

    def close(self) -> None:
        self._conn.close()


def dump(state: dict) -> str:
    return json.dumps(state, indent=2, default=str)
