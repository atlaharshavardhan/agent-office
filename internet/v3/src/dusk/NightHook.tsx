import React from 'react';
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from 'remotion';
import '@fontsource/manrope/700.css'; import '@fontsource/manrope/800.css'; import '@fontsource/ibm-plex-mono/600.css';
import { FPS, hash, prog, pulse, lerp, clamp01, easeOut, easeInOut } from '../lib/anim';
import { DUSK, Stick, StickPose, Tree, Bush, Lamp } from './Dusk';
import { House, Railing, Fence, HC, ROOF } from './Houses';
import { FONT, TECH } from '../lib/palette';

/* Night-street hook (0 - 15.6 s): same shot pattern as the approved hook, now in the night house-street style.
   Voice + music + effects come from the existing mix (internet/audio/mix.wav, trimmed). */
const C = { x: 540, y: 960 };
const STREET = 1250, GH = { x: 610, w: 300, h: 420 }, GT = STREET - 210;
const BY = 1660, BX = 250, BS = 1.1, GX = GH.x + GH.w / 2 + 10, GS = 0.62;
const BLINKS: [number, number][] = [[1.15, 1.45], [2.0, 2.95], [3.75, 8.2], [8.95, 9.5]];
const HBITS = [0, 1, 0, 0, 1, 0, 0, 0], BIT0 = 10.55, BITD = 0.14, FLY = 0.6;

/* camera keys: target point (rest-screen coords), the depth of that target's layer, zoom on that layer */
type Key = [number, number, number, number, number]; // t, px, py, depth, zoom
const KEYS: Key[] = [
  [0.0, 540, 1180, 1, 1.0], [0.55, 540, 1150, 1, 1.04],
  [1.05, 300, 1420, 1, 2.1], [1.75, 300, 1430, 1, 2.2],                 // the boy
  [2.25, GX, GT - 120 * GS, 0.5, 3.0], [2.9, GX, GT - 120 * GS, 0.5, 3.1],   // the girl (layer 0.5)
  [3.35, 540, 1180, 1, 1.0], [3.45, 540, 1180, 1, 1.0],
  [4.0, 350, 1360, 1, 2.6], [4.4, 350, 1360, 1, 2.7],                   // the torch
  [5.05, GX, GT - 120 * GS, 0.5, 3.0], [5.65, GX, GT - 120 * GS, 0.5, 3.1],
  [6.4, 540, 1180, 1, 1.02], [8.4, 540, 1170, 1, 1.06],
  [10.45, 540, 1180, 1, 1.06], [10.95, 520, 1250, 1, 1.25], [12.4, 520, 1250, 1, 1.3],      // bits fly across
  [12.9, 540, 1050, 1, 1.15], [14.1, 540, 1050, 1, 1.18],               // HELLO in the sky
  [14.55, GX, GT - 120 * GS, 0.5, 3.4], [15.6, GX, GT - 120 * GS, 0.5, 3.5], // too slow
];
const camAt = (t: number) => {
  let i = 0; while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const conv = (k: Key) => { const [, px, py, d, zt] = k; const z = 1 + (zt - 1) / d; return { fx: C.x + (px - C.x) / d, fy: C.y + (py - C.y) / d, lz: Math.log(z) }; };
  const a = conv(KEYS[i]), b = conv(KEYS[i + 1]); const u = easeInOut(clamp01((t - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0])));
  return { fx: lerp(a.fx, b.fx, u), fy: lerp(a.fy, b.fy, u), z: Math.exp(lerp(a.lz, b.lz, u)) };
};
const layerT = (cam: { fx: number; fy: number; z: number }, d: number) => {
  const zd = 1 + (cam.z - 1) * d, fx = C.x + (cam.fx - C.x) * d, fy = C.y + (cam.fy - C.y) * d;
  return { s: `translate(${C.x} ${C.y}) scale(${zd}) translate(${-fx} ${-fy})`, map: (p: { x: number; y: number }) => ({ x: C.x + zd * (p.x - fx), y: C.y + zd * (p.y - fy) }) };
};

