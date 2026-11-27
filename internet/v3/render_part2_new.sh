#!/bin/bash
# Part 2 (vertical 9:16): the two new scenes, step 8 (photo arrives on Arjun phone) and step 9 (end card).
# Re-running skips finished pieces. Usage: timeout 28m ./render_part2_clips.sh   (add "fresh" to start again)
cd "$(dirname "$0")"; C=../part2/clips-v2; mkdir -p $C; rm -f $C/tmp-*
if [ "$1" = fresh ] || [ ! -d snapP2b ]; then rm -rf snapP2b bundleP2b; mkdir snapP2b; cp -r src/* snapP2b/; fi
[ -f bundleP2b/index.html ] || { rm -rf bundleP2b; npx remotion bundle snapP2b/index.ts --out-dir=bundleP2b > /dev/null 2>&1; } || { echo BUNDLE_FAILED; exit 1; }
part() { ID=$1; N=$2; OUT=$3; : > $C/$ID.txt
  for a in $(seq 0 30 $((N-1))); do b=$((a+29)); [ $b -ge $N ] && b=$((N-1)); g=$C/$ID-$a.mp4; echo "file '$ID-$a.mp4'" >> $C/$ID.txt; [ -f "$g" ] && continue
    npx remotion render bundleP2b $ID $C/tmp-$ID-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=4 --gl=swangle --timeout=300000 > /dev/null 2>&1
    [ -f $C/tmp-$ID-$a.mp4 ] && mv $C/tmp-$ID-$a.mp4 "$g" && echo "ok $ID $a" || { echo "FAILED $ID $a"; exit 1; }; done
  ffmpeg -v error -y -f concat -safe 0 -i $C/$ID.txt -c copy $C/$OUT && echo "DONE $OUT"; }
part ArriveV 180 10-ArriveV.mp4
part EndCardP2 108 11-EndCardV.mp4
