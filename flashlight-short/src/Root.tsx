import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import { Still } from 'remotion';
import { S1Room, S2Shout, S3Bulbs, S4Cutaway, S5LooksUp } from './scenes';

export const Root: React.FC = () => (
  <>
    <Still id="01-room-before-blackout" component={S1Room} width={1080} height={1920} />
    <Still id="02-shout-at-the-window" component={S2Shout} width={1080} height={1920} />
    <Still id="03-two-bulb-test" component={S3Bulbs} width={1080} height={1920} />
    <Still id="04-curved-foil-cutaway" component={S4Cutaway} width={1080} height={1920} />
    <Still id="05-friend-looks-up" component={S5LooksUp} width={1080} height={1920} />
  </>
);
