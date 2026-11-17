#!/bin/bash
# Part 1's new end: the photo lesson on the city map and the closing plane/globe/end-card shot, in small saved pieces (these scenes are slow to draw).
# Then joins Part 1: approved street + cities, the photo lesson, the closing shot. Re-running skips pieces already done; pass "fresh" to start again.
cd "$(dirname "$0")"; C=../video/part1; mkdir -p $C; rm -f $C/tmp-*
if [ "$1" = fresh ] || [ ! -d snap7 ]; then rm -f $C/*.mp4; rm -rf snap7; mkdir snap7; cp -r src/* snap7/; fi
for pair in IsoCityPhoto:840 Part1Fly:321; do ID=${pair%%:*}; N=${pair##*:}; : > $C/$ID.txt
  for a in $(seq 0 20 $((N-1))); do b=$((a+19)); [ $b -ge $N ] && b=$((N-1)); g=$C/$ID-$a.mp4; echo "file '$ID-$a.mp4'" >> $C/$ID.txt; [ -f "$g" ] && continue
    npx remotion render snap7/index.ts $ID $C/tmp-$ID-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=3 --gl=swangle --timeout=300000 2>&1 | tail -1 | cut -c1-80
    [ -f $C/tmp-$ID-$a.mp4 ] && mv $C/tmp-$ID-$a.mp4 "$g" || { echo "FAILED $ID $a"; exit 1; }; done
  ffmpeg -v error -y -f concat -safe 0 -i $C/$ID.txt -c copy $C/$ID.mp4 && echo "DONE $ID"; done
printf "file 'IsoCityPhoto.mp4'\nfile 'Part1Fly.mp4'\n" > $C/new.txt
ffmpeg -v error -y -f concat -safe 0 -i $C/new.txt -i public/part1-mix.wav -c:v copy -c:a aac -b:a 192k -shortest $C/new.mp4 || exit 1
ffmpeg -v error -y -i ../video/chunks3/street.mp4 -i ../video/chunks3/city.mp4 -i $C/new.mp4 -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 21 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart ../video/internet-part1-v1.mp4 && echo PART1_OK
