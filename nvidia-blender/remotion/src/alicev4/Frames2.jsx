// V4 scene stills (one component per beat). Palette from brand.js. All assets ours / public-domain data.
import React, { useMemo } from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { W, H, FONT, BODY, SAFE, clamp, lerp } from '../theme';
import { FontFace } from '../ui';
import { CamRig, projector, StudioEnv, GpuModel, useGpu } from '../three/kit';
import { MegaspeedLogo, NvLogo, FlagCN, FlagUS } from '../alice/Logos';
import WORLD from '../alice/world.json';
import { V } from './brand';

const Head = ({ lines, size = 96, top = 210 }) => (
  <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top, textAlign: 'center' }}>
    {lines.map(([t, c], k) => <div key={k} style={{ font: `800 ${size}px/1.02 ${FONT}`, letterSpacing: -2.5, color: c || V.text, textShadow: '0 6px 30px #000' }}>{t}</div>)}
  </div>
);
const Cap = ({ text, col = V.text }) => <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1300, textAlign: 'center', font: `800 60px ${BODY}`, color: col, textShadow: '0 0 10px #000, 0 4px 18px #000' }}>{text}</div>;
const Tag = ({ text = 'Illustration · not affiliated with NVIDIA' }) => <div style={{ position: 'absolute', left: SAFE.l, top: 1528, font: `600 22px ${BODY}`, color: 'rgba(244,246,248,.6)' }}>{text}</div>;
const Shade = () => <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(8,12,16,.85) 0%, rgba(8,12,16,0) 32%, rgba(8,12,16,0) 62%, rgba(8,12,16,.8) 100%)' }} />;
const Pill = ({ children, col }) => <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(17,24,32,.92)', border: `2px solid ${col}`, borderRadius: 14, padding: '10px 18px', whiteSpace: 'nowrap' }}>{children}</div>;

// S2a · macro of our GPU (existing Blender render)
export const S2a = () => (
  <AbsoluteFill style={{ background: V.bg }}><FontFace />
    <Img src={staticFile('v4/macro.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.15)', transformOrigin: '50% 60%' }} />
    <Shade /><Head lines={[['THE POWER'], ['BEHIND AI', V.green]]} size={112} />
    <Cap text="NVIDIA's chips power" /><Tag />
  </AbsoluteFill>
);

// S2b · exploded view of our GPU (dies, HBM stacks, interposer, substrate separated)
const Exploded = ({ scale, e }) => {
  const src = useGpu();
  const obj = useMemo(() => {
    if (!src) return null;
    const o = src.clone(true);
    o.traverse((n) => {
      if (!n.isMesh) return;
      const nm = n.name || '';
      let dy = 0;
      if (/Compute_Die|Etch/.test(nm)) dy = 5;
      else if (/HBM_layer_.*_(\d)$/.test(nm)) dy = 2.2 + 0.45 * Number(nm.match(/_(\d)$/)[1]);
      else if (/HBM/.test(nm)) dy = 2.0;
      else if (/Interposer|Underfill/i.test(nm + (n.material && n.material.name))) dy = 0.9;
      n.position.y += dy * e;
    });
    return o;
  }, [src, e]);
  return obj ? <primitive object={obj} scale={scale} /> : null;
};
export const S2b = () => {
  const cam = [2.3, 2.0, 3.9], look = [0, 0.55, 0];
  const P = projector(cam, look, 36);
  const L = (p, txt, col) => { const [x, y] = P(p); return <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)' }}><Pill col={col}><span style={{ font: `800 30px ${BODY}`, color: col }}>{txt}</span></Pill></div>; };
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, #142131, ${V.bg} 70%)` }}><FontFace />
      <ThreeCanvas width={W} height={H} gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <CamRig pos={cam} look={look} fov={36} /><StudioEnv />
        <ambientLight intensity={0.8} /><directionalLight position={[-3, 6, 4]} intensity={3.2} /><directionalLight position={[3, 2, 3]} intensity={1.4} /><pointLight position={[1.5, 1.5, 1.5]} color={V.green} intensity={5} distance={5} />
        <group position={[0, 0.2, 0]}><Exploded scale={0.12} e={1} /></group>
      </ThreeCanvas>
      {L([-0.9, 1.15, -0.2], 'Processor dies', V.green)}{L([0.55, 1.05, 0.6], 'HBM memory', V.green)}{L([-0.6, 0.0, 0.9], 'Package', V.green)}
      <Head lines={[['INSIDE THE CHIP']]} size={96} /><Cap text="the AI revolution." /><Tag />
    </AbsoluteFill>
  );
};

