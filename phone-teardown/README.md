# Teardowns: iPhone Duo, iPhone and AirTag in 3D

Illustrative 3D models of the iPhone Duo foldable (9 parts), a modern iPhone (11 layers) and an AirTag (7 parts), exploded from front to back. Each part comes with a short explanation of what it does.

- `iphone-duo-teardown.html` / `iphone-duo-teardown.mp4`: Apple's foldable. It unfolds, explodes into inner display, frame halves, titanium hinge, logic board, I/O board, two batteries, rear cameras, outer display and back cover, and folds shut again (Fold button on the page). `build-duo.py` generates it from `iphone-teardown.html`.
- `iphone-teardown.html`: the interactive explorer. Open it in a browser to rotate the phone, explode or collapse the layers, tap a part to read about it, or play the guided tour.
- `iphone-teardown.mp4`: the guided tour rendered as a 1920×1080, 30 fps video (about 90 s).
- `airtag-teardown.html` / `airtag-teardown.mp4`: the same for an AirTag (enclosure, antennas, logic board, speaker, battery tray, CR2032 cell, steel cap). The video is about 65 s.
- `render.js`: renders the tour to MP4 frame by frame with headless Chromium and ffmpeg.

iPhone layers: cover glass, OLED display, TrueDepth camera, frame and mid-plate, logic board, battery, Taptic Engine, speaker/mics/USB-C, rear cameras and LiDAR, MagSafe coil and magnets, back glass.

The models are built from three.js primitives using public teardown layouts. Proportions are approximate and specs vary by model. They are not affiliated with Apple.

## Re-rendering the video

From this folder:

```bash
npm pack three@0.128.0 && tar xzf three-0.128.0.tgz
```

```bash
mkdir -p fonts && for p in @fontsource/sora@5.0.18 @fontsource/ibm-plex-sans@5.0.20 @fontsource/ibm-plex-mono@5.0.12; do f=$(npm pack $p | tail -1); mkdir -p fonts/${f%.tgz}; tar xzf $f -C fonts/${f%.tgz}; done
```

```bash
node render.js iphone-teardown.html video iphone-teardown.mp4 30
```

```bash
node render.js airtag-teardown.html video airtag-teardown.mp4 30
```

Use `stills <dir> 30 <t1> <t2> ...` in place of `video <file> 30` to grab single frames at given times (in seconds). Opening the page with `?render=1` exposes `window.__tour.renderAt(t)`, which renders the tour at exactly time `t`.

## iPhone Duo Short / Reel (9:16)

- `iphone-duo-short.html`: the vertical 3D scene (open with `?render=1&clean=1` for the text-free version used by the reel).
- `reel/`: Remotion project that puts animated captions, counters, callouts, progress bar and sound effects over the 3D render.

```bash
Q='&clean=1' VW=1080 VH=1920 node render.js iphone-duo-short.html video reel/public/duo-short-3d.mp4 30
```

```bash
cd reel && npm install && npx remotion render src/index.jsx DuoReel out/duo-reel.mp4 --codec=h264 --crf=18
```

Sound effects in `reel/public/sfx` are synthesised with ffmpeg (no third-party audio). Add the voiceover later as another `<Audio>` track in `reel/src/Reel.jsx`.
