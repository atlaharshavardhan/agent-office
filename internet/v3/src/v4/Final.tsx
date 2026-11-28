import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { lerp, easeInOut, clamp01, hash } from '../lib/anim';
import { Sequence } from 'remotion';
import { FONT } from '../lib/palette';
import { Vert } from './frame';
import { Seabed, SeabedRepeater } from './Seabed';
import { Planet, ov, project, ll, R, MAIN } from './Planet';
import { Sat } from './Hook';
import { Charminar, PaperPhoto } from './Story';
import { routeAt, LL, LONDON as LONDON_LL } from '../tail/Globe';
import { prog, easeOut } from '../lib/anim';

/* Part 2 final cut: the existing sea clips with a millisecond counter (top right) that keeps counting up, 12 -> 34 -> 47 -> 65 ms over the cable's trip. */
/* the readout: big ms counter, then how far the photo has gone (about 13,000 km of cable in 65 ms) and how fast: light in glass, 200,000 km/s */
export const KM_TOTAL = 13000;
export const SpeedReadout: React.FC<{ ms: number; style?: React.CSSProperties }> = ({ ms, style }) => {
  const km = Math.round(((ms / 65) * KM_TOTAL) / 100) * 100;
  return (<div style={{ position: 'absolute', right: 70, top: 290, textAlign: 'right', textShadow: '0 0 28px rgba(255,200,110,.85), 0 4px 14px rgba(0,0,0,.75)', ...style }}>
    <div><span style={{ font: `800 104px/1 ${FONT.mono}`, color: '#ffe3a0', letterSpacing: '0.02em' }}>{String(ms).padStart(3, '0')}</span><span style={{ font: `800 40px/1 ${FONT.mono}`, color: '#fff', marginLeft: 10 }}>ms</span></div>
    <div style={{ marginTop: 12, font: `800 38px/1 ${FONT.mono}`, color: '#fff' }}>{km.toLocaleString('en-US')}<span style={{ fontSize: 26, color: '#ffd38a' }}> km travelled</span></div>
    <div style={{ marginTop: 10, font: `800 34px/1 ${FONT.mono}`, color: '#9fe9ff' }}>200,000<span style={{ fontSize: 24, color: '#cfe9ff' }}> km/s</span></div>
    <div style={{ marginTop: 8, font: `600 21px/1 ${FONT.ui}`, color: '#cdbfdc' }}>light in glass</div>
  </div>);
};
const Hud: React.FC<{ from: number; to: number; start: number; frames: number }> = ({ from, to, start, frames }) => {
  const f = useCurrentFrame(), v = Math.round(lerp(from, to, easeInOut(clamp01((f - start) / frames))));
  return <SpeedReadout ms={v} />;
};
export const SeabedMs: React.FC = () => (<AbsoluteFill><Vert><Seabed /></Vert><Hud from={12} to={34} start={0} frames={90} /></AbsoluteFill>);
export const RepeaterMs: React.FC = () => (<AbsoluteFill><Vert><SeabedRepeater /></Vert><Hud from={34} to={47} start={0} frames={72} /></AbsoluteFill>);
export const PlanetMs: React.FC = () => (<AbsoluteFill><Vert><Planet /></Vert><Hud from={47} to={65} start={90} frames={120} /></AbsoluteFill>);

