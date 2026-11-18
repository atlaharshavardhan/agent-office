// S1 2.5D hook · Shot 3 storyboard frame: our GPU rotating toward camera over a dark world map;
// US · Singapore · China with an unresolved dotted connection (a question, not a route). Natural Earth outlines.
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { W, H, FONT, BODY, SAFE } from '../theme';
import { FontFace } from '../ui';
import { CamRig, projector, StudioEnv, GpuModel } from '../three/kit';
import WORLD from '../alice/world.json';
import { V } from '../alicev4/brand';

const K = 0.0125;
const ll = (lon, lat) => new THREE.Vector3((lon - 171) * K, (lat - 8) * K + 0.3, -3);
const US = ll(238, 37.4), SG = ll(103.8, 1.35), CN = ll(116, 39.9);

const Map = () => {
  const lines = useMemo(() => WORLD.map((c) => {
    const pts = []; c.p.forEach((r) => r.forEach(([x, y], i) => { const [x2, y2] = r[(i + 1) % r.length]; if (Math.abs(x - x2) > 60) return; pts.push(ll(x, y), ll(x2, y2)); }));
    return { iso: c.iso, g: new THREE.BufferGeometry().setFromPoints(pts) };
  }), []);
  return lines.map(({ iso, g }, k) => <lineSegments key={k} geometry={g}><lineBasicMaterial color={{ USA: '#9fd36a', SGP: '#9fd36a', CHN: '#ff8a8a' }[iso] || '#33414e'} transparent opacity={{ USA: 0.9, SGP: 0.9, CHN: 0.9 }[iso] || 0.45} /></lineSegments>);
};

export const S1Shot3 = () => {
  const f = useCurrentFrame(), t = f / 30 + 4.2;
  const cam = [0, 0.2, 3.2], look = [0, -0.1, -1];
  const P = projector(cam, look, 40);
  const dots = useMemo(() => { const a = new THREE.QuadraticBezierCurve3(US, US.clone().lerp(SG, 0.5).add(new THREE.Vector3(0, 0.55, 0)), SG); const b = new THREE.QuadraticBezierCurve3(SG, SG.clone().lerp(CN, 0.5).add(new THREE.Vector3(0.12, 0.08, 0)), CN); return [...a.getPoints(40), ...b.getPoints(18).slice(0, 12)]; }, []);
  const lab = (v, txt, col, dy = -34) => { const [x, y] = P(v.toArray()); return <div style={{ position: 'absolute', left: x, top: y + dy, transform: 'translateX(-50%)', font: `800 26px ${BODY}`, color: col, textShadow: '0 2px 10px #000', whiteSpace: 'nowrap' }}>{txt}</div>; };
  const [qx, qy] = P(SG.clone().lerp(CN, 0.75).add(new THREE.Vector3(0.1, 0.06, 0)).toArray());
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #0f1c2a, ${V.bg} 72%)` }}>
      <FontFace />
      <ThreeCanvas width={W} height={H} gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <CamRig pos={cam} look={look} fov={40} /><StudioEnv />
        <ambientLight intensity={0.6} /><directionalLight position={[-2, 3, 4]} intensity={2.6} /><directionalLight position={[2, -1, 3]} intensity={0.8} />
        <pointLight position={[0.6, 0.4, 1.4]} color={V.green} intensity={2.2} distance={2.5} />
        <Map />
        {dots.map((p, k) => <mesh key={k} position={p}><sphereGeometry args={[0.008, 6, 6]} /><meshBasicMaterial color={V.text} transparent opacity={0.85} /></mesh>)}
        <GpuModel scale={0.055} position={[0, -0.25, 0.6]} rotation={[1.05, 0.25, -0.12]} />
      </ThreeCanvas>
      {lab(US, 'UNITED STATES', '#9fd36a')}{lab(SG, 'SINGAPORE', '#9fd36a', 14)}{lab(CN, 'CHINA', '#ff8a8a')}
      <div style={{ position: 'absolute', left: qx, top: qy - 40, font: `900 72px ${FONT}`, color: V.text, textShadow: '0 0 18px #000' }}>?</div>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 230, textAlign: 'center' }}>
        <div style={{ font: `800 84px/1.02 ${FONT}`, letterSpacing: -2, color: V.text, textShadow: '0 6px 30px #000' }}>WHERE DID</div>
        <div style={{ font: `800 84px/1.02 ${FONT}`, letterSpacing: -2, color: V.green, textShadow: '0 6px 30px #000' }}>THE CHIPS GO?</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, top: 1528, font: `600 22px ${BODY}`, color: 'rgba(244,246,248,.7)' }}>Dotted line = open question, not a confirmed route · map: Natural Earth</div>
    </AbsoluteFill>
  );
};
