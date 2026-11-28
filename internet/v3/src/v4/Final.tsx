import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { lerp, easeInOut, clamp01 } from '../lib/anim';
import { FONT } from '../lib/palette';
import { Vert } from './frame';
import { Seabed, SeabedRepeater } from './Seabed';
import { Planet } from './Planet';

/* Part 2 final cut: the existing sea clips with a millisecond counter (top right) that keeps counting up, 12 -> 34 -> 47 -> 65 ms over the cable's trip. */
const Hud: React.FC<{ from: number; to: number; start: number; frames: number }> = ({ from, to, start, frames }) => {
  const f = useCurrentFrame(), v = Math.round(lerp(from, to, easeInOut(clamp01((f - start) / frames))));
  return (<div style={{ position: 'absolute', right: 96, top: 300, textAlign: 'right', fontFamily: FONT.mono, textShadow: '0 0 28px rgba(255,200,110,.85), 0 4px 14px rgba(0,0,0,.7)' }}>
    <span style={{ font: `800 104px/1 ${FONT.mono}`, color: '#ffe3a0', letterSpacing: '0.02em' }}>{String(v).padStart(3, '0')}</span><span style={{ font: `800 40px/1 ${FONT.mono}`, color: '#fff', marginLeft: 10 }}>ms</span></div>);
};
export const SeabedMs: React.FC = () => (<AbsoluteFill><Vert><Seabed /></Vert><Hud from={12} to={34} start={0} frames={90} /></AbsoluteFill>);
export const RepeaterMs: React.FC = () => (<AbsoluteFill><Vert><SeabedRepeater /></Vert><Hud from={34} to={47} start={0} frames={72} /></AbsoluteFill>);
export const PlanetMs: React.FC = () => (<AbsoluteFill><Vert><Planet /></Vert><Hud from={47} to={65} start={90} frames={120} /></AbsoluteFill>);
