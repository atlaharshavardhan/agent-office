"""Keyframes for the 3-second hook (frames 1-90 @ 30 fps).

  1-24  Dominance  : macro on the die/HBM edge, green pulses, fast pull-back reveal
 25-45  Tension    : package rises, controlled orbit, green flickers, red creeps in
 46-69  Collapse   : red wave sweeps the board, cracks grow, metal chips peel off
 70-90  Impact     : fast push-in, dark set, red rim, chips suspended, top kept clear

The camera is keyed every frame from smooth analytic curves (no overshoot).
"""
import math
import random

import bpy
from mathutils import Vector

import common as C

F_END = 90


def ease_out_expo(t):
    return 1 if t >= 1 else 1 - 2 ** (-9 * t)


def ease_in_out(t):
    return t * t * (3 - 2 * t)


def ease_out_cubic(t):
    return 1 - (1 - t) ** 3


def lerp(a, b, t):
    return a + (b - a) * t


def seg(f, f0, f1):
    return min(1.0, max(0.0, (f - f0) / (f1 - f0)))


PKG_Z0 = 0.11


def pkg_z(f):
    return PKG_Z0 + 0.75 * ease_in_out(seg(f, 25, 42)) + 0.12 * seg(f, 42, 90)


def cam_state(f):
    """Return dict(az, el, dist, target, lens, fstop, shift) for frame f."""
    z = pkg_z(f)
    top = z + 0.25
    macro = dict(az=-72, el=21, dist=5.2, tgt=Vector((0.35, -2.9, top - 0.03)), lens=65, fs=9.0, sh=0.0)
    reveal = dict(az=-80, el=50, dist=27, tgt=Vector((0, -0.3, top)), lens=50, fs=8.0, sh=0.06)
    orbit = dict(az=-58, el=41, dist=23, tgt=Vector((0, -0.3, top)), lens=50, fs=6.3, sh=0.08)
    drift = dict(az=-52, el=38, dist=21.5, tgt=Vector((0, -0.4, top)), lens=50, fs=5.6, sh=0.09)
    impact = dict(az=-84, el=30, dist=15.5, tgt=Vector((0.0, -1.2, top)), lens=50, fs=5.6, sh=0.17)

    def mix(a, b, t):
        return {k: (a[k].lerp(b[k], t) if isinstance(a[k], Vector) else lerp(a[k], b[k], t)) for k in a}

    if f <= 24:
        t = ease_out_expo(seg(f, 1, 24))
        s = mix(macro, reveal, t)
        # distance interpolated in log space for a natural dolly
        s["dist"] = math.exp(lerp(math.log(macro["dist"]), math.log(reveal["dist"]), t))
    elif f <= 45:
        s = mix(reveal, orbit, ease_in_out(seg(f, 24, 45)))
    elif f <= 69:
        s = mix(orbit, drift, ease_in_out(seg(f, 45, 69)))
    else:
        t = ease_out_cubic(seg(f, 69, 86))
        s = mix(drift, impact, t)
        s["dist"] = math.exp(lerp(math.log(drift["dist"]), math.log(impact["dist"]), t))
    s["tgt"] = Vector((s["tgt"].x, s["tgt"].y, top))
    return s


def key_camera(cam, tgt):
    cd = cam.data
    for f in range(1, F_END + 1):
        s = cam_state(f)
        az, el = math.radians(s["az"]), math.radians(s["el"])
        off = Vector((math.cos(az) * math.cos(el), math.sin(az) * math.cos(el), math.sin(el))) * s["dist"]
        cam.location = s["tgt"] + off
        tgt.location = s["tgt"]
        cd.lens = s["lens"]
        cd.dof.aperture_fstop = s["fs"]
        cd.shift_y = s["sh"]
        cam.keyframe_insert("location", frame=f)
        tgt.keyframe_insert("location", frame=f)
        cd.keyframe_insert("lens", frame=f)
        cd.dof.keyframe_insert("aperture_fstop", frame=f)
        cd.keyframe_insert("shift_y", frame=f)
    linear(cam)
    linear(tgt)
    linear(cd)


def linear(idb):
    ad = idb.animation_data
    if not ad or not ad.action:
        return
    for fc in fcurves(ad.action):
        for k in fc.keyframe_points:
            k.interpolation = "LINEAR"


