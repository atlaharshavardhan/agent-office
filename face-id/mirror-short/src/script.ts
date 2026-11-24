// Everything editable about the Short lives here: timings, narration/caption text, SFX cues
// and the real mirror-test settings.  Times are in seconds; FPS = 30.
import lengths from '../public/vo/lengths.json';

export const FPS = 30;
export const TOTAL = 1350;            // 45 s
export const STORY_END = 43;          // end card = last 2 s
export const f = (s: number) => Math.round(s * FPS);

export const SCENES = {
  hook: [0, 2.5], truedepth: [2.5, 6], scan: [6, 20.4], compare: [20.4, 28.6],
  mirror: [28.6, 36], test: [36, 43], end: [43, 45],
} as const;

// Hook: excerpts of public/mirror_clip.mp4 (24 fps source), played at normal speed, hard cuts.
// srcStart is in seconds of the source clip; dur in composition frames (total 75 = 2.5 s).
// Excerpt 1 ends at 0.867 s (not 1.00 s) because the generated clip already cuts to the rear
// angle at 0.875 s; excerpt 2 starts at 1.60 s to keep the 2.5 s total.  See README.
export type HookZoom = { ox: number; oy: number; frames: number[]; scale: number[] };
export const HOOK_CUTS: { name: string; srcStart: number; dur: number; zoom?: HookZoom }[] = [
  { name: 'Hook 1 · side profile', srcStart: 0.0, dur: 26, zoom: { ox: 0.62, oy: 0.36, frames: [0, 8, 26], scale: [1.35, 1.05, 1.5] } },
  { name: 'Hook 2 · rear view', srcStart: 1.6, dur: 19, zoom: { ox: 0.52, oy: 0.33, frames: [0, 7, 19], scale: [1.5, 1.15, 2.0] } },
  { name: 'Hook 3 · push to the phone in his hand (still: hook_closeup.png)', srcStart: 0, dur: 30 },
];

// Caption placement, decided clip by clip from where the frame has empty space (y of the caption block's top).
// Default is the top of the frame (230). Ranges are in seconds.
//  1.5–3.0  phone in his hand: the top of the frame holds the phone's Dynamic Island and clock -> lower, over his hand
//  6.0–11.53 3D red dots clip and 13.33–14.7 cyan point cloud: the space is above his head -> top, raised to clear his hair and the dots
export const CAPTION_TOP_DEFAULT = 230;
export const CAPTION_PLACEMENT: { from: number; to: number; top: number }[] = [
  { from: 1.5, to: 3.0, top: 1300 },
  { from: 6.0, to: 11.53, top: 185 },
  { from: 13.33, to: 14.93, top: 185 },
  { from: 20.4, to: 28.6, top: 170 },   // comparison: the picture sits lower, the caption stays in the clear band above it
];

export type Line = { id: string; at: number; text: string };
// Narration = caption text.  `at` is when the voice line starts.
export const NARRATION: Line[] = [
  { id: 'n1', at: 0.05, text: 'Can a mirror fool Face ID?' },
  { id: 'n2', at: 2.05, text: 'Every time you glance at your iPhone, the TrueDepth camera wakes up.' },
  // 0:06–0:19 — the cuts in src/scenes/Scan.tsx (CUE) are placed on these lines
  { id: 'n3a', at: 6.05, text: 'The dot projector shines thousands of invisible infrared dots onto your face.' },
  { id: 'n3b', at: 10.43, text: 'The infrared camera captures the pattern.' },
  { id: 'n3c', at: 13.35, text: "Your iPhone uses it to measure the depth of your face. Your nose is closer. Your cheeks are farther away." },
  { id: 'n4', at: 20.7, text: 'It also captures an infrared image. Your iPhone uses both to check whether the face matches the one you enrolled.' },
  { id: 'n5', at: 29.0, text: "Here's the twist. A mirror can reflect infrared light too. So what happens when the phone sees only my reflection?" },
];

// Used only while there is no real test clip: an open question, no result.
export const GUESS_LINE = { id: 'n6_guess', text: 'So what do you think? Does my reflection unlock it? Comment your guess.' };

export const RESULT_LINES = {
  open: { id: 'n6_open', text: 'In my test, my iPhone unlocked using my reflection.' },
  locked: { id: 'n6_locked', text: "In my test, the reflection alone didn't unlock my iPhone." },
};

export const LEN: Record<string, number> = lengths as any;

export const SFX = [
  { name: 'SFX · whoosh (hook push)', file: 'whoosh.wav', at: 1.55, vol: 0.35 },
  { name: 'SFX · whoosh (into TrueDepth)', file: 'whoosh.wav', at: 2.45, vol: 0.3 },
  { name: 'SFX · thump (capture)', file: 'thump.wav', at: 11.53, vol: 0.25 },
  { name: 'SFX · thump (real test)', file: 'thump.wav', at: 36.0, vol: 0.45 },
  // a quiet whoosh on each fast scene change
  { name: 'SFX · whoosh (to the dots)', file: 'whoosh.wav', at: 5.85, vol: 0.22 },
  { name: 'SFX · whoosh (to the comparison)', file: 'whoosh.wav', at: 20.25, vol: 0.22 },
  { name: 'SFX · whoosh (to the mirror)', file: 'whoosh.wav', at: 28.45, vol: 0.22 },
  { name: 'SFX · whoosh (to the end card)', file: 'whoosh.wav', at: 42.85, vol: 0.2 },
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
  testFootage: '', testStartSec: 0, result: 'none', resultDelaySec: 2.6,   // no real footage yet: the slot is a marked placeholder and no result is narrated
  focusX: 0.5, focusY: 0.3, zoom: 1.0,
};
