"""Rigged, clothed characters built from the MakeHuman CC0 base mesh (assets/characters/makehuman).

  make_character(preset)  -> builds the character in the current scene, returns (armature, [objects])
  presets: jensen (stylized illustration: short grey hair, thin glasses, black leather jacket,
           black shirt, dark trousers; NOT a copy of a real face), exec_a/b/c, investor_a/b/c.
  pose helpers: aim(arm, bone, direction), set_pose(arm, POSES[name]), key_pose(arm, frame)

Pipeline: parse base.obj (keeping MakeHuman vertex order) -> apply ethnic/age/gender + universal
weight targets -> armature from default.mhskel joint centroids -> skin weights from
default_weights.mhw -> clothing shells grown from body regions (classified by bone weights),
hair cap, eyes, glasses. 1 Blender unit = 1 cm (MakeHuman decimetres x 10), Z up, facing -Y.

Usage: .venv/bin/python scripts/build_character.py [preset ...]   (saves assets/characters/<preset>.blend)
"""
import json
import math
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy  # noqa: E402
import bmesh  # noqa: E402
from mathutils import Vector, Matrix, Quaternion  # noqa: E402

import common as C  # noqa: E402

MH = C.ROOT / "assets/characters/makehuman"
SCALE = 10.0

PRESETS = {
    # race weights, gender (1 = male), age 0..1 (0 = young 25, 1 = old 90), weight target, outfit, hair
    "jensen":     dict(race="asian", male=1, age=0.55, wt="averageweight", skin="#C69C7E", outfit="leather_croc",
                       hair=("short_side", "#C4C6CA"), glasses=True),
    "exec_a":     dict(race="caucasian", male=0, age=0.25, wt="averageweight", skin="#E3B9A0", outfit="suit_navy",
                       hair=("bob", "#3A2A20"), glasses=False),
    "exec_b":     dict(race="african", male=1, age=0.3, wt="averageweight", skin="#6E4A35", outfit="suit_charcoal",
                       hair=("buzz", "#141010"), glasses=False),
    "exec_c":     dict(race="caucasian", male=1, age=0.7, wt="maxweight", skin="#E0B49A", outfit="suit_grey",
                       hair=("short_side", "#C9C6C0"), glasses=True),
    "investor_a": dict(race="asian", male=0, age=0.2, wt="minweight", skin="#D9AE8E", outfit="shirt_white",
                       hair=("bob", "#1A1412"), glasses=False),
    "investor_b": dict(race="caucasian", male=1, age=0.35, wt="averageweight", skin="#E6BFA6", outfit="shirt_blue",
                       hair=("short_side", "#5A4632"), glasses=True),
    "investor_c": dict(race="african", male=0, age=0.3, wt="averageweight", skin="#7A5038", outfit="suit_navy",
                       hair=("bun", "#120E0C"), glasses=False),
}

OUTFITS = {
    "leather_croc":  dict(jacket=("#0A0A0B", "croc"), shirt="#0E0F11", trousers="#141518", shoes="#0A0A0A", tie=None),
    "leather":       dict(jacket=("#0B0B0C", "leather"), shirt="#111214", trousers="#16171A", shoes="#0A0A0A", tie=None),
    "suit_navy":     dict(jacket=("#1B2433", "wool"), shirt="#EDEFF2", trousers="#1B2433", shoes="#0E0C0B", tie=None),
    "suit_charcoal": dict(jacket=("#2A2C30", "wool"), shirt="#F0F2F5", trousers="#2A2C30", shoes="#0E0C0B", tie="#7A1F28"),
    "suit_grey":     dict(jacket=("#55585E", "wool"), shirt="#E9EDF2", trousers="#46494E", shoes="#120F0D", tie="#1E3550"),
    "shirt_white":   dict(jacket=None, shirt="#E8EAEE", trousers="#1E2028", shoes="#141414", tie=None),
    "shirt_blue":    dict(jacket=None, shirt="#8FB2D6", trousers="#2C2F36", shoes="#1A1410", tie=None),
}

