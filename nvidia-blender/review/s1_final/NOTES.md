# S1 Final — Cinematic Motion-Graphics Hook (v1)

**Output:** `exports/S1-hook-cinematic-final-v1-1080.mp4`
- 1080×1920, 30 fps, 150 frames, exactly 5.00 s.
- H.264 video, AAC audio, mixed to −14 LUFS.

**Paid generation used:** none. No Higgsfield, Kling or other paid calls. Everything new was made locally with Blender, OpenCV, rembg (ISNet), Remotion and Three.js, Kokoro TTS and numpy.

## Shot plan
| Shot | Frames | What moves |
|---|---|---|
| 1 · NVIDIA'S CEO | 0–45 | Character: the existing Kling clip, 2.33–3.83 s (strongest hand gesture; eyes open at the cut-in, since the blink ends at 2.25 s). Camera: push-in with lateral drift, depth-weighted per layer. Environment: LED wall *behind* him (NVIDIA mark, scrolling grid, bars, die outline, scan line), three sweeping beams, drifting haze in front and behind. Lighting: green rim sweep and warm/cool split, both masked to his matte. Foreground: Blender GPU (pass A), the strongest parallax, lit by the same sweeping spots. |
| 1→2 | 40–50 | Lateral match-cut with motion blur and a green light flare. |
| 2 · ALICE HUANG / THE CONNECTION | 45–96 | Multiplane track with 7 layers at different depths. The reflection moves *against* the track. City lights twinkle, traffic moves on the waterline, aircraft beacons blink, the water shimmers, a glass sweep crosses the window, the lamp warmth "breathes" and a key-light sweep crosses her. Hair-edge displacement is kept to 3 px. A separate NVIDIA inset card is joined to her name by a thin animated line; no meeting is depicted. |
| 2→3 | 86–100 | The connection line branches into circuit traces, then a push into the traces. |
| 3 · WHAT DID NVIDIA KNOW? | 96–150 | Blender GPU macro (pass B): rotation, glide-in, DOF and a growing green circuit glow, ending inside the compute die (hand-off to S2). Behind it, a Three.js map on a tilted plane shows the US, Singapore and China at accurate lon/lat, with a restrained dotted arc and a "?". |

## Fact and legal guardrails
- **The voice-over asks two questions and asserts nothing:** "Was NVIDIA's CEO targeted? What did he know about the chips?"
- **On-screen labels:**
  - "former Megaspeed executive", the same wording as research.json;
  - "AI-generated illustration · not a photo of Alice Huang" on Shots 1–2;
  - map footnote: "Dotted line = open question, not a confirmed route · map: Natural Earth".
- **No implied conduct:** no meeting, exchange or shipment route is shown as fact.
- **Skyline:** the source illustration showed a recognisable **Hong Kong** skyline (IFC, Bank of China Tower). It was **replaced** with a procedural, landmark-free night city (neutral corporate setting). It is not labelled as Singapore.
- **Map data:** Singapore is too small for the Natural Earth outline set, so it is shown as a marker at 103.82° E, 1.35° N. The US marker is Santa Clara (NVIDIA HQ); the China marker is Beijing.
- **Defamation risk:** "What did he know about the chips?" is still a reputational-risk line, flagged earlier. It is kept because it was specified; the earlier safer alternative was "Where did the chips go?".

## Reproduce (all automated)
```bash
.venv/bin/python scripts/s1_final_gpu.py -- --pass A --samples 24     # 45 RGBA frames (renders/s1_final/gpuA)
.venv/bin/python scripts/s1_final_gpu.py -- --pass B --samples 24     # 54 RGBA frames (renders/s1_final/gpuB)
.venv/bin/python -I scripts/s1_final_layers.py                         # mattes + Alice layers -> remotion/public/s1f
.venv/bin/python review/s1_final/audio/make_audio.py                   # VO + SFX -> remotion/public/s1f/s1f_mix.wav
cp renders/s1_final/gpuA/*.png remotion/public/s1f/gpuA/ && cp renders/s1_final/gpuB/*.png remotion/public/s1f/gpuB/
cd remotion && npx remotion render src/index.jsx S1Final ../exports/S1-hook-cinematic-final-v1-1080.mp4 --codec h264 --audio-codec aac --crf 16
```
**4K (2160×3840):**
1. Re-run both GPU passes with `--final` (2× resolution, best on the GPU VM: about 13 s per frame there versus about 70 s on this CPU).
2. Then run `npx remotion render … --scale 2`.

**4K caveat:** the character plates are 1080-wide sources (the Kling clip is 1076×1924; the Alice image is 752×1344). At 4K they are upscaled with plain Lanczos only: no sharpening and no AI face upscaling.

## Files
- Blender: `scripts/s1_final_gpu.py`. Layers: `scripts/s1_final_layers.py`. Audio: `review/s1_final/audio/make_audio.py`.
- Remotion composition: `remotion/src/s1/S1Final.jsx`, composition id `S1Final`. The Three.js map is `MapScene` / `Shot3` in the same file.
- Layers and masks: `remotion/public/s1f/a/*` (Alice) and `remotion/public/s1f/j/{plate,fg}` (Jensen). Mask copies for review: `review/s1_final/layers/`.
- Storyboard sheet: `review/s1_final/s1-final-storyboard.jpg` (frames 0, 30, 70, 118, 149).
