import { AbsoluteFill } from 'remotion';
import { FR, Friend, STU, Student, WindowFrame } from './parts';

// Five art-direction stills for "How You'd Invent a Flashlight". All drawn in SVG + CSS; no images.
// Room layout (locked): door on the LEFT, desk + physics board in the MIDDLE, second-floor window on the RIGHT.
// Light: warm amber before the blackout (still 1), cool blue after it (stills 2-5); the torch is the only warm light later.

const INK = '#140f12';
const W = 1080, H = 1920;
const Svg: React.FC<{ children: React.ReactNode; vb?: string; style?: React.CSSProperties }> = ({ children, vb = `0 0 ${W} ${H}`, style }) =>
  <svg width={W} height={H} viewBox={vb} style={{ position: 'absolute', inset: 0, ...style }}>{children}</svg>;

// ================================================================ the street (stills 2 and 5 share it exactly)
// a 1080 x 1920 street-level view of the building: the student's second-floor window above, the pavement below
const WIN = { x: 400, y: 470, w: 290, h: 400 };
const Street: React.FC<{ beam?: boolean }> = ({ beam }) => (
  <g>
    <defs>
      <linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1330" /><stop offset="1" stopColor="#24345e" /></linearGradient>
      <linearGradient id="st-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a4a6c" /><stop offset="1" stopColor="#26324e" /></linearGradient>
      <linearGradient id="st-pave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b4560" /><stop offset="1" stopColor="#1c2236" /></linearGradient>
      <linearGradient id="st-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd98a" stopOpacity={0.85} /><stop offset="1" stopColor="#ffb54d" stopOpacity={0.18} /></linearGradient>
      <radialGradient id="st-pool"><stop offset="0" stopColor="#ffd27a" stopOpacity={0.75} /><stop offset="1" stopColor="#ffb04a" stopOpacity={0} /></radialGradient>
      <radialGradient id="st-moon"><stop offset="0" stopColor="#dfe9ff" stopOpacity={0.9} /><stop offset="1" stopColor="#dfe9ff" stopOpacity={0} /></radialGradient>
      <filter id="st-blur"><feGaussianBlur stdDeviation="14" /></filter>
    </defs>
    <rect x={-300} width={W + 600} height={H} fill="url(#st-sky)" />
    <circle cx={880} cy={120} r={120} fill="url(#st-moon)" opacity={0.5} /><circle cx={880} cy={120} r={26} fill="#e8eeff" opacity={0.85} />
    {/* building */}
    <rect x={-300} y={230} width={1680} height={1210} fill="url(#st-wall)" stroke={INK} strokeWidth={3} />
    <rect x={-300} y={230} width={1680} height={34} fill="#2a3654" stroke={INK} strokeWidth={3} />
    {Array.from({ length: 22 }, (_, i) => <line key={i} x1={-300} y1={300 + i * 52} x2={1380} y2={300 + i * 52} stroke="#2f3c5c" strokeWidth={2} opacity={0.6} />)}
    {/* neighbouring dark windows keep the facade believable */}
    {[90, 790].map((x) => <g key={x} transform={`translate(${x} ${WIN.y + 40})`}><WindowFrame w={190} h={320} frame="#46557a" frameSh="#2c3756" glass={<rect width={190} height={320} fill="#101a30" />} /></g>)}
    {/* THE window, same casement + transom as from inside */}
    <g transform={`translate(${WIN.x} ${WIN.y})`}>
      <WindowFrame w={WIN.w} h={WIN.h} frame="#5b6b92" frameSh="#36436a" glass={<>
        <rect width={WIN.w} height={WIN.h} fill={beam ? '#3c3326' : '#121c34'} />
        {/* the student, a dark shape behind the glass */}
        <g transform="translate(150 90) scale(0.42)" opacity={0.9}>
          <ellipse cx={60} cy={110} rx={78} ry={92} fill="#0a0f1c" />
          <path d="M -60 200 C -20 170 140 170 180 200 L 200 600 L -80 600 Z" fill="#0a0f1c" />
        </g>
        {beam && <><circle cx={150} cy={250} r={90} fill="#ffcf73" opacity={0.35} filter="url(#st-blur)" /><circle cx={150} cy={250} r={16} fill="#fff6d8" /></>}
        <path d={`M 20 20 L ${WIN.w * 0.45} 20 L 20 ${WIN.h * 0.5} Z`} fill="#9fb6e6" opacity={0.1} />
      </>} />
    </g>
    {/* ground floor: a shuttered shop and the street door */}
    <rect x={-300} y={1060} width={1680} height={20} fill="#2a3654" stroke={INK} strokeWidth={3} />
    <rect x={60} y={1120} width={420} height={320} fill="#2b354f" stroke={INK} strokeWidth={3} />
    {Array.from({ length: 11 }, (_, i) => <line key={i} x1={60} y1={1140 + i * 28} x2={480} y2={1140 + i * 28} stroke="#1f2840" strokeWidth={3} />)}
    <rect x={620} y={1110} width={180} height={330} fill="#1d2640" stroke={INK} strokeWidth={3} />
    <circle cx={780} cy={1290} r={6} fill="#5b6b92" />
    {/* a dead street lamp (the power is out); it sits clear of the right edge */}
    <rect x={892} y={760} width={14} height={680} fill="#1b2238" stroke={INK} strokeWidth={2} />
    <path d="M 899 770 C 899 730 860 720 830 730" stroke="#1b2238" strokeWidth={12} fill="none" /><path d="M 800 722 H 860 L 850 744 H 810 Z" fill="#2c3550" stroke={INK} strokeWidth={2} />
    {/* pavement and kerb */}
    <rect x={-300} y={1440} width={1680} height={500} fill="url(#st-pave)" />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-380 + i * 170} y1={1440} x2={-680 + i * 210} y2={1800} stroke="#2a3149" strokeWidth={3} />)}
    {[1530, 1640].map((y) => <line key={y} x1={-300} y1={y} x2={1380} y2={y} stroke="#2a3149" strokeWidth={3} />)}
    <rect x={-300} y={1800} width={1680} height={26} fill="#545e78" stroke={INK} strokeWidth={3} />
    <rect x={-300} y={1826} width={1680} height={120} fill="#14182a" />
    {beam && <>
      <path d={`M ${WIN.x + 134} ${WIN.y + 240} L ${WIN.x + 168} ${WIN.y + 260} L 690 1690 L 300 1690 Z`} fill="url(#st-beam)" style={{ mixBlendMode: 'screen' }} />
      <ellipse cx={495} cy={1690} rx={230} ry={56} fill="url(#st-pool)" />
      {Array.from({ length: 26 }, (_, i) => { const t = (i * 37) % 100 / 100, s = (i * 53) % 100 / 100; return <circle key={i} cx={WIN.x + 150 + (s - 0.5) * 260 * t + (495 - WIN.x - 150) * t} cy={WIN.y + 250 + (1690 - WIN.y - 250) * t} r={1.6 + 1.4 * s} fill="#fff1c9" opacity={0.6 - 0.3 * t} />; })}
    </>}
  </g>
);
// the friend's mark on the pavement, under the window
const FRIEND_AT = 'translate(380 1100) scale(0.66)';

