import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FPS, prog, lerp, easeOut, easeInOut, hash, clamp01 } from '../lib/anim';
import { FONT } from '../lib/palette';
import { IPhone, Compose } from '../dusk/Phone';
import { Charminar, CharminarArt, PaperPhoto, DeskFlag, Chip, Limb, solveWrist, rot2, PY, TB, HS } from './Story';

/* Part 2 hook, the man's side (9:16 only): Arjun's room in Hyderabad at 9:12 pm, same desk style as Meera's London room (locked) but his own colours.
   His phone lies on the desk with the photo ready in the chat to Meera; his right index finger reaches, holds on the send arrow, taps; the photo lifts off the screen. */
export const HYD_ROOM_FRAMES = 150;
export const WIN_PANE = { x0: 672, y0: 142, x1: 812, y1: 372, cx: 741, cy: 256 };   // the window pane the photo breaks (screen pixels)
export const HYD_TIMES = { reach: 0.0, touch: 0.3, tap: 0.4, lift: 0.5, hit: 1.0 };   // the quick version for the 10 s hook: tap, the photo flies at the window, the glass breaks at 1.9 s
const SKIN_A = '#b87a50', SLEEVE: [string, string, string, string] = ['#e0a63a', '#f2c25a', '#a8761e', '#fff1d0'];   // his skin tone and an ochre shirt

/* the window: Hyderabad at night, the lit Charminar, rooftops, an auto-rickshaw passing in the street (one pass over the scene), stars, no rain */
const HydWindow: React.FC<{ t: number }> = ({ t }) => {
  const rickX = 1070 - 150 * t;
  return (<g>
    <defs>
      <linearGradient id="hnSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120c33" /><stop offset="0.6" stopColor="#3a1f5a" /><stop offset="1" stopColor="#b24a3a" /></linearGradient>
      <linearGradient id="hcurt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6e1f33" /><stop offset="0.3" stopColor="#a63a50" /><stop offset="0.6" stopColor="#7e2a3e" /><stop offset="1" stopColor="#9c3448" /></linearGradient>
      <radialGradient id="hFlood"><stop offset="0" stopColor="#ffd38a" stopOpacity={0.75} /><stop offset="1" stopColor="#ffb454" stopOpacity={0} /></radialGradient>
      <clipPath id="hnWin"><rect x={540} y={130} width={500} height={860} rx={6} /></clipPath>
    </defs>
    <g clipPath="url(#hnWin)">
      <rect x={540} y={130} width={500} height={860} fill="url(#hnSky)" />
      {Array.from({ length: 34 }).map((_, i) => <circle key={i} cx={545 + hash(i + 7) * 490} cy={135 + hash(i + 9) * 380} r={1 + hash(i + 11) * 1.6} fill="#fff" opacity={0.45 + 0.4 * Math.abs(Math.sin(t * (1.2 + hash(i) * 2) + i))} />)}
      <circle cx={640} cy={290} r={30} fill="#fff3d6" /><circle cx={654} cy={282} r={27} fill="#1c1240" />
      {/* the Charminar, floodlit */}
      <ellipse cx={790} cy={690} rx={250} ry={190} fill="url(#hFlood)" />
      <g transform="translate(630 448) scale(1.6)"><CharminarArt stone="#d9a05a" shade="#7a4a2c" glow="#ffe7a8" /></g>
      {/* rooftops with lit windows */}
      <g fill="#241438"><rect x={540} y={700} width={150} height={100} /><rect x={560} y={660} width={60} height={40} /><rect x={900} y={690} width={140} height={110} /><rect x={930} y={640} width={50} height={50} /></g>
      {[[560, 720], [600, 720], [640, 740], [920, 710], [960, 710], [1000, 730], [940, 750]].map(([x, y], i) => <rect key={i} x={x} y={y} width={14} height={18} fill="#ffd38a" opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 0.7 + i))} />)}
      {/* the street, with an auto-rickshaw passing */}
      <rect x={540} y={796} width={500} height={194} fill="#1a1024" /><rect x={540} y={800} width={500} height={5} fill="#ffb454" opacity={0.5} />
      <g transform={`translate(${rickX} 838)`}><rect x={-4} y={0} width={106} height={62} rx={14} fill="#f2b81c" /><rect x={-4} y={40} width={106} height={22} fill="#1a1a1a" /><path d="M 6 4 H 90 L 98 -22 H 8 Z" fill="#1a1a1a" /><rect x={14} y={12} width={42} height={24} rx={4} fill="#ffe7a8" /><circle cx={22} cy={66} r={14} fill="#111" /><circle cx={82} cy={66} r={14} fill="#111" /><circle cx={104} cy={30} r={7} fill="#fff7c8" /></g>
    </g>
    <rect x={540} y={130} width={500} height={860} rx={6} fill="none" stroke="#f3e6d0" strokeWidth={22} /><rect x={786} y={130} width={14} height={860} fill="#f3e6d0" /><rect x={540} y={512} width={500} height={14} fill="#f3e6d0" />
    <rect x={522} y={990} width={536} height={24} rx={4} fill="#e6d6bc" /><rect x={522} y={990} width={536} height={4} fill="#fff6e0" opacity={0.7} />
    <rect x={500} y={104} width={600} height={9} rx={4} fill="#5a4630" /><circle cx={500} cy={108} r={10} fill="#8a6a40" /><circle cx={1100} cy={108} r={10} fill="#8a6a40" /><rect x={516} y={104} width={12} height={34} fill="#5a4630" />
    <path d="M 1000 112 H 1090 V 990 Q 1070 1004 1045 990 Q 1022 1004 1000 990 Z" fill="url(#hcurt)" />
    {[1008, 1028, 1048, 1068, 1086].map((x, i) => <path key={x} d={`M ${x} 114 Q ${x + (i % 2 ? 7 : -7)} 540 ${x} 990`} stroke={i % 2 ? '#d98a9a' : '#4a1020'} strokeWidth={5} fill="none" opacity={0.5} />)}
    {[1004, 1030, 1056, 1082].map((x) => <g key={x}><circle cx={x} cy={108} r={9} fill="none" stroke="#c9a15a" strokeWidth={4} /><rect x={x - 6} y={112} width={12} height={22} fill="#6e1f33" /></g>)}
    <path d="M 1000 560 Q 1044 600 1090 560 L 1090 596 Q 1044 636 1000 596 Z" fill="#3a0a18" opacity={0.5} />
  </g>);
};

