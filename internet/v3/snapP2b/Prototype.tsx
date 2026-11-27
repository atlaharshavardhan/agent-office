import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import '@fontsource/manrope/600.css'; import '@fontsource/manrope/800.css'; import '@fontsource/ibm-plex-mono/500.css'; import '@fontsource/ibm-plex-mono/600.css';
import { CityShot } from './city/CityScene';
import { TorchMacro } from './city/TorchMacro';
import { TechWorld } from './tech/TechWorld';
import { FONT, TECH } from './lib/palette';
import { keys, prog, sec, FPS, easeInOut } from './lib/anim';

/* 8-second V3 prototype: sunset city (0-4) -> torch macro (4-6) -> into the dark technical world (6-8) */
const Caption: React.FC<{ text: React.ReactNode; a: number }> = ({ text, a }) => (
  <div style={{ position: 'absolute', left: 70, right: 160, top: 1290, textAlign: 'center', font: `800 54px/1.18 ${FONT.ui}`, color: TECH.text, letterSpacing: '-0.01em',
    textShadow: '0 4px 28px rgba(8,15,28,.75)', opacity: a, transform: `translateY(${(1 - a) * 14}px)` }}>{text}</div>
);
const C = ({ children }: { children: React.ReactNode }) => <span style={{ color: TECH.cyan }}>{children}</span>;

export const Prototype: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  // city camera: medium-wide, lateral track toward the boy, then the over-the-shoulder angle on the girl
  const wide = { x: keys(f, [[0, 1140], [2.6, 990]]), y: keys(f, [[0, 1760], [2.6, 1800]]), zoom: keys(f, [[0, 0.62], [2.6, 0.8]]) };
  const otsCam = { x: keys(f, [[2.6, 1380], [4.0, 1520]]), y: keys(f, [[2.6, 1700], [4.0, 1690]]), zoom: keys(f, [[2.6, 1.1], [4.0, 1.45]]) };
  const otsA = prog(f, 2.55, 2.85);
  return (
    <AbsoluteFill style={{ backgroundColor: TECH.bg }}>
      <Sequence from={0} durationInFrames={sec(4.0)}>
        <CityShot cam={t < 2.7 ? wide : otsCam} ots={t < 2.7 ? 0 : otsA} />
      </Sequence>
      <Sequence from={sec(4.0)} durationInFrames={sec(3.05)}>
        <AbsoluteFill style={{ opacity: prog(f, 3.95, 4.15) }}><TorchMacro t0={0} /></AbsoluteFill>
      </Sequence>
      <Sequence from={sec(6.9)} durationInFrames={sec(1.1)}>
        <AbsoluteFill style={{ opacity: prog(f, 6.9, 7.15) }}><TechWorld t0={0} /></AbsoluteFill>
      </Sequence>
      <Caption a={prog(f, 0.5, 0.8) * (1 - prog(f, 3.7, 3.9))} text={<>Flash a <C>torch</C> at your friend<br />across the street…</>} />
      <Caption a={prog(f, 7.2, 7.5)} text={<>…and you've basically built<br />the <C>internet.</C></>} />
      {/* white-cyan flash at the match cut */}
      <AbsoluteFill style={{ backgroundColor: TECH.cyan, opacity: Math.max(0, 1 - Math.abs(t - 6.92) / 0.12) * 0.6 }} />
    </AbsoluteFill>
  );
};
