import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Main, ScenePreview } from './Main';
import { SCENES, TL } from './theme';
import { MainV2, SceneV2, SC_V2 } from './v2/MainV2';
import { AliceS1 } from './alice/S1Hook';
import { AliceS4 } from './alice/S4Map';
import { AliceS8, AliceS9 } from './alice/S8S9';
import { AliceMain, ALICE_FRAMES } from './alice/Scenes2';
import { V4Open, V4Remote } from './alicev4/Frames';
import { StoryChain, MegaspeedLogo } from './alice/Logos';
import { FontFace } from './ui';
const MsPreview = () => <div style={{ position: 'absolute', inset: 0, background: '#0b0c0e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 80 }}><FontFace /><MegaspeedLogo h={110} /><div style={{ background: '#E9E4D8', padding: 30 }}><MegaspeedLogo h={70} light={false} /></div></div>;
const ChainPreview = () => <div style={{ position: 'absolute', inset: 0, background: '#0b0c0e' }}><FontFace /><StoryChain /></div>;

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
    <Composition id="AliceMs" component={MsPreview} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="AliceChain" component={ChainPreview} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="V4Open" component={V4Open} durationInFrames={60} fps={30} width={1080} height={1920} />
    <Composition id="V4Remote" component={V4Remote} durationInFrames={60} fps={30} width={1080} height={1920} />
    <Composition id="AliceMain" component={AliceMain} durationInFrames={ALICE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="AliceS8" component={AliceS8} durationInFrames={105} fps={30} width={1080} height={1920} />
    <Composition id="AliceS9" component={AliceS9} durationInFrames={150} fps={30} width={1080} height={1920} />
    <Composition id="AliceS4" component={AliceS4} durationInFrames={150} fps={30} width={1080} height={1920} />
    <Composition id="AliceS1" component={AliceS1} durationInFrames={105} fps={30} width={1080} height={1920} />
  </>
);
registerRoot(Root);
