import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { StickPose } from './Dusk';

/* Properly designed full-body kids (original designs). Origin = feet centre, about 300 units tall.
   Big readable head, clear face, shaped clothes, thick limbs, shoes, warm rim light for night scenes. */
const K = {
  boy: { skin: '#bd8762', skinSh: '#98643f', hair: '#1d1622', top: '#3fb8a8', topSh: '#2a8d82', bottom: '#27305a', shoe: '#f3f0ea', sole: '#3fb8a8' },
  girl: { skin: '#c9926f', skinSh: '#a3704f', hair: '#1d1622', top: '#b9a2ec', topSh: '#8f78cf', bottom: '#f4e6cf', shoe: '#e8a0b8', sole: '#c97a98' },
};
export const SHOULDER = { x: 30, y: -178 }, UPPER = 46, FORE = 42, TORCH_TIP = 46;
const limb = (x: number, y: number, a: number, l: number) => { const r = a * Math.PI / 180; return [x + Math.sin(r) * l, y + Math.cos(r) * l] as const; };

export const Kid: React.FC<{ kind: 'boy' | 'girl'; p: StickPose; id: string }> = ({ kind, p, id }) => {
  const c = K[kind]; const girl = kind === 'girl';
  const [rex, rey] = limb(SHOULDER.x, SHOULDER.y, p.armR[0], UPPER), [rwx, rwy] = limb(rex, rey, p.armR[1], FORE);
  const [lex, ley] = limb(-SHOULDER.x, SHOULDER.y, p.armL[0], UPPER), [lwx, lwy] = limb(lex, ley, p.armL[1], FORE);
  const eyeRy = 11 * (1 - 0.9 * p.blink), lx = p.look * 4;
  const open = p.smile > 0.6;
  return (
    <g>
      <defs>
        <linearGradient id={`kTop${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={c.topSh} /><stop offset=".35" stopColor={c.top} /><stop offset=".85" stopColor={c.top} /><stop offset="1" stopColor="#ffe1bd" /></linearGradient>
        <radialGradient id={`kFace${id}`} cx=".6" cy=".4" r=".75"><stop offset="0" stopColor={c.skin} /><stop offset=".7" stopColor={c.skin} /><stop offset="1" stopColor={c.skinSh} /></radialGradient>
      </defs>
      <ellipse cx={2} cy={4} rx={46} ry={9} fill="#000" opacity={0.28} />
      {/* legs + shoes */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <line x1={s * 15} y1={girl ? -78 : -104} x2={s * 16} y2={-16} stroke={girl ? c.bottom : c.bottom} strokeWidth={girl ? 17 : 22} strokeLinecap="round" />
          <path d={`M ${s * 16 - 16} -4 Q ${s * 16 - 16} -20 ${s * 16 + 2} -20 Q ${s * 16 + 24} -18 ${s * 16 + 24} -4 Z`} fill={c.shoe} />
          <rect x={s * 16 - 16} y={-6} width={40} height={6} rx={3} fill={c.sole} />
        </g>
      ))}
      {/* back arm */}
      <line x1={-SHOULDER.x} y1={SHOULDER.y} x2={lex} y2={ley} stroke={c.topSh} strokeWidth={20} strokeLinecap="round" />
      <line x1={lex} y1={ley} x2={lwx} y2={lwy} stroke={c.skinSh} strokeWidth={15} strokeLinecap="round" />
      <circle cx={lwx} cy={lwy} r={10} fill={c.skinSh} />
      {/* torso */}
      {girl ? (
        <g>
          <path d="M -30 -188 Q 0 -198 30 -188 L 48 -72 Q 0 -58 -48 -72 Z" fill={`url(#kTop${id})`} />
          <path d="M -48 -72 Q 0 -58 48 -72 L 47 -80 Q 0 -66 -47 -80 Z" fill={c.topSh} />
          <path d="M -30 -188 L -12 -193 L 44 -112 L 36 -94 Z" fill="#f4e6cf" />
          <path d="M -12 -193 Q 0 -180 12 -193" stroke={c.topSh} strokeWidth={5} fill="none" strokeLinecap="round" />
          {[0, 1, 2].map((i) => <circle key={i} cx={0} cy={-170 + i * 14} r={2.4} fill="#f4e6cf" />)}
        </g>
      ) : (
        <g>
          <path d="M -36 -188 Q 0 -198 36 -188 L 40 -104 Q 0 -94 -40 -104 Z" fill={`url(#kTop${id})`} />
          <path d="M -40 -104 Q 0 -94 40 -104 L 40 -114 Q 0 -104 -40 -114 Z" fill={c.topSh} />
          <path d="M -16 -192 Q 0 -176 16 -192" stroke={c.topSh} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M -6 -180 L -6 -160 M 6 -180 L 6 -160" stroke="#eafff9" strokeWidth={2.5} strokeLinecap="round" />
          <path d="M -18 -136 Q 0 -128 18 -136 L 18 -120 Q 0 -112 -18 -120 Z" fill={c.topSh} opacity={0.6} />
        </g>
      )}
      {/* neck + head */}
      <rect x={-9} y={-204} width={18} height={20} rx={6} fill={c.skinSh} />
      <g transform={`translate(0 -242) rotate(${p.tilt || 0})`}>
        {girl && <><circle cx={-4} cy={-52} r={21} fill={c.hair} /><ellipse cx={-4} cy={-34} rx={14} ry={5} fill="#e8a0b8" /><path d="M -40 -6 Q -66 34 -50 84 Q -44 94 -38 84 Q -50 40 -28 6 Z" fill={c.hair} /><circle cx={-45} cy={80} r={6} fill="#e8a0b8" /></>}
        <circle cx={-45} cy={6} r={9} fill={c.skinSh} /><circle cx={45} cy={6} r={9} fill={c.skinSh} />
        <ellipse cx={0} cy={0} rx={46} ry={48} fill={`url(#kFace${id})`} />
        {girl
          ? <path d="M -48 14 C -56 -44 -24 -66 2 -64 C 38 -64 58 -40 48 12 C 44 -12 34 -28 20 -32 C 6 -24 -14 -24 -28 -36 C -38 -26 -44 -10 -48 14 Z" fill={c.hair} />
          : <path d="M -47 -2 C -54 -52 -22 -66 2 -64 C 36 -64 54 -42 47 -4 C 42 -24 32 -32 16 -30 C 22 -40 10 -44 4 -38 C -6 -48 -24 -42 -26 -30 C -36 -28 -43 -18 -47 -2 Z" fill={c.hair} />}
        <path d="M -30 -50 Q -8 -62 16 -56" stroke="#fff" strokeOpacity={0.14} strokeWidth={5} fill="none" strokeLinecap="round" />
        {/* warm rim light on the lit side, cool moonlight on the other */}
        <path d="M 26 -40 A 47 49 0 0 1 40 26" stroke="#ffdcae" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.9} />
        <path d="M -40 -26 A 47 49 0 0 0 -42 22" stroke="#9fb4ff" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.5} />
        {/* face */}
        {[-17, 17].map((ex) => (
          <g key={ex}>
            <path d={`M ${ex - 10 + lx} ${-20 - p.smile * 2} Q ${ex + lx} ${-26 - p.smile * 3} ${ex + 10 + lx} ${-20 - p.smile * 2}`} stroke={c.hair} strokeWidth={4} fill="none" strokeLinecap="round" />
            <ellipse cx={ex + lx} cy={-2} rx={9.5} ry={eyeRy} fill="#fffaf2" />
            {p.blink < 0.6 && <><circle cx={ex + lx * 1.8} cy={-1} r={5.8} fill="#2a1c1a" /><circle cx={ex + lx * 1.8 + 2} cy={-4} r={2} fill="#fff" /></>}
          </g>
        ))}
        <path d={`M ${lx - 2} 8 Q ${lx + 2} 13 ${lx + 5} 9`} stroke={c.skinSh} strokeWidth={3} fill="none" strokeLinecap="round" />
        <ellipse cx={-28} cy={14} rx={8} ry={5} fill="#ea7f72" opacity={0.35} /><ellipse cx={28} cy={14} rx={8} ry={5} fill="#ea7f72" opacity={0.35} />
        {open
          ? <><path d={`M ${lx - 15} 18 Q ${lx} ${24 + p.smile * 16} ${lx + 15} 18 Z`} fill="#6b2a2a" /><path d={`M ${lx - 11} 19 Q ${lx} 23 ${lx + 11} 19 L ${lx + 10} 21 Q ${lx} 26 ${lx - 10} 21 Z`} fill="#fff" /></>
          : <path d={`M ${lx - 11} ${20 - p.smile * 3} Q ${lx} ${24 + p.smile * 8} ${lx + 11} ${20 - p.smile * 3}`} stroke="#5a2424" strokeWidth={3.4} fill="none" strokeLinecap="round" />}
        {girl && <><circle cx={lx} cy={-16} r={2.2} fill="#d0334c" /><circle cx={-45} cy={18} r={3.4} fill="#ffd36b" /><circle cx={45} cy={18} r={3.4} fill="#ffd36b" /></>}
      </g>
      {/* front arm + torch */}
      <line x1={SHOULDER.x} y1={SHOULDER.y} x2={rex} y2={rey} stroke={c.top} strokeWidth={20} strokeLinecap="round" />
      <line x1={rex} y1={rey} x2={rwx} y2={rwy} stroke={c.skin} strokeWidth={15} strokeLinecap="round" />
      {p.holdTorch && (
        <g transform={`translate(${rwx} ${rwy}) rotate(${90 - p.armR[1]})`}>
          <rect x={-10} y={-7} width={38} height={14} rx={5} fill="#2b2e3a" />{[0, 7, 14].map((x) => <rect key={x} x={-4 + x} y={-7} width={2.5} height={14} fill="#12141b" />)}
          <path d="M 26 -7 L 40 -12 L 44 -12 L 44 12 L 40 12 L 26 7 Z" fill="#c8553a" /><rect x={43} y={-13} width={4} height={26} rx={2} fill="#d9d6cf" />
          <ellipse cx={TORCH_TIP} cy={0} rx={3} ry={10} fill={(p.torch || 0) > 0.05 ? '#fff8e0' : '#3a3d48'} />
        </g>
      )}
      <circle cx={rwx} cy={rwy} r={10} fill={c.skin} />
    </g>
  );
};

/* character sheet for approval */
export const KidSheet: React.FC = () => {
  const boy: StickPose = { blink: 0, smile: 0.9, look: 0.6, armR: [98, 106], armL: [-12, -8], holdTorch: true, torch: 1, tilt: -3 };
  const girl: StickPose = { blink: 0, smile: 1, look: -0.6, armR: [150, 172], armL: [-10, -6], tilt: 4 };
  const idle: StickPose = { blink: 0, smile: 0.4, look: 0, armR: [10, 6], armL: [-10, -6] };
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(#0b1030,#1b2150)' }}>
      <svg width={1080} height={1920}>
        <g transform="translate(290 900) scale(2.3)"><Kid kind="boy" p={boy} id="b1" /></g>
        <g transform="translate(800 900) scale(-2.3 2.3)"><Kid kind="girl" p={girl} id="g1" /></g>
        <g transform="translate(290 1720) scale(2.3)"><Kid kind="boy" p={idle} id="b2" /></g>
        <g transform="translate(800 1720) scale(2.3)"><Kid kind="girl" p={{ ...idle, blink: 1, tilt: 12 }} id="g2" /></g>
      </svg>
    </AbsoluteFill>
  );
};
