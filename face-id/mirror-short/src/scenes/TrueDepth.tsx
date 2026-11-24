import { useCurrentFrame } from 'remotion';
import { HandPhone, TEAR as HAND_TEAR } from './HandPhone';

// Scene 2 (2.5–6.2 s): stays on the phone in his hand (continues the hook's last shot, 30 frames in): fast zoom
// to its Dynamic Island, the TrueDepth parts are named, then pulled up out of the island and explained.
export const TEAR = HAND_TEAR - 30;
export const TrueDepth: React.FC = () => <HandPhone f={30 + useCurrentFrame()} />;
