"""Hero AI accelerator package (original procedural geometry, Blackwell-class layout).

Layout follows publicly described Blackwell-class packaging: two reticle-sized
compute dies side by side on a silicon interposer, four HBM stacks flanking
each die, an organic substrate with decoupling capacitors and a brushed metal
stiffener ring. Dimensions are illustrative but proportionate (1 unit = 1 cm).

Hierarchy:  GPU_Package (empty, animated rise)
              ├ substrate, stiffener ring, interposer, dies, HBM, underfill
              ├ capacitor field, NVIDIA etching
              └ Fragments (pre-cut metal chips embedded in the ring edge)
"""
import math
import random

import bpy
import bmesh
from mathutils import Vector, Matrix

import common as C

SUB = (11.0, 7.0, 0.14)
RING_OUT = (10.6, 6.6)
RING_IN = (9.0, 5.0)
RING_H = 0.20
DIE = (2.55, 3.30, 0.075)
HBM = (0.95, 0.78, 0.07)
INTERPOSER = (7.4, 3.55, 0.06)


def build_gpu(parent_loc=(0, 0, 0.03)):
    M = C.mats()
    root = bpy.data.objects.new("GPU_Package", None)
    root.empty_display_size = 3
    root.location = parent_loc
    C.link(root)

    z = 0.0
    # BGA ball field under the substrate (visible only at grazing angles)
    bm = bmesh.new()
    for ix in range(-24, 25):
        for iy in range(-15, 16):
            r = bmesh.ops.create_uvsphere(bm, u_segments=8, v_segments=4, radius=0.012)
            for v in r["verts"]:
                v.co += Vector((ix * 0.21, iy * 0.21, 0.0))
    C.link(C.mesh_obj("BGA_Balls", bm, M["cap_end"], smooth=True), root)

    sub = C.box("Substrate", SUB, (0, 0, z + SUB[2] / 2), M["substrate"], 0.02, 2, root)
    z += SUB[2]

    # stiffener ring = outer box minus inner (built as 4 bevelled bars)
    rw_x = (RING_OUT[0] - RING_IN[0]) / 2
    rw_y = (RING_OUT[1] - RING_IN[1]) / 2
    bars = [
        ((RING_OUT[0], rw_y, RING_H), (0, -(RING_IN[1] / 2 + rw_y / 2))),
        ((RING_OUT[0], rw_y, RING_H), (0, (RING_IN[1] / 2 + rw_y / 2))),
        ((rw_x, RING_IN[1], RING_H), (-(RING_IN[0] / 2 + rw_x / 2), 0)),
        ((rw_x, RING_IN[1], RING_H), ((RING_IN[0] / 2 + rw_x / 2), 0)),
    ]
    bm = bmesh.new()
    for size, (x, y) in bars:
        C.add_box(bm, size, (x, y, z + RING_H / 2))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    ring = C.mesh_obj("Stiffener_Ring", bm, M["silver"], smooth=True)
    C.link(ring, root)
    C.bevel_mod(ring, 0.03, 3)

    # interposer + underfill + dies + HBM
    C.box("Interposer", INTERPOSER, (0, 0, z + INTERPOSER[2] / 2), M["interposer"], 0.006, 2, root)
    zi = z + INTERPOSER[2]
    C.box("Underfill", (INTERPOSER[0] - 0.12, INTERPOSER[1] - 0.12, 0.025),
          (0, 0, zi + 0.0125), M["underfill"], 0.01, 2, root)
    zd = zi + 0.02
    gap = 0.07
    for s in (-1, 1):
        x = s * (DIE[0] / 2 + gap / 2)
        C.box(f"Compute_Die_{'L' if s < 0 else 'R'}", DIE, (x, 0, zd + DIE[2] / 2),
              M["die"], 0.008, 2, root)
        hx = s * (gap / 2 + DIE[0] + 0.12 + HBM[0] / 2)
        for k in range(4):
            y = (k - 1.5) * (HBM[1] + 0.06)
            C.box(f"HBM_{'L' if s < 0 else 'R'}{k}", HBM, (hx, y, zd + HBM[2] / 2),
                  M["hbm"], 0.01, 2, root)
            # stacked-DRAM layer lines on HBM sides (thin slabs, slightly inset)
            for layer in range(1, 6):
                C.box(f"HBM_layer_{s}_{k}_{layer}", (HBM[0] + 0.002, HBM[1] + 0.002, 0.0015),
                      (hx, y, zd + layer * HBM[2] / 6.5), M["interposer"], 0, 1, root)

    # decoupling capacitor field between interposer and ring
    rnd = random.Random(7)
    bm = bmesh.new()
    def cap(x, y, rot, L=0.07, W=0.035, H=0.03):
        e = L * 0.22
        vs = []
        vs += C.add_box(bm, (L - 2 * e, W * 0.96, H * 0.95), (0, 0, H / 2), 0)
        vs += C.add_box(bm, (e, W, H), (-(L - e) / 2, 0, H / 2), 1)
        vs += C.add_box(bm, (e, W, H), ((L - e) / 2, 0, H / 2), 1)
        mat = Matrix.Translation((x, y, z)) @ Matrix.Rotation(rot, 4, "Z")
        for v in vs:
            v.co = mat @ v.co
    xs = INTERPOSER[0] / 2 + 0.12, RING_IN[0] / 2 - 0.08
    ys = INTERPOSER[1] / 2 + 0.12, RING_IN[1] / 2 - 0.08
    for side in (-1, 1):
        # long sides (y)
        for i in range(70):
            x = rnd.uniform(-RING_IN[0] / 2 + 0.15, RING_IN[0] / 2 - 0.15)
            y = side * rnd.uniform(*ys)
            if abs(x) < 0.4 and rnd.random() < 0.7:
                continue
            cap(x, y, (math.pi / 2) * rnd.randint(0, 1))
        # rows in neat banks along the short sides (x)
        for row in range(6):
            for col in range(14):
                x = side * (xs[0] + 0.06 + row * 0.1)
                y = (col - 6.5) * 0.2
                if x * side < xs[1]:
                    cap(x, y, math.pi / 2)
    C.link(C.mesh_obj("Package_Caps", bm, [M["cap_body"], M["cap_end"]]), root)

    # NVIDIA laser etching on the front stiffener bar
    etch(root, "NVIDIA", (0, -(RING_IN[1] / 2 + rw_y / 2), z + RING_H + 0.001), 0.40, M["etch"])
    etch(root, "AI ACCELERATOR  ·  3D ILLUSTRATION", (0, (RING_IN[1] / 2 + rw_y / 2), z + RING_H + 0.001),
         0.17, M["etch"])

    frags = build_fragments(root, z + RING_H)
    return root, frags


