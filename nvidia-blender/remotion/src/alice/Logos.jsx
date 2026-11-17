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
      {node(a2, <MegaspeedLogo h={34} />)}
      <div style={{ position: 'relative' }}>
        {arrow(a3, '?', C.red)}
        <div style={{ position: 'absolute', left: 8, right: 8, top: 18, height: 6, background: C.red, transform: 'rotate(-35deg)', opacity: block, boxShadow: '0 0 12px #E5484D' }} />
      </div>
      {node(a3, <FlagCN h={40} />)}
    </div>
  );
};

// Megaspeed International: redrawn for editorial identification only (round emblem with an "M" of columns,
// wide wordmark). Not taken from any photo.
export const MegaspeedLogo = ({ h = 60, light = true, sub = true }) => {
  const navy = '#3C5E99', ink = light ? '#E9EDF3' : '#2A2F38';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: h * 0.22 }}>
      <svg width={h} height={h} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill="none" stroke={navy} strokeWidth="9" />
        <path d="M27 76 V36 Q27 24 39 24 H61 Q73 24 73 36 V76" fill="none" stroke={navy} strokeWidth="8" strokeLinejoin="round" />
        <path d="M40 76 V40 M50 30 V62 M60 76 V40" fill="none" stroke={navy} strokeWidth="7" strokeLinecap="square" />
        <path d="M40 76 H34 M60 76 H66" stroke={navy} strokeWidth="6" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', lineHeight: 1 }}>
        <span style={{ font: `900 ${h * 0.62}px ${FONT}`, color: ink, letterSpacing: h * 0.02, transform: 'scaleX(1.18)', transformOrigin: 'left center', display: 'inline-block', marginRight: h * 0.5 }}>MEGASPEED</span>
        {sub && <span style={{ font: `700 ${h * 0.2}px ${BODY}`, color: ink, opacity: 0.8, letterSpacing: h * 0.165, marginTop: h * 0.06, background: light ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)', padding: `${h * 0.02}px ${h * 0.04}px` }}>INTERNATIONAL</span>}
      </div>
    </div>
  );
};
