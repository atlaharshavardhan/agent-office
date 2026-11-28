#!/bin/bash
# FINAL Part 2 render (all locked design). Usage: ./render_final.sh LANE   (A, B or C). 30-frame pieces, one worker, glitch check + retry; re-running skips finished pieces.
cd "$(dirname "$0")"; C=../video/rf; mkdir -p $C
job() { ID=$1; A=$2; B=$3; OUT=$4; : > $C/$OUT.txt
  for a in $(seq $A 30 $B); do b=$((a+29)); [ $b -gt $B ] && b=$B; g=$C/$OUT-$a.mp4; echo "file '$OUT-$a.mp4'" >> $C/$OUT.txt; [ -f "$g" ] && continue
    for try in 1 2 3 4; do
      npx remotion render bundleF $ID $C/tmp-$OUT-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=1 --gl=swangle --timeout=300000 > /dev/null 2>&1
      [ -f $C/tmp-$OUT-$a.mp4 ] || continue
      python3 check_glitch.py $C/tmp-$OUT-$a.mp4 | grep -q "glitch_frames=0 " && break; echo "glitch in $OUT $a, try $try"; rm -f $C/tmp-$OUT-$a.mp4; done
    [ -f $C/tmp-$OUT-$a.mp4 ] && mv $C/tmp-$OUT-$a.mp4 "$g" && echo "ok $OUT $a" || { echo "FAILED $OUT $a"; exit 1; }; done
  rm -f $C/$OUT.mp4; ffmpeg -v error -y -f concat -safe 0 -i $C/$OUT.txt -c copy $C/$OUT.mp4; echo "DONE $OUT"; }
case $1 in
 A) job S1V 0 106 s1; job S2BV 0 58 b2; job S5V 0 57 s5; job S6V 0 70 s6; job PktStoryV 0 259 pa; job TowerShotV 0 189 tw1;;
 B) job RoutersV 0 359 rt; job ShoreV 0 284 sh; job SeabedV 0 293 sb; job SeabedRepeaterV 0 224 rp; job SeaCableV 0 449 cb;;
 D) job UndergroundV 0 269 ug; job GlobeRouteV 0 269 gl;;
 C) job GlobeCutV 0 359 gc; job TowerShotHerV 0 189 tw; job NotifHerV 0 89 nt; job ArriveRealV 0 419 ar; job EndHerV 0 134 en;;
esac
echo ALLDONE $1
