"""Rule Validator: plain, deterministic code (not an agent).

Runs before the Script Reviewer and before any paid call:
- long video is 4-8 minutes, sized to the script, never dragged
- never stretched (correct aspect ratio for scripts and images)
- hook within the first 10 seconds; hook, main and outro sections present
- nothing that spends money/credits runs without a recorded approval
"""
from __future__ import annotations

import re
import struct
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path

LONG_MIN_SECONDS = 4 * 60
LONG_MAX_SECONDS = 8 * 60
HOOK_MAX_SECONDS = 10
SCENE_MAX_SECONDS = 75
DRAG_OVER_TARGET = 1.15      # more than 15 % over the planned length = dragged
REPEAT_SHINGLE_RATIO = 0.06  # share of repeated 5-word runs that counts as repetition
FILLERS = [
    "basically", "as i said", "as we said", "like i said", "without further ado", "in other words",
    "let's dive in", "let us dive in", "at the end of the day", "needless to say", "so yeah",
    "you know what", "hey guys", "hi guys", "welcome back to", "don't forget to subscribe",
]
ASPECTS = {"long": (16, 9), "short": (9, 16)}


@dataclass
class Validation:
    passed: bool
    issues: list[dict] = field(default_factory=list)
    stats: dict = field(default_factory=dict)

    @property
    def errors(self) -> list[dict]:
        return [i for i in self.issues if i["severity"] == "error"]

    def summary(self) -> str:
        s = self.stats
        head = f"{s.get('words', 0)} words ≈ {s.get('seconds', 0) / 60:.1f} min"
        return head + (" – all rules pass" if self.passed else f" – {len(self.errors)} rule(s) broken")


def words(text: str) -> list[str]:
    return re.findall(r"[A-Za-z0-9][A-Za-z0-9'’%₹.,-]*", text or "")


def normalize(text: str) -> str:
    return " ".join(w.lower().strip(".,!?;:'\"’") for w in words(text))


def seconds_for(text: str, wpm: int) -> float:
    return len(words(text)) * 60.0 / wpm


def sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text or "") if len(words(s)) >= 4]


