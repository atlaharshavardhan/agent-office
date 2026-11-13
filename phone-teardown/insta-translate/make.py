"""Instagram-translation cut of the iPhone Duo Reel v4: voice + light action sounds only (no music, no musical plucks),
and the stretches without talking trimmed out. Instagram only offers AI translation for mostly-talking Reels."""
import subprocess, json
R = '../reel/public/'
VO = [('l1', 0.1), ('l2', 2.85), ('l3', 5.45), ('l4', 9.2), ('l5', 19.2), ('l6', 32.1), ('l7', 38.1), ('l8s', 42.35)]
# action sounds only (no music bed, plucks, chimes or shimmer), a little lower than the original mix
SFX = [('impact.wav', 0, 0.35), ('open.wav', 3.98, 0.6), ('impact.wav', 4.7, 0.35), ('impact-small.wav', 11.28, 0.35),
       ('ratchet.wav', 19.55, 0.4), ('impact-small.wav', 20.48, 0.3), ('close.wav', 41.95, 0.8), ('tap.wav', 43.9, 0.4)]
KEEP = [(0.0, 17.90), (19.05, 30.12), (31.98, 46.05)]   # drop the two quiet gaps and the silent tail
SRC = '../iphone-duo-reel-v4.mp4'
ins, flt = [], []
for i, (f, t) in enumerate(VO):
    ins += ['-i', R + f'vo/{f}.wav']; ms = int(t * 1000); flt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[v{i}]')
n = len(VO)
for j, (f, t, v) in enumerate(SFX):
    ins += ['-i', R + 'sfx2/' + f]; ms = int(t * 1000); flt.append(f'[{n+j}:a]aresample=48000,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[s{j}]')
mix = ''.join(f'[v{i}]' for i in range(n)) + ''.join(f'[s{j}]' for j in range(len(SFX)))
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', ';'.join(flt) + f';{mix}amix=inputs={n+len(SFX)}:normalize=0,apad,atrim=0:46.8[a]', '-map', '[a]', '-ar', '48000', 'audio_full.wav'], check=True)
# cut video + audio with the same keep list
parts, fc = [], []
for k, (a, b) in enumerate(KEEP):
    fc.append(f'[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{k}];[1:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={b-a-0.03:.3f}:d=0.03[a{k}]')
    parts.append(f'[v{k}][a{k}]')
fc.append(''.join(parts) + f'concat=n={len(KEEP)}:v=1:a=1[v][ar];[ar]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', SRC, '-i', 'audio_full.wav', '-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]',
                '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'iphone-duo-reel-v4-insta-translate.mp4'], check=True)
print(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'iphone-duo-reel-v4-insta-translate.mp4']).decode().strip())
