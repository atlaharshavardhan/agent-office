"""Part 2 v6 captions (Harsh's reference: bold white words, soft dark glow, the spoken word marked by a selection box with corner handles), in our theme colours.
Word times come from the sentence times in video/rf6/timeline.json (spread over the words by length). Writes video/rf6/caps.mov (transparent, 1080x1920, 30 fps).  Run after p2v6_cues.py."""
import json, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H, FPS = 1080, 1920, 30; T = json.load(open('video/rf6/timeline.json')); NA = T['NA']; TOTAL = T['TOTAL']
FNT = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf', 66)
Y0, MAXW, LH = 1395, 930, 88          # caption block top, width and line height
HOOK = [("The moment you hit send,", 0.10, 1.387), ("the photo pops up on your girlfriend's phone in London.", 1.60, 2.965), ("But how did it travel", 4.70, 1.387), ("across an entire ocean,", 6.20, 1.685), ("thousands of kilometres,", 8.00, 1.557), ("in the blink of an eye?", 9.70, 1.365)]
sents = [(t, a, b - 0.0) for t, a, b in HOOK]
sents = [(txt, a, a + d) for txt, a, d in HOOK] + [(x['text'], NA + x['a'], NA + x['b']) for x in T['SENT'] if x['id'] != 'n9.a']   # n9 has its own big text on the video
words = []   # (text, start, end, chunk id)
cid = 0
for txt, a, b in sents:
    ws = txt.split(); wt = np.array([len(w) + 2.0 for w in ws]); cum = np.concatenate([[0], np.cumsum(wt)]) / wt.sum() * (b - a)
    chunks = []; cur = []
    for i, w in enumerate(ws):
        cur.append(i)
        if len(cur) >= 6 or (w.endswith(',') and len(cur) >= 3) or sum(len(ws[k]) + 1 for k in cur) > 30: chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    for ch in chunks:
        for i in ch: words.append((ws[i], a + cum[i], a + cum[i + 1], cid))
        cid += 1
chunk_words = {}
for w in words: chunk_words.setdefault(w[3], []).append(w)
chunk_span = {c: (ws[0][1], ws[-1][2]) for c, ws in chunk_words.items()}
def layout(ws):
    lines = [[]]; sp = FNT.getlength(' ')
    for w in ws:
        cand = lines[-1] + [w]
        if sum(FNT.getlength(x[0]) for x in cand) + sp * (len(cand) - 1) > MAXW and lines[-1]: lines.append([w])
        else: lines[-1] = cand
    return lines
def render(c, active):
    ws = chunk_words[c]; lines = layout(ws); sp = FNT.getlength(' '); hh = len(lines) * LH + 40
    im = Image.new('RGBA', (W, hh + 80), (0, 0, 0, 0)); glow = Image.new('RGBA', im.size, (0, 0, 0, 0)); gd = ImageDraw.Draw(glow); d = ImageDraw.Draw(im); pos = {}
    for li, ln in enumerate(lines):
        tw = sum(FNT.getlength(x[0]) for x in ln) + sp * (len(ln) - 1); x = (W - tw) / 2; y = 40 + li * LH
        for w in ln:
            ww = FNT.getlength(w[0]); pos[id(w)] = (x, y, ww); gd.text((x, y), w[0], font=FNT, fill=(6, 8, 30, 230), stroke_width=14); x += ww + sp
    glow = glow.filter(ImageFilter.GaussianBlur(14)); im.alpha_composite(glow); d = ImageDraw.Draw(im)
    for w in ws:
        x, y, ww = pos[id(w)]
        if w is active:   # the selection box: our cyan outline, navy fill, round handles at two corners
            bx0, by0, bx1, by1 = x - 14, y + 4, x + ww + 14, y + LH - 8
            d.rounded_rectangle((bx0, by0, bx1, by1), 8, fill=(11, 18, 48, 150), outline=(95, 227, 255, 255), width=4)
            for hx, hy in ((bx0, by0), (bx1, by1)): d.ellipse((hx - 9, hy - 9, hx + 9, hy + 9), fill=(95, 227, 255, 255), outline=(255, 255, 255, 255), width=3)
        d.text((x, y), w[0], font=FNT, fill=(255, 255, 255, 255))
    full = Image.new('RGBA', (W, H), (0, 0, 0, 0)); full.alpha_composite(im, (0, Y0 - 40)); return full.tobytes()
blank = bytes(W * H * 4); cache = {}
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'qtrle', 'video/rf6/caps.mov'], stdin=subprocess.PIPE)
nfr = int(TOTAL * FPS) + 2
for i in range(nfr):
    t = i / FPS; key = None
    for c, (a, b) in chunk_span.items():
        if a - 0.02 <= t <= b + 0.12:
            act = next((w for w in chunk_words[c] if w[1] <= t < w[2]), chunk_words[c][-1] if t >= b else None); key = (c, id(act) if act else None); cur = (c, act); break
    if key is None: p.stdin.write(blank); continue
    if key not in cache: cache[key] = render(*cur)
    p.stdin.write(cache[key])
p.stdin.close(); p.wait(); print('caps ok', nfr, 'frames', len(cache), 'distinct')
