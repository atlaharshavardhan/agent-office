import { AbsoluteFill } from 'remotion';
import { C, FONT, ramp } from '../theme';

// The mirror bounce as a top-down diagram (we look straight down on his head, the phone and the glass).  t = frames.
//   0– 10  the set-up appears: mirror, his head, the phone with its dot projector and infrared camera
//  10– 32  the dots leave the projector and travel to the glass
//  32– 54  they bounce (angle in = angle out) and land on his nose and cheeks
//  54– 74  the light goes back the same way, off the glass and into the infrared camera
//  66–     what that means for the phone: it sees his face as if it stood behind the glass, at the full length of the path
const MY = 780, HEAD = [430, 1340], R = 120, PROJ = [668, 1104], CAM = [792, 1104];
const TARGETS = [[352, 1238], [430, 1196], [508, 1238]];                                  // cheek, nose tip, cheek
const hit = (p: number[], q: number[]) => { const qy = 2 * MY - q[1], u = (MY - p[1]) / (qy - p[1]); return [p[0] + (q[0] - p[0]) * u, MY]; };
const len = (a: number[], b: number[]) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const lerp = (a: number[], b: number[], u: number) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
const Head: React.FC<{ cx: number; cy: number; flip?: boolean; ghost?: boolean }> = ({ cx, cy, flip, ghost }) => (
  <g transform={`translate(${cx} ${cy}) scale(1 ${flip ? -1 : 1})`} opacity={ghost ? 0.55 : 1} fill={ghost ? 'none' : 'url(#mt-head)'} stroke={ghost ? '#e9e2ff' : '#8c8799'} strokeWidth={3} strokeDasharray={ghost ? '9 9' : undefined}>
    <ellipse cx={-R - 6} cy={10} rx={12} ry={32} /><ellipse cx={R + 6} cy={10} rx={12} ry={32} />
    <path d={`M ${-R} 0 A ${R} ${R * 1.08} 0 1 0 ${R} 0 C ${R} -70 62 -104 30 -112 C 16 -118 12 -144 0 -146 C -12 -144 -16 -118 -30 -112 C -62 -104 ${-R} -70 ${-R} 0 Z`} />
  </g>
);
const Tag: React.FC<{ x: number; y: number; text: string; o: number; col?: string; size?: number; anchor?: 'start' | 'middle' | 'end' }> = ({ x, y, text, o, col = '#fff', size = 27, anchor = 'middle' }) =>
  <text x={x} y={y} textAnchor={anchor} fill={col} opacity={o} style={{ font: `800 ${size}px ${FONT}`, letterSpacing: '0.12em' }}>{text}</text>;

