// Review 1 · Student character sheet: front, three-quarter and side; three expressions; two hand studies.
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, Expr, FrontFigure, HandBulb, HandFoil, HeadFQ, SideFigure, ThreeQFigure } from './student';

export const SHEET = { w: 2400, h: 1350 };
const INK = '#2a2622';
const Label: React.FC<{ x: number; y: number; t: string; s?: number }> = ({ x, y, t, s = 26 }) =>
  <text x={x} y={y} textAnchor="middle" style={{ font: `800 ${s}px Inter, sans-serif`, letterSpacing: '0.14em' }} fill="#5d564c">{t}</text>;

// a head-and-shoulders bust for the expression studies
const Bust: React.FC<{ ex: Expr; look?: [number, number]; tilt?: number }> = ({ ex, look, tilt = 0 }) => (
  <g>
    <path d="M -110 300 C -110 230 -80 196 -30 186 L 0 214 L 40 186 C 92 196 124 230 124 300 Z" fill={C.hood} stroke={C.line} strokeWidth={3} strokeLinejoin="round" />
    <path d="M -110 300 C -110 230 -80 196 -30 186 L -20 196 C -60 214 -80 250 -80 300 Z" fill={C.hoodSh} opacity={0.6} />
    <g transform={`rotate(${tilt} 6 170)`}><g transform="translate(6 22)"><HeadFQ turn={0.55} ex={ex} look={look} /></g></g>
    <path d="M -52 196 C -54 166 -30 152 -12 162 L 8 190 L 26 162 C 46 154 70 166 66 196 C 50 212 30 216 8 216 C -14 216 -38 210 -52 196 Z" fill={C.hood} stroke={C.line} strokeWidth={3} strokeLinejoin="round" />
    <path d="M -12 164 L 8 192 L 26 164 C 18 174 12 178 8 178 C 2 178 -6 174 -12 164 Z" fill={C.hoodDeep} stroke={C.line} strokeWidth={2.4} strokeLinejoin="round" />
  </g>
);

const Panel: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) =>
  <rect x={x} y={y} width={w} height={h} rx={18} fill="#f4f1ea" stroke="#d8d2c6" strokeWidth={2} />;

export const StudentSheet: React.FC = () => (
  <AbsoluteFill style={{ background: '#e7e2d8' }}>
    <svg width={SHEET.w} height={SHEET.h} viewBox={`0 0 ${SHEET.w} ${SHEET.h}`}>
      <text x={60} y={78} style={{ font: '800 40px Inter, sans-serif' }} fill={INK}>InvisiTech · How You'd Invent a Flashlight · Student</text>
      <text x={60} y={116} style={{ font: '500 24px Inter, sans-serif' }} fill="#6d665b">Character sheet for review · no pencil · swept dark hair, yellow hoodie, dark jeans, navy canvas sneakers</text>

      {/* turnaround */}
      <Panel x={40} y={150} w={1360} h={1160} />
      {[0, 1, 2].map((i) => <line key={i} x1={40} y1={1236 - i * 0} x2={1400} y2={1236} stroke="#d0c9bb" strokeWidth={2} />)}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <line key={`g${i}`} x1={60} y1={1236 - i * 142} x2={1380} y2={1236 - i * 142} stroke="#e3ddd1" strokeWidth={1.5} strokeDasharray="8 10" />)}
      <g transform="translate(260 200) scale(1.035)"><ellipse cx={0} cy={1000} rx={110} ry={14} fill="#000" opacity={0.08} /><FrontFigure ex="smile" /></g>
      <g transform="translate(720 200) scale(1.035)"><ellipse cx={14} cy={1000} rx={110} ry={14} fill="#000" opacity={0.08} /><ThreeQFigure ex="smile" /></g>
      <g transform="translate(1160 200) scale(1.035)"><ellipse cx={10} cy={1000} rx={90} ry={14} fill="#000" opacity={0.08} /><SideFigure /></g>
      <Label x={260} y={1290} t="FRONT" />
      <Label x={735} y={1290} t="THREE-QUARTER" />
      <Label x={1170} y={1290} t="SIDE" />

      {/* expressions */}
      <Panel x={1430} y={150} w={930} h={470} />
      <g transform="translate(1590 200) scale(1.2)"><Bust ex="puzzled" look={[-0.6, -0.5]} tilt={-6} /></g>
      <g transform="translate(1895 200) scale(1.2)"><Bust ex="focus" look={[0.2, 1]} tilt={8} /></g>
      <g transform="translate(2200 200) scale(1.2)"><Bust ex="idea" look={[0.5, -0.2]} tilt={-3} /></g>
      <Label x={1595} y={598} t="PUZZLED" s={22} />
      <Label x={1900} y={598} t="CONCENTRATING" s={22} />
      <Label x={2205} y={598} t="REALIZING" s={22} />

      {/* hands */}
      <Panel x={1430} y={650} w={930} h={660} />
      <g transform="translate(1650 1170) scale(1.5)"><HandBulb /></g>
      <line x1={1880} y1={690} x2={1880} y2={1250} stroke="#d8d2c6" strokeWidth={2} />
      <g transform="translate(2220 1120) scale(1.25)"><HandFoil /></g>
      <Label x={1650} y={1290} t="GRIPS THE BULB BY ITS BASE" s={20} />
      <Label x={2090} y={1290} t="PINCHES THE FOIL EDGE" s={20} />
    </svg>
    {/* the reference, small, for comparison */}
    <div style={{ position: 'absolute', left: 1240, top: 170, width: 140, padding: 6, background: '#fff', border: '2px solid #d8d2c6', borderRadius: 10 }}>
      <Img src={staticFile('ref/InvisiTech Student with an Unlit Bulb.png')} style={{ width: '100%', display: 'block', borderRadius: 6 }} />
      <div style={{ font: '700 13px Inter, sans-serif', color: '#6d665b', textAlign: 'center', marginTop: 4, letterSpacing: '0.1em' }}>REFERENCE</div>
    </div>
  </AbsoluteFill>
);
