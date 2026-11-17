"""Scene 3 still: the hero chip floating in front of a data-centre corridor.

Racks are original procedural geometry: 42U server racks with 1U servers,
front grilles and green status LEDs; ceiling light strips; thin haze.
Usage: .venv/bin/python scripts/build_datacenter.py [--render]
"""
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy  # noqa: E402
import bmesh  # noqa: E402
from mathutils import Vector  # noqa: E402

import common as C  # noqa: E402
import build_scene as S  # noqa: E402
from build_gpu import build_gpu  # noqa: E402

RACK = (60.0, 110.0, 200.0)   # width (x), depth (y), height (z) in cm


def emissive(name, hexcol, strength):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0, 0, 0, 1)
    p.inputs["Emission Color"].default_value = C.hex_rgba(hexcol)
    p.inputs["Emission Strength"].default_value = strength
    return m


def build_racks(n=16, gap=96.0):
    rnd = random.Random(1)
    body, _ = C.principled("Rack_Body", "#0C0D0F", metallic=0.6, rough=0.35)
    face, _ = C.principled("Server_Face", "#16181B", metallic=0.8, rough=0.3)
    grille, _ = C.principled("Grille", "#050506", metallic=0.5, rough=0.6)
    led_g = emissive("LED_Green", C.NV_GREEN, 18)
    led_w = emissive("LED_White", "#CFE8FF", 6)
    bm_body, bm_face, bm_grille, bm_lg, bm_lw = (bmesh.new() for _ in range(5))
    for side in (-1, 1):
        x = side * gap / 2
        for i in range(n):
            y = 60 + i * (RACK[0] + 2)
            # rack frame, its front faces the corridor (towards x = 0)
            C.add_box(bm_body, (RACK[1], RACK[0], RACK[2]), (x + side * RACK[1] / 2, y, RACK[2] / 2))
            fx = x + side * -0.6
            for u in range(40):
                z = 8 + u * 4.45
                if rnd.random() < 0.08:
                    continue
                C.add_box(bm_face, (1.2, RACK[0] - 6, 4.2), (fx, y, z + 2.1))
                C.add_box(bm_grille, (0.4, RACK[0] * 0.55, 3.0), (fx - side * 0.6, y - 4, z + 2.1))
                for k in range(rnd.randint(1, 4)):
                    lb = bm_lg if rnd.random() < 0.8 else bm_lw
                    C.add_box(lb, (0.3, 0.5, 0.5), (fx - side * 0.8, y + RACK[0] / 2 - 6 - k * 1.4, z + 2.1))
    for nm, bm, m in (("Racks", bm_body, body), ("Server_Faces", bm_face, face), ("Grilles", bm_grille, grille),
                      ("LEDs_Green", bm_lg, led_g), ("LEDs_White", bm_lw, led_w)):
        C.link(C.mesh_obj(nm, bm, m))
    # floor (glossy epoxy) + ceiling light strips
    floor, _ = C.principled("DC_Floor", "#0A0B0D", rough=0.12, coat=0.8)
    C.box("DC_Floor", (2000, 3000, 1), (0, 900, -0.5), floor)
    strip = emissive("Ceiling_Strip", "#E8F1FF", 3)
    for i in range(10):
        C.box(f"Strip_{i}", (8, 40, 1), (0, 80 + i * 110, 260), strip)


def main(render=False):
    sc = C.reset_scene()
    C._MATS.clear()
    build_racks()
    root, _ = build_gpu(parent_loc=(0, 0, 0))
    root.location = (0, -22, 106)
    root.rotation_euler = (math.radians(62), 0, math.radians(8))
    for nm in ("Studio_Floor",):
        pass
    S.build_world().inputs["Strength"].default_value = 0.02
    # haze down the corridor
    vol = S.build_atmosphere()
    vol.inputs["Density"].default_value = 0.00025
    bpy.data.objects["Atmosphere"].scale = (20, 20, 8)
    rim = S.area_light("Chip_Rim_Green", (0, 60, 150), (0, -22, 106), 60, 4e4, C.NV_GREEN, size_y=10)
    key = S.area_light("Chip_Key", (-30, -70, 150), (0, -22, 106), 40, 3.5e4, size_y=25)
    top = S.area_light("Chip_Top", (0, -40, 170), (0, -22, 106), 50, 2.5e4, size_y=30)
    cam, tgt = S.build_camera()
    cam.location = (6, -54, 116)
    tgt.location = (0, -22, 106)
    cam.data.lens = 28
    cam.data.dof.aperture_fstop = 2.8
    cam.data.shift_y = 0.04
    S.render_settings(samples=48)
    bpy.data.objects["Atmosphere"].hide_render = False
    sc.render.use_motion_blur = False
    out = C.ROOT / "blender/nvidia_datacenter.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(out))
    if render:
        sc.render.filepath = str(C.ROOT / "renders/stills/scene03_datacenter.png")
        bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    main(render="--render" in sys.argv)