// ================================================================ 1 · the room before the blackout
export const S1Room: React.FC = () => (
  <AbsoluteFill style={{ background: '#2a1a12' }}>
    <Svg>
      <defs>
        <linearGradient id="r-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8a5a3c" /><stop offset="1" stopColor="#5d3a26" /></linearGradient>
        <linearGradient id="r-left" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3e2618" /><stop offset="1" stopColor="#6a442e" /></linearGradient>
        <linearGradient id="r-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6e4428" /><stop offset="1" stopColor="#3a2215" /></linearGradient>
        <linearGradient id="r-dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2c3c78" /><stop offset="0.55" stopColor="#c4697a" /><stop offset="1" stopColor="#f0a868" /></linearGradient>
        <radialGradient id="r-lamp" cx="0.5" cy="0.12" r="0.75"><stop offset="0" stopColor="#ffcf7a" stopOpacity={0.55} /><stop offset="0.5" stopColor="#ffb456" stopOpacity={0.16} /><stop offset="1" stopColor="#ffb456" stopOpacity={0} /></radialGradient>
        <radialGradient id="r-bulb"><stop offset="0" stopColor="#fff4d2" /><stop offset="1" stopColor="#ffcf7a" stopOpacity={0} /></radialGradient>
        <filter id="r-soft"><feGaussianBlur stdDeviation="10" /></filter>
        <filter id="r-fg"><feGaussianBlur stdDeviation="3.5" /></filter>
      </defs>
      {/* back wall, ceiling line, floor */}
      <rect width={W} height={1330} fill="url(#r-wall)" />
      <path d="M 0 150 L 1080 150" stroke="#4a2e1e" strokeWidth={4} />
      <path d="M 0 1330 L 1080 1330 L 1080 1920 L 0 1920 Z" fill="url(#r-floor)" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={540 + (i - 5.5) * 70} y1={1330} x2={540 + (i - 5.5) * 260} y2={1920} stroke="#4e2f1c" strokeWidth={3} />)}
      <rect x={0} y={1310} width={W} height={24} fill="#4a2e1e" />
      {/* rug: leaves the lower centre calm for captions */}
      <ellipse cx={600} cy={1640} rx={360} ry={120} fill="#7d3b30" opacity={0.55} />
      <ellipse cx={600} cy={1640} rx={320} ry={100} fill="none" stroke="#b86b4e" strokeWidth={4} opacity={0.4} />

      {/* MIDDLE: the physics board */}
      <g transform="translate(350 420)">
        <rect x={-14} y={-14} width={438} height={348} rx={8} fill="#3a2a22" stroke={INK} strokeWidth={3} />
        <rect width={410} height={320} fill="#eef0e6" />
        <g stroke="#2d4f8a" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* battery + bulb circuit */}
          <path d="M 40 70 H 110 M 110 50 V 90 M 124 60 V 80 M 124 70 H 200 V 150 H 40 V 70" />
          <circle cx={200} cy={110} r={18} /><path d="M 188 98 L 212 122 M 212 98 L 188 122" />
          {/* V = IR */}
          <text x={250} y={86} fill="#2d4f8a" stroke="none" style={{ font: '700 34px Inter' }}>V = I·R</text>
          {/* a curved mirror with parallel rays: the idea he hasn't had yet */}
          <path d="M 330 190 C 300 214 300 276 330 300" stroke="#b5432f" />
          <path d="M 318 245 L 396 226 M 318 245 L 396 245 M 318 245 L 396 264" stroke="#b5432f" strokeDasharray="6 8" />
          <path d="M 40 210 Q 90 170 140 210 T 240 210" />
          <text x={40} y={290} fill="#2d4f8a" stroke="none" style={{ font: '500 26px Inter' }}>P = V²/R ?</text>
        </g>
        <rect x={8} y={322} width={394} height={14} fill="#5a4436" />
      </g>

      {/* RIGHT: the second-floor window; dusk outside, the friend on the pavement below */}
      <g transform="translate(790 430)">
        <WindowFrame w={190} h={430} frame="#e7dccb" frameSh="#b8a68e" glass={<g>
          <rect width={190} height={430} fill="url(#r-dusk)" />
          <rect x={0} y={250} width={190} height={180} fill="#5a5f7a" />
          {/* a building across the road and the pavement under the window */}
          <rect x={0} y={120} width={130} height={150} fill="#3a3550" />
          {[0, 1, 2].map((i) => <rect key={i} x={14 + i * 40} y={150} width={22} height={30} fill="#f7c66c" opacity={0.85} />)}
          <rect x={0} y={330} width={190} height={14} fill="#8a8ea4" />
          {/* the friend, seen from above at a distance: hoodie, backpack */}
          <g transform="translate(70 232) scale(0.15)"><Friend idp="r1f" light="warm" /></g>
          <rect x={150} y={180} width={6} height={150} fill="#24263a" /><circle cx={150} cy={180} r={16} fill="#ffe29a" opacity={0.9} />
        </g>} />
      </g>

      {/* the ceiling light is ON: warm pool over the room */}
      <path d="M 540 0 V 120" stroke="#2a1a12" strokeWidth={4} />
      <path d="M 490 120 H 590 L 572 160 H 508 Z" fill="#3a2418" stroke={INK} strokeWidth={3} />
      <ellipse cx={540} cy={166} rx={30} ry={12} fill="#fff1c8" />
      <rect width={W} height={H} fill="url(#r-lamp)" style={{ mixBlendMode: 'screen' }} />

      {/* MIDDLE: the desk, with the toy car, two small bulbs and the shallow bowl */}
      <g>
        <ellipse cx={660} cy={1418} rx={330} ry={26} fill="#1a0f09" opacity={0.45} filter="url(#r-soft)" />
        <path d="M 400 1060 L 930 1060 L 960 1120 L 372 1120 Z" fill="#a8744a" stroke={INK} strokeWidth={3} />
        <rect x={372} y={1120} width={588} height={30} fill="#7c5234" stroke={INK} strokeWidth={3} />
        <rect x={394} y={1150} width={26} height={268} fill="#6a4429" stroke={INK} strokeWidth={3} />
        <rect x={910} y={1150} width={26} height={268} fill="#6a4429" stroke={INK} strokeWidth={3} />
        <rect x={720} y={1150} width={200} height={150} fill="#7c5234" stroke={INK} strokeWidth={3} /><rect x={800} y={1210} width={40} height={8} rx={4} fill="#3a2418" />
        {/* shallow bowl (later lined with foil) */}
        <g transform="translate(560 1070)">
          <ellipse cx={0} cy={0} rx={78} ry={16} fill="#3e5a6e" stroke={INK} strokeWidth={3} />
          <path d="M -78 0 C -70 30 -40 40 0 40 C 40 40 70 30 78 0" fill="#6f93ad" stroke={INK} strokeWidth={3} />
          <ellipse cx={0} cy={0} rx={66} ry={11} fill="#2c4253" />
        </g>
        {/* two small bulbs */}
        {[690, 742].map((x, i) => <g key={x} transform={`translate(${x} ${1080 - i * 4})`}>
          <circle cx={0} cy={-26} r={20} fill="#f6f0dc" opacity={0.55} stroke={INK} strokeWidth={2.4} />
          <path d="M -5 -16 L -2 -30 L 2 -24 L 5 -30" stroke="#6b5a3a" strokeWidth={2} fill="none" />
          <rect x={-10} y={-8} width={20} height={20} fill="#b9b2a2" stroke={INK} strokeWidth={2.4} />
          <path d="M -10 -2 H 10 M -10 4 H 10" stroke="#7d7768" strokeWidth={2} />
          <ellipse cx={-7} cy={-34} rx={5} ry={7} fill="#fff" opacity={0.7} />
        </g>)}
        {/* toy car */}
        <g transform="translate(830 1066)">
          <path d="M -52 0 L -46 -22 L -20 -26 L -6 -44 L 30 -44 L 44 -22 L 56 -18 L 58 0 Z" fill="#d1432f" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <path d="M -12 -26 L -2 -40 L 14 -40 L 14 -26 Z M 20 -26 V -40 L 30 -40 L 38 -26 Z" fill="#a9d6f0" stroke={INK} strokeWidth={2} />
          <circle cx={-28} cy={2} r={12} fill="#22232a" stroke={INK} strokeWidth={2} /><circle cx={34} cy={2} r={12} fill="#22232a" stroke={INK} strokeWidth={2} />
          <circle cx={-28} cy={2} r={4} fill="#9a9aa4" /><circle cx={34} cy={2} r={4} fill="#9a9aa4" />
        </g>
        {/* a tiny pool of lamp light on the desk */}
        <ellipse cx={660} cy={1080} rx={260} ry={36} fill="#ffcf7a" opacity={0.16} />
      </g>

      {/* LEFT: the stuck door, seen at an angle, and the student pulling at it */}
      <g>
        <path d="M 60 230 L 330 320 L 330 1350 L 60 1470 Z" fill="#9c6a43" stroke={INK} strokeWidth={3} />
        <path d="M 100 330 L 290 384 L 290 760 L 100 760 Z M 100 820 L 290 820 L 290 1290 L 100 1370 Z" fill="#8a5b38" stroke="#5a3a22" strokeWidth={3} />
        <path d="M 330 320 L 352 314 L 352 1356 L 330 1350 Z" fill="#6a452c" stroke={INK} strokeWidth={3} />
        <g transform="translate(300 900)"><rect x={-8} y={-30} width={16} height={60} rx={6} fill="#c9b48a" stroke={INK} strokeWidth={2.4} /><path d="M 0 -6 H -34" stroke="#d8c39a" strokeWidth={10} strokeLinecap="round" /><path d="M 0 -6 H -34" stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.6} /></g>
      </g>
      <g transform="translate(600 556) scale(-0.92 0.92)"><Student light="warm" pose="door" idp="s1" /></g>
      {/* strain lines at the handle: it won't budge */}
      <g stroke="#ffe3b0" strokeWidth={4} strokeLinecap="round" opacity={0.8}><path d="M 250 846 L 226 826" /><path d="M 246 956 L 222 976" /><path d="M 234 902 L 204 902" /></g>

      {/* FOREGROUND: the doorframe, close to the lens, softened */}
      <g filter="url(#r-fg)">
        <path d="M 0 0 H 100 V 1920 H 0 Z" fill="#2c1b11" />
        <path d="M 70 0 H 104 V 1920 H 70 Z" fill="#4a2e1d" />
        <path d="M 0 0 H 1080 V 58 H 0 Z" fill="#2c1b11" />
        <path d="M 0 52 H 1080 V 74 H 0 Z" fill="#4a2e1d" />
      </g>
      {/* warm grade and a soft vignette */}
      <rect width={W} height={H} fill="#ff9a3c" opacity={0.08} style={{ mixBlendMode: 'overlay' }} />
    </Svg>
    <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 55% 45%, rgba(0,0,0,0) 55%, rgba(10,5,2,.55) 100%)' }} />
  </AbsoluteFill>
);

