#!/bin/bash
# Part 1 version 6 (vertical): Liam's voice, new approved hook, the 2.5 s gap after the hook cut out (87.6 s total).
# Only the first 177 frames (the new hook captions) are rendered again; everything else reuses the version 3 pieces in ../video/part1v3.
cd "$(dirname "$0")"; C=../video/part1v6; P=../video/part1v3; mkdir -p $C; rm -f $C/tmp-*
if [ "$1" = fresh ] || [ ! -d snap10 ]; then rm -f $C/*.mp4; rm -rf snap10 bundle10; mkdir snap10; cp -r src/* snap10/; fi
[ -f bundle10/index.html ] || { rm -rf bundle10; npx remotion bundle snap10/index.ts --out-dir=bundle10 > /dev/null 2>&1; } || { echo BUNDLE_FAILED; exit 1; }
: > $C/hook.txt
for a in 0 30 60 90 120 150; do b=$((a+29)); [ $b -gt 176 ] && b=176; g=$C/Hook-$a.mp4; echo "file 'Hook-$a.mp4'" >> $C/hook.txt; [ -f "$g" ] && continue
  npx remotion render bundle10 IsoFullHi $C/tmp-Hook-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=4 --gl=swangle --timeout=300000 > /dev/null 2>&1
  [ -f $C/tmp-Hook-$a.mp4 ] && mv $C/tmp-Hook-$a.mp4 "$g" && echo "ok Hook $a" || { echo "FAILED Hook $a"; exit 1; }; done
ffmpeg -v error -y -f concat -safe 0 -i $C/hook.txt -c copy $C/hook-all.mp4 || exit 1
ffmpeg -v error -y -i public/full-mix.wav -i public/city-mix.wav -i public/part1-mix.wav -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1,volume=3dB,alimiter=limit=0.89[a]" -map "[a]" $C/audio.wav || exit 1
MARKS="${MARKS:-0 330 1170|3.3 330 250|5.9 330 1170|13.1 330 250|15.4 330 1170|20.5 40 235|39 330 240|52 255 1180|80 330 250}"; END=84.0
X=""; Y=""; IFS='|' read -ra ROWS <<< "$MARKS"
for i in "${!ROWS[@]}"; do set -- ${ROWS[$i]}; nx=${ROWS[$((i+1))]}; e=$END; [ -n "$nx" ] && e=${nx%% *}; X="$X+$2*between(t,$1,$e-0.001)"; Y="$Y+$3*between(t,$1,$e-0.001)"; done
ffmpeg -v error -y -i $C/hook-all.mp4 -i $P/IsoFullHi-0-all.mp4 -i $P/CityAll-0-all.mp4 -i $P/Part1Fly-0-all.mp4 -loop 1 -framerate 30 -t 90 -i $P/mark.png -i $C/audio.wav \
  -filter_complex "[1:v]trim=start_frame=252,setpts=PTS-STARTPTS[s];[0:v][s][2:v][3:v]concat=n=4:v=1:a=0[b];[4:v]format=rgba,colorchannelmixer=aa=${MARK_ALPHA:-0.42}[m];[b][m]overlay=x='0$X':y='0$Y':enable='lt(t,$END)'[v]" \
  -map "[v]" -map 5:a -t 87.6 -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -movflags +faststart ../video/internet-part1-v6.mp4 && echo PART1V6_OK
