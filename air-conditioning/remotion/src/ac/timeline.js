// "How You'd Invent Air Conditioning" · timeline (30 fps, 1350 frames = 45 s). Everything is frame-based.
import { Easing, interpolate } from 'remotion';

export const FPS = 30;
export const W = 1080, H = 1920;
export const TOTAL = 1350;              // 45 s
export const STORY_END = 1290;          // 43 s -> end card
export const sec = (s) => Math.round(s * FPS);

export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
const IO = Easing.inOut(Easing.cubic);
export const eio = (x) => IO(clamp(x));
export const eout = (x) => Easing.out(Easing.cubic)(clamp(x));
export const ramp = (f, a, b, ease = eio) => ease(clamp((f - a) / Math.max(1, b - a)));
/** piecewise interpolation with ease-in-out between keys */
export const keys = (f, fr, vals) => interpolate(f, fr, vals, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: IO });

// ---------------------------------------------------------------- scenes
export const SCENES = [
  { id: 'window', from: 0, to: 150, tag: 'TRY 1', name: 'Open the window' },
  { id: 'fan', from: 150, to: 330, tag: 'TRY 2', name: 'Switch on a fan' },
  { id: 'ice', from: 330, to: 540, tag: 'TRY 3', name: 'Add ice' },
  { id: 'question', from: 540, to: 660, tag: 'THE REAL QUESTION', name: '' },
  { id: 'heat', from: 660, to: 1020, tag: 'THE INVENTION', name: 'Move the heat outside' },
  { id: 'drain', from: 1020, to: 1200, tag: 'BONUS', name: 'Where the water goes' },
  { id: 'payoff', from: 1200, to: 1290, tag: 'RESULT', name: '' },
];

// ---------------------------------------------------------------- narration (captions; VO slot in Short.jsx)
export const VO_LINES = [
  { from: 0.2, to: 4.8, text: 'Your room is roasting. You open the window, and even hotter air rushes in.' },
  { from: 5.1, to: 10.8, text: 'You switch on a fan. The breeze feels good, but the room is still just as hot.' },
  { from: 11.1, to: 17.8, text: 'So you put ice in front of the fan. It works… until the ice becomes a puddle.' },
  { from: 18.2, to: 21.8, text: 'How do you keep the room cool without refilling the ice?' },
  { from: 22.1, to: 33.8, text: 'An AC uses a fluid that picks up heat at the indoor coil and releases it at the outdoor coil. Then the cycle repeats.' },
  { from: 34.1, to: 39.8, text: 'Moisture also beads up on the cold indoor coil and drains outside through a little hose.' },
  { from: 40.1, to: 42.8, text: 'Now watch the thermometer drop.' },
  { from: 43.2, to: 44.8, text: 'Follow InvisiTech for more.' },
];

/** split each line into short caption chunks (max ~4-5 words), timed by character count */
export const CAPTIONS = VO_LINES.flatMap((l) => {
  const words = l.text.split(' ');
  const chunks = []; let cur = [];
  for (const w of words) {
    cur.push(w);
    const len = cur.join(' ').length;
    if (len >= 22 || /[.,?!…]$/.test(w) && len >= 12) { chunks.push(cur.join(' ')); cur = []; }
  }
  if (cur.length) chunks.push(cur.join(' '));
  const total = chunks.reduce((s, c) => s + c.length + 4, 0);
  let t = l.from;
  return chunks.map((c) => { const d = (l.to - l.from) * (c.length + 4) / total; const o = { text: c, from: t, to: t + d }; t += d; return o; });
});

