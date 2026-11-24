# "Can a Mirror Fool Face ID?" — 45 s InvisiTech Short (Remotion)

1080 × 1920, 30 fps, exactly 1,350 frames. Story ends at 43 s; 43–45 s is the end card.

## Preview

```bash
npm install
npm run studio          # opens Remotion Studio → composition "MirrorFaceID"
npm run render          # out/mirror-faceid.mp4
```

## Timeline (Studio shows each as its own track)

| Track | Time | What |
|---|---|---|
| 1 · Mirror hook | 0–2.5 s | 3 excerpts of `public/mirror_clip.mp4`, normal speed, hard cuts |
| 2 · TrueDepth reveal | 2.5–6 s | match cut to the iPhone 17 Pro Max graphic, quick push into the TrueDepth sensor area |
| 3 · Infrared scan and depth map | 6–19 s | side profile with the phone facing him → his face from the phone's viewpoint → infrared camera view, dot pattern captured at once and pinned to the skin → closer / farther → aligned depth map → only the depth map turns |
| 4 · What the iPhone compares | 19–28 s | depth map + infrared image → "ENROLLED FACE DATA" (no lock screen) |
| 5 · Back to the mirror | 28–36 s | bathroom side view with a thin illustrative IR path |
| 6 · Real test | 36–43 s | your real footage, or a labelled placeholder |
| 7 · End card | 43–45 s | InvisiTech wordmark, 60 frames |
| Captions | 0–43 s | generated from the narration text in `src/script.ts` |
| Narration · n1…n5 (+ n6) | | Kokoro bm_george WAVs in `public/vo/` |
| SFX · … | | 4 quiet cues in `public/sfx/` |

## Editing

Everything editable is in `src/script.ts`: narration/caption text and start times, hook excerpts,
SFX cues, and the real-test settings.

If you change a narration line, regenerate the audio:
`python tools/vo_lines.py <path to kokoro models dir>` (needs `kokoro-onnx`, `soundfile`).

### Adding the real mirror test (scene 6)

1. Copy the clip to `public/` (e.g. `public/mirror_test.mp4`).
2. In `src/script.ts` → `DEFAULT_TEST` (or the Studio Props panel) set
   - `testFootage: 'mirror_test.mp4'`, `testStartSec` (where in the clip to start),
   - `focusX`, `focusY`, `zoom` so the lock icon is clearly visible,
   - `result: 'open'` or `'locked'` — **only after watching the footage**.
3. The matching line ("It unlocked…" / "It stayed locked…") then plays `resultDelaySec` (2 s)
   after the cut, so viewers see the lock icon first. With `result: 'none'` or no footage,
   no result line or caption plays and the scene shows the placeholder.

## Notes

- Hook excerpt timing: the generated clip already cuts from the side profile to the rear angle at
  0.875 s, so excerpt 1 is 0–0.867 s (not 0–1.00 s) and excerpt 2 is 1.60–2.23 s, to avoid a
  3-frame flash of the rear angle. Excerpt 3 is 2.77–3.77 s with a quick push that keeps the
  generated phone's round camera cutout out of frame. Total stays 2.5 s.
- Explainer stills (same character): `public/face_34.png`, `face_15.png` (spare), `face_ir.png`,
  `face_depth.png` (GPT Image 2.6 on Higgsfield). `public/bathroom_side.png` is the side-profile
  reference still.
- `tools/prep_face.py` builds `public/rot/*` (2.5D head turn from the depth map) and
  `src/dots.json` (dot pattern with depth per dot, so dots stay on the face).
- `tools/make_sfx.py` builds the SFX.
- Dots, the depth map and the IR path are explainer visuals (the real dots are invisible).

- Scenes 2–3 dot scan is real 3D (`src/scenes/Scan3D.tsx`, Three.js): the face is a relief mesh built from
  `public/relief.png` (`tools/prep_3d.py`), the dots fly from the phone's projector and land on it, and the
  camera orbits. `FaceStage.tsx` and `public/rot/*` are the older 2D version, no longer used.