def validate_script(script: dict, wpm: int = 150) -> Validation:
    issues: list[dict] = []

    def err(rule: str, msg: str, scene: int | None = None):
        issues.append({"rule": rule, "severity": "error", "scene": scene, "problem": msg})

    def warn(rule: str, msg: str, scene: int | None = None):
        issues.append({"rule": rule, "severity": "warning", "scene": scene, "problem": msg})

    scenes = script.get("scenes") or []
    if not scenes:
        err("sections", "Script has no scenes.")
        return Validation(False, issues, {"words": 0, "seconds": 0})

    # --- aspect ratio / never stretched ---
    fmt = script.get("format") or {}
    vtype = fmt.get("type", "long")
    want = ASPECTS.get(vtype)
    w, h = fmt.get("width"), fmt.get("height")
    if not want:
        err("aspect", f"Unknown video type {vtype!r}.")
    elif vtype != "long":
        err("aspect", "This pipeline makes long videos; format.type must be 'long'.")
    else:
        if fmt.get("aspect") != f"{want[0]}:{want[1]}":
            err("aspect", f"Long videos must be {want[0]}:{want[1]}, got {fmt.get('aspect')!r}.")
        if not (isinstance(w, int) and isinstance(h, int) and w * want[1] == h * want[0]):
            err("aspect", f"Size {w}x{h} is not exactly {want[0]}:{want[1]}; the video would be stretched.")

    # --- sections present and in order ---
    order = {"hook": 0, "main": 1, "outro": 2}
    kinds = [s.get("section") for s in scenes]
    for k in order:
        if k not in kinds:
            err("sections", f"Missing a '{k}' section.")
    bad = [s.get("n") for s in scenes if s.get("section") not in order]
    if bad:
        err("sections", f"Scenes {bad} have an unknown section (use hook/main/outro).")
    ranks = [order.get(k, -1) for k in kinds]
    if ranks != sorted(ranks):
        err("sections", "Sections are out of order; it must be hook, then main, then outro.")
    if kinds[0] != "hook":
        err("hook", "The first scene must be the hook.", scenes[0].get("n"))
    for s in scenes:
        if not (s.get("narration") or "").strip():
            err("sections", "Scene has no narration.", s.get("n"))
        if not (s.get("visual") or "").strip():
            err("sections", "Scene has no visual idea for the storyboard.", s.get("n"))

    # --- hook within the first 10 seconds ---
    hook_line = (script.get("hook_line") or "").strip()
    first = (scenes[0].get("narration") or "").strip()
    if not hook_line:
        err("hook", "hook_line is missing (the surprising fact said in the first 10 s).")
    else:
        hook_s = seconds_for(hook_line, wpm)
        if hook_s > HOOK_MAX_SECONDS:
            err("hook", f"Hook line takes ~{hook_s:.0f} s; it must land within {HOOK_MAX_SECONDS} s "
                        f"(≤ {HOOK_MAX_SECONDS * wpm // 60} words).", scenes[0].get("n"))
        if not normalize(first).startswith(normalize(hook_line)):
            err("hook", "The hook line must be the very first thing narrated.", scenes[0].get("n"))

    # --- length: 4-8 min, sized to the script, never dragged ---
    all_text = " ".join(s.get("narration") or "" for s in scenes)
    total_words = len(words(all_text))
    total_s = total_words * 60.0 / wpm
    if total_s < LONG_MIN_SECONDS:
        err("length", f"~{total_s / 60:.1f} min is too short; long videos are 4–8 min.")
    if total_s > LONG_MAX_SECONDS:
        err("length", f"~{total_s / 60:.1f} min is too long; long videos are 4–8 min.")
    target = script.get("target_minutes")
    if not isinstance(target, (int, float)) or not 4 <= target <= 8:
        err("length", f"target_minutes must be between 4 and 8, got {target!r}.")
    elif total_s > target * 60 * DRAG_OVER_TARGET:
        err("drag", f"Script runs ~{total_s / 60:.1f} min but planned {target} min: it is dragging. Cut, don't pad.")
    elif total_s < target * 60 * 0.75:
        warn("length", f"Script runs ~{total_s / 60:.1f} min, well under the planned {target} min.")

    for s in scenes:
        sec = seconds_for(s.get("narration") or "", wpm)
        if sec > SCENE_MAX_SECONDS:
            err("drag", f"Scene is ~{sec:.0f} s long (max {SCENE_MAX_SECONDS} s); split it or cut it.", s.get("n"))

    # --- never dragged: repetition and filler ---
    seen: dict[str, int] = {}
    for s in scenes:
        for sent in sentences(s.get("narration") or ""):
            key = normalize(sent)
            if key in seen:
                err("drag", f"Repeated sentence (also in scene {seen[key]}): “{sent[:80]}”", s.get("n"))
            else:
                seen[key] = s.get("n")
    norm = normalize(all_text).split()
    shingles = [" ".join(norm[i:i + 5]) for i in range(max(0, len(norm) - 4))]
    if shingles:
        counts = Counter(shingles)
        repeated = sum(c for c in counts.values() if c > 1)
        ratio = repeated / len(shingles)
        if ratio > REPEAT_SHINGLE_RATIO:
            err("drag", f"{ratio:.0%} of the narration repeats itself; say each point once.")
    low = " " + normalize(all_text) + " "
    found = [f for f in FILLERS if f" {normalize(f)} " in low]
    if len(found) >= 2:
        err("drag", f"Filler phrases: {', '.join(found)}.")
    elif found:
        warn("drag", f"Filler phrase: {found[0]}.")

    passed = not any(i["severity"] == "error" for i in issues)
    return Validation(passed, issues, {"words": total_words, "seconds": round(total_s, 1),
                                       "scenes": len(scenes), "wpm": wpm})


# ---------------- images: never stretched ----------------

def image_size(path: Path) -> tuple[int, int]:
    """Width/height of a PNG, JPEG or SVG without extra libraries."""
    data = Path(path).read_bytes()
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", data[16:24])
    if data[:2] == b"\xff\xd8":
        i = 2
        while i < len(data):
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            if marker in (0xC0, 0xC1, 0xC2):
                h, w = struct.unpack(">HH", data[i + 5:i + 9])
                return w, h
            i += 2 + struct.unpack(">H", data[i + 2:i + 4])[0]
    text = data[:4000].decode("utf-8", "ignore")
    if "<svg" in text:
        m_w = re.search(r'<svg[^>]*\swidth="(\d+)', text)
        m_h = re.search(r'<svg[^>]*\sheight="(\d+)', text)
        if m_w and m_h:
            return int(m_w.group(1)), int(m_h.group(1))
        vb = re.search(r'viewBox="[\d.\s-]*?\s([\d.]+)\s+([\d.]+)"', text)
        if vb:
            return int(float(vb.group(1))), int(float(vb.group(2)))
    raise ValueError(f"Can't read image size of {path}")


def validate_image(path: Path, video_type: str = "long") -> Validation:
    aw, ah = ASPECTS[video_type]
    try:
        w, h = image_size(path)
    except ValueError as e:
        return Validation(False, [{"rule": "aspect", "severity": "error", "scene": None, "problem": str(e)}])
    ok = w * ah == h * aw
    issues = [] if ok else [{"rule": "aspect", "severity": "error", "scene": None,
                             "problem": f"{Path(path).name} is {w}x{h}, not {aw}:{ah}; it would be stretched."}]
    return Validation(ok, issues, {"width": w, "height": h})


