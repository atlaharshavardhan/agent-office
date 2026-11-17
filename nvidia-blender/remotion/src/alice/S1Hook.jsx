// Alice Huang Short · Scene 1 hook (0-3.5 s, 105 frames). Reuses the V2 hook shot (hook frames 30-90,
// same zoom / lift / shade as nvidia-market-collapse-v2 scene 1) with new text. See alice/SCENE_01.md.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, FONT, BODY, SAFE, ramp, clamp, lerp } from '../theme';
import { FontFace } from '../ui';
import { BlendSeq, Shade } from '../v2/kit';

const DUR = 3.5;
const CAP = { t0: 0.15, t1: 3.45, parts: [['Did a woman U.S. officials suspect of '], ['spying for China', C.red], [' get close to '], ['the most powerful man in AI?', C.green]] };

const ScanLine = ({ t0, dur }) => {
  const f = useCurrentFrame(), t = f / 30 - t0;
  if (t < 0 || t > dur + 0.3) return null;
  const y = lerp(-20, 1940, clamp(t / dur));
  const fade = 1 - clamp((t - dur) / 0.3);
  return (
    <>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(229,72,77,.10) 0px, rgba(229,72,77,0) ${y}px)`, opacity: 0.8 * fade }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: y - 3, height: 6, background: 'rgba(229,72,77,.7)', boxShadow: '0 0 40px 12px rgba(229,72,77,.45)', opacity: fade }} />
    </>
  );
};

export const AliceS1 = () => {
  const f = useCurrentFrame(), t = f / 30;
  const red = ramp(f, 1.8, 0.35);
  const line2 = `rgb(${Math.round(lerp(118, 229, red))},${Math.round(lerp(185, 72, red))},${Math.round(lerp(0, 77, red))})`;
  const settle = 1.04 - 0.04 * ramp(f, 0, 0.3);
  const capA = ramp(f, CAP.t0 - 0.05, 0.1);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <FontFace />
      <BlendSeq dir="hook" start={0} first={30} last={90} rate={60 / (DUR * 30)} scale={1.04 + 0.05 * clamp(t / DUR)} dy={150} />
      <Shade top={0.75} bottom={0.4} />
      <ScanLine t0={0.3} dur={1.0} />
      <ScanLine t0={1.9} dur={0.7} />
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 220, textAlign: 'center', transform: `scale(${settle})` }}>
        <div style={{ font: `800 100px/1.0 ${FONT}`, letterSpacing: -3, whiteSpace: "nowrap", color: C.white, textShadow: '0 6px 30px #000' }}>WHO GOT CLOSE</div>
        <div style={{ font: `800 100px/1.0 ${FONT}`, letterSpacing: -3, whiteSpace: "nowrap", color: line2, textShadow: `0 0 50px rgba(229,72,77,${0.45 * red}), 0 6px 30px #000` }}>TO NVIDIA’S CEO?</div>
        <div style={{ marginTop: 26, opacity: ramp(f, 1.0, 0.25) }}>
          <span style={{ font: `800 34px ${BODY}`, color: '#101214', background: '#F5F5F5', padding: '10px 26px', borderRadius: 40, letterSpacing: 1 }}>ALLEGATIONS · NOT PROVEN</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1262, height: 186, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ font: `800 54px/1.16 ${BODY}`, color: C.white, opacity: capA, textShadow: '0 0 8px #000, 0 3px 14px #000, 0 0 3px #000' }}>
          {CAP.parts.map(([txt, col], k) => <span key={k} style={col ? { color: col } : undefined}>{txt}</span>)}
        </div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, top: 1528, font: `600 22px ${BODY}`, color: 'rgba(245,245,245,.62)', textShadow: '0 1px 6px #000' }}>3D illustration · not affiliated with NVIDIA</div>
    </AbsoluteFill>
  );
};
