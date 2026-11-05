"""Script Reviewer (Quality Team): quality + facts + policy + copyright -> {score, issues, pass}."""
from __future__ import annotations

import json

from .base import Agent

BLOCKING_AREAS = {"facts", "policy", "copyright"}


def normalize_review(raw: dict, min_score: int) -> dict:
    try:
        score = float(raw.get("score"))
    except (TypeError, ValueError):
        score = 0.0
    issues = [i for i in raw.get("issues") or [] if isinstance(i, dict)]
    blocking = [i for i in issues if i.get("area") in BLOCKING_AREAS and i.get("severity") == "high"]
    passed = bool(raw.get("pass")) and score >= min_score and not blocking
    return {"score": score, "pass": passed, "issues": issues, "summary": raw.get("summary") or ""}


class ScriptReviewer(Agent):
    name = "script_reviewer"

    def review(self, video_id: int, script_id: int, script: dict, version: int, validator_stats: dict) -> dict:
        task = (
            f"Review version {version} of this script. The Rule Validator measured: "
            f"{validator_stats.get('words')} words ≈ {validator_stats.get('seconds', 0) / 60:.1f} min, "
            f"{validator_stats.get('scenes')} scenes.\n\n```json\n{json.dumps(script, ensure_ascii=False)}\n```"
        )
        with self.record(f"Reviewing script v{version}", video_id) as rec:
            raw = self.ask_claude(task, rec["run_id"], video_id)
            review = normalize_review(raw, self.sv.settings.review_min_score)
            self.db.add_review(script_id, "script_reviewer", review["score"], review["pass"], review["issues"],
                               review["summary"])
            rec["score"] = review["score"]
            rec["output"] = f"v{version}: {review['score']:.0f}/10 {'pass' if review['pass'] else 'needs work'}" \
                            f" – {review['summary']}"
        return review
