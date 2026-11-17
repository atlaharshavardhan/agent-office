import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { FPS, clamp01 } from '../lib/anim';
import { Sub, Mark, Finale } from '../dusk/Extras';
import { World, WorldWeb } from '../tail/World';
import { SeaCut } from '../tail/Sea';
import { EndCard } from '../tail/Ends';
import plan from './short-plan.json';
import plan1 from '../dusk/part1-plan.json';

/* The pieces that go round the clean 3D scene renders to make the Short: two short runs of the approved V3 ending, and a see-through
   layer with the spoken captions and the watermark. The cut list and caption times come from audio/make_short_mix.py. */
const S = (s: number) => Math.round(s * FPS);
const Shot: React.FC<{ from: number; to: number; fade?: number; children: React.ReactNode }> = ({ from, to, fade = 0.2, children }) => {
  const f = useCurrentFrame(), t = f / FPS; if (t < from - 0.001 || t >= to + fade) return null;
  return <Sequence from={S(from)} durationInFrames={S(to + fade) - S(from)}><AbsoluteFill style={{ opacity: 1 - clamp01((t - to) / fade) }}>{children}</AbsoluteFill></Sequence>; };
/* she moves to London: the approved V3 plane and globe shot, up to the moment she lands */
export const FLY_FRAMES = S(4.4);
export const ShortFly: React.FC = () => (<AbsoluteFill style={{ backgroundColor: '#070a22' }}><World /></AbsoluteFill>);
/* the anchor cuts a cable, the packets take another one */
export const END_A_FRAMES = S(4.8);
export const ShortEndA: React.FC = () => (<AbsoluteFill style={{ backgroundColor: '#070a22' }}><Shot from={1.8} to={4.8} fade={0}><WorldWeb mode="cut" /></Shot><Shot from={0} to={1.8} fade={0.12}><SeaCut /></Shot></AbsoluteFill>);
/* his balcony, then the end card */
export const END_B_FRAMES = S(6.8);
export const ShortEndB: React.FC = () => (<AbsoluteFill style={{ backgroundColor: '#070a22' }}><Shot from={3.2} to={6.8} fade={0}><EndCard /></Shot><Shot from={0} to={3.2}><Finale place="LONDON" /></Shot></AbsoluteFill>);
const em = (s: string) => s.split('*').map((p, i) => (i % 2 ? <em key={i}>{p}</em> : <React.Fragment key={i}>{p}</React.Fragment>));
export const OVERLAY_FRAMES = S(plan.dur);
export const ShortOverlay: React.FC = () => {
  const t = useCurrentFrame() / FPS; let line: string | null = null; for (const [a, b, x] of plan.subs as [number, number, string][]) if (t >= a && t < b) line = x;
  return <AbsoluteFill>{line && <Sub>{em(line)}</Sub>}{t < plan.endcard && <Mark />}</AbsoluteFill>; };
/* Part 1's closing shot: she flies to London (the approved V3 plane and globe, with the cable starting to draw as a teaser), then the end card */
export const PART1_FLY_FRAMES = S(plan1.fly + plan1.end);
export const Part1Fly: React.FC = () => {
  const t = useCurrentFrame() / FPS; let line: string | null = null; for (const [a, b, x] of plan1.flysubs as [number, number, string][]) if (t >= a && t < b) line = x;
  return <AbsoluteFill style={{ backgroundColor: '#070a22' }}><Shot from={plan1.fly} to={plan1.fly + plan1.end} fade={0}><EndCard /></Shot><Shot from={0} to={plan1.fly}><World /></Shot>{line && <Sub>{em(line)}</Sub>}{t < plan1.fly && <Mark />}</AbsoluteFill>; };
