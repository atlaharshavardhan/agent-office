"""V2 character scenes (Blender). Reuses the existing GPU package, racks, materials and the new
MakeHuman-based characters. All character scenes are illustrative visualizations, not real events.

  v2_stage      scene 3 A+B (135 f): stylized Jensen character presents the GPU on an illustrative keynote
                stage; low-angle dolly (f1-90), then a push into the GPU in his hand (f91-135).
  v2_meeting    scene 4 (105 f): four fictional executives around a table, GPU-infrastructure hologram above.
  v2_build      scene 5 reason 1 (75 f): exterior data-centre construction site, elevated drifting camera.
  v2_trading    scene 5 reason 3 (110 f): fictional investors watching falling indicators on large screens.
  v2_overlook   scene 7 (170 f): the character from behind overlooking a vast AI data hall, camera pulls back.

Usage: .venv/bin/python scripts/build_v2.py v2_stage ...   (writes blender/<name>.blend)
"""
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy  # noqa: E402
import bmesh  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Vector, Matrix  # noqa: E402

import common as C  # noqa: E402
import build_scene as S  # noqa: E402
import build_character as BC  # noqa: E402
from build_shots import gpu_asset, gpu_instance, key_time  # noqa: E402
from build_datacenter import emissive, RACK  # noqa: E402

rnd = random.Random(7)


def ease(x):
    x = min(1, max(0, x)); return x * x * (3 - 2 * x)


def setup(samples=20):
    sc = C.reset_scene(); C._MATS.clear()
    S.render_settings(samples=samples)
    return sc


def camera(lens=35, fstop=4.0):
    cam, tgt = S.build_camera()
    cam.data.lens = lens
    cam.data.dof.aperture_fstop = fstop
    return cam, tgt


def key_cam(cam, tgt, f, pos, look):
    cam.location = pos; tgt.location = look
    cam.keyframe_insert("location", frame=f); tgt.keyframe_insert("location", frame=f)


def hold_gpu(arm, coll, scale=1.0):
    """GPU instance resting on the right palm (follows the wrist bone)."""
    bpy.context.view_layer.update()
    pb = arm.pose.bones["wrist.R"]
    knuckle = arm.pose.bones["finger3-1.R"].head if "finger3-1.R" in arm.pose.bones else pb.tail
    hand = arm.matrix_world @ ((pb.tail + knuckle) / 2)
    # held upright in front of the palm, chip face toward the audience (-Y)
    g = gpu_instance(coll, hand + Vector((0, -5.5, 6.5)), (math.radians(90), 0, 0), scale, "GPU_inHand")
    con = g.constraints.new("CHILD_OF"); con.target = arm; con.subtarget = "wrist.R"
    bpy.context.view_layer.update()
    con.inverse_matrix = (arm.matrix_world @ pb.matrix).inverted()
    return g


def text_obj(txt, size, loc, mat, rot=(math.pi / 2, 0, 0), extrude=0.0):
    cu = bpy.data.curves.new("txt", "FONT"); cu.body = txt
    cu.font = bpy.data.fonts.load(str(C.ROOT / "assets/fonts/InterDisplay-Bold.otf"), check_existing=True)
    cu.size = size; cu.align_x = "CENTER"; cu.align_y = "CENTER"; cu.extrude = extrude
    ob = bpy.data.objects.new("Text_" + txt[:10], cu); ob.data.materials.append(mat)
    ob.location = loc; ob.rotation_euler = rot; C.link(ob)
    return ob


def image_mat(name, arr, strength=3.0):
    """Emissive screen material from a numpy RGB array (H, W, 3) in 0..1."""
    h, w, _ = arr.shape
    img = bpy.data.images.new(name, w, h, alpha=False)
    px = np.ones((h, w, 4), dtype=np.float32); px[..., :3] = arr[::-1]
    img.pixels.foreach_set(px.ravel())
    img.pack()
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = img
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ"); comb = nt.nodes.new("ShaderNodeCombineXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0]); nt.links.new(sep.outputs[0], comb.inputs[0]); nt.links.new(sep.outputs[2], comb.inputs[1])
    nt.links.new(comb.outputs[0], tex.inputs["Vector"])
    nt.links.new(tex.outputs["Color"], p.inputs["Emission Color"])
    p.inputs["Emission Strength"].default_value = strength
    p.inputs["Base Color"].default_value = (0.01, 0.01, 0.01, 1)
    p.inputs["Roughness"].default_value = 0.15
    return m


