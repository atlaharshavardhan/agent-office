import React, { useLayoutEffect, useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { geoEquirectangular, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
// @ts-ignore
import land110 from 'world-atlas/land-110m.json';
import { FPS, clamp01, lerp, smooth, hash } from '../lib/anim';
import { F, vfov, tr, clampX, EDGE } from './frame';
import { FONT } from '../lib/palette';
import { WEB, MAIN as MAIN_MUMBAI, MUMBAI, LONDON, HYD, routePts, LL } from '../tail/Globe';
/* Part 2 (decided 28 Nov): the photo leaves Hyderabad, crosses the sea and lands in London (drawn straight from Hyderabad, simplified) */
export const MAIN: LL[] = [HYD, ...MAIN_MUMBAI];

/* V4, 16:9: the planet and its cables. From low over the Arabian Sea the camera pulls back until the whole Earth is in view,
   the web of undersea cables lighting up as it goes, our own route in amber. A real 3D globe with real coastlines. */
export const R = 10;
export const PLANET_FRAMES = 360;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/* the Part 2 hook turns the globe once and shows the cables only later: it sets these (lon = camera longitude by time, show = how much of the cable web and our route is visible, 0 to 1) */
export const ov: { lon: null | ((t: number) => number); show: null | ((t: number) => number); pins: null | number; thin?: boolean } = { lon: null, show: null, pins: null, thin: false };   // thin = Harsh: a thin edge on the globe and a few clear stars (hook v9)
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const ll = (p: LL, r = R) => { const la = (p[1] * Math.PI) / 180, lo = (p[0] * Math.PI) / 180; return V(r * Math.cos(la) * Math.cos(lo), r * Math.sin(la), -r * Math.cos(la) * Math.sin(lo)); };
const CITIES: LL[] = [MUMBAI, LONDON, [78.5, 17.4], [77.2, 28.6], [77.6, 13], [80.3, 13.1], [88.4, 22.6], [67, 24.9], [55.3, 25.3], [46.7, 24.7], [51.4, 35.7], [31.2, 30], [29, 41], [37.6, 55.8], [2.35, 48.9], [13.4, 52.5], [-3.7, 40.4], [12.5, 41.9], [103.8, 1.3], [114.2, 22.3], [121.5, 31.2], [139.8, 35.7], [126.9, 37.5], [116.4, 39.9], [100.5, 13.8], [106.8, -6.2], [151.2, -33.9], [144.9, -37.8], [18.4, -33.9], [28, -26.2], [3.4, 6.4], [36.8, -1.3], [-74, 40.7], [-118.2, 34], [-87.6, 41.9], [-99.1, 19.4], [-46.6, -23.5], [-58.4, -34.6], [-43.2, -22.9], [-79.4, 43.7], [-122.4, 37.8], [-80.2, 25.8]];

/* the Earth's surface, drawn once: night-blue sea, our purple land, warm city lights */
export const earthTex = () => { const c = document.createElement('canvas'); c.width = 4096; c.height = 2048; const g = c.getContext('2d')!; const proj = geoEquirectangular().fitSize([4096, 2048], { type: 'Sphere' } as any), path = geoPath(proj, g);
  const sea = g.createLinearGradient(0, 0, 0, 2048); sea.addColorStop(0, '#0d1660'); sea.addColorStop(0.5, '#101c72'); sea.addColorStop(1, '#0d1660'); g.fillStyle = sea; g.fillRect(0, 0, 4096, 2048);
  g.beginPath(); path(geoGraticule10() as any); g.strokeStyle = 'rgba(160,176,255,.10)'; g.lineWidth = 2; g.stroke();
  const land = feature(land110 as any, (land110 as any).objects.land) as any;
  g.beginPath(); path(land); g.fillStyle = '#3e3596'; g.fill(); g.strokeStyle = '#9a8cf0'; g.lineWidth = 3; g.lineJoin = 'round'; g.stroke();
  CITIES.forEach((p, i) => { const [x, y] = proj(p)!; const gr = g.createRadialGradient(x, y, 0, x, y, 26); gr.addColorStop(0, 'rgba(255,240,200,.95)'); gr.addColorStop(0.3, 'rgba(255,205,120,.45)'); gr.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = gr; g.fillRect(x - 26, y - 26, 52, 52);
    for (let k = 0; k < 9; k++) { g.fillStyle = 'rgba(255,220,150,.8)'; g.fillRect(x + (hash(i * 9 + k) - 0.5) * 60, y + (hash(i * 5 + k + 3) - 0.5) * 44, 3, 3); } });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
export const atmoMat = () => new THREE.ShaderMaterial({ transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
  fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float f = pow(clamp(1. - abs(dot(normalize(vN), normalize(vV))), 0., 1.), 2.6); gl_FragColor = vec4(vec3(.25, .6, 1.) * f * 0.9, f * 0.7); }' });

type CK = { t: number; lon: number; lat: number; d: number; tl: LL | null; fov: number };
const CAM: CK[] = [
  { t: 0, lon: 70, lat: 4, d: 12.4, tl: [58, 15], fov: 46 },        // low over the Arabian Sea, the cable heading for the Red Sea
  { t: 3.2, lon: 60, lat: 6, d: 14.5, tl: [44, 20], fov: 44 },
  { t: 6.6, lon: 42, lat: 20, d: 30, tl: null, fov: 40 },            // back and up: the whole Earth and the web
  { t: 12, lon: 14, lat: 26, d: 31, tl: null, fov: 40 },             // slow drift round towards Europe
];
const camAt = (t: number) => { let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1].t) i++; const a = CAM[i], b = CAM[i + 1], u = smooth((t - a.t) / (b.t - a.t));
  const far = F.v ? 0.86 : 1, p = ll([ov.lon ? ov.lon(t) : lerp(a.lon, b.lon, u), lerp(a.lat, b.lat, u)], lerp(a.d * (a.tl ? 1 : far), b.d * (b.tl ? 1 : far), u)), ta = a.tl ? ll(a.tl) : V(0, 0, 0), tb = b.tl ? ll(b.tl) : V(0, 0, 0); return { p, l: ta.lerp(tb, u), fov: lerp(a.fov, b.fov, u) }; };
/* once the whole Earth is in view it sits left of centre, leaving the right side for the words */
const shift = (t: number) => (F.v ? 0 : 330 * seg(t, 3.6, 6.6));
/* in the Short the Earth drops a little instead, leaving the top for the words */
const shiftY = (t: number) => (F.v ? 190 * seg(t, 3.6, 6.6) : 0);
const Cam: React.FC<{ t: number }> = ({ t }) => { const { camera } = useThree(); useLayoutEffect(() => { const c = camAt(t), cam = camera as THREE.PerspectiveCamera; cam.position.copy(c.p); cam.fov = vfov(c.fov); cam.near = 0.1; cam.far = 600; cam.up.set(0, 1, 0); cam.lookAt(c.l); cam.setViewOffset(F.W, F.H, shift(t), -shiftY(t), F.W, F.H); cam.updateProjectionMatrix(); }, [t, camera]); return null; };

const curveOf = (r: LL[], lift = 1.006) => new THREE.CatmullRomCurve3(routePts(r, 1, 0.02).map((p) => ll(p as LL, R * lift)));
const MAIN_C = curveOf(MAIN, 1.008);
const mainU = (t: number) => clamp01((t - 0.6) / 8.6) ** 0.9;      // how far along its route our light is

const Earth: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(earthTex, []), atmo = useMemo(atmoMat, []), atmoThin = useMemo(() => new THREE.ShaderMaterial({ transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending, vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }', fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float f = pow(clamp(1. - abs(dot(normalize(vN), normalize(vV))), 0., 1.), 5.0); gl_FragColor = vec4(vec3(.35, .65, 1.) * f * 0.55, f * 0.45); }' }), []);
  const web = useMemo(() => WEB.map((r) => { const c = curveOf(r); return { c, g: new THREE.TubeGeometry(c, Math.max(20, Math.round(c.getLength() * 8)), 0.03, 6, false) }; }), []);
  const mainG = useMemo(() => new THREE.TubeGeometry(MAIN_C, 500, 0.05, 8, false), []), mainThin = useMemo(() => new THREE.TubeGeometry(MAIN_C, 500, 0.018, 8, false), []), mainDim = useMemo(() => new THREE.TubeGeometry(MAIN_C, 500, 0.024, 6, false), []);
  const glow = useMemo(() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.2, 'rgba(255,190,90,.7)'); gr.addColorStop(0.55, 'rgba(255,150,40,.16)'); gr.addColorStop(1, 'rgba(255,140,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const x = new THREE.CanvasTexture(c); x.colorSpace = THREE.SRGBColorSpace; return x; }, []);
  const u = mainU(t); mainG.setDrawRange(0, Math.floor((mainG.index!.count * u) / 3) * 3); mainThin.setDrawRange(0, Math.floor((mainThin.index!.count * u) / 3) * 3);
  const head = MAIN_C.getPointAt(u), zoom = seg(t, 3.2, 6.6);
  return <group>
    <mesh><sphereGeometry args={[R, 96, 64]} /><meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.9} /></mesh>
    <mesh material={ov.thin ? atmoThin : atmo}><sphereGeometry args={[R * (ov.thin ? 1.012 : 1.045), 64, 48]} /></mesh>
    {/* the world's cables: dim cyan, lighting up one after another as the camera pulls back */}
    {web.map((w, i) => { const on = seg(t, 4.2 + i * 0.09, 5.0 + i * 0.09); w.g.setDrawRange(0, Math.floor((w.g.index!.count * on) / 3) * 3); const pu = ((t * 0.16 + hash(i) * 5) % 1 + 1) % 1, pp = w.c.getPointAt(pu);
      return <group key={i}><mesh geometry={w.g}><meshBasicMaterial color="#6fd0ff" transparent opacity={0.8 * (ov.show ? ov.show(t) : 1)} /></mesh>{on > 0.95 && <mesh position={pp}><sphereGeometry args={[0.055, 8, 8]} /><meshBasicMaterial color="#dff6ff" /></mesh>}</group>; })}
    <mesh geometry={mainDim} visible={!ov.show || ov.show(t) > 0.5}><meshBasicMaterial color="#5fb8ff" transparent opacity={0.4} /></mesh>
    <mesh geometry={mainG} visible={zoom > 0.45 && (!ov.show || ov.show(t) > 0.5)}><meshBasicMaterial color="#ffc24a" /></mesh>
    <mesh geometry={mainThin} visible={zoom <= 0.45 && (!ov.show || ov.show(t) > 0.5)}><meshBasicMaterial color="#ffc24a" /></mesh>
    <group position={head}><sprite scale={[lerp(0.45, 2.2, zoom), lerp(0.45, 2.2, zoom), 1]}><spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></sprite><mesh><sphereGeometry args={[lerp(0.028, 0.1, zoom), 10, 8]} /><meshBasicMaterial color="#fff0c8" /></mesh></group>
    {[LONDON, HYD].map((p, i) => <mesh key={i} position={ll(p, R * 1.01)}><sphereGeometry args={[0.1, 12, 10]} /><meshBasicMaterial color={i ? '#ffe08a' : '#ff9c8a'} /></mesh>)}
  </group>;
};
const Stars: React.FC = () => <>{Array.from({ length: ov.thin ? 70 : 260 }).map((_, i) => { const a = hash(i) * 6.283, b = Math.acos(2 * hash(i + 7) - 1), r = 260; return <mesh key={i} position={[r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)]}><sphereGeometry args={[(ov.thin ? 0.55 : 0.25) + hash(i + 3) * (ov.thin ? 0.7 : 0.5), 6, 6]} /><meshBasicMaterial color="#e6ebff" fog={false} /></mesh>; })}</>;

