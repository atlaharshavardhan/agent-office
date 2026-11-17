"""Render one frame of a .blend as a full-resolution still: blend out.png frame [samples]"""
import sys, bpy
blend, out, frame = sys.argv[1], sys.argv[2], int(sys.argv[3])
samples = int(sys.argv[4]) if len(sys.argv) > 4 else 32
bpy.ops.wm.open_mainfile(filepath=blend)
sc = bpy.context.scene
sc.render.resolution_percentage = 100; sc.cycles.samples = samples
sc.frame_set(frame); sc.render.filepath = out
bpy.ops.render.render(write_still=True)
