import React, { useLayoutEffect, useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FPS, clamp01, lerp, smooth, hash } from '../lib/anim';
import { FONT } from '../lib/palette';

/* V4 hero sequence, 16:9: a land fibre cable stripped open layer by layer, one glass fibre isolated,
   then the camera goes inside the glass core and rides with the light. Real 3D, frame-driven, no randomness. */
export const W = 1920, H = 1080;
export const FIBER_FRAMES = 780;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const COL = { navy: '#070a22', jacket: '#1c2350', jacketHi: '#2c3780', yarn: '#e9b44c', tape: '#dfe6ff', frp: '#8a93b8', cyan: '#5fe3ff', amber: '#ffb454', glass: '#bfeaff' };
/* the real colour order used to tell tubes and fibres apart */
const CODE = ['#3d7bff', '#ff9a3d', '#3fbf6f', '#8a5a3c', '#8f98b3', '#f2f4ff'];

/* ---------- camera: one keyframed path for the whole sequence ---------- */
type CamKey = { t: number; p: [number, number, number]; l: [number, number, number]; fov?: number };
const EXT: CamKey[] = [
  { t: 0, p: [-9, 4.2, 13], l: [-6, 0.4, 0], fov: 34 },
  { t: 3.2, p: [-1.5, 2.2, 7.5], l: [-2.2, 0.1, 0], fov: 34 },
  { t: 6.0, p: [0.5, 1.6, 6.4], l: [-1.6, 0, 0], fov: 32 },
  { t: 9.2, p: [2.2, 1.1, 4.6], l: [0.2, 0, 0], fov: 30 },
  { t: 11.4, p: [3.4, 0.55, 2.3], l: [2.1, 0.02, 0.05], fov: 28 },
  { t: 14.2, p: [3.75, 0.2, 0.78], l: [2.7, 0.0, 0.06], fov: 26 },
  { t: 15.6, p: [3.5, 0.03, 0.16], l: [2.6, 0, 0.06], fov: 26 },
];
export const T_IN = 15.6, T_OUT = 23.2;      // inside the glass between these times
const camExt = (t: number) => {
  let i = 0; while (i < EXT.length - 2 && t > EXT[i + 1].t) i++;
  const a = EXT[i], b = EXT[i + 1], u = smooth((t - a.t) / (b.t - a.t));
  return { p: V(lerp(a.p[0], b.p[0], u), lerp(a.p[1], b.p[1], u), lerp(a.p[2], b.p[2], u)), l: V(lerp(a.l[0], b.l[0], u), lerp(a.l[1], b.l[1], u), lerp(a.l[2], b.l[2], u)), fov: lerp(a.fov ?? 30, b.fov ?? 30, u) };
};
/* the curved glass path used for the ride inside */
const RIDE = new THREE.CatmullRomCurve3([V(0, 0, 0), V(40, 0, 0), V(80, 4, -6), V(120, -3, -18), V(165, 6, -10), V(210, 0, 8), V(260, -5, 0), V(320, 2, -14), V(380, 0, 0), V(460, 0, 0)], false, 'catmullrom', 0.5);
const RIDE_LEN = RIDE.getLength();
/* distance travelled inside (world units): slow entry, follow, then a strong speed ramp */
const rideS = (t: number) => { const u = clamp01((t - T_IN) / (T_OUT - T_IN)); return 6 + 380 * (0.22 * u + 0.78 * u * u * u); };
const AMBER_LEAD = (t: number) => { const u = clamp01((t - T_IN) / (T_OUT - T_IN)); return lerp(22, 12, seg(u, 0.2, 0.45)) - lerp(0, 9, seg(u, 0.5, 0.7)) + lerp(0, 16, seg(u, 0.82, 1)); };
const camRide = (t: number) => {
  const s = rideS(t), u = s / RIDE_LEN, uu = clamp01((t - T_IN) / (T_OUT - T_IN));
  const p = RIDE.getPointAt(clamp01(u)), tan = RIDE.getTangentAt(clamp01(u)), side = V(0, 1, 0).cross(tan).normalize(), up = tan.clone().cross(side).normalize();
  /* ride inside the cladding glass, just above and beside the core: close in behind the amber light, slide alongside it, then drop back */
  const sideK = lerp(1.7, 0.75, seg(uu, 0.2, 0.45)) + lerp(0, 1.5, seg(uu, 0.5, 0.7)) - lerp(0, 1.2, seg(uu, 0.82, 1)), upK = lerp(1.25, 0.7, seg(uu, 0.2, 0.45)) + 0.08 * Math.sin(t * 1.3);
  const pos = p.clone().add(side.clone().multiplyScalar(sideK)).add(up.clone().multiplyScalar(upK));
  const ahead = lerp(20, 11, seg(uu, 0.5, 0.7)) + lerp(0, 12, seg(uu, 0.82, 1));
  const look = RIDE.getPointAt(clamp01(u + ahead / RIDE_LEN));
  return { p: pos, l: look, fov: lerp(46, 62, seg(uu, 0.6, 1)) };
};
const EXIT: CamKey[] = [
  { t: T_OUT, p: [2.6, 0.12, 0.5], l: [2.2, 0, 0.06], fov: 26 },
  { t: T_OUT + 1.2, p: [3.2, 0.9, 3.0], l: [1.2, 0, 0], fov: 30 },
  { t: T_OUT + 2.8, p: [3, 3.4, 10.5], l: [-3, 0.2, 0], fov: 36 },
];
const camExit = (t: number) => { const i = t > EXIT[1].t ? 1 : 0, a = EXIT[i], b = EXIT[i + 1], u = smooth((t - a.t) / (b.t - a.t)); return { p: V(lerp(a.p[0], b.p[0], u), lerp(a.p[1], b.p[1], u), lerp(a.p[2], b.p[2], u)), l: V(lerp(a.l[0], b.l[0], u), lerp(a.l[1], b.l[1], u), lerp(a.l[2], b.l[2], u)), fov: lerp(a.fov!, b.fov!, u) }; };
export const camAt = (t: number) => (t < T_IN ? camExt(t) : t < T_OUT ? camRide(t) : camExit(t));
export const inside = (t: number) => t >= T_IN && t < T_OUT;

