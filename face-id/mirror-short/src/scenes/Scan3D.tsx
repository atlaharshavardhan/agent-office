import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, interpolate, staticFile } from 'remotion';
import * as THREE from 'three';
import data from '../dots3d.json';
import { C, FONT, Label, clamp, ramp } from '../theme';

// Real 3D scan scene (Three.js). g = frames since the close-up starts; it runs through the end
// of scene 2 (g 0..79) and all of scene 3 (g 79..349).
//  0– 60  dots leave the phone's projector, fly through space and land on the face
// 79–190  camera swings round the nose and eye socket (callouts)
// 195–215 the camera "reads" the pattern: dots turn cyan (depth points)
// 244–252 the face becomes a shaded depth map, still in 3D, and the camera orbits it
type D4 = [number, number, number, number];
const DOTS = data.dots as D4[];
const N = DOTS.length;
const NOSE = new THREE.Vector3(...(data.nose as [number, number, number]));
const EYE = new THREE.Vector3(...(data.eye as [number, number, number]));
const CYAN = '#7fe3ea';
const FOV = 30;

// ---- phone placement: in front of his face, turned a little toward us so the screen reads ----
const FACE_DIR = new THREE.Vector3(-0.57, 0, 0.82);
const PHONE_POS = NOSE.clone().addScaledVector(FACE_DIR, 330).add(new THREE.Vector3(0, -30, 0));
const phoneObj = new THREE.Object3D();
phoneObj.position.copy(PHONE_POS);
const PROJ_LOCAL = new THREE.Vector3(0, 146 * 0.85, 9);

// ---- camera path --------------------------------------------------------------------------
const KEYS = { g: [0, 79, 190, 245, 300, 349], az: [17, 7, -6, -14, 22, 8], el: [4, 2, 0, 1, 3, 2], dist: [3000, 2550, 1550, 1750, 1950, 2050],
  tx: [-110, -100, 10, -70, -40, -50], ty: [90, 80, 130, 110, 90, 90], tz: [140, 140, 190, 150, 120, 120] };
const smooth = (g: number, v: number[]) => {
  for (let i = 0; i < KEYS.g.length - 1; i++) if (g <= KEYS.g[i + 1] || i === KEYS.g.length - 2) {
    const u = Math.min(1, Math.max(0, (g - KEYS.g[i]) / (KEYS.g[i + 1] - KEYS.g[i]))), e = u * u * (3 - 2 * u);
    return v[i] + (v[i + 1] - v[i]) * e;
  }
  return v[v.length - 1];
};
const makeCamera = (g: number) => {
  const cam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 10, 8000);
  const az = (smooth(g, KEYS.az) * Math.PI) / 180, el = (smooth(g, KEYS.el) * Math.PI) / 180, d = smooth(g, KEYS.dist);
  const t = new THREE.Vector3(smooth(g, KEYS.tx), smooth(g, KEYS.ty), smooth(g, KEYS.tz));
  cam.position.set(t.x + d * Math.sin(az) * Math.cos(el), t.y + d * Math.sin(el), t.z + d * Math.cos(az) * Math.cos(el));
  cam.lookAt(t); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  return cam;
};
const toScreen = (cam: THREE.Camera, p: THREE.Vector3) => { const v = p.clone().project(cam); return [(v.x + 1) * 540, (1 - v.y) * 960]; };

// ---- textures -----------------------------------------------------------------------------
const useTex = (file: string) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [h] = useState(() => delayRender('texture ' + file));
  useEffect(() => { new THREE.TextureLoader().load(staticFile(file), (t) => { setTex(t); continueRender(h); }); }, [file, h]);
  return tex;
};

const FACE_VS = `uniform sampler2D uRelief; uniform float uZS; varying vec2 vUv;
void main(){ vUv = uv; vec3 p = position; p.z += texture2D(uRelief, uv).r * uZS; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`;
const FACE_FS = `uniform sampler2D uFace; uniform sampler2D uRelief; uniform float uDepth; uniform float uDim; varying vec2 vUv;
void main(){ vec4 r = texture2D(uRelief, vUv); if (r.g < 0.5) discard;
  vec3 f = texture2D(uFace, vUv).rgb; float l = dot(f, vec3(0.3, 0.6, 0.1)); f = mix(f, vec3(l), 0.45) * uDim;
  vec3 d = vec3(pow(r.b, 0.85) * 1.12);
  gl_FragColor = vec4(mix(f, d, uDepth), 1.0); }`;
