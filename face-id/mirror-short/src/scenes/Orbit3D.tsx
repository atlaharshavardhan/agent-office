import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { C, FONT, Label, ramp } from '../theme';
import { ISLAND_Y, P3, Phone3D, usePhoneModel } from './Phone3D';

// Full 3D scan: a real 3D model of the host's head (public/models/head.glb, Hunyuan3D from his
// near-front still) with the camera travelling from one side of his head to the other.
// g = frames from 0:08 (330 frames to 0:19).
//   0– 55  the iPhone's projector fires the dots; they fly through space and land on his face
// 112–132  the infrared camera reads the pattern: dots turn cyan (depth points)
// 185–197  the head becomes a shaded depth map (near = bright)
// 205–325  CLOSER (nose) and FARTHER (cheek) are marked on the depth map
const CYAN = '#7fe3ea', FOV = 30, UNIT = 1000, FLIGHT = 11;
const hash = (i: number) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };

type Head = { geo: THREE.BufferGeometry; map: THREE.Texture; dots: Float32Array; rnd: Float32Array; n: number;
  nose: THREE.Vector3; cheek: THREE.Vector3; proj: THREE.Vector3; phonePos: THREE.Vector3; phoneQuat: THREE.Quaternion; zMin: number; zMax: number };
const PS = 0.95;

const useHead = (): Head | null => {
  const [head, setHead] = useState<Head | null>(null);
  const [h] = useState(() => delayRender('head.glb', { timeoutInMilliseconds: 120000 }));
  useEffect(() => {
    new GLTFLoader().load(staticFile('models/head.glb'), async (gltf) => {
      const map = await new THREE.TextureLoader().loadAsync(staticFile('models/head_tex.jpg'));
      map.flipY = false; map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
      let mesh: THREE.Mesh | null = null;
      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse((o) => { if ((o as THREE.Mesh).isMesh && !mesh) mesh = o as THREE.Mesh; });
      const m = mesh! as THREE.Mesh;
      const geo = m.geometry.clone().applyMatrix4(m.matrixWorld).scale(UNIT, UNIT, UNIT);
      if (FLIP) geo.rotateY(Math.PI);
      geo.computeBoundingBox();
      const b = geo.boundingBox!;
      geo.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
      geo.computeBoundingBox();
      const P = geo.attributes.position, Nn = geo.attributes.normal, H = geo.boundingBox!.max.y;
      // nose tip = the most forward point of the head (upper part of the bust)
      const nose = new THREE.Vector3(0, 0, -1e9);
      for (let i = 0; i < P.count; i++) if (P.getY(i) > H * 0.45 && P.getY(i) < H * 0.8 && Math.abs(P.getX(i)) < 60 && P.getZ(i) > nose.z) nose.set(P.getX(i), P.getY(i), P.getZ(i));
      // a point on his cheek, beside the nose
      const cheek = new THREE.Vector3(0, 0, -1e9), tx = nose.x + 95, ty = nose.y - 5;
      for (let i = 0; i < P.count; i++) if (Math.abs(P.getX(i) - tx) < 7 && Math.abs(P.getY(i) - ty) < 7 && P.getZ(i) > cheek.z) cheek.set(P.getX(i), P.getY(i), P.getZ(i));
      // phone: held in front of him, a little below his face and tilted up at it
      const ph = new THREE.Object3D();
      ph.position.set(nose.x, nose.y - 210, nose.z + 430); ph.lookAt(nose.x, nose.y - 20, nose.z); ph.updateMatrixWorld();
      const proj = ph.localToWorld(new THREE.Vector3(-13 * PS, ISLAND_Y * PS, (P3.d / 2 + 1.5) * PS));
      // depth-map look baked into vertex colours: nearer the phone = brighter, lightly shaded by the surface
      const colr = new Float32Array(P.count * 3), Lg = new THREE.Vector3(0.2, 0.3, 1).normalize(), nv = new THREE.Vector3();
      for (let i = 0; i < P.count; i++) {
        const tt = Math.min(1, Math.max(0, (P.getZ(i) - (nose.z - 270)) / 270)), dd = Math.pow(tt * tt * (3 - 2 * tt), 1.4);
        nv.fromBufferAttribute(Nn, i);
        const c = Math.pow((0.06 + 0.94 * dd) * (0.8 + 0.2 * Math.max(0, nv.dot(Lg))), 2.2);    // to linear for the renderer
        colr[i * 3] = c; colr[i * 3 + 1] = c; colr[i * 3 + 2] = c;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
      // dots: surface points of the head that face the projector
      const cand: number[] = [];
      const v = new THREE.Vector3(), nn = new THREE.Vector3(), d = new THREE.Vector3();
      for (let i = 0; i < P.count; i++) {
        v.fromBufferAttribute(P, i); if (v.y < nose.y - 190) continue;
        nn.fromBufferAttribute(Nn, i); d.copy(proj).sub(v).normalize();
        if (nn.dot(d) > 0.22) cand.push(i);
      }
      const step = Math.max(1, Math.floor(cand.length / 7000)), n = Math.floor(cand.length / step);
      const dots = new Float32Array(n * 3), rnd = new Float32Array(n);
      for (let k = 0; k < n; k++) { const i = cand[k * step]; nn.fromBufferAttribute(Nn, i); dots[k * 3] = P.getX(i) + nn.x * 2; dots[k * 3 + 1] = P.getY(i) + nn.y * 2; dots[k * 3 + 2] = P.getZ(i) + nn.z * 2; rnd[k] = hash(i); }
      setHead({ geo, map, dots, rnd, n, nose, cheek, proj, phonePos: ph.position.clone(), phoneQuat: ph.quaternion.clone(), zMin: nose.z - 260, zMax: nose.z });
    });
  }, [h]);
  // release the frame only after the loaded head has been committed and the canvas has drawn it
  useEffect(() => { if (head) requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h))); }, [head, h]);
  return head;
};
const FLIP = false;