const Cam: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  useLayoutEffect(() => { const c = camAt(t), cam = camera as THREE.PerspectiveCamera; cam.position.copy(c.p); cam.fov = c.fov; cam.near = 0.01; cam.far = 900; cam.up.set(0, 1, 0); cam.lookAt(c.l); cam.updateProjectionMatrix(); }, [t, camera]);
  return null;
};

/* ---------- materials ---------- */
export const stripeTex = (a: string, b: string, n = 48, tilt = 0.35) => { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d')!; g.fillStyle = a; g.fillRect(0, 0, 256, 256); g.strokeStyle = b; g.lineWidth = 256 / n / 2.2;
  for (let i = -n; i < n * 2; i++) { g.beginPath(); g.moveTo(-10, (i * 256) / n); g.lineTo(266, (i * 256) / n + 256 * tilt); g.stroke(); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; };
/* soft cartoon glass: see-through in the middle, bright on the rim */
export const glassMat = (col: string, base = 0.1, rim = 0.75) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uC: { value: new THREE.Color(col) }, uB: { value: base }, uR: { value: rim }, uO: { value: 1 } },
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
  fragmentShader: 'varying vec3 vN; varying vec3 vV; uniform vec3 uC; uniform float uB; uniform float uR; uniform float uO; void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 2.2); gl_FragColor = vec4(uC * (0.55 + f), (uB + f * uR) * uO); }' });
