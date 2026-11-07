# Night Express (Remotion)

A 1920×1080, 30 fps, about 16.7 s animation:
1. A night-side Earth spins toward India while flight arcs launch between cities.
2. The camera dives into India, whose outline is traced in lights.
3. The Mumbai → Itarsi Jn. → Patna rail route draws, ending on a "Night Express · 120 km/h" status pill.

```bash
npm install
npx remotion studio             # preview / tweak
npx remotion render NightExpress out/night-express.mp4
```

`remotion.config.js` points at a local Chromium headless shell and uses the `swangle` (software WebGL) renderer. Remove the `setBrowserExecutable` line to let Remotion download its own browser. On a machine with a GPU, `angle` renders faster.

## How it's built
- `src/Globe.jsx`: WebGL fragment shader. It draws the exact inverse of `d3.geoOrthographic`, so every SVG overlay lines up with the globe. It covers terrain (night-tinted Blue Marble), drifting clouds, Black Marble light glow, limb shading and the cyan atmosphere.
- `NightExpress.jsx`:
  - A 2D canvas of crisp city-light points, taken from the Black Marble texture and from the city clusters and India border trace in `data.js`.
  - The starfield.
  - The SVG layers: arcs, India outline, route, train and labels.
- `public/tex/*.jpg`: NASA Blue Marble, Black Marble and cloud imagery (public domain), via the `three-globe` npm package's example textures. The lights layer is preprocessed: a high-pass of the night texture plus two blur levels for bloom.
