"""Storyboard Artist (Creative Team): one key image per scene, free methods only."""
from __future__ import annotations

import re
from pathlib import Path

from ..claude import ClaudeError
from ..frames import render_blender, render_svg
from ..rules import normalize_svg_frame, svg_has_frame_size, validate_image
from .base import Agent

BATCH = 4  # scenes per Claude call, keeps replies a sane size

BLENDER_NOTE = (
    "Renderer is BLENDER: instead of `svg`, give each frame a `blender_py` field: a Blender 3.6+ Python script "
    "that builds the scene (flat colours, simple shapes, soft shadows, dark background, no glow), sets the render "
    "resolution to exactly 1920x1080 at 100%, and renders a still to the path in sys.argv[-1]."
)


class StoryboardArtist(Agent):
    name = "storyboard_artist"

    def _ask_frames(self, script: dict, scenes: list[dict], run_id: int, video_id: int, extra: str = "") -> dict:
        lines = [f"Video: **{script.get('title')}**. Draw one key frame for each of these scenes."]
        for s in scenes:
            lines.append(f"- Scene {s['n']} ({s.get('section')}): visual = {s.get('visual')}\n"
                         f"  narration = {s.get('narration', '')[:400]}")
        if self.sv.settings.storyboard_renderer == "blender":
            lines.append(BLENDER_NOTE)
        if extra:
            lines.append(extra)
        data = self.ask_claude("\n".join(lines), run_id, video_id)
        return {int(f.get("scene")): f for f in data.get("frames", []) if isinstance(f, dict) and f.get("scene")}

    def draw(self, video_id: int, script_id: int, script: dict, drive_prefix: str) -> list[dict]:
        st = self.sv.settings
        use_blender = st.storyboard_renderer == "blender"
        out_dir = st.work_dir / f"video-{video_id}" / "storyboard"
        frames: list[dict] = []
        scenes = script.get("scenes", [])
        with self.record(f"Storyboard for {script.get('title')}", video_id) as rec:
            for start in range(0, len(scenes), BATCH):
                batch = scenes[start:start + BATCH]
                got = self._ask_frames(script, batch, rec["run_id"], video_id)
                bad = [s for s in batch if s["n"] not in got or
                       (not use_blender and not svg_has_frame_size(got[s["n"]].get("svg", "")))]
                if bad:  # one retry; we never stretch a wrong-size frame to fit
                    again = self._ask_frames(script, bad, rec["run_id"], video_id,
                                             "Previous frames were missing or not 16:9. Each must be "
                                             '<svg width="1920" height="1080" viewBox="0 0 1920 1080" ...>. Redo them.')
                    got.update(again)
                for s in batch:
                    f = got.get(s["n"])
                    if not f:
                        raise ClaudeError(f"No frame for scene {s['n']}.")
                    out = out_dir / f"scene-{s['n']:02d}.png"
                    if use_blender:
                        self.db.set_tool(rec["run_id"], "Blender")
                        path, method = render_blender(f.get("blender_py", ""), out, st.blender_bin)
                    else:
                        svg = normalize_svg_frame(f.get("svg", ""))
                        if not svg:
                            raise ClaudeError(f"Scene {s['n']} frame is not 1920x1080; refusing to stretch it.")
                        svg = re.sub(r"<script.*?</script>", "", svg, flags=re.S | re.I)  # frames are static
                        self.db.set_tool(rec["run_id"], "HTML")
                        path, method = render_svg(svg, out, st.storyboard_renderer, st.chrome_bin)
                    check = validate_image(path)
                    if not check.passed:
                        raise ClaudeError(check.issues[0]["problem"])
                    self.db.set_tool(rec["run_id"], "Drive")
                    link = self.sv.drive.upload(Path(path), f"{drive_prefix}/storyboard/{Path(path).name}")
                    self.db.add_frame(video_id, script_id, s["n"], f.get("caption", ""), method,
                                      check.stats["width"], check.stats["height"], link)
                    frames.append({"scene": s["n"], "path": str(path), "link": link, "method": method,
                                   "caption": f.get("caption", "")})
            rec["output"] = f"{len(frames)} frames ({frames[0]['method'] if frames else '-'}) uploaded"
        return frames
