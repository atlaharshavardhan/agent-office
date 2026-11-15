import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FPS, hash, prog, lerp, easeOut, easeInOut, clamp01 } from '../lib/anim';
import { FONT } from '../lib/palette';
import { Adult } from '../dusk/Adult';
import type { StickPose } from '../dusk/Dusk';
import { Night } from '../dusk/Extras';
import { Globe, Pin, MUMBAI, LONDON, MAIN, ALT, WEB, routePts, routeAt, LL, GlobeApi } from './Globe';

const mix = (a: LL, b: LL, u: number): LL => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const kf = (t: number, ks: [number, number][]) => { let i = 0; while (i < ks.length - 2 && t > ks[i + 1][0]) i++; const a = ks[i], b = ks[i + 1]; return lerp(a[1], b[1], easeInOut(clamp01((t - a[0]) / (b[0] - a[0])))); };
const kfLog = (t: number, ks: [number, number][]) => Math.exp(kf(t, ks.map(([a, b]) => [a, Math.log(b)] as [number, number])));

/* ---------- the aeroplane, side on: white body, her coral on the tail, warm windows ---------- */
export const Plane: React.FC<{ f: number; her?: StickPose }> = ({ f, her }) => {
  const k = f / FPS, blink = Math.sin(k * 9) > 0.6 ? 1 : 0.15;
  return (
    <g>
      <defs>
        <linearGradient id="plB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".45" stopColor="#e6e9f8" /><stop offset=".75" stopColor="#aab0d6" /><stop offset="1" stopColor="#6e74a6" /></linearGradient>
        <linearGradient id="plW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d5d9f0" /><stop offset="1" stopColor="#7d84b4" /></linearGradient>
        <linearGradient id="plT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff9c8a" /><stop offset="1" stopColor="#d9553f" /></linearGradient>
        <radialGradient id="plG"><stop offset="0" stopColor="#fff" stopOpacity=".95" /><stop offset=".4" stopColor="#fff" stopOpacity=".35" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <clipPath id="plP"><circle cx={-40} cy={-14} r={36} /></clipPath>
      </defs>
      {/* far wing and far tailplane */}
      <path d="M 40 -6 L -170 -120 L -215 -120 L -70 -2 Z" fill="#8187b6" /><path d="M -360 -30 L -470 -80 L -500 -80 L -410 -26 Z" fill="#8187b6" />
      {/* tail fin in her colour */}
      <path d="M -350 -44 L -468 -196 L -402 -196 L -268 -52 Z" fill="url(#plT)" /><path d="M -425 -160 L -400 -160 L -352 -106 L -384 -106 Z" fill="#fff" opacity={0.9} />
      {/* body */}
      <path d="M -480 -22 C -420 -52 -330 -58 -240 -58 L 300 -58 C 400 -58 470 -34 500 -4 C 470 26 400 46 300 46 L -250 46 C -360 44 -440 12 -480 -22 Z" fill="url(#plB)" />
      <path d="M -470 -12 C -380 16 -300 26 -240 28 L 320 28 C 400 26 460 12 496 -2 C 470 26 400 46 300 46 L -250 46 C -360 44 -440 12 -470 -12 Z" fill="#5f6596" opacity={0.45} />
      <path d="M -300 4 L 440 4" stroke="#ff8672" strokeWidth={9} strokeLinecap="round" /><path d="M -300 17 L 400 17" stroke="#5fe3ff" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
      {/* cockpit */}
      <path d="M 410 -40 C 440 -36 462 -26 476 -14 L 420 -14 Z" fill="#14183a" /><path d="M 416 -36 C 436 -33 450 -27 460 -20 L 424 -20 Z" fill="#8fd8ff" opacity={0.7} />
      {/* windows, warm; and her porthole */}
      {Array.from({ length: 15 }).map((_, i) => { const x = -250 + i * 42; if (Math.abs(x + 40) < 60) return null; return <g key={i}><rect x={x - 9} y={-36} width={18} height={24} rx={8} fill="#ffd88a" /><rect x={x - 9} y={-36} width={18} height={9} rx={5} fill="#fff3d6" opacity={0.8} /></g>; })}
      {[-296, 356].map((x) => <rect key={x} x={x - 13} y={-44} width={26} height={62} rx={9} fill="none" stroke="#8a90b8" strokeWidth={3} />)}
      <circle cx={-40} cy={-14} r={42} fill="#c9cde6" /><circle cx={-40} cy={-14} r={36} fill="#3a2f6e" />
      {her && <g clipPath="url(#plP)"><rect x={-80} y={-54} width={80} height={80} fill="#ffcf8a" opacity={0.85} /><g transform="translate(-44 106) scale(0.4)"><Adult kind="woman" p={her} id="pl" /></g></g>}
      <circle cx={-40} cy={-14} r={36} fill="none" stroke="#eef1ff" strokeWidth={5} /><path d="M -66 -34 A 34 34 0 0 1 -34 -48" stroke="#fff" strokeWidth={4} fill="none" opacity={0.6} />
      {/* near wing, engine */}
      <path d="M 110 22 L -150 168 L -214 168 L -30 22 Z" fill="url(#plW)" /><path d="M 110 22 L -150 168 L -170 168 L 60 22 Z" fill="#fff" opacity={0.35} /><path d="M -150 168 L -214 168 L -226 150 L -166 150 Z" fill="#ff8672" />
      <g transform="translate(-10 92)"><rect x={-58} y={-25} width={116} height={50} rx={24} fill="#dfe3f6" /><rect x={-58} y={2} width={116} height={23} rx={12} fill="#7d84b4" opacity={0.6} /><ellipse cx={56} cy={0} rx={9} ry={23} fill="#14183a" /><ellipse cx={56} cy={0} rx={5} ry={15} fill="#5fe3ff" opacity={0.5 + 0.3 * Math.sin(k * 30)} /><rect x={-70} y={-12} width={20} height={24} rx={6} fill="#5a6088" /></g>
      {/* near tailplane */}
      <path d="M -330 2 L -470 44 L -505 44 L -410 2 Z" fill="url(#plW)" />
      {/* lights */}
      <circle cx={-190} cy={160} r={26} fill="url(#plG)" opacity={blink} /><circle cx={-190} cy={160} r={5} fill="#7dffb0" />
      <circle cx={-432} cy={-196} r={30} fill="url(#plG)" opacity={1 - blink} /><circle cx={-432} cy={-196} r={5} fill="#ff6a6a" />
      <circle cx={120} cy={50} r={22} fill="url(#plG)" opacity={Math.sin(k * 14) > 0.85 ? 1 : 0} />
    </g>
  );
};

