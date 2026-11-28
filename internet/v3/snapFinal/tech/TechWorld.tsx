import React, { useLayoutEffect, useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { RoundedBox, Environment, Lightformer, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TECH } from '../lib/palette';
import { FPS, prog, keys, easeOut } from '../lib/anim';

/* ---------------- reusable technical components ---------------- */
const gridMat = () => new THREE.ShaderMaterial({
  transparent: true, uniforms: { uFade: { value: 1 } },
  vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }',
  fragmentShader: `varying vec3 vW; uniform float uFade;
    float line(float c, float w){ float d = abs(fract(c - .5) - .5) / fwidth(c); return 1. - min(d / w, 1.); }
    void main(){ vec2 p = vW.xz; float minor = line(p.x, 1.) + line(p.y, 1.); float major = line(p.x / 4., 1.4) + line(p.y / 4., 1.4);
      float r = length(p) / 26.; float fade = smoothstep(1., .15, r);
      vec3 base = vec3(0.031, 0.059, 0.110); vec3 c = base + vec3(0.06, 0.10, 0.15) * minor * .5 + vec3(0.0, 0.55, 0.7) * major * .22;
      gl_FragColor = vec4(c, fade * uFade); }`,
});
export const GridFloor: React.FC = () => {
  const m = useMemo(gridMat, []);
  return <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} material={m}><planeGeometry args={[80, 80]} /></mesh>;
};

const pulseMat = (active: number) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uT: { value: 0 }, uOn: { value: active }, uCol: { value: new THREE.Color(TECH.cyan) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `varying vec2 vUv; uniform float uT; uniform float uOn; uniform vec3 uCol;
    void main(){ float base = .18 + .25 * uOn; float p = fract(vUv.x * 3. - uT * .9); float pk = smoothstep(.0, .06, p) * smoothstep(.16, .06, p);
      float a = (base + pk * 2.2 * uOn) * smoothstep(0., .03, vUv.x) * uOn; gl_FragColor = vec4(uCol * (0.6 + pk * 1.6), a); }`,
});
export const Connection: React.FC<{ from: THREE.Vector3; to: THREE.Vector3; draw: number; t: number; lift?: number }> = ({ from, to, draw, t, lift = 0.6 }) => {
  const curve = useMemo(() => { const m = from.clone().lerp(to, 0.5); m.y += lift; return new THREE.CatmullRomCurve3([from, m, to]); }, [from, to, lift]);
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 80, 0.035, 8, false), [curve]);
  const mat = useMemo(() => pulseMat(1), []);
  mat.uniforms.uT.value = t; mat.uniforms.uOn.value = draw;
  const n = geo.index ? geo.index.count : 0; geo.setDrawRange(0, Math.floor((n * Math.min(1, draw)) / 3) * 3);
  return <group><mesh geometry={geo} material={mat} /><mesh geometry={geo}><meshStandardMaterial color={TECH.surface} roughness={0.6} transparent opacity={0.0} /></mesh></group>;
};

