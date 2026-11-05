import copy
import json
from pathlib import Path

import pytest

from invisitech.agents import Services
from invisitech.claude import FakeClaude
from invisitech.config import ROOT, Settings
from invisitech.db import DB
from invisitech.drive import LocalDrive
from invisitech.notify import RecordingNotifier

BENCH = ROOT / "benchmarks"


def bench(name: str) -> dict:
    return json.loads((BENCH / f"{name}.json").read_text(encoding="utf-8"))


@pytest.fixture
def otp_script():
    return copy.deepcopy(bench("otp")["script"])


@pytest.fixture
def fastag_script():
    return copy.deepcopy(bench("fastag")["script"])


def svg_frame(scene: int, w: int = 1920, h: int = 1080) -> str:
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
            f'<rect width="{w}" height="{h}" fill="#0B1020"/><text x="80" y="160" fill="#E8ECF6" '
            f'font-size="64">Scene {scene}</text></svg>')


def frames_reply(prompt: str, w: int = 1920, h: int = 1080) -> dict:
    import re
    scenes = [int(n) for n in re.findall(r"- Scene (\d+) \(", prompt)]
    return {"frames": [{"scene": n, "caption": f"Frame {n}", "svg": svg_frame(n, w, h)} for n in scenes]}


@pytest.fixture
def settings(tmp_path) -> Settings:
    return Settings(data_dir=tmp_path / "data", storyboard_renderer="svg", review_min_score=8, max_script_rounds=4)


@pytest.fixture
def fake_claude() -> FakeClaude:
    return FakeClaude()


@pytest.fixture
def notifier() -> RecordingNotifier:
    return RecordingNotifier()


@pytest.fixture
def services(settings, fake_claude, notifier) -> Services:
    return Services(settings=settings, db=DB(settings.db_path), claude=fake_claude, notifier=notifier,
                    drive=LocalDrive(settings.data_dir / "drive"))


@pytest.fixture
def director(services):
    from invisitech.graph import Director
    d = Director(services)
    yield d
    d.close()