def chart_image(w=640, h=360, seed=0, red=True):
    """Falling market chart drawn with numpy (for the trading-floor screens)."""
    r = np.random.default_rng(seed)
    img = np.zeros((h, w, 3), dtype=np.float32); img[:] = (0.02, 0.025, 0.03)
    for gy in range(40, h, 50): img[gy, :] = (0.08, 0.09, 0.1)
    for gx in range(40, w, 80): img[:, gx] = (0.06, 0.07, 0.08)
    n = w - 60
    y = np.cumsum(r.normal(0.0, 1.0, n)) + np.linspace(0, 1, n) * (h * 0.5 if red else -h * 0.3)
    y = (y - y.min()) / (y.max() - y.min() + 1e-6) * (h - 100) + 50
    col = np.array((0.9, 0.18, 0.2)) if red else np.array((0.46, 0.73, 0.0))
    for x in range(n):
        yy = int(y[x]); x0 = 30 + x
        img[yy - 2:yy + 3, x0] = col
        img[yy + 3:h - 30, x0] = img[yy + 3:h - 30, x0] * 0.6 + col * 0.12
    return img


# ------------------------------------------------------------------ scene 3: keynote stage
def v2_stage():
    sc = setup(20)
    coll = gpu_asset()
    floor, _ = C.principled("StageFloor", "#07080A", rough=0.18, coat=0.6)
    C.box("Floor", (6000, 6000, 1), (0, 0, -0.5), floor)
    disc_m, _ = C.principled("StageDisc", "#101215", metallic=0.6, rough=0.3)
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=520, depth=24, location=(0, 120, 12))
    disc = bpy.context.active_object; disc.data.materials.append(disc_m)
    edge = emissive("StageEdge", C.NV_GREEN, 6)
    bpy.ops.mesh.primitive_torus_add(major_radius=521, minor_radius=1.6, location=(0, 120, 23.5))
    bpy.context.active_object.data.materials.append(edge)
    # LED wall: dark green grid + wordmark
    wall = bpy.data.materials.new("LEDWall"); wall.use_nodes = True
    nt = wall.node_tree; p = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord"); br = nt.nodes.new("ShaderNodeTexBrick")
    br.inputs["Scale"].default_value = 18; br.inputs["Mortar Size"].default_value = 0.03
    br.inputs["Color1"].default_value = (0.0006, 0.0025, 0.0, 1); br.inputs["Color2"].default_value = (0.0004, 0.0018, 0.0, 1)
    br.inputs["Mortar"].default_value = (0.006, 0.03, 0.0, 1)
    nt.links.new(tc.outputs["Generated"], br.inputs["Vector"]); nt.links.new(br.outputs["Color"], p.inputs["Emission Color"])
    p.inputs["Emission Strength"].default_value = 1.0; p.inputs["Base Color"].default_value = (0, 0, 0, 1)
    C.box("LEDWall", (2200, 4, 900), (0, 900, 450), wall)
    text_obj("NVIDIA", 300, (0, 896, 560), emissive("Wordmark", "#EEF6E4", 5))
    # character
    arm, objs = BC.make_character("jensen", loc=(0, 0, 24))
    BC.set_pose(arm, BC.POSES["present"])
    BC.idle(arm, 1, 135, BC.POSES["present"], amp=0.8)
    hold_gpu(arm, coll, 0.95)
    # lights: warm key spot, cool fill, green rims, top
    S.area_light("Key", (-180, -380, 420), (0, 0, 150), 120, 4.5e5, "#FFE9D2", size_y=120)
    S.area_light("FaceKey", (-60, -200, 200), (0, 0, 165), 60, 3.5e4, "#FFF2E4", size_y=60)
    S.area_light("Fill", (260, -300, 200), (0, 0, 140), 200, 4e4, "#CFE0FF", size_y=200)
    S.area_light("RimL", (-220, 300, 260), (0, 0, 160), 60, 1.2e5, C.NV_GREEN, size_y=200)
    S.area_light("RimR", (220, 300, 260), (0, 0, 160), 60, 1.0e5, C.NV_GREEN, size_y=200)
    S.area_light("HandKey", (40, -120, 200), (0, -30, 125), 40, 1.2e4, "#FFFFFF", size_y=40)
    S.build_world().inputs["Strength"].default_value = 0.03
    cam, tgt = camera(32, 3.2)
    for f in range(1, 136):
        if f <= 90:                                  # low-angle dolly in + slight arc
            t = ease((f - 1) / 89)
            pos = Vector((-90 + 60 * t, -560 + 230 * t, 55 + 20 * t)); look = Vector((0, 0, 140 - 10 * t))
        else:                                        # push into the GPU in his hand
            t = ease((f - 91) / 44)
            bpy.context.scene.frame_set(f)
            g = bpy.data.objects["GPU_inHand"].matrix_world.translation.copy()
            p0, l0 = Vector((-30, -330, 75)), Vector((0, 0, 130))
            pos = p0.lerp(g + Vector((0, -20, 1.5)), t); look = l0.lerp(g, t)
        key_cam(cam, tgt, f, pos, look)
    cam.data.lens = 32
    sc.frame_end = 135
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "blender/v2_stage.blend"))


