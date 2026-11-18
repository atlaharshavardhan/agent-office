"""Scene S1 · "Who is Alice Huang?" · 5.0 s / 150 frames @ 30 fps, 1080x1920 (final 2160x3840).
Programmatic Blender scene: brushed-titanium profile card, our existing NVIDIA-style GPU (reused from build_gpu),
a Megaspeed name plaque and thin illuminated connection lines (Alice -> Megaspeed -> NVIDIA), product-photo lighting,
animated camera/lens/focus, ending in a macro push into the GPU die (hands off to Scene 2).
No faces, no fabricated evidence, no export wall / China / remote computing (those belong to later scenes).

Run (bpy module, as in this project):   .venv/bin/python scripts/s1_alice_mystery.py [--final] [--stills out_dir] [--samples N]
Run (Blender app):                       blender -b -P scripts/s1_alice_mystery.py -- [same args]
Output: blender/s1_alice_mystery.blend   (+ stills of frames 0/36/84/129/149 when --stills is given)
Frame numbering: spec frame N (0-149) == Blender frame N+1 (1-150).
"""
import math
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

import common as C  # noqa: E402
import build_scene as S  # noqa: E402
from build_shots import gpu_asset, gpu_instance  # noqa: E402
from animate_hook import fcurves  # noqa: E402

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
FINAL = "--final" in ARGS
SAMPLES = int(ARGS[ARGS.index("--samples") + 1]) if "--samples" in ARGS else (160 if FINAL else 64)
STILLS = ARGS[ARGS.index("--stills") + 1] if "--stills" in ARGS else None
FONT = str(C.ROOT / "assets/fonts/InterDisplay-Bold.otf")
F = lambda n: n + 1                      # spec frame -> Blender frame

COLS = {}


def coll(name):
    if name not in COLS:
        c = bpy.data.collections.new(name); bpy.context.scene.collection.children.link(c); COLS[name] = c
    return COLS[name]


def put(ob, cname):
    for c in list(ob.users_collection):
        c.objects.unlink(ob)
    coll(cname).objects.link(ob)
    return ob


def text(body, size, loc, rot, mat, extrude=0.02, align="CENTER", cname="S1_IDENTITY_CARD", spacing=1.0):
    cu = bpy.data.curves.new("t_" + body[:8], "FONT"); cu.body = body
    cu.font = bpy.data.fonts.load(FONT, check_existing=True)
    cu.size = size; cu.align_x = align; cu.align_y = "CENTER"; cu.extrude = extrude; cu.space_character = spacing
    ob = bpy.data.objects.new("T_" + body[:10], cu); ob.data.materials.append(mat)
    ob.location = loc; ob.rotation_euler = rot; bpy.context.scene.collection.objects.link(ob)
    return put(ob, cname)


def fade_mat(name, base, frames, emit=None, metallic=0.0, rough=0.4):
    """Principled material whose visibility animates 0 -> 1 over `frames` (Cycles alpha via mix shader)."""
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; out = nt.nodes["Material Output"]; p = nt.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = C.hex_rgba(base); p.inputs["Metallic"].default_value = metallic
    p.inputs["Roughness"].default_value = rough
    if emit:
        p.inputs["Emission Color"].default_value = C.hex_rgba(emit[0]); p.inputs["Emission Strength"].default_value = emit[1]
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(p.outputs[0], mix.inputs[2]); nt.links.new(mix.outputs[0], out.inputs["Surface"])
    fac = mix.inputs["Fac"]
    fac.default_value = 0.0; fac.keyframe_insert("default_value", frame=frames[0])
    fac.default_value = 1.0; fac.keyframe_insert("default_value", frame=frames[1])
    return m


def brushed(name, base, rough=0.3, aniso=0.6):
    m, p = C.principled(name, base, metallic=0.95, rough=rough, aniso=aniso)
    C.micro_roughness(m, p, rough, 0.05, 70, 0.006, stretch=(1, 45, 1))     # fine brushed grain
    return m


