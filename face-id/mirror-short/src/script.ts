// Everything editable about the Short lives here: timings, narration/caption text, SFX cues
// and the real mirror-test settings.  Times are in seconds; FPS = 30.
import lengths from '../public/vo/lengths.json';

export const FPS = 30;
export const TOTAL = 1341;            // 44.7 s
export const STORY_END = 42.69;       // end card = last 2 s
export const f = (s: number) => Math.round(s * FPS);

// Scene order: hook → inside the phone → red dots + infrared view → the mirror twist → what the phone measures
// → comparison → real mirror test → end card. Every scene ends right after its voice line.
export const SCENES = {
  hook: [0, 5], truedepth: [5, 9], scan: [9, 15.95], mirror: [15.95, 20.2], measure: [20.2, 29.99],
  compare: [29.99, 36.69], test: [36.69, 42.69], end: [42.69, 44.69],
} as const;

// Hook: one continuous take of public/mirror_clip.mp4 (24 fps source, 5.04 s) from the rear mirror angle, at normal speed.
// The source cuts to this angle at 0.875 s and then pushes toward the reflection by itself; from about 3.0 s it rushes
// into the reflected phone, which fills the frame by 3.75 s. To land that rush on the word "unlock" (2.99 s) the first
// frame is held for `freeze` frames, then the take plays. At `cut` it match-cuts to the still of the phone in his hand
// (HandPhone), entered at `handF`, where its screen sits at the same place and size; that shot carries the push on
// to the Dynamic Island.
export const HOOK = { srcStart: 0.95, freeze: 22, cut: 107, handF: 26 };

// Caption placement, decided clip by clip from where the frame has empty space (y of the caption block's top).
// Default is the top of the frame (230). Ranges are in seconds.
export const CAPTION_TOP_DEFAULT = 230;
export const CAPTION_PLACEMENT: { from: number; to: number; top: number }[] = [
  { from: 1.9, to: 4.4, top: 1300 },      // the push toward his reflection, then the phone: his face / the island fill the top -> lower
  { from: 5.8, to: 9.0, top: 1340 },      // the parts and their explanation use the top -> below the padlock
  { from: 9.0, to: 14.45, top: 185 },     // 3D red dots clip: raised to clear his hair and the dots
  { from: 20.2, to: 26.47, top: 170 },      // flat wall and the bending dots: above the panel and his hair
  { from: 29.99, to: 36.69, top: 170 },     // comparison
];

export type Line = { id: string; at: number; text: string };
// Narration = caption text.  `at` is when the voice line starts.
export const NARRATION: Line[] = [
  { id: 'n1', at: 0.1, text: 'Have you ever wondered if your reflection can unlock an iPhone 18 Pro Max?' },
  { id: 'n2', at: 5.1, text: 'First, look at what happens up here when I wake the phone.' },
  { id: 'n3a', at: 9.1, text: 'This tiny projector puts thousands of invisible dots on my face.' },
  { id: 'n3b', at: 13.2, text: 'And the infrared camera picks up that pattern.' },
  { id: 'n5', at: 16.05, text: "Here's the twist. A mirror can bounce that infrared light back, too." },
  { id: 'n3c', at: 20.3, text: "On a flat wall, the dots land in a neat pattern. Your nose bends them one way, and your cheeks bend them another. The phone reads those bends to map the shape of your face." },
  { id: 'n4', at: 30.09, text: "It also takes an infrared picture. Then it uses both to check if I'm the person who set up Face ID." },
  { id: 'n6q', at: 36.84, text: 'So, did it work?' },
];

// Played only when real test footage is in and `result` is set to match it.
export const RESULT_LINES = {
  open: { id: 'n6_open', text: 'It actually unlocked.' },
  locked: { id: 'n6_locked', text: 'In my test, it stayed locked.' },
};

export const LEN: Record<string, number> = lengths as any;

export const SFX = [
  { name: 'SFX · thump (the parts are explained)', file: 'thump.wav', at: 5.8, vol: 0.3 },
  { name: 'SFX · thump (capture, on "picks up")', file: 'thump.wav', at: 14.45, vol: 0.25 },
  { name: 'SFX · thump (real test)', file: 'thump.wav', at: 36.69, vol: 0.45 },
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