const VO: [number, React.ReactNode][] = [
  [3.45, <>Flash a <em>torch</em></>], [4.3, <>at your <em>friend</em> across the street,</>], [5.85, <>and you've basically built</>], [6.95, <>the <em>internet.</em></>],
  [8.4, <>On is <em>one</em>. Off is <em>zero</em>.</>], [10.5, <>Eight blinks make <em>one letter</em>.</>], [12.45, <>But <em>"hello"</em> takes forty blinks.</>], [14.3, <>Too <em>slow.</em></>],
];

export const NightHook: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS; (globalThis as any).__f = f;
  const cam = camAt(t);
  const L = (d: number) => layerT(cam, d);
  // ---------- torch state ----------
  let on = Math.max(...BLINKS.map(([a, b]) => pulse(f, a, b)));
  HBITS.forEach((b, i) => { if (b) on = Math.max(on, pulse(f, BIT0 + i * BITD, BIT0 + i * BITD + 0.1)); });
  const raise = Math.min(1, prog(f, 0.6, 1.05, easeOut) + 0);
  const notice = prog(f, 2.1, 2.4, easeOut), wave = prog(f, 4.6, 4.9) * (1 - prog(f, 6.2, 6.5));
  const sleepy = prog(f, 14.25, 14.6);
  const boy: StickPose = { blink: Math.max(0, 1 - Math.abs(t - 2.9) / 0.07, 1 - Math.abs(t - 7.4) / 0.07), smile: 0.4 + 0.5 * prog(f, 2.4, 2.8), look: 0.8, armR: [lerp(10, 112, raise), lerp(4, 122, raise)], armL: [-12, -8], holdTorch: true, torch: on, tilt: -4 * raise };
  const girl: StickPose = { blink: Math.max(sleepy * 0.95, 1 - Math.abs(t - 1.0) / 0.07), smile: lerp(0.2, 1, notice) * (1 - sleepy * 0.7), look: -lerp(0.2, 0.9, notice), armR: [lerp(10, 150, wave), lerp(6, 168, wave) + Math.sin(t * 11) * 14 * wave], armL: [-10, -6], tilt: 4 * notice + 14 * sleepy };
  // ---------- beam endpoints in screen space ----------
  const lm = (x: number, y: number, a: number, l: number) => { const r = a * Math.PI / 180; return [x + Math.sin(r) * l, y + Math.cos(r) * l]; };
  const [ex, ey] = lm(16, -224, boy.armR[0], 62); const [wx, wy] = lm(ex, ey, boy.armR[1], 58); const tr = (90 - boy.armR[1]) * Math.PI / 180;
  const lensRest = { x: BX + (wx + Math.cos(tr) * 42) * BS, y: BY + (wy + Math.sin(tr) * 42) * BS };
  const L1 = L(1), L5 = L(0.5);
  const lens = L1.map(lensRest), tgt = L5.map({ x: GX - 6, y: GT - 168 * GS }), girlHead = L5.map({ x: GX, y: GT - 278 * GS });
  const ang = Math.atan2(tgt.y - lens.y, tgt.x - lens.x) * 180 / Math.PI, len = Math.hypot(tgt.x - lens.x, tgt.y - lens.y);
  const zs = L1.map({ x: 1, y: 0 }).x - L1.map({ x: 0, y: 0 }).x;   // current scale of the near layer (for beam width)
  const back = [
    { x: -130, w: 200, h: 260, roof: 'arch' as const }, { x: 120, w: 180, h: 300, roof: 'gable' as const }, { x: 350, w: 190, h: 250, roof: 'flat' as const },
    { x: GH.x, w: GH.w, h: GH.h, roof: 'flat' as const, terrace: true }, { x: 980, w: 200, h: 300, roof: 'arch' as const },
  ];
  // ---------- macro (8.4 - 10.45): the boy's hand and torch, close ----------
  const macro = t >= 8.4 && t < 10.45 ? Math.min(prog(f, 8.4, 8.55), 1 - prog(f, 10.3, 10.45)) : 0;
  let line: React.ReactNode = null; for (const [a, txt] of VO) if (t >= a) line = txt;
  const subA = t >= 3.45 && !(t > 3.35 && t < 3.45) ? 1 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: '#05081a' }}>
      <Audio src={staticFile('hook-mix.wav')} />
      <svg width={1080} height={1920} style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="nSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05081a" /><stop offset=".4" stopColor="#0d1433" /><stop offset=".6" stopColor="#1c2150" /><stop offset=".68" stopColor="#2e2a5c" /></linearGradient>
          <radialGradient id="nGlow" cx="540" cy="1250" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#ffb86a" stopOpacity=".22" /><stop offset=".5" stopColor="#6a4a9a" stopOpacity=".12" /><stop offset="1" stopColor="#2e2a5c" stopOpacity="0" /></radialGradient>
          <radialGradient id="lampHalo"><stop offset="0" stopColor="#fff3d6" stopOpacity=".7" /><stop offset="1" stopColor="#ffd9a0" stopOpacity="0" /></radialGradient>
          <radialGradient id="winHalo"><stop offset="0" stopColor="#ffc46a" stopOpacity=".28" /><stop offset="1" stopColor="#ffc46a" stopOpacity="0" /></radialGradient>
          <radialGradient id="poolG"><stop offset="0" stopColor="#ffc46a" stopOpacity=".45" /><stop offset="1" stopColor="#ffc46a" stopOpacity="0" /></radialGradient>
          <radialGradient id="milky" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#8f9be0" stopOpacity=".22" /><stop offset="1" stopColor="#8f9be0" stopOpacity="0" /></radialGradient>
          <linearGradient id="winWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff4dc" stopOpacity=".6" /><stop offset="1" stopColor="#ffb870" stopOpacity=".2" /></linearGradient>
          <linearGradient id="hHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3570" stopOpacity="0" /><stop offset="1" stopColor="#3a3570" stopOpacity=".5" /></linearGradient>
          <linearGradient id="hRoad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24224a" /><stop offset="1" stopColor="#13122b" /></linearGradient>
          <linearGradient id="nBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fffaea" stopOpacity=".95" /><stop offset="1" stopColor="#ffe2b0" stopOpacity=".12" /></linearGradient>
          <filter id="nB1"><feGaussianBlur stdDeviation="3" /></filter><filter id="nB2"><feGaussianBlur stdDeviation="10" /></filter><filter id="nB3"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        {/* sky (barely moves) */}
        <g transform={L(0.04).s}>
          <rect x={-600} y={-800} width={2300} height={3500} fill="url(#nSky)" />
          <rect x={-600} y={-800} width={2300} height={3500} fill="url(#nGlow)" />
          <ellipse cx={540} cy={420} rx={700} ry={150} transform="rotate(-24 540 420)" fill="url(#milky)" />
          {Array.from({ length: 300 }).map((_, i) => { const tw = 0.55 + 0.45 * Math.sin(f / 9 + i * 2.3); return <circle key={i} cx={hash(i) * 1300 - 110} cy={hash(i + 9) * 1150 - 60} r={hash(i + 3) * 1.7 + 0.4} fill={i % 7 ? '#ffffff' : '#ffe6c2'} opacity={(0.25 + 0.7 * hash(i + 5)) * tw * (1 - hash(i + 9) * 0.5)} />; })}
          {[[180, 160], [420, 90], [700, 220], [960, 120], [300, 420], [620, 520]].map(([x, y], i) => <g key={i} opacity={0.8 + 0.2 * Math.sin(f / 7 + i)}><circle cx={x} cy={y} r={2.6} fill="#fff" /><path d={`M ${x - 10} ${y} L ${x + 10} ${y} M ${x} ${y - 10} L ${x} ${y + 10}`} stroke="#fff" strokeWidth={1} opacity={0.6} /></g>)}
          <g transform="translate(850 300)"><circle r={130} fill="#cfd8ff" opacity={0.08} /><circle r={46} fill="#f3eedb" /><circle cx={18} cy={-12} r={43} fill="#070a1e" /></g>
          <g filter="url(#nB2)" opacity={0.25}>{[[200, 620, 300], [760, 740, 260], [460, 860, 340]].map(([x, y, w], i) => <ellipse key={i} cx={x + Math.sin(t * 0.2 + i) * 20} cy={y} rx={w} ry={16} fill="#6a6aa8" />)}</g>
        </g>
        {/* far neighbourhood */}
        <g transform={L(0.15).s} filter="url(#nB1)">
          <path d="M -400 1060 Q 200 940 460 1010 Q 720 1080 920 960 Q 1060 900 1500 980 L 1500 1300 L -400 1300 Z" fill="#151a3a" opacity={0.95} />
          {Array.from({ length: 22 }).map((_, i) => { const x = -280 + i * 75, y = 1030 + Math.sin(i * 1.3) * 40; return <g key={i}><rect x={x} y={y - 26} width={34} height={28} rx={6} fill="#1d2248" /><path d={`M ${x - 4} ${y - 24} L ${x + 17} ${y - 44} L ${x + 38} ${y - 24} Z`} fill="#181c40" />{hash(i) < 0.7 && <><rect x={x + 12} y={y - 18} width={10} height={10} rx={3} fill="#ffd38a" /><circle cx={x + 17} cy={y - 13} r={14} fill="#ffc46a" opacity={0.18} /></>}</g>; })}
        </g>
        <g transform={L(0.2).s}><rect x={-600} y={-800} width={2300} height={3500} fill="url(#hHaze)" opacity={0.75} /></g>
        {/* across the street */}
        <g transform={L5.s}>
          {[95, 325, 575, 945].map((x, i) => <Tree key={i} x={x} y={STREET - 20} r={34} f={f} seed={i} />)}
          {back.map((b, i) => <House key={i} x={b.x} y={STREET} w={b.w} h={b.h} c={HC[i % HC.length]} roof={b.roof} rc={ROOF[i % ROOF.length]} seed={i + 1} terrace={b.terrace} door={i % 2 ? 'l' : 'c'} />)}
          <House x={-400} y={STREET} w={220} h={280} c={HC[4]} roof="gable" rc={ROOF[1]} seed={7} />
          <House x={1230} y={STREET} w={240} h={330} c={HC[5]} roof="flat" rc={ROOF[2]} seed={8} />
          {[[-130, 200], [120, 180], [350, 190], [980, 200]].map(([x, w], i) => <Fence key={i} x={x + 10} y={STREET} w={w - 20} />)}
          <g transform={`translate(${GX} ${GT}) scale(${-GS} ${GS})`}><Stick hair="pony" outfit="kurta" col={DUSK.lav} p={girl} id="g" /></g>
          <Railing x={GH.x + GH.w * 0.18} y={GT} w={GH.w * 0.64} s={0.75} />
          {[240, 600, 1020].map((x, i) => <Lamp key={i} x={x} y={STREET + 30} h={230} f={f} seed={i} />)}
        </g>
        <g transform={L(0.75).s}>
          <rect x={-800} y={STREET + 10} width={2700} height={1600} fill="url(#hRoad)" />
          <rect x={-800} y={STREET + 10} width={2700} height={22} fill="#3a3868" />
          {Array.from({ length: 16 }).map((_, i) => <rect key={i} x={-560 + i * 150} y={STREET + 190} width={80} height={8} rx={4} fill="#8e8cc0" opacity={0.35} />)}
          {[240, 600, 1020].map((x) => <ellipse key={x} cx={x} cy={STREET + 80} rx={150} ry={34} fill="url(#poolG)" />)}
        </g>
        {/* in front: the boy's roof terrace */}
        <g transform={L1.s}>
          <House x={-300} y={2140} w={260} h={400} c="#2a3056" roof="arch" rc="#1a2040" seed={12} />
          <House x={20} y={2100} w={460} h={440} c="#2f2c58" roof="flat" rc="#1c1d3a" seed={9} door="r" />
          <House x={545} y={2150} w={240} h={380} c="#36325c" roof="gable" rc="#211c3c" seed={13} />
          <House x={850} y={2130} w={270} h={400} c="#2a3056" roof="arch" rc="#1a2040" seed={11} door="l" />
          <Bush x={512} y={2020} s={0.9} /><Bush x={818} y={2020} s={0.9} /><Bush x={-10} y={2020} s={0.9} />
          <g transform={`translate(${BX} ${BY}) scale(${BS})`}><Stick hair="short" outfit="tee" col={DUSK.teal} p={boy} id="b" /></g>
          <Railing x={24} y={BY + 4} w={452} s={1.1} />
        </g>
        {/* the beam, drawn in screen space between the two layers */}
        {on > 0.01 && (
          <g transform={`translate(${lens.x} ${lens.y}) rotate(${ang})`} style={{ mixBlendMode: 'screen' }}>
            <path d={`M 0 ${-6 * zs} L ${len} -38 L ${len} 38 L 0 ${6 * zs} Z`} fill="url(#nBeam)" opacity={0.7 * on} filter="url(#nB2)" />
            <path d={`M 0 ${-2 * zs} L ${len} -12 L ${len} 12 L 0 ${2 * zs} Z`} fill="url(#nBeam)" opacity={0.85 * on} />
            <circle cx={0} cy={0} r={22 * zs} fill="#fff6dc" opacity={on} filter="url(#nB2)" />
            <circle cx={len} cy={0} r={40} fill="#fff1d0" opacity={0.35 * on} filter="url(#nB2)" />
          </g>
        )}
        {/* bits flying from the torch to her (10.55 - 12.4) */}
        {HBITS.map((b, i) => { const u = (t - (BIT0 + i * BITD)) / FLY; if (u < 0 || u > 1 || t > 12.45) return null;
          const x = lerp(lens.x, tgt.x, u), y = lerp(lens.y, tgt.y, u) - Math.sin(u * Math.PI) * 60;
          return <text key={i} x={x} y={y} textAnchor="middle" style={{ font: `600 54px ${FONT.mono}` }} fill={b ? '#ffe08a' : '#9fb0ff'} opacity={Math.min(1, u * 8, (1 - u) * 6)}>{b}</text>; })}
        {/* H above her, then HELLO across the sky */}
        {t > BIT0 + 7 * BITD + FLY && t < 12.6 && <text x={girlHead.x} y={girlHead.y - 70} textAnchor="middle" style={{ font: `800 110px ${FONT.ui}` }} fill="#ffd38a" opacity={prog(f, BIT0 + 7 * BITD + FLY, BIT0 + 7 * BITD + FLY + 0.15)}>H</text>}
        {t > 12.45 && t < 14.3 && 'HELLO'.split('').map((ch, j) => { const a = prog(f, 12.5 + j * 0.2, 12.75 + j * 0.2, easeOut); return (
          <g key={j} opacity={a * (1 - prog(f, 14.1, 14.3))} transform={`translate(${310 + j * 115} ${640 - a * 30})`}>
            <text textAnchor="middle" style={{ font: `800 130px ${FONT.ui}` }} fill="#ffd38a" filter="url(#nB2)" opacity={0.8}>{ch}</text>
            <text textAnchor="middle" style={{ font: `800 130px ${FONT.ui}` }} fill="#fff1d0">{ch}</text>
            <text y={60} textAnchor="middle" style={{ font: `600 22px ${FONT.mono}` }} fill="#9fb0ff">{['01001000', '01000101', '01001100', '01001100', '01001111'][j]}</text>
          </g>); })}
        {/* zZz */}
        {sleepy > 0 && <text x={girlHead.x + 60} y={girlHead.y - 50 - (t - 14.3) * 40} style={{ font: `800 46px ${FONT.ui}` }} fill="#cfe0ff" opacity={sleepy}>z Z z</text>}
      </svg>

      {/* macro: hand + torch close-up with the 1 / 0 */}
      {macro > 0 && (
        <AbsoluteFill style={{ opacity: macro }}>
          <svg width={1080} height={1920}>
            <defs><filter id="mB"><feGaussianBlur stdDeviation="26" /></filter><radialGradient id="mG"><stop offset="0" stopColor="#fff8e6" /><stop offset=".3" stopColor="#ffe2a8" stopOpacity=".8" /><stop offset="1" stopColor="#ffcf80" stopOpacity="0" /></radialGradient>
              <linearGradient id="mT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a5266" /><stop offset=".3" stopColor="#8e97ab" /><stop offset=".5" stopColor="#2a2f3c" /><stop offset="1" stopColor="#14161d" /></linearGradient></defs>
            <rect width={1080} height={1920} fill="#070a1e" />
            <g filter="url(#mB)">{Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={hash(i) * 1080} cy={600 + hash(i + 3) * 1200} r={30 + hash(i + 5) * 60} fill={i % 3 ? '#ffc46a' : '#8f9be0'} opacity={0.35} />)}</g>
            <g transform={`translate(600 1080) rotate(-18) scale(${0.92 + (t - 8.4) * 0.03})`}>
              {pulse(f, 8.95, 9.5) > 0 && <g style={{ mixBlendMode: 'screen' }}><path d="M 290 -40 L 1200 -330 L 1200 330 L 290 40 Z" fill="url(#mG)" opacity={0.6} filter="url(#nB2)" /><circle cx={300} cy={0} r={180} fill="url(#mG)" /></g>}
              <rect x={-420} y={-52} width={560} height={104} rx={26} fill="url(#mT)" />
              {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={-380 + i * 26} y={-52} width={6} height={104} fill="#0b0d12" opacity={0.6} />)}
              <path d="M 130 -52 L 260 -92 L 290 -92 L 290 92 L 260 92 L 130 52 Z" fill="#c4553a" /><path d="M 130 -52 L 260 -92 L 290 -92 L 290 -70 L 260 -70 L 130 -34 Z" fill="#ff8a6a" opacity={0.5} />
              <rect x={284} y={-98} width={16} height={196} rx={6} fill="#d6d9df" />
              <ellipse cx={300} cy={0} rx={14} ry={86} fill={pulse(f, 8.95, 9.5) > 0 ? '#fffaf0' : '#3a3f4c'} />
              {/* stick-style hand: a dark rounded fist and thumb */}
              <rect x={-250} y={-80} width={210} height={170} rx={70} fill={DUSK.ink} /><rect x={-120} y={-110} width={96} height={50} rx={25} fill={DUSK.ink} />
              <path d="M -250 20 L -560 380" stroke={DUSK.ink} strokeWidth={60} strokeLinecap="round" /><path d="M -300 60 L -620 420 L -760 420 L -420 0 Z" fill={DUSK.teal} />
              <path d="M -60 -110 A 80 80 0 0 1 -30 -60" stroke={DUSK.rim} strokeWidth={6} fill="none" opacity={0.8} />
            </g>
            {t > 8.9 && <text x={830} y={760} textAnchor="middle" style={{ font: `700 260px ${FONT.mono}` }} fill={t < 9.5 ? '#ffe08a' : '#9fb0ff'} opacity={prog(f, 8.9, 9.0)}>{t < 9.5 ? '1' : '0'}</text>}
            {t > 8.9 && <text x={830} y={830} textAnchor="middle" style={{ font: `600 34px ${FONT.mono}`, letterSpacing: '0.2em' }} fill="#cfd8ff" opacity={0.8 * prog(f, 8.9, 9.0)}>{t < 9.5 ? 'LIGHT ON' : 'LIGHT OFF'}</text>}
          </svg>
        </AbsoluteFill>
      )}

      {/* the binary card for "eight blinks make one letter" and the count for "hello" */}
      {t > 10.5 && t < 14.25 && (
        <div style={{ position: 'absolute', top: 236, left: 90, right: 90, height: 200, borderRadius: 40, background: 'rgba(10,14,36,.78)', border: '1px solid rgba(160,176,255,.25)', boxShadow: '0 20px 60px rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, opacity: prog(f, 10.5, 10.75) * (1 - prog(f, 14.05, 14.25)) }}>
          {t < 12.45 ? (
            <>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', font: `600 58px ${FONT.mono}` }}>
                {HBITS.map((b, i) => { const shown = t > BIT0 + i * BITD + FLY; return <span key={i} style={{ width: 58, height: 80, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.05)', border: `1px solid ${shown && b ? 'rgba(255,224,138,.7)' : 'rgba(255,255,255,.14)'}`, color: shown ? (b ? '#ffe08a' : '#9fb0ff') : 'rgba(255,255,255,.2)' }}>{shown ? b : '·'}</span>; })}
                {t > BIT0 + 7 * BITD + FLY && <span style={{ marginLeft: 10, font: `800 72px ${FONT.ui}`, color: TECH.text }}>= <span style={{ color: '#ffd38a' }}>H</span></span>}
              </div>
              <div style={{ font: `600 26px ${FONT.mono}`, letterSpacing: '0.12em', color: '#a9b4dd' }}>8 BLINKS = 1 LETTER</div>
            </>
          ) : (
            <>
              <div style={{ font: `800 76px ${FONT.ui}`, color: TECH.text, letterSpacing: '0.12em' }}>HELLO</div>
              <div style={{ font: `600 28px ${FONT.mono}`, color: '#a9b4dd' }}>5 letters × 8 = <span style={{ color: '#ffe08a' }}>{Math.min(40, Math.round(Math.max(0, t - 12.45) / 1.5 * 40))}</span> blinks</div>
            </>
          )}
        </div>
      )}

      {/* title for the hook */}
      <div style={{ position: 'absolute', top: 250, left: 60, right: 60, textAlign: 'center', font: `800 66px/1.12 ${FONT.ui}`, color: TECH.text, textShadow: '0 4px 30px rgba(0,0,0,.6)', opacity: prog(f, 7.1, 7.4) * (1 - prog(f, 8.2, 8.4)) }}>
        How does the <span style={{ color: '#ffd38a' }}>internet</span><br />reach you?
      </div>
      {/* subtitles (safe zone 1250-1450) */}
      {line && (
        <div style={{ position: 'absolute', top: 1260, left: 60, right: 150, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', font: `800 58px/1.15 ${FONT.ui}`, color: '#fff', textShadow: '0 3px 20px rgba(0,0,0,.85)', opacity: subA }}>
          <div className="sub">{line}</div>
        </div>
      )}
      <style>{'.sub em{font-style:normal;color:#ffd38a}'}</style>
      {/* watermark, right edge, middle */}
      <div style={{ position: 'absolute', right: 18, top: 960, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: 0.8 }}>
        <Img src={staticFile('logo.png')} style={{ width: 70, height: 70, borderRadius: 35 }} />
        <span style={{ writingMode: 'vertical-rl', font: `700 26px ${FONT.ui}`, color: 'rgba(255,255,255,.85)' }}>@TheInvisiTech</span>
      </div>
    </AbsoluteFill>
  );
};
