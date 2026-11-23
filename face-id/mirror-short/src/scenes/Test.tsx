import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion';
import { FPS, TestProps } from '../script';
import { Guess } from './Guess';

// Scene 6 (36–43 s). Only REAL footage goes here — nothing in this scene is animated as a result.
export const Test: React.FC<{ p: TestProps }> = ({ p }) => {
  if (!p.testFootage) {
    return <Guess />;
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
