"""Part 2 final cut, result-first order (28 Nov 2026). Builds, from the rendered picture pieces in video/part2v1/:
  video/part2v1/mix.wav      narration (Liam, played at 1.06) + a soft pad + a few small effects (send tap, notification ding, phone buzz, arrival chime). NO whoosh, NO repeating notes.
  video/part2v1/captions.ass word-by-word captions (spoken words white, the word being said turns amber), inside the Shorts safe area (y 1260 to 1450).
  video/part2v1/captions.srt plain subtitles for YouTube.
Then it joins the picture, burns the captions, adds the watermark and the sound: video/internet-part2-v1.mp4.  Run from internet/."""
import json, subprocess, os, re, numpy as np, soundfile as sf
SR = 48000; G = 1.06; V = 'video/part2v1'; FPS = 30
dur_f = lambda n: len(__import__('soundfile').read(n)[0]) / __import__('soundfile').read(n)[1]
# (name, source file, start frame, frames)  ->  segment lengths in seconds from the frame counts
SEG = [('hyd', f'{V}/hyd.mp4', 0, 114), ('lon', f'{V}/lon.mp4', 0, 132), ('hook', f'{V}/hook.mp4', 0, 72), ('pk', f'{V}/pk.mp4', 0, 150), ('ug', 'part2/clips/03-UndergroundV.mp4', 0, 120),
       ('rt', f'{V}/rt.mp4', 0, 120), ('sh', 'part2/clips/05-ShoreV.mp4', 0, 96), ('sb', f'{V}/sb.mp4', 0, 90), ('rp', f'{V}/rp.mp4', 0, 72), ('pl', f'{V}/pl.mp4', 0, 132), ('nt', f'{V}/nt.mp4', 0, 90), ('ec', f'{V}/ec.mp4', 0, 108)]
start = {}; t = 0.0
for n, _, _, fr in SEG: start[n] = t; t += fr / FPS
TOTAL = t
# narration: (file, segment, offset in segment, caption words with *accents*)
LINES = [('h1', 'hyd', 0.9, 'Arjun taps *send.*'), ('h2', 'lon', 0.85, "A second later, *Meera's* phone *buzzes,* in *London.*"), ('h3', 'hook', 0.15, 'How does a photo cross an *ocean* that *fast?*'),
         ('b1', 'pk', 0.2, 'First, his phone cuts the photo into about *two thousand* small *packets.*'), ('b2', 'ug', 0.2, 'Radio to the nearest *tower,* then *glass cable* under the street.'),
         ('b3', 'rt', 0.2, 'Routers pass each packet along. Road jammed? *Another path.*'), ('b4', 'sh', 0.2, 'Then the land ends, and the cable goes *into the sea.*'),
         ('b5', 'sb', 0.15, '*Three kilometres* down, the packets are just *light.*'), ('b6', 'rp', 0.1, 'A *repeater* boosts the fading light.'),
         ('b7', 'pl', 0.25, 'The whole trip, *Hyderabad* to *London,* takes light about *sixty-five milliseconds.*'), ('b8', 'nt', 0.15, 'Her phone puts the packets back in order, and the *photo appears.*'),
         ('e1', 'ec', 0.3, "That's how a photo crosses an *ocean.* *Follow* for more.")]
