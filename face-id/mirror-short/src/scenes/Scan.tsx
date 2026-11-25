import { AbsoluteFill, useCurrentFrame } from 'remotion';
import front from '../front.json';
import mesh from '../mesh_front.json';
import { C, FONT, Label, ramp } from '../theme';
import { Head3D, headPoint } from './Head3D';
import { HeadApi, Orbit3D } from './Orbit3D';
import { Map3D } from './Map3D';
import { HalfPhone, PhotoFlat } from './PhotoFlat';

// The scan is two sequences, with the mirror scene between them (cuts sit on the voiceover, see script.ts):
// ScanA (9–15.95 s)   0–164  side profile, 3D: the iPhone fires the red dots onto his face  "This tiny projector ..."
//                   164–209  hard cut on "picks up": frontal red-dot close-up, INFRARED CAMERA VIEW, held
// ScanB (20.2–26.1 s)  0– 71  back on the frontal red-dot face: CLOSER on "nose" (15), FARTHER on "cheeks" (58)
//                     71–103  the same dots as a cyan point cloud                 "The phone uses"
//                    103–177  DEPTH MAP: the web forms and is scanned; both labels stay  "that pattern to map the shape of my face"
export const FZ = 1.15;      // framing of the frontal face; the mirror view and the cyan point cloud are lined up with it
export const CUE_A = { front: 69, cam: 36, end: 150 };   // front: the switch starts (what you see); cam: frames later, what the camera sees   // front: the switch starts (what you see); cam: frames later, what the camera sees   // front: the switch starts (what you see); cam: frames later, what the camera sees   // front: the switch starts (what you see); cam: frames later, what the camera sees   // front: the switch starts (what you see); cam: frames later, what the camera sees   // front: the switch starts (what you see); cam: frames later, what the camera sees   // front: the switch starts (what you see); cam: frames later, what the camera sees
// ScanB now: 0–face a flat wall with the neat dot grid · face: the same grid on his face · bend: the grid bends with his
// face (nose one way, cheeks the other), NOSE on "nose", CHEEKS on "cheeks" · cyan point cloud on "The phone" · depth map
// face: -20 = the flat-wall shot is not shown; the scene opens on the 3D dotted head
export const CUE_B = { face: -20, bend: 68, nose: 72, cheek: 127, cyan: 154, depth: 172, photo: 222, end: 314 };
// depth colour: far = blue, through cyan and yellow, to near = orange
const HEAT = [[59, 91, 219], [79, 195, 247], [255, 209, 102], [255, 122, 61]];
const heat = (d: number) => { const t = Math.min(0.999, Math.max(0, (d - 0.2) / 0.62)) * 3, i = Math.floor(t), f = t - i, a = HEAT[i], b = HEAT[i + 1]; return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`; };
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
        <circle cx={x} cy={y} r={17 + 26 * (1 - pop)} fill="none" stroke="#fff" strokeWidth={4.5} /><circle cx={x} cy={y} r={6} fill="#fff" />
      </svg>
      <div style={{ position: 'absolute', left: lx, top: ly, width: w, boxSizing: 'border-box', textAlign: 'center', opacity: o, padding: '18px 0', borderRadius: 12, background: 'rgba(10,8,7,.82)', border: '3px solid #fff', font: `800 46px/1 ${FONT}`, letterSpacing: '0.12em', color: '#fff' }}>{text}</div>
    </>
  );
};

// Frontal view of his face. depth0: frame the depth web starts (null = stays the infrared red-dot view);
// flash: frame of the capture flash (null = none); nose / cheek: frames the two labels appear (null = no labels).
// depth of his face at a point of the source image (from the profile rows of mesh_front.json), and whether it is skin
const PR = mesh.prof as { x0: number; dx: number; y0: number; dy: number; rows: number[][] };
const depthAt = (x: number, y: number) => { const r = PR.rows[Math.round((y - PR.y0) / PR.dy)]; return r ? r[Math.round((x - PR.x0) / PR.dx)] ?? 0 : 0; };
const SKIN = new Set((front.dots as number[][]).map((d) => `${Math.round(d[0] / 14)},${Math.round(d[1] / 14)}`));
// the projector's pattern as a regular grid (source px). On a flat wall it stays a neat grid; on his face each dot is
// shifted sideways by how near that bit of the face is, so the grid bends: the nose one way, the cheeks the other.
const GRID: number[][] = [];
for (let y = 392; y <= 962; y += 13) for (let x = 164; x <= 606; x += 13) GRID.push([x, y, depthAt(x, y), SKIN.has(`${Math.round(x / 14)},${Math.round(y / 14)}`) ? 1 : 0]);
const BEND = 62, FLAT = 0.45;
const FaceView: React.FC<{ s: number; depth0: number | null; flash: number | null; nose: number | null; cheek: number | null; end: number; grid?: { face: number; bend: number; out: number }; mapAt?: number }> = ({ s, depth0, flash, nose, cheek, end, grid, mapAt }) => {
  const D0 = depth0 ?? 1e9, FL = flash ?? -1e9, NO = nose ?? 1e9, CH = cheek ?? 1e9;
  const depth = s >= D0, zoom = FZ;
  // the head keeps moving while the depth mesh is on: a slow sway, blending into the final turn
  // the head faces us (aligned with the shots before it) while the web forms, then makes one small three-quarter turn
  // and holds, so the nose is seen sitting forward of the cheek
  // then the face drops away and the web is left on its own as a 3D map, turned to a three-quarter view (it keeps drifting)
  const M0 = mapAt ?? D0 + 28;                                          // when the web leaves his face to become the 3D map
  const cm = depth ? ramp(s, M0, M0 + 14) : 0;                       // 0 = web on his face, 1 = the 3D map on its own, coloured by depth
  const az = depth ? -34 * ramp(s, M0, M0 + 24, 0, 1, (x) => x * x * (3 - 2 * x)) - 6 * ramp(s, M0 + 24, M0 + 82) : 0;
  const toDepth = ramp(s, D0, D0 + 8);
  const [nx, ny] = headPoint(NOSE, az, zoom), [cx, cy] = headPoint(CHEEK, az, zoom);
  const corner = (x: number, y: number, dx: number, dy: number) => `M ${x + dx * 50} ${y} H ${x} V ${y + dy * 50}`;
  return (
    <AbsoluteFill>
      <Head3D az={az} zoom={zoom} irMix={1} depthMix={0.42 * toDepth} dotO={depth || grid ? 0 : 1} />
      {depth && <AbsoluteFill style={{ background: 'radial-gradient(80% 50% at 50% 46%, #1c1740 0%, #0d0b1c 60%, #08070f 100%)', opacity: 0.96 * cm }} />}
      {/* capture: a short flash and frame brackets, then the frame is held */}
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: 0.25 * ramp(s, FL, FL + 1) * (1 - ramp(s, FL + 1, FL + 6)) }} />
      {!depth && !grid && <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }} stroke="#fff" strokeWidth={4} fill="none">
        <path d={corner(90, 470, 1, 1)} /><path d={corner(930, 470, -1, 1)} /><path d={corner(90, 1420, 1, -1)} /><path d={corner(930, 1420, -1, -1)} />
      </svg>}
      {!depth && !grid && <Label text="INFRARED CAMERA VIEW" x={505} y={1470} o={1} size={30} align="center" color={C.label} />}
      {grid && s < grid.out + 8 && (() => {
        // wall: 1 while the flat wall is shown on its own, 0 once the face has faded in
        const wall = 1 - ramp(s, grid.face - 8, grid.face + 8), b = ramp(s, grid.bend, grid.bend + 16, 0, 1, (x) => x * x * (3 - 2 * x)), o = 1 - ramp(s, grid.out, grid.out + 6);
        const mirX = 2 * front.nose[0] - front.cheek[0];
        // the wall: a small dark panel on a plain background (no face behind it); its dots arrive one by one, row by row
        const COLS = 15, ROWS = 19, GAP = 30, PW = COLS * GAP + 26, PH = ROWS * GAP + 26, PX = 505 - PW / 2, PY = 520, PHX = 505, PHY = 1330, N = COLS * ROWS, T1 = grid.face - 22;
        return (
          <>
            <AbsoluteFill style={{ backgroundColor: '#08080b', opacity: wall }} />
            <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: wall }}>
              {/* the phone below throws its light up onto the wall */}
              <polygon points={`${PHX},${PHY - 6} ${PX + 6},${PY + PH} ${PX + PW - 6},${PY + PH} ${PHX + 24},${PHY - 6}`} fill={C.ir} opacity={(0.16 + 0.05 * Math.sin(s / 3)) * ramp(s, 2, 8)} />
              <rect x={PX} y={PY} width={PW} height={PH} rx={26} fill="#161d3a" stroke="#6f86ff" strokeWidth={3} />
              {Array.from({ length: N }, (_, i) => { const t0 = 4 + (i / N) * (T1 - 4), k = ramp(s, t0, t0 + 4); if (k <= 0) return null;
                return <circle key={i} cx={PX + 28 + (i % COLS) * GAP} cy={PY + 28 + Math.floor(i / COLS) * GAP} r={5.2 * k * (1 + 1.3 * (1 - ramp(s, t0, t0 + 7)))} fill={C.ir} opacity={0.95} />; })}
            </svg>
            <Label text="FLAT WALL: A NEAT PATTERN" x={505} y={PY - 78} o={wall * ramp(s, 2, 8)} size={30} align="center" color={C.label} />
            <HalfPhone top={PHY} cx={PHX + 13 * 1.5} o={wall} />
            <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: wall * ramp(s, 2, 8) }}><circle cx={PHX + 12} cy={PHY - 6} r={9 + 2 * Math.sin(s / 2)} fill={C.ir} /><circle cx={PHX + 12} cy={PHY - 6} r={3.5} fill="#fff" /></svg>
          </>
        );
      })()}
      {false && grid && s >= grid.face && s < grid.out && <Label text="ON A FACE: THE PATTERN BENDS" x={505} y={1470} o={ramp(s, grid.face + 2, grid.face + 10)} size={30} align="center" color={C.label} />}
      {depth && <Label text="DEPTH MAP" x={505} y={1690} o={1 - cm} size={30} align="center" color={C.label} />}
      {depth && <div style={{ position: 'absolute', left: 0, right: 0, top: 1500, opacity: cm, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, font: `800 30px/1 ${FONT}`, letterSpacing: '0.14em', color: '#e9e2ff' }}>
        FAR<div style={{ width: 520, height: 16, borderRadius: 8, background: 'linear-gradient(90deg, rgb(59,91,219), rgb(79,195,247), rgb(255,209,102), rgb(255,122,61))' }} />NEAR
      </div>}
      {depth && <Label text="3D MAP OF HIS FACE" x={505} y={1580} o={cm} size={28} align="center" color={C.label} />}
      {/* depth mesh: points pinned to his face, joined by fine lines; a bigger, brighter point is closer to the phone */}
      {depth && (() => {
        // relief: every point of the web is lifted by its depth (nearer = higher), so the lines bend over the nose,
        // brow, lips and chin and the web reads as a curved surface even when the head faces us
        const rel = (q: number[]) => { const [x, y] = headPoint({ x: q[0], y: q[1], d: q[2] }, az, zoom); return [x + (x - nx) * (q[2] - 0.45) * 0.1 * (1 - cm), y - (q[2] - 0.45) * 62 * (1 - cm), q[2]]; };
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
              return n > 1 ? <path key={i} d={d} fill="none" stroke={MESH} strokeWidth={1.5} strokeLinejoin="round" opacity={(0.3 + 0.55 * (near / n)) * (1 - cm)} /> : null;
            })}
            {/* the 3D map: the same grid, each piece coloured by how near it is (blue = far, orange = near) */}
            {cm > 0 && (mesh.lines as number[][][]).map((ln, i) => Array.from({ length: Math.ceil((ln.length - 1) / 5) }, (_, c) => {
              const seg = ln.slice(c * 5, c * 5 + 6); if (seg.length < 2) return null;
              return <polyline key={`${i}-${c}`} points={seg.map((q) => { const [x, y] = rel(q); return `${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ')} fill="none" stroke={heat(seg[Math.floor(seg.length / 2)][2])} strokeWidth={2.2} strokeLinecap="round" opacity={cm} />;
            }))}
            {L.map(([x, y, d], i) => { const k = ramp(s, when(i), when(i) + 4); if (k <= 0) return null; const r = (1.8 + 2.4 * d) * k * (1 + 1.2 * (1 - ramp(s, when(i), when(i) + 9))), c = cm > 0.5 ? heat(d) : band(x, y) > 0.3 ? SCAN : '#fff';
              // a glowing node at every crossing of the grid
              return <g key={i}><circle cx={x} cy={y} r={r * 2.6} fill={c} opacity={0.13 + 0.12 * d} /><circle cx={x} cy={y} r={r} fill={c} opacity={0.55 + 0.45 * d} /></g>; })}
            {/* inside the wave the grid's own lines are redrawn in blue */}
            <g opacity={ramp(s, t0 + SPAN - 6, t0 + SPAN) * (1 - cm)}>
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
      <Mark x={nx} y={ny} text={grid && !depth ? 'NOSE' : 'CLOSER'} lx={120} ly={1250} o={ramp(s, NO, NO + 3) * (1 - cm)} pop={ramp(s, NO, NO + 8)} />
      <Mark x={cx} y={cy} text={grid && !depth ? 'CHEEKS' : 'FARTHER'} lx={640} ly={1250} o={ramp(s, CH, CH + 3) * (1 - cm)} pop={ramp(s, CH, CH + 8)} />
      <div style={{ position: 'absolute', left: 80, top: 1562, opacity: depth || grid ? 0 : 0.5, font: `600 22px/1 ${FONT}`, color: '#b5ada5' }}>Illustration · the real dots are invisible · fewer dots drawn than projected</div>
    </AbsoluteFill>
  );
};

