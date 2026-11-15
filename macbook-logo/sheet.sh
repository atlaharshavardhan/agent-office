#!/bin/bash
# usage: sheet.sh <out dir> <sheet.jpg> t1 t2 ...  — render stills at the given times and lay them side by side
cd "$(dirname "$0")"; OUT=$1; SHEET=$2; shift 2
python3 build-video.py >/dev/null && VW=1080 VH=1920 node render.cjs "$PWD/logo-video.html" stills "$OUT" 30 "$@" | grep -v "^total"
args=(); f=""; i=0; for t in "$@"; do p=$(printf "%s/t%05.2f.jpg" "$OUT" "$t"); args+=(-i "$p"); f+="[$i]scale=432:768[s$i];"; i=$((i+1)); done
for j in $(seq 0 $((i-1))); do f+="[s$j]"; done
ffmpeg -loglevel error -y "${args[@]}" -filter_complex "${f}hstack=inputs=$i" "$SHEET"
