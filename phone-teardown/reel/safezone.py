"""Safe-zone preview: what the Shorts / Reels app covers on a 1080x1920 frame.

usage: python3 safezone.py <video.mp4> <out.jpg> t1 t2 t3 ...
Zones follow the YouTube Shorts / Instagram Reels player (title, handle and Remix chip at the
bottom, like/comment/share/remix column on the right, status bar and header at the top).
"""
import subprocess, sys, tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
ZONES = [  # (x0, y0, x1, y1, label)
    (0, 0, W, int(H * 0.08), "status bar / app header"),
    (0, int(H * 0.79), W, H, "title · @handle · audio · Remix"),
    (int(W * 0.86), int(H * 0.48), W, int(H * 0.79), "like\ncomment\nshare\nremix"),
]


def font(sz):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf"):
        if Path(p).exists():
            return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


def overlay(img):
    img = img.convert("RGBA").resize((W, H))
    ov = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for x0, y0, x1, y1, label in ZONES:
        d.rectangle([x0, y0, x1, y1], fill=(255, 40, 60, 95), outline=(255, 80, 90, 230), width=4)
        d.multiline_text((x0 + 18, y0 + 14), label, fill=(255, 255, 255, 235), font=font(30), spacing=6)
    d.rectangle([int(W * 0.08), int(H * 0.08), int(W * 0.86), int(H * 0.79)], outline=(80, 230, 140, 255), width=4)
    d.text((int(W * 0.08) + 14, int(H * 0.08) + 10), "SAFE", fill=(80, 230, 140, 255), font=font(34))
    return Image.alpha_composite(img, ov).convert("RGB")


def main():
    video, out, times = sys.argv[1], sys.argv[2], [float(t) for t in sys.argv[3:]]
    tiles = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, t in enumerate(times):
            f = Path(tmp) / f"{i}.png"
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(t), "-i", video, "-frames:v", "1", str(f)], check=True)
            tile = overlay(Image.open(f)).resize((W // 3, H // 3))
            ImageDraw.Draw(tile).text((12, 10), f"{t:.1f}s", fill=(255, 220, 0), font=font(26))
            tiles.append(tile)
    sheet = Image.new("RGB", (W // 3 * len(tiles), H // 3), "black")
    for i, tl in enumerate(tiles):
        sheet.paste(tl, (i * W // 3, 0))
    sheet.save(out, quality=88)
    print(out)


if __name__ == "__main__":
    main()
