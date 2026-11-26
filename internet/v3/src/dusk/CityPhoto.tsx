import React from 'react';
import { hash, lerp, clamp01, easeOut, easeInOut } from '../lib/anim';
import { FONT } from '../lib/palette';
import { IPhone, Compose, SCR } from './Phone';
import { isWide } from '../lib/wide';

/* Part 1, after "hop by hop": the same city map, but now he sends a PHOTO.
   First as one big block (the whole line is held, everyone else waits, one glitch and it starts again),
   then the way the internet really does it: cut into small numbered packets that share the lines.
   All times are seconds after the 13 s city scene ends (te). Narration starts are in audio/make_part1_mix.py. */
export const PHOTO_SECONDS = 28.0;
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
type Pt = readonly number[];
const MAIN = [0, 1, 2, 3], ALT = [0, 5, 7, 3];
const along = (RT: Pt[], route: number[], v: number, sag = 26) => { const k = Math.max(0, Math.min(2.9999, v)), s = Math.floor(k), u = k - s, a = RT[route[s]], b = RT[route[s + 1]]; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + sag * Math.sin(Math.PI * u)] as const; };
const line = (RT: Pt[], route: number[], v0: number, v1: number) => Array.from({ length: 49 }).map((_, i) => along(RT, route, lerp(v0, v1, i / 48)).join(',')).join(' ');
/* ---- the big block ---- */
const B0 = 3.6, GLITCH = 7.7, AGAIN = 8.7, B_END = 10.6;
const blockV = (te: number) => te < GLITCH ? 1.9 * easeInOut(seg(te, 3.7, GLITCH)) : te < AGAIN ? 1.9 : 0.6 * easeInOut(seg(te, 9.1, 10.7));
/* ---- the packets: 36 tiles stand for about 2,000 ---- */
const N = 36, P0 = 14.3, GAP = 0.2, LOST = 28, RESEND = 22.9, HOP = 0.35, REORD = 26.1;
export const PK = Array.from({ length: N }).map((_, i) => { const alt = i % 3 === 1 && i !== LOST, dep = P0 + i * GAP, dur = alt ? 3.4 : 2.6; return { i, alt, dep, dur, arr: i === LOST ? RESEND + 2.6 : dep + dur }; });
/* the order they land on her phone: slot k = the k-th packet to arrive, so the picture is jumbled until her phone sorts it */
const ORDER = [...PK].sort((a, b) => a.arr - b.arr).map((p) => p.i), SLOT = PK.map((p) => ORDER.indexOf(p.i));
const DONE = REORD + 1.0;
const tileCol = (i: number) => ['#ffb45e', '#ff9a6a', '#f07f8f', '#c56fc0', '#8c6fe0', '#5f7fe6'][Math.floor(i / 6)];
const num = (i: number) => '#' + String(i * 57 + 1).padStart(4, '0');

/* the sunset photo, drawn in a 6 x 6 unit box; tiles = which of the 36 squares are present */
const Art: React.FC<{ id: string }> = ({ id }) => <>
  <defs><linearGradient id={id + 'g'} x1="0" y1="0" x2="0" y2="6" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#ffb45e" /><stop offset=".45" stopColor="#f07f8f" /><stop offset="1" stopColor="#5a4fc0" /></linearGradient></defs>
  <rect width={6} height={6} fill={`url(#${id}g)`} /><circle cx={4.1} cy={2.5} r={1.0} fill="#fff1c4" /><path d="M0 4.3 Q1.5 3.2 3 4.2 T6 3.9 V6 H0 Z" fill="#3b2f7a" /><path d="M0 5 Q2 4.2 4 5 T6 4.8 V6 H0 Z" fill="#241d55" />
  <rect x={1.0} y={3.5} width={1.3} height={1.3} fill="#1a1440" /><path d="M0.8 3.5 L1.65 2.7 L2.5 3.5 Z" fill="#120e30" /><rect x={1.35} y={3.9} width={0.5} height={0.5} fill="#ffd98a" /></>;
