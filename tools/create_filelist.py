from pathlib import Path
import json

def files(rootdir: Path, path: Path) -> list[str]:
  l = []
  for f in path.glob("*"):
    if str(f.name).startswith("."): continue
    if f.is_file() and f.suffix == "": continue
    if f.is_file() and f.suffix in [".pptx", ".py", ".json", ".md"]: continue
    if f.is_dir() and f.name in ["tools"]: continue
    if f.is_file() or not f.name in ["res", "src"]:
      fs = "/{}{}".format(str(f.relative_to(rootdir)).replace('\\', '/'), '/' if f.is_dir() else '')
      print(fs)
      l.append(fs)
    if f.is_dir():
      l.extend(files(rootdir, f))
  return l

root = Path(__file__).parent.parent
data = json.dumps(files(root, root), indent=2)

with (root / "src" / "files.js").open("w") as f:
  f.write(f"""
const CB_ALL_FILES = {data}
""")

print("Done.")
