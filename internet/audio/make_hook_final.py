"""Part 2 HOOK ONLY (28 Nov 2026): sound, captions and join. Picture pieces: video/part2v1 (hyd, lon, nt) and video/part2hook (ga, sf, gb).
Writes video/part2hook/mix.wav, captions.ass, captions.srt and the finished video/internet-part2-hook-v1.mp4. No whoosh, no repeating notes. Run from internet/."""
import json, subprocess, os, numpy as np, soundfile as sf
SR = 48000; G = 1.06; H = 'video/part2hook'; P = 'video/part2v1'; FPS = 30
SEG = [('hyd', f'{P}/hyd.mp4', 114), ('ga', f'{H}/ga.mp4', 60), ('sf', f'{H}/sf.mp4', 90), ('gb', f'{H}/gb.mp4', 63), ('lon', f'{P}/lon.mp4', 132), ('nt', f'{P}/nt.mp4', 90)]
start = {}; t = 0.0
for n, _, fr in SEG: start[n] = t; t += fr / FPS
TOTAL = t
LINES = [('h1', 'hyd', 0.9, 'Arjun taps *send.*'), ('n1', 'ga', 0.3, 'The photo races *under the sea* at *two hundred thousand* kilometres a second.'),
         ('h2', 'lon', 0.85, "A second later, *Meera's* phone *buzzes,* in *London.*"), ('h3', 'nt', 0.15, 'How does a photo cross an *ocean* that *fast?*')]
os.makedirs(f'{H}/voice', exist_ok=True); N = int(TOTAL * SR); out = np.zeros((N, 2)); rng = np.random.default_rng(7)
def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0 or i >= N: return
    j = min(N, i + len(sig)); s = sig[: j - i] * gain; out[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); out[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
logs = []
for n, seg, off, text in LINES:
    dst = f'{H}/voice/{n}.wav'
    if not os.path.exists(dst): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'voice/p2/{n}.wav', '-af', f'atempo={G},aresample={SR}', dst], check=True)
    a, _ = sf.read(dst); a = a if a.ndim == 1 else a.mean(1); at = start[seg] + off; place(a, at, 1.0); logs.append((n, at, at + len(a) / SR, text))
midi = lambda m: 440 * 2 ** ((m - 69) / 12); CH = [[57, 64, 67, 71], [53, 60, 64, 69], [57, 64, 67, 72], [53, 60, 64, 69], [55, 62, 65, 71], [52, 59, 64, 67]]
for j in range(int(TOTAL / 3.2) + 1):
    L = int(4.4 * SR); tt = np.arange(L) / SR
    for k, m in enumerate(CH[j % 6]):
        f = midi(m); tone = sum(np.sin(2 * np.pi * f * (1 + d) * tt) for d in (-0.003, 0, 0.003)) / 3
        place(tone * np.minimum(1, tt / 1.2) * np.minimum(1, (4.4 - tt) / 1.2).clip(0), j * 3.2, 0.03, (k - 1.5) * 0.4)
def tone(f, d, a=0.004, r=0.25, sh=5.0, h=0.0):
    L = int(d * SR); tt = np.arange(L) / SR; return (np.sin(2 * np.pi * f * tt) + h * np.sin(4 * np.pi * f * tt)) * np.minimum(1, tt / a) * np.exp(-sh * tt / r)
def tick(): L = int(0.05 * SR); tt = np.arange(L) / SR; return (rng.normal(0, 1, L) * np.exp(-90 * tt) * 0.5 + np.sin(2 * np.pi * 1500 * tt) * np.exp(-60 * tt)) * 0.6
def ding(): return tone(1318, 0.9, 0.003, 0.5, 5, 0.25) + 0.7 * tone(1760, 0.9, 0.003, 0.5, 5, 0.2)
def buzz():
    o = np.zeros(int(0.9 * SR))
    for k in range(2):
        L = int(0.22 * SR); tt = np.arange(L) / SR; s = (np.sin(2 * np.pi * 150 * tt) + 0.5 * np.sin(2 * np.pi * 300 * tt) + 0.25 * np.sign(np.sin(2 * np.pi * 150 * tt))) * np.minimum(1, tt / 0.01) * np.minimum(1, (0.22 - tt) / 0.03)
        i = int(k * 0.3 * SR); o[i:i + L] += s * 0.5
    return o
