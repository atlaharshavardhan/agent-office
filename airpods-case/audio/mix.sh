# V3 mix: narration on top, subtle continuous music (lightly ducked under the voice), minimal sound effects.
# Levels are set in make_sounds.py (voice -4 dBFS peaks, music -24 dBFS, effects -27..-16 dBFS); here they are summed and brought to -14 LUFS.
cd "$(dirname "$0")"
ffmpeg -loglevel error -y -i voice.wav -i bed.wav -i sfx.wav -filter_complex "[0:a]asplit=2[v][sc];[1:a][sc]sidechaincompress=threshold=0.03:ratio=2.5:attack=20:release=400[b];[v][b][2:a]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.1:LRA=11,aresample=48000[out]" -map "[out]" -c:a pcm_s16le mix.wav
ffmpeg -loglevel error -y -i voice.wav -i sfx.wav -filter_complex "[0:a][1:a]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.8:LRA=11,aresample=48000[out]" -map "[out]" -c:a pcm_s16le mix_nomusic.wav
ffmpeg -loglevel error -y -i bed.wav -i sfx.wav -filter_complex "[0:a][1:a]amix=inputs=2:normalize=0,loudnorm=I=-18:TP=-2.0:LRA=11,aresample=48000[out]" -map "[out]" -c:a pcm_s16le mix_clean.wav
