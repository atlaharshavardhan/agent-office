import React from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import T from './p2v6-timeline';

/* Part 2, version 6: the whole video as ONE Remotion composition for preview in Remotion Studio.
   - the locked hook (unchanged), then the scenes (the already-rendered scene clips, played faster or slower to follow the narration)
   - one continuous narration + the soft pad (public/p2v6/audio.wav, made by audio/p2v6_mix.py), no sound effects
   - timing lives in p2v6-timeline.ts (made by audio/p2v6_timeline.py): change a time there and the preview follows. */
const FPS = 30, fr = (s: number) => Math.round(s * FPS);
export const PART2V6_FRAMES = fr(T.TOTAL);

const Clip: React.FC<{ s: (typeof T.SEG)[number] }> = ({ s }) => {
  const f = useCurrentFrame(), a = s.fade ? interpolate(f, [0, fr(T.FADE)], [0, 1], { extrapolateRight: 'clamp' }) : 1;
  return <AbsoluteFill style={{ opacity: a }}><OffthreadVideo src={staticFile(s.file)} startFrom={fr(s.a - s.off)} endAt={fr(s.b - s.off) + 8} playbackRate={s.speed} muted style={{ width: 1080, height: 1920 }} /></AbsoluteFill>;
};

export const Part2V6: React.FC = () => (
  <AbsoluteFill style={{ background: '#04061a' }}>
    <Sequence from={0} durationInFrames={fr(T.HOOK)}><OffthreadVideo src={staticFile('p2v6/hook.mp4')} style={{ width: 1080, height: 1920 }} /></Sequence>
    {T.SEG.map((s) => <Sequence key={s.id} from={fr(T.NA + s.at)} durationInFrames={fr(s.end - s.at) + (s.id === 'ar' ? 0 : fr(T.FADE))}><Clip s={s} /></Sequence>)}
    <Sequence from={fr(T.NA)}><Img src={staticFile('p2v6/mark.png')} style={{ position: 'absolute', left: 24, top: 926, opacity: 0.3 }} /></Sequence>
    <Audio src={staticFile('p2v6/audio.wav')} />
  </AbsoluteFill>
);
