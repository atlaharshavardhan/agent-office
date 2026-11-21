// Part 1 (0-15 s): window opens -> fan in the window -> ice block. 3D Blender frames (public/anim1) +
// big outlined temperature, word-by-word captions, heat squiggles / arrows, fan air (white -> blue after the ice).
import React from 'react';
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, interpolate, Easing } from 'remotion';
import VO from './part1_vo.json';

export const PART1_FRAMES = 450;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = (x) => Easing.inOut(Easing.cubic)(clamp(x));
const pad = (n) => String(n).padStart(4, '0');

/** which rendered Blender frame to show (only moving frames were rendered; holds + 3-frame fan-spin loop reuse them) */
const plateFor = (f) => {
  if (f < 30) return 30;
  if (f <= 60) return f;
  if (f < 160) return 60;
  if (f <= 222) return f;
  if (f < 340) return 220 + ((f - 220) % 3);
  if (f <= 375) return f;
  return 373 + ((f - 373) % 3);
};

const FontFace = () => (
  <style>{`@font-face { font-family: 'Lilita'; src: url('${staticFile('fonts/LilitaOne.woff2')}') format('woff2'); }`}</style>
);
const Outlined = ({ children, size, color, style }) => (
  <div style={{ font: `${size}px Lilita`, color, letterSpacing: 1, WebkitTextStroke: `${Math.round(size / 9)}px #1C1A17`, paintOrder: 'stroke fill',
    textShadow: `0 ${size / 14}px 0 rgba(0,0,0,.35)`, ...style }}>{children}</div>
);

const Squiggle = ({ x, y, f, h = 320, color = '#E8B26A', op = 1, speed = 1.2 }) => {
  const rise = (f * speed) % 60;
  let d = `M ${x} ${y - rise}`;
  for (let i = 0; i < 6; i++) d += ` q ${i % 2 ? -32 : 32} ${h / 12} 0 ${h / 6}`;
  return <path d={d} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" opacity={op} />;
};
const Arrow = ({ x, y, rot, s = 1, op = 1, color = '#F59A2E' }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
    <path d="M -60 -22 L 10 -22 L 10 -52 L 70 0 L 10 52 L 10 22 L -60 22 Z" fill={color} stroke="#1C1A17" strokeWidth="6" strokeLinejoin="round" />
  </g>
);
const AirLine = ({ x, f, color, op, i }) => (
  <path d={`M ${x} 1140 q ${i % 2 ? -50 : 50} 70 0 140 t 0 140 t 0 140`} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
    strokeDasharray="70 60" strokeDashoffset={-f * 8 - i * 30} opacity={op} />
);

// word-by-word captions (big, centred over the lower window like the reference style)
const WORDS = VO.flatMap((l) => {
  const ws = l.text.split(' '); const tot = ws.reduce((s, w) => s + w.length + 1, 0); let t = l.from;
  return ws.map((w) => { const d = (l.to - l.from) * (w.length + 1) / tot; const o = { w, from: t, to: t + d }; t += d; return o; });
});

export const Part1 = () => {
  const f = useCurrentFrame();
  const sec = f / 30;
  const open = ease((f - 30) / 30);
  const hot = clamp((f - 55) / 15) * (1 - clamp((f - 372) / 30));
  const fanOn = clamp((f - 190) / 30);
  const cool = clamp((f - 372) / 25);
  const temp = interpolate(f, [0, 40, 110, 372, 440], [33, 33, 35, 35, 31], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const hotTemp = temp > 33.5;
  const word = WORDS.find((w) => sec >= w.from && sec < w.to + 0.05);
  const wIn = word ? clamp((sec - word.from) / 0.08) : 0;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFace />
      <Img src={staticFile(`anim1/${pad(plateFor(f))}.png`)} style={{ width: 1080, height: 1920 }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* hot air pushing in through the opened window */}
        {hot > 0 && [330, 540, 750].map((x, i) => {
          const p = ((f - 55) / 40 + i * 0.33) % 1;
          return <Arrow key={i} x={x} y={980 + p * 260} rot={90} s={1.05} op={hot * Math.min(1, p / 0.2, (1 - p) / 0.25)} />;
        })}
        {[140, 950].map((x, i) => <Squiggle key={i} x={x} y={1500} f={f + i * 20} op={0.9 * (1 - cool * 0.6)} />)}
        {[330, 760].map((x, i) => <Squiggle key={`s${i}`} x={x} y={1560} f={f + i * 35} h={260} op={0.85 * (1 - fanOn) * (1 - cool)} />)}
        {/* fan air: white, turns blue once it passes the ice */}
        {fanOn > 0 && [400, 540, 680].map((x, i) => (
          <AirLine key={i} x={x} f={f} i={i} op={0.9 * fanOn}
            color={cool > 0 ? `rgb(${Math.round(255 - 131 * cool)},${Math.round(255 - 55 * cool)},${Math.round(255 - 13 * cool)})` : '#FFFFFF'} />
        ))}
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 236, textAlign: 'center' }}>
        <Outlined size={180} color={hotTemp ? '#F4A93C' : '#9AD3F5'} style={{ display: 'inline-block', transform: `scale(${1 + 0.04 * Math.sin(f / 6) * (hotTemp ? 1 : 0)})` }}>
          {Math.round(temp)}°C
        </Outlined>
      </div>
      {word && (
        <div style={{ position: 'absolute', left: 90, right: 90, top: 1290, textAlign: 'center' }}>
          <Outlined size={120} color="#FFFFFF" style={{ display: 'inline-block', transform: `scale(${0.85 + 0.15 * wIn})` }}>{word.w.replace(/[.,…]/g, '')}</Outlined>
        </div>
      )}
      <Audio src={staticFile('audio/part1.wav')} />
    </AbsoluteFill>
  );
};
