// Scene S1 · "Who is Alice Huang?" (150 frames). Blender/Cycles plate (renders/s1/f_0001..0150, spec frame N = file N+1)
// + crisp Remotion overlays: dominant headline, relationship row, voice-synced captions. No branding, no fade-in.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { FONT, BODY, SAFE, clamp } from '../theme';
import { FontFace } from '../ui';
import { NvLogo } from '../alice/Logos';
import { V } from '../alicev4/brand';

const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const span = (f, a, b) => ease((f - a) / Math.max(1, b - a));
// caption cues from the measured narration (4.57 s at 158 wpm); re-timed after the final voice take
const CAPS = [[0, 36, 'Who is Alice Huang,'], [36, 84, 'and why did her NVIDIA connection'], [84, 135, 'draw scrutiny?']];

export const S1AliceMystery = () => {
  const f = useCurrentFrame();
  const head = 1 - span(f, 129, 146);                       // clears for the macro hand-off (no fade to black)
  const settle = 1 + 0.02 * (1 - span(f, 0, 30));           // gentle scale settle, visible at frame 0
  const rel = span(f, 86, 100) * (1 - span(f, 132, 146));
  const nv = span(f, 44, 56) * (1 - span(f, 84, 92));
  const cap = CAPS.find(([a, b]) => f >= a && f < b);
  return (
    <AbsoluteFill style={{ background: V.bg }}>
      <FontFace />
      <Img src={staticFile(`s1/f_${String(f + 1).padStart(4, '0')}.png`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(8,12,16,.78) 0%, rgba(8,12,16,0) 30%, rgba(8,12,16,0) 64%, rgba(8,12,16,.7) 100%)' }} />
      {/* headline: ALICE HUANG dominant */}
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 205, textAlign: 'center', opacity: head, transform: `scale(${settle})` }}>
        <div style={{ font: `800 64px/1 ${FONT}`, letterSpacing: 6, color: V.sub }}>WHO IS</div>
        <div style={{ font: `800 128px/1.02 ${FONT}`, letterSpacing: -3.5, color: V.text, textShadow: '0 6px 30px rgba(0,0,0,.8)', marginTop: 8 }}>ALICE HUANG?</div>
      </div>
      {/* beat 2: NVIDIA identified */}
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1120, display: 'flex', justifyContent: 'center', opacity: nv }}>
        <div style={{ background: 'rgba(17,24,32,.88)', border: '1px solid #2a3540', borderRadius: 14, padding: '10px 20px' }}><NvLogo h={40} /></div>
      </div>
      {/* beat 3: verified relationship, neutral */}
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1095, opacity: rel, transform: `translateY(${(1 - rel) * 16}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, background: 'rgba(17,24,32,.9)', border: '1px solid #2a3540', borderRadius: 16, padding: '16px 18px' }}>
          <span style={{ font: `800 34px ${FONT}`, color: V.text }}>ALICE HUANG</span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', font: `700 18px ${BODY}`, color: V.sub }}><span style={{ font: `800 34px ${BODY}`, color: V.green, lineHeight: 1 }}>→</span>former exec</span>
          <span style={{ font: `800 34px ${FONT}`, color: V.text, letterSpacing: 1 }}>MEGASPEED</span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', font: `700 18px ${BODY}`, color: V.sub }}><span style={{ font: `800 34px ${BODY}`, color: V.green, lineHeight: 1 }}>→</span>customer</span>
          <NvLogo h={34} />
        </div>
      </div>
      {cap && <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1300, textAlign: 'center', font: `800 60px/1.12 ${BODY}`, color: /NVIDIA/.test(cap[2]) ? V.green : V.text, textShadow: '0 0 10px #000, 0 4px 18px #000' }}>{cap[2]}</div>}
      <div style={{ position: 'absolute', left: SAFE.l, top: 1528, font: `600 22px ${BODY}`, color: 'rgba(244,246,248,.6)' }}>3D illustration · not affiliated with NVIDIA or Megaspeed</div>
    </AbsoluteFill>
  );
};