const Pic: React.FC<{ id: string; s: number; tiles: boolean[]; grid: number }> = ({ id, s, tiles, grid }) => (
  <svg width={s} height={s} viewBox="0 0 6 6" style={{ display: 'block', borderRadius: 10, background: '#111318' }}>
    <defs><clipPath id={id + 'c'}>{tiles.map((on, i) => on ? <rect key={i} x={i % 6} y={Math.floor(i / 6)} width={1.02} height={1.02} /> : null)}</clipPath></defs>
    <g clipPath={`url(#${id}c)`}><Art id={id} /></g>
    {grid > 0 && Array.from({ length: 5 }).map((_, k) => <g key={k} opacity={grid}><line x1={k + 1} y1={0} x2={k + 1} y2={6} stroke="#0b1030" strokeWidth={0.09} /><line x1={0} y1={k + 1} x2={6} y2={k + 1} stroke="#0b1030" strokeWidth={0.09} /></g>)}
  </svg>);

/* ---- the camera: stay close on whatever is being explained, go wide only when the whole route matters ---- */
type Cam = { x: number; y: number; z: number };
const HERO = 12;   // the packet the camera follows for "her address and a number"
const pkPos = (RT: Pt[], i: number, te: number) => { const p = PK[i]; return along(RT, p.alt ? ALT : MAIN, easeInOut(clamp01((te - p.dep) / p.dur)) * 3, p.alt ? 20 : 26); };
export const photoKeys = (te: number, RT: Pt[]): [number, Cam][] => {
  const shot = (p: readonly number[], sx: number, sy: number, z: number): Cam => ({ x: p[0] - (sx - 540) / z, y: p[1] - (sy - 960) / z, z });   // put world point p at screen (sx, sy)
  const ALLV: Cam = { x: 540, y: 921, z: 0.95 }, HIM = shot(RT[0], 300, 1010, 1.7), FOL = shot(along(RT, MAIN, blockV(te)), 540, 900, 1.5), ERR = shot(along(RT, MAIN, 1.9), 540, 880, 1.7);
  const MID = shot([(RT[0][0] + RT[1][0]) / 2, (RT[0][1] + RT[1][1]) / 2], 540, 940, 1.25), PACK = shot(pkPos(RT, HERO, te), 540, 860, 1.9), LOSTC = shot(along(RT, MAIN, 1.5), 620, 900, 1.6), HOMEC = shot(RT[0], 330, 900, 1.45), HER = shot(RT[3], 300, 660, 1.6);
  const K: [number, Cam][] = [[1.0, HIM], [3.5, HIM], [3.95, FOL], [6.1, FOL], [6.8, ALLV], [7.5, ALLV], [7.75, ERR], [8.6, ERR], [9.0, FOL], [10.5, FOL], [11.0, HIM], [14.2, HIM], [14.9, MID], [16.4, MID],
    [16.9, PACK], [18.4, PACK], [18.9, ALLV], [21.0, ALLV], [21.3, LOSTC], [22.6, LOSTC], [22.95, HOMEC], [23.8, HOMEC], [24.6, HER], [60, HER]];
  return K.map(([a, c]) => [13 + a, c]); };

