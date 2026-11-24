import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import front from '../front.json';
import mesh from '../mesh_front.json';
import { C, FONT, Label, ramp } from '../theme';
import { Head3D, headPoint } from './Head3D';
import { Orbit3D } from './Orbit3D';

// Scene 3 (6–19 s, 390 frames). s = local frame. Cuts are placed on the voiceover (see script.ts):
//   0– 24  side profile: the iPhone faces him                      "The dot projector ..."
//  24–120  PROJECT: tight grayscale view from the phone's front sensor; the whole dot pattern
//          appears in one beat on "infrared dots" and stays pinned to his face
// 120–210  CAPTURE: punch in so his face fills the frame, INFRARED CAMERA VIEW, capture held
//                                                                  "The infrared camera captures the pattern."
// 210–390  DEPTH MAP: the red dots fade into it at the same angle, scale and alignment; CLOSER on "nose",
//          FARTHER on "cheek"; the depth map then turns slightly
export const CUE = { toSensor: 24, dots: 72, capture: 120, depth: 210, nose: 291, cheek: 351, turn: 356 };
const VIEW = { x: 180, y: 240, w: 460 }, K = 1080 / VIEW.w;          // crop of bathroom_side.png (941 x 1672)
const CAM = [(507 - VIEW.x) * K, (603 - VIEW.y) * K];               // top of the phone, facing him
const MESH = '#dff3ff';
const pt = (a: number[]) => ({ x: a[0], y: a[1], d: a[2] });
const NOSE = pt(front.nose), CHEEK = pt(front.cheek);

const Side: React.FC<{ s: number }> = ({ s }) => (
  <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, transformOrigin: `${CAM[0]}px ${CAM[1]}px`, transform: `scale(${1 + 0.05 * (s / 24)})` }}>
      <Img src={staticFile('bathroom_side.png')} style={{ position: 'absolute', left: -VIEW.x * K, top: -VIEW.y * K, width: 941 * K, height: 1672 * K }} />
    </div>
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: ramp(s, 4, 8) }}>
      <path d={`M ${CAM[0]} ${CAM[1] - 20} V 716`} stroke={C.label} strokeWidth={3} />
      <circle cx={CAM[0]} cy={CAM[1]} r={9} fill="none" stroke={C.label} strokeWidth={3} />
    </svg>
    <Label text="DOT PROJECTOR" x={CAM[0]} y={660} o={ramp(s, 4, 8)} size={28} align="center" color={C.label} />
  </AbsoluteFill>
);

const Mark: React.FC<{ x: number; y: number; text: string; left: boolean; o: number }> = ({ x, y, text, left, o }) => {
  const lx = left ? 70 : 760, ly = y + (left ? 150 : 190);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
        <path d={`M ${left ? lx + 180 : lx + 40} ${ly + 4} L ${x} ${y}`} stroke="#fff" strokeWidth={3} fill="none" />
        <circle cx={x} cy={y} r={17} fill="none" stroke={C.amber} strokeWidth={4.5} /><circle cx={x} cy={y} r={5.5} fill="#fff" />
      </svg>
      <div style={{ position: 'absolute', left: lx, top: ly, opacity: o, padding: '14px 22px', borderRadius: 10, background: 'rgba(10,8,7,.78)', border: `2px solid ${C.amber}`, font: `800 38px/1 ${FONT}`, letterSpacing: '0.12em', color: '#fff' }}>{text}</div>
    </>
  );
};

