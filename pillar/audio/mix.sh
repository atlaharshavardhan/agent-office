#!/bin/bash
# Final audio: George's voice on top + sound effects (no music, no footsteps), loudness -14 LUFS → mix.wav
cd "$(dirname "$0")"
ffmpeg -loglevel error -y -i ../voice/voice.wav -i sfx.wav -filter_complex "[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0[v];[1:a]volume=0.5[f];[v][f]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[out]" -map "[out]" -c:a pcm_s16le mix.wav
