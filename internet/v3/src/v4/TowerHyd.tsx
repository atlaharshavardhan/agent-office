import React, { useLayoutEffect } from 'react';
import { AbsoluteFill } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { F, vfov } from './frame';
import { FONT } from '../lib/palette';
import { Tower, TOWER, City } from './Packets';
/* Part 2, next scene: the packets leave your phone as radio waves, reach the mobile tower, and at the foot of the tower a box turns them into light (STILL STORYBOARD, 9:16). Beats: 1 radio waves over the night city, 2 the tower from below, 3 the antennas close, 4 the box at the foot: radio into light. */
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const BASE = TOWER.y - 22 + 2.5;                       // the foot of the tower (world y)
const CAMS: Record<number, { p: [number, number, number]; l: [number, number, number]; fov: number }> = {
  1: { p: [-4, 3.5, 9], l: [9, 10, -18], fov: 44 },
  2: { p: [TOWER.x - 7, BASE + 1.5, TOWER.z + 17], l: [TOWER.x, BASE + 12, TOWER.z], fov: 40 },
  3: { p: [TOWER.x - 4.2, BASE + 20.5, TOWER.z + 6.5], l: [TOWER.x, BASE + 21.5, TOWER.z], fov: 40 },
  4: { p: [TOWER.x - 3.5, BASE + 2.2, TOWER.z + 9.5], l: [TOWER.x + 1.5, BASE + 1.6, TOWER.z + 2], fov: 42 },
};
const Cam: React.FC<{ beat: number }> = ({ beat }) => { const { camera } = useThree(); useLayoutEffect(() => { const c = CAMS[beat], cam = camera as THREE.PerspectiveCamera; cam.position.set(...c.p); cam.fov = vfov(c.fov); cam.near = 0.05; cam.far = 400; cam.lookAt(...c.l); cam.updateProjectionMatrix(); }, [beat, camera]); return null; };
const Cabinet: React.FC = () => (<group position={[TOWER.x + 2.4, BASE + 1.5, TOWER.z + 2.6]}>
  <mesh><boxGeometry args={[2.4, 3, 1.5]} /><meshStandardMaterial color="#aab4d8" roughness={0.55} metalness={0.3} emissive="#ffe9b0" emissiveIntensity={0.18} /></mesh>
  {[0.9, -0.8].map((y, k) => <group key={k} position={[0, y, 0.77]}>{Array.from({ length: 6 }).map((_, j) => <mesh key={j} position={[0, (j - 2.5) * 0.12, 0]}><boxGeometry args={[1.5, 0.05, 0.04]} /><meshStandardMaterial color="#6a7498" /></mesh>)}</group>)}
  <mesh position={[0, -1.55, 0]}><boxGeometry args={[2.9, 0.12, 1.9]} /><meshStandardMaterial color="#d8c9a0" /></mesh>
  <mesh position={[2.6, -0.4, 0]}><boxGeometry args={[2.2, 2.2, 1.4]} /><meshStandardMaterial color="#9aa4c8" roughness={0.6} /></mesh>
  <pointLight position={[0, 0.5, 2.2]} intensity={14} color="#ffe2a0" distance={9} />
</group>);
const Cables: React.FC<{ beat: number }> = ({ beat }) => { const top = V(TOWER.x + 0.5, BASE + 21, TOWER.z + 0.5), foot = V(TOWER.x + 1.6, BASE + 2.3, TOWER.z + 2.6), mid = top.clone().lerp(foot, 0.5), q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), foot.clone().sub(top).normalize()), len = top.distanceTo(foot);
  const fibre = new THREE.CatmullRomCurve3([V(TOWER.x + 3.6, BASE + 0.2, TOWER.z + 2.8), V(TOWER.x + 3.2, BASE - 0.1, TOWER.z + 8), V(TOWER.x - 2, BASE - 0.1, TOWER.z + 14), V(TOWER.x - 14, BASE - 0.1, TOWER.z + 24)]);
  return <group>
    <mesh position={mid} quaternion={q}><cylinderGeometry args={[0.06, 0.06, len, 8]} /><meshBasicMaterial color="#ffb454" /></mesh>
    {beat === 4 && <><mesh><tubeGeometry args={[fibre, 60, 0.12, 8, false]} /><meshBasicMaterial color="#9fe6ff" /></mesh><mesh><tubeGeometry args={[fibre, 60, 0.3, 8, false]} /><meshBasicMaterial color="#9fe6ff" transparent opacity={0.25} /></mesh></>}
  </group>; };
const Waves: React.FC = () => (<group position={[0.3, 3.4, 0]} quaternion={new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), TOWER.clone().sub(V(0, 3.2, 0)).normalize())}>
  {Array.from({ length: 6 }).map((_, k) => { const u = k / 6; return <mesh key={k} position={[0, 0, 1.5 + u * 24]}><torusGeometry args={[1.2 + u * 9, 0.09 + u * 0.1, 10, 70, Math.PI * 1.1]} /><meshBasicMaterial color="#ffb454" transparent opacity={0.85 * (1 - u * 0.8)} /></mesh>; })}
</group>);
/* the signal waves: big, soft, see-through glowing shells (bright thin edge, clear inside) that grow out of the antennas, like the reference */
const shellMat = (o: number) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { o: { value: o } },
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
  fragmentShader: 'uniform float o; varying vec3 vN; varying vec3 vV; void main(){ float d = abs(dot(normalize(vN), normalize(vV))); float f = pow(1.0 - d, 2.6); vec3 c = mix(vec3(1.0,0.62,0.18), vec3(1.0,0.86,0.5), f); gl_FragColor = vec4(c * (0.10 + 1.3*f) * o, (0.05 + 0.85*f) * o); }' });
