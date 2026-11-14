import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FPS, hash, prog, pulse, keys, lerp, easeOut } from '../lib/anim';
import { DUSK, Stick, StickPose, Tree, Bush, Lamp } from './Dusk';

/* A street of individual homes in the dusk style: a row of houses across the street (the girl's
   terrace), the boy's house in front. Soft rounded shapes, pill windows, flat-roof terraces with
   parapets and water tanks, arched roofs, little gates and hedges. */
const HC = ['#b89cae', '#c4a6a8', '#a993b0', '#cdb0a2', '#b4a0bc', '#c9aeb6'];
const ROOF = ['#7d6680', '#8a6d78', '#715f86', '#8f7068'];

export const House: React.FC<{ x: number; y: number; w: number; h: number; c: string; roof: 'arch' | 'flat' | 'gable'; rc: string; seed: number; terrace?: boolean; door?: 'l' | 'c' | 'r' }> =
  ({ x, y, w, h, c, roof, rc, seed, terrace = false, door = 'c' }) => {
    const top = y - h; const floors = h > 300 ? 2 : 1; const fh = h / floors;
    const dx = door === 'l' ? x + w * 0.22 : door === 'r' ? x + w * 0.78 : x + w / 2;
    return (
      <g>
        {/* roof */}
        {roof === 'arch' && <path d={`M ${x - 10} ${top + 10} Q ${x + w / 2} ${top - w * 0.42} ${x + w + 10} ${top + 10} Z`} fill={rc} />}
        {roof === 'gable' && <path d={`M ${x - 18} ${top + 14} L ${x + w / 2} ${top - w * 0.32} L ${x + w + 18} ${top + 14} Q ${x + w / 2} ${top + 4} ${x - 18} ${top + 14} Z`} fill={rc} strokeLinejoin="round" />}
        {roof === 'flat' && (
          <g>
            <rect x={x + w * 0.62} y={top - 64} width={w * 0.24} height={56} rx={14} fill="#3b3346" />
            <rect x={x + w * 0.6} y={top - 70} width={w * 0.28} height={10} rx={5} fill="#4a4156" />
          </g>
        )}
        <rect x={x} y={top} width={w} height={h} rx={roof === 'flat' ? 14 : 8} fill={c} />
        {roof === 'flat' && <rect x={x - 8} y={top - 14} width={w + 16} height={22} rx={10} fill={c} />}
        {roof === 'flat' && <rect x={x - 8} y={top - 14} width={w + 16} height={8} rx={4} fill="#ffffff" opacity={0.18} />}
        {/* floor band */}
        {floors === 2 && <rect x={x - 6} y={top + fh - 6} width={w + 12} height={12} rx={6} fill="#000" opacity={0.1} />}
        {/* pill windows, warm when lit */}
        {Array.from({ length: floors }).map((_, fl) => {
          const n = w > 260 ? 3 : 2; const yy = top + fl * fh + fh * 0.22;
          return Array.from({ length: n }).map((__, i) => {
            const wx = x + w * (0.16 + i * (0.68 / (n - 1 || 1))) - 22; const lit = hash(seed * 17 + fl * 5 + i) < 0.55;
            if (fl === floors - 1 && Math.abs(wx + 22 - dx) < 46) return null;
            return (
              <g key={`${fl}${i}`}>
                <rect x={wx} y={yy} width={44} height={fh * 0.44} rx={22} fill={lit ? DUSK.stripeLit : '#6e5c78'} />
                {lit && <rect x={wx} y={yy} width={44} height={fh * 0.44} rx={22} fill="url(#winWarm)" />}
                {lit && <rect x={wx + 20} y={yy} width={4} height={fh * 0.44} fill="#ffffff" opacity={0.25} />}
              </g>
            );
          });
        })}
        {/* arched door with a little lamp */}
        <rect x={dx - 26} y={y - fh * 0.55} width={52} height={fh * 0.55} rx={26} fill="#5c4a62" />
        <rect x={dx - 26} y={y - fh * 0.55} width={52} height={fh * 0.55} rx={26} fill="none" stroke="#ffffff" strokeOpacity={0.15} strokeWidth={3} />
        <circle cx={dx + 40} cy={y - fh * 0.52} r={7} fill={DUSK.lamp} />
        <circle cx={dx + 40} cy={y - fh * 0.52} r={40} fill="url(#lampHalo)" opacity={0.7} />
        <rect x={dx - 36} y={y - 6} width={72} height={10} rx={5} fill="#000" opacity={0.15} />
        {/* first-floor terrace with a railing */}
        {terrace && floors === 2 && (
          <g>
            <rect x={x + w * 0.18} y={top + fh - 4} width={w * 0.64} height={14} rx={7} fill="#3b3346" />
          </g>
        )}
      </g>
    );
  };
