// V2 helpers: Blender sequence player with frame blending (for shots rendered every 2nd frame),
// big-type title / number blocks, and a cut-through flash.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, BODY, SAFE, ramp, clamp } from '../theme';

// Plays renders/<dir>/f_####.png. `rate` = source frames per output frame; `step` = rendered every N frames.
export const BlendSeq = ({ dir, start, first = 1, last, rate = 1, step = 1, scale = 1, origin = '50% 50%', dy = 0, filter }) => {
  const f = useCurrentFrame();
  const pos = Math.min(last, Math.max(first, first + (f - Math.round(start * 30)) * rate));
  const a = first + Math.floor((pos - first) / step) * step;
  const b = Math.min(last, a + step);
  const mix = step > 1 || rate !== 1 ? (pos - a) / Math.max(1, b - a) : 0;
  const src = (n) => staticFile(`${dir}/f_${String(n).padStart(4, '0')}.png`);
  const style = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
    transform: `translateY(${-dy}px) scale(${scale})`, transformOrigin: origin, filter };
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
      <Img src={src(a)} style={style} />
      {mix > 0.02 && b !== a && <Img src={src(b)} style={{ ...style, opacity: mix }} />}
    </AbsoluteFill>
  );
};

export const BigTitle = ({ at, lines, sub, top = 228, size = 104, hold = 99 }) => {
  const f = useCurrentFrame();
  const out = 1 - ramp(f, at + hold, 0.25);
  return (
    <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top, textAlign: 'center', opacity: out }}>
      {lines.map(([txt, col], k) => {
        const a = ramp(f, at + k * 0.12, 0.35);
        return <div key={k} style={{ font: `800 ${size}px/1.0 ${FONT}`, letterSpacing: -2.5, color: col || C.white, opacity: a,
          transform: `translateY(${(1 - a) * 26}px)`, textShadow: '0 4px 24px rgba(0,0,0,.85), 0 0 2px #000' }}>{txt}</div>;
      })}
      {sub && <div style={{ marginTop: 14, font: `700 36px ${BODY}`, color: '#F5F5F5', opacity: ramp(f, at + 0.25, 0.35),
        textShadow: '0 3px 14px #000, 0 0 2px #000' }}>{sub}</div>}
    </div>
  );
};

export const Shade = ({ top = 0.55, bottom = 0.55 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${top}) 0%, transparent 26%, transparent 60%, rgba(0,0,0,${bottom}) 100%)` }} />
);

export const CutFlash = ({ at, color = '#ffffff', dur = 0.18, max = 0.85 }) => {
  const f = useCurrentFrame();
  const t = f / 30 - at;
  if (t < -dur || t > dur) return null;
  return <AbsoluteFill style={{ background: color, opacity: max * (1 - Math.abs(t) / dur) }} />;
};

export const Stat = ({ at, value, label, color = C.red, top = 1040, left = SAFE.l }) => {
  const f = useCurrentFrame();
  const a = ramp(f, at, 0.3);
  return (
    <div style={{ position: 'absolute', left, top, opacity: a, transform: `scale(${0.85 + 0.15 * a})`, transformOrigin: 'left center',
      background: 'rgba(8,9,11,.78)', padding: '16px 26px', borderRadius: 18, border: `2px solid ${color}66` }}>
      <div style={{ font: `800 86px/1 ${FONT}`, color }}>{value}</div>
      <div style={{ font: `700 30px ${BODY}`, color: '#F5F5F5', marginTop: 6 }}>{label}</div>
    </div>
  );
};

export const IllustrationTag = ({ text = 'Illustration · not a real event · not affiliated with NVIDIA' }) => (
  <div style={{ position: 'absolute', left: SAFE.l, top: 1528, font: `600 22px ${BODY}`, color: 'rgba(245,245,245,.62)', textShadow: '0 1px 6px #000' }}>{text}</div>
);