// camera: one continuous move from the left of his head to the right
const camAt = (g: number, head: Head) => {
  const u = Math.min(1, Math.max(0, g / 215)), e = u * u * (3 - 2 * u);
  const az = ((-62 + 124 * (0.35 * u + 0.65 * e)) * Math.PI) / 180;
  const dist = 3300 - 900 * Math.sin(Math.PI * Math.min(1, g / 300));
  const t = new THREE.Vector3(head.nose.x, head.nose.y - 70 - 60 * (1 - ramp(g, 40, 120)), head.nose.z - 60 + 60 * (1 - ramp(g, 60, 170)));
  const cam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 10, 9000);
  cam.position.set(t.x + dist * Math.sin(az), t.y + 60, t.z + dist * Math.cos(az));
  cam.lookAt(t); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  return cam;
};
const toScreen = (cam: THREE.Camera, p: THREE.Vector3) => { const v = p.clone().project(cam); return [(v.x + 1) * 540, (1 - v.y) * 960]; };

const PVS = `attribute float aSize; attribute vec3 aCol; uniform float uScale; varying vec3 vCol;
void main(){ vCol = aCol; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`;
const PFS = `varying vec3 vCol; uniform float uO;
void main(){ float r = length(gl_PointCoord - 0.5) * 2.0; if (r > 1.0) discard; float a = smoothstep(1.0, 0.35, r);
  gl_FragColor = vec4(mix(vCol, vec3(1.0), smoothstep(0.5, 0.0, r) * 0.7) * a * uO, a * uO); }`;
const RED = new THREE.Color(C.ir), CY = new THREE.Color(CYAN);

