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
// The still is the hook footage's own frame at the end of its rush (public/hook_last.png, 1080 x 1920: the reflected phone in
// his hand with the lock screen), so the shot carries on from the footage on the very same phone, with no cut to another phone.
const ISL = { x: 358.4 * 1.5, y: 188.1 * 1.5, w: 120.6 * 1.5, h: 35.3 * 1.5 };   // its Dynamic Island on screen at scale 1
const out3 = (x: number) => 1 - Math.pow(1 - x, 3), io = (x: number) => x * x * (3 - 2 * x);
const RED = '#ff4d63', BLUE = '#6fa8ff', TEAL = '#63d6c9';
export const TEAR = 94;                                 // f at which the parts are pulled up out of the island
const hash = (i: number) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };

export const HandPhone: React.FC<{ f: number }> = ({ f }) => {
  const z = ramp(f, 30, 50, 0, 1, io), z2 = ramp(f, 54, 72, 0, 1, io);
  const s = (1 + 0.1 * ramp(f, 22, 34, 0, 1, out3)) * (1 + 0.56 * z) * (1 - 0.075 * z2) * (1 + 0.05 * ramp(f, 72, 190));
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
    <AbsoluteFill style={{ backgroundColor: '#261912', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: `${ISL.x}px ${ISL.y}px`, transform: `translate(${cx - ISL.x}px, ${cy - ISL.y}px) scale(${s})` }}>
        <Img src={staticFile('hook_last.png')} style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920 }} />
      </div>
      {/* macro look: the display's red / green / blue sub-pixels */}
      <AbsoluteFill style={{ opacity: 0, mixBlendMode: 'multiply',
        backgroundImage: 'linear-gradient(90deg, #ff5a5a 0 33%, #58e070 33% 66%, #6a8cff 66% 100%), linear-gradient(0deg, #000 0 22%, #fff 22% 100%)',
        backgroundSize: '9px 9px, 9px 9px', backgroundBlendMode: 'multiply' }} />
      <AbsoluteFill style={{ opacity: 0, background: 'radial-gradient(70% 45% at 50% 42%, rgba(60,70,160,.0), rgba(20,24,70,.55))' }} />
      {/* Face ID tries, as on a real iPhone: the Dynamic Island opens into a square with the Face ID glyph, and a white arc
          circles it while it scans. The padlock never opens and no result is shown; the island closes again before the
          parts are pulled out. */}
      {f >= 32 && f < IN + 8 && (() => { const e = ramp(f, 34, 44, 0, 1, io) * (1 - ramp(f, IN - 6, IN + 6, 0, 1, io)), bh = h + (w * 0.94 - h) * e, k = (w / 215) * e, a = (f * 14) % 360;
        return (
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
            <rect x={left} y={top} width={w} height={bh} rx={h / 2 + (w * 0.24 - h / 2) * e} fill="#04050a" />
            <g transform={`translate(${cx} ${top + bh / 2}) scale(${k})`} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={e}>
              <path d="M -46 -22 V -34 a 12 12 0 0 1 12 -12 H -22 M 22 -46 H 34 a 12 12 0 0 1 12 12 V -22 M 46 22 V 34 a 12 12 0 0 1 -12 12 H 22 M -22 46 H -34 a 12 12 0 0 1 -12 -12 V 22" />
              <path d="M -18 -16 V -6 M 18 -16 V -6 M 2 -16 V 6 H -5 M -16 20 Q 0 32 16 20" />
              <circle r={76} stroke="#fff" strokeOpacity={0.22} strokeWidth={5} />
              <path d="M 0 -76 A 76 76 0 0 1 76 0" strokeWidth={6} transform={`rotate(${a})`} />
            </g>
          </svg>); })()}
      {/* from here the scene is a clean diagram of the phone's top and its Face ID parts */}
      {f >= IN && <PhoneParts f={f} />}
    </AbsoluteFill>
  );
};
