import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Captions } from './Captions';
import { Watermark } from './Watermark';
import { DEFAULT_TEST, LEN, Line, NARRATION, RESULT_LINES, SCENES, SFX, STORY_END, TestProps, TOTAL, f } from './script';
import { Compare } from './scenes/Compare';
import { DepthMap } from './scenes/DepthMap';
import { EndCard } from './scenes/EndCard';
import { Hook } from './scenes/Hook';
import { Mirror } from './scenes/Mirror';
import { Test } from './scenes/Test';
import { TrueDepth } from './scenes/TrueDepth';

const S = (k: keyof typeof SCENES) => ({ from: f(SCENES[k][0]), durationInFrames: f(SCENES[k][1]) - f(SCENES[k][0]) });

export const MirrorFaceID: React.FC<TestProps> = (props) => {
  const p = { ...DEFAULT_TEST, ...props };
  // the result line exists only when real footage is in and you have picked the matching line
  const result: Line[] = p.testFootage && p.result !== 'none'
    ? [{ ...RESULT_LINES[p.result], at: SCENES.test[0] + p.resultDelaySec }] : [];
  const lines = [...NARRATION, ...result];
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* ---- VIDEO ---- */}
      <Sequence name="1 · Mirror hook" {...S('hook')}><Hook /></Sequence>
      <Sequence name="2 · TrueDepth reveal" {...S('truedepth')}><TrueDepth /></Sequence>
      <Sequence name="3 · Depth map" {...S('depthmap')}><DepthMap /></Sequence>
      <Sequence name="4 · What the iPhone compares" {...S('compare')}><Compare /></Sequence>
      <Sequence name="5 · Back to the mirror" {...S('mirror')}><Mirror /></Sequence>
      <Sequence name="6 · Real test" {...S('test')}><Test p={p} /></Sequence>
      <Sequence name="7 · End card" {...S('end')}><EndCard /></Sequence>

      {/* ---- WATERMARK (hidden on the end card) ---- */}
      <Sequence name="Watermark" from={0} durationInFrames={f(STORY_END)}><Watermark /></Sequence>

      {/* ---- CAPTIONS (story only, never over the end card) ---- */}
      <Sequence name="Captions" from={0} durationInFrames={f(STORY_END)}><Captions lines={lines} /></Sequence>

      {/* ---- NARRATION ---- */}
      {lines.map((l) => (
        <Sequence key={l.id} name={`Narration · ${l.id}`} from={f(l.at)} durationInFrames={Math.ceil((LEN[l.id] + 0.1) * 30)} layout="none">
          <Audio src={staticFile(`vo/${l.id}.wav`)} />
        </Sequence>
      ))}

      {/* ---- SFX ---- */}
      {SFX.map((s) => (
        <Sequence key={s.name} name={s.name} from={f(s.at)} durationInFrames={45} layout="none">
          <Audio src={staticFile(`sfx/${s.file}`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
export { TOTAL };
