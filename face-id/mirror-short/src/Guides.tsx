import { AbsoluteFill } from 'remotion';

// Editing guides for Instagram Reels + YouTube Shorts (one export). Shown only in previews (props.guides), never exported.
// Reserved: top 280 (app header), right 230 (action buttons), bottom 680 (username, caption, audio, nav), left 80 (padding).
// Headlines, subtitles, logos and key graphics stay inside the safe box X 80-850, Y 280-1240.
export const SAFE = { x: 80, y: 280, w: 770, h: 960 };
export const Guides: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <svg width={1080} height={1920}>
      <g fill="rgba(255,40,60,.28)">
        <rect x={0} y={0} width={1080} height={280} /><rect x={0} y={1240} width={1080} height={680} />
        <rect x={0} y={280} width={80} height={960} /><rect x={850} y={280} width={230} height={960} />
      </g>
      <rect x={80} y={280} width={770} height={960} fill="none" stroke="#00ff88" strokeWidth={4} strokeDasharray="18 10" />
    </svg>
  </AbsoluteFill>
);
