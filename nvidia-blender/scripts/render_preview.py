"""Render stills / PNG frames from blender/nvidia_hook.blend and encode an MP4.

Standalone usage (from nvidia-blender/):
    .venv/bin/python scripts/render_preview.py stills            # frames 15, 45, 90
    .venv/bin/python scripts/render_preview.py frames [start end] # PNG sequence (resumable)
    .venv/bin/python scripts/render_preview.py encode
    add --final for 2160x3840 output folders
"""
import subprocess
import sys
from pathlib import Path

import bpy

ROOT = Path(__file__).resolve().parent.parent
BLEND = ROOT / "blender/nvidia_hook.blend"


def _open(final=False, samples=None, scale=None):
    if bpy.data.filepath != str(BLEND):
        bpy.ops.wm.open_mainfile(filepath=str(BLEND))
    sc = bpy.context.scene
    sys.path.insert(0, str(ROOT / "scripts"))
    import build_scene as S
    S.render_settings(final=final, samples=samples)
    if scale:
        sc.render.resolution_percentage = scale
    return sc


def render_stills(frames=(15, 45, 90), final=False, samples=None, scale=None, outdir=None):
    sc = _open(final, samples, scale)
    out = Path(outdir) if outdir else ROOT / "renders/stills"
    out.mkdir(parents=True, exist_ok=True)
    for f in frames:
        sc.frame_set(f)
        sc.render.filepath = str(out / f"frame_{f:03d}.png")
        bpy.ops.render.render(write_still=True)
        print("[still]", sc.render.filepath, flush=True)


def render_frames(final=False, start=1, end=90):
    sc = _open(final)
    folder = ROOT / ("renders/final_frames" if final else "renders/preview_frames")
    folder.mkdir(parents=True, exist_ok=True)
    for f in range(start, end + 1):
        path = folder / f"f_{f:04d}.png"
        if path.exists():
            continue
        sc.frame_set(f)
        sc.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        print(f"[frame] {f}/90", flush=True)


def encode(final=False):
    folder = ROOT / ("renders/final_frames" if final else "renders/preview_frames")
    out = ROOT / ("exports/nvidia_hook_final_2160.mp4" if final else "exports/nvidia_hook_preview_1080.mp4")
    out.parent.mkdir(exist_ok=True)
    cmd = ["ffmpeg", "-y", "-framerate", "30", "-i", str(folder / "f_%04d.png"),
           "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p",
           "-movflags", "+faststart", str(out)]
    subprocess.run(cmd, check=True)
    print("[encode]", out)
    return out


if __name__ == "__main__":
    a = [x for x in sys.argv[1:] if x != "--final"]
    final = "--final" in sys.argv
    if not a or a[0] == "stills":
        render_stills(final=final)
    elif a[0] == "frames":
        s, e = (int(a[1]), int(a[2])) if len(a) >= 3 else (1, 90)
        render_frames(final, s, e)
    elif a[0] == "encode":
        encode(final)
