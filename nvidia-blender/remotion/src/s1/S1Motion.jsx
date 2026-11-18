// S1 2.5D hook · motion preview: background-only motion on the illustrated plates (beams, haze, flicker,
// city twinkle, glass reflection) + slow camera moves; Shot 3 = our 3D GPU over the map. 150 frames.
import React, { useMemo } from 'react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, random } from 'remotion';
import { FONT, BODY, SAFE, clamp, lerp } from '../theme';
import { FontFace } from '../ui';
import { V } from '../alicev4/brand';
import { S1Shot3 } from './S1Shot3';

const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const span = (f, a, b) => ease((f - a) / Math.max(1, b - a));

const Beam = ({ x, w, ang, f, speed, col, op }) => {
  const a = ang + Math.sin(f / 30 * speed) * 6;
  return <div style={{ position: 'absolute', left: x, top: -200, width: w, height: 1500, transformOrigin: '50% 0%', transform: `rotate(${a}deg)`,
    background: `linear-gradient(180deg, ${col} 0%, rgba(0,0,0,0) 85%)`, opacity: op, mixBlendMode: 'screen', filter: 'blur(18px)' }} />;
};
const Haze = ({ f, y = 900, op = 0.25 }) => (
  <div style={{ position: 'absolute', left: -400, top: y, width: 1900, height: 700, opacity: op, mixBlendMode: 'screen', filter: 'blur(40px)',
    transform: `translateX(${Math.sin(f / 70) * 60 + f * 0.6}px)`,
    background: 'radial-gradient(ellipse at 30% 50%, rgba(170,200,230,.35), transparent 60%), radial-gradient(ellipse at 75% 40%, rgba(118,185,0,.18), transparent 55%)' }} />
);

const Shot1 = () => {
  const f = useCurrentFrame();
  const z = lerp(1.0, 1.12, ease(f / 48));
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: V.bg }}>
      <Img src={staticFile('s1m/jensen_char.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`, transformOrigin: '42% 30%' }} />
      <Beam x={60} w={140} ang={-18} f={f} speed={1.3} col="rgba(118,185,0,.55)" op={0.55} />
      <Beam x={560} w={120} ang={14} f={f + 20} speed={1.0} col="rgba(220,235,255,.45)" op={0.4} />
      <Beam x={860} w={150} ang={22} f={f + 40} speed={1.6} col="rgba(118,185,0,.4)" op={0.45} />
      <Haze f={f} y={300} op={0.22} />
      {/* audience area flicker (phones / stage spill) */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, transparent 78%, rgba(160,210,120,.10) 100%)', opacity: 0.6 + 0.4 * Math.sin(f / 4) * random(Math.floor(f / 3)), mixBlendMode: 'screen' }} />
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1180, textAlign: 'center', opacity: 1 - span(f, 40, 46) }}>
        <div style={{ font: `800 86px/1 ${FONT}`, letterSpacing: -2, color: V.text, textShadow: '0 6px 30px rgba(0,0,0,.85)' }}>NVIDIA’S <span style={{ color: V.green }}>CEO</span></div>
      </div>
    </AbsoluteFill>
  );
};

const Shot2 = () => {
  const f = useCurrentFrame();
  const stars = useMemo(() => [...Array(70)].map((_, k) => ({ x: 560 + random(`x${k}`) * 520, y: 250 + random(`y${k}`) * 1150, s: 2 + random(`s${k}`) * 3, p: random(`p${k}`) * 6 })), []);
  const pan = lerp(-30, 30, ease(f / 51));
  const sweep = lerp(-500, 1400, clamp(f / 51));
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: V.bg }}>
      <Img src={staticFile('s1m/alice_char.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(1.08) translateX(${pan}px)` }} />
      {stars.map((s, k) => <div key={k} style={{ position: 'absolute', left: s.x + pan, top: s.y, width: s.s, height: s.s, borderRadius: s.s, background: '#fff3d6',
        opacity: 0.25 + 0.55 * Math.max(0, Math.sin(f / 5 + s.p)), mixBlendMode: 'screen', boxShadow: '0 0 6px #ffe7b0' }} />)}
      {/* slow reflection across the glass */}
      <div style={{ position: 'absolute', left: sweep, top: -200, width: 220, height: 2400, transform: 'rotate(14deg)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.09), transparent)', mixBlendMode: 'screen' }} />
      <Haze f={f} y={1200} op={0.12} />
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1150, textAlign: 'center', opacity: span(f, 4, 12) }}>
        <div style={{ font: `800 86px/1 ${FONT}`, letterSpacing: -2, color: V.text, textShadow: '0 6px 30px rgba(0,0,0,.85)' }}>ALICE HUANG</div>
        <div style={{ font: `800 32px ${FONT}`, letterSpacing: 10, color: V.green, marginTop: 14 }}>THE CONNECTION</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, top: 1490, font: `600 24px ${BODY}`, color: 'rgba(244,246,248,.78)', textShadow: '0 1px 6px #000' }}>Illustration · not her likeness · skyline placeholder</div>
    </AbsoluteFill>
  );
};

export const S1Motion = () => {
  const f = useCurrentFrame();
  const x12 = span(f, 42, 50), x23 = span(f, 92, 100);
  return (
    <AbsoluteFill style={{ background: V.bg }}>
      <FontFace />
      <AbsoluteFill style={{ opacity: 1 - x12, transform: `translateX(${-x12 * 300}px)` }}><Shot1 /></AbsoluteFill>
      <Sequence from={42}><AbsoluteFill style={{ opacity: x12 * (1 - x23), transform: `translateX(${(1 - x12) * 300 - x23 * 200}px)` }}><Shot2 /></AbsoluteFill></Sequence>
      <Sequence from={92}><AbsoluteFill style={{ opacity: x23 }}><S1Shot3 /></AbsoluteFill></Sequence>
      <div style={{ position: 'absolute', left: SAFE.l, top: 1528, font: `600 22px ${BODY}`, color: 'rgba(244,246,248,.72)', textShadow: '0 1px 6px #000' }}>{f < 92 ? 'AI-generated illustration' : ''}</div>
    </AbsoluteFill>
  );
};
