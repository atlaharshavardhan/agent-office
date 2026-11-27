#!/bin/bash
# Part 2 (vertical 9:16 only): re-render the four changed scenes as full clips, in small saved pieces from a frozen copy.
# Re-running skips finished pieces. Usage: timeout 28m ./render_part2_clips.sh   (add "fresh" to start again)
cd "$(dirname "$0")"; C=../part2/clips-v2; mkdir -p $C; rm -f $C/tmp-*
if [ "$1" = fresh ] || [ ! -d snapP2 ]; then rm -f $C/*.mp4; rm -rf snapP2 bundleP2; mkdir snapP2; cp -r src/* snapP2/; fi
[ -f bundleP2/index.html ] || { rm -rf bundleP2; npx remotion bundle snapP2/index.ts --out-dir=bundleP2 > /dev/null 2>&1; } || { echo BUNDLE_FAILED; exit 1; }
part() { ID=$1; N=$2; OUT=$3; : > $C/$ID.txt
  for a in $(seq 0 30 $((N-1))); do b=$((a+29)); [ $b -ge $N ] && b=$((N-1)); g=$C/$ID-$a.mp4; echo "file '$ID-$a.mp4'" >> $C/$ID.txt; [ -f "$g" ] && continue
    npx remotion render bundleP2 $ID $C/tmp-$ID-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=4 --gl=swangle --timeout=300000 > /dev/null 2>&1
    [ -f $C/tmp-$ID-$a.mp4 ] && mv $C/tmp-$ID-$a.mp4 "$g" && echo "ok $ID $a" || { echo "FAILED $ID $a"; exit 1; }; done
  ffmpeg -v error -y -f concat -safe 0 -i $C/$ID.txt -c copy $C/$OUT && echo "DONE $OUT"; }
part PacketBurstV 300 02-PacketBurstV.mp4
part RoutersV 360 04-RoutersV.mp4
part ShoreV 285 05-ShoreV.mp4
part PlanetV 360 09-PlanetV.mp4