const Inner: React.FC<{ g: number; cam: THREE.PerspectiveCamera; head: Head; phone: THREE.Object3D }> = ({ g, cam, head, phone }) => {
  const gl = useThree((s) => s.gl), scene = useThree((s) => s.scene), advance = useThree((s) => s.advance);
  // the canvas only draws on demand: draw after every commit of this scene so no frame is left blank
  useEffect(() => { advance(performance.now()); });
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
    return () => pm.dispose();
  }, [gl, scene]);
  useLayoutEffect(() => {
    camera.position.copy(cam.position); camera.quaternion.copy(cam.quaternion);
    camera.fov = FOV; camera.near = 10; camera.far = 9000; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  }, [cam, camera]);

  const { dots, rnd, n, proj } = head;
  const launch = useMemo(() => { const a = new Float32Array(n); let far = 0;
    for (let i = 0; i < n; i++) far = Math.max(far, Math.hypot(dots[i * 3] - proj.x, dots[i * 3 + 1] - proj.y, dots[i * 3 + 2] - proj.z));
    for (let i = 0; i < n; i++) a[i] = 3 + (1 - (dots[i * 3 + 1] - (head.nose.y - 190)) / 420) * 30 + rnd[i] * 6;   // top of the head first, sweeping down
    return a; }, [dots, rnd, n, proj, head.nose.y]);
  const toDepth = ramp(g, 185, 197);
  const pts = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(n), 1));
    geo.setAttribute('aCol', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const mat = new THREE.ShaderMaterial({ vertexShader: PVS, fragmentShader: PFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uScale: { value: 1 }, uO: { value: 1 } } });
    return { geo, mat };
  }, [n]);
  const RAYS = 300;
  const rays = useMemo(() => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(RAYS * 6), 3)); return geo; }, []);
  const pos = pts.geo.attributes.position.array as Float32Array, size = pts.geo.attributes.aSize.array as Float32Array, col = pts.geo.attributes.aCol.array as Float32Array;
  for (let i = 0; i < n; i++) {
    const p = Math.min(1, Math.max(0, (g - launch[i]) / FLIGHT)), e = p * p * (3 - 2 * p);
    pos[i * 3] = proj.x + (dots[i * 3] - proj.x) * e; pos[i * 3 + 1] = proj.y + (dots[i * 3 + 1] - proj.y) * e; pos[i * 3 + 2] = proj.z + (dots[i * 3 + 2] - proj.z) * e;
    const land = ramp(g, launch[i] + FLIGHT, launch[i] + FLIGHT + 5);
    size[i] = p <= 0 ? 0 : p < 1 ? 6.5 : 4.4 * (1 + 0.9 * (1 - land));
    const c = g >= 92 + ((dots[i * 3] + 200) / 400) * 14 + rnd[i] * 4 ? CY : RED;
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  pts.geo.attributes.position.needsUpdate = true; pts.geo.attributes.aSize.needsUpdate = true; pts.geo.attributes.aCol.needsUpdate = true;
  pts.mat.uniforms.uScale.value = gl.domElement.height / (2 * Math.tan((FOV * Math.PI) / 360));
  pts.mat.uniforms.uO.value = 1 - ramp(g, 190, 202);
  const rp = rays.attributes.position.array as Float32Array, stride = Math.max(1, Math.floor(n / RAYS)), off = Math.floor(g / 2) % stride;
  for (let k = 0; k < RAYS; k++) {
    const i = (k * stride + off) % n, on = g >= launch[i] + FLIGHT;
    rp[k * 6] = proj.x; rp[k * 6 + 1] = proj.y; rp[k * 6 + 2] = proj.z;
    rp[k * 6 + 3] = on ? dots[i * 3] : proj.x; rp[k * 6 + 4] = on ? dots[i * 3 + 1] : proj.y; rp[k * 6 + 5] = on ? dots[i * 3 + 2] : proj.z;
  }
  rays.attributes.position.needsUpdate = true;
  const rayO = 0.2 * ramp(g, 4, 10) * (1 - ramp(g, 86, 96));
  return (
    <>
      {toDepth < 1 && <mesh geometry={head.geo}><meshBasicMaterial map={head.map} color="#7c7c7c" /></mesh>}
      {toDepth > 0 && <mesh geometry={head.geo}><meshBasicMaterial vertexColors transparent opacity={toDepth} /></mesh>}
      <lineSegments geometry={rays}><lineBasicMaterial color={C.ir} transparent opacity={rayO} blending={THREE.AdditiveBlending} depthWrite={false} /></lineSegments>
      <points geometry={pts.geo} material={pts.mat} frustumCulled={false} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[600, 900, 2200]} intensity={2.2} />
      <pointLight position={[-700, 900, 900]} intensity={3} color="#ffb060" decay={0} />
      <group position={head.phonePos} quaternion={head.phoneQuat} scale={PS}>
        <Phone3D model={phone} />
        <mesh position={[-13, ISLAND_Y, P3.d / 2 + 1.2]}><circleGeometry args={[4, 20]} /><meshBasicMaterial color="#ffffff" /></mesh>
        <mesh position={[-13, ISLAND_Y, P3.d / 2 + 1.1]}><circleGeometry args={[15, 24]} /><meshBasicMaterial color={C.ir} transparent opacity={0.75 * (1 - ramp(g, 86, 96))} blending={THREE.AdditiveBlending} /></mesh>
      </group>
    </>
  );
};