export const project = (t: number, p: THREE.Vector3): [number, number, boolean] => { const c = camAt(t), cam = new THREE.PerspectiveCamera(vfov(c.fov), F.W / F.H, 0.1, 600); cam.position.copy(c.p); cam.lookAt(c.l); cam.updateMatrixWorld(); const q = p.clone().project(cam); q.x -= (shift(t) / F.W) * 2; const front = p.clone().normalize().dot(c.p.clone().normalize()) > 0.18; return [(q.x * 0.5 + 0.5) * F.W, (-q.y * 0.5 + 0.5) * F.H + shiftY(t), front]; };
/* a Google Maps style pin: red teardrop with a white dot, its tip exactly on the city, name beside it */
const Pin: React.FC<{ t: number; at: LL; name: string; col: string; a: number; dx: number; dy: number }> = ({ t, at, name, a, dx }) => { const [x, y, front] = project(t, ll(at, R * 1.01)), aa = ov.pins != null ? ov.pins + (name === 'HYDERABAD' ? 0.3 : 0) : a, o = seg(t, aa, aa + 0.4) * (front ? 1 : 0); if (o < 0.01) return null;
  const drop = 1 - seg(t, aa, aa + 0.5), side = dx < 0 ? -1 : 1, w = name.length * 19 + 20, ly = y - 50, lx = clampX(x + side * (64 + w / 2), w + 40);
  return <g opacity={o}>
    <ellipse cx={x} cy={y} rx={16} ry={6} fill="#000" opacity={0.45} />
    <g transform={`translate(${x} ${y - drop * 70}) scale(${0.8 + 0.2 * (1 - drop)})`}>
      <path d="M 0 0 C -8 -16 -30 -30 -30 -56 A 30 30 0 1 1 30 -56 C 30 -30 8 -16 0 0 Z" fill="#ea4335" stroke="#a52714" strokeWidth={3} strokeLinejoin="round" />
      <circle cx={0} cy={-56} r={12} fill="#fff" /></g>
    <text x={lx} y={ly + 10} textAnchor="middle" fill="#fff" style={{ font: `800 34px ${FONT.ui}`, letterSpacing: '0.05em', paintOrder: 'stroke', stroke: '#070a22', strokeWidth: 8, strokeLinejoin: 'round' }}>{name}</text>
  </g>; };

