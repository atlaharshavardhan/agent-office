"""Script Writer (Creative Team): script with a 10-second hook, journey, outro."""
from __future__ import annotations

import json

from ..claude import ClaudeError
from ..rules import words
from .base import Agent


class ScriptWriter(Agent):
    name = "script_writer"

    def write(self, video_id: int, topic: dict, feedback: list[str] | None = None,
              previous: dict | None = None) -> tuple[int, int, dict]:
        wpm = self.sv.settings.narration_wpm
        parts = [
            f"Write the script for this video.\n\nTopic: **{topic.get('title')}**",
            f"The thing we follow: {topic.get('thing') or 'choose the clearest one'}",
            f"Angle: {topic.get('angle') or '-'}",
            f"Narration speed: {wpm} words per minute.",
        ]
        if previous:
            parts.append("## Your previous version\n```json\n" + json.dumps(previous, ensure_ascii=False) + "\n```")
        if feedback:
            parts.append("## Feedback to fix (fix every point)\n" + "\n".join(f"- {f}" for f in feedback))
        label = "Rewriting" if previous else "Writing"
        with self.record(f"{label} script: {topic.get('title')}", video_id) as rec:
            script = self.ask_claude("\n\n".join(parts), rec["run_id"], video_id)
            if not isinstance(script.get("scenes"), list):
                raise ClaudeError("Script Writer returned no scenes.")
            for i, s in enumerate(script["scenes"], 1):
                s.setdefault("n", i)
            wc = sum(len(words(s.get("narration", ""))) for s in script["scenes"])
            est = wc * 60.0 / wpm
            script_id, version = self.db.add_script(video_id, script, wc, est)
            rec["output"] = f"v{version}: {script.get('title')} – {wc} words ≈ {est / 60:.1f} min"
        return script_id, version, script
