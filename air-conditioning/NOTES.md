# How You'd Invent Air Conditioning: InvisiTech Short

- **Format:** 1080×1920, 30 fps, exactly 1350 frames (45 s). The story runs 0–43 s; the end card runs 43–45 s.
- **Preview:**
  ```
  cd air-conditioning/remotion && npm install && npm run studio
  ```
  Then open the `AirConditioning` composition.
- **Code:** `src/ac/timeline.js` holds the scenes, camera, narration and state curves. `src/ac/Room.jsx` holds the layered SVG world. `src/ac/Short.jsx` holds the camera, captions, title zone, watermark and end card.
- **Voice-over slot:** put the narration at `public/audio/vo.wav` and set `HAS_VO = true` in `Short.jsx`. Music goes in `public/audio/music.wav` with `HAS_MUSIC`. Captions follow `VO_LINES` in `timeline.js`.
- **Review stills:** `review/stills/` (12 frames, one per beat) and `review/contact-sheet.jpg`.

## Scene stills
| # | Frame | Beat |
|---|---|---|
| 01 | 0 | Opening composition + title |
| 02 | 110 | Window open, curtain blowing in, hot air, 35°C |
| 03 | 265 | Fan on, push-in on the thermometer (holds 35°C) |
| 04 | 420 | Ice tray in front of the fan, air turns blue |
| 05 | 527 | Close-up: drop lands in the puddle |
| 06 | 630 | Pull back: cutaway of the indoor unit, wall section and outdoor unit |
| 07 | 760 | Heat arrows: room air → indoor coil; refrigerant loop flowing |
| 08 | 880 | Outdoor coil releases heat; compressor highlighted |
| 09 | 1080 | Moisture beads on the indoor coil → drain pan → drain hose |
| 10 | 1190 | Close-up: drop leaves the hose outside (same framing as 05) |
| 11 | 1285 | Opening composition again: window closed, AC on, 24°C |
| 12 | 1335 | End card |