# ------------------------------------------------------------------ scene 4: executive meeting + hologram
def v2_meeting():
    sc = setup(20)
    coll = gpu_asset()
    carpet, _ = C.principled("Carpet", "#15171B", rough=0.9)
    C.box("Floor", (3000, 3000, 1), (0, 0, -0.5), carpet)
    wood, _ = C.principled("Walnut", "#2B1C13", rough=0.2, coat=0.8)
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=150, depth=5, location=(0, 0, 74))
    tb = bpy.context.active_object; tb.scale = (1.5, 1, 1); tb.data.materials.append(wood)
    base_m, _ = C.principled("TableBase", "#0E0F11", metallic=0.8, rough=0.3)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=40, depth=70, location=(0, 0, 36))
    bpy.context.active_object.data.materials.append(base_m)
    # city glass wall behind
    city = emissive("City", "#FFD8A6", 2.5)
    bm = bmesh.new()
    for _ in range(1400):
        C.add_box(bm, (rnd.uniform(4, 9), 1, rnd.uniform(5, 9)), (rnd.uniform(-1500, 1500), 899, rnd.uniform(-100, 520)))
    C.link(C.mesh_obj("CityLights", bm, city))
    sky = bpy.data.materials.new("DuskSky"); sky.use_nodes = True
    sp = sky.node_tree.nodes["Principled BSDF"]; sp.inputs["Base Color"].default_value = (0, 0, 0, 1)
    sp.inputs["Emission Color"].default_value = C.hex_rgba("#2A3550"); sp.inputs["Emission Strength"].default_value = 1.0
    C.box("Sky", (4000, 2, 2000), (0, 920, 500), sky)
    tower, _ = C.principled("Towers", "#07080A", rough=0.6)
    for _ in range(40):
        w, h = rnd.uniform(80, 220), rnd.uniform(300, 900)
        C.box("Tower", (w, 10, h), (rnd.uniform(-1500, 1500), 905, h / 2 - 150), tower)
    glass, _ = C.principled("WinFrame", "#0B0C0E", metallic=0.8, rough=0.3)
    for x in range(-900, 901, 300):
        C.box(f"Mullion{x}", (8, 8, 600), (x, 880, 300), glass)
    wallw, _ = C.principled("WalnutWall", "#3A2A1E", rough=0.5)
    for sx in (-1, 1):
        C.box(f"SideWall{sx}", (10, 1800, 600), (sx * 700, 0, 300), wallw)
    # hologram: miniature GPU racks on a glowing grid + the GPU itself
    holo = emissive("Holo", C.NV_GREEN, 3.0)
    bm = bmesh.new()
    for ix in range(-5, 6):
        for iy in range(-3, 4):
            if abs(ix) < 2 and abs(iy) < 2:
                continue
            C.add_box(bm, (6, 4, 4 + ((ix * 7 + iy * 3) % 5) * 2.5), (ix * 10, iy * 9, 100))
    hr = C.mesh_obj("HoloRacks", bm, holo); C.link(hr)
    w = hr.modifiers.new("Wire", "WIREFRAME"); w.thickness = 0.35; w.use_replace = False
    g = gpu_instance(coll, (0, 0, 104), (0, 0, 0), 1.2, "HoloGPU")
    for f, rz in ((1, 0), (105, math.radians(40))):
        g.rotation_euler.z = rz; g.keyframe_insert("rotation_euler", index=2, frame=f)
    bpy.ops.mesh.primitive_circle_add(vertices=64, radius=62, location=(0, 0, 96))
    ring = bpy.context.active_object
    ring.modifiers.new("W", "WIREFRAME").thickness = 0.4; ring.data.materials.append(holo)
    # four fictional executives, seated
    seats = [("exec_a", (-150, -120), 25), ("exec_b", (150, -120), -25), ("exec_c", (-160, 120), 155), ("investor_b", (160, 120), -155)]
    chair_m, _ = C.principled("ChairLeather", "#0D0D0F", rough=0.45, coat=0.3)
    for k, (p, (x, y), rot) in enumerate(seats):
        arm, objs = BC.make_character(p, loc=(0, 0, 0))
        BC.set_pose(arm, BC.POSES["sit"])
        extra = [("aim", "lowerarm01.L", (0.4, -1, 0.5)), ("aim", "lowerarm02.L", (0.4, -1, 0.5))] if k == 1 else ()
        BC.idle(arm, 1, 105, BC.POSES["sit"], amp=0.7, seed=k * 3, extra=extra)
        arm.location = (x, y, -42); arm.rotation_euler.z = math.radians(rot)
        d = Vector((x, y, 0)).normalized()
        C.box(f"Seat{k}", (52, 50, 9), (x + d.x * 12, y + d.y * 12, 46), chair_m, 3, 3)
        back = C.box(f"Back{k}", (52, 9, 62), (x + d.x * 40, y + d.y * 40, 86), chair_m, 3, 3)
        back.rotation_euler.z = math.radians(rot)
    S.area_light("Pendant", (0, 0, 300), (0, 0, 74), 240, 1.4e6, "#FFE8CF", size_y=120)
    S.area_light("FaceKeyM", (-300, -350, 260), (0, 0, 120), 200, 4e5, "#FFF1E2", size_y=200)
    S.area_light("HoloGlow", (0, 0, 150), (0, 0, 74), 60, 6e3, C.NV_GREEN, size_y=60)
    S.area_light("Rim", (0, 700, 260), (0, 0, 120), 400, 6e4, "#BFD6FF", size_y=80)
    S.area_light("FillFront", (0, -600, 180), (0, 0, 110), 400, 9.0e5, "#FFFFFF", size_y=200)
    wd = S.build_world(); wd.inputs["Color"].default_value = (0.22, 0.24, 0.28, 1); wd.inputs["Strength"].default_value = 0.35
    cam, tgt = camera(30, 2.2)
    for f in range(1, 106):
        t = ease((f - 1) / 104)
        a = math.radians(-118 + 36 * t)
        r = 360 - 50 * t
        key_cam(cam, tgt, f, Vector((math.cos(a) * r, math.sin(a) * r, 150 - 15 * t)), Vector((0, 0, 104 + 4 * t)))
    sc.frame_end = 105
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "blender/v2_meeting.blend"))


