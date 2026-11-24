// Everything editable about the Short lives here: timings, narration/caption text, SFX cues
// and the real mirror-test settings.  Times are in seconds; FPS = 30.
import lengths from '../public/vo/lengths.json';

export const FPS = 30;
export const TOTAL = 1350;            // 45 s exactly
export const STORY_END = 43;          // end card = last 2 s
export const f = (s: number) => Math.round(s * FPS);

export const SCENES = {
  hook: [0, 2.5], truedepth: [2.5, 6], scan: [6, 19], compare: [19, 28],
  mirror: [28, 36], test: [36, 43], end: [43, 45],
} as const;

// Hook: excerpts of public/mirror_clip.mp4 (24 fps source), played at normal speed, hard cuts.
// srcStart is in seconds of the source clip; dur in composition frames (total 75 = 2.5 s).
// Excerpt 1 ends at 0.867 s (not 1.00 s) because the generated clip already cuts to the rear
// angle at 0.875 s; excerpt 2 starts at 1.60 s to keep the 2.5 s total.  See README.
export const HOOK_CUTS = [
  { name: 'Hook 1 · side profile', srcStart: 0.0, dur: 26 },
  { name: 'Hook 2 · rear view', srcStart: 1.6, dur: 19 },
  { name: 'Hook 3 · push to screen', srcStart: 2.7667, dur: 30 },
];

export type Line = { id: string; at: number; text: string };
// Narration = caption text.  `at` is when the voice line starts.
export const NARRATION: Line[] = [
  { id: 'n1', at: 0.05, text: 'Can a mirror fool Face ID?' },
  { id: 'n2', at: 2.2, text: 'Every time you glance at your iPhone, the TrueDepth camera wakes up.' },
  { id: 'n3a', at: 6.05, text: 'The projector shines thousands of invisible dots onto your face.' },
  { id: 'n3b', at: 9.9, text: 'The infrared camera captures that pattern.' },
  { id: 'n3c', at: 12.4, text: 'Your iPhone uses it to work out which parts are closer, like your nose, and which are farther away, like your cheeks.' },
  { id: 'n4', at: 19.3, text: 'It also captures an infrared image. Your iPhone uses both to check whether the face matches the one you enrolled.' },
  { id: 'n5', at: 28.4, text: "Here's the twist. A mirror can reflect infrared light too. So what happens when the phone sees only my reflection?" },
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
  { name: 'SFX · whoosh (into TrueDepth)', file: 'whoosh.wav', at: 3.85, vol: 0.3 },
  { name: 'SFX · whoosh (to the sensor)', file: 'whoosh.wav', at: 7.35, vol: 0.25 },
  { name: 'SFX · thump (real test)', file: 'thump.wav', at: 36.0, vol: 0.45 },
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
