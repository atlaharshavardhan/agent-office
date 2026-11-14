import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FPS, hash, prog, pulse, keys, lerp, easeOut } from '../lib/anim';

/* Minimal dusk-city style (inspired by soft 2.5D story reels; original designs):
   hazy mauve-peach sky, pill-shaped towers with stripe windows, round trees, glowing lamp posts,
   dark-headed characters with tiny white faces, thin limbs and pastel clothes. */
export const DUSK = {
  skyTop: '#4b3d5c', skyMid: '#8c7090', skyLow: '#d9aea6', horizon: '#f1cdb4',
  towerFar: '#9a8299', towerMid: '#a88ea4', towerNear: '#b89cae', stripe: '#d8c2cf', stripeLit: '#f6dcc0',
  tree: '#5e7a64', treeHi: '#7a9a7e', treeDark: '#4a6452', ground: '#8a7480', ground2: '#6f5d6a',
  ink: '#15121c', rim: '#f3c9a6', lamp: '#fff3d6',
  teal: '#8fd3c8', lav: '#c9b8e8', cream: '#f0d3a8', peach: '#e8a98f',
};

export const Tower: React.FC<{ x: number; y: number; w: number; h: number; c: string; stripes?: number; lit?: number; seed?: number }> = ({ x, y, w, h, c, stripes = 7, lit = 0.25, seed = 0 }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={w / 2} fill={c} />
    {Array.from({ length: stripes }).map((_, i) => {
      const yy = y + w * 0.45 + i * ((h - w * 0.6) / stripes); const on = hash(seed * 13 + i) < lit;
      return <rect key={i} x={x + w * 0.16} y={yy} width={w * 0.68} height={w * 0.11} rx={w * 0.055} fill={on ? DUSK.stripeLit : DUSK.stripe} opacity={on ? 0.95 : 0.75} />;
    })}
  </g>
);
export const Tree: React.FC<{ x: number; y: number; r: number; f: number; seed: number; dark?: boolean }> = ({ x, y, r, f, seed, dark }) => {
  const sway = Math.sin(f / FPS * 1.1 + seed) * 1.5;
  return (
    <g transform={`rotate(${sway} ${x} ${y})`}>
      <rect x={x - r * 0.05} y={y - r * 0.2} width={r * 0.1} height={r * 1.6} fill={DUSK.ink} opacity={0.7} />
      <circle cx={x} cy={y - r * 0.7} r={r} fill={dark ? DUSK.treeDark : DUSK.tree} />
      <circle cx={x - r * 0.3} cy={y - r * 1.0} r={r * 0.45} fill={DUSK.treeHi} opacity={0.35} />
    </g>
  );
};
/* the cloud-like bush trees in the foreground row */
export const Bush: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-4} y={-40} width={8} height={90} fill={DUSK.ink} opacity={0.8} />
    {[[-46, -40, 40], [0, -70, 50], [46, -40, 40], [-24, -16, 36], [24, -16, 36]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={DUSK.treeDark} />)}
  </g>
);
export const Lamp: React.FC<{ x: number; y: number; h: number; f: number; seed: number }> = ({ x, y, h, f, seed }) => {
  const flick = 0.92 + 0.08 * Math.sin(f / FPS * 7 + seed * 3);
  return (
    <g>
      <rect x={x - 3} y={y - h} width={6} height={h} rx={3} fill={DUSK.ink} />
      <circle cx={x} cy={y - h} r={60} fill="url(#lampHalo)" opacity={flick} />
      <circle cx={x} cy={y - h} r={12} fill={DUSK.lamp} />
    </g>
  );
};