/* the sea-floor shot for the hook: only speed. No place names; the ms counter, speed streaks flying out of the horizon, and bright light pulses racing along the cable towards us. */
const CABLE: [number, number][] = [[566, 908], [545, 975], [500, 1040], [420, 1120], [300, 1230], [150, 1370], [0, 1560]];
const cableAt = (u: number): [number, number] => { const k = clamp01(u) * (CABLE.length - 1), i = Math.min(CABLE.length - 2, Math.floor(k)), a = CABLE[i], b = CABLE[i + 1], fr = k - i; return [lerp(a[0], b[0], fr), lerp(a[1], b[1], fr)]; };
export const SeabedFast: React.FC = () => {
  const f = useCurrentFrame();
  return (<AbsoluteFill>
    <Vert><Seabed bare /></Vert>
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs><filter id="sg"><feGaussianBlur stdDeviation="5" /></filter><radialGradient id="vp"><stop offset="0" stopColor="#ffe3a0" stopOpacity={0.55} /><stop offset="1" stopColor="#ffb454" stopOpacity={0} /></radialGradient></defs>
      <ellipse cx={566} cy={908} rx={260} ry={60} fill="url(#vp)" />
      {Array.from({ length: 6 }).map((_, i) => { const u = (f * 0.032 + i / 6) % 1, u1 = Math.min(1, u + 0.07 + u * 0.05), a = cableAt(u), b = cableAt(u1), w = 3 + u * 14;
        return <g key={i} opacity={Math.sin(Math.PI * Math.min(1, u * 1.1))}><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#ffb454" strokeWidth={w * 2.4} strokeLinecap="round" opacity={0.5} filter="url(#sg)" /><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#fff6dc" strokeWidth={w} strokeLinecap="round" /></g>; })}
    </svg>
    <Hud from={1} to={53} start={36} frames={51} />
  </AbsoluteFill>);
};

/* the sea-floor shot for the 10 s hook: only the natural light of the scene (the bright flare racing along the cable) and the speed readout. No streak lines, no extra dashes. */
export const SeabedLight: React.FC<{ from?: number; to?: number; start?: number; frames?: number }> = ({ from = 18, to = 53, start = 85, frames = 90 }) => (<AbsoluteFill><Vert><Seabed bare /></Vert><Hud from={from} to={to} start={start} frames={frames} /></AbsoluteFill>);

/* the satellite question on the globe (12 s hook, shot 4, 2 s): a satellite flies in with a ? and the words "A satellite?", a red cross crosses it out ("Almost never"),
   the cables are lit, and the photo (the dog) flies the last stretch of the route and lands on London. ms counter 53 to 65. */
export const GlobeSat: React.FC = () => {
  const f = useCurrentFrame(), t = f / 30, T0 = 300 / 30;
  ov.lon = () => 40; ov.show = () => 1; ov.pins = 0;
  const q = prog(f, 0.1, 0.55, easeOut), no = prog(f, 0.9, 1.2, easeOut), satIn = prog(f, 0, 0.65, easeOut);
  const u = 0.78 + 0.22 * easeInOut(clamp01((t - 0.75) / 1.0)), pt = T0 + t, arrived = prog(f, 1.8, 2.0, easeOut);
  const [x, y, front] = project(pt, ll(routeAt(MAIN, u) as unknown as LL, R * 1.012));
  const sx = lerp(1010, 800, satIn), sy = lerp(470, 560, satIn) + Math.sin(t * 2) * 5;
  const ms = Math.round(lerp(53, 65, easeInOut(clamp01((t - 0.75) / 1.0))));
  const chip = (txt: string, o: number, col: string) => <div style={{ position: 'absolute', left: 0, right: 0, top: 236, display: 'flex', justifyContent: 'center', opacity: o }}><div style={{ padding: '14px 34px', borderRadius: 32, background: 'rgba(10,14,36,.9)', border: `3px solid ${col}`, font: `800 42px/1 ${FONT.ui}`, color: '#fff', whiteSpace: 'nowrap' }}>{txt}</div></div>;
  return (<AbsoluteFill style={{ backgroundColor: '#14091c' }}>
    <Sequence from={-300}><Planet /></Sequence>
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs><radialGradient id="gs"><stop offset="0" stopColor="#ffe3a0" stopOpacity={0.9} /><stop offset="1" stopColor="#ffb454" stopOpacity={0} /></radialGradient></defs>
      <g opacity={satIn * (1 - no * 0.6)}><Sat x={sx} y={sy} s={1.0} rot={-18} /></g>
      <g opacity={q * (1 - no)} transform={`translate(${sx - 140} ${sy - 80})`}><circle r={44} fill="#ffd38a" /><text y={19} textAnchor="middle" fill="#07102c" style={{ font: `900 60px ${FONT.ui}` }}>?</text></g>
      <g opacity={no}><line x1={sx - 125} y1={sy - 85} x2={sx + 125} y2={sy + 85} stroke="#ff5a5a" strokeWidth={15} strokeLinecap="round" /><line x1={sx + 125} y1={sy - 85} x2={sx - 125} y2={sy + 85} stroke="#ff5a5a" strokeWidth={15} strokeLinecap="round" /></g>
      {front && <g transform={`translate(${x} ${y})`}><circle r={100} fill="url(#gs)" /><rect x={-46} y={-46} width={92} height={92} rx={12} fill="#fff" stroke="#ffb454" strokeWidth={5} /><svg x={-40} y={-40} width={80} height={80} viewBox="0 0 190 190"><Charminar /></svg></g>}
      {arrived > 0 && (() => { const [lx, ly] = project(pt, ll(LONDON_LL, R * 1.012)); return [0, 1].map((i) => { const p = clamp01((arrived - i * 0.25) / 0.75); return p > 0 ? <circle key={i} cx={lx} cy={ly} r={14 + p * 70} fill="none" stroke="#fff3c8" strokeWidth={6 * (1 - p)} opacity={0.9 * (1 - p)} /> : null; }); })()}
    </svg>
    {chip('A satellite?', q * (1 - no), '#ffd38a')}{chip('Almost never', no, '#ff7a7a')}
    <SpeedReadout ms={ms} />
  </AbsoluteFill>);
};
export const SeabedLight12: React.FC = () => <SeabedLight from={27} to={53} start={85} frames={45} />;

/* shot 2 of the 12 s hook: the globe with the satellite question FIRST. The photo has just landed on the Hyderabad pin and starts along the cable (0 to 11 ms), a satellite flies in with "?", a red cross, "No". */
export const GlobeSatStart: React.FC<{ cross?: boolean; span?: number }> = ({ cross = true, span }) => {
  const f = useCurrentFrame(), t = f / 30, T0 = 300 / 30;
  ov.lon = () => 40; ov.show = () => 1; ov.pins = 0; ov.thin = true;
  ov.u = span ? (tt: number) => easeInOut(clamp01((tt - 10 - 0.2) / span)) : cross ? null : (tt: number) => 0.55 * easeInOut(clamp01((tt - 10 - 0.1) / 1.9));      // Harsh: the amber line is drawn live, with the photo at its tip
  const q = prog(f, 0.05, 0.4, easeOut), no = cross ? prog(f, 0.95, 1.25, easeOut) : 0, satIn = prog(f, 0, 0.5, easeOut), land = prog(f, 0, 0.25, easeOut);
  const u = span ? easeInOut(clamp01((t - 0.2) / span)) : cross ? 0.15 * easeInOut(clamp01((t - 0.3) / 1.6)) : 0.55 * easeInOut(clamp01((t - 0.1) / 1.9)), pt = T0 + t;   // (with cross=false the satellite stays with its question mark)
  const [x, y, front] = project(pt, ll(routeAt(MAIN, u) as unknown as LL, R * 1.012));
  const sx = lerp(-160, 390, satIn) + Math.sin(t * 1.7) * 9, sy = 452 + Math.sin(t * 2.2) * 8, ms = Math.round(cross ? 11 * easeInOut(clamp01((t - 0.3) / 1.6)) : 65 * u);
  const chip = (txt: string, o: number, col: string) => <div style={{ position: 'absolute', left: 0, right: 0, top: 236, display: 'flex', justifyContent: 'center', opacity: o }}><div style={{ padding: '14px 34px', borderRadius: 32, background: 'rgba(10,14,36,.9)', border: `3px solid ${col}`, font: `800 42px/1 ${FONT.ui}`, color: '#fff', whiteSpace: 'nowrap' }}>{txt}</div></div>;
  return (<AbsoluteFill style={{ backgroundColor: '#14091c' }}>
    <Sequence from={-300}><Planet /></Sequence>
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs><radialGradient id="gs2"><stop offset="0" stopColor="#ffe3a0" stopOpacity={0.9} /><stop offset="1" stopColor="#ffb454" stopOpacity={0} /></radialGradient></defs>
      <g opacity={satIn * (1 - no * 0.6)}><Sat x={sx} y={sy} s={1.0} rot={-14 + Math.sin(t * 1.9) * 3} /></g>
      <g opacity={q * (1 - no)} transform={`translate(${sx - 150} ${sy - 12})`}><circle r={42} fill="#ffd38a" /><text y={18} textAnchor="middle" fill="#07102c" style={{ font: `900 58px ${FONT.ui}` }}>?</text></g>
      {/* dots only from the satellite towards the Earth */}
      <g opacity={q}>{Array.from({ length: 7 }).map((_, i) => { const ph = ((i / 7) + t * 0.9) % 1, x = lerp(sx + 4, sx - 14, ph), y = lerp(sy + 44, 592, ph); return <circle key={i} cx={x} cy={y} r={4 + 3 * ph} fill="#ffd38a" opacity={Math.sin(Math.PI * ph) * 0.95} />; })}</g>
      <g opacity={no}><line x1={sx - 130} y1={sy - 90} x2={sx + 130} y2={sy + 90} stroke="#ff5a5a" strokeWidth={16} strokeLinecap="round" /><line x1={sx + 130} y1={sy - 90} x2={sx - 130} y2={sy + 90} stroke="#ff5a5a" strokeWidth={16} strokeLinecap="round" /></g>
      {front && <g transform={`translate(${x} ${y})`} opacity={land}><circle r={100} fill="url(#gs2)" /><rect x={-46} y={-46} width={92} height={92} rx={12} fill="#fff" stroke="#ffb454" strokeWidth={5} /><svg x={-40} y={-40} width={80} height={80} viewBox="0 0 190 190"><Charminar /></svg></g>}
    </svg>
    {chip('A satellite?', q * (1 - no), '#ffd38a')}{chip('No', no, '#ff7a7a')}
    <SpeedReadout ms={ms} style={{ top: 330 }} />
  </AbsoluteFill>);
};
export const SeabedLight12b: React.FC = () => <SeabedLight from={11} to={53} start={85} frames={60} />;

export const GlobeSatQ: React.FC = () => <GlobeSatStart cross={false} />;
export const GlobeHook: React.FC = () => <GlobeSatStart cross={false} span={3.6} />;     // hook v10: the line is drawn all the way, Hyderabad to London, with the photo at its tip
export const SeabedLight12c: React.FC = () => <SeabedLight from={11} to={65} start={85} frames={120} />;
