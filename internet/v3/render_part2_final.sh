#!/bin/bash
# Part 2 final cut (vertical 9:16 only), result-first order. Renders the needed frame ranges in 30-frame pieces from a frozen copy of src,
# one worker (concurrency 1), checks every piece for dropped frames (check_glitch.py) and renders it again if one is found. Re-running skips finished pieces.
# Usage: timeout 28m ./render_part2_final.sh   ("fresh" starts again)
cd "$(dirname "$0")"; C=../video/part2v1; mkdir -p $C; rm -f $C/tmp-*
if [ "$1" = fresh ] || [ ! -d snapFinal ]; then rm -f $C/*.mp4; rm -rf snapFinal bundleFinal; mkdir snapFinal; cp -r src/* snapFinal/; fi
[ -f bundleFinal/index.html ] || { rm -rf bundleFinal; npx remotion bundle snapFinal/index.ts --out-dir=bundleFinal > /dev/null 2>&1; } || { echo BUNDLE_FAILED; exit 1; }
job() { ID=$1; A=$2; B=$3; OUT=$4; : > $C/$OUT.txt
  for a in $(seq $A 30 $B); do b=$((a+29)); [ $b -gt $B ] && b=$B; g=$C/$OUT-$a.mp4; echo "file '$OUT-$a.mp4'" >> $C/$OUT.txt; [ -f "$g" ] && continue
    for try in 1 2 3 4; do
      npx remotion render bundleFinal $ID $C/tmp-$OUT-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=1 --gl=swangle --timeout=300000 > /dev/null 2>&1
      [ -f $C/tmp-$OUT-$a.mp4 ] || continue
      python3 check_glitch.py $C/tmp-$OUT-$a.mp4 | grep -q "glitch_frames=0 " && break; echo "glitch in $OUT $a, try $try"; rm -f $C/tmp-$OUT-$a.mp4; done
    [ -f $C/tmp-$OUT-$a.mp4 ] && mv $C/tmp-$OUT-$a.mp4 "$g" && echo "ok $OUT $a" || { echo "FAILED $OUT $a"; exit 1; }; done
  [ -f $C/$OUT.mp4 ] || ffmpeg -v error -y -f concat -safe 0 -i $C/$OUT.txt -c copy $C/$OUT.mp4; echo "DONE $OUT"; }
job HydRoomV 27 140 hyd
job LondonRoomV 0 131 lon
job HookGlobeV 0 71 hook
job PacketBurstV 0 149 pk
job RoutersV 30 149 rt
job SeabedMsV 0 89 sb
job RepeaterMsV 0 71 rp
job PlanetMsV 90 221 pl
job NotifV 0 89 nt
job EndCardP2 0 107 ec
echo ALLDONE
