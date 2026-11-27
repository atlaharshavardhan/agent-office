import React from 'react';
import { AbsoluteFill } from 'remotion';
import '@fontsource/manrope/800.css'; import '@fontsource/ibm-plex-mono/600.css';
const P: [number, number][] = [[250, 620], [470, 560], [700, 600], [880, 700], [190, 880], [860, 950], [240, 1130], [480, 1190], [700, 1150], [900, 1180]];
export const MapConcept: React.FC<{ star?: boolean }> = ({ star }) => {
  const R = [540, 880]; const pairs: [number, number][] = []; for (let i = 0; i < 10; i++) for (let j = i + 1; j < 10; j++) pairs.push([i, j]);
  return (
    <AbsoluteFill style={{ background: '#0b1030' }}>
      <svg width={1080} height={1920}>
        <defs><filter id="mb"><feGaussianBlur stdDeviation="8" /></filter></defs>
        {[760, 1040].map((y) => <rect key={y} x={0} y={y - 26} width={1080} height={52} fill="#141a44" />)}{[370, 790].map((x) => <rect key={x} x={x - 26} y={480} width={52} height={820} fill="#141a44" />)}
        {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={(i * 197) % 1080} cy={500 + ((i * 331) % 800)} r={10} fill="#1f4a3a" opacity={0.7} />)}
        {!star && pairs.map(([i, j], n) => <line key={n} x1={P[i][0]} y1={P[i][1]} x2={P[j][0]} y2={P[j][1]} stroke="#ff8a5a" strokeWidth={3.5} opacity={0.85} />)}
        {star && P.map((q, i) => <g key={i}><line x1={q[0]} y1={q[1]} x2={R[0]} y2={R[1]} stroke="#5fe3ff" strokeWidth={14} opacity={0.25} filter="url(#mb)" /><line x1={q[0]} y1={q[1]} x2={R[0]} y2={R[1]} stroke="#9fe9ff" strokeWidth={5} /><circle cx={(q[0] + R[0]) / 2} cy={(q[1] + R[1]) / 2} r={8} fill="#fff" /></g>)}
        {P.map((q, i) => <g key={i}><rect x={q[0] - 44} y={q[1] - 44} width={88} height={88} rx={14} fill={i === 0 ? '#3f5a8c' : i === 3 ? '#5a4d94' : '#343a70'} stroke={i === 0 ? '#7fe3d4' : i === 3 ? '#c9b8ff' : '#6a72b8'} strokeWidth={4} /><rect x={q[0] - 20} y={q[1] - 20} width={40} height={40} rx={6} fill="#ffcf7a" opacity={0.9} /></g>)}
        <text x={P[0][0]} y={P[0][1] - 62} textAnchor="middle" style={{ font: '800 34px Manrope' }} fill="#7fe3d4">HIM</text><text x={P[3][0]} y={P[3][1] - 62} textAnchor="middle" style={{ font: '800 34px Manrope' }} fill="#c9b8ff">HER</text>
        {star && <g transform={`translate(${R[0]} ${R[1]})`}><circle r={120} fill="#5fe3ff" opacity={0.2} filter="url(#mb)" /><rect x={-80} y={-40} width={160} height={80} rx={20} fill="#f3f0ea" />{[0, 1, 2, 3].map((i) => <circle key={i} cx={-45 + i * 30} cy={0} r={8} fill={i % 2 ? '#3ddc97' : '#1f6a4c'} />)}<text y={-62} textAnchor="middle" style={{ font: '800 44px Manrope' }} fill="#fff">ROUTER</text></g>}
      </svg>
      <div style={{ position: 'absolute', top: 236, left: 90, right: 90, height: 200, borderRadius: 40, background: 'rgba(10,14,36,.9)', border: '1px solid rgba(160,176,255,.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ font: '800 70px Manrope', color: '#fff' }}>{star ? <>1 box = <span style={{ color: '#9fe9ff' }}>10</span> wires</> : <>10 houses = <span style={{ color: '#ff9a7a' }}>45</span> wires</>}</div>
        <div style={{ font: "600 26px 'IBM Plex Mono'", letterSpacing: '0.1em', color: '#a9b4dd' }}>{star ? 'EVERY HOUSE TO THE ROUTER' : 'EVERY HOUSE TO EVERY HOUSE'}</div>
      </div>
      <div style={{ position: 'absolute', top: 1320, left: 60, right: 150, textAlign: 'center', font: '800 58px/1.15 Manrope', color: '#fff' }}>{star ? <>So every wire goes to <span style={{ color: '#ffd38a' }}>one box.</span></> : <>Ten houses would need <span style={{ color: '#ffd38a' }}>forty-five</span> wires!</>}</div>
    </AbsoluteFill>
  );
};
