# Teardowns: iPhone and AirTag in 3D

Illustrative 3D models of a modern iPhone (11 layers) and an AirTag (7 parts), exploded from front to back. Each part comes with a short explanation of what it does.

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
