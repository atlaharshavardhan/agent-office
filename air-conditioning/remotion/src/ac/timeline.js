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

// ---------------------------------------------------------------- camera (world point at screen centre + zoom)
// Opening composition = (540, 960, 1). The payoff returns to it exactly.
const CAM = [
  [0, 540, 960, 1], [150, 540, 960, 1],
  [232, 505, 800, 1.75], [298, 505, 800, 1.75],        // push in on the thermometer
  [336, 680, 1010, 1.42], [494, 680, 1010, 1.42],       // fan + ice on the table
  [512, 735, 1044.7, 3], [540, 735, 1044.7, 3],          // close-up: drop lands in the tray
  [604, 1050, 800, 0.78],                                // pull back: cutaway reveal
  [664, 1092, 650, 1.0], [1018, 1092, 650, 1.0],       // short push-in on the AC cutaway
  [1040, 1092, 700, 1.0], [1148, 1092, 700, 1.0],
  [1170, 1180, 1203.3, 3], [1199, 1180, 1203.3, 3],      // close-up: drop leaves the drain hose (echoes 512-540)
  [1222, 540, 960, 1], [1350, 540, 960, 1],              // back to the opening composition
];
export const camera = (f) => {
  const fr = CAM.map((k) => k[0]);
  const cx = keys(f, fr, CAM.map((k) => k[1]));
  const cy = keys(f, fr, CAM.map((k) => k[2]));
  const z = keys(f, fr, CAM.map((k) => k[3]));
  // subtle handheld-free drift, only between the opening and the payoff (so both compositions match exactly)
  const env = ramp(f, 150, 190) * (1 - ramp(f, 1180, 1215));
  return { cx: cx + Math.sin(f / 47) * 5 * env, cy: cy + Math.cos(f / 61) * 4 * env, z };
};

// ---------------------------------------------------------------- state curves
export const windowOpen = (f) => ramp(f, 14, 44) * (1 - ramp(f, 1208, 1240));
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
export const cutaway = (f) => ramp(f, 588, 640) * (1 - ramp(f, 1198, 1214));
export const acOn = (f) => (f >= 650 && f < 1205 ? ramp(f, 650, 672) : 0) + (f >= 1205 ? ramp(f, 1210, 1232) : 0);
export const temperature = (f) => {
  let t = keys(f, [0, 20, 140], [33, 33, 35]);
  t -= 0.6 * ramp(f, 400, 440) * (1 - ramp(f, 476, 520));         // ice: tiny dip, then back
  t -= 11 * ramp(f, 1226, 1288, Easing.out(Easing.quad));         // payoff: 35 -> 24
  return t;
};