- The 3D phone is `public/models/iphone.glb`, the GLTF iPhone Pro Max model from the HyperFrames registry block
  `vfx-iphone-device` (`npx hyperframes add vfx-iphone-device`); our own lit screen is mapped onto its front glass.
- Scene 3 (`src/scenes/Scan.tsx`) uses the host's face stills unchanged (colour, infrared, depth map are the same
  aligned image). `Scan3D.tsx` / `Phone3D.tsx` (Three.js version) are kept but no longer on the timeline.
- 0:08–0:19 is `src/scenes/Orbit3D.tsx`: a full 3D model of the host's head (`public/models/head.glb` + `head_tex.jpg`,
  Hunyuan3D v3 on Higgsfield from `face_15.png`, slimmed by `tools/prep_head.py`). The camera travels from the left of
  his head to the right while the iPhone fires the dots, they turn cyan, and the head becomes a depth map.
- 0:01.5–0:06 stays on the phone in his hand (`src/scenes/HandPhone.tsx`, still `public/hook_closeup.png`): the hook's
  push-in lands on it, the camera zooms to its Dynamic Island and the Face ID glyph animation plays there.
  `PhoneReveal.tsx` (separate 3D phone opening) is no longer on the timeline. Hook preview stills are in `hook-stills/`.
- Current 0:06–0:19 (`src/scenes/Scan.tsx`, cue frames in `CUE`): side profile → grayscale view from the front sensor
  (straight-on stills `face_front*.png`, relief + dots from `tools/prep_front.py`) with the whole dot pattern appearing
  at once → INFRARED CAMERA VIEW capture → match cut to the depth map, CLOSER on "nose", FARTHER on "cheek", slight turn.
  `Orbit3D.tsx`, `Scan3D.tsx`, `PhoneReveal.tsx`, `Guess.tsx` are earlier versions kept off the timeline.
- 0:04–0:06 shows a neutral closed padlock in the Dynamic Island; scene 6 is a labelled placeholder until real footage is set.

## Current cut (40.8 s, 1,224 frames)

| Time | Scene | Narration |
|---|---|---|
| 0:00–0:05 | Mirror hook: side profile, rear view held on the reflected phone, push into the display | "Have you ever wondered if your reflection can unlock an iPhone 18 Pro Max?" |
| 0:05–0:09 | Inside the phone: Dynamic Island close-up, parts pulled up and explained | "First, look at what happens up here when I wake the phone." |
| 0:09–0:14.5 | Red-dot projection, 3D side profile | "This tiny projector puts thousands of invisible dots on my face." |
| 0:14.5–0:16 | Frontal red-dot close-up, INFRARED CAMERA VIEW (cut on "picks up") | "And the infrared camera picks up that pattern." |
| 0:16–0:20.2 | Mirror: dots leave the phone, bounce off the glass, land on his face | "Here's the twist. A mirror can bounce that infrared light back, too." |
| 0:20.2–0:26.1 | Frontal red-dot face with CLOSER / FARTHER, cyan point cloud, depth web | "See my nose? It's closer than my cheeks. The phone uses that pattern to map the shape of my face." |
| 0:26.1–0:32.8 | Infrared image, depth + infrared, comparison ring (ends while still comparing) | "It also takes an infrared picture. Then it uses both to check if I'm the person who set up Face ID." |
| 0:32.8–0:38.8 | Real mirror test (reveal slot) | "So, did it work?" then, 3.2 s in, the result line once footage is set |
| 0:38.8–0:40.8 | End card | |

- Result lines: locked = "In my test, it stayed locked." / open = "It actually unlocked." They play only when `testFootage`
  is set and `result` matches it (`src/script.ts` → `DEFAULT_TEST`).
- All timings, narration text, caption placement and SFX are in `src/script.ts`; cue frames inside scenes are `CUE_A` / `CUE_B`
  (`Scan.tsx`), `CMP` (`Compare.tsx`), `MIR` / `MIR_FROM` (`Mirror.tsx`), `TEAR` (`HandPhone.tsx`).
- Voice: `python tools/vo_lines.py <kokoro models dir> [line ids…]`.
