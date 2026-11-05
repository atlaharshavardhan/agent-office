"""Topic Scout (Research Team): monthly ranked list of trending + expected topics."""
from __future__ import annotations

from datetime import date

from ..claude import ClaudeError
from .base import Agent


class TopicScout(Agent):
    name = "topic_scout"

    def scout(self, month: str | None = None) -> list[dict]:
        month = month or date.today().strftime("%Y-%m")
        covered = self.db.covered_titles()
        task = (
            f"Build the topic list for **{month}**.\n\n"
            "Already covered or in progress (do not repeat):\n"
            + ("\n".join(f"- {t}" for t in covered) if covered else "- (nothing yet)")
        )
        with self.record(f"Scouting topics for {month}", tool="vidIQ") as rec:
            data = self.ask_claude(task, rec["run_id"])
            topics = [t for t in data.get("topics", []) if isinstance(t, dict) and t.get("title")]
            if not topics:
                raise ClaudeError("Topic Scout returned no topics.")
            for t in topics:
                try:
                    t["score"] = float(t.get("score") or 0)
                except (TypeError, ValueError):
                    t["score"] = 0.0
                if t.get("kind") not in ("trending", "expected"):
                    t["kind"] = "trending"
            topics.sort(key=lambda t: -t["score"])
            self.db.add_topics(month, topics)
            rec["output"] = f"{len(topics)} topics. Top: {topics[0]['title']} ({topics[0]['score']:.0f})"
            rec["score"] = topics[0]["score"]
        return self.db.topics_for_month(month)
