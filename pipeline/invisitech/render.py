"""Render step: STUB. High-quality renders will run later on the GCP VM.

When this is built, it must call rules.check_spend(db, "gcp_vm", ...) first, so a
VM render never starts without the owner's recorded approval.
"""
from __future__ import annotations

from .rules import check_spend


def render_on_gcp_vm(db, video_id: int, notifier=None) -> None:
    check_spend(db, "gcp_vm", f"high-quality render of video #{video_id}", video_id, notifier)
    raise NotImplementedError("GCP VM rendering is not built yet (pre-production phase only).")
