import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { FPS, prog, lerp, easeOut, easeInOut } from '../lib/anim';
import { FONT } from '../lib/palette';
import { Planet } from './Planet';

/* Part 2 hook, globe part (9:16 only): "Does a satellite carry it?" A satellite flies in with a question mark, then fades behind a red cross,
   and the cables under the sea light up. Uses the Planet globe from its late frames (whole Earth, cables lit). */
export const HOOK_GLOBE_FRAMES = 150;
const Sat: React.FC<{ x: number; y: number; s: number; rot: number }> = ({ x, y, s, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-92} y={-16} width={64} height={32} rx={3} fill="#2a4fb8" stroke="#9fc0ff" strokeWidth={3} />{[-76, -60, -44].map((px) => <line key={px} x1={px} y1={-16} x2={px} y2={16} stroke="#9fc0ff" strokeWidth={1.5} />)}
    <rect x={28} y={-16} width={64} height={32} rx={3} fill="#2a4fb8" stroke="#9fc0ff" strokeWidth={3} />{[44, 60, 76].map((px) => <line key={px} x1={px} y1={-16} x2={px} y2={16} stroke="#9fc0ff" strokeWidth={1.5} />)}
    <rect x={-28} y={-26} width={56} height={52} rx={8} fill="#cfd6ec" stroke="#fff" strokeWidth={3} /><circle cx={0} cy={0} r={12} fill="#5fe3ff" /><line x1={0} y1={-26} x2={0} y2={-46} stroke="#fff" strokeWidth={3} /><circle cx={0} cy={-50} r={5} fill="#ffd38a" />
  </g>);
export const HookGlobe: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const q = prog(f, 0.2, 0.7, easeOut), satIn = prog(f, 0.2, 1.4, easeOut), no = prog(f, 2.2, 2.6, easeOut), cab = prog(f, 2.8, 3.4, easeOut);
  const sx = lerp(1000, 760, satIn), sy = lerp(380, 520, satIn) + Math.sin(t * 2) * 6;
  const chip = (txt: string, o: number, col: string, top: number) => <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', opacity: o }}><div style={{ padding: '14px 34px', borderRadius: 32, background: 'rgba(10,14,36,.9)', border: `3px solid ${col}`, font: `800 42px/1 ${FONT.ui}`, color: '#fff', whiteSpace: 'nowrap' }}>{txt}</div></div>;
  return (
    <AbsoluteFill style={{ backgroundColor: '#03041a' }}>
      <Sequence from={-216}><Planet /></Sequence>
      <AbsoluteFill><svg width={1080} height={1920}>
        <g opacity={(1 - no * 0.65)}><Sat x={sx} y={sy} s={1.1} rot={-18} /></g>
        <g opacity={q * (1 - no)} transform={`translate(${sx - 150} ${sy - 80})`}><circle r={46} fill="#ffd38a" /><text y={20} textAnchor="middle" fill="#07102c" style={{ font: `900 64px ${FONT.ui}` }}>?</text></g>
        <g opacity={no}><line x1={sx - 130} y1={sy - 90} x2={sx + 130} y2={sy + 90} stroke="#ff5a5a" strokeWidth={16} strokeLinecap="round" /><line x1={sx + 130} y1={sy - 90} x2={sx - 130} y2={sy + 90} stroke="#ff5a5a" strokeWidth={16} strokeLinecap="round" /></g>
      </svg></AbsoluteFill>
      {chip('A satellite?', q * (1 - no), '#ffd38a', 250)}
      {chip('Almost never', no * (1 - cab), '#ff7a7a', 250)}
      {chip('Cables under the sea', cab, '#5fe3ff', 250)}
    </AbsoluteFill>
  );
};