TORSO = {"spine01", "spine02", "spine03", "spine04", "spine05", "clavicle.L", "clavicle.R", "shoulder01.L",
         "shoulder01.R", "breast.L", "breast.R", "neck01"}
ARMS = {"upperarm01.L", "upperarm01.R", "upperarm02.L", "upperarm02.R", "lowerarm01.L", "lowerarm01.R",
        "lowerarm02.L", "lowerarm02.R"}
LEGS = {"pelvis.L", "pelvis.R", "upperleg01.L", "upperleg01.R", "upperleg02.L", "upperleg02.R",
        "lowerleg01.L", "lowerleg01.R", "lowerleg02.L", "lowerleg02.R", "root"}


# ------------------------------------------------------------------ data loading
def load_base():
    verts, faces, groups = [], [], []
    g = None
    for line in open(MH / "base.obj"):
        if line.startswith("v "):
            x, y, z = map(float, line.split()[1:4])
            verts.append(Vector((x * SCALE, -z * SCALE, y * SCALE)))
        elif line.startswith("g "):
            g = line.split()[1]
        elif line.startswith("f "):
            faces.append([int(p.split("/")[0]) - 1 for p in line.split()[1:]])
            groups.append(g)
    return verts, faces, groups


def load_target(name):
    d = {}
    for line in open(MH / "targets" / f"{name}.target"):
        if line[0].isdigit():
            i, x, y, z = line.split()
            d[int(i)] = Vector((float(x) * SCALE, -float(z) * SCALE, float(y) * SCALE))
    return d


def apply_targets(verts, p):
    g = "male" if p["male"] else "female"
    for age, w in (("young", 1 - p["age"]), ("old", p["age"])):
        for tgt in (f"{p['race']}-{g}-{age}", f"universal-{g}-{age}-averagemuscle-{p['wt']}"):
            for i, dv in load_target(tgt).items():
                verts[i] = verts[i] + dv * w
    return verts


# ------------------------------------------------------------------ materials
def mat_skin(hexc):
    m, p = C.principled("Skin", hexc, rough=0.48)
    p.inputs["Subsurface Weight"].default_value = 0.22
    p.inputs["Subsurface Radius"].default_value = (1.0, 0.35, 0.2)
    p.inputs["Subsurface Scale"].default_value = 0.4
    C.micro_roughness(m, p, 0.48, 0.06, 300, 0.004)
    return m


def mat_cloth(hexc, kind):
    if kind == "croc":                                              # glossy embossed leather (scale pattern)
        m, p = C.principled("LeatherCroc", hexc, rough=0.2, coat=0.85)
        p.inputs["Coat Roughness"].default_value = 0.12
        b = C.NB(m)
        tc = b.node("ShaderNodeTexCoord")
        vor = b.node("ShaderNodeTexVoronoi", in_Scale=0.9)
        vor.feature = "DISTANCE_TO_EDGE"
        b.link(tc.outputs["Object"], vor.inputs["Vector"])
        ramp = b.node("ShaderNodeMapRange")
        ramp.inputs["From Min"].default_value = 0.0; ramp.inputs["From Max"].default_value = 0.08
        b.link(vor.outputs["Distance"], ramp.inputs["Value"])
        bp = b.node("ShaderNodeBump", in_Strength=0.6, in_Distance=0.25)
        b.link(ramp.outputs["Result"], bp.inputs["Height"])
        b.link(bp.outputs["Normal"], p.inputs["Normal"])
        b.link(bp.outputs["Normal"], p.inputs["Coat Normal"])
        return m
    if kind == "leather":
        m, p = C.principled("Leather", hexc, rough=0.5, coat=0.12)
        p.inputs["Coat Roughness"].default_value = 0.35
        b, bp = C.micro_roughness(m, p, 0.5, 0.14, 9, 0.12)            # soft creases + grain variation
    else:
        m, p = C.principled("Wool_" + hexc, hexc, rough=0.78)
        p.inputs["Sheen Weight"].default_value = 0.4
        C.micro_roughness(m, p, 0.78, 0.05, 160, 0.02)
    return m


