"""Shared helpers: units, mesh builders and the physically based materials.

Scene units: 1 Blender unit = 1 cm (unit scale 0.01), so camera optics
(focal length, f-stop, depth of field) behave like a real macro lens.

All effects are driven by custom properties on the scene (read in the shaders
with an Attribute node of type VIEW_LAYER), so a single keyframed value changes
every material at once:
    fx_time   seconds, drives the travelling circuit pulses
    fx_glow   0..1.5, strength of the circuit illumination (flicker)
    fx_red    radius (cm) of the red wave sweeping out from the GPU centre
    fx_crack  0..1, how far the fracture network has grown
"""
import math
import random
from pathlib import Path

import bpy
import bmesh
from mathutils import Vector

ROOT = Path(__file__).resolve().parent.parent

# Palette (sRGB hex from the brief)
CHARCOAL = "#101214"
NV_GREEN = "#76B900"
SILVER = "#BFC5CC"
COPPER_GOLD = "#C49A52"
DEEP_RED = "#E5484D"


def hex_rgba(h, a=1.0):
    h = h.lstrip("#")
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, a)


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = "METRIC"
    sc.unit_settings.scale_length = 0.01
    sc.unit_settings.length_unit = "CENTIMETERS"
    for k, v in (("fx_time", 0.0), ("fx_glow", 1.0), ("fx_red", -5.0), ("fx_crack", 0.0)):
        sc[k] = v
    return sc


# ---------------------------------------------------------------- mesh helpers
def link(obj, parent=None, coll=None):
    (coll or bpy.context.scene.collection).objects.link(obj)
    if parent is not None:
        obj.parent = parent
    return obj


def mesh_obj(name, bm, mat=None, smooth=False):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    if mat is not None:
        if isinstance(mat, (list, tuple)):
            for m in mat:
                me.materials.append(m)
        else:
            me.materials.append(mat)
    return ob


def add_box(bm, size, loc, mat_index=0):
    """Append an axis-aligned box (size = full extents) to bmesh."""
    sx, sy, sz = size
    res = bmesh.ops.create_cube(bm, size=1.0)
    verts = res["verts"]
    for v in verts:
        v.co.x = v.co.x * sx + loc[0]
        v.co.y = v.co.y * sy + loc[1]
        v.co.z = v.co.z * sz + loc[2]
    faces = {f for v in verts for f in v.link_faces}
    for f in faces:
        f.material_index = mat_index
    return verts


def box(name, size, loc, mat, bevel=0.0, segs=3, parent=None):
    bm = bmesh.new()
    add_box(bm, size, (0, 0, 0))
    ob = mesh_obj(name, bm, mat, smooth=bevel > 0)
    ob.location = loc
    link(ob, parent)
    if bevel > 0:
        bevel_mod(ob, bevel, segs)
    return ob


def bevel_mod(ob, width, segs=3):
    m = ob.modifiers.new("Bevel", "BEVEL")
    m.width = width
    m.segments = segs
    m.limit_method = "ANGLE"
    m.harden_normals = True
    w = ob.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    w.keep_sharp = True
    return m


def set_attr(me, name, values, domain="POINT"):
    a = me.attributes.new(name, "FLOAT", domain)
    a.data.foreach_set("value", values)


