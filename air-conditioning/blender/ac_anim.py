"""Part 1 animation (0-15 s): window opens -> fan moves into the window and spins up -> ice block slides in.
Same room, same straight-on camera. Only frames where something moves are rendered; holds and the fan-spin loop
reuse frames (see FRAMES / plate_for in the Remotion composition).

Run: nvidia-blender/.venv/bin/python air-conditioning/blender/ac_anim.py -- [--res 0.5] [--samples 16] [--frames 30,45]
Out: air-conditioning/remotion/public/anim1/####.png
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy  # noqa: E402
import ac_scene as A  # noqa: E402
import ac_build as B  # noqa: E402

OUT = A.ROOT / "remotion/public/anim1"
ONLY = [int(x) for x in A.ARGS[A.ARGS.index("--frames") + 1].split(",")] if "--frames" in A.ARGS else None

# ---- timeline (video frames, 30 fps)
SASH = (30, 60)          # lower sash slides up
FAN_IN = (160, 186)      # fan moves into the opening
SPIN = (190, 220)        # blades spin up; constant 24°/frame afterwards (5 blades -> 3-frame loop)
ICE_IN = (340, 372)      # shelf + ice block slide in
SPEED = 24.0


def frames_to_render():
    fr = set(range(SASH[0], SASH[1] + 1)) | set(range(FAN_IN[0], SPIN[1] + 3)) | set(range(ICE_IN[0], ICE_IN[1] + 4))
    return sorted(fr)


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def blade_angle(f):
    if f < SPIN[0]:
        return 0.0
    if f < SPIN[1]:
        n = f - SPIN[0]; d = SPIN[1] - SPIN[0]
        return SPEED * n * n / (2 * d)
    return SPEED * (SPIN[1] - SPIN[0]) / 2 + SPEED * (f - SPIN[1])


def group(names_before, name, pivot):
    """Parent every object created since `names_before` to a new empty (keeps world transforms)."""
    e = bpy.data.objects.new(name, None); bpy.context.scene.collection.objects.link(e); e.location = pivot
    bpy.context.view_layer.update()
    for o in bpy.data.objects:
        if o.name not in names_before and o is not e and o.type in ("MESH", "CURVE"):
            mw = o.matrix_world.copy(); o.parent = e; o.matrix_world = mw
    return e


def build():
    A.reset()
    M = A.materials()
    A.build_room(M, sash_up=False, with_ac=False)
    A.build_outside(M)
    z0 = A.SILL_Z
    lower = [o for o in bpy.data.objects if o.name.startswith("Lower")]
    before = {o.name for o in bpy.data.objects}
    B.window_fan(M, z0)
    fan = group(before, "FanGroup", (0, 0.07, z0 + 0.29))
    blades = bpy.data.objects.new("BladeSpin", None); bpy.context.scene.collection.objects.link(blades)
    blades.location = (0, 0.04, z0 + 0.29)
    bpy.context.view_layer.update()
    mw = blades.matrix_world.copy(); blades.parent = fan; blades.matrix_world = mw
    bpy.context.view_layer.update()
    for o in [o for o in bpy.data.objects if o.name.startswith("Blade") and o.type == "MESH"]:
        mw = o.matrix_world.copy(); o.parent = blades; o.matrix_world = mw
    before = {o.name for o in bpy.data.objects}
    B.ice_tray_on_sill(M, z0)
    ice = group(before, "IceGroup", (0, -0.2, z0))
    A.lights_world()
    A.camera((0, -2.35, 1.42), (0, 0, 1.38), 24)
    return lower, fan, blades, ice


def pose(f, lower, fan, blades, ice, base):
    rise = 0.6 * ease((f - SASH[0]) / (SASH[1] - SASH[0]))                  # lower sash height travel (m)
    for o in lower:
        o.location.z = base[o.name] + rise
    k = ease((f - FAN_IN[0]) / (FAN_IN[1] - FAN_IN[0]))
    fan.hide_render = f < FAN_IN[0]
    for c in fan.children_recursive:
        c.hide_render = f < FAN_IN[0]
    fan.location = (0, 0.07 - 0.9 * (1 - k), A.SILL_Z + 0.29 + 0.15 * (1 - k))
    blades.rotation_euler = (0, math.radians(blade_angle(f)), 0)
    j = ease((f - ICE_IN[0]) / (ICE_IN[1] - ICE_IN[0]))
    for c in [ice] + list(ice.children_recursive):
        c.hide_render = f < ICE_IN[0]
    ice.location = (-1.3 * (1 - j), -0.2, A.SILL_Z)


def main():
    lower, fan, blades, ice = build()
    base = {o.name: o.location.z for o in lower}
    OUT.mkdir(parents=True, exist_ok=True)
    sc = bpy.context.scene
    for f in (ONLY if ONLY is not None else frames_to_render()):
        pose(f, lower, fan, blades, ice, base)
        sc.render.filepath = str(OUT / f"{f:04d}.png")
        bpy.ops.render.render(write_still=True)
        print("rendered", f, flush=True)


main()
