"""Free storyboard frame rendering: SVG/HTML frames -> PNG.

Order for STORYBOARD_RENDERER=auto: Playwright (Python) -> headless Chrome/Chromium
-> keep the SVG. Blender is used only when STORYBOARD_RENDERER=blender, with a
Blender Python script written by the Storyboard Artist.
"""
from __future__ import annotations

import html
import shutil
import subprocess
from pathlib import Path

W, H = 1920, 1080


class RenderError(RuntimeError):
    pass


def frame_html(svg: str, width: int = W, height: int = H) -> str:
    return (f"<!doctype html><html><head><meta charset='utf-8'><style>html,body{{margin:0;padding:0;"
            f"width:{width}px;height:{height}px;overflow:hidden;background:#0B1020}}svg{{display:block;"
            f"width:{width}px;height:{height}px}}</style><title>{html.escape('frame')}</title></head>"
            f"<body>{svg}</body></html>")


def find_chrome(explicit: str = "") -> str | None:
    if explicit:
        return explicit
    for name in ("google-chrome", "chromium", "chromium-browser", "chrome", "msedge"):
        if shutil.which(name):
            return shutil.which(name)
    for p in (r"C:\Program Files\Google\Chrome\Application\chrome.exe",
              "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
              "/opt/pw-browsers/chromium"):
        if Path(p).exists():
            return p
    return None


def _playwright(html_path: Path, out: Path) -> None:
    from playwright.sync_api import sync_playwright  # optional, free
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        page.goto(html_path.resolve().as_uri())
        page.screenshot(path=str(out), full_page=False)
        browser.close()


def _chrome(chrome: str, html_path: Path, out: Path) -> None:
    cmd = [chrome, "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
           f"--window-size={W},{H}", "--force-device-scale-factor=1", f"--screenshot={out.resolve()}",
           html_path.resolve().as_uri()]
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if p.returncode != 0 or not out.exists():
        raise RenderError(f"Chrome screenshot failed: {p.stderr.strip()[-300:]}")


def render_svg(svg: str, out_png: Path, renderer: str = "auto", chrome_bin: str = "") -> tuple[Path, str]:
    """Render one SVG frame. Returns (file, method). Falls back to saving the .svg."""
    out_png.parent.mkdir(parents=True, exist_ok=True)
    html_path = out_png.with_suffix(".html")
    html_path.write_text(frame_html(svg), encoding="utf-8")
    errors = []
    if renderer in ("auto", "playwright"):
        try:
            _playwright(html_path, out_png)
            return out_png, "playwright"
        except Exception as e:  # not installed or no browser
            errors.append(f"playwright: {e}")
    if renderer in ("auto", "chrome"):
        chrome = find_chrome(chrome_bin)
        if chrome:
            try:
                _chrome(chrome, html_path, out_png)
                return out_png, "chrome"
            except Exception as e:
                errors.append(f"chrome: {e}")
    if renderer in ("playwright", "chrome"):
        raise RenderError("; ".join(errors) or "renderer not available")
    svg_path = out_png.with_suffix(".svg")
    svg_path.write_text(svg, encoding="utf-8")
    return svg_path, "svg"


def render_blender(script: str, out_png: Path, blender_bin: str = "blender", timeout: int = 900) -> tuple[Path, str]:
    """Run a Storyboard-Artist-written Blender script; it must render to sys.argv[-1]."""
    if not shutil.which(blender_bin) and not Path(blender_bin).exists():
        raise RenderError("Blender not found (free: https://www.blender.org/download/).")
    out_png.parent.mkdir(parents=True, exist_ok=True)
    py = out_png.with_suffix(".py")
    py.write_text(script, encoding="utf-8")
    p = subprocess.run([blender_bin, "--background", "--factory-startup", "--python", str(py), "--", str(out_png)],
                       capture_output=True, text=True, timeout=timeout)
    if p.returncode != 0 or not out_png.exists():
        raise RenderError(f"Blender render failed: {(p.stderr or p.stdout).strip()[-400:]}")
    return out_png, "blender"
