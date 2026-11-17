"""Alice Short · Scene 7 (3.0 s, 90 frames): the stylized Jensen character (new croc-leather look) seen from behind,
facing the NVIDIA LED wall on the keynote stage; the stage lights switch off one by one. Illustration only.
  .venv/bin/python scripts/alice_s7_stage.py   -> blender/alice_s7_stage.blend (build only; render on the GPU VM)
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

import common as C  # noqa: E402
import build_scene as S  # noqa: E402
import build_character as BC  # noqa: E402
from build_v2 import setup, camera, key_cam, ease, text_obj  # noqa: E402
from build_datacenter import emissive  # noqa: E402

F_END = 90


def key_value(sock, f, v):
    sock.default_value = v; sock.keyframe_insert("default_value", frame=f)


def build():
    sc = setup(48)
    floor, _ = C.principled("StageFloor", "#07080A", rough=0.16, coat=0.7)
    C.box("Floor", (6000, 6000, 1), (0, 0, -0.5), floor)
    disc_m, _ = C.principled("StageDisc", "#101215", metallic=0.6, rough=0.3)
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=520, depth=24, location=(0, 120, 12))
    bpy.context.active_object.data.materials.append(disc_m)
    edge = emissive("StageEdge", C.NV_GREEN, 6)
    bpy.ops.mesh.primitive_torus_add(major_radius=521, minor_radius=1.6, location=(0, 120, 23.5))
    bpy.context.active_object.data.materials.append(edge)
    wall = emissive("LEDWallGlow", "#0B2A04", 1.4)
    C.box("LEDWall", (2200, 4, 900), (0, 900, 450), wall)
    word = emissive("Wordmark", "#EEF6E4", 5)
    text_obj("NVIDIA", 300, (0, 896, 560), word)
    # character faces the wall (+Y), seen from behind
    arm, _ = BC.make_character("jensen", loc=(0, 160, 24))
    arm.rotation_euler.z = math.radians(180)
    BC.set_pose(arm, BC.POSES["stand"])
    BC.idle(arm, 1, F_END, BC.POSES["stand"], amp=0.5)
    # lights: rims on the jacket + top light; each switches off in turn
    lights = [
        S.area_light("RimL", (-260, 420, 260), (0, 160, 150), 60, 1.6e5, C.NV_GREEN, size_y=200),
        S.area_light("RimR", (260, 420, 260), (0, 160, 150), 60, 1.4e5, C.NV_GREEN, size_y=200),
        S.area_light("Top", (0, 160, 520), (0, 160, 100), 120, 1.2e5, "#FFF2E4", size_y=120),
        S.area_light("BackKey", (-120, -260, 300), (0, 160, 150), 120, 6.0e4, "#DCE6FF", size_y=120),
    ]
    S.area_light("HairRim", (40, 420, 330), (0, 160, 190), 40, 2.0e4, "#FFFFFF", size_y=40)   # stays on (dim end)
    S.build_world().inputs["Strength"].default_value = 0.02
    offs = [(30, lights[2]), (42, lights[0]), (54, lights[1]), (66, lights[3])]   # top, rim L, rim R, back key
    for f, L in offs:
        e0 = L.data.energy
        L.data.keyframe_insert("energy", frame=f)
        L.data.energy = e0 * 0.02; L.data.keyframe_insert("energy", frame=f + 3)
        L.data.energy = e0
    for mat, f, v0 in ((edge, 24, 6.0), (wall, 48, 1.4), (word, 72, 5.0)):
        s = mat.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
        key_value(s, f, v0); key_value(s, f + 4, v0 * 0.03)
    cam, tgt = camera(35, 2.8)
    for f in range(1, F_END + 1):
        t = ease((f - 1) / (F_END - 1))
        key_cam(cam, tgt, f, Vector((40 - 20 * t, -230 + 90 * t, 120 - 10 * t)), Vector((0, 400, 230 - 20 * t)))
    sc.frame_start, sc.frame_end = 1, F_END
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "blender/alice_s7_stage.blend"))
    print("[built] alice_s7_stage")


if __name__ == "__main__":
    build()
