import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, Label, clamp, ramp } from '../theme';

// Scene 5 (8 s, 240 frames): "Here's the twist. A mirror can reflect infrared light too. So what happens
// when the phone sees only my reflection?"  Seen from behind him (public/bathroom_rear.png, 941 x 1672).
// The dot projector is on the FRONT of the phone he is holding. From behind we cannot see that side, so:
//  - the rays leave the top edge of his real phone (from its hidden front, never from the back cameras),
//  - the mirror shows that front camera glowing, with the mirror image of the same rays,
//  - both meet at the glass, and the reflected rays land on the face we see in the mirror.
//   0– 35  cut to the rear view and push in toward the mirror
//  40–130  the front camera in the mirror lights up; a fan of red rays sweeps down his reflected face
//          and the dot pattern appears behind it, with a scan frame and a running percentage
// 130–240  second push-in on the reflection; closed padlock with a question mark. No result is shown.
const K = 1080 / 941;
const SRC = [822, 537];                                                   // top edge of the phone in his hand (its front faces the mirror)
const CAM = [702, 498], FACE = { x: 595, y: 502, rx: 47, ry: 62 };      // front camera of the reflected phone; reflected face
const io = (x: number) => x * x * (3 - 2 * x);
let seed = 23; const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const DOTS: number[][] = [];
while (DOTS.length < 460) { const x = rnd() * 2 - 1, y = rnd() * 2 - 1; if (x * x + y * y < 1) DOTS.push([FACE.x + x * FACE.rx, FACE.y + y * FACE.ry, rnd()]); }
const FAN = [-0.92, -0.69, -0.46, -0.23, 0, 0.23, 0.46, 0.69, 0.92];

