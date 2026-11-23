// Front of an iPhone 17 Pro Max (163.4 x 78.0 mm), drawn in SVG: thin even bezels, rounded
// display corners and the Dynamic Island pill (about 29% of the display width).
export const PHONE = { w: 620, h: Math.round(620 * 163.4 / 78), cx: 540, cy: 960 };
export const DI = { w: 168, h: 50, top: 30 }; // relative to the display

export const PhoneFront: React.FC<{ glow: number; emit?: number; t?: number }> = ({ glow, emit = 0, t = 0 }) => {
  const { w, h, cx, cy } = PHONE;
  const x = cx - w / 2, y = cy - h / 2, b = 13, r = 92;
  const dx = x + b, dy = y + b, dw = w - 2 * b, dh = h - 2 * b;
  const diX = cx - DI.w / 2, diY = dy + DI.top;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="ti" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b9b4ae" /><stop offset="0.45" stopColor="#6f6a65" /><stop offset="1" stopColor="#3b3835" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0" stopColor="#f6dcbd" /><stop offset="0.3" stopColor="#dcb7c7" />
          <stop offset="0.62" stopColor="#9b88d0" /><stop offset="1" stopColor="#5d4f94" />
        </radialGradient>
        <radialGradient id="emit" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#c9b8ff" stopOpacity="0.9" /><stop offset="1" stopColor="#c9b8ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* side buttons */}
      <rect x={x - 5} y={y + 300} width={8} height={120} rx={4} fill="#55514d" />
      <rect x={x - 5} y={y + 450} width={8} height={120} rx={4} fill="#55514d" />
      <rect x={x + w - 3} y={y + 360} width={8} height={190} rx={4} fill="#55514d" />
      <rect x={x + w - 3} y={y + 820} width={8} height={130} rx={4} fill="#4a4643" />
      {/* frame + black border */}
      <rect x={x} y={y} width={w} height={h} rx={r + 8} fill="url(#ti)" />
      <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} rx={r + 4} fill="#0b0a0a" />
      {/* display */}
      <rect x={dx} y={dy} width={dw} height={dh} rx={r - 6} fill="#15111c" />
      <rect x={dx} y={dy} width={dw} height={dh} rx={r - 6} fill="url(#glow)" opacity={glow} />
      {/* Dynamic Island with the TrueDepth parts behind it (front camera lens on the right) */}
      <rect x={diX} y={diY} width={DI.w} height={DI.h} rx={DI.h / 2} fill="#050505" />
      <circle cx={diX + DI.w - 27} cy={diY + DI.h / 2} r={11} fill="#10131c" />
      <circle cx={diX + DI.w - 27} cy={diY + DI.h / 2} r={5} fill="#1f2840" />
      <circle cx={diX + DI.w - 30} cy={diY + DI.h / 2 - 3} r={1.8} fill="#6b7fb0" />
      {emit > 0 && <circle cx={cx} cy={diY + DI.h / 2} r={60 + 40 * Math.sin(t * 0.4) ** 2} fill="url(#emit)" opacity={emit * 0.55} />}
    </svg>
  );
};
