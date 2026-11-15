import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import '@fontsource/manrope/700.css'; import '@fontsource/manrope/800.css'; import '@fontsource/ibm-plex-mono/600.css';
import { FPS, hash, lerp, prog, clamp01, easeOut, easeInOut } from '../lib/anim';
import { FONT } from '../lib/palette';
import { Adult } from './Adult';
import type { StickPose } from './Dusk';

/* Step 3 (local 0 - 11 s): she moves to another city. One router cannot reach that far, so routers link to routers
   and the message hops along. Zoomed-out isometric map in the same night style. */
const S = 56, OX = 550, OY = 860;
const iso = (x: number, y: number, z = 0) => [OX + (x - y) * 0.866 * S, OY + (x + y) * 0.5 * S - z * S] as const;
const P = (a: (readonly number[])[]) => a.map((q) => `${q[0]},${q[1]}`).join(' ');
const shade = (c: string, k: number) => { const n = parseInt(c.slice(1), 16); const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
type B = { x: number; y: number; w: number; d: number; h: number; c: string; lit?: number };
const Bx: React.FC<{ b: B }> = ({ b }) => { const { x, y, w, d, h, c } = b, x1 = x + w, y1 = y + d; const fl = Math.max(1, Math.round(h / 1.1));
  return <g>
    <polygon points={P([iso(x1, y, 0), iso(x1, y1, 0), iso(x1, y1, h), iso(x1, y, h)])} fill={shade(c, 0.62)} />
    <polygon points={P([iso(x, y1, 0), iso(x1, y1, 0), iso(x1, y1, h), iso(x, y1, h)])} fill={shade(c, 0.82)} />
    <polygon points={P([iso(x, y, h), iso(x1, y, h), iso(x1, y1, h), iso(x, y1, h)])} fill={c} />
    {Array.from({ length: fl }).map((_, f) => [0.22, 0.6].map((u, i) => { const on = hash(x * 7 + y * 13 + f * 3 + i) < (b.lit ?? 0.7); const z0 = (f + 0.3) * (h / fl), z1 = (f + 0.75) * (h / fl);
      return <g key={`${f}${i}`}><polygon points={P([iso(x + w * u, y1, z0), iso(x + w * (u + 0.2), y1, z0), iso(x + w * (u + 0.2), y1, z1), iso(x + w * u, y1, z1)])} fill={on ? '#ffd27a' : '#151836'} /><polygon points={P([iso(x1, y + d * u, z0), iso(x1, y + d * (u + 0.2), z0), iso(x1, y + d * (u + 0.2), z1), iso(x1, y + d * u, z1)])} fill={on ? '#e8b860' : '#101230'} /></g>; }))}
  </g>; };
const A = [1.6, 7.4] as const, R1 = [2.0, 2.6] as const, R2 = [-1.9, -2.3] as const, Bc = [-1.4, -7.2] as const;
const town = (c: readonly number[], n: number, cols: string[], hMin: number, hMax: number, seed: number, r = 1.9): B[] => Array.from({ length: n }).map((_, i) => { const a = (i / n) * Math.PI * 2 + hash(seed + i) * 0.8, rr = 1.2 + hash(seed + i * 3) * r; return { x: c[0] + Math.cos(a) * rr - 0.6, y: c[1] + Math.sin(a) * rr - 0.6, w: 1.2, d: 1.2, h: hMin + hash(seed + i * 5) * (hMax - hMin), c: cols[i % cols.length] }; });
const VO: [number, React.ReactNode][] = [[0.2, <>Then she moves to another <em>city.</em></>], [2.7, <>One router can't reach <em>that far.</em></>], [4.7, <>So routers connect to <em>other routers,</em></>], [7.2, <>and pass the message along, <em>hop by hop.</em></>]];
const Face: React.FC<{ kind: 'man' | 'woman'; x: number; y: number; r?: number; ring: string; id: string; smile?: number }> = ({ kind, x, y, r = 54, ring, id, smile = 0.9 }) => { const p: StickPose = { blink: 0, smile, look: kind === 'man' ? 0.5 : -0.5, armR: [8, 5], armL: [-8, -5] };
  return <g transform={`translate(${x} ${y})`}><defs><clipPath id={`fc${id}`}><circle r={r - 4} /></clipPath></defs><path d={`M -12 ${r - 4} L 0 ${r + 20} L 12 ${r - 4} Z`} fill={ring} /><circle r={r} fill={ring} /><circle r={r - 4} fill="#1b2150" /><g clipPath={`url(#fc${id})`}><g transform={`translate(0 ${296 * 1.15 + 6}) scale(1.15)`}><Adult kind={kind} p={p} id={'f' + id} /></g></g></g>; };

export const IsoCity: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const boxes: B[] = [
    ...town(A, 11, ['#3f5a8c', '#5a4d94', '#8a4f74', '#a8683a', '#3f7a5c', '#4a3f7a'], 1.0, 1.9, 1),
    ...town(R1, 5, ['#4a3f7a', '#34487a', '#51437c'], 0.9, 1.5, 40, 1.5), ...town(R2, 5, ['#3d4a82', '#4b3c70', '#34487a'], 0.9, 1.5, 70, 1.5),
    ...town(Bc, 13, ['#2f8f96', '#7a5ad0', '#c95a8c', '#3a6fd0', '#5a4d94'], 2.0, 4.4, 100, 2.0).map((b) => ({ ...b, lit: 0.85 })),
  ].sort((a, b) => a.x + a.y - (b.x + b.y));
  const road = [A, R1, R2, Bc].map((q) => iso(q[0] + 1.2, q[1] + 1.2)); const along = (k: number) => { const seg = Math.min(2, Math.floor(k * 3)), u = k * 3 - seg; return [lerp(road[seg][0], road[seg + 1][0], u), lerp(road[seg][1], road[seg + 1][1], u)]; };
  const RT = [A, R1, R2, Bc].map((q) => iso(q[0], q[1], 3.2)), RB = [A, R1, R2, Bc].map((q) => iso(q[0], q[1], 0));
  const bus = prog(f, 0.3, 2.5, easeInOut), busP = along(bus);
  const reach = prog(f, 2.8, 3.6, easeOut), fail = prog(f, 3.6, 3.9) * (1 - prog(f, 4.5, 4.8));
  const curve = (a: readonly number[], b: readonly number[], sag: number, u = 1) => Array.from({ length: 17 }).map((_, i) => { const k = (i / 16) * u; return `${lerp(a[0], b[0], k)},${lerp(a[1], b[1], k) + sag * Math.sin(Math.PI * k)}`; }).join(' ');
  const hop = clamp01((t - 7.5) / 2.1) * 3, hs = Math.min(2, Math.floor(hop)), hu = hop - hs, hp = [lerp(RT[hs][0], RT[hs + 1][0], hu), lerp(RT[hs][1], RT[hs + 1][1], hu) + 26 * Math.sin(Math.PI * hu)];
  const got = prog(f, 9.6, 9.85, easeOut);
  const herXY = bus < 1 ? [busP[0], busP[1] - 120] : [iso(Bc[0] - 2.2, Bc[1] - 0.6, 4.6)[0], iso(Bc[0] - 2.2, Bc[1] - 0.6, 4.6)[1] - got * 8];
  const himXY = [iso(A[0] - 1.4, A[1] + 0.4, 2.6)[0], iso(A[0] - 1.4, A[1] + 0.4, 2.6)[1]];
  let line: React.ReactNode = null; for (const [a, txt] of VO) if (t >= a) line = txt;
  const router = (i: number, a: number, name: string) => a > 0 ? <g key={'r' + i} opacity={a}>
    <line x1={RB[i][0]} y1={RB[i][1]} x2={RT[i][0]} y2={RT[i][1] + (1 - a) * 60} stroke="#2b2e3a" strokeWidth={7} strokeLinecap="round" />
    <g transform={`translate(${RT[i][0]} ${RT[i][1] + (1 - a) * 60})`}><circle r={60} fill="#5fe3ff" opacity={0.22} filter="url(#cB2)" /><line x1={-20} y1={-10} x2={-27} y2={-42} stroke="#d9d6cf" strokeWidth={4} strokeLinecap="round" /><line x1={20} y1={-10} x2={27} y2={-42} stroke="#d9d6cf" strokeWidth={4} strokeLinecap="round" /><rect x={-36} y={-15} width={72} height={30} rx={8} fill="#f3f0ea" />{[0, 1, 2, 3].map((k) => <circle key={k} cx={-21 + k * 14} cy={0} r={3.6} fill={Math.sin(t * 9 + k * 1.7 + i) > 0 ? '#3ddc97' : '#1f6a4c'} />)}
      <text y={44} textAnchor="middle" style={{ font: `800 22px ${FONT.ui}` }} fill="#dffbff" stroke="#0a0e24" strokeWidth={6} paintOrder="stroke">{name}</text></g></g> : null;
  return (
    <AbsoluteFill style={{ backgroundColor: '#0b1232' }}>
      <svg width={1080} height={1920}>
        <defs><filter id="cB"><feGaussianBlur stdDeviation="5" /></filter><filter id="cB2"><feGaussianBlur stdDeviation="12" /></filter>
          <radialGradient id="cG"><stop offset="0" stopColor="#1f3350" /><stop offset="1" stopColor="#101a36" /></radialGradient></defs>
        <rect width={1080} height={1920} fill="#101a36" />
        {/* countryside: fields, a river, trees */}
        {Array.from({ length: 26 }).map((_, i) => { const q = iso(-16 + hash(i) * 32, -20 + hash(i + 50) * 40); return <polygon key={i} points={P([[q[0], q[1] - 46], [q[0] + 90, q[1]], [q[0], q[1] + 46], [q[0] - 90, q[1]]])} fill={i % 2 ? '#15263c' : '#172c40'} opacity={0.8} />; })}
        <polyline points={P([iso(-14, 8), iso(-6, 3.5), iso(-1, 0.4), iso(5, -3.5), iso(13, -7)])} fill="none" stroke="#1d3f6a" strokeWidth={44} strokeLinecap="round" strokeLinejoin="round" /><polyline points={P([iso(-14, 8), iso(-6, 3.5), iso(-1, 0.4), iso(5, -3.5), iso(13, -7)])} fill="none" stroke="#2b5a8f" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
        {[A, R1, R2, Bc].map((q, i) => { const c = iso(q[0], q[1]), r = i === 0 ? 290 : i === 3 ? 290 : 180; return <ellipse key={i} cx={c[0]} cy={c[1]} rx={r} ry={r * 0.58} fill="url(#cG)" />; })}
        {/* the highway between the towns */}
        <polyline points={P(road)} fill="none" stroke="#333a72" strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" /><polyline points={P(road)} fill="none" stroke="#141736" strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" /><polyline points={P(road)} fill="none" stroke="#8e8cc0" strokeWidth={2.5} strokeDasharray="14 16" opacity={0.6} />
        {Array.from({ length: 70 }).map((_, i) => { const q = iso(-17 + hash(i * 3) * 34, -21 + hash(i * 5 + 9) * 42); return <g key={'t' + i}><ellipse cx={q[0]} cy={q[1] + 3} rx={9} ry={4} fill="#000" opacity={0.25} /><circle cx={q[0]} cy={q[1] - 9} r={9 + hash(i) * 4} fill="#1f4a3a" /><circle cx={q[0] - 3} cy={q[1] - 12} r={5} fill="#2c6a50" /></g>; })}
        {boxes.map((b, i) => <Bx key={i} b={b} />)}
        {/* her bus */}
        {bus > 0 && bus < 1 && <g transform={`translate(${busP[0]} ${busP[1]})`}><ellipse cx={0} cy={10} rx={34} ry={12} fill="#000" opacity={0.3} /><rect x={-30} y={-22} width={60} height={30} rx={8} fill="#f6c34a" /><rect x={-24} y={-17} width={48} height={11} rx={3} fill="#9fd0ff" /><circle cx={-16} cy={9} r={6} fill="#1b1520" /><circle cx={16} cy={9} r={6} fill="#1b1520" /><circle cx={30} cy={0} r={16} fill="#fff3d6" opacity={0.5} filter="url(#cB)" /></g>}
        {/* one long wire from the home router: it cannot reach */}
        {reach > 0 && t < 4.8 && <g opacity={1 - prog(f, 4.5, 4.8)}><polyline points={curve(RT[0], RT[3], 60 + 80 * fail, reach * 0.55)} fill="none" stroke={fail > 0.5 ? '#ff6a5a' : '#9fe9ff'} strokeWidth={5} strokeLinecap="round" strokeDasharray={fail > 0.5 ? '10 12' : undefined} />
          {fail > 0 && (() => { const q = [lerp(RT[0][0], RT[3][0], 0.55), lerp(RT[0][1], RT[3][1], 0.55) + (60 + 80 * fail) * Math.sin(Math.PI * 0.55)]; return <g opacity={fail} transform={`translate(${q[0]} ${q[1]})`}><circle r={34} fill="#ff5a4a" /><path d="M -14 -14 L 14 14 M 14 -14 L -14 14" stroke="#fff" strokeWidth={8} strokeLinecap="round" /><text y={-52} textAnchor="middle" style={{ font: `800 40px ${FONT.ui}` }} fill="#ffb3a8" stroke="#0a0e24" strokeWidth={8} paintOrder="stroke">too far!</text></g>; })()}</g>}
        {/* router to router links */}
        {[0, 1, 2].map((i) => { const u = prog(f, 5.3 + i * 0.55, 5.9 + i * 0.55, easeOut); if (u <= 0) return null; const k = (t * 0.7 + i * 0.3) % 1;
          return <g key={'l' + i}><polyline points={curve(RT[i], RT[i + 1], 26, u)} fill="none" stroke="#5fe3ff" strokeWidth={18} opacity={0.25} filter="url(#cB)" /><polyline points={curve(RT[i], RT[i + 1], 26, u)} fill="none" stroke="#9fe9ff" strokeWidth={5.5} strokeLinecap="round" />
            {u >= 1 && (t < 7.5 || t > 9.7) && <circle cx={lerp(RT[i][0], RT[i + 1][0], k)} cy={lerp(RT[i][1], RT[i + 1][1], k) + 26 * Math.sin(Math.PI * k)} r={6} fill="#fff" />}</g>; })}
        {router(0, 1, 'HOME ROUTER')}{router(1, prog(f, 4.8, 5.2, easeOut), 'ROUTER')}{router(2, prog(f, 5.3, 5.7, easeOut), 'ROUTER')}{router(3, prog(f, 5.8, 6.2, easeOut), 'CITY ROUTER')}
        {/* hop counters and the travelling HELLO */}
        {[0, 1, 2].map((i) => { const a = prog(f, 7.5 + i * 0.7 + 0.5, 7.5 + i * 0.7 + 0.7, easeOut); return a > 0 ? <g key={'h' + i} opacity={a} transform={`translate(${(RT[i][0] + RT[i + 1][0]) / 2 - 70} ${(RT[i][1] + RT[i + 1][1]) / 2 - 20}) scale(${0.8 + 0.2 * a})`}><rect x={-58} y={-24} width={116} height={46} rx={14} fill="#ffe08a" /><text y={9} textAnchor="middle" style={{ font: `800 28px ${FONT.ui}` }} fill="#3a2a05">hop {i + 1}</text></g> : null; })}
        {t > 7.5 && t < 9.6 && <g transform={`translate(${hp[0]} ${hp[1]})`}><circle r={34} fill="#ffe08a" opacity={0.5} filter="url(#cB)" /><rect x={-24} y={-16} width={48} height={32} rx={7} fill="#ffe08a" /><path d="M -21 -13 L 0 4 L 21 -13" stroke="#8a5a10" strokeWidth={4} fill="none" /></g>}
        {/* the two of them, as portrait pins */}
        <Face kind="man" x={himXY[0]} y={himXY[1] - 60} ring="#3fb8a8" id="m" />
        <Face kind="woman" x={herXY[0]} y={herXY[1] - 60} ring="#ff8672" id="w" smile={bus < 1 ? 0.6 : 1} />
        {t > 7.0 && t < 7.6 && <g opacity={prog(f, 7.0, 7.15) * (1 - prog(f, 7.45, 7.6))} transform={`translate(${himXY[0]} ${himXY[1] - 150}) scale(1.3)`}><rect x={-64} y={-30} width={128} height={44} rx={14} fill="#0e1430" stroke="#5fe3ff" strokeWidth={2} /><text y={3} textAnchor="middle" style={{ font: `800 28px ${FONT.ui}` }} fill="#fff">HELLO</text></g>}
        {got > 0 && <g opacity={got} transform={`translate(${herXY[0]} ${herXY[1] - 150}) scale(1.3)`}><rect x={-64} y={-30} width={128} height={44} rx={14} fill="#0e1430" stroke="#5fe3ff" strokeWidth={2} /><text y={3} textAnchor="middle" style={{ font: `800 28px ${FONT.ui}` }} fill="#fff">HELLO</text><circle cx={64} cy={-30} r={13} fill="#3ddc97" /><path d="M 58 -30 L 62 -25 L 70 -35" stroke="#06261a" strokeWidth={3.5} fill="none" strokeLinecap="round" /></g>}
        {/* town name plates */}
        {([[A, 'HOME TOWN', 4.6, 165], [Bc, 'HER NEW CITY', -1.5, -265]] as [readonly number[], string, number, number][]).map(([q, n, dz, dy], i) => { const c = iso(q[0], q[1]); return <g key={n} transform={`translate(${c[0] + (i ? 40 : 150)} ${c[1] + (i ? 150 : dy)})`}><rect x={-128} y={-28} width={256} height={54} rx={16} fill={i ? '#ff6f91' : '#3f5a8c'} /><text y={10} textAnchor="middle" style={{ font: `800 32px ${FONT.ui}` }} fill="#fff">{n}</text></g>; })}
      </svg>
      {line && <div style={{ position: 'absolute', top: 1260, left: 60, right: 150, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', font: `800 58px/1.15 ${FONT.ui}`, color: '#fff', textShadow: '0 3px 6px rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.9)' }}><div className="sub">{line}</div></div>}
      <style>{'.sub em{font-style:normal;color:#ffd38a}'}</style>
      <div style={{ position: 'absolute', right: 18, top: 960, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: 0.8 }}>
        <Img src={staticFile('logo.png')} style={{ width: 70, height: 70, borderRadius: 35 }} /><span style={{ writingMode: 'vertical-rl', font: `700 26px ${FONT.ui}`, color: 'rgba(255,255,255,.85)' }}>@TheInvisiTech</span>
      </div>
    </AbsoluteFill>
  );
};
