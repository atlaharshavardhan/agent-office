// Everything editable about the Short lives here: timings, narration/caption text, SFX cues
// and the real mirror-test settings.  Times are in seconds; FPS = 30.
import lengths from '../public/vo/lengths.json';

export const FPS = 30;
export const TOTAL = 1434;            // 47.8 s: the 3D dots clip (6 s: red dots, then cyan depth points) follows the side profile
export const STORY_END = 45.8;        // end card = last 2 s
export const f = (s: number) => Math.round(s * FPS);

export const SCENES = {
  hook: [0, 2.5], truedepth: [2.5, 6], scan: [6, 21.8], compare: [21.8, 30.8],
  mirror: [30.8, 38.8], test: [38.8, 45.8], end: [45.8, 47.8],
} as const;

// Hook: excerpts of public/mirror_clip.mp4 (24 fps source), played at normal speed, hard cuts.
// srcStart is in seconds of the source clip; dur in composition frames (total 75 = 2.5 s).
// Excerpt 1 ends at 0.867 s (not 1.00 s) because the generated clip already cuts to the rear
// angle at 0.875 s; excerpt 2 starts at 1.60 s to keep the 2.5 s total.  See README.
export const HOOK_CUTS = [
  { name: 'Hook 1 · side profile', srcStart: 0.0, dur: 26 },
  { name: 'Hook 2 · rear view', srcStart: 1.6, dur: 19 },
  { name: 'Hook 3 · push to the phone in his hand (still: hook_closeup.png)', srcStart: 0, dur: 30 },
];

// Captions sit at the top, except in these time ranges (seconds), where they move to the bottom so they
// do not cover the subject. 6.8–12.8 s = the 3D dots clip (red dots, then cyan depth points).
export const CAPTIONS_AT_BOTTOM: [number, number][] = [[6.8, 12.8]];

export type Line = { id: string; at: number; text: string };
// Narration = caption text.  `at` is when the voice line starts.
export const NARRATION: Line[] = [
  { id: 'n1', at: 0.05, text: 'Can a mirror fool Face ID?' },
  { id: 'n2', at: 2.2, text: 'Every time you glance at your iPhone, the TrueDepth camera wakes up.' },
  // 0:06–0:19 — the cuts in src/scenes/Scan.tsx (CUE) are placed on these lines
  { id: 'n3a', at: 6.05, text: 'The dot projector shines thousands of invisible infrared dots onto your face.' },
  { id: 'n3b', at: 12.83, text: 'The infrared camera captures the pattern.' },
  { id: 'n3c', at: 15.75, text: "Your iPhone uses it to map what's closer, like your nose, and what's farther away, like your cheek." },
  { id: 'n4', at: 22.1, text: 'It also captures an infrared image. Your iPhone uses both to check whether the face matches the one you enrolled.' },
  { id: 'n5', at: 31.2, text: "Here's the twist. A mirror can reflect infrared light too. So what happens when the phone sees only my reflection?" },
];

// Used only while there is no real test clip: an open question, no result.
export const GUESS_LINE = { id: 'n6_guess', text: 'So what do you think? Does my reflection unlock it? Comment your guess.' };

export const RESULT_LINES = {
  open: { id: 'n6_open', text: 'It unlocked. On my iPhone, the reflection was enough.' },
  locked: { id: 'n6_locked', text: "It stayed locked. My reflection alone didn't unlock it in this test." },
};

export const LEN: Record<string, number> = lengths as any;

export const SFX = [
  { name: 'SFX · whoosh (hook push)', file: 'whoosh.wav', at: 1.55, vol: 0.35 },
  { name: 'SFX · whoosh (into TrueDepth)', file: 'whoosh.wav', at: 2.45, vol: 0.3 },
  { name: 'SFX · thump (capture)', file: 'thump.wav', at: 12.8, vol: 0.25 },
  { name: 'SFX · thump (real test)', file: 'thump.wav', at: 38.8, vol: 0.45 },
];

// ---- Real mirror test (scene 6) -------------------------------------------------
// testFootage: file name inside public/ (e.g. 'mirror_test.mp4'), or '' for the placeholder.
// result: 'none' until you have watched the footage; then 'open' or 'locked' to match it.
// focus/zoom frame the footage so the lock icon is clearly visible (0..1 of the source).
export type TestProps = {
  testFootage: string;
  testStartSec: number;
  result: 'none' | 'open' | 'locked';
  resultDelaySec: number;   // let viewers see the lock icon before the line plays
  focusX: number; focusY: number; zoom: number;
};
export const DEFAULT_TEST: TestProps = {
  testFootage: '', testStartSec: 0, result: 'none', resultDelaySec: 2.0,
  focusX: 0.5, focusY: 0.3, zoom: 1.0,
};
