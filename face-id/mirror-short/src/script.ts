// Everything editable about the Short lives here: timings, narration/caption text, SFX cues
// and the real mirror-test settings.  Times are in seconds; FPS = 30.
import lengths from '../public/vo/lengths.json';

export const FPS = 30;
export const TOTAL = 1224;            // 40.8 s
export const STORY_END = 38.8;        // end card = last 2 s
export const f = (s: number) => Math.round(s * FPS);

// Scene order: hook → inside the phone → red dots + infrared view → the mirror twist → what the phone measures
// → comparison → real mirror test → end card. Every scene ends right after its voice line.
export const SCENES = {
  hook: [0, 5], truedepth: [5, 9], scan: [9, 15.95], mirror: [15.95, 20.2], measure: [20.2, 26.1],
  compare: [26.1, 32.8], test: [32.8, 38.8], end: [38.8, 40.8],
} as const;

// Hook: excerpts of public/mirror_clip.mp4 (24 fps source, 5.04 s), played at normal speed, hard cuts.
// srcStart is in seconds of the source clip; dur in composition frames (total 150 = 5 s).
// The source cuts from the side profile to the rear angle at 0.875 s, so excerpt 1 ends at 0.867 s.
// Excerpt 2 holds on the phone in the mirror, then rushes toward it; excerpt 3 is the still of the phone in his hand.
export type HookZoom = { ox: number; oy: number; frames: number[]; scale: number[] };
export const HOOK_CUTS: { name: string; srcStart: number; dur: number; zoom?: HookZoom }[] = [
  { name: 'Hook 1 · side profile', srcStart: 0.0, dur: 26, zoom: { ox: 0.62, oy: 0.36, frames: [0, 8, 26], scale: [1.35, 1.05, 1.5] } },
  { name: 'Hook 2 · rear view, hold on the reflected phone', srcStart: 0.95, dur: 54, zoom: { ox: 0.52, oy: 0.33, frames: [0, 8, 40, 54], scale: [1.5, 1.12, 1.25, 1.9] } },   // ends before the source's own push-in (2.77 s)
  { name: 'Hook 3 · push to the phone in his hand (still: hook_closeup.png)', srcStart: 0, dur: 70 },   // push to the phone, then into its Dynamic Island as the question ends
];

// Caption placement, decided clip by clip from where the frame has empty space (y of the caption block's top).
// Default is the top of the frame (230). Ranges are in seconds.
export const CAPTION_TOP_DEFAULT = 230;
export const CAPTION_PLACEMENT: { from: number; to: number; top: number }[] = [
  { from: 2.67, to: 4.4, top: 1300 },    // phone in his hand: the top holds its Dynamic Island and clock -> lower, over his hand
  { from: 5.8, to: 9.0, top: 1340 },      // tear-down: the parts and their explanation use the top -> below the padlock
  { from: 9.0, to: 14.45, top: 185 },     // 3D red dots clip: raised to clear his hair and the dots
  { from: 22.55, to: 23.63, top: 185 },   // cyan point cloud
  { from: 26.1, to: 32.8, top: 170 },     // comparison
];

export type Line = { id: string; at: number; text: string };
// Narration = caption text.  `at` is when the voice line starts.
export const NARRATION: Line[] = [
  { id: 'n1', at: 0.1, text: 'Have you ever wondered if your reflection can unlock an iPhone 18 Pro Max?' },
  { id: 'n2', at: 5.1, text: 'First, look at what happens up here when I wake the phone.' },
  { id: 'n3a', at: 9.1, text: 'This tiny projector puts thousands of invisible dots on my face.' },
  { id: 'n3b', at: 13.2, text: 'And the infrared camera picks up that pattern.' },
  { id: 'n5', at: 16.05, text: "Here's the twist. A mirror can bounce that infrared light back, too." },
  { id: 'n3c', at: 20.3, text: "See my nose? It's closer than my cheeks. The phone uses that pattern to map the shape of my face." },
  { id: 'n4', at: 26.2, text: "It also takes an infrared picture. Then it uses both to check if I'm the person who set up Face ID." },
  { id: 'n6q', at: 32.95, text: 'So, did it work?' },
];

// Played only when real test footage is in and `result` is set to match it.
export const RESULT_LINES = {
  open: { id: 'n6_open', text: 'It actually unlocked.' },
  locked: { id: 'n6_locked', text: 'In my test, it stayed locked.' },
};

export const LEN: Record<string, number> = lengths as any;

export const SFX = [
  { name: 'SFX · whoosh (hook: to the rear view)', file: 'whoosh.wav', at: 0.8, vol: 0.25 },
  { name: 'SFX · whoosh (hook push to the phone)', file: 'whoosh.wav', at: 2.6, vol: 0.35 },
  { name: 'SFX · whoosh (into the Dynamic Island)', file: 'whoosh.wav', at: 3.6, vol: 0.3 },
  { name: 'SFX · whoosh (tear-down)', file: 'whoosh.wav', at: 5.72, vol: 0.35 },
  { name: 'SFX · thump (tear-down)', file: 'thump.wav', at: 5.8, vol: 0.3 },
  { name: 'SFX · whoosh (to the dots)', file: 'whoosh.wav', at: 8.85, vol: 0.22 },
  { name: 'SFX · thump (capture)', file: 'thump.wav', at: 14.45, vol: 0.25 },
  { name: 'SFX · whoosh (to the mirror)', file: 'whoosh.wav', at: 15.8, vol: 0.22 },
  { name: 'SFX · whoosh (to the depth map)', file: 'whoosh.wav', at: 20.05, vol: 0.22 },
  { name: 'SFX · whoosh (to the comparison)', file: 'whoosh.wav', at: 25.95, vol: 0.22 },
  { name: 'SFX · thump (real test)', file: 'thump.wav', at: 32.8, vol: 0.45 },
  { name: 'SFX · whoosh (to the end card)', file: 'whoosh.wav', at: 38.65, vol: 0.2 },
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
  testFootage: '', testStartSec: 0, result: 'none', resultDelaySec: 3.2,   // no real footage yet: the slot is a marked placeholder and no result is narrated
  focusX: 0.5, focusY: 0.3, zoom: 1.0,
};