const PT_VS = `attribute float aSize; attribute vec3 aCol; uniform float uScale; varying vec3 vCol;
void main(){ vCol = aCol; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`;
const PT_FS = `varying vec3 vCol; uniform float uO;
void main(){ float r = length(gl_PointCoord - 0.5) * 2.0; if (r > 1.0) discard; float a = smoothstep(1.0, 0.35, r);
  gl_FragColor = vec4(mix(vCol, vec3(1.0), smoothstep(0.5, 0.0, r) * 0.7) * a * uO, a * uO); }`;

const launchOf = (d: D4) => 3 + ((430 - d[1]) / 650) * 34 + d[3] * 5;   // forehead first, sweeping down
const FLIGHT = 11;
const cyanAt = (d: D4) => 195 + ((d[0] + 240) / 560) * 16 + d[3] * 4;
const RED = new THREE.Color(C.ir), CY = new THREE.Color(CYAN);

const Inner: React.FC<{ g: number; cam: THREE.PerspectiveCamera; face: THREE.Texture; relief: THREE.Texture }> = ({ g, cam, face, relief }) => {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.copy(cam.position); camera.quaternion.copy(cam.quaternion);
    camera.fov = FOV; camera.near = 10; camera.far = 8000; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  }, [cam, camera]);

  // phone looks at a point between his face and us
  phoneObj.lookAt(NOSE.clone().lerp(cam.position, 0.3));
  phoneObj.updateMatrixWorld();
  const proj = phoneObj.localToWorld(PROJ_LOCAL.clone());

  const faceMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: FACE_VS, fragmentShader: FACE_FS,
    uniforms: { uFace: { value: face }, uRelief: { value: relief }, uZS: { value: data.zs }, uDepth: { value: 0 }, uDim: { value: 0.42 } } }), [face, relief]);
  faceMat.uniforms.uDepth.value = ramp(g, 244, 252);

  const pts = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(N), 1));
    geo.setAttribute('aCol', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    const mat = new THREE.ShaderMaterial({ vertexShader: PT_VS, fragmentShader: PT_FS, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, uniforms: { uScale: { value: 1 }, uO: { value: 1 } } });
    return { geo, mat };
  }, []);
  const RAYS = 300;
  const rays = useMemo(() => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(RAYS * 6), 3)); return geo; }, []);

  const pos = pts.geo.attributes.position.array as Float32Array, size = pts.geo.attributes.aSize.array as Float32Array, col = pts.geo.attributes.aCol.array as Float32Array;
  for (let i = 0; i < N; i++) {
    const d = DOTS[i], p = Math.min(1, Math.max(0, (g - launchOf(d)) / FLIGHT));
    const e = p * p * (3 - 2 * p);
    pos[i * 3] = proj.x + (d[0] - proj.x) * e; pos[i * 3 + 1] = proj.y + (d[1] - proj.y) * e; pos[i * 3 + 2] = proj.z + (d[2] + 4 - proj.z) * e;
    const land = ramp(g, launchOf(d) + FLIGHT, launchOf(d) + FLIGHT + 5);
    size[i] = p <= 0 ? 0 : p < 1 ? 6.5 : 4.2 * (1 + 0.9 * (1 - land));
    const c = g >= cyanAt(d) ? CY : RED;
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  pts.geo.attributes.position.needsUpdate = true; pts.geo.attributes.aSize.needsUpdate = true; pts.geo.attributes.aCol.needsUpdate = true;
  pts.mat.uniforms.uScale.value = gl.domElement.height / (2 * Math.tan((FOV * Math.PI) / 360));
  pts.mat.uniforms.uO.value = 1 - ramp(g, 248, 258);

  const rp = rays.attributes.position.array as Float32Array;
  const stride = Math.floor(N / RAYS), off = Math.floor(g / 2) % stride;
  for (let k = 0; k < RAYS; k++) {
    const d = DOTS[(k * stride + off) % N], on = g >= launchOf(d) + FLIGHT;
    rp[k * 6] = proj.x; rp[k * 6 + 1] = proj.y; rp[k * 6 + 2] = proj.z;
    rp[k * 6 + 3] = on ? d[0] : proj.x; rp[k * 6 + 4] = on ? d[1] : proj.y; rp[k * 6 + 5] = on ? d[2] + 4 : proj.z;
  }
  rays.attributes.position.needsUpdate = true;
  const rayO = 0.2 * ramp(g, 4, 10) * (1 - ramp(g, 186, 196));

  return (
    <>
      <mesh material={faceMat}><planeGeometry args={[data.w, data.h, 250, 446]} /></mesh>
      <lineSegments geometry={rays}><lineBasicMaterial color={C.ir} transparent opacity={rayO} blending={THREE.AdditiveBlending} depthWrite={false} /></lineSegments>
      <points geometry={pts.geo} material={pts.mat} frustumCulled={false} />
      {/* phone */}
      <group position={phoneObj.position} quaternion={phoneObj.quaternion} scale={0.85} visible={g < 198}>
        <mesh><boxGeometry args={[162, 338, 14]} /><meshBasicMaterial color="#2a2726" /></mesh>
        <mesh position={[0, 0, 7.4]}><planeGeometry args={[150, 326]} /><meshBasicMaterial color="#4a3f78" /></mesh>
        <mesh position={[0, 146, 7.8]}><planeGeometry args={[50, 15]} /><meshBasicMaterial color="#050505" /></mesh>
        <mesh position={[0, 146, 8.2]}><circleGeometry args={[5, 20]} /><meshBasicMaterial color="#ffffff" /></mesh>
        <mesh position={[0, 146, 8.1]}><circleGeometry args={[16, 24]} /><meshBasicMaterial color={C.ir} transparent opacity={0.75 * (1 - ramp(g, 186, 196))} blending={THREE.AdditiveBlending} /></mesh>
      </group>
    </>
  );
};

