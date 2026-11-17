"""Render a shot .blend to a PNG sequence (resumable) or a single still.
  .venv/bin/python scripts/render_shot.py blender/shot03_datacenter.blend renders/shot03 [start end] [--pct 75] [--samples 24]
  .venv/bin/python scripts/render_shot.py blender/still05c_boardroom.blend renders/stills/scene05c.png --still
"""
import sys
from pathlib import Path

import bpy

args = sys.argv[1:]
blend, out = args[0], Path(args[1])
pct = int(args[args.index("--pct") + 1]) if "--pct" in args else 100
samples = int(args[args.index("--samples") + 1]) if "--samples" in args else None
step = int(args[args.index("--step") + 1]) if "--step" in args else 1
pos, skip = [], False
for i, a in enumerate(args[2:]):
    if skip:
        skip = False
        continue
    if a in ("--pct", "--samples", "--step"):
        skip = True
        continue
    pos.append(a)
nums = [a for a in pos if a.isdigit()]
bpy.ops.wm.open_mainfile(filepath=blend)
sc = bpy.context.scene
sc.render.resolution_percentage = pct
if samples:
    sc.cycles.samples = samples
sc.render.use_persistent_data = True
if "--still" in args:
    out.parent.mkdir(parents=True, exist_ok=True)
    sc.render.filepath = str(out)
    bpy.ops.render.render(write_still=True)
    sys.exit(0)
out.mkdir(parents=True, exist_ok=True)
s, e = (int(nums[0]), int(nums[1])) if len(nums) >= 2 else (sc.frame_start, sc.frame_end)
for f in range(s, e + 1, step):
    p = out / f"f_{f:04d}.png"
    if p.exists():
        continue
    sc.frame_set(f)
    sc.render.filepath = str(p)
    bpy.ops.render.render(write_still=True)
    print(f"[frame] {f}", flush=True)
