"""Benchmark scripts (OTP, FASTag): the gold scripts must always pass the Rule
Validator. The live benchmark (real Claude) runs only with INVISITECH_LIVE=1."""
import os
import subprocess
import sys

import pytest

from invisitech.config import ROOT
from invisitech.rules import validate_script
from conftest import bench


@pytest.mark.parametrize("name", ["otp", "fastag"])
def test_gold_script_passes_rules(name):
    data = bench(name)
    v = validate_script(data["script"])
    assert v.passed, v.issues
    assert data["script"]["hook_line"] and data["topic"]["title"]


def test_benchmark_runner_offline():
    out = subprocess.run([sys.executable, str(ROOT / "benchmarks" / "run_benchmarks.py")], capture_output=True,
                         text=True, cwd=ROOT)
    assert out.returncode == 0, out.stderr
    assert "otp" in out.stdout and "fastag" in out.stdout


@pytest.mark.live
@pytest.mark.skipif(os.environ.get("INVISITECH_LIVE") != "1", reason="set INVISITECH_LIVE=1 to call real Claude")
def test_live_benchmarks():
    out = subprocess.run([sys.executable, str(ROOT / "benchmarks" / "run_benchmarks.py"), "--live"],
                         capture_output=True, text=True, cwd=ROOT, timeout=3600)
    assert out.returncode == 0, out.stdout + out.stderr
