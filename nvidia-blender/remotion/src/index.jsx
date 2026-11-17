import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Main, ScenePreview } from './Main';
import { SCENES, TL } from './theme';

const Root = () => (
  <>
    <Composition id="NvidiaCollapse" component={Main} durationInFrames={TL.frames} fps={30} width={1080} height={1920} />
    {SCENES.map((s, i) => (
      <Composition key={i} id={`Scene${i + 1}`} component={ScenePreview} defaultProps={{ index: i }}
        durationInFrames={Math.round((s.end - s.start) * 30)} fps={30} width={1080} height={1920} />
    ))}
  </>
);
registerRoot(Root);
