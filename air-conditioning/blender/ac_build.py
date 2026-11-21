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
from mathutils import Vector  # noqa: E402
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


def melted(M, z0):
    """The ice block shrunk to a small lump in a puddle."""
    for o in [o for o in bpy.data.objects if o.name == "IceBlock"]:
        o.scale = (0.38, 0.45, 0.28); o.location.z = z0 + 0.008 + 0.045
    water = A.mat("Puddle", (0.75, 0.88, 1.0), 0.03, transmission=0.95)
    A.sphere("Puddle", 0.2, (0, -0.2, z0 + 0.016), water, scale=(1.15, 0.5, 0.03))


def ac_internals(M):
    """Inside the ONE window-AC box: indoor coil + blower (room half), partition, compressor + fan + outdoor coil
    (outside half), drain pan along the bottom and a drip spout at the outdoor end."""
    z0, hgt = A.SILL_Z, 0.42
    coil = A.mat("Coil", A.hexc("#C9D2DB"), 0.35, metal=0.6)
    nt = coil.node_tree
    wv = nt.nodes.new("ShaderNodeTexWave"); wv.bands_direction = "Z"; wv.inputs["Scale"].default_value = 60
    ramp = nt.nodes.new("ShaderNodeValToRGB"); ramp.color_ramp.elements[0].color = (*A.hexc("#8E9AA6"), 1); ramp.color_ramp.elements[1].color = (*A.hexc("#DDE3E9"), 1)
    nt.links.new(wv.outputs["Fac"], ramp.inputs[0]); nt.links.new(ramp.outputs[0], nt.nodes["Principled BSDF"].inputs["Base Color"])
    inner = A.mat("Inner", A.hexc("#5E656D"), 0.6)
    A.box("IN_Back", (0.6, 0.58, 0.01), (0, -0.02, z0 + 0.03), inner)
    A.box("IN_Coil", (0.56, 0.05, 0.32), (0, -0.255, z0 + 0.2), coil)
    A.cyl("IN_Blower", 0.1, 0.5, (0, -0.12, z0 + 0.22), M["dark"], rot=(0, math.radians(90), 0))
    A.box("IN_Partition", (0.6, 0.02, 0.38), (0, 0.02, z0 + 0.21), A.mat("Partition", A.hexc("#3A3F45"), 0.7))
    A.cyl("IN_Compressor", 0.06, 0.2, (0, 0.09, z0 + 0.12), A.mat("Compressor", A.hexc("#2B2F34"), 0.4, metal=0.5))
    A.cyl("IN_FanO", 0.12, 0.02, (0, 0.16, z0 + 0.25), A.mat("FanO", A.hexc("#8C959F"), 0.4), rot=(math.radians(90), 0, 0))
    A.box("IN_CoilO", (0.56, 0.04, 0.32), (0, 0.255, z0 + 0.2), coil)
    A.box("IN_Pan", (0.58, 0.56, 0.012), (0, -0.02, z0 + 0.018), A.mat("Pan", A.hexc("#7C8792"), 0.5))
    A.cyl("IN_Spout", 0.012, 0.05, (-0.05, 0.27, z0 - 0.02), A.mat("Spout", A.hexc("#22262B"), 0.5))


def hollow_case():
    """Make the AC case a shell so the section shows its parts, not a solid white slab."""
    case = bpy.data.objects.get("AC_Case")
    if not case:
        return
    bpy.ops.mesh.primitive_cube_add(size=1, location=case.location)
    inner = bpy.context.active_object; inner.name = "CaseInner"; inner.scale = (0.62, 0.58, 0.38); inner.hide_render = True
    m = case.modifiers.new("hollow", "BOOLEAN"); m.operation = "DIFFERENCE"; m.object = inner; m.solver = "EXACT"
    for nm in ("AC_Front",):
        o = bpy.data.objects.get(nm)
        if o:
            o.scale.y = 1.0


def section_cut():
    """Cut everything at x = 0 (keep x < 0) so a side camera sees one flat section through window, wall and AC."""
    hollow_case()
    bpy.ops.mesh.primitive_cube_add(size=1, location=(5, 0, 1))
    cut = bpy.context.active_object; cut.name = "Cutter"; cut.scale = (10, 80, 30); cut.hide_render = True
    for o in list(bpy.data.objects):
        if o.type != "MESH" or o is cut or o.name == "CaseInner":
            continue
        xs = [(o.matrix_world @ Vector(c)).x for c in o.bound_box]
        if min(xs) >= -1e-4:
            bpy.data.objects.remove(o, do_unlink=True)
        elif max(xs) > 1e-4:
            m = o.modifiers.new("cut", "BOOLEAN"); m.operation = "DIFFERENCE"; m.object = cut; m.solver = "EXACT"
            try:
                m.material_mode = "INDEX"          # cut faces keep the object's own material
            except Exception:
                pass
    # room side wall far behind (so the room reads as a room) + soft light on the section faces
    A.box("RoomSide", (0.05, 6, 2.75), (-3.6, -3, 1.36), A.mat("RoomSide", A.hexc("#D9CDB8"), 0.85))
    bpy.ops.object.light_add(type="AREA", location=(2.5, -0.1, 1.4))
    l = bpy.context.active_object; l.data.energy = 40; l.data.size = 2.5; l.rotation_euler = (0, math.radians(90), 0)
    bpy.context.scene.view_settings.exposure = -1.0


def ortho_side(center_y, center_z, height):
    cd = bpy.data.cameras.new("Side"); cam = bpy.data.objects.new("Side", cd)
    bpy.context.scene.collection.objects.link(cam); bpy.context.scene.camera = cam
    cd.type = "ORTHO"; cd.sensor_fit = "VERTICAL"; cd.ortho_scale = height; cd.clip_start = 0.1; cd.clip_end = 100
    cam.location = (3.0, center_y, center_z)
    cam.rotation_euler = (Vector((-1, 0, 0))).to_track_quat("-Z", "Y").to_euler()


def main():
    A.reset()
    M = A.materials()
    with_ac = SHOT in ("w_ac", "c_cut", "c_drop")
    is_open = SHOT != "w_closed"
    A.build_room(M, sash_up=is_open and not with_ac, with_ac=with_ac)
    A.build_outside(M)
    if SHOT in ("w_fan", "w_ice", "w_melt", "w_trayclose"):
        window_fan(M, A.SILL_Z)
    if SHOT in ("w_ice", "w_melt", "w_trayclose"):
        ice_tray_on_sill(M, A.SILL_Z)
    if SHOT in ("w_melt", "w_trayclose"):
        melted(M, A.SILL_Z)
    if with_ac:
        A.build_window_ac(M, A.SILL_Z)
    if SHOT in ("c_cut", "c_drop"):
        ac_internals(M)
        section_cut()
    A.lights_world()
    if SHOT == "c_cut":
        ortho_side(-0.02, 1.1, 2.0)                       # 960 px per metre, centre (y -0.02, z 1.10)
    elif SHOT == "c_drop":
        ortho_side(0.22, 0.73, 0.667)                     # 3x zoom on the drip spout (same drop size as the tray close-up)
    elif SHOT == "w_trayclose":
        A.camera((0, -0.95, 1.12), (0, -0.2, 0.9), 50)
    else:
        A.camera((0, -2.35, 1.42), (0, 0, 1.38), 24)
    out = A.ROOT / "renders" / f"{SHOT}.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    bpy.context.scene.render.filepath = str(out)
    bpy.ops.render.render(write_still=True)
    print("rendered", out)


if __name__ == "__main__":
    main()
