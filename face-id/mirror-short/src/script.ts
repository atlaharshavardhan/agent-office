// Everything editable about the Short lives here: timings, narration/caption text, SFX cues
// and the real mirror-test settings.  Times are in seconds; FPS = 30.
import lengths from '../public/vo/lengths.json';

export const FPS = 30;
export const TOTAL = 1234;            // 41.1 s
export const STORY_END = 39.12;       // end card = last 2 s
export const f = (s: number) => Math.round(s * FPS);

// Scene order: hook → inside the phone → red dots + infrared view → the mirror twist → what the phone measures
// → comparison → real mirror test → end card. Every scene ends right after its voice line.
export const SCENES = {
  hook: [0, 3.9], truedepth: [3.9, 7.91], scan: [7.91, 13.12], mirror: [13.12, 18.22], measure: [18.22, 28.93],
  compare: [28.93, 33.78], test: [33.78, 39.12], end: [39.12, 41.12],
} as const;

// Hook: one continuous take of public/mirror_clip.mp4 (24 fps source, 5.04 s) from the rear mirror angle, at normal speed.
// The source cuts to this angle at 0.875 s and then pushes toward the reflection by itself; from about 3.0 s it rushes
// into the reflected phone, which fills the frame by 3.75 s. To land that rush on the word "unlock" (2.99 s) the first
// frame (the take starts close on him and his reflection) is held for `freeze` frames with a slow push, then the take plays. At `cut` it match-cuts to the still of the phone in his hand
// (HandPhone), entered at `handF`, where its screen sits at the same place and size; that shot carries the push on
// to the Dynamic Island.
export const HOOK = { srcStart: 2.2, freeze: 26, cut: 79, handF: 22 };   // cut: where the take hands over to its own last frame (same phone, no cut)

// Caption placement, decided clip by clip from where the frame has empty space (y of the caption block's top).
// Default is the top of the frame (230). Ranges are in seconds.
export const CAPTION_TOP_DEFAULT = 230;
export const CAPTION_PLACEMENT: { from: number; to: number; top: number }[] = [
  { from: 1.06, to: 3.06, top: 1300 },      // the rush into the reflected phone, then the phone: lower, over his hand
  { from: 3.06, to: 7.91, top: 1420 },      // the parts and their explanation use the top -> below the clock
  { from: 7.91, to: 10.31, top: 185 },     // 3D red dots clip: raised to clear his hair and the dots
  { from: 14.05, to: 16.65, top: 1540 },      // top-down mirror diagram: the top holds the face behind the glass -> caption below his head
  { from: 18.22, to: 23.52, top: 170 },      // the 3D dotted head
  { from: 25.91, to: 28.93, top: 170 },      // the photo
  { from: 28.93, to: 33.78, top: 170 },     // comparison
  { from: 33.78, to: 39.12, top: 1180 },     // reveal: the phone fills the frame -> caption over his hand
];

export type Line = { id: string; at: number; text: string };
// Narration = caption text.  `at` is when the voice line starts.
export const NARRATION: Line[] = [
  { id: 'n1', at: 0.1, text: "Can my mirror reflection unlock an iPhone 18 Pro?" },
  { id: 'n2', at: 3.95, text: "This camera up here projects more than thirty thousand invisible dots." },
  { id: 'n3a', at: 7.96, text: "When I wake the phone, they land on my face, and the infrared camera picks up the pattern." },
  { id: 'n5', at: 13.17, text: "But here's the twist: a mirror can bounce that light right back onto my face." },
  { id: 'n3c', at: 18.27, text: "So what is the phone actually reading? My nose bends the dots one way, my cheeks another, and from those bends it maps my face." },
  { id: 'n3d', at: 25.91, text: "That's why a flat photo fails. Nothing bends." },
  { id: 'n4', at: 28.98, text: "It also takes an infrared picture, then checks both against the face I set up." },
  { id: 'n6q', at: 33.88, text: "So, did it work?" },
  { id: 'n6r', at: 35.71, text: "It unlocked for me. Did yours? Tell me in the comments." },
];

// Played only when real test footage is in and `result` is set to match it.
export const RESULT_LINES = {
  open: { id: 'n6_open', text: 'It actually unlocked.' },
  locked: { id: 'n6_locked', text: 'In my test, it stayed locked.' },
};

// Reveal (no test footage): frame of the test scene at which the phone unlocks. Harsh's own result: it unlocked for him.
export const UNLOCK_AT = 44;

export const LEN: Record<string, number> = lengths as any;

export const SFX = [
  { name: 'SFX · thump (the parts are named)', file: 'thump.wav', at: 5.23, vol: 0.3 },
  { name: 'SFX · thump (what the camera sees)', file: 'thump.wav', at: 11.54, vol: 0.25 },
  { name: 'SFX · thump (real test)', file: 'thump.wav', at: 33.78, vol: 0.45 },
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
  testFootage: '', testStartSec: 0, result: 'none', resultDelaySec: 1.73,   // no real footage yet: the slot is a marked placeholder and no result is narrated
  focusX: 0.5, focusY: 0.3, zoom: 1.0,
};