/* light pulses that move along a tube: cyan data with one amber group being followed */
export const pulseMat = () => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uT: { value: 0 }, uOn: { value: 1 }, uLen: { value: 1 }, uAmber: { value: -99 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `varying vec2 vUv; uniform float uT; uniform float uOn; uniform float uLen; uniform float uAmber;
    float h(float n){ return fract(sin(n * 127.1) * 43758.5453); }
    void main(){ float x = vUv.x * uLen - uT; float cell = floor(x / .22); float on = step(.42, h(cell)); float p = fract(x / .22); float pk = on * smoothstep(0., .18, p) * smoothstep(1., .82, p);
      float am = smoothstep(.5, .0, abs(vUv.x * uLen - uAmber)); vec3 c = mix(vec3(.37, .89, 1.), vec3(1., .7, .33), am);
      gl_FragColor = vec4(c * (0.25 + pk * 2.6 + am * 1.2), (0.2 + pk) * uOn); }` });

/* ---------- the cable, built along -X with its cut end at x = 0 ---------- */
const Cyl: React.FC<{ r: number; x0: number; x1: number; children?: React.ReactNode; seg?: number; open?: boolean }> = ({ r, x0, x1, children, seg: sg = 48, open }) =>
  <mesh position={[(x0 + x1) / 2, 0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[r, r, Math.abs(x1 - x0), sg, 1, !!open]} />{children}</mesh>;
const ring = (i: number, n: number, r: number): [number, number] => [Math.cos((i / n) * Math.PI * 2 + 0.52) * r, Math.sin((i / n) * Math.PI * 2 + 0.52) * r];
const HERO_TUBE = 0, HERO_FIB = 1;
const tubeYZ = (i: number) => ring(i, 6, 0.5);
/* where each fibre of the hero tube ends up once it fans out of the tube */
const fibPath = (k: number, reach: number) => { const [ty, tz] = tubeYZ(HERO_TUBE), [fy, fz] = ring(k, 6, 0.09); const hero = k === HERO_FIB; const sy = hero ? -ty : fy * 5.5, sz = hero ? 0.06 - tz : fz * 5.5;
  return new THREE.CatmullRomCurve3([V(-1.4, ty + fy, tz + fz), V(-0.9, ty + fy, tz + fz), V(-0.2, ty + fy + sy * 0.25, tz + fz + sz * 0.25), V(0.5 + reach * 0.3, ty + fy + sy * 0.8, tz + fz + sz * 0.8), V(0.9 + reach, ty + fy + sy, tz + fz + sz)]); };

const Cable: React.FC<{ t: number }> = ({ t }) => {
  const yarn = useMemo(() => { const x = stripeTex('#e9b44c', '#b9852a', 40, 0.5); x.repeat.set(1, 6); return x; }, []);
  const jk = useMemo(() => { const x = stripeTex('#1c2350', '#232b62', 6, 0); x.repeat.set(1, 30); return x; }, []);
  const glass = useMemo(() => glassMat(COL.glass, 0.1, 0.8), []);
  const core = useMemo(pulseMat, []);
  /* how far each layer has been stripped back */
  const jx = lerp(0, -5.2, seg(t, 3.4, 4.8)), yx = lerp(0, -3.9, seg(t, 4.6, 5.9)), tx = lerp(0, -2.8, seg(t, 5.7, 6.9)), bx = lerp(0, -1.5, seg(t, 6.8, 7.9));
  const hx = lerp(0, -0.55, seg(t, 7.9, 9.0)), reach = seg(t, 8.3, 9.8), fan = reach;
  const coatX = lerp(3.05, 2.2, seg(t, 10.2, 11.4)), clear = seg(t, 11.2, 12.6);
  const heroEnd = 0.9 + 2.15 * reach;      // x of the hero fibre tip (3.05 when fully out)
  const heroC = useMemo(() => fibPath(HERO_FIB, 2.15), []);
  const yEnd = heroC.getPoint(1);
  core.uniforms.uT.value = t * 1.6; core.uniforms.uLen.value = 3; core.uniforms.uOn.value = clear; core.uniforms.uAmber.value = ((t * 1.6) % 4.2) - 0.6;
  glass.uniforms.uO.value = 1;
  return (
    <group>
      {/* outer jacket, running far off to the left along a gentle curve */}
      <Cyl r={1} x0={-60} x1={jx}><meshStandardMaterial map={jk} roughness={0.55} metalness={0.05} /></Cyl>
      <mesh position={[jx, 0, 0]} rotation-y={Math.PI / 2}><ringGeometry args={[0.87, 1, 48]} /><meshStandardMaterial color={COL.jacketHi} roughness={0.5} /></mesh>
      {/* strength yarn */}
      <Cyl r={0.86} x0={-8} x1={yx}><meshStandardMaterial map={yarn} roughness={0.85} /></Cyl>
      <mesh position={[yx, 0, 0]} rotation-y={Math.PI / 2}><ringGeometry args={[0.79, 0.86, 48]} /><meshStandardMaterial color="#c9973a" roughness={0.8} /></mesh>
      {/* water-blocking tape */}
      <Cyl r={0.78} x0={-8} x1={tx}><meshStandardMaterial color={COL.tape} roughness={0.7} /></Cyl>
      <mesh position={[tx, 0, 0]} rotation-y={Math.PI / 2}><ringGeometry args={[0.2, 0.78, 48]} /><meshStandardMaterial color="#b9c2ea" roughness={0.7} /></mesh>
      {/* centre strength rod */}
      <Cyl r={0.2} x0={-8} x1={tx + 0.5}><meshStandardMaterial color={COL.frp} roughness={0.6} /></Cyl>
      {/* six colour-coded loose tubes */}
      {CODE.map((c, i) => { const [y, z] = tubeYZ(i), hero = i === HERO_TUBE, end = hero ? hx : bx + (i % 2 ? 0.25 : 0);
        return <group key={i} position={[0, y, z]}><Cyl r={0.235} x0={-8} x1={end} seg={28} open><meshStandardMaterial color={c} roughness={0.5} side={THREE.DoubleSide} /></Cyl>
          <mesh position={[end, 0, 0]} rotation-y={Math.PI / 2}><ringGeometry args={[0.19, 0.235, 28]} /><meshStandardMaterial color={c} roughness={0.5} /></mesh>
          {!hero && <mesh position={[end - 0.01, 0, 0]} rotation-y={Math.PI / 2}><circleGeometry args={[0.19, 20]} /><meshStandardMaterial color="#0d1238" roughness={0.9} /></mesh>}</group>; })}
      {/* the fibres of the opened tube */}
      {fan > 0.001 && CODE.map((c, k) => { if (k === HERO_FIB) return null; const cv = fibPath(k, 0.5 + 0.25 * hash(k + 4)); const g = new THREE.TubeGeometry(cv, 40, 0.034, 10, false); g.setDrawRange(0, Math.floor((g.index!.count * clamp01(0.35 + 0.65 * fan)) / 3) * 3);
        return <mesh key={k} geometry={g}><meshStandardMaterial color={c} roughness={0.45} /></mesh>; })}
      {/* the hero fibre: coloured coating, glass cladding, glass core */}
      {fan > 0.001 && (() => { const cut = (r: number, to: number, mat: React.ReactNode, key: string, m?: THREE.Material) => { const g = new THREE.TubeGeometry(heroC, 120, r, 14, false); const frac = clamp01((Math.min(to, heroEnd) + 1.4) / (3.05 + 1.4)); g.setDrawRange(0, Math.floor((g.index!.count * frac) / 3) * 3); return <mesh key={key} geometry={g} material={m}>{mat}</mesh>; };
        return <>{cut(0.036, coatX, <meshStandardMaterial color={CODE[HERO_FIB]} roughness={0.45} />, 'coat')}
          {cut(0.008, 3.05, null, 'core', core)}
          <mesh geometry={new THREE.TubeGeometry(heroC, 120, 0.0085, 10, false)} visible={clear < 0.02}><meshStandardMaterial color="#dff6ff" roughness={0.3} /></mesh>
          {cut(0.022, 3.05, null, 'clad', glass)}
          <mesh position={[Math.min(heroEnd, 3.05), yEnd.y, yEnd.z]} rotation-y={Math.PI / 2} visible={reach > 0.98}><circleGeometry args={[0.008, 16]} /><meshBasicMaterial color={clear > 0.3 ? '#ffffff' : '#dff6ff'} /></mesh></>; })()}
    </group>
  );
};

/* a duct trench in the miniature city: the cable lies in it, with soft out-of-focus city lights behind */
const Set: React.FC = () => (
  <group>
    <mesh rotation-x={-Math.PI / 2} position={[0, -1.02, 0]}><planeGeometry args={[160, 60]} /><meshStandardMaterial color="#12173c" roughness={0.9} /></mesh>
    {[-1].map((s) => <mesh key={s} position={[-20, -0.2, s * 3.4 - 1.2]}><boxGeometry args={[90, 1.7, 0.5]} /><meshStandardMaterial color="#1b2152" roughness={0.85} /></mesh>)}
    {Array.from({ length: 16 }).map((_, i) => <mesh key={i} position={[-44 + i * 5.6, -1.0, -1.2]} rotation-x={-Math.PI / 2}><planeGeometry args={[0.16, 6.4]} /><meshStandardMaterial color="#232a66" roughness={0.9} /></mesh>)}
    {Array.from({ length: 46 }).map((_, i) => <mesh key={i} position={[-46 + hash(i) * 80, 1.5 + hash(i + 7) * 9, -22 - hash(i + 3) * 16]}><circleGeometry args={[0.5 + hash(i + 11) * 0.9, 20]} /><meshBasicMaterial color={i % 4 === 0 ? '#8f7be0' : i % 4 === 1 ? '#5fe3ff' : '#ffc46a'} transparent opacity={0.1 + hash(i + 5) * 0.16} /></mesh>)}
  </group>
);

/* ---------- inside the glass ---------- */
const wallMat = () => new THREE.ShaderMaterial({ side: THREE.BackSide, transparent: true, uniforms: { uS: { value: 0 }, uLen: { value: RIDE_LEN }, uP: { value: new Float32Array(10) }, uA: { value: 0 }, uSpd: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `varying vec2 vUv; uniform float uS; uniform float uLen; uniform float uP[10]; uniform float uA; uniform float uSpd;
    void main(){ float x = vUv.x * uLen; float a = vUv.y;
      vec3 base = mix(vec3(.05, .08, .24), vec3(.08, .15, .36), .5 + .5 * sin(a * 6.283 * 2.));
      float streak = pow(.5 + .5 * sin(a * 6.283 * 5. + sin(x * .05) * 2.), 30.) * .1;                       // long soft reflections down the glass
      float ringv = smoothstep(.92, 1., 1. - abs(fract(x / 6.) - .5) * 2.) * .0 + smoothstep(.02, 0., abs(fract(x / 8.) - .5)) * (.1 + uSpd * .08);
      vec3 c = base + vec3(.5, .8, 1.) * streak + vec3(.35, .6, .9) * ringv;
      for (int i = 0; i < 10; i++) { float d = abs(x - uP[i]); c += vec3(.25, .78, 1.) * exp(-d * d / 40.) * .13; }     // each pulse lights the glass around it
      float da = abs(x - uA); c += vec3(1., .66, .25) * exp(-da * da / 50.) * .26;
      float fog = smoothstep(150., 10., abs(x - uS)); c = pow(c * (0.3 + 0.7 * fog), vec3(2.2)); gl_FragColor = vec4(c, 1.); }` });
const Ride: React.FC<{ t: number }> = ({ t }) => {
  const tube = useMemo(() => new THREE.TubeGeometry(RIDE, 900, 4, 48, false), []);
  const clad = useMemo(() => new THREE.TubeGeometry(RIDE, 500, 4.6, 28, false), []);
  const coreG = useMemo(() => new THREE.TubeGeometry(RIDE, 900, 0.5, 20, false), []);
  const coreM = useMemo(() => glassMat('#9fe6ff', 0.07, 0.55), []);
  const wall = useMemo(wallMat, []);
  const s = rideS(t), uu = clamp01((t - T_IN) / (T_OUT - T_IN)), sA = s + AMBER_LEAD(t);
  /* cyan data pulses: a fixed train that travels a little faster than the camera at first, so they stream past and ahead */
  const drift = (t - T_IN) * 9;
  const P = Array.from({ length: 10 }).map((_, i) => s - 30 + ((i * 17.3 + drift + hash(i) * 6) % 150));
  wall.uniforms.uS.value = s; (wall.uniforms.uP.value as Float32Array).set(P.map((d) => (d < s - 6 ? -9999 : d))); wall.uniforms.uA.value = sA; wall.uniforms.uSpd.value = seg(uu, 0.5, 1);
  const at = (d: number) => { const u = clamp01(d / RIDE_LEN), p = RIDE.getPointAt(u), q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), RIDE.getTangentAt(u)); return { p, q }; };
  const A = at(sA), stretch = 1 + seg(uu, 0.55, 1) * 3.5;
  return (
    <group>
      <mesh geometry={clad}><meshBasicMaterial color="#060a24" side={THREE.BackSide} /></mesh>
      <mesh geometry={tube} material={wall} />
      <mesh geometry={coreG} material={coreM} renderOrder={2} />
      {P.map((d, i) => { if (d < s - 6 || d > RIDE_LEN - 2) return null; const k = at(d); return <group key={i} position={k.p} quaternion={k.q}>
        <mesh scale={[1, stretch, 1]}><capsuleGeometry args={[0.2, 2.4, 6, 14]} /><meshBasicMaterial color="#7fdcf5" transparent opacity={0.95} /></mesh>
        <mesh scale={[1, stretch, 1]}><capsuleGeometry args={[0.42, 2.9, 6, 14]} /><meshBasicMaterial color="#39c8ff" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh></group>; })}
      {/* the amber group: the piece of the video we are following */}
      <group position={A.p} quaternion={A.q}>
        {[-1.5, 0, 1.5].map((o, i) => <group key={i} position={[0, o * (0.9 + (stretch - 1) * 0.5), 0]}>
          <mesh scale={[1, stretch * 0.6, 1]}><capsuleGeometry args={[0.22, 0.8, 6, 14]} /><meshBasicMaterial color="#ffc46a" /></mesh>
          <mesh scale={[1, stretch * 0.6, 1]}><capsuleGeometry args={[0.44, 1.1, 6, 14]} /><meshBasicMaterial color="#ffa93a" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh></group>)}
      </group>
    </group>
  );
};

