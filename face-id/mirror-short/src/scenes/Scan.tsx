import { AbsoluteFill, useCurrentFrame } from 'remotion';
import front from '../front.json';
import mesh from '../mesh_front.json';
import { C, FONT, Label, ramp } from '../theme';
import { Head3D, headPoint } from './Head3D';
import { Orbit3D } from './Orbit3D';

// Scene 3 (6–20.4 s, 432 frames). Cuts sit on the voiceover (see script.ts):
//   0–166  side profile, 3D: the iPhone fires the red dots onto his face    "The dot projector shines ..."
// 166–220  hard cut on "captures": frontal red-dot close-up, INFRARED CAMERA VIEW, held
// 220–268  the same dots as a cyan point cloud                              "Your iPhone uses it to measure"
// 268–432  DEPTH MAP: face mesh ("the depth of your face"); CLOSER on "nose" (317), FARTHER on "cheeks" (351)
export const CUE = { front: 147, cyan: 187, depth: 237, nose: 284, cheek: 318, turn: 329, end: 369 };
const MESH = '#dff3ff', SCAN = '#4db8ff';
const pt = (a: number[]) => ({ x: a[0], y: a[1], d: a[2] });
const NOSE = pt(front.nose), CHEEK = pt(front.cheek);

const Mark: React.FC<{ x: number; y: number; text: string; lx: number; ly: number; o: number; pop: number }> = ({ x, y, text, lx, ly, o, pop }) => {
  const w = text.length * 37 + 56;                                   // label width
  return (
    <>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
        <path d={`M ${lx + w / 2} ${ly} L ${x} ${y}`} stroke="#fff" strokeWidth={3} fill="none" />
        <circle cx={x} cy={y} r={17 + 26 * (1 - pop)} fill="none" stroke={C.amber} strokeWidth={4.5} /><circle cx={x} cy={y} r={6} fill="#fff" />
      </svg>
      <div style={{ position: 'absolute', left: lx, top: ly, width: w, boxSizing: 'border-box', textAlign: 'center', opacity: o, padding: '18px 0', borderRadius: 12, background: 'rgba(10,8,7,.82)', border: `3px solid ${C.amber}`, font: `800 46px/1 ${FONT}`, letterSpacing: '0.12em', color: '#fff' }}>{text}</div>
    </>
  );
};