export const B2 = 42;                                                    // frame the second beat starts
export const MirrorTop: React.FC<{ t: number }> = ({ t }) => {
  const a = ramp(t, 0, 6), out = ramp(t, 5, 21, 0, 1, (x) => x), back = ramp(t, 21, 37, 0, 1, (x) => x), ret = ramp(t, B2 + 2, B2 + 16, 0, 1, (x) => x), virt = ramp(t, B2 + 10, B2 + 22);
  // beat 1 is framed close on the phone, the glass and his face; beat 2 snaps out to take in the space behind the glass
  const z = t < B2 ? 1.22 + 0.04 * (t / B2) : 1 + 0.22 * (1 - ramp(t, B2, B2 + 7, 0, 1, (x) => 1 - Math.pow(1 - x, 3)));
  const GH = [HEAD[0], 2 * MY - HEAD[1]];
  const total = len(PROJ, hit(PROJ, TARGETS[1])) + len(hit(PROJ, TARGETS[1]), TARGETS[1]), k = 60 / total;      // drawn so the nose path reads 60 cm
  const cm = (len(PROJ, hit(PROJ, TARGETS[1])) * out + len(hit(PROJ, TARGETS[1]), TARGETS[1]) * back) * k;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(90% 55% at 50% 50%, #17131c 0%, #0b090d 75%)' }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '540px 1080px', transform: `scale(${z})` }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs><linearGradient id="mt-head" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#2c2a33" /><stop offset="1" stopColor="#6d6a78" /></linearGradient></defs>
        <g opacity={a}>
          {/* the mirror, seen edge-on */}
          <rect x={110} y={MY - 9} width={860} height={18} rx={6} fill="#9fd4ff" opacity={0.85} /><rect x={110} y={MY - 9} width={860} height={5} rx={2} fill="#fff" opacity={0.7} />
          <Tag x={966} y={MY - 26} text="MIRROR" o={1} col="#9fd4ff" anchor="end" />
          <Head cx={HEAD[0]} cy={HEAD[1]} />
          {/* the phone, held up facing the glass */}
          <rect x={590} y={1104} width={270} height={36} rx={14} fill="#5a1626" stroke="#ff8fa3" strokeWidth={2.5} />
          <rect x={PROJ[0] - 15} y={1096} width={30} height={16} rx={4} fill={C.ir} /><rect x={CAM[0] - 15} y={1096} width={30} height={16} rx={4} fill="#63d6c9" />
          <Tag x={600} y={1186} text="DOT PROJECTOR" o={1} size={22} anchor="start" col={C.ir} /><Tag x={600} y={1222} text="INFRARED CAMERA" o={1} size={22} anchor="start" col="#63d6c9" />
        </g>
        {/* out to the glass, then back onto his face */}
        {TARGETS.map((q, i) => { const h = hit(PROJ, q), p1 = lerp(PROJ, h, out), p2 = lerp(h, q, back);
          return (<g key={i} stroke={C.ir} strokeWidth={5} strokeLinecap="round" fill="none">
            {out > 0 && <line x1={PROJ[0]} y1={PROJ[1]} x2={p1[0]} y2={p1[1]} />}
            {back > 0 && <line x1={h[0]} y1={h[1]} x2={p2[0]} y2={p2[1]} />}
            {out > 0 && out < 1 && <circle cx={p1[0]} cy={p1[1]} r={9} fill="#fff" stroke="none" />}
            {back > 0 && back < 1 && <circle cx={p2[0]} cy={p2[1]} r={9} fill="#fff" stroke="none" />}
            {out >= 1 && <circle cx={h[0]} cy={h[1]} r={8 + 10 * ((t / 14 + i / 3) % 1)} stroke="#fff" strokeWidth={2} opacity={1 - ((t / 14 + i / 3) % 1)} />}
            {back >= 1 && <circle cx={q[0]} cy={q[1]} r={9} fill="#fff" stroke={C.ir} strokeWidth={4} />}
          </g>); })}
        {back >= 1 && Array.from({ length: 13 }, (_, i) => { const u = i / 12, x = 330 + 200 * u, y = 1250 - 56 * Math.sin(Math.PI * u) - (Math.abs(u - 0.5) < 0.1 ? 22 : 0); return <circle key={i} cx={x} cy={y} r={5} fill={C.ir} opacity={ramp(t, 36 + i * 0.5, 40 + i * 0.5)} />; })}
        {/* back to the camera */}
        {ret > 0 && [TARGETS[1]].map((q, i) => { const h = hit(CAM, q), d1 = len(q, h), d2 = len(h, CAM), d = ret * (d1 + d2), p = d < d1 ? lerp(q, h, d / d1) : lerp(h, CAM, (d - d1) / d2);
          return <g key={i}><path d={`M ${q[0]} ${q[1]} L ${d < d1 ? p[0] : h[0]} ${d < d1 ? p[1] : h[1]} ${d >= d1 ? `L ${p[0]} ${p[1]}` : ''}`} fill="none" stroke="#63d6c9" strokeWidth={4} strokeDasharray="10 9" /><circle cx={p[0]} cy={p[1]} r={8} fill="#63d6c9" /></g>; })}
        {/* what the phone makes of it: the face behind the glass */}
        <g opacity={virt}>
          <Head cx={GH[0]} cy={GH[1]} flip ghost />
          {TARGETS.map((q, i) => { const h = hit(PROJ, q); return <line key={i} x1={h[0]} y1={h[1]} x2={q[0]} y2={2 * MY - q[1]} stroke="#e9e2ff" strokeWidth={2.5} strokeDasharray="6 9" opacity={0.8} />; })}
          <Tag x={600} y={250} text="TO THE PHONE, YOUR FACE" o={1} size={24} anchor="start" col="#e9e2ff" /><Tag x={600} y={288} text="IS BACK HERE" o={1} size={24} anchor="start" col="#e9e2ff" />
        </g>
      </svg>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 452, textAlign: 'center', font: `800 27px/1 ${FONT}`, letterSpacing: '0.12em', color: '#e9e2ff' }}>
        <span style={{ display: 'inline-block', padding: '12px 18px', borderRadius: 10, border: `2px solid ${t < B2 ? C.ir : '#63d6c9'}`, background: 'rgba(18,13,10,.7)' }}>{t < B2 ? '1 · THE DOTS BOUNCE OFF THE GLASS' : '2 · WHAT THE PHONE MAKES OF IT'}</span>
      </div>
      {/* how far the light has travelled */}
      <div style={{ position: 'absolute', left: 60, top: 545, opacity: ramp(t, 8, 14) }}>
        <div style={{ font: `800 80px/1 ${FONT}`, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{cm.toFixed(0)} <span style={{ fontSize: 50 }}>cm</span></div>
        <div style={{ font: `600 26px/1.25 ${FONT}`, color: '#c9c2bb', marginTop: 8 }}>the light's path:<br />phone → mirror → face</div>
      </div>
      <div style={{ position: 'absolute', left: 80, top: 1750, width: 860, opacity: 0.5 * a, font: `600 21px/1.3 ${FONT}`, color: '#b5ada5' }}>Top-down illustration · distances are examples · the real dots are invisible</div>
    </AbsoluteFill>
  );
};
