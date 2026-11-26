// Review 3 · Exterior keyframe (1080 x 1920): three-quarter street view at night. The student's upstairs window
// across the road, the friend walking on this side's pavement, head to toe. The pavement just ahead of him is where
// the two flashes will land later: the line from the window to that patch is kept clear.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, HandHang } from './student';

const W = 1080, H = 1920;
const L = C.line;
type Pt = [number, number];
const VP: Pt = [1010, 860];                         // vanishing point on the horizon (eye height)
const along = (x0: number, y0: number, x: number) => y0 + (VP[1] - y0) * ((x - x0) / (VP[0] - x0)); // y on the line (x0,y0)->VP at x
const S = (d: string, f: string, w = 3, o?: number) => <path d={d} fill={f} stroke={w ? L : 'none'} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" opacity={o} />;
const Ln = (d: string, c = L, w = 2, o = 1) => <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" opacity={o} />;

// facade lines
const ROOF: Pt = [-60, 130], BASE: Pt = [-60, 1100];
const fy = (x: number, f: number) => { const b = along(BASE[0], BASE[1], x), r = along(ROOF[0], ROOF[1], x); return b - f * (b - r); };
const quad = (x0: number, x1: number, f0: number, f1: number) => `M ${x0} ${fy(x0, f0)} L ${x1} ${fy(x1, f0)} L ${x1} ${fy(x1, f1)} L ${x0} ${fy(x0, f1)} Z`;