/* ---------- take-off over Mumbai ---------- */
const Skyline: React.FC<{ f: number; shift: number }> = ({ f, shift }) => (
  <g>
    {/* far towers */}
    <g transform={`translate(${-shift * 0.25} 0)`}>{Array.from({ length: 26 }).map((_, i) => { const x = -200 + i * 86, h = 150 + hash(i * 3) * 260, w = 56 + hash(i * 7) * 30; return <g key={i}><rect x={x} y={1420 - h} width={w} height={h + 200} fill="#161a4a" />{Array.from({ length: Math.floor(h / 34) }).map((_, r) => [0, 1, 2].map((c) => hash(i * 31 + r * 7 + c) > 0.55 ? <rect key={`${r}_${c}`} x={x + 8 + c * (w - 16) / 3} y={1420 - h + 14 + r * 34} width={8} height={12} fill="#ffd88a" opacity={0.55} /> : null))}</g>; })}</g>
    {/* the sea link: two towers and their cables */}
    <g transform={`translate(${-shift * 0.4} 0)`} opacity={0.95}>{[620, 900].map((x) => <g key={x}><path d={`M ${x - 14} 1440 L ${x - 5} 1130 L ${x + 5} 1130 L ${x + 14} 1440 Z`} fill="#0e1238" />{Array.from({ length: 9 }).map((_, j) => <g key={j}><line x1={x} y1={1140 + j * 14} x2={x - 130 + j * 9} y2={1436} stroke="#3a4390" strokeWidth={2} /><line x1={x} y1={1140 + j * 14} x2={x + 130 - j * 9} y2={1436} stroke="#3a4390" strokeWidth={2} /></g>)}<circle cx={x} cy={1128} r={5} fill="#ff6a6a" opacity={0.6 + 0.4 * Math.sin(f / 5)} /></g>)}<rect x={300} y={1434} width={920} height={12} fill="#0e1238" />{Array.from({ length: 22 }).map((_, j) => <circle key={j} cx={320 + j * 42} cy={1430} r={3} fill="#ffd98a" />)}{Array.from({ length: 8 }).map((_, j) => <rect key={j} x={340 + j * 120} y={1446} width={14} height={90} fill="#0e1238" />)}</g>
    {/* near buildings and the Gateway arch */}
    <g transform={`translate(${-shift * 0.7} 0)`}>
      {Array.from({ length: 22 }).map((_, i) => { const x = -300 + i * 120 + hash(i) * 30, h = 120 + hash(i * 5 + 1) * 240, w = 84 + hash(i * 9) * 30, col = ['#2a2466', '#33276e', '#24306e'][i % 3]; return <g key={i}><rect x={x} y={1560 - h} width={w} height={h + 200} fill={col} /><rect x={x} y={1560 - h} width={w} height={8} fill="#5a4cb0" />{Array.from({ length: Math.floor(h / 38) }).map((_, r) => [0, 1, 2].map((c) => hash(i * 17 + r * 3 + c) > 0.4 ? <rect key={`${r}_${c}`} x={x + 12 + c * (w - 24) / 3} y={1560 - h + 20 + r * 38} width={13} height={18} fill={hash(i + r + c) > 0.5 ? '#ffd88a' : '#e98f6a'} opacity={0.85} /> : null))}</g>; })}
      <g transform="translate(250 1560)"><rect x={-110} y={-150} width={220} height={150} fill="#c9a36a" /><rect x={-124} y={-164} width={248} height={18} fill="#e2c08a" /><path d="M -34 0 L -34 -80 A 34 34 0 0 1 34 -80 L 34 0 Z" fill="#241c3a" /><path d="M -90 0 L -90 -50 A 16 16 0 0 1 -58 -50 L -58 0 Z M 58 0 L 58 -50 A 16 16 0 0 1 90 -50 L 90 0 Z" fill="#241c3a" />{[-110, -40, 40, 110].map((x) => <g key={x}><rect x={x - 9} y={-200} width={18} height={40} fill="#c9a36a" /><path d={`M ${x - 12} -200 A 12 12 0 0 1 ${x + 12} -200 Z`} fill="#e2c08a" /></g>)}<path d="M -44 -164 A 44 40 0 0 1 44 -164 Z" fill="#e2c08a" /><ellipse cx={0} cy={-90} rx={150} ry={120} fill="#ffd98a" opacity={0.12} /></g>
    </g>
    {/* sea, with the city in it */}
    <rect x={0} y={1560} width={1080} height={360} fill="#0c1040" />{Array.from({ length: 46 }).map((_, i) => <rect key={i} x={((hash(i * 3) * 1400 - shift * 0.9 + f * 2) % 1400 + 1400) % 1400 - 160} y={1575 + hash(i * 7) * 320} width={30 + hash(i) * 90} height={3} rx={1.5} fill={i % 3 ? '#5a66c8' : '#ffd98a'} opacity={0.18 + 0.25 * hash(i * 11)} />)}
  </g>
);