const surface = { color: TECH.surface, roughness: 0.38, metalness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25 };
export const Router: React.FC<{ on: number; t: number }> = ({ on, t }) => (
  <group>
    <RoundedBox args={[3.2, 0.5, 2.0]} radius={0.2} smoothness={6} position={[0, 0.35, 0]} castShadow receiveShadow>
      <meshPhysicalMaterial {...surface} />
    </RoundedBox>
    <RoundedBox args={[2.9, 0.06, 1.7]} radius={0.03} smoothness={4} position={[0, 0.61, 0]}>
      <meshPhysicalMaterial color="#0d1726" roughness={0.12} metalness={0.2} clearcoat={1} />
    </RoundedBox>
    <mesh position={[0, 0.36, 1.005]}><boxGeometry args={[2.2, 0.035, 0.01]} /><meshBasicMaterial color={TECH.cyan} toneMapped={false} transparent opacity={0.25 + 0.75 * on} /></mesh>
    {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
      <mesh key={i} position={[x * 0.9, 0.36, 1.01]}><circleGeometry args={[0.035, 16]} /><meshBasicMaterial color={i === 3 ? TECH.amber : TECH.cyan} toneMapped={false} transparent opacity={0.3 + 0.7 * on * (0.6 + 0.4 * Math.sin(t * 9 + i * 2))} /></mesh>
    ))}
    {[-1.2, 0, 1.2].map((x, i) => (
      <group key={i} position={[x, 0.55, -0.85]} rotation={[-0.18, 0, (i - 1) * 0.16]}>
        <mesh position={[0, 0.75, 0]} castShadow><capsuleGeometry args={[0.07, 1.3, 6, 16]} /><meshPhysicalMaterial {...surface} /></mesh>
        <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.13, 0.15, 0.12, 24]} /><meshPhysicalMaterial {...surface} color="#1d2f47" /></mesh>
      </group>
    ))}
  </group>
);
/* stylised but designed devices */
export const Phone: React.FC<{ on: number; screen?: string }> = ({ on, screen = TECH.cyan }) => (
  <group>
    <RoundedBox args={[0.56, 1.1, 0.07]} radius={0.06} smoothness={6} castShadow><meshPhysicalMaterial color="#1a2638" metalness={0.7} roughness={0.25} clearcoat={1} /></RoundedBox>
    <RoundedBox args={[0.5, 1.03, 0.01]} radius={0.05} smoothness={4} position={[0, 0, 0.036]}><meshStandardMaterial color="#0b1424" emissive={screen} emissiveIntensity={0.12 + 0.55 * on} /></RoundedBox>
  </group>
);
export const Laptop: React.FC<{ on: number }> = ({ on }) => (
  <group>
    <RoundedBox args={[1.5, 0.06, 1.0]} radius={0.03} smoothness={4} castShadow><meshPhysicalMaterial {...surface} color="#1f3049" /></RoundedBox>
    <group position={[0, 0.03, -0.48]} rotation={[-0.32, 0, 0]}>
      <RoundedBox args={[1.5, 1.0, 0.04]} radius={0.03} smoothness={4} position={[0, 0.5, 0]} castShadow><meshPhysicalMaterial {...surface} color="#1f3049" /></RoundedBox>
      <mesh position={[0, 0.5, 0.022]}><planeGeometry args={[1.36, 0.86]} /><meshStandardMaterial color="#0b1424" emissive={TECH.cyan} emissiveIntensity={0.08 + 0.35 * on} /></mesh>
    </group>
  </group>
);
export const Tower: React.FC<{ h: number; on: number; seed: number }> = ({ h, on, seed }) => (
  <group>
    <RoundedBox args={[1.1, h, 1.1]} radius={0.08} smoothness={4} position={[0, h / 2, 0]} castShadow receiveShadow><meshPhysicalMaterial {...surface} color="#14223a" /></RoundedBox>
    {Array.from({ length: Math.floor(h / 0.38) }).map((_, i) => (
      <mesh key={i} position={[0, 0.3 + i * 0.38, 0.556]}><planeGeometry args={[0.8, 0.08]} /><meshBasicMaterial color={(i + seed) % 3 === 0 ? TECH.amber : TECH.cyan} toneMapped={false} transparent opacity={(0.15 + 0.6 * on) * ((i * 7 + seed) % 5 < 3 ? 1 : 0.25)} /></mesh>
    ))}
  </group>
);
export const Node: React.FC<{ on: number }> = ({ on }) => (
  <group>
    <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[0.45, 0.5, 0.12, 48]} /><meshPhysicalMaterial {...surface} /></mesh>
    <mesh position={[0, 0.13, 0]} rotation-x={-Math.PI / 2}><ringGeometry args={[0.3, 0.36, 48]} /><meshBasicMaterial color={TECH.cyan} toneMapped={false} transparent opacity={0.2 + 0.8 * on} /></mesh>
  </group>
);

/* camera driven by the frame (dolly / crane / orbit), deterministic */
const CameraRig: React.FC<{ pos: THREE.Vector3; look: THREE.Vector3; fov: number }> = ({ pos, look, fov }) => {
  const { camera } = useThree();
  useLayoutEffect(() => { camera.position.copy(pos); (camera as THREE.PerspectiveCamera).fov = fov; camera.lookAt(look); camera.updateProjectionMatrix(); }, [pos.x, pos.y, pos.z, look.x, look.y, look.z, fov]);
  return null;
};

