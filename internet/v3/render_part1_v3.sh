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
part IsoFullHi 0 249; part IsoFullHi 468 689; part Part1Fly 0 269; part CityAll 0 1229
# audio: street (41.5 s) + cities (13 s) + photo lesson, flight and end card (37 s)
ffmpeg -v error -y -i public/full-mix.wav -i public/city-mix.wav -i public/part1-mix.wav -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1,volume=3dB,alimiter=limit=0.89[a]" -map "[a]" $C/audio.wav || exit 1
# picture: new hook, kept pieces of the approved street scene (without the two explainers), new wire scene, cities + photo lesson, flight + end card
ffmpeg -v error -y -i $C/IsoFullHi-0-all.mp4 -i $K3/IsoFullV3-250.mp4 -i $K3/IsoFullV3-375.mp4 -i $C/IsoFullHi-468-all.mp4 -i $K2/IsoFullCine-625.mp4 -i $K3/IsoFullV3-750.mp4 -i $K3/IsoFullV3-875.mp4 -i $K3/IsoFullV3-1000.mp4 -i $K2/IsoFullCine-1125.mp4 -i $C/CityAll-0-all.mp4 -i $C/Part1Fly-0-all.mp4 -i $C/audio.wav \
  -filter_complex "[2:v]trim=end_frame=93,setpts=PTS-STARTPTS[c];[4:v]trim=start_frame=65,setpts=PTS-STARTPTS[e];[0:v][1:v][c][3:v][e][5:v][6:v][7:v][8:v][9:v][10:v]concat=n=11:v=1:a=0[v]" \
  -map "[v]" -map 11:a -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -movflags +faststart ../video/internet-part1-v3.mp4 && echo PART1V3_OK