// "And the infrared camera picks up that pattern": the same face, side by side. Left: what you see (the dots are
// invisible). Right: what the infrared camera sees (the dot pattern on his face).
const Half: React.FC<{ left: number; ir: boolean }> = ({ left, ir }) => (
  <div style={{ position: 'absolute', left, top: 0, width: 540, height: 1920, overflow: 'hidden', background: ir ? '#0b0a0d' : '#120d0a' }}>
    <div style={{ position: 'absolute', left: -296, top: 0, width: 1080, height: 1920 }}>
      <Head3D az={0} zoom={FZ * 0.74} irMix={ir ? 1 : 0} depthMix={0} dotO={ir ? 1 : 0} />
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

// "And the infrared camera picks up that pattern": the shot does not change. On the same 3D head, from the same angle, a
// line wipes across and switches what is shown: first what you see (no dots: they are invisible), then what the infrared
// camera sees (the dot pattern on his face).
const SeeBadge: React.FC<{ ir: boolean; o: number }> = ({ ir, o }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 1400, textAlign: 'center', opacity: o }}>
    <span style={{ display: 'inline-block', padding: '18px 26px', borderRadius: 12, background: 'rgba(10,8,7,.85)', border: `3px solid ${ir ? C.ir : '#b9b2a8'}`, font: `800 40px/1 ${FONT}`, letterSpacing: '0.12em', color: '#fff' }}>{ir ? 'WHAT THE CAMERA SEES' : 'WHAT YOU SEE'}</span>
    <div style={{ marginTop: 18, font: `600 32px/1.2 ${FONT}`, color: '#d6cfc7' }}>{ir ? 'the dot pattern, in infrared' : 'nothing: the dots are invisible'}</div>
  </div>
);
// What the camera sees is its own shot, not the side view again: we look out of the phone's infrared camera, straight at
// his face, in grey, with the dot pattern on it. A viewfinder frame, a sweep line and a slow push keep it moving.
const CamView: React.FC<{ c: number }> = ({ c }) => (
  // the front-on dotted head, shown as it is: the red dots turn cyan left to right as the camera reads them, with the
  // "30,000+ DEPTH POINTS" count. A slow push keeps it moving.
  <AbsoluteFill style={{ transformOrigin: '540px 900px', transform: `scale(${1 + 0.07 * ramp(c, 0, 90)})` }}><Orbit3D g={150} cyan={Math.max(0, c - 6)} align /></AbsoluteFill>
);
export const ScanA: React.FC = () => {
  const s = useCurrentFrame(), t = s - CUE_A.front;
  if (t < 0) return <Orbit3D g={s} />;
  const io = (x: number) => x * x * (3 - 2 * x), w1 = ramp(t, 1, 13, 0, 1, io), w2 = ramp(t, CUE_A.cam, CUE_A.cam + 12, 0, 1, io);
  const G = Math.min(s, CUE_A.front + 16);                         // the camera keeps drifting through the switch, so the shot never sits still                       // hold the dots clip on its last pose (later frames of it are an old depth-map look)
  const clip = (w: number) => ({ clipPath: `inset(0 ${(1 - w) * 100}% 0 0)` });
  return (
    <AbsoluteFill>
      {w1 < 1 && <Orbit3D g={G} />}
      {w1 > 0 && w2 < 1 && <AbsoluteFill style={clip(w1)}><Orbit3D g={G} look="eye" /></AbsoluteFill>}
      {w2 > 0 && <AbsoluteFill style={clip(w2)}><CamView c={t - CUE_A.cam} /></AbsoluteFill>}
      {[w1, w2].map((w, k) => w > 0 && w < 1 ? <div key={k} style={{ position: 'absolute', left: 1080 * w - 3, top: 0, width: 6, height: 1920, background: '#fff', boxShadow: '0 0 30px 8px rgba(255,255,255,.55)' }} /> : null)}
      <SeeBadge ir={false} o={ramp(t, 8, 13) * (1 - ramp(t, CUE_A.cam, CUE_A.cam + 5))} />
    </AbsoluteFill>
  );
};

