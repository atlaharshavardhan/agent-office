#!/bin/bash
# Part 1 version 7 (vertical): version 6 (Liam, new hook, 87.6 s) plus the simpler wording Harsh approved on 26 Nov 2026
# ("wire" instead of "LAN cable", and eight other lines). Captions are part of the picture, so the seconds with changed lines are
# rendered again from a frozen copy (snap11); everything else reuses saved pieces from versions 3 and 6.
cd "$(dirname "$0")"; C=../video/part1v7; P=../video/part1v3; H=../video/part1v6; mkdir -p $C; rm -f $C/tmp-*
if [ "$1" = fresh ] || [ ! -d snap11 ]; then rm -f $C/*.mp4; rm -rf snap11 bundle11; mkdir snap11; cp -r src/* snap11/; fi
[ -f bundle11/index.html ] || { rm -rf bundle11; npx remotion bundle snap11/index.ts --out-dir=bundle11 > /dev/null 2>&1; } || { echo BUNDLE_FAILED; exit 1; }
part() { ID=$1; A=$2; B=$3; : > $C/$ID-$A.txt
  for a in $(seq $A 30 $B); do b=$((a+29)); [ $b -gt $B ] && b=$B; g=$C/$ID-$a.mp4; echo "file '$ID-$a.mp4'" >> $C/$ID-$A.txt; [ -f "$g" ] && continue
    npx remotion render bundle11 $ID $C/tmp-$ID-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=4 --gl=swangle --timeout=300000 > /dev/null 2>&1
    [ -f $C/tmp-$ID-$a.mp4 ] && mv $C/tmp-$ID-$a.mp4 "$g" && echo "ok $ID $a" || { echo "FAILED $ID $a"; exit 1; }; done
  ffmpeg -v error -y -f concat -safe 0 -i $C/$ID-$A.txt -c copy $C/$ID-$A-all.mp4; }
part IsoFullHi 468 537; part IsoFullHi 891 942; part IsoFullHi 1173 1244; part CityAll 462 1071
ffmpeg -v error -y -i public/full-mix.wav -i public/city-mix.wav -i public/part1-mix.wav -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1,volume=3dB,alimiter=limit=0.89[a]" -map "[a]" $C/audio.wav || exit 1
MARKS="${MARKS:-0 330 1170|3.3 330 250|5.9 330 1170|13.1 330 250|15.4 330 1170|20.5 40 235|39 330 240|52 255 1180|80 330 250}"; END=84.0
X=""; Y=""; IFS='|' read -ra ROWS <<< "$MARKS"
for i in "${!ROWS[@]}"; do set -- ${ROWS[$i]}; nx=${ROWS[$((i+1))]}; e=$END; [ -n "$nx" ] && e=${nx%% *}; X="$X+$2*between(t,$1,$e-0.001)"; Y="$Y+$3*between(t,$1,$e-0.001)"; done
T="setpts=PTS-STARTPTS"
ffmpeg -v error -y -i $H/hook-all.mp4 -i $P/IsoFullHi-0-all.mp4 -i $C/IsoFullHi-468-all.mp4 -i $C/IsoFullHi-891-all.mp4 -i $C/IsoFullHi-1173-all.mp4 -i $P/CityAll-0-all.mp4 -i $C/CityAll-462-all.mp4 -i $P/Part1Fly-0-all.mp4 -loop 1 -framerate 30 -t 90 -i $P/mark.png -i $C/audio.wav \
  -filter_complex "[1:v]split=3[o1][o2][o3];[o1]trim=start_frame=252:end_frame=468,$T[a];[o2]trim=start_frame=538:end_frame=891,$T[b];[o3]trim=start_frame=943:end_frame=1173,$T[c];[5:v]split=2[c1][c2];[c1]trim=end_frame=462,$T[d];[c2]trim=start_frame=1072,$T[e];[0:v][a][2:v][b][3:v][c][4:v][d][6:v][e][7:v]concat=n=11:v=1:a=0[bb];[8:v]format=rgba,colorchannelmixer=aa=${MARK_ALPHA:-0.42}[m];[bb][m]overlay=x='0$X':y='0$Y':enable='lt(t,$END)'[v]" \
  -map "[v]" -map 9:a -t 87.6 -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -movflags +faststart ../video/internet-part1-v7.mp4 && echo PART1V7_OK
