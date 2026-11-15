#!/bin/bash
# Renders the second half (TailFilm) in saved pieces from the frozen copy in snap2/, then joins it with its sound. Safe to re-run.
cd "$(dirname "$0")"
C=../video/chunks3; mkdir -p $C; N=1026
starts=""; for s in $(seq 0 114 $((N-1))); do starts="$starts $s"; e=$((s+113)); [ $e -ge $N ] && e=$((N-1)); f=$C/Tail-$s.mp4; [ -f "$f" ] && continue
  npx remotion render snap2/index.ts TailFilm $C/tmpT-$s.mp4 --frames=$s-$e --muted --codec=h264 --crf=16 --concurrency=4 --gl=swangle 2>&1 | tail -1
  [ -f $C/tmpT-$s.mp4 ] && mv $C/tmpT-$s.mp4 "$f"; done
for s in $starts; do echo "file 'Tail-$s.mp4'"; done > $C/Tail.txt
ffmpeg -v error -y -f concat -safe 0 -i $C/Tail.txt -i public/tail-mix.wav -c:v copy -c:a aac -b:a 192k -shortest ../video/internet-part2-v1.mp4 && echo TAIL_OK
