#!/bin/bash
# Renders step 3 (cities) and then the street scenes in small pieces, so progress is never lost. Safe to re-run.
cd "$(dirname "$0")"
C=../video/chunks2; mkdir -p $C
piece() { # comp start end
  f=$C/$1-$2.mp4; [ -f "$f" ] && return
  npx remotion render src/index.ts $1 $C/tmp-$1-$2.mp4 --frames=$2-$3 --muted --codec=h264 --crf=16 --concurrency=4 --gl=swangle 2>&1 | tail -1
  [ -f $C/tmp-$1-$2.mp4 ] && mv $C/tmp-$1-$2.mp4 "$f"
}
join() { # comp audio out starts...
  comp=$1; aud=$2; out=$3; shift 3
  for s in "$@"; do echo "file '$comp-$s.mp4'"; done > $C/$comp.txt
  ffmpeg -v error -y -f concat -safe 0 -i $C/$comp.txt -i public/$aud -c:v copy -c:a aac -b:a 192k -shortest ../video/$out && echo "$out OK"
}
for s in 0 125 250 375 500 625 750 875 1000 1125; do e=$((s+124)); [ $e -gt 1244 ] && e=1244; piece IsoFullCine $s $e; done
join IsoFullCine full-mix.wav internet-iso-street-cine-v1.mp4 0 125 250 375 500 625 750 875 1000 1125
for s in 0 130 260; do piece IsoCity2 $s $((s+129)); done
join IsoCity2 city-mix.wav internet-iso-step3-city-v3.mp4 0 130 260
cd ../video
ffmpeg -v error -y -i internet-iso-street-cine-v1.mp4 -i internet-iso-step3-city-v3.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k internet-full-cine-v1.mp4 && echo FULL_OK