// ================================================================ 2 · shouting at the window (two panels)
const P1 = { y: 40, h: 820 }, P2 = { y: 890, h: 990 };
export const S2Shout: React.FC = () => (
  <AbsoluteFill style={{ background: '#0b0f1a' }}>
    <Svg>
      <defs>
        <clipPath id="p1"><rect x={40} y={P1.y} width={1000} height={P1.h} /></clipPath>
        <clipPath id="p2"><rect x={40} y={P2.y} width={1000} height={P2.h} /></clipPath>
        <linearGradient id="i-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1a2540" /><stop offset="1" stopColor="#24345a" /></linearGradient>
        <radialGradient id="i-fog"><stop offset="0" stopColor="#dbe6ff" stopOpacity={0.5} /><stop offset="1" stopColor="#dbe6ff" stopOpacity={0} /></radialGradient>
      </defs>
      {/* upper panel: the student in profile, calling through the closed glass */}
      <g clipPath="url(#p1)">
        <rect x={40} y={P1.y} width={1000} height={P1.h} fill="url(#i-wall)" />
        <g transform="translate(560 120)">
          <WindowFrame w={400} h={720} frame="#8f9cc0" frameSh="#5a668c" glass={<g>
            <rect width={400} height={720} fill="#0c1428" />
            <rect y={520} width={400} height={200} fill="#1d2640" />
            <rect y={560} width={400} height={10} fill="#3a4560" />
            <circle cx={320} cy={110} r={22} fill="#dfe8ff" opacity={0.6} />
          </g>} />
        </g>
        {/* his breath fogging the pane right where he shouts */}
        <ellipse cx={640} cy={420} rx={70} ry={52} fill="url(#i-fog)" />
        <g transform="translate(178 210) scale(1.62)"><Student light="cool" pose="shout" idp="s2" /></g>
        {/* the call itself: lines that stop at the glass */}
        <g stroke="#e8efff" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.85}>
          <path d="M 520 380 Q 540 400 520 420" /><path d="M 548 362 Q 578 400 548 438" /><path d="M 576 344 Q 612 400 576 456" />
        </g>
        <rect x={40} y={P1.y} width={1000} height={P1.h} fill="#5878c8" opacity={0.08} style={{ mixBlendMode: 'screen' }} />
      </g>
      <rect x={40} y={P1.y} width={1000} height={P1.h} fill="none" stroke="#f2efe6" strokeWidth={8} />
      {/* lower panel: the same street as still 5 */}
      <g clipPath="url(#p2)">
        <svg x={40} y={P2.y} width={1000} height={P2.h} viewBox="-140 420 1360 1380" preserveAspectRatio="xMidYMid slice">
          <Street />
          <g transform={FRIEND_AT}><Friend idp="s2f" /></g>
        </svg>
      </g>
      <rect x={40} y={P2.y} width={1000} height={P2.h} fill="none" stroke="#f2efe6" strokeWidth={8} />
    </Svg>
  </AbsoluteFill>
);

