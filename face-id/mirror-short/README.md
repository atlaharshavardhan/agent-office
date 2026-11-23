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
| 2 · TrueDepth reveal | 2.5–10 s | match cut to the iPhone 17 Pro Max graphic, push into the Dynamic Island, cut to the 3/4 face, IR dots land |
| 3 · Depth map | 10–19 s | dots ride on the face as it turns, warp around nose and cheeks, then become the depth map |
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
