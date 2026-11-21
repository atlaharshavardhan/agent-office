#!/bin/bash
# Part 1 version 3 (21 Nov 2026): new hook line, LAN cable line, no fibre/router explainers, small iPhones, faster flight.
# Renders only what changed, in small saved pieces from a frozen copy (snap8) and a pre-built bundle, then joins everything.
# Re-running skips pieces already done; pass "fresh" to start again.
cd "$(dirname "$0")"; C=../video/part1v3; K3=../video/chunks3; K2=../video/chunks2; mkdir -p $C; rm -f $C/tmp-*
if [ "$1" = fresh ] || [ ! -d snap8 ]; then rm -f $C/*.mp4; rm -rf snap8 bundle8; mkdir snap8; cp -r src/* snap8/; fi
[ -d bundle8 ] || npx remotion bundle snap8/index.ts --out-dir=bundle8 > /dev/null 2>&1 || { echo BUNDLE_FAILED; exit 1; }
part() { ID=$1; A=$2; B=$3; : > $C/$ID-$A.txt
  for a in $(seq $A 30 $B); do b=$((a+29)); [ $b -gt $B ] && b=$B; g=$C/$ID-$a.mp4; echo "file '$ID-$a.mp4'" >> $C/$ID-$A.txt; [ -f "$g" ] && continue
    npx remotion render bundle8 $ID $C/tmp-$ID-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=4 --gl=swangle --timeout=300000 > /dev/null 2>&1
    [ -f $C/tmp-$ID-$a.mp4 ] && mv $C/tmp-$ID-$a.mp4 "$g" && echo "ok $ID $a" || { echo "FAILED $ID $a"; exit 1; }; done
  ffmpeg -v error -y -f concat -safe 0 -i $C/$ID-$A.txt -c copy $C/$ID-$A-all.mp4; }
part IsoFullHi 0 1244; part Part1Fly 0 227; part CityAll 0 1229
[ -f $C/mark.png ] || npx remotion still bundle8 MarkStrip $C/mark.png --image-format=png > /dev/null 2>&1
# audio: street (41.5 s) + cities (13 s) + photo lesson, flight and end card (35.6 s)
ffmpeg -v error -y -i public/full-mix.wav -i public/city-mix.wav -i public/part1-mix.wav -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1,volume=3dB,alimiter=limit=0.89[a]" -map "[a]" $C/audio.wav || exit 1
# the watermark: horizontal, see-through, moved to a free spot in each scene. Rows are "start-second x y" (top-left of the 420 x 64 strip).
MARKS="${MARKS:-0 330 1170|3.3 330 250|8.4 330 1170|15.6 330 250|17.9 330 1170|23 40 235|41.5 330 240|54.5 255 1180|82.5 330 250}"; END=86.5   # END: the end card has its own handle
X=""; Y=""; n=0; IFS='|' read -ra ROWS <<< "$MARKS"
for i in "${!ROWS[@]}"; do set -- ${ROWS[$i]}; nx=${ROWS[$((i+1))]}; e=$END; [ -n "$nx" ] && e=${nx%% *}; X="$X+$2*between(t,$1,$e-0.001)"; Y="$Y+$3*between(t,$1,$e-0.001)"; done
ffmpeg -v error -y -i $C/IsoFullHi-0-all.mp4 -i $C/CityAll-0-all.mp4 -i $C/Part1Fly-0-all.mp4 -loop 1 -i $C/mark.png -i $C/audio.wav \
  -filter_complex "[0:v][1:v][2:v]concat=n=3:v=1:a=0[b];[3:v]format=rgba,colorchannelmixer=aa=${MARK_ALPHA:-0.42}[m];[b][m]overlay=x='0$X':y='0$Y':enable='lt(t,$END)':shortest=1[v]" \
  -map "[v]" -map 4:a -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -movflags +faststart ../video/internet-part1-v3.mp4 && echo PART1V3_OK
