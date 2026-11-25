import { AbsoluteFill } from 'remotion';

// Editing guides for Instagram Reels + YouTube Shorts (one export). Shown only in previews (props.guides), never exported.
// Kept clear: top 220 (app header), right 180 (like / comment / share), bottom 440 (username, caption, audio, nav), left 60.
// Captions, labels, logos and the watermark stay inside X 60-900, Y 220-1480. Footage and 3D pictures may fill the frame.
export const SAFE = { x: 60, y: 220, w: 840, h: 1260 };
export const Guides: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <svg width={1080} height={1920}>
      <g fill="rgba(255,40,60,.28)">
        <rect x={0} y={0} width={1080} height={220} /><rect x={0} y={1480} width={1080} height={440} />
        <rect x={0} y={220} width={60} height={1260} /><rect x={900} y={220} width={180} height={1260} />
      </g>
      <rect x={60} y={220} width={840} height={1260} fill="none" stroke="#00ff88" strokeWidth={4} strokeDasharray="18 10" />
    </svg>
  </AbsoluteFill>
);
