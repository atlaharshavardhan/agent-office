#!/bin/bash
# Renders the last cities piece (frames 260-389) in short saved sub-pieces, because long runs fill the disk with Chrome's temporary memory files. Safe to re-run.
cd "$(dirname "$0")"; C=../video/chunks3; [ -f $C/IsoCity2-260.mp4 ] && { echo CITY_OK; exit; }
: > $C/c260.txt
for a in $(seq 260 16 389); do b=$((a+15)); [ $b -gt 389 ] && b=389; g=$C/CSub-$a.mp4; echo "file 'CSub-$a.mp4'" >> $C/c260.txt; [ -f "$g" ] && continue
  while [ $(df -m / | tail -1 | awk '{print $4}') -lt 8000 ]; do sleep 30; done
  npx remotion render snap/index.ts IsoCity2 $C/tmpC-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=2 --gl=swangle --timeout=300000 2>&1 | tail -1
  [ -f $C/tmpC-$a.mp4 ] && mv $C/tmpC-$a.mp4 "$g" || { echo "FAILED $a"; exit 1; }; done
ffmpeg -v error -y -f concat -safe 0 -i $C/c260.txt -c copy $C/IsoCity2-260.mp4 && echo CITY_OK