/* ------------- character rig: dark head, tiny white face, thin limbs, pastel clothes ------------- */
export type StickPose = { blink: number; smile: number; look: number; armR: [number, number]; armL: [number, number]; legSpread?: number; tilt?: number; torch?: number; holdTorch?: boolean };
export const Stick: React.FC<{ hair: 'bun' | 'pony' | 'curly' | 'short'; outfit: 'dress' | 'tee' | 'kurta'; col: string; p: StickPose; id: string }> = ({ hair, outfit, col, p, id }) => {
  const sh = { x: 0, y: -232 };
  const limb = (x: number, y: number, a: number, l: number) => { const r = a * Math.PI / 180; return [x + Math.sin(r) * l, y + Math.cos(r) * l]; };
  const [rex, rey] = limb(16, sh.y + 8, p.armR[0], 62); const [rwx, rwy] = limb(rex, rey, p.armR[1], 58);
  const [lex, ley] = limb(-16, sh.y + 8, p.armL[0], 62); const [lwx, lwy] = limb(lex, ley, p.armL[1], 58);
  const eyeH = 7 * (1 - 0.85 * p.blink);
  return (
    <g>
      <defs><linearGradient id={`rimS${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={DUSK.rim} stopOpacity=".0" /><stop offset=".75" stopColor={DUSK.rim} stopOpacity="0" /><stop offset="1" stopColor={DUSK.rim} stopOpacity=".9" /></linearGradient></defs>
      <ellipse cx={0} cy={4} rx={38} ry={7} fill="#000" opacity={0.18} />
      {/* legs + feet */}
      <path d={`M -9 -110 L ${-12 - (p.legSpread || 0)} -6`} stroke={DUSK.ink} strokeWidth={9} strokeLinecap="round" />
      <path d={`M 9 -110 L ${12 + (p.legSpread || 0)} -6`} stroke={DUSK.ink} strokeWidth={9} strokeLinecap="round" />
      <ellipse cx={-16 - (p.legSpread || 0)} cy={-2} rx={15} ry={6} fill={DUSK.ink} /><ellipse cx={16 + (p.legSpread || 0)} cy={-2} rx={15} ry={6} fill={DUSK.ink} />
      {/* back arm */}
      <path d={`M -16 ${sh.y + 8} L ${lex} ${ley} L ${lwx} ${lwy}`} stroke={DUSK.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* clothes */}
      {outfit === 'dress' && <path d={`M -20 ${sh.y} Q 0 ${sh.y - 6} 20 ${sh.y} L 26 -150 L 44 -96 L -44 -96 L -26 -150 Z`} fill={col} />}
      {outfit === 'tee' && <path d={`M -24 ${sh.y} Q 0 ${sh.y - 6} 24 ${sh.y} L 26 -108 Q 0 -102 -26 -108 Z`} fill={col} />}
      {outfit === 'kurta' && <path d={`M -22 ${sh.y} Q 0 ${sh.y - 6} 22 ${sh.y} L 28 -122 Q 0 -114 -28 -122 Z`} fill={col} />}
      {outfit !== 'dress' && <path d="M -22 -110 L 22 -110 L 20 -100 L -20 -100 Z" fill={DUSK.ink} />}
      <rect x={18} y={sh.y} width={8} height={outfit === 'dress' ? 136 : 120} fill={`url(#rimS${id})`} opacity={0.5} />
      {/* neck + head */}
      <rect x={-5} y={sh.y - 16} width={10} height={20} fill={DUSK.ink} />
      <g transform={`translate(0 ${sh.y - 46}) rotate(${p.tilt || 0})`}>
        {hair === 'bun' && <circle cx={-18} cy={-30} r={15} fill={DUSK.ink} />}
        {hair === 'pony' && <path d="M 22 -18 Q 54 -10 44 30 Q 38 46 30 34 Q 40 6 18 -6 Z" fill={DUSK.ink} />}
        {hair === 'curly' && [[-22, -24], [-6, -32], [12, -30], [26, -20], [-30, -8]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={13} fill={DUSK.ink} />)}
        <circle cx={0} cy={0} r={34} fill={DUSK.ink} stroke="#4a4a80" strokeWidth={2} />
        <path d="M 18 -28 A 34 34 0 0 1 32 16" stroke={DUSK.rim} strokeWidth={4.5} fill="none" opacity={0.95} />
        <path d="M -26 -22 A 34 34 0 0 0 -30 16" stroke="#9fb4ff" strokeWidth={2.5} fill="none" opacity={0.55} />
        {hair === 'short' && <path d="M -34 -4 Q -30 -40 4 -38 Q 30 -38 34 -10 Q 18 -26 -4 -22 Q -22 -22 -34 -4 Z" fill="#0a080e" />}
        {/* tiny white face */}
        <ellipse cx={-9 + p.look * 5} cy={-2} rx={5} ry={eyeH} fill="#fff" />
        <ellipse cx={9 + p.look * 5} cy={-2} rx={5} ry={eyeH} fill="#fff" />
        <path d={`M ${-9 + p.look * 5} ${12 - p.smile * 2} Q ${p.look * 5} ${16 + p.smile * 8} ${9 + p.look * 5} ${12 - p.smile * 2}`} stroke="#fff" strokeWidth={3.4} fill="none" strokeLinecap="round" />
      </g>
      {/* front arm (+ torch) */}
      <path d={`M 16 ${sh.y + 8} L ${rex} ${rey} L ${rwx} ${rwy}`} stroke={DUSK.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {p.holdTorch && (
        <g transform={`translate(${rwx} ${rwy}) rotate(${90 - p.armR[1]})`}>
          <rect x={-4} y={-6} width={34} height={12} rx={4} fill="#2b2e3a" /><path d="M 28 -6 L 40 -10 L 40 10 L 28 6 Z" fill="#c8553a" />
          <ellipse cx={41} cy={0} rx={3} ry={9} fill={(p.torch || 0) > 0.05 ? '#fff8e0' : '#3a3d48'} />
        </g>
      )}
      <circle cx={rwx} cy={rwy} r={5} fill={DUSK.ink} />
    </g>
  );
};

/* ------------- the torch scene in this style ------------- */
export const DuskTorch: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const raise = keys(f, [[0.2, 0], [0.4, -0.1], [0.9, 1]], easeOut);
  const on = Math.max(pulse(f, 1.0, 1.25), pulse(f, 1.45, 1.7), pulse(f, 2.0, 9));
  const notice = prog(f, 1.3, 1.6, easeOut), wave = prog(f, 2.4, 2.7) * (1 - prog(f, 3.8, 4.1));
  const boy: StickPose = { blink: Math.max(0, 1 - Math.abs(t - 2.9) / 0.07), smile: 0.4 + 0.5 * prog(f, 2.2, 2.6), look: 0.8, armR: [lerp(10, 80, raise), lerp(4, 92, raise)], armL: [-12, -8], holdTorch: true, torch: on, tilt: -3 * raise };
  const girl: StickPose = { blink: Math.max(0, 1 - Math.abs(t - 0.6) / 0.07), smile: lerp(0.2, 1, notice), look: -lerp(0.2, 0.9, notice), armR: [lerp(10, 150, wave), lerp(6, 168, wave) + Math.sin(t * 11) * 14 * wave], armL: [-10, -6], tilt: 4 * notice };
  const cam = { x: keys(f, [[0, 0], [3, -30]]), z: keys(f, [[0, 1], [3, 1.06]]) };
  const BX = 300, BY = 1290, GX = 790, GY = 1290;   // feet positions on the two balconies
  const lm = (x: number, y: number, a: number, l: number) => { const r = a * Math.PI / 180; return [x + Math.sin(r) * l, y + Math.cos(r) * l]; };
  const [ex, ey] = lm(16, -224, boy.armR[0], 62); const [wx, wy] = lm(ex, ey, boy.armR[1], 58); const tr = (90 - boy.armR[1]) * Math.PI / 180;
  const lens = { x: BX + wx + Math.cos(tr) * 42, y: BY + wy + Math.sin(tr) * 42 };
  const tgt = { x: GX - 10, y: GY - 270 };
  const ang = Math.atan2(tgt.y - lens.y, tgt.x - lens.x) * 180 / Math.PI, len = Math.hypot(tgt.x - lens.x, tgt.y - lens.y);
  const P = (d: number) => `translate(${540 + cam.x * d} 960) scale(${1 + (cam.z - 1) * d}) translate(-540 -960)`;
  return (
    <AbsoluteFill style={{ backgroundColor: DUSK.skyTop }}>
      <svg width={1080} height={1920}>
        <defs>
          <linearGradient id="dSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={DUSK.skyTop} /><stop offset=".45" stopColor={DUSK.skyMid} /><stop offset=".72" stopColor={DUSK.skyLow} /><stop offset=".9" stopColor={DUSK.horizon} /></linearGradient>
          <radialGradient id="dSun" cx="270" cy="760" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff6ea" stopOpacity="1" /><stop offset=".12" stopColor="#ffe8d4" stopOpacity=".8" /><stop offset="1" stopColor="#ffd8c0" stopOpacity="0" /></radialGradient>
          <radialGradient id="lampHalo"><stop offset="0" stopColor="#fff3d6" stopOpacity=".7" /><stop offset="1" stopColor="#ffd9a0" stopOpacity="0" /></radialGradient>
          <linearGradient id="dHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={DUSK.horizon} stopOpacity="0" /><stop offset="1" stopColor={DUSK.horizon} stopOpacity=".65" /></linearGradient>
          <linearGradient id="dBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fffaea" stopOpacity=".95" /><stop offset="1" stopColor="#ffe2b0" stopOpacity=".12" /></linearGradient>
          <filter id="dBlur"><feGaussianBlur stdDeviation="3" /></filter><filter id="dBlur2"><feGaussianBlur stdDeviation="10" /></filter>
        </defs>
        <rect width={1080} height={1920} fill="url(#dSky)" />
        <rect width={1080} height={1920} fill="url(#dSun)" />
        <circle cx={860} cy={300} r={46} fill="#fbe7d6" opacity={0.9} /><circle cx={880} cy={288} r={44} fill={DUSK.skyTop} opacity={0.85} />
        <g filter="url(#dBlur2)" opacity={0.5}>{[[200, 380, 300], [760, 520, 260], [420, 640, 340]].map(([x, y, w], i) => <ellipse key={i} cx={x} cy={y} rx={w} ry={20} fill="#e9c3c0" />)}</g>
        <g transform={P(0.12)} filter="url(#dBlur2)" opacity={0.45}>
          {[[-80, 1150, 150], [150, 1000, 140], [420, 1240, 160], [640, 980, 140], [880, 1180, 160]].map(([x, h, w], i) => <Tower key={i} x={x} y={1500 - h} w={w} h={h + 400} c={DUSK.towerFar} stripes={10} lit={0.1} seed={i + 70} />)}
        </g>
        {/* far row of towers in haze */}
        <g transform={P(0.25)} filter="url(#dBlur)" opacity={0.7}>
          {[[-60, 720, 150], [120, 860, 130], [300, 640, 160], [520, 800, 140], [700, 700, 150], [880, 880, 140], [1020, 760, 150]].map(([x, h, w], i) => <Tower key={i} x={x} y={1500 - h - 300} w={w} h={h + 400} c={DUSK.towerFar} stripes={8} lit={0.15} seed={i + 40} />)}
        </g>
        <rect width={1080} height={1920} fill="url(#dHaze)" opacity={0.9} />
        {/* mid row: towers, round trees and lamps */}
        <g transform={P(0.55)}>
          {[[-40, 760, 170], [230, 860, 150], [500, 700, 170], [760, 820, 160], [980, 720, 170]].map(([x, h, w], i) => <Tower key={i} x={x} y={1560 - h} w={w} h={h + 200} c={DUSK.towerMid} stripes={8} lit={0.25} seed={i + 10} />)}
          {[60, 380, 640, 900].map((x, i) => <Tree key={i} x={x} y={1500} r={78} f={f} seed={i} />)}
          {[200, 520, 840].map((x, i) => <Lamp key={i} x={x} y={1560} h={300} f={f} seed={i} />)}
          {[0, 260, 520, 780, 1040].map((x, i) => <Bush key={i} x={x + 40} y={1560} s={0.9} />)}
        </g>
        {/* ground */}
        <rect x={0} y={1560} width={1080} height={360} fill={DUSK.ground} />
        <rect x={0} y={1560} width={1080} height={8} fill="#a8909a" />
        {Array.from({ length: 14 }).map((_, i) => <rect key={i} x={i * 80 - 20} y={1600 + (i % 3) * 30} width={50} height={4} rx={2} fill={DUSK.ground2} opacity={0.6} />)}
        <rect x={0} y={1560} width={1080} height={360} fill="url(#dHaze)" opacity={0.25} />
        {/* near: the two balcony towers facing each other */}
        <g transform={P(1)}>
          <Tower x={110} y={BY - 120} w={300} h={900} c={DUSK.towerNear} stripes={5} lit={0.5} seed={1} />
          <Tower x={680} y={BY - 120} w={300} h={900} c={DUSK.towerNear} stripes={5} lit={0.5} seed={2} />
          <rect x={150} y={BY - 6} width={300} height={16} rx={8} fill={DUSK.ink} opacity={0.85} />
          <rect x={640} y={BY - 6} width={300} height={16} rx={8} fill={DUSK.ink} opacity={0.85} />
          <g transform={`translate(${BX} ${BY})`}><Stick hair="short" outfit="tee" col={DUSK.teal} p={boy} id="b" /></g>
          <g transform={`translate(${GX} ${GY}) scale(-1 1)`}><Stick hair="pony" outfit="kurta" col={DUSK.lav} p={girl} id="g" /></g>
          {[150, 640].map((x) => <g key={x}>{Array.from({ length: 11 }).map((_, i) => <rect key={i} x={x + 6 + i * 28} y={BY - 70} width={4} height={64} fill={DUSK.ink} opacity={0.85} />)}<rect x={x} y={BY - 74} width={300} height={6} rx={3} fill={DUSK.ink} /></g>)}
          {on > 0.01 && (
            <g transform={`translate(${lens.x} ${lens.y}) rotate(${ang})`}>
              <path d={`M 0 -5 L ${len} -46 L ${len} 46 L 0 5 Z`} fill="url(#dBeam)" opacity={0.7 * on} filter="url(#dBlur2)" />
              <path d={`M 0 -2 L ${len} -16 L ${len} 16 L 0 2 Z`} fill="url(#dBeam)" opacity={0.85 * on} />
              <circle cx={0} cy={0} r={22} fill="#fff6dc" opacity={on} filter="url(#dBlur2)" />
            </g>
          )}
        </g>
        {/* soft vignette */}
        <rect width={1080} height={1920} fill="url(#dSun)" opacity={0.15} />
      </svg>
    </AbsoluteFill>
  );
};
