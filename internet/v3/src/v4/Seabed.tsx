import React, { useLayoutEffect, useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FPS, clamp01, lerp, smooth, hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { glassMat, pulseMat, stripeTex } from './Fiber';

/* V4, 16:9: the submarine cable on the seabed. Low tracking shot, light racing to the horizon,
   then a see-through section showing the glass fibres and the light inside. Real 3D, frame-driven. */
const W = 1920, H = 1080;
export const SEABED_FRAMES = 630;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));

/* the seabed: long dunes plus smaller swells; everything else sits on this */
const ground = (x: number, z: number) => 1.5 * Math.sin(x * 0.045 + 1) * Math.cos(z * 0.06) + 0.6 * Math.sin(x * 0.12 + z * 0.085) + 0.25 * Math.sin(z * 0.3 + x * 0.05) + (Math.abs(z) > 30 ? (Math.abs(z) - 30) * 0.22 : 0);
const cableZ = (x: number) => 7 * Math.sin(x * 0.03) + 2.5 * Math.sin(x * 0.075 + 1.3);
const CR = 0.42;      // cable radius
const cablePt = (x: number) => V(x, ground(x, cableZ(x)) + CR * 0.8, cableZ(x));
const X0 = -80, X1 = 420;
const PATH = new THREE.CatmullRomCurve3(Array.from({ length: 126 }).map((_, i) => cablePt(X0 + ((X1 - X0) * i) / 125)));
const uOf = (x: number) => clamp01((x - X0) / (X1 - X0));      // close enough to arc length for placing things

/* ---------- camera ---------- */
type K = { t: number; x: number; side: number; up: number; ahead: number; lx?: number; fov: number };
const KEYS: K[] = [
  { t: 0, x: -30, side: 16, up: 15, ahead: 46, fov: 40 },        // wide: the seabed and the cable crossing it
  { t: 4.5, x: 0, side: 5, up: 2.2, ahead: 30, fov: 40 },
  { t: 6.5, x: 14, side: 1.7, up: 0.75, ahead: 30, fov: 46 },     // low, right beside the cable
  { t: 11.5, x: 74, side: 1.9, up: 0.8, ahead: 34, fov: 50 },     // tracking forward as the light overtakes
  { t: 13.5, x: 96, side: 2.6, up: 1.0, ahead: 9, fov: 34 },      // settle on the see-through section
  { t: 17.5, x: 103, side: 1.5, up: 0.5, ahead: 4.5, fov: 28 },   // macro on the fibres
  { t: 21, x: 92, side: 12, up: 9, ahead: 60, fov: 42 },          // rise: the cable runs on over the next hill
];
const camAt = (t: number) => {
  let i = 0; while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1], u = smooth((t - a.t) / (b.t - a.t)), L = (k: keyof K) => lerp(a[k] as number, b[k] as number, u);
  const x = L('x'), p0 = cablePt(x), tan = cablePt(x + 1).sub(cablePt(x - 1)).normalize(), sd = V(0, 1, 0).cross(tan).normalize();
  const p = p0.clone().add(sd.multiplyScalar(-L('side'))).add(V(0, L('up'), 0)); p.y = Math.max(p.y, ground(p.x, p.z) + 0.35);
  const l = cablePt(x + L('ahead')); l.y += 0.1;
  return { p, l, fov: L('fov') };
};
const Cam: React.FC<{ t: number }> = ({ t }) => { const { camera } = useThree();
  useLayoutEffect(() => { const c = camAt(t), cam = camera as THREE.PerspectiveCamera; cam.position.copy(c.p); cam.fov = c.fov; cam.near = 0.05; cam.far = 600; cam.lookAt(c.l); cam.updateProjectionMatrix(); }, [t, camera]); return null; };

/* ---------- set ---------- */
const Terrain: React.FC = () => {
  const geo = useMemo(() => { const g = new THREE.PlaneGeometry(560, 150, 280, 90); g.rotateX(-Math.PI / 2); g.translate(170, 0, 0); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, ground(p.getX(i), p.getZ(i))); g.computeVertexNormals(); return g; }, []);
  const rip = useMemo(() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!; for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x += 2) { const v = 0.5 + 0.5 * Math.sin((y / 256) * Math.PI * 2 * 9 + Math.sin((x / 256) * Math.PI * 2 * 2) * 1.6); const s = Math.round(v * 255); g.fillStyle = `rgb(${s},${s},${s})`; g.fillRect(x, y, 2, 1); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(26, 30); return t; }, []);
  return <mesh geometry={geo}><meshStandardMaterial color="#3a3a9c" roughness={0.95} bumpMap={rip} bumpScale={5} /></mesh>;
};
const Rocks: React.FC = () => { const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  return <>{Array.from({ length: 150 }).map((_, i) => { const x = X0 + hash(i) * (X1 - X0) * 0.75, off = (hash(i + 31) - 0.5) * 60, z = cableZ(x) + off + Math.sign(off) * 1.6, s = 0.18 + hash(i + 7) ** 3 * 2.2;
    return <mesh key={i} geometry={geo} position={[x, ground(x, z) + s * 0.25, z]} scale={[s * (0.8 + hash(i + 3) * 0.7), s * (0.5 + hash(i + 5) * 0.4), s]} rotation={[hash(i + 9) * 3, hash(i + 11) * 6, 0]}><meshStandardMaterial color={i % 5 === 0 ? '#3a2f8a' : '#161a52'} roughness={0.9} flatShading /></mesh>; })}</>; };
