#!/bin/bash
# renders frames FROM0..END in 4 parallel chunks → out/<name>-part.mp4 (video only)
cd "$(dirname "$0")"; NAME=$1; F0=$2; F1=$3; export DSF=${4:-1} VW=1080 VH=1920 NODE_PATH=$(npm root -g)
mkdir -p out/chunks; C=$(( (F1 - F0 + 3) / 4 ))
for i in 0 1 2 3; do a=$((F0 + i*C)); b=$((F0 + (i+1)*C)); [ $b -gt $F1 ] && b=$F1; FROM=$a TO=$b node render.cjs case-video.html video out/chunks/$NAME-$i.mp4 30 > out/chunks/$NAME-$i.log 2>&1 & done; wait
for i in 0 1 2 3; do echo "file 'chunks/$NAME-$i.mp4'"; done > out/$NAME.txt
ffmpeg -loglevel error -y -f concat -safe 0 -i out/$NAME.txt -c copy out/$NAME-part.mp4 && echo done $NAME
