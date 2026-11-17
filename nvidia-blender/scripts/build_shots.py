"""Blender shots for "NVIDIA market collapse" (reuses build_gpu / build_motherboard / build_datacenter).

  shot03  scene 3 (6 s, 180 f): macro on a GPU in an open server tray -> pull out -> fast dolly
          down the AI data-centre corridor (camera A, f1-120) -> macro across a 4-GPU tray with
          rack focus (camera B, f121-180). Data pulses run along the overhead cable trays.
  shot07  scene 7 (5 s, 150 f): orbit around the hero chip on its board, NVIDIA-green key light
          on one side, loss-red on the other.
  still05a  scene 5 reason 1: the corridor with racks switched to red / standby.
  still05c  scene 5 reason 3: an empty boardroom, head chair in a spotlight.
  glb       assets/models/nvidia_ai_gpu.glb for the Three.js scenes.

Usage: .venv/bin/python scripts/build_shots.py shot03|shot07|still05a|still05c|glb|all
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
from build_motherboard import build_board  # noqa: E402
from build_datacenter import build_racks, emissive, RACK  # noqa: E402

GAP = 96.0          # corridor width (cm) used by build_racks
N_RACKS = 22


# ------------------------------------------------------------------ helpers
def gpu_asset():
    """Build the hero package once into a hidden collection and return it for instancing."""
    root, frags = build_gpu(parent_loc=(0, 0, 0))
    for ob, _, _ in frags:
        bpy.data.objects.remove(ob, do_unlink=True)
    coll = bpy.data.collections.new("GPU_Asset")
    bpy.context.scene.collection.children.link(coll)
    stack = [root]
    while stack:
        ob = stack.pop()
        stack.extend(ob.children)
        for c in list(ob.users_collection):
            c.objects.unlink(ob)
        coll.objects.link(ob)
    bpy.context.view_layer.layer_collection.children["GPU_Asset"].exclude = True
    return coll


def gpu_instance(coll, loc, rot=(0, 0, 0), scale=1.0, name="GPU"):
    e = bpy.data.objects.new(name, None)
    e.instance_type = "COLLECTION"
    e.instance_collection = coll
    e.location = loc
    e.rotation_euler = rot
    e.scale = (scale,) * 3
    C.link(e)
    return e


def tube(name, pts, r, mat, seg=10):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = r
    cu.bevel_resolution = 3
    sp = cu.splines.new("POLY")
    sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts):
        p.co = (*q, 1)
    ob = bpy.data.objects.new(name, cu)
    ob.data.materials.append(mat)
    C.link(ob)
    return ob


def dataflow_mat():
    m, p = C.principled("DataFlow", "#050607", rough=0.4)
    b = C.NB(m)
    C.circuit_glow(b, p, pulse_period=40.0, speed=160.0, base_glow=0.05, peak=7.0)
    return m


def key_time(sc, frames):
    for f in range(1, frames + 1):
        sc["fx_time"] = (f - 1) / 30.0
        sc.keyframe_insert('["fx_time"]', frame=f)
    import animate_hook as A
    A.linear(sc)


def ribbons_along_y(bm, u_l, r_l, x, z, y0, y1, n, pitch, rnd, w=0.6):
    """Straight data ribbons along the corridor (u attribute = cm along the run)."""
    for k in range(n):
        xx = x + (k - n / 2) * pitch
        vs = []
        for yy, u in ((y0, 0.0), (y1, y1 - y0)):
            for s in (-1, 1):
                v = bm.verts.new((xx + s * w / 2, yy, z))
                v[u_l] = u
                v[r_l] = rnd.random()
                vs.append(v)
        bm.faces.new((vs[0], vs[1], vs[3], vs[2]))


# ------------------------------------------------------------------ data-centre set
def build_dc_set(red=False):
    C.reset_scene()
    C._MATS.clear()
    build_racks(n=N_RACKS, gap=GAP)
    coll = gpu_asset()
    M = C.mats()
    rnd = random.Random(4)
    steel, _ = C.principled("Tray_Steel", "#9BA1A8", metallic=1.0, rough=0.3, aniso=0.4)
    copper, _ = C.principled("Coldplate_Copper", "#B87333", metallic=1.0, rough=0.22)
    blue, _ = C.principled("Coolant_Blue", "#1F5FA8", rough=0.4, coat=0.6)
    redp, _ = C.principled("Coolant_Red", "#A8323A", rough=0.4, coat=0.6)
    cable, _ = C.principled("Cable_Black", "#0B0C0D", rough=0.55)
    tray_m, _ = C.principled("CableTray", "#2A2E33", metallic=0.9, rough=0.35)

    # open GPU trays pulled out into the corridor (4 GPUs each, 2 under copper cold plates)
    trays = []
    for idx, (side, i, z) in enumerate([(-1, 1, 112), (1, 4, 96), (-1, 8, 128), (1, 12, 104), (-1, 16, 120)]):
        y = 60 + i * (RACK[0] + 2)
        x_front = side * GAP / 2
        cx = x_front - side * 12                      # tray sticks 38 cm out of the rack (camera clears it)
        C.box(f"Tray_{idx}", (52, RACK[0] - 8, 1.2), (cx, y, z), steel, 0.3, 2)
        C.box(f"TrayRail_{idx}a", (52, 1.5, 3), (cx, y - (RACK[0] - 8) / 2, z + 1.5), steel, 0.2, 1)
        C.box(f"TrayRail_{idx}b", (52, 1.5, 3), (cx, y + (RACK[0] - 8) / 2, z + 1.5), steel, 0.2, 1)
        k = 0
        for gx in (-1, 1):
            for gy in (-1, 1):
                pos = (cx + gx * 12.5, y + gy * 13, z + 0.7)
                gpu_instance(coll, pos, (0, 0, math.pi / 2), 1.5, f"GPU_t{idx}_{k}")
                if (gx, gy) == (-1, 1):
                    C.box(f"ColdPlate_{idx}_{k}", (12.5, 16.5, 1.6), (pos[0], pos[1], pos[2] + 0.9), copper, 0.3, 2)
                    tube(f"Pipe_{idx}_{k}", [(pos[0], pos[1] - 3, pos[2] + 1.5), (pos[0] + side * 10, pos[1] - 3, pos[2] + 4),
                                             (x_front + side * 2, pos[1] - 3, pos[2] + 4)], 0.5, blue)
                k += 1
        S.area_light(f"TrayKey_{idx}", (cx - side * 10, y - 25, z + 60), (cx, y, z), 40, 1.6e4, size_y=30)
        trays.append((cx, y, z, side))

    # overhead cable trays + glowing data ribbons + coolant mains
    for side in (-1, 1):
        x = side * (GAP / 2 + 20)
        C.box(f"CableTray_{side}", (30, 1500, 3), (x, 750, 214), tray_m, 0.3, 1)
        for k in range(7):
            tube(f"Cable_{side}_{k}", [(x - 12 + k * 4, 0, 217), (x - 12 + k * 4, 1500, 217)], 1.3, cable)
        tube(f"CoolBlue_{side}", [(side * (GAP / 2 + 52), 0, 238), (side * (GAP / 2 + 52), 1500, 238)], 5, blue)
        tube(f"CoolRed_{side}", [(side * (GAP / 2 + 66), 0, 238), (side * (GAP / 2 + 66), 1500, 238)], 5, redp)
    bm = bmesh.new()
    u_l = bm.verts.layers.float.new("u")
    r_l = bm.verts.layers.float.new("rnd")
    for side in (-1, 1):
        ribbons_along_y(bm, u_l, r_l, side * (GAP / 2 + 20), 220.6, 0, 1500, 6, 4, rnd, 0.7)
    me = bpy.data.meshes.new("DataFlows")
    bm.to_mesh(me)
    bm.free()
    df = bpy.data.objects.new("DataFlows", me)
    me.materials.append(dataflow_mat())
    C.link(df)
    # floor tile grid
    grid_m, _ = C.principled("TileSeam", "#1C1F23", metallic=0.5, rough=0.5)
    bm = bmesh.new()
    for k in range(-3, 4):
        C.add_box(bm, (0.6, 1500, 0.15), (k * 60, 750, 0.08))
    for k in range(0, 26):
        C.add_box(bm, (360, 0.6, 0.15), (0, k * 60, 0.08))
    C.link(C.mesh_obj("FloorGrid", bm, grid_m))

    if red:
        for nm in ("LED_Green", "LED_White"):
            m = bpy.data.materials[nm]
            p = m.node_tree.nodes["Principled BSDF"]
            p.inputs["Emission Color"].default_value = C.hex_rgba(C.DEEP_RED)
            p.inputs["Emission Strength"].default_value = 10 if nm == "LED_Green" else 2
        p = bpy.data.materials["Ceiling_Strip"].node_tree.nodes["Principled BSDF"]
        p.inputs["Emission Strength"].default_value = 0.6
    S.build_world().inputs["Strength"].default_value = 0.02
    return coll, trays


def shot03():
    coll, trays = build_dc_set()
    sc = bpy.context.scene
    S.area_light("Aisle_Fill", (0, 300, 250), (0, 300, 0), 120, 6e4, "#DDE8FF", size_y=600)
    S.area_light("Aisle_Green", (0, 900, 60), (0, 0, 100), 200, 3e4, C.NV_GREEN, size_y=20)
    S.area_light("Tray_Key", (-20, 0, 190), (-25, 62, 112), 50, 1.2e4, size_y=30)
    S.render_settings(samples=24)
    sc.frame_end = 180
    # camera A: macro on tray 0 GPU -> pull out -> dolly down the aisle
    camA, tgtA = S.build_camera()
    camA.name = "CamA"
    cx, y, z, side = trays[0]
    g = Vector((cx + 12.5, y - 13, z + 1.4))     # a bare GPU (no cold plate)
    def ease(x):
        x = min(1, max(0, x)); return x * x * (3 - 2 * x)
    for f in range(1, 121):
        if f <= 40:
            t = ease((f - 1) / 39)
            # start 10 cm off the GPU, rise and swing back to the aisle centre line
            cam = Vector((g.x + 6 * (1 - t) - g.x * t * 0.9, g.y - 14 - 70 * t, g.z + 9 + (150 - g.z) * t))
            tg = g.lerp(Vector((0, 400, 120)), t)
            fs = 2.8 + 2 * t
        else:
            t = ((f - 40) / 80)
            t = t * t * (3 - 2 * t)
            cam = Vector((-4 + 6 * math.sin(t * 2), -10 + 560 * t, 150 - 25 * t))
            tg = cam + Vector((2, 300, -15))
            fs = 4.0
        camA.location = cam
        tgtA.location = tg
        camA.data.dof.aperture_fstop = fs
        camA.keyframe_insert("location", frame=f)
        tgtA.keyframe_insert("location", frame=f)
        camA.data.dof.keyframe_insert("aperture_fstop", frame=f)
    camA.data.lens = 30
    # camera B: macro over tray 3 (4 GPUs), slide + rack focus near->far GPU
    cdB = bpy.data.cameras.new("CamB")
    camB = bpy.data.objects.new("CamB", cdB)
    C.link(camB)
    cdB.lens = 28
    cdB.sensor_width = 36
    cdB.clip_start = 0.5
    cdB.dof.use_dof = True
    cdB.dof.aperture_fstop = 2.0
    cx, y, z, side = trays[3]
    tgB = bpy.data.objects.new("CamB_Target", None)
    C.link(tgB)
    tc = camB.constraints.new("TRACK_TO")
    tc.target = tgB
    tc.track_axis = "TRACK_NEGATIVE_Z"
    tc.up_axis = "UP_Y"
    cdB.dof.focus_object = None
    cdB.dof.aperture_fstop = 3.2
    near, far = Vector((cx - 12.5 * side, y - 13, z + 1.4)), Vector((cx + 12.5 * side, y + 13, z + 1.4))
    for f in range(121, 181):
        t = (f - 121) / 59
        e = t * t * (3 - 2 * t)
        # slow slide along the tray, looking down ~40 deg; focus racks from the near GPU to the far one
        camB.location = Vector((cx - side * 6, y - 50 + 8 * e, z + 44 - 3 * e))
        tgB.location = Vector((cx, y + 2 * e, z + 1.4))
        cdB.dof.focus_distance = (near.lerp(far, min(1, e * 1.3)) - camB.location).length
        camB.keyframe_insert("location", frame=f)
        tgB.keyframe_insert("location", frame=f)
        cdB.dof.keyframe_insert("focus_distance", frame=f)
    m1 = sc.timeline_markers.new("A", frame=1)
    m1.camera = camA
    m2 = sc.timeline_markers.new("B", frame=121)
    m2.camera = camB
    key_time(sc, 180)
    sc.frame_set(1)
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "blender/shot03_datacenter.blend"))


def still05a():
    build_dc_set(red=True)
    sc = bpy.context.scene
    S.area_light("Red_Wash", (0, 500, 240), (0, 500, 0), 120, 2.5e4, C.DEEP_RED, size_y=700)
    cam, tgt = S.build_camera()
    cam.location = (14, -40, 135)
    tgt.location = (-6, 380, 100)
    cam.data.lens = 26
    cam.data.dof.aperture_fstop = 5.6
    S.render_settings(samples=48)
    sc.render.use_motion_blur = False
    sc["fx_glow"] = 0.15
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "blender/still05a_datacenter_red.blend"))


def shot07():
    C.reset_scene()
    C._MATS.clear()
    build_board()
    root, frags = build_gpu(parent_loc=(0, 0, 0.11))
    for ob, _, _ in frags:
        bpy.data.objects.remove(ob, do_unlink=True)
    sc = bpy.context.scene
    sc["fx_glow"] = 0.55
    sc["fx_red"] = -1.0
    S.build_world().inputs["Strength"].default_value = 0.02
    S.area_light("Split_Green", (-24, -8, 7), (0, 0, 0.3), 24, 4.5e4, C.NV_GREEN, size_y=10)
    S.area_light("Split_Red", (24, -8, 7), (0, 0, 0.3), 24, 4.5e4, C.DEEP_RED, size_y=10)
    # coloured reflection cards: the brushed ring and mirror dies pick up green on one side, red on the other
    _, eg = S.card("Card_Green", (-26, 6, 20), (0, 0, 0), 22, 30, 2.0)
    eg.inputs["Color"].default_value = C.hex_rgba(C.NV_GREEN)
    _, er = S.card("Card_Red", (26, 6, 20), (0, 0, 0), 22, 30, 2.0)
    er.inputs["Color"].default_value = C.hex_rgba(C.DEEP_RED)
    S.area_light("Top_Soft", (0, 0, 70), (0, 0, 0), 50, 1.2e4, size_y=40)
    S.card("Card_Back", (0, 38, 40), (0, 0, 0), 60, 22, 0.8)
    cam, tgt = S.build_camera()
    S.render_settings(samples=24)
    sc.frame_end = 165
    for f in range(1, 166):
        t = (f - 1) / 164
        e = t * t * (3 - 2 * t)
        az = math.radians(-118 + 56 * e)          # controlled 56-degree orbit
        el = math.radians(24 + 6 * e)
        dist = 21 - 5 * e
        tg = Vector((0, -0.6, 0.45))
        cam.location = tg + Vector((math.cos(az) * math.cos(el), math.sin(az) * math.cos(el), math.sin(el))) * dist
        tgt.location = tg
        cam.data.shift_y = 0.12                   # keep the top third for "AI BUBBLE OR MARKET PANIC?"
        cam.keyframe_insert("location", frame=f)
        tgt.keyframe_insert("location", frame=f)
    cam.data.dof.aperture_fstop = 5.6
    key_time(sc, 165)
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "blender/shot07_orbit.blend"))


def still05c():
    """Empty boardroom: long table, chairs, head chair empty in a spotlight, night city glass wall."""
    C.reset_scene()
    C._MATS.clear()
    wood, _ = C.principled("Table_Walnut", "#2A1B12", rough=0.22, coat=0.8)
    leather, _ = C.principled("Chair_Leather", "#0D0D0F", rough=0.45, coat=0.3)
    chrome, _ = C.principled("Chrome", "#C9CDD2", metallic=1.0, rough=0.12)
    floor, _ = C.principled("Carpet", "#121316", rough=0.9)
    glass, _ = C.principled("Window_Dark", "#05070A", rough=0.05, metallic=0.0)
    C.box("Floor", (2000, 2000, 1), (0, 0, -0.5), floor)
    C.box("Table", (420, 140, 6), (0, 0, 74), wood, 1.5, 3)
    C.box("TableBase", (300, 40, 70), (0, 0, 36), leather, 1, 2)

    def chair(x, y, rot, pushed=0.0, name="Chair"):
        root = bpy.data.objects.new(name, None)
        root.location = (x, y, 0)
        root.rotation_euler = (0, 0, rot)
        C.link(root)
        C.box(name + "_seat", (52, 50, 9), (0, pushed, 48), leather, 3, 3, root)
        C.box(name + "_back", (52, 9, 62), (0, pushed + 26, 88), leather, 3, 3, root)
        C.box(name + "_post", (5, 5, 40), (0, pushed, 24), chrome, 1, 2, root)
        for k in range(5):
            a = k * 2 * math.pi / 5
            leg = C.box(name + f"_leg{k}", (30, 4, 3), (math.cos(a) * 15, pushed + math.sin(a) * 15, 4), chrome, 1, 2, root)
            leg.rotation_euler = (0, 0, a)
        return root
    for i in range(4):
        x = -150 + i * 100
        chair(x, -105, 0, name=f"ChairS{i}")
        chair(x, 105, math.pi, name=f"ChairN{i}")
    chair(-262, 0, -math.pi / 2, pushed=28, name="HeadChair")      # empty, pushed back
    # glass wall with night-city bokeh dots
    city = emissive("CityLights", "#FFD8A0", 6)
    rnd = random.Random(3)
    bm = bmesh.new()
    for _ in range(420):
        C.add_box(bm, (1, rnd.uniform(1.5, 4), rnd.uniform(1.5, 4)), (-470, rnd.uniform(-450, 450), rnd.uniform(20, 380)))
    C.link(C.mesh_obj("City", bm, city))
    S.build_world().inputs["Strength"].default_value = 0.01
    S.area_light("Spot_HeadChair", (-234, 0, 300), (-234, 0, 40), 40, 4.0e5, size_y=40, spread=40)
    S.area_light("Table_Glow", (0, 0, 260), (0, 0, 74), 300, 3.0e5, "#9FB4D0", size_y=80)
    S.area_light("Rim_Red", (-380, -200, 120), (-234, 0, 80), 60, 1.2e5, C.DEEP_RED, size_y=60)
    cam, tgt = S.build_camera()
    cam.location = (330, 30, 150)
    tgt.location = (-234, 0, 80)
    cam.data.lens = 40
    cam.data.dof.aperture_fstop = 4.0
    S.render_settings(samples=48)
    bpy.context.scene.render.use_motion_blur = False
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "blender/still05c_boardroom.blend"))


def glb():
    """Export the hero package (no BGA balls / caps for weight) for the Three.js scenes."""
    C.reset_scene()
    C._MATS.clear()
    root, frags = build_gpu(parent_loc=(0, 0, 0))
    for ob, _, _ in frags:
        bpy.data.objects.remove(ob, do_unlink=True)
    for nm in ("BGA_Balls", "Package_Caps"):
        ob = bpy.data.objects.get(nm)
        if ob:
            bpy.data.objects.remove(ob, do_unlink=True)
    for ob in list(bpy.data.objects):
        if ob.type == "FONT":
            bpy.context.view_layer.objects.active = ob
            ob.select_set(True)
    bpy.ops.object.convert(target="MESH")
    bpy.ops.export_scene.gltf(filepath=str(C.ROOT / "assets/models/nvidia_ai_gpu.glb"), export_format="GLB",
                              export_apply=True, export_yup=True)


if __name__ == "__main__":
    what = sys.argv[1:] or ["all"]
    jobs = {"shot03": shot03, "shot07": shot07, "still05a": still05a, "still05c": still05c, "glb": glb}
    for k in (jobs if "all" in what else what):
        jobs[k]()
        print("[built]", k, flush=True)
