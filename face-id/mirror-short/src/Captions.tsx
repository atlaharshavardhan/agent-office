import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/800.css';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CAPTION_PLACEMENT, CAPTION_TOP_DEFAULT, FPS, LEN, Line } from './script';

// Word-by-word captions (style from the reference): words already spoken are bold white,
// words still to come are dim grey, and the word being spoken sits in a blue selection box
// with corner handles. Text comes straight from the narration lines in script.ts; each line
// is split into short two-line phrases and the words are timed by their share of the
// line's characters across the real length of the voice line.
const CAP_FONT = "'Plus Jakarta Sans', Inter, sans-serif";
const BLUE = '#4f86f7';

type Word = { w: string; from: number; to: number };
type Chunk = { lines: Word[][]; from: number; to: number };

export const chunk = (line: Line): Chunk[] => {
  const words = line.text.split(' ');
  const groups: string[][] = []; let cur: string[] = [];
  for (const w of words) {
    cur.push(w);
    const s = cur.join(' ');
    if ((/[.,?!]$/.test(w) && s.length > 9) || s.length >= 22) { groups.push(cur); cur = []; }
  }
  if (cur.length) groups.push(cur);
  const dur = LEN[line.id] ?? line.text.length / 15;
  const total = words.reduce((a, w) => a + w.length + 1, 0);
  let acc = 0;
  return groups.map((g, gi) => {
    const ws: Word[] = g.map((w) => {
      const from = line.at + (acc / total) * dur; acc += w.length + 1;
      return { w, from, to: line.at + (acc / total) * dur };
    });
    // balance into two lines
    let best = 1, diff = 1e9;
    for (let k = 1; k < ws.length; k++) {
      const a = ws.slice(0, k).map((x) => x.w).join(' ').length, b = ws.slice(k).map((x) => x.w).join(' ').length;
      if (Math.abs(a - b) < diff) { diff = Math.abs(a - b); best = k; }
    }
    const lines = ws.length > 2 ? [ws.slice(0, best), ws.slice(best)] : [ws];
    const last = gi === groups.length - 1;
    return { lines, from: ws[0].from, to: last ? line.at + dur + 0.3 : ws[ws.length - 1].to };
  });
};

const Handle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <span style={{ position: 'absolute', width: 18, height: 18, borderRadius: 9, background: BLUE, border: '3px solid #fff', ...style }} />
);

export const Captions: React.FC<{ lines: Line[] }> = ({ lines }) => {
  const t = useCurrentFrame() / FPS;
  const c = lines.flatMap(chunk).find((k) => t >= k.from && t < k.to);
  if (!c) return null;
  return (
    <AbsoluteFill>
      {/* top of the frame, inside the Shorts safe area (like the reference) */}
      <div style={{ position: 'absolute', left: 70, width: 870, top: CAPTION_PLACEMENT.find((r) => t >= r.from && t < r.to)?.top ?? CAPTION_TOP_DEFAULT, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ position: 'absolute', inset: '-30px -10px', background: 'radial-gradient(closest-side, rgba(8,6,5,.78), rgba(8,6,5,0))' }} />
        {c.lines.map((ln, i) => (
          <div key={i} style={{ position: 'relative', display: 'flex', gap: 20, font: `800 76px/1.12 ${CAP_FONT}` }}>
            {ln.map((w, j) => {
              const now = t >= w.from && t < w.to, done = t >= w.to;
              return (
                <span key={j} style={{
                  position: 'relative', padding: '0 12px', margin: '0 -12px',
                  color: now || done ? '#ffffff' : 'rgba(205,205,205,0.55)', fontWeight: now || done ? 800 : 600,
                  textShadow: '0 4px 16px rgba(0,0,0,.85)',
                  outline: now ? `3px solid ${BLUE}` : 'none', background: now ? 'rgba(25,40,90,.55)' : 'transparent',
                }}>
                  {w.w}
                  {now && <><Handle style={{ left: -11, top: -11 }} /><Handle style={{ right: -11, bottom: -11 }} /></>}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