place(tick(), start['hyd'] + 1.95, 0.5)                                                            # his finger taps send
place(tone(988, 1.0, 0.004, 0.5, 5, 0.2), start['gb'] + 1.1, 0.08, 0.0)                              # the photo lands on the London pin: one soft note
place(buzz(), start['lon'] + 1.2, 0.22, -0.2); place(ding(), start['lon'] + 1.2, 0.16, 0.2)       # her phone rings and vibrates
place(tick(), start['lon'] + 3.4, 0.3)                                                             # her fingertip taps the banner
place(tone(880, 1.1, 0.004, 0.6, 5, 0.2), start['nt'] + 0.35, 0.12, 0.0); place(tone(1318, 1.1, 0.004, 0.7, 5, 0.2), start['nt'] + 0.5, 0.09, 0.0)
fade = np.minimum(1, np.arange(N) / (0.4 * SR)) * np.minimum(1, (N - np.arange(N)) / (1.0 * SR)); out *= fade[:, None]
out = np.tanh(out * 1.2) / 1.2; out *= 0.89 / max(1e-6, np.abs(out).max()); sf.write(f'{H}/mix.wav', out, SR); json.dump(logs, open(f'{H}/voicelog.json', 'w'))
def split_balanced(words):
    txt = ' '.join(words); n = max(1, -(-len(txt) // 24))
    if n == 1: return [words]
    rows = []; rest = list(words)
    for k in range(n, 0, -1):
        target = len(' '.join(rest)) / k; cur = []
        while rest and (not cur or len(' '.join(cur + [rest[0]])) <= target + 4 or k == 1): cur.append(rest.pop(0))
        rows.append(cur)
    return [r for r in rows if r]
cs = lambda x: int(round(x * 100))
def tstr(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f'{h}:{m:02d}:{s:05.2f}'
def srt_t(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f'{h:02d}:{m:02d}:{int(s):02d},{int((s % 1) * 1000):03d}'
ass = ['[Script Info]', 'ScriptType: v4.00+', 'PlayResX: 1080', 'PlayResY: 1920', 'WrapStyle: 2', '', '[V4+ Styles]',
       'Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding',
       'Style: Cap,DejaVu Sans,50,&H00FFFFFF,&H00B9A3A0,&H00220A07,&H96000000,-1,0,0,0,100,100,0,0,1,5,2,2,110,150,470,1', '', '[Events]', 'Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text']
srt = []
for idx, (n, a, b, text) in enumerate(logs):
    words = []; acc = False
    for w in text.split(' '):
        if w.startswith('*'): acc = True
        words.append((w.strip('*'), acc))
        if w.endswith('*'): acc = False
    wl = np.array([max(2, len(w)) for w, _ in words], float); wt = (b - a) * wl / wl.sum(); k = 0; parts = []
    for r in split_balanced([w for w, _ in words]):
        sp = []
        for _ in r: w, ac = words[k]; sp.append('{\\k%d%s}%s' % (cs(wt[k]), '\\1c&H54B4FF&' if ac else '\\1c&HFFFFFF&', w)); k += 1
        parts.append(' '.join(sp))
    ass.append(f'Dialogue: 0,{tstr(a - 0.05)},{tstr(b + 0.35)},Cap,,0,0,0,,' + '\\N'.join(parts)); srt.append(f'{idx + 1}\n{srt_t(a)} --> {srt_t(b + 0.2)}\n' + ' '.join(w for w, _ in words) + '\n')
open(f'{H}/captions.ass', 'w').write('\n'.join(ass)); open(f'{H}/captions.srt', 'w').write('\n'.join(srt))
# join: picture pieces, captions, watermark (horizontal, 30% see-through, middle left), sound
cmd = ['ffmpeg', '-v', 'error', '-y']
for n, f, fr in SEG: cmd += ['-i', f]
cmd += ['-loop', '1', '-framerate', '30', '-t', str(TOTAL), '-i', f'{P}/mark.png', '-i', f'{H}/mix.wav']
parts = [f'[{i}:v]trim=end_frame={fr},setpts=PTS-STARTPTS,fps=30,scale=1080:1920,setsar=1,format=yuv420p[v{i}]' for i, (n, f, fr) in enumerate(SEG)]
parts += [''.join(f'[v{i}]' for i in range(len(SEG))) + f'concat=n={len(SEG)}:v=1:a=0[cat]', f'[cat]subtitles={H}/captions.ass[cap]', f'[{len(SEG)}:v]format=rgba,colorchannelmixer=aa=0.3[m]', '[cap][m]overlay=x=24:y=926[v]']
cmd += ['-filter_complex', ';'.join(parts), '-map', '[v]', '-map', f'{len(SEG) + 1}:a', '-t', str(TOTAL), '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'video/internet-part2-hook-v1.mp4']
r = subprocess.run(cmd, capture_output=True, text=True); print('total', round(TOTAL, 2), 's; ffmpeg', r.returncode, r.stderr[-300:])
