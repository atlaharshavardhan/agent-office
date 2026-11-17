#!/bin/bash
# Joins the Short: the approved V3 opening (street + cities) and the new 3D part, cut to short-plan.json, with captions, watermark and sound.
# Needs: render_short.sh finished, ShortEndA/ShortEndB/ShortOverlay rendered into ../video/short, audio/make_short_mix.py run. Pass a clips folder and scale to make a draft.
cd "$(dirname "$0")"; C=${1:-../video/short}; O=../video/short; OUT=${2:-../video/internet-short-v4.mp4}
python3 - "$C" "$O" <<'P' || exit 1
import json, subprocess, sys
C, O = sys.argv[1], sys.argv[2]; plan = json.load(open('src/v4/short-plan.json')); L = []
for i, (clip, a, b, s) in enumerate(plan['segs']):
    src = f"{O if clip.startswith('Short') else C}/{clip}.mp4"; out = f"{O}/cut-{i:02d}.mp4"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', f"trim={a}:{b},setpts=PTS-STARTPTS,scale=1080:1920:flags=lanczos,fps=30", '-an', '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', '-pix_fmt', 'yuv420p', out], check=True); L.append(f"file 'cut-{i:02d}.mp4'")
open(f"{O}/cuts.txt", 'w').write('\n'.join(L) + '\n')
P
ffmpeg -v error -y -f concat -safe 0 -i $O/cuts.txt -c copy $O/new-clean.mp4 || exit 1
ffmpeg -v error -y -i $O/new-clean.mp4 -i $O/ShortOverlay.mov -i public/short-mix.wav -filter_complex "[0:v][1:v]overlay=shortest=1[v]" -map "[v]" -map 2:a -c:v libx264 -crf 16 -preset fast -pix_fmt yuv420p -c:a aac -b:a 192k $O/new-part.mp4 || exit 1
ffmpeg -v error -y -i ../video/chunks3/street.mp4 -i ../video/chunks3/city.mp4 -i $O/new-part.mp4 -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart $OUT && echo SHORT_OK