export const Scan: React.FC = () => {
  const s = useCurrentFrame();
  if (s < CUE.front) return <Orbit3D g={s} />;
  if (s >= CUE.cyan && s < CUE.depth) return <Orbit3D g={150} cyan={s - CUE.cyan} />;
  const depth = s >= CUE.depth, zoom = 1.25;
  // the head keeps moving while the depth mesh is on: a slow sway, blending into the final turn
  const tt = ramp(s, CUE.turn, CUE.end, 0, 1, (x) => x * x * (3 - 2 * x));
  const az = (depth ? 10 * Math.sin((s - CUE.depth) / 19) * ramp(s, CUE.depth, CUE.depth + 20) : 0) * (1 - tt) - 10 * tt;
  const toDepth = ramp(s, CUE.depth, CUE.depth + 8);
  const [nx, ny] = headPoint(NOSE, az, zoom), [cx, cy] = headPoint(CHEEK, az, zoom);
  const corner = (x: number, y: number, dx: number, dy: number) => `M ${x + dx * 50} ${y} H ${x} V ${y + dy * 50}`;
  return (
    <AbsoluteFill>
      <Head3D az={az} zoom={zoom} irMix={1} depthMix={0.42 * toDepth} dotO={depth ? 0 : 1} />
      {/* capture: a short flash and frame brackets, then the frame is held */}
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: 0.25 * ramp(s, CUE.front, CUE.front + 1) * (1 - ramp(s, CUE.front + 1, CUE.front + 6)) }} />
      {!depth && <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }} stroke="#fff" strokeWidth={4} fill="none">
        <path d={corner(90, 470, 1, 1)} /><path d={corner(930, 470, -1, 1)} /><path d={corner(90, 1420, 1, -1)} /><path d={corner(930, 1420, -1, -1)} />
      </svg>}
      {!depth && <Label text="INFRARED CAMERA VIEW" x={505} y={1470} o={1} size={30} align="center" color={C.label} />}
      {depth && <Label text="DEPTH MAP" x={505} y={1690} o={1} size={30} align="center" color={C.label} />}
      {/* depth mesh: points pinned to his face, joined by fine lines; a bigger, brighter point is closer to the phone */}
      {depth && (() => {
        const L = (mesh.pts as number[][]).map((q) => [...headPoint({ x: q[0], y: q[1], d: q[2] }, az, zoom), q[2]]);
        const E = mesh.edges as number[][], P = mesh.pts as number[][], t0 = CUE.depth + 2, SPAN = 30;
        // the mesh forms live: it spreads outward from the nose, point by point and line by line (about 1 s)
        const far = Math.max(...P.map((q) => Math.hypot(q[0] - front.nose[0], q[1] - front.nose[1])));
        const when = (k: number) => t0 + (Math.hypot(P[k][0] - front.nose[0], P[k][1] - front.nose[1]) / far) * SPAN;
        const xs = L.map((q) => q[0]), ys = L.map((q) => q[1]), X0 = Math.min(...xs), X1 = Math.max(...xs), Y0 = Math.min(...ys), Y1 = Math.max(...ys);
        // the scan line is slanted (it runs from upper left to lower right) and sweeps across the web from left to right
        const DX = 0.6, DY = 0.8, NX = 0.8, NY = -0.6, MX = (X0 + X1) / 2, MY = (Y0 + Y1) / 2;
        const pr = (x: number, y: number) => (x - MX) * NX + (y - MY) * NY;                // distance across the sweep
        const ext = Math.max(...L.map((q) => Math.abs(pr(q[0], q[1])))) + 40;
        const sweep = s < t0 + SPAN - 6 ? -1 : ((s - (t0 + SPAN - 6)) % 50) / 50, pb = -ext + 2 * ext * sweep;
        const band = (x: number, y: number) => (sweep < 0 ? 0 : Math.max(0, 1 - Math.abs(pr(x, y) - pb + 30) / 80));
        const at = (p: number, t: number) => `${MX + NX * p + DX * t},${MY + NY * p + DY * t}`;
        return (
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
            {E.map(([a0, b0], i) => {
              const [a, b] = when(a0) <= when(b0) ? [a0, b0] : [b0, a0];           // grow from the point that appears first
              const g = ramp(s, when(a) + 2, when(b) + 4);
              if (g <= 0) return null;
              const near = (L[a][2] + L[b][2]) / 2;                                // nearer strands are brighter
              const k = band((L[a][0] + L[b][0]) / 2, (L[a][1] + L[b][1]) / 2);                             // inside the green scan band
              return <line key={i} x1={L[a][0]} y1={L[a][1]} x2={L[a][0] + (L[b][0] - L[a][0]) * g} y2={L[a][1] + (L[b][1] - L[a][1]) * g} stroke={k > 0.02 ? SCAN : MESH} strokeWidth={1.1 + 1.5 * k} opacity={Math.min(1, 0.18 + 0.6 * near + 0.7 * k)} />;
            })}
            {L.map(([x, y, d], i) => { const k = ramp(s, when(i), when(i) + 4); return k > 0 ? <circle key={i} cx={x} cy={y} r={(1.4 + 2.6 * d) * k * (1 + 1.2 * (1 - ramp(s, when(i), when(i) + 9)))} fill={band(x, y) > 0.3 ? SCAN : '#fff'} opacity={0.35 + 0.65 * d} /> : null; })}
            {/* the scan: a green band sweeps the whole web from left to right, again and again */}
            <g opacity={ramp(s, t0 + SPAN - 6, t0 + SPAN)}>
              <g clipPath="url(#scan-clip)">
                <polygon points={`${at(pb, -1200)} ${at(pb, 1200)} ${at(pb - 45, 1200)} ${at(pb - 45, -1200)}`} fill={SCAN} opacity={0.16} />
                <polygon points={`${at(pb, -1200)} ${at(pb, 1200)} ${at(pb - 110, 1200)} ${at(pb - 110, -1200)}`} fill={SCAN} opacity={0.08} />
                <polyline points={`${at(pb, -1200)} ${at(pb, 1200)}`} stroke={SCAN} strokeWidth={3.5} />
              </g>
            </g>
            {/* the scan never leaves the web: it is clipped to the web's own triangles, so it follows the face as it moves */}
            <defs><clipPath id="scan-clip">{(mesh.tris as number[][]).map(([a, b, c], i) => <polygon key={i} points={`${L[a][0]},${L[a][1]} ${L[b][0]},${L[b][1]} ${L[c][0]},${L[c][1]}`} />)}</clipPath></defs>
          </svg>
        );
      })()}
      {/* the two callouts: both stay inside the frame, below the captions, and hold to the end of the scene */}
      <Mark x={nx} y={ny} text="CLOSER" lx={90} ly={1250} o={ramp(s, CUE.nose, CUE.nose + 3)} pop={ramp(s, CUE.nose, CUE.nose + 8)} />
      <Mark x={cx} y={cy} text="FARTHER" lx={640} ly={1250} o={ramp(s, CUE.cheek, CUE.cheek + 3)} pop={ramp(s, CUE.cheek, CUE.cheek + 8)} />
      <div style={{ position: 'absolute', left: 80, top: 1562, opacity: depth ? 0 : 0.5, font: `600 22px/1 ${FONT}`, color: '#b5ada5' }}>Illustration · the real dots are invisible · fewer dots drawn than projected</div>
    </AbsoluteFill>
  );
};