/* soft cartoon sea plants and a few slow fish, kept away from the cable so they never hide it */
const Life: React.FC<{ t: number }> = ({ t }) => <>
  {Array.from({ length: 34 }).map((_, i) => { const x = -20 + hash(i + 50) * 170, off = 5 + hash(i + 60) * 22, z = cableZ(x) + (i % 2 ? off : -off), h = 0.9 + hash(i + 70) * 1.9, sway = Math.sin(t * 0.9 + i) * 0.12;
    return <mesh key={i} position={[x, ground(x, z) + h / 2, z]} rotation-z={sway} scale={[1, 1, 0.4]}><capsuleGeometry args={[0.22 + hash(i + 80) * 0.16, h, 4, 8]} /><meshStandardMaterial color={i % 3 === 0 ? '#ff8f7a' : i % 3 === 1 ? '#2fb89a' : '#8f7be0'} roughness={0.7} emissive={i % 3 === 0 ? '#5a1e18' : '#0c3a34'} /></mesh>; })}
  {Array.from({ length: 9 }).map((_, i) => { const x = 10 + hash(i + 90) * 130 + t * (0.5 + hash(i + 95)) * (i % 2 ? 1 : -1), z = cableZ(x) + (i % 2 ? 9 : -11) - hash(i + 97) * 14, y = ground(x, z) + 3 + hash(i + 99) * 7 + Math.sin(t + i) * 0.3, s = 0.35 + hash(i + 101) * 0.4;
    return <group key={i} position={[x, y, z]} scale={[i % 2 ? s : -s, s, s]}><mesh scale={[1.5, 0.6, 0.35]}><sphereGeometry args={[0.5, 14, 10]} /><meshStandardMaterial color={i % 3 ? '#ffb454' : '#c9a6ff'} roughness={0.6} /></mesh>
      <mesh position={[-0.85, 0, 0]} rotation-z={Math.PI / 2 + Math.sin(t * 6 + i) * 0.35} scale={[1, 1, 0.3]}><coneGeometry args={[0.32, 0.5, 3]} /><meshStandardMaterial color={i % 3 ? '#ff9a3d' : '#a98be0'} roughness={0.6} /></mesh></group>; })}
</>;
/* shafts of light from the surface, far away */
const Shafts: React.FC<{ t: number }> = ({ t }) => <>{Array.from({ length: 7 }).map((_, i) => <mesh key={i} position={[40 + i * 34 + Math.sin(t * 0.2 + i) * 2, 22, -34 - hash(i + 5) * 16]} rotation-z={0.22}><planeGeometry args={[4 + hash(i) * 6, 60]} /><meshBasicMaterial color="#5f8cff" transparent opacity={0.035 + 0.02 * Math.sin(t * 0.6 + i)} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>)}</>;
const Snow: React.FC<{ t: number }> = ({ t }) => <>{Array.from({ length: 90 }).map((_, i) => { const c = camAt(t).p; const x = c.x - 6 + hash(i) * 60, z = c.z - 22 + hash(i + 3) * 30, y = ((hash(i + 6) * 14 - t * (0.08 + hash(i + 9) * 0.1)) % 14 + 14) % 14;
  return <mesh key={i} position={[x, ground(x, z) + 0.3 + y, z]}><sphereGeometry args={[0.012 + hash(i + 12) * 0.014, 6, 6]} /><meshBasicMaterial color="#bcd4ff" transparent opacity={0.35} /></mesh>; })}</>;

