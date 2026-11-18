"""S1 V2 hook · Shot 3 GPU reveal (Blender, Cycles). Redesigned look on the EXISTING GPU model (build_gpu.py).

Materials: dark brushed gunmetal stiffener (no flat white), glassy silicon dies with a procedural die-shot
texture (compute clusters, cache arrays, I/O ring) under a clear coat + thin-film iridescence, gold contact
pads / capacitor terminals / substrate edge plating, dark glass-fibre substrate, satin HBM stacks.
Light: hard directional key + a long strip softbox whose reflection travels across the dies, cool rim,
restrained green accent from below/behind. Camera: GPU upright to fill the 9:16 frame, controlled rotation,
then a macro dive into the left compute die (f/2.8 -> f/2, focus pull). Transparent film (graded in Remotion).

Run:  .venv/bin/python scripts/s1_v2_gpu.py -- [--samples 32] [--frames 0,30,53] [--final]
Out:  renders/s1_v2/gpu/####.png   (54 frames, shot-local)
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy  # noqa: E402
import bmesh  # noqa: E402
import numpy as np  # noqa: E402

import common as C  # noqa: E402
import build_scene as S  # noqa: E402
from build_gpu import build_gpu, SUB, RING_OUT, DIE  # noqa: E402

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
FINAL = "--final" in ARGS
SAMPLES = int(ARGS[ARGS.index("--samples") + 1]) if "--samples" in ARGS else 32
ONLY = [int(x) for x in ARGS[ARGS.index("--frames") + 1].split(",")] if "--frames" in ARGS else None
NFR = 54
OUT = C.ROOT / "renders/s1_v2/gpu"
TEX = C.ROOT / "renders/s1_v2/die_shot.png"


# ------------------------------------------------------------------ procedural die-shot texture
def die_texture(path, n=4096, seed=3):
    rng = np.random.default_rng(seed)
    img = np.zeros((n, n, 3), np.float32)
    img[:] = (0.035, 0.03, 0.05)
    io = int(n * 0.045)                                                  # I/O ring with bond pads
    img[:io] = img[-io:] = (0.10, 0.09, 0.07); img[:, :io] = img[:, -io:] = (0.10, 0.09, 0.07)
    for k in range(io // 2, n - io // 2, 38):
        for (y0, x0) in ((io // 4, k), (n - io // 2, k), (k, io // 4), (k, n - io // 2)):
            img[y0:y0 + 18, x0:x0 + 18] = (0.62, 0.48, 0.22)
    inner = (io + 20, n - io - 20)
    l2 = (int(n * 0.47), int(n * 0.53))                                   # central cache stripe
    yy, xx = np.mgrid[l2[0]:l2[1], inner[0]:inner[1]]
    img[l2[0]:l2[1], inner[0]:inner[1]] = np.where(((yy % 2) == 0)[..., None] & ((xx % 2) == 0)[..., None],
                                                   (0.13, 0.12, 0.15), (0.07, 0.065, 0.08))
    cols, rows = 8, 9                                                     # compute clusters (two halves)
    span = inner[1] - inner[0]
    for half, (ya, yb) in enumerate(((inner[0], l2[0] - 24), (l2[1] + 24, inner[1]))):
        ch = (yb - ya) // rows; cw = span // cols
        for r in range(rows):
            for c in range(cols):
                y0, x0 = ya + r * ch + 10, inner[0] + c * cw + 10
                y1, x1 = y0 + ch - 20, x0 + cw - 20
                hue = tuple(np.array(rng.choice([(0.10, 0.11, 0.095), (0.105, 0.10, 0.115), (0.115, 0.105, 0.09), (0.095, 0.10, 0.11)])) * rng.uniform(0.8, 1.1))
                img[y0:y1, x0:x1] = hue
                # inner structure: tensor-core arrays (fine grid) + register files (stripes)
                gy, gx = np.mgrid[y0:y1, x0:x1]
                grid = (((gy - y0) % 14 < 2) | ((gx - x0) % 14 < 2))
                img[y0:y1, x0:x1][grid] *= 1.45
                fine = (((gy - y0) % 4 == 0) | ((gx - x0) % 4 == 0)) & ~grid
                img[y0:y1, x0:x1][fine] *= 1.12
                sy = y0 + int((y1 - y0) * rng.uniform(0.55, 0.7))
                img[sy:sy + 30, x0 + 8:x1 - 8] = np.array(hue) * 1.45
                img[y0 + 6:y0 + 26, x0 + 6:x1 - 6] = (0.15, 0.135, 0.10)   # local cache strip
    img = img + rng.normal(0, 0.006, img.shape)
    img = np.clip(img, 0, 1) ** (1 / 1.1)
    bpy_img = bpy.data.images.new("DieShot", n, n, alpha=False, float_buffer=False)
    rgba = np.ascontiguousarray(np.dstack([img, np.ones((n, n, 1), np.float32)])[::-1], dtype=np.float32).ravel()
    bpy_img.pixels.foreach_set(rgba)
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy_img.filepath_raw = str(path); bpy_img.file_format = "PNG"; bpy_img.save()
    return bpy_img


def get_die_tex():
    if TEX.exists():
        return bpy.data.images.load(str(TEX))
    return die_texture(TEX)


# ------------------------------------------------------------------ materials
def principled(name, base, metallic=0.0, rough=0.4, coat=0.0, aniso=0.0, coat_rough=0.05):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = C.hex_rgba(base)
    p.inputs["Metallic"].default_value = metallic; p.inputs["Roughness"].default_value = rough
    p.inputs["Coat Weight"].default_value = coat; p.inputs["Coat Roughness"].default_value = coat_rough
    p.inputs["Anisotropic"].default_value = aniso
    return m, p


def brushed_bump(m, p, scale=(1, 260, 1), strength=0.06):
    nt = m.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = scale
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 40; nz.inputs["Detail"].default_value = 8
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = strength
    rr = nt.nodes.new("ShaderNodeMapRange"); rr.inputs["To Min"].default_value = 0.22; rr.inputs["To Max"].default_value = 0.34
    L = nt.links.new
    L(tc.outputs["Object"], mp.inputs[0]); L(mp.outputs[0], nz.inputs["Vector"]); L(nz.outputs["Fac"], bp.inputs["Height"])
    L(bp.outputs["Normal"], p.inputs["Normal"]); L(nz.outputs["Fac"], rr.inputs["Value"]); L(rr.outputs[0], p.inputs["Roughness"])


def die_material(tex):
    m, p = principled("V2_Silicon", "#1a1820", metallic=0.55, rough=0.14, coat=1.0, coat_rough=0.02)
    p.inputs["Thin Film Thickness"].default_value = 420.0; p.inputs["Thin Film IOR"].default_value = 1.6
    nt = m.node_tree; L = nt.links.new
    tc = nt.nodes.new("ShaderNodeTexCoord")
    ti = nt.nodes.new("ShaderNodeTexImage"); ti.image = tex; ti.interpolation = "Cubic"
    mp = nt.nodes.new("ShaderNodeMapping")
    # Generated coords span each die's bounding box 0..1 -> one die shot per die
    L(tc.outputs["Generated"], mp.inputs[0]); L(mp.outputs[0], ti.inputs["Vector"])
    L(ti.outputs["Color"], p.inputs["Base Color"])
    # controlled green illumination: only the fine array structure glows, keyed from 0 -> low
    sep = nt.nodes.new("ShaderNodeSeparateColor"); L(ti.outputs["Color"], sep.inputs[0])
    thr = nt.nodes.new("ShaderNodeMapRange"); thr.inputs["From Min"].default_value = 0.17; thr.inputs["From Max"].default_value = 0.30
    L(sep.outputs[1], thr.inputs["Value"])
    k = nt.nodes.new("ShaderNodeValue"); k.name = "GreenK"; k.outputs[0].default_value = 0.0
    mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; L(thr.outputs[0], mul.inputs[0]); L(k.outputs[0], mul.inputs[1])
    p.inputs["Emission Color"].default_value = C.hex_rgba("#76B900"); L(mul.outputs[0], p.inputs["Emission Strength"])
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.08; bump.inputs["Distance"].default_value = 0.002
    L(ti.outputs["Color"], bump.inputs["Height"]); L(bump.outputs["Normal"], p.inputs["Normal"])
    return m, k


def mats(tex):
    M = {}
    M["ring"], p = principled("V2_Gunmetal", "#5E646B", metallic=1.0, rough=0.28, aniso=0.7)
    brushed_bump(M["ring"], p)
    M["die"], M["greenK"] = die_material(tex)
    M["gold"], p = principled("V2_Gold", "#E0B04F", metallic=1.0, rough=0.18)
    M["substrate"], p = principled("V2_Substrate", "#0D1712", metallic=0.0, rough=0.42, coat=0.6, coat_rough=0.12)
    M["hbm"], p = principled("V2_HBM", "#0C0D10", metallic=0.3, rough=0.24, coat=0.5)
    M["interposer"], p = principled("V2_Interposer", "#3E434C", metallic=0.9, rough=0.2)
    M["cap"], p = principled("V2_CapBody", "#4A3A28", rough=0.45)
    M["etch"], p = principled("V2_Etch", "#C9CED4", metallic=1.0, rough=0.35)
    return M


def restyle(root, M):
    for ob in [root] + list(root.children_recursive):
        if ob.type not in ("MESH", "FONT"):
            continue
        n = ob.name
        if n.startswith("Fragment_"):
            ob.hide_render = True; continue
        key = ("ring" if n.startswith("Stiffener") else "die" if n.startswith("Compute_Die") else
               "hbm" if n.startswith("HBM_L") or n.startswith("HBM_R") else "interposer" if n.startswith(("Interposer", "HBM_layer")) else
               "substrate" if n.startswith(("Substrate", "Underfill")) else "etch" if n.startswith("Etch") else None)
        if n == "Package_Caps":
            ob.data.materials[0] = M["cap"]; ob.data.materials[1] = M["gold"]; continue
        if n == "BGA_Balls":
            ob.data.materials[0] = M["gold"]; continue
        if key:
            ob.data.materials.clear(); ob.data.materials.append(M[key])


def gold_details(root, M):
    """Gold contact pads along the substrate border + edge plating band (the package's visible gold)."""
    bm = bmesh.new()
    z = SUB[2] + 0.001
    bx, by = SUB[0] / 2, SUB[1] / 2
    rx, ry = RING_OUT[0] / 2, RING_OUT[1] / 2
    pad = 0.07
    for x in np.arange(-bx + 0.12, bx - 0.1, 0.16):
        for y in (-(ry + by) / 2, (ry + by) / 2):
            C.add_box(bm, (pad, (by - ry) * 0.55, 0.004), (x, y, z))
    for y in np.arange(-by + 0.12, by - 0.1, 0.16):
        for x in (-(rx + bx) / 2, (rx + bx) / 2):
            C.add_box(bm, ((bx - rx) * 0.55, pad, 0.004), (x, y, z))
    C.add_box(bm, (SUB[0] + 0.004, SUB[1] + 0.004, 0.025), (0, 0, SUB[2] * 0.5))   # edge plating band
    ob = C.mesh_obj("V2_GoldPads", bm, M["gold"]); C.link(ob, root)


def key(ob, path, frame, val, index=-1):
    if index < 0:
        setattr(ob, path, val)
    else:
        getattr(ob, path)[index] = val
    ob.keyframe_insert(path, frame=frame + 1, index=index)


def build():
    sc = C.reset_scene(); C._MATS.clear()
    S.render_settings(final=FINAL, samples=SAMPLES)
    sc.render.film_transparent = True
    sc.render.image_settings.color_mode = "RGBA"
    sc.cycles.adaptive_threshold = 0.02
    sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 0.25
    sc.frame_start, sc.frame_end = 1, NFR
    sc.render.resolution_x, sc.render.resolution_y = (2160, 3840) if FINAL else (1080, 1920)
    w = S.build_world(); w.inputs["Color"].default_value = C.hex_rgba("#06080B"); w.inputs["Strength"].default_value = 0.08

    tex = get_die_tex()
    M = mats(tex)
    root, frags = build_gpu(parent_loc=(0, 0, 0))
    restyle(root, M); gold_details(root, M)
    piv = bpy.data.objects.new("V2_Pivot", None); C.link(piv); root.parent = piv

    # lights: hard key (top-left), travelling strip softbox (for long reflections), cool rim, low green accent
    keyL = S.area_light("V2_Key", (-22, -18, 30), (0, 0, 0), 6, 9.0e3, "#FFF1DE")
    keyL.data.spread = math.radians(40)
    strip = S.area_light("V2_Strip", (-30, -6, 22), (0, 0, 0), 60, 3.2e4, "#F4F8FF", size_y=2.2)
    rim = S.area_light("V2_Rim", (20, 26, 10), (0, 0, 0), 20, 6.0e3, "#B9CCFF")
    grn = S.area_light("V2_Green", (6, 18, -6), (0, 0, 0), 14, 0.0, "#76B900")
    fill = S.area_light("V2_Fill", (18, -30, 8), (0, 0, 0), 30, 1.2e3, "#DCE4EE")
    for f, x in ((0, -30), (53, 26)):
        key(strip, "location", f, x, index=0)
    for f, e in ((0, 600), (30, 1600), (53, 2600)):
        grn.data.energy = e; grn.data.keyframe_insert("energy", frame=f + 1)
    for f, g in ((0, 0.0), (32, 0.08), (46, 0.35), (53, 0.9)):
        M["greenK"].outputs[0].default_value = g; M["greenK"].outputs[0].keyframe_insert("default_value", frame=f + 1)

    cam_d = bpy.data.cameras.new("V2_Cam"); cam = bpy.data.objects.new("V2_Cam", cam_d); C.link(cam); sc.camera = cam
    tgt = bpy.data.objects.new("V2_Look", None); C.link(tgt)
    tc = cam.constraints.new("TRACK_TO"); tc.target = tgt; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
    cam_d.sensor_fit = "HORIZONTAL"; cam_d.sensor_width = 36; cam_d.clip_start = 0.02
    cam_d.dof.use_dof = True; cam_d.dof.focus_object = tgt
    # GPU stands upright in frame (long axis vertical): yaw ~90°. Left die centre = (-(DIE0/2+0.035), 0, ~0.32)
    die_x = -(DIE[0] / 2 + 0.035)
    keys = [  # frame, yaw°, tilt°, cam pos, look, lens, fstop
        (0,  108, 52, (2.6, -10.4, 7.6), (0.0, 0.0, 0.1), 52, 5.6),
        (16, 99, 55, (1.7, -9.2, 7.2), (0.0, 0.0, 0.15), 52, 5.0),
        (30, 92, 58, (0.5, -6.6, 5.9), (-0.4, 0.0, 0.25), 50, 4.0),
        (42, 90, 60, (-0.7, -2.4, 3.6), (-1.0, 0.0, 0.32), 48, 3.2),
        (53, 90, 60, (-1.1, -0.55, 1.55), (-1.1, 0.05, 0.32), 55, 2.4),
    ]
    for f, yaw, tilt, cp, lk, lens, fs in keys:
        key(piv, "rotation_euler", f, math.radians(yaw), index=2)
        key(piv, "rotation_euler", f, math.radians(tilt - 60), index=0)
        cam.location = cp; cam.keyframe_insert("location", frame=f + 1)
        tgt.location = lk; tgt.keyframe_insert("location", frame=f + 1)
        cam_d.lens = lens; cam_d.keyframe_insert("lens", frame=f + 1)
        cam_d.dof.aperture_fstop = fs; cam_d.dof.keyframe_insert("aperture_fstop", frame=f + 1)
    _ = die_x
    return sc


def main():
    sc = build()
    OUT.mkdir(parents=True, exist_ok=True)
    for f in (ONLY if ONLY is not None else range(NFR)):
        sc.frame_set(f + 1)
        sc.render.filepath = str(OUT / f"{f:04d}.png")
        bpy.ops.render.render(write_still=True)
        print("rendered", f, flush=True)


main()
