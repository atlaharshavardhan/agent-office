import { useCurrentFrame } from 'remotion';
import { HandPhone } from './HandPhone';
import { Teardown } from './Teardown';

// Scene 2 (2.5–6.2 s): stays on the phone in his hand (continues the hook's last shot, 30 frames in): fast zoom
// to its Dynamic Island, the TrueDepth parts are labelled, then (TEAR frames in) the front camera is torn down.
export const TEAR = 64;
export const TrueDepth: React.FC = () => { const fr = useCurrentFrame(); return fr < TEAR ? <HandPhone f={30 + fr} /> : <Teardown t={fr - TEAR} />; };