const Signal: React.FC<{ radii: number[] }> = ({ radii }) => { const mats = React.useMemo(() => radii.map((_, k) => shellMat(1 - k * 0.22)), [radii.join(',')]);
  return <group position={[TOWER.x, BASE + 21.2, TOWER.z]}>{radii.map((r, k) => <mesh key={k} material={mats[k]}><sphereGeometry args={[r, 96, 64]} /></mesh>)}</group>; };
const Panels: React.FC = () => (<group position={[TOWER.x, BASE + 20.4, TOWER.z]}>
  {/* walkway ring with a soft railing, a radio unit behind each antenna, a dish, cable bundles */}
  <mesh position={[0, -1.2, 0]}><cylinderGeometry args={[1.9, 1.9, 0.12, 6]} /><meshStandardMaterial color="#5a6aa0" roughness={0.6} metalness={0.4} /></mesh>
  <mesh position={[0, -0.5, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[1.85, 0.04, 8, 6]} /><meshStandardMaterial color="#9fb0e0" /></mesh>
  {Array.from({ length: 6 }).map((_, k) => <mesh key={k} position={[Math.cos(k * 1.047) * 1.85, -0.85, Math.sin(k * 1.047) * 1.85]}><cylinderGeometry args={[0.035, 0.035, 0.75, 8]} /><meshStandardMaterial color="#9fb0e0" /></mesh>)}
  {[0, 1, 2].map((k) => <group key={k} rotation-y={-k * 2.09 + Math.PI / 2} position={[Math.cos(k * 2.09) * 1.15, 0, Math.sin(k * 2.09) * 1.15]}>
    <RoundedBox args={[0.5, 0.9, 0.28]} radius={0.1} smoothness={4} position={[0, -0.35, -0.3]}><meshStandardMaterial color="#6e7aa8" roughness={0.5} metalness={0.3} /></RoundedBox>
    <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.05, 0.05, 2.0, 8]} /><meshStandardMaterial color="#8a96c0" /></mesh></group>)}
  <mesh position={[1.7, -0.2, 0.3]} rotation-z={Math.PI / 2}><sphereGeometry args={[0.55, 24, 12, 0, Math.PI]} /><meshStandardMaterial color="#f2f5ff" roughness={0.4} side={THREE.DoubleSide} /></mesh>
  <pointLight position={[0, 0.4, 1.6]} intensity={5} color="#ffd38a" distance={7} />
</group>);
const Scene: React.FC<{ beat: number }> = ({ beat }) => (<AbsoluteFill style={{ background: '#070a22' }}>
  <ThreeCanvas width={F.W} height={F.H} gl={{ antialias: true }} camera={{ fov: 36, near: 0.05, far: 400 }}>
    <Cam beat={beat} /><color attach="background" args={['#0a0d34']} /><fog attach="fog" args={['#0c1040', 30, 160]} />
    <hemisphereLight args={['#7f8cff', '#160c44', 1.15]} /><directionalLight position={[-8, 12, 10]} intensity={1.3} color="#c9d2ff" />
    <City /><Tower t={0} />{beat === 1 && <Waves />}{beat >= 2 && beat <= 3 && <Panels />}{beat === 2 && <Signal radii={[3, 5.6, 8.6, 12]} />}{beat === 3 && <Signal radii={[2.6, 3.8, 5.2]} />}{beat >= 2 && <Cables beat={beat} />}{beat === 4 && <Cabinet />}
    <EffectComposer><Bloom intensity={0.6} luminanceThreshold={0.8} luminanceSmoothing={0.2} mipmapBlur /><Vignette eskil={false} offset={0.22} darkness={0.7} /></EffectComposer>
  </ThreeCanvas>
  <div style={{ position: 'absolute', right: 70, top: 150, display: 'flex', alignItems: 'baseline', gap: 8, font: `800 120px/1 ${FONT.ui}`, color: '#7fd4ff', textShadow: '0 0 30px rgba(127,212,255,.6)' }}>{['', '005', '007', '007', '008'][beat]}<span style={{ font: `800 40px ${FONT.ui}` }}>ms</span></div>
  {beat === 2 && <div style={{ position: 'absolute', left: 90, top: 560, font: `800 54px ${FONT.ui}`, color: '#fff', textShadow: '0 0 18px rgba(127,212,255,.7), 0 4px 10px #000' }}>Mobile tower</div>}
  <div style={{ position: 'absolute', left: 0, right: 0, top: 1640, display: 'flex', justifyContent: 'center' }}><div style={{ padding: '16px 36px', borderRadius: 40, background: '#2a1630', border: '3px solid #ffb454', font: `800 46px/1 ${FONT.ui}`, color: '#fff1dc', textAlign: 'center' }}>{['', 'Radio waves carry the packets', 'To the mobile tower', 'The antennas catch the waves', 'A box turns radio into light'][beat]}</div></div>
</AbsoluteFill>);
export const TwB1 = () => <Scene beat={1} />; export const TwB2 = () => <Scene beat={2} />; export const TwB3 = () => <Scene beat={3} />; export const TwB4 = () => <Scene beat={4} />;
