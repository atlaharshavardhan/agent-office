import { AbsoluteFill, useCurrentFrame } from 'remotion';
import front from '../front.json';
import mesh from '../mesh_front.json';
import { C, FONT, Label, ramp } from '../theme';
import { Head3D, headPoint } from './Head3D';
import { Orbit3D } from './Orbit3D';

// The scan is two sequences, with the mirror scene between them (cuts sit on the voiceover, see script.ts):
// ScanA (9–15.95 s)   0–164  side profile, 3D: the iPhone fires the red dots onto his face  "This tiny projector ..."
//                   164–209  hard cut on "picks up": frontal red-dot close-up, INFRARED CAMERA VIEW, held
// ScanB (20.2–26.1 s)  0– 71  back on the frontal red-dot face: CLOSER on "nose" (15), FARTHER on "cheeks" (58)
//                     71–103  the same dots as a cyan point cloud                 "The phone uses"
//                    103–177  DEPTH MAP: the web forms and is scanned; both labels stay  "that pattern to map the shape of my face"
export const CUE_A = { front: 164, end: 209 };
export const CUE_B = { nose: 15, cheek: 58, cyan: 71, depth: 103, end: 177 };
const rnd = (i: number) => { const x = Math.sin((i + 1) * 91.17) * 43758.5453; return x - Math.floor(x); };
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

