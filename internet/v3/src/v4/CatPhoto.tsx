import React from 'react';
import { hash } from '../lib/anim';
/* a dark (black) cat portrait, same 190x190 box as DogPhoto so it can be dropped in: night-blue backdrop with warm bokeh, glowing green-amber eyes, rim light on the fur, whiskers, a small red collar with a gold tag. */
export const CatPhoto: React.FC<{ gold?: boolean }> = ({ gold }) => {
  const fur: React.ReactNode[] = [];
  for (let i = 0; i < 520; i++) { const a = hash(i) * 6.283, rr = 0.15 + hash(i + 3) * 0.9, x = 95 + Math.cos(a) * 54 * rr, y = 112 + Math.sin(a) * 44 * rr, ang = Math.atan2(y - 122, x - 95) + (hash(i + 7) - 0.5) * 0.5, L = 2.5 + hash(i + 5) * 3.5;
    fur.push(<line key={i} x1={x} y1={y} x2={x + Math.cos(ang) * L} y2={y + Math.sin(ang) * L} stroke={gold ? (hash(i + 9) > 0.55 ? '#ffd88a' : '#8a4e12') : hash(i + 9) > 0.6 ? '#3c3f55' : '#14151d'} strokeWidth={0.45 + hash(i + 11) * 0.5} strokeLinecap="round" opacity={0.18 + 0.32 * hash(i + 13)} />); }
  const wh = (dir: number, k: number) => <path key={dir + '-' + k} d={`M ${95 + dir * 14} ${126 + k * 3} Q ${95 + dir * 42} ${118 + k * 10} ${95 + dir * (66 + k * 4)} ${112 + k * 15}`} fill="none" stroke="#dfe8ff" strokeWidth={0.6} opacity={0.75} strokeLinecap="round" />;
  const eye = (cx: number) => <g key={cx}><ellipse cx={cx} cy={100} rx={19} ry={12} fill="url(#ceg)" opacity={0.35} />
    <path d={`M ${cx - 14} 100 Q ${cx} 87 ${cx + 14} 100 Q ${cx} 111 ${cx - 14} 100 Z`} fill="url(#cey)" stroke="#05050a" strokeWidth={1.6} />
    <ellipse cx={cx} cy={100} rx={3.2} ry={8.6} fill="#030306" /><ellipse cx={cx - 4.5} cy={96.5} rx={2.4} ry={1.8} fill="#fff" opacity={0.95} /><circle cx={cx + 4} cy={103.5} r={1} fill="#fff" opacity={0.6} /></g>;
  return (<g>
    <defs><filter id="cbl"><feGaussianBlur stdDeviation="1.1" /></filter>
      <radialGradient id="cbg" cx="50%" cy="40%" r="75%"><stop offset="0" stopColor="#233a5a" /><stop offset="0.6" stopColor="#101a36" /><stop offset="1" stopColor="#060914" /></radialGradient>
      <radialGradient id="chd" cx="50%" cy="38%" r="65%">{gold ? <><stop offset="0" stopColor="#f0b35a" /><stop offset="0.55" stopColor="#c8802a" /><stop offset="1" stopColor="#6a3a0e" /></> : <><stop offset="0" stopColor="#2a2c3a" /><stop offset="0.55" stopColor="#10111a" /><stop offset="1" stopColor="#050509" /></>}</radialGradient>
      <radialGradient id="cey" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="#e8ff7a" /><stop offset="0.55" stopColor="#8fcf26" /><stop offset="1" stopColor="#2d5a0a" /></radialGradient>
      <radialGradient id="ceg"><stop offset="0" stopColor="#b8ff4a" /><stop offset="1" stopColor="#b8ff4a" stopOpacity={0} /></radialGradient>
      <radialGradient id="cmz" cx="50%" cy="40%" r="60%"><stop offset="0" stopColor={gold ? "#f8e0b0" : "#3b3d50"} /><stop offset="1" stopColor={gold ? "#f0b35a" : "#14151f"} stopOpacity={0} /></radialGradient>
      <linearGradient id="cear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a3a44" /><stop offset="1" stopColor="#1a1018" /></linearGradient>
    </defs>
    <rect width={190} height={190} fill="url(#cbg)" />
    {[[22, 30, 12, '#ffb454'], [166, 24, 9, '#7fd4ff'], [150, 60, 14, '#ffb454'], [30, 66, 8, '#ff8a6a'], [176, 96, 7, '#ffd38a'], [14, 110, 10, '#7fa8ff']].map(([x, y, r, c], i) => <circle key={i} cx={x as number} cy={y as number} r={r as number} fill={c as string} opacity={0.18} />)}
    <path d="M 10 190 Q 20 150 62 146 L 128 146 Q 172 150 182 190 Z" fill={gold ? "#a86a1c" : "#07070c"} stroke={gold ? "#ffd38a" : "#2a3050"} strokeWidth={1} />
    <path d="M 52 148 Q 95 162 138 148 L 136 158 Q 95 172 54 158 Z" fill="#b0202c" stroke="#5a0a12" strokeWidth={1} /><circle cx={95} cy={168} r={6.5} fill="#e8b84a" stroke="#8a6414" strokeWidth={1.2} /><circle cx={93} cy={166} r={1.8} fill="#fff6c8" opacity={0.9} />
    <path d="M 42 88 Q 40 52 54 36 Q 72 46 88 64 Z" fill={gold ? "#b8741f" : "#0b0b11"} stroke={gold ? "#ffd38a" : "#34406a"} strokeWidth={0.9} /><path d="M 148 88 Q 150 52 136 36 Q 118 46 102 64 Z" fill={gold ? "#b8741f" : "#0b0b11"} stroke={gold ? "#ffd38a" : "#34406a"} strokeWidth={0.9} />
    <path d="M 50 78 Q 49 56 56 46 Q 68 54 78 66 Z" fill="url(#cear)" /><path d="M 140 78 Q 141 56 134 46 Q 122 54 112 66 Z" fill="url(#cear)" />
    <path d="M 95 62 Q 132 60 148 84 Q 160 106 150 128 Q 138 156 95 158 Q 52 156 40 128 Q 30 106 42 84 Q 58 60 95 62 Z" fill="url(#chd)" /><path d="M 42 84 Q 30 106 40 128 Q 52 156 95 158" fill="none" stroke="#5a78c8" strokeWidth={2.2} opacity={0.4} filter="url(#cbl)" /><path d="M 148 84 Q 160 106 150 128 Q 138 156 95 158" fill="none" stroke="#5a78c8" strokeWidth={2.2} opacity={0.4} filter="url(#cbl)" />
    <g>{fur}</g>
    <ellipse cx={95} cy={122} rx={26} ry={17} fill="url(#cmz)" />
    {eye(70)}{eye(120)}
    <path d="M 95 118 L 89 124 Q 95 128 101 124 Z" fill="#7a4a58" stroke="#2a1018" strokeWidth={0.8} /><path d="M 95 128 Q 95 133 89 135 M 95 128 Q 95 133 101 135" fill="none" stroke="#5a5d78" strokeWidth={1} strokeLinecap="round" />
    {[0, 1, 2].map((k) => wh(-1, k))}{[0, 1, 2].map((k) => wh(1, k))}
    
  </g>);
};
