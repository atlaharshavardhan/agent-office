"""How You'd Invent Air Conditioning · 3D background plates (Blender, Cycles). Original scene, built from code.

A plain room wall seen straight on with one white double-hung window; outside: a lawn, a fence, trees and a
neighbour's house. Props: desk fan on a small table, shallow ice tray, a window AC that sits in the same window
(front half in the room, back half outside). Text, heat lines and arrows are added later in Remotion.

Run:  nvidia-blender/.venv/bin/python air-conditioning/blender/ac_scene.py -- --shot room_closed [--samples 32] [--res 0.5]
Shots: room_closed, room_open, room_ac, outside_ac
Out:   air-conditioning/renders/<shot>.png  (1080x1920 at --res 1)
"""
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SHOT = ARGS[ARGS.index("--shot") + 1] if "--shot" in ARGS else "room_closed"
SAMPLES = int(ARGS[ARGS.index("--samples") + 1]) if "--samples" in ARGS else 32
RES = float(ARGS[ARGS.index("--res") + 1]) if "--res" in ARGS else 1.0


# ------------------------------------------------------------------ helpers
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    try:                                           # use the GPU when there is one (e.g. the GCP VM's L4)
        prefs = bpy.context.preferences.addons["cycles"].preferences
        for kind in ("OPTIX", "CUDA", "HIP", "METAL"):
            try:
                prefs.compute_device_type = kind
                prefs.get_devices()
                if any(d.type == kind for d in prefs.devices):
                    for d in prefs.devices:
                        d.use = d.type == kind
                    sc.cycles.device = "GPU"
                    print("Cycles device:", kind)
                    break
            except Exception:
                continue
    except Exception:
        pass
    sc.cycles.samples = SAMPLES
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 5
    sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
    sc.render.resolution_percentage = int(RES * 100)
    sc.view_settings.view_transform = "AgX"
    try:
        sc.view_settings.look = "AgX - Base Contrast"
    except Exception:
        pass
    return sc


