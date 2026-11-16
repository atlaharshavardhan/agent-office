"""Single entry point: download -> licence check -> build -> animate -> save -> render -> encode.

Usage (from nvidia-blender/):
    .venv/bin/python scripts/run_all.py                 # everything, 1080x1920 preview
    .venv/bin/python scripts/run_all.py --build-only    # just (re)build the .blend files
    .venv/bin/python scripts/run_all.py --stills        # build + render frames 15/45/90 only
    .venv/bin/python scripts/run_all.py --final         # 2160x3840 (only after approval)
"""
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import bpy  # noqa: E402

import common as C  # noqa: E402
import download_assets  # noqa: E402
import inspect_assets  # noqa: E402
import convert_assets  # noqa: E402
from build_gpu import build_gpu  # noqa: E402
from build_motherboard import build_board  # noqa: E402
import build_scene as S  # noqa: E402
import animate_hook as A  # noqa: E402
import render_preview as R  # noqa: E402


def build(final=False, samples=None):
    # 1-4: assets + licences (no external geometry is reusable, see ASSET_LICENSES.md)
    download_assets.main()
    report = inspect_assets.main()
    convert_assets.main(report)

    # 5: reusable hero asset on its own (skip with SKIP_ASSETS=1 while iterating)
    import os
    if os.environ.get("SKIP_ASSETS"):
        return build_hook(final, samples)
    C.reset_scene()
    C._MATS.clear()
    build_gpu()
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "assets/models/nvidia_ai_gpu.blend"))
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "blender/nvidia_ai_gpu.blend"))
    C.reset_scene()
    C._MATS.clear()
    build_board()
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "assets/models/motherboard.blend"))

    return build_hook(final, samples)


def build_hook(final=False, samples=None):
    # 6-9: full scene
    sc = C.reset_scene()
    C._MATS.clear()
    build_board()
    root, frags = build_gpu(parent_loc=(0, 0, A.PKG_Z0))
    L = S.build_lights()
    bg = S.build_world()
    S.build_atmosphere()
    cam, tgt = S.build_camera()
    device = S.render_settings(final=final, samples=samples)
    A.key_camera(cam, tgt)
    A.key_scene_props(sc)
    A.key_package(root, frags)
    A.key_lights(L, bg)
    sc.frame_set(1)
    out = C.ROOT / "blender/nvidia_hook.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(out))
    print(f"[build] saved {out}  render device: {device}")
    return out


if __name__ == "__main__":
    args = sys.argv[1:]
    final = "--final" in args
    build(final=final)
    if "--build-only" in args:
        sys.exit(0)
    if "--stills" in args:
        R.render_stills()
        sys.exit(0)
    R.render_stills()
    R.render_frames(final=final)
    R.encode(final=final)
