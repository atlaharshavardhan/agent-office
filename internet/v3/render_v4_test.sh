#!/bin/bash
# Half-size motion test of a V4 sequence, rendered in short saved stretches (long runs fill the disk). Usage: render_v4_test.sh <Composition> <frames>. Safe to re-run.
cd "$(dirname "$0")"; ID=$1; N=$2; C=../video/v4test; mkdir -p $C; rm -f $C/tmp-$ID-*; rm -rf snap4; mkdir snap4; cp -r src/* snap4/; : > $C/$ID.txt
for a in $(seq 0 60 $((N-1))); do b=$((a+59)); [ $b -ge $N ] && b=$((N-1)); g=$C/$ID-$a.mp4; echo "file '$ID-$a.mp4'" >> $C/$ID.txt
  npx remotion render snap4/index.ts $ID $C/tmp-$ID-$a.mp4 --frames=$a-$b --muted --codec=h264 --crf=20 --scale=0.5 --concurrency=3 --gl=swangle --timeout=300000 2>&1 | tail -1
  [ -f $C/tmp-$ID-$a.mp4 ] && mv $C/tmp-$ID-$a.mp4 "$g" || { echo "FAILED $a"; exit 1; }; done
ffmpeg -v error -y -f concat -safe 0 -i $C/$ID.txt -c copy ../video/v4-test-$ID.mp4 && echo TEST_OK
