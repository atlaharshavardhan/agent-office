import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion';
import { FPS, TestProps } from '../script';
import { C, FONT } from '../theme';
import { Result } from './Result';

// Scene 6 (36–43 s). Only REAL footage goes here — nothing in this scene is animated as a result.
export const Test: React.FC<{ p: TestProps }> = ({ p }) => {
  if (!p.testFootage && p.result !== 'none') return <Result result={p.result} />;   // the answer, as an illustration
  if (!p.testFootage) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#1a1414', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 820, padding: '60px 50px', border: '6px dashed #e0a040', borderRadius: 28, textAlign: 'center', color: '#ffd9a0', font: `800 58px/1.15 ${FONT}`, transform: 'translateX(-20px)' }}>
          PLACEHOLDER
          <div style={{ font: `600 40px/1.3 ${FONT}`, marginTop: 28, color: C.text }}>Real mirror-test footage goes here.<br />No result is shown or narrated until it is added.</div>
          <div style={{ font: `600 28px/1.4 ${FONT}`, marginTop: 30, color: '#c9b9a3' }}>Put the clip in public/ and set <b>testFootage</b>, <b>result</b> and the lock-icon framing in src/script.ts (or the Props panel).</div>
        </div>
      </AbsoluteFill>
    );
  }
  // Frame the real clip around the lock icon: focus point (0..1 of the source) + zoom.
  const s = p.zoom;
  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      <OffthreadVideo src={staticFile(p.testFootage)} trimBefore={Math.round(p.testStartSec * FPS)}
        style={{ width: 1080, height: 1920, objectFit: 'cover', transformOrigin: '0 0',
          transform: `translate(${540 - p.focusX * 1080 * s}px, ${960 - p.focusY * 1920 * s}px) scale(${s})` }} />
    </AbsoluteFill>
  );
};
