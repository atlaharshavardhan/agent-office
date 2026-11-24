import { useCurrentFrame } from 'remotion';
import { HOOK, SCENES, f } from '../script';
import { HandPhone, TEAR as HAND_TEAR } from './HandPhone';

// Scene 2: stays on the phone in his hand (continues the hook's last shot): the push ends on its Dynamic Island as the
// TrueDepth parts appear; they are named, then explained one at a time.
const LEAD = HOOK.handF + f(SCENES.hook[1]) - HOOK.cut;
export const TEAR = HAND_TEAR - LEAD;
export const TrueDepth: React.FC = () => <HandPhone f={LEAD + useCurrentFrame()} />;
