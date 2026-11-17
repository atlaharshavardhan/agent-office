"""Alice Short · Scene 2 (3.5-8.0 s, 135 frames): dark desk, one warm lamp pool, a case folder slides in and
opens on a profile card (blank silhouette, no likeness) next to our GPU model. Illustrative only.

  .venv/bin/python scripts/alice_s2_desk.py          -> blender/alice_s2_desk.blend   (build only)
  then render on the GPU VM: .venv/bin/python scripts/render_shot.py blender/alice_s2_desk.blend renders/alice_s2
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Vector  # noqa: E402
from PIL import Image, ImageDraw, ImageFont  # noqa: E402

import common as C  # noqa: E402
import build_scene as S  # noqa: E402
from build_shots import gpu_asset, gpu_instance  # noqa: E402
from build_v2 import ease, camera, key_cam  # noqa: E402

FONT = str(C.ROOT / "assets/fonts/InterDisplay-Bold.otf")
F_END = 135


def card_image(w=1400, h=1800):
    """Profile card texture: paper, blank silhouette, verified facts only."""
    im = Image.new("RGB", (w, h), (236, 232, 222))
    d = ImageDraw.Draw(im)
    big, mid, small = (ImageFont.truetype(FONT, s) for s in (120, 58, 44))
    name = ImageFont.truetype(FONT, 92)
    d.rectangle((0, 0, w, 150), fill=(22, 24, 27))
    d.text((70, 38), "CASE FILE · ILLUSTRATION", font=small, fill=(229, 72, 77))
    # photo box with a blank silhouette (no facial features)
    x0, y0, x1, y1 = 90, 240, 620, 900
    d.rectangle((x0, y0, x1, y1), fill=(30, 32, 36))
    cx = (x0 + x1) // 2
    d.ellipse((cx - 120, y0 + 120, cx + 120, y0 + 400), fill=(8, 8, 9))
    d.polygon([(cx - 150, y0 + 330), (cx + 150, y0 + 330), (cx + 175, y0 + 470), (cx - 175, y0 + 470)], fill=(8, 8, 9))
    d.pieslice((cx - 260, y0 + 420, cx + 260, y1 + 260), 180, 360, fill=(8, 8, 9))
    d.text((cx, y0 + 270), "?", font=big, fill=(229, 72, 77), anchor="mm")
    d.text((672, 270), "ALICE HUANG", font=name, fill=(16, 18, 20))
    lines = ["Former CEO, Megaspeed", "Singapore-based", "NVIDIA customer", "No relation to", "Jensen Huang"]
    for k, t in enumerate(lines):
        d.text((684, 420 + k * 82), t, font=mid, fill=(50, 54, 60))
    d.line((90, 980, w - 90, 980), fill=(160, 155, 145), width=4)
    d.text((90, 1020), "STATUS", font=small, fill=(120, 116, 108))
    d.text((90, 1080), "U.S. probes ongoing · No charges filed", font=mid, fill=(16, 18, 20))
    d.text((90, 1200), "Allegations reported by media", font=mid, fill=(16, 18, 20))
    d.text((90, 1280), "Denied by Megaspeed and China", font=mid, fill=(16, 18, 20))
    d.rectangle((90, 1420, 700, 1520), outline=(229, 72, 77), width=8)
    d.text((395, 1470), "NOT PROVEN", font=mid, fill=(229, 72, 77), anchor="mm")
    return np.asarray(im).astype(np.float32) / 255.0


def paper_mat(name, arr):
    h, w, _ = arr.shape
    img = bpy.data.images.new(name, w, h, alpha=False)
    px = np.ones((h, w, 4), dtype=np.float32); px[..., :3] = arr[::-1]
    img.pixels.foreach_set(px.ravel()); img.pack()
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = img
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ"); comb = nt.nodes.new("ShaderNodeCombineXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0]); nt.links.new(sep.outputs[0], comb.inputs[0]); nt.links.new(sep.outputs[1], comb.inputs[1])
    nt.links.new(comb.outputs[0], tex.inputs["Vector"]); nt.links.new(tex.outputs["Color"], p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.75
    return m


def build():
    sc = C.reset_scene(); C._MATS.clear()
    S.render_settings(samples=64)
    sc.frame_start, sc.frame_end = 1, F_END
    # desk: dark walnut with micro variation + a leather blotter
    wood, pw = C.principled("DeskWalnut", "#2A1B12", rough=0.32, coat=0.5)
    C.micro_roughness(wood, pw, 0.32, 0.08, 4.0, 0.15, stretch=(1, 12, 1))
    C.box("Desk", (260, 160, 6), (0, 0, -3), wood, 1.0)
    blot, _ = C.principled("Blotter", "#151618", rough=0.6)
    C.box("Blotter", (90, 62, 0.4), (-6, 4, 0.2), blot, 0.3)
    # GPU model resting on the desk (top-right), slight angle
    coll = gpu_asset()
    gpu_instance(coll, (52, 26, 0.6), (0, 0, math.radians(-18)), 0.5, "DeskGPU")
    # folder: back half (fixed) + cover (hinged at the spine, x = -W/2), slides in from +y
    kraft, _ = C.principled("Folder", "#B8935C", rough=0.7)
    tab_m, _ = C.principled("FolderTab", "#E5484D", rough=0.6)
    W, D = 46, 60
    fold = bpy.data.objects.new("FolderRig", None); C.link(fold)
    back = C.box("FolderBack", (W, D, 0.3), (0, 0, 0.15), kraft, 0.2); back.parent = fold
    tab = C.box("FolderTab", (14, 4, 0.32), (-8, D / 2 + 1.8, 0.15), tab_m, 0.2); tab.parent = fold
    card = C.box("ProfileCard", (W - 6, D - 6, 0.12), (1, 0, 0.42), paper_mat("Card", card_image()), 0.0); card.parent = fold
    clip_m, _ = C.principled("Clip", "#C9CDD2", metallic=1, rough=0.25)
    C.box("Clip", (6, 1.2, 0.5), (-6, D / 2 - 3.5, 0.6), clip_m, 0.2).parent = fold
    hinge = bpy.data.objects.new("CoverHinge", None); hinge.parent = fold; hinge.location = (-W / 2, 0, 0.5); C.link(hinge)
    cover = C.box("FolderCover", (W, D, 0.3), (W / 2, 0, 0), kraft, 0.2); cover.parent = hinge
    stamp = C.box("CoverStamp", (24, 6, 0.05), (W / 2 + 4, 8, 0.17), C.principled("Stamp", "#E5484D", rough=0.7)[0]); stamp.parent = hinge
    for f, y, rz in ((1, 70, math.radians(14)), (24, 0, math.radians(-4)), (F_END, -1, math.radians(-4))):
        fold.location = (-8, y, 0.3); fold.rotation_euler = (0, 0, rz)
        fold.keyframe_insert("location", frame=f); fold.keyframe_insert("rotation_euler", frame=f)
    for f, ry in ((1, 0), (30, 0), (58, math.radians(-178)), (F_END, math.radians(-178))):
        hinge.rotation_euler = (0, ry, 0); hinge.keyframe_insert("rotation_euler", frame=f)
    # lamp: shade + arm partly in frame, one warm spot = the only key; cool fill very low
    shade_m, _ = C.principled("LampShade", "#1E5B34", metallic=0.6, rough=0.3, coat=0.8)
    brass, _ = C.principled("Brass", "#B08D57", metallic=1, rough=0.25)
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=12, radius2=5, depth=10, location=(-62, 46, 44), rotation=(math.radians(25), 0, math.radians(-35)))
    bpy.context.active_object.data.materials.append(shade_m)
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.8, depth=46, location=(-70, 56, 22))
    bpy.context.active_object.data.materials.append(brass)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=10, depth=2, location=(-70, 56, 1))
    bpy.context.active_object.data.materials.append(brass)
    sp = bpy.data.lights.new("LampSpot", "SPOT"); sp.energy = 9.0e4; sp.spot_size = math.radians(70); sp.spot_blend = 0.6
    sp.color = (1.0, 0.82, 0.6); sp.shadow_soft_size = 4
    so = bpy.data.objects.new("LampSpot", sp); so.location = (-56, 40, 40); C.link(so)
    tc = so.constraints.new("TRACK_TO"); tgt = bpy.data.objects.new("LampTarget", None); tgt.location = (-4, 0, 0); C.link(tgt); tc.target = tgt
    S.area_light("CoolFill", (90, -120, 120), (0, 0, 0), 120, 2.5e3, "#9FB4FF", size_y=120)
    S.area_light("RedRim", (120, 80, 30), (0, 0, 0), 40, 3.0e3, "#E5484D", size_y=40)
    w = S.build_world(); w.inputs["Color"].default_value = (0.01, 0.011, 0.013, 1); w.inputs["Strength"].default_value = 1.0
    cam, tgt_c = camera(40, 2.8)
    cam.data.clip_start = 1
    for f in range(1, F_END + 1):
        t = ease((f - 1) / (F_END - 1))
        key_cam(cam, tgt_c, f, Vector((-6 + 6 * t, -78 + 58 * t, 120 - 30 * t)), Vector((-4, 2 + 2 * t, 0)))
    cam.data.dof.focus_object = card
    bpy.ops.wm.save_as_mainfile(filepath=str(C.ROOT / "blender/alice_s2_desk.blend"))
    print("[built] alice_s2_desk")


if __name__ == "__main__":
    build()
