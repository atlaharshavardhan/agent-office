"""Slim the Hunyuan3D head for rendering: pull the 4096 px texture out of the GLB into a 2048 px JPG
(public/models/head_tex.jpg) and write a geometry-only GLB (public/models/head.glb).
Usage: python tools/prep_head.py <original.glb>"""
import io, json, struct, sys
from pathlib import Path
from PIL import Image

R = Path(__file__).resolve().parent.parent
f = open(sys.argv[1], "rb"); f.read(12)
n, _ = struct.unpack("<I4s", f.read(8)); j = json.loads(f.read(n))
bn, _ = struct.unpack("<I4s", f.read(8)); b = f.read(bn)
bv = j["bufferViews"][j["images"][0]["bufferView"]]
im = Image.open(io.BytesIO(b[bv.get("byteOffset", 0):bv.get("byteOffset", 0) + bv["byteLength"]])).convert("RGB")
im.resize((2048, 2048), Image.LANCZOS).save(R / "public/models/head_tex.jpg", quality=90)

prim = j["meshes"][0]["primitives"][0]
keep = [prim["attributes"]["POSITION"], prim["attributes"]["NORMAL"], prim["attributes"]["TEXCOORD_0"], prim["indices"]]
out = bytearray(); views = []; accs = []
for a_i in keep:
    a = dict(j["accessors"][a_i]); v = j["bufferViews"][a["bufferView"]]
    data = b[v.get("byteOffset", 0):v.get("byteOffset", 0) + v["byteLength"]]
    while len(out) % 4: out.append(0)
    nv = {"buffer": 0, "byteOffset": len(out), "byteLength": len(data)}
    if "target" in v: nv["target"] = v["target"]
    out += data; a["bufferView"] = len(views); views.append(nv); accs.append(a)
while len(out) % 4: out.append(0)
g = {"asset": {"version": "2.0"}, "scene": 0, "scenes": [{"nodes": [0]}], "nodes": [dict(j["nodes"][0], mesh=0)],
     "meshes": [{"primitives": [{"attributes": {"POSITION": 0, "NORMAL": 1, "TEXCOORD_0": 2}, "indices": 3}]}],
     "accessors": accs, "bufferViews": views, "buffers": [{"byteLength": len(out)}]}
js = json.dumps(g, separators=(",", ":")).encode(); js += b" " * (-len(js) % 4)
with open(R / "public/models/head.glb", "wb") as o:
    o.write(struct.pack("<4sII", b"glTF", 2, 12 + 8 + len(js) + 8 + len(out)))
    o.write(struct.pack("<I4s", len(js), b"JSON")); o.write(js)
    o.write(struct.pack("<I4s", len(out), b"BIN\x00")); o.write(bytes(out))
print("ok", len(out))
