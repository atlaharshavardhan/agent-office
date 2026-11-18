// Scene S1 V2 · "Who is Alice Huang?" (150 frames). Blender/Cycles plate (renders/s1/f_0001..0150, spec frame N = file N+1)
// + Remotion overlays: headline (readable from frame 0), relationship labels pinned to the 3D connection lines
// (anchors.json exported from the Blender camera), voice-synced subtitles. No branding, no fade-in.
import React from 'react';
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from 'remotion';
import { FONT, BODY, SAFE, clamp } from '../theme';
import { FontFace } from '../ui';
import { V } from '../alicev4/brand';
import A from './anchors.json';

const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const span = (f, a, b) => ease((f - a) / Math.max(1, b - a));
// beat 1 is carried by the headline itself; subtitles start with beat 2 to avoid duplicate words on screen
const CAPS = [[36, 84, [['and why did her '], ['NVIDIA', V.green], [' connection']]], [84, 128, [['draw '], ['scrutiny?', V.text]]]];

const Tag = ({ at, txt, a }) => {
  const p = A[at] && A[at].l1; if (!p) return null;
  return (
    <div style={{ position: 'absolute', left: p[0], top: p[1], transform: 'translate(-108%, -60%)', opacity: a, whiteSpace: 'nowrap',
      font: `700 26px ${BODY}`, color: V.text, background: 'rgba(8,12,16,.78)', border: '1px solid rgba(118,185,0,.55)', borderRadius: 10, padding: '6px 12px' }}>{txt}</div>
  );
};

export const S1AliceMystery = () => {
  const f = useCurrentFrame();
  const head = 1 - span(f, 122, 134);                      // headline leaves before the macro transition
  const settle = 1 + 0.015 * (1 - span(f, 0, 30));
  const t1 = span(f, 108, 116) * (1 - span(f, 128, 136));
  const t2 = span(f, 116, 124) * (1 - span(f, 130, 138));
  const cap = CAPS.find(([a, b]) => f >= a && f < b);
  const a = A[f] || {};
  return (
    <AbsoluteFill style={{ background: V.bg }}>
      <FontFace />
      <Img src={staticFile(`s1/f_${String(f + 1).padStart(4, '0')}.png`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(8,12,16,.72) 0%, rgba(8,12,16,0) 26%, rgba(8,12,16,0) 70%, rgba(8,12,16,.6) 100%)' }} />
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 215, textAlign: 'center', opacity: head, transform: `scale(${settle})` }}>
        <div style={{ font: `800 46px/1 ${FONT}`, letterSpacing: 8, color: V.green }}>WHO IS</div>
        <div style={{ font: `800 90px/1.04 ${FONT}`, letterSpacing: -2.5, whiteSpace: 'nowrap', color: V.text, textShadow: '0 6px 30px rgba(0,0,0,.8)', marginTop: 10 }}>ALICE HUANG?</div>
      </div>
      {a.l1 && <Tag at={f} txt="former executive" a={t1} />}
      {a.l2 && <div style={{ position: 'absolute', left: a.l2[0], top: a.l2[1], transform: 'translate(-50%, 40%)', opacity: t2, whiteSpace: 'nowrap',
        font: `700 26px ${BODY}`, color: V.text, background: 'rgba(8,12,16,.78)', border: '1px solid rgba(118,185,0,.55)', borderRadius: 10, padding: '6px 12px' }}>NVIDIA customer</div>}
      {cap && <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1330, textAlign: 'center', font: `800 50px/1.15 ${BODY}`, color: V.text, textShadow: '0 0 10px #000, 0 4px 18px #000' }}>
        {cap[2].map(([t, c], k) => <span key={k} style={c ? { color: c } : undefined}>{t}</span>)}</div>}
      <Audio src={staticFile('s1audio/s1_mix.wav')} />
      <div style={{ position: 'absolute', left: SAFE.l, top: 1528, font: `600 24px ${BODY}`, color: 'rgba(244,246,248,.72)', textShadow: '0 1px 6px #000' }}>3D illustration · not affiliated with NVIDIA or Megaspeed</div>
    </AbsoluteFill>
  );
};
