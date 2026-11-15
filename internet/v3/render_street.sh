#!/bin/bash
# Renders the street scenes (IsoFull) in small pieces so progress is never lost, then joins them.
cd "$(dirname "$0")"
while pgrep -f "remotion render src/index.ts IsoCity" >/dev/null; do sleep 20; done
C=../video/chunks
for s in 0 250 500 750 1000; do
  e=$((s+249)); [ $e -gt 1244 ] && e=1244
  f=$C/street-$s.mp4
  [ -f "$f" ] && continue
  npx remotion render src/index.ts IsoFull $C/tmp-$s.mp4 --frames=$s-$e --muted --codec=h264 --crf=16 --concurrency=3 --gl=swangle 2>&1 | tail -1
  [ -f $C/tmp-$s.mp4 ] && mv $C/tmp-$s.mp4 "$f"
done
cd ../video
for s in 0 250 500 750 1000; do echo "file 'chunks/street-$s.mp4'"; done > chunks/list.txt
ffmpeg -v error -y -f concat -safe 0 -i chunks/list.txt -i ../v3/public/full-mix.wav -c:v copy -c:a aac -b:a 192k -shortest internet-iso-street-detail-v1.mp4 && echo STREET_OK
ffmpeg -v error -y -i internet-iso-street-detail-v1.mp4 -i internet-iso-step3-city-v2.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k internet-full-approved-v2.mp4 && echo FULL_OK
ls -la chunks internet-iso-street-detail-v1.mp4 internet-full-approved-v2.mp4