def etch(parent, text, loc, size, mat):
    cu = bpy.data.curves.new(f"txt_{text[:8]}", "FONT")
    cu.body = text
    font_path = str(C.ROOT / "assets/fonts/InterDisplay-Bold.otf")
    cu.font = bpy.data.fonts.load(font_path, check_existing=True)
    cu.size = size
    cu.align_x = "CENTER"
    cu.align_y = "CENTER"
    cu.extrude = 0.0015
    cu.space_character = 1.08
    ob = bpy.data.objects.new(f"Etch_{text[:8]}", cu)
    ob.data.materials.append(mat)
    ob.location = loc
    C.link(ob, parent)
    return ob


def build_fragments(root, ztop, count=46, seed=11):
    """Irregular metal chips embedded flush in the ring's outer edge.

    They are invisible against the ring until the collapse, when they peel away.
    Returns list of (object, outward_direction).
    """
    M = C.mats()
    rnd = random.Random(seed)
    out = []
    hx, hy = RING_OUT[0] / 2, RING_OUT[1] / 2
    for i in range(count):
        # pick a point on the outer perimeter, biased to the front edge + corners
        side = rnd.choices(["front", "left", "right", "back"], [0.4, 0.22, 0.22, 0.16])[0]
        if side == "front":
            p, n = Vector((rnd.uniform(-hx, hx), -hy, 0)), Vector((0, -1, 0))
        elif side == "back":
            p, n = Vector((rnd.uniform(-hx, hx), hy, 0)), Vector((0, 1, 0))
        elif side == "left":
            p, n = Vector((-hx, rnd.uniform(-hy, hy), 0)), Vector((-1, 0, 0))
        else:
            p, n = Vector((hx, rnd.uniform(-hy, hy), 0)), Vector((1, 0, 0))
        s = rnd.uniform(0.09, 0.3) * (1.4 if rnd.random() < 0.15 else 1.0)
        bm = bmesh.new()
        pts = [Vector((rnd.uniform(-1, 1) * s, rnd.uniform(-1, 1) * s * 0.8,
                       rnd.uniform(-1, 1) * s * 0.35)) for _ in range(12)]
        bmesh.ops.convex_hull(bm, input=[bm.verts.new(q) for q in pts])
        ob = C.mesh_obj(f"Fragment_{i:02d}", bm, M["silver"])
        ob.location = p - n * (s * 1.05) + Vector((0, 0, ztop - s * 0.37))
        ob.rotation_euler = (0, 0, rnd.uniform(0, math.pi))
        C.link(ob, root)
        C.bevel_mod(ob, 0.004, 1)
        out.append((ob, n, rnd.random()))
    return out


if __name__ == "__main__":
    import sys
    C.reset_scene()
    build_gpu()
    out = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else str(C.ROOT / "assets/models/nvidia_ai_gpu.blend")
    bpy.ops.wm.save_as_mainfile(filepath=out)
    print("saved", out)
