import { AbsoluteFill } from 'remotion';
import { FONT, ramp } from '../theme';

// "Inside the phone" as a clean diagram: the top of the phone, its Dynamic Island with the three Face ID parts as dots,
// and a card for each part above it, joined to its dot by a dashed line. The parts stay in the island; each card is
// highlighted and explained in turn. f = HandPhone's frame; the diagram fades in over the photo at IN and its island
// starts at the photo island's size and place, so the push carries straight into it.
export const IN = 68, EXPLAIN = 106, CARD = 27;
const RED = '#ff4d63', PINK = '#ff8fa3', BLUE = '#6fa8ff';
const io = (x: number) => x * x * (3 - 2 * x), out3 = (x: number) => 1 - Math.pow(1 - x, 3);
const PARTS = [
  { x: 200, dx: 370, col: RED, label: 'DOT PROJECTOR', does: 'fires 30,000+ invisible dots' },
  { x: 540, dx: 540, col: PINK, label: 'FLOOD ILLUMINATOR', does: 'lights your face in infrared' },
  { x: 880, dx: 710, col: BLUE, label: 'IR CAMERA', does: 'reads the dots on your face' },
];
const CY = 440, S = 190;                                   // cards: centre y and size

export const PhoneParts: React.FC<{ f: number }> = ({ f }) => {
  const m = ramp(f, IN + 2, IN + 18, 0, 1, io);            // island settles from the photo's island to the diagram's
  const iw = 776 + (500 - 776) * m, ih = 221 + (116 - 221) * m, icy = 800 + (905 - 800) * m, top = 790 - 150 * (1 - m);
  const active = f < EXPLAIN ? -1 : Math.min(2, Math.floor((f - EXPLAIN) / CARD));
  return (
    <AbsoluteFill style={{ opacity: ramp(f, IN, IN + 8), background: 'radial-gradient(80% 45% at 50% 44%, #2a1f52 0%, #141026 55%, #0a0812 100%)', overflow: 'hidden' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="pp-edge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9a8ff" /><stop offset="0.35" stopColor="#4a4370" /><stop offset="1" stopColor="#1c1830" /></linearGradient>
          <linearGradient id="pp-scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2c2358" /><stop offset="1" stopColor="#1a1433" /></linearGradient>
          <radialGradient id="pp-glow"><stop offset="0" stopColor="#8f7cff" stopOpacity={0.55} /><stop offset="1" stopColor="#8f7cff" stopOpacity={0} /></radialGradient>
          <linearGradient id="pp-card" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a3552" /><stop offset="1" stopColor="#1a1727" /></linearGradient>
        </defs>
        <ellipse cx={540} cy={icy - 60} rx={430} ry={300} fill="url(#pp-glow)" opacity={0.6 * (1 - 0.5 * ramp(f, 88, 104))} />
        {/* the top of the phone */}
        <path d={`M 34 1920 V ${top + 120} a 120 120 0 0 1 120 -120 H 926 a 120 120 0 0 1 120 120 V 1920`} fill="url(#pp-scr)" stroke="url(#pp-edge)" strokeWidth={44} opacity={m} />
        {/* Dynamic Island with the three parts */}
        <rect x={540 - iw / 2} y={icy - ih / 2} width={iw} height={ih} rx={ih / 2} fill="#05040a" />
        {PARTS.map((p, i) => { const o = ramp(f, IN + 12 + i * 3, IN + 18 + i * 3), act = active === i, dim = active >= 0 && !act;
          return (<g key={p.label} opacity={o * (dim ? 0.45 : 1)}>
            <circle cx={p.dx} cy={icy} r={30} fill="#15131f" /><circle cx={p.dx} cy={icy} r={(act ? 21 + 2 * Math.sin(f / 2) : 18)} fill={p.col} />
            {act && <circle cx={p.dx} cy={icy} r={38} fill="none" stroke={p.col} strokeWidth={3} opacity={0.8} />}
          </g>); })}
        {/* dashed links, drawn from each dot up to its card */}
        {PARTS.map((p, i) => { const t = ramp(f, IN + 20 + i * 5, IN + 30 + i * 5, 0, 1, out3), act = active === i, y0 = 905 - 38, y1 = CY + S / 2 + 14;
          return t > 0 ? <line key={p.label} x1={p.dx} y1={y0} x2={p.dx + (p.x - p.dx) * t} y2={y0 + (y1 - y0) * t} stroke={act ? p.col : '#cfc8ee'} strokeWidth={act ? 4 : 3} strokeDasharray="4 12" strokeLinecap="round" opacity={active >= 0 && !act ? 0.35 : 0.9} /> : null; })}
        {/* the cards */}
        {PARTS.map((p, i) => { const t = ramp(f, IN + 26 + i * 5, IN + 36 + i * 5, 0, 1, out3), act = active === i, dim = active >= 0 && !act, sc = (0.6 + 0.4 * t) * (act ? 1.13 : 1);
          return t > 0 ? (
            <g key={p.label} transform={`translate(${p.x} ${CY}) scale(${sc})`} opacity={t * (dim ? 0.5 : 1)}>
              {act && <circle r={150} fill={p.col} opacity={0.16 + 0.05 * Math.sin(f / 3)} />}
              <rect x={-S / 2} y={-S / 2} width={S} height={S} rx={38} fill="url(#pp-card)" stroke={act ? p.col : '#6f6a8c'} strokeWidth={act ? 5 : 2.5} />
              {i === 0 && <><circle r={62} fill="#0d0b14" />{Array.from({ length: 25 }, (_, k) => <circle key={k} cx={((k % 5) - 2) * 19} cy={(Math.floor(k / 5) - 2) * 19} r={5} fill={RED} opacity={Math.hypot((k % 5) - 2, Math.floor(k / 5) - 2) > 2.6 ? 0 : act ? 0.6 + 0.4 * Math.sin(f / 2 + k) : 0.85} />)}</>}
              {i === 1 && <><circle r={62} fill="#5a1626" /><circle r={46} fill="#b8324a" /><circle r={(act ? 30 + 3 * Math.sin(f / 2) : 28)} fill="#ffb1bf" /></>}
              {i === 2 && <><circle r={62} fill="#0b1026" /><circle r={46} fill="#17214d" /><circle r={28} fill="#0a0f24" /><circle cx={-13} cy={-15} r={9} fill="#cfdcff" /></>}
            </g>) : null; })}
        {PARTS.map((p, i) => { const t = ramp(f, IN + 30 + i * 5, IN + 38 + i * 5), act = active === i, dim = active >= 0 && !act;
          return <text key={p.label} x={p.x} y={CY - S / 2 - 44} textAnchor="middle" fill={p.col} opacity={t * (dim ? 0.35 : 1)} style={{ font: `800 ${act ? 31 : 28}px ${FONT}`, letterSpacing: '0.1em' }}>{p.label}</text>; })}
      </svg>
      {/* what the highlighted part does */}
      {active >= 0 && (() => { const p = PARTS[active], o = ramp(f, EXPLAIN + active * CARD, EXPLAIN + active * CARD + 4);
        return <div style={{ position: 'absolute', left: 0, right: 0, top: 1070, textAlign: 'center', opacity: o, transform: `translateY(${12 * (1 - o)}px)`, font: `800 50px/1.15 ${FONT}`, color: '#fff' }}>{p.does}</div>; })()}
    </AbsoluteFill>
  );
};
