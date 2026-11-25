import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, FONT, Label, ramp } from '../theme';
import { HeadApi, Orbit3D } from './Orbit3D';
import { PhotoFlat } from './PhotoFlat';

// Every explainer here runs on the same 3D head as the red-dots clip (Orbit3D in explainer mode), so the face never
// changes and the camera can turn round it. Cuts sit on the voiceover (see script.ts):
// ScanA (9–15.95 s)   0–164  side profile: the iPhone fires the red dots onto his face       "This tiny projector ..."
//                   164–209  hard cut on "picks up": side by side, what you see / what the infrared camera sees
// ScanB             0–face   a flat wall with the neat dot grid
//                   face–    the same grid on his face; from `bend` it bends with his face. NOSE on "nose", CHEEKS on "cheeks"
//                   cyan–    the dots as a cyan point cloud                                 "The phone reads"
//                   depth–   depth web forms on his face, then stands alone as a 3D map, coloured far to near, and turns
//                   photo–   "That's why a photo won't work" (PhotoFlat)
export const CUE_A = { front: 164, end: 209 };
export const CUE_B = { face: 79, bend: 86, nose: 90, cheek: 146, cyan: 188, depth: 218, photo: 288, end: 421 };
const MESH = '#dff3ff', SCAN = '#4db8ff', DIST = 2250;
const io = (x: number) => x * x * (3 - 2 * x);
// depth colour: far = blue, through cyan and yellow, to near = orange
const HEAT = [[59, 91, 219], [79, 195, 247], [255, 209, 102], [255, 122, 61]];
const heat = (d: number) => { const t = Math.min(0.999, Math.max(0, d)) * 3, i = Math.floor(t), f = t - i, a = HEAT[i], b = HEAT[i + 1]; return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`; };

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

// "And the infrared camera picks up that pattern": the same head, side by side. Left: what you see (the dots are
// invisible). Right: what the infrared camera sees (the dot pattern on his face).
const Half: React.FC<{ left: number; ir: boolean }> = ({ left, ir }) => (
  <div style={{ position: 'absolute', left, top: 0, width: 540, height: 1920, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: -270, top: 0, width: 1080, height: 1920 }}>
      <Orbit3D g={150} ex={{ view: { az: ir ? 6 : -6, dist: 2700 }, tone: ir ? 'ir' : 'colour', dotO: ir ? 1 : 0, bg: ir ? '#0b0a0d' : '#1a120c' }} />
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1330, textAlign: 'center' }}>
      <span style={{ display: 'inline-block', padding: '14px 18px', borderRadius: 10, background: 'rgba(10,8,7,.8)', border: `2px solid ${ir ? C.ir : '#8d877f'}`, font: `800 27px/1 ${FONT}`, letterSpacing: '0.12em', color: '#fff' }}>{ir ? 'WHAT THE CAMERA SEES' : 'WHAT YOU SEE'}</span>
      <div style={{ marginTop: 16, font: `600 26px/1.2 ${FONT}`, color: '#c9c2bb' }}>{ir ? 'the dot pattern, in infrared' : 'nothing: the dots are invisible'}</div>
    </div>
  </div>
);
const Split: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#000' }}>
    <Half left={0} ir={false} /><Half left={540} ir />
    <div style={{ position: 'absolute', left: 538, top: 0, width: 4, height: 1920, background: '#f1eeff' }} />
  </AbsoluteFill>
);

export const ScanA: React.FC = () => {
  const s = useCurrentFrame();
  return s < CUE_A.front ? <Orbit3D g={s} /> : <Split />;
};

export const ScanB: React.FC = () => {
  const s = useCurrentFrame(), B = CUE_B;
  if (s >= B.photo) return <PhotoFlat t={s - B.photo} />;      // "That's why a photo won't work"
  const depth = s >= B.depth, D0 = B.depth;
  const wall = 1 - ramp(s, B.face - 4, B.face + 6), bend = ramp(s, B.bend, B.bend + 16, 0, 1, io);
  const gridO = 1 - ramp(s, B.cyan, B.cyan + 6);                                   // the red grid hands over to the cyan cloud
  const cloud = ramp(s, B.cyan, B.cyan + 6) * (1 - ramp(s, D0, D0 + 8));
  const cm = depth ? ramp(s, D0 + 26, D0 + 40) : 0;                                // 0 = web on his face, 1 = the 3D map on its own
  // the camera: a slow drift while the grid bends (so the bend reads in 3D), back to the front for the web, then a turn for the map
  const az = depth ? -26 * ramp(s, D0 + 26, D0 + 52, 0, 1, io) - 6 * ramp(s, D0 + 52, D0 + 100)
    : 14 * ramp(s, B.bend + 6, B.cheek + 20, 0, 1, io) * (1 - ramp(s, B.cyan - 14, B.cyan, 0, 1, io));
  const overlay = ({ S, head }: HeadApi) => {
    const { nose, cheek, centre, grid, lattice } = head, [FCX, , ZF] = centre, ZR = 150;
    const [nx, ny] = S(nose.x, nose.y, nose.z), mirX = 2 * FCX - cheek.x, [cx, cy] = cm > 0.5 ? S(mirX, cheek.y, cheek.z) : S(cheek.x, cheek.y, cheek.z);   // on the turned map the cheek facing us is marked
    const dn = (z: number) => Math.min(1, Math.max(0, (z - (nose.z - ZR)) / ZR));    // 0 = far, 1 = as near as the nose
    // ---- the wall and the dot grid ----
    const gx = grid.map((q) => q[0]), gy = grid.map((q) => q[1]);
    const W = [[Math.min(...gx) - 14, Math.max(...gy) + 14], [Math.max(...gx) + 14, Math.max(...gy) + 14], [Math.max(...gx) + 14, Math.min(...gy) - 14], [Math.min(...gx) - 14, Math.min(...gy) - 14]].map(([x, y]) => S(x, y, ZF).join(',')).join(' ');
    // ---- the web ----
    const L = lattice.pts.map(([x, y, z]) => [...S(x, y, z), dn(z), x, y]);
    const t0 = D0 + 2, SPAN = 22, far = Math.max(...lattice.pts.map((q) => Math.hypot(q[0] - nose.x, q[1] - nose.y)));
    const when = (k: number) => t0 + (Math.hypot(lattice.pts[k][0] - nose.x, lattice.pts[k][1] - nose.y) / far) * SPAN;
    // the scan wave: a wide band lying across his face that travels diagonally from the forehead to the jaw
    const T0 = t0 + SPAN - 6, sweep = s < T0 ? -1 : ((s - T0) % 40) / 40, along = (x: number, y: number) => (x - FCX) * 0.6 - (y - centre[1]) * 0.8;
    const pos = -330 + 660 * sweep, band = (x: number, y: number) => (sweep < 0 ? 0 : Math.max(0, 1 - Math.abs(along(x, y) - pos) / 62)) * (1 - cm);
    return (
      <>
        {depth && <AbsoluteFill style={{ background: 'radial-gradient(80% 50% at 50% 46%, #1c1740 0%, #0d0b1c 60%, #08070f 100%)', opacity: 0.97 * cm }} />}
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          {!depth && gridO > 0 && <g opacity={gridO}>
            <polygon points={W} fill="#cfcbe6" stroke="#f1eeff" strokeWidth={3} strokeLinejoin="round" opacity={wall} />
            {grid.map(([x, y, z, on], i) => {
              const vis = on ? 1 : wall; if (vis <= 0.01) return null;
              // on the wall every dot sits on the flat plane; on his face it lands on the skin and is shifted sideways by how near that skin is
              const [px, py] = on ? S(x + bend * 0.42 * (z - ZF), y, ZF + (z - ZF) * (1 - wall)) : S(x, y, ZF);
              const nN = on && Math.hypot(x - nose.x, y - nose.y) < 40 && s >= B.nose, nC = on && (Math.hypot(x - cheek.x, y - cheek.y) < 36 || Math.hypot(x - mirX, y - cheek.y) < 36) && s >= B.cheek;
              return <circle key={i} cx={px} cy={py} r={nN || nC ? 6.4 : 4.7} fill={nN ? C.amber : nC ? '#ffe9a8' : C.ir} opacity={vis * (0.92 - 0.25 * wall)} />;
            })}
          </g>}
          {depth && lattice.runs.map((run, i) => {
            // each line of the web grows outward from his nose; nearer strands are brighter. As the 3D map it is coloured by depth.
            const segs: React.ReactNode[] = [];
            for (let k = 0; k + 1 < run.length; k++) { const a = run[k], b = run[k + 1], g = ramp(s, Math.min(when(a), when(b)) + 2, Math.max(when(a), when(b)) + 4); if (g <= 0) continue;
              const near = (L[a][2] + L[b][2]) / 2, bd = band((L[a][3] + L[b][3]) / 2, (L[a][4] + L[b][4]) / 2);
              segs.push(<line key={k} x1={L[a][0]} y1={L[a][1]} x2={L[a][0] + (L[b][0] - L[a][0]) * g} y2={L[a][1] + (L[b][1] - L[a][1]) * g} stroke={cm > 0.5 ? heat(near) : bd > 0.05 ? SCAN : MESH} strokeWidth={cm > 0.5 ? 2.4 : 1.6 + 1.4 * bd} strokeLinecap="round" opacity={cm > 0.5 ? 1 : Math.min(1, 0.32 + 0.5 * near + 0.6 * bd)} />); }
            return <g key={i}>{segs}</g>;
          })}
          {depth && L.map(([x, y, d, wx, wy], i) => { const k = ramp(s, when(i), when(i) + 4); if (k <= 0) return null; const r = (1.8 + 2.2 * d) * k * (1 + 1.2 * (1 - ramp(s, when(i), when(i) + 9))), c = cm > 0.5 ? heat(d) : band(wx, wy) > 0.3 ? SCAN : '#fff';
            return <g key={i}><circle cx={x} cy={y} r={r * 2.5} fill={c} opacity={0.12 + 0.12 * d} /><circle cx={x} cy={y} r={r} fill={c} opacity={0.55 + 0.45 * d} /></g>; })}
        </svg>
        {s < B.face && <Label text="FLAT WALL: A NEAT PATTERN" x={505} y={1470} o={1 - ramp(s, B.face - 5, B.face)} size={30} align="center" color={C.label} />}
        {s >= B.face && s < B.cyan && <Label text="ON A FACE: THE PATTERN BENDS" x={505} y={1470} o={ramp(s, B.face + 2, B.face + 7)} size={30} align="center" color={C.label} />}
        {depth && <Label text="DEPTH MAP" x={505} y={1690} o={1 - cm} size={30} align="center" color={C.label} />}
        {depth && <div style={{ position: 'absolute', left: 0, right: 0, top: 1500, opacity: cm, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, font: `800 30px/1 ${FONT}`, letterSpacing: '0.14em', color: '#e9e2ff' }}>
          FAR<div style={{ width: 520, height: 16, borderRadius: 8, background: 'linear-gradient(90deg, rgb(59,91,219), rgb(79,195,247), rgb(255,209,102), rgb(255,122,61))' }} />NEAR
        </div>}
        {depth && <Label text="3D MAP OF HIS FACE" x={505} y={1580} o={cm} size={28} align="center" color={C.label} />}
        {(s < B.cyan + 6 || depth) && <>
          <Mark x={nx} y={ny} text={depth ? 'CLOSER' : 'NOSE'} lx={120} ly={1250} o={(depth ? ramp(s, D0 + 6, D0 + 10) : ramp(s, B.nose, B.nose + 3) * gridO)} pop={ramp(s, depth ? D0 + 6 : B.nose, (depth ? D0 + 6 : B.nose) + 8)} />
          <Mark x={cx} y={cy} text={depth ? 'FARTHER' : 'CHEEKS'} lx={640} ly={1250} o={(depth ? ramp(s, D0 + 12, D0 + 16) : ramp(s, B.cheek, B.cheek + 3) * gridO)} pop={ramp(s, depth ? D0 + 12 : B.cheek, (depth ? D0 + 12 : B.cheek) + 8)} />
        </>}
      </>
    );
  };
  return (
    <Orbit3D g={150} cyan={s >= B.cyan ? s - B.cyan : undefined}
      ex={{ view: { az, dist: DIST }, tone: 'ir', depth: depth ? 0.55 * ramp(s, D0, D0 + 8) : 0, dotO: cloud, bg: '#08080b', overlay }} />
  );
};
