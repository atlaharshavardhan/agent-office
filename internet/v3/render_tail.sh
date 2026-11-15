#!/bin/bash
# Renders the second half (TailFilm) from the frozen copy in snap2/, then joins it with its sound. Safe to re-run.
# Each 114-frame piece is built from 19-frame sub-pieces that are saved as they finish, so a stopped run loses little.
cd "$(dirname "$0")"
C=../video/chunks3; mkdir -p $C; N=1026; rm -f $C/tmpT-*
starts=""; for s in $(seq 0 114 $((N-1))); do starts="$starts $s"; f=$C/Tail-$s.mp4; [ -f "$f" ] && continue
  ok=1; : > $C/sub-$s.txt
  for a in $(seq $s 19 $((s+113))); do b=$((a+18)); [ $b -ge $N ] && b=$((N-1)); [ $a -ge $N ] && continue; g=$C/Sub-$a.mp4; echo "file 'Sub-$a.mp4'" >> $C/sub-$s.txt
    if [ ! -f "$g" ]; then
      npx remotion render snap2/index.ts TailFilm $C/tmpT-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=16 --concurrency=4 --gl=swangle --timeout=300000 2>&1 | tail -2
      [ -f $C/tmpT-$a.mp4 ] && mv $C/tmpT-$a.mp4 "$g" || ok=0
    fi; done
  [ $ok = 1 ] && ffmpeg -v error -y -f concat -safe 0 -i $C/sub-$s.txt -c copy "$f"; done
for s in $starts; do [ -f $C/Tail-$s.mp4 ] || { echo "MISSING Tail-$s"; exit 1; }; echo "file 'Tail-$s.mp4'"; done > $C/Tail.txt
ffmpeg -v error -y -f concat -safe 0 -i $C/Tail.txt -i public/tail-mix.wav -c:v copy -c:a aac -b:a 192k -shortest ../video/internet-part2-v1.mp4 && echo TAIL_OK
