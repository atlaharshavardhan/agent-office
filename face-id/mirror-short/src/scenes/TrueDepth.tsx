import { useCurrentFrame } from 'remotion';
import { HOOK_CUTS } from '../script';
import { HandPhone, TEAR as HAND_TEAR } from './HandPhone';

// Scene 2: stays on the phone in his hand (continues the hook's last shot): fast zoom to its Dynamic Island,
// the TrueDepth parts are named, then pulled up out of the island and explained.
const LEAD = HOOK_CUTS[2].dur;
export const TEAR = HAND_TEAR - LEAD;
export const TrueDepth: React.FC = () => <HandPhone f={LEAD + useCurrentFrame()} />;
