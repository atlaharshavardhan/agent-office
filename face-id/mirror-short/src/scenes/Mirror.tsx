import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, clamp, ramp } from '../theme';

// Scene 5 (28–36 s, 240 frames). Same bathroom, same side framing as the hook's first shot.
// Overlay coordinates are in the still's own pixels (941 x 1672).
const P_OUT = [[536, 612], [686, 566], [352, 548]];  // phone -> mirror -> his face (IR bounce)
const P_SEE = [[538, 626], [858, 608]];               // phone -> into the mirror -> the reflection

const len = (p: number[][]) => p.slice(1).reduce((a, q, i) => a + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0);
const along = (p: number[][], u: number) => {
  let d = u * len(p);
  for (let i = 1; i < p.length; i++) {
    const s = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    if (d <= s) return [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * d / s, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * d / s];
    d -= s;
  }
  return p[p.length - 1];
};
const poly = (p: number[][]) => p.map((q, i) => `${i ? 'L' : 'M'} ${q[0]} ${q[1]}`).join(' ');

export const Mirror: React.FC = () => {
  const l = useCurrentFrame();
  const draw1 = ramp(l, 40, 85), o1 = ramp(l, 38, 44) * (1 - 0.6 * ramp(l, 115, 130));
  const draw2 = ramp(l, 125, 160), o2 = ramp(l, 123, 129);
  const L1 = len(P_OUT), L2 = len(P_SEE);
  const push = interpolate(l, [0, 240], [1, 1.04], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '600px 700px', transform: `scale(${push})` }}>
        <Img src={staticFile('bathroom_side.png')} style={{ width: 1080, height: 1920, objectFit: 'cover' }} />
        <svg viewBox="0 0 941 1672" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: 1080, height: 1920 }}>
          <path d={poly(P_OUT)} fill="none" stroke={C.ir} strokeWidth={2.4} strokeLinejoin="round" strokeDasharray={`${L1 * draw1} ${L1}`} opacity={o1} />
          {draw1 > 0 && draw1 < 1 && (() => { const [x, y] = along(P_OUT, draw1); return <circle cx={x} cy={y} r={4.5} fill={C.label} opacity={o1} />; })()}
          {draw1 >= 1 && [0, 1, 2].map((k) => { const u = ((l - 85) / 40 + k / 3) % 1; const [x, y] = along(P_OUT, u); return <circle key={k} cx={x} cy={y} r={3.2} fill={C.ir} opacity={o1 * 0.9} />; })}
          <path d={poly(P_SEE)} fill="none" stroke={C.label} strokeWidth={2} strokeDasharray="7 7" strokeDashoffset={-l * 0.6} opacity={o2} clipPath="url(#reveal)" />
          <clipPath id="reveal"><rect x={0} y={0} width={538 + (858 - 538) * draw2} height={1672} /></clipPath>
        </svg>
      </div>
      <div style={{ position: 'absolute', left: 90, top: 1110, opacity: o1, font: `800 28px/1 ${FONT}`, letterSpacing: '0.14em', color: C.label, padding: '12px 18px', borderRadius: 10, background: 'rgba(18,13,10,.62)', border: `2px solid ${C.ir}` }}>INFRARED PATH · ILLUSTRATIVE</div>
      <div style={{ position: 'absolute', left: 90, top: 1185, opacity: o2, font: `800 28px/1 ${FONT}`, letterSpacing: '0.14em', color: C.label, padding: '12px 18px', borderRadius: 10, background: 'rgba(18,13,10,.62)', border: `2px dashed ${C.label}` }}>WHAT THE PHONE SEES</div>
    </AbsoluteFill>
  );
};
