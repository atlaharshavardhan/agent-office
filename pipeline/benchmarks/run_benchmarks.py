"""Benchmarks on two reference topics: OTP and FASTag.

    python benchmarks/run_benchmarks.py           # offline: Rule Validator on the gold scripts
    python benchmarks/run_benchmarks.py --live    # real Claude: Writer <-> Validator + Reviewer loop

--live uses your Claude subscription (headless Claude Code); nothing paid is called.
It (1) asks the Script Reviewer to score each gold script (calibration: it should
pass) and (2) has the Script Writer write the topic from scratch and loops until
pass, recording rounds, score, length and time. Results: data/benchmarks/*.json
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

from invisitech.rules import validate_script  # noqa: E402

NAMES = ["otp", "fastag"]


def load(name: str) -> dict:
    return json.loads((HERE / f"{name}.json").read_text(encoding="utf-8"))


def offline() -> int:
    bad = 0
    print(f"{'benchmark':<10} {'rules':<6} {'words':>6} {'min':>5} {'scenes':>6}")
    for n in NAMES:
        v = validate_script(load(n)["script"])
        bad += not v.passed
        print(f"{n:<10} {'pass' if v.passed else 'FAIL':<6} {v.stats['words']:>6} {v.stats['seconds'] / 60:>5.1f}"
              f" {v.stats['scenes']:>6}")
        for i in v.errors:
            print(f"   - {i['problem']}")
    return 1 if bad else 0


def live() -> int:
    from invisitech.agents import ScriptReviewer, ScriptWriter, Services
    from invisitech.claude import HeadlessClaude
    from invisitech.config import Settings
    from invisitech.db import DB
    from invisitech.drive import LocalDrive
    from invisitech.notify import ConsoleNotifier

    base = Settings.from_env()
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    out_dir = base.data_dir / "benchmarks"
    st = Settings(data_dir=out_dir / f"run-{stamp}", claude_bin=base.claude_bin, claude_model=base.claude_model,
                  claude_timeout=base.claude_timeout, review_min_score=base.review_min_score,
                  max_script_rounds=base.max_script_rounds, narration_wpm=base.narration_wpm)
    st.data_dir.mkdir(parents=True, exist_ok=True)
    sv = Services(settings=st, db=DB(st.db_path),
                  claude=HeadlessClaude(st.claude_bin, st.claude_model, st.claude_timeout, cwd=st.work_dir / "claude"),
                  notifier=ConsoleNotifier(st.data_dir / "notifications.log"), drive=LocalDrive(st.data_dir / "drive"))
    writer, reviewer = ScriptWriter(sv), ScriptReviewer(sv)
    results, ok = [], True
    for n in NAMES:
        data = load(n)
        vid = sv.db.create_video(data["topic"]["title"])
        # 1) calibration: the gold script should pass review
        gold = data["script"]
        gv = validate_script(gold, st.narration_wpm)
        gid, gver = sv.db.add_script(vid, gold, gv.stats["words"], gv.stats["seconds"])
        t0 = time.time()
        gold_review = reviewer.review(vid, gid, gold, gver, gv.stats)
        # 2) write from scratch and loop
        feedback, previous, rounds, final = [], None, 0, None
        t1 = time.time()
        while rounds < st.max_script_rounds:
            rounds += 1
            sid, ver, script = writer.write(vid, data["topic"], feedback, previous)
            v = validate_script(script, st.narration_wpm)
            if not v.passed:
                feedback = [i["problem"] for i in v.errors]
                previous = script
                final = {"version": ver, "rules": "fail", "issues": feedback}
                continue
            r = reviewer.review(vid, sid, script, ver, v.stats)
            final = {"version": ver, "rules": "pass", "score": r["score"], "pass": r["pass"],
                     "minutes": round(v.stats["seconds"] / 60, 1), "summary": r["summary"]}
            if r["pass"]:
                break
            feedback = [f"{i.get('problem')} -> {i.get('fix')}" for i in r["issues"]]
            previous = script
        passed = bool(final and final.get("pass"))
        ok &= passed and gold_review["pass"]
        results.append({"benchmark": n, "gold_review": {"score": gold_review["score"], "pass": gold_review["pass"],
                                                        "seconds": round(t1 - t0)},
                        "loop": {"rounds": rounds, **(final or {}), "seconds": round(time.time() - t1)}})
        print(f"{n}: gold {gold_review['score']:.0f}/10 ({'pass' if gold_review['pass'] else 'FAIL'}); "
              f"from scratch: {rounds} round(s), final {final}")
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"benchmarks-{stamp}.json"
    path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"Saved {path}")
    return 0 if ok else 1


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--live", action="store_true", help="call real Claude (your subscription)")
    sys.exit(live() if p.parse_args().live else offline())
