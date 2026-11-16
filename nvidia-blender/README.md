# NVIDIA hook: 3-second Blender opening (InvisiTech Short)

This is the opening for the Short **"How NVIDIA Lost (Nearly) $2 Trillion"**. It is a 90-frame, 30 fps, 9:16 Cycles animation of an AI accelerator: it looks dominant, then tension builds, then it breaks apart. The breaking is a metaphor for the drop in market value, not a picture of a hardware failure.

The financial numbers and captions are **not** baked into the render. The top of the frame is left empty for them, and they are added in the edit.

## Phases

| Frames | Phase | What happens |
|---|---|---|
| 1–24 | Dominance | Macro on the etched NVIDIA ring, green pulses running along the copper traces, a fast pull-back to show the whole package |
| 25–45 | Tension | The package lifts, the camera orbits, the green flickers, and the set darkens while red creeps in |
| 46–69 | Collapse | A red wave sweeps out from the dies, cracks grow across the dies and ring, and metal chips peel off in slow motion |
| 70–90 | Impact | A fast push-in, a dark set with red rim light, the chips stay suspended, and the top third stays empty for the hook text |

## Regenerate

```bash
cd nvidia-blender
python3 -m venv .venv && .venv/bin/pip install bpy==5.3.0   # Blender 5.3 as a Python module

.venv/bin/python scripts/run_all.py                 # everything: download, licence check, build, stills, 90 frames, MP4
.venv/bin/python scripts/run_all.py --build-only    # just rebuild the .blend files (about 5 minutes)
SKIP_ASSETS=1 .venv/bin/python scripts/run_all.py --build-only   # rebuild only the hook scene

.venv/bin/python scripts/render_preview.py stills          # frames 15, 45, 90 -> renders/stills/
.venv/bin/python scripts/render_preview.py frames          # PNG sequence -> renders/preview_frames/ (resumes, skips done frames)
.venv/bin/python scripts/render_preview.py encode          # -> exports/nvidia_hook_preview_1080.mp4

# only after the preview is approved:
.venv/bin/python scripts/run_all.py --final --build-only
.venv/bin/python scripts/render_preview.py frames --final && .venv/bin/python scripts/render_preview.py encode --final
```

The scripts detect the render device automatically, in this order: OptiX, CUDA, HIP, Metal, oneAPI, then CPU. This cloud machine has no GPU, so the preview was rendered on 4 CPU cores. Each frame took about 2 minutes at 32 samples with adaptive sampling and the OpenImageDenoise denoiser. The final 4K settings are 192 samples plus the volumetric haze, and a GPU machine is recommended for them.

## Files

```
scripts/
  common.py            units (1 unit = 1 cm), palette, materials, shader FX (pulses, red wave, cracks)
  download_assets.py   clones the two reference repos (ZIP fallback), notes the blocked Sketchfab model
  inspect_assets.py    licence check -> research/asset_inspection.json
  convert_assets.py    Three.js -> GLB export, only for permitted repos (none are permitted now)
  build_gpu.py         hero accelerator package -> assets/models/nvidia_ai_gpu.blend
  build_motherboard.py baseboard, traces, VRM, caps, gold contacts -> assets/models/motherboard.blend
  build_scene.py       studio lights, reflection cards, haze, camera rig, Cycles/AgX settings
  animate_hook.py      all keyframes (camera, package lift, shader FX, lights, fragments)
  render_preview.py    stills / frame sequence / ffmpeg encode
  run_all.py           single entry point
blender/nvidia_ai_gpu.blend   editable hero asset
blender/nvidia_hook.blend     editable animated scene
renders/stills/               frames 15, 45, 90
exports/nvidia_hook_preview_1080.mp4
research/FACT-SHEET.md        sourced facts for the full Short
ASSET_LICENSES.md
```

## Reused vs. new

- **Reused:** nothing from the external repositories, because neither has a licence (see `ASSET_LICENSES.md`). Only the Inter font (OFL) ships with the project.
- **New:** all geometry, all materials (Principled BSDF with procedural roughness and micro-bump, anisotropic brushed metal, and attribute-driven circuit emission), the lighting rig, the camera and the animation.

## How the effects work

Every effect is driven by four keyframed scene properties, which the materials read through Attribute nodes of type *View Layer*:

| Property | Controls |
|---|---|
| `fx_time` | Moves the pulses along each trace, using the `u` attribute (distance along the trace in cm) |
| `fx_glow` | The green flicker |
| `fx_red` | The radius of the green-to-red wavefront |
| `fx_crack` | The growth of the Voronoi fracture network on the dies and ring |

To retime an effect, change those F-curves in the Graph Editor.