// "Your nose bends them one way, and your cheeks bend them another", on the 3D dotted head. The head turns a little each
// way so the nose is seen standing out; the dots on the nose light up and slide one way, the dots on the cheeks the other.
const Bend3D: React.FC<{ s: number }> = ({ s }) => {
  const B = CUE_B, io = (x: number) => x * x * (3 - 2 * x);
  // never held still: it opens turned away and far back, swings round to face us while the camera pushes in, and keeps a slow sway
  const open = ramp(s, 0, B.nose - 10, 0, 1, (x) => 1 - Math.pow(1 - x, 3)), dist = 2500 - 700 * open - 60 * ramp(s, B.nose, B.cyan);
  const az = -38 * (1 - open) + 3 * Math.sin(s / 8) + 32 * ramp(s, B.nose - 8, B.nose + 22, 0, 1, io) - 64 * ramp(s, B.cheek - 8, B.cheek + 22, 0, 1, io) + 32 * ramp(s, B.cyan - 16, B.cyan - 2, 0, 1, io);
  const overlay = ({ S, head }: HeadApi) => {
    // No recolouring of the pattern. Three straight columns of the dot pattern are picked out in white: on a wall
    // they would be straight lines; on his face the middle one bulges out over the nose and the outer ones follow the cheeks. As the head
    // turns, that bend is plain to see. The nose part lights up on "nose", the cheek parts on "cheeks".
    const { nose, grid } = head, CHX = [nose.x + 86, nose.x - 90];
    const kn = ramp(s, B.nose, B.nose + 10, 0, 1, io), kc = ramp(s, B.cheek, B.cheek + 10, 0, 1, io), draw = ramp(s, B.nose - 30, B.nose - 6, 0, 1, io), fade = 1 - ramp(s, B.cyan - 8, B.cyan);
    // columns, not rows: the head turns left and right, and a line running down the face shows its profile as it turns
    const xs = [...new Set(grid.map((q) => q[0]))], near = (t: number) => xs.reduce((a, x) => (Math.abs(x - t) < Math.abs(a - t) ? x : a), xs[0]);
    const rows = [CHX[1], nose.x, CHX[0]].map((t) => { const x = near(t); return grid.filter((q) => q[3] && q[0] === x).sort((a, b) => b[1] - a[1]); });
    const [nx, ny] = S(nose.x, nose.y, nose.z), pc = CHX.map((hx) => S(hx, nose.y - 4, nose.z - 78)), [cx, cy] = pc[0][0] > pc[1][0] ? pc[0] : pc[1];
    return (
      <>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: fade }}>
          <defs><filter id="bend-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
          <g filter="url(#bend-glow)">
            {rows.map((row, r) => { const shown = row.slice(0, Math.ceil(row.length * draw)); if (shown.length < 2) return null;
              const P = shown.map((q) => ({ p: S(q[0], q[1], q[2] + 2), y: q[1] }));
              return (<g key={r}>
                <polyline points={P.map((q) => q.p.join(',')).join(' ')} fill="none" stroke="#fff" strokeWidth={2.2} strokeLinejoin="round" opacity={0.75} />
                {P.map((q, i) => { const onN = r === 1 && Math.abs(q.y - nose.y + 14) < 46, onC = r !== 1 && Math.abs(q.y - nose.y + 4) < 36, k = onN ? kn : onC ? kc : 0;
                  return <circle key={i} cx={q.p[0]} cy={q.p[1]} r={3.6 + 3.2 * k * (0.75 + 0.25 * Math.sin(s / 3))} fill="#fff" opacity={0.85} />; })}
              </g>); })}
          </g>
        </svg>
        <Label text="ON A FACE: THE PATTERN BENDS" x={505} y={1470} o={ramp(s, B.face + 2, B.face + 10)} size={30} align="center" color={C.label} />
        <Mark x={nx} y={ny} text="NOSE" lx={120} ly={1250} o={ramp(s, B.nose, B.nose + 3)} pop={ramp(s, B.nose, B.nose + 8)} />
        <Mark x={cx} y={cy} text="CHEEKS" lx={640} ly={1250} o={ramp(s, B.cheek, B.cheek + 3)} pop={ramp(s, B.cheek, B.cheek + 8)} />
      </>
    );
  };
  return <Orbit3D g={150} ex={{ view: { az, dist }, tone: 'colour', tint: '#7c7c7c', dotO: 1, bg: '#070606', overlay }} />;
};

