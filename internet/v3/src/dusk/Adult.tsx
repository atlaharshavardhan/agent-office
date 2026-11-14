import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { StickPose } from './Dusk';

/* College-age couple (original designs). Origin = feet centre, about 335 units tall, adult proportions:
   smaller head, longer legs, shaped clothes. Same pose interface as the earlier rigs. */
const C = {
  man: { skin: '#bd8762', skinSh: '#98643f', hair: '#1b1520', top: '#2f9c95', topSh: '#22756f', inner: '#f3e9d6', bottom: '#2b3a6b', shoe: '#f3f0ea', sole: '#2f9c95' },
  woman: { skin: '#c9926f', skinSh: '#a3704f', hair: '#1b1520', top: '#b9a2ec', topSh: '#8f78cf', inner: '#f4e6cf', bottom: '#f4e6cf', shoe: '#e8a0b8', sole: '#c97a98' },
};
export const A_SHOULDER = { x: 34, y: -240 }, A_UPPER = 56, A_FORE = 50, A_TIP = 46;
const limb = (x: number, y: number, a: number, l: number) => { const r = a * Math.PI / 180; return [x + Math.sin(r) * l, y + Math.cos(r) * l] as const; };

export const Adult: React.FC<{ kind: 'man' | 'woman'; p: StickPose; id: string }> = ({ kind, p, id }) => {
  const c = C[kind]; const w = kind === 'woman'; const sx = w ? 28 : 36, aw = w ? 15 : 19, fw = w ? 12 : 15;
  const [rex, rey] = limb(sx - 2, A_SHOULDER.y, p.armR[0], A_UPPER), [rwx, rwy] = limb(rex, rey, p.armR[1], A_FORE);
  const [lex, ley] = limb(-sx + 2, A_SHOULDER.y, p.armL[0], A_UPPER), [lwx, lwy] = limb(lex, ley, p.armL[1], A_FORE);
  const eyeRy = 7.5 * (1 - 0.9 * p.blink), lx = p.look * 3; const open = p.smile > 0.6;
  return (
    <g>
      <defs>
        <linearGradient id={`aTop${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={c.topSh} /><stop offset=".35" stopColor={c.top} /><stop offset=".88" stopColor={c.top} /><stop offset="1" stopColor="#ffe1bd" /></linearGradient>
        <radialGradient id={`aFace${id}`} cx=".6" cy=".4" r=".75"><stop offset="0" stopColor={c.skin} /><stop offset=".7" stopColor={c.skin} /><stop offset="1" stopColor={c.skinSh} /></radialGradient>
      </defs>
      <ellipse cx={2} cy={4} rx={44} ry={8} fill="#000" opacity={0.28} />
      {/* legs + shoes */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <line x1={s * 13} y1={w ? -92 : -152} x2={s * 15} y2={-16} stroke={c.bottom} strokeWidth={w ? 15 : 21} strokeLinecap="round" />
          <path d={`M ${s * 15 - 14} -4 Q ${s * 15 - 14} -18 ${s * 15 + 2} -18 Q ${s * 15 + 24} -16 ${s * 15 + 24} -4 Z`} fill={c.shoe} />
          <rect x={s * 15 - 14} y={-6} width={38} height={6} rx={3} fill={c.sole} />
        </g>
      ))}
      {/* back arm */}
      <line x1={-sx + 2} y1={A_SHOULDER.y} x2={lex} y2={ley} stroke={c.topSh} strokeWidth={aw} strokeLinecap="round" />
      <line x1={lex} y1={ley} x2={lwx} y2={lwy} stroke={w ? c.skinSh : c.topSh} strokeWidth={fw} strokeLinecap="round" />
      <circle cx={lwx} cy={lwy} r={8.5} fill={c.skinSh} />
      {/* torso */}
      {w ? (
        <g>
          <path d="M -28 -252 Q 0 -260 28 -252 L 22 -196 L 42 -84 Q 0 -72 -42 -84 L -22 -196 Z" fill={`url(#aTop${id})`} />
          <path d="M -42 -84 Q 0 -72 42 -84 L 40 -93 Q 0 -81 -40 -93 Z" fill={c.topSh} />
          <path d="M -10 -256 Q 0 -238 10 -256" stroke={c.topSh} strokeWidth={5} fill="none" strokeLinecap="round" />
          {[0, 1, 2].map((i) => <circle key={i} cx={0} cy={-232 + i * 13} r={2.2} fill={c.inner} />)}
          {/* dupatta over the shoulder */}
          <path d="M -28 -252 L -12 -257 L 34 -150 L 24 -134 Z" fill={c.inner} />
          <path d="M -28 -252 Q -40 -200 -36 -120 L -24 -122 Q -26 -200 -14 -250 Z" fill={c.inner} opacity={0.95} />
        </g>
      ) : (
        <g>
          <path d="M -38 -252 Q 0 -262 38 -252 L 36 -150 Q 0 -142 -36 -150 Z" fill={`url(#aTop${id})`} />
          <path d="M -13 -256 L 13 -256 L 10 -146 Q 0 -143 -10 -146 Z" fill={c.inner} />
          <path d="M -13 -256 L -22 -236 L -11 -150 M 13 -256 L 22 -236 L 11 -150" stroke={c.topSh} strokeWidth={4} fill="none" strokeLinejoin="round" />
          <path d="M -36 -150 Q 0 -142 36 -150 L 36 -160 Q 0 -152 -36 -160 Z" fill={c.topSh} />
          <path d="M -9 -256 Q 0 -246 9 -256" stroke="#d9cdb6" strokeWidth={4} fill="none" strokeLinecap="round" />
          <rect x={-30} y={-152} width={60} height={8} fill="#1d2748" />
        </g>
      )}
      {/* long hair falls behind her shoulders */}
      {w && <path d="M -36 -306 C -52 -262 -46 -214 -38 -196 L -18 -200 C -24 -232 -22 -262 -16 -290 Z M 36 -306 C 54 -262 50 -206 40 -186 L 20 -192 C 28 -232 24 -262 16 -290 Z" fill={c.hair} />}
      {/* neck + head */}
      <rect x={-8} y={-266} width={16} height={18} rx={5} fill={c.skinSh} />
      <g transform={`translate(0 -296) rotate(${p.tilt || 0})`}>
        <circle cx={-33} cy={4} r={6.5} fill={c.skinSh} /><circle cx={33} cy={4} r={6.5} fill={c.skinSh} />
        <ellipse cx={0} cy={0} rx={33} ry={37} fill={`url(#aFace${id})`} />
        {!w && <path d="M -30 12 Q -24 36 0 37 Q 24 36 30 12 Q 22 28 0 29 Q -22 28 -30 12 Z" fill="#3a2a26" opacity={0.22} />}
        {w
          ? <path d="M -36 20 C -44 -34 -20 -52 2 -50 C 28 -50 44 -32 36 20 C 34 -6 28 -22 14 -28 C 0 -14 -18 -10 -30 -12 C -34 -2 -36 8 -36 20 Z" fill={c.hair} />
          : <path d="M -34 -2 C -40 -30 -34 -46 -14 -50 C 6 -58 36 -50 35 -10 C 30 -24 24 -30 12 -30 C -4 -28 -20 -30 -26 -24 C -30 -18 -32 -10 -34 -2 Z" fill={c.hair} />}
        <path d="M -20 -40 Q -4 -50 14 -44" stroke="#fff" strokeOpacity={0.14} strokeWidth={4} fill="none" strokeLinecap="round" />
        {[-12.5, 12.5].map((ex) => (
          <g key={ex}>
            <path d={`M ${ex - 8 + lx} ${-15 - p.smile * 1.5} Q ${ex + lx} ${-19 - p.smile * 2} ${ex + 8 + lx} ${-15 - p.smile * 1.5}`} stroke={c.hair} strokeWidth={w ? 2.6 : 3.6} fill="none" strokeLinecap="round" />
            <ellipse cx={ex + lx} cy={-3} rx={6.5} ry={eyeRy} fill="#fffaf2" />
            {p.blink < 0.6 && <><circle cx={ex + lx * 1.7} cy={-2.5} r={4.2} fill="#2a1c1a" /><circle cx={ex + lx * 1.7 + 1.4} cy={-4.5} r={1.4} fill="#fff" /></>}
            {w && p.blink < 0.6 && <path d={`M ${ex - 7 + lx} -7 Q ${ex + lx} -12 ${ex + 8 + lx} -8`} stroke="#1b1520" strokeWidth={2} fill="none" strokeLinecap="round" />}
          </g>
        ))}
        <path d={`M ${lx - 1.5} 5 Q ${lx + 2} 10 ${lx + 4.5} 6`} stroke={c.skinSh} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        <ellipse cx={-21} cy={11} rx={6} ry={3.6} fill="#ea7f72" opacity={0.3} /><ellipse cx={21} cy={11} rx={6} ry={3.6} fill="#ea7f72" opacity={0.3} />
        {open
          ? <><path d={`M ${lx - 11} 15 Q ${lx} ${19 + p.smile * 11} ${lx + 11} 15 Z`} fill={w ? '#8a2f3c' : '#6b2a2a'} /><path d={`M ${lx - 8} 16 Q ${lx} 19 ${lx + 8} 16 L ${lx + 7} 18 Q ${lx} 21 ${lx - 7} 18 Z`} fill="#fff" /></>
          : <path d={`M ${lx - 8} ${17 - p.smile * 2} Q ${lx} ${20 + p.smile * 6} ${lx + 8} ${17 - p.smile * 2}`} stroke={w ? '#8a2f3c' : '#5a2424'} strokeWidth={3} fill="none" strokeLinecap="round" />}
        {w && <><circle cx={lx} cy={-13} r={1.9} fill="#d0334c" /><circle cx={-33} cy={15} r={3} fill="#ffd36b" /><circle cx={-33} cy={21} r={2} fill="#ffd36b" /><circle cx={33} cy={15} r={3} fill="#ffd36b" /><circle cx={33} cy={21} r={2} fill="#ffd36b" /></>}
      </g>
      {/* front arm + torch */}
      <line x1={sx - 2} y1={A_SHOULDER.y} x2={rex} y2={rey} stroke={c.top} strokeWidth={aw} strokeLinecap="round" />
      <line x1={rex} y1={rey} x2={rwx} y2={rwy} stroke={w ? c.skin : c.top} strokeWidth={fw} strokeLinecap="round" />
      {p.holdTorch && (
        <g transform={`translate(${rwx} ${rwy}) rotate(${90 - p.armR[1]})`}>
          <rect x={-10} y={-7} width={38} height={14} rx={5} fill="#2b2e3a" />{[0, 7, 14].map((x) => <rect key={x} x={-4 + x} y={-7} width={2.5} height={14} fill="#12141b" />)}
          <path d="M 26 -7 L 40 -12 L 44 -12 L 44 12 L 40 12 L 26 7 Z" fill="#c8553a" /><rect x={43} y={-13} width={4} height={26} rx={2} fill="#d9d6cf" />
          <ellipse cx={A_TIP} cy={0} rx={3} ry={10} fill={(p.torch || 0) > 0.05 ? '#fff8e0' : '#3a3d48'} />
        </g>
      )}
      <circle cx={rwx} cy={rwy} r={8.5} fill={c.skin} />
    </g>
  );
};
export const Heart: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M 0 8 C -14 -4 -8 -16 0 -8 C 8 -16 14 -4 0 8 Z" fill="#ff6f91" opacity={o} />
);

export const AdultSheet: React.FC = () => {
  const man: StickPose = { blink: 0, smile: 0.9, look: 0.6, armR: [98, 106], armL: [-10, -6], holdTorch: true, torch: 1, tilt: -3 };
  const woman: StickPose = { blink: 0, smile: 1, look: -0.6, armR: [150, 172], armL: [-10, -6], tilt: 4 };
  const idle: StickPose = { blink: 0, smile: 0.4, look: 0, armR: [8, 5], armL: [-8, -5] };
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(#0b1030,#1b2150)' }}>
      <svg width={1080} height={1920}>
        <g transform="translate(280 930) scale(2.2)"><Adult kind="man" p={man} id="m1" /></g>
        <g transform="translate(810 930) scale(-2.2 2.2)"><Adult kind="woman" p={woman} id="w1" /></g>
        <Heart x={545} y={250} s={3.2} /><Heart x={600} y={190} s={2} o={0.7} />
        <g transform="translate(280 1790) scale(2.2)"><Adult kind="man" p={idle} id="m2" /></g>
        <g transform="translate(810 1790) scale(2.2)"><Adult kind="woman" p={{ ...idle, blink: 1, tilt: 12 }} id="w2" /></g>
      </svg>
    </AbsoluteFill>
  );
};
