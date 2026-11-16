"""Inspect the downloaded repositories and decide what may be reused.

Rule: a repository with no licence grants no reuse rights (all rights reserved
by default). Only MIT / BSD / Apache / CC0 / CC-BY style licences are accepted.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXT = ROOT / "assets/external"
OK = re.compile(r"\b(MIT License|Apache License|BSD|CC0|Creative Commons Attribution 4\.0|Unlicense)\b", re.I)
BAD = re.compile(r"(NonCommercial|CC BY-NC|Sketchfab Standard|All rights reserved)", re.I)


def licence_of(repo: Path):
    files = [p for p in repo.rglob("*") if p.is_file() and ".git" not in p.parts
             and "node_modules" not in p.parts
             and re.match(r"(LICEN[CS]E|COPYING|license\.txt)", p.name, re.I)]
    text = "\n".join(p.read_text(errors="ignore")[:4000] for p in files)
    pkg = repo / "package.json"
    pkg_lic = json.loads(pkg.read_text()).get("license") if pkg.exists() else None
    if files and BAD.search(text):
        verdict = "REJECT (restrictive licence)"
    elif files and OK.search(text):
        verdict = "REUSE OK (with attribution)"
    elif pkg_lic and OK.search(pkg_lic or ""):
        verdict = "REUSE OK (package.json licence)"
    else:
        verdict = "NO LICENCE - reference only, do not copy code or geometry"
    return {"licence_files": [str(p.relative_to(repo)) for p in files],
            "package_json_license": pkg_lic, "verdict": verdict}


def main():
    report = {}
    for repo in sorted(EXT.iterdir()) if EXT.exists() else []:
        if not repo.is_dir():
            continue
        info = licence_of(repo)
        info["three_js_builders"] = sorted(
            str(p.relative_to(repo)) for p in repo.rglob("*.js")
            if "node_modules" not in p.parts and ("builders" in p.parts or "parts" in p.parts
                                                  or "assemblies" in p.parts))
        report[repo.name] = info
        print(f"[inspect] {repo.name}: {info['verdict']}")
    out = ROOT / "research/asset_inspection.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(report, indent=2))
    return report


if __name__ == "__main__":
    main()
