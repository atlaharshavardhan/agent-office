// Everything editable about the Short lives here: timings, narration/caption text, SFX cues
// and the real mirror-test settings.  Times are in seconds; FPS = 30.
import lengths from '../public/vo/lengths.json';

export const FPS = 30;
export const TOTAL = 1350;            // 45.0 s
export const STORY_END = 43;       // end card = last 2 s
export const f = (s: number) => Math.round(s * FPS);

// Scene order: hook → inside the phone → red dots + infrared view → the mirror twist → what the phone measures
// → comparison → real mirror test → end card. Every scene ends right after its voice line.
export const SCENES = {
  hook: [0, 4.1], truedepth: [4.1, 9.73], scan: [9.73, 17.58], mirror: [17.58, 22.98], measure: [22.98, 34.27],
  compare: [34.27, 40.1], test: [40.1, 43], end: [43, 45],
} as const;

// Hook: one continuous take of public/mirror_clip.mp4 (24 fps source, 5.04 s) from the rear mirror angle, at normal speed.
// The source cuts to this angle at 0.875 s and then pushes toward the reflection by itself; from about 3.0 s it rushes
// into the reflected phone, which fills the frame by 3.75 s. To land that rush on the word "unlock" (2.99 s) the first
// frame (the take starts close on him and his reflection) is held for `freeze` frames with a slow push, then the take plays. At `cut` it match-cuts to the still of the phone in his hand
// (HandPhone), entered at `handF`, where its screen sits at the same place and size; that shot carries the push on
// to the Dynamic Island.
export const HOOK = { srcStart: 2.2, freeze: 32, cut: 85, handF: 22 };   // cut: where the take hands over to its own last frame (same phone, no cut)

// Caption placement, decided clip by clip from where the frame has empty space (y of the caption block's top).
// Default is the top of the frame (230). Ranges are in seconds.
export const CAPTION_TOP_DEFAULT = 230;
export const CAPTION_PLACEMENT: { from: number; to: number; top: number }[] = [
  { from: 1.27, to: 3.27, top: 1300 },      // the rush into the reflected phone, then the phone: lower, over his hand
  { from: 3.27, to: 9.73, top: 1420 },      // the parts and their explanation use the top -> below the clock
  { from: 9.73, to: 14.60, top: 185 },     // 3D red dots clip: raised to clear his hair and the dots
  { from: 18.51, to: 21.11, top: 1540 },      // top-down mirror diagram: the top holds the face behind the glass -> caption below his head
  { from: 22.98, to: 28.48, top: 170 },      // the 3D dotted head
  { from: 31.0, to: 34.27, top: 170 },      // the photo
  { from: 34.27, to: 40.1, top: 170 },     // comparison
];

export type Line = { id: string; at: number; text: string };
// Narration = caption text.  `at` is when the voice line starts.
export const NARRATION: Line[] = [
  { id: 'n1', at: 0.1, text: "Can my mirror reflection unlock an iPhone 18 Pro Max?" },
  { id: 'n2', at: 4.15, text: "Hidden up here are three parts: a dot projector, a flood illuminator, and an infrared camera." },
  { id: 'n3a', at: 9.78, text: "When I wake the phone, the projector throws thousands of invisible dots onto my face, and the infrared camera picks up that pattern." },
  { id: 'n5', at: 17.63, text: "But here's the twist: a mirror can bounce that light right back onto my face." },
  { id: 'n3c', at: 23.03, text: "So what is the phone actually reading? My nose bends the dots one way, my cheeks another, and from those bends it maps my face." },
  { id: 'n3d', at: 31.0, text: "That's why a flat photo fails. Nothing bends." },
  { id: 'n4', at: 34.32, text: "It also takes an infrared picture, then checks both against the face I set up." },
  { id: 'n6q', at: 40.2, text: "So, with only my reflection, did it work?" },
];

// Played only when real test footage is in and `result` is set to match it.
export const RESULT_LINES = {
  open: { id: 'n6_open', text: 'It actually unlocked.' },
  locked: { id: 'n6_locked', text: 'In my test, it stayed locked.' },
};

export const LEN: Record<string, number> = lengths as any;

export const SFX = [
  { name: 'SFX · thump (the parts are named)', file: 'thump.wav', at: 6.07, vol: 0.3 },
  { name: 'SFX · thump (what the camera sees)', file: 'thump.wav', at: 15.90, vol: 0.25 },
  { name: 'SFX · thump (real test)', file: 'thump.wav', at: 40.1, vol: 0.45 },
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
  testFootage: '', testStartSec: 0, result: 'none', resultDelaySec: 3.1,   // no real footage yet: the slot is a marked placeholder and no result is narrated
  focusX: 0.5, focusY: 0.3, zoom: 1.0,
};
