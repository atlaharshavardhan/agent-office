import { AbsoluteFill } from 'remotion';
import { FONT, ramp } from '../theme';

// Teardown of the front (TrueDepth) camera: the Dynamic Island we just zoomed into tilts back and its
// layers fly apart: display, bracket, the four modules, their lenses, cover glass. t = frames from the cut.
//   0–14  tilt + explode (fast)   ·  12–30 labels land one by one  ·  26–  the dot projector fires
// Drawn as flat layers placed in 3D by hand (orthographic), so labels can point at the real positions.
const RED = '#ff4d63', BLUE = '#6fa8ff', TEAL = '#63d6c9';
const out3 = (x: number) => 1 - Math.pow(1 - x, 3);
const hash = (i: number) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
const MODS = [
  { x: -225, r: 54, label: 'IR CAMERA', col: TEAL },
  { x: -105, r: 34, label: 'FLOOD ILLUMINATOR', col: RED },
  { x: 15, r: 54, label: 'DOT PROJECTOR', col: RED },
  { x: 205, r: 68, label: 'FRONT CAMERA', col: BLUE },
];

export const Teardown: React.FC<{ t: number }> = ({ t }) => {
  const e = ramp(t, 0, 14, 0, 1, out3), th = ((-26 * e - 6 * (t / 60)) * Math.PI) / 180, ph = (60 * e * Math.PI) / 180;
  const S = 1.27 - 0.22 * e + 0.05 * (t / 60), CX = 540, CY = 800 + 190 * e, GAP = 150 * e;
  const ct = Math.cos(th), st = Math.sin(th), cp = Math.cos(ph), sp = Math.sin(ph);
  const M = (z: number) => `matrix(${S * ct} ${S * st * cp} ${-S * st} ${S * ct * cp} ${CX} ${CY - S * z * sp})`;
  const P = (x: number, y: number, z: number) => [CX + S * (x * ct - y * st), CY + S * ((x * st + y * ct) * cp - z * sp)];
  const Z = [-GAP * 1.2, 0, GAP * 0.9, GAP * 2.1, GAP * 3.1];            // display, bracket, modules, lenses, glass
  const cyl = (x: number, r: number, z0: number, hgt: number, side: string, key: string) =>
    Array.from({ length: 9 }, (_, k) => <g key={key + k} transform={M(z0 + (hgt * k) / 8)}><circle cx={x} cy={0} r={r} fill={side} /></g>);
  const fire = ramp(t, 26, 30);
  const top = P(MODS[2].x, 0, Z[3] + GAP * 0.9);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(75% 50% at 50% 45%, #241a3a 0%, #0a0810 78%)', overflow: 'hidden' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="td-scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4a2f7a" /><stop offset="1" stopColor="#c0683f" /></linearGradient>
          <linearGradient id="td-steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9aa0ad" /><stop offset="1" stopColor="#4b505c" /></linearGradient>
        </defs>
        {/* display with the island cut-out */}
        <g transform={M(Z[0])} opacity={0.95}>
          <rect x={-390} y={-200} width={780} height={500} rx={70} fill="url(#td-scr)" stroke="#d9c9ff" strokeOpacity={0.5} strokeWidth={3} />
          <rect x={-310} y={-90} width={620} height={180} rx={90} fill="#04050a" />
        </g>
        {/* steel bracket */}
        <g transform={M(Z[1])}>
          <rect x={-310} y={-90} width={620} height={180} rx={90} fill="url(#td-steel)" stroke="#e7eaf2" strokeWidth={3} />
          {MODS.map((m) => <circle key={m.x} cx={m.x} cy={0} r={m.r + 8} fill="#14161d" />)}
        </g>
        {/* the four modules */}
        {cyl(MODS[0].x, MODS[0].r, Z[2], 46, '#16323a', 'a')}
        <g transform={M(Z[2] + 46)}><circle cx={MODS[0].x} cy={0} r={MODS[0].r} fill="#0b0d16" stroke={TEAL} strokeWidth={5} /><circle cx={MODS[0].x} cy={0} r={24} fill="#12333a" /><circle cx={MODS[0].x - 10} cy={-10} r={7} fill={BLUE} /></g>
        {Array.from({ length: 6 }, (_, k) => <g key={'f' + k} transform={M(Z[2] + k * 5)}><rect x={MODS[1].x - 34} y={-34} width={68} height={68} rx={8} fill="#3a1118" /></g>)}
        <g transform={M(Z[2] + 30)}><rect x={MODS[1].x - 34} y={-34} width={68} height={68} rx={8} fill="#1a0b10" stroke={RED} strokeWidth={4} /><rect x={MODS[1].x - 14} y={-14} width={28} height={28} rx={4} fill={RED} opacity={0.5 + 0.5 * Math.sin(t / 2)} /></g>
        {cyl(MODS[2].x, MODS[2].r, Z[2], 46, '#3a1118', 'c')}
        <g transform={M(Z[2] + 46)}><circle cx={MODS[2].x} cy={0} r={MODS[2].r} fill="#2a0c12" stroke={RED} strokeWidth={5} />
          {[-0.5, -0.17, 0.17, 0.5].map((k) => <line key={k} x1={MODS[2].x - 34} x2={MODS[2].x + 34} y1={54 * k * 0.9} y2={54 * k * 0.9} stroke="#ffb3bd" strokeWidth={4} strokeDasharray="8 5" />)}</g>
        {cyl(MODS[3].x, MODS[3].r, Z[2], 60, '#141c3c', 'd')}
        <g transform={M(Z[2] + 60)}><circle cx={MODS[3].x} cy={0} r={MODS[3].r} fill="#0a0d1e" stroke={BLUE} strokeWidth={5} /><circle cx={MODS[3].x} cy={0} r={38} fill="#131c44" /><circle cx={MODS[3].x - 13} cy={-15} r={10} fill="#9fb6ff" /></g>
        {/* lenses lifted off each module; the dot projector gets two (lens + the element that splits the beam into dots) */}
        {MODS.filter((_, i) => i !== 1).map((m, i) => <g key={'l' + i} transform={M(Z[3])}><circle cx={m.x} cy={0} r={m.r * 0.86} fill="rgba(190,215,255,.16)" stroke="#dfe9ff" strokeWidth={3} /><ellipse cx={m.x - m.r * 0.3} cy={-m.r * 0.3} rx={m.r * 0.3} ry={m.r * 0.16} fill="rgba(255,255,255,.4)" /></g>)}
        <g transform={M(Z[3] + GAP * 0.9)}><circle cx={MODS[2].x} cy={0} r={46} fill="rgba(255,90,110,.2)" stroke={RED} strokeWidth={3} />
          {Array.from({ length: 25 }, (_, k) => <circle key={k} cx={MODS[2].x + ((k % 5) - 2) * 15} cy={(Math.floor(k / 5) - 2) * 15} r={3} fill="#ffd0d6" />)}</g>
        {/* cover glass */}
        <g transform={M(Z[4])}><rect x={-310} y={-90} width={620} height={180} rx={90} fill="rgba(170,200,255,.10)" stroke="#e8f0ff" strokeOpacity={0.75} strokeWidth={3} />
          <path d="M -250 -60 Q -100 -85 60 -70" stroke="#fff" strokeOpacity={0.5} strokeWidth={5} fill="none" strokeLinecap="round" /></g>
        {/* the dot projector fires */}
        {fire > 0 && Array.from({ length: 90 }, (_, k) => { const a = hash(k) * Math.PI * 2, u = ((t - 26) / 22 + hash(k + 50)) % 1, d = 40 + u * 620;
          return <circle key={'p' + k} cx={top[0] + Math.cos(a) * d * (0.5 + 0.5 * hash(k + 9))} cy={top[1] - 30 - Math.abs(Math.sin(a)) * d * 0.9 - u * 140} r={2.5 + 3 * u} fill={RED} opacity={fire * (1 - u) * 0.95} />; })}
        {fire > 0 && <circle cx={top[0]} cy={top[1]} r={46 + 10 * Math.sin(t)} fill={RED} opacity={0.35 * fire} />}
        {/* labels: each points at its own module */}
        {MODS.map((m, i) => { const o = ramp(t, 12 + i * 4, 16 + i * 4), [x, y] = P(m.x, 0, Z[2]), ly = 1510 - i * 84, lx = Math.min(x, 1000 - m.label.length * 30);
          return (<g key={m.label} opacity={o}>
            <path d={`M ${x} ${y} V ${ly - 34}`} stroke="#fff" strokeWidth={2.5} strokeOpacity={0.9} /><circle cx={x} cy={y} r={6} fill="#fff" />
            <rect x={lx - 14} y={ly - 36} width={m.label.length * 29.5 + 30} height={54} rx={10} fill="rgba(8,7,12,.82)" stroke={m.col} strokeWidth={2.5} />
            <text x={lx} y={ly + 3} fill="#fff" style={{ font: `800 36px ${FONT}`, letterSpacing: '0.13em' }}>{m.label}</text>
          </g>); })}
      </svg>
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: 0.5 * (1 - ramp(t, 0, 5)) }} />
    </AbsoluteFill>
  );
};
