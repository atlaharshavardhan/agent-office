"""Close-up character still of assets/characters/jensen_huang.blend (studio lighting): out.png"""
import sys, math
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy
from mathutils import Vector
import build_scene as S
ROOT = Path(__file__).resolve().parent.parent
bpy.ops.wm.open_mainfile(filepath=str(ROOT / "assets/characters/jensen_huang.blend"))
sc = bpy.context.scene
S.render_settings(samples=40)
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1080, 1920, 100
sc.frame_set(30)
arm = [o for o in bpy.data.objects if o.type == "ARMATURE"][0]
head = arm.matrix_world @ arm.pose.bones["head"].head
S.area_light("Key", (-120, -160, head.z + 60), tuple(head), 80, 6e4, "#FFEBD8", size_y=80)
S.area_light("Fill", (140, -150, head.z), tuple(head), 120, 1.5e4, "#D8E4FF", size_y=120)
S.area_light("Rim", (60, 160, head.z + 60), tuple(head), 60, 5e4, "#76B900", size_y=60)
S.area_light("Rim2", (-80, 150, head.z + 40), tuple(head), 60, 3e4, "#FFFFFF", size_y=60)
w = S.build_world(); w.inputs["Color"].default_value = (0.05, 0.055, 0.06, 1); w.inputs["Strength"].default_value = 1.0
cam, tgt = S.build_camera()
cam.data.lens = 60; cam.data.dof.aperture_fstop = 2.8
cam.location = head + Vector((-55, -240, -25)); tgt.location = head + Vector((0, 0, -35))
cam.data.dof.focus_object = None; cam.data.dof.focus_distance = (cam.location - head).length
sc.render.filepath = sys.argv[1]
bpy.ops.render.render(write_still=True)
