import React from 'react';
import { hash, lerp, clamp01, easeOut, easeInOut } from '../lib/anim';
import { FONT } from '../lib/palette';

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
const B0 = 3.0, GLITCH = 7.7, AGAIN = 8.7, B_END = 10.6;
const blockV = (te: number) => te < GLITCH ? 1.9 * easeInOut(seg(te, 3.4, GLITCH)) : te < AGAIN ? 1.9 : 0.6 * easeInOut(seg(te, 9.1, 10.7));
/* ---- the packets: 36 tiles stand for about 2,000 ---- */
const N = 36, P0 = 13.0, LOST = 17, RESEND = 21.0;
export const PK = Array.from({ length: N }).map((_, i) => { const alt = i >= 10 && i % 4 === 2, dep = P0 + i * 0.22, dur = alt ? 3.4 : 2.6; return { i, alt, dep, dur, arr: i === LOST ? RESEND + 2.6 : dep + dur }; });
const DONE = Math.max(...PK.map((p) => p.arr));
const tileCol = (i: number) => ['#ffb45e', '#ff9a6a', '#f07f8f', '#c56fc0', '#8c6fe0', '#5f7fe6'][Math.floor(i / 6)];
const num = (i: number) => '#' + String(i * 57 + 1).padStart(4, '0');

