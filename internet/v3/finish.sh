#!/bin/bash
# Joins the three rendered parts (street, cities, second half) into the complete film. Run after render_v3.sh and render_tail.sh.
cd "$(dirname "$0")"; C=../video/chunks3
for s in 0 125 250 375 500 625 750 875 1000 1125; do echo "file 'IsoFullV3-$s.mp4'"; done > $C/street.txt
for s in 0 130 260; do echo "file 'IsoCity2-$s.mp4'"; done > $C/city.txt
ffmpeg -v error -y -f concat -safe 0 -i $C/street.txt -i public/full-mix.wav -c:v copy -c:a aac -b:a 192k -shortest $C/street.mp4 || exit 1
ffmpeg -v error -y -f concat -safe 0 -i $C/city.txt -i public/city-mix.wav -c:v copy -c:a aac -b:a 192k -shortest $C/city.mp4 || exit 1
ffmpeg -v error -y -i $C/street.mp4 -i $C/city.mp4 -i ../video/internet-part2-v1.mp4 -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart ../video/internet-full-film-v3.mp4 && echo FILM_OK
