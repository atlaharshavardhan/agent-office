"""Alice Short · Scene 7 (3.0 s, 90 frames): an EMPTY executive chair on the dark NVIDIA keynote stage under one
focused spotlight; the other stage lights switch off one by one. No character. Illustration only.
  .venv/bin/python scripts/alice_s7_stage.py [still.png samples]  -> blender/alice_s7_stage.blend
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

import common as C  # noqa: E402
import build_scene as S  # noqa: E402
from build_v2 import setup, camera, key_cam, ease, text_obj  # noqa: E402
from build_datacenter import emissive  # noqa: E402

F_END = 90


def key_value(sock, f, v):
    sock.default_value = v; sock.keyframe_insert("default_value", frame=f)


def chair(x=0, y=0):
    leather, _ = C.principled("ChairLeather", "#0B0B0C", rough=0.32, coat=0.5)
    alu, _ = C.principled("ChairAlu", "#9CA3AB", metallic=1, rough=0.22)
    C.box("Seat", (56, 52, 9), (x, y, 50), leather, 4, 3)
    back = C.box("Back", (54, 9, 66), (x, y + 26, 92), leather, 4, 3); back.rotation_euler.x = math.radians(-10)
    C.box("Headrest", (34, 8, 14), (x, y + 32, 132), leather, 3, 3).rotation_euler.x = math.radians(-12)
    for sx in (-1, 1):
        C.box(f"ArmPost{sx}", (4, 4, 18), (x + sx * 30, y + 4, 62), alu, 1, 2)
        C.box(f"ArmPad{sx}", (8, 30, 4), (x + sx * 30, y + 2, 72), leather, 1.5, 2)
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=3.2, depth=34, location=(x, y, 28)); bpy.context.active_object.data.materials.append(alu)
    for k in range(5):                                   # five-star base + casters
        a = math.radians(90 + k * 72)
        leg = C.box(f"Leg{k}", (5, 32, 3), (x + math.cos(a) * 15, y + math.sin(a) * 15, 9), alu, 1, 2)
        leg.rotation_euler.z = a - math.pi / 2
        bpy.ops.mesh.primitive_uv_sphere_add(radius=3.2, location=(x + math.cos(a) * 31, y + math.sin(a) * 31, 3.2))
        bpy.context.active_object.data.materials.append(C.principled("Caster", "#111111", rough=0.4)[0])


def build(still=None, samples=48):
    sc = setup(samples)
    floor, _ = C.principled("StageFloor", "#07080A", rough=0.14, coat=0.7)
    C.box("Floor", (6000, 6000, 1), (0, 0, -0.5), floor)
    disc_m, _ = C.principled("StageDisc", "#101215", metallic=0.6, rough=0.28)
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=420, depth=20, location=(0, 120, 10))
    bpy.context.active_object.data.materials.append(disc_m)
    edge = emissive("StageEdge", C.NV_GREEN, 6)
    bpy.ops.mesh.primitive_torus_add(major_radius=421, minor_radius=1.6, location=(0, 120, 19.5))
    bpy.context.active_object.data.materials.append(edge)
    wall = emissive("LEDWallGlow", "#0B2A04", 1.4)
    C.box("LEDWall", (2200, 4, 900), (0, 900, 450), wall)
    word = emissive("Wordmark", "#EEF6E4", 5)
    text_obj("NVIDIA", 300, (0, 896, 560), word)
    chair(0, 120)
    # visible light cone over the chair (cheap fake beam: transparent emissive cone)
    beam = bpy.data.materials.new("Beam"); beam.use_nodes = True
    nt = beam.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); mix = nt.nodes.new("ShaderNodeMixShader")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (1.0, 0.93, 0.82, 1); em.inputs["Strength"].default_value = 0.6
    mix.inputs["Fac"].default_value = 0.022
    nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(em.outputs[0], mix.inputs[2]); nt.links.new(mix.outputs[0], out.inputs[0])
    beam.blend_method = "BLEND" if hasattr(beam, "blend_method") else None
    bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=95, radius2=6, depth=560, location=(0, 120, 290))
    cone = bpy.context.active_object; cone.data.materials.append(beam); cone.visible_shadow = False
    sp = bpy.data.lights.new("FocusSpot", "SPOT"); sp.energy = 2.2e5; sp.spot_size = math.radians(22); sp.spot_blend = 0.35
    sp.color = (1.0, 0.93, 0.82); sp.shadow_soft_size = 3
    so = bpy.data.objects.new("FocusSpot", sp); so.location = (0, 120, 570); C.link(so)
    # stage lights that switch off one by one
    lights = [
        S.area_light("WashL", (-500, -200, 420), (0, 120, 40), 200, 2.5e5, "#CFE0FF", size_y=200),
        S.area_light("WashR", (500, -200, 420), (0, 120, 40), 200, 2.2e5, "#CFE0FF", size_y=200),
        S.area_light("RimL", (-300, 500, 260), (0, 120, 80), 80, 1.0e5, C.NV_GREEN, size_y=200),
        S.area_light("RimR", (300, 500, 260), (0, 120, 80), 80, 1.0e5, C.NV_GREEN, size_y=200),
    ]
    S.build_world().inputs["Strength"].default_value = 0.02
    for f, L in zip((22, 34, 46, 58), lights):
        e0 = L.data.energy
        L.data.keyframe_insert("energy", frame=f)
        L.data.energy = e0 * 0.01; L.data.keyframe_insert("energy", frame=f + 3)
        L.data.energy = e0
    for mat, f, v0 in ((edge, 16, 6.0), (wall, 52, 1.4), (word, 64, 5.0)):
        s = mat.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
        key_value(s, f, v0); key_value(s, f + 4, v0 * 0.008)
    cam, tgt = camera(35, 2.8)
    for f in range(1, F_END + 1):
        t = ease((f - 1) / (F_END - 1))
        key_cam(cam, tgt, f, Vector((60 - 30 * t, -430 + 130 * t, 140 - 20 * t)), Vector((0, 160, 120 - 10 * t)))
    cam.data.dof.focus_distance = 480
    sc.frame_start, sc.frame_end = 1, F_END
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "blender/alice_s7_stage.blend"))
    print("[built] alice_s7_stage")
    if still:
        sc.render.resolution_percentage = 50
        for fr in (1, 75):
            sc.frame_set(fr); sc.render.filepath = still.replace(".png", f"_f{fr:03d}.png"); bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else None, int(sys.argv[2]) if len(sys.argv) > 2 else 48)
