import React from 'react';
import { Composition } from 'remotion';
import { Prototype } from './Prototype';
import { DuskTorch } from './dusk/Dusk';
import { DuskHouses } from './dusk/Houses';

export const Root: React.FC = () => (
  <>
    <Composition id="Prototype" component={Prototype} durationInFrames={240} fps={30} width={1080} height={1920} />
    <Composition id="DuskTorch" component={DuskTorch} durationInFrames={150} fps={30} width={1080} height={1920} />
    <Composition id="DuskHouses" component={DuskHouses} durationInFrames={150} fps={30} width={1080} height={1920} />
  </>
);