/* ---- drawn on the map (inside the camera) ---- */
export const PhotoWorld: React.FC<{ te: number; RT: Pt[] }> = ({ te, RT }) => {
  if (te < 0) return null;
  const held = seg(te, B0, B0 + 0.5) * (1 - seg(te, B_END, B_END + 0.8)), v = blockV(te), bp = along(RT, MAIN, v);
  const blockO = seg(te, 3.55, 3.7) * (1 - seg(te, 8.35, 8.6)) + seg(te, AGAIN, AGAIN + 0.3) * (1 - seg(te, B_END, B_END + 0.5)), bad = seg(te, GLITCH, GLITCH + 0.12) * (1 - seg(te, 8.35, 8.6)), shake = bad * Math.sin(te * 70) * 6;
  const qN = (r: number) => Math.max(0, Math.round(Math.min(9, (te - 4.1 - r * 0.3) * (0.9 + r * 0.25)) * (1 - seg(te, B_END + 0.2, B_END + 1.3))));
  const free = seg(te, B_END + 0.4, B_END + 1.2);
  return <g>
    {/* the whole line is held for one photo */}
    {held > 0 && <g opacity={held}><polyline points={line(RT, MAIN, 0, 3)} fill="none" stroke="#ffb020" strokeWidth={26} opacity={0.16} strokeLinecap="round" /><polyline points={line(RT, MAIN, 0, 3)} fill="none" stroke="#ffb020" strokeWidth={7} strokeLinecap="round" strokeDasharray="22 14" strokeDashoffset={-te * 40} />
      {(() => { const q = along(RT, MAIN, 1.5); return <g transform={`translate(${q[0] - 150} ${q[1] - 46})`}><rect x={-112} y={-24} width={224} height={48} rx={12} fill="#2a1c06" stroke="#ffb020" strokeWidth={3} /><text y={8} textAnchor="middle" fill="#ffd27a" style={{ font: `800 24px ${FONT.ui}`, letterSpacing: '0.06em' }}>LINE HELD</text></g>; })()}</g>}
    {/* everyone else queues at the routers on the way */}
    {[0, 1, 2].map((r) => { const n = qN(r); if (n <= 0 || te > B_END + 1.4) return null; const p = RT[MAIN[r]], m = r === 1 ? -1 : 1; return <g key={'q' + r} transform={`translate(${p[0] + 62 * m} ${p[1] + (r === 1 ? 44 : -8)}) scale(${m} 1)`}>
      {Array.from({ length: Math.min(n, 6) }).map((_, k) => <g key={k} transform={`translate(${k * 22} ${-k * 5})`}><rect x={-13} y={-9} width={26} height={18} rx={4} fill="#dffbff" stroke="#19a6c8" strokeWidth={2.5} /><path d="M-13 -9 L0 2 L13 -9" fill="none" stroke="#19a6c8" strokeWidth={2.5} /></g>)}
      <g transform={`translate(${Math.min(n, 6) * 22 + 34} -14) scale(${m} 1)`}><rect x={-56} y={-17} width={112} height={34} rx={17} fill="#3a0f14" stroke="#ff6a5a" strokeWidth={2.5} /><text y={7} textAnchor="middle" fill="#ffc9c2" style={{ font: `800 19px ${FONT.ui}` }}>{n} waiting</text></g></g>; })}
    {/* the block itself */}
    {blockO > 0.01 && <g opacity={Math.min(1, blockO)} transform={`translate(${bp[0] + shake} ${bp[1] - 34})`}><circle r={120} fill="url(#cPk)" opacity={0.5} />
      <rect x={-62} y={-48} width={124} height={96} rx={12} fill={bad > 0.5 ? '#ff5a4a' : '#ffb45e'} stroke="#fff" strokeWidth={4} /><rect x={-52} y={-38} width={104} height={56} rx={6} fill={bad > 0.5 ? '#7a1410' : '#f07f8f'} /><circle cx={24} cy={-16} r={13} fill={bad > 0.5 ? '#ffb0a8' : '#fff1c4'} /><path d="M-52 18 L-22 -8 L4 18 Z" fill={bad > 0.5 ? '#3a0806' : '#3b2f7a'} />
      <text y={40} textAnchor="middle" fill="#1a1030" style={{ font: `800 18px ${FONT.ui}` }}>{bad > 0.5 ? 'ERROR' : 'PHOTO · 3 MB'}</text>
      {te > AGAIN && te < AGAIN + 1.6 && <g opacity={1 - seg(te, AGAIN + 1.2, AGAIN + 1.6)} transform="translate(0 -84)"><rect x={-98} y={-20} width={196} height={40} rx={20} fill="#3a0f14" stroke="#ff6a5a" strokeWidth={2.5} /><text y={8} textAnchor="middle" fill="#ffc9c2" style={{ font: `800 21px ${FONT.ui}` }}>↺ start again</text></g>}</g>}
    {bad > 0 && [0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const u = seg(te, GLITCH, GLITCH + 0.5), a = (k / 8) * Math.PI * 2; return u < 1 ? <line key={k} x1={bp[0] + Math.cos(a) * (70 + u * 30)} y1={bp[1] - 34 + Math.sin(a) * (60 + u * 30)} x2={bp[0] + Math.cos(a) * (95 + u * 70)} y2={bp[1] - 34 + Math.sin(a) * (80 + u * 70)} stroke="#ff6a5a" strokeWidth={6} strokeLinecap="round" opacity={1 - u} /> : null; })}
    {/* with packets: other people's messages flow again on the same lines */}
    {free > 0 && [MAIN, ALT].map((rt, ri) => Array.from({ length: 9 }).map((_, k) => { const vv = ((te * 0.33 + k / 9 + ri * 0.05) % 1) * 3, q = along(RT, rt, k % 2 ? 3 - vv : vv, ri ? 20 : 26); return <circle key={ri + '-' + k} cx={q[0]} cy={q[1] + (k % 2 ? 9 : -9)} r={6} fill="#7fe9ff" opacity={0.75 * free} />; }))}
    {te > 13.6 && <polyline points={line(RT, ALT, 0, 3)} fill="none" stroke="#2a8fb0" strokeWidth={4.5} strokeLinecap="round" opacity={0.75 * seg(te, 13.6, 14.4)} />}
    {PK.map((p) => { const lost = p.i === LOST; const runs: [number, number, boolean][] = lost ? [[p.dep, 2.6, true], [RESEND, 2.6, false]] : [[p.dep, p.dur, false]];
      return runs.map(([dep, dur, dies], ri) => { const u = (te - dep) / dur; if (u <= 0 || u >= 1 || (dies && u > 0.5)) return null; const q = along(RT, p.alt ? ALT : MAIN, easeInOut(u) * 3, p.alt ? 20 : 26), hero = lost && !dies;
        return <g key={p.i + '-' + ri} transform={`translate(${q[0]} ${q[1]})`}>{hero && <circle r={46} fill="url(#cPk)" />}<rect x={-17} y={-17} width={34} height={34} rx={7} fill={tileCol(p.i)} stroke={hero ? '#fff' : '#0b1030'} strokeWidth={hero ? 4 : 2.5} />
          {p.i === HERO && !lost && <g transform="translate(0 -78)"><rect x={-96} y={-32} width={192} height={62} rx={14} fill="#0e1430" stroke="#ffe08a" strokeWidth={2.5} /><text y={-8} textAnchor="middle" fill="#ffe08a" style={{ font: `700 18px ${FONT.mono}` }}>To: Meera's phone</text><text y={19} textAnchor="middle" fill="#fff" style={{ font: `700 20px ${FONT.mono}` }}>{num(p.i)}</text></g>}
          {(p.i % 6 === 0 || lost) && p.i !== HERO && <g transform="translate(0 -34)"><rect x={-40} y={-15} width={80} height={28} rx={8} fill="#0e1430" stroke={hero ? '#fff' : '#5fe3ff'} strokeWidth={2} /><text y={6} textAnchor="middle" fill="#eef1ff" style={{ font: `600 17px ${FONT.mono}` }}>{num(p.i)}</text></g>}</g>; }); })}
    {/* the lost one */}
    {(() => { const tl = PK[LOST].dep + 1.3, u = seg(te, tl, tl + 0.4), o = u * (1 - seg(te, RESEND - 0.2, RESEND + 0.4)); if (o <= 0) return null; const q = along(RT, MAIN, 1.5);
      return <g opacity={o} transform={`translate(${q[0]} ${q[1]})`}><circle r={30 + (1 - u) * 30} fill="none" stroke="#ff6a5a" strokeWidth={5} /><path d="M-13 -13 L13 13 M13 -13 L-13 13" stroke="#ff6a5a" strokeWidth={7} strokeLinecap="round" />
        <g transform="translate(-150 -6)"><rect x={-108} y={-22} width={216} height={44} rx={12} fill="#3a0f14" stroke="#ff6a5a" strokeWidth={2.5} /><text y={7} textAnchor="middle" fill="#ffc9c2" style={{ font: `800 20px ${FONT.ui}` }}>{num(LOST)} lost</text></g></g>; })()}
    {te > RESEND - 0.3 && te < RESEND + 2.0 && (() => { const p = RT[0]; return <g opacity={seg(te, RESEND - 0.3, RESEND) * (1 - seg(te, RESEND + 1.5, RESEND + 2.0))} transform={`translate(${p[0] + 190} ${p[1] + 66})`}><rect x={-150} y={-24} width={300} height={48} rx={14} fill="#0e1430" stroke="#fff" strokeWidth={2.5} /><text y={7} textAnchor="middle" fill="#eef1ff" style={{ font: `800 21px ${FONT.ui}` }}>only {num(LOST)} sent again</text></g>; })()}
  </g>; };

