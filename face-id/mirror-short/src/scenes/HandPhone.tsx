import { AbsoluteFill, Img, staticFile } from 'remotion';
import { ramp } from '../theme';
import { IN, PhoneParts } from './PhoneParts';

// The phone in his hand (public/hook_closeup.png), used for the end of the hook and all of scene 2.
// f = frames from the cut to this shot (1.5 s into the Short).
//   0– 30  end of the hook: quick push toward the phone he is holding
//  30– 50  zoom to the top of that phone
//  54– 72  it settles with the top of the real phone across the frame and the wall above it free for the part cards
//  74– 94  the TrueDepth parts inside the island are drawn and named: IR CAMERA, FLOOD ILLUMINATOR, DOT PROJECTOR
//  94–190  the parts stay in the island and are explained one at a time; the card points at the active part
// A closed padlock sits under the island; nothing is unlocked here.
const K = 1080 / 752, TOP = -5;                        // still is 752 x 1344, shown full-bleed
const ISL = { x: 377 * K, y: 183 * K + TOP, w: 112 * K, h: 32 * K };   // its Dynamic Island on screen at scale 1
const out3 = (x: number) => 1 - Math.pow(1 - x, 3), io = (x: number) => x * x * (3 - 2 * x);
const RED = '#ff4d63', BLUE = '#6fa8ff', TEAL = '#63d6c9';
export const TEAR = 94;                                 // f at which the parts are pulled up out of the island
const hash = (i: number) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };

export const HandPhone: React.FC<{ f: number }> = ({ f }) => {
  const z = ramp(f, 30, 50, 0, 1, io), z2 = ramp(f, 54, 72, 0, 1, io);
  const s = (1 + 0.1 * ramp(f, 0, 30, 0, 1, out3)) * (1 + 0.72 * z) * (1 - 0.075 * z2) * (1 + 0.05 * ramp(f, 72, 190));
  const cx = ISL.x + (540 - ISL.x) * z, cy = ISL.y + (490 - ISL.y) * z + (905 - 490) * z2;      // island centre on screen
  const w = ISL.w * s, h = ISL.h * s, top = cy - h / 2, left = cx - w / 2;
  const on = ramp(f, 68, 74);                           // crisp drawn island replaces the soft photo one
  const part = (fx: number) => left + w * fx;           // x of a part inside the island
  const PARTS = [
    { fx: 0.12, label: 'IR CAMERA', ly: 640, at: 76, anchor: 'start' as const, lx: -150 },
    { fx: 0.33, label: 'FLOOD ILLUMINATOR', ly: 545, at: 81, anchor: 'start' as const, lx: -8 },
    { fx: 0.55, label: 'DOT PROJECTOR', ly: 592, at: 86, anchor: 'start' as const, lx: -8 },
  ];
  const r = h * 0.3;
  const LIFT = 0,       // the parts stay in the island; the card points at the one being explained
     CARD = 27, active = f < 106 ? -1 : Math.min(2, Math.floor((f - 106) / CARD));   // each part is explained for 0.9 s
  const MODS = [
    { fx: 0.12, k: 1, at: 76, col: TEAL, label: 'IR CAMERA', does: 'reads the dots on your face' },
    { fx: 0.33, k: 0.72, at: 79, col: RED, label: 'FLOOD ILLUMINATOR', does: 'lights your face in infrared' },
    { fx: 0.55, k: 1, at: 84, col: RED, label: 'DOT PROJECTOR', does: 'fires 30,000+ invisible dots' },
    { fx: 0.85, k: 1.25, at: 76, col: BLUE, label: 'FRONT CAMERA', does: '' },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: '#2b1b10', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: `${ISL.x}px ${ISL.y}px`, transform: `translate(${cx - ISL.x}px, ${cy - ISL.y}px) scale(${s})` }}>
        <Img src={staticFile('hook_closeup.png')} style={{ position: 'absolute', left: 0, top: TOP, width: 1080, height: 1344 * K }} />
      </div>
      {/* macro look: the display's red / green / blue sub-pixels */}
      <AbsoluteFill style={{ opacity: 0, mixBlendMode: 'multiply',
        backgroundImage: 'linear-gradient(90deg, #ff5a5a 0 33%, #58e070 33% 66%, #6a8cff 66% 100%), linear-gradient(0deg, #000 0 22%, #fff 22% 100%)',
        backgroundSize: '9px 9px, 9px 9px', backgroundBlendMode: 'multiply' }} />
      <AbsoluteFill style={{ opacity: 0, background: 'radial-gradient(70% 45% at 50% 42%, rgba(60,70,160,.0), rgba(20,24,70,.55))' }} />
      {/* from here the scene is a clean diagram of the phone's top and its Face ID parts */}
      {f >= IN && <PhoneParts f={f} />}
    </AbsoluteFill>
  );
};
