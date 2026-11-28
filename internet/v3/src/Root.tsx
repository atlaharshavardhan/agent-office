import React from 'react';
import { Composition } from 'remotion';
import { Prototype } from './Prototype';
import { Vert, Horiz } from './v4/frame';
import { FiberJourney, FIBER_FRAMES } from './v4/Fiber';
import { PacketBurst, PACKETS_FRAMES } from './v4/Packets';
import { London as LondonV4, LONDON_FRAMES } from './v4/London';
import { Flight, FLIGHT_FRAMES } from './v4/Flight';
import { Planet, PLANET_FRAMES } from './v4/Planet';
import { SeaCable, SEACABLE_FRAMES } from './v4/SeaCable';
import { Shore, SHORE_FRAMES } from './v4/Shore';
import { Arrive, ARRIVE_FRAMES } from './v4/Arrive';
import { Snap, SNAP_FRAMES } from './v4/Snap';
import { SeabedMs, RepeaterMs, PlanetMs } from './v4/Final';
import { HydRoom, HYD_ROOM_FRAMES } from './v4/HydRoom';
import { HydSend, HYD_SEND_FRAMES, LondonRoom, LONDON_ROOM_FRAMES, Notif, NOTIF_FRAMES, FlyGlobe, FLY_GLOBE_FRAMES } from './v4/Story';
import { HookGlobe, HOOK_GLOBE_FRAMES } from './v4/Hook';
import { Routers, ROUTERS_FRAMES } from './v4/Routers';
import { Underground, UNDER_FRAMES } from './v4/Underground';
import { Seabed, SEABED_FRAMES, SeabedRepeater, REPEATER_FRAMES } from './v4/Seabed';
import { Part1Fly, PART1_FLY_FRAMES, ShortFly, FLY_FRAMES, ShortEndA, END_A_FRAMES, ShortEndB, END_B_FRAMES, ShortOverlay, OVERLAY_FRAMES } from './v4/Short';
import { DuskTorch } from './dusk/Dusk';
import { DuskHouses } from './dusk/Houses';
import { NightHook } from './dusk/NightHook';
import { IsoStreet, IsoHook, IsoWire, IsoFull, IsoNet, Concept, IsoMove, IsoDetail, IsoMoveDetail, IsoHookCine, IsoFullCine, IsoHookView, IsoFullHi, IsoFullV3 } from './dusk/IsoStreet';
import { KidSheet } from './dusk/Kid';
import { AdultSheet, DressSheet } from './dusk/Adult';
import { MapConcept } from './dusk/MapConcept';
import { IsoCity } from './dusk/IsoCity';
import { IsoCity2 } from './dusk/IsoCity2';
import { MarkStrip } from './dusk/MarkStrip';
import { WideWrap } from './lib/WideWrap';
import { Pov, PovHi } from './dusk/Pov';
import { FiberCut, RouterCut, Finale } from './dusk/Extras';
import { World, WorldWeb } from './tail/World';
import { SeaA, SeaCut } from './tail/Sea';
import { Packets, London, EndCard } from './tail/Ends';
import { TailFilm, TAIL_FRAMES } from './tail/Tail';

