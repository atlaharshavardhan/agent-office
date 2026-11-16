"""Convert permitted external Three.js geometry to GLB (only when the licence allows).

Both reference repositories currently have no licence, so nothing is exported:
running their code to extract meshes would still copy protected work. The scene
is built from original procedural geometry instead (build_gpu.py,
build_motherboard.py) using publicly documented layouts.

If a repository later adds a permissive licence, set ALLOW and implement the
export: `npm ci`, load the builder modules in headless Chromium via Playwright,
run THREE.GLTFExporter on the built group, save to assets/models/<name>.glb and
import with bpy.ops.import_scene.gltf().
"""


def main(report=None):
    report = report or {}
    allowed = [k for k, v in report.items() if v.get("verdict", "").startswith("REUSE OK")]
    if not allowed:
        print("[convert] no permitted external geometry -> using original procedural models")
        return []
    print(f"[convert] permitted but not yet wired up: {allowed} (see docstring)")
    return allowed


if __name__ == "__main__":
    main()
