import React from 'react';
import { Composition } from 'remotion';
import { Prototype } from './Prototype';
import { FiberJourney, FIBER_FRAMES } from './v4/Fiber';
import { PacketBurst, PACKETS_FRAMES } from './v4/Packets';
import { Routers, ROUTERS_FRAMES } from './v4/Routers';
import { Underground, UNDER_FRAMES } from './v4/Underground';
import { Seabed, SEABED_FRAMES, SeabedRepeater, REPEATER_FRAMES } from './v4/Seabed';
import { DuskTorch } from './dusk/Dusk';
import { DuskHouses } from './dusk/Houses';
import { NightHook } from './dusk/NightHook';
import { IsoStreet, IsoHook, IsoWire, IsoFull, IsoNet, Concept, IsoMove, IsoDetail, IsoMoveDetail, IsoHookCine, IsoFullCine, IsoHookView, IsoFullHi, IsoFullV3 } from './dusk/IsoStreet';
import { KidSheet } from './dusk/Kid';
import { AdultSheet, DressSheet } from './dusk/Adult';
import { MapConcept } from './dusk/MapConcept';
import { IsoCity } from './dusk/IsoCity';
import { IsoCity2 } from './dusk/IsoCity2';
import { Pov, PovHi } from './dusk/Pov';
import { FiberCut, RouterCut, Finale } from './dusk/Extras';
import { World, WorldWeb } from './tail/World';
import { SeaA, SeaCut } from './tail/Sea';
import { Packets, London, EndCard } from './tail/Ends';
import { TailFilm, TAIL_FRAMES } from './tail/Tail';

export const Root: React.FC = () => (
  <>
    <Composition id="FiberJourney" component={FiberJourney} durationInFrames={FIBER_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Seabed" component={Seabed} durationInFrames={SEABED_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="SeabedRepeater" component={SeabedRepeater} durationInFrames={REPEATER_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="PacketBurst" component={PacketBurst} durationInFrames={PACKETS_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Underground" component={Underground} durationInFrames={UNDER_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Routers" component={Routers} durationInFrames={ROUTERS_FRAMES} fps={30} width={1920} height={1080} />
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
    <Composition id="IsoFull" component={IsoFull} durationInFrames={1245} fps={30} width={1080} height={1920} />
    <Composition id="IsoNet" component={IsoNet} durationInFrames={285} fps={30} width={1080} height={1920} />
    <Composition id="C1a" component={Concept} defaultProps={{ k: '1a' }} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="C1b" component={Concept} defaultProps={{ k: '1b' }} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="C2a" component={Concept} defaultProps={{ k: '2a' }} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="C2b" component={Concept} defaultProps={{ k: '2b' }} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="C3a" component={MapConcept} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="C3b" component={MapConcept} defaultProps={{ star: true }} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="IsoMove" component={IsoMove} durationInFrames={555} fps={30} width={1080} height={1920} />
    <Composition id="IsoCity" component={IsoCity} durationInFrames={390} fps={30} width={1080} height={1920} />
    <Composition id="IsoHookCine" component={IsoHookCine} durationInFrames={468} fps={30} width={1080} height={1920} />
    <Composition id="IsoFullCine" component={IsoFullCine} durationInFrames={1245} fps={30} width={1080} height={1920} />
    <Composition id="IsoHookView" component={IsoHookView} durationInFrames={468} fps={30} width={1080} height={1920} />
    <Composition id="IsoFullV3" component={IsoFullV3} durationInFrames={1245} fps={30} width={1080} height={1920} />
    <Composition id="FiberCut" component={FiberCut} durationInFrames={78} fps={30} width={1080} height={1920} />
    <Composition id="RouterCut" component={RouterCut} durationInFrames={72} fps={30} width={1080} height={1920} />
    <Composition id="Finale" component={Finale} durationInFrames={90} fps={30} width={1080} height={1920} />
    <Composition id="World" component={World} durationInFrames={213} fps={30} width={1080} height={1920} />
    <Composition id="WorldAll" component={WorldWeb} defaultProps={{ mode: 'all' as const }} durationInFrames={96} fps={30} width={1080} height={1920} />
    <Composition id="WorldCut" component={WorldWeb} defaultProps={{ mode: 'cut' as const }} durationInFrames={96} fps={30} width={1080} height={1920} />
    <Composition id="SeaA" component={SeaA} durationInFrames={99} fps={30} width={1080} height={1920} />
    <Composition id="SeaCut" component={SeaCut} durationInFrames={54} fps={30} width={1080} height={1920} />
    <Composition id="Packets" component={Packets} durationInFrames={156} fps={30} width={1080} height={1920} />
    <Composition id="London" component={London} durationInFrames={120} fps={30} width={1080} height={1920} />
    <Composition id="EndCard" component={EndCard} durationInFrames={108} fps={30} width={1080} height={1920} />
    <Composition id="TailFilm" component={TailFilm} durationInFrames={TAIL_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="PovHi" component={PovHi} durationInFrames={132} fps={30} width={1080} height={1920} />
    <Composition id="IsoFullHi" component={IsoFullHi} durationInFrames={1245} fps={30} width={1080} height={1920} />
    <Composition id="Pov" component={Pov} durationInFrames={90} fps={30} width={1080} height={1920} />
    <Composition id="IsoCity2" component={IsoCity2} durationInFrames={390} fps={30} width={1080} height={1920} />
    <Composition id="IsoDetail" component={IsoDetail} durationInFrames={468} fps={30} width={1080} height={1920} />
    <Composition id="IsoMoveDetail" component={IsoMoveDetail} durationInFrames={504} fps={30} width={1080} height={1920} />
  </>
);
