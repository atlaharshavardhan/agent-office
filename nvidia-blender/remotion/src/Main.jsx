// The full 45-second composition: picks the scene for the current frame (absolute time),
// adds captions, watermark, scene transitions and the mixed soundtrack.
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, Sequence } from 'remotion';
import { C, SCENES, TL } from './theme';
import { Captions, Watermark, FontFace } from './ui';
import { S1, S3, S5, S7, S8 } from './scenes';
import { Columns } from './three/Columns';
import { GoldRush } from './three/GoldRush';
import { Chart3D } from './three/Chart3D';

const sceneFor = (i, s) => {
  switch (i) {
    case 0: return <S1 {...s} />;
    case 1: return <Columns {...s} cashAt={TL.beats.cash} />;
    case 2: return <S3 {...s} />;
    case 3: return <GoldRush {...s} />;
    case 4: return <S5 {...s} />;
    case 5: return <Chart3D {...s} down35={TL.beats.down35} />;
    case 6: return <S7 {...s} />;
    default: return <S8 {...s} />;
  }
};

export const Frame = ({ withAudio = true }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  let i = SCENES.findIndex((s) => t >= s.start && t < s.end);
  if (i < 0) i = SCENES.length - 1;
  const s = SCENES[i];
  // short dip between scenes (hard cuts on the beat, softened by 3 frames)
  const toCut = s.end - t, fromCut = t - s.start;
  const dip = Math.max(i > 0 ? Math.max(0, 1 - fromCut / 0.1) : 0, i < SCENES.length - 1 ? Math.max(0, 1 - toCut / 0.067) : 0);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <FontFace />
      {sceneFor(i, s)}
      <Captions />
      <Watermark />
      {dip > 0 && <AbsoluteFill style={{ background: '#000', opacity: dip * 0.6 }} />}
      {withAudio && <Audio src={staticFile('audio/mix_v1.wav')} />}
    </AbsoluteFill>
  );
};

export const Main = () => <Frame />;

// Per-scene previews: shift the timeline so each scene starts at frame 0.
export const ScenePreview = ({ index }) => {
  const from = Math.round(SCENES[index].start * 30);
  return <Sequence from={-from}><Frame withAudio={false} /></Sequence>;
};
