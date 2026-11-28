import React, { useLayoutEffect, useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { hash } from '../lib/anim';
import { FONT } from '../lib/palette';
/* Part 2: the SERVER (Harsh): a data-centre corridor of racks with blinking lights; the light arrives along a floor cable into one open rack, which holds the locked photo and passes it on. 9:16. */
const sm = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * (3 - 2 * x); };
export const SERVER_FRAMES = 150;
const rackTex = (seed: number) => { const c = document.createElement('canvas'); c.width = 128; c.height = 512; const g = c.getContext('2d')!; g.fillStyle = '#0d1236'; g.fillRect(0, 0, 128, 512);
  for (let u = 0; u < 16; u++) { const y = 8 + u * 31; g.fillStyle = '#161d52'; g.fillRect(8, y, 112, 26); g.fillStyle = '#0a0e2a'; g.fillRect(14, y + 6, 54, 14);
    for (let l = 0; l < 7; l++) { const h = hash(seed * 100 + u * 7 + l); g.fillStyle = h > 0.8 ? '#ffb454' : h > 0.35 ? '#5fe3ff' : '#1d2a70'; g.fillRect(78 + l * 6, y + 8, 4, 4); g.fillRect(78 + l * 6, y + 16, 4, 4); } }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
const Glow = () => useMemo(() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.25, 'rgba(255,190,90,.7)'); gr.addColorStop(1, 'rgba(255,140,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); }, []);
const Cam: React.FC<{ t: number }> = ({ t }) => { const { camera } = useThree(); useLayoutEffect(() => { const u = sm(t / 5), cam = camera as THREE.PerspectiveCamera; cam.position.set(0, 2.4 - 0.5 * u, 15 - 8 * u); cam.fov = 52; cam.near = 0.05; cam.far = 200; cam.lookAt(0, 2.6, -14 + 4 * u); cam.updateProjectionMatrix(); }, [t, camera]); return null; };
const Scene: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(() => Array.from({ length: 6 }).map((_, i) => rackTex(i + 1)), []), glow = Glow();
  const px = THREE.MathUtils.lerp(0, 0, 1), pz = 14 - 24 * sm((t - 0.3) / 3.4), hot = sm((t - 3.4) / 0.6);
  return (<>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -10]}><planeGeometry args={[40, 80]} /><meshStandardMaterial color="#080b26" roughness={0.35} metalness={0.5} /></mesh>
    {Array.from({ length: 12 }).map((_, i) => [-1, 1].map((s) => <group key={i + '-' + s} position={[s * 4.2, 3.1, -i * 3.4 + 4]}>
      <mesh><boxGeometry args={[1.7, 6.2, 1.5]} /><meshStandardMaterial color="#121842" roughness={0.5} metalness={0.4} /></mesh>
      <mesh position={[-s * 0.86, 0, 0]} rotation-y={-s * Math.PI / 2}><planeGeometry args={[1.5, 6]} /><meshBasicMaterial map={tex[(i + (s > 0 ? 3 : 0)) % 6]} toneMapped={false} /></mesh>
      <mesh position={[-s * 0.9, -2.9 + 0.08, 0]}><boxGeometry args={[0.02, 0.02, 1.4]} /><meshBasicMaterial color="#5fe3ff" /></mesh></group>))}
    <group position={[-4.2, 3.1, -8.8]}><mesh position={[0.9, 0, 0]}><boxGeometry args={[0.06, 5.8, 1.3]} /><meshStandardMaterial color="#ffb454" emissive="#ff9a2a" emissiveIntensity={0.3 + 1.6 * hot} /></mesh><mesh position={[0.95, 3.3, 0]}><boxGeometry args={[0.05, 0.3, 1.3]} /><meshBasicMaterial color="#fff0c8" transparent opacity={hot} /></mesh><pointLight position={[2.4, 0, 0]} color="#ffb454" intensity={40 * hot} distance={14} /></group>
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, -8]}><planeGeometry args={[0.09, 46]} /><meshBasicMaterial color="#5fb8ff" transparent opacity={0.8} /></mesh>
    <mesh rotation-x={-Math.PI / 2} position={[-2.1, 0.03, -8.8]}><planeGeometry args={[4.2, 0.09]} /><meshBasicMaterial color="#5fb8ff" transparent opacity={0.8} /></mesh>
    {pz > -8.8 ? <group position={[0, 0.5, pz]}><sprite scale={[1.5, 1.5, 1]}><spriteMaterial map={glow} transparent depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} /></sprite><mesh><sphereGeometry args={[0.12, 12, 10]} /><meshBasicMaterial color="#fff0c8" /></mesh></group> : <group position={[-3.3, 0.5, -8.8]}><sprite scale={[1.6, 1.6, 1]}><spriteMaterial map={glow} transparent depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} opacity={1 - hot * 0.6} /></sprite></group>}
    {Array.from({ length: 8 }).map((_, i) => <mesh key={'l' + i} position={[0, 6.4, -i * 4.4 + 2]}><boxGeometry args={[6, 0.06, 0.5]} /><meshBasicMaterial color="#3a4a9a" /></mesh>)}
  </>); };
export const ServerHall: React.FC = () => { const t = useCurrentFrame() / 30;
  return (<AbsoluteFill style={{ background: '#04061a' }}>
    <ThreeCanvas width={1080} height={1920} gl={{ antialias: true }} camera={{ fov: 52, near: 0.05, far: 200 }}>
      <Cam t={t} /><color attach="background" args={['#04061a']} /><fog attach="fog" args={['#04061a', 14, 60]} />
      <ambientLight intensity={0.7} /><directionalLight position={[3, 10, 8]} intensity={0.8} color="#9fb6ff" /><Scene t={t} />
      <EffectComposer><Bloom intensity={0.7} luminanceThreshold={0.7} luminanceSmoothing={0.2} mipmapBlur /><Vignette eskil={false} offset={0.22} darkness={0.7} /></EffectComposer>
    </ThreeCanvas>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', padding: '0 50px' }}><div style={{ font: `900 118px/1.02 ${FONT.ui}`, color: '#ffc61a', textTransform: 'uppercase', textShadow: '0 0 34px rgba(255,190,40,.55), 0 6px 12px rgba(0,0,0,.6)', opacity: sm(t / 0.5) }}>The server</div><div style={{ font: `800 54px/1.2 ${FONT.ui}`, color: '#fff', marginTop: 14, textShadow: '0 4px 10px rgba(0,0,0,.7)', opacity: sm((t - 0.4) / 0.5) }}>holds your photo, locked, and passes it on</div></div>
    
    <div style={{ position: 'absolute', left: 60, top: 1560, opacity: sm((t - 3.4) / 0.6), font: `800 54px/1.1 ${FONT.ui}`, color: '#fff', textShadow: '0 0 20px rgba(120,170,255,.7)' }}>It can't read it<div style={{ font: `700 34px ${FONT.ui}`, color: '#7fd4ff' }}>only the two phones have the key</div></div>
  </AbsoluteFill>); };