/* ---- drawn on the screen: small iPhones that appear only while sending or receiving, and the heading ---- */
type Scr = (p: Pt) => readonly number[];
const TH = 150, THX = SCR.x + (SCR.w - TH) / 2, THY = SCR.y + 96 + 16, GR = 204, GRX = SCR.x + (SCR.w - GR) / 2, GRY = SCR.y + 96 + 12, CELL = GR / 6, MC = 15;
/* one square of the photo, as its own little picture */
const Tile: React.FC<{ i: number; s: number; x: number; y: number; label?: number; glow?: boolean }> = ({ i, s, x, y, label = 0, glow }) => (
  <div style={{ position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: s * 0.12, overflow: 'hidden', boxShadow: glow ? '0 0 16px 3px rgba(95,227,255,.9)' : '0 0 0 1px #0b1030' }}>
    <svg width={s} height={s} viewBox={`${i % 6} ${Math.floor(i / 6)} 1 1`} style={{ display: 'block' }}><Art id={'t' + i} /></svg>
    {label > 0 && <div style={{ position: 'absolute', left: 1, top: 1, padding: '0 3px', borderRadius: 4, background: 'rgba(8,10,30,.78)', font: `700 ${Math.max(9, s * 0.36)}px ${FONT.mono}`, color: '#fff', lineHeight: 1.25, opacity: label }}>{i + 1}</div>}
  </div>);
