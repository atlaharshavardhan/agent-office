import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, Label, clamp, ramp } from '../theme';

// Scene 5 (8 s, 240 frames): "Here's the twist. A mirror can reflect infrared light too. So what happens
// when the phone sees only my reflection?"  Seen from behind him (public/bathroom_rear.png, 941 x 1672):
//   0– 35  cut to the rear view and push in toward the mirror
//  40–125  red dots leave his phone, hit the glass (ripples) and light up his reflected face
// 130–240  a scan frame locks onto the reflection; closed padlock with a question mark. No result is shown.
const K = 1080 / 941;
const PHONE = [822, 538],   // top edge of the phone he holds (its front faces the mirror), not the back cameras
const GLASS = [742, 516], FACE = { x: 595, y: 502, rx: 47, ry: 62 };
const io = (x: number) => x * x * (3 - 2 * x);
let seed = 23; const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const DOTS: number[][] = [];
while (DOTS.length < 430) { const x = (rnd() * 2 - 1), y = (rnd() * 2 - 1); if (x * x + y * y < 1) DOTS.push([FACE.x + x * FACE.rx, FACE.y + y * FACE.ry, rnd()]); }
const STREAM = Array.from({ length: 70 }, () => [rnd(), (rnd() - 0.5) * 14, rnd()]);

export const Mirror: React.FC = () => {
  const l = useCurrentFrame();
  const a = ramp(l, 0, 35, 0, 1, io), b = ramp(l, 130, 165, 0, 1, io);
  const s = 1 + 0.6 * a + 0.75 * b;
  const fx = interpolate(a, [0, 1], [470.5, 640], clamp) + (608 - 640) * b, fy = interpolate(a, [0, 1], [784, 540], clamp) + (505 - 540) * b;
  const tx = 540 - fx * K * s, ty = 900 - fy * K * s;
  const scr = (x: number, y: number) => [x * K * s + tx, y * K * s + ty];
  const fire = ramp(l, 40, 46) * (1 - ramp(l, 118, 128));
  const appear = (d: number[]) => 66 + ((FACE.x + FACE.rx - d[0]) / (2 * FACE.rx)) * 28 + d[2] * 6;   // near side of the face first
  const lock = ramp(l, 134, 146, 0, 1, io);
  const B = { x0: FACE.x - 62, x1: FACE.x + 62, y0: FACE.y - 78, y1: FACE.y + 78 }, g = 26 * (1 - lock);     // brackets close in
  const corner = (x: number, y: number, dx: number, dy: number) => `M ${x + dx * 20} ${y} H ${x} V ${y + dy * 20}`;
  const [qx, qy] = scr(B.x1 + 16, B.y0 + 10);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1672 * K, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
        <Img src={staticFile('bathroom_rear.png')} style={{ position: 'absolute', inset: 0, width: 1080, height: 1672 * K, filter: `brightness(${1 - 0.22 * ramp(l, 40, 70)})` }} />
        <svg viewBox="0 0 941 1672" style={{ position: 'absolute', inset: 0, width: 1080, height: 1672 * K }}>
          {/* dots travelling from the phone to the glass */}
          <g opacity={fire}>
            <line x1={PHONE[0]} y1={PHONE[1]} x2={GLASS[0]} y2={GLASS[1]} stroke={C.ir} strokeWidth={0.8} opacity={0.5} />
            {STREAM.map(([p, off, c], i) => { const u = (p + l / 16) % 1; return <circle key={i} cx={PHONE[0] + (GLASS[0] - PHONE[0]) * u} cy={PHONE[1] + (GLASS[1] - PHONE[1]) * u + off * u * (1 - u) * 2} r={0.9 + 0.5 * c} fill={C.ir} />; })}
            {/* ripples where the light meets the mirror */}
            {[0, 1, 2].map((k) => { const u = ((l - 48) / 26 + k / 3) % 1; return l > 48 ? <ellipse key={k} cx={GLASS[0]} cy={GLASS[1]} rx={4 + 20 * u} ry={7 + 34 * u} fill="none" stroke={C.irCore} strokeWidth={1.1} opacity={0.75 * (1 - u)} /> : null; })}
            {/* reflected fan from the glass to his reflected face */}
            {[-0.9, -0.45, 0, 0.45, 0.9].map((k) => <line key={k} x1={GLASS[0]} y1={GLASS[1]} x2={FACE.x + 20} y2={FACE.y + k * FACE.ry} stroke={C.ir} strokeWidth={0.6} opacity={0.3 * ramp(l, 62, 70)} />)}
            <circle cx={PHONE[0]} cy={PHONE[1]} r={5} fill={C.ir} opacity={0.9} /><circle cx={PHONE[0]} cy={PHONE[1]} r={2} fill="#fff" />
          </g>
          {/* the dot pattern, seen on his reflected face */}
          {DOTS.map((d, i) => { const o = ramp(l, appear(d), appear(d) + 3); return o > 0 ? <circle key={i} cx={d[0]} cy={d[1]} r={1.05} fill={C.ir} opacity={o * (0.7 + 0.3 * d[2])} /> : null; })}
          {/* scan frame on the reflection */}
          <g opacity={ramp(l, 132, 138)} stroke="#fff" strokeWidth={2.2} fill="none">
            <path d={corner(B.x0 - g, B.y0 - g, 1, 1)} /><path d={corner(B.x1 + g, B.y0 - g, -1, 1)} /><path d={corner(B.x0 - g, B.y1 + g, 1, -1)} /><path d={corner(B.x1 + g, B.y1 + g, -1, -1)} />
            <line x1={B.x0} x2={B.x1} y1={B.y0 + ((l - 146) % 50) / 50 * (B.y1 - B.y0)} y2={B.y0 + ((l - 146) % 50) / 50 * (B.y1 - B.y0)} strokeWidth={1.2} opacity={l > 146 ? 0.7 : 0} />
          </g>
        </svg>
      </div>
      {/* closed padlock + question mark beside the frame */}
      <div style={{ position: 'absolute', left: Math.min(qx, 830), top: qy, opacity: ramp(l, 168, 174), transform: `scale(${1 + 0.05 * Math.sin(l / 5)})`, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 22px', borderRadius: 20, background: 'rgba(10,8,7,.8)', border: `3px solid ${C.amber}` }}>
        <svg width={56} height={70} viewBox="-36 -46 72 92"><path d="M -18 -6 v -14 a 18 18 0 0 1 36 0 v 14" stroke="#fff" strokeWidth={9} strokeLinecap="round" fill="none" /><rect x={-30} y={-6} width={60} height={46} rx={11} fill="#fff" /></svg>
        <span style={{ font: `800 78px/1 ${FONT}`, color: C.amber }}>?</span>
      </div>
      <Label text="A MIRROR REFLECTS INFRARED TOO" x={505} y={1380} o={ramp(l, 46, 50) * (1 - ramp(l, 124, 130))} size={30} align="center" color={C.ir} />
      <Label text="THE PHONE SEES ONLY A REFLECTION" x={505} y={1380} o={ramp(l, 140, 144)} size={30} align="center" color={C.label} />
      <div style={{ position: 'absolute', left: 80, top: 1470, opacity: 0.5 * ramp(l, 46, 50), font: `600 22px/1 ${FONT}`, color: '#b5ada5' }}>Illustration · infrared path simplified · the real dots are invisible</div>
    </AbsoluteFill>
  );
};
