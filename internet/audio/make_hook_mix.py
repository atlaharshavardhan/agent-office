"""Hook audio, version 6 (26 Nov 2026): Liam's approved expressive hook line, then straight into "On is one".
The 2.5 s between the end of the hook line (5.9 s) and the first-person shot (old 8.4 s) are cut out of picture and sound,
so the hook is 13.1 s long. Faint music, effects without any movement sounds, narration. Writes v3/public/hook-mix.wav. Run from internet/."""
import numpy as np, soundfile as sf
SR = 48000; CUT_A, CUT_B = 5.9, 8.4
def cut(x):
    a, b, f = int(CUT_A * SR), int(CUT_B * SR), int(0.03 * SR); y = np.concatenate([x[:a], x[b:]]); r = np.linspace(0, 1, f)[:, None]
    y[a - f:a] = x[a - f:a] * (1 - r) + x[b - f:b] * r; return y
bed, _ = sf.read('audio/bed-hook.wav'); sfx, _ = sf.read('audio/sfx-hook.wav'); N = int((15.6 - (CUT_B - CUT_A)) * SR)
bedc = cut(bed[:int(15.6 * SR)])[:N] * 0.56; out = bedc + cut(sfx[:int(15.6 * SR)])[:N] * 1.25
V = [('liam/hookA', 0.15), ('liam/p1', 5.9), ('liam/p2', 8.0), ('liam/p3', 9.95), ('liam/p4', 11.8)]
for name, at in V:
    a, sr = sf.read(f'voice/{name}.wav'); a = np.interp(np.arange(len(a) * 2) / 2, np.arange(len(a)), a)
    i = int(at * SR); n = min(len(a), N - i); out[i:i + n] -= bedc[i:i + n] * 0.45; out[i:i + n] += np.stack([a[:n], a[:n]], 1) * 0.9
out[:int(0.15 * SR)] *= np.linspace(0, 1, int(0.15 * SR))[:, None]
ab = np.abs(out); out = np.where(ab > 0.75, np.sign(out) * (0.75 + 0.15 * np.tanh((ab - 0.75) / 0.15)), out)
sf.write('v3/public/hook-mix.wav', out.astype(np.float32), SR, subtype='PCM_16'); print(len(out) / SR, np.abs(out).max())
