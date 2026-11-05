"""Wire up real services from settings."""
from __future__ import annotations

from .agents import Services
from .claude import HeadlessClaude
from .config import Settings
from .db import DB
from .drive import make_drive
from .notify import make_notifier


def make_services(settings: Settings | None = None) -> Services:
    st = settings or Settings.from_env()
    st.data_dir.mkdir(parents=True, exist_ok=True)
    return Services(
        settings=st,
        db=DB(st.db_path),
        claude=HeadlessClaude(st.claude_bin, st.claude_model, st.claude_timeout, cwd=st.work_dir / "claude"),
        notifier=make_notifier(st),
        drive=make_drive(st),
    )