/* ---------- labels drawn over the picture, pinned to points in the 3D scene ---------- */
const project = (t: number, p: THREE.Vector3): [number, number] => { const c = camAt(t), cam = new THREE.PerspectiveCamera(c.fov, W / H, 0.01, 900); cam.position.copy(c.p); cam.lookAt(c.l); cam.updateMatrixWorld(); cam.updateProjectionMatrix(); const q = p.clone().project(cam); return [(q.x * 0.5 + 0.5) * W, (-q.y * 0.5 + 0.5) * H]; };
const Tag: React.FC<{ t: number; at: THREE.Vector3; text: string; sub?: string; a: number; b: number; dx?: number; dy?: number; col?: string }> = ({ t, at, text, sub, a, b, dx = 0, dy = -150, col = '#5fe3ff' }) => {
  const o = seg(t, a, a + 0.4) * (1 - seg(t, b - 0.4, b)); if (o <= 0.001) return null; const [x, y] = project(t, at), w = Math.max(text.length * 19 + 44, (sub?.length ?? 0) * 11.5 + 44), lx = x + dx, ly = y + dy;
  return <g opacity={o}><line x1={x} y1={y} x2={lx} y2={ly + (dy < 0 ? 30 : -30)} stroke={col} strokeWidth={2.5} /><circle cx={x} cy={y} r={6} fill={col} stroke="#070a22" strokeWidth={2.5} />
    <g transform={`translate(${lx} ${ly})`}><rect x={-w / 2} y={-30} width={w} height={sub ? 76 : 56} rx={12} fill="#0e1430" fillOpacity={0.92} stroke={col} strokeWidth={2.5} />
      <text y={7} textAnchor="middle" fill="#eef1ff" style={{ font: `800 28px ${FONT.ui}`, letterSpacing: '0.06em' }}>{text}</text>
      {sub && <text y={34} textAnchor="middle" fill="#a9b4dd" style={{ font: `500 18px ${FONT.mono}` }}>{sub}</text>}</g></g>;
};