# ------------------------------------------------------------------ build
def to_bone(ob, arm, bname):
    """Parent ob to a bone without moving it (rest pose)."""
    b = arm.data.bones[bname]
    ob.parent = arm
    ob.parent_type = "BONE"
    ob.parent_bone = bname
    ob.matrix_parent_inverse = (arm.matrix_world @ b.matrix_local @ Matrix.Translation((0, b.length, 0))).inverted()


def make_character(preset="jensen", name=None, loc=(0, 0, 0)):
    P = PRESETS[preset]
    O = OUTFITS[P["outfit"]]
    name = name or preset
    verts, faces, groups = load_base()
    verts = apply_targets(verts, P)
    # MakeHuman's origin sits at the hips: put the soles on the ground (z = 0)
    body_vs = {v for f, g in zip(faces, groups) if g == "body" for v in f}
    z0 = min(verts[v].z for v in body_vs)
    verts = [v - Vector((0, 0, z0)) for v in verts]
    skel = json.load(open(MH / "default.mhskel"))
    W = json.load(open(MH / "default_weights.mhw"))["weights"]
    joint = {k: sum((verts[i] for i in v), Vector()) / len(v) for k, v in skel["joints"].items()}
    # dominant bone per vertex
    dom, domw = {}, defaultdict(float)
    vg = defaultdict(list)
    for bone, lst in W.items():
        for vi, w in lst:
            vg[bone].append((vi, w))
            if w > domw[vi]:
                domw[vi], dom[vi] = w, bone

    coll = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(coll)

    # armature
    ad = bpy.data.armatures.new(name + "_rig")
    arm = bpy.data.objects.new(name + "_rig", ad)
    coll.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="EDIT")
    for bname, b in skel["bones"].items():
        eb = ad.edit_bones.new(bname)
        eb.head, eb.tail = joint[b["head"]], joint[b["tail"]]
        if (eb.tail - eb.head).length < 0.05:
            eb.tail = eb.head + Vector((0, 0, 0.5))
        eb.roll = 0
    for bname, b in skel["bones"].items():
        if b["parent"]:
            ad.edit_bones[bname].parent = ad.edit_bones[b["parent"]]
    bpy.ops.object.mode_set(mode="OBJECT")

    def part(pname, face_sel, mat, offset=0.0, solid=0.0, subd=1, smooth=True, relax=0):
        used = sorted({v for fi in face_sel for v in faces[fi]})
        remap = {v: k for k, v in enumerate(used)}
        me = bpy.data.meshes.new(pname)
        pts = [verts[v] for v in used]
        me.from_pydata([tuple(p) for p in pts], [], [[remap[v] for v in faces[fi]] for fi in face_sel])
        me.update()
        orig = [(v.co.copy(), v.normal.copy()) for v in me.vertices]
        if relax:
            # drape: inflate well past the body, smooth hard (anatomy disappears), then keep a minimum gap
            for v, (o, n) in zip(me.vertices, orig):
                v.co = o + n * offset * 2.2
            bm = bmesh.new(); bm.from_mesh(me)
            inner = [v for v in bm.verts if not v.is_boundary]
            for it in range(relax):
                bmesh.ops.smooth_vert(bm, verts=inner, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
                if it % 4 == 3:
                    bm.verts.ensure_lookup_table()
                    for bv, (o, n) in zip(bm.verts, orig):
                        d = (bv.co - o).dot(n)
                        if d < offset:
                            bv.co += n * (offset - d)
            bm.to_mesh(me); bm.free(); me.update()
        if offset:                                  # never closer to the skin than `offset`
            for v, (o, n) in zip(me.vertices, orig):
                d = (v.co - o).dot(n)
                v.co += n * max(0.0, offset - d)
        for poly in me.polygons:
            poly.use_smooth = smooth
        ob = bpy.data.objects.new(pname, me)
        coll.objects.link(ob)
        me.materials.append(mat)
        for bone, lst in vg.items():
            g = ob.vertex_groups.new(name=bone)
            for vi, w in lst:
                if vi in remap:
                    g.add([remap[vi]], w, "REPLACE")
        if solid:
            s = ob.modifiers.new("Thickness", "SOLIDIFY"); s.thickness = solid; s.offset = 1
        if subd:
            s = ob.modifiers.new("Subsurf", "SUBSURF"); s.levels = subd; s.render_levels = subd
        a = ob.modifiers.new("Armature", "ARMATURE"); a.object = arm
        ob.modifiers.move(len(ob.modifiers) - 1, 0)       # deform first, then thicken / subdivide
        ob.parent = arm
        return ob

    body_faces = [i for i, g in enumerate(groups) if g == "body"]
    fdom = lambda fi: [dom.get(v, "") for v in faces[fi]]
    def frac(fi, S): d = fdom(fi); return sum(1 for b in d if b in S) / len(d)
    eye_z = joint.get("head____head", Vector((0, 0, 160))).z
    head_c = (joint["head____head"] + joint["head____tail"]) / 2
    zs = [verts[v].z for v in range(len(verts))]

    objs = []
    nofeet = [fi for fi in body_faces if not all(dom.get(v, "").startswith(("toe", "foot")) for v in faces[fi])]
    objs.append(part(name + "_body", nofeet, mat_skin(P["skin"]), subd=1))
    # eyes (MakeHuman helper eye spheres) + iris discs
    eyes = [i for i, g in enumerate(groups) if g in ("helper-l-eye", "helper-r-eye")]
    m_eye, _ = C.principled("Eye", "#B9B3AC", rough=0.15, coat=1.0)
    objs.append(part(name + "_eyes", eyes, m_eye, subd=0))
    m_iris, _ = C.principled("Iris", "#1B120D", rough=0.2, coat=1.0)
    for side in ("l", "r"):
        ev = sorted({v for fi in eyes if groups[fi] == f"helper-{side}-eye" for v in faces[fi]})
        c = sum((verts[v] for v in ev), Vector()) / len(ev)
        r = max((verts[v] - c).length for v in ev)
        bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=True, segments=16, radius=r * 0.3)
        io = C.mesh_obj(f"{name}_iris_{side}", bm, m_iris)
        io.location = c + Vector((0, -r * 0.99, 0)); io.rotation_euler = (math.pi / 2, 0, 0)
        coll.objects.link(io); to_bone(io, arm, "head")
        objs.append(io)

    # clothing shells
    torso_f = [fi for fi in body_faces if frac(fi, TORSO | ARMS) >= 0.75 and min(verts[v].z for v in faces[fi]) > joint["pelvis.L____head"].z - 6]
    tset = set(torso_f)
    hip_z = joint["pelvis.L____head"].z + 4
    handish = lambda fi: any(b.startswith(("wrist", "finger", "metacarpal", "foot", "toe")) for b in fdom(fi))
    leg_f = [fi for fi in body_faces if fi not in tset and not handish(fi) and (frac(fi, LEGS) >= 0.34 or max(verts[v].z for v in faces[fi]) < hip_z)]
    foot_f = [fi for fi in body_faces if all(b.startswith(("foot", "toe")) for b in fdom(fi))]
    neck_z = joint["neck01____head"].z
    shirt_f = [fi for fi in torso_f if frac(fi, ARMS) < 0.5 or O["jacket"] is None]
    objs.append(part(name + "_shirt", shirt_f if O["jacket"] else torso_f,
                     mat_cloth(O["shirt"], "cotton"), offset=0.6 if O["jacket"] else 1.3, subd=1, relax=6 if O["jacket"] else 40))
    if O["jacket"]:
        front_open = lambda fi: all(abs(verts[v].x) < 3.2 and verts[v].y < joint["spine03____head"].y and verts[v].z > joint["spine04____head"].z
                                    for v in faces[fi])
        jf = [fi for fi in torso_f if max(verts[v].z for v in faces[fi]) < neck_z + 1.5]
        objs.append(part(name + "_jacket", jf, mat_cloth(*O["jacket"]), offset=1.6, solid=0.45, subd=1, relax=40))
    if O["jacket"]:
        top = joint["neck01____head"]; chest = joint["spine03____head"]
        front_y = min(verts[v].y for fi in torso_f for v in faces[fi] if abs(verts[v].x) < 2 and abs(verts[v].z - top.z + 9) < 2) - 2.2
        bm = bmesh.new()
        vs = [bm.verts.new(p) for p in ((-5.5, front_y + 1.2, top.z - 1), (5.5, front_y + 1.2, top.z - 1), (0, front_y, top.z - 16))]
        bm.faces.new(vs)
        collar = C.mesh_obj(name + "_collar", bm, mat_cloth(O["shirt"], "cotton"))
        coll.objects.link(collar); to_bone(collar, arm, "spine05"); objs.append(collar)
        if O["jacket"][1] in ("leather", "croc"):           # zipper line down the closed leather jacket
            m_zip, _ = C.principled("Zipper", "#8C9096", metallic=1.0, rough=0.3)
            bm = bmesh.new(); C.add_box(bm, (0.5, 0.4, 44), (0, front_y + 0.1, top.z - 38))
            z = C.mesh_obj(name + "_zip", bm, m_zip); coll.objects.link(z); to_bone(z, arm, "spine03"); objs.append(z)
    if O["tie"]:
        bm = bmesh.new()
        C.add_box(bm, (2.6, 0.4, 32), (0, 0, 0))
        tie = C.mesh_obj(name + "_tie", bm, mat_cloth(O["tie"], "silk"))
        top = joint["neck01____head"]
        tie.location = (0, top.y - 9.5, top.z - 19); coll.objects.link(tie)
        to_bone(tie, arm, "spine04")
        objs.append(tie)
    objs.append(part(name + "_trousers", leg_f, mat_cloth(O["trousers"], "wool"), offset=1.2, subd=1, relax=24))
    m_shoe, _ = C.principled("Shoe", O["shoes"], rough=0.3, coat=0.6)
    for side in ("L", "R"):
        fv = [verts[v] for v, b in dom.items() if b.startswith(("toe", "foot")) and b.endswith(side) and verts[v].z < 14]
        lo = Vector((min(p.x for p in fv), min(p.y for p in fv), 0)); hi = Vector((max(p.x for p in fv), max(p.y for p in fv), max(p.z for p in fv)))
        bm = bmesh.new(); C.add_box(bm, (hi.x - lo.x + 1.6, hi.y - lo.y + 2.0, 7.5), (0, 0, 0))
        shoe = C.mesh_obj(f"{name}_shoe_{side}", bm, m_shoe, smooth=True)
        shoe.location = ((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, 3.75)
        C.bevel_mod(shoe, 2.6, 4)
        coll.objects.link(shoe); to_bone(shoe, arm, f"foot.{side}"); objs.append(shoe)

    # hair cap from the scalp
    style, hcol = P["hair"]
    brow = head_c.z + 3.0
    head_w = max(abs(verts[v].x) for v in range(len(verts)) if dom.get(v) == "head")
    def scalp(fi):
        vs = [verts[v] for v in faces[fi]]
        if not all(dom.get(v) in ("head", "neck03") for v in faces[fi]):
            return False
        z = min(p.z for p in vs); y = sum(p.y for p in vs) / len(vs)
        front = y < head_c.y - 6.0                     # the face itself
        if min(abs(p.x) for p in vs) > head_w * 0.86 and z < head_c.z + 2:
            return False                               # ears
        if style == "bob":
            return (z > head_c.z - 10 and not front) or z > brow
        if front:
            return z > brow                            # hairline above the forehead
        return z > head_c.z - (6.5 if style != "buzz" else 5.0)   # full sides and back, above the nape
    hf = [fi for fi in body_faces if scalp(fi)]
    m_hair, ph = C.principled("Hair", hcol, rough=0.42, aniso=0.7)
    ph.inputs["Coat Weight"].default_value = 0.0
    bh = C.NB(m_hair)
    tc = bh.node("ShaderNodeTexCoord")
    wave = bh.node("ShaderNodeTexWave", in_Scale=6.0, in_Distortion=4.0, in_Detail=6.0)
    wave.bands_direction = "X"                                  # strands run front-to-back (swept back)
    bh.link(tc.outputs["Object"], wave.inputs["Vector"])
    bp = bh.node("ShaderNodeBump", in_Strength=0.35, in_Distance=0.05)
    bh.link(wave.outputs["Fac"], bp.inputs["Height"])
    bh.link(bp.outputs["Normal"], ph.inputs["Normal"])
    thick = {"buzz": 0.35, "short_side": 1.1, "bob": 2.2, "bun": 1.3}[style]
    objs.append(part(name + "_hair", hf, m_hair, offset=thick, solid=0.3, subd=1, relax=6))
    if style == "bun":
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=10, radius=4.5)
        bun = C.mesh_obj(name + "_bun", bm, m_hair, smooth=True)
        bun.location = head_c + Vector((0, 9.5, 4)); coll.objects.link(bun)
        to_bone(bun, arm, "head")

    if P["glasses"]:
        objs += glasses(name, arm, coll, verts, faces, groups)
    for o in objs:
        if o.name not in coll.objects:
            coll.objects.link(o)
    arm.location = loc
    arm["preset"] = preset
    return arm, objs


