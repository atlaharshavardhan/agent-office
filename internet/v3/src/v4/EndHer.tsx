import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { Notif } from './Story';
/* Part 2 ending: the open loop and the follow call to action. 9:16. */
const sm = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * (3 - 2 * x); };
export const END_FRAMES = 135;
export const EndHer: React.FC = () => { const t = useCurrentFrame() / 30;
  return (<AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #14205a 0%, #070a22 70%)' }}>
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>{[...Array(60)].map((_, k) => <circle key={k} cx={hash(k) * 1080} cy={hash(k + 40) * 1920} r={1 + hash(k + 3) * 1.6} fill="#cfd8ff" opacity={0.25 + 0.25 * Math.sin(t * 1.2 + k)} />)}</svg>
    <div style={{ position: 'absolute', left: 60, right: 60, top: 560, textAlign: 'center', opacity: sm((t - 0.2) / 0.5) * (1 - sm((t - 2.1) / 0.4)), font: `900 120px/1.1 ${FONT.ui}`, color: '#fff', textShadow: '0 8px 24px rgba(0,0,0,.6)' }}>That took less than a <span style={{ color: '#7fd4ff' }}>blink.</span></div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: sm((t - 2.4) / 0.5) }}><div style={{ font: `900 130px/1.1 ${FONT.ui}`, color: '#fff' }}>Follow for</div><div style={{ font: `900 170px/1.1 ${FONT.ui}`, color: '#ffd38a' }}>more</div>
      <div style={{ display: 'inline-block', marginTop: 70, padding: '24px 60px', borderRadius: 60, background: '#ffd38a', font: `900 64px/1 ${FONT.ui}`, color: '#2a1630' }}>@TheInvisiTech</div></div>
  </AbsoluteFill>); };

export const NotifHer: React.FC = () => (<AbsoluteFill><Notif who="Boyfriend" /><div style={{ position: 'absolute', right: 70, top: 150, display: 'flex', alignItems: 'baseline', gap: 8, font: `800 120px/1 ${FONT.ui}`, color: '#7fd4ff', textShadow: '0 0 30px rgba(127,212,255,.6)' }}>062<span style={{ font: `800 40px ${FONT.ui}` }}>ms</span></div></AbsoluteFill>);
