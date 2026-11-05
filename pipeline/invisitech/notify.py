"""Updates and approval requests to the owner.

- TelegramNotifier: real bot (Approve / Request changes buttons, albums).
- ConsoleNotifier: prints and logs; approve with the CLI instead.
- RecordingNotifier: for tests.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Protocol

log = logging.getLogger("invisitech.notify")

TELEGRAM_TEXT_LIMIT = 4000


class Notifier(Protocol):
    def update(self, text: str) -> None: ...
    def ask_script_approval(self, approval_id: int, text: str, script_md: Path | None) -> None: ...
    def ask_spend(self, approval_id: int, text: str) -> None: ...
    def album(self, images: list[Path], caption: str) -> None: ...


def script_markdown(script: dict, version: int, stats: dict | None = None, review: dict | None = None) -> str:
    """Readable script for approval (sent as a file; Telegram messages are short)."""
    out = [f"# {script.get('title', 'Untitled')} — v{version}", ""]
    if stats:
        out.append(f"*{stats.get('words')} words ≈ {stats.get('seconds', 0) / 60:.1f} min, {stats.get('scenes')} scenes*")
    if review:
        out.append(f"*Reviewer: {review.get('score')}/10 — {review.get('summary', '')}*")
    out += ["", f"**Hook (first 10 s):** {script.get('hook_line', '')}", ""]
    for s in script.get("scenes", []):
        out += [f"## Scene {s.get('n')} · {s.get('section', '').upper()}", "", s.get("narration", ""), "",
                f"> Visual: {s.get('visual', '')}", ""]
    if script.get("sources"):
        out += ["## Sources", *[f"- {x}" for x in script["sources"]], ""]
    if script.get("change_notes"):
        out += ["## Changes in this version", script["change_notes"], ""]
    return "\n".join(out)


@dataclass
class ConsoleNotifier:
    log_file: Path | None = None

    def _out(self, text: str) -> None:
        print(f"\n[InvisiTech] {text}\n", flush=True)
        if self.log_file:
            self.log_file.parent.mkdir(parents=True, exist_ok=True)
            with self.log_file.open("a", encoding="utf-8") as f:
                f.write(text.replace("\n", " | ") + "\n")

    def update(self, text: str) -> None:
        self._out(text)

    def ask_script_approval(self, approval_id: int, text: str, script_md: Path | None) -> None:
        self._out(f"{text}\nScript: {script_md}\nApprove:  invisitech approve {approval_id}\n"
                  f"Changes:  invisitech changes {approval_id} \"your notes\"")

    def ask_spend(self, approval_id: int, text: str) -> None:
        self._out(f"{text}\nAllow: invisitech approve {approval_id}   Deny: invisitech deny {approval_id}")

    def album(self, images: list[Path], caption: str) -> None:
        self._out(f"{caption}\n" + "\n".join(str(p) for p in images))


@dataclass
class RecordingNotifier:
    events: list[tuple] = field(default_factory=list)

    def update(self, text: str) -> None:
        self.events.append(("update", text))

    def ask_script_approval(self, approval_id: int, text: str, script_md: Path | None) -> None:
        self.events.append(("script_approval", approval_id, text, script_md))

    def ask_spend(self, approval_id: int, text: str) -> None:
        self.events.append(("spend", approval_id, text))

    def album(self, images: list[Path], caption: str) -> None:
        self.events.append(("album", list(images), caption))

    def texts(self, kind: str = "update") -> list[str]:
        return [e[1] if kind == "update" else e[2] for e in self.events if e[0] == kind]


class TelegramNotifier:
    """Telegram Bot API over plain HTTPS (httpx). Free."""

    def __init__(self, token: str, chat_id: str, client=None):
        import httpx
        self.base = f"https://api.telegram.org/bot{token}"
        self.chat_id = str(chat_id)
        self.http = client or httpx.Client(timeout=60)

    def call(self, method: str, data: dict | None = None, files: dict | None = None) -> dict:
        r = self.http.post(f"{self.base}/{method}", data=data, files=files)
        body = r.json()
        if not body.get("ok"):
            raise RuntimeError(f"Telegram {method} failed: {body.get('description')}")
        return body["result"]

    def send(self, text: str, buttons: list[list[dict]] | None = None) -> dict:
        data = {"chat_id": self.chat_id, "text": text[:TELEGRAM_TEXT_LIMIT]}
        if buttons:
            data["reply_markup"] = json.dumps({"inline_keyboard": buttons})
        return self.call("sendMessage", data)

    def update(self, text: str) -> None:
        try:
            self.send(text)
        except Exception as e:  # an update must never break the pipeline
            log.warning("Telegram update failed: %s", e)

    def ask_script_approval(self, approval_id: int, text: str, script_md: Path | None) -> None:
        if script_md and Path(script_md).exists():
            with open(script_md, "rb") as f:
                self.call("sendDocument", {"chat_id": self.chat_id}, {"document": (Path(script_md).name, f)})
        self.send(text, [[{"text": "✅ Approve", "callback_data": f"script:approve:{approval_id}"},
                          {"text": "✏️ Request changes", "callback_data": f"script:changes:{approval_id}"}]])

    def ask_spend(self, approval_id: int, text: str) -> None:
        self.send(text, [[{"text": "✅ Allow once", "callback_data": f"spend:approve:{approval_id}"},
                          {"text": "⛔ Deny", "callback_data": f"spend:deny:{approval_id}"}]])

    def album(self, images: list[Path], caption: str) -> None:
        photos = [p for p in images if p.suffix.lower() in (".png", ".jpg", ".jpeg")]
        others = [p for p in images if p not in photos]
        try:
            for start in range(0, len(photos), 10):  # Telegram albums hold 2-10 items
                chunk = photos[start:start + 10]
                if len(chunk) == 1:
                    with open(chunk[0], "rb") as f:
                        self.call("sendPhoto", {"chat_id": self.chat_id, "caption": caption if start == 0 else ""},
                                  {"photo": (chunk[0].name, f)})
                    continue
                media, files = [], {}
                for i, p in enumerate(chunk):
                    key = f"f{i}"
                    media.append({"type": "photo", "media": f"attach://{key}",
                                  **({"caption": caption} if start == 0 and i == 0 else {})})
                    files[key] = (p.name, p.read_bytes())
                self.call("sendMediaGroup", {"chat_id": self.chat_id, "media": json.dumps(media)}, files)
            for p in others:  # e.g. SVG frames when no PNG renderer is available
                with open(p, "rb") as f:
                    self.call("sendDocument", {"chat_id": self.chat_id}, {"document": (p.name, f)})
            if not photos:
                self.send(caption)
        except Exception as e:
            log.warning("Telegram album failed: %s", e)
            self.update(f"{caption}\n(Album upload failed: {e})")


def make_notifier(settings) -> Notifier:
    if settings.telegram_token and settings.telegram_chat_id:
        return TelegramNotifier(settings.telegram_token, settings.telegram_chat_id)
    return ConsoleNotifier(settings.data_dir / "notifications.log")
