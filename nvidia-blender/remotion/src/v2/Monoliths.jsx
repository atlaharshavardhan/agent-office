// V2 scene 2: the loss vs. a comparison as two brushed-metal monoliths with real shadows.
// Low-angle camera so the structures fill the frame; readable in one second.
import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { C, W, H, ramp, lerp } from '../theme';
import { CamRig, projector, StudioEnv } from '../three/kit';
import { BigTitle } from './kit';

export const Monoliths = ({ start, end, loss = 2.0, cmpValue = 1.59, cmpName = 'Meta', cashAt }) => {
  const f = useCurrentFrame();
  const lt = f / 30 - start, d = end - start;
  const r1 = ramp(f, start + 0.05, 0.55), r2 = ramp(f, start + 0.35, 0.55);
  const k = 1.15;                                  // world units per $1T
  const h1 = loss * k * r1, h2 = cmpValue * k * r2;
  const cam = [lerp(-0.5, 0.2, lt / d), 1.1 + lt * 0.04, lerp(8.6, 7.8, lt / d)];
  const look = [0.05, 1.75, 0];
  const P = projector(cam, look, 42);
  const cash = ramp(f, cashAt ?? start + 1.6, 0.4);
  const label = (p, node, a) => {
    const [x, y] = P(p);
    return <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-100%)', opacity: a, textAlign: 'center', textShadow: '0 4px 18px #000' }}>{node}</div>;
  };
  return (
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, #23272c, ${C.bg} 75%)` }}>
      <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <CamRig pos={cam} look={look} fov={42} />
        <StudioEnv />
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 3, 8]} intensity={1.6} />
        <pointLight position={[2.4, 2.6, 2.2]} color="#dfe6ee" intensity={6} distance={7} />
        <directionalLight position={[-3, 7, 4]} intensity={2.6} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}
          shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
        <pointLight position={[-1.2, 2.4, 1.6]} color={C.red} intensity={5} distance={6} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} /><meshStandardMaterial color="#14171a" metalness={0.5} roughness={0.42} />
        </mesh>
        {/* NVIDIA's lost value: dark red anodised metal */}
        <mesh position={[-0.85, h1 / 2, 0]} castShadow>
          <boxGeometry args={[1.25, Math.max(0.001, h1), 1.25]} />
          <meshPhysicalMaterial color={'#7a1d22'} metalness={0.95} roughness={0.28} clearcoat={0.6} clearcoatRoughness={0.2}
            transparent opacity={1 - cash * 0.55} />
        </mesh>
        {cash > 0 && <lineSegments position={[-0.85, h1 / 2, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(1.25, Math.max(0.001, h1), 1.25)]} /><lineBasicMaterial color={C.red} transparent opacity={cash} />
        </lineSegments>}
        {/* comparison: brushed silver */}
        <mesh position={[0.95, h2 / 2, 0]} castShadow>
          <boxGeometry args={[1.25, Math.max(0.001, h2), 1.25]} />
          <meshPhysicalMaterial color={C.silver} metalness={1} roughness={0.3} clearcoat={0.3} />
        </mesh>
      </ThreeCanvas>
      {label([-0.85, h1 + 0.12, 0.62], <div><div style={{ font: "800 92px/1 'Inter Display',Inter", color: C.red }}>${loss.toFixed(1)}T</div>
        <div style={{ font: '700 32px Inter', color: '#F5F5F5' }}>NVIDIA’s lost value</div></div>, r1)}
      {label([0.95, h2 + 0.12, 0.62], <div><div style={{ font: "800 92px/1 'Inter Display',Inter", color: C.silver }}>${cmpValue.toFixed(1)}T</div>
        <div style={{ font: '700 32px Inter', color: '#F5F5F5' }}>all of {cmpName}</div></div>, r2)}
      <BigTitle at={start + 0.05} lines={[['Bigger than'], [`all of ${cmpName}`, C.red]]} size={96} />
      <div style={{ position: 'absolute', left: 90, right: 180, top: 1160, textAlign: 'center', opacity: cash }}>
        <span style={{ font: "800 46px 'Inter Display',Inter", color: '#101214', background: '#F5F5F5', padding: '10px 26px', borderRadius: 12 }}>MARKET VALUE · NOT CASH</span>
      </div>
    </div>
  );
};
