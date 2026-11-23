#!/bin/bash
# Part 1 in 16:9 (1920 x 1080), full screen: the same scenes drawn through WideWrap (see src/lib/wide.ts).
# Small saved pieces from a frozen copy (snap9) and a pre-built bundle; re-running skips finished pieces; "fresh" starts again.
cd "$(dirname "$0")"; C=../video/part1w; mkdir -p $C; rm -f $C/tmp-*
if [ "$1" = fresh ] || [ ! -d snap9 ]; then rm -f $C/*.mp4; rm -rf snap9 bundle9; mkdir snap9; cp -r src/* snap9/; fi
[ -d bundle9 ] || npx remotion bundle snap9/index.ts --out-dir=bundle9 > /dev/null 2>&1 || { echo BUNDLE_FAILED; exit 1; }
part() { ID=$1; A=$2; B=$3; : > $C/$ID-$A.txt
  for a in $(seq $A 30 $B); do b=$((a+29)); [ $b -gt $B ] && b=$B; g=$C/$ID-$a.mp4; echo "file '$ID-$a.mp4'" >> $C/$ID-$A.txt; [ -f "$g" ] && continue
    npx remotion render bundle9 $ID $C/tmp-$ID-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=4 --gl=swangle --timeout=300000 > /dev/null 2>&1
    [ -f $C/tmp-$ID-$a.mp4 ] && mv $C/tmp-$ID-$a.mp4 "$g" && echo "ok $ID $a" || { echo "FAILED $ID $a"; exit 1; }; done
  ffmpeg -v error -y -f concat -safe 0 -i $C/$ID-$A.txt -c copy $C/$ID-$A-all.mp4; }
part WFly 0 227; part WStreet 0 1244; part WCity 0 1229
[ -f $C/mark.png ] || npx remotion still bundle9 MarkStrip $C/mark.png --image-format=png > /dev/null 2>&1
ffmpeg -v error -y -i public/full-mix.wav -i public/city-mix.wav -i public/part1-mix.wav -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1,volume=3dB,alimiter=limit=0.89[a]" -map "[a]" $C/audio.wav || exit 1
# watermark: horizontal and see-through, in the top-left corner (the titles sit in the middle, so that corner is always free); not on the end card
ffmpeg -v error -y -i $C/WStreet-0-all.mp4 -i $C/WCity-0-all.mp4 -i $C/WFly-0-all.mp4 -loop 1 -framerate 30 -t 91 -i $C/mark.png -i $C/audio.wav \
  -filter_complex "[0:v][1:v][2:v]concat=n=3:v=1:a=0[b];[3:v]format=rgba,colorchannelmixer=aa=${MARK_ALPHA:-0.42}[m];[b][m]overlay=x=${MARK_X:-36}:y=${MARK_Y:-30}:enable='lt(t,86.5)'[v]" \
  -map "[v]" -map 4:a -t 90.1 -c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -movflags +faststart ../video/internet-part1-wide-v1.mp4 && echo PART1WIDE_OK