/* the glass: before the hit a faint glare; at the hit a flash, spider-web cracks, jagged edges stay in the frame and about 40 shards fly out and fall */
const WindowBreak: React.FC<{ t: number; T: { hit: number } }> = ({ t, T }) => {
  const P = WIN_PANE, ts = t - T.hit, w = P.x1 - P.x0, hgt = P.y1 - P.y0;
  const shards = React.useMemo(() => { const cols = 6, rows = 7, pts: [number, number][][] = []; for (let r = 0; r <= rows; r++) { pts.push([]); for (let c = 0; c <= cols; c++) pts[r].push([P.x0 + (c / cols) * w + (c && c < cols ? (hash(r * 9 + c) - 0.5) * 14 : 0), P.y0 + (r / rows) * hgt + (r && r < rows ? (hash(r * 13 + c + 50) - 0.5) * 16 : 0)]); }
    const out: [number, number][][] = []; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const a = pts[r][c], b = pts[r][c + 1], d = pts[r + 1][c], e = pts[r + 1][c + 1]; out.push([a, b, e], [a, e, d]); } return out; }, []);
  const cracks = React.useMemo(() => Array.from({ length: 14 }).map((_, i) => { const ang = (i / 14) * 6.283 + hash(i) * 0.3, len = 50 + hash(i + 3) * 120; let x = P.cx, y = P.cy; const pts = [`${x},${y}`]; for (let k = 1; k <= 4; k++) { const a2 = ang + (hash(i * 7 + k) - 0.5) * 0.5, l = len / 4; x += Math.cos(a2) * l; y += Math.sin(a2) * l; pts.push(`${x},${y}`); } return pts.join(' '); }), []);
  const glare = t < T.hit ? 0.1 : 0;
  return (<g>
    <clipPath id="paneClip"><rect x={P.x0} y={P.y0} width={w} height={hgt} /></clipPath>
    {glare > 0 && <g clipPath="url(#paneClip)" opacity={glare}>{[0, 1, 2].map((i) => <polygon key={i} points={`${P.x0 + 20 + i * 52},${P.y0} ${P.x0 + 44 + i * 52},${P.y0} ${P.x0 - 40 + i * 52},${P.y1} ${P.x0 - 64 + i * 52},${P.y1}`} fill="#fff" />)}</g>}
    {ts > 0 && ts < 0.18 && <circle cx={P.cx} cy={P.cy} r={20 + ts * 700} fill="#fff" opacity={0.85 * (1 - ts / 0.18)} />}
    {ts > 0 && <g opacity={0.9 - 0.4 * clamp01(ts / 0.8)} clipPath="url(#paneClip)">{cracks.map((c, i) => <polyline key={i} points={c} fill="none" stroke="#fff" strokeWidth={2.2} strokeLinejoin="round" />)}
      {[40, 90].map((r, i) => <polygon key={i} points={cracks.map((c, k) => { const p = c.split(' ')[1 + i]; return p; }).join(' ')} fill="none" stroke="#dff4ff" strokeWidth={1.4} opacity={0.8} />)}</g>}
    {ts > 0 && shards.map((s, i) => { const cxs = (s[0][0] + s[1][0] + s[2][0]) / 3, cys = (s[0][1] + s[1][1] + s[2][1]) / 3, dx = cxs - P.cx, dy = cys - P.cy, d = Math.hypot(dx, dy) + 1, sp = 160 + hash(i + 70) * 260, vx = (dx / d) * sp * 0.6, vy = (dy / d) * sp * 0.6 - 60, om = (hash(i + 90) - 0.5) * 12;
      const x = vx * ts, y = vy * ts + 900 * ts * ts, op = ts < 0.25 ? 0.8 : 0.8 * (1 - clamp01((ts - 0.25) / 0.85)); if (op <= 0) return null;
      return <polygon key={i} transform={`translate(${x} ${y}) rotate(${om * ts * 57} ${cxs} ${cys})`} points={s.map((p) => p.join(',')).join(' ')} fill="rgba(190,230,255,.38)" stroke="#fff" strokeWidth={1} opacity={op} />; })}
    {ts > 0.1 && [[P.x0, P.y0, 26, 16], [P.x0 + 60, P.y0, 18, 22], [P.x1 - 40, P.y0, 24, 18], [P.x1, P.y0 + 90, -22, 24], [P.x0, P.y1 - 60, 24, -20], [P.x0 + 50, P.y1, 20, -24], [P.x1 - 30, P.y1, 26, -18], [P.x1, P.y1 - 70, -20, -22]].map(([x, y, dx, dy], i) => <polygon key={i} points={`${x},${y} ${x + dx},${y} ${x},${y + dy}`} fill="rgba(235,248,255,.5)" />)}
  </g>);
};