/* World: take-off (0 to 1.9 s), the flight across the globe (1.6 to 4.1 s), the cable drawn under the sea (4.1 to 6.6 s), then the dive (6.4 to 7.1 s). */
export const WORLD_LEN = 7.1;
export const World: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const toff = 1 - prog(f, 1.55, 1.95), fly = easeInOut(clamp01((t - 1.75) / 2.25)), cable = clamp01((t - 4.25) / 2.0), dive = prog(f, 6.35, 7.1, easeInOut);
  const her: StickPose = { blink: Math.max(0, 1 - Math.abs(t - 0.9) / 0.07), smile: 1, look: 0.4, armR: [150 + Math.sin(t * 10) * 12, 172 + Math.sin(t * 10 + 1) * 14], armL: [-10, -6], tilt: 3 };
  const fp = routePts([MUMBAI, LONDON], 1, 0.01);
  const pAt = (u: number): LL => fp[Math.round(clamp01(u) * (fp.length - 1))];
  const rot: LL = [kf(t, [[0, 68], [1.8, 70], [4.0, 14], [4.4, 36], [6.2, 34], [7.1, 60]]), kf(t, [[0, 20], [1.8, 22], [4.0, 44], [4.4, 30], [6.2, 30], [7.1, 15.5]])];
  const R = kfLog(t, [[0, 1500], [1.8, 1150], [2.6, 640], [3.9, 640], [4.5, 590], [6.2, 620], [7.1, 5200]]);
  const climb = easeOut(clamp01(t / 1.9));
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a22' }}>
      <svg width={1080} height={1920}>
        <Night id="wd" f={f} stars={90} />
        <defs><radialGradient id="wdMoon"><stop offset="0" stopColor="#fff6dc" /><stop offset=".6" stopColor="#ffe9b8" /><stop offset="1" stopColor="#ffe9b8" stopOpacity="0" /></radialGradient>
          <linearGradient id="wdDeep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#123a7a" /><stop offset="1" stopColor="#061436" /></linearGradient></defs>
        {/* the globe */}
        {t > 1.5 && <g opacity={prog(f, 1.55, 1.95)}>
          <Globe id="wg" rot={rot} R={R} cy={880} f={f}>{(g: GlobeApi) => <>
            {/* her flight path */}
            {fly > 0 && cable < 0.3 && <g opacity={1 - prog(f, 4.2, 4.7)}><path d={g.line(fp)} fill="none" stroke="#ffe08a" strokeWidth={3} strokeDasharray="3 13" strokeLinecap="round" opacity={0.5} /><path d={g.line(fp.slice(0, Math.max(2, Math.round(fly * (fp.length - 1)) + 1)))} fill="none" stroke="#fff3d6" strokeWidth={5} strokeLinecap="round" opacity={0.85} /></g>}
            {/* the cable under the sea */}
            {cable > 0 && (() => { const pts = routePts(MAIN, easeInOut(cable)), d = g.line(pts); return <g>
              <path d={d} fill="none" stroke="#5fe3ff" strokeWidth={30} strokeLinecap="round" opacity={0.1} /><path d={d} fill="none" stroke="#5fe3ff" strokeWidth={15} strokeLinecap="round" opacity={0.28} /><path d={d} fill="none" stroke="#0a2a44" strokeWidth={7} strokeLinecap="round" /><path d={d} fill="none" stroke="#dffbff" strokeWidth={3.2} strokeLinecap="round" />
              {[0, 1, 2, 3, 4, 5].map((i) => { const u = ((t * 0.5 + i / 6) % 1) * easeInOut(cable), p = routeAt(MAIN, u), v = g.vis(p); if (v <= 0) return null; const [x, y] = g.xy(p); return <g key={i} opacity={v}><circle cx={x} cy={y} r={20} fill="url(#wdC)" /><circle cx={x} cy={y} r={5} fill="#f2feff" /></g>; })}
              {cable < 1 && (() => { const [x, y] = g.xy(pts[pts.length - 1]); return <g><circle cx={x} cy={y} r={34} fill="url(#wdC)" /><circle cx={x} cy={y} r={8} fill="#fff" /></g>; })()}</g>; })()}
            <Pin g={g} at={MUMBAI} name="MUMBAI" o={prog(f, 1.9, 2.2)} up={false} /><Pin g={g} at={LONDON} name="LONDON" col="#ff9c8a" o={prog(f, 3.3, 3.7) * (1 - dive)} />
            {/* the little plane on the globe */}
            {fly > 0 && fly < 1 && (() => { const p = pAt(fly), q = pAt(fly + 0.02), [x, y] = g.xy(p), [x2, y2] = g.xy(q), a = Math.atan2(y2 - y, x2 - x) * 180 / Math.PI, s = 0.9 + 0.5 * Math.sin(Math.PI * fly);
              return <g><ellipse cx={x + 14} cy={y + 22} rx={34 * s} ry={12 * s} fill="#000" opacity={0.35} /><g transform={`translate(${x} ${y - 18 * Math.sin(Math.PI * fly)}) rotate(${a}) scale(${s})`}>
                <path d="M 46 0 C 40 -8 20 -9 -30 -8 L -44 -4 L -44 4 L -30 8 C 20 9 40 8 46 0 Z" fill="#eef1ff" /><path d="M 12 -6 L -14 -48 L -26 -48 L -10 -6 Z M 12 6 L -14 48 L -26 48 L -10 6 Z" fill="#cfd4ee" /><path d="M -30 -6 L -44 -22 L -50 -22 L -42 -4 Z M -30 6 L -44 22 L -50 22 L -42 4 Z" fill="#ff8672" /><circle cx={-22} cy={-48} r={4} fill="#ff6a6a" /><circle cx={-22} cy={48} r={4} fill="#7dffb0" /><path d="M 36 0 L 26 -4 L 26 4 Z" fill="#14183a" /></g></g>; })()}
          </>}</Globe>
        </g>}
        {/* take-off: Mumbai falls away below the plane */}
        {toff > 0 && <g opacity={toff}>
          <rect width={1080} height={1920} fill="url(#wdS)" /><circle cx={860} cy={420 + climb * 120} r={150} fill="url(#wdMoon)" opacity={0.25} /><circle cx={860} cy={420 + climb * 120} r={56} fill="#fff3d6" /><circle cx={842} cy={404 + climb * 120} r={12} fill="#e8d6a6" opacity={0.6} /><circle cx={878} cy={438 + climb * 120} r={8} fill="#e8d6a6" opacity={0.6} />
          {Array.from({ length: 70 }).map((_, i) => <circle key={i} cx={hash(i * 3) * 1080} cy={hash(i * 7) * 1200} r={1 + hash(i) * 1.8} fill="#dfe6ff" opacity={0.3 + 0.4 * Math.sin(t * 2 + i)} />)}
          <g transform={`translate(0 ${climb * 420})`}><Skyline f={f} shift={t * 260} /></g>
          {Array.from({ length: 6 }).map((_, i) => { const x = ((hash(i * 5) * 1700 - t * (220 + i * 60)) % 1700 + 1700) % 1700 - 300, y = 520 + i * 150 + climb * 200; return <g key={i} opacity={0.16 + 0.05 * i}><ellipse cx={x} cy={y} rx={190} ry={34} fill="#aab4ff" /><ellipse cx={x + 90} cy={y - 22} rx={110} ry={30} fill="#aab4ff" /><ellipse cx={x - 80} cy={y - 14} rx={90} ry={24} fill="#aab4ff" /></g>; })}
          <g transform={`translate(${lerp(300, 560, climb)} ${lerp(1240, 860, climb)}) rotate(${lerp(-4, -15, climb)}) scale(${lerp(0.9, 0.96, climb) * (1 - 0.55 * prog(f, 1.5, 1.95))})`}>
            {[0, 1].map((j) => <path key={j} d={`M -480 ${-8 + j * 40} L -1500 ${40 + j * 60}`} stroke="#fff" strokeWidth={16 - j * 6} strokeLinecap="round" opacity={0.1} />)}
            <Plane f={f} her={her} />
          </g>
        </g>}
        {/* the dive: the sea rushes up */}
        <rect width={1080} height={1920} fill="url(#wdDeep)" opacity={prog(f, 6.7, 7.1)} />
        <rect width={1080} height={1920} fill="url(#wdV)" />
      </svg>
      {/* her, landed, on the London pin */}
    </AbsoluteFill>
  );
};

