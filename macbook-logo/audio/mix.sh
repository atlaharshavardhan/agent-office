#!/bin/bash
# Final audio: George on top, music ducked under the voice (side-chain), sound effects.
# mix.wav = full; mix_nomusic.wav = voice + sound effects only (for Instagram auto-translate).
cd "$(dirname "$0")"; V=../voice/${1:-george}/voice.wav
ffmpeg -loglevel error -y -i "$V" -i music.wav -i sfx.wav -filter_complex "[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,asplit=2[v][sc];[1:a][sc]sidechaincompress=threshold=0.02:ratio=5:attack=25:release=450[m];[m]volume=0.42[mm];[2:a]volume=0.5[f];[v][mm][f]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[out]" -map "[out]" -c:a pcm_s16le mix.wav
ffmpeg -loglevel error -y -i "$V" -i sfx.wav -filter_complex "[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0[v];[1:a]volume=0.5[f];[v][f]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[out]" -map "[out]" -c:a pcm_s16le mix_nomusic.wav
