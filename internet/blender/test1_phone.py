"""Visual test 1: cinematic smartphone shot. The camera glides in on a premium phone, enters the screen,
and follows glowing data packets inside. Real-world scale (metres). Run: python test1_phone.py [still|anim] [out]"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector
from common import *

HERE = os.path.dirname(os.path.abspath(__file__))
mode = sys.argv[1] if len(sys.argv) > 1 else 'still'
out = sys.argv[2] if len(sys.argv) > 2 else HERE + '/out/t1'
reset()
sc = render_setup(w=int(os.environ.get('W', 720)), h=int(os.environ.get('H', 1280)), frames=120, samples=int(os.environ.get('SPP', 48)), look='AgX - Medium High Contrast')
rng = random.Random(4)

# ---------------- phone (iPhone-class proportions: 71.5 x 147 x 7.8 mm) ----------------
PW, PH, PT = 0.0715, 0.147, 0.0078
CORNER, EDGE = 0.0095, 0.0024
PHONE = empty('Phone', (0, 0, 0.112)); PHONE.rotation_euler = (math.radians(-8), 0, 0)

def rounded_slab(name, w, h, t, r_corner, r_edge, segs=18):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co.x *= w; v.co.y *= t; v.co.z *= h
    o = mesh_obj(name, bm)
    bw = o.data.attributes.new('bevel_weight_edge', 'FLOAT', 'EDGE')
    for e in o.data.edges:
        a, b = (o.data.vertices[i].co for i in e.vertices)
        bw.data[e.index].value = 1.0 if abs(a.y - b.y) > 1e-6 else 0.0   # edges along the thickness = the 4 corners
    m1 = o.modifiers.new('corners', 'BEVEL'); m1.limit_method = 'WEIGHT'; m1.width = r_corner; m1.segments = segs
    m2 = o.modifiers.new('edges', 'BEVEL'); m2.limit_method = 'ANGLE'; m2.angle_limit = math.radians(50); m2.width = r_edge; m2.segments = 8; m2.profile = 0.6
    for p in o.data.polygons: p.use_smooth = True
    o.modifiers.new('wn', 'WEIGHTED_NORMAL').keep_sharp = False
    return o

titanium = mat('Titanium', base=(0.46, 0.44, 0.41), metal=1.0, rough=0.24, aniso=0.5)
body = rounded_slab('Frame', PW, PH, PT, CORNER, EDGE); body.data.materials.append(titanium); body.parent = PHONE
# front glass: black, glossy, slightly inset
glass_black = mat('FrontGlass', base=(0.004, 0.004, 0.006), rough=0.03, coat=1.0, coat_rough=0.0, spec=0.6)
fg = rounded_slab('FrontGlass', PW - 0.0012, PH - 0.0012, 0.0016, CORNER - 0.0006, 0.0007, 16)
fg.location = (0, -PT / 2 + 0.0004, 0); fg.data.materials.append(glass_black); fg.parent = PHONE
# screen: emissive UI with a dissolve to transparent (camera passes through)
img = bpy.data.images.load(HERE + '/tex/phone_ui.png')
scr_m = bpy.data.materials.new('Screen')
if not scr_m.node_tree: scr_m.use_nodes = True
nt = scr_m.node_tree; nt.nodes.clear()
tc = nt.nodes.new('ShaderNodeTexCoord'); it = nt.nodes.new('ShaderNodeTexImage'); it.image = img; it.interpolation = 'Cubic'
nt.links.new(tc.outputs['UV'], it.inputs['Vector'])
em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = 1.6
sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['UV'], sep.inputs[0])
mu = nt.nodes.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; mu.inputs[1].default_value = 1179; nt.links.new(sep.outputs['X'], mu.inputs[0])
fu = nt.nodes.new('ShaderNodeMath'); fu.operation = 'FRACT'; nt.links.new(mu.outputs[0], fu.inputs[0])
ramp = nt.nodes.new('ShaderNodeValToRGB'); ramp.color_ramp.interpolation = 'CONSTANT'
el = ramp.color_ramp.elements; el[0].position = 0.0; el[0].color = (3, 0.05, 0.05, 1); el[1].position = 0.34; el[1].color = (0.05, 3, 0.05, 1); e3 = el.new(0.67); e3.color = (0.05, 0.05, 3, 1)
nt.links.new(fu.outputs[0], ramp.inputs['Fac'])
mv = nt.nodes.new('ShaderNodeMath'); mv.operation = 'MULTIPLY'; mv.inputs[1].default_value = 2556; nt.links.new(sep.outputs['Y'], mv.inputs[0])
fv = nt.nodes.new('ShaderNodeMath'); fv.operation = 'FRACT'; nt.links.new(mv.outputs[0], fv.inputs[0])
gap = nt.nodes.new('ShaderNodeValToRGB'); gap.color_ramp.interpolation = 'CONSTANT'; g0 = gap.color_ramp.elements; g0[0].position = 0.0; g0[0].color = (0, 0, 0, 1); g0[1].position = 0.12; g0[1].color = (1.12, 1.12, 1.12, 1)
nt.links.new(fv.outputs[0], gap.inputs['Fac'])
m1n = nt.nodes.new('ShaderNodeMix'); m1n.data_type = 'RGBA'; m1n.blend_type = 'MULTIPLY'; m1n.inputs['Factor'].default_value = 1.0
nt.links.new(it.outputs['Color'], m1n.inputs[6]); nt.links.new(ramp.outputs['Color'], m1n.inputs[7])
m2n = nt.nodes.new('ShaderNodeMix'); m2n.data_type = 'RGBA'; m2n.blend_type = 'MULTIPLY'; m2n.inputs['Factor'].default_value = 1.0
nt.links.new(m1n.outputs[2], m2n.inputs[6]); nt.links.new(gap.outputs['Color'], m2n.inputs[7])
nt.links.new(m2n.outputs[2], em.inputs['Color'])
gl = nt.nodes.new('ShaderNodeBsdfGlossy'); gl.inputs['Roughness'].default_value = 0.02; gl.inputs['Color'].default_value = (1, 1, 1, 1)
fr = nt.nodes.new('ShaderNodeFresnel'); fr.inputs['IOR'].default_value = 1.5
add = nt.nodes.new('ShaderNodeMixShader'); nt.links.new(fr.outputs[0], add.inputs[0]); nt.links.new(em.outputs[0], add.inputs[1]); nt.links.new(gl.outputs[0], add.inputs[2])
tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mix = nt.nodes.new('ShaderNodeMixShader'); mix.name = 'dissolve'
nt.links.new(add.outputs[0], mix.inputs[1]); nt.links.new(tr.outputs[0], mix.inputs[2])
outn = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(mix.outputs[0], outn.inputs['Surface'])
mix.inputs[0].default_value = 0.0
SW, SH = PW - 0.0046, PH - 0.0046
bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
for v in bm.verts: v.co.x *= SW; v.co.y *= SH
uv = bm.loops.layers.uv.new()
for f in bm.faces:
    for l in f.loops: l[uv].uv = (l.vert.co.x / SW + 0.5, l.vert.co.y / SH + 0.5)
screen = mesh_obj('Screen', bm); screen.rotation_euler = (math.radians(90), 0, 0); screen.location = (0, -PT / 2 - 0.00065, 0)
sb = screen.modifiers.new('round', 'BEVEL'); sb.affect = 'VERTICES'; sb.width = CORNER - 0.0018; sb.segments = 16
screen.data.materials.append(scr_m); screen.parent = PHONE
# side buttons + camera island on the back
for z, h in [(0.030, 0.012), (0.012, 0.012)]:
    b = rounded_slab('Btn', 0.0012, h, 0.0024, 0.0005, 0.0003, 6); b.location = (-PW / 2 - 0.0004, 0, z); b.data.materials.append(titanium); b.parent = PHONE
b = rounded_slab('Power', 0.0012, 0.018, 0.0024, 0.0005, 0.0003, 6); b.location = (PW / 2 + 0.0004, 0, 0.022); b.data.materials.append(titanium); b.parent = PHONE
island = rounded_slab('Island', 0.034, 0.034, 0.0016, 0.007, 0.0006, 12); island.location = (-PW / 2 + 0.021, PT / 2 + 0.0007, PH / 2 - 0.021); island.data.materials.append(mat('Isl', base=(0.02, 0.02, 0.022), rough=0.15, coat=1)); island.parent = PHONE
lensm = mat('Lens', base=(0.002, 0.002, 0.004), rough=0.02, coat=1.0)
for dx, dz in [(-0.008, 0.008), (0.008, 0.008), (-0.008, -0.008)]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.0062, depth=0.0024, location=(island.location.x + dx, PT / 2 + 0.0016, island.location.z + dz), rotation=(math.radians(90), 0, 0))
    c = bpy.context.active_object; c.data.materials.append(titanium); c.parent = PHONE
    bpy.ops.mesh.primitive_cylinder_add(radius=0.0048, depth=0.0026, location=(island.location.x + dx, PT / 2 + 0.0017, island.location.z + dz), rotation=(math.radians(90), 0, 0))
    c2 = bpy.context.active_object; c2.data.materials.append(lensm); c2.parent = PHONE
STUDIO = [body, fg, island]

# ---------------- studio: seamless sweep, reflective floor, softbox + rim light ----------------
bm = bmesh.new()
prof = [(-0.6, 0.0)] + [(0.25 + 0.15 * math.sin(a), 0.15 - 0.15 * math.cos(a)) for a in [i / 12 * math.pi / 2 for i in range(13)]] + [(0.4, 0.7)]
verts = []
for x in (-0.8, 0.8):
    row = [bm.verts.new((x, y, z)) for (y, z) in prof]; verts.append(row)
for i in range(len(prof) - 1): bm.faces.new([verts[0][i], verts[0][i + 1], verts[1][i + 1], verts[1][i]])
sweep = mesh_obj('Sweep', bm)
for p in sweep.data.polygons: p.use_smooth = True
sm = bpy.data.materials.new('Sweep')
if not sm.node_tree: sm.use_nodes = True
p = sm.node_tree.nodes['Principled BSDF']; p.inputs['Roughness'].default_value = 0.32; p.inputs['Specular IOR Level'].default_value = 0.5
grad = sm.node_tree.nodes.new('ShaderNodeTexGradient'); tco = sm.node_tree.nodes.new('ShaderNodeTexCoord'); mp = sm.node_tree.nodes.new('ShaderNodeMapping')
mp.inputs['Rotation'].default_value = (0, math.radians(-90), 0); mp.inputs['Location'].default_value = (0, 0, 0.0)
cr = sm.node_tree.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (0.004, 0.005, 0.009, 1); cr.color_ramp.elements[1].color = (0.020, 0.026, 0.042, 1)
sm.node_tree.links.new(tco.outputs['Generated'], mp.inputs['Vector']); sm.node_tree.links.new(mp.outputs[0], grad.inputs['Vector'])
sm.node_tree.links.new(grad.outputs['Fac'], cr.inputs['Fac']); sm.node_tree.links.new(cr.outputs['Color'], p.inputs['Base Color'])
sweep.data.materials.append(sm); STUDIO.append(sweep)
key_l = area_light('Softbox', (-0.35, -0.25, 0.55), (0, 0, 0), 0.6, 14, (0.92, 0.96, 1.0), size_y=0.35); point_toward(key_l, (0, 0, 0.1))
rim = area_light('Rim', (0.32, 0.25, 0.30), (0, 0, 0), 0.05, 9, (0.55, 0.75, 1.0), size_y=0.6); point_toward(rim, (0, 0, 0.12))
strip = area_light('Strip', (-0.30, 0.20, 0.25), (0, 0, 0), 0.04, 5, (1.0, 0.86, 0.7), size_y=0.5); point_toward(strip, (0, 0, 0.12))
fill = area_light('Fill', (0.2, -0.5, 0.1), (0, 0, 0), 0.5, 1.2, (0.8, 0.88, 1.0)); point_toward(fill, (0, 0, 0.1))
STUDIO += [key_l, rim, strip, fill]
world_color((0.004, 0.006, 0.012), 1.0)

# ---------------- inside the screen: a corridor of data ----------------
DATA = empty('Data', (0, 0.0, 0.112)); DATA.rotation_euler = PHONE.rotation_euler
pm_c = emission_mat('PartCyan', (0.35, 0.75, 1.0), 9.0); pm_w = emission_mat('PartWhite', (1, 1, 1), 14.0); pm_a = emission_mat('PartAmber', (1.0, 0.72, 0.28), 10.0)
def cloud(name, n, length, rad, size, matl, seed):
    r = random.Random(seed); bm = bmesh.new()
    for i in range(n):
        y = r.uniform(0.02, length); a = r.uniform(0, 2 * math.pi); rr = 0.022 + (rad - 0.022) * math.sqrt(r.random())
        s = size * r.uniform(0.6, 1.2); stretch = r.uniform(18, 40)
        res = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=s)
        for v in res['verts']: v.co.y *= stretch; v.co += Vector((math.cos(a) * rr, y, math.sin(a) * rr * 1.6))
    o = mesh_obj(name, bm); o.data.materials.append(matl); o.parent = DATA; return o
c1 = cloud('StreamA', 2400, 1.6, 0.05, 0.00018, pm_c, 1); c2 = cloud('StreamB', 700, 1.6, 0.035, 0.00022, pm_w, 2); c3 = cloud('StreamC', 300, 1.6, 0.06, 0.0002, pm_a, 3)
# glass data packets with a glowing core, flowing ahead of the camera
pk_glass = mat('PacketGlass', base=(0.9, 0.95, 1.0), rough=0.04, transmission=1.0, ior=1.45)
pk_core = emission_mat('PacketCore', (1.0, 0.75, 0.3), 18.0)
packets = []
for i in range(8):
    bpy.ops.mesh.primitive_cube_add(size=0.0075); c = bpy.context.active_object; c.name = f'Packet{i}'
    bv = c.modifiers.new('b', 'BEVEL'); bv.width = 0.0008; bv.segments = 4
    for pp in c.data.polygons: pp.use_smooth = True
    c.data.materials.append(pk_glass); c.parent = DATA
    bpy.ops.mesh.primitive_cube_add(size=0.0022); core = bpy.context.active_object; core.data.materials.append(pk_core); core.parent = c
    packets.append(c)
DATA_OBJS = [c1, c2, c3] + packets + [o.children[0] for o in packets]
for o in DATA_OBJS: o.hide_render = True; key(o, 'hide_render', 1); o.hide_render = True; key(o, 'hide_render', 84); o.hide_render = False; key(o, 'hide_render', 85)

# packets fly in a loose formation down the corridor
for i, c in enumerate(packets):
    off = Vector((-0.0023 + rng.uniform(-0.010, 0.010), 0, -0.0112 + rng.uniform(-0.012, 0.012)))
    for f, y in [(84, 0.025 + i * 0.012), (120, 0.435 + i * 0.016)]:
        c.location = off + Vector((0, y, 0)); key(c, 'location', f)
        c.rotation_euler = (f * 0.03 + i, f * 0.02, i); key(c, 'rotation_euler', f)
    set_interp_all(c, 'LINEAR')
# streams drift forward too (parallax between layers)
for o, sp in [(c1, 0.10), (c2, 0.22), (c3, 0.05)]:
    o.location = (0, 0, 0); key(o, 'location', 84); o.location = (0, sp, 0); key(o, 'location', 120); set_interp_all(o, 'LINEAR')

# studio objects vanish once the camera is through the glass
for o in STUDIO:
    o.hide_render = False; key(o, 'hide_render', 86); o.hide_render = True; key(o, 'hide_render', 87)
for o in [screen]:
    o.hide_render = False; key(o, 'hide_render', 92); o.hide_render = True; key(o, 'hide_render', 93)
# screen dissolves as the camera reaches it
mix.inputs[0].default_value = 0.0; mix.inputs[0].keyframe_insert('default_value', frame=86)
mix.inputs[0].default_value = 1.0; mix.inputs[0].keyframe_insert('default_value', frame=91)

# ---------------- camera: 3/4 hero -> square on -> through the glass -> follow the packets ----------------
cam = camera('Cam', lens=50); cd = cam.data
cd.dof.use_dof = True; cd.dof.aperture_fstop = 2.8
tgt = empty('Target'); foc = empty('Focus'); cd.dof.focus_object = foc
con = cam.constraints.new('TRACK_TO'); con.target = tgt; con.track_axis = 'TRACK_NEGATIVE_Z'; con.up_axis = 'UP_Y'
def to_world(local):  # phone-local point -> world
    return PHONE.matrix_world @ Vector(local)
bpy.context.view_layer.update()
scr_c = to_world((-0.0023, -PT / 2 - 0.00066, -0.0112)); ahead = lambda d: to_world((-0.0023, d, -0.0112))
camkeys = [(1, to_world((-0.13, -0.24, 0.04)), to_world((0, 0, 0.0)), 50, 2.8),
           (40, to_world((-0.09, -0.24, 0.03)), to_world((0, 0, 0.004)), 58, 2.8),
           (70, to_world((-0.012, -0.12, -0.006)), scr_c, 70, 2.2),
           (86, to_world((-0.0023, -0.012, -0.0112)), scr_c, 70, 2.8),
           (92, to_world((-0.0023, 0.004, -0.0112)), ahead(0.2), 40, 8.0),
           (120, to_world((0.0, 0.40, -0.012)), ahead(0.9), 36, 8.0)]
for f, p, t, lens, fs in camkeys:
    cam.location = p; key(cam, 'location', f); tgt.location = t; key(tgt, 'location', f)
    cd.lens = lens; cd.keyframe_insert('lens', frame=f); cd.dof.aperture_fstop = fs; cd.dof.keyframe_insert('aperture_fstop', frame=f)
for f, loc in [(1, to_world((0, -PT / 2, 0.0))), (70, scr_c), (86, scr_c), (92, ahead(0.03)), (120, ahead(0.44))]:
    foc.location = loc; key(foc, 'location', f)
for o in (cam, tgt, foc): set_interp_all(o)

os.makedirs(out, exist_ok=True)
if mode == 'still':
    for f in [int(x) for x in os.environ.get('FRAMES', '1,60,100').split(',')]:
        render_still(f'{out}/still_{f:03d}.png', f)
else:
    render_anim(out + '/frames', int(os.environ.get('A', 1)), int(os.environ.get('B', 120)))