def mat(name, color, rough=0.6, metal=0.0, alpha=1.0, transmission=0.0, emit=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    if transmission:
        p.inputs["Transmission Weight"].default_value = transmission
        p.inputs["IOR"].default_value = 1.45
    if alpha < 1:
        p.inputs["Alpha"].default_value = alpha
    if emit:
        p.inputs["Emission Color"].default_value = (*emit[0], 1)
        p.inputs["Emission Strength"].default_value = emit[1]
    return m


def hexc(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


def box(name, size, loc, m, bevel=0.0, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        b = o.modifiers.new("bevel", "BEVEL")
        b.width = bevel
        b.segments = 3
    o.data.materials.append(m)
    return o


def cyl(name, r, depth, loc, m, rot=(0, 0, 0), verts=48):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.active_object
    o.name = name
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o


def torus(name, R, r, loc, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, rotation=rot, major_segments=64, minor_segments=12)
    o = bpy.context.active_object
    o.name = name
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o


def sphere(name, r, loc, m, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=24, ring_count=12)
    o = bpy.context.active_object
    o.name = name
    o.scale = scale
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o


# ------------------------------------------------------------------ materials
def materials():
    M = {}
    M["wall"] = mat("Wall", hexc("#D9CDB8"), 0.85)
    M["ext"] = mat("Siding", hexc("#9FA8B4"), 0.7)
    # horizontal siding grooves via a wave bump
    nt = M["ext"].node_tree
    wv = nt.nodes.new("ShaderNodeTexWave"); wv.bands_direction = "Z"; wv.inputs["Scale"].default_value = 9.0
    bm = nt.nodes.new("ShaderNodeBump"); bm.inputs["Strength"].default_value = 0.35
    nt.links.new(wv.outputs["Fac"], bm.inputs["Height"]); nt.links.new(bm.outputs["Normal"], nt.nodes["Principled BSDF"].inputs["Normal"])
    M["trim"] = mat("Trim", hexc("#F4F4F1"), 0.45)
    M["floor"] = mat("Floor", hexc("#8E6A4E"), 0.5)
    nt = M["floor"].node_tree
    wv = nt.nodes.new("ShaderNodeTexWave"); wv.inputs["Scale"].default_value = 3.0; wv.inputs["Distortion"].default_value = 6
    ramp = nt.nodes.new("ShaderNodeValToRGB"); ramp.color_ramp.elements[0].color = (*hexc("#7A563D"), 1); ramp.color_ramp.elements[1].color = (*hexc("#A27C5C"), 1)
    nt.links.new(wv.outputs["Fac"], ramp.inputs[0]); nt.links.new(ramp.outputs[0], nt.nodes["Principled BSDF"].inputs["Base Color"])
    M["ceiling"] = mat("Ceiling", hexc("#EEEDEA"), 0.9)
    M["glass"] = mat("Glass", (0.9, 0.95, 1.0), 0.02, transmission=1.0)
    M["grass"] = mat("Grass", hexc("#4E8A35"), 0.9)
    nt = M["grass"].node_tree
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 40
    ramp = nt.nodes.new("ShaderNodeValToRGB"); ramp.color_ramp.elements[0].color = (*hexc("#3F7A2A"), 1); ramp.color_ramp.elements[1].color = (*hexc("#6FA544"), 1)
    nt.links.new(nz.outputs["Fac"], ramp.inputs[0]); nt.links.new(ramp.outputs[0], nt.nodes["Principled BSDF"].inputs["Base Color"])
    M["fence"] = mat("Fence", hexc("#6B4A32"), 0.8)
    M["leaf"] = mat("Leaves", hexc("#3E6B2C"), 0.8)
    M["trunk"] = mat("Trunk", hexc("#5A4232"), 0.9)
    M["house"] = mat("NeighbourHouse", hexc("#D8D2C6"), 0.8)
    M["roof"] = mat("Roof", hexc("#B4532F"), 0.7)
    M["shutter"] = mat("Shutter", hexc("#2E5A86"), 0.6)
    M["plastic"] = mat("FanPlastic", hexc("#E9ECE8"), 0.35)
    M["blade"] = mat("FanBlade", hexc("#8FB7D9"), 0.3)
    M["metal"] = mat("Cage", hexc("#2B2D31"), 0.35, metal=0.8)
    M["wood"] = mat("TableWood", hexc("#7B5136"), 0.45)
    M["tray"] = mat("Tray", hexc("#C9D1D8"), 0.25, metal=0.6)
    M["ice"] = mat("Ice", (0.85, 0.95, 1.0), 0.05, transmission=0.9)
    M["ac"] = mat("ACCase", hexc("#F1F1EE"), 0.35)
    M["acgrille"] = mat("ACGrille", hexc("#D5D7D3"), 0.5)
    M["acback"] = mat("ACBack", hexc("#B8BCC1"), 0.45, metal=0.3)
    M["dark"] = mat("Dark", hexc("#2A2D31"), 0.6)
    M["led"] = mat("LED", hexc("#3FB8F0"), 0.3, emit=(hexc("#3FB8F0"), 4))
    return M


# ------------------------------------------------------------------ build
W_OPEN = (1.10, 1.25)          # window opening (w, h)
SILL_Z = 0.85
WALL_T = 0.20                  # wall from y=0 (room face) to y=0.20 (outside face)


def build_room(M, sash_up=False, with_ac=False):
    w, h = W_OPEN
    x0, x1, z0, z1 = -w / 2, w / 2, SILL_Z, SILL_Z + h
    yc = WALL_T / 2
    # wall around the opening
    box("WallL", (3.0, WALL_T, 3.0), (x0 - 1.5, yc, 1.5), M["wall"])
    box("WallR", (3.0, WALL_T, 3.0), (x1 + 1.5, yc, 1.5), M["wall"])
    box("WallB", (w, WALL_T, z0), (0, yc, z0 / 2), M["wall"])
    box("WallT", (w, WALL_T, 3.0 - z1), (0, yc, (3.0 + z1) / 2), M["wall"])
    # exterior siding skin (thin) on the outside face
    for nm, s, l in (("ExtL", (3.0, 0.02, 3.0), (x0 - 1.5, WALL_T + 0.01, 1.5)), ("ExtR", (3.0, 0.02, 3.0), (x1 + 1.5, WALL_T + 0.01, 1.5)),
                     ("ExtB", (w, 0.02, z0), (0, WALL_T + 0.01, z0 / 2)), ("ExtT", (w, 0.02, 3.0 - z1), (0, WALL_T + 0.01, (3.0 + z1) / 2))):
        box(nm, s, l, M["ext"])
    box("Foundation", (6.0, 0.03, 0.35), (0, WALL_T + 0.025, 0.12), mat("Foundation", hexc("#8C8C88"), 0.9))
    box("Eave", (6.0, 0.5, 0.1), (0, WALL_T + 0.25, 3.0), M["trim"])
    # floor, ceiling, baseboard
    box("Floor", (8, 6, 0.05), (0, -3, -0.025), M["floor"])
    box("Ceiling", (8, 6, 0.05), (0, -3, 2.72), M["ceiling"])
    box("Baseboard", (8, 0.02, 0.12), (0, -0.01, 0.06), M["trim"])
    # interior casing + stool (sill) + exterior sill
    t = 0.08
    box("CasingL", (t, 0.03, h + 2 * t), (x0 - t / 2, -0.015, (z0 + z1) / 2), M["trim"])
    box("CasingR", (t, 0.03, h + 2 * t), (x1 + t / 2, -0.015, (z0 + z1) / 2), M["trim"])
    box("CasingT", (w + 2 * t + 0.002, 0.034, t), (0, -0.017, z1 + t / 2), M["trim"])
    box("Stool", (w + 0.28, 0.16, 0.04), (0, -0.06, z0 - 0.02), M["trim"], bevel=0.008)
    box("Apron", (w + 0.12, 0.03, 0.07), (0, -0.021, z0 - 0.075), M["trim"])
    box("ExtSill", (w + 0.16, 0.14, 0.04), (0, WALL_T + 0.06, z0 - 0.02), M["trim"], bevel=0.006)
    box("ExtCasingL", (0.07, 0.02, h + 0.1), (x0 - 0.035, WALL_T + 0.02, (z0 + z1) / 2), M["trim"])
    box("ExtCasingR", (0.07, 0.02, h + 0.1), (x1 + 0.035, WALL_T + 0.02, (z0 + z1) / 2), M["trim"])
    box("ExtCasingT", (w + 0.142, 0.024, 0.07), (0, WALL_T + 0.022, z1 + 0.035), M["trim"])
    # jambs (inside the opening)
    for nm, l in (("JambL", (x0 + 0.01, yc, (z0 + z1) / 2 - 0.01)), ("JambR", (x1 - 0.01, yc, (z0 + z1) / 2 - 0.01))):
        box(nm, (0.02, WALL_T - 0.002, h - 0.02), l, M["trim"])
    box("JambT", (w, WALL_T - 0.002, 0.02), (0, yc, z1 - 0.01), M["trim"])
    # double-hung sashes: upper fixed (outer track), lower slides up (inner track)
    half = h / 2

    def sash(name, zc, y):
        fr = 0.05
        box(name + "_top", (w - 0.04 - 2 * fr, 0.04, fr), (0, y, zc + half / 2 - fr / 2), M["trim"])
        box(name + "_bot", (w - 0.04 - 2 * fr, 0.04, fr), (0, y, zc - half / 2 + fr / 2), M["trim"])
        box(name + "_l", (fr, 0.04, half), (x0 + 0.02 + fr / 2, y, zc), M["trim"])
        box(name + "_r", (fr, 0.04, half), (x1 - 0.02 - fr / 2, y, zc), M["trim"])
        box(name + "_glass", (w - 0.04 - 2 * fr, 0.006, half - 2 * fr), (0, y, zc), M["glass"])

    sash("Upper", z1 - half / 2 - 0.01, 0.13)
    if with_ac:
        lower_z = z0 + 0.42 + half / 2           # lowered onto the top of the AC
    elif sash_up:
        lower_z = z1 - half / 2 - 0.03
    else:
        lower_z = z0 + half / 2 + 0.01
    sash("Lower", lower_z, 0.07)
    return (x0, x1, z0, z1)


def build_outside(M):
    box("Lawn", (60, 60, 0.05), (0, 30, -0.03), M["grass"])
    for i in range(-30, 31):                                   # fence planks
        box(f"Fence{i}", (0.16, 0.04, 1.8), (i * 0.18, 13.0, 0.9), M["fence"])
    box("FenceRail", (12, 0.05, 0.08), (0, 12.97, 1.4), M["fence"])
    # neighbour's house (simple, original)
    box("NHouse", (10, 6, 4.2), (-2, 22, 2.1), M["house"])
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=7.3, radius2=0, depth=2.6, location=(-2, 22, 5.5), rotation=(0, 0, math.radians(45)))
    r = bpy.context.active_object; r.name = "NRoof"; r.scale = (1.0, 0.62, 1); r.data.materials.append(M["roof"])
    for k, x in enumerate((-5.5, -3, 0.5, 3)):
        box(f"NWin{k}", (1.0, 0.05, 1.2), (x, 18.98, 2.6), M["glass"])
        box(f"NWinF{k}", (1.15, 0.04, 1.35), (x, 18.99, 2.6), M["trim"])
        box(f"NShL{k}", (0.3, 0.04, 1.3), (x - 0.75, 18.98, 2.6), M["shutter"])
        box(f"NShR{k}", (0.3, 0.04, 1.3), (x + 0.75, 18.98, 2.6), M["shutter"])
    # trees + shrubs
    for k, (x, y, s) in enumerate(((3.5, 9.0, 1.0), (-4.0, 15.0, 1.3), (6.5, 16.0, 1.1))):
        cyl(f"Trunk{k}", 0.18 * s, 3.2 * s, (x, y, 1.6 * s), M["trunk"])
        for j, (dx, dy, dz, rr) in enumerate(((0, 0, 3.6, 1.5), (0.9, 0.2, 3.1, 1.1), (-0.9, -0.1, 3.2, 1.1), (0.2, 0.5, 4.3, 1.0))):
            sphere(f"Leaf{k}_{j}", rr * s, (x + dx * s, y + dy * s, dz * s), M["leaf"])
    for k in range(7):
        sphere(f"Shrub{k}", 0.55, (-4 + k * 1.4, 12.4, 0.35), M["leaf"], scale=(1, 0.8, 0.8))


def build_fan(M, loc=(0.25, -0.75, 0.0), on_table=True):
    x, y, z = loc
    if on_table:
        box("TableTop", (0.75, 0.5, 0.04), (x - 0.05, y, 0.72), M["wood"], bevel=0.01)
        for dx in (-0.37, 0.27):
            for dy in (-0.2, 0.2):
                box(f"Leg{dx}{dy}", (0.04, 0.04, 0.7), (x - 0.05 + dx + 0.05, y + dy, 0.35), M["wood"])
        z = 0.74
    cyl("FanBase", 0.11, 0.03, (x, y, z + 0.015), M["plastic"])
    cyl("FanStem", 0.018, 0.28, (x, y, z + 0.16), M["plastic"])
    hz = z + 0.36
    cyl("FanMotor", 0.06, 0.12, (x, y - 0.06 + 0.12, hz), M["plastic"], rot=(math.radians(90), 0, 0))
    # cage + blades facing the camera (-y)
    torus("CageRim", 0.17, 0.006, (x, y - 0.02, hz), M["metal"], rot=(math.radians(90), 0, 0))
    torus("CageMid", 0.09, 0.004, (x, y - 0.035, hz), M["metal"], rot=(math.radians(90), 0, 0))
    for k in range(8):
        a = k * math.pi / 4
        bpy.ops.mesh.primitive_cylinder_add(radius=0.003, depth=0.17, location=(x + math.cos(a) * 0.085, y - 0.035, hz + math.sin(a) * 0.085), rotation=(0, math.pi / 2 - a, 0))
        bpy.context.active_object.data.materials.append(M["metal"])
    cyl("FanHub", 0.03, 0.03, (x, y - 0.04, hz), M["plastic"], rot=(math.radians(90), 0, 0))
    for k in range(3):
        a = k * 2 * math.pi / 3 + 0.4
        sphere(f"Blade{k}", 0.075, (x + math.cos(a) * 0.08, y - 0.01, hz + math.sin(a) * 0.08), M["blade"], scale=(1.0, 0.12, 0.55))
        bpy.context.active_object.rotation_euler = (0, -a, 0)


def build_tray(M, loc=(-0.12, -0.78, 0.74)):
    x, y, z = loc
    box("TrayBase", (0.32, 0.22, 0.01), (x, y, z + 0.005), M["tray"])
    for nm, s, l in (("TrayF", (0.32, 0.008, 0.035), (x, y - 0.11, z + 0.02)), ("TrayB", (0.32, 0.008, 0.035), (x, y + 0.11, z + 0.02)),
                     ("TrayL", (0.008, 0.22, 0.035), (x - 0.16, y, z + 0.02)), ("TrayR", (0.008, 0.22, 0.035), (x + 0.16, y, z + 0.02))):
        box(nm, s, l, M["tray"])
    for i in range(4):
        for j in range(2):
            box(f"Ice{i}{j}", (0.055, 0.055, 0.05), (x - 0.105 + i * 0.07, y - 0.04 + j * 0.08, z + 0.035), M["ice"], bevel=0.01)


def build_window_ac(M, z0):
    """ONE box straddling the window: front (room side, y<0) and back (outside, y>WALL_T)."""
    w, hgt, d = 0.66, 0.42, 0.62
    yc = WALL_T / 2 - 0.02
    box("AC_Case", (w, d, hgt), (0, yc, z0 + hgt / 2), M["ac"], bevel=0.015)
    # front grille + louvres (room side)
    yf = yc - d / 2 - 0.004
    box("AC_Front", (w - 0.04, 0.01, hgt - 0.05), (0, yf, z0 + hgt / 2), M["acgrille"], bevel=0.006)
    for k in range(6):
        box(f"AC_Louvre{k}", (w - 0.2, 0.02, 0.012), (-0.05, yf - 0.008, z0 + hgt - 0.07 - k * 0.028), M["ac"])
    for k in range(10):
        box(f"AC_Slot{k}", (0.012, 0.012, 0.13), (-0.25 + k * 0.045, yf - 0.006, z0 + 0.1), M["acback"])
    box("AC_Panel", (0.12, 0.012, 0.17), (0.24, yf - 0.006, z0 + hgt - 0.13), M["ac"])
    sphere("AC_LED", 0.008, (0.24, yf - 0.014, z0 + hgt - 0.08), M["led"])
    # back (outside): fins + louvres
    yb = yc + d / 2 + 0.004
    for k in range(22):
        box(f"AC_Fin{k}", (0.006, 0.012, hgt - 0.06), (-w / 2 + 0.05 + k * 0.026, yb, z0 + hgt / 2), M["acback"])
    # accordion side panels filling the gaps in the opening
    gap = (W_OPEN[0] - w) / 2
    for s in (-1, 1):
        xc = s * (w / 2 + gap / 2)
        box(f"AC_Accordion{s}", (gap - 0.01, 0.02, hgt - 0.02), (xc, 0.07, z0 + hgt / 2), M["acgrille"])
        for k in range(5):
            box(f"AC_Pleat{s}{k}", (0.004, 0.024, hgt - 0.03), (xc - gap / 2 + 0.03 + k * (gap - 0.04) / 4, 0.07, z0 + hgt / 2), M["trim"])


def lights_world():
    sc = bpy.context.scene
    w = bpy.data.worlds.new("Sky"); sc.world = w; w.use_nodes = True
    nt = w.node_tree
    sky = nt.nodes.new("ShaderNodeTexSky")
    try:
        sky.sky_type = "NISHITA"
        sky.sun_elevation = math.radians(38); sky.sun_rotation = math.radians(200)
    except Exception:
        pass
    nt.links.new(sky.outputs[0], nt.nodes["Background"].inputs[0])
    nt.nodes["Background"].inputs["Strength"].default_value = 0.35
    bpy.ops.object.light_add(type="SUN", location=(4, 10, 8))
    sun = bpy.context.active_object; sun.data.energy = 3.2; sun.data.angle = math.radians(3)
    sun.data.color = hexc("#FFE9C8")
    sun.rotation_euler = (math.radians(55), 0, math.radians(160))
    # soft interior fill (warm) so the room isn't a cave
    bpy.ops.object.light_add(type="AREA", location=(0, -3.2, 2.4))
    a = bpy.context.active_object; a.data.energy = 220; a.data.size = 3.0; a.data.color = hexc("#FFE8CF")
    a.rotation_euler = (math.radians(60), 0, 0)


def camera(loc, look, lens):
    cd = bpy.data.cameras.new("Cam"); cam = bpy.data.objects.new("Cam", cd)
    bpy.context.scene.collection.objects.link(cam); bpy.context.scene.camera = cam
    cam.location = loc
    d = Vector(look) - Vector(loc)
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    cd.lens = lens; cd.sensor_fit = "VERTICAL"; cd.sensor_height = 24
    return cam


def main():
    reset()
    M = materials()
    with_ac = SHOT in ("room_ac", "outside_ac")
    build_room(M, sash_up=(SHOT == "room_open"), with_ac=with_ac)
    build_outside(M)
    if SHOT in ("room_closed", "room_open"):
        build_fan(M)
    if with_ac:
        build_window_ac(M, SILL_Z)
    lights_world()
    if SHOT.startswith("room"):
        camera((0, -3.6, 1.35), (0, 0, 1.3), 24)
    else:
        camera((1.7, 2.6, 0.75), (-0.2, 0.25, 1.25), 22)
        bpy.context.scene.view_settings.exposure = -1.3
    out = ROOT / "renders" / f"{SHOT}.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    bpy.context.scene.render.filepath = str(out)
    bpy.ops.render.render(write_still=True)
    print("rendered", out)


if __name__ == "__main__":
    main()