// After the side profile, the 3D dots clip plays for DOTS3D frames: the iPhone fires the red dots and
// they fly through space onto his head. Everything after it runs DOTS3D frames later.
export const DOTS3D = 180;   // 0–105 red dots fly and land · 112–180 they turn cyan: 30,000+ DEPTH POINTS
export const Scan: React.FC = () => {
  const raw = useCurrentFrame();
  if (raw < CUE.toSensor) return <Side s={raw} />;
  if (raw < CUE.toSensor + DOTS3D) return <Orbit3D g={raw - CUE.toSensor} />;
  // the grey sensor view and its dot reveal were removed: the 3D clip cuts straight to the infrared camera view
  const s = raw - (CUE.toSensor + DOTS3D) + CUE.capture;
  const captured = s >= CUE.capture, depth = s >= CUE.depth;
  const zoom = captured ? 1.25 : 1 + 0.03 * ((s - CUE.toSensor) / (CUE.capture - CUE.toSensor));
  // the head keeps moving while the depth mesh is on: a slow sway, blending into the final turn
  const tt = ramp(s, CUE.turn, 390, 0, 1, (x) => x * x * (3 - 2 * x));
  const az = (depth ? 8 * Math.sin((s - CUE.depth) / 19) * ramp(s, CUE.depth, CUE.depth + 20) : 0) * (1 - tt) - 15 * tt;       // only the depth map turns
  const toDepth = ramp(s, CUE.depth, CUE.depth + 10);                          // short transition, face stays aligned
  const dots = ramp(s, CUE.dots, CUE.dots + 3) * (1 - ramp(s, CUE.depth + 2, CUE.depth + 12));
  const [nx, ny] = headPoint(NOSE, az, zoom), [cx, cy] = headPoint(CHEEK, az, zoom);
  const corner = (x: number, y: number, dx: number, dy: number) => `M ${x + dx * 50} ${y} H ${x} V ${y + dy * 50}`;
  return (
    <AbsoluteFill>
      <Head3D az={az} zoom={zoom} irMix={1} depthMix={0.42 * toDepth} dotO={dots} />
      {/* capture: a short flash and frame brackets, then the frame is held */}
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: 0.25 * ramp(s, CUE.capture, CUE.capture + 1) * (1 - ramp(s, CUE.capture + 1, CUE.capture + 6)) }} />
      {captured && !depth && <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }} stroke="#fff" strokeWidth={4} fill="none">
        <path d={corner(90, 470, 1, 1)} /><path d={corner(930, 470, -1, 1)} /><path d={corner(90, 1420, 1, -1)} /><path d={corner(930, 1420, -1, -1)} />
      </svg>}
      {!captured && <Label text="DOT PROJECTOR · PATTERN ON HIS FACE" x={505} y={1470} o={ramp(s, CUE.dots, CUE.dots + 4)} size={26} align="center" color={C.label} />}
      {captured && !depth && <Label text="INFRARED CAMERA VIEW" x={505} y={1470} o={1} size={30} align="center" color={C.label} />}
      {depth && <Label text="DEPTH MAP" x={505} y={452} o={1} size={30} align="center" color={C.label} />}
      {/* depth mesh: points pinned to his face, joined by lines; a bigger, brighter point is closer to the phone */}
      {depth && (() => {
        const L = (mesh.pts as number[][]).map((q) => [...headPoint({ x: q[0], y: q[1], d: q[2] }, az, zoom), q[2]]);
        const E = mesh.edges as number[][], P = mesh.pts as number[][], t0 = CUE.depth + 2, SPAN = 46;
        // the mesh forms live: it spreads outward from the nose, point by point and line by line (about 1.5 s)
        const far = Math.max(...P.map((q) => Math.hypot(q[0] - front.nose[0], q[1] - front.nose[1])));
        const when = (k: number) => t0 + (Math.hypot(P[k][0] - front.nose[0], P[k][1] - front.nose[1]) / far) * SPAN;
        return (
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
            {E.map(([a0, b0], i) => {
              const [a, b] = when(a0) <= when(b0) ? [a0, b0] : [b0, a0];           // grow from the point that appears first
              const g = ramp(s, when(a) + 2, when(b) + 4);
              if (g <= 0) return null;
              const u = ((s / 22) + i * 0.37) % 1;                                   // a pulse keeps travelling along the line
              return (
                <g key={i}>
                  <line x1={L[a][0]} y1={L[a][1]} x2={L[a][0] + (L[b][0] - L[a][0]) * g} y2={L[a][1] + (L[b][1] - L[a][1]) * g} stroke={MESH} strokeWidth={2.4} opacity={0.8} />
                  {g >= 1 && i % 3 === 0 && <circle cx={L[a][0] + (L[b][0] - L[a][0]) * u} cy={L[a][1] + (L[b][1] - L[a][1]) * u} r={3.2} fill="#fff" opacity={0.9 * Math.sin(Math.PI * u)} />}
                </g>
              );
            })}
            {L.map(([x, y, d], i) => { const k = ramp(s, when(i), when(i) + 4); return k > 0 ? <circle key={i} cx={x} cy={y} r={(5 + 9 * d) * k * (1 + 0.9 * (1 - ramp(s, when(i), when(i) + 9))) * (1 + 0.1 * Math.sin(s / 6 + i))} fill={MESH} opacity={0.55 + 0.45 * d} /> : null; })}
          </svg>
        );
      })()}
      {/* read-outs, as in the reference: depth mapped so far + a per-point depth strip */}
      {depth && (() => {
        const pct = Math.round(100 * ramp(s, CUE.depth + 4, CUE.depth + 70)), o = ramp(s, CUE.depth + 4, CUE.depth + 8), R = 74, C2 = 2 * Math.PI * R;
        const bars = (mesh.pts as number[][]).filter((_, i) => i % 3 === 0).map((q) => q[2]);
        return (
          <AbsoluteFill style={{ opacity: o }}>
            <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
              <circle cx={190} cy={1590} r={R} fill="rgba(8,10,16,.55)" stroke={MESH} strokeOpacity={0.25} strokeWidth={4} />
              <circle cx={190} cy={1590} r={R} fill="none" stroke={MESH} strokeWidth={4} strokeDasharray={`${(C2 * pct) / 100} ${C2}`} transform="rotate(-90 190 1590)" />
              {bars.map((d, i) => { const h = (14 + 96 * d) * ramp(s, CUE.depth + 8 + i * 2, CUE.depth + 16 + i * 2); return <rect key={i} x={640 + i * 22} y={1650 - h} width={14} height={h} fill={MESH} opacity={0.5 + 0.5 * d} />; })}
            </svg>
            <div style={{ position: 'absolute', left: 116, top: 1566, width: 148, textAlign: 'center', font: `800 46px/1 ${FONT}`, color: '#fff' }}>{pct}%</div>
            <div style={{ position: 'absolute', left: 286, top: 1572, font: `800 24px/1.25 ${FONT}`, letterSpacing: '0.12em', color: MESH }}>DEPTH<br />MAPPED</div>
            <div style={{ position: 'absolute', left: 640, top: 1664, font: `800 20px/1 ${FONT}`, letterSpacing: '0.12em', color: MESH }}>FAR&nbsp;&nbsp;·&nbsp;&nbsp;NEAR PER POINT</div>
          </AbsoluteFill>
        );
      })()}
      <Mark x={nx} y={ny} text="CLOSER" left o={ramp(s, CUE.nose, CUE.nose + 3)} />
      <Mark x={cx} y={cy} text="FARTHER" left={false} o={ramp(s, CUE.cheek, CUE.cheek + 3)} />
      <div style={{ position: 'absolute', left: 80, top: 1562, opacity: depth ? 0 : 0.5, font: `600 22px/1 ${FONT}`, color: '#b5ada5' }}>Illustration · the real dots are invisible · fewer dots drawn than projected</div>
    </AbsoluteFill>
  );
};
