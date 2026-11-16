#!/bin/bash
# The Short's non-3D pieces: the end of the approved V3 ending (in small pieces, it is slow to draw) and the see-through captions layer.
cd "$(dirname "$0")"; C=../video/short; mkdir -p $C; : > $C/ShortEndB.txt
for a in $(seq 0 20 203); do b=$((a+19)); [ $b -ge 204 ] && b=203; g=$C/ShortEndB-$a.mp4; echo "file 'ShortEndB-$a.mp4'" >> $C/ShortEndB.txt; [ -f "$g" ] && continue
  npx remotion render src/index.ts ShortEndB $C/tmpB-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=1 --timeout=300000 2>&1 | tail -1 | cut -c1-80; [ -f $C/tmpB-$a.mp4 ] && mv $C/tmpB-$a.mp4 "$g" || { echo "FAILED B $a"; exit 1; }; done
ffmpeg -v error -y -f concat -safe 0 -i $C/ShortEndB.txt -c copy $C/ShortEndB.mp4 && echo DONE_B
npx remotion render src/index.ts ShortOverlay $C/ShortOverlay.mov --muted --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le --concurrency=1 --timeout=300000 2>&1 | tail -1 | cut -c1-80
[ -f $C/ShortOverlay.mov ] && echo EXTRAS_OK