os.makedirs(f'{V}/voice', exist_ok=True); N = int(TOTAL * SR); out = np.zeros((N, 2)); rng = np.random.default_rng(7)
def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0 or i >= N: return
    j = min(N, i + len(sig)); s = sig[: j - i] * gain; out[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); out[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
# 1) voice, played at 1.06 with the pitch kept
logs = []
for n, seg, off, text in LINES:
    src, dst = f'voice/p2/{n}.wav', f'{V}/voice/{n}.wav'
    if not os.path.exists(dst): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', f'atempo={G},aresample={SR}', dst], check=True)
    a, sr = sf.read(dst); a = a if a.ndim == 1 else a.mean(1); at = start[seg] + off; place(a, at, 1.0, 0.0); logs.append((n, at, at + len(a) / SR, text))
# 2) a soft pad: slow chords that melt into each other (no plucks, no repeating notes)
midi = lambda m: 440 * 2 ** ((m - 69) / 12); CH = [[57, 64, 67, 71], [53, 60, 64, 69], [57, 64, 67, 72], [53, 60, 64, 69], [55, 62, 65, 71], [52, 59, 64, 67]]
for j in range(int(TOTAL / 3.2) + 1):
    L = int(4.4 * SR); tt = np.arange(L) / SR
    for k, m in enumerate(CH[j % 6]):
        f = midi(m); tone = sum(np.sin(2 * np.pi * f * (1 + d) * tt) for d in (-0.003, 0, 0.003)) / 3
        place(tone * np.minimum(1, tt / 1.2) * np.minimum(1, (4.4 - tt) / 1.2).clip(0), j * 3.2, 0.03, (k - 1.5) * 0.4)
# 3) small effects
def tone(f, d, a=0.004, r=0.25, sh=5.0, h=0.0):
    L = int(d * SR); tt = np.arange(L) / SR; return (np.sin(2 * np.pi * f * tt) + h * np.sin(4 * np.pi * f * tt)) * np.minimum(1, tt / a) * np.exp(-sh * tt / r)
def tick(): L = int(0.05 * SR); tt = np.arange(L) / SR; return (rng.normal(0, 1, L) * np.exp(-90 * tt) * 0.5 + np.sin(2 * np.pi * 1500 * tt) * np.exp(-60 * tt)) * 0.6
def ding(): return tone(1318, 0.9, 0.003, 0.5, 5, 0.25) + 0.7 * tone(1760, 0.9, 0.003, 0.5, 5, 0.2)
def buzz():
    out_ = np.zeros(int(0.9 * SR))
    for k in range(2):
        L = int(0.22 * SR); tt = np.arange(L) / SR; s = (np.sin(2 * np.pi * 150 * tt) + 0.5 * np.sin(2 * np.pi * 300 * tt) + 0.25 * np.sign(np.sin(2 * np.pi * 150 * tt))) * np.minimum(1, tt / 0.01) * np.minimum(1, (0.22 - tt) / 0.03)
        i = int(k * 0.3 * SR); out_[i:i + L] += s * 0.5
    return out_
place(tick(), start['hyd'] + 1.95, 0.5)                          # his finger taps send
place(buzz(), start['lon'] + 1.2, 0.22, -0.2); place(ding(), start['lon'] + 1.2, 0.16, 0.2)   # her phone rings and vibrates
place(tick(), start['lon'] + 3.4, 0.3)                           # her fingertip taps the banner
place(tone(880, 1.1, 0.004, 0.6, 5, 0.2), start['nt'] + 0.35, 0.14, 0.0); place(tone(1318, 1.1, 0.004, 0.7, 5, 0.2), start['nt'] + 0.5, 0.11, 0.0)    # the photo arrives: a soft two-note chime
fade = np.minimum(1, np.arange(N) / (0.4 * SR)) * np.minimum(1, (N - np.arange(N)) / (1.2 * SR)); out *= fade[:, None]
out = np.tanh(out * 1.2) / 1.2; out *= 0.89 / max(1e-6, np.abs(out).max()); sf.write(f'{V}/mix.wav', out, SR)
json.dump(logs, open(f'{V}/voicelog.json', 'w'))
# 4) word-by-word captions (ASS) and an SRT. Words are timed by their length inside each spoken line.
def split_balanced(words):
    txt = ' '.join(words); n = max(1, -(-len(txt) // 24))
    if n == 1: return [words]
    rows = []; rest = list(words)
    for k in range(n, 0, -1):
        target = len(' '.join(rest)) / k; cur = []
        while rest and (not cur or len(' '.join(cur + [rest[0]])) <= target + 4 or k == 1): cur.append(rest.pop(0))
        rows.append(cur)
    return [r for r in rows if r]
def cs(x): return int(round(x * 100))
def tstr(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f'{h}:{m:02d}:{s:05.2f}'
def srt_t(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f'{h:02d}:{m:02d}:{int(s):02d},{int((s % 1) * 1000):03d}'
ass = ['[Script Info]', 'ScriptType: v4.00+', 'PlayResX: 1080', 'PlayResY: 1920', 'WrapStyle: 2', '', '[V4+ Styles]',
       'Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding',
       'Style: Cap,DejaVu Sans,50,&H00FFFFFF,&H00B9A3A0,&H00220A07,&H96000000,-1,0,0,0,100,100,0,0,1,5,2,2,110,150,470,1', '', '[Events]', 'Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text']
srt = []
for idx, (n, a, b, text) in enumerate(logs):
    toks = [(w.strip('*'), w.startswith('*') or w.endswith('*') or '*' in w) for w in text.replace('*', '\u0001').split()]
    toks = [(w.replace('\u0001', ''), '\u0001' in w) for w in text.replace(' *', ' \u0001').replace('*', '').split(' ')] if False else None
    # mark accent words: every word inside *...*
    words = []; acc = False
    for w in text.split(' '):
        starts, ends = w.startswith('*'), w.endswith('*')
        if starts: acc = True
        words.append((w.strip('*'), acc))
        if ends: acc = False
    w_len = np.array([max(2, len(w)) for w, _ in words], float); span = b - a; w_t = span * w_len / w_len.sum()
    rows = split_balanced([w for w, _ in words]); k = 0; parts = []
    for r in rows:
        seg_parts = []
        for _ in r:
            w, ac = words[k]; seg_parts.append('{\\k%d%s}%s' % (cs(w_t[k]), '\\1c&H54B4FF&' if ac else '\\1c&HFFFFFF&', w)); k += 1
        parts.append(' '.join(seg_parts))
    ass.append(f'Dialogue: 0,{tstr(a - 0.05)},{tstr(b + 0.35)},Cap,,0,0,0,,' + '\\N'.join(parts))
    srt.append(f'{idx + 1}\n{srt_t(a)} --> {srt_t(b + 0.2)}\n' + '\n'.join(' '.join(w for w, _ in words).split('\n')) + '\n')
open(f'{V}/captions.ass', 'w').write('\n'.join(ass)); open(f'{V}/captions.srt', 'w').write('\n'.join(srt))
print('total', round(TOTAL, 2), 's; voice from', round(logs[0][1], 2), 'to', round(logs[-1][2], 2))
