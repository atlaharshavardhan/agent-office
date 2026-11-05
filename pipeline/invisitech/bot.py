"""Telegram bot: long-polls for button presses and typed notes, then resumes the graph.

Buttons:   script:approve:<id>  script:changes:<id>  spend:approve:<id>  spend:deny:<id>
Commands:  /status   /new [topic]   /resume <video_id>
Only messages from TELEGRAM_CHAT_ID are accepted.
"""
from __future__ import annotations

import logging
import threading
import time
from dataclasses import dataclass, field

from .graph import Director
from .notify import TelegramNotifier

log = logging.getLogger("invisitech.bot")


@dataclass
class BotState:
    awaiting_notes: int | None = None   # approval id waiting for typed change notes
    offset: int = 0
    seen: set = field(default_factory=set)


class TelegramBot:
    def __init__(self, director: Director, tg: TelegramNotifier):
        self.d = director
        self.tg = tg
        self.state = BotState()
        self.stop = threading.Event()

    def background(self, fn, *args) -> None:
        """Run graph work off the polling thread so buttons stay responsive."""
        def go():
            try:
                fn(*args)
            except Exception as e:  # already reported by the director
                log.warning("pipeline step failed: %s", e)
        threading.Thread(target=go, daemon=True).start()

    def handle(self, update: dict) -> None:
        if cb := update.get("callback_query"):
            if str(cb.get("message", {}).get("chat", {}).get("id")) != self.tg.chat_id:
                return
            try:
                self.tg.call("answerCallbackQuery", {"callback_query_id": cb["id"]})
            except Exception:
                pass
            self.on_button(cb.get("data", ""))
            return
        msg = update.get("message") or {}
        if str(msg.get("chat", {}).get("id")) != self.tg.chat_id:
            return
        text = (msg.get("text") or "").strip()
        if text:
            self.on_text(text)

    def on_button(self, data: str) -> None:
        try:
            kind, action, aid_s = data.split(":")
            aid = int(aid_s)
        except ValueError:
            return
        row = self.d.db.approval(aid)
        if not row or row["status"] != "pending":
            self.tg.send(f"Approval #{aid} is already {row['status'] if row else 'gone'}.")
            return
        if kind == "script" and action == "changes":
            self.state.awaiting_notes = aid
            self.tg.send(f"✏️ Type your change notes for script approval #{aid} (one message).")
            return
        decision = "approve" if action == "approve" else ("deny" if action == "deny" else "changes")
        self.tg.send({"approve": "✅ Approved. Moving on…", "deny": "⛔ Denied."}.get(decision, "OK"))
        self.background(self.d.decide, aid, decision, "", "telegram")

    def on_text(self, text: str) -> None:
        if self.state.awaiting_notes and not text.startswith("/"):
            aid, self.state.awaiting_notes = self.state.awaiting_notes, None
            self.tg.send("📨 Notes sent to the Script Writer.")
            self.background(self.d.decide, aid, "changes", text, "telegram")
            return
        if text.startswith("/status"):
            rows = self.d.db.q("SELECT id, title, stage FROM videos ORDER BY id DESC LIMIT 5")
            self.tg.send("\n".join(f"#{r['id']} {r['title']} — {r['stage']}" for r in rows) or "No videos yet.")
        elif text.startswith("/new"):
            topic = text[4:].strip() or None
            self.tg.send(f"🎬 Starting a new video{': ' + topic if topic else ' (Harsha picks the topic)'}.")
            self.background(self.d.start, topic)
        elif text.startswith("/resume"):
            try:
                vid = int(text.split()[1])
            except (IndexError, ValueError):
                self.tg.send("Usage: /resume <video_id>")
                return
            self.background(self.d.resume, vid)

    def poll_forever(self) -> None:
        log.info("Telegram bot polling")
        while not self.stop.is_set():
            try:
                updates = self.tg.call("getUpdates", {"offset": self.state.offset, "timeout": 30})
            except Exception as e:
                log.warning("getUpdates failed: %s", e)
                time.sleep(5)
                continue
            for u in updates:
                self.state.offset = max(self.state.offset, u["update_id"] + 1)
                try:
                    self.handle(u)
                except Exception as e:
                    log.exception("update failed: %s", e)
