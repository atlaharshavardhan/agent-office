import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CITY } from '../lib/palette';
import { hash } from '../lib/anim';

/* ------------------------------------------------------------------------------------------
   Sunset city, layered for parallax. World units = px of the mid layer at zoom 1.
   Mid layer: two apartment blocks facing each other across a street (boy left, girl right).
------------------------------------------------------------------------------------------- */
export const GROUND = 2400;
export const FLOOR = 250;

export type Cam = { x: number; y: number; zoom: number };
export const REF = { x: 1200, y: 1500 };

export const Layer: React.FC<{ cam: Cam; depth: number; blur?: number; children: React.ReactNode; opacity?: number }> = ({ cam, depth, blur = 0, children, opacity = 1 }) => {
  const z = Math.pow(cam.zoom, depth);
  const ox = -(REF.x + (cam.x - REF.x) * depth), oy = -(REF.y + (cam.y - REF.y) * depth);
  return (
    <AbsoluteFill style={{ filter: blur ? `blur(${blur}px)` : undefined, opacity }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', overflow: 'visible' }}>
        <g transform={`translate(540 960) scale(${z}) translate(${ox} ${oy})`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};

export const Sky: React.FC<{ dark: number }> = ({ dark }) => (
  <AbsoluteFill>
    <svg width={1080} height={1920}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={CITY.skyTop} /><stop offset=".38" stopColor={CITY.skyMid} /><stop offset=".66" stopColor={CITY.skyLow} /><stop offset=".86" stopColor={CITY.skyHorizon} />
        </linearGradient>
        <radialGradient id="sun" cx=".62" cy=".74" r=".42"><stop offset="0" stopColor="#fff1d6" stopOpacity=".95" /><stop offset=".12" stopColor={CITY.sun} stopOpacity=".7" /><stop offset=".5" stopColor="#f2a98c" stopOpacity=".18" /><stop offset="1" stopColor="#f2a98c" stopOpacity="0" /></radialGradient>
        <filter id="cloudBlur"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>
      <rect width={1080} height={1920} fill="url(#sky)" />
      <rect width={1080} height={1920} fill="url(#sun)" />
      <g filter="url(#cloudBlur)" opacity={0.55}>
        <ellipse cx={260} cy={520} rx={360} ry={26} fill="#f6c7b4" /><ellipse cx={820} cy={430} rx={300} ry={18} fill="#e8b3c0" />
        <ellipse cx={600} cy={700} rx={420} ry={22} fill="#f9d2bb" /><ellipse cx={140} cy={860} rx={260} ry={16} fill="#f3bca8" />
      </g>
      {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={hash(i) * 1080} cy={hash(i + 9) * 380} r={hash(i + 3) * 1.6 + 0.4} fill="#fff" opacity={0.35 * hash(i + 5)} />)}
      <rect width={1080} height={1920} fill="#080F1C" opacity={dark} />
    </svg>
  </AbsoluteFill>
);

/* far skyline: soft lavender silhouettes with a temple dome, water tanks and tiny warm windows */
export const Skyline: React.FC = () => {
  const blocks = Array.from({ length: 26 }).map((_, i) => ({ x: -600 + i * 150 + hash(i) * 40, w: 110 + hash(i + 1) * 90, h: 260 + hash(i + 2) * 420 }));
  return (
    <g>
      <defs><linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={CITY.far} stopOpacity="0" /><stop offset="1" stopColor={CITY.haze} stopOpacity=".7" /></linearGradient></defs>
      {blocks.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={GROUND - 300 - b.h} width={b.w} height={b.h + 300} fill={i % 3 ? CITY.far : CITY.far2} />
          <rect x={b.x + b.w * 0.2} y={GROUND - 300 - b.h - 26} width={30} height={26} rx={6} fill={CITY.far} />
          {Array.from({ length: Math.floor(b.h / 60) }).map((_, r) => Array.from({ length: 3 }).map((__, c) =>
            hash(i * 31 + r * 7 + c) < 0.33 ? <rect key={`${r}${c}`} x={b.x + 16 + c * (b.w - 32) / 3} y={GROUND - 260 - b.h + r * 60} width={12} height={16} fill={CITY.windowLit} opacity={0.75} /> : null))}
        </g>
      ))}
      <g transform={`translate(1650 ${GROUND - 820})`} fill={CITY.far2}>
        <rect x={-60} y={0} width={120} height={500} /><path d="M -70 0 Q 0 -140 70 0 Z" /><rect x={-4} y={-170} width={8} height={40} />
      </g>
      <rect x={-800} y={GROUND - 900} width={4000} height={900} fill="url(#haze)" />
    </g>
  );
};