// ================================================================ 3 · the two-bulb test (first-person, two matched panels)
const Desk: React.FC<{ id: string }> = ({ id }) => (
  <g>
    <defs><linearGradient id={`${id}-d`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a3554" /><stop offset="1" stopColor="#3b4870" /></linearGradient></defs>
    <rect width={1000} height={900} fill={`url(#${id}-d)`} />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M ${-200 + i * 170} 0 L ${-560 + i * 260} 900`} stroke="#233050" strokeWidth={4} />)}
  </g>
);
const Forearms: React.FC<{ reach: 'wire' | 'switch' }> = ({ reach }) => (
  <g>
    {/* left forearm from bottom-left, right forearm from bottom-right; rolled mustard sleeves at the frame edge */}
    <g transform="translate(150 900) rotate(28)">
      <path d="M -60 -330 C -66 -200 -60 -80 -56 0 L 56 0 C 60 -80 64 -200 60 -330 Z" fill={STU.skin} stroke={INK} strokeWidth={4} />
      <path d="M 20 -330 C 26 -200 30 -80 34 0 L 56 0 C 60 -80 64 -200 60 -330 Z" fill={STU.skinSh} opacity={0.5} />
      <path d="M -64 -330 C -80 -390 -60 -430 -14 -440 C 30 -446 70 -420 66 -330 Z" fill={STU.skin} stroke={INK} strokeWidth={4} />
      <path d="M -30 -430 V -470 M -6 -440 V -486 M 18 -436 V -478 M 40 -420 V -456" stroke={STU.skin} strokeWidth={22} strokeLinecap="round" />
      <path d="M -30 -430 V -470 M -6 -440 V -486 M 18 -436 V -478 M 40 -420 V -456" stroke={INK} strokeWidth={2} opacity={0.35} />
      <rect x={-84} y={-40} width={168} height={70} rx={16} fill={STU.shirtHi} stroke={INK} strokeWidth={4} />
      <rect x={-90} y={24} width={180} height={140} fill={STU.shirt} stroke={INK} strokeWidth={4} />
    </g>
    <g transform={`translate(860 900) rotate(${reach === 'switch' ? -24 : -16})`}>
      <path d="M -60 -330 C -66 -200 -60 -80 -56 0 L 56 0 C 60 -80 64 -200 60 -330 Z" fill={STU.skin} stroke={INK} strokeWidth={4} />
      <path d="M -60 -330 C -66 -200 -60 -80 -56 0 L -30 0 C -32 -80 -36 -200 -30 -330 Z" fill={STU.skinSh} opacity={0.5} />
      <path d="M -64 -330 C -70 -420 -30 -446 14 -440 C 60 -430 80 -390 64 -330 Z" fill={STU.skin} stroke={INK} strokeWidth={4} />
      {reach === 'switch'
        ? <path d="M -40 -420 V -470" stroke={STU.skin} strokeWidth={24} strokeLinecap="round" />
        : <path d="M -40 -420 V -456 M -16 -436 V -480 M 8 -440 V -486 M 32 -430 V -470" stroke={STU.skin} strokeWidth={22} strokeLinecap="round" />}
      <rect x={-84} y={-40} width={168} height={70} rx={16} fill={STU.shirtHi} stroke={INK} strokeWidth={4} />
      <rect x={-90} y={24} width={180} height={140} fill={STU.shirt} stroke={INK} strokeWidth={4} />
    </g>
  </g>
);
const Pack: React.FC<{ cells: number; label: string }> = ({ cells, label }) => (
  <g>
    <rect x={-10} y={-10} width={cells * 46 + 20} height={150} rx={10} fill="#1e1f26" stroke={INK} strokeWidth={4} />
    {Array.from({ length: cells }, (_, i) => <g key={i} transform={`translate(${i * 46} 0)`}>
      <rect x={4} y={6} width={38} height={118} rx={6} fill={i % 2 ? '#c9a23a' : '#3a6fb0'} stroke={INK} strokeWidth={2} />
      <rect x={14} y={0} width={18} height={8} fill="#c8c8c8" stroke={INK} strokeWidth={1.6} />
    </g>)}
    <rect x={cells * 23 - 46} y={150} width={92} height={42} rx={6} fill="#f4efe2" stroke={INK} strokeWidth={2.4} />
    <text x={cells * 23} y={180} textAnchor="middle" style={{ font: '700 28px Inter' }} fill="#1a1a1a">{label}</text>
  </g>
);
const BulbOnHolder: React.FC<{ lit: boolean; broken?: boolean; rating: string }> = ({ lit, broken, rating }) => (
  <g>
    {lit && <circle cx={0} cy={-70} r={230} fill="url(#b-glow)" style={{ mixBlendMode: 'screen' }} />}
    <rect x={-46} y={0} width={92} height={40} rx={8} fill="#2c2d34" stroke={INK} strokeWidth={3} />
    <rect x={-22} y={-26} width={44} height={30} fill="#bdb6a4" stroke={INK} strokeWidth={2.4} />
    <path d="M -22 -18 H 22 M -22 -10 H 22" stroke="#857d6a" strokeWidth={2} />
    <path d="M -24 -26 C -64 -60 -52 -128 0 -132 C 52 -128 64 -60 24 -26 Z" fill={lit ? '#fff3cf' : broken ? '#8d8f97' : '#dfe3ea'} opacity={lit ? 1 : 0.75} stroke={INK} strokeWidth={3} />
    {broken && <ellipse cx={0} cy={-96} rx={30} ry={18} fill="#4a4b52" opacity={0.45} />}
    <path d="M -10 -30 L -12 -74 M 10 -30 L 12 -74" stroke="#5c5440" strokeWidth={2.4} />
    {broken
      ? <path d="M -12 -74 L -8 -82 L -4 -74 L -1 -80 M 4 -86 L 6 -78 L 9 -84 L 12 -74" stroke="#2a2620" strokeWidth={2.6} fill="none" />
      : <path d="M -12 -74 L -8 -84 L -4 -74 L 0 -84 L 4 -74 L 8 -84 L 12 -74" stroke={lit ? '#fff' : '#5c5440'} strokeWidth={lit ? 4 : 2.6} fill="none" />}
    {!lit && <ellipse cx={-22} cy={-98} rx={8} ry={14} fill="#fff" opacity={0.45} />}
    <g transform="translate(58 -40) rotate(10)"><rect x={0} y={0} width={82} height={40} rx={4} fill="#f4efe2" stroke={INK} strokeWidth={2} /><text x={41} y={28} textAnchor="middle" style={{ font: '700 24px Inter' }} fill="#1a1a1a">{rating}</text></g>
    <path d="M 52 -24 L 58 -20" stroke="#8c8678" strokeWidth={2} />
  </g>
);
const BulbPanel: React.FC<{ second: boolean; id: string }> = ({ second, id }) => (
  <g>
    <Desk id={id} />
    {/* wires */}
    <path d={second ? 'M 150 250 C 260 240 300 330 400 330' : 'M 150 250 C 300 240 360 400 470 420'} stroke="#c0392b" strokeWidth={9} fill="none" strokeLinecap="round" />
    <path d={second ? 'M 150 320 C 240 330 260 470 520 470' : 'M 150 320 C 260 340 320 470 530 440'} stroke="#1b1b1f" strokeWidth={9} fill="none" strokeLinecap="round" />
    {second && <>
      <path d="M 400 330 C 430 330 440 360 440 380" stroke="#c0392b" strokeWidth={9} fill="none" />
      <path d="M 500 380 C 500 400 490 420 470 420" stroke="#c0392b" strokeWidth={9} fill="none" />
      {/* the switch */}
      <g transform="translate(470 380)"><rect x={-54} y={-26} width={108} height={52} rx={10} fill="#e9e4d6" stroke={INK} strokeWidth={3} /><rect x={-4} y={-18} width={40} height={36} rx={6} fill="#2a2b32" stroke={INK} strokeWidth={2} /><text x={-30} y={7} textAnchor="middle" style={{ font: '700 18px Inter' }} fill="#2a2b32">ON</text></g>
    </>}
    <g transform="translate(60 150)"><Pack cells={second ? 2 : 4} label={second ? '3 V' : '6 V'} /></g>
    <g transform="translate(560 470)"><BulbOnHolder lit={second} broken={!second} rating="3 V" /></g>
    <Forearms reach={second ? 'switch' : 'wire'} />
    {second && <rect width={1000} height={900} fill="url(#b-warm)" style={{ mixBlendMode: 'overlay' }} />}
  </g>
);
export const S3Bulbs: React.FC = () => (
  <AbsoluteFill style={{ background: '#0b0f1a' }}>
    <Svg>
      <defs>
        <radialGradient id="b-glow"><stop offset="0" stopColor="#ffe7a8" stopOpacity={0.95} /><stop offset="0.35" stopColor="#ffc35a" stopOpacity={0.35} /><stop offset="1" stopColor="#ffb040" stopOpacity={0} /></radialGradient>
        <radialGradient id="b-warm" cx="0.56" cy="0.42" r="0.6"><stop offset="0" stopColor="#ffc46a" stopOpacity={0.55} /><stop offset="1" stopColor="#ffc46a" stopOpacity={0} /></radialGradient>
        <clipPath id="bp1"><rect width={1000} height={900} /></clipPath>
      </defs>
      <g transform="translate(40 40)"><g clipPath="url(#bp1)"><BulbPanel second={false} id="b1" /></g><rect width={1000} height={900} fill="none" stroke="#f2efe6" strokeWidth={8} /></g>
      <g transform="translate(40 980)"><g clipPath="url(#bp1)"><BulbPanel second id="b2" /></g><rect width={1000} height={900} fill="none" stroke="#f2efe6" strokeWidth={8} /></g>
    </Svg>
  </AbsoluteFill>
);

// ================================================================ 4 · the curved-foil cutaway
// a parabola x = X0 + (y - Y0)^2 / (4F): the bulb sits at its focus, so light off the foil leaves nearly parallel
const X0 = 300, Y0 = 900, F = 96, RIM = 330;
const px = (dy: number) => X0 + (dy * dy) / (4 * F);
const curve = (off: number) => Array.from({ length: 41 }, (_, i) => { const dy = -RIM + (i / 40) * 2 * RIM; return `${i ? 'L' : 'M'} ${px(dy) - off} ${Y0 + dy}`; }).join(' ');
export const S4Cutaway: React.FC = () => {
  const FX = X0 + F;   // focus
  const rays = [-300, -230, -160, -95, 95, 160, 230, 300].map((dy) => {
    const hx = px(dy), hy = Y0 + dy;
    const spread = dy * 0.06;   // a little spread: a handmade foil is not a perfect mirror
    return { hx, hy, ex: 960, ey: hy + spread * 3 };
  });
  return (
    <AbsoluteFill style={{ background: '#0c1222' }}>
      <Svg>
        <defs>
          <linearGradient id="c-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#101a32" /><stop offset="1" stopColor="#0a0f1d" /></linearGradient>
          <linearGradient id="c-foil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4f6fa" /><stop offset="0.22" stopColor="#9aa3b2" /><stop offset="0.45" stopColor="#e9edf3" /><stop offset="0.6" stopColor="#7c8494" /><stop offset="0.8" stopColor="#dfe4ec" /><stop offset="1" stopColor="#8b93a3" /></linearGradient>
          <linearGradient id="c-bowl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3f5c74" /><stop offset="1" stopColor="#6f93ad" /></linearGradient>
          <radialGradient id="c-glow"><stop offset="0" stopColor="#fff3cc" stopOpacity={1} /><stop offset="0.3" stopColor="#ffd27a" stopOpacity={0.5} /><stop offset="1" stopColor="#ffb040" stopOpacity={0} /></radialGradient>
          <linearGradient id="c-ray" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffe6a3" stopOpacity={0.95} /><stop offset="1" stopColor="#ffc15a" stopOpacity={0.25} /></linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#c-bg)" />
        {Array.from({ length: 20 }, (_, i) => <line key={i} x1={0} y1={i * 100} x2={W} y2={i * 100} stroke="#16213e" strokeWidth={2} />)}
        {Array.from({ length: 11 }, (_, i) => <line key={i} x1={i * 100} y1={0} x2={i * 100} y2={H} stroke="#16213e" strokeWidth={2} />)}

        {/* LAYER: reflector — the bowl in section, its foil lining, tape */}
        <g id="reflector">
          <path d={`${curve(34)} L ${px(RIM) + 6} ${Y0 + RIM} L ${px(RIM) + 6} ${Y0 + RIM + 26} ${curve(60).replace('M', 'L').split(' L ').reverse().join(' L ')} Z`} fill="none" />
          <path d={curve(36)} stroke="url(#c-bowl)" strokeWidth={46} fill="none" strokeLinecap="round" />
          <path d={curve(36)} stroke={INK} strokeWidth={52} fill="none" strokeLinecap="round" opacity={0.25} />
          <path d={curve(36)} stroke="url(#c-bowl)" strokeWidth={42} fill="none" strokeLinecap="round" />
          <path d={curve(6)} stroke="url(#c-foil)" strokeWidth={14} fill="none" strokeLinecap="round" />
          {/* creases in the foil */}
          {[-250, -170, -60, 40, 130, 220, 280].map((dy, i) => <path key={i} d={`M ${px(dy) - 12} ${Y0 + dy - 6} L ${px(dy) - 1} ${Y0 + dy + 4} L ${px(dy) - 10} ${Y0 + dy + 12}`} stroke={i % 2 ? '#ffffff' : '#5d6574'} strokeWidth={2} fill="none" opacity={0.7} />)}
          {/* tape holding the lining at the rim */}
          {[-1, 1].map((s) => <rect key={s} x={px(RIM) - 46} y={Y0 + s * RIM - 18} width={60} height={34} rx={3} fill="#e9dcb0" opacity={0.75} stroke="#a9955c" strokeWidth={1.6} transform={`rotate(${s * 30} ${px(RIM) - 16} ${Y0 + s * RIM})`} />)}
        </g>

        {/* LAYER: rays — out of the bulb, onto the foil, forward in a tighter spread */}
        <g id="rays" strokeLinecap="round">
          {rays.map((r, i) => <g key={i}>
            <line x1={FX} y1={Y0} x2={r.hx - 8} y2={r.hy} stroke="#ffe3a0" strokeWidth={3.4} strokeDasharray="10 8" opacity={0.85} />
            <line x1={r.hx - 8} y1={r.hy} x2={r.ex} y2={r.ey} stroke="url(#c-ray)" strokeWidth={5} />
            <path d={`M ${r.ex - 26} ${r.ey - 10} L ${r.ex} ${r.ey} L ${r.ex - 26} ${r.ey + 10}`} stroke="#ffd27a" strokeWidth={4} fill="none" opacity={0.8} />
          </g>)}
          {/* light straight out of the bulb, without the foil, spreads wide */}
          {[-0.55, 0.55].map((a, i) => <line key={i} x1={FX + 40} y1={Y0} x2={FX + 40 + 520 * Math.cos(a)} y2={Y0 + 520 * Math.sin(a)} stroke="#ffe3a0" strokeWidth={2.4} strokeDasharray="4 10" opacity={0.5} />)}
        </g>

        {/* LAYER: bulb — at the focus, its base pushed through a hole in the bowl, wired to the battery pack behind */}
        <g id="bulb">
          <circle cx={FX} cy={Y0} r={150} fill="url(#c-glow)" style={{ mixBlendMode: 'screen' }} />
          <g transform={`translate(${FX} ${Y0}) rotate(90)`}>
            <rect x={-20} y={8} width={40} height={64} fill="#bdb6a4" stroke={INK} strokeWidth={3} />
            <path d="M -20 22 H 20 M -20 36 H 20 M -20 50 H 20" stroke="#857d6a" strokeWidth={2.4} />
            <path d="M -22 10 C -60 -24 -48 -92 0 -96 C 48 -92 60 -24 22 10 Z" fill="#fff4d0" stroke={INK} strokeWidth={3} />
            <path d="M -10 6 L -12 -40 M 10 6 L 12 -40" stroke="#7a6a44" strokeWidth={2.4} />
            <path d="M -12 -40 L -8 -50 L -4 -40 L 0 -50 L 4 -40 L 8 -50 L 12 -40" stroke="#fff" strokeWidth={4} fill="none" />
          </g>
          {/* wires out of the back of the bowl to a 2 x AA pack and a switch, all taped */}
          <path d={`M ${X0 - 90} ${Y0 - 8} C 220 880 180 820 170 760`} stroke="#c0392b" strokeWidth={8} fill="none" />
          <path d={`M ${X0 - 90} ${Y0 + 8} C 220 940 180 1000 170 1060`} stroke="#1b1b1f" strokeWidth={8} fill="none" />
          <g transform="translate(60 640)"><rect width={130} height={120} rx={10} fill="#1e1f26" stroke={INK} strokeWidth={3} /><rect x={12} y={12} width={106} height={42} rx={6} fill="#3a6fb0" stroke={INK} strokeWidth={2} /><rect x={12} y={64} width={106} height={42} rx={6} fill="#c9a23a" stroke={INK} strokeWidth={2} /></g>
          <g transform="translate(110 1060)"><rect x={-50} y={-24} width={100} height={48} rx={10} fill="#e9e4d6" stroke={INK} strokeWidth={3} /><rect x={0} y={-16} width={38} height={32} rx={6} fill="#2a2b32" /></g>
          <rect x={X0 - 110} y={Y0 - 34} width={78} height={68} rx={4} fill="#e9dcb0" opacity={0.8} stroke="#a9955c" strokeWidth={1.6} transform={`rotate(-6 ${X0 - 70} ${Y0})`} />
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

// ================================================================ 5 · the friend looks up (same street framing as still 2's lower panel)
export const S5LooksUp: React.FC = () => (
  <AbsoluteFill style={{ background: '#0b0f1a' }}>
    <Svg>
      <Street beam />
      <g transform={FRIEND_AT}><Friend up idp="s5f" /></g>
      {/* the torch light catching his face */}
      <ellipse cx={490} cy={1180} rx={90} ry={70} fill="#ffcf7a" opacity={0.28} style={{ mixBlendMode: 'screen' }} />
    </Svg>
    <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,8,.5) 100%)' }} />
  </AbsoluteFill>
);
