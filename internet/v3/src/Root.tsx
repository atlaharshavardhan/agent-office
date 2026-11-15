import React from 'react';
import { Composition } from 'remotion';
import { Prototype } from './Prototype';
import { DuskTorch } from './dusk/Dusk';
import { DuskHouses } from './dusk/Houses';
import { NightHook } from './dusk/NightHook';
import { IsoStreet, IsoHook, IsoWire, IsoFull, IsoNet, Concept, IsoMove } from './dusk/IsoStreet';
import { KidSheet } from './dusk/Kid';
import { AdultSheet, DressSheet } from './dusk/Adult';
import { MapConcept } from './dusk/MapConcept';

export const Root: React.FC = () => (
  <>
    <Composition id="Prototype" component={Prototype} durationInFrames={240} fps={30} width={1080} height={1920} />
    <Composition id="DuskTorch" component={DuskTorch} durationInFrames={150} fps={30} width={1080} height={1920} />
    <Composition id="DuskHouses" component={DuskHouses} durationInFrames={150} fps={30} width={1080} height={1920} />
    <Composition id="NightHook" component={NightHook} durationInFrames={468} fps={30} width={1080} height={1920} />
    <Composition id="IsoStreet" component={IsoStreet} durationInFrames={150} fps={30} width={1080} height={1920} />
    <Composition id="KidSheet" component={KidSheet} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="AdultSheet" component={AdultSheet} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="DressSheet" component={DressSheet} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="IsoHook" component={IsoHook} durationInFrames={468} fps={30} width={1080} height={1920} />
    <Composition id="IsoWire" component={IsoWire} durationInFrames={222} fps={30} width={1080} height={1920} />
    <Composition id="IsoFull" component={IsoFull} durationInFrames={1194} fps={30} width={1080} height={1920} />
    <Composition id="IsoNet" component={IsoNet} durationInFrames={285} fps={30} width={1080} height={1920} />
    <Composition id="C1a" component={Concept} defaultProps={{ k: '1a' }} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="C1b" component={Concept} defaultProps={{ k: '1b' }} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="C2a" component={Concept} defaultProps={{ k: '2a' }} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="C2b" component={Concept} defaultProps={{ k: '2b' }} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="C3a" component={MapConcept} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="C3b" component={MapConcept} defaultProps={{ star: true }} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="IsoMove" component={IsoMove} durationInFrames={504} fps={30} width={1080} height={1920} />
  </>
);