type WinOpt = { lit?: number; seed: number };
const Window: React.FC<{ x: number; y: number; w: number; h: number } & WinOpt> = ({ x, y, w, h, lit = 0.35, seed }) => {
  const on = hash(seed) < lit; const cur = hash(seed + 3);
  return (
    <g>
      <rect x={x - 6} y={y - 6} width={w + 12} height={h + 14} rx={4} fill={CITY.trim} />
      <rect x={x} y={y} width={w} height={h} fill={on ? (cur > 0.5 ? CITY.windowLit : CITY.windowLit2) : CITY.windowDark} />
      {on && <rect x={x} y={y} width={w} height={h} fill="url(#winGlow)" />}
      {on && cur < 0.6 && <path d={`M ${x} ${y} Q ${x + w * 0.3} ${y + h * 0.5} ${x + w * 0.18} ${y + h} L ${x} ${y + h} Z`} fill={cur < 0.3 ? '#d9725a' : '#7c6aa8'} opacity={0.85} />}
      <rect x={x + w / 2 - 2} y={y} width={4} height={h} fill={CITY.trim} />
      <rect x={x} y={y + h * 0.38} width={w} height={4} fill={CITY.trim} />
      <rect x={x - 10} y={y + h + 6} width={w + 20} height={8} rx={3} fill={CITY.trim} />
      <rect x={x - 10} y={y + h + 14} width={w + 20} height={5} fill="#000" opacity={0.12} />
    </g>
  );
};

/* a hero balcony: lit door behind, slab, railing drawn in front of the character */
export const BalconyBack: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <g>
    <rect x={x + w * 0.22} y={y - 200} width={w * 0.56} height={200} fill="#ffd9a0" />
    <rect x={x + w * 0.22} y={y - 200} width={w * 0.56} height={200} fill="url(#doorGlow)" />
    <rect x={x + w * 0.22 - 8} y={y - 208} width={w * 0.56 + 16} height={8} fill={CITY.trim} />
    <path d={`M ${x + w * 0.24} ${y - 196} Q ${x + w * 0.34} ${y - 110} ${x + w * 0.29} ${y} L ${x + w * 0.24} ${y} Z`} fill="#c9604a" opacity={0.9} />
  </g>
);
export const BalconyFront: React.FC<{ x: number; y: number; w: number; plant?: boolean }> = ({ x, y, w, plant = true }) => (
  <g>
    <rect x={x - 16} y={y} width={w + 32} height={22} rx={4} fill={CITY.trim} />
    <rect x={x - 16} y={y + 22} width={w + 32} height={10} fill="#000" opacity={0.18} />
    <rect x={x - 10} y={y - 96} width={w + 20} height={10} rx={5} fill={CITY.railing} />
    {Array.from({ length: Math.floor(w / 26) + 1 }).map((_, i) => <rect key={i} x={x - 6 + i * 26} y={y - 90} width={5} height={90} rx={2} fill={CITY.railing} />)}
    <rect x={x - 10} y={y - 46} width={w + 20} height={5} fill={CITY.railing} opacity={0.8} />
    {plant && <g transform={`translate(${x + w - 40} ${y})`}>
      <path d="M -22 0 L -18 -34 L 18 -34 L 22 0 Z" fill="#b5654a" /><rect x={-20} y={-40} width={40} height={8} rx={3} fill="#c97a5c" />
      {[-30, -10, 10, 30].map((a, i) => <ellipse key={i} cx={a * 0.4} cy={-62} rx={10} ry={26} transform={`rotate(${a} ${a * 0.4} -40)`} fill={i % 2 ? CITY.tree : CITY.treeDark} />)}
    </g>}
  </g>
);

