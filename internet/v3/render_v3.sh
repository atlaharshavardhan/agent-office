#!/bin/bash
# Final-cut render of the street part (IsoFullV3) and the cities part, in saved pieces. Renders from the frozen copy in snap/. Safe to re-run.
cd "$(dirname "$0")"
C=../video/chunks3; mkdir -p $C; rm -f $C/tmp-*
piece() { f=$C/$1-$2.mp4; [ -f "$f" ] && return
  npx remotion render snap/index.ts $1 $C/tmp-$1-$2.mp4 --frames=$2-$3 --muted --codec=h264 --crf=16 --concurrency=4 --gl=swangle --timeout=300000 2>&1 | tail -3
  [ -f $C/tmp-$1-$2.mp4 ] && mv $C/tmp-$1-$2.mp4 "$f"; }
for s in 0 125 250 375 500 625 750 875 1000 1125; do e=$((s+124)); [ $e -gt 1244 ] && e=1244; piece IsoFullV3 $s $e; done
for s in 0 130 260; do piece IsoCity2 $s $((s+129)); done
echo PIECES_DONE