# ------------------------------------------------------------------ scene 5 reason 1: construction site
def v2_build():
    sc = setup(16)
    sc.unit_settings.scale_length = 0.01
    dirt, pd = C.principled("Dirt", "#5A4A3A", rough=0.95)
    C.micro_roughness(dirt, pd, 0.95, 0.03, 0.4, 0.4)
    C.box("Ground", (40000, 40000, 2), (0, 0, -1), dirt)
    road, _ = C.principled("Asphalt", "#26272A", rough=0.85)
    C.box("Road", (900, 40000, 3), (-2600, 0, 0), road)
    wallm, pw = C.principled("Cladding", "#C8CDD3", metallic=0.6, rough=0.4)
    b = C.NB(wallm)
    tc = b.node("ShaderNodeTexCoord"); wv = b.node("ShaderNodeTexWave", in_Scale=0.08)
    b.link(tc.outputs["Object"], wv.inputs["Vector"]); bp = b.node("ShaderNodeBump", in_Strength=0.4)
    b.link(wv.outputs["Fac"], bp.inputs["Height"]); b.link(bp.outputs["Normal"], pw.inputs["Normal"])
    roof, _ = C.principled("Roof", "#8E949B", metallic=0.4, rough=0.5)
    unit, _ = C.principled("CoolingUnit", "#B9BEC4", metallic=0.7, rough=0.35)
    fan, _ = C.principled("Fan", "#1A1C1F", rough=0.5)
    frame_m, _ = C.principled("Steel", "#7A7F86", metallic=1, rough=0.4)
    for k, (x, y, done) in enumerate(((-600, 800, 1.0), (1500, 900, 1.0), (500, 3400, 0.45))):
        L, Wd, H = 2600, 1100, 900
        if done == 1.0:
            C.box(f"Hall{k}", (Wd, L, H), (x, y, H / 2), wallm)
            C.box(f"HallRoof{k}", (Wd + 20, L + 20, 20), (x, y, H + 10), roof)
            for i in range(6):
                for j in range(2):
                    ux, uy = x - Wd / 2 + 180 + j * 520, y - L / 2 + 220 + i * 400
                    C.box(f"CU{k}_{i}_{j}", (320, 280, 160), (ux, uy, H + 100), unit, 6, 2)
                    for q in range(2):
                        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=70, depth=8, location=(ux - 80 + q * 160, uy, H + 184))
                        bpy.context.active_object.data.materials.append(fan)
        else:                                       # steel frame under construction
            for i in range(9):
                for j in range(4):
                    C.box(f"Col{k}_{i}_{j}", (30, 30, H), (x - Wd / 2 + j * Wd / 3, y - L / 2 + i * L / 8, H / 2), frame_m)
            for i in range(9):
                C.box(f"Beam{k}_{i}", (Wd, 24, 30), (x, y - L / 2 + i * L / 8, H - 15), frame_m)
            C.box(f"Slab{k}", (Wd, L * 0.55, 30), (x, y - L * 0.22, 15), roof)
    # power: substation + transmission towers
    trafo, _ = C.principled("Transformer", "#5F6670", metallic=0.5, rough=0.5)
    for i in range(4):
        C.box(f"Trafo{i}", (180, 260, 220), (-1900, -400 + i * 340, 110), trafo, 8, 2)
    for i in range(5):
        tx, ty = -3400, -3000 + i * 2200
        for sx in (-1, 1):
            for sy in (-1, 1):
                leg = C.box(f"TwLeg{i}{sx}{sy}", (14, 14, 3200), (tx + sx * 80, ty + sy * 80, 1600), frame_m)
                leg.rotation_euler = (sy * -0.03, sx * 0.03, 0)
        for h in range(1, 7):
            C.box(f"TwBar{i}_{h}", (420 - h * 20, 12, 12), (tx, ty, h * 480), frame_m)
    # tower crane over the unfinished hall
    craneY = emissive("CraneYellow", "#E8B321", 0.0)
    cy, _ = C.principled("Crane", "#E8B321", metallic=0.3, rough=0.5)
    C.box("CraneMast", (90, 90, 2600), (900, 3000, 1300), cy)
    C.box("CraneJib", (3000, 70, 90), (500, 3000, 2600), cy)
    C.box("CraneCounter", (400, 160, 160), (2100, 3000, 2560), trafo)
    # trucks
    truck, _ = C.principled("TruckWhite", "#E9EBEE", rough=0.4, coat=0.5)
    for i, (x, y) in enumerate(((-2600, -800), (-2450, 1500), (200, 2200))):
        C.box(f"Cab{i}", (240, 220, 260), (x, y, 150), truck, 20, 3)
        C.box(f"Bed{i}", (240, 700, 160), (x, y + 480, 110), trafo, 8, 2)
    # site detail: fence, gravel piles, generator containers, pipes, light masts, excavator, distant hills
    fence, _ = C.principled("Fence", "#9AA0A6", metallic=0.8, rough=0.5)
    for i in range(-30, 31):
        C.box(f"FencePost{i}", (6, 6, 200), (-2100, i * 200, 100), fence)
    C.box("FenceTop", (4, 12000, 4), (-2100, 0, 198), fence)
    gravel, pg = C.principled("Gravel", "#8B8178", rough=1.0)
    C.micro_roughness(gravel, pg, 1.0, 0.05, 3.0, 0.8)
    for i, (x, y, r) in enumerate(((-1100, -1900, 260), (-700, -2300, 180), (1900, -1200, 300))):
        bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=r, depth=r * 0.7, location=(x, y, r * 0.35))
        bpy.context.active_object.data.materials.append(gravel)
    cont, _ = C.principled("Container", "#2F5D3A", metallic=0.6, rough=0.45)
    cont2, _ = C.principled("Container2", "#1F3E5A", metallic=0.6, rough=0.45)
    for i in range(6):
        C.box(f"Gen{i}", (600, 240, 260), (-1250, -1400 + i * 330, 130), cont if i % 2 else cont2, 4, 2)
    pipe, _ = C.principled("Pipe", "#C9CDD2", metallic=0.9, rough=0.3)
    for i in range(5):
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=40, depth=1600, location=(400 + i * 95, -1300, 40), rotation=(math.pi / 2, 0, 0))
        bpy.context.active_object.data.materials.append(pipe)
    lamp = emissive("LampHead", "#FFE2B0", 30)
    for i, (x, y) in enumerate(((-1700, -1800), (-1700, 400), (2600, -800), (2600, 2200))):
        C.box(f"Mast{i}", (20, 20, 1500), (x, y, 750), frame_m)
        C.box(f"MastHead{i}", (160, 60, 40), (x, y - 30, 1500), lamp)
    yel, _ = C.principled("Excavator", "#E8A21C", metallic=0.2, rough=0.45)
    C.box("ExcBody", (330, 260, 200), (200, -1900, 180), yel, 10, 2)
    C.box("ExcTrack", (420, 300, 90), (200, -1900, 45), trafo, 10, 2)
    arm1 = C.box("ExcArm", (60, 520, 50), (200, -2180, 330), yel); arm1.rotation_euler.x = math.radians(-35)
    arm2 = C.box("ExcStick", (50, 320, 45), (200, -2500, 260), yel); arm2.rotation_euler.x = math.radians(50)
    hill, _ = C.principled("Hills", "#4C5A63", rough=1.0)
    for i in range(14):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=rnd.uniform(3000, 6000), location=(rnd.uniform(-14000, 14000), 16000 + rnd.uniform(0, 4000), -1800))
        o = bpy.context.active_object; o.scale.z = 0.35; o.data.materials.append(hill)
    # workers (hi-vis), near the foreground
    BC.OUTFITS["hivis"] = dict(jacket=None, shirt="#F26B1D", trousers="#2A3240", shoes="#2A1E14", tie=None)
    for k, (x, y) in enumerate(((-560, -2050), (-440, -2110), (-250, -2000))):
        BC.PRESETS[f"worker{k}"] = dict(race=["caucasian", "african", "asian"][k], male=1, age=0.3, wt="averageweight",
                                        skin=["#E3B9A0", "#6E4A35", "#D2A584"][k], outfit="hivis", hair=("buzz", "#2A2018"), glasses=False)
        arm, _ = BC.make_character(f"worker{k}", loc=(x, y, 0))
        BC.set_pose(arm, BC.POSES["point" if k == 1 else "stand"]); arm.scale = (1, 1, 1)
        hat, _ = C.principled("Helmet", "#F3F3F0", rough=0.3, coat=0.8)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=13, location=(x, y + 1, 178))
        h = bpy.context.active_object; h.scale = (1, 1.1, 0.7); h.data.materials.append(hat)
    sun = bpy.data.lights.new("Sun", "SUN"); sun.energy = 4.0; sun.angle = math.radians(2); sun.color = (1.0, 0.78, 0.55)
    so = bpy.data.objects.new("Sun", sun); so.rotation_euler = (math.radians(68), 0, math.radians(-40)); C.link(so)
    w = S.build_world(); w.inputs["Color"].default_value = (0.42, 0.5, 0.66, 1); w.inputs["Strength"].default_value = 0.9
    cam, tgt = camera(28, 11)
    cam.data.clip_end = 100000; cam.data.dof.use_dof = False
    for f in range(1, 76):
        t = ease((f - 1) / 74)
        key_cam(cam, tgt, f, Vector((-1500 + 400 * t, -3900 + 300 * t, 1250 - 100 * t)), Vector((100, 400, 350)))
    sc.frame_end = 75
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "blender/v2_build.blend"))


