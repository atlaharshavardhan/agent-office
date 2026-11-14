// Deterministic, frame-driven animation helpers (no randomness at render time)
import { Easing, interpolate } from 'remotion';

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => { const u = clamp01(t); return u * u * u * (u * (u * 6 - 15) + 10); };
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.55, 0, 1, 0.45);

/** 0..1 progress between two times (seconds) with an easing curve */
export const prog = (f: number, s0: number, s1: number, ease = easeInOut) =>
  interpolate(f / FPS, [s0, s1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

/** keyframed value over seconds: [[t, v], ...] with smooth easing between keys */
export const keys = (f: number, ks: [number, number][], ease = easeInOut) => {
  const t = f / FPS;
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 0; i < ks.length - 1; i++) {
    const [t0, v0] = ks[i], [t1, v1] = ks[i + 1];
    if (t <= t1) return lerp(v0, v1, ease((t - t0) / (t1 - t0)));
  }
  return ks[ks.length - 1][1];
};

/** damped overshoot (anticipation/follow-through) 0..1 */
export const overshoot = (t: number, amount = 0.12) => {
  const u = clamp01(t); return 1 - Math.cos(u * Math.PI * 1.5) * Math.exp(-u * 5) * (1 - u) - (1 - u) * (1 - u) * 0 + Math.sin(u * Math.PI) * amount * (1 - u);
};

/** a short on/off pulse (seconds) with soft edges */
export const pulse = (f: number, on: number, off: number, soft = 0.04) => {
  const t = f / FPS; if (t < on || t > off) return 0;
  return Math.min(1, (t - on) / soft, (off - t) / soft);
};

/** deterministic hash noise */
export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const wobble = (f: number, speed: number, seed: number) => Math.sin(f / FPS * speed + seed * 6.283) * 0.5 + Math.sin(f / FPS * speed * 1.7 + seed * 3.1) * 0.5;