/* ---------- the cable ---------- */
const CUT0 = 99, CUT1 = 108;      // the see-through section (x along the seabed)
const Cable: React.FC<{ t: number }> = ({ t }) => {
  const N = 1500;
  const armour = useMemo(() => new THREE.TubeGeometry(PATH, N, CR, 24, false), []);
  const armourB = useMemo(() => armour.clone(), [armour]);
  const tex = useMemo(() => { const x = stripeTex('#1b2260', '#3f4cb8', 10, 0.5); x.repeat.set(900, 1); return x; }, []);
  const open = seg(t, 12.6, 14.2);
  const idx = (x: number) => Math.floor(uOf(x) * N) * 24 * 6, mid = (CUT0 + CUT1) / 2, a = lerp(mid, CUT0, open), b = lerp(mid, CUT1, open);
  armour.setDrawRange(0, idx(a)); armourB.setDrawRange(idx(b), 1e9);
  const sub = useMemo(() => new THREE.CatmullRomCurve3(Array.from({ length: 30 }).map((_, i) => cablePt(CUT0 - 1.5 + ((CUT1 - CUT0 + 3) * i) / 29))), []);
  const glass = useMemo(() => glassMat('#9fe6ff', 0.06, 0.5), []);
  const layers = useMemo(() => [new THREE.TubeGeometry(sub, 120, CR * 0.98, 24, false), new THREE.TubeGeometry(sub, 120, CR * 0.5, 20, false)], [sub]);
  /* eight fibres, each its own thin tube, bundled in the middle */
  const fibres = useMemo(() => Array.from({ length: 8 }).map((_, k) => { const ang = (k / 8) * Math.PI * 2, r = k === 0 ? 0 : CR * 0.2; const pts = sub.getSpacedPoints(40).map((p) => p.clone().add(V(0, Math.sin(ang) * r, Math.cos(ang) * r))); return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, CR * 0.045, 8, false); }), [sub]);
  const mats = useMemo(() => fibres.map(() => pulseMat()), [fibres]);
  mats.forEach((m, k) => { m.uniforms.uT.value = t * (2.2 + k * 0.13) + k * 3.7; m.uniforms.uLen.value = 12; m.uniforms.uOn.value = open; m.uniforms.uAmber.value = k === 0 ? ((t * 2.2) % 16) - 2 : -99; });
  const glowTex = useMemo(() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.18, 'rgba(255,190,90,.75)'); gr.addColorStop(0.5, 'rgba(255,150,40,.2)'); gr.addColorStop(1, 'rgba(255,140,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }, []);
  const copper = useMemo(() => { const x = stripeTex('#c98a4a', '#e2a868', 4, 0); return x; }, []);
  /* the light we follow, racing along the outside view of the cable towards the horizon */
  const run = clamp01((t - 7.0) / 4.2), px = lerp(-10, 330, run * run * (3 - 2 * run) * 0.4 + run * 0.6), pp = cablePt(px), glowOn = seg(t, 6.8, 7.3) * (1 - seg(t, 11.0, 11.6));
  return (
    <group>
      <mesh geometry={armour}><meshStandardMaterial map={tex} roughness={0.5} metalness={0.25} /></mesh>
      <mesh geometry={armourB}><meshStandardMaterial map={tex} roughness={0.5} metalness={0.25} /></mesh>
      {open > 0.01 && <>
        {[a, b].map((x, i) => { const p = cablePt(x), q = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), cablePt(x + 0.5).sub(cablePt(x - 0.5)).normalize()); return <mesh key={i} position={p} quaternion={q}><ringGeometry args={[CR * 0.5, CR * 1.04, 28]} /><meshStandardMaterial color="#2a3488" roughness={0.5} side={THREE.DoubleSide} />{Array.from({ length: 18 }).map((_, k) => <mesh key={k} position={[Math.cos((k / 18) * 6.283) * CR * 0.8, Math.sin((k / 18) * 6.283) * CR * 0.8, 0]}><sphereGeometry args={[CR * 0.11, 10, 8]} /><meshStandardMaterial color="#c9d2f5" roughness={0.3} metalness={0.6} /></mesh>)}</mesh>; })}
        <mesh geometry={layers[0]} material={glass} renderOrder={3} />
        <mesh geometry={layers[1]} renderOrder={1}><meshStandardMaterial map={copper} roughness={0.5} emissive="#6a3c14" emissiveIntensity={0.7} transparent opacity={lerp(1, 0.16, seg(t, 14.6, 15.8))} depthWrite={false} /></mesh>
        {fibres.map((g, k) => <mesh key={k} geometry={g} material={mats[k]} renderOrder={2} />)}
      </>}
      {glowOn > 0.01 && <group position={pp}>
        <sprite scale={[CR * 16, CR * 16, 1]}><spriteMaterial map={glowTex} transparent opacity={glowOn} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
        <mesh><sphereGeometry args={[CR * 1.15, 16, 12]} /><meshBasicMaterial color="#ffe6b0" transparent opacity={glowOn} /></mesh>
        <pointLight color="#ffb454" intensity={90 * glowOn} distance={40} decay={1.6} position={[0, 1.2, 0]} />
      </group>}
    </group>
  );
};

