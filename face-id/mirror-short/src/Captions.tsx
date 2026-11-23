import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FPS, LEN, Line } from './script';
import { C, FONT } from './theme';

// Captions come straight from the narration text. Each line is split into short phrases,
// timed by their share of the line's characters across the voice line's real length.
const KEY = /^(mirror|Face|ID|TrueDepth|infrared|dots|depth|map|three|dimensions|reflection|enrolled|unlocked|locked)/i;

type Chunk = { text: string; from: number; to: number };
export const chunk = (line: Line): Chunk[] => {
  const words = line.text.split(' ');
  const out: string[] = []; let cur: string[] = [];
  for (const w of words) {
    cur.push(w);
    const s = cur.join(' ');
    if (/[.,?!]$/.test(w) && s.length > 10 || s.length >= 24) { out.push(s); cur = []; }
  }
  if (cur.length) out.push(cur.join(' '));
  const dur = LEN[line.id] ?? line.text.length / 15;
  const total = out.reduce((a, s) => a + s.length, 0);
  let acc = 0;
  return out.map((s, i) => {
    const from = line.at + (acc / total) * dur; acc += s.length;
    const to = i === out.length - 1 ? line.at + dur + 0.25 : line.at + (acc / total) * dur;
    return { text: s, from, to };
  });
};

export const Captions: React.FC<{ lines: Line[] }> = ({ lines }) => {
  const t = useCurrentFrame() / FPS;
  const c = lines.flatMap(chunk).find((k) => t >= k.from && t < k.to);
  if (!c) return null;
  return (
    <AbsoluteFill>
      {/* centre-safe box: clear of the right-side buttons and the bottom title area */}
      <div style={{ position: 'absolute', left: 80, width: 860, top: 1290, display: 'flex', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', font: `800 66px/1.18 ${FONT}`, color: C.text, textShadow: '0 3px 10px rgba(0,0,0,.8)', background: 'rgba(14,10,8,.62)', padding: '14px 26px', borderRadius: 18 }}>
          {c.text.split(' ').map((w, i) => <span key={i} style={{ color: KEY.test(w) ? '#ff8296' : undefined }}>{w} </span>)}
        </div>
      </div>
    </AbsoluteFill>
  );
};
