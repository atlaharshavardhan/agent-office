import React from 'react';
import { MARK_O } from '../lib/mark';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { FPS, hash, prog, lerp, easeOut, easeInOut, clamp01 } from '../lib/anim';
import { FONT } from '../lib/palette';
import { Adult, A_SHOULDER, A_UPPER, A_FORE } from './Adult';
import type { StickPose } from './Dusk';

/* Three cutaway shots that drop into the existing film. Each runs on the clock of the scene it interrupts, so the narration stays in sync. */
export const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => (<><div style={{ position: 'absolute', top: 1260, left: 60, right: 150, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', font: `800 58px/1.15 ${FONT.ui}`, color: '#fff', textShadow: '0 3px 6px rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.9)' }}><div className="sub">{children}</div></div><style>{'.sub em{font-style:normal;color:#ffd38a}'}</style></>);
export const Mark: React.FC = () => (<div style={{ position: 'absolute', right: 18, top: 960, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: MARK_O }}><Img src={staticFile('logo.png')} style={{ width: 70, height: 70, borderRadius: 35 }} /><span style={{ writingMode: 'vertical-rl', font: `700 26px ${FONT.ui}`, color: 'rgba(255,255,255,.85)' }}>@TheInvisiTech</span></div>);
export const Panel: React.FC<{ o?: number; children: React.ReactNode }> = ({ o = 1, children }) => (<div style={{ position: 'absolute', top: 226, left: 70, right: 70, height: 200, borderRadius: 40, background: 'rgba(10,14,36,.86)', border: '1px solid rgba(160,176,255,.25)', boxShadow: '0 20px 60px rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: o }}>{children}</div>);
export const Night: React.FC<{ id: string; f: number; stars?: number }> = ({ id, f, stars = 40 }) => (<>
  <defs><linearGradient id={id + 'S'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070a22" /><stop offset=".6" stopColor="#141a52" /><stop offset="1" stopColor="#1d2266" /></linearGradient>
    <radialGradient id={id + 'V'} cx=".5" cy=".45" r=".8"><stop offset=".4" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#02030c" stopOpacity=".85" /></radialGradient>
    <radialGradient id={id + 'C'}><stop offset="0" stopColor="#e9fdff" stopOpacity=".95" /><stop offset=".3" stopColor="#5fe3ff" stopOpacity=".5" /><stop offset="1" stopColor="#5fe3ff" stopOpacity="0" /></radialGradient>
    <radialGradient id={id + 'W'}><stop offset="0" stopColor="#fff6dc" stopOpacity=".9" /><stop offset=".3" stopColor="#ffd98a" stopOpacity=".4" /><stop offset="1" stopColor="#ffc864" stopOpacity="0" /></radialGradient></defs>
  <rect width={1080} height={1920} fill={`url(#${id}S)`} />
  {Array.from({ length: stars }).map((_, i) => <circle key={i} cx={hash(i * 3) * 1080} cy={hash(i * 7) * 1920} r={1 + hash(i) * 1.6} fill="#dfe6ff" opacity={0.2 + 0.25 * Math.sin(f / 15 + i)} />)}
</>);

/* 1. Inside the wire: light pulses bouncing down a glass core. Wire-scene clock 2.3 s to 4.9 s. */
export const FIB_A = 2.3, FIB_B = 4.9;
export const FiberCut: React.FC = () => {
  const f = useCurrentFrame(), T = FIB_A + f / FPS, k = f / FPS;
  const n = Math.round(1e9 * easeOut(clamp01((T - 2.45) / 1.2)));
  const zig = (x: number) => { const p = ((x + 4000) % 240) / 240; return (p < 0.5 ? p * 4 - 1 : 3 - p * 4) * 17; };
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a22' }}>
      <svg width={1080} height={1920}>
        <Night id="fb" f={f} stars={30} />
        <defs><linearGradient id="fJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3f86" /><stop offset=".25" stopColor="#5a60b8" /><stop offset=".55" stopColor="#262a66" /><stop offset="1" stopColor="#12143a" /></linearGradient>
          <linearGradient id="fK" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8f7fe0" stopOpacity=".75" /><stop offset=".3" stopColor="#b9aef6" stopOpacity=".6" /><stop offset=".6" stopColor="#6a5cc8" stopOpacity=".6" /><stop offset="1" stopColor="#3d3280" stopOpacity=".8" /></linearGradient>
          <linearGradient id="fG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d3a52" /><stop offset=".3" stopColor="#1d6f8a" /><stop offset=".5" stopColor="#0f4a66" /><stop offset="1" stopColor="#082a40" /></linearGradient></defs>
        <g transform={`translate(540 900) rotate(-24) scale(${1.45 + k * 0.04})`}>
          <ellipse cx={200} cy={0} rx={900} ry={260} fill="url(#fbC)" opacity={0.16} />
          {/* glass core, running the whole length */}
          <rect x={-1100} y={-30} width={2200} height={60} fill="url(#fG)" /><rect x={-1100} y={-30} width={2200} height={7} fill="#bff4ff" opacity={0.5} /><rect x={-1100} y={24} width={2200} height={6} fill="#04121c" opacity={0.6} />
          {/* the pulses: light bouncing off the walls of the core */}
          {Array.from({ length: 16 }).map((_, i) => { const x = -1100 + ((i * 138 + k * 1500) % 2200); if (x < -330) return null; return <g key={i}>
            {[1, 2, 3, 4, 5].map((j) => <circle key={j} cx={x - j * 15} cy={zig(x - j * 15)} r={9 - j * 1.3} fill="#5fe3ff" opacity={0.5 - j * 0.08} />)}
            <circle cx={x} cy={zig(x)} r={44} fill="url(#fbC)" /><circle cx={x} cy={zig(x)} r={9} fill="#f2feff" /></g>; })}
          {/* cladding, cut back */}
          <rect x={-1100} y={-88} width={1250} height={176} fill="url(#fK)" /><ellipse cx={150} cy={0} rx={26} ry={88} fill="#a898f0" opacity={0.85} /><ellipse cx={150} cy={0} rx={10} ry={30} fill="#1d6f8a" />
          {/* outer jacket, cut back further */}
          <rect x={-1100} y={-150} width={780} height={300} fill="url(#fJ)" /><ellipse cx={-320} cy={0} rx={40} ry={150} fill="#4a50a4" /><ellipse cx={-320} cy={0} rx={24} ry={88} fill="#8f7fe0" />
          {Array.from({ length: 6 }).map((_, i) => <line key={i} x1={-1000 + i * 120} y1={-150} x2={-1000 + i * 120} y2={150} stroke="#0a0c26" strokeWidth={5} opacity={0.35} />)}
          {/* two quiet labels, both above the cable so the subtitle stays clear */}
          <g opacity={prog(f + FIB_A * FPS, 2.5, 2.8)}><line x1={330} y1={-34} x2={330} y2={-104} stroke="#9fe9ff" strokeWidth={2.5} /><circle cx={330} cy={-34} r={5} fill="#9fe9ff" /><text x={330} y={-118} textAnchor="middle" style={{ font: `600 26px ${FONT.mono}`, letterSpacing: '0.12em' }} fill="#dffbff">GLASS CORE</text></g>
          <g opacity={prog(f + FIB_A * FPS, 2.9, 3.2)}><line x1={-90} y1={-10} x2={-90} y2={-176} stroke="#9fe9ff" strokeWidth={2.5} /><circle cx={-90} cy={-10} r={5} fill="#9fe9ff" /><text x={-90} y={-190} textAnchor="middle" style={{ font: `600 26px ${FONT.mono}`, letterSpacing: '0.12em' }} fill="#dffbff">BLINKS OF LIGHT</text></g>
        </g>
        <rect width={1080} height={1920} fill="url(#fbV)" />
      </svg>
      <Panel o={prog(f, 0.1, 0.35)}><div style={{ font: `700 78px/1 ${FONT.mono}`, color: '#9fe9ff', letterSpacing: '0.02em' }}>{n.toLocaleString('en-US')}</div><div style={{ font: `600 28px ${FONT.mono}`, letterSpacing: '0.2em', color: '#cfd8ff' }}>BLINKS EVERY SECOND</div></Panel>
      <Sub>{T < 3.75 ? <>Now it's a <em>billion</em> blinks,</> : <>every <em>second.</em></>}</Sub>
      <Mark />
    </AbsoluteFill>
  );
};

/* 2. The router up close: a message comes in on one cable, the router reads the address, and sends it out on another. Move-scene clock from 16.11 s. */
export const RT_A = 16.11;
export const RouterCut: React.FC = () => {
  const f = useCurrentFrame(), k = f / FPS;
  const RX = 540, RY = 900;
  const ends: [number, number, number][] = [[190, 1170, 1], [190, 560, 3], [880, 1170, 4], [880, 520, 7], [540, 1190, 9]];
  const port = (i: number): [number, number] => [RX - 120 + i * 60, RY + 62];
  const path = (i: number) => { const [ex, ey] = ends[i], [px, py] = port(i); return `M ${px} ${py} C ${px} ${py + 120}, ${lerp(px, ex, 0.5)} ${ey > RY ? ey + 40 : RY + 220}, ${ex} ${ey}`; };
  const along = (i: number, u: number): [number, number] => { const [ex, ey] = ends[i], [px, py] = port(i), c1 = [px, py + 120], c2 = [lerp(px, ex, 0.5), ey > RY ? ey + 40 : RY + 220], v = 1 - u; return [v * v * v * px + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * ex, v * v * v * py + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * ey]; };
  const inU = 1 - easeInOut(clamp01((k - 0.15) / 0.75)), read = prog(f, 0.9, 1.05) * (1 - prog(f, 1.45, 1.6)), outU = easeInOut(clamp01((k - 1.5) / 0.75)), sent = prog(f, 2.2, 2.35, easeOut);
  const pk = k < 0.9 ? along(0, inU) : k < 1.5 ? [RX, RY - 10] as [number, number] : along(3, outU);
  const env = (x: number, y: number, s = 1) => <g transform={`translate(${x} ${y}) scale(${s})`}><circle r={60} fill="url(#rtC)" opacity={0.8} /><rect x={-24} y={-17} width={48} height={34} rx={7} fill="#f2feff" stroke="#5fe3ff" strokeWidth={3} /><path d="M -21 -13 L 0 3 L 21 -13" stroke="#1d8fb0" strokeWidth={3.5} fill="none" /></g>;
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a22' }}>
      <svg width={1080} height={1920}>
        <Night id="rt" f={f} stars={26} />
        <g transform={`translate(540 900) scale(${1 + k * 0.02}) translate(-540 -900)`}>
          {/* the cables: all quiet except the one in use */}
          {ends.map(([ex, ey, n], i) => { const act = (i === 0 && k < 0.95) || (i === 3 && k > 1.45); return <g key={i}>
            <path d={path(i)} stroke="#0a0c26" strokeWidth={22} fill="none" strokeLinecap="round" /><path d={path(i)} stroke="#5f73b8" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.45} />
            {act && <><path d={path(i)} stroke="#5fe3ff" strokeWidth={30} fill="none" strokeLinecap="round" opacity={0.14} /><path d={path(i)} stroke="#5fe3ff" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.35} /><path d={path(i)} stroke="#dffbff" strokeWidth={4} fill="none" strokeLinecap="round" /></>}
            <g transform={`translate(${ex} ${ey})`} opacity={act || (i === 3) ? 1 : 0.55}><rect x={-112} y={-30} width={224} height={60} rx={16} fill={i === 3 ? '#ffe08a' : '#0e1430'} stroke={i === 3 ? '#fff' : '#5fe3ff'} strokeWidth={3} /><text y={11} textAnchor="middle" style={{ font: `600 30px ${FONT.mono}` }} fill={i === 3 ? '#3a2a05' : '#dffbff'}>192.168.1.{n}</text></g></g>; })}
          {/* the router box */}
          <ellipse cx={RX} cy={RY + 96} rx={300} ry={46} fill="#000" opacity={0.45} /><ellipse cx={RX} cy={RY + 20} rx={330} ry={250} fill="url(#rtC)" opacity={0.1 + 0.2 * read} />
          {[-150, 150].map((dx) => <g key={dx}><line x1={RX + dx} y1={RY - 60} x2={RX + dx * 1.25} y2={RY - 250} stroke="#1b1e3a" strokeWidth={16} strokeLinecap="round" /><circle cx={RX + dx * 1.25} cy={RY - 250} r={11} fill="#5fe3ff" opacity={0.6 + 0.4 * Math.sin(k * 8)} /></g>)}
          <polygon points={`${RX - 230},${RY - 70} ${RX + 230},${RY - 70} ${RX + 190},${RY - 130} ${RX - 190},${RY - 130}`} fill="#3d4a9a" /><rect x={RX - 230} y={RY - 70} width={460} height={150} rx={22} fill="#1a2050" stroke="#5fe3ff" strokeWidth={3} strokeOpacity={0.5 + 0.5 * read} />
          <rect x={RX - 230} y={RY - 70} width={460} height={30} rx={14} fill="#2c3680" opacity={0.8} />
          {[0, 1, 2, 3, 4].map((i) => { const [px, py] = port(i), lit = (i === 0 && k < 0.95) || (i === 3 && k > 1.45); return <g key={i}><rect x={px - 20} y={py - 30} width={40} height={34} rx={6} fill="#070a22" stroke={lit ? '#5fe3ff' : '#3a4380'} strokeWidth={3} /><circle cx={px} cy={py - 52} r={7} fill={lit ? '#9ff6ff' : '#2d3a6a'} />{lit && <circle cx={px} cy={py - 52} r={18} fill="url(#rtC)" />}</g>; })}
          <text x={RX} y={RY - 150} textAnchor="middle" style={{ font: `700 30px ${FONT.mono}`, letterSpacing: '0.24em' }} fill="#9fb0ff" opacity={0.9}>ROUTER</text>
          {/* the message, and the address the router reads */}
          {env(pk[0], pk[1], 1.5 + 0.5 * read)}
          <g transform={`translate(${RX} ${RY - 250}) scale(${0.6 + 0.4 * read})`} opacity={read}><rect x={-190} y={-40} width={380} height={80} rx={20} fill="#ffe08a" stroke="#fff" strokeWidth={3} /><text y={13} textAnchor="middle" style={{ font: `700 38px ${FONT.mono}` }} fill="#3a2a05">To: 192.168.1.7</text></g>
          {[0, 0.5].map((d) => { const u = (k * 1.6 + d) % 1; return <ellipse key={d} cx={RX} cy={RY} rx={240 + u * 120} ry={110 + u * 60} fill="none" stroke="#5fe3ff" strokeWidth={5 * (1 - u) + 1} opacity={(1 - u) * 0.6 * read} />; })}
          {sent > 0 && [0, 0.5].map((d) => { const u = (k * 1.6 + d) % 1; return <circle key={d} cx={ends[3][0]} cy={ends[3][1]} r={50 + u * 90} fill="none" stroke="#ffe08a" strokeWidth={5 * (1 - u) + 1} opacity={(1 - u) * 0.7 * sent} />; })}
        </g>
        <rect width={1080} height={1920} fill="url(#rtV)" />
      </svg>
      <Panel o={prog(f, 0.05, 0.3)}><div style={{ font: `800 60px/1.1 ${FONT.ui}`, color: '#eef1ff' }}>{k < 0.95 ? <>In on <span style={{ color: '#9fe9ff' }}>one</span> cable</> : k < 1.5 ? <>Reads the <span style={{ color: '#ffd38a' }}>address</span></> : <>Out on the <span style={{ color: '#9fe9ff' }}>right</span> one</>}</div><div style={{ font: `600 26px ${FONT.mono}`, letterSpacing: '0.18em', color: '#a9b4dd' }}>INSIDE THE ROUTER</div></Panel>
      <Sub>The router reads it and <em>delivers.</em></Sub>
      <Mark />
    </AbsoluteFill>
  );
};

/* 3. The ending: back on his balcony, where it began. Her reply lands on his phone; the torch rests on the railing. */
const FWin: React.FC<{ x: number; y: number; w: number; h: number; lit?: boolean }> = ({ x, y, w, h, lit = true }) => (
  <g><rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} fill="#6fc6c0" /><rect x={x} y={y} width={w} height={h} fill={lit ? '#ffd88a' : '#101a36'} />{lit && <rect x={x} y={y} width={w * 0.34} height={h} fill="#e98f6a" opacity={0.75} />}
    <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#1f5f6a" strokeWidth={6} /><line x1={x} y1={y + h * 0.45} x2={x + w} y2={y + h * 0.45} stroke="#1f5f6a" strokeWidth={6} /><rect x={x - 14} y={y + h + 6} width={w + 28} height={12} fill="#8fe0d8" /></g>);
export const Finale: React.FC<{ place?: string }> = ({ place = 'MUMBAI' }) => {
  const f = useCurrentFrame(), k = f / FPS;
  const got = prog(f, 0.85, 1.0, easeOut), joy = prog(f, 1.35, 1.6, easeOut), hop = Math.abs(Math.sin((k - 1.35) * 8)) * 26 * joy;
  const lm = (x: number, y: number, a: number, l: number) => { const r = a * Math.PI / 180; return [x + Math.sin(r) * l, y + Math.cos(r) * l]; };
  const armR: [number, number] = [lerp(46, 150 + Math.sin(k * 10) * 8, joy), lerp(148, 172 + Math.sin(k * 10) * 10, joy)];
  const him: StickPose = { blink: Math.max(0, 1 - Math.abs(k - 0.5) / 0.07), smile: lerp(0.45, 1, got), look: lerp(0.5, 0, joy), armR, armL: [lerp(-10, -150, joy), lerp(-6, -170, joy)], tilt: 3 * (1 - joy) + Math.sin(k * 10) * 3 * joy };
  const [ex, ey] = lm(A_SHOULDER.x, A_SHOULDER.y, armR[0], A_UPPER), [wx, wy] = lm(ex, ey, armR[1], A_FORE);
  const HX = 500, HY = 1150, S = 1.5, ph = { x: HX + wx * S, y: HY - hop + (wy - 20) * S };
  const u = easeInOut(clamp01((k - 0.15) / 0.7)), src = { x: 1150, y: 380 }, pkx = lerp(src.x, ph.x, u), pky = lerp(src.y, ph.y, u) - 160 * Math.sin(Math.PI * u);
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a22' }}>
      <svg width={1080} height={1920}>
        <Night id="fn" f={f} stars={60} />
        <defs><linearGradient id="fnH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3f9aa0" /><stop offset="1" stopColor="#1f5a70" /></linearGradient></defs>
        <g transform={`translate(540 960) scale(${1.02 + k * 0.012}) translate(-540 -960)`}>
          {/* his teal house, close */}
          <rect x={60} y={420} width={960} height={1500} fill="url(#fnH)" />
          {Array.from({ length: 60 }).map((_, i) => <line key={i} x1={60} y1={440 + i * 25} x2={1020} y2={440 + i * 25} stroke="#000" strokeWidth={2} opacity={0.12} />)}
          <rect x={30} y={376} width={1020} height={52} fill="#7fd6cf" /><rect x={30} y={424} width={1020} height={12} fill="#1f5f6a" />
          {Array.from({ length: 27 }).map((_, i) => <g key={i}><circle cx={40 + i * 39} cy={446 + Math.sin(i * 1.4) * 5} r={10} fill={i % 2 ? '#9fe9ff' : '#fff1d0'} opacity={0.2} /><circle cx={40 + i * 39} cy={446 + Math.sin(i * 1.4) * 5} r={4.5} fill={i % 2 ? '#9fe9ff' : '#fff1d0'} opacity={0.6 + 0.4 * Math.sin(k * 3 + i)} /></g>)}
          <FWin x={120} y={640} w={170} h={250} /><FWin x={800} y={640} w={170} h={250} lit={false} /><FWin x={120} y={1380} w={170} h={250} lit={false} /><FWin x={800} y={1380} w={170} h={250} /><rect x={410} y={1400} width={200} height={520} fill="#173a52" stroke="#6fc6c0" strokeWidth={8} /><circle cx={584} cy={1640} r={8} fill="#ffd38a" />
          <rect x={380} y={590} width={260} height={570} fill="#fff1d0" /><rect x={394} y={604} width={232} height={556} fill="#1a2f52" /><rect x={394} y={604} width={232} height={556} fill="url(#fnH)" opacity={0.25} />
          <ellipse cx={HX} cy={HY - 260} rx={300} ry={340} fill="url(#fnW)" opacity={0.3} />
          <ellipse cx={HX} cy={HY - 250} rx={330} ry={360} fill="url(#fnC)" opacity={0.1 + 0.16 * got} />
          {/* him */}
          <g transform={`translate(${HX} ${HY - hop}) scale(${S})`}><Adult kind="man" p={him} id="fin" /></g>
          {/* the phone in his hand, lit by her reply */}
          <g transform={`translate(${ph.x} ${ph.y}) rotate(${lerp(-12, 8, joy)})`}><circle r={70} fill="url(#fnC)" opacity={0.75 * got} /><rect x={-22} y={-40} width={44} height={80} rx={9} fill="#0b0d1c" stroke="#5a6088" strokeWidth={3} /><rect x={-17} y={-33} width={34} height={64} rx={5} fill={got > 0.5 ? '#bff4ff' : '#27305e'} /></g>
          {/* balcony slab and railing, with the torch resting where he left it */}
          <rect x={150} y={HY} width={780} height={34} fill="#7fd6cf" /><rect x={150} y={HY + 34} width={780} height={16} fill="#1f5f6a" />
          <line x1={160} y1={HY - 170} x2={920} y2={HY - 170} stroke="#0c1020" strokeWidth={12} strokeLinecap="round" />
          {Array.from({ length: 15 }).map((_, i) => <line key={i} x1={166 + i * 53.4} y1={HY - 170} x2={166 + i * 53.4} y2={HY} stroke="#0c1020" strokeWidth={7} />)}
          <g transform={`translate(770 ${HY - 196}) rotate(-4)`}><circle cx={88} cy={0} r={46} fill="url(#fnW)" opacity={0.5} /><rect x={-70} y={-15} width={110} height={30} rx={8} fill="#2a2f4c" /><rect x={-70} y={-15} width={110} height={10} rx={5} fill="#5a6088" opacity={0.7} /><polygon points="40,-15 78,-28 78,28 40,15" fill="#d24a30" /><rect x={76} y={-30} width={9} height={60} rx={4} fill="#e3e7f2" /></g>
          {/* her reply arrives as one cyan message */}
          {u < 1 && <g><path d={`M ${src.x} ${src.y} Q ${lerp(src.x, ph.x, 0.5)} ${lerp(src.y, ph.y, 0.5) - 320} ${ph.x} ${ph.y}`} stroke="#5fe3ff" strokeWidth={5} strokeDasharray="4 18" fill="none" opacity={0.5} />
            {[1, 2, 3, 4, 5, 6].map((j) => { const v = Math.max(0, u - j * 0.03); return <circle key={j} cx={lerp(src.x, ph.x, v)} cy={lerp(src.y, ph.y, v) - 160 * Math.sin(Math.PI * v)} r={12 - j * 1.5} fill="#5fe3ff" opacity={0.5 - j * 0.07} />; })}
            <g transform={`translate(${pkx} ${pky})`}><circle r={70} fill="url(#fnC)" /><rect x={-26} y={-18} width={52} height={36} rx={7} fill="#f2feff" stroke="#5fe3ff" strokeWidth={3} /><path d="M -22 -14 L 0 3 L 22 -14" stroke="#1d8fb0" strokeWidth={3.5} fill="none" /></g></g>}
          {/* the reply bubble */}
          {got > 0 && <g transform={`translate(${HX + 60} ${HY - 720 - hop * 0.5}) scale(${0.6 + 0.4 * got + 0.06 * Math.sin(Math.PI * clamp01((k - 0.85) / 0.4))})`} opacity={got}>
            <path d="M -210 -90 h 420 a 34 34 0 0 1 34 34 v 112 a 34 34 0 0 1 -34 34 h -300 l -60 52 l 10 -52 h -70 a 34 34 0 0 1 -34 -34 v -112 a 34 34 0 0 1 34 -34 Z" fill="#0e1430" stroke="#5fe3ff" strokeWidth={5} />
            <path d="M -210 -90 h 420 a 34 34 0 0 1 34 34 v 112 a 34 34 0 0 1 -34 34 h -300 l -60 52 l 10 -52 h -70 a 34 34 0 0 1 -34 -34 v -112 a 34 34 0 0 1 34 -34 Z" fill="none" stroke="#5fe3ff" strokeWidth={16} opacity={0.18} />
            <text x={-180} y={-18} style={{ font: `600 30px ${FONT.mono}`, letterSpacing: '0.1em' }} fill="#9fe9ff">HER · {place}</text>
            <text x={-180} y={58} style={{ font: `800 84px ${FONT.ui}` }} fill="#fff">Hi!</text>
            <path d="M 150 14 c -22 -26 -56 4 0 42 c 56 -38 22 -68 0 -42 Z" fill="#ff6f91" /></g>}
          {[0, 1, 2, 3].map((i) => { const v = ((k - 1.4) * 0.8 + i / 4) % 1; if (k < 1.4) return null; const x = HX - 150 + i * 100 + Math.sin(k * 2 + i) * 12, y = HY - 520 - v * 220; return <path key={i} d={`M ${x} ${y} c -14 -16 -34 2 0 26 c 34 -24 14 -42 0 -26 Z`} fill="#ff6f91" opacity={(1 - v) * 0.9} />; })}
        </g>
        <rect width={1080} height={1920} fill="url(#fnV)" />
      </svg>
    </AbsoluteFill>
  );
};
