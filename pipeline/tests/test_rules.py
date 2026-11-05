import struct
import zlib

import pytest

from invisitech.db import DB
from invisitech.rules import (SpendBlocked, check_spend, image_size, svg_has_frame_size, validate_image,
                              validate_script)
from conftest import svg_frame


def errors(script, rule=None):
    v = validate_script(script)
    return [i for i in v.errors if rule is None or i["rule"] == rule]


def test_benchmark_scripts_pass(otp_script, fastag_script):
    for s in (otp_script, fastag_script):
        v = validate_script(s)
        assert v.passed, v.issues
        assert 240 <= v.stats["seconds"] <= 480


def test_hook_must_land_within_10_seconds(otp_script):
    long_hook = ("This is a very long opening line that keeps going and going without ever getting to the "
                 "point that the viewer actually came here to hear about today")
    otp_script["hook_line"] = long_hook
    otp_script["scenes"][0]["narration"] = long_hook + ". " + otp_script["scenes"][0]["narration"]
    assert any("10 s" in e["problem"] for e in errors(otp_script, "hook"))


def test_hook_must_be_first_thing_said(otp_script):
    otp_script["scenes"][0]["narration"] = "Hi everyone, welcome. " + otp_script["scenes"][0]["narration"]
    assert errors(otp_script, "hook")


def test_hook_line_required(otp_script):
    otp_script["hook_line"] = ""
    assert errors(otp_script, "hook")


def test_sections_present_and_ordered(otp_script):
    no_outro = dict(otp_script, scenes=[s for s in otp_script["scenes"] if s["section"] != "outro"])
    assert any("outro" in e["problem"] for e in errors(no_outro, "sections"))
    swapped = dict(otp_script, scenes=[otp_script["scenes"][-1]] + otp_script["scenes"][:-1])
    assert errors(swapped, "sections")


def test_never_stretched(otp_script):
    otp_script["format"] = {"type": "long", "aspect": "16:9", "width": 1920, "height": 1000}
    assert errors(otp_script, "aspect")
    otp_script["format"] = {"type": "long", "aspect": "4:3", "width": 1440, "height": 1080}
    assert errors(otp_script, "aspect")


def test_too_short(otp_script):
    otp_script["scenes"] = otp_script["scenes"][:3] + otp_script["scenes"][-1:]
    otp_script["target_minutes"] = 4
    assert any("too short" in e["problem"] for e in errors(otp_script, "length"))


def test_too_long(otp_script):
    import itertools
    extra = []
    for i in range(20):  # unique sentences so only the length rule fires
        extra.append({"n": 100 + i, "section": "main", "visual": "x",
                      "narration": " ".join(f"word{i}x{j}" for j in range(40)) + "."})
    otp_script["scenes"] = otp_script["scenes"][:-1] + extra + otp_script["scenes"][-1:]
    otp_script["target_minutes"] = 8
    assert any("too long" in e["problem"] for e in errors(otp_script, "length"))


def test_dragged_beyond_planned_length(otp_script):
    otp_script["target_minutes"] = 4  # script is ~4.6 min, > 4 * 1.15
    assert errors(otp_script, "drag")


def test_target_minutes_range(otp_script):
    otp_script["target_minutes"] = 12
    assert errors(otp_script, "length")


def test_repeated_sentence_is_drag(otp_script):
    otp_script["scenes"][5]["narration"] += " " + otp_script["scenes"][2]["narration"].split(". ")[0] + "."
    assert any("Repeated" in e["problem"] for e in errors(otp_script, "drag"))


def test_filler_phrases(otp_script):
    otp_script["scenes"][3]["narration"] += " Basically, it is simple. As I said, the bank is careful."
    assert any("Filler" in e["problem"] for e in errors(otp_script, "drag"))


def test_scene_too_long(otp_script):
    otp_script["scenes"][4]["narration"] += " " + " ".join(f"unique{i}" for i in range(150)) + "."
    otp_script["target_minutes"] = 6
    assert any("split" in e["problem"] for e in errors(otp_script, "drag"))


def _png(w, h):
    raw = b"".join(b"\x00" + b"\x00\x00\x00" * w for _ in range(h))
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d))
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b""))


def test_image_aspect(tmp_path):
    good, bad = tmp_path / "good.png", tmp_path / "bad.png"
    good.write_bytes(_png(32, 18))
    bad.write_bytes(_png(32, 20))
    assert image_size(good) == (32, 18)
    assert validate_image(good).passed
    assert not validate_image(bad).passed
    svg = tmp_path / "f.svg"
    svg.write_text(svg_frame(1))
    assert validate_image(svg).passed
    jpg = tmp_path / "f.jpg"  # minimal JPEG header with SOF0
    jpg.write_bytes(b"\xff\xd8" + b"\xff\xc0\x00\x11\x08" + struct.pack(">HH", 1080, 1920) + b"\x00" * 10)
    assert image_size(jpg) == (1920, 1080)


def test_svg_frame_size():
    assert svg_has_frame_size(svg_frame(1))
    assert not svg_has_frame_size(svg_frame(1, 1920, 1200))
    assert not svg_has_frame_size('<svg width="1920" height="1080" viewBox="0 0 800 600"></svg>')


def test_spend_guard(tmp_path):
    db = DB(tmp_path / "t.sqlite")
    assert db.create_video("Test") == 1
    assert check_spend(db, "vidIQ", "research") is None  # free
    assert check_spend(db, "claude", "script") is None
    with pytest.raises(SpendBlocked) as e:
        check_spend(db, "higgsfield", "make a clip", video_id=1)
    aid = e.value.approval_id
    with pytest.raises(SpendBlocked) as e2:  # asking again does not file a duplicate
        check_spend(db, "higgsfield", "make a clip", video_id=1)
    assert e2.value.approval_id == aid
    db.decide(aid, "approved")
    assert check_spend(db, "higgsfield", "make a clip", video_id=1) == aid
    with pytest.raises(SpendBlocked):  # approval is single use
        check_spend(db, "higgsfield", "make a clip", video_id=1)


def test_unknown_tools_count_as_paid(tmp_path):
    db = DB(tmp_path / "t.sqlite")
    with pytest.raises(SpendBlocked):
        check_spend(db, "some_new_ai_service", "anything")


def test_svg_frame_normalized_without_stretching():
    from invisitech.rules import image_size, normalize_svg_frame
    # only a viewBox, attributes in another order, px units: all fine, scaled evenly
    for svg in ['<svg viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg"><rect/></svg>',
                '<svg xmlns="http://www.w3.org/2000/svg"\n  viewBox="0,0,960,540"><rect/></svg>',
                '<svg width="1920px" height="1080px" xmlns="http://www.w3.org/2000/svg"><rect/></svg>',
                "<svg width='3840' height='2160' viewBox='0 0 3840 2160'><rect/></svg>"]:
        out = normalize_svg_frame(svg)
        assert out and 'width="1920" height="1080"' in out and out.endswith("<rect/></svg>"), svg
    # wrong shapes are refused, never stretched
    for svg in ['<svg viewBox="0 0 1920 1200"></svg>', '<svg width="1920" height="1080" viewBox="0 0 800 800"></svg>',
                '<svg width="100%" height="100%"></svg>', "<div>not svg</div>"]:
        assert normalize_svg_frame(svg) is None, svg
