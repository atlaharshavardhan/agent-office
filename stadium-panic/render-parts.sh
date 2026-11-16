#!/bin/bash
# usage: render-parts.sh <out dir> <parts> [DSF]  — render stadium.html (45 s × 30 fps) in N parallel frame ranges, then join into <out dir>/video.mp4 (silent)
cd "$(dirname "$0")"; OUT=$1; P=${2:-4}; export DSF=${3:-1}; mkdir -p "$OUT"; N=1350
for i in $(seq 0 $((P-1))); do
  FROM=$((N*i/P)) TO=$((N*(i+1)/P)) VW=1080 VH=1920 node render.cjs "$PWD/stadium.html" video "$OUT/part$i.mp4" 30 > "$OUT/log$i.txt" 2>&1 &
done; wait
for i in $(seq 0 $((P-1))); do echo "file 'part$i.mp4'"; done > "$OUT/list.txt"
ffmpeg -loglevel error -y -f concat -safe 0 -i "$OUT/list.txt" -c copy "$OUT/video.mp4" && echo "done $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/video.mp4")"