/* the network: router in the centre, devices and towers around it, connections drawing in one by one */
const NODES: { p: [number, number, number]; kind: 'phone' | 'laptop' | 'tower' | 'node'; h?: number }[] = [
  { p: [-4.6, 0, 2.4], kind: 'node' }, { p: [-5.4, 0, -1.6], kind: 'tower', h: 2.6 }, { p: [-2.6, 0, -4.4], kind: 'laptop' },
  { p: [2.8, 0, -4.2], kind: 'tower', h: 3.4 }, { p: [5.6, 0, -0.8], kind: 'phone' }, { p: [4.8, 0, 3.0], kind: 'laptop' }, { p: [0.4, 0, 5.2], kind: 'phone' },
  { p: [-8.5, 0, -6], kind: 'tower', h: 4.2 }, { p: [8.2, 0, -6.5], kind: 'tower', h: 3.0 }, { p: [-9, 0, 4], kind: 'tower', h: 2.2 },
];
export const TechWorld: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useCurrentFrame(); const t = f / FPS - t0;
  const cam = {
    pos: new THREE.Vector3(keys(f, [[t0, -4.3], [t0 + 1.6, 3.0], [t0 + 4, 8.5]]), keys(f, [[t0, 0.9], [t0 + 1.6, 4.2], [t0 + 4, 6.5]]), keys(f, [[t0, 3.4], [t0 + 1.6, 9.5], [t0 + 4, 10.5]])),
    look: new THREE.Vector3(keys(f, [[t0, -4.6], [t0 + 1.6, -0.6], [t0 + 4, 0]]), keys(f, [[t0, 0.2], [t0 + 1.6, 0.6], [t0 + 4, 0.8]]), keys(f, [[t0, 2.4], [t0 + 1.6, 0.6], [t0 + 4, 0]])),
    fov: keys(f, [[t0, 30], [t0 + 1.6, 36]]),
  };
  const routerOn = prog(f, t0 + 0.5, t0 + 0.9);
  return (
    <ThreeCanvas width={1080} height={1920} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }} shadows camera={{ fov: 32, near: 0.05, far: 200 }}>
      <color attach="background" args={[TECH.bg]} />
      <fog attach="fog" args={[TECH.bg, 14, 34]} />
      <CameraRig {...cam} />
      <ambientLight intensity={0.25} color="#5a7aa8" />
      <directionalLight position={[-6, 10, 6]} intensity={1.4} color="#cfe0ff" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} />
      <spotLight position={[0, 6, -10]} angle={0.6} penumbra={1} intensity={60} color={TECH.cyan} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2} color="#9fc8ff" position={[0, 6, 4]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} color={TECH.cyan} position={[-6, 2, -4]} scale={[2, 6, 1]} />
        <Lightformer form="ring" intensity={0.8} color={TECH.amber} position={[6, 3, 2]} scale={2} />
      </Environment>
      <GridFloor />
      <ContactShadows position={[0, 0.005, 0]} opacity={0.6} scale={30} blur={2.4} far={6} resolution={512} color="#000000" frames={1} />
      <Router on={routerOn} t={t} />
      {NODES.map((n, i) => {
        const on = prog(f, t0 + 0.6 + i * 0.12, t0 + 0.9 + i * 0.12, easeOut);
        const from = new THREE.Vector3(n.p[0], n.kind === 'tower' ? 0.3 : 0.25, n.p[2]);
        return (
          <group key={i}>
            <group position={n.p} rotation={[0, Math.atan2(-n.p[0], -n.p[2]), 0]} scale={0.6 + 0.4 * on}>
              {n.kind === 'phone' && <group position={[0, 0.58, 0]}><Phone on={on} /></group>}
              {n.kind === 'laptop' && <Laptop on={on} />}
              {n.kind === 'tower' && <Tower h={n.h || 2} on={on} seed={i} />}
              {n.kind === 'node' && <Node on={1} />}
            </group>
            <Connection from={from} to={new THREE.Vector3(0, 0.4, 0)} draw={prog(f, t0 + 0.4 + i * 0.12, t0 + 1.1 + i * 0.12)} t={t + i * 0.37} lift={0.4 + (i % 3) * 0.3} />
          </group>
        );
      })}
      <EffectComposer multisampling={4}>
        <DepthOfField focusDistance={0.0} focalLength={0.06} bokehScale={3} target={[cam.look.x, cam.look.y, cam.look.z]} />
        <Bloom intensity={0.75} luminanceThreshold={0.55} luminanceSmoothing={0.2} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.7} />
      </EffectComposer>
    </ThreeCanvas>
  );
};