// ---------------------------------------------------------------- cameras (world point at screen centre + zoom)
// 3/4 room camera. Opening composition = (540, 960, 1); the payoff returns to it exactly at frame 1200.
const CAM34 = [
  [0, 540, 960, 1], [150, 540, 960, 1],
  [188, 560, 870, 1.55], [322, 560, 870, 1.55],          // fan + thermometer together (35°C readable)
  [342, 720, 985, 1.45], [496, 720, 985, 1.45],          // fan airflow over the ice tray
  [512, 735, 1044.7, 3], [540, 735, 1044.7, 3],          // close-up: drop lands in the tray
  [570, 250, 880, 1.45], [646, 250, 880, 1.45],          // back to the same window: the AC slides into the opening
  [1199, 250, 880, 1.45], [1200, 540, 960, 1], [1350, 540, 960, 1],
];
// flat 2D side cutaway camera (2D coordinates = screen coordinates at (540,960,1)); straight pans/zooms only
const CAM2D = [
  [630, 570, 740, 1.1], [664, 570, 740, 1.1],            // wide: one box straddling the window
  [690, 300, 745, 1.55], [744, 300, 745, 1.55],          // 1 room heat into the indoor coil
  [766, 570, 740, 1.1], [796, 570, 740, 1.1],            // 2 refrigerant circulates inside the box
  [818, 770, 745, 1.55], [904, 770, 745, 1.55],          // 3 compressor, 4 outdoor coil releases heat outside
  [926, 570, 740, 1.1], [1020, 570, 740, 1.1],           // 5 cycle repeats
  [1034, 570, 750, 1.1], [1138, 570, 750, 1.1],          // water: pan -> outlet at the outdoor end
  [1160, 915, 939.3, 3], [1212, 915, 939.3, 3],          // close-up: drop falls outside (same size/path as the tray drop)
];
const cam = (K, f) => {
  const fr = K.map((k) => k[0]);
  return { cx: keys(f, fr, K.map((k) => k[1])), cy: keys(f, fr, K.map((k) => k[2])), z: keys(f, fr, K.map((k) => k[3])) };
};
export const camera = (f) => {
  const c = cam(CAM34, f);
  const env = ramp(f, 150, 190) * (1 - ramp(f, 500, 520));     // tiny drift only inside the experiments
  return { cx: c.cx + Math.sin(f / 47) * 4 * env, cy: c.cy + Math.cos(f / 61) * 3 * env, z: c.z };
};
export const camera2d = (f) => cam(CAM2D, f);
/** which view is on screen: 0 = 3/4 room, 1 = 2D cutaway */
export const cutMix = (f) => ramp(f, 632, 650) * (1 - ramp(f, 1200, 1210));

// ---------------------------------------------------------------- state curves
export const windowOpen = (f) => ramp(f, 14, 44) * (1 - 0.32 * ramp(f, 600, 622));   // opens, then lowers onto the window AC
/** air moving through the open window (curtain gusts, hot air): stops once the AC fills the opening */
export const breeze = (f) => ramp(f, 14, 44) * (1 - ramp(f, 560, 600));
/** window AC: slides into the opening, side gaps filled, then runs (cutaway + payoff) */
export const winAcIn = (f) => ramp(f, 566, 598, (x) => Easing.out(Easing.cubic)(x));
export const winAcGaps = (f) => ramp(f, 612, 632);
export const fanSpeed = (f) => clamp((f - 160) / 40);           // 0..1 spin-up
export const fanAngle = (f) => {                                 // integral of speed (deg)
  const max = 34;
  if (f < 160) return 0;
  if (f < 200) return max * (f - 160) ** 2 / 80;
  return max * 20 + max * (f - 200);
};
export const trayIn = (f) => ramp(f, 336, 372, eout);
export const melt = (f) => ramp(f, 420, 500, (x) => clamp(x));   // 0 solid -> 1 puddle
export const coolAir = (f) => ramp(f, 384, 404) * (1 - ramp(f, 466, 494));
/** the AC is "invented" during the question beat: absent before, there for the cutaway and the payoff */
export const acAppear = () => 0;   // no split AC in this story
export const cutaway = () => 0;   // the 3/4 room is never cut open: the explanation uses the flat 2D cutaway
export const acOn = (f) => (f >= 1200 ? ramp(f, 1204, 1222) : 0);   // window AC running at the payoff
export const temperature = (f) => {
  let t = keys(f, [0, 20, 140], [33, 33, 35]);
  t -= 0.6 * ramp(f, 400, 440) * (1 - ramp(f, 476, 520));         // ice: tiny dip, then back
  t -= 11 * ramp(f, 1228, 1262, Easing.inOut(Easing.quad));       // payoff: 35 -> 24, then holds 24°C to 1290
  return t;
};
