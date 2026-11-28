#!/bin/bash
# Part 2 HOOK, final 12 s plan (9:16): Hyderabad tap + window break (carpet photo) | globe pins | light cable 1.5 s | globe + satellite question | London buzz | notification.
# One worker, 30-frame pieces, glitch check and retry. Re-running skips finished pieces.
cd "$(dirname "$0")"; C=../video/part2hook12c; mkdir -p $C
job() { ID=$1; A=$2; B=$3; OUT=$4; : > $C/$OUT.txt
  for a in $(seq $A 30 $B); do b=$((a+29)); [ $b -gt $B ] && b=$B; g=$C/$OUT-$a.mp4; echo "file '$OUT-$a.mp4'" >> $C/$OUT.txt; [ -f "$g" ] && continue
    for try in 1 2 3 4; do
      npx remotion render bundleH12b $ID $C/tmp-$OUT-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=1 --gl=swangle --timeout=300000 > /dev/null 2>&1
      [ -f $C/tmp-$OUT-$a.mp4 ] || continue
      python3 check_glitch.py $C/tmp-$OUT-$a.mp4 | grep -q "glitch_frames=0 " && break; echo "glitch in $OUT $a, try $try"; rm -f $C/tmp-$OUT-$a.mp4; done
    [ -f $C/tmp-$OUT-$a.mp4 ] && mv $C/tmp-$OUT-$a.mp4 "$g" && echo "ok $OUT $a" || { echo "FAILED $OUT $a"; exit 1; }; done
  [ -f $C/$OUT.mp4 ] || ffmpeg -v error -y -f concat -safe 0 -i $C/$OUT.txt -c copy $C/$OUT.mp4; echo "DONE $OUT"; }
job HydRoomV 0 65 hyd
job FlyGlobeV 0 35 ga
job SeabedLight12V 85 129 sl
job GlobeSatV 0 59 gs
job LondonRoomV 10 78 lon
job NotifV 0 83 nt
echo ALLDONE