// Frontal view of his face. depth0: frame the depth web starts (null = stays the infrared red-dot view);
// flash: frame of the capture flash (null = none); nose / cheek: frames the two labels appear (null = no labels).
const FaceView: React.FC<{ s: number; depth0: number | null; flash: number | null; nose: number | null; cheek: number | null; end: number }> = ({ s, depth0, flash, nose, cheek, end }) => {
  const D0 = depth0 ?? 1e9, FL = flash ?? -1e9, NO = nose ?? 1e9, CH = cheek ?? 1e9;
  const depth = s >= D0, zoom = 1.25;
  // the head keeps moving while the depth mesh is on: a slow sway, blending into the final turn
  const tt = ramp(s, (end - 30), end, 0, 1, (x) => x * x * (3 - 2 * x));
  const az = (depth ? 10 * Math.sin((s - D0) / 19) * ramp(s, D0, D0 + 20) : 0) * (1 - tt) - 10 * tt;
  const toDepth = ramp(s, D0, D0 + 8);
  const [nx, ny] = headPoint(NOSE, az, zoom), [cx, cy] = headPoint(CHEEK, az, zoom);
  const corner = (x: number, y: number, dx: number, dy: number) => `M ${x + dx * 50} ${y} H ${x} V ${y + dy * 50}`;
  return (
    <AbsoluteFill>
      <Head3D az={az} zoom={zoom} irMix={1} depthMix={0.42 * toDepth} dotO={depth ? 0 : 1} />
      {/* capture: a short flash and frame brackets, then the frame is held */}
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: 0.25 * ramp(s, FL, FL + 1) * (1 - ramp(s, FL + 1, FL + 6)) }} />
      {!depth && <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }} stroke="#fff" strokeWidth={4} fill="none">
        <path d={corner(90, 470, 1, 1)} /><path d={corner(930, 470, -1, 1)} /><path d={corner(90, 1420, 1, -1)} /><path d={corner(930, 1420, -1, -1)} />
      </svg>}
      {!depth && <Label text="INFRARED CAMERA VIEW" x={505} y={1470} o={1} size={30} align="center" color={C.label} />}
      {depth && <Label text="DEPTH MAP" x={505} y={1690} o={1} size={30} align="center" color={C.label} />}
      {/* depth mesh: points pinned to his face, joined by fine lines; a bigger, brighter point is closer to the phone */}
      {depth && (() => {
        // relief: every point of the web is lifted by its depth (nearer = higher), so the lines bend over the nose,
        // brow, lips and chin and the web reads as a curved surface even when the head faces us
        const rel = (q: number[]) => { const [x, y] = headPoint({ x: q[0], y: q[1], d: q[2] }, az, zoom); return [x + (x - nx) * (q[2] - 0.45) * 0.1, y - (q[2] - 0.45) * 62, q[2]]; };
        const L = (mesh.pts as number[][]).map(rel);
        const E = mesh.edges as number[][], P = mesh.pts as number[][], t0 = D0 + 2, SPAN = 22;
        // the mesh forms live: it spreads outward from the nose, point by point and line by line (about 1 s)
        const far = Math.max(...P.map((q) => Math.hypot(q[0] - front.nose[0], q[1] - front.nose[1])));
        const when = (k: number) => t0 + (Math.hypot(P[k][0] - front.nose[0], P[k][1] - front.nose[1]) / far) * SPAN;
        const xs = L.map((q) => q[0]), ys = L.map((q) => q[1]), X0 = Math.min(...xs), X1 = Math.max(...xs), Y0 = Math.min(...ys), Y1 = Math.max(...ys);
        // the scan is a wave: a wide band of blue, lying across the whole face, that travels diagonally from the upper
        // left of the forehead down over the nose to the lower right of the jaw, so every part of the web is covered
        const CYC = 40, T0 = t0 + SPAN - 6, sweep = s < T0 ? -1 : ((s - T0) % CYC) / CYC;
        const MX = (X0 + X1) / 2, MY = (Y0 + Y1) / 2, DX = 0.6, DY = 0.8, HW = 85;      // (DX, DY): direction of travel
        const along = (x: number, y: number) => (x - MX) * DX + (y - MY) * DY;
        const ext = Math.max(...L.map((q) => Math.abs(along(q[0], q[1])))) + HW, pos = -ext + 2 * ext * sweep;
        const band = (x: number, y: number) => (sweep < 0 ? 0 : Math.max(0, 1 - Math.abs(along(x, y) - pos) / HW));
        const at = (a: number, t: number) => `${MX + DX * a - DY * t},${MY + DY * a + DX * t}`;
        return (
          <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
            {(mesh.lines as number[][][]).map((ln, i) => {
              // each grid line is drawn as a smooth curve, growing outward from the nose
              let d = '', pen = false, near = 0, n = 0;
              for (const q of ln) { if (t0 + (Math.hypot(q[0] - front.nose[0], q[1] - front.nose[1]) / far) * SPAN > s) { pen = false; continue; } const [x, y] = rel(q); d += `${pen ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; pen = true; near += q[2]; n++; }
              return n > 1 ? <path key={i} d={d} fill="none" stroke={MESH} strokeWidth={1.5} strokeLinejoin="round" opacity={0.3 + 0.55 * (near / n)} /> : null;
            })}
            {L.map(([x, y, d], i) => { const k = ramp(s, when(i), when(i) + 4); if (k <= 0) return null; const r = (1.8 + 2.4 * d) * k * (1 + 1.2 * (1 - ramp(s, when(i), when(i) + 9))), c = band(x, y) > 0.3 ? SCAN : '#fff';
              // a glowing node at every crossing of the grid
              return <g key={i}><circle cx={x} cy={y} r={r * 2.6} fill={c} opacity={0.13 + 0.12 * d} /><circle cx={x} cy={y} r={r} fill={c} opacity={0.55 + 0.45 * d} /></g>; })}
            {/* inside the wave the grid's own lines are redrawn in blue */}
            <g opacity={ramp(s, t0 + SPAN - 6, t0 + SPAN)}>
              <g clipPath="url(#band-clip)">
                {(mesh.lines as number[][][]).map((ln, i) => <polyline key={i} points={ln.map((q) => { const [x, y] = rel(q); return `${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ')} fill="none" stroke={SCAN} strokeWidth={3} strokeLinejoin="round" />)}
              </g>
            </g>
            {/* the scan never leaves the web: it is clipped to the web's own triangles, so it follows the face as it moves */}
            <defs><clipPath id="band-clip"><polygon points={`${at(pos - HW * 0.8, -1200)} ${at(pos - HW * 0.8, 1200)} ${at(pos + HW * 0.8, 1200)} ${at(pos + HW * 0.8, -1200)}`} /></clipPath><clipPath id="scan-clip">{(mesh.tris as number[][]).map(([a, b, c], i) => <polygon key={i} points={`${L[a][0]},${L[a][1]} ${L[b][0]},${L[b][1]} ${L[c][0]},${L[c][1]}`} />)}</clipPath></defs>
          </svg>
        );
      })()}
      {/* the two callouts: both stay inside the frame, below the captions, and hold to the end of the scene */}
      <Mark x={nx} y={ny} text="CLOSER" lx={120} ly={1250} o={ramp(s, NO, NO + 3)} pop={ramp(s, NO, NO + 8)} />
      <Mark x={cx} y={cy} text="FARTHER" lx={640} ly={1250} o={ramp(s, CH, CH + 3)} pop={ramp(s, CH, CH + 8)} />
      <div style={{ position: 'absolute', left: 80, top: 1562, opacity: depth ? 0 : 0.5, font: `600 22px/1 ${FONT}`, color: '#b5ada5' }}>Illustration · the real dots are invisible · fewer dots drawn than projected</div>
    </AbsoluteFill>
  );
};

export const ScanA: React.FC = () => {
  const s = useCurrentFrame();
  return s < CUE_A.front ? <Orbit3D g={s} /> : <FaceView s={s} depth0={null} flash={CUE_A.front} nose={null} cheek={null} end={CUE_A.end} />;
};

export const ScanB: React.FC = () => {
  const s = useCurrentFrame();
  if (s >= CUE_B.cyan && s < CUE_B.depth) return <Orbit3D g={150} cyan={s - CUE_B.cyan} />;
  return <FaceView s={s} depth0={CUE_B.depth} flash={null} nose={CUE_B.nose} cheek={CUE_B.cheek} end={CUE_B.end} />;
};
