import { AbsoluteFill, Img, staticFile } from 'remotion';
import { FONT, ramp } from '../theme';

// The phone in his hand (public/hook_closeup.png), used for the end of the hook and all of scene 2.
// f = frames from the cut to this shot (1.5 s into the Short).
//   0– 30  end of the hook: quick push toward the phone he is holding
//  30– 50  zoom to the top of that phone
//  54– 72  second zoom, right into its Dynamic Island; the screen takes on a pixel-grid look
//  74–135  the TrueDepth parts inside the island are drawn and labelled one by one:
//          IR CAMERA, FLOOD ILLUMINATOR, DOT PROJECTOR (+ the front camera lens)
// A closed padlock sits under the island; nothing is unlocked here.
const K = 1080 / 752, TOP = -5;                        // still is 752 x 1344, shown full-bleed
const ISL = { x: 377 * K, y: 183 * K + TOP, w: 112 * K, h: 32 * K };   // its Dynamic Island on screen at scale 1
const out3 = (x: number) => 1 - Math.pow(1 - x, 3), io = (x: number) => x * x * (3 - 2 * x);
const RED = '#ff4d63', BLUE = '#6fa8ff', TEAL = '#63d6c9';

export const HandPhone: React.FC<{ f: number }> = ({ f }) => {
  const z = ramp(f, 30, 50, 0, 1, io), z2 = ramp(f, 54, 72, 0, 1, io);
  const s = (1 + 0.1 * ramp(f, 0, 30, 0, 1, out3)) * (1 + 0.72 * z) * (1 + 1.55 * z2) * (1 + 0.04 * ramp(f, 72, 135));
  const cx = ISL.x + (540 - ISL.x) * z, cy = ISL.y + (490 - ISL.y) * z + (800 - 490) * z2;      // island centre on screen
  const w = ISL.w * s, h = ISL.h * s, top = cy - h / 2, left = cx - w / 2;
  const on = ramp(f, 68, 74);                           // crisp drawn island replaces the soft photo one
  const part = (fx: number) => left + w * fx;           // x of a part inside the island
  const PARTS = [
    { fx: 0.14, label: 'IR CAMERA', ly: 640, at: 76, anchor: 'start' as const, lx: -150 },
    { fx: 0.31, label: 'FLOOD ILLUMINATOR', ly: 545, at: 81, anchor: 'start' as const, lx: -8 },
    { fx: 0.51, label: 'DOT PROJECTOR', ly: 592, at: 86, anchor: 'start' as const, lx: -8 },
  ];
  const r = h * 0.3;
  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: `${ISL.x}px ${ISL.y}px`, transform: `translate(${cx - ISL.x}px, ${cy - ISL.y}px) scale(${s})` }}>
        <Img src={staticFile('hook_closeup.png')} style={{ position: 'absolute', left: 0, top: TOP, width: 1080, height: 1344 * K }} />
      </div>
      {/* macro look: the display's red / green / blue sub-pixels */}
      <AbsoluteFill style={{ opacity: 0.6 * ramp(f, 60, 74), mixBlendMode: 'multiply',
        backgroundImage: 'linear-gradient(90deg, #ff5a5a 0 33%, #58e070 33% 66%, #6a8cff 66% 100%), linear-gradient(0deg, #000 0 22%, #fff 22% 100%)',
        backgroundSize: '9px 9px, 9px 9px', backgroundBlendMode: 'multiply' }} />
      <AbsoluteFill style={{ opacity: 0.55 * ramp(f, 60, 74), background: 'radial-gradient(70% 45% at 50% 42%, rgba(60,70,160,.0), rgba(20,24,70,.55))' }} />
      {f >= 66 && <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: on }}>
        <rect x={left} y={top} width={w} height={h} rx={h / 2} fill="#04050a" />
        {/* IR camera */}
        <g opacity={ramp(f, 76, 80)}>
          <circle cx={part(0.14)} cy={cy} r={r} fill="#0b0d16" stroke={TEAL} strokeWidth={5} strokeDasharray="7 6" />
          <circle cx={part(0.14) - r * 0.2} cy={cy - r * 0.2} r={r * 0.16} fill={BLUE} />
        </g>
        {/* flood illuminator */}
        <rect x={part(0.31) - r * 0.55} y={cy - r * 0.55} width={r * 1.1} height={r * 1.1} rx={6} fill="#1a0b10" stroke={RED} strokeWidth={4} strokeDasharray="6 5" opacity={ramp(f, 79, 83)} />
        {/* dot projector */}
        <g opacity={ramp(f, 84, 88)}>
          <circle cx={part(0.51)} cy={cy} r={r} fill="#2a0c12" stroke={RED} strokeWidth={5} strokeDasharray="7 6" />
          {[-0.45, -0.15, 0.15, 0.45].map((k) => <line key={k} x1={part(0.51) - r * 0.6} x2={part(0.51) + r * 0.6} y1={cy + r * k} y2={cy + r * k} stroke="#ffb3bd" strokeWidth={3.5} strokeDasharray="9 5" />)}
        </g>
        {/* front camera (not part of the labels) */}
        <g opacity={ramp(f, 76, 80)}>
          <circle cx={part(0.83)} cy={cy} r={r * 1.25} fill="#0a0d1e" stroke={BLUE} strokeWidth={5} strokeDasharray="7 6" />
          <circle cx={part(0.83)} cy={cy} r={r * 0.62} fill="#131c44" /><circle cx={part(0.83) - r * 0.22} cy={cy - r * 0.25} r={r * 0.17} fill="#9fb6ff" />
        </g>
        {PARTS.map((p) => { const o = ramp(f, p.at, p.at + 4), x = part(p.fx); return (
          <g key={p.label} opacity={o}>
            <line x1={x} y1={p.ly + 22} x2={x} y2={cy - r - 6} stroke="#fff" strokeWidth={2.5} /><circle cx={x} cy={cy - r - 6} r={5} fill="#fff" />
            <text x={x + p.lx} y={p.ly} textAnchor={p.anchor} fill="#fff" style={{ font: `800 38px ${FONT}`, letterSpacing: '0.13em' }}>{p.label}</text>
          </g>); })}
        {/* closed padlock, as on the lock screen */}
        <g transform={`translate(540 ${top + h + 250})`} opacity={ramp(f, 72, 78)}>
          <path d="M -44 0 v -40 a 44 44 0 0 1 88 0 v 40" stroke="#fff" strokeWidth={20} strokeLinecap="round" fill="none" />
          <rect x={-72} y={0} width={144} height={112} rx={26} fill="#fff" />
        </g>
      </svg>}
    </AbsoluteFill>
  );
};
