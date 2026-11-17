// Shared look + timing for "NVIDIA market collapse" v1.
import { interpolate, Easing } from 'remotion';
import TL from './timeline.json';

export { TL };
export const FPS = 30;
export const W = 1080, H = 1920;
export const C = {
  bg: '#101214', green: '#76B900', silver: '#BFC5CC', gold: '#C49A52', red: '#E5484D', white: '#F5F5F5',
};
// Safe margins for Shorts / Reels at 1080x1920 (left 90, right 180, top 200, bottom 350)
export const SAFE = { l: 90, r: 180, t: 200, b: 350 };
export const FONT = "'Inter Display', 'Inter', sans-serif";
export const BODY = "'Inter', sans-serif";

export const sec = (s) => Math.round(s * FPS);
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ramp = (f, s0, dur, ease = Easing.out(Easing.cubic)) =>
  interpolate(f, [sec(s0), sec(s0 + dur)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
export const lerp = (a, b, t) => a + (b - a) * t;

// Scene windows in seconds (from timeline.json, built from the real voice lengths)
export const SCENES = TL.scenes.map((s, i) => ({ start: s, end: TL.scenes[i + 1] ?? TL.end }));

// Verified market-cap path (RESEARCH.md §8): $T, close x 24.1B shares. i = derived/interpolated close
export const CAPS = [
  ['Oct 6', 5.77], ['Oct 13', 5.51, 'i'], ['Oct 14', 5.33], ['Oct 15', 5.24], ['Oct 16', 5.16], ['Oct 22', 5.11],
  ['Oct 29', 5.15], ['Oct 30', 4.93], ['Nov 3', 4.98, 'i'], ['Nov 4', 4.82, 'i'], ['Nov 5', 4.38], ['Nov 6', 4.50],
  ['Nov 9', 4.31], ['Nov 10', 4.07], ['Nov 11', 4.19], ['Nov 12', 4.00, 'i'], ['Nov 13', 3.92], ['Nov 16', 3.76],
];
