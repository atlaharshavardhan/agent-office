// Style test (v3 look): 3D Blender plate + big outlined temperature, one-word caption, heat squiggles, arrows.
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';

const FontFace = () => (
  <style>{`@font-face { font-family: 'Lilita'; src: url('${staticFile('fonts/LilitaOne.woff2')}') format('woff2'); }`}</style>
);

/** chunky outlined text like a game title: fill + thick dark outline + soft shadow */
const Big = ({ text, size, color, x, y, anchor = 'center' }) => (
  <div style={{ position: 'absolute', left: anchor === 'center' ? 0 : x, right: anchor === 'center' ? 0 : undefined, top: y, textAlign: 'center',
    font: `${size}px Lilita`, color, letterSpacing: 1, WebkitTextStroke: `${Math.round(size / 9)}px #1C1A17`, paintOrder: 'stroke fill',
    textShadow: `0 ${size / 14}px 0 rgba(0,0,0,.35)` }}>{text}</div>
);

const Squiggle = ({ x, y, h = 360, color = '#E8B26A', w = 10 }) => {
  let d = `M ${x} ${y}`;
  for (let i = 0; i < 6; i++) d += ` q ${i % 2 ? -36 : 36} ${h / 12} 0 ${h / 6}`;
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" opacity=".9" />;
};

const Arrow = ({ x, y, rot, color = '#F59A2E', s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -60 -22 L 10 -22 L 10 -52 L 70 0 L 10 52 L 10 22 L -60 22 Z" fill={color} stroke="#1C1A17" strokeWidth="6" strokeLinejoin="round" opacity=".95" />
  </g>
);

const Wisp = ({ x, y, color = '#7CC8F2' }) => (
  <path d={`M ${x} ${y} q 60 -26 120 0 t 120 0 t 120 0`} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" opacity=".85" />
);

export const StylePreview = ({ shot }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <FontFace />
    <Img src={staticFile(`plates/${shot}.png`)} style={{ width: 1080, height: 1920 }} />
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      {shot === 'room_closed' && <>
        <Squiggle x={140} y={720} /><Squiggle x={930} y={640} /><Squiggle x={420} y={1380} h={300} /><Squiggle x={760} y={1400} h={300} />
      </>}
      {shot === 'room_ac' && <>
        {[1000, 1060, 1120].map((y, i) => <Wisp key={i} x={300 + i * 30} y={y + 260} />)}
        <Squiggle x={140} y={760} color="rgba(232,178,106,.35)" /><Squiggle x={930} y={700} color="rgba(232,178,106,.35)" />
      </>}
      {shot === 'outside_ac' && <>
        <Arrow x={740} y={930} rot={-20} /><Arrow x={780} y={1060} rot={5} /><Arrow x={740} y={1190} rot={30} />
        <Squiggle x={160} y={1280} /><Squiggle x={330} y={1420} h={260} />
      </>}
    </svg>
    {shot === 'room_closed' && <><Big text="35°C" size={200} color="#F4A93C" y={240} /><Big text="Roasting" size={140} color="#FFFFFF" y={1460} /></>}
    {shot === 'room_ac' && <><Big text="24°C" size={200} color="#7CC8F2" y={240} /><Big text="Cool" size={140} color="#FFFFFF" y={1460} /></>}
    {shot === 'outside_ac' && <><Big text="Heat" size={150} color="#F4A93C" y={260} /><Big text="Out!" size={140} color="#FFFFFF" y={1460} /></>}
  </AbsoluteFill>
);
