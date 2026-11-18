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
    table, pt = C.principled("Graphite", "#111820", metallic=0.15, rough=0.5, coat=0.08)
    C.micro_roughness(table, pt, 0.5, 0.08, 18, 0.004)
    put(C.box("Table", (400, 300, 2), (0, 40, -1), table), "S1_ENVIRONMENT")
    back = bpy.data.materials.new("Backdrop"); back.use_nodes = True
    bp_ = back.node_tree.nodes["Principled BSDF"]; bp_.inputs["Base Color"].default_value = C.hex_rgba("#080C10")
    bp_.inputs["Emission Color"].default_value = C.hex_rgba("#16202A"); bp_.inputs["Emission Strength"].default_value = 0.35
    bd = C.box("Backdrop", (400, 2, 200), (0, 90, 60), back); put(bd, "S1_ENVIRONMENT")
    # ---- identity card: brushed titanium plaque on a slim graphite stand, name engraved
    ti = brushed("Titanium", "#9AA2AB", rough=0.3)
    ink = C.principled("EngraveInk", "#1A2028", metallic=0.6, rough=0.45)[0]
    card = C.box("ProfileCard", (19, 0.55, 12), (0, 0, 0), ti, 0.18, 4); put(card, "S1_IDENTITY_CARD")
    card.location = (-6, 0, 7.6); card.rotation_euler = (math.radians(-14), 0, math.radians(8))
    stand = C.box("CardStand", (14, 3, 1.2), (-6, 1.4, 0.6), C.principled("StandGraphite", "#0E141A", metallic=0.4, rough=0.3)[0], 0.3, 3)
    put(stand, "S1_IDENTITY_CARD")
    fx = lambda x, z: (x, -0.3, z)                            # card-local front-face positions
    for ob in (text("ALICE HUANG", 2.05, fx(0, 1.6), (math.radians(90), 0, 0), ink, spacing=1.05),
               text("PROFILE", 0.62, fx(-6.6, 4.3), (math.radians(90), 0, 0), ink, align="LEFT", spacing=1.6)):
        ob.parent = card
    line = text("FORMER EXECUTIVE  ·  MEGASPEED", 0.78, fx(0, -1.4), (math.radians(90), 0, 0),
                fade_mat("RoleInk", "#2A333D", (F(84), F(96)), metallic=0.5), spacing=1.25); line.parent = card
    green_rule = C.box("CardRule", (13, 0.05, 0.08), fx(0, -0.1), C.principled("RuleGreen", "#76B900", rough=0.3)[0])
    green_rule.data.materials.clear(); green_rule.data.materials.append(fade_mat("RuleFade", "#76B900", (F(84), F(92)), emit=("#76B900", 2.0)))
    green_rule.parent = card; put(green_rule, "S1_IDENTITY_CARD")
    # ---- Megaspeed plaque (text only; rises from the table in beat 3)
    dark_al = brushed("AnodizedDark", "#2B323B", rough=0.32, aniso=0.5)
    plaque = C.box("MegaspeedPlaque", (14, 0.5, 4.6), (0, 0, 0), brushed("TitaniumPlaque", "#8E97A1", rough=0.3), 0.15, 4); put(plaque, "S1_CONNECTIONS")
    pl_txt = text("MEGASPEED", 1.7, (0, -0.28, 0), (math.radians(90), 0, 0), C.principled("PlaqueInk", "#1A2028", metallic=0.6, rough=0.45)[0], spacing=1.15, cname="S1_CONNECTIONS")
    pl_txt.parent = plaque
    plaque.rotation_euler = (math.radians(-10), 0, math.radians(-4))
    for f, z in ((F(0), -7.0), (F(86), -7.0), (F(104), 5.2)):
        plaque.location = (9.5, 9, z); plaque.keyframe_insert("location", frame=f)
    # ---- the GPU (reused): tilted toward camera on a low display stand
    gcoll = gpu_asset()
    gpu = gpu_instance(gcoll, (8, -12, 3.6), (math.radians(38), 0, math.radians(-14)), 1.3, "S1_GPU")
    put(gpu, "S1_NVIDIA_GPU")
    put(C.box("GpuStand", (11, 8, 1.4), (8, -10.4, 0.7), C.principled("StandGraphite2", "#0E141A", metallic=0.4, rough=0.3)[0], 0.3, 3), "S1_NVIDIA_GPU")
    # ---- connection lines Alice -> Megaspeed -> NVIDIA (grow in beat 3)
    glow = bpy.data.materials.new("ConnGlow"); glow.use_nodes = True
    g = glow.node_tree.nodes["Principled BSDF"]; g.inputs["Base Color"].default_value = C.hex_rgba("#76B900")
    g.inputs["Emission Color"].default_value = C.hex_rgba("#76B900"); g.inputs["Emission Strength"].default_value = 6.0
    l1 = bez("Conn_Alice_Megaspeed", [Vector((3.4, 1.5, 3.0)), Vector((3.2, 6, 3.4)), Vector((2.6, 8.6, 3.4))], glow)
    l2 = bez("Conn_Megaspeed_NVIDIA", [Vector((14.5, 8.6, 3.4)), Vector((13.5, 0, 3.4)), Vector((10.0, -7.4, 3.0))], glow)
    for lo, (a, b) in ((l1, (F(98), F(112))), (l2, (F(108), F(124)))):
        lo.data.bevel_factor_end = 0.0; lo.data.keyframe_insert("bevel_factor_end", frame=a)
        lo.data.bevel_factor_end = 1.0; lo.data.keyframe_insert("bevel_factor_end", frame=b)
    # ---- lighting: product-photo setup
    L = []
    L.append(S.area_light("Key", (-30, -45, 45), (0, 2, 4), 60, 3.2e4, "#FFF4E8", size_y=45))
    L.append(S.area_light("Fill", (40, -40, 20), (2, 2, 4), 70, 7.0e3, "#DCE6F2", size_y=50))
    L.append(S.area_light("RimGreen", (0, 45, 38), (2, 2, 7), 70, 5.0e3, "#76B900", size_y=14))
    L.append(S.area_light("DieReflector", (8, 8, 26), (8, -12, 3.6), 40, 6.0e3, "#EAF2FF", size_y=26))
    L.append(S.area_light("MacroKick", (2, -20, 14), (8, -12, 3.6), 12, 1.6e3, "#FFFFFF", size_y=12))
    L.append(S.area_light("TopStrip", (2, 4, 60), (2, 4, 0), 90, 1.2e4, "#FFFFFF", size_y=6))
    L.append(S.area_light("CardSweep", (-40, -30, 22), (-6, 0, 7.6), 6, 0.0, "#FFFFFF", size_y=40))
    for o in L:
        put(o, "S1_LIGHTING")
    sw = L[-1]                                              # light sweep across the brushed card (beat 1)
    for f, x, e in ((F(0), -40, 0), (F(4), -34, 9e3), (F(32), 22, 9e3), (F(40), 30, 0)):
        sw.location.x = x; sw.data.energy = e
        sw.keyframe_insert("location", index=0, frame=f); sw.data.keyframe_insert("energy", frame=f)
    S.build_world().inputs["Strength"].default_value = 0.05
    # ---- camera: lens + position + focus, Bezier eased, continuous
    cam_d = bpy.data.cameras.new("S1_Cam"); cam = bpy.data.objects.new("S1_Cam", cam_d)
    bpy.context.scene.collection.objects.link(cam); put(cam, "S1_CAMERA"); sc.camera = cam
    tgt = bpy.data.objects.new("S1_LookAt", None); bpy.context.scene.collection.objects.link(tgt); put(tgt, "S1_CAMERA")
    foc = bpy.data.objects.new("S1_Focus", None); bpy.context.scene.collection.objects.link(foc); put(foc, "S1_CAMERA")
    tc = cam.constraints.new("TRACK_TO"); tc.target = tgt; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
    cam_d.sensor_width = 36; cam_d.sensor_fit = 'HORIZONTAL'; cam_d.clip_start = 0.5; cam_d.clip_end = 2000
    cam_d.dof.use_dof = True; cam_d.dof.focus_object = foc
    keys = [  # spec frame, cam pos, look-at, lens, focus point, f-stop
        (0,   (-9.5, -40, 11.0), (-5.4, 0, 6.6), 55, (-6, 0, 7.6), 4.0),
        (35,  (-8.0, -35, 10.5), (-5.0, 0, 6.8), 58, (-6, 0, 7.6), 4.0),
        (83,  (15.0, -37, 13.0), (5.0, -6, 4.0), 46, (8, -12, 3.6), 4.0),
        (128, (4.0, -44, 18.0), (3.0, 0.0, 4.8), 34, (3, 0, 5), 8.0),
        (141, (8.5, -17.6, 9.0), (8.0, -11.7, 3.9), 68, (8.0, -11.7, 3.9), 11.0),
        (149, (8.4, -17.0, 8.6), (8.0, -11.7, 3.9), 72, (8.0, -11.7, 3.9), 11.0),
    ]
    for n, p, l, lens, fp, fs in keys:
        f = F(n)
        cam.location = p; tgt.location = l; foc.location = fp; cam_d.lens = lens; cam_d.dof.aperture_fstop = fs
        cam.keyframe_insert("location", frame=f); tgt.keyframe_insert("location", frame=f); foc.keyframe_insert("location", frame=f)
        cam_d.keyframe_insert("lens", frame=f); cam_d.dof.keyframe_insert("aperture_fstop", frame=f)
    # tiny drift before frame 0 so motion exists at the very first frame
    for ob, path in ((cam, "location"), (tgt, "location"), (foc, "location")):
        ad = ob.animation_data
        if ad and ad.action:
            for fc in fcurves(ad.action):
                fc.extrapolation = "LINEAR"
    out = C.ROOT / "blender/s1_alice_mystery.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(out))
    print("[built]", out, "samples", SAMPLES, "final", FINAL, flush=True)
    if STILLS:
        od = Path(STILLS); od.mkdir(parents=True, exist_ok=True)
        for n in (0, 36, 84, 129, 149):
            sc.frame_set(F(n)); sc.render.filepath = str(od / f"frame-{n:03d}.png")
            bpy.ops.render.render(write_still=True); print("[still]", n, flush=True)


if __name__ == "__main__":
    build()
