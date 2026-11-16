"""Clone the reference repositories (falls back to GitHub ZIP archives)."""
import io
import subprocess
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXT = ROOT / "assets/external"
REPOS = {
    "vera-rubin": "https://github.com/bddicken/nvidia",
    "gpu-viz": "https://github.com/staru09/gpu_viz",
}
# Sketchfab fallback model (TU106-410-A1). sketchfab.com is blocked from this
# environment and downloads need a logged-in account; we do not bypass that.
SKETCHFAB = "https://sketchfab.com/3d-models/tu106-410-a1-9ae8bc21dd314acf90b0a437ddc2f713"


def main():
    EXT.mkdir(parents=True, exist_ok=True)
    for name, url in REPOS.items():
        dest = EXT / name
        if (dest / ".git").exists() or any(dest.glob("*")):
            print(f"[download] {name}: already present")
            continue
        r = subprocess.run(["git", "clone", "--depth", "1", url + ".git", str(dest)])
        if r.returncode != 0:
            for branch in ("main", "master"):
                try:
                    data = urllib.request.urlopen(f"{url}/archive/refs/heads/{branch}.zip").read()
                    zipfile.ZipFile(io.BytesIO(data)).extractall(dest)
                    break
                except Exception as e:  # noqa: BLE001
                    print(f"[download] zip {branch} failed: {e}")
    print(f"[download] Sketchfab fallback not downloaded (blocked + login required): {SKETCHFAB}")


if __name__ == "__main__":
    main()