/* apartment block with front + side face (2.5D), floor bands, framed windows, AC units, pipes, roof tank */
export const Block: React.FC<{ x: number; w: number; floors: number; face: string; side: string; sideW: number; sideLeft?: boolean; skip?: [number, number][]; seed: number; litRatio?: number }> =
  ({ x, w, floors, face, side, sideW, sideLeft = false, skip = [], seed, litRatio = 0.4 }) => {
    const top = GROUND - floors * FLOOR; const cols = 3; const ww = 92, wh = 128;
    const sx = sideLeft ? x - sideW : x + w;
    return (
      <g>
        <defs>
          <linearGradient id={`face${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={face} /><stop offset="1" stopColor={face} stopOpacity=".92" /></linearGradient>
        </defs>
        <path d={sideLeft ? `M ${x} ${top} L ${sx} ${top + 40} L ${sx} ${GROUND} L ${x} ${GROUND} Z` : `M ${x + w} ${top} L ${sx + sideW} ${top + 40} L ${sx + sideW} ${GROUND} L ${x + w} ${GROUND} Z`} fill={side} />
        <rect x={x} y={top} width={w} height={GROUND - top} fill={`url(#face${seed})`} />
        <rect x={x} y={top} width={w} height={GROUND - top} fill="url(#sunWash)" />
        {Array.from({ length: floors }).map((_, f) => (
          <g key={f}>
            <rect x={x - 8} y={top + f * FLOOR - 6} width={w + 16} height={14} fill={CITY.trim} />
            {Array.from({ length: cols }).map((__, c) => {
              if (skip.some(([sf, sc]) => sf === f && sc === c)) return null;
              const wx = x + 50 + c * ((w - 100 - ww) / (cols - 1)); const wy = top + f * FLOOR + 60;
              return (
                <g key={c}>
                  <Window x={wx} y={wy} w={ww} h={wh} seed={seed * 100 + f * 10 + c} lit={litRatio} />
                  {hash(seed + f * 3 + c) < 0.22 && <g><rect x={wx + ww + 18} y={wy + 70} width={46} height={34} rx={4} fill="#e8e2d8" /><rect x={wx + ww + 18} y={wy + 70} width={46} height={34} rx={4} fill="none" stroke="#b8b0a4" strokeWidth={2} />{[0, 1, 2, 3].map((i) => <rect key={i} x={wx + ww + 24} y={wy + 76 + i * 7} width={34} height={2} fill="#b8b0a4" />)}</g>}
                </g>
              );
            })}
          </g>
        ))}
        <rect x={sideLeft ? x + w - 18 : x + 8} y={top} width={10} height={GROUND - top} fill="#000" opacity={0.08} />
        <rect x={x - 12} y={top - 34} width={w + 24} height={36} rx={4} fill={CITY.trim} />
        <g transform={`translate(${x + w * 0.3} ${top - 34})`}><rect x={-34} y={-62} width={68} height={62} rx={10} fill="#2c2a36" /><rect x={-38} y={-68} width={76} height={10} rx={5} fill="#3a3746" /></g>
        <g transform={`translate(${x + w * 0.72} ${top - 34})`}><rect x={-2} y={-70} width={4} height={70} fill="#4a4558" /><ellipse cx={14} cy={-62} rx={20} ry={12} fill="#d8d2c8" transform="rotate(-30 14 -62)" /></g>
      </g>
    );
  };

/* street furniture */
export const StreetLamp: React.FC<{ x: number; flip?: boolean; glow: number }> = ({ x, flip = false, glow }) => (
  <g transform={`translate(${x} ${GROUND}) scale(${flip ? -1 : 1} 1)`}>
    <rect x={-6} y={-560} width={12} height={560} fill="#2e2a3c" />
    <path d="M 0 -556 Q 0 -600 60 -600 L 90 -600" stroke="#2e2a3c" strokeWidth={10} fill="none" strokeLinecap="round" />
    <path d="M 70 -606 L 120 -606 L 112 -588 L 78 -588 Z" fill="#3a3550" />
    <ellipse cx={95} cy={-584} rx={22} ry={6} fill={CITY.streetLight} />
    <ellipse cx={95} cy={-560} rx={150} ry={150} fill="url(#lampGlow)" opacity={glow} />
    <path d="M 75 -584 L 115 -584 L 220 0 L -30 0 Z" fill="url(#lampCone)" opacity={0.55 * glow} />
  </g>
);
export const Tree: React.FC<{ x: number; s: number; f: number; seed: number }> = ({ x, s, f, seed }) => {
  const sway = Math.sin(f / 30 * 1.3 + seed) * 2.2;
  return (
    <g transform={`translate(${x} ${GROUND}) scale(${s})`}>
      <path d="M -10 0 Q -6 -120 -14 -220 L 12 -220 Q 6 -120 12 0 Z" fill="#4a3a36" />
      <g transform={`rotate(${sway} 0 -220)`}>
        {[[-70, -300, 110], [40, -330, 120], [-10, -420, 120], [80, -250, 80], [-110, -230, 80], [10, -260, 100]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? CITY.tree : CITY.treeDark} />
        ))}
        {[[-40, -360, 50], [60, -380, 46], [-80, -290, 40]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#7a9a80" opacity={0.6} />)}
      </g>
    </g>
  );
};
export const Wires: React.FC<{ f: number }> = ({ f }) => {
  const w = Math.sin(f / 30 * 0.9) * 4;
  return (
    <g stroke="#2a2438" strokeWidth={3} fill="none" opacity={0.8}>
      <path d={`M -200 1050 Q 1200 ${1250 + w} 2600 1080`} /><path d={`M -200 1110 Q 1200 ${1320 + w} 2600 1140`} /><path d={`M -200 1180 Q 1200 ${1380 + w} 2600 1210`} />
      <g fill="#2a2438" stroke="none"><ellipse cx={1180} cy={1262 + w} rx={14} ry={10} /><circle cx={1192} cy={1250 + w} r={7} /><ellipse cx={1230} cy={1262 + w} rx={13} ry={9} /><circle cx={1220} cy={1250 + w} r={6} /></g>
    </g>
  );
};

export const SharedDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }}>
    <defs>
      <linearGradient id="winGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff2cf" stopOpacity=".55" /><stop offset="1" stopColor="#ff9a4a" stopOpacity=".15" /></linearGradient>
      <radialGradient id="doorGlow" cx=".5" cy=".3" r=".8"><stop offset="0" stopColor="#fff4dc" stopOpacity=".9" /><stop offset="1" stopColor="#ffb870" stopOpacity="0" /></radialGradient>
      <linearGradient id="sunWash" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffcfa8" stopOpacity=".28" /><stop offset=".6" stopColor="#ffcfa8" stopOpacity="0" /><stop offset="1" stopColor="#3a2a50" stopOpacity=".25" /></linearGradient>
      <radialGradient id="lampGlow"><stop offset="0" stopColor="#ffd59a" stopOpacity=".55" /><stop offset="1" stopColor="#ffb454" stopOpacity="0" /></radialGradient>
      <linearGradient id="lampCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd59a" stopOpacity=".5" /><stop offset="1" stopColor="#ffb454" stopOpacity="0" /></linearGradient>
      <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fffbea" stopOpacity=".95" /><stop offset=".5" stopColor="#ffe2a8" stopOpacity=".45" /><stop offset="1" stopColor="#ffd08a" stopOpacity=".08" /></linearGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="6" /></filter>
      <filter id="soft2"><feGaussianBlur stdDeviation="18" /></filter>
    </defs>
  </svg>
);