const Call: React.FC<{ title: string; sub: string; x: number; y: number; o: number }> = ({ title, sub, x, y, o }) => (
  <div style={{ position: 'absolute', left: x, top: y, opacity: o, padding: '12px 18px', background: 'rgba(10,8,7,.6)', borderRadius: 10 }}>
    <div style={{ font: `800 32px/1 ${FONT}`, letterSpacing: '0.14em', color: '#fff' }}>{title}</div>
    <div style={{ font: `600 27px/1 ${FONT}`, color: '#c9c2bb', marginTop: 10 }}>{sub}</div>
  </div>
);

export const Scan3D: React.FC<{ g: number }> = ({ g }) => {
  const face = useTex('face_34.png'), relief = useTex('relief.png');
  const cam = useMemo(() => makeCamera(g), [g]);
  const [nx, ny] = toScreen(cam, NOSE), [ex, ey] = toScreen(cam, EYE);
  const dotsStat = ramp(g, 44, 48) * (1 - ramp(g, 84, 88));
  const early = ramp(g, 96, 100) * (1 - ramp(g, 184, 188));
  const cyStat = ramp(g, 206, 210) * (1 - ramp(g, 240, 244));
  const late = ramp(g, 262, 266);
  return (
    <AbsoluteFill style={{ backgroundColor: '#070606' }}>
      <ThreeCanvas width={1080} height={1920} linear flat gl={{ antialias: true }} camera={{ fov: FOV, near: 10, far: 8000 }}>
        {face && relief && <Inner g={g} cam={cam} face={face} relief={relief} />}
      </ThreeCanvas>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={early} stroke="#fff" strokeWidth={2.5} fill="#fff">
          <path d={`M 300 640 L ${ex} ${ey}`} fill="none" /><circle cx={ex} cy={ey} r={7} />
          <path d={`M 200 1330 L ${nx} ${ny}`} fill="none" /><circle cx={nx} cy={ny} r={7} />
        </g>
        <g opacity={late} stroke={C.label} strokeWidth={3} fill={C.label}>
          <path d={`M 250 1330 L ${nx} ${ny}`} fill="none" /><circle cx={nx} cy={ny} r={9} />
          <path d={`M 260 640 L ${ex} ${ey}`} fill="none" /><circle cx={ex} cy={ey} r={9} />
        </g>
      </svg>
      <Call title="EYE SOCKET" sub="farther: the pattern shifts less" x={70} y={560} o={early} />
      <Call title="NOSE" sub="closer: the pattern shifts more" x={70} y={1330} o={early} />
      <div style={{ position: 'absolute', left: 70, width: 870, top: 1425, textAlign: 'center', opacity: dotsStat, color: C.ir, font: `800 112px/1 ${FONT}` }}>
        30,000+ <span style={{ fontSize: 46, letterSpacing: '0.06em' }}>DOTS</span>
      </div>
      <div style={{ position: 'absolute', left: 70, width: 870, top: 1425, textAlign: 'center', opacity: cyStat, color: CYAN, font: `800 104px/1 ${FONT}` }}>
        30,000+ <span style={{ fontSize: 42, letterSpacing: '0.06em' }}>DEPTH POINTS</span>
      </div>
      <Label text="EYES · SET BACK" x={90} y={590} o={late} size={30} />
      <Label text="NOSE · CLOSEST" x={90} y={1330} o={late} size={30} />
      <Label text="DEPTH MAP" x={505} y={1440} o={ramp(g, 252, 256)} align="center" />
      <div style={{ position: 'absolute', left: 80, top: 1562, opacity: 0.5 * (1 - ramp(g, 244, 252)), font: `600 22px/1 ${FONT}`, color: '#b5ada5' }}>3D illustration · dot count: Apple · fewer dots drawn than fired · invisible to the eye</div>
    </AbsoluteFill>
  );
};
