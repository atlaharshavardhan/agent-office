"""Dark server baseboard around the hero package (original procedural geometry).

Copper traces are flat ribbons carrying two per-vertex attributes for the shader:
  u   = distance along the trace in cm (drives the travelling pulses)
  rnd = per-trace random value (pulse offset / which traces carry pulses)
"""
import math
import random

import bpy
import bmesh
from mathutils import Vector, Matrix

import common as C

BOARD = (40.0, 40.0, 0.16)
PKG_HALF = (5.5, 3.5)          # substrate half extents (keep-out for parts)


def ribbon(bm, pts, width, z, us, rnd_val, u_layer, r_layer):
    """Append a flat ribbon following pts (list of Vector2) with miter joints."""
    n = len(pts)
    left, right = [], []
    for i, p in enumerate(pts):
        if i == 0:
            d = (pts[1] - p).normalized()
            perp = Vector((-d.y, d.x))
            off = perp * width / 2
        elif i == n - 1:
            d = (p - pts[i - 1]).normalized()
            perp = Vector((-d.y, d.x))
            off = perp * width / 2
        else:
            d1 = (p - pts[i - 1]).normalized()
            d2 = (pts[i + 1] - p).normalized()
            p1, p2 = Vector((-d1.y, d1.x)), Vector((-d2.y, d2.x))
            mit = (p1 + p2).normalized()
            off = mit * (width / 2) / max(0.3, mit.dot(p1))
        vl = bm.verts.new((p.x + off.x, p.y + off.y, z))
        vr = bm.verts.new((p.x - off.x, p.y - off.y, z))
        for v in (vl, vr):
            v[u_layer] = us[i]
            v[r_layer] = rnd_val
        left.append(vl)
        right.append(vr)
    for i in range(n - 1):
        bm.faces.new((left[i], right[i], right[i + 1], left[i + 1]))


def route(start, out_dir, rnd, length):
    """Manhattan route with one 45-degree jog, like real PCB fan-out."""
    side = Vector((-out_dir.y, out_dir.x)) * rnd.choice((-1, 1))
    a = rnd.uniform(0.3, 1.6)
    j = rnd.uniform(0.2, 2.2)
    pts = [start, start + out_dir * a]
    p2 = pts[-1] + (out_dir + side).normalized() * j * math.sqrt(2)
    pts.append(p2)
    pts.append(p2 + out_dir * max(0.5, length - a - j))
    if rnd.random() < 0.4:
        side2 = Vector((-out_dir.y, out_dir.x)) * rnd.choice((-1, 1))
        pts.append(pts[-1] + (out_dir + side2).normalized() * rnd.uniform(0.3, 1.5))
        pts.append(pts[-1] + out_dir * rnd.uniform(1, 5))
    return pts


def build_traces(seed=3):
    M = C.mats()
    rnd = random.Random(seed)
    bm = bmesh.new()
    u_layer = bm.verts.layers.float.new("u")
    r_layer = bm.verts.layers.float.new("rnd")
    z = BOARD[2] / 2 + 0.003
    ends = []
    pitch = 0.075
    groups = []
    # four package edges -> outward bundles
    for sx in (-1, 1):
        x0 = sx * (PKG_HALF[0] + 0.15)
        for k in range(int(6.6 / pitch)):
            y = -3.3 + k * pitch
            groups.append((Vector((x0, y)), Vector((sx, 0))))
    for sy in (-1, 1):
        y0 = sy * (PKG_HALF[1] + 0.15)
        for k in range(int(10.6 / pitch)):
            x = -5.3 + k * pitch
            groups.append((Vector((x, y0)), Vector((0, sy))))
    # bundles: consecutive traces share the jog so they run parallel
    i = 0
    while i < len(groups):
        nb = rnd.randint(4, 12)
        length = rnd.uniform(4, 16)
        jog = rnd.uniform(0.2, 2.0) * rnd.choice((-1, 1))
        a = rnd.uniform(0.3, 1.5)
        for k in range(nb):
            if i >= len(groups):
                break
            start, d = groups[i]
            if rnd.random() < 0.12:     # gaps in bundles look more real
                i += 1
                continue
            side = Vector((-d.y, d.x)) * (1 if jog > 0 else -1)
            pts = [start, start + d * (a + k * pitch * 0.0)]
            # parallel 45-degree jog: inner traces jog later to keep spacing
            pj = pts[-1] + d * (k * pitch * 0.41) * (1 if jog > 0 else 1)
            pts.append(pj)
            p2 = pj + (d + side).normalized() * abs(jog) * math.sqrt(2)
            pts.append(p2)
            pts.append(p2 + d * length)
            pts = [p for idx, p in enumerate(pts) if idx == 0 or (p - pts[idx - 1]).length > 1e-4]
            us = [0.0]
            for q in range(1, len(pts)):
                us.append(us[-1] + (pts[q] - pts[q - 1]).length)
            ribbon(bm, pts, 0.032, z, us, rnd.random(), u_layer, r_layer)
            ends.append(pts[-1])
            i += 1
    # scattered secondary traces across the board
    for _ in range(260):
        start = Vector((rnd.uniform(-19, 19), rnd.uniform(-19, 19)))
        if abs(start.x) < 7 and abs(start.y) < 5:
            continue
        d = rnd.choice([Vector((1, 0)), Vector((-1, 0)), Vector((0, 1)), Vector((0, -1))])
        pts = route(start, d, rnd, rnd.uniform(2, 9))
        us = [0.0]
        for q in range(1, len(pts)):
            us.append(us[-1] + (pts[q] - pts[q - 1]).length)
        ribbon(bm, pts, rnd.choice((0.03, 0.045, 0.07)), z, us, rnd.random(), u_layer, r_layer)
        ends.append(pts[-1])
    me = bpy.data.meshes.new("Copper_Traces")
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new("Copper_Traces", me)
    me.materials.append(M["trace"])
    C.link(ob)
    sol = ob.modifiers.new("Thickness", "SOLIDIFY")
    sol.thickness = 0.0035
    sol.offset = 1
    return ob, ends


