import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Captions } from './Captions';
import { Shot } from './Shot';
import { Watermark } from './Watermark';
import { DEFAULT_TEST, LEN, Line, NARRATION, RESULT_LINES, SCENES, SFX, STORY_END, TestProps, TOTAL, f } from './script';
import { CMP, Compare } from './scenes/Compare';
import { CUE, Scan } from './scenes/Scan';
import { EndCard } from './scenes/EndCard';
import { Hook } from './scenes/Hook';
import { MIR, Mirror } from './scenes/Mirror';
import { Test } from './scenes/Test';
import { TrueDepth } from './scenes/TrueDepth';

const D = (k: keyof typeof SCENES) => f(SCENES[k][1]) - f(SCENES[k][0]);
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
      <Sequence name="2 · TrueDepth reveal" {...S('truedepth')}><Shot dur={D('truedepth')} enter={false}><TrueDepth /></Shot></Sequence>
      <Sequence name="3 · Dots, infrared view and depth web" {...S('scan')}>
        <Shot dur={D('scan')} snaps={[[CUE.front, 1.3], [CUE.cyan, 1.3], [CUE.depth, 1.25]]}><Scan /></Shot>
      </Sequence>
      <Sequence name="4 · What the iPhone compares" {...S('compare')}><Shot dur={D('compare')} snaps={[[CMP.both, 1.3], [CMP.check, 1.3], [CMP.merge, 1.15]]}><Compare /></Shot></Sequence>
      <Sequence name="5 · Back to the mirror" {...S('mirror')}><Shot dur={D('mirror')} snaps={[[MIR.glass, 1.3], [MIR.face, 1.3], [MIR.wide, 1.25]]}><Mirror /></Shot></Sequence>
      <Sequence name="6 · Real mirror test (reveal slot)" {...S('test')}><Shot dur={D('test')}><Test p={p} /></Shot></Sequence>
      <Sequence name="7 · End card" {...S('end')}><Shot dur={D('end')} exit={false}><EndCard /></Shot></Sequence>

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
