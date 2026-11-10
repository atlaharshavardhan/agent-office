import { Composition } from 'remotion';
import { Reel, FPS, DURATION_S } from './Reel';
import { ReelV4 } from './ReelV4';

export const Root = () => (
  <>
  <Composition
    id="DuoReel"
    component={Reel}
    durationInFrames={Math.round(DURATION_S * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
  <Composition id="DuoReelV4" component={ReelV4} durationInFrames={Math.round(DURATION_S * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
