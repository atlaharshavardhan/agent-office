import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Exploded Teardown (Lemo-Opuscar style 46), applied to an ILLUSTRATIVE cordless stick vacuum: there are no public CAD
// files for one, so per the style's rule this is a model built from the general layout of a cyclonic handheld unit,
// it says so on screen, and no part carries a number.
//
// One continuous camera: the closed unit turns on the seamless -> the layers lift top first (cyclones in a wave)
// while it orbits -> every part is named in a column on the free side -> a push between the layers to the motor,
// whose fan performs its one real motion -> the stack closes bottom first and the camera pulls back.

export const FPS = 24;
export const DUR = 16 * FPS;
const S = (s: number) => Math.round(s * FPS);

const INK = '#f1efe9', ACCENT = '#ff6b3d', MONO = "'DejaVu Sans Mono', 'JetBrains Mono', monospace", SANS = "Inter, 'Noto Sans', sans-serif";
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ramp = (f: number, a: number, b: number) => clamp((f - a) / (b - a));
const cubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);   // ease-in-out cubed
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---- the stack (bottom to top). closed / open centre heights, model units ~ millimetres ----
type Layer = { id: string; closed: number; open: number; r: number; label: [string, string]; at: [number, number] };
const LAYERS: Layer[] = [
  { id: 'door', closed: 3, open: -50, r: 58, label: ['BIN DOOR', 'opens to empty the bin'], at: [-58, 0] },
  { id: 'bin', closed: 66, open: 66, r: 56, label: ['CLEAR BIN', 'where the dust ends up'], at: [-56, 20] },
  { id: 'shroud', closed: 72, open: 230, r: 40, label: ['MESH SHROUD', 'stops hair and fluff first'], at: [-40, 10] },
  { id: 'cyclones', closed: 148, open: 340, r: 50, label: ['CYCLONE PACK', 'spins air, flings dust out'], at: [-50, 0] },
  { id: 'motor', closed: 199, open: 445, r: 34, label: ['MOTOR AND FAN', 'pulls the air through'], at: [-34, 0] },
  { id: 'filter', closed: 239, open: 535, r: 46, label: ['POST-MOTOR FILTER', 'pleated, traps fine dust'], at: [-46, 0] },
  { id: 'cap', closed: 261, open: 605, r: 50, label: ['EXHAUST CAP', 'lets clean air back out'], at: [-50, 0] },
];
const N = LAYERS.length;
const T = { open0: S(2), labels: S(5.4), labelsOff: S(10.4), macro0: S(10.4), macro1: S(12.8), close0: S(12.9), end: S(14.6) };

// layer i lifts top first, 0.17 s apart, 1.5 s each; closes bottom first, quicker (0.7 s each, 0.12 s apart)
const lift = (f: number, i: number) => {
  const o = cubic(ramp(f, T.open0 + (N - 1 - i) * 4, T.open0 + (N - 1 - i) * 4 + S(1.5)));
  const c = cubic(ramp(f, T.close0 + i * 3, T.close0 + i * 3 + S(0.7)));
  return o * (1 - c);
};
const yOf = (f: number, i: number) => {
  const L = LAYERS[i], k = lift(f, i), hold = f > T.open0 + S(2) && f < T.macro0 ? 1.5 * Math.sin(f / 19 + i * 1.7) : 0;
  return lerp(L.closed, L.open, k) + hold * k;
};

// ---- camera keys (monotone: each segment eases between its own two keys, nothing overshoots) ----
type Key = { f: number; az: number; el: number; dist: number; ty: number; tx: number };
const KEYS: Key[] = [
  { f: 0, az: -38, el: 14, dist: 1080, ty: 120, tx: -15 },
  { f: S(2), az: -22, el: 15, dist: 1120, ty: 135, tx: -20 },
  { f: S(5.2), az: 18, el: 12, dist: 1560, ty: 285, tx: -150 },
  { f: S(10.2), az: 32, el: 16, dist: 1500, ty: 285, tx: -150 },
  { f: S(11.4), az: 58, el: 4, dist: 520, ty: 420, tx: -10 },
  { f: S(12.8), az: 66, el: 2, dist: 470, ty: 430, tx: -10 },
  { f: S(14.4), az: 8, el: 16, dist: 1120, ty: 120, tx: -15 },
  { f: DUR, az: -6, el: 16, dist: 1150, ty: 120, tx: -15 },
];
const camAt = (f: number) => {
  let j = 0; while (j < KEYS.length - 2 && f > KEYS[j + 1].f) j++;
  const a = KEYS[j], b = KEYS[j + 1], t = cubic(ramp(f, a.f, b.f));
  const az = (lerp(a.az, b.az, t) * Math.PI) / 180, el = (lerp(a.el, b.el, t) * Math.PI) / 180, d = lerp(a.dist, b.dist, t), ty = lerp(a.ty, b.ty, t), tx = lerp(a.tx, b.tx, t);
  const cam = new THREE.PerspectiveCamera(30, 1080 / 1920, 5, 8000);
  // the target sits left of the object, so the object lands right of centre and the label column has the left side
  const right = new THREE.Vector3(Math.cos(az), 0, -Math.sin(az));
  const tgt = new THREE.Vector3(0, ty, 0).addScaledVector(right, tx);
  cam.position.set(tgt.x + d * Math.cos(el) * Math.sin(az), ty + d * Math.sin(el), tgt.z + d * Math.cos(el) * Math.cos(az));
  cam.lookAt(tgt); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  return cam;
};