export const ScanB: React.FC = () => {
  const s = useCurrentFrame();
  // the cyan point cloud is the same head, lined up with the frontal face; it dissolves in and out so eyes and nose stay put
  if (s >= CUE_B.photo) return <PhotoFlat t={s - CUE_B.photo} />;      // "That's why a photo won't work"
  const o = ramp(s, CUE_B.cyan, CUE_B.cyan + 5) * (1 - ramp(s, CUE_B.depth, CUE_B.depth + 6));
  return (
    <AbsoluteFill>
      {/* web theme from the first frame: the depth web forms on his face and is scanned while the camera pushes in;
          CLOSER lands on "nose", FARTHER on "cheeks"; on "and from those bends" it becomes the turning 3D map */}
      <AbsoluteFill style={{ transformOrigin: '540px 1000px', transform: `scale(${1 + 0.08 * ramp(s, 0, CUE_B.depth)})` }}>
        <FaceView s={s} depth0={0} flash={null} nose={CUE_B.nose} cheek={CUE_B.cheek} end={CUE_B.photo} mapAt={CUE_B.depth} />
      </AbsoluteFill>
      {/* the turning 3D map is the 3D head; everything static above is the photo */}
      {s >= CUE_B.depth + 20 && <AbsoluteFill style={{ opacity: ramp(s, CUE_B.depth + 20, CUE_B.depth + 30) }}><Map3D t={s - CUE_B.depth - 26} /></AbsoluteFill>}
    </AbsoluteFill>
  );
};
