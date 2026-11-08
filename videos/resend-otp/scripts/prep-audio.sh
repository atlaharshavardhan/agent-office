#!/usr/bin/env bash
# Fit the narration and music to the 10 s cut, then place them in public/ for Remotion.
#   scripts/prep-audio.sh path/to/voice.mp3 [path/to/music.wav]
# Voice: long pauses are shortened to 0.2 s, then the speed is nudged (max ~1.15x)
# so it ends by 9.8 s. Music: first 10 s, faded out at the end.
set -euo pipefail
cd "$(dirname "$0")/.."
VOICE=$1; MUSIC=${2:-}
ffmpeg -y -v error -i "$VOICE" -af "silenceremove=stop_periods=-1:stop_duration=0.2:stop_silence=0.2:stop_threshold=-40dB" /tmp/voice_tight.wav
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 /tmp/voice_tight.wav)
TEMPO=$(python3 -c "d=$DUR; print(f'{max(1.0, min(1.15, d/9.8)):.3f}')")
echo "voice: ${DUR}s after tightening, tempo x${TEMPO}"
ffmpeg -y -v error -i /tmp/voice_tight.wav -af "adelay=150|150,atempo=${TEMPO}" -b:a 192k public/voice.mp3
if [ -n "$MUSIC" ]; then
  ffmpeg -y -v error -i "$MUSIC" -t 10 -af "afade=t=out:st=9.2:d=0.8" -b:a 192k public/music.mp3
fi
ffprobe -v error -show_entries format=duration -of csv=p=0 public/voice.mp3