// ---- the friend, walking right in profile: red jacket, dark trousers, black backpack, white earbud
const F = { skin: '#8a573a', skinSh: '#6a3f28', hair: '#141116', jacket: '#c8352e', jacketSh: '#97231f', jacketHi: '#e2544a', pants: '#2a2d38', pantsSh: '#1c1e27', pack: '#1b1c22', packHi: '#2e3038', shoe: '#ecebe6', sole: '#b9b9c0' };
const Friend: React.FC = () => {
  const leg = (rot: number, fill: string, shoeFill: string) => (
    <g transform={`rotate(${rot} 0 520)`}>
      {S('M -32 500 L 34 500 L 36 560 C 34 680 30 820 28 950 L -14 950 C -18 820 -24 680 -32 560 Z', fill)}
      {S('M -22 944 C -26 960 -26 976 -24 986 L 66 986 C 68 972 58 960 42 956 L 20 946 Z', shoeFill)}
      {S('M -28 980 L 70 980 C 74 988 72 996 66 998 L -24 998 C -30 996 -30 988 -28 980 Z', F.sole, 2.4)}
    </g>
  );
  const arm = (rot: number, fill: string, dark?: boolean) => (
    <g transform={`rotate(${rot} 0 190)`}>
      {S('M -22 176 C 0 178 12 200 12 240 C 12 300 12 400 10 444 L -22 444 C -24 400 -26 300 -28 240 C -32 210 -34 186 -22 176 Z', fill)}
      {S('M -24 440 L 12 440 L 12 466 L -22 466 Z', dark ? '#6e1a18' : F.jacketSh, 2.4)}
      <g transform="translate(-6 462) scale(0.9 1)"><HandHangF dark={dark} /></g>
    </g>
  );
  return (
    <g>
      {arm(16, F.jacketSh, true)}
      {leg(-17, F.pantsSh, '#c9c8c2')}
      {leg(15, F.pants, F.shoe)}
      {/* jacket body */}
      {S('M -40 150 C -64 158 -70 190 -68 240 C -66 320 -62 420 -60 488 L 62 488 C 66 440 70 400 68 360 C 66 300 60 240 52 190 C 44 168 28 156 12 152 Z', F.jacket)}
      <path d="M -40 150 C -64 158 -70 190 -68 240 C -66 320 -62 420 -60 488 L -38 488 C -42 400 -46 300 -46 230 C -46 190 -42 166 -40 150 Z" fill={F.jacketSh} opacity={0.55} />
      {Ln('M 44 180 C 54 260 60 360 58 480', '#5a1210', 2.6)}
      {S('M -60 470 L 62 470 L 62 498 L -60 498 Z', F.jacketSh, 2.4)}
      {/* backpack */}
      {S('M -60 186 C -110 196 -118 300 -110 400 C -106 440 -90 456 -64 456 L -48 456 L -46 190 Z', F.pack)}
      {S('M -104 330 L -58 334 L -58 404 L -100 400 Z', F.packHi, 2.2)}
      {Ln('M -46 196 C -30 210 -20 230 -16 260', '#0c0c10', 9)}
      {/* head: curly hair, earbud */}
      <g transform="translate(-4 0)">
        {S('M -10 112 L -14 178 L 22 178 L 20 112 Z', F.skin)}
        {S('M -24 40 C -20 14 8 4 30 8 C 42 12 48 26 50 40 L 51 54 C 52 58 51 62 54 66 C 58 74 62 82 64 88 C 65 92 62 94 57 94 C 59 98 58 102 55 104 C 58 106 58 112 54 114 C 52 120 50 126 44 130 C 34 136 18 134 8 126 C 0 120 -8 114 -14 112 C -26 100 -30 70 -24 40 Z', F.skin)}
        <path d="M -24 40 C -30 70 -26 100 -14 112 C -6 116 2 120 8 126 C 4 110 2 90 0 70 C -2 56 -10 46 -24 40 Z" fill={F.skinSh} opacity={0.4} />
        {S('M -44 70 C -60 40 -50 0 -20 -12 C 10 -24 44 -16 54 10 C 58 22 56 34 50 40 C 40 30 26 26 14 30 C 4 36 -6 46 -12 58 C -22 60 -34 64 -44 70 Z', F.hair)}
        {[[-40, 20], [-30, -2], [-8, -12], [18, -14], [40, -4], [-46, 48]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14} fill={F.hair} />)}
        {S('M -6 62 C -18 56 -22 80 -14 92 C -10 98 -2 96 0 90 C 2 80 0 68 -6 62 Z', F.skin)}
        {/* earbud */}
        <ellipse cx={-6} cy={76} rx={8} ry={7} fill="#f7f7f4" stroke="#5c626c" strokeWidth={1.8} />
        <rect x={-10} y={79} width={7} height={18} rx={3.5} fill="#f7f7f4" stroke="#5c626c" strokeWidth={1.6} />
        <path d="M 36 66 Q 42 60 48 65 Q 42 70 36 66 Z" fill={C.white} />
        <ellipse cx={45} cy={66} rx={2.6} ry={4} fill={C.eye} />
        <path d="M 35 65 Q 42 58 49 64" fill="none" stroke={L} strokeWidth={3.2} strokeLinecap="round" />
        <path d="M 30 50 Q 40 46 50 51" fill="none" stroke={F.hair} strokeWidth={6.5} strokeLinecap="round" />
        <path d="M 54 80 C 56 84 56 88 52 90" fill="none" stroke={F.skinSh} strokeWidth={2.2} />
        <path d="M 56 104 L 46 104" stroke="#6a3020" strokeWidth={2.6} strokeLinecap="round" />
      </g>
      {/* collar */}
      {S('M -26 150 C -10 138 14 140 30 156 L 26 178 C 12 166 -6 164 -22 172 Z', F.jacketSh, 2.4)}
      {arm(-16, F.jacket)}
    </g>
  );
};
// the hanging hand in the friend's skin tone
const HandHangF: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <g style={{ filter: `brightness(${dark ? 0.55 : 0.72})` }}><HandHang /></g>
);

