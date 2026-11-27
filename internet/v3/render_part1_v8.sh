#!/bin/bash
# Part 1 version 8 (vertical): the "focus on what is being explained" cut. Liam's voice, approved hook and simpler wording,
# close two-person hook, camera that follows each beat, small phones beside the person, visible router, balanced captions,
# watermark in one fixed spot. Everything is rendered again from a frozen copy (snap12) in small saved pieces.
# NOT TO BE RUN until Harsh says "render". Re-running skips finished pieces; "fresh" starts again.
cd "$(dirname "$0")"; C=../video/part1v8; mkdir -p $C; rm -f $C/tmp-*
if [ "$1" = fresh ] || [ ! -d snap12 ]; then rm -f $C/*.mp4; rm -rf snap12 bundle12; mkdir snap12; cp -r src/* snap12/; fi
[ -f bundle12/index.html ] || { rm -rf bundle12; npx remotion bundle snap12/index.ts --out-dir=bundle12 > /dev/null 2>&1; } || { echo BUNDLE_FAILED; exit 1; }
part() { ID=$1; A=$2; B=$3; : > $C/$ID-$A.txt
  for a in $(seq $A 30 $B); do b=$((a+29)); [ $b -gt $B ] && b=$B; g=$C/$ID-$a.mp4; echo "file '$ID-$a.mp4'" >> $C/$ID-$A.txt; [ -f "$g" ] && continue
    npx remotion render bundle12 $ID $C/tmp-$ID-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=4 --gl=swangle --timeout=300000 > /dev/null 2>&1
    [ -f $C/tmp-$ID-$a.mp4 ] && mv $C/tmp-$ID-$a.mp4 "$g" && echo "ok $ID $a" || { echo "FAILED $ID $a"; exit 1; }; done
  ffmpeg -v error -y -f concat -safe 0 -i $C/$ID-$A.txt -c copy $C/$ID-$A-all.mp4; }
# the hook up to 5.9 s (frame 176); then the first-person shot (frame 252) on, with two cuts: the 2.5 s gap after the hook, and the third house move (frames 832 to 888)
part IsoFullHi 0 176; part IsoFullHi 252 831; part IsoFullHi 889 1244; part Part1Fly 0 227; part CityAll 0 1229
[ -f $C/mark.png ] || npx remotion still bundle12 MarkStrip $C/mark.png --image-format=png > /dev/null 2>&1
ffmpeg -v error -y -i public/full-mix.wav -i public/city-mix.wav -i public/part1-mix.wav -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1,volume=3dB,alimiter=limit=0.89[a]" -map "[a]" $C/audio.wav || exit 1
ffmpeg -v error -y -i $C/IsoFullHi-0-all.mp4 -i $C/IsoFullHi-252-all.mp4 -i $C/IsoFullHi-889-all.mp4 -i $C/CityAll-0-all.mp4 -i $C/Part1Fly-0-all.mp4 -loop 1 -framerate 30 -t 90 -i $C/mark.png -i $C/audio.wav \
  -filter_complex "[0:v][1:v][2:v][3:v][4:v]concat=n=5:v=1:a=0[b];[5:v]format=rgba,colorchannelmixer=aa=${MARK_ALPHA:-0.3}[m];[b][m]overlay=x=${MARK_X:-24}:y=${MARK_Y:-926}:enable='lt(t,82.1)'[v0];[v0]setpts=PTS/${SPEED:-1.06}[v]" \
  -map "[v]" -map 6:a -af atempo=${SPEED:-1.06} -t $(python3 -c "print(round(85.7/${SPEED:-1.06}, 2))") -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -movflags +faststart ${OUT:-../video/internet-part1-v8.mp4} && echo PART1V8_OK
