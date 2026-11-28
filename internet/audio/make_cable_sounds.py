"""Three alternative sounds for the light racing along the cable (1.5 s), Harsh did not like the glassy shimmer (28 Nov 2026). Made in code, free.
A: data blips (a fast stream of tiny digital ticks that speeds up, like packets passing)  B: electric hum (a low power hum that climbs, with crackle)  C: pulse (a heartbeat-like deep pulse that speeds up, with a bright ping at the end).
Writes video/part2hook12/cable-A-blips.mp3, cable-B-electric.mp3, cable-C-pulse.mp3."""
import numpy as np, soundfile as sf, subprocess
SR = 48000; D = 1.5; N = int(D * SR); rng = np.random.default_rng(3)
def save(x, name):
    x = np.tanh(x * 1.3) / 1.3; x *= 0.8 / np.abs(x).max(); x *= np.minimum(1, np.arange(len(x)) / (0.01 * SR)) * np.minimum(1, (len(x) - np.arange(len(x))) / (0.06 * SR))
    sf.write(f'video/part2hook12/{name}.wav', x, SR); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'video/part2hook12/{name}.wav', '-c:a', 'libmp3lame', '-b:a', '192k', f'video/part2hook12/{name}.mp3'], check=True)
# A: blips that come faster and faster (packets passing)
a = np.zeros(N); t = 0.0; gap = 0.16
while t < D - 0.06:
    L = int(0.035 * SR); tt = np.arange(L) / SR; f = rng.choice([1320, 1760, 2093, 2637]); a[int(t * SR): int(t * SR) + L] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 90) * 0.7; t += gap; gap = max(0.022, gap * 0.86)
save(a, 'cable-A-blips')
# B: electric hum that climbs, with crackle
t = np.arange(N) / SR; f = 90 + 330 * (t / D) ** 1.6; ph = 2 * np.pi * np.cumsum(f) / SR; hum = (np.sin(ph) + 0.5 * np.sign(np.sin(ph)) * 0.4 + 0.3 * np.sin(2 * ph)) * (0.35 + 0.65 * (t / D))
cr = np.zeros(N)
for k in range(70):
    at = int((rng.random() ** 0.8) * (D - 0.03) * SR); L = int(0.012 * SR); cr[at: at + L] += rng.normal(0, 1, L) * np.exp(-np.arange(L) / (0.003 * SR)) * 0.6 * (0.3 + at / N)
save(hum * 0.5 + cr * 0.7, 'cable-B-electric')
# C: deep pulses that speed up, a bright ping at the end
c = np.zeros(N); tt0 = 0.0; gap = 0.30
while tt0 < D - 0.25:
    L = int(0.18 * SR); tt = np.arange(L) / SR; c[int(tt0 * SR): int(tt0 * SR) + L] += np.sin(2 * np.pi * 70 * tt * (1 - 0.35 * tt / 0.18)) * np.exp(-tt * 22) * 0.9; tt0 += gap; gap = max(0.07, gap * 0.8)
L = int(0.5 * SR); tt = np.arange(L) / SR; c[N - L:] += (np.sin(2 * np.pi * 1568 * tt) + 0.4 * np.sin(2 * np.pi * 2349 * tt)) * np.exp(-tt * 7) * 0.5
save(c, 'cable-C-pulse'); print('ok')
