"""Shared helpers for the InvisiTech Internet Blender visual tests (Blender 5.x, run with bpy as a module)."""
import bpy, bmesh, math, os, sys
from mathutils import Vector, Euler

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def render_setup(w=720, h=1280, frames=120, fps=24, samples=48, look='AgX - Medium High Contrast', exposure=0.0):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.03
    sc.cycles.use_denoising = True
    try: sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception: pass
    sc.cycles.max_bounces = 8; sc.cycles.glossy_bounces = 4; sc.cycles.transmission_bounces = 10
    sc.cycles.diffuse_bounces = 3; sc.cycles.volume_bounces = 1; sc.cycles.transparent_max_bounces = 16
    sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False
    sc.cycles.blur_glossy = 1.0
    sc.render.resolution_x = w; sc.render.resolution_y = h; sc.render.resolution_percentage = 100
    sc.render.fps = fps; sc.frame_start = 1; sc.frame_end = frames
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_depth = '16'
    sc.view_settings.view_transform = 'AgX'
    try: sc.view_settings.look = look
    except Exception: pass
    sc.view_settings.exposure = exposure
    sc.render.film_transparent = False
    return sc

def mat(name, base=(0.8, 0.8, 0.8), metal=0.0, rough=0.5, **kw):
    m = bpy.data.materials.new(name)
    nt = m.node_tree if m.node_tree else None
    if nt is None:
        m.use_nodes = True; nt = m.node_tree
    p = nt.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*base, 1)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    for k, v in kw.items():
        key = {'transmission': 'Transmission Weight', 'ior': 'IOR', 'coat': 'Coat Weight', 'coat_rough': 'Coat Roughness', 'aniso': 'Anisotropic',
               'emit': 'Emission Color', 'emit_strength': 'Emission Strength', 'alpha': 'Alpha', 'spec': 'Specular IOR Level', 'sss': 'Subsurface Weight'}[k]
        if k == 'emit': v = (*v, 1)
        p.inputs[key].default_value = v
    return m

def emission_mat(name, color, strength):
    m = bpy.data.materials.new(name)
    if not m.node_tree: m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs['Color'].default_value = (*color, 1); e.inputs['Strength'].default_value = strength
    o = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(e.outputs[0], o.inputs['Surface'])
    return m

def link(obj, coll=None):
    (coll or bpy.context.scene.collection).objects.link(obj); return obj

def mesh_obj(name, bm):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    return link(bpy.data.objects.new(name, me))

def smooth(obj, angle=35):
    for p in obj.data.polygons: p.use_smooth = True
    try:
        mod = obj.modifiers.new('ws', 'WEIGHTED_NORMAL')
    except Exception: pass

def area_light(name, loc, rot, size, energy, color=(1, 1, 1), shape='RECTANGLE', size_y=None):
    ld = bpy.data.lights.new(name, 'AREA'); ld.energy = energy; ld.color = color; ld.shape = shape; ld.size = size
    if size_y: ld.size_y = size_y
    o = link(bpy.data.objects.new(name, ld)); o.location = loc; o.rotation_euler = rot; return o

def point_toward(obj, target):
    d = Vector(target) - obj.location
    obj.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()

def camera(name='Cam', lens=50, sensor=36):
    cd = bpy.data.cameras.new(name); cd.lens = lens; cd.sensor_width = sensor; cd.sensor_fit = 'HORIZONTAL'
    cd.clip_start = 0.001; cd.clip_end = 200
    o = link(bpy.data.objects.new(name, cd)); bpy.context.scene.camera = o; return o

def empty(name, loc=(0, 0, 0)):
    o = link(bpy.data.objects.new(name, None)); o.location = loc; return o

def key(obj, path, frame, value=None, interp='BEZIER'):
    if value is not None:
        setattr(obj, path, value) if not isinstance(value, tuple) else setattr(obj, path, value)
    obj.keyframe_insert(data_path=path, frame=frame)
    ad = obj.animation_data
    if ad and ad.action:
        try:
            for fc in ad.action.fcurves:
                for kp in fc.keyframe_points:
                    if kp.co.x == frame: kp.interpolation = interp
        except Exception:
            pass

def set_interp_all(obj, interp='BEZIER', easing='EASE_IN_OUT', handle='AUTO_CLAMPED'):
    ad = obj.animation_data
    if not (ad and ad.action): return
    fcs = []
    try: fcs = list(ad.action.fcurves)
    except Exception:
        for layer in ad.action.layers:
            for strip in layer.strips:
                for bag in strip.channelbags: fcs += list(bag.fcurves)
    for fc in fcs:
        for kp in fc.keyframe_points:
            kp.interpolation = interp; kp.easing = easing; kp.handle_left_type = handle; kp.handle_right_type = handle

def world_color(color, strength=1.0):
    w = bpy.data.worlds.new('World'); bpy.context.scene.world = w
    if not w.node_tree: w.use_nodes = True
    bg = w.node_tree.nodes.get('Background'); bg.inputs['Color'].default_value = (*color, 1); bg.inputs['Strength'].default_value = strength
    return w

def render_still(path, frame):
    sc = bpy.context.scene; sc.frame_set(frame); sc.render.filepath = path
    bpy.ops.render.render(write_still=True)

def render_anim(dirpath, a=None, b=None):
    sc = bpy.context.scene
    if a: sc.frame_start = a
    if b: sc.frame_end = b
    sc.render.filepath = os.path.join(dirpath, 'f')
    bpy.ops.render.render(animation=True)
