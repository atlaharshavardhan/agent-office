#!/bin/bash
# FINAL Part 2 render (all locked design). Usage: ./render_final.sh LANE   (A, B or C). 30-frame pieces, one worker, glitch check + retry; re-running skips finished pieces.
cd "$(dirname "$0")"; C=../video/rf6; mkdir -p $C
job() { ID=$1; A=$2; B=$3; OUT=$4; : > $C/$OUT.txt
  for a in $(seq $A 30 $B); do b=$((a+29)); [ $b -gt $B ] && b=$B; g=$C/$OUT-$a.mp4; echo "file '$OUT-$a.mp4'" >> $C/$OUT.txt; [ -f "$g" ] && continue
    for try in 1 2 3 4; do
      npx remotion render bundleN $ID $C/tmp-$OUT-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=1 --gl=swangle --timeout=300000 > /dev/null 2>&1
      [ -f $C/tmp-$OUT-$a.mp4 ] || continue
      python3 check_glitch.py $C/tmp-$OUT-$a.mp4 | grep -q "glitch_frames=0 " && break; echo "glitch in $OUT $a, try $try"; rm -f $C/tmp-$OUT-$a.mp4; done
    [ -f $C/tmp-$OUT-$a.mp4 ] && mv $C/tmp-$OUT-$a.mp4 "$g" && echo "ok $OUT $a" || { echo "FAILED $OUT $a"; exit 1; }; done
  rm -f $C/$OUT.mp4; ffmpeg -v error -y -f concat -safe 0 -i $C/$OUT.txt -c copy $C/$OUT.mp4; echo "DONE $OUT"; }
case $1 in
 A) job SeaCableV 6 449 cb; job ArriveRealV 0 399 ar; job S6V 0 71 s6;;
 B) job RoutersV 0 359 rt; job GlobeCutV 0 329 gc; job S1V 4 105 s1; job S2BV 0 58 b2; job S5V 0 57 s5;;
 C) job PktStoryV 78 259 pa; job UndergroundV 18 261 ug; job TowerShotV 0 152 tw1; job TowerShotHerV 0 105 tw; job NotifHerV 9 59 nt;;
 D) job PhotoShatterV 0 119 pb; job HookTravelV 0 224 gt; job ShoreV 24 261 sh; job SeabedBareV 90 216 sbb; job SeabedRepeaterV 0 224 rp;;
esac
echo ALLDONE $1