/* ---------- words over the picture ---------- */
const project = (t: number, p: THREE.Vector3): [number, number] => { const c = camAt(t), cam = new THREE.PerspectiveCamera(c.fov, W / H, 0.05, 600); cam.position.copy(c.p); cam.lookAt(c.l); cam.updateMatrixWorld(); const q = p.clone().project(cam); return [(q.x * 0.5 + 0.5) * W, (-q.y * 0.5 + 0.5) * H]; };
const Tag: React.FC<{ t: number; at: THREE.Vector3; text: string; sub?: string; a: number; b: number; dx: number; dy: number; col?: string }> = ({ t, at, text, sub, a, b, dx, dy, col = '#5fe3ff' }) => {
  const o = seg(t, a, a + 0.4) * (1 - seg(t, b - 0.4, b)); if (o <= 0.001) return null; const [x, y] = project(t, at), w = Math.max(text.length * 19 + 44, (sub?.length ?? 0) * 11.5 + 44), lx = x + dx, ly = y + dy;
  return <g opacity={o}><line x1={x} y1={y} x2={lx} y2={ly + (dy < 0 ? 30 : -30)} stroke={col} strokeWidth={2.5} /><circle cx={x} cy={y} r={6} fill={col} stroke="#070a22" strokeWidth={2.5} />
    <g transform={`translate(${lx} ${ly})`}><rect x={-w / 2} y={-30} width={w} height={sub ? 76 : 56} rx={12} fill="#0e1430" fillOpacity={0.92} stroke={col} strokeWidth={2.5} />
      <text y={7} textAnchor="middle" fill="#eef1ff" style={{ font: `800 28px ${FONT.ui}`, letterSpacing: '0.06em' }}>{text}</text>
      {sub && <text y={34} textAnchor="middle" fill="#a9b4dd" style={{ font: `500 18px ${FONT.mono}` }}>{sub}</text>}</g></g>; };

export const Seabed: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const place = seg(t, 1.0, 1.6) * (1 - seg(t, 6.0, 6.6));
  const num = seg(t, 7.4, 7.9) * (1 - seg(t, 11.6, 12.2)), count = Math.round(lerp(0, 200000, seg(t, 7.4, 9.0)) / 1000) * 1000;
  const mid = (x: number, dy = 0) => { const p = cablePt(x); p.y += dy; return p; };
  return (
    <AbsoluteFill style={{ background: '#050720' }}>
      <ThreeCanvas width={W} height={H} gl={{ antialias: true }} camera={{ fov: 40, near: 0.05, far: 600 }}>
        <Cam t={t} />
        <color attach="background" args={['#0a1040']} />
        <fog attach="fog" args={['#0d1650', 10, 135]} />
        <hemisphereLight args={['#7f96ff', '#1a1050', 1.25]} />
        <directionalLight position={[60, 40, -30]} intensity={2.2} color="#a9bcff" />
        <directionalLight position={[-20, 8, -30]} intensity={0.5} color="#5fe3ff" />
        <Terrain /><Rocks /><Life t={t} /><Shafts t={t} /><Snow t={t} /><Cable t={t} />
        <EffectComposer><Bloom intensity={0.8} luminanceThreshold={0.72} luminanceSmoothing={0.2} mipmapBlur /><Vignette eskil={false} offset={0.2} darkness={0.8} /></EffectComposer>
      </ThreeCanvas>
      <AbsoluteFill><svg width={W} height={H}>
        <g opacity={place} transform="translate(120 820)"><text fill="#eef1ff" style={{ font: `800 54px ${FONT.ui}` }}>Arabian Sea</text><text y={46} fill="#5fe3ff" style={{ font: `500 30px ${FONT.mono}` }}>about 3,000 m down</text></g>
        <g opacity={num} transform="translate(960 250)"><text textAnchor="middle" fill="#ffc94a" style={{ font: `800 170px ${FONT.ui}`, letterSpacing: '0.01em', filter: 'drop-shadow(0 0 26px rgba(255,180,60,.55))' }}>{count.toLocaleString('en-US')}<tspan dx={18} style={{ font: `800 62px ${FONT.ui}` }}>km/s</tspan></text>
          <text y={70} textAnchor="middle" fill="#a9b4dd" style={{ font: `500 30px ${FONT.mono}` }}>light in glass: about two thirds of its speed in space</text></g>
        <Tag t={t} at={mid(100.2, 0.42)} text="STEEL ARMOUR" sub="against anchors and trawlers" a={14.2} b={17.2} dx={-250} dy={-190} />
        <Tag t={t} at={mid(104, 0.2)} text="COPPER TUBE" sub="powers the repeaters" a={14.6} b={17.2} dx={60} dy={-240} col="#ffb454" />
        <Tag t={t} at={mid(105.5, 0)} text="GLASS FIBRES" sub="the data, as light" a={15.6} b={19.4} dx={250} dy={170} />
      </svg></AbsoluteFill>
    </AbsoluteFill>
  );
};
