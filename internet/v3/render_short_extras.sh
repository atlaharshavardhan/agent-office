#!/bin/bash
# The Short's non-3D pieces: the V3 plane-and-globe shot, the end of the approved V3 ending (in small pieces, it is slow to draw) and the see-through captions layer.
cd "$(dirname "$0")"; C=../video/short; mkdir -p $C
for pair in ShortFly:132 ShortEndB:204; do ID=${pair%%:*}; N=${pair##*:}; : > $C/$ID.txt
for a in $(seq 0 20 $((N-1))); do b=$((a+19)); [ $b -ge $N ] && b=$((N-1)); g=$C/$ID-$a.mp4; echo "file '$ID-$a.mp4'" >> $C/$ID.txt; [ -f "$g" ] && continue
  npx remotion render src/index.ts $ID $C/tmpB-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=1 --timeout=300000 2>&1 | tail -1 | cut -c1-80; [ -f $C/tmpB-$a.mp4 ] && mv $C/tmpB-$a.mp4 "$g" || { echo "FAILED B $a"; exit 1; }; done
ffmpeg -v error -y -f concat -safe 0 -i $C/$ID.txt -c copy $C/$ID.mp4 && echo DONE $ID; done
rm -f $C/ShortOverlay.mov
npx remotion render src/index.ts ShortOverlay $C/ShortOverlay.mov --muted --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le --concurrency=1 --timeout=300000 2>&1 | tail -1 | cut -c1-80
[ -f $C/ShortOverlay.mov ] && echo EXTRAS_OK
