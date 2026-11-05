"""Settings from environment variables (and an optional .env file)."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # the pipeline/ folder


def load_dotenv(path: Path) -> None:
    """Tiny .env reader: KEY=VALUE lines, no overriding of real env vars."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def _int(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name) or default)
    except ValueError:
        return default


@dataclass
class Settings:
    root: Path = ROOT
    data_dir: Path = field(default_factory=lambda: ROOT / "data")
    agents_dir: Path = field(default_factory=lambda: ROOT / "agents")
    channel_guide: Path = field(default_factory=lambda: ROOT / "channel_guide.md")
    claude_bin: str = "claude"
    claude_model: str = ""
    claude_timeout: int = 900
    telegram_token: str = ""
    telegram_chat_id: str = ""
    rclone_remote: str = ""
    storyboard_renderer: str = "auto"
    chrome_bin: str = ""
    blender_bin: str = "blender"
    review_min_score: int = 8
    max_script_rounds: int = 4
    narration_wpm: int = 150
    dashboard_port: int = 8765

    @property
    def db_path(self) -> Path:
        return self.data_dir / "invisitech.sqlite"

    @property
    def work_dir(self) -> Path:
        return self.data_dir / "work"

    @classmethod
    def from_env(cls) -> "Settings":
        load_dotenv(ROOT / ".env")
        e = os.environ.get
        data_dir = Path(e("INVISITECH_DATA_DIR") or ROOT / "data")
        if not data_dir.is_absolute():
            data_dir = ROOT / data_dir
        return cls(
            data_dir=data_dir,
            claude_bin=e("CLAUDE_BIN") or "claude",
            claude_model=e("CLAUDE_MODEL") or "",
            claude_timeout=_int("CLAUDE_TIMEOUT_SECONDS", 900),
            telegram_token=e("TELEGRAM_BOT_TOKEN") or "",
            telegram_chat_id=e("TELEGRAM_CHAT_ID") or "",
            rclone_remote=e("RCLONE_REMOTE") or "",
            storyboard_renderer=e("STORYBOARD_RENDERER") or "auto",
            chrome_bin=e("CHROME_BIN") or "",
            blender_bin=e("BLENDER_BIN") or "blender",
            review_min_score=_int("REVIEW_MIN_SCORE", 8),
            max_script_rounds=_int("MAX_SCRIPT_ROUNDS", 4),
            narration_wpm=_int("NARRATION_WPM", 150),
            dashboard_port=_int("DASHBOARD_PORT", 8765),
        )