# ------------------------------------------------------------------ scene 5 reason 3: trading floor
def v2_trading():
    sc = setup(20)
    floor, _ = C.principled("OfficeFloor", "#1A1C20", rough=0.35, coat=0.3)
    C.box("Floor", (4000, 4000, 1), (0, 0, -0.5), floor)
    C.box("BackWall", (2400, 10, 700), (0, 520, 350), C.principled("Wall", "#121418", rough=0.6)[0])
    for k, (x, red) in enumerate(((-440, True), (0, True), (440, True))):
        m = image_mat(f"Screen{k}", chart_image(640, 360, seed=k + 3, red=red), 2.6)
        C.box(f"Screen{k}", (420, 4, 236), (x, 510, 330), m)
        C.box(f"Bezel{k}", (432, 6, 248), (x, 514, 330), C.principled("Bezel", "#050506", metallic=0.5, rough=0.3)[0])
    # ticker band
    tick = np.zeros((48, 1600, 3), dtype=np.float32); tick[:] = (0.25, 0.02, 0.03)
    C.box("Ticker", (1320, 4, 30), (0, 510, 185), image_mat("Ticker", tick, 2.0))
    text_obj("MARKETS ▼  CHIP STOCKS  ▼  NVDA  ▼", 18, (0, 505, 185), emissive("TickerTxt", "#FFE3E3", 6))
    desk, _ = C.principled("Desk", "#202328", metallic=0.3, rough=0.4)
    for i in range(3):
        C.box(f"Desk{i}", (300, 90, 6), (-400 + i * 400, 120, 74), desk, 2, 2)
        for j in range(2):
            mm = image_mat(f"Mon{i}{j}", chart_image(320, 180, seed=10 + i * 2 + j), 2.0)
            mon = C.box(f"Mon{i}{j}", (70, 3, 40), (-440 + i * 400 + j * 80, 150, 110), mm)
    poses = (("investor_a", "chin", (-260, -40)), ("investor_c", "stand", (60, -10)), ("investor_b", "point", (330, -60)))
    for k, (p, pose, (x, y)) in enumerate(poses):
        arm, _ = BC.make_character(p, loc=(x, y, 0))
        arm.rotation_euler.z = math.radians(180 + (k - 1) * 12)          # facing the screens (+Y)
        BC.set_pose(arm, BC.POSES[pose])
        BC.idle(arm, 1, 110, BC.POSES[pose], amp=0.5, seed=k * 5)
    S.area_light("Ceiling", (0, 0, 420), (0, 0, 0), 1200, 2.2e6, "#E6EEFF", size_y=600)
    S.area_light("FaceFillT", (0, 380, 180), (0, 0, 150), 900, 3e5, "#FFE9E9", size_y=150)
    S.area_light("ScreenSpill", (0, 420, 250), (0, 0, 140), 1200, 5e4, "#FF6060", size_y=200)
    S.area_light("FrontFill", (0, -700, 200), (0, 0, 140), 600, 6e5, "#FFFFFF", size_y=300)
    wd = S.build_world(); wd.inputs["Color"].default_value = (0.2, 0.21, 0.24, 1); wd.inputs["Strength"].default_value = 0.3
    cam, tgt = camera(28, 4.5)
    for f in range(1, 111):
        t = ease((f - 1) / 109)
        key_cam(cam, tgt, f, Vector((-300 + 220 * t, -380 + 30 * t, 160)), Vector((0 + 60 * t, 320, 215)))
    sc.frame_end = 110
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "blender/v2_trading.blend"))