// ---- materials ----
const useMats = () => useMemo(() => {
  const plastic = (c: string, r = 0.6) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, metalness: 0, clearcoat: 0.15, clearcoatRoughness: 0.5 });
  // perforated metal for the shroud: a dot grid drawn once, used as colour and bump
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const g = cv.getContext('2d')!;
  g.fillStyle = '#b9bcc2'; g.fillRect(0, 0, 512, 256); g.fillStyle = '#1b1c20';
  for (let y = 6; y < 256; y += 11) for (let x = (y / 11) % 2 ? 6 : 11.5; x < 512; x += 11) { g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); }
  const perf = new THREE.CanvasTexture(cv); perf.wrapS = perf.wrapT = THREE.RepeatWrapping; perf.repeat.set(3, 2); perf.colorSpace = THREE.SRGBColorSpace;
  return {
    graphite: plastic('#3c3f46', 0.62), charcoal: plastic('#2b2d33', 0.66), violet: plastic('#5b4bb7', 0.55), purple: plastic('#7a63d6', 0.5),
    nickel: new THREE.MeshPhysicalMaterial({ color: '#c9ccd2', metalness: 1, roughness: 0.32 }),
    alu: new THREE.MeshPhysicalMaterial({ color: '#aeb3bb', metalness: 1, roughness: 0.4 }),
    copper: new THREE.MeshPhysicalMaterial({ color: '#c46b3c', metalness: 1, roughness: 0.38 }),
    clear: new THREE.MeshPhysicalMaterial({ color: '#d8e4ee', metalness: 0, roughness: 0.06, transparent: true, opacity: 0.26, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }),
    mesh: new THREE.MeshPhysicalMaterial({ map: perf, bumpMap: perf, bumpScale: 0.6, metalness: 0.9, roughness: 0.38 }),
    paper: new THREE.MeshPhysicalMaterial({ color: '#e7e1d3', roughness: 0.9 }),
    red: plastic('#d8432c', 0.5),
  };
}, []);

// pleated filter: a cylinder whose radius folds in and out
const pleated = (r: number, h: number, folds: number) => {
  const geo = new THREE.CylinderGeometry(r, r, h, folds * 4, 1, true), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = (i % (folds * 4 + 1)) % 2 ? 1 : 0.86; p.setX(i, Math.cos(a) * r * k); p.setZ(i, Math.sin(a) * r * k); }
  geo.computeVertexNormals(); return geo;
};

