"""Render one frame of a .blend as a full-resolution still: blend out.png frame [samples]"""
import sys, bpy
blend, out, frame = sys.argv[1], sys.argv[2], int(sys.argv[3])
samples = int(sys.argv[4]) if len(sys.argv) > 4 else 32
bpy.ops.wm.open_mainfile(filepath=blend)
sc = bpy.context.scene
sc.render.resolution_percentage = 100; sc.cycles.samples = samples
if sc.render.engine == 'CYCLES':   # use the GPU when there is one (OPTIX first, then CUDA); CPU otherwise
    cp = bpy.context.preferences.addons['cycles'].preferences
    for kind in ('OPTIX', 'CUDA'):
        try: cp.compute_device_type = kind
        except TypeError: continue
        cp.get_devices(); gpus = [d for d in cp.devices if d.type == kind]
        if gpus:
            for d in cp.devices: d.use = d.type == kind
            sc.cycles.device = 'GPU'; print('Cycles device:', kind, [d.name for d in gpus]); break
    else: print('Cycles device: CPU')
sc.frame_set(frame); sc.render.filepath = out
bpy.ops.render.render(write_still=True)
