// Alice Huang Short · Scene 1 hook (0-3.5 s, 105 frames). Reuses the V2 hook shot (hook frames 30-90,
// same zoom / lift / shade as nvidia-market-collapse-v2 scene 1) with new text. See alice/SCENE_01.md.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
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

// Dark portrait panel: background clue (blurred), dark figure with a rim glow, big name label.
const Panel = ({ x, side, a, bg, figure, name, role, rim }) => (
  <div style={{ position: 'absolute', left: x, top: 560, width: 360, opacity: a, transform: `translateX(${(1 - a) * (side === 'L' ? -80 : 80)}px)` }}>
    <div style={{ position: 'relative', width: 360, height: 470, borderRadius: 18, overflow: 'hidden', border: '2px solid rgba(255,255,255,.14)', boxShadow: '0 20px 60px rgba(0,0,0,.7)', background: '#07080a' }}>
      <Img src={staticFile(bg)} style={{ position: 'absolute', inset: -30, width: 420, height: 530, objectFit: 'cover', filter: 'blur(10px) brightness(.45) saturate(1.2)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 35%, transparent 30%, rgba(0,0,0,.65) 100%)' }} />
      {figure}
      <AbsoluteFill style={{ boxShadow: `inset 0 0 0 2px ${rim}33` }} />
    </div>
    <div style={{ marginTop: 14, background: '#F5F5F5', borderRadius: 10, padding: '8px 14px', textAlign: 'center' }}>
      <div style={{ font: `800 38px/1.05 ${FONT}`, color: '#101214', letterSpacing: -0.5 }}>{name}</div>
      <div style={{ font: `700 22px ${BODY}`, color: '#3a3f46', marginTop: 2 }}>{role}</div>
    </div>
  </div>
);

const AliceFigure = () => (
  <svg viewBox="0 0 360 470" style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <linearGradient id="rimA" x1="0" x2="1"><stop offset="0" stopColor="#E5484D" stopOpacity=".9" /><stop offset=".25" stopColor="#E5484D" stopOpacity="0" /><stop offset=".75" stopColor="#9FB4FF" stopOpacity="0" /><stop offset="1" stopColor="#9FB4FF" stopOpacity=".7" /></linearGradient>
    </defs>
    {/* generic figure: shoulder-length hair, business jacket; no facial features */}
    <path d="M180 92 C128 92 112 136 114 178 C116 214 108 246 100 270 C122 276 140 270 150 262 L150 300 C112 312 70 330 52 372 L40 470 L320 470 L308 372 C290 330 248 312 210 300 L210 262 C220 270 238 276 260 270 C252 246 244 214 246 178 C248 136 232 92 180 92 Z" fill="#050506" />
    <path d="M180 92 C128 92 112 136 114 178 C116 214 108 246 100 270 C122 276 140 270 150 262 L150 300 C112 312 70 330 52 372 L40 470 L320 470 L308 372 C290 330 248 312 210 300 L210 262 C220 270 238 276 260 270 C252 246 244 214 246 178 C248 136 232 92 180 92 Z" fill="none" stroke="url(#rimA)" strokeWidth="4" />
    <path d="M150 300 L180 360 L210 300" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="3" />
    <text x="180" y="210" textAnchor="middle" style={{ font: "800 92px 'Inter Display',Inter" }} fill="rgba(229,72,77,.85)">?</text>
  </svg>
);

const JensenFigure = () => (
  <Img src={staticFile('alice/jensen_cut.png')} style={{ position: 'absolute', left: 30, top: 40, width: 300, height: 'auto',
    filter: 'brightness(.55) contrast(1.25) drop-shadow(-3px -2px 0 rgba(118,185,0,.85)) drop-shadow(3px -1px 0 rgba(220,230,255,.55)) drop-shadow(0 0 18px rgba(118,185,0,.35))' }} />
);

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
      <AbsoluteFill style={{ background: '#000', opacity: 0.45 * ramp(f, 0.9, 0.4) }} />
      <ScanLine t0={0.3} dur={1.0} />
      <ScanLine t0={1.9} dur={0.7} />
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 220, textAlign: 'center', transform: `scale(${settle})` }}>
        <div style={{ font: `800 100px/1.0 ${FONT}`, letterSpacing: -3, whiteSpace: "nowrap", color: C.white, textShadow: '0 6px 30px #000' }}>WHO GOT CLOSE</div>
        <div style={{ font: `800 100px/1.0 ${FONT}`, letterSpacing: -3, whiteSpace: "nowrap", color: line2, textShadow: `0 0 50px rgba(229,72,77,${0.45 * red}), 0 6px 30px #000` }}>TO NVIDIA’S CEO?</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 452, textAlign: 'center', opacity: ramp(f, 1.0, 0.25) }}>
        <span style={{ font: `800 32px ${BODY}`, color: '#fff', background: '#E5484D', padding: '8px 24px', borderRadius: 40, letterSpacing: 1 }}>ALLEGATIONS · NOT PROVEN</span>
      </div>
      {/* the two people, dark, from 1.0 s; chip darkens behind them */}
      <Panel x={90} side="L" a={ramp(f, 1.0, 0.35)} bg="alice/stage_bg.png" figure={<JensenFigure />} rim={C.green}
        name="JENSEN HUANG" role="NVIDIA CEO · resigned Nov 12" />
      <Panel x={540} side="R" a={ramp(f, 1.15, 0.35)} bg="alice/skyline.png" figure={<AliceFigure />} rim={C.red}
        name="ALICE HUANG" role="ex-CEO, Megaspeed · no relation" />
      <div style={{ position: 'absolute', left: 450, width: 90, top: 790, borderTop: '4px dashed #E5484D', opacity: ramp(f, 1.5, 0.3),
        filter: `drop-shadow(0 0 ${6 + 10 * Math.max(0, Math.sin((t - 1.5) * 6))}px #E5484D)` }} />
      <div style={{ position: 'absolute', left: 430, width: 130, top: 740, textAlign: 'center', font: `800 22px ${BODY}`, color: '#E5484D', opacity: ramp(f, 1.5, 0.3), textShadow: '0 2px 8px #000' }}>reportedly</div>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1262, height: 186, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ font: `800 54px/1.16 ${BODY}`, color: C.white, opacity: capA, textShadow: '0 0 8px #000, 0 3px 14px #000, 0 0 3px #000' }}>
          {CAP.parts.map(([txt, col], k) => <span key={k} style={col ? { color: col } : undefined}>{txt}</span>)}
        </div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, top: 1528, font: `600 22px ${BODY}`, color: 'rgba(245,245,245,.62)', textShadow: '0 1px 6px #000' }}>3D illustration · not affiliated with NVIDIA</div>
    </AbsoluteFill>
  );
};
