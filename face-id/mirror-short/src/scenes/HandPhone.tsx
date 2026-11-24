import { AbsoluteFill, Img, staticFile } from 'remotion';
import { FONT, ramp } from '../theme';

// The phone in his hand (public/hook_closeup.png), used for the end of the hook and all of scene 2.
// f = frames from the cut to this shot (1.5 s into the Short).
//   0– 30  end of the hook: quick push toward the phone he is holding
//  30– 50  zoom to the top of that phone
//  54– 72  second zoom, right into its Dynamic Island; the screen takes on a pixel-grid look
//  74– 94  the TrueDepth parts inside the island are drawn and named: IR CAMERA, FLOOD ILLUMINATOR, DOT PROJECTOR
//  94–147  tear-down on the phone: the parts are pulled up out of the island, then explained one at a time
// A closed padlock sits under the island; nothing is unlocked here.
const K = 1080 / 752, TOP = -5;                        // still is 752 x 1344, shown full-bleed
const ISL = { x: 377 * K, y: 183 * K + TOP, w: 112 * K, h: 32 * K };   // its Dynamic Island on screen at scale 1
const out3 = (x: number) => 1 - Math.pow(1 - x, 3), io = (x: number) => x * x * (3 - 2 * x);
const RED = '#ff4d63', BLUE = '#6fa8ff', TEAL = '#63d6c9';
export const TEAR = 94;                                 // f at which the parts are pulled up out of the island
const hash = (i: number) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };

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
  const LIFT = 285, active = f < 106 ? -1 : Math.min(2, Math.floor((f - 106) / 14));
  const MODS = [
    { fx: 0.14, k: 1, at: 76, col: TEAL, label: 'IR CAMERA', does: 'reads the dots on your face' },
    { fx: 0.31, k: 0.8, at: 79, col: RED, label: 'FLOOD ILLUMINATOR', does: 'lights your face in infrared' },
    { fx: 0.51, k: 1, at: 84, col: RED, label: 'DOT PROJECTOR', does: 'fires 30,000+ invisible dots' },
    { fx: 0.83, k: 1.25, at: 76, col: BLUE, label: 'FRONT CAMERA', does: '' },
  ];
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
        {/* tear-down, on the phone itself: from TEAR the parts are pulled straight up out of the island, leaving their
            sockets behind, and each one is explained in turn */}
        {MODS.map((m, i) => { const x = part(m.fx), tr = ramp(f, TEAR + i * 2, TEAR + 10 + i * 2, 0, 1, out3), act = active === i, sc = (1 + 0.3 * tr) * (act ? 1.18 + 0.04 * Math.sin(f / 2) : 1), y = cy - LIFT * tr;
          return (
            <g key={m.label}>
              {tr > 0 && <><circle cx={x} cy={cy} r={r * m.k * 0.92} fill="#000" stroke="#2a2d3a" strokeWidth={3} />
                <line x1={x} y1={cy - r * m.k} x2={x} y2={y + r * m.k * sc} stroke={m.col} strokeWidth={2.5} strokeDasharray="6 8" opacity={0.7} /></>}
              <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={ramp(f, m.at, m.at + 4) * (active >= 0 && !act && i < 3 ? 0.45 : 1)}>
                {i === 0 && <><circle r={r} fill="#0b0d16" stroke={TEAL} strokeWidth={5} strokeDasharray="7 6" /><circle cx={-r * 0.2} cy={-r * 0.2} r={r * 0.16} fill={BLUE} /></>}
                {i === 1 && <rect x={-r * 0.55} y={-r * 0.55} width={r * 1.1} height={r * 1.1} rx={6} fill="#1a0b10" stroke={RED} strokeWidth={4} strokeDasharray="6 5" />}
                {i === 2 && <><circle r={r} fill="#2a0c12" stroke={RED} strokeWidth={5} strokeDasharray="7 6" />
                  {[-0.45, -0.15, 0.15, 0.45].map((k) => <line key={k} x1={-r * 0.6} x2={r * 0.6} y1={r * k} y2={r * k} stroke="#ffb3bd" strokeWidth={3.5} strokeDasharray="9 5" />)}</>}
                {i === 3 && <><circle r={r * 1.25} fill="#0a0d1e" stroke={BLUE} strokeWidth={5} strokeDasharray="7 6" /><circle r={r * 0.62} fill="#131c44" /><circle cx={-r * 0.22} cy={-r * 0.25} r={r * 0.17} fill="#9fb6ff" /></>}
              </g>
              {/* what the active part does, shown with light */}
              {act && i === 0 && [0, 1, 2].map((k) => { const u = ((f / 12) + k / 3) % 1; return <circle key={k} cx={x} cy={y} r={r * sc * (1.9 - 0.9 * u)} fill="none" stroke={TEAL} strokeWidth={3} opacity={0.8 * u} />; })}
              {act && i === 1 && <path d={`M ${x} ${y} L ${x - 190} ${y - 300} L ${x + 190} ${y - 300} Z`} fill={RED} opacity={0.16 + 0.08 * Math.sin(f / 2)} />}
              {act && i === 2 && Array.from({ length: 46 }, (_, k) => { const u = ((f - 134) / 12 + hash(k)) % 1, a = (hash(k + 7) - 0.5) * 1.5; return <circle key={k} cx={x + Math.sin(a) * 300 * u} cy={y - r - 300 * u} r={3 + 2 * u} fill={RED} opacity={0.95 * (1 - u)} />; })}
            </g>); })}
        {/* first pass: the three parts are named while still in the island */}
        {PARTS.map((p) => { const o = ramp(f, p.at, p.at + 4) * (1 - ramp(f, TEAR - 4, TEAR)), x = part(p.fx); return (
          <g key={p.label} opacity={o}>
            <line x1={x} y1={p.ly + 22} x2={x} y2={cy - r - 6} stroke="#fff" strokeWidth={2.5} /><circle cx={x} cy={cy - r - 6} r={5} fill="#fff" />
            <text x={x + p.lx} y={p.ly} textAnchor={p.anchor} fill="#fff" style={{ font: `800 38px ${FONT}`, letterSpacing: '0.13em' }}>{p.label}</text>
          </g>); })}
        {/* closed padlock, as on the lock screen */}
        <g transform={`translate(540 ${top + h + 250})`} opacity={ramp(f, 72, 78) * (1 - 0.6 * ramp(f, TEAR, TEAR + 8))}>
          <path d="M -44 0 v -40 a 44 44 0 0 1 88 0 v 40" stroke="#fff" strokeWidth={20} strokeLinecap="round" fill="none" />
          <rect x={-72} y={0} width={144} height={112} rx={26} fill="#fff" />
        </g>
      </svg>}
      <AbsoluteFill style={{ backgroundColor: '#000', opacity: 0.45 * ramp(f, TEAR, TEAR + 8), pointerEvents: 'none', mixBlendMode: 'multiply' }} />
      {/* explanation card: one part at a time */}
      {active >= 0 && (() => { const m = MODS[active], o = ramp(f, 106 + active * 14, 109 + active * 14); return (
        <div style={{ position: 'absolute', left: 60, right: 60, top: 190, textAlign: 'center', opacity: o, transform: `translateY(${10 * (1 - o)}px)` }}>
          <div style={{ display: 'inline-block', padding: '20px 30px', borderRadius: 18, background: 'rgba(6,6,12,.86)', border: `3px solid ${m.col}` }}>
            <div style={{ font: `800 58px/1 ${FONT}`, letterSpacing: '0.08em', color: m.col }}>{m.label}</div>
            <div style={{ font: `700 42px/1.2 ${FONT}`, color: '#fff', marginTop: 12 }}>{m.does}</div>
          </div>
        </div>); })()}
    </AbsoluteFill>
  );
};
