"""Hook audio (first 15.6 s), rebuilt for Part 1 version 3: new opening line, no whoosh sounds.
Music bed + effects without the camera whooshes + narration. Writes v3/public/hook-mix.wav. Run from internet/."""
import numpy as np, soundfile as sf
SR = 48000; N = int(15.6 * SR)
bed, _ = sf.read('audio/bed.wav'); sfx, _ = sf.read('audio/sfx-quiet.wav'); out = bed[:N] * 0.56 + sfx[:N] * 1.25
V = [('v3/g1', 0.25), ('v3/h1b', 3.4), ('h2', 5.8), ('p1', 8.4), ('p2', 10.5), ('p3', 12.45), ('p4', 14.3)]
for name, at in V:
    a, sr = sf.read(f'voice/{name}.wav'); a = np.interp(np.arange(len(a) * 2) / 2, np.arange(len(a)), a)
    i = int(at * SR); n = min(len(a), N - i); out[i:i + n] -= bed[i:i + n] * 0.56 * 0.45; out[i:i + n] += np.stack([a[:n], a[:n]], 1) * 0.9
out[:int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))[:, None]
ab = np.abs(out); out = np.where(ab > 0.75, np.sign(out) * (0.75 + 0.15 * np.tanh((ab - 0.75) / 0.15)), out)
sf.write('v3/public/hook-mix.wav', out.astype(np.float32), SR, subtype='PCM_16'); print(len(out) / SR, np.abs(out).max())