_SVG_TAG = re.compile(r"<svg\b[^>]*>", re.S | re.I)


def _num(v: str | None) -> float | None:
    m = re.match(r"\s*([\d.]+)\s*(px)?\s*$", v or "")
    return float(m.group(1)) if m else None


def _attr(tag: str, name: str) -> str | None:
    m = re.search(rf'\s{name}\s*=\s*["\']([^"\']*)["\']', tag, re.I)
    return m.group(1) if m else None


def normalize_svg_frame(svg: str, video_type: str = "long", size: tuple[int, int] = (1920, 1080)) -> str | None:
    """Return the SVG sized to exactly 1920x1080 if its drawing is already 16:9
    (uniform scaling is fine; that is not stretching). Return None if the drawing
    has another shape: it must be redrawn, never stretched or squashed."""
    aw, ah = ASPECTS[video_type]
    m = _SVG_TAG.search(svg or "")
    if not m:
        return None
    tag = m.group(0)
    w, h = _num(_attr(tag, "width")), _num(_attr(tag, "height"))
    vb = _attr(tag, "viewBox")
    if vb:
        parts = [float(x) for x in re.split(r"[\s,]+", vb.strip()) if x]
        if len(parts) != 4 or parts[2] <= 0 or parts[3] <= 0:
            return None
        vw, vh = parts[2], parts[3]
    elif w and h:
        vw, vh = w, h
        vb = f"0 0 {w:g} {h:g}"
    else:
        return None
    def is_ratio(a, b):
        return abs(a * ah - b * aw) <= 0.002 * b * aw
    if not is_ratio(vw, vh) or (w and h and not is_ratio(w, h)):
        return None
    new = tag
    for name in ("width", "height", "viewBox", "preserveAspectRatio"):
        new = re.sub(rf'\s{name}\s*=\s*["\'][^"\']*["\']', "", new, flags=re.I)
    new = re.sub(r"^<svg\b", f'<svg width="{size[0]}" height="{size[1]}" viewBox="{vb}"', new, flags=re.I)
    return svg[:m.start()] + new + svg[m.end():]


def svg_has_frame_size(svg: str, video_type: str = "long") -> bool:
    return normalize_svg_frame(svg, video_type) is not None


# ---------------- money: nothing paid without approval ----------------

# Free to use without asking. vidIQ research is explicitly allowed.
FREE_TOOLS = {"claude", "vidiq", "blender", "html", "playwright", "chrome", "svg", "drive", "rclone",
              "telegram", "web"}
# Known paid tools. Anything not in FREE_TOOLS is treated as paid too.
PAID_TOOLS = {"higgsfield", "gcp_vm", "elevenlabs", "sarvam", "canva_ai", "midjourney"}


class SpendBlocked(RuntimeError):
    """Raised when a paid call has no recorded approval. An approval request is filed."""

    def __init__(self, tool: str, approval_id: int, message: str):
        super().__init__(message)
        self.tool, self.approval_id = tool, approval_id


def is_free(tool: str) -> bool:
    return tool.lower() in FREE_TOOLS


def check_spend(db, tool: str, purpose: str, video_id: int | None = None, notifier=None) -> int | None:
    """Call this right before anything that might cost money or credits.
    Free tools return None. Paid tools need an approved, unused 'spend' approval
    for this tool (for this video, or a standing one with no video); it is used up.
    Otherwise an approval request is filed (and sent to Telegram) and SpendBlocked is raised."""
    t = tool.lower()
    if is_free(t):
        return None
    row = db.one(
        "SELECT * FROM approvals WHERE kind='spend' AND scope=? AND status='approved'"
        " AND (video_id IS ? OR video_id IS NULL) ORDER BY id LIMIT 1", (t, video_id))
    if row:
        db.run("UPDATE approvals SET status='used' WHERE id=?", (row["id"],))
        return row["id"]
    pending = db.one("SELECT * FROM approvals WHERE kind='spend' AND scope=? AND status='pending'"
                     " AND video_id IS ?", (t, video_id))
    if pending:
        aid = pending["id"]
    else:
        text = f"💸 Approval needed: use paid tool '{tool}' for: {purpose}"
        aid = db.request_approval("spend", video_id, "harsha", text, scope=t)
        if notifier:
            notifier.ask_spend(aid, text)
    raise SpendBlocked(t, aid, f"Paid tool '{tool}' blocked: waiting for owner approval #{aid}.")