// S2c · from one chip to thousands (existing data-center render)
export const S2c = () => (
  <AbsoluteFill style={{ background: V.bg }}><FontFace />
    <Img src={staticFile('v4/dc.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><Shade />
    <Head lines={[['THOUSANDS OF GPUs'], ['RUN TODAY’S AI', V.green]]} size={74} />
    <Cap text="power the AI revolution" /><Tag text="Data-center illustration · not affiliated with NVIDIA" />
  </AbsoluteFill>
);

// S3 · 3D globe: designed in the US, made in Taiwan, advanced chips blocked for China
const toXYZ = (lon, lat, r = 2) => { const a = (lon * Math.PI) / 180, b = (lat * Math.PI) / 180; return new THREE.Vector3(r * Math.cos(b) * Math.sin(a), r * Math.sin(b), r * Math.cos(b) * Math.cos(a)); };
const GlobeLines = () => {
  const segs = useMemo(() => WORLD.map((c) => {
    const pts = []; c.p.forEach((ring) => { for (let i = 0; i < ring.length; i++) { const [x1, y1] = ring[i], [x2, y2] = ring[(i + 1) % ring.length]; const l1 = x1 > 180 ? x1 - 360 : x1, l2 = x2 > 180 ? x2 - 360 : x2; if (Math.abs(l1 - l2) > 90) continue; pts.push(toXYZ(l1, y1, 2.005), toXYZ(l2, y2, 2.005)); } });
    return { iso: c.iso, g: new THREE.BufferGeometry().setFromPoints(pts) };
  }), []);
  return segs.map(({ iso, g }, k) => <lineSegments key={k} geometry={g}><lineBasicMaterial color={{ USA: V.green, TWN: V.blue, CHN: V.red }[iso] || '#3a4652'} transparent opacity={{ USA: 1, TWN: 1, CHN: 1 }[iso] || 0.55} /></lineSegments>);
};
const gArc = (a, b, h) => { const m = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(2 + h); return new THREE.QuadraticBezierCurve3(a, m, b); };
export const S3 = () => {
  const rotY = 3.05;                                       // face the Pacific
  const US = toXYZ(-122, 37.4), TW = toXYZ(121, 24), CN = toXYZ(116, 39.9);
  const a1 = useMemo(() => gArc(US, TW, 0.9), []), a2 = useMemo(() => gArc(TW, CN, 0.35), []);
  const cam = [0, 2.2, 12.5], look = [0, 0.2, 0];
  const P = projector(cam, look, 36);
  const rot = (v) => v.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
  const L = (v, node, dy = 0) => { const [x, y] = P(rot(v).toArray()); return <div style={{ position: 'absolute', left: x, top: y + dy, transform: 'translate(-50%,-50%)' }}>{node}</div>; };
  const stop = a2.getPoint(0.55);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 48%, #12202c, ${V.bg} 70%)` }}><FontFace />
      <ThreeCanvas width={W} height={H} gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <CamRig pos={cam} look={look} fov={36} /><ambientLight intensity={0.6} /><directionalLight position={[-4, 3, 5]} intensity={1.6} />
        <group rotation={[0, rotY, 0]}>
          <mesh><sphereGeometry args={[2, 96, 96]} /><meshStandardMaterial color="#0f1822" roughness={0.55} metalness={0.2} /></mesh>
          <mesh><sphereGeometry args={[2.06, 64, 64]} /><meshBasicMaterial color={V.blue} transparent opacity={0.06} side={THREE.BackSide} /></mesh>
          <GlobeLines />
          <mesh><tubeGeometry args={[a1, 80, 0.012, 6, false]} /><meshBasicMaterial color={V.green} /></mesh>
          {[...Array(12)].map((_, k) => <mesh key={k} position={a1.getPoint(k / 12)}><sphereGeometry args={[0.03, 8, 8]} /><meshBasicMaterial color={'#B6F046'} /></mesh>)}
          <mesh><tubeGeometry args={[new THREE.QuadraticBezierCurve3(a2.getPoint(0), a2.getPoint(0.28), stop), 30, 0.014, 6, false]} /><meshBasicMaterial color={V.green} /></mesh>
          <mesh position={stop}><boxGeometry args={[0.16, 0.05, 0.12]} /><meshStandardMaterial color="#1c2026" emissive={V.green} emissiveIntensity={0.6} /></mesh>
          <mesh position={stop.clone().multiplyScalar(1.02)} lookAt={[0, 0, 0]}><torusGeometry args={[0.2, 0.012, 8, 40]} /><meshBasicMaterial color={V.red} /></mesh>
        </group>
      </ThreeCanvas>
      {L(US, <Pill col={V.green}><NvLogo h={30} /><span style={{ font: `700 24px ${BODY}`, color: V.sub }}>designs · USA</span></Pill>, -50)}
      {L(TW, <Pill col={V.blue}><span style={{ font: `800 26px ${BODY}`, color: V.blue }}>Made in Taiwan</span></Pill>, 46)}
      {L(CN, <Pill col={V.red}><FlagCN h={26} /><span style={{ font: `800 26px ${BODY}`, color: V.text }}>China</span></Pill>, -46)}
      {L(stop, <span style={{ font: `900 60px ${FONT}`, color: V.red, textShadow: '0 0 20px #000' }}>✕</span>)}
      <Head lines={[['ADVANCED CHIP'], ['EXPORT CONTROLS', V.red]]} size={88} />
      <Cap text="America restricted exports" /><Tag text="Only the most advanced AI chips are restricted · map: Natural Earth" />
    </AbsoluteFill>
  );
};

// S4 · Megaspeed, Singapore (our skyline render) + profile + Bloomberg estimate
export const S4 = () => (
  <AbsoluteFill style={{ background: V.bg }}><FontFace />
    <Img src={staticFile('v4/skyline.jpg')} style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, objectFit: 'cover', filter: 'brightness(.55) saturate(.9) blur(2px)' }} />
    <Shade />
    <Head lines={[['MEGASPEED'], ['SINGAPORE', V.sub]]} size={96} />
    <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 520, background: 'rgba(17,24,32,.93)', border: '1px solid #26313d', borderRadius: 22, padding: '26px 30px' }}>
      <MegaspeedLogo h={58} />
      <div style={{ font: `700 38px ${BODY}`, color: V.text, marginTop: 22 }}>Cloud company · rents out GPU computing</div>
      <div style={{ font: `600 32px ${BODY}`, color: V.sub, marginTop: 10 }}>Alice Huang: former executive (left 2025, per Megaspeed)</div>
      <div style={{ height: 2, background: '#26313d', margin: '22px 0' }} />
      <div style={{ font: `800 130px/1 ${FONT}`, color: V.green, letterSpacing: -4 }}>≈ $4.6B</div>
      <div style={{ font: `700 38px ${BODY}`, color: V.text, marginTop: 8 }}>NVIDIA hardware imported</div>
      <div style={{ font: `600 28px ${BODY}`, color: V.sub, marginTop: 8 }}>Bloomberg analysis · Malaysia & Indonesia customs records · 2023–Nov 2025</div>
    </div>
    <Cap text="a Singapore cloud company" /><Tag text="City: our 3D illustration · not affiliated with Megaspeed or NVIDIA" />
  </AbsoluteFill>
);