# ------------------------------------------------------------------ scene 7: overlooking the AI data hall
def v2_overlook():
    sc = setup(20)
    rack_b, _ = C.principled("RackBody2", "#0C0D0F", metallic=0.6, rough=0.35)
    led_g = emissive("LEDg", C.NV_GREEN, 40); led_r = emissive("LEDr", C.DEEP_RED, 26)
    # far wall: soft green -> red glow gives depth to the hall
    wm = bpy.data.materials.new("HallWall"); wm.use_nodes = True
    nt = wm.node_tree; pw = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ"); ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = C.hex_rgba(C.NV_GREEN); ramp.color_ramp.elements[1].color = C.hex_rgba(C.DEEP_RED)
    nt.links.new(tc.outputs["Generated"], sep.inputs[0]); nt.links.new(sep.outputs[0], ramp.inputs[0])
    nt.links.new(ramp.outputs[0], pw.inputs["Emission Color"]); pw.inputs["Emission Strength"].default_value = 0.06
    pw.inputs["Base Color"].default_value = (0, 0, 0, 1)
    C.box("HallWall", (5000, 10, 1400), (0, 3100, 0), wm)
    bm_r, bm_g, bm_red = bmesh.new(), bmesh.new(), bmesh.new()
    for row in range(-7, 8):
        for i in range(36):
            x, y = row * 260, 600 + i * 64
            C.add_box(bm_r, (110, 60, 210), (x, y, -400 + 105))
            for u in range(14):
                tgt_bm = bm_g if x < 0 else bm_red
                if (i * 7 + u * 3 + row) % 4 == 0:
                    continue
                C.add_box(tgt_bm, (0.6, 1.2, 1.2), (x - 56, y - 20 + (u % 3) * 18, -400 + 20 + u * 13))
    C.link(C.mesh_obj("HallRacks", bm_r, rack_b)); C.link(C.mesh_obj("HallLEDg", bm_g, led_g)); C.link(C.mesh_obj("HallLEDr", bm_red, led_r))
    hfloor, _ = C.principled("HallFloor", "#0A0B0D", rough=0.15, coat=0.7)
    C.box("HallFloor", (6000, 6000, 1), (0, 1800, -400), hfloor)
    strip = emissive("CeilStrip", "#DDE8FF", 6)
    bm_s = bmesh.new()
    for row in range(-7, 8):
        for i in range(0, 36, 3):
            C.add_box(bm_s, (8, 150, 3), (row * 260 + 130, 600 + i * 64, 420))
    C.link(C.mesh_obj("CeilStrips", bm_s, strip))
    tray, _ = C.principled("CableTray", "#3A3F46", metallic=0.9, rough=0.4)
    for row in range(-7, 8):
        C.box(f"Tray{row}", (40, 2400, 6), (row * 260, 1750, -120), tray)

    # catwalk + railing where the character stands
    steel, _ = C.principled("Catwalk", "#2B2F35", metallic=0.9, rough=0.35)
    C.box("Catwalk", (900, 260, 8), (0, 200, -4), steel)
    for x in range(-440, 441, 110):
        C.box(f"Post{x}", (4, 4, 105), (x, 320, 52), steel)
    C.box("Rail", (900, 5, 5), (0, 320, 105), steel)
    arm, _ = BC.make_character("jensen", loc=(60, 250, 0))
    arm.rotation_euler.z = math.radians(180 + 8)                       # facing the hall (+Y)
    BC.set_pose(arm, BC.POSES["stand"])
    BC.idle(arm, 1, 170, BC.POSES["stand"], amp=0.5)
    S.area_light("GreenSide", (-900, 400, 300), (0, 900, -200), 900, 7.0e6, C.NV_GREEN, size_y=900)
    S.area_light("RedSide", (900, 400, 300), (0, 900, -200), 900, 5.0e6, C.DEEP_RED, size_y=900)
    S.area_light("HallTop", (0, 1500, 600), (0, 1500, -400), 3000, 4e6, "#CFE0FF", size_y=2400)
    S.area_light("CharRim", (0, 900, 300), (60, 250, 120), 200, 5e4, "#E9F2FF", size_y=200)
    S.area_light("HairKey", (60, 330, 330), (60, 250, 170), 60, 2.5e4, "#FFFFFF", size_y=60)
    S.area_light("CharFill", (-200, -300, 260), (60, 250, 120), 200, 1.5e4, "#FFFFFF", size_y=200)
    S.build_world().inputs["Strength"].default_value = 0.03
    cam, tgt = camera(30, 5.6)
    cam.data.clip_end = 20000
    for f in range(1, 171):
        t = ease((f - 1) / 169)
        key_cam(cam, tgt, f, Vector((140 - 60 * t, 70 - 300 * t, 175 + 120 * t)), Vector((20, 1200, -40 + 40 * t)))
    sc.frame_end = 170
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "blender/v2_overlook.blend"))


if __name__ == "__main__":
    jobs = {k: v for k, v in globals().items() if k.startswith("v2_")}
    for nm in (sys.argv[1:] or list(jobs)):
        jobs[nm]()
        print("[built]", nm, flush=True)
