"""S1 V2 hook · Jensen plates + mattes (free/local).

One continuous section of the existing Kling clip, 1.50-4.70 s at real speed, resampled to 30 fps (96 frames):
  frames 0-44  -> Shot 1 (full frame)        frames 45-95 -> top panel of the Shot 2 split screen (same take,
  so the split screen continues the movement with no jump). Character mattes for frames 0-52 (Shot 1 + the
  split transition) let beams/haze sit behind him and the audience silhouettes in front.
Alice layers are reused from scripts/s1_final_layers.py (remotion/public/s1f/a).
Run: .venv/bin/python -I scripts/s1_v2_layers.py
"""
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import cv2  # noqa: E402
import numpy as np  # noqa: E402
from s1_final_layers import matte, save_rgba, SRC_K, W, H, ROOT  # noqa: E402

OUT = ROOT / "remotion/public/s1v2/j"
START, N, NMATTE = 1.50, 96, 53


def main():
    (OUT / "plate").mkdir(parents=True, exist_ok=True); (OUT / "fg").mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(START), "-t", "3.25", "-i", str(SRC_K),
                    "-vf", f"fps=30,scale={W}:-1:flags=lanczos,crop={W}:{H}:0:(ih-{H})/2", "-frames:v", str(N),
                    "-q:v", "2", str(OUT / "plate/%04d.jpg")], check=True)
    plates = sorted((OUT / "plate").glob("*.jpg"))
    assert len(plates) == N, len(plates)
    prev = None
    for i, p in enumerate(plates[:NMATTE]):
        img = cv2.imread(str(p))
        a = matte(img).astype(np.float32)
        if prev is not None:
            a = 0.65 * a + 0.35 * prev
        prev = a
        save_rgba(OUT / f"fg/{i:04d}.png", img, cv2.GaussianBlur(a, (0, 0), 1.0).clip(0, 255).astype(np.uint8))
    print("plates", len(plates), "mattes", NMATTE)


if __name__ == "__main__":
    main()
