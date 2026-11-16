"""Studio lighting, camera rig, world and Cycles render settings."""
import math

import bpy
from mathutils import Vector

import common as C


def area_light(name, loc, target, size, power, color="#FFFFFF", size_y=None, spread=180):
    ld = bpy.data.lights.new(name, "AREA")
    ld.shape = "RECTANGLE"
    ld.size = size
    ld.size_y = size_y or size
    ld.energy = power
    ld.color = C.hex_rgba(color)[:3]
    ld.spread = math.radians(spread)
    ob = bpy.data.objects.new(name, ld)
    ob.location = loc
    ob.visible_camera = False      # never see the light panel itself
    C.link(ob)
    look_at(ob, target)
    return ob


def look_at(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def card(name, loc, target, w, h, strength):
    """Emissive reflection card: seen only in reflections, not by the camera."""
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
    for v in bm.verts:
        v.co.x *= w
        v.co.y *= h
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs[0], nt.nodes["Material Output"].inputs[0])
    ob = C.mesh_obj(name, bm, m)
    ob.location = loc
    C.link(ob)
    look_at(ob, target)
    ob.rotation_euler.rotate_axis("X", math.pi)   # face the subject
    ob.visible_camera = False
    ob.visible_shadow = False
    ob.visible_diffuse = False
    return ob, em


def build_lights():
    L = {}
    L["softbox"] = area_light("Softbox_Overhead", (0, -4, 70), (0, 0, 0), 60, 6.0e4, size_y=40)
    L["key"] = area_light("Key_Front", (6, -60, 32), (0, 0, 0), 30, 2.5e4, size_y=14)
    L["green_rim"] = area_light("Rim_Green", (0, 55, 9), (0, 0, 0), 50, 1.6e4, C.NV_GREEN, size_y=6)
    L["red_rim_l"] = area_light("Rim_Red_L", (-48, 30, 6), (0, 0, 0), 36, 0.0, C.DEEP_RED, size_y=5)
    L["red_rim_r"] = area_light("Rim_Red_R", (48, 30, 6), (0, 0, 0), 36, 0.0, C.DEEP_RED, size_y=5)
    L["red_under"] = area_light("Red_Fill_Front", (0, -40, 3), (0, 0, 1), 40, 0.0, C.DEEP_RED, size_y=3)
    L["card_l"] = card("Reflection_Card_L", (-30, -14, 22), (0, 0, 0), 30, 4, 6.0)
    L["card_r"] = card("Reflection_Card_R", (30, -8, 26), (0, 0, 0), 30, 3, 5.0)
    # big gradient card up-and-behind: gives the mirror dies a soft product-shot sheen
    L["card_back"] = card("Reflection_Card_Back", (0, 38, 40), (0, 0, 0), 60, 22, 1.6)
    return L


def build_world():
    w = bpy.data.worlds.new("Studio")
    bpy.context.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = C.hex_rgba(C.CHARCOAL)
    bg.inputs["Strength"].default_value = 0.6
    return bg


def build_atmosphere():
    """Very thin volumetric haze so the rim lights read as light, not outlines."""
    import bmesh
    bm = bmesh.new()
    C.add_box(bm, (120, 120, 40), (0, 0, 20))
    m = bpy.data.materials.new("Atmosphere")
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    vol = nt.nodes.new("ShaderNodeVolumePrincipled")
    vol.inputs["Density"].default_value = 0.0012
    vol.inputs["Anisotropy"].default_value = 0.4
    nt.links.new(vol.outputs[0], nt.nodes["Material Output"].inputs["Volume"])
    ob = C.mesh_obj("Atmosphere", bm, m)
    C.link(ob)
    ob.visible_shadow = False
    return vol


def build_camera():
    cd = bpy.data.cameras.new("Cinema_Cam")
    cd.lens = 50
    cd.sensor_width = 36
    cd.sensor_fit = "AUTO"
    cd.clip_start = 0.5
    cd.clip_end = 2000
    cd.dof.use_dof = True
    cd.dof.aperture_fstop = 4.0
    cd.dof.aperture_blades = 9
    cd.dof.aperture_ratio = 1.0
    cam = bpy.data.objects.new("Cinema_Cam", cd)
    C.link(cam)
    tgt = bpy.data.objects.new("Cam_Target", None)
    tgt.empty_display_size = 0.5
    C.link(tgt)
    cd.dof.focus_object = tgt
    tc = cam.constraints.new("TRACK_TO")
    tc.target = tgt
    tc.track_axis = "TRACK_NEGATIVE_Z"
    tc.up_axis = "UP_Y"
    bpy.context.scene.camera = cam
    return cam, tgt


def render_settings(final=False, samples=None):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    cy = sc.cycles
    device = detect_device()
    cy.device = "GPU" if device != "CPU" else "CPU"
    cy.samples = samples or (192 if final else 32)
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = 0.03 if not final else 0.01
    # thin haze doubles CPU render time for little visible gain: final only
    atm = bpy.data.objects.get("Atmosphere")
    if atm:
        atm.hide_render = not final
    cy.use_denoising = True
    cy.denoiser = "OPENIMAGEDENOISE"
    cy.max_bounces = 6
    cy.diffuse_bounces = 2
    cy.glossy_bounces = 4
    cy.transmission_bounces = 2
    cy.volume_bounces = 0
    cy.transparent_max_bounces = 4
    cy.caustics_reflective = False
    cy.caustics_refractive = False
    cy.blur_glossy = 0.6
    cy.volume_step_rate = 4.0
    sc.render.use_motion_blur = True
    sc.render.motion_blur_shutter = 0.45
    sc.render.film_transparent = False
    sc.render.resolution_x = 2160 if final else 1080
    sc.render.resolution_y = 3840 if final else 1920
    sc.render.resolution_percentage = 100
    sc.render.fps = 30
    sc.frame_start, sc.frame_end = 1, 90
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_depth = "8"
    vs = sc.view_settings
    vs.view_transform = "AgX"
    for look in ("AgX - Medium High Contrast", "Medium High Contrast", "AgX - Base Contrast"):
        try:
            vs.look = look
            break
        except TypeError:
            continue
    vs.exposure = 0.0
    sc.render.threads_mode = "AUTO"
    return device


def detect_device():
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
    except KeyError:
        return "CPU"
    for kind in ("OPTIX", "CUDA", "HIP", "METAL", "ONEAPI"):
        try:
            prefs.compute_device_type = kind
            prefs.get_devices()
            devs = [d for d in prefs.devices if d.type == kind]
            if devs:
                for d in prefs.devices:
                    d.use = d.type == kind
                return kind
        except Exception:
            continue
    try:
        prefs.compute_device_type = "NONE"
    except Exception:
        pass
    return "CPU"
