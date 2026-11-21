"""Build-it-yourself AC · step shots (Blender). Same room, same straight-on camera, same window every time.
We never use a ready-made AC: each shot adds one thing to the window.

  w_closed : only the window, closed
  w_open   : window open (lower sash up) - air comes in
  w_fan    : a fan attached in the open window
  w_ice    : ice cubes in a tray in front of the fan

Run: nvidia-blender/.venv/bin/python air-conditioning/blender/ac_build.py -- --shot w_fan [--samples 28] [--res 1]
Out: air-conditioning/renders/<shot>.png
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy  # noqa: E402
import ac_scene as A  # noqa: E402

SHOT = A.ARGS[A.ARGS.index("--shot") + 1] if "--shot" in A.ARGS else "w_closed"


def window_fan(M, z0):
    """A round fan fixed inside the open window: a white mounting board fills the opening, fan blows into the room."""
    w = A.W_OPEN[0]
    h = 0.58
    y = 0.07
    # mounting board with a round hole look (board + ring)
    A.box("FanBoard_L", (0.17, 0.03, h), (-w / 2 + 0.085, y, z0 + h / 2), M["trim"])
    A.box("FanBoard_R", (0.17, 0.03, h), (w / 2 - 0.085, y, z0 + h / 2), M["trim"])
    A.torus("FanRing", 0.29, 0.025, (0, y - 0.02, z0 + h / 2), M["plastic"], rot=(math.radians(90), 0, 0))
    cx, cz = 0, z0 + h / 2
    # cage
    A.torus("FanCage", 0.27, 0.006, (cx, y - 0.06, cz), M["metal"], rot=(math.radians(90), 0, 0))
    A.torus("FanCage2", 0.17, 0.005, (cx, y - 0.065, cz), M["metal"], rot=(math.radians(90), 0, 0))
    A.torus("FanCage3", 0.08, 0.004, (cx, y - 0.068, cz), M["metal"], rot=(math.radians(90), 0, 0))
    for k in range(8):
        a = k * math.pi / 4
        bpy.ops.mesh.primitive_cylinder_add(radius=0.004, depth=0.27, location=(cx + math.cos(a) * 0.135, y - 0.066, cz + math.sin(a) * 0.135), rotation=(0, math.pi / 2 - a, 0))
        bpy.context.active_object.data.materials.append(M["metal"])
    A.cyl("FanHub", 0.05, 0.05, (cx, y - 0.04, cz), M["plastic"], rot=(math.radians(90), 0, 0))
    for k in range(5):
        a = k * 2 * math.pi / 5 + 0.3
        A.sphere(f"Blade{k}", 0.12, (cx + math.cos(a) * 0.13, y - 0.03, cz + math.sin(a) * 0.13), M["blade"], scale=(1.0, 0.1, 0.5))
        bpy.context.active_object.rotation_euler = (0, -a, 0)
    A.cyl("FanMotor", 0.07, 0.1, (cx, y + 0.04, cz), M["dark"], rot=(math.radians(90), 0, 0))


def ice_tray_on_sill(M, z0):
    """A shelf on the window stool + ONE big ice block (in a shallow tray) right in front of the fan."""
    A.box("Shelf", (0.7, 0.26, 0.025), (0, -0.2, z0 - 0.005), M["trim"], bevel=0.005)
    A.box("ShelfBracketL", (0.025, 0.2, 0.12), (-0.3, -0.18, z0 - 0.07), M["trim"])
    A.box("ShelfBracketR", (0.025, 0.2, 0.12), (0.3, -0.18, z0 - 0.07), M["trim"])
    zt = z0 + 0.008
    A.box("TrayBase", (0.5, 0.22, 0.01), (0, -0.2, zt + 0.005), M["tray"])
    for nm, sz, l in (("TrayF", (0.5, 0.008, 0.04), (0, -0.31, zt + 0.02)), ("TrayB", (0.5, 0.008, 0.04), (0, -0.09, zt + 0.02)),
                      ("TrayL", (0.008, 0.22, 0.04), (-0.25, -0.2, zt + 0.02)), ("TrayR", (0.008, 0.22, 0.04), (0.25, -0.2, zt + 0.02))):
        A.box(nm, sz, l, M["tray"])
    ice = A.mat("IceBlock", (0.82, 0.93, 1.0), 0.12, transmission=0.85)
    nt = ice.node_tree                                       # frosty, slightly uneven surface
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 18
    bm = nt.nodes.new("ShaderNodeBump"); bm.inputs["Strength"].default_value = 0.25
    nt.links.new(nz.outputs["Fac"], bm.inputs["Height"]); nt.links.new(bm.outputs["Normal"], nt.nodes["Principled BSDF"].inputs["Normal"])
    A.box("IceBlock", (0.42, 0.17, 0.24), (0, -0.2, zt + 0.13), ice, bevel=0.025)


def main():
    A.reset()
    M = A.materials()
    is_open = SHOT != "w_closed"
    A.build_room(M, sash_up=is_open, with_ac=False)
    A.build_outside(M)
    if SHOT in ("w_fan", "w_ice"):
        window_fan(M, A.SILL_Z)
    if SHOT == "w_ice":
        ice_tray_on_sill(M, A.SILL_Z)
    A.lights_world()
    A.camera((0, -2.35, 1.42), (0, 0, 1.38), 24)
    out = A.ROOT / "renders" / f"{SHOT}.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    bpy.context.scene.render.filepath = str(out)
    bpy.ops.render.render(write_still=True)
    print("rendered", out)


main()
