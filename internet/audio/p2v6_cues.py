"""Part 2 v6 (tight): records the narration sentence by sentence (Kokoro am_michael), trims every silence, joins with very short gaps,
then builds the master timeline from the real sentence times (no hand-typed cues).  Run from internet/:  python audio/p2v6_cues.py [speed]
Writes voice/p2v6/n*.wav, video/rf6/timeline.json, v3/src/v4/p2v6-timeline.ts, v3/public/p2v6 links."""
import json, os, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
SPEED = float(sys.argv[1]) if len(sys.argv) > 1 else 1.18; SR = 24000; GAP_S, GAP_C, GAP_N = 0.09, 0.03, 0.10
SC = {
 'n1': [('a', "First, your phone converts the photo into digital data."), ('b', "Millions of ones and zeros."), ('c1', "Then, it encrypts that data,"), ('c2', "so if anyone intercepts it, all they see is scrambled data.")],
 'n2': [('a', "Next, the data is split into thousands of tiny packets."), ('b', "Each packet carries information about where it's going, where it came from, and how it fits into the original data."), ('c', "And now, they're ready to travel.")],
 'n3': [('a', "Radio waves carry them to a nearby mobile tower."), ('b', "From there, the data travels as pulses of light through a fibre-optic cable beneath the street.")],
 'n4': [('a', "Along the way, routers read the addresses and decide where to send each packet next."), ('b', "If one route is congested, they can take another."), ('c', "But eventually, the land ends, and the cable disappears beneath the ocean.")],
 'n5': [('a', "Deep underwater, the cable can be as thin as a garden hose."), ('b', "Layers of steel and plastic protect it, while copper carries electrical power."), ('c', "And at its core are glass fibres, thinner than a human hair.")],
 'n6': [('a', "Down here, your photo is nothing but pulses of light."), ('b', "Every 60 to 100 kilometres, a repeater amplifies the signal, keeping it strong across the ocean.")],
 'n7': [('a', "Almost all intercontinental internet traffic travels through cables like these."), ('b', "But what happens if a ship's anchor cuts one?"), ('c', "The network can reroute the data through another cable.")],
 'n8': [('a', "Once the data reaches London, it travels to a mobile tower, which sends it to her phone as radio waves."), ('b', "The packets may arrive out of order,"), ('b2', "but they're put back into the correct sequence."), ('c', "If any are missing, they're requested again."), ('d', "Finally, her phone decrypts the data, and the photo appears.")],
 'n9': [('a', "All of this can happen in the blink of an eye.")],
 'n10': [('a', "Follow for more.")]}
SP = {'n9': 0.82, 'n10': 1.0}
k = Kokoro('/tmp/kokoro-models/kokoro-v1.0.onnx', '/tmp/kokoro-models/voices-v1.0.bin')
def synth(t, sp):
    a, sr = k.create(t, voice='am_michael', speed=sp, lang='en-us'); a = a if a.ndim == 1 else a.mean(1)
    e = np.convolve(np.abs(a), np.ones(int(.01 * sr)) / int(.01 * sr), 'same'); idx = np.where(e > 0.012)[0]
    return a[max(0, idx[0] - int(.015 * sr)):idx[-1] + int(.03 * sr)], sr
S = {}; E = {}; t = 0.0; words = 0; total_voice = 0.0; os.makedirs('voice/p2v6', exist_ok=True); SCN = {}
for n, items in SC.items():
    parts = []; pos = 0.0
    for q, (key, text) in enumerate(items):
        a, sr = synth(text, SP.get(n, SPEED)); assert sr == SR
        S[(n, key)] = t + pos; E[(n, key)] = t + pos + len(a) / SR; parts.append(a); pos += len(a) / SR; total_voice += len(a) / SR; words += len(text.split())
        gap = (GAP_C if text.endswith(',') else GAP_S); parts.append(np.zeros(int(gap * SR))); pos += gap
    wav = np.concatenate(parts[:-1]); sf.write(f'voice/p2v6/{n}.wav', wav, SR); SCN[n] = (t, t + len(wav) / SR); t += len(wav) / SR + GAP_N
