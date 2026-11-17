import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Main, ScenePreview } from './Main';
import { SCENES, TL } from './theme';
import { MainV2, SceneV2, SC_V2 } from './v2/MainV2';
import { AliceS1 } from './alice/S1Hook';

const Root = () => (
  <>
    <Composition id="NvidiaCollapse" component={Main} durationInFrames={TL.frames} fps={30} width={1080} height={1920} />
    {SCENES.map((s, i) => (
      <Composition key={i} id={`Scene${i + 1}`} component={ScenePreview} defaultProps={{ index: i }}
        durationInFrames={Math.round((s.end - s.start) * 30)} fps={30} width={1080} height={1920} />
    ))}
    <Composition id="NvidiaCollapseV2" component={MainV2} durationInFrames={1350} fps={30} width={1080} height={1920} />
    {SC_V2.map((s, i) => (
      <Composition key={'v2'+i} id={`V2Scene${i + 1}`} component={SceneV2} defaultProps={{ index: i }}
        durationInFrames={Math.round((s.end - s.start) * 30)} fps={30} width={1080} height={1920} />
    ))}
    <Composition id="AliceS1" component={AliceS1} durationInFrames={105} fps={30} width={1080} height={1920} />
  </>
);
registerRoot(Root);