// ---- the parts, each modelled around its own centre ----
const Part: React.FC<{ id: string; f: number; m: ReturnType<typeof useMats> }> = ({ id, f, m }) => {
  if (id === 'door') return (<group>
    <mesh material={m.graphite}><cylinderGeometry args={[58, 58, 6, 72]} /></mesh>
    <mesh material={m.red} position={[-58, 0, 0]}><boxGeometry args={[10, 8, 18]} /></mesh>
  </group>);
  if (id === 'bin') return (<group>
    <mesh material={m.clear}><cylinderGeometry args={[56, 56, 120, 96, 1, true]} /></mesh>
    <mesh material={m.violet} position={[0, 58, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[56, 2.4, 12, 96]} /></mesh>
  </group>);
  if (id === 'shroud') return (<group>
    <mesh material={m.mesh}><cylinderGeometry args={[40, 40, 92, 72, 1, true]} /></mesh>
    <mesh material={m.charcoal} position={[0, -47, 0]}><cylinderGeometry args={[42, 42, 4, 72]} /></mesh>
    <mesh material={m.charcoal} position={[0, 47, 0]}><cylinderGeometry args={[44, 44, 4, 72]} /></mesh>
  </group>);
  if (id === 'cyclones') {
    // the wave lift: the cones rise one after another round the ring, then settle back into the plate
    const k = ramp(f, T.open0 + S(0.6), T.open0 + S(2.4)) * (1 - ramp(f, T.close0 - S(0.3), T.close0));
    return (<group>
      <mesh material={m.purple} position={[0, 22, 0]}><cylinderGeometry args={[50, 50, 8, 72]} /></mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2, w = Math.sin(Math.PI * clamp(k * 1.6 - i / 18)), dy = 16 * w;
        return (<group key={i} position={[Math.cos(a) * 34, -2 + dy, Math.sin(a) * 34]}>
          <mesh material={m.violet} rotation={[Math.PI, 0, 0]}><coneGeometry args={[9, 40, 32, 1, true]} /></mesh>
          <mesh material={m.charcoal} position={[0, 21, 0]}><cylinderGeometry args={[9.5, 9.5, 3, 32]} /></mesh>
        </group>);
      })}
      <mesh material={m.violet} position={[0, -4, 0]}><cylinderGeometry args={[14, 8, 44, 32, 1, true]} /></mesh>
    </group>);
  }
  if (id === 'motor') {
    const spin = ramp(f, T.macro0 + S(0.6), T.macro0 + S(1.1)) * (1 - ramp(f, T.macro1 - S(0.3), T.macro1)), ang = spin * f * 0.9;
    return (<group>
      <mesh material={m.alu}><cylinderGeometry args={[30, 30, 34, 64]} /></mesh>
      <mesh material={m.copper} position={[0, -6, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[30.5, 4, 16, 64]} /></mesh>
      <mesh material={m.charcoal} position={[0, -20, 0]}><cylinderGeometry args={[34, 34, 6, 64]} /></mesh>
      <group position={[0, 22, 0]} rotation={[0, ang, 0]}>
        <mesh material={m.nickel}><cylinderGeometry args={[8, 8, 8, 32]} /></mesh>
        {Array.from({ length: 11 }, (_, i) => (<mesh key={i} material={m.nickel} rotation={[0, (i / 11) * Math.PI * 2, 0]} position={[0, 0, 0]}>
          <boxGeometry args={[1.6, 8, 30]} />
        </mesh>))}
        <mesh material={m.nickel} position={[0, -4.5, 0]}><cylinderGeometry args={[31, 31, 1.2, 64]} /></mesh>
      </group>
    </group>);
  }
  if (id === 'filter') return (<group>
    <mesh geometry={pleated(46, 30, 30)} material={m.paper} />
    <mesh material={m.charcoal} position={[0, -16, 0]}><cylinderGeometry args={[47, 47, 3, 72]} /></mesh>
    <mesh material={m.charcoal} position={[0, 16, 0]}><cylinderGeometry args={[47, 47, 3, 72]} /></mesh>
  </group>);
  return (<group>
    <mesh material={m.graphite}><cylinderGeometry args={[48, 50, 14, 72]} /></mesh>
    {Array.from({ length: 4 }, (_, i) => (<mesh key={i} material={m.charcoal} position={[0, 7.4, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[12 + i * 9, 1.6, 8, 72]} /></mesh>))}
  </group>);
};

const Stage: React.FC<{ f: number; cam: THREE.PerspectiveCamera }> = ({ f, cam }) => {
  const gl = useThree((s) => s.gl), scene = useThree((s) => s.scene), camera = useThree((s) => s.camera), advance = useThree((s) => s.advance);
  const m = useMats();
  useEffect(() => { const pm = new THREE.PMREMGenerator(gl); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55; gl.toneMapping = THREE.ACESFilmicToneMapping; return () => pm.dispose(); }, [gl, scene]);
  useEffect(() => { camera.position.copy(cam.position); camera.quaternion.copy(cam.quaternion); (camera as THREE.PerspectiveCamera).fov = cam.fov; camera.updateMatrixWorld(); (camera as THREE.PerspectiveCamera).updateProjectionMatrix(); advance(performance.now()); });
  // a cool rim behind, following the camera, so dark plastics separate from the ground
  const rim = cam.position.clone().multiplyScalar(-1).setY(300);
  const shadow = useMemo(() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!; const rg = g.createRadialGradient(128, 128, 0, 128, 128, 128); rg.addColorStop(0, 'rgba(0,0,0,.55)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c); }, []);
  return (<>
    <ambientLight intensity={0.25} />
    <directionalLight position={[260, 620, 520]} intensity={2.4} color="#ffe6c8" />
    <directionalLight position={[rim.x, rim.y, rim.z]} intensity={1.6} color="#9fc4ff" />
    <directionalLight position={[0, 900, 0]} intensity={0.6} />
    <mesh position={[0, Math.min(-6, yOf(f, 0) - 6), 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[260, 260]} /><meshBasicMaterial map={shadow} transparent depthWrite={false} /></mesh>
    {LAYERS.map((L, i) => <group key={L.id} position={[0, yOf(f, i), 0]}><Part id={L.id} f={f} m={m} /></group>)}
  </>);
};

export const VacuumTeardown: React.FC = () => {
  const f = useCurrentFrame(), cam = useMemo(() => camAt(f), [f]);
  const v = new THREE.Vector3(), proj = (x: number, y: number, z: number) => { v.set(x, y, z).project(cam); return [(v.x + 1) * 540, (1 - v.y) * 960, v.z] as const; };
  // labels: anchor dot on the part's side facing the column, leader to a fixed column at the left, top part on top
  const lab = (i: number) => {
    const L = LAYERS[i], a = proj(L.at[0] * Math.cos(0), yOf(f, i) + L.at[1], 0);
    const t0 = T.labels + (N - 1 - i) * 5, o = ramp(f, t0, t0 + 6) * (1 - ramp(f, T.labelsOff - 6, T.labelsOff));
    return { L, a, o, grow: cubic(ramp(f, t0, t0 + 8)), idx: String(N - i).padStart(2, '0') };
  };
  const labels = LAYERS.map((_, i) => lab(i)).reverse();
  // the column: evenly spaced rows so labels never collide, each joined to its own part
  const COL_X = 70, ROW0 = 300, ROW = 150;
  const title = ramp(f, 4, 14) * (1 - ramp(f, S(1.7), S(2.2))), endT = ramp(f, T.end, T.end + 10);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(85% 60% at 55% 48%, #34363a 0%, #1a1b1e 55%, #0d0e10 100%)' }}>
      <ThreeCanvas width={1080} height={1920} gl={{ antialias: true, alpha: true }} camera={{ fov: 30, near: 5, far: 8000, position: [0, 0, 1000] }}>
        <Stage f={f} cam={cam} />
      </ThreeCanvas>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {labels.map(({ a, o, grow }, k) => { if (o <= 0) return null; const ly = ROW0 + k * ROW + 18, lx = COL_X + 330, ex = lx + (a[0] - lx) * grow, ey = ly + (a[1] - ly) * grow;
          return (<g key={k} opacity={o}>
            <line x1={lx} y1={ly} x2={ex} y2={ey} stroke={INK} strokeOpacity={0.7} strokeWidth={1.6} />
            <circle cx={a[0]} cy={a[1]} r={5} fill={ACCENT} opacity={grow} /><circle cx={a[0]} cy={a[1]} r={10} fill="none" stroke={ACCENT} strokeOpacity={0.5 * grow} strokeWidth={1.5} />
          </g>); })}
      </svg>
      {labels.map(({ L, o, idx }, k) => o > 0 && (
        <div key={L.id} style={{ position: 'absolute', left: COL_X, top: ROW0 + k * ROW - 10, width: 360, opacity: o, transform: `translateX(${-10 * (1 - o)}px)` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ font: `700 20px/1 ${MONO}`, color: ACCENT }}>{idx}</span>
            <span style={{ font: `500 29px/1 ${SANS}`, color: INK, letterSpacing: '0.02em', textShadow: '0 2px 8px rgba(0,0,0,.8)' }}>{L.label[0]}</span>
          </div>
          <div style={{ marginTop: 9, marginLeft: 36, font: `400 19px/1.2 ${MONO}`, color: INK, opacity: 0.62 }}>{L.label[1]}</div>
        </div>
      ))}
      {/* opening and closing cards, inside the Reels / Shorts safe zone */}
      <div style={{ position: 'absolute', left: 60, right: 180, top: 250, textAlign: 'center', opacity: title }}>
        <div style={{ font: `700 54px/1.1 ${SANS}`, color: INK }}>What's inside a<br />cordless vacuum?</div>
      </div>
      <div style={{ position: 'absolute', left: 60, right: 180, top: 250, textAlign: 'center', opacity: endT }}>
        <div style={{ font: `700 50px/1.1 ${SANS}`, color: INK }}>Seven layers.<br /><span style={{ color: ACCENT }}>One stream of air.</span></div>
      </div>
      <div style={{ position: 'absolute', left: 70, top: 1440, font: `400 18px/1 ${MONO}`, color: INK, opacity: 0.45 }}>ILLUSTRATIVE MODEL · NOT A SPECIFIC PRODUCT</div>
      <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)', pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};