/* WorldWeb: the whole planet's cables. mode 'all': every cable lights up. mode 'cut': the main one breaks, hundreds remain, the packets go the long way round. */
export const WorldWeb: React.FC<{ mode: 'all' | 'cut' }> = ({ mode }) => {
  const f = useCurrentFrame(), t = f / FPS, cut = mode === 'cut';
  const rot: LL = cut ? [kf(t, [[0, 30], [1.2, 22], [3, 18]]), kf(t, [[0, 18], [1.2, 12], [3, 10]])] : [kf(t, [[0, 60], [0.7, 40], [3.2, -8]]), kf(t, [[0, 15.5], [0.7, 24], [3.2, 26]])];
  const R = cut ? kfLog(t, [[0, 500], [3, 530]]) : kfLog(t, [[0, 5200], [0.75, 540], [3.2, 500]]);
  const brk: LL = [39.2, 19];   // where the anchor caught it, in the Red Sea
  const re = cut ? clamp01((t - 1.55) / 1.15) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a22' }}>
      <svg width={1080} height={1920}>
        <Night id="ww" f={f} stars={90} />
        <defs><linearGradient id="wwDeep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#123a7a" /><stop offset="1" stopColor="#061436" /></linearGradient></defs>
        <Globe id="wb" rot={rot} R={R} cy={cut ? 1010 : 900} f={f}>{(g: GlobeApi) => <>
          {WEB.map((r, i) => { const a = cut ? 1 : prog(f, 0.7 + i * 0.045, 1.2 + i * 0.045), pts = routePts(r, a), d = g.line(pts); if (a <= 0) return null; const boost = cut ? 0.5 + 0.5 * prog(f, 0.1, 0.5) : 1;
            return <g key={i} opacity={boost}><path d={d} fill="none" stroke="#5fe3ff" strokeWidth={9} strokeLinecap="round" opacity={0.13} /><path d={d} fill="none" stroke="#7fd9f0" strokeWidth={2.4} strokeLinecap="round" opacity={0.75} />
              {(() => { const u = (t * 0.35 + hash(i * 7)) % 1, p = routeAt(r, u * a), v = g.vis(p); if (v <= 0) return null; const [x, y] = g.xy(p); return <circle cx={x} cy={y} r={3.6} fill="#f2feff" opacity={v} />; })()}</g>; })}
          {/* the alternative route */}
          {(() => { const d = g.line(routePts(ALT)); return <g><path d={d} fill="none" stroke="#5fe3ff" strokeWidth={9} strokeLinecap="round" opacity={0.13} /><path d={d} fill="none" stroke="#7fd9f0" strokeWidth={2.4} strokeLinecap="round" opacity={0.75} />
            {re > 0 && <><path d={g.line(routePts(ALT, easeInOut(re)))} fill="none" stroke="#5fe3ff" strokeWidth={26} strokeLinecap="round" opacity={0.16} /><path d={g.line(routePts(ALT, easeInOut(re)))} fill="none" stroke="#5fe3ff" strokeWidth={12} strokeLinecap="round" opacity={0.35} /><path d={g.line(routePts(ALT, easeInOut(re)))} fill="none" stroke="#f2feff" strokeWidth={3.6} strokeLinecap="round" />
              {[0, 1, 2, 3, 4].map((i) => { const u = easeInOut(re) - i * 0.035; if (u <= 0) return null; const p = routeAt(ALT, u), v = g.vis(p); if (v <= 0) return null; const [x, y] = g.xy(p); return <g key={i} opacity={v}><circle cx={x} cy={y} r={24 - i * 2} fill="url(#wwC)" /><rect x={x - 11} y={y - 8} width={22} height={16} rx={3.5} fill="#f2feff" stroke="#5fe3ff" strokeWidth={2} /></g>; })}</>}</g>; })()}
          {/* the main cable: whole, or broken in the Red Sea */}
          {(() => { const whole = routePts(MAIN), bi = whole.reduce((b, p, i) => (Math.hypot(p[0] - brk[0], p[1] - brk[1]) < Math.hypot(whole[b][0] - brk[0], whole[b][1] - brk[1]) ? i : b), 0);
            const seg = (pts: LL[], live: boolean) => { const d = g.line(pts); return <><path d={d} fill="none" stroke={live ? '#5fe3ff' : '#ff6a6a'} strokeWidth={20} strokeLinecap="round" opacity={live ? 0.2 : 0.12} /><path d={d} fill="none" stroke={live ? '#dffbff' : '#8a4a5a'} strokeWidth={3.4} strokeLinecap="round" strokeDasharray={live ? undefined : '10 9'} /></>; };
            if (!cut) return <g opacity={prog(f, 0.5, 0.9)}>{seg(whole, true)}</g>;
            const [bx, by] = g.xy(whole[bi]), v = g.vis(whole[bi]);
            return <g>{seg(whole.slice(0, bi - 2), false)}{seg(whole.slice(bi + 3), false)}
              <g opacity={v}>{[0, 0.5].map((d0) => { const u = (t * 1.3 + d0) % 1; return <circle key={d0} cx={bx} cy={by} r={14 + u * 46} fill="none" stroke="#ff6a6a" strokeWidth={5 * (1 - u) + 1} opacity={1 - u} />; })}<circle cx={bx} cy={by} r={15} fill="#ff6a6a" /><path d={`M ${bx - 7} ${by - 7} L ${bx + 7} ${by + 7} M ${bx + 7} ${by - 7} L ${bx - 7} ${by + 7}`} stroke="#fff" strokeWidth={4} strokeLinecap="round" /></g></g>; })()}
          <Pin g={g} at={MUMBAI} name="MUMBAI" up={false} o={cut ? 1 : prog(f, 0.9, 1.2)} /><Pin g={g} at={LONDON} name="LONDON" col="#ff9c8a" o={cut ? 1 : prog(f, 0.9, 1.2)} />
        </>}</Globe>
        {!cut && <rect width={1080} height={1920} fill="url(#wwDeep)" opacity={1 - prog(f, 0, 0.45)} />}
        <rect width={1080} height={1920} fill="url(#wwV)" />
      </svg>
      {cut && <div style={{ position: 'absolute', top: 226, left: 70, right: 70, height: 190, borderRadius: 40, background: 'rgba(10,14,36,.86)', border: '1px solid rgba(160,176,255,.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: prog(f, 0.15, 0.4) }}>
        <div style={{ font: `700 92px/1 ${FONT.mono}`, color: '#9fe9ff' }}>{Math.round(lerp(1, 570, easeOut(clamp01((t - 0.15) / 1.1))))}+</div><div style={{ font: `600 27px ${FONT.mono}`, letterSpacing: '0.2em', color: '#cfd8ff' }}>CABLES UNDER THE SEA</div></div>}
    </AbsoluteFill>
  );
};
