"""Our stylized Jensen character seen from behind on a dark keynote stage, arms open to the audience,
dimmed silhouette with rim light (original 3D illustration, not based on any photo). Still or 60-frame idle.
  .venv/bin/python scripts/alice_jensen_back.py out.png [samples]"""
import math, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy
from mathutils import Vector
import common as C
import build_scene as S
import build_character as BC
from build_v2 import setup, camera, key_cam, text_obj
from build_datacenter import emissive

OPEN = BC.ARMS_DOWN[:0] + [
    ("aim", "upperarm01.L", (0.6, -0.2, -0.78)), ("aim", "upperarm02.L", (0.6, -0.2, -0.78)),
    ("aim", "lowerarm01.L", (0.85, -0.5, -0.05)), ("aim", "lowerarm02.L", (0.85, -0.5, -0.05)),
    ("aim", "upperarm01.R", (-0.6, -0.2, -0.78)), ("aim", "upperarm02.R", (-0.6, -0.2, -0.78)),
    ("aim", "lowerarm01.R", (-0.85, -0.5, -0.05)), ("aim", "lowerarm02.R", (-0.85, -0.5, -0.05))]

def build(out=None, samples=32):
    sc = setup(samples)
    floor, _ = C.principled("StageFloor", "#060708", rough=0.15, coat=0.7)
    C.box("Floor", (6000, 6000, 1), (0, 0, -0.5), floor)
    # audience side is -Y; a soft green haze wall far out front gives the silhouette a backdrop
    C.box("FrontGlow", (3000, 4, 1200), (0, -1400, 500), emissive("Haze", "#0E2A06", 1.2))
    for k in range(-6, 7):                                  # faint audience lights
        C.box(f"AudLight{k}", (6, 2, 6), (k * 180, -1380, 140 + (k % 3) * 40), emissive("Aud", "#E8F3FF", 8))
    arm, _ = BC.make_character("jensen", loc=(0, 0, 0))
    BC.set_pose(arm, OPEN)
    S.area_light("Spot", (0, -500, 700), (0, 0, 140), 160, 2.0e5, "#FFF0DE", size_y=160)      # front key (we see only spill)
    S.area_light("RimL", (-260, -260, 260), (0, 0, 150), 60, 1.2e5, "#9BE22E", size_y=160)
    S.area_light("RimR", (260, -260, 260), (0, 0, 150), 60, 1.0e5, "#9BE22E", size_y=160)
    S.area_light("HairRim", (-110, -60, 210), (0, 0, 172), 30, 1.8e4, "#FFFFFF", size_y=30)
    S.area_light("HairRim2", (110, -60, 210), (0, 0, 172), 30, 1.4e4, "#E6F0FF", size_y=30)
    S.area_light("JacketGloss", (-60, 160, 260), (0, 0, 140), 60, 1.2e4, "#FFFFFF", size_y=30)
    S.area_light("BackFill", (120, 420, 220), (0, 0, 130), 200, 6.0e3, "#C9D6FF", size_y=200)   # very low: keeps him dim
    S.build_world().inputs["Strength"].default_value = 0.01
    cam, tgt = camera(35, 2.8)
    key_cam(cam, tgt, 1, Vector((0, 200, 125)), Vector((0, -300, 160)))
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1080, 1920, 100
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "blender/alice_jensen_back.blend"))
    if out:
        sc.frame_set(1); sc.render.filepath = out; bpy.ops.render.render(write_still=True)

if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else None, int(sys.argv[2]) if len(sys.argv) > 2 else 32)
