"""S1 final hook · GPU render passes (transparent RGBA PNG sequences for Remotion).

Pass A  (Shot 1, 45 frames): our GPU floating in the stage foreground. Square 1000x1000 plate; green and
        white stage spots sweep across it in sync with the Remotion stage beams (same phase).
Pass B  (Shot 3, 54 frames): premium macro reveal. GPU rotates, camera glides in and ends inside the
        compute die (fills the frame) so the final frame cuts into S2. Transparent so the Three.js map
        shows behind it.

Run:  .venv/bin/python scripts/s1_final_gpu.py -- --pass A [--samples 32] [--frames 0,22,44] [--final]
Out:  renders/s1_final/gpuA/####.png , renders/s1_final/gpuB/####.png   (frame numbers = shot-local 0-based)
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy  # noqa: E402

import common as C  # noqa: E402
import build_scene as S  # noqa: E402
from build_shots import gpu_asset, gpu_instance  # noqa: E402

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
PASS = ARGS[ARGS.index("--pass") + 1] if "--pass" in ARGS else "A"
FINAL = "--final" in ARGS
SAMPLES = int(ARGS[ARGS.index("--samples") + 1]) if "--samples" in ARGS else 32
ONLY = [int(x) for x in ARGS[ARGS.index("--frames") + 1].split(",")] if "--frames" in ARGS else None
NFR = 45 if PASS == "A" else 54
OUT = C.ROOT / f"renders/s1_final/gpu{PASS}"


def key(ob, path, frame, val, index=-1):
    setattr(ob, path, val) if index < 0 else getattr(ob, path).__setitem__(index, val)
    ob.keyframe_insert(path, frame=frame + 1, index=index)


def smooth_all():
    for a in bpy.data.actions:
        try:
            from animate_hook import fcurves
            fcs = fcurves(a)
        except Exception:
            fcs = getattr(a, "fcurves", [])
        for fc in fcs:
            for k in fc.keyframe_points:
                k.interpolation = "BEZIER"; k.easing = "AUTO"


def circuit_die():
    """Green circuit illumination on the compute dies: procedural trace grid, strength keyed per pass."""
    m = bpy.data.materials["Silicon_Die"]; nt = m.node_tree; P = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord"); L = nt.links.new
    def grid(scale, mortar, rot=0.0):
        mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Rotation"].default_value = (0, 0, rot)
        br = nt.nodes.new("ShaderNodeTexBrick"); br.inputs["Scale"].default_value = scale; br.inputs["Mortar Size"].default_value = mortar
        br.offset = 0.0; br.squash = 1.0
        br.inputs["Color1"].default_value = br.inputs["Color2"].default_value = (0, 0, 0, 1); br.inputs["Mortar"].default_value = (1, 1, 1, 1)
        L(tc.outputs["Object"], mp.inputs[0]); L(mp.outputs[0], br.inputs["Vector"]); return br.outputs["Color"]
    def op(kind, a, b):
        n = nt.nodes.new("ShaderNodeMath"); n.operation = kind
        for i, v in enumerate((a, b)):
            if isinstance(v, (int, float)): n.inputs[i].default_value = v
            else: L(v, n.inputs[i])
        return n.outputs[0]
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 4.0; L(tc.outputs["Object"], nz.inputs["Vector"])
    sparse = op("GREATER_THAN", nz.outputs["Fac"], 0.63)                 # only some fine traces carry light
    lines = op("MAXIMUM", op("MULTIPLY", grid(1.3, 0.008), 1.0), op("MULTIPLY", grid(9.0, 0.012), sparse))
    k = nt.nodes.new("ShaderNodeValue"); k.name = "CircuitK"; k.outputs[0].default_value = 0.0
    nz2 = nt.nodes.new("ShaderNodeTexNoise"); nz2.inputs["Scale"].default_value = 2.0; L(tc.outputs["Object"], nz2.inputs["Vector"])
    mul2 = op("MULTIPLY", op("MULTIPLY", lines, op("POWER", nz2.outputs["Fac"], 2.0)), k.outputs[0])
    P.inputs["Emission Color"].default_value = C.hex_rgba("#76B900")
    for l in list(P.inputs["Emission Color"].links) + list(P.inputs["Emission Strength"].links):
        nt.links.remove(l)
    L(mul2, P.inputs["Emission Strength"])
    return k


def build():
    sc = C.reset_scene(); C._MATS.clear()
    S.render_settings(final=FINAL, samples=SAMPLES)
    sc.render.film_transparent = True
    sc.cycles.adaptive_threshold = 0.02
    sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = 0.22
    sc.frame_start, sc.frame_end = 1, NFR
    sc.render.image_settings.color_mode = "RGBA"
    if PASS == "A":
        sc.render.resolution_x = sc.render.resolution_y = 1600 if FINAL else 800
    else:
        sc.render.resolution_x, sc.render.resolution_y = (2160, 3840) if FINAL else (1080, 1920)
    w = S.build_world(); w.inputs["Color"].default_value = C.hex_rgba("#1A2430"); w.inputs["Strength"].default_value = 0.35

    gcoll = gpu_asset()
    die_fx = circuit_die()
    # camera-invisible gradient softbox so the mirror-like dies and steel read as glossy, not black
    sb = bpy.data.materials.new("Softbox"); sb.use_nodes = True; nt = sb.node_tree
    em = nt.nodes.new("ShaderNodeEmission"); gr = nt.nodes.new("ShaderNodeTexGradient"); ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.02, 0.03, 0.04, 1); ramp.color_ramp.elements[1].color = (0.9, 0.95, 1.0, 1)
    nt.links.new(gr.outputs[0], ramp.inputs[0]); nt.links.new(ramp.outputs[0], em.inputs[0]); em.inputs[1].default_value = 1.6
    nt.links.new(em.outputs[0], nt.nodes["Material Output"].inputs[0])
    bpy.ops.mesh.primitive_plane_add(size=1); plane = bpy.context.active_object; plane.name = "Softbox"
    plane.scale = (70, 40, 1); plane.location = (0, -46, 30); plane.rotation_euler = (math.radians(-55), 0, 0)
    plane.data.materials.append(sb); plane.visible_camera = False; plane.visible_shadow = False
    gpu = gpu_instance(gcoll, (0, 0, 0), (0, 0, 0), 1.0, "S1F_GPU")
    piv = bpy.data.objects.new("GPU_Pivot", None); C.link(piv); gpu.parent = piv

    cam_d = bpy.data.cameras.new("Cam"); cam = bpy.data.objects.new("Cam", cam_d); C.link(cam); sc.camera = cam
    tgt = bpy.data.objects.new("LookAt", None); C.link(tgt)
    tc = cam.constraints.new("TRACK_TO"); tc.target = tgt; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
    cam_d.sensor_fit = "HORIZONTAL"; cam_d.sensor_width = 36; cam_d.clip_start = 0.1; cam_d.clip_end = 1000
    cam_d.dof.use_dof = True; cam_d.dof.focus_object = tgt

    # reflections: big soft panels the metal can mirror (camera-invisible)
    S.area_light("TopSoft", (0, -10, 40), (0, 0, 0), 60, 1.2e4, "#F2F6FF", size_y=20)
    S.area_light("Key", (-30, -30, 26), (0, 0, 0), 30, 2.6e4, "#FFF2E2")
    S.area_light("RimCool", (26, 24, 16), (0, 0, 0), 30, 1.4e4, "#BFD4FF")
    spotG = S.area_light("SpotGreen", (-30, 10, 30), (0, 0, 0), 10, 3.0e4, "#76B900")
    spotW = S.area_light("SpotWhite", (30, 10, 30), (0, 0, 0), 8, 2.2e4, "#FFFFFF")

    if PASS == "A":
        # floating, gentle bob + yaw; die faces camera; stage spots sweep across (matching Remotion beams)
        piv.rotation_euler = (math.radians(46), 0, math.radians(-22))
        for f in range(0, NFR, 4):
            t = f / 30
            key(piv, "location", f, 0.35 * math.sin(t * 2.2), index=2)
            key(piv, "rotation_euler", f, math.radians(-22 + 10 * t / 1.5), index=2)
            key(piv, "rotation_euler", f, math.radians(46 + 2.5 * math.sin(t * 1.7)), index=0)
            die_fx.outputs[0].default_value = 0.35 + 0.25 * math.sin(t * 5); die_fx.outputs[0].keyframe_insert("default_value", frame=f + 1)
            key(spotG, "location", f, -34 + 40 * t / 1.5, index=0)
            key(spotW, "location", f, 34 - 46 * t / 1.5, index=0)
        cam.location = (0, -32, 6); tgt.location = (0, 0, 0.3); cam_d.lens = 72; cam_d.dof.aperture_fstop = 5.6
    else:
        # macro reveal: rotate toward camera, glide in, end inside the left compute die
        piv.rotation_euler = (math.radians(62), 0, 0)
        keys = [  # frame, yaw, pitch, cam, look, lens, fstop
            (0, -38, 54, (2, -36, 12), (0, 0, 0.4), 50, 6.0),
            (20, -16, 60, (1, -30, 9), (0, 0, 0.4), 55, 5.6),
            (36, -4, 66, (0.4, -20, 6), (-0.6, 0, 0.5), 62, 4.0),
            (46, 0, 70, (-1.0, -9, 3.2), (-1.5, 0, 0.6), 70, 2.8),
            (53, 0, 72, (-1.45, -3.0, 1.4), (-1.55, 0, 0.6), 80, 2.2),
        ]
        for f, yaw, pitch, cp, lk, lens, fs in keys:
            key(piv, "rotation_euler", f, math.radians(yaw), index=2)
            key(piv, "rotation_euler", f, math.radians(pitch), index=0)
            cam.location = cp; cam.keyframe_insert("location", frame=f + 1)
            tgt.location = lk; tgt.keyframe_insert("location", frame=f + 1)
            cam_d.lens = lens; cam_d.keyframe_insert("lens", frame=f + 1)
            cam_d.dof.aperture_fstop = fs; cam_d.dof.keyframe_insert("aperture_fstop", frame=f + 1)
        for f, xg in ((0, -36), (53, 10)):
            key(spotG, "location", f, xg, index=0)
        # green circuit pulse on the die area grows toward the end
        die_glow = bpy.data.lights.new("DieGlow", "POINT"); die_glow.color = C.hex_rgba("#76B900")[:3]; die_glow.shadow_soft_size = 2
        dg = bpy.data.objects.new("DieGlow", die_glow); C.link(dg); dg.location = (-1.5, -3, 2.5)
        for f, e, ck in ((0, 0, 0.15), (30, 20, 0.5), (46, 40, 1.4), (53, 60, 3.0)):
            die_glow.energy = e; die_glow.keyframe_insert("energy", frame=f + 1)
            die_fx.outputs[0].default_value = ck; die_fx.outputs[0].keyframe_insert("default_value", frame=f + 1)
    smooth_all()
    return sc


def main():
    sc = build()
    OUT.mkdir(parents=True, exist_ok=True)
    for f in (ONLY if ONLY is not None else range(NFR)):
        sc.frame_set(f + 1)
        sc.render.filepath = str(OUT / f"{f:04d}.png")
        bpy.ops.render.render(write_still=True)
        print("rendered", PASS, f, flush=True)


main()