# ---------------------------------------------------------------- node helpers
class NB:
    """Tiny node-tree builder to keep material code readable."""

    def __init__(self, mat):
        self.nt = mat.node_tree
        self.n = self.nt.nodes
        self.l = self.nt.links
        self.x = -1400

    def node(self, kind, **props):
        nd = self.n.new(kind)
        nd.location = (self.x, len(self.n) * -40)
        self.x += 60
        for k, v in props.items():
            if k.startswith("in_"):
                key = k[3:].replace("__", " ")
                nd.inputs[key].default_value = v
            else:
                setattr(nd, k, v)
        return nd

    def link(self, a, b):
        self.l.new(a, b)

    def math(self, op, a=None, b=None, clamp=False):
        nd = self.node("ShaderNodeMath", operation=op, use_clamp=clamp)
        for i, v in enumerate((a, b)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                nd.inputs[i].default_value = v
            else:
                self.link(v, nd.inputs[i])
        return nd.outputs[0]

    def attr(self, name, kind="VIEW_LAYER"):
        nd = self.node("ShaderNodeAttribute", attribute_type=kind, attribute_name=name)
        return nd.outputs["Fac"]

    def mix_rgb(self, fac, a, b, blend="MIX"):
        nd = self.node("ShaderNodeMix", data_type="RGBA", blend_type=blend)
        for sock, v in ((nd.inputs[0], fac), (nd.inputs[6], a), (nd.inputs[7], b)):
            if isinstance(v, (int, float, tuple)):
                sock.default_value = v
            else:
                self.link(v, sock)
        return nd.outputs[2]


def new_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m, m.node_tree.nodes["Principled BSDF"]


def principled(name, base, metallic=0.0, rough=0.5, coat=0.0, aniso=0.0,
               spec=0.5, thin_film=0.0):
    m, p = new_mat(name)
    p.inputs["Base Color"].default_value = hex_rgba(base) if isinstance(base, str) else base
    p.inputs["Metallic"].default_value = metallic
    p.inputs["Roughness"].default_value = rough
    p.inputs["Coat Weight"].default_value = coat
    p.inputs["Coat Roughness"].default_value = 0.08
    p.inputs["Anisotropic"].default_value = aniso
    p.inputs["Specular IOR Level"].default_value = spec
    if thin_film:
        p.inputs["Thin Film Thickness"].default_value = thin_film
        p.inputs["Thin Film IOR"].default_value = 1.45
    return m, p


def micro_roughness(m, p, base_rough, amount=0.08, scale=60.0, bump=0.02, stretch=None):
    """Procedural roughness variation + micro bump so surfaces never look CG-flat."""
    b = NB(m)
    tc = b.node("ShaderNodeTexCoord")
    mp = b.node("ShaderNodeMapping")
    if stretch:
        mp.inputs["Scale"].default_value = stretch
    b.link(tc.outputs["Object"], mp.inputs["Vector"])
    nz = b.node("ShaderNodeTexNoise", in_Scale=scale, in_Detail=8.0, in_Roughness=0.6)
    b.link(mp.outputs[0], nz.inputs["Vector"])
    r = b.math("MULTIPLY_ADD", nz.outputs["Fac"], amount * 2)
    rn = b.n[r.node.name]
    rn.inputs[2].default_value = base_rough - amount
    b.link(r, p.inputs["Roughness"])
    bp = b.node("ShaderNodeBump", in_Strength=bump, in_Distance=0.002)
    b.link(nz.outputs["Fac"], bp.inputs["Height"])
    b.link(bp.outputs["Normal"], p.inputs["Normal"])
    b.link(bp.outputs["Normal"], p.inputs["Coat Normal"])
    return b, bp


def add_crack_fx(m, p, b, bump_node, scale=2.2, origin=(0.0, 0.0), glow=6.0, darken=True):
    """Fracture network (Voronoi edges) that grows with scene fx_crack and glows red."""
    tc = b.node("ShaderNodeTexCoord")
    geo = b.node("ShaderNodeNewGeometry")
    vor = b.node("ShaderNodeTexVoronoi", feature="DISTANCE_TO_EDGE", in_Scale=scale)
    b.link(tc.outputs["Object"], vor.inputs["Vector"])
    # thin line, broken up by noise so only some cell edges actually crack
    l1 = b.math("LESS_THAN", vor.outputs["Distance"], 0.007)
    nz = b.node("ShaderNodeTexNoise", in_Scale=0.6, in_Detail=2.0)
    b.link(tc.outputs["Object"], nz.inputs["Vector"])
    keep = b.math("GREATER_THAN", nz.outputs["Fac"], 0.5)
    line = b.math("MULTIPLY", l1, keep)
    # growth mask: distance from crack origin in world XY < fx_crack * R
    sep = b.node("ShaderNodeSeparateXYZ")
    b.link(geo.outputs["Position"], sep.inputs[0])
    dx = b.math("SUBTRACT", sep.outputs[0], origin[0])
    dy = b.math("SUBTRACT", sep.outputs[1], origin[1])
    d = b.math("SQRT", b.math("ADD", b.math("MULTIPLY", dx, dx), b.math("MULTIPLY", dy, dy)))
    crack = b.attr("fx_crack")
    radius = b.math("MULTIPLY", crack, 7.0)
    mask = b.math("LESS_THAN", d, radius)
    crackline = b.math("MULTIPLY", line, mask)
    # glow fades a little at the very front of the crack (hot new crack = brighter)
    em = b.math("MULTIPLY", crackline, glow)
    b.link(em, p.inputs["Emission Strength"])
    p.inputs["Emission Color"].default_value = hex_rgba(DEEP_RED)
    if darken:
        base = p.inputs["Base Color"].default_value[:]
        mixc = b.mix_rgb(crackline, base, (0.01, 0.0, 0.0, 1.0))
        b.link(mixc, p.inputs["Base Color"])
    # crack grooves in the normal
    groove = b.math("MULTIPLY", crackline, -1.0)
    bp2 = b.node("ShaderNodeBump", in_Strength=0.6, in_Distance=0.01)
    b.link(groove, bp2.inputs["Height"])
    b.link(bump_node.outputs["Normal"], bp2.inputs["Normal"])
    b.link(bp2.outputs["Normal"], p.inputs["Normal"])
    return crackline


def circuit_glow(b, p, pulse_period=3.0, speed=7.0, base_glow=0.03, peak=3.5):
    """Travelling pulses along the 'u' attribute (cm along each trace), green -> red."""
    u = b.attr("u", "GEOMETRY")
    rnd = b.attr("rnd", "GEOMETRY")
    t = b.attr("fx_time")
    # phase = fract((u - t*speed)/period + rnd*7)
    ph = b.math("DIVIDE", b.math("SUBTRACT", u, b.math("MULTIPLY", t, speed)), pulse_period)
    ph = b.math("FRACT", b.math("ADD", ph, b.math("MULTIPLY", rnd, 7.0)))
    # comet: bright head at phase->1, tail decaying backwards
    head = b.math("POWER", ph, 14.0)
    on = b.math("GREATER_THAN", rnd, 0.62)          # only ~38% of traces carry pulses
    pulse = b.math("MULTIPLY", head, on)
    glow = b.attr("fx_glow")
    strength = b.math("MULTIPLY", b.math("ADD", b.math("MULTIPLY", pulse, peak), base_glow), glow)
    # red wave radius
    geo = b.node("ShaderNodeNewGeometry")
    sep = b.node("ShaderNodeSeparateXYZ")
    b.link(geo.outputs["Position"], sep.inputs[0])
    d = b.math("SQRT", b.math("ADD", b.math("MULTIPLY", sep.outputs[0], sep.outputs[0]),
                              b.math("MULTIPLY", sep.outputs[1], sep.outputs[1])))
    R = b.attr("fx_red")
    inside = b.math("SUBTRACT", R, d)                  # >0 inside the wave
    redfac = b.node("ShaderNodeMapRange", clamp=True)
    redfac.inputs["From Min"].default_value = -0.6
    redfac.inputs["From Max"].default_value = 0.6
    b.link(inside, redfac.inputs["Value"])
    # bright wave front band
    band = b.math("POWER", b.math("ABSOLUTE", inside), 2.0)
    band = b.math("EXPONENT", b.math("MULTIPLY", band, -4.0))
    band = b.math("MULTIPLY", band, 4.0)
    total = b.math("ADD", strength, band)
    col = b.mix_rgb(redfac.outputs[0], hex_rgba(NV_GREEN), hex_rgba(DEEP_RED))
    b.link(col, p.inputs["Emission Color"])
    b.link(total, p.inputs["Emission Strength"])
    return redfac


# ---------------------------------------------------------------- materials
_MATS = {}


def mats():
    if _MATS:
        return _MATS
    M = _MATS

    # Silicon die backside: dark mirror with faint thin-film sheen, cracks
    m, p = principled("Silicon_Die", "#1A1C21", metallic=0.8, rough=0.08, thin_film=0)
    b, bp = micro_roughness(m, p, 0.09, 0.03, 140, 0.004)
    # faint reticle grid in roughness
    tc = b.node("ShaderNodeTexCoord")
    br = b.node("ShaderNodeTexBrick", in_Scale=9.0, in_Mortar__Size=0.004,
                in_Color1=(0.5, 0.5, 0.5, 1), in_Color2=(0.5, 0.5, 0.5, 1),
                in_Mortar=(0.9, 0.9, 0.9, 1))
    b.link(tc.outputs["Object"], br.inputs["Vector"])
    add_crack_fx(m, p, b, bp, scale=0.9, glow=3.0)
    M["die"] = m

    m, p = principled("HBM_Stack", "#0B0C0E", metallic=0.35, rough=0.22, coat=0.3)
    micro_roughness(m, p, 0.22, 0.05, 90, 0.01)
    M["hbm"] = m

    m, p = principled("Interposer", "#3A3F48", metallic=0.9, rough=0.18, thin_film=300)
    micro_roughness(m, p, 0.18, 0.05, 200, 0.004)
    M["interposer"] = m

    m, p = principled("Underfill", "#0E0F10", rough=0.35, coat=0.6)
    M["underfill"] = m

    # Brushed silver stiffener / heat spreader (anisotropic + crack network)
    m, p = principled("Brushed_Silver", SILVER, metallic=1.0, rough=0.22, aniso=0.65)
    b, bp = micro_roughness(m, p, 0.24, 0.07, 30, 0.03, stretch=(1, 80, 1))
    add_crack_fx(m, p, b, bp, scale=0.8, glow=2.5)
    M["silver"] = m

    m, p = principled("Silver_Fragment", SILVER, metallic=1.0, rough=0.18, aniso=0.5)
    micro_roughness(m, p, 0.2, 0.06, 40, 0.03, stretch=(1, 60, 1))
    M["fragment"] = m

    m, p = principled("Substrate", "#121614", rough=0.42, coat=0.55)
    micro_roughness(m, p, 0.42, 0.08, 45, 0.015)
    M["substrate"] = m

    m, p = principled("PCB_Laminate", "#0E1112", rough=0.5, coat=0.7)
    b, bp = micro_roughness(m, p, 0.5, 0.1, 25, 0.02)
    M["pcb"] = m

    m, p = principled("Gold_Contact", "#E3B65C", metallic=1.0, rough=0.16)
    micro_roughness(m, p, 0.16, 0.05, 120, 0.01)
    M["gold"] = m

    m, p = principled("Copper_Trace", "#9C7438", metallic=1.0, rough=0.42, coat=0.6)
    b, _ = micro_roughness(m, p, 0.28, 0.06, 150, 0.01)
    circuit_glow(b, p)
    M["trace"] = m

    m, p = principled("Cap_Ceramic", "#6B5236", rough=0.45)
    M["cap_body"] = m
    m, p = principled("Cap_Terminal", "#C9CDD2", metallic=1.0, rough=0.25)
    M["cap_end"] = m

    m, p = principled("Inductor", "#26282B", metallic=0.2, rough=0.55)
    micro_roughness(m, p, 0.55, 0.1, 30, 0.05)
    M["inductor"] = m

    m, p = principled("Black_Plastic", "#0A0A0B", rough=0.4)
    M["plastic"] = m

    m, p = principled("Laser_Etch", "#23262A", metallic=0.4, rough=0.65)
    M["etch"] = m

    m, p = principled("Silkscreen_Green", NV_GREEN, rough=0.6)
    p.inputs["Emission Color"].default_value = hex_rgba(NV_GREEN)
    b = NB(m)
    g = b.attr("fx_glow")
    b.link(b.math("MULTIPLY", g, 0.35), p.inputs["Emission Strength"])
    M["silk_green"] = m

    m, p = principled("Studio_Floor", "#050607", rough=0.35, coat=0.0)
    M["floor"] = m
    return M