export const FiberJourney: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS, ins = inside(t);
  /* a short white-cyan bloom hides the change of scale as the camera goes through the glass face */
  const flash = Math.max(1 - Math.abs(t - T_IN) / 0.35, 1 - Math.abs(t - T_OUT) / 0.35, 0);
  const [, hty] = [0, 0]; void hty;
  const heroTip = V(3.05, 0, 0.06);
  return (
    <AbsoluteFill style={{ background: COL.navy }}>
      <ThreeCanvas width={W} height={H} gl={{ antialias: true }} camera={{ fov: 30, near: 0.01, far: 900 }}>
        <Cam t={t} />
        <color attach="background" args={[ins ? '#03051a' : '#0a0d2c']} />
        {!ins && <fog attach="fog" args={['#0a0d2c', 18, 70]} />}
        <hemisphereLight args={['#93a2ff', '#1a1040', 0.9]} />
        <directionalLight position={[6, 9, 8]} intensity={1.7} color="#ffe9c9" />
        <directionalLight position={[-8, 3, -6]} intensity={0.9} color="#5fe3ff" />
        <pointLight position={[3, 0.6, 1.2]} intensity={seg(t, 11, 13) * 2.2} color="#5fe3ff" distance={5} />
        {!ins && <><Set /><Cable t={t < T_IN ? t : 14} /></>}
        {ins && <Ride t={t} />}
        <EffectComposer><Bloom intensity={ins ? 0.7 : 0.6} luminanceThreshold={ins ? 0.75 : 0.8} luminanceSmoothing={0.2} mipmapBlur /><Vignette eskil={false} offset={0.22} darkness={0.72} /></EffectComposer>
      </ThreeCanvas>
      <AbsoluteFill style={{ background: '#d9f7ff', opacity: flash * 0.9 }} />
      <AbsoluteFill><svg width={W} height={H}>
        {!ins && t < T_IN && <>
          <Tag t={t} at={V(-6.2, 1, 0)} text="OUTER JACKET" sub="keeps water and knocks out" a={4.4} b={9.4} dx={-60} />
          <Tag t={t} at={V(-4.5, 0.86, 0)} text="STRENGTH YARN" sub="takes the pull, not the glass" a={5.6} b={9.4} dx={10} dy={-210} />
          <Tag t={t} at={V(-2.1, -0.2, 0.55)} text="LOOSE TUBES" sub="colour coded" a={7.2} b={9.4} dx={40} dy={190} />
          <Tag t={t} at={V(0.6, 0.25, 0.3)} text="GLASS FIBRES" sub="each one thinner than a hair" a={9.0} b={11.2} dx={-160} dy={-200} />
          <Tag t={t} at={V(2.05, 0, 0.06)} text="COATING" a={11.6} b={15.0} dx={-230} dy={-170} col="#ff9a3d" />
          <Tag t={t} at={V(2.55, 0.02, 0.06)} text="GLASS CLADDING" sub="keeps the light in" a={12.2} b={15.0} dx={-60} dy={190} />
          <Tag t={t} at={heroTip} text="GLASS CORE" sub="the light travels here" a={12.9} b={15.0} dx={150} dy={-160} col="#ffb454" />
        </>}
      </svg></AbsoluteFill>
    </AbsoluteFill>
  );
};