def bez(name, pts, mat, width=0.06):
    cu = bpy.data.curves.new(name, "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = width; cu.bevel_resolution = 3
    sp = cu.splines.new("BEZIER"); sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p; bp.handle_left_type = bp.handle_right_type = "AUTO"
    ob = bpy.data.objects.new(name, cu); ob.data.materials.append(mat); bpy.context.scene.collection.objects.link(ob)
    return put(ob, "S1_CONNECTIONS")


def build():
    sc = C.reset_scene(); C._MATS.clear()
    S.render_settings(final=FINAL, samples=SAMPLES)
    sc.render.resolution_x, sc.render.resolution_y = (2160, 3840) if FINAL else (1080, 1920)
    sc.render.resolution_percentage = 100
    sc.render.fps = 30; sc.frame_start, sc.frame_end = 1, 150
    sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 0.35
    sc.view_settings.view_transform = "AgX"
    # ---- environment: graphite table + soft backdrop for separation
    table, pt = C.principled("Graphite", "#0B1015", metallic=0.15, rough=0.5, coat=0.08)
    C.micro_roughness(table, pt, 0.5, 0.08, 18, 0.004)
    put(C.box("Table", (400, 300, 2), (0, 40, -1), table), "S1_ENVIRONMENT")
    back = bpy.data.materials.new("Backdrop"); back.use_nodes = True
    bp_ = back.node_tree.nodes["Principled BSDF"]; bp_.inputs["Base Color"].default_value = C.hex_rgba("#080C10")
    bp_.inputs["Emission Color"].default_value = C.hex_rgba("#16202A"); bp_.inputs["Emission Strength"].default_value = 0.35
    bd = C.box("Backdrop", (400, 2, 200), (0, 90, 60), back); put(bd, "S1_ENVIRONMENT")
    # ---- V2 layout: GPU large in the foreground, Alice's dark identity slab behind it (layered parallax)
    slab_m = brushed("DarkBrushedSteel", "#2C333C", rough=0.27, aniso=0.65)
    ink = C.principled("EngravedLight", "#DCE2E9", metallic=0.7, rough=0.3)[0]
    card = C.box("IdentitySlab", (24, 1.8, 13), (0, 0, 0), slab_m, 0.35, 5); put(card, "S1_IDENTITY_CARD")
    card.location = (-3.5, 5, 6.5); card.rotation_euler = (math.radians(-7), 0, math.radians(6))
    name = text("ALICE HUANG", 2.6, (0, -0.95, 0.4), (math.radians(90), 0, 0), ink, extrude=0.04, spacing=1.06); name.parent = card
    accent = C.box("SlabAccent", (5.5, 0.05, 0.12), (0, -0.92, -2.2), fade_mat("AccentGreen", "#76B900", (F(0), F(8)), emit=("#76B900", 1.2)))
    accent.parent = card; put(accent, "S1_IDENTITY_CARD")
    # ---- Megaspeed: same dark-metal language, rises in beat 3 (text only)
    plaque = C.box("MegaspeedPlaque", (16, 1.4, 5.2), (0, 0, 0), brushed("DarkBrushedSteel2", "#323A44", rough=0.28, aniso=0.6), 0.3, 5)
    put(plaque, "S1_CONNECTIONS")
    pl_txt = text("MEGASPEED", 1.9, (0, -0.75, 0), (math.radians(90), 0, 0), ink, extrude=0.03, spacing=1.15, cname="S1_CONNECTIONS")
    pl_txt.parent = plaque
    plaque.rotation_euler = (math.radians(-6), 0, math.radians(-10))
    for f, z in ((F(0), -8.0), (F(84), -8.0), (F(100), 2.6)):
        plaque.location = (19, 7.5, z); plaque.keyframe_insert("location", frame=f)
    # ---- GPU (reused) in the foreground, tilted toward camera; support block hidden behind it
    gcoll = gpu_asset()
    gpu = gpu_instance(gcoll, (0, -13, 4.4), (math.radians(40), 0, math.radians(-6)), 1.6, "S1_GPU")
    put(gpu, "S1_NVIDIA_GPU")
    put(C.box("HiddenSupport", (6, 3, 4.0), (0, -9.6, 2.0), C.principled("SupportGraphite", "#0B1015", rough=0.6)[0], 0.2, 2), "S1_NVIDIA_GPU")
    # ---- restrained illuminated connections (no arrowheads): Alice - Megaspeed - NVIDIA
    glow = bpy.data.materials.new("ConnGlow"); glow.use_nodes = True
    g = glow.node_tree.nodes["Principled BSDF"]; g.inputs["Base Color"].default_value = C.hex_rgba("#76B900")
    g.inputs["Emission Color"].default_value = C.hex_rgba("#76B900"); g.inputs["Emission Strength"].default_value = 3.0
    P1 = [Vector((8.4, 3.4, 2.0)), Vector((9.8, 5.2, 1.3)), Vector((11.2, 7.0, 1.4))]
    P2 = [Vector((21.0, 6.2, 1.4)), Vector((17.5, -4.5, 1.1)), Vector((9.2, -9.8, 2.4))]
    l1 = bez("Conn_Alice_Megaspeed", P1, glow, 0.045); l2 = bez("Conn_Megaspeed_NVIDIA", P2, glow, 0.045)
    for lo, (a, b) in ((l1, (F(96), F(110))), (l2, (F(104), F(120)))):
        lo.data.bevel_factor_end = 0.0; lo.data.keyframe_insert("bevel_factor_end", frame=a)
        lo.data.bevel_factor_end = 1.0; lo.data.keyframe_insert("bevel_factor_end", frame=b)
    # ---- lighting: brighter soft key, overhead strip, separation, restrained green rim
    L = []
    L.append(S.area_light("Key", (-35, -50, 48), (0, -4, 5), 80, 5.0e4, "#FFF4E8", size_y=60))
    L.append(S.area_light("Fill", (45, -45, 22), (2, -4, 5), 80, 1.6e4, "#DCE6F2", size_y=60))
    L.append(S.area_light("TopStrip", (2, -4, 62), (2, -4, 0), 110, 3.0e4, "#FFFFFF", size_y=7))
    L.append(S.area_light("Separation", (-10, 40, 40), (0, 5, 6), 80, 2.2e4, "#C9D6E6", size_y=30))
    L.append(S.area_light("RimGreen", (25, 35, 30), (2, 0, 5), 50, 4.0e3, "#76B900", size_y=12))
    L.append(S.area_light("DieReflector", (0, 12, 30), (0, -13, 4.4), 46, 1.2e4, "#EAF2FF", size_y=30))
    L.append(S.area_light("PlaqueKey", (30, -24, 30), (19, 7.5, 2.6), 30, 1.1e4, "#FFFFFF", size_y=30))
    L.append(S.area_light("SlabSweep", (-45, -30, 24), (-3.5, 5, 6.5), 6, 0.0, "#FFFFFF", size_y=44))
    for o in L:
        put(o, "S1_LIGHTING")
    sw = L[-1]
    for f, x, e in ((F(0), -45, 0), (F(3), -38, 1.4e4), (F(34), 24, 1.4e4), (F(42), 32, 0)):
        sw.location.x = x; sw.data.energy = e
        sw.keyframe_insert("location", index=0, frame=f); sw.data.keyframe_insert("energy", frame=f)
    bd_m = bpy.data.materials.get("Backdrop")
    if bd_m:
        bd_m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 0.6
    S.build_world().inputs["Strength"].default_value = 0.08
    # ---- camera
    cam_d = bpy.data.cameras.new("S1_Cam"); cam = bpy.data.objects.new("S1_Cam", cam_d)
    bpy.context.scene.collection.objects.link(cam); put(cam, "S1_CAMERA"); sc.camera = cam
    tgt = bpy.data.objects.new("S1_LookAt", None); bpy.context.scene.collection.objects.link(tgt); put(tgt, "S1_CAMERA")
    foc = bpy.data.objects.new("S1_Focus", None); bpy.context.scene.collection.objects.link(foc); put(foc, "S1_CAMERA")
    tc = cam.constraints.new("TRACK_TO"); tc.target = tgt; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
    cam_d.sensor_width = 36; cam_d.sensor_fit = 'HORIZONTAL'; cam_d.clip_start = 0.5; cam_d.clip_end = 2000
    cam_d.dof.use_dof = True; cam_d.dof.focus_object = foc
    GP, CD = (0, -13, 4.4), (-3.5, 5, 6.5)
    keys = [  # spec frame, cam pos, look-at, lens, focus point, f-stop
        (0,   (5.0, -50, 15.0), (-0.5, -3.5, 6.0), 44, GP, 8.0),
        (35,  (3.5, -44, 14.0), (-0.5, -3.0, 6.0), 46, CD, 8.0),
        (62,  (18.0, -38, 13.0), (0.5, -5.0, 5.5), 46, GP, 6.0),
        (83,  (22.0, -27, 12.0), (1.0, -8.0, 4.8), 50, GP, 6.0),
        (100, (12.0, -52, 19.0), (7.0, -0.5, 5.0), 40, (8, 0, 4), 11.0),
        (118, (10.0, -56, 20.0), (7.0, 0.0, 5.0), 38, (8, 0, 4), 11.0),
        (128, (9.0, -54, 19.0), (6.5, -0.5, 5.0), 38, (8, 0, 4), 11.0),
        (141, (0.8, -24.0, 9.6), (0.0, -13.4, 4.2), 68, (0, -13.4, 4.2), 11.0),
        (149, (0.6, -22.8, 9.0), (0.0, -13.4, 4.2), 72, (0, -13.4, 4.2), 11.0),
    ]
    for n, p, l, lens, fp, fs in keys:
        f = F(n)
        cam.location = p; tgt.location = l; foc.location = fp; cam_d.lens = lens; cam_d.dof.aperture_fstop = fs
        cam.keyframe_insert("location", frame=f); tgt.keyframe_insert("location", frame=f); foc.keyframe_insert("location", frame=f)
        cam_d.keyframe_insert("lens", frame=f); cam_d.dof.keyframe_insert("aperture_fstop", frame=f)
    for ob in (cam, tgt, foc):
        ad = ob.animation_data
        if ad and ad.action:
            for fc in fcurves(ad.action):
                fc.extrapolation = "LINEAR"
    # ---- screen-space anchors for the Remotion labels (so labels sit exactly on the 3D lines)
    from bpy_extras.object_utils import world_to_camera_view
    import json
    anchors = {}
    for fr in range(1, 151):
        sc.frame_set(fr)
        def sp(v):
            c = world_to_camera_view(sc, cam, Vector(v)); return [round(c.x * 1080, 1), round((1 - c.y) * 1920, 1)]
        anchors[fr - 1] = {"l1": sp(l1.matrix_world @ P1[1]), "l2": sp(l2.matrix_world @ P2[1]), "plaque": sp(plaque.matrix_world.translation)}
    (C.ROOT / "remotion/src/s1/anchors.json").write_text(json.dumps(anchors))
    out = C.ROOT / "blender/s1_alice_mystery.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(out))
    print("[built]", out, "samples", SAMPLES, "final", FINAL, flush=True)
    if STILLS:
        od = Path(STILLS); od.mkdir(parents=True, exist_ok=True)
        for n in (0, 20, 36, 62, 84, 100, 118, 129, 149):
            sc.frame_set(F(n)); sc.render.filepath = str(od / f"frame-{n:03d}.png")
            bpy.ops.render.render(write_still=True); print("[still]", n, flush=True)


if __name__ == "__main__":
    build()