export const HydRoom: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS, T = HYD_TIMES;
  const u = easeInOut(prog(f, T.reach, T.touch)), point = prog(f, T.reach + 0.05, T.touch - 0.05, easeOut), lift = prog(f, T.reach, T.reach + 0.3, easeOut) * (1 - 0.75 * prog(f, T.touch - 0.2, T.touch));
  const tapP = prog(f, T.tap, T.tap + 0.6), press = prog(f, T.tap, T.tap + 0.25, easeOut) * (1 - prog(f, T.tap + 0.25, T.tap + 0.6));
  const sending = t >= T.tap, delivered = t >= T.tap + 0.65;
  // his phone (cherry, 18 Pro look) lies on the desk, turned a little
  const PK = 0.62, PW2 = 236 * PK, PH2 = 484 * PK, cx = 560, cy = 1330, th = -9, pcy = (cy - TB) / PY;
  const [tdx, tdy] = rot2(85.5 * PK, 209 * PK, th), target: [number, number] = [cx + tdx, pcy + tdy];            // the send arrow on his screen
  const anchorR: [number, number] = [900, 1650], anchorL: [number, number] = [270, 1650], bendEnd = -8;
  const wEnd = solveWrist(anchorR, target, [-22 * HS, -150 * HS], bendEnd), w0: [number, number] = [830, 770];
  const arc = Math.sin(Math.PI * u) * 30, wR: [number, number] = [lerp(w0[0], wEnd[0], u) + arc + Math.sin(t * 2.2) * 2 * (1 - u), lerp(w0[1], wEnd[1], u) + Math.sin(t * 3.1) * 1.5 * (1 - u)];
  const wL: [number, number] = [330 + Math.sin(t * 1.7) * 2, 800 + Math.sin(t * 2.6) * 1.5];
  const [pbx, pby] = rot2(15 * PK, 3 * PK, th);
  const sx = cx + pbx, sy = TB + (pcy + pby) * PY;                                                              // the photo starts on his screen
  const a1 = clamp01((t - T.lift) / (T.hit - T.lift)), a2 = clamp01((t - T.hit) / 0.9);                         // 1: flies at the window. 2: through the broken glass and away
  const flying = t >= T.lift, e1 = a1 * a1 * (3 - 2 * a1), ghostX = lerp(sx, WIN_PANE.cx, e1) + (t >= T.hit ? lerp(0, 150, a2) : 0), ghostY = lerp(sy, WIN_PANE.cy, e1) - (t >= T.hit ? lerp(0, 160, a2) : 0);
  const gScale = t < T.hit ? lerp(1, 0.78, e1) : lerp(0.78, 0.3, a2), gOp = t < T.hit ? 1 : 1 - clamp01((a2 - 0.6) / 0.4);
  return (
    <AbsoluteFill style={{ background: '#2a1a2e' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 860, background: 'linear-gradient(180deg,#3a2540 0%,#4a2f45 70%,#3a2438 100%)' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <linearGradient id="wood3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9794a" /><stop offset="1" stopColor="#9a5e34" /></linearGradient>
          <linearGradient id="floor3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#40283a" /><stop offset="1" stopColor="#2a1626" /></linearGradient>
          <radialGradient id="lampPool3"><stop offset="0" stopColor="#ffd89a" stopOpacity={0.75} /><stop offset="1" stopColor="#ffb454" stopOpacity={0} /></radialGradient>
          <radialGradient id="scrGlow3"><stop offset="0" stopColor="#ffe3b0" stopOpacity={0.45} /><stop offset="1" stopColor="#ffe3b0" stopOpacity={0} /></radialGradient>
          <filter id="blur6" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" /></filter><filter id="blur3"><feGaussianBlur stdDeviation="3.5" /></filter></defs>
        <g transform="translate(300 40) scale(0.66)"><HydWindow t={t} /></g>
        {/* wall clock showing Hyderabad time, 9:12, with a sweeping second hand */}
        <g transform="translate(250 330)">
          <circle r={128} cy={8} fill="#000" opacity={0.35} filter="url(#blur6)" />
          <circle r={124} fill="#d9a13a" stroke="#a87420" strokeWidth={6} /><circle r={108} fill="#fdf3e4" stroke="#c9a15a" strokeWidth={3} />
          {Array.from({ length: 60 }).map((_, i) => { const a = (i * 6 * Math.PI) / 180, big = i % 5 === 0; return <line key={i} x1={Math.sin(a) * (big ? 86 : 94)} y1={-Math.cos(a) * (big ? 86 : 94)} x2={Math.sin(a) * 102} y2={-Math.cos(a) * 102} stroke="#3a2a22" strokeWidth={big ? 5 : 2} strokeLinecap="round" />; })}
          {[[12, 0, -64], [3, 62, 10], [6, 0, 84], [9, -62, 10]].map(([n, x, y]) => <text key={n} x={x} y={y} textAnchor="middle" fill="#3a2a22" style={{ font: `800 30px ${FONT.ui}` }}>{n}</text>)}
          <text y={36} textAnchor="middle" fill="#a87420" style={{ font: `800 12px ${FONT.ui}`, letterSpacing: '0.12em' }}>HYDERABAD</text>
          <g transform={`rotate(${9 * 30 + 12 * 0.5})`}><rect x={-5} y={-62} width={10} height={72} rx={5} fill="#2a1a20" /></g>
          <g transform="rotate(72)"><rect x={-3.6} y={-92} width={7.2} height={104} rx={3.6} fill="#2a1a20" /></g>
          <g transform={`rotate(${(t % 60) * 6})`}><rect x={-1.6} y={-100} width={3.2} height={124} rx={1.6} fill="#d6252d" /><circle cy={20} r={5} fill="#d6252d" /></g>
          <circle r={8} fill="#d6252d" /><circle r={3} fill="#fdf3e4" />
        </g>
        <rect x={0} y={840} width={1080} height={26} fill="#e8d9c0" />
        <rect x={0} y={866} width={1080} height={1054} fill="url(#floor3)" />{Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M 0 ${880 + i * 105} L 1080 ${880 + i * 105}`} stroke="#1a0c16" strokeWidth={2} opacity={0.5} />)}
        <polygon points="-40,1700 1120,1700 1160,1920 -80,1920" fill="#7a2a3a" /><polygon points="-20,1730 1100,1730 1130,1920 -50,1920" fill="none" stroke="#f1d9a8" strokeWidth={6} opacity={0.85} />{Array.from({ length: 9 }).map((_, i) => <polygon key={i} points={`${60 + i * 120},1780 ${84 + i * 120},1806 ${60 + i * 120},1832 ${36 + i * 120},1806`} fill="#e8b04a" opacity={0.85} />)}
        <ellipse cx={540} cy={1700} rx={640} ry={46} fill="#000" opacity={0.45} filter="url(#blur6)" />
        <polygon points="-40,905 1120,905 1260,1500 -180,1500" fill="url(#wood3)" />{Array.from({ length: 9 }).map((_, i) => { const y = 935 + i * 66; return <path key={i} d={`M -40 ${y} Q 540 ${y + 6} 1120 ${y}`} stroke="#6a3c1c" strokeWidth={2} fill="none" opacity={0.3} />; })}
        <rect x={-180} y={1500} width={1440} height={50} fill="#7a4624" /><rect x={-180} y={1500} width={1440} height={5} fill="#e0a56e" />
        <rect x={-180} y={1550} width={1440} height={150} fill="#5a3218" /><rect x={300} y={1572} width={480} height={104} rx={8} fill="#6a3c1c" stroke="#8a5530" strokeWidth={4} /><rect x={500} y={1612} width={80} height={14} rx={7} fill="#e0b07a" />
        <ellipse cx={850} cy={1085} rx={230} ry={62} fill="url(#lampPool3)" />
        <ellipse cx={cx} cy={cy + 20} rx={230} ry={90} fill="url(#scrGlow3)" />
      </svg>
      {/* flat things: notebook, pen, the phone's shadow, the phone */}
      <div style={{ position: 'absolute', left: 0, top: TB, width: 1080, height: 1800, transformOrigin: '0 0', transform: `scale(1, ${PY})` }}>
        <svg width={1080} height={1800} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <g transform="translate(260 790) rotate(-4)">
            <rect x={-158} y={-112} width={316} height={240} rx={10} fill="#000" opacity={0.35} transform="translate(8 12)" filter="url(#blur3)" />
            <rect x={-156} y={-110} width={312} height={236} rx={10} fill="#3a4a6a" /><rect x={-150} y={-108} width={150} height={228} rx={8} fill="#f1e7d3" /><rect x={0} y={-108} width={150} height={228} rx={8} fill="#f6efe0" />
            <rect x={-40} y={-108} width={40} height={228} fill="#cfc2a8" opacity={0.55} /><rect x={0} y={-108} width={30} height={228} fill="#d9ceb6" opacity={0.5} /><rect x={-2.5} y={-108} width={5} height={228} fill="#9d8f74" />
            {Array.from({ length: 7 }).map((_, i) => <g key={i}><line x1={-136} y1={-80 + i * 30} x2={-12} y2={-80 + i * 30} stroke="#9fb4d0" strokeWidth={2} /><line x1={14} y1={-80 + i * 30} x2={136} y2={-80 + i * 30} stroke="#9fb4d0" strokeWidth={2} /></g>)}
            <path d="M -126 -84 q 22 -12 44 0 t 44 0 M -126 -54 q 24 -10 48 0 t 40 0" stroke="#7a2a3a" strokeWidth={3.4} fill="none" opacity={0.7} />
          </g>
          <g transform="translate(440 880) rotate(76)"><rect x={-84} y={-5} width={176} height={14} rx={7} fill="#000" opacity={0.35} /><rect x={-86} y={-8} width={176} height={14} rx={7} fill="#7a2a3a" /><rect x={-86} y={-8} width={44} height={14} rx={7} fill="#c9a15a" /><polygon points="90,-6 108,-1 90,4" fill="#e8c9a0" /></g>
          <g transform={`translate(${cx + 7} ${pcy + 10}) rotate(${th})`}><rect x={-PW2 / 2} y={-PH2 / 2} width={PW2} height={PH2} rx={22} fill="#000" opacity={0.45} filter="url(#blur3)" /></g>
        </svg>
        <div style={{ position: 'absolute', left: cx - PW2 / 2, top: pcy - PH2 / 2, width: PW2, height: PH2, transform: `rotate(${th}deg)`, transformOrigin: '50% 50%' }}>
          <IPhone v18 left={0} top={0} o={1} name="Meera" avatar="#e0705a" k={PK}>
            <div style={{ position: 'absolute', left: 8, top: 6, background: '#26252a', color: '#fff', borderRadius: '14px 14px 14px 4px', padding: '5px 10px', font: `700 15px ${FONT.ui}` }}>Send me a photo!</div>
            <div style={{ position: 'absolute', left: 36, top: 52, width: 176, height: 176, borderRadius: 14, overflow: 'hidden', border: '2px solid #0a84ff', opacity: sending ? 1 : 0.8 }}><svg width={176} height={176} viewBox="0 0 190 190"><Charminar /></svg></div>
            <div style={{ position: 'absolute', right: 10, top: 232, font: `700 11px ${FONT.ui}`, color: delivered ? '#7dffb0' : '#8e8e93' }}>{delivered ? 'Delivered' : sending ? 'Sending…' : 'Not sent'}</div>
            <Compose bottom={8} text={<span style={{ color: '#8e8e93' }}>Message</span>} press={press > 0.2} ready />
          </IPhone>
        </div>
      </div>
      {/* things that stand up */}
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
        {/* a framed picture of the dog */}
        <ellipse cx={340} cy={1122} rx={74} ry={13} fill="#000" opacity={0.5} filter="url(#blur3)" />
        <path d="M 340 1040 L 300 1118 L 380 1118 Z" fill="#4a2e1a" opacity={0.8} />
        <rect x={286} y={972} width={108} height={136} rx={8} fill="#5a3a22" stroke="#3a2210" strokeWidth={3} /><rect x={296} y={982} width={88} height={116} fill="#fdf3e4" /><svg x={300} y={988} width={80} height={104} viewBox="0 0 190 190" preserveAspectRatio="xMidYMid slice"><Charminar /></svg>
        <rect x={298} y={1080} width={84} height={22} rx={4} fill="#d9b25a" stroke="#8a6a20" strokeWidth={1.5} /><text x={340} y={1096} textAnchor="middle" fill="#3a2a10" style={{ font: `800 15px ${FONT.ui}`, letterSpacing: '0.12em' }}>ROCKY</text>
        {/* a tulsi plant in a clay pot */}
        <ellipse cx={140} cy={1124} rx={50} ry={11} fill="#000" opacity={0.5} filter="url(#blur3)" />
        <path d="M 107 1064 L 173 1064 L 165 1120 L 115 1120 Z" fill="#c0634a" /><ellipse cx={140} cy={1120} rx={25} ry={5} fill="#8a3f2a" /><rect x={101} y={1054} width={78} height={14} rx={5} fill="#d6785a" />
        {[-34, -12, 8, 28, 46].map((a, i) => <path key={i} d={`M 140 1056 Q ${140 + a * 0.9} ${1004 - (i % 2) * 14} ${140 + a * 1.2} ${966 + (i % 3) * 12}`} stroke="#3f8a4a" strokeWidth={8} fill="none" strokeLinecap="round" />)}
        {[-34, -12, 8, 28, 46].map((a, i) => <ellipse key={i} cx={140 + a * 1.2} cy={966 + (i % 3) * 12} rx={19} ry={10} fill="#4fa05a" transform={`rotate(${a * 1.3} ${140 + a * 1.2} ${966 + (i % 3) * 12})`} />)}
        <DeskFlag x={520} y={1128} kind="in" t={t} id="flagIN" />
        {/* the lamp */}
        <ellipse cx={855} cy={1086} rx={74} ry={15} fill="#000" opacity={0.5} filter="url(#blur6)" />
        <ellipse cx={855} cy={1076} rx={52} ry={12} fill="#2a1e18" /><rect x={803} y={1062} width={104} height={14} fill="#3a2a22" /><ellipse cx={855} cy={1062} rx={52} ry={12} fill="#4a3a30" /><ellipse cx={855} cy={1060} rx={30} ry={6} fill="#5a4838" />
        <rect x={849} y={830} width={12} height={232} fill="#4a3a30" /><rect x={845} y={828} width={20} height={10} rx={3} fill="#6a5a46" />
        <rect x={838} y={800} width={34} height={30} rx={6} fill="#6a5a46" /><rect x={838} y={812} width={34} height={5} fill="#3a2a22" /><circle cx={855} cy={796} r={13} fill="#fff3c8" opacity={0.95} />
        <path d="M 805 794 L 905 794 L 880 706 L 830 706 Z" fill="#ff9e5e" /><ellipse cx={855} cy={794} rx={50} ry={8} fill="#ffe7b0" /><ellipse cx={855} cy={706} rx={25} ry={5} fill="#e0824a" />
        {/* Irani chai in a glass on a saucer, with biscuits */}
        <ellipse cx={760} cy={1215} rx={70} ry={14} fill="#000" opacity={0.4} filter="url(#blur3)" />
        <ellipse cx={760} cy={1206} rx={64} ry={13} fill="#f3e6d0" stroke="#c9b898" strokeWidth={2} /><ellipse cx={760} cy={1204} rx={40} ry={8} fill="#e8d9c0" />
        {[[712, 1210], [800, 1212]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={13} ry={6} fill="#e8b878" stroke="#b88a52" strokeWidth={1.4} />)}
        <path d="M 738 1130 L 782 1130 L 776 1198 L 744 1198 Z" fill="#c58a52" opacity={0.95} /><path d="M 738 1130 L 782 1130 L 779 1150 L 741 1150 Z" fill="#fff6e8" opacity={0.55} /><path d="M 738 1130 L 782 1130 L 776 1198 L 744 1198 Z" fill="none" stroke="#fff" strokeWidth={2.4} opacity={0.65} />
        <ellipse cx={760} cy={1130} rx={22} ry={5} fill="#e8c898" /><ellipse cx={760} cy={1131} rx={18} ry={3.4} fill="#a8683a" />
        {[0, 1, 2].map((i) => { const ph = (t * 0.7 + i * 0.33) % 1; return <path key={i} d={`M ${748 + i * 12} 1124 q 9 -22 0 -44 q -9 -20 0 -36`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.3 * (1 - ph)} strokeLinecap="round" transform={`translate(0 ${-ph * 40})`} />; })}
        {/* the photo flies at the window and breaks the glass */}
        {flying && <g transform={`translate(${ghostX} ${ghostY}) scale(${gScale * 1.15})`} opacity={gOp}><PaperPhoto size={110} t={t} spin={-6 * e1} /></g>}
        <WindowBreak t={t} T={T} />
      </svg>
      {/* his hands: the left rests on the desk, the right reaches and taps send */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, clipPath: 'inset(0 0 190px 0)' }}>
        <div style={{ position: 'absolute', left: 0, top: TB, width: 1080, height: 1800, transformOrigin: '0 0', transform: `scale(1, ${PY})` }}>
          <svg width={1080} height={1800} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
            <Limb anchor={anchorL} wrist={wL} side={-1} type={0.35 * (1 - u)} t={t} ph={0} skin={SKIN_A} sleeve={SLEEVE} />
            <Limb anchor={anchorR} wrist={wR} side={1} bend={lerp(0, bendEnd, u)} t={t} ph={0.9} point={point} lift={lift} skin={SKIN_A} sleeve={SLEEVE} />
            {tapP > 0 && tapP < 1 && [0, 1].map((i) => { const p = clamp01((tapP - i * 0.25) / 0.75); return p > 0 ? <ellipse key={i} cx={target[0]} cy={target[1]} rx={10 + p * 44} ry={10 + p * 44} fill="none" stroke="#fff3d0" strokeWidth={5 * (1 - p)} opacity={0.9 * (1 - p)} /> : null; })}
          </svg>
        </div>
      </div>
      <Chip text="HYDERABAD · 9:12 pm" col="#ffb454" top={482} left={36} />
    </AbsoluteFill>
  );
};
