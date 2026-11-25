// Everything editable about the Short lives here: timings, narration/caption text, SFX cues
// and the real mirror-test settings.  Times are in seconds; FPS = 30.
import lengths from '../public/vo/lengths.json';

export const FPS = 30;
export const TOTAL = 1160;            // 38.7 s
export const STORY_END = 37.17;       // end card = last 2 s
export const f = (s: number) => Math.round(s * FPS);

// Scene order: hook → inside the phone → red dots + infrared view → the mirror twist → what the phone measures
// → comparison → real mirror test → end card. Every scene ends right after its voice line.
export const SCENES = {
  hook: [0, 3.23], truedepth: [3.23, 5.48], scan: [5.48, 9.92], mirror: [9.92, 15.02], measure: [15.02, 24.55],
  compare: [24.55, 32.31], test: [32.31, 37.17], end: [37.17, 38.67],
} as const;

// Hook: one continuous take of public/mirror_clip.mp4 (24 fps source, 5.04 s) from the rear mirror angle, at normal speed.
// The source cuts to this angle at 0.875 s and then pushes toward the reflection by itself; from about 3.0 s it rushes
// into the reflected phone, which fills the frame by 3.75 s. To land that rush on the word "unlock" (2.99 s) the first
// frame (the take starts close on him and his reflection) is held for `freeze` frames with a slow push, then the take plays. At `cut` it match-cuts to the still of the phone in his hand
// (HandPhone), entered at `handF`, where its screen sits at the same place and size; that shot carries the push on
// to the Dynamic Island.
export const HOOK = { srcStart: 2.2, freeze: 6, cut: 59, handF: 22 };   // cut: where the take hands over to its own last frame (same phone, no cut)

// Caption placement, decided clip by clip from where the frame has empty space (y of the caption block's top).
// Default is the top of the frame (230). Ranges are in seconds.
export const CAPTION_TOP_DEFAULT = 230;
export const CAPTION_PLACEMENT: { from: number; to: number; top: number }[] = [
  { from: 0.28, to: 2.28, top: 1300 },      // the rush into the reflected phone, then the phone: lower, over his hand
  { from: 2.28, to: 3.26, top: 230 },      // the push to the top of the phone: caption above the Face ID box
  { from: 3.26, to: 5.48, top: 1160 },      // the parts use the top -> caption between the island and the clock
  { from: 5.48, to: 7.61, top: 230 },     // 3D red dots clip: raised to clear his hair and the dots
  { from: 10.85, to: 13.45, top: 1310 },      // top-down mirror diagram (scaled into the safe zone): caption under it
  { from: 15.02, to: 19.55, top: 230 },      // the 3D dotted head
  { from: 21.77, to: 24.55, top: 230 },      // the photo
  { from: 24.55, to: 32.31, top: 230 },     // comparison
  { from: 32.31, to: 37.17, top: 230 },     // reveal: the phone fills the frame -> caption above it
];

export type Line = { id: string; at: number; text: string };
// Narration = caption text.  `at` is when the voice line starts.
export const NARRATION: Line[] = [
  { id: 'n1', at: 0.1, text: "Have you ever wondered if you can open your iPhone with your mirror reflection?" },
  { id: 'n2', at: 3.28, text: "When the phone is awake, these cameras fire" },
  { id: 'n3a', at: 5.49, text: "over thirty thousand dots straight onto the face, and the infrared camera picks up the pattern." },
  { id: 'n5', at: 9.97, text: "But here's the twist: a mirror bounces that light straight back onto my face." },
  { id: 'n3c', at: 15.07, text: "So what's the phone really reading? My nose bends the dots one way, my cheeks another, and from those bends, it maps my face." },
  { id: 'n3d', at: 21.77, text: "That's why a flat photo fails. Nothing bends." },
  { id: 'n4', at: 24.6, text: "It also grabs an infrared picture, then checks both against the face I set up." },
  { id: 'n4b', at: 28.74, text: "No match, it stays locked. A match unlocks it." },
  { id: 'n6q', at: 32.41, text: "So, did it work?" },
  { id: 'n6r', at: 34.19, text: "It unlocked for me! Did yours? Tell me in the comments." },
];

// Played only when real test footage is in and `result` is set to match it.
export const RESULT_LINES = {
  open: { id: 'n6_open', text: 'It actually unlocked.' },
  locked: { id: 'n6_locked', text: 'In my test, it stayed locked.' },
};

// Reveal (no test footage): frame of the test scene at which the phone unlocks. Harsh's own result: it unlocked for him.
export const UNLOCK_AT = 43;

export const LEN: Record<string, number> = lengths as any;

export const SFX = [
  { name: 'SFX · the projector fires its dots', file: 'fire.wav', at: 5.43, vol: 0.07 },
  { name: 'SFX · the infrared camera reads the pattern', file: 'scan.wav', at: 8.58, vol: 0.045 },
  { name: 'SFX · the dots come back off the mirror', file: 'fire.wav', at: 13.82, vol: 0.055 },
  { name: 'SFX · the face is mapped', file: 'scan.wav', at: 15.27, vol: 0.04 },
  { name: 'SFX · no match, stays locked', file: 'deny.wav', at: 28.72, vol: 0.08 },
  { name: 'SFX · match, unlocks', file: 'ok.wav', at: 30.55, vol: 0.07 },
  { name: 'SFX · Face ID scans', file: 'scan.wav', at: 32.81, vol: 0.06 },
  { name: 'SFX · Face ID processing', file: 'ok.wav', at: 33.28, vol: 0.03 },
  { name: 'SFX · unlocked', file: 'unlock.wav', at: 33.74, vol: 0.1 },
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
  guides?: boolean;         // preview only: draw the Reels / Shorts safe-zone guides (never on in the export)
};
export const DEFAULT_TEST: TestProps = {
  testFootage: '', testStartSec: 0, result: 'none', resultDelaySec: 1.68,   // no real footage yet: the slot is a marked placeholder and no result is narrated
  focusX: 0.5, focusY: 0.3, zoom: 1.0,
};
