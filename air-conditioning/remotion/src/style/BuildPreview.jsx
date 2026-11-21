// Build-it-yourself AC · step images: Blender plate + big outlined temperature, one big word, heat/air graphics.
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';

const FontFace = () => (
  <style>{`@font-face { font-family: 'Lilita'; src: url('${staticFile('fonts/LilitaOne.woff2')}') format('woff2'); }`}</style>
);
const Big = ({ text, size, color, y }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', font: `${size}px Lilita`, color, letterSpacing: 1,
    WebkitTextStroke: `${Math.round(size / 9)}px #1C1A17`, paintOrder: 'stroke fill', textShadow: `0 ${size / 14}px 0 rgba(0,0,0,.35)` }}>{text}</div>
);
const Squiggle = ({ x, y, h = 340, color = '#E8B26A', w = 11 }) => {
  let d = `M ${x} ${y}`;
  for (let i = 0; i < 6; i++) d += ` q ${i % 2 ? -34 : 34} ${h / 12} 0 ${h / 6}`;
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" opacity=".9" />;
};
const Arrow = ({ x, y, rot, color = '#F59A2E', s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -60 -22 L 10 -22 L 10 -52 L 70 0 L 10 52 L 10 22 L -60 22 Z" fill={color} stroke="#1C1A17" strokeWidth="6" strokeLinejoin="round" opacity=".95" />
  </g>
);
const Air = ({ x, y, color, dir = 1 }) => (
  <path d={`M ${x} ${y} q ${60 * dir} 40 0 90 t 0 90 t 0 90`} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" opacity=".85" />
);

const SHOTS = {
  w_closed: { temp: '35°C', tc: '#F4A93C', word: 'Hot!' },
  w_open: { temp: '35°C', tc: '#F4A93C', word: 'Open it' },
  w_fan: { temp: '35°C', tc: '#F4A93C', word: 'Add a fan' },
  w_ice: { temp: '31°C', tc: '#9AD3F5', word: 'Add ice' },
};

export const BuildPreview = ({ shot }) => {
  const s = SHOTS[shot];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFace />
      <Img src={staticFile(`plates/${shot}.png`)} style={{ width: 1080, height: 1920 }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {shot === 'w_closed' && <><Squiggle x={110} y={1520} /><Squiggle x={330} y={1560} h={280} /><Squiggle x={760} y={1540} /><Squiggle x={960} y={1500} h={300} /></>}
        {shot === 'w_open' && <>
          {/* hot outside air pushing in through the opening */}
          <Arrow x={330} y={1150} rot={90} s={1.1} /><Arrow x={540} y={1110} rot={90} s={1.2} /><Arrow x={750} y={1150} rot={90} s={1.1} />
          <Squiggle x={230} y={960} h={300} /><Squiggle x={850} y={960} h={300} />
          <Squiggle x={130} y={1520} /><Squiggle x={940} y={1520} />
        </>}
        {shot === 'w_fan' && <>
          {[380, 540, 700].map((x, i) => <Air key={i} x={x} y={1430} color="rgba(255,255,255,.95)" dir={i % 2 ? -1 : 1} />)}
          <Squiggle x={130} y={1480} /><Squiggle x={950} y={1480} />
        </>}
        {shot === 'w_ice' && <>
          {[380, 540, 700].map((x, i) => <Air key={i} x={x} y={1520} color="#7CC8F2" dir={i % 2 ? -1 : 1} />)}
          <Squiggle x={130} y={1500} color="rgba(232,178,106,.45)" /><Squiggle x={950} y={1500} color="rgba(232,178,106,.45)" />
        </>}
      </svg>
      <Big text={s.temp} size={190} color={s.tc} y={150} />
      <Big text={s.word} size={130} color="#FFFFFF" y={shot === 'w_closed' ? 900 : 1600} />
    </AbsoluteFill>
  );
};
