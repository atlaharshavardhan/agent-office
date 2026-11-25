import { AbsoluteFill } from 'remotion';
import { FONT, ramp } from '../theme';

// "Inside the phone", on the real phone in his hand: its Dynamic Island with the three Face ID parts as dots,
// and a card for each part above it, joined to its dot by a dashed line. The parts stay in the island; each card is
// highlighted and explained in turn. f = HandPhone's frame; the diagram fades in over the photo at IN and its island
// starts at the photo island's size and place, so the push carries straight into it.
export const IN = 68, EXPLAIN = 119, CARD = 39;
const RED = '#ff4d63', PINK = '#ff8fa3', BLUE = '#6fa8ff';
const io = (x: number) => x * x * (3 - 2 * x), out3 = (x: number) => 1 - Math.pow(1 - x, 3);
const PARTS = [
  { x: 180, dx: 452, col: RED, label: 'DOT PROJECTOR', does: 'fires 30,000+ invisible dots' },
  { x: 540, dx: 540, col: PINK, label: 'FLOOD ILLUMINATOR', does: 'lights your face in infrared' },
  { x: 900, dx: 628, col: BLUE, label: 'IR CAMERA', does: 'reads the dots on your face' },
];
const CY = 520, S = 190;                                   // cards: centre y and size

export const PhoneParts: React.FC<{ f: number }> = ({ f }) => {
  const m = ramp(f, IN + 2, IN + 18, 0, 1, io);            // island settles from the photo's island to the diagram's
  const iw = 288, ih = 84, icy = 905;                       // the real phone's own Dynamic Island (HandPhone settles it here)
  // tear-down: each part is pushed up out of the island along its own line and becomes its card
  const lift = (i: number) => ramp(f, IN + 14 + i * 4, IN + 30 + i * 4, 0, 1, out3);
  const active = f < EXPLAIN ? -1 : Math.min(2, Math.floor((f - EXPLAIN) / CARD));
  return (
    <AbsoluteFill style={{ opacity: ramp(f, IN, IN + 8), background: 'linear-gradient(180deg, rgba(8,6,12,.86) 0%, rgba(8,6,12,.8) 36%, rgba(8,6,12,.25) 44%, rgba(8,6,12,.3) 100%)', overflow: 'hidden' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="pp-edge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9a8ff" /><stop offset="0.35" stopColor="#4a4370" /><stop offset="1" stopColor="#1c1830" /></linearGradient>
          <linearGradient id="pp-scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2c2358" /><stop offset="1" stopColor="#1a1433" /></linearGradient>
          <radialGradient id="pp-glow"><stop offset="0" stopColor="#8f7cff" stopOpacity={0.55} /><stop offset="1" stopColor="#8f7cff" stopOpacity={0} /></radialGradient>
          <linearGradient id="pp-card" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a3552" /><stop offset="1" stopColor="#1a1727" /></linearGradient>
        </defs>
        {/* Dynamic Island with the three parts */}
        <rect x={540 - iw / 2} y={icy - ih / 2} width={iw} height={ih} rx={ih / 2} fill="#05040a" />
        {PARTS.map((p, i) => { const o = ramp(f, IN + 12 + i * 3, IN + 18 + i * 3), act = active === i, dim = active >= 0 && !act;
          return (<g key={p.label} opacity={o * (dim ? 0.45 : 1)}>
            <circle cx={p.dx} cy={icy} r={24} fill="#15131f" stroke="#3a3650" strokeWidth={2} /><circle cx={p.dx} cy={icy} r={(act ? 16 + 1.5 * Math.sin(f / 2) : 13)} fill={p.col} opacity={act ? 1 : 1 - 0.65 * lift(i)} />
            {act && <circle cx={p.dx} cy={icy} r={31} fill="none" stroke={p.col} strokeWidth={3} opacity={0.8} />}
          </g>); })}
        {/* dashed links, drawn from each dot up to its card */}
        {PARTS.map((p, i) => { const t = lift(i), act = active === i, y0 = 905 - 20, y1 = CY + S / 2 + 14;
          return t > 0 ? <line key={p.label} x1={p.dx} y1={y0} x2={p.dx + (p.x - p.dx) * t} y2={y0 + (y1 - y0) * t} stroke={act ? p.col : '#cfc8ee'} strokeWidth={act ? 4 : 3} strokeDasharray="4 12" strokeLinecap="round" opacity={active >= 0 && !act ? 0.35 : 0.9} /> : null; })}
        {/* the cards */}
        {PARTS.map((p, i) => { const t = lift(i), act = active === i, dim = active >= 0 && !act, sc = (0.17 + 0.83 * t) * (act ? 1.13 : 1);
          return t > 0 ? (
            <g key={p.label} transform={`translate(${p.dx + (p.x - p.dx) * t} ${icy + (CY - icy) * t}) scale(${sc})`} opacity={Math.min(1, t * 6) * (dim ? 0.5 : 1)}>
              {act && <circle r={150} fill={p.col} opacity={0.16 + 0.05 * Math.sin(f / 3)} />}
              <rect x={-S / 2} y={-S / 2} width={S} height={S} rx={38} fill="url(#pp-card)" stroke={act ? p.col : '#6f6a8c'} strokeWidth={act ? 5 : 2.5} />
              {i === 0 && <><circle r={62} fill="#0d0b14" />{Array.from({ length: 25 }, (_, k) => <circle key={k} cx={((k % 5) - 2) * 19} cy={(Math.floor(k / 5) - 2) * 19} r={5} fill={RED} opacity={Math.hypot((k % 5) - 2, Math.floor(k / 5) - 2) > 2.6 ? 0 : act ? 0.6 + 0.4 * Math.sin(f / 2 + k) : 0.85} />)}</>}
              {i === 1 && <><circle r={62} fill="#5a1626" /><circle r={46} fill="#b8324a" /><circle r={(act ? 30 + 3 * Math.sin(f / 2) : 28)} fill="#ffb1bf" /></>}
              {i === 2 && <><circle r={62} fill="#0b1026" /><circle r={46} fill="#17214d" /><circle r={28} fill="#0a0f24" /><circle cx={-13} cy={-15} r={9} fill="#cfdcff" /></>}
            </g>) : null; })}
        {PARTS.map((p, i) => { const t = ramp(f, IN + 30 + i * 4, IN + 36 + i * 4), act = active === i, dim = active >= 0 && !act;
          return <text key={p.label} x={p.x} y={CY - S / 2 - 40} textAnchor="middle" fill={p.col} opacity={t * (dim ? 0.35 : 1)} style={{ font: `800 ${act ? 27 : 24}px ${FONT}`, letterSpacing: '0.08em' }}>{p.label}</text>; })}
      </svg>
      {/* what the highlighted part does */}
      {active >= 0 && (() => { const p = PARTS[active], o = ramp(f, EXPLAIN + active * CARD, EXPLAIN + active * CARD + 4);
        return <div style={{ position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', opacity: o, transform: `translateY(${12 * (1 - o)}px)` }}><span style={{ display: 'inline-block', padding: '30px 34px', borderRadius: 18, background: 'rgba(8,6,12,.92)', border: `3px solid ${p.col}`, font: `800 48px/1.15 ${FONT}`, color: '#fff' }}>{p.does}</span></div>; })()}
    </AbsoluteFill>
  );
};