export const Exterior: React.FC = () => {
  const win = { x0: 296, x1: 440, f0: 0.58, f1: 0.84 };
  const winC: Pt = [(win.x0 + win.x1) / 2 - 14, (fy(win.x0, 0.7) + fy(win.x1, 0.7)) / 2];
  const friend = { x: 210, y: 1662, s: 0.86 };
  const patch: Pt = [610, 1650];
  return (
    <AbsoluteFill style={{ background: '#0b1230' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="x-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070d26" /><stop offset="1" stopColor="#24346a" /></linearGradient>
          <linearGradient id="x-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3b4a72" /><stop offset="1" stopColor="#24304f" /></linearGradient>
          <linearGradient id="x-road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d2440" /><stop offset="1" stopColor="#141a30" /></linearGradient>
          <linearGradient id="x-pave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a4566" /><stop offset="1" stopColor="#242c46" /></linearGradient>
          <radialGradient id="x-moon"><stop offset="0" stopColor="#dfe8ff" stopOpacity={0.7} /><stop offset="1" stopColor="#dfe8ff" stopOpacity={0} /></radialGradient>
          <radialGradient id="x-win"><stop offset="0" stopColor="#ffcf7a" stopOpacity={0.5} /><stop offset="1" stopColor="#ffb050" stopOpacity={0} /></radialGradient>
          <filter id="x-soft"><feGaussianBlur stdDeviation="8" /></filter>
        </defs>
        {/* sky and moon */}
        <rect width={W} height={H} fill="url(#x-sky)" />
        <circle cx={880} cy={170} r={130} fill="url(#x-moon)" /><circle cx={880} cy={170} r={30} fill="#eef2ff" />
        {/* far buildings down the street, all dark */}
        <path d={`M 700 ${along(ROOF[0], ROOF[1], 700)} L 700 520 L 790 520 L 790 600 L 880 600 L 880 700 L 1080 700 L 1080 ${VP[1]} L ${VP[0]} ${VP[1]} Z`} fill="#141c38" />

        {/* ---- the facade across the road, receding to the right */}
        <path d={`M ${ROOF[0]} ${ROOF[1]} L ${VP[0]} ${VP[1]} L ${BASE[0]} ${BASE[1]} Z`} fill="url(#x-wall)" stroke={L} strokeWidth={3} />
        {/* parapet and floor band */}
        <path d={`${quad(-60, 980, 0.95, 1.0)}`} fill="#2a3656" />
        <path d={`${quad(-60, 980, 0.47, 0.5)}`} fill="#2a3656" />
        {/* brick courses in perspective */}
        {Array.from({ length: 16 }, (_, i) => { const f = 0.04 + i * 0.058; return <line key={i} x1={-60} y1={fy(-60, f)} x2={980} y2={fy(980, f)} stroke="#2f3b5c" strokeWidth={2} opacity={0.6} />; })}
        {/* upper windows; the student's is the second one */}
        {[[40, 180], [win.x0, win.x1], [540, 630], [700, 760], [806, 842]].map(([x0, x1], i) => (
          <g key={i}>
            <path d={quad(x0 - 8, x1 + 6, win.f0 - 0.03, win.f1 + 0.02)} fill="#4f5e86" stroke={L} strokeWidth={2.4} />
            <path d={quad(x0, x1, win.f0, win.f1)} fill={i === 1 ? '#2a2a3c' : '#0f1830'} stroke={L} strokeWidth={2} />
            <line x1={(x0 + x1) / 2} y1={fy((x0 + x1) / 2, win.f0)} x2={(x0 + x1) / 2} y2={fy((x0 + x1) / 2, win.f1)} stroke="#4f5e86" strokeWidth={i < 2 ? 10 : 6} />
            <path d={quad(x0, x1, win.f1 - 0.07, win.f1 - 0.055)} fill="#4f5e86" />
          </g>
        ))}
        {/* the student's window: a faint warm glow from his desk bulb, his silhouette at the glass */}
        <clipPath id="x-glass"><path d={quad(win.x0, win.x1, win.f0, win.f1)} /></clipPath>
        <g id="student-window">
          <path d={quad(win.x0, win.x1, win.f0, win.f1)} fill="url(#x-win)" />
          <path clipPath="url(#x-glass)" d={`M ${winC[0] - 30} ${winC[1] + 70} C ${winC[0] - 34} ${winC[1] + 10} ${winC[0] - 20} ${winC[1] - 16} ${winC[0] - 2} ${winC[1] - 18} C ${winC[0] + 16} ${winC[1] - 16} ${winC[0] + 24} ${winC[1] + 4} ${winC[0] + 20} ${winC[1] + 20} C ${winC[0] + 40} ${winC[1] + 30} ${winC[0] + 44} ${winC[1] + 60} ${winC[0] + 44} ${winC[1] + 74} Z`} fill="#0b0d16" opacity={0.85} />
          <line x1={(win.x0 + win.x1) / 2} y1={fy((win.x0 + win.x1) / 2, win.f0)} x2={(win.x0 + win.x1) / 2} y2={fy((win.x0 + win.x1) / 2, win.f1)} stroke="#4f5e86" strokeWidth={10} />
          <path d={quad(win.x0 - 14, win.x1 + 10, win.f0 - 0.035, win.f0 - 0.01)} fill="#6a78a0" stroke={L} strokeWidth={2.4} />
        </g>
        {/* ground floor: shutters and a street door */}
        <path d={quad(20, 260, 0.05, 0.38)} fill="#2b354f" stroke={L} strokeWidth={2.4} />
        {Array.from({ length: 9 }, (_, i) => { const f = 0.07 + i * 0.034; return <line key={i} x1={20} y1={fy(20, f)} x2={260} y2={fy(260, f)} stroke="#1f2840" strokeWidth={2.6} />; })}
        <path d={quad(360, 450, 0.0, 0.4)} fill="#1d2640" stroke={L} strokeWidth={2.4} />
        <path d={quad(520, 680, 0.05, 0.36)} fill="#2b354f" stroke={L} strokeWidth={2.4} />

        {/* ---- far pavement, far curb (its face shows), road, near curb, near pavement */}
        <path d={`M ${BASE[0]} ${BASE[1]} L ${VP[0]} ${VP[1]} L -60 1180 Z`} fill="#323d5c" />
        <path d={`M -60 1180 L ${VP[0]} ${VP[1]} L -60 1214 Z`} fill="#56627f" stroke={L} strokeWidth={2} />
        <path d={`M -60 1214 L ${VP[0]} ${VP[1]} L -60 1410 Z`} fill="url(#x-road)" />
        {/* lane dashes */}
        {[0, 1, 2, 3].map((i) => { const x0 = -40 + i * 250, x1 = x0 + 120 - i * 25; return <path key={i} d={`M ${x0} ${along(-60, 1312, x0)} L ${x1} ${along(-60, 1312, x1)}`} stroke="#8a93ad" strokeWidth={6 - i} opacity={0.6} />; })}
        {/* near curb: the stone's top and its rounded edge */}
        <path d={`M -60 1410 L ${VP[0]} ${VP[1]} L -60 1452 Z`} fill="#6a7694" stroke={L} strokeWidth={2.4} />
        <path d={`M -60 1410 L ${VP[0]} ${VP[1]}`} stroke="#9aa4bd" strokeWidth={3} />
        {/* near pavement */}
        <path d={`M -60 1452 L ${VP[0]} ${VP[1]} L 1080 ${VP[1] + 20} L 1080 1920 L -60 1920 Z`} fill="url(#x-pave)" />
        {Array.from({ length: 6 }, (_, i) => { const y0 = 1540 + i * 110; return <path key={`a${i}`} d={`M -60 ${y0} L ${VP[0]} ${VP[1]}`} stroke="#2a3350" strokeWidth={2.4} opacity={0.8} />; })}
        {Array.from({ length: 9 }, (_, i) => { const x = 40 + i * 120 - i * i * 4; return <path key={`b${i}`} d={`M ${x} ${along(-60, 1452, x)} L ${x - 160 + i * 14} 1920`} stroke="#2a3350" strokeWidth={2.4} opacity={0.8} />; })}

        {/* a dead street lamp on the far pavement, well clear of the window-to-pavement path */}
        <g id="lamp">
          <rect x={792} y={500} width={12} height={along(-60, 1180, 798) - 500} fill="#141a2e" stroke={L} strokeWidth={2} />
          <path d="M 798 506 C 798 476 770 468 748 474" stroke="#141a2e" strokeWidth={10} fill="none" />
          <path d="M 724 468 H 770 L 762 486 H 732 Z" fill="#26304c" stroke={L} strokeWidth={2} />
        </g>

        {/* the patch of pavement where the two flashes will land (no light yet; marked only by the clear path to it) */}
        <g id="flash-target" opacity={0}>
          <ellipse cx={patch[0]} cy={patch[1]} rx={150} ry={38} fill="#ffcf73" />
        </g>

        {/* ---- the friend, head to toe, walking right on this pavement */}
        <ellipse cx={friend.x + 20} cy={friend.y + 4} rx={120} ry={18} fill="#05070f" opacity={0.5} filter="url(#x-soft)" />
        <g id="friend" transform={`translate(${friend.x} ${friend.y - 1000 * friend.s}) scale(${friend.s})`}><Friend /></g>

        {/* cool night light: moon from the upper right, a soft rim on everything */}
        <rect width={W} height={H} fill="#1b2a66" opacity={0.25} style={{ mixBlendMode: 'multiply' }} />
        <circle cx={900} cy={160} r={900} fill="url(#x-moon)" opacity={0.12} style={{ mixBlendMode: 'screen' }} />
      </svg>
    </AbsoluteFill>
  );
};
