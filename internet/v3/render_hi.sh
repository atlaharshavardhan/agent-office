#!/bin/bash
# Re-renders only the two street pieces that contain the first-person "Hi" shot, then re-joins the full video. Safe to re-run.
cd "$(dirname "$0")"
C=../video/chunks2
for s in 250 375; do f=$C/IsoFullHi-$s.mp4; [ -f "$f" ] && continue
  npx remotion render src/index.ts IsoFullHi $C/tmp-IsoFullHi-$s.mp4 --frames=$s-$((s+124)) --muted --codec=h264 --crf=16 --concurrency=4 --gl=swangle 2>&1 | tail -1
  [ -f $C/tmp-IsoFullHi-$s.mp4 ] && mv $C/tmp-IsoFullHi-$s.mp4 "$f"; done
for s in 0 125 250 375 500 625 750 875 1000 1125; do if [ $s = 250 ] || [ $s = 375 ]; then echo "file 'IsoFullHi-$s.mp4'"; else echo "file 'IsoFullCine-$s.mp4'"; fi; done > $C/IsoFullHi.txt
ffmpeg -v error -y -f concat -safe 0 -i $C/IsoFullHi.txt -i public/full-mix.wav -c:v copy -c:a aac -b:a 192k -shortest ../video/internet-iso-street-cine-v2.mp4 || exit 1
cd ../video
ffmpeg -v error -y -i internet-iso-street-cine-v2.mp4 -i internet-iso-step3-city-v3.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k internet-full-cine-v2.mp4 && echo FULL_OK