export const Root: React.FC = () => (
  <>
    <Composition id="FiberJourney" component={() => <Horiz><FiberJourney /></Horiz>} durationInFrames={FIBER_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Seabed" component={() => <Horiz><Seabed /></Horiz>} durationInFrames={SEABED_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="SeabedRepeater" component={() => <Horiz><SeabedRepeater /></Horiz>} durationInFrames={REPEATER_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="PacketBurst" component={() => <Horiz><PacketBurst /></Horiz>} durationInFrames={PACKETS_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Underground" component={() => <Horiz><Underground /></Horiz>} durationInFrames={UNDER_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Routers" component={() => <Horiz><Routers /></Horiz>} durationInFrames={ROUTERS_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Shore" component={() => <Horiz><Shore /></Horiz>} durationInFrames={SHORE_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="SeaCable" component={() => <Horiz><SeaCable /></Horiz>} durationInFrames={SEACABLE_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Planet" component={() => <Horiz><Planet /></Horiz>} durationInFrames={PLANET_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Flight" component={() => <Horiz><Flight /></Horiz>} durationInFrames={FLIGHT_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="LondonV4" component={() => <Horiz><LondonV4 /></Horiz>} durationInFrames={LONDON_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="SeabedV" component={() => <Vert><Seabed /></Vert>} durationInFrames={SEABED_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="SeabedRepeaterV" component={() => <Vert><SeabedRepeater /></Vert>} durationInFrames={REPEATER_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="PacketBurstV" component={() => <Vert><PacketBurst /></Vert>} durationInFrames={PACKETS_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="UndergroundV" component={() => <Vert><Underground /></Vert>} durationInFrames={UNDER_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="RoutersV" component={() => <Vert><Routers /></Vert>} durationInFrames={ROUTERS_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="ShoreV" component={() => <Vert><Shore /></Vert>} durationInFrames={SHORE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="SeaCableV" component={() => <Vert><SeaCable /></Vert>} durationInFrames={SEACABLE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="HookGlobeV" component={() => <Vert><HookGlobe /></Vert>} durationInFrames={HOOK_GLOBE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="HydSendV" component={HydSend} durationInFrames={HYD_SEND_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="LondonRoomV" component={LondonRoom} durationInFrames={LONDON_ROOM_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="NotifV" component={Notif} durationInFrames={NOTIF_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="FlyGlobeV" component={() => <Vert><FlyGlobe /></Vert>} durationInFrames={FLY_GLOBE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="HydRoomV" component={HydRoom} durationInFrames={HYD_ROOM_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="SeabedMsV" component={SeabedMs} durationInFrames={294} fps={30} width={1080} height={1920} />
    <Composition id="RepeaterMsV" component={RepeaterMs} durationInFrames={225} fps={30} width={1080} height={1920} />
    <Composition id="PlanetMsV" component={PlanetMs} durationInFrames={360} fps={30} width={1080} height={1920} />
    <Composition id="SnapV" component={Snap} durationInFrames={SNAP_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="ArriveV" component={Arrive} durationInFrames={ARRIVE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="PlanetV" component={() => <Vert><Planet /></Vert>} durationInFrames={PLANET_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="FlightV" component={() => <Vert><Flight /></Vert>} durationInFrames={FLIGHT_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="LondonV4V" component={() => <Vert><LondonV4 /></Vert>} durationInFrames={LONDON_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="FiberJourneyV" component={() => <Vert><FiberJourney /></Vert>} durationInFrames={FIBER_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="ShortFly" component={ShortFly} durationInFrames={FLY_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="ShortEndA" component={ShortEndA} durationInFrames={END_A_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="ShortEndB" component={ShortEndB} durationInFrames={END_B_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="ShortOverlay" component={ShortOverlay} durationInFrames={OVERLAY_FRAMES} fps={30} width={1080} height={1920} />
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
    <Composition id="EndCardP2" component={() => <EndCard p3 />} durationInFrames={108} fps={30} width={1080} height={1920} />
    <Composition id="EndCard" component={EndCard} durationInFrames={108} fps={30} width={1080} height={1920} />
    <Composition id="TailFilm" component={TailFilm} durationInFrames={TAIL_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="PovHi" component={PovHi} durationInFrames={132} fps={30} width={1080} height={1920} />
    <Composition id="IsoFullHi" component={IsoFullHi} durationInFrames={1245} fps={30} width={1080} height={1920} />
    <Composition id="Pov" component={Pov} durationInFrames={90} fps={30} width={1080} height={1920} />
    <Composition id="IsoCity2" component={IsoCity2} durationInFrames={390} fps={30} width={1080} height={1920} />
    <Composition id="Part1Fly" component={Part1Fly} durationInFrames={PART1_FLY_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="MarkStrip" component={MarkStrip} durationInFrames={1} fps={30} width={420} height={64} />
    <Composition id="WStreet" component={() => <WideWrap><IsoFullHi /></WideWrap>} durationInFrames={1245} fps={30} width={1920} height={1080} />
    <Composition id="WCity" component={() => <WideWrap><IsoCity2 all /></WideWrap>} durationInFrames={1230} fps={30} width={1920} height={1080} />
    <Composition id="WFly" component={() => <WideWrap><Part1Fly /></WideWrap>} durationInFrames={PART1_FLY_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="CityAll" component={() => <IsoCity2 all />} durationInFrames={1230} fps={30} width={1080} height={1920} />
    <Composition id="IsoCityPhoto" component={() => <IsoCity2 ext />} durationInFrames={840} fps={30} width={1080} height={1920} />
    <Composition id="IsoDetail" component={IsoDetail} durationInFrames={468} fps={30} width={1080} height={1920} />
    <Composition id="IsoMoveDetail" component={IsoMoveDetail} durationInFrames={504} fps={30} width={1080} height={1920} />
  </>
);
