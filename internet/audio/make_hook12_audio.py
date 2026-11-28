"""Part 2 HOOK, 10 second version: the narration and every sound in one file (audio only, no picture): video/part2hook10/hook10-audio.wav.
Timeline, 12 s: 0-2.2 Hyderabad tap + window break | 2.2-3.4 globe | 3.4-6.4 sea floor light | 6.4-7.6 globe to London | 7.6-9.9 London buzz | 9.9-12 notification.
Voice: Liam (lines s1, s2, s3), played at 1.06. Sounds made in code: finger tap, glass break, soft pad, one soft note on landing, phone buzz + ding, banner tap, notification chime. No whoosh, no repeating notes."""
import numpy as np, soundfile as sf, subprocess, os, json
SR = 48000; DUR = 12.0; N = int(DUR * SR); out = np.zeros((N, 2)); rng = np.random.default_rng(7); G = 1.06; os.makedirs('video/part2hook12/voice', exist_ok=True)
def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0 or i >= N: return
    j = min(N, i + len(sig)); s = sig[: j - i] * gain; out[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); out[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
def tone(f, d, a=0.004, r=0.25, sh=5.0, h=0.0):
    L = int(d * SR); tt = np.arange(L) / SR; return (np.sin(2 * np.pi * f * tt) + h * np.sin(4 * np.pi * f * tt)) * np.minimum(1, tt / a) * np.exp(-sh * tt / r)
def tick(): L = int(0.05 * SR); tt = np.arange(L) / SR; return (rng.normal(0, 1, L) * np.exp(-90 * tt) * 0.5 + np.sin(2 * np.pi * 1500 * tt) * np.exp(-60 * tt)) * 0.6
def buzz():
    o = np.zeros(int(0.9 * SR))
    for k in range(2):
        L = int(0.22 * SR); tt = np.arange(L) / SR; s = (np.sin(2 * np.pi * 150 * tt) + 0.5 * np.sin(2 * np.pi * 300 * tt) + 0.25 * np.sign(np.sin(2 * np.pi * 150 * tt))) * np.minimum(1, tt / 0.01) * np.minimum(1, (0.22 - tt) / 0.03)
        o[int(k * 0.3 * SR): int(k * 0.3 * SR) + L] += s * 0.5
    return o
ding = lambda: tone(1318, 0.9, 0.003, 0.5, 5, 0.25) + 0.7 * tone(1760, 0.9, 0.003, 0.5, 5, 0.2)
# voice
log = []
VOICE = [('s1', 0.2), ('g1', 2.3), ('g2', 3.9), ('g3', 6.5), ('s4', 10.35)]   # the last line, "So how did it get there?", recorded 28 Nov (Harsh allowed ElevenLabs for the hook)
for n, at in VOICE:
    dst = f'video/part2hook12/voice/{n}.wav'
    if not os.path.exists(dst): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'voice/p2/{n}.wav', '-af', f'atempo={G},aresample={SR}', dst], check=True)
    a, _ = sf.read(dst); a = a if a.ndim == 1 else a.mean(1); place(a, at, 1.0); log.append((n, at, round(at + len(a) / SR, 2)))
# soft pad (slow chords, no repeating notes)
midi = lambda m: 440 * 2 ** ((m - 69) / 12); CH = [[57, 64, 67, 71], [53, 60, 64, 69], [57, 64, 67, 72], [53, 60, 64, 69], [55, 62, 65, 71]]
for j in range(5):
    L = int(4.4 * SR); tt = np.arange(L) / SR
    for k, m in enumerate(CH[j]):
        f = midi(m); tn = sum(np.sin(2 * np.pi * f * (1 + d) * tt) for d in (-0.003, 0, 0.003)) / 3
        place(tn * np.minimum(1, tt / 1.2) * np.minimum(1, (4.4 - tt) / 1.2).clip(0), j * 3.0, 0.03, (k - 1.5) * 0.4)
# effects
place(tick(), 0.95, 0.5)                                                                    # his finger taps send
g, _ = sf.read('audio/sfx-glass.wav'); place(g.mean(1) if g.ndim > 1 else g, 1.9, 0.8)      # the window breaks (audio/make_glass.py)
place(tone(988, 1.0, 0.004, 0.5, 5, 0.2), 7.3, 0.09)                                        # the photo lands on the London pin: one soft note
place(buzz(), 8.5, 0.22, -0.2); place(ding(), 8.5, 0.16, 0.2)                                # her phone buzzes and rings
place(tone(880, 1.1, 0.004, 0.6, 5, 0.2), 10.3, 0.12); place(tone(1318, 1.1, 0.004, 0.7, 5, 0.2), 10.45, 0.09)    # the notification chime
fade = np.minimum(1, np.arange(N) / (0.3 * SR)) * np.minimum(1, (N - np.arange(N)) / (0.8 * SR)); out *= fade[:, None]
out = np.tanh(out * 1.2) / 1.2; out *= 0.76 / np.abs(out).max(); sf.write('video/part2hook12/mix.wav', out, SR)
json.dump(log, open('video/part2hook12/voicelog.json', 'w')); print('voice:', log, 'peak', round(float(np.abs(out).max()), 2))
