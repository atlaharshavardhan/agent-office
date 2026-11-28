import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FPS, hash, prog, lerp, easeOut, easeInOut, clamp01 } from '../lib/anim';
import { FONT } from '../lib/palette';

/* Under the sea, in the film's palette: deep blue water, purple rock, coral in her colour, one cyan cable. */
const cabY = (x: number) => 1330 - 0.00018 * (x - 200) * (x - 200) + 0.06 * x + 14 * Math.sin(x / 170);
const Fish: React.FC<{ x: number; y: number; s: number; c: string; flip?: boolean; wag: number }> = ({ x, y, s, c, flip, wag }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}><path d={`M -22 0 L ${-40} ${-12 + wag} L ${-40} ${12 + wag} Z`} fill={c} /><ellipse cx={0} cy={0} rx={26} ry={12} fill={c} /><ellipse cx={2} cy={4} rx={20} ry={6} fill="#fff" opacity={0.25} /><path d="M -4 -11 L 6 -20 L 12 -10 Z" fill={c} /><circle cx={15} cy={-3} r={3.2} fill="#0a0e24" /><circle cx={16} cy={-4} r={1.1} fill="#fff" /></g>);
const Coral: React.FC<{ x: number; y: number; s: number; c: string; sway: number; seed: number }> = ({ x, y, s, c, sway, seed }) => {
  const br = (x0: number, y0: number, a: number, l: number, d: number, key: string): React.ReactNode[] => { const r = (a + sway * (4 - d) * 0.6) * Math.PI / 180, x1 = x0 + Math.sin(r) * l, y1 = y0 - Math.cos(r) * l; const me = <line key={key} x1={x0} y1={y0} x2={x1} y2={y1} stroke={c} strokeWidth={5 + d * 4} strokeLinecap="round" />; if (d === 0) return [me, <circle key={key + 'k'} cx={x1} cy={y1} r={6} fill="#fff" opacity={0.35} />]; return [me, ...br(x1, y1, a - 24 - hash(seed + d) * 14, l * 0.72, d - 1, key + 'l'), ...br(x1, y1, a + 22 + hash(seed + d * 3) * 14, l * 0.7, d - 1, key + 'r')]; };
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{br(0, 0, 0, 46, 3, 'c')}</g>;
};
const Weed: React.FC<{ x: number; y: number; h: number; c: string; ph: number }> = ({ x, y, h, c, ph }) => (<path d={`M ${x} ${y} C ${x + 22 * Math.sin(ph)} ${y - h * 0.35}, ${x - 26 * Math.sin(ph + 1)} ${y - h * 0.7}, ${x + 18 * Math.sin(ph + 2)} ${y - h}`} stroke={c} strokeWidth={12} strokeLinecap="round" fill="none" />);