def glasses(name, arm, coll, verts, faces, groups):
    m_frame, _ = C.principled("GlassesFrame", "#1A1C1F", metallic=0.9, rough=0.25)
    m_lens, pl = C.principled("Lens", "#FFFFFF", rough=0.02)
    pl.inputs["Transmission Weight"].default_value = 1.0
    pl.inputs["IOR"].default_value = 1.5
    out = []
    cs = []
    for side in ("l", "r"):
        ev = sorted({v for fi, g in enumerate(groups) if g == f"helper-{side}-eye" for v in faces[fi]})
        cs.append(sum((verts[v] for v in ev), Vector()) / len(ev))
    for k, c in enumerate(cs):
        cu = bpy.data.curves.new(f"{name}_rim{k}", "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = 0.11; cu.bevel_resolution = 2
        sp = cu.splines.new("POLY"); n = 28; sp.points.add(n); sp.use_cyclic_u = True
        for i in range(n + 1):
            a = i / n * 2 * math.pi
            x, z = 2.55 * math.copysign(abs(math.cos(a)) ** 0.7, math.cos(a)), 1.75 * math.copysign(abs(math.sin(a)) ** 0.8, math.sin(a))
            sp.points[i].co = (c.x + x, c.y - 2.1, c.z + z - 0.2, 1)
        ob = bpy.data.objects.new(f"{name}_rim{k}", cu); ob.data.materials.append(m_frame); out.append(ob)
    mid = (cs[0] + cs[1]) / 2
    def strut(nm, pts, r=0.1):
        cu = bpy.data.curves.new(nm, "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = r
        sp = cu.splines.new("POLY"); sp.points.add(len(pts) - 1)
        for p, q in zip(sp.points, pts): p.co = (*q, 1)
        ob = bpy.data.objects.new(nm, cu); ob.data.materials.append(m_frame); return ob
    out.append(strut(f"{name}_bridge", [(mid.x - 1.0, mid.y - 2.1, mid.z + 0.4), (mid.x, mid.y - 2.5, mid.z + 0.8), (mid.x + 1.0, mid.y - 2.1, mid.z + 0.4)]))
    for k, s in enumerate((-1, 1)):
        c = cs[0] if (cs[0].x > 0) == (s > 0) else cs[1]
        out.append(strut(f"{name}_temple{k}", [(c.x + s * 2.6, c.y - 2.0, c.z + 0.4), (c.x + s * 3.6, c.y + 3.0, c.z + 0.5), (c.x + s * 3.8, c.y + 8.5, c.z - 0.6)]))
    for ob in out:
        coll.objects.link(ob)
        to_bone(ob, arm, "head")
    return out


# ------------------------------------------------------------------ posing
def aim(arm, bname, d, roll_ref=None):
    """Point a bone along armature-space direction d (keeps head position)."""
    pb = arm.pose.bones[bname]
    bpy.context.view_layer.update()
    cur = pb.matrix.copy()
    y = (cur.to_3x3() @ Vector((0, 1, 0))).normalized()
    q = y.rotation_difference(Vector(d).normalized())
    m = (q.to_matrix().to_4x4() @ cur.to_3x3().to_4x4())
    m.translation = cur.translation
    pb.matrix = m
    bpy.context.view_layer.update()


def turn(arm, bname, axis, deg):
    """Rotate a bone about an armature-space axis through its head."""
    pb = arm.pose.bones[bname]
    bpy.context.view_layer.update()
    cur = pb.matrix.copy()
    R = Quaternion(Vector(axis), math.radians(deg)).to_matrix().to_4x4()
    m = R @ cur.to_3x3().to_4x4(); m.translation = cur.translation
    pb.matrix = m
    bpy.context.view_layer.update()


def rest(arm):
    for pb in arm.pose.bones:
        pb.rotation_mode = "QUATERNION"
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.location = (0, 0, 0)
    bpy.context.view_layer.update()


# poses are lists of (op, bone, args) applied root -> tip
ARMS_DOWN = [("aim", "upperarm01.L", (0.18, 0.05, -1)), ("aim", "upperarm02.L", (0.16, 0.05, -1)),
             ("aim", "lowerarm01.L", (0.1, -0.12, -1)), ("aim", "lowerarm02.L", (0.1, -0.12, -1)),
             ("aim", "upperarm01.R", (-0.18, 0.05, -1)), ("aim", "upperarm02.R", (-0.16, 0.05, -1)),
             ("aim", "lowerarm01.R", (-0.1, -0.12, -1)), ("aim", "lowerarm02.R", (-0.1, -0.12, -1))]
POSES = {
    "stand": ARMS_DOWN,
    # right forearm forward, palm up at chest height (holding the GPU), left arm relaxed
    "present": ARMS_DOWN[:4] + [("aim", "upperarm01.R", (-0.25, -0.25, -1)), ("aim", "upperarm02.R", (-0.22, -0.3, -1)),
                                ("aim", "lowerarm01.R", (0.15, -1, 0.25)), ("aim", "lowerarm02.R", (0.15, -1, 0.25)),
                                ("turn", "wrist.R", ((0, 1, 0), -80))],
    "gesture": [("aim", "upperarm01.L", (0.35, -0.3, -1)), ("aim", "upperarm02.L", (0.32, -0.32, -1)),
                ("aim", "lowerarm01.L", (0.35, -1, 0.35)), ("aim", "lowerarm02.L", (0.35, -1, 0.35))] + ARMS_DOWN[4:],
    "chin": ARMS_DOWN[:4] + [("aim", "upperarm01.R", (-0.15, -0.35, -1)), ("aim", "upperarm02.R", (-0.12, -0.38, -1)),
                             ("aim", "lowerarm01.R", (0.25, -0.35, 1)), ("aim", "lowerarm02.R", (0.25, -0.35, 1))],
    "point": ARMS_DOWN[:4] + [("aim", "upperarm01.R", (-0.3, -1, 0.15)), ("aim", "upperarm02.R", (-0.3, -1, 0.15)),
                              ("aim", "lowerarm01.R", (-0.25, -1, 0.3)), ("aim", "lowerarm02.R", (-0.25, -1, 0.3))],
    "sit": ARMS_DOWN[:4] + [("aim", "upperarm01.R", (-0.2, -0.45, -1)), ("aim", "upperarm02.R", (-0.2, -0.45, -1)),
                            ("aim", "lowerarm01.R", (-0.05, -1, -0.1)), ("aim", "lowerarm02.R", (-0.05, -1, -0.1)),
                            ("aim", "upperarm01.L", (0.2, -0.45, -1)), ("aim", "upperarm02.L", (0.2, -0.45, -1)),
                            ("aim", "lowerarm01.L", (0.05, -1, -0.1)), ("aim", "lowerarm02.L", (0.05, -1, -0.1)),
                            ("aim", "upperleg01.L", (0.05, -1, -0.05)), ("aim", "upperleg02.L", (0.05, -1, -0.05)),
                            ("aim", "upperleg01.R", (-0.05, -1, -0.05)), ("aim", "upperleg02.R", (-0.05, -1, -0.05)),
                            ("aim", "lowerleg01.L", (0, 0.05, -1)), ("aim", "lowerleg02.L", (0, 0.05, -1)),
                            ("aim", "lowerleg01.R", (0, 0.05, -1)), ("aim", "lowerleg02.R", (0, 0.05, -1)),
                            ("aim", "foot.L", (0, -1, -0.15)), ("aim", "foot.R", (0, -1, -0.15))],
}


def set_pose(arm, ops, extra=()):
    rest(arm)
    for op, b, a in list(ops) + list(extra):
        if b not in arm.pose.bones:
            continue
        if op == "aim":
            aim(arm, b, a)
        else:
            turn(arm, b, *a)


def key_pose(arm, frame):
    for pb in arm.pose.bones:
        pb.keyframe_insert("rotation_quaternion", frame=frame)


def idle(arm, f0, f1, base_ops, amp=1.0, seed=0, extra=()):
    """Natural idle: breathing in the spine, weight shift, small head drift. Keys every 6 frames."""
    for f in range(f0, f1 + 1, 6):
        t = f / 30.0 + seed
        set_pose(arm, base_ops, list(extra) + [
            ("turn", "spine03", ((1, 0, 0), 1.2 * amp * math.sin(t * 2.1))),
            ("turn", "spine05", ((0, 1, 0), 1.0 * amp * math.sin(t * 0.7))),
            ("turn", "head", ((0, 0, 1), 3.0 * amp * math.sin(t * 0.5))),
            ("turn", "head", ((1, 0, 0), 1.5 * amp * math.sin(t * 0.9 + 1))),
        ])
        key_pose(arm, f)


def walk(arm, f0, f1, stride=24.0, cycle=32):
    """Simple procedural walk cycle (legs + arm swing); moves the rig root forward along -Y."""
    for f in range(f0, f1 + 1, 2):
        ph = (f - f0) / cycle * 2 * math.pi
        s = math.sin(ph)
        ops = list(ARMS_DOWN) + [
            ("turn", "upperleg01.L", ((1, 0, 0), 22 * s)), ("turn", "upperleg01.R", ((1, 0, 0), -22 * s)),
            ("turn", "lowerleg01.L", ((1, 0, 0), -18 * max(0, -s))), ("turn", "lowerleg01.R", ((1, 0, 0), -18 * max(0, s))),
            ("turn", "upperarm01.L", ((1, 0, 0), -14 * s)), ("turn", "upperarm01.R", ((1, 0, 0), 14 * s)),
        ]
        set_pose(arm, [], ops)
        key_pose(arm, f)
        arm.location.y = -(f - f0) / cycle * stride * 2
        arm.keyframe_insert("location", index=1, frame=f)


if __name__ == "__main__":
    names = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    names = names or ["jensen"]
    for nm in names:
        C.reset_scene(); C._MATS.clear()
        arm, objs = make_character(nm)
        # store reusable actions: idle, present, walk
        set_pose(arm, POSES["stand"]); idle(arm, 1, 90, POSES["stand"])
        arm.animation_data.action.name = f"{nm}_idle"
        out = C.ROOT / f"assets/characters/{nm}.blend"
        out.parent.mkdir(parents=True, exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=str(out))
        print("[character]", nm, out)