def build_vias(ends):
    M = C.mats()
    bm = bmesh.new()
    z = BOARD[2] / 2 + 0.002
    for p in ends:
        r = bmesh.ops.create_cone(bm, segments=12, radius1=0.05, radius2=0.045, depth=0.008,
                                  cap_ends=True)
        for v in r["verts"]:
            v.co += Vector((p.x, p.y, z + 0.004))
    ob = C.mesh_obj("Vias", bm, M["gold"], smooth=True)
    C.link(ob)


def build_board():
    M = C.mats()
    C.box("Baseboard", BOARD, (0, 0, 0), M["pcb"], 0.03, 2)
    # floor under the board for grounded reflections
    C.box("Studio_Floor", (400, 400, 0.1), (0, 0, -0.5), M["floor"])
    rnd = random.Random(5)
    top = BOARD[2] / 2

    # VRM power stage rows (inductors + caps) on left/right of package
    bm = bmesh.new()
    for sx in (-1, 1):
        for k in range(8):
            x = sx * 9.0
            y = -7.0 + k * 2.0
            C.add_box(bm, (1.25, 1.25, 0.55), (x, y, top + 0.275))
            C.add_box(bm, (1.25, 1.25, 0.55), (x + sx * 1.6, y, top + 0.275))
    for sy in (-1, 1):
        for k in range(7):
            C.add_box(bm, (1.25, 1.25, 0.55), (-6.0 + k * 2.0, sy * 7.5, top + 0.275))
    ob = C.mesh_obj("VRM_Inductors", bm, M["inductor"], smooth=True)
    C.link(ob)
    C.bevel_mod(ob, 0.06, 3)

    # MLCC / tantalum field
    bm = bmesh.new()
    def cap(x, y, rot, L, W, H):
        e = L * 0.22
        vs = []
        vs += C.add_box(bm, (L - 2 * e, W * 0.96, H * 0.95), (0, 0, H / 2), 0)
        vs += C.add_box(bm, (e, W, H), (-(L - e) / 2, 0, H / 2), 1)
        vs += C.add_box(bm, (e, W, H), ((L - e) / 2, 0, H / 2), 1)
        mat = Matrix.Translation((x, y, top)) @ Matrix.Rotation(rot, 4, "Z")
        for v in vs:
            v.co = mat @ v.co
    for _ in range(1400):
        x, y = rnd.uniform(-19, 19), rnd.uniform(-19, 19)
        if abs(x) < 6.2 and abs(y) < 4.2:
            continue
        s = rnd.choice((0.1, 0.1, 0.16, 0.2, 0.32))
        cap(x, y, rnd.choice((0, math.pi / 2)), s, s * 0.5, s * 0.45)
    # neat cap banks right outside the package
    for sx in (-1, 1):
        for r in range(3):
            for c in range(30):
                cap(sx * (6.2 + r * 0.25), -3.3 + c * 0.23, math.pi / 2, 0.16, 0.08, 0.07)
    C.link(C.mesh_obj("Board_Caps", bm, [M["cap_body"], M["cap_end"]]))

    # gold contact fingers / pads (edge connector rows + mezzanine pads)
    bm = bmesh.new()
    for sy in (-1, 1):
        for k in range(120):
            C.add_box(bm, (0.09, 0.55, 0.01), (-10.7 + k * 0.18, sy * 11.0, top + 0.005))
    for sx in (-1, 1):
        for i in range(10):
            for j in range(28):
                C.add_box(bm, (0.12, 0.12, 0.008), (sx * (13.2 + i * 0.22), -3.0 + j * 0.22, top + 0.004))
    C.link(C.mesh_obj("Gold_Contacts", bm, M["gold"]))

    # black connectors behind the gold rows
    bm = bmesh.new()
    for sy in (-1, 1):
        C.add_box(bm, (22.4, 0.9, 0.7), (0, sy * 12.2, top + 0.35))
    ob = C.mesh_obj("Connectors", bm, M["plastic"], smooth=True)
    C.link(ob)
    C.bevel_mod(ob, 0.05, 2)

    # board silkscreen branding
    from build_gpu import etch
    t = etch(None, "NVIDIA", (0, -9.4, top + 0.002), 0.9, M["silk_green"])
    t2 = etch(None, "AI SERVER BASEBOARD · ILLUSTRATIVE", (0, 9.4, top + 0.002), 0.35, M["etch"])

    traces, ends = build_traces()
    build_vias(ends)
    return traces


if __name__ == "__main__":
    C.reset_scene()
    build_board()
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "assets/models/motherboard.blend"))
