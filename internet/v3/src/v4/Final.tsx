import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { lerp, easeInOut, clamp01, hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { Vert } from './frame';
import { Seabed, SeabedRepeater } from './Seabed';
import { Planet } from './Planet';

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
export const SeabedLight: React.FC<{ from?: number; to?: number; start?: number; frames?: number }> = ({ from = 1, to = 53, start = 60, frames = 51 }) => (<AbsoluteFill><Vert><Seabed bare /></Vert><Hud from={from} to={to} start={start} frames={frames} /></AbsoluteFill>);
