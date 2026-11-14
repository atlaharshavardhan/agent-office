"""Visual test 2: macro fly-through into a real optical fibre. A colour-coded fibre fan-out on a lab bench,
push into one glowing cleaved end, then inside the glass core with light pulses bouncing off the
core/cladding boundary (total internal reflection). Run: python test2_fiber.py [still|anim] [out]"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector
from common import *

HERE = os.path.dirname(os.path.abspath(__file__))
mode = sys.argv[1] if len(sys.argv) > 1 else 'still'
out = sys.argv[2] if len(sys.argv) > 2 else HERE + '/out/t2'
reset()
sc = render_setup(w=int(os.environ.get('W', 720)), h=int(os.environ.get('H', 1280)), frames=120, samples=int(os.environ.get('SPP', 48)), look='AgX - Medium High Contrast')
sc.cycles.volume_bounces = 0
rng = random.Random(7)
MM = 0.001

# ---------------- macro set (millimetre scale) ----------------
# bench: dark brushed metal with a faint grid of fine scratches
bench = bpy.data.materials.new('Bench')
if not bench.node_tree: bench.use_nodes = True
nt = bench.node_tree; p = nt.nodes['Principled BSDF']
p.inputs['Base Color'].default_value = (0.012, 0.013, 0.016, 1); p.inputs['Metallic'].default_value = 0.85; p.inputs['Anisotropic'].default_value = 0.6
noise = nt.nodes.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 900; noise.inputs['Detail'].default_value = 4
mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 40, 1); tc = nt.nodes.new('ShaderNodeTexCoord')
nt.links.new(tc.outputs['Object'], mp.inputs['Vector']); nt.links.new(mp.outputs[0], noise.inputs['Vector'])
rr = nt.nodes.new('ShaderNodeMapRange'); rr.inputs['To Min'].default_value = 0.22; rr.inputs['To Max'].default_value = 0.38
nt.links.new(noise.outputs['Fac'], rr.inputs['Value']); nt.links.new(rr.outputs['Result'], p.inputs['Roughness'])
bpy.ops.mesh.primitive_plane_add(size=0.4, location=(0, 0, 0)); fl = bpy.context.active_object; fl.data.materials.append(bench)

# cable jacket (left) with strain-relief boot
jacket = mat('Jacket', base=(0.02, 0.02, 0.024), rough=0.45, coat=0.3, coat_rough=0.3)
def tube(name, pts, radius, m, res=12):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = radius; cu.bevel_resolution = res; cu.use_fill_caps = True
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1)
    for bp, q in zip(sp.bezier_points, pts):
        bp.co = q; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    o = link(bpy.data.objects.new(name, cu)); o.data.materials.append(m); return o
tube('Cable', [Vector((-0.08, 0.004, 0.0016)), Vector((-0.03, 0.0, 0.0016)), Vector((-0.012, 0, 0.0016))], 1.6 * MM, jacket, 16)
boot = mat('Boot', base=(0.85, 0.85, 0.82), rough=0.35, coat=0.5)
bpy.ops.mesh.primitive_cone_add(radius1=2.1 * MM, radius2=1.75 * MM, depth=6 * MM, vertices=48, location=(-0.010, 0, 0.0016), rotation=(0, math.radians(90), 0))
bt = bpy.context.active_object; bt.data.materials.append(boot); bpy.ops.object.shade_smooth()
# 12 fibres, TIA-598 colour code, fanning out from the boot; last 4 mm stripped to bare glass with a glowing tip
COLORS = [(0.05, 0.25, 0.9), (1.0, 0.35, 0.02), (0.05, 0.6, 0.12), (0.35, 0.18, 0.06), (0.35, 0.36, 0.38), (0.9, 0.9, 0.88),
          (0.85, 0.04, 0.04), (0.02, 0.02, 0.02), (0.95, 0.8, 0.05), (0.45, 0.1, 0.65), (0.95, 0.45, 0.55), (0.1, 0.75, 0.8)]
glass = mat('BareGlass', base=(0.97, 0.99, 1.0), rough=0.0, transmission=1.0, ior=1.468)
tipm = emission_mat('Tip', (0.55, 0.85, 1.0), 25.0)
ends = []
for i, col in enumerate(COLORS):
    a = (i - 5.5) / 5.5
    z = 0.0016 + 0.0004 * math.sin(i * 1.7)
    p0 = Vector((-0.007, a * 0.0005, z)); p1 = Vector((0.004, a * 0.0045, z + 0.0006 * math.cos(i))); p2 = Vector((0.018, a * 0.0085 + 0.0006 * math.sin(i * 2.3), z + 0.0012)); p3 = Vector((0.026, a * 0.0092, z + 0.0016))
    fm = mat(f'Coat{i}', base=col, rough=0.28, coat=0.6, coat_rough=0.1)
    tube(f'Fiber{i}', [p0, p1, p2, p3], 0.125 * MM, fm, 6)
    d = (p3 - p2).normalized(); g1 = p3 + d * 0.004
    tube(f'Glass{i}', [p3, p3 + d * 0.002, g1], 0.0625 * MM, glass, 6)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.03 * MM, location=g1 + d * 0.00004); tip = bpy.context.active_object; tip.data.materials.append(tipm)
    ends.append((g1, d))
HERO_END, HERO_D = ends[5]
# out-of-focus lab lights behind (bokeh), cool and a couple of warm
bk = []
for i in range(40):
    loc = Vector((rng.uniform(0.04, 0.16), rng.uniform(-0.09, 0.09), rng.uniform(0.004, 0.05)))
    col = (0.4, 0.7, 1.0) if rng.random() < 0.8 else (1.0, 0.75, 0.45)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=rng.uniform(0.0006, 0.0016), location=loc); b = bpy.context.active_object; b.data.materials.append(emission_mat(f'bk{i}', col, rng.uniform(3, 10))); bk.append(b)
key_l = area_light('Key', (-0.05, -0.08, 0.10), (0, 0, 0), 0.08, 3.0, (0.9, 0.95, 1.0)); point_toward(key_l, (0.01, 0, 0))
rim = area_light('Rim', (0.06, 0.05, 0.04), (0, 0, 0), 0.02, 2.0, (0.6, 0.8, 1.0), size_y=0.08); point_toward(rim, (0.015, 0, 0.002))
world_color((0.003, 0.004, 0.008), 1.0)
MACRO = [o for o in bpy.context.scene.objects if o.type in ('MESH', 'CURVE', 'LIGHT')]

# ---------------- inside the core (scaled-up set, far away) ----------------
IN0 = Vector((50, 0, 0)); L = 60.0
CORE_R, CLAD_R, COAT_R = 1.0, 2.2, 2.6
core_glass = mat('CoreGlass', base=(0.92, 0.98, 1.0), rough=0.0, transmission=1.0, ior=1.468)
clad_glass = mat('CladGlass', base=(0.85, 0.93, 1.0), rough=0.04, transmission=1.0, ior=1.462)
coat_in = mat('CoatInside', base=(0.9, 0.9, 0.88), rough=0.5, sss=0.3)
def cyl(name, r, m, inside=False):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=L, vertices=128, location=IN0 + Vector((L / 2 - 4, 0, 0)), rotation=(0, math.radians(90), 0))
    o = bpy.context.active_object; o.name = name; o.data.materials.append(m); bpy.ops.object.shade_smooth()
    if inside:
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.flip_normals(); bpy.ops.object.mode_set(mode='OBJECT')
    return o
coat_o = cyl('CoatTube', COAT_R, coat_in, inside=True)
clad_o = cyl('Cladding', CLAD_R, clad_glass)
# core boundary as a thin glass shell so the camera can fly inside it, with faint volume to show the beams
bpy.ops.mesh.primitive_cylinder_add(radius=CORE_R, depth=L, vertices=128, location=IN0 + Vector((L / 2 - 4, 0, 0)), rotation=(0, math.radians(90), 0))
core_o = bpy.context.active_object; bpy.ops.object.shade_smooth()
sol = core_o.modifiers.new('sh', 'SOLIDIFY'); sol.thickness = 0.04
vol = bpy.data.materials.new('CoreVol')
if not vol.node_tree: vol.use_nodes = True
vnt = vol.node_tree; vnt.nodes.clear(); vo = vnt.nodes.new('ShaderNodeOutputMaterial')
pv = vnt.nodes.new('ShaderNodeVolumePrincipled'); pv.inputs['Density'].default_value = 0.02; pv.inputs['Color'].default_value = (0.7, 0.9, 1.0, 1)
gb = vnt.nodes.new('ShaderNodeBsdfGlass'); gb.inputs['IOR'].default_value = 1.01; gb.inputs['Roughness'].default_value = 0.0; gb.inputs['Color'].default_value = (0.93, 0.98, 1.0, 1)
vnt.links.new(gb.outputs[0], vo.inputs['Surface']); vnt.links.new(pv.outputs[0], vo.inputs['Volume'])
core_o.data.materials.append(vol)
# glass imperfections: faint rings of bright dust caught in the cladding (gives speed reference)
dust_m = emission_mat('Dust', (0.6, 0.85, 1.0), 4.0); bm = bmesh.new()
for i in range(900):
    x = rng.uniform(-4, L - 6); a = rng.uniform(0, 2 * math.pi); r = rng.uniform(CORE_R + 0.15, CLAD_R - 0.05)
    res = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=rng.uniform(0.006, 0.02))
    for v in res['verts']: v.co.x *= 3; v.co += IN0 + Vector((x, math.cos(a) * r, math.sin(a) * r))
dust = mesh_obj('Dust', bm); dust.data.materials.append(dust_m)
# light pulses: bright packets following zig-zag (total internal reflection) paths, each with a soft point light
pulse_m = emission_mat('Pulse', (0.75, 0.9, 1.0), 60.0)
trail_m = emission_mat('Trail', (0.4, 0.75, 1.0), 2.5)
INSIDE = [coat_o, clad_o, core_o, dust]
pulses = []
for k in range(6):
    phase = rng.uniform(0, 2 * math.pi); ang = rng.uniform(0, math.pi)
    pts = []; seg = 2.6 + rng.uniform(-0.4, 0.4)
    for j in range(30):
        x = -4 + j * seg; s_ = 0.86 * CORE_R * (1 if (j + k) % 2 else -1)
        pts.append(IN0 + Vector((x, math.cos(ang) * s_, math.sin(ang) * s_)))
    tr = tube(f'Trail{k}', pts, 0.008, trail_m, 2)
    for sp in tr.data.splines:
        for bp in sp.bezier_points: bp.handle_left_type = bp.handle_right_type = 'VECTOR'
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.07, location=pts[0]); pu = bpy.context.active_object; pu.scale = (5, 1, 1); pu.data.materials.append(pulse_m)
    ld = bpy.data.lights.new(f'pl{k}', 'POINT'); ld.energy = 120; ld.color = (0.7, 0.88, 1.0); ld.shadow_soft_size = 0.2
    pl = link(bpy.data.objects.new(f'pl{k}', ld)); pl.parent = pu
    fp = pu.constraints.new('FOLLOW_PATH'); fp.target = tr; fp.use_curve_follow = True; fp.forward_axis = 'FORWARD_X'; fp.use_fixed_location = True
    pu.location = (0, 0, 0)
    tr.data.use_path = True
    fp.offset_factor = 0.02 + k * 0.025; fp.keyframe_insert('offset_factor', frame=60)
    fp.offset_factor = 0.62 + k * 0.03; fp.keyframe_insert('offset_factor', frame=120)
    INSIDE += [tr, pu, pl]; pulses.append(pu)
for o in MACRO + bk:
    o.hide_render = False; key(o, 'hide_render', 64); o.hide_render = True; key(o, 'hide_render', 65)
for o in INSIDE:
    o.hide_render = True; key(o, 'hide_render', 64); o.hide_render = False; key(o, 'hide_render', 65)

# ---------------- camera: macro dolly along the fan -> into the glowing end -> fly through the core ----------------
cam = camera('Cam', lens=100); cd = cam.data; cd.dof.use_dof = True; cd.dof.aperture_fstop = 5.6
tgt = empty('Target'); foc = empty('Focus'); cd.dof.focus_object = foc
con = cam.constraints.new('TRACK_TO'); con.target = tgt; con.track_axis = 'TRACK_NEGATIVE_Z'; con.up_axis = 'UP_Y'
e = HERO_END
ck = [(1, Vector((-0.006, -0.030, 0.012)), Vector((0.012, 0.0, 0.002)), 100, 5.6, Vector((0.012, 0, 0.002))),
      (34, Vector((0.010, -0.020, 0.008)), e + Vector((-0.002, 0, 0)), 100, 4.0, e),
      (56, e + HERO_D * 0.004 + Vector((0.0, -0.0012, 0.0004)), e, 100, 4.0, e),
      (64, e + HERO_D * 0.00025, e, 100, 4.0, e),
      (65, IN0 + Vector((-3.5, 0.0, 0.25)), IN0 + Vector((6, 0, 0)), 18, 11, IN0 + Vector((4, 0, 0))),
      (120, IN0 + Vector((22, 0.15, -0.2)), IN0 + Vector((40, 0, 0)), 20, 11, IN0 + Vector((30, 0, 0)))]
for f, pos, t, lens, fs, fo in ck:
    cam.location = pos; key(cam, 'location', f); tgt.location = t; key(tgt, 'location', f); foc.location = fo; key(foc, 'location', f)
    cd.lens = lens; cd.keyframe_insert('lens', frame=f); cd.dof.aperture_fstop = fs; cd.dof.keyframe_insert('aperture_fstop', frame=f)
for o in (cam, tgt, foc): set_interp_all(o)
# hard cut at 64/65 is hidden by the end-face glow filling the frame; the inside move eases in (accelerates)
os.makedirs(out, exist_ok=True)
if mode == 'still':
    for f in [int(x) for x in os.environ.get('FRAMES', '1,40,62,80,110').split(',')]:
        render_still(f'{out}/still_{f:03d}.png', f)
else:
    render_anim(out + '/frames', int(os.environ.get('A', 1)), int(os.environ.get('B', 120)))