export const Mirror: React.FC = () => {
  const l = useCurrentFrame();
  const a = ramp(l, 0, 35, 0, 1, io), b = ramp(l, 136, 170, 0, 1, io);
  const s = 1 + 0.6 * a + 0.75 * b;
  const fx = interpolate(a, [0, 1], [470.5, 640], clamp) + (612 - 640) * b, fy = interpolate(a, [0, 1], [784, 540], clamp) + (505 - 540) * b;
  const tx = 540 - fx * K * s, ty = 900 - fy * K * s;
  const scr = (x: number, y: number) => [x * K * s + tx, y * K * s + ty];
  const scan = ramp(l, 50, 128), pct = Math.round(scan * 100);
  const sy = FACE.y - FACE.ry + scan * 2 * FACE.ry;                      // the line being scanned right now
  const half = FACE.rx * Math.sqrt(Math.max(0.05, 1 - ((sy - FACE.y) / FACE.ry) ** 2));   // face width at that line
  const fire = ramp(l, 44, 50) * (1 - ramp(l, 128, 136));
  const B = { x0: FACE.x - 62, x1: FACE.x + 62, y0: FACE.y - 78, y1: FACE.y + 78 }, g = 26 * (1 - ramp(l, 42, 52, 0, 1, io));
  const corner = (x: number, y: number, dx: number, dy: number) => `M ${x + dx * 20} ${y} H ${x} V ${y + dy * 20}`;
  const [cx, cy] = scr(CAM[0], CAM[1]), [bx, by] = scr(B.x0, B.y1), [qx, qy] = scr(B.x1 + 14, B.y0 + 30);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1672 * K, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
        <Img src={staticFile('bathroom_rear.png')} style={{ position: 'absolute', inset: 0, width: 1080, height: 1672 * K, filter: `brightness(${1 - 0.22 * ramp(l, 40, 60)})` }} />
        <svg viewBox="0 0 941 1672" style={{ position: 'absolute', inset: 0, width: 1080, height: 1672 * K }}>
          {/* rays from the front camera (in the mirror) to the line of his face being scanned */}
          <g opacity={fire}>
            {FAN.map((k, i) => { const x = FACE.x + k * half, u = ((l / 9) + i * 0.37) % 1;
              const gx = 764 + k * 5, gy = 512 + (sy - FACE.y) * 0.45 + k * 9;         // where this ray meets the glass, between the two phones
              const pos = u < 0.5 ? [SRC[0] + (gx - SRC[0]) * u * 2, SRC[1] + (gy - SRC[1]) * u * 2] : [gx + (x - gx) * (u - 0.5) * 2, gy + (sy - gy) * (u - 0.5) * 2];
              return (
              <g key={i}>
                <line x1={SRC[0]} y1={SRC[1]} x2={gx} y2={gy} stroke={C.ir} strokeWidth={1} opacity={0.9} />
                <line x1={CAM[0]} y1={CAM[1]} x2={gx} y2={gy} stroke={C.irCore} strokeWidth={0.6} strokeDasharray="3 3" opacity={0.6} />
                <line x1={gx} y1={gy} x2={x} y2={sy} stroke={C.ir} strokeWidth={0.75} opacity={0.75} />
                <circle cx={gx} cy={gy} r={1.6 + 2.2 * u} fill="none" stroke={C.irCore} strokeWidth={0.6} opacity={0.8 * (1 - u)} />
                <circle cx={pos[0]} cy={pos[1]} r={1.4} fill={C.irCore} />
              </g>); })}
            <line x1={FACE.x - half} x2={FACE.x + half} y1={sy} y2={sy} stroke={C.irCore} strokeWidth={1.4} />
          </g>
          {/* the dot pattern appears behind the scan line */}
          {DOTS.map((d, i) => (d[1] <= sy && l >= 50 ? <circle key={i} cx={d[0]} cy={d[1]} r={1.05} fill={C.ir} opacity={0.7 + 0.3 * d[2]} /> : null))}
          {/* the hidden front of his real phone: light spilling over its top edge */}
          <g opacity={ramp(l, 38, 44) * (1 - ramp(l, 128, 136))}><ellipse cx={SRC[0]} cy={SRC[1]} rx={16} ry={4} fill={C.ir} opacity={0.85} /><ellipse cx={SRC[0]} cy={SRC[1]} rx={7} ry={1.8} fill="#fff" /></g>
          {/* front camera glow on the phone in the mirror */}
          <g opacity={ramp(l, 38, 44)}><circle cx={CAM[0]} cy={CAM[1]} r={5 + 1.2 * Math.sin(l / 3)} fill={C.ir} opacity={0.85} /><circle cx={CAM[0]} cy={CAM[1]} r={2} fill="#fff" /></g>
          {/* scan frame on the reflection */}
          <g opacity={ramp(l, 42, 48)} stroke="#fff" strokeWidth={2.2} fill="none">
            <path d={corner(B.x0 - g, B.y0 - g, 1, 1)} /><path d={corner(B.x1 + g, B.y0 - g, -1, 1)} /><path d={corner(B.x0 - g, B.y1 + g, 1, -1)} /><path d={corner(B.x1 + g, B.y1 + g, -1, -1)} />
          </g>
        </svg>
      </div>
      {/* tag on the phone in the mirror */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: ramp(l, 38, 44) * (1 - ramp(l, 130, 136)) }}>
        <path d={`M ${cx} ${cy - 12} V ${cy - 96}`} stroke="#fff" strokeWidth={3} /><circle cx={cx} cy={cy - 12} r={5} fill="#fff" />
      </svg>
      <div style={{ position: 'absolute', left: Math.min(cx - 290, 360), top: cy - 150, opacity: ramp(l, 38, 44) * (1 - ramp(l, 130, 136)), padding: '10px 16px', borderRadius: 10, background: 'rgba(10,8,7,.8)', border: `2px solid ${C.ir}`, font: `800 26px/1 ${FONT}`, letterSpacing: '0.1em', color: '#fff', whiteSpace: 'nowrap' }}>FRONT CAMERA · SEEN IN THE MIRROR</div>
      {(() => { const [rx, ry] = scr(SRC[0], SRC[1]), o = ramp(l, 38, 44) * (1 - ramp(l, 130, 136)); return (<>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}><path d={`M ${rx + 30} ${ry + 4} H ${rx + 70} V ${ry + 150}`} stroke="#fff" strokeWidth={3} fill="none" /><circle cx={rx + 30} cy={ry + 4} r={5} fill="#fff" /></svg>
        <div style={{ position: 'absolute', left: Math.min(rx - 150, 600), top: ry + 150, opacity: o, padding: '10px 16px', borderRadius: 10, background: 'rgba(10,8,7,.85)', border: `2px solid ${C.ir}`, font: `800 24px/1.25 ${FONT}`, letterSpacing: '0.08em', color: '#fff' }}>RAYS LEAVE THE FRONT<br />OF THE PHONE HE HOLDS</div>
      </>); })()}
      {/* live read-out under the scan frame */}
      <div style={{ position: 'absolute', left: bx, top: by + 14, opacity: ramp(l, 48, 52), padding: '8px 14px', borderRadius: 8, background: 'rgba(10,8,7,.8)', font: `800 26px/1 ${FONT}`, letterSpacing: '0.08em', color: '#fff', whiteSpace: 'nowrap' }}>{scan < 1 ? `SCANNING ${pct}%` : 'REFLECTION SCANNED'}</div>
      {/* closed padlock + question mark beside the frame */}
      <div style={{ position: 'absolute', left: Math.min(qx, 800), top: qy, opacity: ramp(l, 176, 182), transform: `scale(${1 + 0.05 * Math.sin(l / 5)})`, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 22px', borderRadius: 20, background: 'rgba(10,8,7,.8)', border: `3px solid ${C.amber}` }}>
        <svg width={56} height={70} viewBox="-36 -46 72 92"><path d="M -18 -6 v -14 a 18 18 0 0 1 36 0 v 14" stroke="#fff" strokeWidth={9} strokeLinecap="round" fill="none" /><rect x={-30} y={-6} width={60} height={46} rx={11} fill="#fff" /></svg>
        <span style={{ font: `800 78px/1 ${FONT}`, color: C.amber }}>?</span>
      </div>
      <Label text="A MIRROR REFLECTS INFRARED TOO" x={505} y={1380} o={ramp(l, 46, 50) * (1 - ramp(l, 130, 136))} size={30} align="center" color={C.ir} />
      <Label text="THE PHONE SEES ONLY A REFLECTION" x={505} y={1380} o={ramp(l, 140, 144)} size={30} align="center" color={C.label} />
      <div style={{ position: 'absolute', left: 80, top: 1470, opacity: 0.5 * ramp(l, 46, 50), font: `600 22px/1 ${FONT}`, color: '#b5ada5' }}>Illustration · infrared path simplified · the real dots are invisible</div>
    </AbsoluteFill>
  );
};