export const Deep: React.FC<{ f: number; sx?: number; id: string; children?: React.ReactNode; back?: React.ReactNode }> = ({ f, sx = 0, id, children, back }) => {
  const t = f / FPS;
  return (
    <g>
      <defs>
        <linearGradient id={id + 'W'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c58a8" /><stop offset=".35" stopColor="#123a82" /><stop offset=".75" stopColor="#0a1e56" /><stop offset="1" stopColor="#050c2a" /></linearGradient>
        <linearGradient id={id + 'R'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bfe9ff" stopOpacity=".34" /><stop offset="1" stopColor="#bfe9ff" stopOpacity="0" /></linearGradient>
        <linearGradient id={id + 'S'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3f8e" /><stop offset=".3" stopColor="#272a6c" /><stop offset="1" stopColor="#0c0e30" /></linearGradient>
        <radialGradient id={id + 'C'}><stop offset="0" stopColor="#e9fdff" stopOpacity=".95" /><stop offset=".3" stopColor="#5fe3ff" stopOpacity=".5" /><stop offset="1" stopColor="#5fe3ff" stopOpacity="0" /></radialGradient>
        <radialGradient id={id + 'V'} cx=".5" cy=".5" r=".8"><stop offset=".45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#01030c" stopOpacity=".85" /></radialGradient>
      </defs>
      <rect x={-200} y={-300} width={1480} height={2900} fill={`url(#${id}W)`} />
      {/* light falling from the surface */}
      <g style={{ mixBlendMode: 'screen' }}>{[120, 330, 520, 760, 960].map((x, i) => { const sw = Math.sin(t * 0.5 + i * 1.7) * 40; return <polygon key={i} points={`${x + sw - 50},-20 ${x + sw + 60},-20 ${x + 260 + sw * 2 + i * 20},1500 ${x + 60 + sw * 2 + i * 20},1500`} fill={`url(#${id}R)`} opacity={0.5 + 0.3 * Math.sin(t * 0.8 + i)} />; })}</g>
      {back}
      {/* far ridges */}
      <g transform={`translate(${-sx * 0.2} 0)`}><path d="M -300 1180 L -100 1010 L 60 1090 L 220 940 L 420 1080 L 560 990 L 760 1100 L 900 960 L 1100 1070 L 1300 980 L 1500 1100 L 1500 1500 L -300 1500 Z" fill="#11256a" opacity={0.75} /></g>
      <g transform={`translate(${-sx * 0.4} 0)`}><path d="M -300 1260 L -60 1140 L 150 1200 L 330 1080 L 520 1200 L 700 1130 L 940 1230 L 1120 1120 L 1400 1220 L 1600 1150 L 1600 1600 L -300 1600 Z" fill="#161f66" /></g>
      {/* a whale, far off */}
      <g transform={`translate(${1260 - ((t * 26 + 300) % 1700)} ${560 + Math.sin(t * 0.6) * 20}) scale(1.3)`} opacity={0.2}><path d="M -150 0 C -100 -46 60 -50 140 -10 C 170 -30 196 -34 210 -40 C 200 -14 200 10 212 34 C 190 26 168 20 142 12 C 70 40 -90 44 -150 0 Z" fill="#0a1440" /><path d="M -40 26 L -74 62 L -10 34 Z" fill="#0a1440" /></g>
      {/* distant fish */}
      {Array.from({ length: 14 }).map((_, i) => { const x = ((hash(i * 3) * 1500 + t * (30 + hash(i) * 30)) % 1500) - 200, y = 640 + hash(i * 7) * 380 + Math.sin(t * 1.4 + i) * 10; return <g key={i} opacity={0.35}><Fish x={x} y={y} s={0.42} c="#0c1a50" wag={Math.sin(t * 9 + i) * 4} /></g>; })}
      {/* seabed */}
      <g transform={`translate(${-sx} 0)`}>
        <path d={`M -400 1420 ${Array.from({ length: 30 }).map((_, i) => `L ${-400 + i * 90} ${1396 + Math.sin(i * 1.3) * 18 + Math.sin(i * 0.37) * 26}`).join(' ')} L 2300 2700 L -400 2700 Z`} fill={`url(#${id}S)`} />
        <path d={`M -400 1420 ${Array.from({ length: 30 }).map((_, i) => `L ${-400 + i * 90} ${1396 + Math.sin(i * 1.3) * 18 + Math.sin(i * 0.37) * 26}`).join(' ')}`} stroke="#6a6fd0" strokeWidth={5} fill="none" opacity={0.6} />
        {Array.from({ length: 40 }).map((_, i) => <path key={i} d={`M ${-380 + hash(i * 3) * 2600} ${1470 + hash(i * 7) * 400} q 40 -12 80 0`} stroke="#4a50a8" strokeWidth={3} fill="none" opacity={0.35} />)}
        {[[-120, 1400, 1.3], [380, 1440, 0.9], [980, 1410, 1.5], [1500, 1430, 1.1], [1960, 1400, 1.4]].map(([x, y, s], i) => <g key={i} transform={`translate(${x} ${y}) scale(${s})`}><path d="M -80 30 C -90 -20 -40 -60 10 -56 C 60 -60 96 -20 86 30 Z" fill="#2a2466" /><path d="M -60 -10 C -40 -46 10 -52 40 -42 C 10 -40 -30 -30 -60 -10 Z" fill="#5a4cb0" opacity={0.7} /><circle cx={30} cy={0} r={7} fill="#1a1650" /><circle cx={-20} cy={12} r={5} fill="#1a1650" /></g>)}
        {[[60, 1404, 1.5, '#ff8672', 1], [200, 1420, 1.0, '#f58fb4', 2], [760, 1400, 1.3, '#b9a2ec', 3], [1180, 1412, 1.6, '#ff8672', 4], [1660, 1404, 1.2, '#f58fb4', 5], [2100, 1410, 1.5, '#b9a2ec', 6]].map(([x, y, s, c, sd], i) => <Coral key={i} x={x as number} y={y as number} s={s as number} c={c as string} sway={Math.sin(t * 1.3 + i) * 3} seed={sd as number} />)}
        {Array.from({ length: 22 }).map((_, i) => <Weed key={i} x={-350 + i * 125 + hash(i) * 50} y={1420 + hash(i * 3) * 30} h={90 + hash(i * 5) * 150} c={i % 2 ? '#1f7a6a' : '#2a9a7a'} ph={t * 1.5 + i} />)}
        {/* little glowing things on the bed */}
        {Array.from({ length: 12 }).map((_, i) => { const x = -300 + hash(i * 5) * 2500, y = 1440 + hash(i * 9) * 200; return <g key={i} opacity={0.5 + 0.5 * Math.sin(t * 2 + i)}><circle cx={x} cy={y} r={10} fill="#7dffd0" opacity={0.25} /><circle cx={x} cy={y} r={3} fill="#c8fff0" /></g>; })}
        {children}
      </g>
      {/* near fish */}
      {[[0.9, 760, '#ff8672', 46, 0], [0.7, 900, '#ffd36b', 60, 1], [1.05, 1010, '#b9a2ec', 38, 2]].map(([s, y, c, v, i]) => { const x = (((i as number) * 430 + t * (v as number)) % 1500) - 200; return <Fish key={i as number} x={x} y={(y as number) + Math.sin(t * 1.6 + (i as number)) * 16} s={s as number} c={c as string} wag={Math.sin(t * 10 + (i as number)) * 5} />; })}
      {/* a few bubbles and drifting specks */}
      {Array.from({ length: 16 }).map((_, i) => { const y = 1900 - ((t * (60 + hash(i) * 70) + hash(i * 3) * 1900) % 1900), x = hash(i * 7) * 1080 + Math.sin(t * 2 + i) * 14, r = 4 + hash(i * 5) * 8; return <g key={i} opacity={0.4}><circle cx={x} cy={y} r={r} fill="none" stroke="#cfeeff" strokeWidth={2} /><circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.25} fill="#fff" /></g>; })}
    </g>
  );
};

/* the cable lying on the seabed: dark armoured sheath, cyan light inside */
const SeaCable: React.FC<{ id: string; t: number; x0?: number; x1?: number; live?: boolean; bump?: (x: number) => number; pulseTo?: number }> = ({ id, t, x0 = -400, x1 = 2300, live = true, bump = () => 0, pulseTo = 9999 }) => {
  const pts = Array.from({ length: Math.ceil((x1 - x0) / 20) + 1 }).map((_, i) => { const x = Math.min(x1, x0 + i * 20); return `${x},${cabY(x) + bump(x)}`; }).join(' ');
  return <g>
    <polyline points={pts} fill="none" stroke="#000" strokeWidth={34} strokeLinecap="round" opacity={0.35} transform="translate(0 16)" />
    {live && <polyline points={pts} fill="none" stroke="#5fe3ff" strokeWidth={70} strokeLinecap="round" opacity={0.1} />}
    <polyline points={pts} fill="none" stroke="#0a0c22" strokeWidth={30} strokeLinecap="round" /><polyline points={pts} fill="none" stroke="#2a2f5c" strokeWidth={22} strokeLinecap="round" /><polyline points={pts} fill="none" stroke="#565c96" strokeWidth={6} strokeLinecap="round" transform="translate(0 -7)" opacity={0.8} />
    {Array.from({ length: Math.floor((x1 - x0) / 60) }).map((_, i) => { const x = x0 + 30 + i * 60; return <line key={i} x1={x - 4} y1={cabY(x) + bump(x) - 13} x2={x + 4} y2={cabY(x) + bump(x) + 13} stroke="#0a0c22" strokeWidth={4} opacity={0.6} />; })}
    {live && <polyline points={pts} fill="none" stroke="#9ff6ff" strokeWidth={3} strokeLinecap="round" opacity={0.85} />}
    {live && Array.from({ length: 12 }).map((_, i) => { const x = x0 + ((i * 230 + t * 900) % (x1 - x0)); if (x > pulseTo) return null; return <g key={i}><circle cx={x} cy={cabY(x) + bump(x)} r={30} fill={`url(#${id}C)`} /><circle cx={x} cy={cabY(x) + bump(x)} r={6} fill="#f2feff" /></g>; })}
  </g>;
};

/* a cut-open length of real undersea cable: sheath, steel armour, copper, and hair-thin glass fibres */
const CableCut: React.FC<{ t: number; id: string }> = ({ t, id }) => {
  const layers: [number, number, string, string][] = [[-520, 150, '#14162e', '#2c3058'], [-330, 128, '#3a3f66', '#6a70a0'], [-150, 100, '#8a90b8', '#cfd4ee'], [30, 70, '#b06a3a', '#e8a070'], [190, 44, '#d8dcf0', '#ffffff']];
  return <g>
    <defs>{layers.map(([, , a, b], i) => <linearGradient key={i} id={`${id}L${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset=".28" stopColor={b} /><stop offset=".6" stopColor={a} /><stop offset="1" stopColor="#05060f" /></linearGradient>)}</defs>
    {/* the glass fibres, running out of the core */}
    {[-18, -6, 6, 18].map((y, i) => <g key={i}><line x1={190} y1={y} x2={620} y2={y * 3.4} stroke="#0f4a66" strokeWidth={9} strokeLinecap="round" /><line x1={190} y1={y} x2={620} y2={y * 3.4} stroke="#9ff6ff" strokeWidth={3} strokeLinecap="round" />
      {[0, 1, 2].map((j) => { const u = (t * 1.5 + j / 3 + i * 0.17) % 1, x = lerp(190, 620, u), yy = lerp(y, y * 3.4, u); return <g key={j}><circle cx={x} cy={yy} r={20} fill={`url(#${id}C)`} /><circle cx={x} cy={yy} r={4.5} fill="#fff" /></g>; })}</g>)}
    {[...layers].reverse().map(([x, r, a, b], k) => { const i = layers.length - 1 - k, xs = i === 0 ? -900 : layers[i - 1][0] - 40; return <g key={i}><rect x={xs} y={-r} width={x - xs} height={r * 2} fill={`url(#${id}L${i})`} /><ellipse cx={x} cy={0} rx={r * 0.22} ry={r} fill={b} /><ellipse cx={x} cy={0} rx={r * 0.22 * 0.72} ry={r * 0.72} fill={a} opacity={0.9} />
      {i === 1 && Array.from({ length: 16 }).map((_, j) => { const an = (j / 16) * Math.PI * 2; return <circle key={j} cx={x + Math.cos(an) * r * 0.2 * 0.84} cy={Math.sin(an) * r * 0.86} r={9} fill="#cfd4ee" stroke="#3a3f66" strokeWidth={2} />; })}
      {i === 1 && Array.from({ length: 9 }).map((_, j) => <line key={'w' + j} x1={xs} y1={-r + 14 + j * (r * 2 - 28) / 8} x2={x - 10} y2={-r + 14 + j * (r * 2 - 28) / 8} stroke="#14162e" strokeWidth={3} opacity={0.45} />)}</g>; })}
    {[...layers].slice(0, 0)}
  </g>;
};

/* SeaA: the camera arrives on the seabed, follows the cable, then a lens opens to show what is inside it. */
export const SeaA: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const sx = lerp(0, 420, easeInOut(clamp01(t / 3.3))), drop = (1 - prog(f, 0, 0.7, easeOut)) * 420, lens = prog(f, 0.95, 1.45, easeOut);
  const LX = 540, LY = 800, LR = 350 * lens, src = { x: 600, y: cabY(600 + sx) - 330 };
  return (
    <AbsoluteFill style={{ backgroundColor: '#050c2a' }}>
      <svg width={1080} height={1920}>
        <g transform={`translate(0 ${-drop - 330})`}><Deep f={f} sx={sx} id="sa"><SeaCable id="sa" t={t} /></Deep></g>
        {/* arrival: bubbles rushing past */}
        {t < 0.9 && Array.from({ length: 26 }).map((_, i) => { const y = ((hash(i * 3) * 2300 + t * 2600) % 2300) - 200, x = hash(i * 7) * 1080; return <circle key={i} cx={x} cy={y} r={5 + hash(i) * 12} fill="none" stroke="#dff4ff" strokeWidth={3} opacity={0.6 * (1 - t / 0.9)} />; })}
        {/* the lens */}
        {lens > 0 && <g>
          <defs><clipPath id="saLens"><circle cx={LX} cy={LY} r={LR} /></clipPath><radialGradient id="saBg"><stop offset="0" stopColor="#16307a" /><stop offset="1" stopColor="#070d30" /></radialGradient></defs>
          <path d={`M ${src.x - 14} ${src.y} L ${LX - LR * 0.5} ${LY + LR * 0.86} L ${LX + LR * 0.5} ${LY + LR * 0.86} L ${src.x + 14} ${src.y} Z`} fill="#9ff6ff" opacity={0.12 * lens} />
          <circle cx={src.x} cy={src.y} r={26} fill="none" stroke="#9ff6ff" strokeWidth={4} opacity={lens} />
          <circle cx={LX} cy={LY} r={LR + 16} fill="#5fe3ff" opacity={0.14} /><circle cx={LX} cy={LY} r={LR} fill="url(#saBg)" />
          <g clipPath="url(#saLens)"><g transform={`translate(${LX - 30} ${LY + 20}) rotate(-16) scale(${0.72 * lens})`}><CableCut t={t} id="sa" /></g>
            <g opacity={prog(f, 1.5, 1.8)}><line x1={LX - 150} y1={LY - 30} x2={LX - 150} y2={LY - 190} stroke="#cfd8ff" strokeWidth={2.5} /><circle cx={LX - 150} cy={LY - 30} r={5} fill="#cfd8ff" /><text x={LX - 120} y={LY - 204} textAnchor="middle" style={{ font: `600 25px ${FONT.mono}`, letterSpacing: '0.1em' }} fill="#eef1ff">STEEL ARMOUR</text></g>
            <g opacity={prog(f, 1.8, 2.1)}><line x1={LX + 180} y1={LY - 62} x2={LX + 180} y2={LY - 190} stroke="#9ff6ff" strokeWidth={2.5} /><circle cx={LX + 180} cy={LY - 62} r={5} fill="#9ff6ff" /><text x={LX + 150} y={LY - 204} textAnchor="middle" style={{ font: `600 25px ${FONT.mono}`, letterSpacing: '0.1em' }} fill="#dffbff">GLASS FIBRES</text></g></g>
          <circle cx={LX} cy={LY} r={LR} fill="none" stroke="#dffbff" strokeWidth={7} /><circle cx={LX} cy={LY} r={LR - 12} fill="none" stroke="#5fe3ff" strokeWidth={2} opacity={0.6} /><path d={`M ${LX - LR * 0.72} ${LY - LR * 0.5} A ${LR * 0.88} ${LR * 0.88} 0 0 1 ${LX - LR * 0.2} ${LY - LR * 0.86}`} stroke="#fff" strokeWidth={8} fill="none" opacity={0.35} strokeLinecap="round" />
        </g>}
        <rect width={1080} height={1920} fill="url(#saV)" />
        <rect width={1080} height={1920} fill="#0c2a66" opacity={1 - prog(f, 0, 0.35)} />
      </svg>
    </AbsoluteFill>
  );
};

/* SeaCut: a ship's anchor drags across the seabed, catches the cable, and snaps it. */
export const SeaCut: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS, SNAP = 1.0;
  const ax = lerp(120, 560, easeInOut(clamp01(t / 0.75))) + lerp(0, 150, easeOut(clamp01((t - 0.75) / 0.25))) + (t > SNAP ? 60 * easeOut(clamp01((t - SNAP) / 0.5)) : 0);
  const pull = t < SNAP ? easeInOut(clamp01((t - 0.7) / 0.3)) : 0, snapped = t >= SNAP, after = clamp01((t - SNAP) / 0.6);
  const CX = 640, bump = (x: number) => -150 * pull * Math.exp(-((x - CX - 40 * pull) ** 2) / (2 * 190 * 190));
  const ay = cabY(ax) - 30 + (t < 0.7 ? Math.abs(Math.sin(t * 14)) * -14 : 0) - 150 * pull * 0.9 - (snapped ? 150 * (1 - after) * 0.0 + 120 * after : 0) + (snapped ? -150 : 0) * 0;
  const shake = snapped ? Math.sin(t * 70) * 16 * (1 - after) : 0;
  const recoil = (side: number) => (x: number) => { const d = Math.abs(x - CX); return snapped ? 40 * easeOut(after) * Math.exp(-d / 220) + Math.sin(d / 40 - t * 18) * 10 * (1 - after) * Math.exp(-d / 260) * side : 0; };
  const gap = snapped ? lerp(0, 70, easeOut(after)) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: '#050c2a' }}>
      <svg width={1080} height={1920}>
        <g transform={`translate(${shake} ${shake * 0.5 - 330})`}>
          <Deep f={f + 200} sx={160} id="sc" back={<g>
            {/* the ship, seen from below */}
            <g transform={`translate(${ax - 200 + 160} 470)`}><ellipse cx={0} cy={-40} rx={560} ry={70} fill="#bfe9ff" opacity={0.12} /><path d="M -380 -60 C -360 40 -300 96 -200 104 L 250 104 C 340 96 400 20 430 -60 Z" fill="#070a22" /><path d="M -360 -40 C -340 30 -290 76 -200 84 L 250 84 C 320 78 370 30 396 -40 Z" fill="#141a4a" /><rect x={-400} y={-70} width={850} height={18} fill="#070a22" /><path d="M -330 60 l -40 26 l 40 26 Z" fill="#070a22" /><circle cx={-352} cy={86} r={30} fill="none" stroke="#5a66c8" strokeWidth={3} opacity={0.4 + 0.3 * Math.sin(t * 30)} />
              {Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={-420 - i * 40 - (t * 200 % 40)} cy={86 + Math.sin(i + t * 9) * 16} r={9 - i} fill="none" stroke="#dff4ff" strokeWidth={2} opacity={0.4} />)}</g>
          </g>}>
            {/* cable: stretched, then two loose ends */}
            {!snapped ? <SeaCable id="sc" t={t} bump={bump} /> : <>
              <SeaCable id="sc" t={t} x1={CX + 160 - gap} bump={recoil(1)} pulseTo={CX + 60 - gap} />
              <SeaCable id="sc" t={t} x0={CX + 200 + gap} live={false} bump={recoil(-1)} />
              {/* frayed ends and escaping light */}
              {[[CX + 160 - gap, 1], [CX + 200 + gap, -1]].map(([x, s], k) => <g key={k} transform={`translate(${x + 160} ${cabY((x as number) + 160) + recoil(s as number)(x as number)})`}>{[-12, -4, 4, 12].map((d, j) => <line key={j} x1={0} y1={d * 0.6} x2={(s as number) * (22 + hash(j + k * 5) * 20)} y2={d * 2.2} stroke={k === 0 ? '#9ff6ff' : '#8a90b8'} strokeWidth={3} strokeLinecap="round" />)}</g>)}
              {Array.from({ length: 18 }).map((_, i) => { const a = hash(i * 3) * Math.PI * 2, d = after * (60 + hash(i * 7) * 240); return <circle key={i} cx={CX + 340 + Math.cos(a) * d} cy={cabY(CX + 340) - 20 + Math.sin(a) * d * 0.8} r={(1 - after) * (4 + hash(i) * 7)} fill={i % 3 ? '#9ff6ff' : '#fff'} />; })}
              <circle cx={CX + 340} cy={cabY(CX + 340) - 10} r={260 * (0.3 + after)} fill="#dffbff" opacity={0.5 * (1 - after)} />
              {[0, 0.5].map((d0) => { const u = (t * 1.4 + d0) % 1; return <circle key={d0} cx={CX + 340} cy={cabY(CX + 340) - 10} r={30 + u * 110} fill="none" stroke="#ff6a6a" strokeWidth={6 * (1 - u) + 1} opacity={(1 - u) * prog(f, SNAP + 0.15, SNAP + 0.4)} />; })}
            </>}
            {/* sand kicked up by the anchor */}
            {Array.from({ length: 14 }).map((_, i) => { const u = (t * 2 + hash(i)) % 1; return <circle key={i} cx={ax + 160 - 40 - u * 160 - hash(i * 3) * 60} cy={cabY(ax + 160) + 60 - u * 70 * hash(i * 5)} r={10 + u * 26} fill="#6a6fd0" opacity={0.25 * (1 - u) * (t < SNAP + 0.3 ? 1 : 0.3)} />; })}
            {/* chain and anchor */}
            {(() => { const X = ax + 160, Y = cabY(X) + 26 - 150 * pull * 0.85 - (snapped ? 20 : 0), topX = X - 40, topY = 570; return <g>
              {Array.from({ length: 30 }).map((_, i) => { const u = i / 29, x = lerp(topX, X, u) + Math.sin(u * 3.1) * -50, y = lerp(topY, Y - 150, u); return <ellipse key={i} cx={x} cy={y} rx={i % 2 ? 7 : 11} ry={i % 2 ? 15 : 13} fill="none" stroke="#8a90b8" strokeWidth={5} transform={`rotate(${Math.atan2(X - topX, Y - 150 - topY) * -57.3} ${x} ${y})`} />; })}
              <g transform={`translate(${X} ${Y}) rotate(${lerp(-24, -8, pull) + (snapped ? 14 * after : 0)})`}>
                <circle cx={0} cy={-160} r={20} fill="none" stroke="#b9bfe0" strokeWidth={9} /><rect x={-9} y={-146} width={18} height={150} rx={6} fill="#8a90b8" /><rect x={-9} y={-146} width={7} height={150} rx={3} fill="#cfd4ee" /><rect x={-56} y={-124} width={112} height={14} rx={7} fill="#6a70a0" />
                <path d="M -96 -44 C -92 16 -40 46 0 46 C 40 46 92 16 96 -44 L 74 -30 C 66 6 34 22 0 22 C -34 22 -66 6 -74 -30 Z" fill="#8a90b8" /><path d="M -96 -44 L -112 -6 L -70 -22 Z M 96 -44 L 112 -6 L 70 -22 Z" fill="#b9bfe0" /><path d="M -90 -36 C -84 10 -40 36 0 38" stroke="#cfd4ee" strokeWidth={5} fill="none" opacity={0.6} /></g></g>; })()}
          </Deep>
        </g>
        <rect width={1080} height={1920} fill="url(#scV)" />
        <rect width={1080} height={1920} fill="#fff" opacity={snapped ? 0.5 * (1 - clamp01((t - SNAP) / 0.18)) : 0} />
      </svg>
    </AbsoluteFill>
  );
};