// S7 · payoff split: GPU stays left, results arrive right
export const S7 = () => {
  const f = useCurrentFrame(), t = f / 30 + 1.5;
  const cam = [0, 1.15, 7.4], look = [0, 0.85, 0];
  const line = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-0.75, 1.05, 0.1), new THREE.Vector3(0, 1.55, 0.2), new THREE.Vector3(0.75, 1.0, 0.05)]), []);
  return (
    <AbsoluteFill style={{ background: V.bg }}><FontFace />
      <AbsoluteFill style={{ background: `linear-gradient(90deg, #0d1a0b 0%, ${V.bg} 48%, ${V.bg} 52%, #0b1824 100%)` }} />
      <ThreeCanvas width={W} height={H} gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <CamRig pos={cam} look={look} fov={38} /><StudioEnv /><ambientLight intensity={0.4} /><directionalLight position={[-2, 5, 4]} intensity={1.8} />
        <pointLight position={[-0.8, 1.4, 1]} color={V.green} intensity={4} distance={3} /><pointLight position={[0.82, 1.3, 1]} color={V.blue} intensity={4} distance={3} />
        {/* left: rack with GPU, fixed in place */}
        <mesh position={[-0.8, 0.75, -0.3]}><boxGeometry args={[0.6, 1.5, 0.6]} /><meshStandardMaterial color="#14181e" metalness={0.75} roughness={0.3} /></mesh>
        {[...Array(6)].map((_, k) => <mesh key={k} position={[-0.8, 0.25 + k * 0.22, 0.005]}><boxGeometry args={[0.52, 0.16, 0.01]} /><meshStandardMaterial color="#1d232b" emissive={V.green} emissiveIntensity={k === 3 ? 0.5 : 0.08} /></mesh>)}
        <GpuModel scale={0.04} position={[-0.8, 0.98, 0.25]} rotation={[0.9, 0, 0]} />
        {/* right: customer screen with results */}
        <mesh position={[0.82, 1.0, 0]}><boxGeometry args={[0.6, 0.4, 0.03]} /><meshStandardMaterial color="#0a0d12" metalness={0.6} roughness={0.3} /></mesh>
        <mesh position={[0.82, 1.0, 0.017]}><planeGeometry args={[0.55, 0.35]} /><meshBasicMaterial color={V.blue} transparent opacity={0.8} /></mesh>
        <mesh position={[0.82, 0.66, 0]}><boxGeometry args={[0.05, 0.28, 0.05]} /><meshStandardMaterial color="#1a1f26" /></mesh>
        <mesh><tubeGeometry args={[line, 60, 0.01, 6, false]} /><meshBasicMaterial color={V.blue} transparent opacity={0.6} /></mesh>
        {[...Array(10)].map((_, k) => <mesh key={k} position={line.getPoint((t * 0.4 + k / 10) % 1)}><boxGeometry args={[0.05, 0.03, 0.03]} /><meshBasicMaterial color={'#BFE8FF'} /></mesh>)}
      </ThreeCanvas>
      <div style={{ position: 'absolute', left: SAFE.l, top: 1030, width: 360, textAlign: 'center', font: `800 32px ${BODY}`, color: V.green }}>The chip stays put</div>
      <div style={{ position: 'absolute', left: 520, top: 1030, width: 380, textAlign: 'center', font: `800 32px ${BODY}`, color: V.blue }}>The results arrive</div>
      <Head lines={[['ACCESS'], ['≠ OWNERSHIP', V.blue]]} size={124} />
      <Cap text="you don't need to own a chip" /><Tag />
    </AbsoluteFill>
  );
};
