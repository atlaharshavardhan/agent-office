// S1 V4 · high-stakes hook (150 frames). Plates: AI-generated reference stills (Higgsfield, disclosed) for A/B/C,
// our Blender GPU macro for D. Typography + Ken Burns motion in Remotion. Facts: research.json C02/C03/C04.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { FONT, BODY, SAFE, clamp, lerp } from '../theme';
import { FontFace } from '../ui';
import { NvLogo } from '../alice/Logos';
import { V } from '../alicev4/brand';

const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const span = (f, a, b) => ease((f - a) / Math.max(1, b - a));
const Plate = ({ src, f, a, b, z0, z1, ox = 0 }) => {
  const u = clamp((f - a) / (b - a));
  return <Img src={staticFile(src)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${lerp(z0, z1, u)}) translateX(${ox * u}px)`, transformOrigin: '50% 55%' }} />;
};
const Grade = () => <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(8,12,16,.7) 0%, rgba(8,12,16,0) 30%, rgba(8,12,16,0) 66%, rgba(8,12,16,.72) 100%)' }} />;
const CAPS = [[0, 45, [['Billions in '], ['NVIDIA', V.green], [' hardware.']]], [45, 90, [['A Singapore company.']]], [90, 136, [['And '], ['Alice Huang.', V.text]]]];

export const S1V4 = () => {
  const f = useCurrentFrame();
  const xAB = span(f, 40, 48), xBC = span(f, 86, 94), xCD = span(f, 132, 140);
  const cap = CAPS.find(([a, b]) => f >= a && f < b);
  return (
    <AbsoluteFill style={{ background: V.bg }}>
      <FontFace />
      {/* A · data center: forward push from frame 0 */}
      <AbsoluteFill style={{ opacity: 1 - xAB }}><Plate src="s1v4/dc.jpg" f={f} a={0} b={48} z0={1.06} z1={1.22} /></AbsoluteFill>
      {/* B · Singapore aerial: slow drift */}
      <AbsoluteFill style={{ opacity: xAB * (1 - xBC) }}><Plate src="s1v4/sg.jpg" f={f} a={40} b={94} z0={1.12} z1={1.02} ox={-30} /></AbsoluteFill>
      {/* C · corporate environment, no person */}
      <AbsoluteFill style={{ opacity: xBC * (1 - xCD) }}><Plate src="s1v4/office.jpg" f={f} a={86} b={140} z0={1.02} z1={1.12} /></AbsoluteFill>
      {/* D · our GPU macro (Blender) */}
      <AbsoluteFill style={{ opacity: xCD }}><Plate src="s1v4/gpu_macro.jpg" f={f} a={132} b={150} z0={1.0} z1={1.15} /></AbsoluteFill>
      <Grade />
      {/* A headline: verified figure, visible at frame 0 */}
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 230, textAlign: 'center', opacity: 1 - span(f, 38, 46) }}>
        <div style={{ font: `800 150px/0.95 ${FONT}`, letterSpacing: -5, color: V.green, textShadow: '0 6px 34px rgba(0,0,0,.7)' }}>$4.6B</div>
        <div style={{ font: `800 50px/1.1 ${FONT}`, color: V.text, marginTop: 10, textShadow: '0 4px 20px #000' }}>IN NVIDIA HARDWARE</div>
        <div style={{ font: `700 26px ${BODY}`, color: V.sub, marginTop: 10, textShadow: '0 2px 10px #000' }}>Bloomberg estimate · imports 2023–Nov 2025</div>
      </div>
      {/* B */}
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 250, textAlign: 'center', opacity: span(f, 46, 54) * (1 - span(f, 84, 92)) }}>
        <div style={{ font: `800 104px/1 ${FONT}`, letterSpacing: -2, color: V.text, textShadow: '0 6px 30px rgba(0,0,0,.8)' }}>MEGASPEED</div>
        <div style={{ font: `800 44px ${FONT}`, letterSpacing: 14, color: V.sub, marginTop: 12 }}>SINGAPORE</div>
        <div style={{ font: `700 26px ${BODY}`, color: V.sub, marginTop: 10 }}>cloud company · NVIDIA customer</div>
      </div>
      {/* C */}
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 250, textAlign: 'center', opacity: span(f, 92, 100) * (1 - span(f, 128, 136)) }}>
        <div style={{ font: `800 40px ${FONT}`, letterSpacing: 8, color: V.green }}>AND</div>
        <div style={{ font: `800 112px/1.02 ${FONT}`, letterSpacing: -3, whiteSpace: 'nowrap', color: V.text, textShadow: '0 6px 30px rgba(0,0,0,.85)' }}>ALICE HUANG</div>
        <div style={{ font: `700 28px ${BODY}`, color: V.sub, marginTop: 12 }}>former Megaspeed executive</div>
      </div>
      {cap && <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1330, textAlign: 'center', font: `800 50px/1.15 ${BODY}`, color: V.text, textShadow: '0 0 10px #000, 0 4px 18px #000' }}>
        {cap[2].map(([t, c], k) => <span key={k} style={c ? { color: c } : undefined}>{t}</span>)}</div>}
      <div style={{ position: 'absolute', left: SAFE.l, top: 1528, font: `600 22px ${BODY}`, color: 'rgba(244,246,248,.72)', textShadow: '0 1px 6px #000' }}>
        {f < 132 ? 'AI-generated illustration · not a real location of any company' : '3D illustration · not affiliated with NVIDIA or Megaspeed'}</div>
    </AbsoluteFill>
  );
};
