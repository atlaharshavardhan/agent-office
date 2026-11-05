"""Heavy files (images, clips) go to Google Drive via rclone; the DB stores links only.

Without RCLONE_REMOTE set, files are copied to data/drive/ (local test mode).
"""
from __future__ import annotations

import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path


class DriveError(RuntimeError):
    pass


@dataclass
class LocalDrive:
    root: Path

    def upload(self, local: Path, rel: str) -> str:
        dest = self.root / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(local, dest)
        return dest.resolve().as_uri()

    def folder_link(self, rel: str) -> str:
        p = self.root / rel
        p.mkdir(parents=True, exist_ok=True)
        return p.resolve().as_uri()


@dataclass
class RcloneDrive:
    remote: str              # e.g. "gdrive:InvisiTech"
    bin: str = "rclone"
    timeout: int = 600

    def _path(self, rel: str) -> str:
        return f"{self.remote.rstrip('/')}/{rel.lstrip('/')}"

    def _run(self, *args: str) -> str:
        try:
            p = subprocess.run([self.bin, *args], capture_output=True, text=True, timeout=self.timeout)
        except FileNotFoundError as e:
            raise DriveError("rclone is not installed (free: https://rclone.org/install/).") from e
        if p.returncode != 0:
            raise DriveError(f"rclone {args[0]} failed: {p.stderr.strip()[-500:]}")
        return p.stdout.strip()

    def link(self, rel: str) -> str:
        try:
            return self._run("link", self._path(rel))
        except DriveError:
            return self._path(rel)  # fall back to the rclone path; still findable in Drive

    def upload(self, local: Path, rel: str) -> str:
        self._run("copyto", str(local), self._path(rel))
        return self.link(rel)

    def folder_link(self, rel: str) -> str:
        self._run("mkdir", self._path(rel))
        return self.link(rel)


def make_drive(settings):
    if settings.rclone_remote:
        return RcloneDrive(settings.rclone_remote)
    return LocalDrive(settings.data_dir / "drive")
