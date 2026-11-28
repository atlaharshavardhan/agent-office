import React from 'react';
import { hash } from '../lib/anim';
/* the same golden-brown puppy with the red collar, drawn with more care: shaded fur, floppy ears with depth, glossy eyes with catchlights, a light muzzle, a shiny nose, a soft pink tongue, short fur strokes, a gold tag. Same 190x190 box as DogPhoto. */
export const DogBetter: React.FC<{ blink?: number }> = ({ blink = 0 }) => {
  const fur: React.ReactNode[] = [];
  for (let i = 0; i < 520; i++) { const a = hash(i) * 6.283, rr = 0.1 + hash(i + 3) * 0.95, x = 95 + Math.cos(a) * 50 * rr, y = 100 + Math.sin(a) * 46 * rr, ang = Math.atan2(y - 112, x - 95) + (hash(i + 7) - 0.5) * 0.6, L = 2 + hash(i + 5) * 3;
    fur.push(<line key={i} x1={x} y1={y} x2={x + Math.cos(ang) * L} y2={y + Math.sin(ang) * L} stroke={hash(i + 9) > 0.5 ? '#f0c27a' : '#8a5420'} strokeWidth={0.5 + hash(i + 11) * 0.6} strokeLinecap="round" opacity={0.1 + 0.2 * hash(i + 13)} />); }
  const eye = (cx: number, s: number) => <g key={cx}><ellipse cx={cx} cy={92} rx={11} ry={11.5} fill="#f6ecdc" opacity={0.9} /><circle cx={cx} cy={92.5} r={8.4} fill="url(#dbi)" /><circle cx={cx} cy={92.5} r={4.6} fill="#120804" /><ellipse cx={cx - 2.8 * s} cy={89} rx={2.6} ry={2.1} fill="#fff" opacity={0.98} /><circle cx={cx + 2.6 * s} cy={96} r={1.1} fill="#fff" opacity={0.7} /><path d={`M ${cx - 10} 83 Q ${cx} 78 ${cx + 10} 83`} fill="none" stroke="#7a4a1c" strokeWidth={1.1} strokeLinecap="round" opacity={0.5} /></g>;
  return (<g>
    <defs>
      <linearGradient id="dbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fdeccf" /><stop offset="1" stopColor="#f0b384" /></linearGradient>
      <radialGradient id="dhd" cx="50%" cy="34%" r="70%"><stop offset="0" stopColor="#f2c27c" /><stop offset="0.6" stopColor="#d49a52" /><stop offset="1" stopColor="#a8682a" /></radialGradient>
      <radialGradient id="dmz" cx="50%" cy="40%" r="60%"><stop offset="0" stopColor="#fff2d8" /><stop offset="1" stopColor="#f0d2a0" /></radialGradient>
      <linearGradient id="dea" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6a3a14" /><stop offset="0.5" stopColor="#9a5c24" /><stop offset="1" stopColor="#5a300e" /></linearGradient>
      <radialGradient id="dbi" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#8a5a2a" /><stop offset="1" stopColor="#3a1e08" /></radialGradient>
      <radialGradient id="dns" cx="35%" cy="30%" r="70%"><stop offset="0" stopColor="#5a4a52" /><stop offset="1" stopColor="#0c0608" /></radialGradient>
      <linearGradient id="dco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e03a40" /><stop offset="1" stopColor="#a8141e" /></linearGradient>
      <filter id="dsh"><feGaussianBlur stdDeviation="2.2" /></filter>
    </defs>
    <rect width={190} height={190} fill="url(#dbg)" />
    {[[24, 30, 12], [168, 26, 9], [152, 62, 14], [30, 70, 8], [176, 100, 7], [12, 112, 10]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff6e0" opacity={0.35} />)}
    <ellipse cx={95} cy={172} rx={60} ry={14} fill="#7a4a20" opacity={0.25} filter="url(#dsh)" />
    <path d="M 40 190 Q 44 152 70 148 L 120 148 Q 146 152 150 190 Z" fill="#c68a44" /><path d="M 70 148 Q 95 160 120 148" fill="none" stroke="#e8b068" strokeWidth={2} opacity={0.5} />
    <path d="M 38 74 Q 14 84 18 128 Q 22 154 46 148 Q 54 120 54 92 Z" fill="url(#dea)" /><path d="M 152 74 Q 176 84 172 128 Q 168 154 144 148 Q 136 120 136 92 Z" fill="url(#dea)" />
    <path d="M 40 84 Q 26 96 28 124" fill="none" stroke="#c88a4a" strokeWidth={1.6} opacity={0.55} strokeLinecap="round" /><path d="M 150 84 Q 164 96 162 124" fill="none" stroke="#c88a4a" strokeWidth={1.6} opacity={0.55} strokeLinecap="round" />
    <path d="M 95 46 Q 140 44 150 90 Q 156 130 128 146 Q 95 158 62 146 Q 34 130 40 90 Q 50 44 95 46 Z" fill="url(#dhd)" />
    <g>{fur}</g>
    <path d="M 95 54 Q 112 58 114 76 Q 95 70 76 76 Q 78 58 95 54 Z" fill="#f4cd8a" opacity={0.55} />
    <path d="M 52 128 Q 60 150 95 152 Q 130 150 138 128 Q 128 108 95 108 Q 62 108 52 128 Z" fill="url(#dmz)" />
    {eye(70, 1)}{eye(120, 1)}
    {blink > 0.02 && <defs><radialGradient id="dbLid"><stop offset="0" stopColor="#d9a35e" /><stop offset="0.75" stopColor="#d9a35e" /><stop offset="1" stopColor="#d9a35e" stopOpacity={0} /></radialGradient></defs>}
    {blink > 0.02 && [70, 120].map((cx) => <g key={'l' + cx}><ellipse cx={cx} cy={92} rx={14.5} ry={14 * blink} fill="url(#dbLid)" /><path d={`M ${cx - 11} ${92 + 13.5 * blink * 0.75} Q ${cx} ${92 + 13.5 * blink * 1.15} ${cx + 11} ${92 + 13.5 * blink * 0.75}`} fill="none" stroke="#3a1f0a" strokeWidth={1.6} strokeLinecap="round" opacity={blink > 0.5 ? 1 : 0} /></g>)}
    <ellipse cx={95} cy={114} rx={13} ry={9.5} fill="url(#dns)" /><ellipse cx={91} cy={111} rx={4.2} ry={2.4} fill="#fff" opacity={0.7} />
    <path d="M 95 122 L 95 131" stroke="#2a1008" strokeWidth={1.8} strokeLinecap="round" /><path d="M 95 131 Q 86 137 80 132 M 95 131 Q 104 137 110 132" fill="none" stroke="#2a1008" strokeWidth={1.8} strokeLinecap="round" />
    <path d="M 88 134 Q 95 152 102 134 Q 95 138 88 134 Z" fill="#f08a9a" stroke="#c0505e" strokeWidth={0.8} /><path d="M 95 136 L 95 146" stroke="#d96a7a" strokeWidth={0.8} />
    {[0, 1, 2].map((k) => <circle key={k} cx={78 + k * 4 - 4} cy={122 + k * 1.5} r={0.9} fill="#8a5a2a" opacity={0.7} />)}{[0, 1, 2].map((k) => <circle key={k + 5} cx={112 - k * 4 + 4} cy={122 + k * 1.5} r={0.9} fill="#8a5a2a" opacity={0.7} />)}
    <path d="M 56 150 Q 95 168 134 150 L 132 162 Q 95 180 58 162 Z" fill="url(#dco)" stroke="#6a0a12" strokeWidth={1} /><path d="M 62 153 Q 95 168 128 153" fill="none" stroke="#ff8a8a" strokeWidth={1} opacity={0.5} />
    <circle cx={95} cy={176} r={8} fill="#f0c14a" stroke="#8a6414" strokeWidth={1.4} /><circle cx={92.5} cy={173.5} r={2.4} fill="#fff7cf" opacity={0.95} />
  </g>);
};
