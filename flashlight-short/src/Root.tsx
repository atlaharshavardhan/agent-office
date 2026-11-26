import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import { Composition, Still } from 'remotion';
import { DURATION, FPS, FlashlightShort } from './video';
import { S1Room, S2Shout, S3Bulbs, S4Cutaway, S5LooksUp } from './scenes';
import { BOARD } from './storyboard';
import { WalkTest } from './dev/WalkTest';
import { SHEET, StudentSheet } from './review/Sheet';
import { FoilBuild } from './review/Desk';
import { Exterior } from './review/Street';
import { FACE_REVIEW, FaceReview } from './review/FaceReview';
import { IDEA_FPS, IDEA_FRAMES, IdeaToFoil } from './idea/IdeaToFoil';

export const Root: React.FC = () => (
  <>
    <Composition id="FlashlightShort" component={FlashlightShort} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
    {/* 10 s preview: Higgsfield reach -> match cut -> foil build */}
    <Composition id="IdeaToFoil" component={IdeaToFoil} durationInFrames={IDEA_FRAMES} fps={IDEA_FPS} width={1080} height={1920} />
    {/* face review */}
    <Still id="review-4-face" component={FaceReview} width={FACE_REVIEW.w} height={FACE_REVIEW.h} />
    {/* review pass: three stills for approval */}
    <Still id="review-1-student-sheet" component={StudentSheet} width={SHEET.w} height={SHEET.h} />
    <Still id="review-2-foil-build" component={FoilBuild} width={1080} height={1920} />
    <Still id="review-3-exterior" component={Exterior} width={1080} height={1920} />
    <Still id="dev-walk" component={WalkTest} width={1080} height={1920} />
    {/* storyboard pass 2: one still per scene beat */}
    {BOARD.map(([id, C]) => <Still key={id} id={`sb-${id}`} component={C} width={1080} height={1920} />)}
    {/* pass 1 art-direction samples (kept for reference) */}
    <Still id="01-room-before-blackout" component={S1Room} width={1080} height={1920} />
    <Still id="02-shout-at-the-window" component={S2Shout} width={1080} height={1920} />
    <Still id="03-two-bulb-test" component={S3Bulbs} width={1080} height={1920} />
    <Still id="04-curved-foil-cutaway" component={S4Cutaway} width={1080} height={1920} />
    <Still id="05-friend-looks-up" component={S5LooksUp} width={1080} height={1920} />
  </>
);
