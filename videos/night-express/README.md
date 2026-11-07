# Night Express (Remotion)

A 1920×1080, 30 fps, about 16.7 s animation: a night globe of city lights with flight arcs turns toward India, zooms in, and draws the Mumbai → Itarsi Jn. → Patna rail route, ending on a "Night Express · 120 km/h" status pill.

```bash
npm install
npx remotion studio             # preview / tweak
npx remotion render NightExpress out/night-express.mp4
```

`remotion.config.js` points at a local Chromium headless shell. Remove the `setBrowserExecutable` line to let Remotion download its own.

- `src/data.js`: city-light dots (land masks from world-atlas, seeded RNG), flight arcs, rail waypoints
- `src/NightExpress.jsx`: camera timeline, orthographic globe (d3-geo), arcs, route, train, labels
