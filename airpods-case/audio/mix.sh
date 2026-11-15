# final audio: voice on top, music bed side-chained under the voice, sound effects. Also a no-music mix (voice + effects) for Instagram auto-translate.
cd "$(dirname "$0")"
ffmpeg -loglevel error -y -i voice.wav -i bed.wav -i sfx.wav -filter_complex "[0:a]asplit=2[v][sc];[1:a][sc]sidechaincompress=threshold=0.02:ratio=7:attack=15:release=350[bd];[bd]volume=0.5[b];[2:a]volume=0.42,alimiter=limit=0.6[f];[v][b][f]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[out]" -map "[out]" -c:a pcm_s16le mix.wav
ffmpeg -loglevel error -y -i voice.wav -i sfx.wav -filter_complex "[1:a]volume=0.42,alimiter=limit=0.6[f];[0:a][f]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[out]" -map "[out]" -c:a pcm_s16le mix_nomusic.wav