def fcurves(action):
    # Blender 4.4+ layered actions; fall back to legacy action.fcurves
    try:
        return list(action.fcurves)
    except AttributeError:
        out = []
        for layer in action.layers:
            for strip in layer.strips:
                for bag in strip.channelbags:
                    out.extend(bag.fcurves)
        return out


def key_scene_props(sc):
    rnd = random.Random(42)
    for f in range(1, F_END + 1):
        sc["fx_time"] = (f - 1) / 30.0
        # glow: steady, then flicker (dropouts) in tension, fade under the red wave
        if f <= 24:
            g = 1.0 + 0.15 * math.sin(f * 0.5)
        elif f <= 45:
            base = lerp(1.0, 0.65, seg(f, 25, 45))
            g = base * (0.25 if rnd.random() < 0.28 else rnd.uniform(0.85, 1.25))
        elif f <= 69:
            g = lerp(0.7, 0.9, seg(f, 46, 69))
        else:
            g = 0.75
        sc["fx_glow"] = g
        # red wave radius: starts at the dies, sweeps outward
        sc["fx_red"] = -1.0 if f < 46 else lerp(-0.5, 30.0, ease_in_out(seg(f, 46, 66)) ** 1.3)
        sc["fx_crack"] = 0.0 if f < 49 else ease_out_cubic(seg(f, 49, 70))
        for k in ("fx_time", "fx_glow", "fx_red", "fx_crack"):
            sc.keyframe_insert(f'["{k}"]', frame=f)
    linear(sc)


def key_package(root, frags):
    for f in range(1, F_END + 1):
        root.location.z = pkg_z(f)
        root.keyframe_insert("location", index=2, frame=f)
    linear(root)
    rnd = random.Random(9)
    for ob, n, r in frags:
        start = ob.location.copy()
        rot0 = ob.rotation_euler.copy()
        f0 = int(50 + r * 14)
        ob.keyframe_insert("location", frame=f0)
        ob.keyframe_insert("rotation_euler", frame=f0)
        dist = rnd.uniform(0.5, 2.6)
        up = rnd.uniform(0.4, 2.2)
        side = Vector((-n.y, n.x, 0)) * rnd.uniform(-0.6, 0.6)
        ob.location = start + n * dist + side + Vector((0, 0, up))
        ob.rotation_euler = (rot0.x + rnd.uniform(-1.6, 1.6), rot0.y + rnd.uniform(-1.6, 1.6),
                             rot0.z + rnd.uniform(-1.0, 1.0))
        ob.keyframe_insert("location", frame=F_END)
        ob.keyframe_insert("rotation_euler", frame=F_END)
        for fc in fcurves(ob.animation_data.action):
            for k in fc.keyframe_points:
                k.interpolation = "EXPO"
                k.easing = "EASE_OUT"


def key_lights(L, world_bg):
    def key(light, vals):
        for f, v in vals:
            light.data.energy = v
            light.data.keyframe_insert("energy", frame=f)
    soft = L["softbox"].data.energy
    keyl = L["key"].data.energy
    grn = L["green_rim"].data.energy
    key(L["softbox"], [(1, soft), (28, soft), (60, soft * 0.18), (90, soft * 0.12)])
    key(L["key"], [(1, keyl), (28, keyl), (60, keyl * 0.25), (90, keyl * 0.2)])
    rnd = random.Random(4)
    vals = [(1, grn), (25, grn)]
    for f in range(26, 46, 2):
        vals.append((f, grn * (0.2 if rnd.random() < 0.3 else rnd.uniform(0.7, 1.1))))
    vals += [(52, grn * 0.35), (66, 0.0), (90, 0.0)]
    key(L["green_rim"], vals)
    red = 1.6e4
    for name in ("red_rim_l", "red_rim_r"):
        key(L[name], [(1, 0), (30, 0), (45, red * 0.18), (58, red * 0.9), (72, red * 1.1), (90, red * 1.2)])
    key(L["red_under"], [(1, 0), (50, 0), (64, 4e3), (90, 6e3)])
    for cname in ("card_l", "card_r", "card_back"):
        ob, em = L[cname]
        for f, v in ((1, em.inputs["Strength"].default_value), (40, em.inputs["Strength"].default_value), (70, 1.2)):
            em.inputs["Strength"].default_value = v
            em.inputs["Strength"].keyframe_insert("default_value", frame=f)
    for f, v in ((1, 0.6), (30, 0.6), (65, 0.05), (90, 0.03)):
        world_bg.inputs["Strength"].default_value = v
        world_bg.inputs["Strength"].keyframe_insert("default_value", frame=f)
