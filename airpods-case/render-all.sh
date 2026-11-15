#!/bin/bash
# usage: render-all.sh <name> <DSF 1|2> [extra query]   → out/<name>.mp4 (video only), rendered as 4 parallel chunks
cd "$(dirname "$0")"; NAME=$1; export DSF=${2:-1} VW=1080 VH=1920 Q="$3" NODE_PATH=$(npm root -g)
mkdir -p out/chunks; N=$(python3 -c "import json,math;print(math.ceil(json.load(open('voice/timeline.json'))['B'][-1]*30))"); C=$(( (N + 3) / 4 ))
for i in 0 1 2 3; do FROM=$((i*C)) TO=$(( (i+1)*C )) node render.cjs case-video.html video out/chunks/$NAME-$i.mp4 30 > out/chunks/$NAME-$i.log 2>&1 & done; wait
for i in 0 1 2 3; do echo "file 'chunks/$NAME-$i.mp4'"; done > out/$NAME.txt
ffmpeg -loglevel error -y -f concat -safe 0 -i out/$NAME.txt -c copy out/$NAME.mp4 && echo done $NAME
rm -f ../phone-teardown/_local-case-video-*.html
