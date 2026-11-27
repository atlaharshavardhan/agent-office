import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FPS, clamp01 } from '../lib/anim';
import { Sub, Mark, Finale } from '../dusk/Extras';
import { World, WorldWeb } from './World';
import { SeaA, SeaCut } from './Sea';
import { Packets, London, EndCard } from './Ends';

/* The second half of the film: packets, the flight to London, the cable under the sea, the cut, her reply, the end card.
   Times are in seconds on the tail's own clock; narration starts are in SUBS and in audio/make_tail_mix.py. */
const S = (s: number) => Math.round(s * FPS);
export const CUTS = { pk: 0, world: 5.2, sea: 12.3, web: 15.6, cut: 18.6, web2: 20.4, lon: 23.4, fin: 27.4, end: 30.6, stop: 34.2 };
export const TAIL_FRAMES = S(CUTS.stop);
const SUBS: [number, number, React.ReactNode][] = [
  [0.3, 2.9, <>Big videos get chopped into small <em>packets,</em></>], [3.0, 4.9, <>each carrying that <em>address.</em></>],
  [5.6, 7.5, <>Then she flies to <em>London.</em></>], [9.5, 12.0, <>Now the routers link up <em>under the sea,</em></>],
  [12.5, 14.6, <>through <em>glass cables</em> carrying light.</>], [14.9, 18.3, <>Almost <em>all data</em> between continents travels this way.</>],
  [18.7, 20.2, <><em>Anchors</em> cut them,</>], [20.5, 22.0, <>so we lay <em>hundreds.</em></>], [22.1, 23.4, <>Packets <em>reroute.</em></>],
  [23.8, 26.2, <>And her reply still lands <em>in a blink.</em></>], [27.8, 29.9, <>That's how <em>this video</em> reached you.</>],
];
/* each scene fades through the next over a few frames, so the cuts feel like one move */
const Shot: React.FC<{ from: number; to: number; fade?: number; children: React.ReactNode }> = ({ from, to, fade = 0.2, children }) => {
  const f = useCurrentFrame(), t = f / FPS; if (t < from - 0.001 || t >= to + fade) return null;
  return <Sequence from={S(from)} durationInFrames={S(to + fade) - S(from)}><AbsoluteFill style={{ opacity: 1 - clamp01((t - to) / fade) }}>{children}</AbsoluteFill></Sequence>;
};
export const TailFilm: React.FC<{ mute?: boolean }> = ({ mute }) => {
  const f = useCurrentFrame(), t = f / FPS; let line: React.ReactNode = null; for (const [a, b, x] of SUBS) if (t >= a && t < b) line = x;
  const C = CUTS;
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a22' }}>
      {!mute && <Audio src={staticFile('tail-mix.wav')} />}
      {/* later shots sit underneath, so each one is revealed as the shot above it fades */}
      <Shot from={C.end} to={C.stop} fade={0}><EndCard /></Shot>
      <Shot from={C.fin} to={C.end}><Finale place="LONDON" /></Shot>
      <Shot from={C.lon} to={C.fin}><London /></Shot>
      <Shot from={C.web2} to={C.lon}><WorldWeb mode="cut" /></Shot>
      <Shot from={C.cut} to={C.web2} fade={0.12}><SeaCut /></Shot>
      <Shot from={C.web} to={C.cut}><WorldWeb mode="all" /></Shot>
      <Shot from={C.sea} to={C.web} fade={0.3}><SeaA /></Shot>
      <Shot from={C.world} to={C.sea} fade={0.1}><World /></Shot>
      <Shot from={C.pk} to={C.world}><Packets /></Shot>
      {line && <Sub>{line}</Sub>}
      {t < C.end && <Mark />}
    </AbsoluteFill>
  );
};