export const Planet: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  return (
    <AbsoluteFill style={{ background: '#03041a' }}>
      <ThreeCanvas width={F.W} height={F.H} gl={{ antialias: true }} camera={{ fov: 44, near: 0.1, far: 600 }}>
        <Cam t={t} />
        <color attach="background" args={['#03041a']} />
        <ambientLight intensity={0.5} color="#8f9cff" />
        <directionalLight position={[40, 26, 6]} intensity={1.6} color="#dfe6ff" />
        <Stars /><Earth t={t} />
        <EffectComposer><Bloom intensity={0.6} luminanceThreshold={0.8} luminanceSmoothing={0.2} mipmapBlur /><Vignette eskil={false} offset={0.25} darkness={0.7} /></EffectComposer>
      </ThreeCanvas>
      <AbsoluteFill><svg width={F.W} height={F.H}>
        <Pin t={t} at={LONDON} name="LONDON" col="#ff9c8a" a={5.6} dx={110} dy={-80} />
        <Pin t={t} at={HYD} name="HYDERABAD" col="#ffe08a" a={0.4} dx={-200} dy={-110} />
        <g opacity={seg(t, 0.5, 0.9) * (1 - seg(t, 3.6, 4.1))} {...EDGE} transform={tr(120, 890)}><text fill="#eef1ff" style={{ font: `800 54px ${FONT.ui}` }}>Arabian Sea</text><text y={46} fill="#ffc24a" style={{ font: `500 30px ${FONT.mono}` }}>our packet, on its way to the Red Sea</text></g>
      </svg></AbsoluteFill>
    </AbsoluteFill>
  );
};
