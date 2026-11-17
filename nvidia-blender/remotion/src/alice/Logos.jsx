// Logos and badges for the Alice Short (editorial identification only, not endorsement).
// NVIDIA eye + NYT "T": Simple Icons SVG data (CC0; trademarks belong to their owners).
// Flags: public-domain designs, drawn here. No government seals (restricted by U.S. law).
import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, FONT, BODY } from '../theme';

export const NvLogo = ({ h = 44, color = C.green }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: h * 0.22 }}>
    <div style={{ width: h * 1.25, height: h, background: color, WebkitMask: `url(${staticFile('alice/logos/nvidia.svg')}) center/contain no-repeat`, mask: `url(${staticFile('alice/logos/nvidia.svg')}) center/contain no-repeat` }} />
    <span style={{ font: `800 ${h * 0.82}px ${FONT}`, color: '#fff', letterSpacing: 1 }}>NVIDIA</span>
  </div>
);

export const NytLogo = ({ h = 40 }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: h * 0.25 }}>
    <div style={{ width: h, height: h, background: '#fff', WebkitMask: `url(${staticFile('alice/logos/newyorktimes.svg')}) center/contain no-repeat`, mask: `url(${staticFile('alice/logos/newyorktimes.svg')}) center/contain no-repeat` }} />
    <span style={{ font: `700 italic ${h * 0.7}px Georgia, 'Times New Roman', serif`, color: '#fff' }}>The New York Times</span>
  </div>
);

export const TextBadge = ({ text, sub, color = '#fff', h = 40 }) => (
  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
    <span style={{ font: `800 ${h * 0.8}px ${FONT}`, color, letterSpacing: 3 }}>{text}</span>
    {sub && <span style={{ font: `700 ${h * 0.45}px ${BODY}`, color: 'rgba(255,255,255,.75)', marginTop: 4, letterSpacing: 1 }}>{sub}</span>}
  </div>
);

export const FlagCN = ({ h = 40 }) => (
  <svg width={h * 1.5} height={h} viewBox="0 0 30 20" style={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,.6)' }}>
    <rect width="30" height="20" fill="#DE2910" />
    <g fill="#FFDE00">
      <polygon points="5,2 5.9,4.8 8.8,4.8 6.5,6.5 7.4,9.3 5,7.6 2.6,9.3 3.5,6.5 1.2,4.8 4.1,4.8" />
      {[[10, 2], [12, 4], [12, 7], [10, 9]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r="0.9" />)}
    </g>
  </svg>
);

export const FlagUS = ({ h = 40 }) => (
  <svg width={h * 1.9} height={h} viewBox="0 0 19 10" style={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,.6)' }}>
    {[...Array(13)].map((_, k) => <rect key={k} y={k * 10 / 13} width="19" height={10 / 13} fill={k % 2 ? '#fff' : '#B22234'} />)}
    <rect width="7.6" height={70 / 13} fill="#3C3B6E" />
    <g fill="#fff">{[...Array(20)].map((_, k) => <circle key={k} cx={0.8 + (k % 5) * 1.5} cy={0.7 + Math.floor(k / 5) * 1.25} r="0.28" />)}</g>
  </svg>
);

// Who sold to whom: NVIDIA -> Megaspeed (Singapore) -> ? China, with the U.S. block on the last step.
export const StoryChain = ({ a1 = 1, a2 = 1, a3 = 1, block = 1, top = 210 }) => {
  const node = (a, child) => <div style={{ opacity: a, transform: `translateY(${(1 - a) * 14}px)`, background: 'rgba(10,11,13,.85)', border: '2px solid rgba(255,255,255,.16)', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 70 }}>{child}</div>;
  const arrow = (a, label, col) => (
    <div style={{ opacity: a, display: 'flex', flexDirection: 'column', alignItems: 'center', width: 70 }}>
      <span style={{ font: `800 18px ${BODY}`, color: col, letterSpacing: 1 }}>{label}</span>
      <span style={{ font: `800 40px/1 ${BODY}`, color: col }}>→</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', left: 90, right: 180, top, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {node(a1, <NvLogo h={34} />)}
      {arrow(a2, 'CHIPS', C.green)}
      {node(a2, <TextBadge text="MEGASPEED" sub="Singapore" h={34} />)}
      <div style={{ position: 'relative' }}>
        {arrow(a3, '?', C.red)}
        <div style={{ position: 'absolute', left: 8, right: 8, top: 18, height: 6, background: C.red, transform: 'rotate(-35deg)', opacity: block, boxShadow: '0 0 12px #E5484D' }} />
      </div>
      {node(a3, <FlagCN h={40} />)}
    </div>
  );
};