print('words', words, 'voice seconds', round(total_voice, 2), 'wpm (speech only)', round(words / total_voice * 60), 'end', round(t, 2), 'wpm incl gaps', round(words / t * 60))
s_ = lambda n, q: S[(n, q)]; e_ = lambda n, q: E[(n, q)]
NA = 11.88; HOOK = 12.0; FADE = 0.12; R, R6 = 'rf', 'rf6'
cutT = s_('n7', 'b') + 0.55 * (e_('n7', 'b') - s_('n7', 'b'))
tw_end = s_('n8', 'a') + 0.58 * (e_('n8', 'a') - s_('n8', 'a'))
arS = s_('n8', 'b') - 0.3; decT = s_('n8', 'd') + 0.9
L9 = e_('n9', 'a') - s_('n9', 'a'); blinkT = s_('n9', 'a') + 0.64 * L9 + 0.1
sp2 = 4.25 / (blinkT - decT); ar_end = blinkT + 1.15 / sp2
en_at = ar_end - 0.1
# (id, group, folder, file, off, src a, src b, at, end)
RAW = [
 ('s1', 's1', R6 if False else R, 's1', 0, 0.15, 3.53, 0.0, s_('n1', 'b')),
 ('b2', 'b2', R, 'b2', 0, 0.0, 1.97, s_('n1', 'b'), s_('n1', 'c1')),
 ('s5', 's5', R, 's5', 0, 0.0, 1.93, s_('n1', 'c1'), s_('n1', 'c2')),
 ('s6', 's6', R6, 's6', 0, 0.0, 2.37, s_('n1', 'c2'), s_('n2', 'a')),
 ('pb', 'pb', R6, 'pb', 0, 0.0, 4.0, s_('n2', 'a'), s_('n2', 'a') + 3.8),
 ('pa', 'pa', R, 'pa', 0, 2.6, 8.67, s_('n2', 'a') + 3.8, s_('n2', 'c')),
 ('tw1', 'tw1', R6, 'tw1', 0, 0.0, 5.1, s_('n2', 'c'), s_('n3', 'b')),
 ('ug', 'ug', R6, 'ug', 0.6, 0.6, 8.7, s_('n3', 'b'), s_('n4', 'a')),
 ('rt', 'rt', R6, 'rt', 0, 0.0, 11.95, s_('n4', 'a'), s_('n4', 'c')),
 ('sh', 'sh', R6, 'sh', 0.8, 0.8, 8.7, s_('n4', 'c'), s_('n5', 'a')),
 ('cb', 'cb', R, 'cb', 0, 0.2, 15.0, s_('n5', 'a'), s_('n6', 'a')),
 ('sbb', 'sbb', R6, 'sbb', 3.0, 3.0, 7.2, s_('n6', 'a'), s_('n6', 'b')),
 ('rp', 'rp', R, 'rp', 0, 0.0, 7.5, s_('n6', 'b'), s_('n7', 'a')),
 ('gc1', 'gc', R6, 'gc', 0, 0.0, 6.7, s_('n7', 'a'), cutT),
 ('gc2', 'gc', R6, 'gc', 0, 6.7, 10.6, cutT, s_('n8', 'a')),
 ('tw', 'tw', R6, 'tw', 0, 0.0, 3.5, s_('n8', 'a'), tw_end),
 ('nt', 'nt', R, 'nt', 0, 0.3, 2.0, tw_end, arS),
 ('ar1', 'ar', R6, 'ar', 0, 0.0, 7.9, arS, decT),
 ('ar2', 'ar', R6, 'ar', 0, 7.9, 13.3, decT, ar_end),
 ('en', 'en', R, 'en', 0, 0.0, 3.8, en_at, en_at + 3.8)]
segs = []; seen = set(); os.makedirs('v3/public/p2v6', exist_ok=True)
for cid, grp, folder, name, off, a, b, at, end in RAW:
    assert end > at, (cid, at, end)
    link = f'v3/public/p2v6/{name}.mp4'
    if not os.path.lexists(link): os.symlink(os.path.abspath(f'video/{folder}/{name}.mp4'), link)
    segs.append(dict(id=cid, group=grp, folder=folder, file=f'p2v6/{name}.mp4', off=off, a=round(a, 4), b=round(b, 4), at=round(at, 4), end=round(end, 4), speed=round((b - a) / (end - at), 4), fade=grp not in seen)); seen.add(grp)
TOTAL = NA + RAW[-1][8]
START = {n: round(v[0], 4) for n, v in SCN.items()}; START['n10'] = round(en_at + 0.3, 4)
# the n10 line must start exactly when the end card text appears: shift its wav start in the mix (kept in START)
LEN = {n: round(v[1] - v[0], 4) for n, v in SCN.items()}
out = dict(NA=NA, HOOK=HOOK, FADE=FADE, TOTAL=round(TOTAL, 3), START=START, LEN=LEN, SEG=segs)
open('v3/src/v4/p2v6-timeline.ts', 'w').write('export default ' + json.dumps(out, indent=1) + ' as const;\n'); json.dump(out, open('video/rf6/timeline.json', 'w'), indent=1)
for s in segs: print(s['id'], 'at', round(s['at'], 2), 'end', round(s['end'], 2), 'speed', s['speed'])
print('total', round(TOTAL, 2), 'narration end', round(NA + START['n10'] + LEN['n10'], 2), 'blink at', round(NA + blinkT, 2))
