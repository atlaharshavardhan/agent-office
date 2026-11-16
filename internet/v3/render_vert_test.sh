#!/bin/bash
# Half-size vertical test renders of every new 3D scene for the Short, in short saved stretches. Re-running skips stretches already done; pass "fresh" to start again.
cd "$(dirname "$0")"; C=../video/vtest; mkdir -p $C; rm -f $C/tmp-*; [ "$1" = fresh ] && rm -f $C/*.mp4
rm -rf snap5; mkdir snap5; cp -r src/* snap5/
for pair in FlightV:510 LondonV4V:420 PacketBurstV:300 UndergroundV:270 RoutersV:360 ShoreV:285 SeabedV:294 SeabedRepeaterV:225 SeaCableV:450 PlanetV:360; do ID=${pair%%:*}; N=${pair##*:}; : > $C/$ID.txt
  for a in $(seq 0 60 $((N-1))); do b=$((a+59)); [ $b -ge $N ] && b=$((N-1)); g=$C/$ID-$a.mp4; echo "file '$ID-$a.mp4'" >> $C/$ID.txt; [ -f "$g" ] && continue
    npx remotion render snap5/index.ts $ID $C/tmp-$ID-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=20 --scale=0.5 --concurrency=3 --gl=swangle --timeout=300000 2>&1 | tail -1 | cut -c1-80
    [ -f $C/tmp-$ID-$a.mp4 ] && mv $C/tmp-$ID-$a.mp4 "$g" || { echo "FAILED $ID $a"; exit 1; }; done
  ffmpeg -v error -y -f concat -safe 0 -i $C/$ID.txt -c copy ../video/vtest-$ID.mp4 && echo "DONE $ID"; done
echo ALL_VERT_OK