/* the sunset photo, drawn in a 6 x 6 unit box; tiles = which of the 36 squares are present */
const Pic: React.FC<{ id: string; s: number; tiles: boolean[]; grid: number }> = ({ id, s, tiles, grid }) => (
  <svg width={s} height={s} viewBox="0 0 6 6" style={{ display: 'block', borderRadius: 10, background: '#0b1030' }}>
    <defs><linearGradient id={id + 'g'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb45e" /><stop offset=".45" stopColor="#f07f8f" /><stop offset="1" stopColor="#5a4fc0" /></linearGradient>
      <clipPath id={id + 'c'}>{tiles.map((on, i) => on ? <rect key={i} x={i % 6} y={Math.floor(i / 6)} width={1.02} height={1.02} /> : null)}</clipPath></defs>
    <g clipPath={`url(#${id}c)`}><rect width={6} height={6} fill={`url(#${id}g)`} /><circle cx={4.1} cy={2.5} r={1.0} fill="#fff1c4" /><path d="M0 4.3 Q1.5 3.2 3 4.2 T6 3.9 V6 H0 Z" fill="#3b2f7a" /><path d="M0 5 Q2 4.2 4 5 T6 4.8 V6 H0 Z" fill="#241d55" />
      <rect x={1.0} y={3.5} width={1.3} height={1.3} fill="#1a1440" /><path d="M0.8 3.5 L1.65 2.7 L2.5 3.5 Z" fill="#120e30" /><rect x={1.35} y={3.9} width={0.5} height={0.5} fill="#ffd98a" /></g>
    {grid > 0 && Array.from({ length: 5 }).map((_, k) => <g key={k} opacity={grid}><line x1={k + 1} y1={0} x2={k + 1} y2={6} stroke="#0b1030" strokeWidth={0.09} /><line x1={0} y1={k + 1} x2={6} y2={k + 1} stroke="#0b1030" strokeWidth={0.09} /></g>)}
  </svg>);

/* ---- drawn on the map (inside the camera) ---- */
export const PhotoWorld: React.FC<{ te: number; RT: Pt[] }> = ({ te, RT }) => {
  if (te < 0) return null;
  const held = seg(te, B0, B0 + 0.5) * (1 - seg(te, B_END, B_END + 0.8)), v = blockV(te), bp = along(RT, MAIN, v);
  const blockO = seg(te, 3.2, 3.5) * (1 - seg(te, 8.35, 8.6)) + seg(te, AGAIN, AGAIN + 0.3) * (1 - seg(te, B_END, B_END + 0.5)), bad = seg(te, GLITCH, GLITCH + 0.12) * (1 - seg(te, 8.35, 8.6)), shake = bad * Math.sin(te * 70) * 6;
  const qN = (r: number) => Math.max(0, Math.round(Math.min(9, (te - 3.8 - r * 0.3) * (0.9 + r * 0.25)) * (1 - seg(te, B_END + 0.2, B_END + 1.3))));
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
    {te > 12.8 && <polyline points={line(RT, ALT, 0, 3)} fill="none" stroke="#2a8fb0" strokeWidth={4.5} strokeLinecap="round" opacity={0.75 * seg(te, 12.8, 13.6)} />}
    {PK.map((p) => { const lost = p.i === LOST; const runs: [number, number, boolean][] = lost ? [[p.dep, 2.6, true], [RESEND, 2.6, false]] : [[p.dep, p.dur, false]];
      return runs.map(([dep, dur, dies], ri) => { const u = (te - dep) / dur; if (u <= 0 || u >= 1 || (dies && u > 0.5)) return null; const q = along(RT, p.alt ? ALT : MAIN, easeInOut(u) * 3, p.alt ? 20 : 26), hero = lost && !dies;
        return <g key={p.i + '-' + ri} transform={`translate(${q[0]} ${q[1]})`}>{hero && <circle r={46} fill="url(#cPk)" />}<rect x={-17} y={-17} width={34} height={34} rx={7} fill={tileCol(p.i)} stroke={hero ? '#fff' : '#0b1030'} strokeWidth={hero ? 4 : 2.5} />
          {(p.i % 6 === 0 || lost) && <g transform="translate(0 -34)"><rect x={-40} y={-15} width={80} height={28} rx={8} fill="#0e1430" stroke={hero ? '#fff' : '#5fe3ff'} strokeWidth={2} /><text y={6} textAnchor="middle" fill="#eef1ff" style={{ font: `600 17px ${FONT.mono}` }}>{num(p.i)}</text></g>}</g>; }); })}
    {/* the lost one */}
    {(() => { const tl = PK[LOST].dep + 1.3, u = seg(te, tl, tl + 0.4), o = u * (1 - seg(te, RESEND - 0.2, RESEND + 0.4)); if (o <= 0) return null; const q = along(RT, MAIN, 1.5);
      return <g opacity={o} transform={`translate(${q[0]} ${q[1]})`}><circle r={30 + (1 - u) * 30} fill="none" stroke="#ff6a5a" strokeWidth={5} /><path d="M-13 -13 L13 13 M13 -13 L-13 13" stroke="#ff6a5a" strokeWidth={7} strokeLinecap="round" />
        <g transform="translate(-150 -6)"><rect x={-108} y={-22} width={216} height={44} rx={12} fill="#3a0f14" stroke="#ff6a5a" strokeWidth={2.5} /><text y={7} textAnchor="middle" fill="#ffc9c2" style={{ font: `800 20px ${FONT.ui}` }}>{num(LOST)} lost</text></g></g>; })()}
    {te > RESEND - 0.3 && te < RESEND + 2.0 && (() => { const p = RT[0]; return <g opacity={seg(te, RESEND - 0.3, RESEND) * (1 - seg(te, RESEND + 1.5, RESEND + 2.0))} transform={`translate(${p[0] + 150} ${p[1] - 70})`}><rect x={-128} y={-22} width={256} height={44} rx={12} fill="#0e1430" stroke="#fff" strokeWidth={2.5} /><text y={7} textAnchor="middle" fill="#eef1ff" style={{ font: `800 20px ${FONT.ui}` }}>only {num(LOST)} sent again</text></g>; })()}
  </g>; };

/* ---- drawn on the screen: the two phones and the heading ---- */
const Phone: React.FC<{ left: number; top: number; o: number; who: string; where: string; ring: string; children: React.ReactNode }> = ({ left, top, o, who, where, ring, children }) => (
  <div style={{ position: 'absolute', left, top, width: 292, height: 344, borderRadius: 44, background: '#05060f', border: '5px solid #2b3154', boxShadow: '0 30px 80px rgba(0,0,0,.55)', opacity: o, transform: `translateY(${(1 - o) * 30}px)` }}>
    <div style={{ position: 'absolute', inset: 8, borderRadius: 36, background: 'linear-gradient(#141a44,#0d1230)', overflow: 'hidden' }}>
      <div style={{ height: 58, background: '#1c2458', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px' }}><div style={{ width: 34, height: 34, borderRadius: 17, background: ring }} /><div><div style={{ font: `800 21px ${FONT.ui}`, color: '#fff', lineHeight: 1 }}>{who}</div><div style={{ font: `600 14px ${FONT.mono}`, color: '#9fb0ea', marginTop: 3 }}>{where}</div></div></div>
      <div style={{ padding: '12px 14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>{children}</div>
    </div></div>);
const Note: React.FC<{ c?: string; children: React.ReactNode }> = ({ c = '#9fe9ff', children }) => <div style={{ font: `600 17px ${FONT.mono}`, color: c, textAlign: 'center', lineHeight: 1.25, whiteSpace: 'nowrap' }}>{children}</div>;
export const PhotoUI: React.FC<{ te: number }> = ({ te }) => {
  if (te < 0) return null;
  const o = easeOut(seg(te, 0.3, 0.9)), packets = te >= 12.0, grid = seg(te, 12.0, 12.9);
  const left = PK.map((p) => te < p.dep), got = PK.map((p) => te >= p.arr), sent = PK.filter((p) => te >= p.dep).length, recv = got.filter(Boolean).length, done = te >= DONE;
  const blockPct = te < B0 + 0.4 ? 0 : te < 8.35 ? blockV(te) / 3 : te < AGAIN ? 0 : blockV(te) / 3;
  const head = te < B_END + 0.2 ? seg(te, B0 - 0.2, B0 + 0.2) : 0, head2 = seg(te, 12.0, 12.4);
  const chip = (txt: string, sub: string, col: string, a: number) => a > 0 ? <div style={{ position: 'absolute', left: 372, top: 250, width: 400, opacity: a, transform: `translateY(${(1 - a) * -16}px)`, textAlign: 'left' }}>
    <div style={{ display: 'inline-block', padding: '10px 22px', borderRadius: 18, background: 'rgba(10,14,36,.9)', border: `3px solid ${col}`, font: `800 33px ${FONT.ui}`, color: '#fff', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{txt}</div>
    <div style={{ font: `600 22px ${FONT.mono}`, color: col, marginTop: 8, textShadow: '0 2px 6px rgba(0,0,0,.9)' }}>{sub}</div></div> : null;
  return <>
    {chip('WITHOUT PACKETS', 'the photo as one big block', '#ffb020', head)}
    {chip('WITH PACKETS', 'what the internet really does', '#5fe3ff', head2)}
    <Phone left={56} top={250} o={o} who="Him" where="Hyderabad" ring="#3fb8a8">
      <Pic id="pa" s={170} tiles={packets ? left : Array(36).fill(true)} grid={grid} />
      {!packets ? <><Note c={te > GLITCH && te < AGAIN ? '#ff9a8c' : '#ffd27a'}>{te < B0 ? 'photo.jpg · 3 MB' : te > GLITCH && te < AGAIN ? 'failed · sending again' : 'sending as 1 block'}</Note>
        <div style={{ width: 200, height: 10, borderRadius: 5, background: '#232a5c' }}><div style={{ width: `${blockPct * 100}%`, height: 10, borderRadius: 5, background: te > GLITCH && te < AGAIN ? '#ff6a5a' : '#ffb020' }} /></div></>
        : <><Note>about 2,000 packets</Note><Note c="#eef1ff">sent {Math.round((sent / N) * 2000).toLocaleString('en-US')}</Note></>}
    </Phone>
    <Phone left={648} top={880} o={o} who="Her" where="Mumbai" ring="#ff8672">
      <div style={{ boxShadow: done ? `0 0 ${30 * (1 - seg(te, DONE + 0.2, DONE + 1.4)) + 10}px #5fe3ff` : 'none', borderRadius: 10 }}><Pic id="pb" s={170} tiles={got} grid={packets && !done ? 1 : 0} /></div>
      {!packets ? <Note c="#9fb0ea">{te < B0 ? ' ' : 'waiting for the photo…'}</Note> : done ? <><Note c="#7dffb0">✓ photo complete</Note><Note c="#eef1ff">put back in order</Note></> : <><Note>received</Note><Note c="#eef1ff">{Math.round((recv / N) * 2000).toLocaleString('en-US')} of 2,000</Note></>}
    </Phone>
  </>; };
