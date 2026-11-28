import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { lerp, easeInOut, clamp01 } from '../lib/anim';
import { Planet, ov, project, ll, R, MAIN } from './Planet';
import { routeAt, LL } from '../tail/Globe';
import { DogBetter } from './DogBetter';

/* Part 2 hook v12, the globe shot: the light travels the whole route Hyderabad to London at a steady, slightly slow pace
   and the CAMERA travels with it (Harsh, 28 Nov): same purple globe, glossy tags and thin yellow route as the anchor scene, the photo riding the light. 9:16. */
export const HOOK_TRAVEL_FRAMES = 225;   // 7.5 s, played at normal speed (no stretching)
const D = 7.5, T0 = 7.0;
const prog = (t: number) => { const u = clamp01(t / D); return 0.985 * (0.82 * u + 0.18 * easeInOut(u)); };
export const HookGlobeTravel: React.FC = () => {
  const f = useCurrentFrame(), t = f / 30, tt = T0 + t, u = prog(t);
  const head = (x: number) => routeAt(MAIN, prog(x - T0)) as LL;
  ov.lon = null as any; ov.show = () => 1; ov.pins = 0; ov.thin = true; ov.dense = true; ov.real = false; ov.sat = false; ov.blue = false; ov.dy = 0; ov.alt = null; ov.cut = null;
  ov.u = (x: number) => prog(x - T0);
  ov.cam = (x: number) => { const h = head(x), q = clamp01((x - T0) / D); return { lon: h[0] - 6 * (1 - q), lat: lerp(8, h[1] * 0.75 + 4, 0.6) , d: 24 + 7 * Math.sin(Math.PI * Math.min(1, q * 1.05)), fov: 42 }; };
  const [mx, my, mf] = project(tt, ll(routeAt(MAIN, u) as unknown as LL, R * 1.012));
  const px = Math.max(150, Math.min(930, mx + 140)), py = Math.max(470, Math.min(1500, my + 150)), o = clamp01(t / 0.4);
  return (<AbsoluteFill style={{ backgroundColor: '#04061a' }}>
    <Sequence from={-Math.round(T0 * 30)}><Planet /></Sequence>
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}><defs><radialGradient id="hg"><stop offset="0" stopColor="#ffffff" stopOpacity={0.95} /><stop offset="0.35" stopColor="#ffe27a" stopOpacity={0.8} /><stop offset="1" stopColor="#ffd23a" stopOpacity={0} /></radialGradient></defs>
      {mf && <g opacity={o}><g transform={`translate(${mx} ${my})`}><circle r={46} fill="url(#hg)" /><circle r={9} fill="#fff" /></g>
        <line x1={mx} y1={my} x2={px - 60} y2={py - 80} stroke="#ffc94a" strokeWidth={3} />
        <g transform={`translate(${px} ${py})`} style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,.6)) drop-shadow(0 0 14px rgba(255,201,74,.55))' }}><rect x={-100} y={-100} width={200} height={200} rx={20} fill="#0b1230" stroke="#ffc94a" strokeWidth={5} /><svg x={-92} y={-92} width={184} height={184} viewBox="0 0 190 190"><clipPath id="hpc"><rect x={0} y={0} width={190} height={190} rx={12} /></clipPath><g clipPath="url(#hpc)"><DogBetter /></g></svg></g></g>}
    </svg>
  </AbsoluteFill>);
};