const Mark: React.FC<{ x: number; y: number; text: string; sub: string; dx: number; o: number }> = ({ x, y, text, sub, dx, o }) => (
  <>
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <path d={`M ${x + dx} ${y + 190} L ${x} ${y}`} stroke="#fff" strokeWidth={3} fill="none" />
      <circle cx={x} cy={y} r={15} fill="none" stroke={C.amber} strokeWidth={4} /><circle cx={x} cy={y} r={5} fill="#fff" />
    </svg>
    <div style={{ position: 'absolute', left: Math.min(760, Math.max(60, x + dx - 130)), top: y + 190, opacity: o, padding: '12px 20px', borderRadius: 10, background: 'rgba(10,8,7,.75)', border: `2px solid ${C.amber}` }}>
      <div style={{ font: `800 36px/1 ${FONT}`, letterSpacing: '0.12em', color: '#fff' }}>{text}</div>
      <div style={{ font: `600 26px/1 ${FONT}`, color: '#c9c2bb', marginTop: 8 }}>{sub}</div>
    </div>
  </>
);

export const Orbit3D: React.FC<{ g: number }> = ({ g }) => {
  const head = useHead(), phone = usePhoneModel();
  const cam = useMemo(() => (head ? camAt(g, head) : null), [g, head]);
  const nose = head && cam ? toScreen(cam, head.nose) : [0, 0], cheek = head && cam ? toScreen(cam, head.cheek) : [0, 0];
  return (
    <AbsoluteFill style={{ backgroundColor: '#070606' }}>
      <ThreeCanvas width={1080} height={1920} flat gl={{ antialias: true }} camera={{ fov: FOV, near: 10, far: 9000 }}>
        {head && phone && cam && <Inner g={g} cam={cam} head={head} phone={phone} />}
      </ThreeCanvas>
      <Mark x={nose[0]} y={nose[1]} text="CLOSER" sub="nose" dx={-150} o={ramp(g, 205, 209) * (1 - ramp(g, 322, 328))} />
      <Mark x={cheek[0]} y={cheek[1]} text="FARTHER" sub="cheek" dx={170} o={ramp(g, 270, 274) * (1 - ramp(g, 322, 328))} />
      <div style={{ position: 'absolute', left: 70, width: 870, top: 1425, textAlign: 'center', opacity: ramp(g, 40, 44) * (1 - ramp(g, 90, 94)), color: C.ir, font: `800 112px/1 ${FONT}` }}>
        30,000+ <span style={{ fontSize: 46, letterSpacing: '0.06em' }}>DOTS</span>
      </div>
      <div style={{ position: 'absolute', left: 70, width: 870, top: 1425, textAlign: 'center', opacity: ramp(g, 106, 110) * (1 - ramp(g, 180, 184)), color: CYAN, font: `800 104px/1 ${FONT}` }}>
        30,000+ <span style={{ fontSize: 42, letterSpacing: '0.06em' }}>DEPTH POINTS</span>
      </div>
      <Label text="DEPTH MAP" x={505} y={1500} o={ramp(g, 197, 201)} align="center" />
      <div style={{ position: 'absolute', left: 80, top: 1562, opacity: 0.5 * (1 - ramp(g, 185, 197)), font: `600 22px/1 ${FONT}`, color: '#b5ada5' }}>3D illustration · dot count: Apple · fewer dots drawn than fired · invisible to the eye</div>
    </AbsoluteFill>
  );
};