const Note: React.FC<{ c?: string; children: React.ReactNode }> = ({ c = '#9fe9ff', children }) => <div style={{ font: `600 14px ${FONT.mono}`, color: c, textAlign: 'center', lineHeight: 1.3, whiteSpace: 'nowrap' }}>{children}</div>;
const arc = (a: readonly number[], b: readonly number[], u: number, h: number) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - h * Math.sin(Math.PI * u)] as const;
export const PhotoUI: React.FC<{ te: number; RT: Pt[]; scr: Scr }> = ({ te, RT, scr }) => {
  if (te < 0) return null;
  const W = isWide(), Z = W ? 1.5 : 1.05, ZR = W ? 1.5 : 1.25, PHIS = W ? { x: -340, y: 330 } : { x: 650, y: 470 }, PHER = W ? { x: 1050, y: 440 } : { x: 600, y: 560 };   // wide film: bigger phones, beside the middle column
  const home = scr(RT[0]), cityR = scr(RT[3]);
  const head = te < B_END + 0.2 ? seg(te, B0 - 0.6, B0 - 0.2) : 0, head2 = seg(te, 12.0, 12.4);
  const chip = (txt: string, sub: string, col: string, a: number) => a > 0 ? <div style={{ position: 'absolute', left: 0, right: 0, top: 236, display: 'flex', justifyContent: 'center', opacity: a, transform: `translateY(${(1 - a) * -16}px)` }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 34px 16px', borderRadius: 28, background: 'rgba(10,14,36,.9)', border: `3px solid ${col}`, boxShadow: '0 16px 44px rgba(0,0,0,.5)', textAlign: 'center' }}>
      <div style={{ font: `800 44px/1.05 ${FONT.ui}`, color: '#fff', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{txt}</div>
      <div style={{ font: `600 27px/1.15 ${FONT.mono}`, color: col, whiteSpace: 'nowrap' }}>{sub}</div></div></div> : null;
  /* 1) one big block: he taps send, the whole photo jumps out to his router, the phone is gone */
  const o1 = easeOut(seg(te, 0.9, 1.3)) * (1 - seg(te, 3.5, 3.85)), tap1 = te > 3.02 && te < 3.2, sent1 = te >= 3.15, j1 = easeInOut(seg(te, 3.15, 3.65));
  /* 2) packets: the photo is cut into squares in his phone, he taps send, they all jump out and queue above his router */
  const o2 = easeOut(seg(te, 11.0, 11.4)) * (1 - seg(te, 13.95, 14.3)), grid = seg(te, 12.0, 12.9), tap2 = te > 13.22 && te < 13.4;
  const bst = (i: number) => seg(te, 13.35 + i * 0.012, 13.75 + i * 0.012), mos = (i: number) => [home[0] - 6 + (i % 6) * MC, home[1] - 172 + Math.floor(i / 6) * MC] as const, thumb = (i: number) => [PHIS.x + Z * (THX + (i % 6 + 0.5) * (TH / 6)), PHIS.y + Z * (THY + (Math.floor(i / 6) + 0.5) * (TH / 6))] as const;
  const sentN = PK.filter((p) => te >= p.dep).length, mosO = seg(te, 13.4, 13.8) * (1 - seg(te, PK[N - 1].dep + 0.2, PK[N - 1].dep + 0.8));
  /* 3) her phone shows up only when the first packets are about to arrive; they land in arrival order, then sort by number */
  const o3 = easeOut(seg(te, W ? 16.3 : 24.5, W ? 16.7 : 24.9)), slot = (k: number) => [PHER.x + ZR * (GRX + (k % 6 + 0.5) * CELL), PHER.y + ZR * (GRY + (Math.floor(k / 6) + 0.5) * CELL)] as const;
  const landed = PK.filter((p) => te >= p.arr + HOP).length, sorted = te >= DONE, glow = sorted ? 1 - seg(te, DONE + 0.1, DONE + 1.2) : 0;
  return <>
    {chip('WITHOUT PACKETS', 'the photo as one big piece', '#ffb020', head)}
    {chip('WITH PACKETS', 'what the internet really does', '#5fe3ff', head2)}
    {o1 > 0 && <IPhone left={PHIS.x} top={PHIS.y} o={o1} k={Z} name="Meera" avatar="#ff8672">
      <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}><div style={{ opacity: sent1 ? 0.15 : 1 }}><Pic id="pa" s={TH} tiles={Array(36).fill(true)} grid={0} /></div><Note c="#ffd27a">{sent1 ? 'sending as 1 block…' : 'photo.jpg · 3 MB'}</Note></div>
      <Compose bottom={18} ready={!sent1} press={tap1} text={<span style={{ color: '#6b6b70' }}>{sent1 ? 'iMessage' : '1 photo'}</span>} />
    </IPhone>}
    {sent1 && j1 < 1 && (() => { const q = arc([PHIS.x + Z * (THX + TH / 2), PHIS.y + Z * (THY + TH / 2)], [home[0], home[1] - 34], j1, 120), sz = lerp(TH * Z, 112, j1); return <div style={{ position: 'absolute', left: q[0] - sz / 2, top: q[1] - sz / 2, boxShadow: '0 0 34px rgba(255,180,94,.9)', borderRadius: 10 }}><Pic id="pj" s={sz} tiles={Array(36).fill(true)} grid={0} /></div>; })()}
    {o2 > 0 && <IPhone left={PHIS.x} top={PHIS.y} o={o2} k={Z} name="Meera" avatar="#ff8672">
      <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}><Pic id="pc" s={TH} tiles={PK.map((p) => bst(p.i) <= 0)} grid={grid} /><Note>{grid > 0 ? 'about 2,000 packets' : 'photo.jpg · 3 MB'}</Note></div>
      <Compose bottom={18} ready={te < 13.35} press={tap2} text={<span style={{ color: '#6b6b70' }}>{te < 13.35 ? '1 photo' : 'iMessage'}</span>} />
    </IPhone>}
    {/* the squares in flight from his phone, then waiting above his router until their turn */}
    {te > 13.3 && PK.map((p) => { const u = bst(p.i); if (u <= 0 || te >= p.dep) return null; const q = arc(thumb(p.i), mos(p.i), easeInOut(u), 60 + (p.i % 6) * 8); return <Tile key={'m' + p.i} i={p.i} s={lerp(Z * TH / 6, MC - 1, u)} x={q[0]} y={q[1]} />; })}
    {mosO > 0 && <div style={{ position: 'absolute', left: home[0] - 78, top: home[1] - 226, width: 220, opacity: mosO, textAlign: 'center' }}><span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 12, background: 'rgba(10,14,36,.92)', border: '2px solid #5fe3ff', font: `600 18px ${FONT.mono}`, color: '#eef1ff', whiteSpace: 'nowrap' }}>sent {Math.round((sentN / N) * 2000).toLocaleString('en-US')} of 2,000</span></div>}
    {o3 > 0 && <IPhone left={PHER.x} top={PHER.y} o={o3} k={ZR} name="Arjun" avatar="#3fb8a8">
      <div style={{ position: 'absolute', left: GRX - SCR.x, top: GRY - SCR.y - 96, width: GR, height: GR, borderRadius: 10, background: '#111318', boxShadow: glow > 0 ? `0 0 ${30 * glow}px 4px #5fe3ff` : 'inset 0 0 0 1px #2c2c2e' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: GRY - SCR.y - 96 + GR + 10 }}>{sorted ? <><Note c="#7dffb0">✓ photo received</Note><Note c="#eef1ff">back in order</Note></> : te >= REORD ? <><Note>sorting by number…</Note><Note c="#eef1ff">1, 2, 3, 4 …</Note></> : <><Note>receiving packets</Note><Note c="#eef1ff">{Math.round((landed / N) * 2000).toLocaleString('en-US')} of 2,000</Note></>}</div>
      <Compose bottom={18} text={<span style={{ color: '#6b6b70' }}>iMessage</span>} />
    </IPhone>}
    {/* each packet hops from her city router into the next free slot; at the end every square slides to its own number */}
    {o3 > 0 && PK.map((p) => { const u = (te - p.arr) / HOP; if (u <= 0) return null; const k = SLOT[p.i];
      if (u < 1) { const q = arc(cityR, slot(k), easeInOut(u), 50); return <Tile key={'h' + p.i} i={p.i} s={lerp(30, ZR * CELL - 1, u)} x={q[0]} y={q[1]} glow label={1} />; }
      const r = easeInOut(seg(te, REORD + (p.i % 6) * 0.03, REORD + 0.75 + (p.i % 6) * 0.03)), a = slot(k), b = slot(p.i);
      return <Tile key={'s' + p.i} i={p.i} s={ZR * CELL - (sorted ? 0 : 1)} x={lerp(a[0], b[0], r)} y={lerp(a[1], b[1], r) - 16 * Math.sin(Math.PI * r) * (k === p.i ? 0 : 1)} label={(1 - seg(te, DONE, DONE + 0.4)) * o3} glow={u < 1.6} />; })}
  </>; };