const Railing: React.FC<{ x: number; y: number; w: number; s?: number }> = ({ x, y, w, s = 1 }) => (
  <g>
    <rect x={x} y={y - 54 * s} width={w} height={6 * s} rx={3 * s} fill={DUSK.ink} />
    {Array.from({ length: Math.floor(w / (24 * s)) + 1 }).map((_, i) => <rect key={i} x={x + 2 + i * 24 * s} y={y - 50 * s} width={4 * s} height={50 * s} fill={DUSK.ink} opacity={0.85} />)}
  </g>
);
const Fence: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <g opacity={0.8}>{Array.from({ length: Math.floor(w / 22) }).map((_, i) => <rect key={i} x={x + i * 22} y={y - 34} width={10} height={34} rx={5} fill="#e8d6dc" opacity={0.55} />)}<rect x={x} y={y - 22} width={w - 12} height={5} fill="#e8d6dc" opacity={0.5} /></g>
);

export const DuskHouses: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const raise = keys(f, [[0.2, 0], [0.4, -0.1], [0.9, 1]], easeOut);
  const on = Math.max(pulse(f, 1.0, 1.25), pulse(f, 1.45, 1.7), pulse(f, 2.0, 9));
  const notice = prog(f, 1.3, 1.6, easeOut), wave = prog(f, 2.4, 2.7) * (1 - prog(f, 3.8, 4.1));
  const boy: StickPose = { blink: Math.max(0, 1 - Math.abs(t - 2.9) / 0.07), smile: 0.4 + 0.5 * prog(f, 2.2, 2.6), look: 0.8, armR: [lerp(10, 112, raise), lerp(4, 122, raise)], armL: [-12, -8], holdTorch: true, torch: on, tilt: -4 * raise };
  const girl: StickPose = { blink: Math.max(0, 1 - Math.abs(t - 0.6) / 0.07), smile: lerp(0.2, 1, notice), look: -lerp(0.2, 0.9, notice), armR: [lerp(10, 150, wave), lerp(6, 168, wave) + Math.sin(t * 11) * 14 * wave], armL: [-10, -6], tilt: 4 * notice };
  const cam = { x: keys(f, [[0, 10], [4, -20]]), z: keys(f, [[0, 1], [4, 1.05]]) };
  const P = (d: number) => `translate(${540 + cam.x * d} 960) scale(${1 + (cam.z - 1) * d}) translate(-540 -960)`;
  // across the street: the girl on her first-floor terrace (smaller, farther); in front: the boy on his roof terrace
  const STREET = 1250, GH = { x: 610, w: 300, h: 420 }, GT = STREET - 210;
  const BY = 1660, BX = 250, BS = 1.1, GX = GH.x + GH.w / 2 + 10, GS = 0.62;
  const lm = (x: number, y: number, a: number, l: number) => { const r = a * Math.PI / 180; return [x + Math.sin(r) * l, y + Math.cos(r) * l]; };
  const [ex, ey] = lm(16, -224, boy.armR[0], 62); const [wx, wy] = lm(ex, ey, boy.armR[1], 58); const tr = (90 - boy.armR[1]) * Math.PI / 180;
  const lens = { x: BX + (wx + Math.cos(tr) * 42) * BS, y: BY + (wy + Math.sin(tr) * 42) * BS };
  const tgt = { x: GX - 6, y: GT - 168 * GS };
  const ang = Math.atan2(tgt.y - lens.y, tgt.x - lens.x) * 180 / Math.PI, len = Math.hypot(tgt.x - lens.x, tgt.y - lens.y);
  const back = [
    { x: -120, w: 250, h: 260, roof: 'arch' as const }, { x: 150, w: 210, h: 300, roof: 'gable' as const }, { x: 380, w: 210, h: 250, roof: 'flat' as const },
    { x: GH.x, w: GH.w, h: GH.h, roof: 'flat' as const, terrace: true }, { x: 930, w: 240, h: 300, roof: 'arch' as const },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: DUSK.skyTop }}>
      <svg width={1080} height={1920}>
        <defs>
          <linearGradient id="hSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={DUSK.skyTop} /><stop offset=".42" stopColor={DUSK.skyMid} /><stop offset=".62" stopColor={DUSK.skyLow} /><stop offset=".7" stopColor={DUSK.horizon} /></linearGradient>
          <radialGradient id="hSun" cx="300" cy="930" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff6ea" stopOpacity=".95" /><stop offset=".1" stopColor="#ffe8d4" stopOpacity=".7" /><stop offset="1" stopColor="#ffd8c0" stopOpacity="0" /></radialGradient>
          <radialGradient id="lampHalo"><stop offset="0" stopColor="#fff3d6" stopOpacity=".7" /><stop offset="1" stopColor="#ffd9a0" stopOpacity="0" /></radialGradient>
          <linearGradient id="winWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff4dc" stopOpacity=".6" /><stop offset="1" stopColor="#ffb870" stopOpacity=".2" /></linearGradient>
          <linearGradient id="hHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={DUSK.horizon} stopOpacity="0" /><stop offset="1" stopColor={DUSK.horizon} stopOpacity=".7" /></linearGradient>
          <linearGradient id="hBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fffaea" stopOpacity=".95" /><stop offset="1" stopColor="#ffe2b0" stopOpacity=".1" /></linearGradient>
          <linearGradient id="hRoad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9a828e" /><stop offset="1" stopColor="#6f5d6a" /></linearGradient>
          <filter id="hB1"><feGaussianBlur stdDeviation="3" /></filter><filter id="hB2"><feGaussianBlur stdDeviation="10" /></filter><filter id="hB3"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        <rect width={1080} height={1920} fill="url(#hSky)" />
        <rect width={1080} height={1920} fill="url(#hSun)" />
        <g transform="translate(860 290)"><circle r={44} fill="#fbe7d6" opacity={0.9} /><circle cx={18} cy={-12} r={42} fill={DUSK.skyTop} opacity={0.88} /></g>
        {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={hash(i) * 1080} cy={hash(i + 9) * 520} r={hash(i + 3) * 1.6 + 0.5} fill="#fff" opacity={0.4 * hash(i + 5)} />)}
        <g filter="url(#hB2)" opacity={0.5}>{[[200, 520, 300], [760, 640, 260], [460, 760, 340]].map(([x, y, w], i) => <ellipse key={i} cx={x} cy={y} rx={w} ry={18} fill="#e9c3c0" />)}</g>
        {/* far: soft hills with tiny houses and trees in the haze */}
        <g transform={P(0.15)} filter="url(#hB1)">
          <path d="M -100 1060 Q 200 940 460 1010 Q 720 1080 920 960 Q 1060 900 1200 980 L 1200 1300 L -100 1300 Z" fill="#9f8399" opacity={0.75} />
          {Array.from({ length: 16 }).map((_, i) => { const x = -40 + i * 75, y = 1030 + Math.sin(i * 1.3) * 40; return <g key={i}><rect x={x} y={y - 26} width={34} height={28} rx={6} fill="#8e7690" /><path d={`M ${x - 4} ${y - 24} L ${x + 17} ${y - 44} L ${x + 38} ${y - 24} Z`} fill="#82698a" />{hash(i) < 0.5 && <rect x={x + 12} y={y - 18} width={10} height={10} rx={3} fill={DUSK.stripeLit} opacity={0.8} />}</g>; })}
          {Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={20 + i * 115} cy={1060 + Math.cos(i) * 30} r={30} fill="#7d8a7e" opacity={0.7} />)}
        </g>
        <rect width={1080} height={1920} fill="url(#hHaze)" opacity={0.75} />
        {/* across the street: a line of individual homes */}
        <g transform={P(0.5)}>
          {[60, 330, 880].map((x, i) => <Tree key={i} x={x} y={STREET - 30} r={70} f={f} seed={i} />)}
          {back.map((b, i) => <House key={i} x={b.x} y={STREET} w={b.w} h={b.h} c={HC[i % HC.length]} roof={b.roof} rc={ROOF[i % ROOF.length]} seed={i + 1} terrace={b.terrace} door={i % 2 ? 'l' : 'c'} />)}
          {[[-120, 250], [150, 210], [380, 210], [930, 240]].map(([x, w], i) => <Fence key={i} x={x + 10} y={STREET} w={w - 20} />)}
          {/* the girl on her terrace */}
          <g transform={`translate(${GX} ${GT}) scale(${-GS} ${GS})`}><Stick hair="pony" outfit="kurta" col={DUSK.lav} p={girl} id="g" /></g>
          <Railing x={GH.x + GH.w * 0.18} y={GT} w={GH.w * 0.64} s={0.75} />
          {[240, 600, 1020].map((x, i) => <Lamp key={i} x={x} y={STREET + 30} h={230} f={f} seed={i} />)}
        </g>
        {/* the street */}
        <g transform={P(0.75)}>
          <rect x={-200} y={STREET + 10} width={1500} height={1000} fill="url(#hRoad)" />
          <rect x={-200} y={STREET + 10} width={1500} height={22} fill="#b39aa6" />
          {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={-60 + i * 150} y={STREET + 190} width={80} height={8} rx={4} fill="#efe1e6" opacity={0.45} />)}
          <ellipse cx={600} cy={STREET + 120} rx={240} ry={40} fill="#ffd9a0" opacity={0.12} />
        </g>
        {/* in front: the boy on his roof terrace, a neighbour's house and hedges */}
        <g transform={P(1)}>
          <House x={-40} y={2100} w={560} h={440} c="#c3a5b3" roof="flat" rc="#8a6d78" seed={9} door="r" />
          <House x={640} y={2160} w={480} h={360} c="#b29abb" roof="arch" rc="#715f86" seed={11} door="l" />
          <Bush x={600} y={2010} s={1.3} />
          <g transform={`translate(${BX} ${BY}) scale(${BS})`}><Stick hair="short" outfit="tee" col={DUSK.teal} p={boy} id="b" /></g>
          <Railing x={-30} y={BY + 4} w={540} s={1.1} />
          {on > 0.01 && (
            <g transform={`translate(${lens.x} ${lens.y}) rotate(${ang})`}>
              <path d={`M 0 -6 L ${len} -38 L ${len} 38 L 0 6 Z`} fill="url(#hBeam)" opacity={0.7 * on} filter="url(#hB2)" />
              <path d={`M 0 -2 L ${len} -12 L ${len} 12 L 0 2 Z`} fill="url(#hBeam)" opacity={0.85 * on} />
              <circle cx={0} cy={0} r={24} fill="#fff6dc" opacity={on} filter="url(#hB2)" />
              <circle cx={len} cy={0} r={40} fill="#fff1d0" opacity={0.35 * on} filter="url(#hB2)" />
            </g>
          )}
        </g>
        {/* out-of-focus foreground leaves for depth */}
        <g filter="url(#hB3)" opacity={0.9}>
          {[[-30, 1880, 90], [60, 1820, 70], [1080, 1860, 100], [1010, 1800, 70]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={DUSK.treeDark} />)}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
