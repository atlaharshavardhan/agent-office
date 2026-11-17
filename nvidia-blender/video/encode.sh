#!/bin/bash
# Encode the deliverables from rendered frames + mixes.
#   video/encode.sh        -> 1080x1920 (music) + no-music version
#   video/encode.sh 4k     -> 2160x3840 from video/frames4k
set -e
cd "$(dirname "$0")/.."
NAME=exports/nvidia-2-trillion-short
if [ "$1" = "4k" ]; then
  ffmpeg -loglevel error -y -framerate 30 -i video/frames4k/f_%05d.png -i audio/mix.wav -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p \
    -c:a aac -b:a 256k -shortest -movflags +faststart ${NAME}-4k.mp4
  exit 0
fi
ffmpeg -loglevel error -y -framerate 30 -i video/frames/f_%05d.png -i audio/mix.wav -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart ${NAME}.mp4
ffmpeg -loglevel error -y -i ${NAME}.mp4 -i audio/mix_nomusic.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart ${NAME}-nomusic.mp4
