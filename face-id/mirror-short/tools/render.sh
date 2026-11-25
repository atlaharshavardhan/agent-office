#!/usr/bin/env bash
# One export for Instagram Reels + YouTube Shorts: 1080 x 1920, 30 fps, H.264 8 Mbps, AAC stereo 48 kHz, Rec.709 SDR.
# Guides are off (they are a preview-only prop). Run from face-id/mirror-short.
set -e
npx remotion render MirrorFaceID out/mirror-faceid.mp4 --codec=h264 --video-bitrate=8M --pixel-format=yuv420p --color-space=bt709 \
  --audio-codec=aac --audio-bitrate=320k --concurrency=4 --log=error "$@"
