"""Static evidence only. Never executes application writes, imports env files, or claims E2E coverage."""
import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def inspect():
    sources = sorted((ROOT / "src").rglob("*.ts")) + sorted((ROOT / "src").rglob("*.tsx"))
    routes, controls, modules, imports = [], [], [], []
    for path in sources:
        text = path.read_text()
        relative = str(path.relative_to(ROOT))
        if path.parent == ROOT / "src/routes":
            match = re.search(r'createFileRoute\(["\']([^"\']+)', text)
            if match:
                routes.append({"path": match[1], "file": relative, "head": "head:" in text, "layout": "<Outlet" in text or "<AppShell" in text, "redirectOnly": "component:" not in text and "redirect(" in text, "status": "SPECIFIED"})
        for number, line in enumerate(text.splitlines(), 1):
            if re.search(r'<(?:Btn|Button|button|Link|input|select|textarea)\b', line):
                controls.append({"file": relative, "line": number, "control": re.search(r'<(\w+)', line).group(1), "status": "NOT_RUN"})
        for name in re.findall(r'(?:from\s+|import\s*\()["\'](@/[^"\']+)', text):
            target = ROOT / "src" / name[2:]
            if not any(p.exists() for p in [target, target.with_suffix(".ts"), target.with_suffix(".tsx"), Path(str(target) + ".ts"), Path(str(target) + ".tsx"), target / "index.ts", target / "index.tsx"]):
                imports.append({"file": relative, "import": name})
    for feature in sorted((ROOT / "src/features").iterdir()):
        if feature.is_dir():
            files = sorted(str(p.relative_to(ROOT)) for p in feature.rglob("*") if p.is_file())
            modules.append({"module": feature.name, "files": files, "status": "PARTIALLY_IMPLEMENTED"})
    screens_text = (ROOT / "src/lib/vf/screens.ts").read_text()
    match = re.search(r'export const SCREENS: Screen\[\] = (\[.*?\]);', screens_text, re.S)
    screens = json.loads(match[1]) if match else []
    for screen in screens:
        screen["registryOnly"] = True  # Labels in this generated catalog are not verification.
    contracts = [str(p.relative_to(ROOT)) for p in (ROOT / "src").rglob("*contracts.ts")]
    duplicates = sorted({r["path"] for r in routes if sum(x["path"] == r["path"] for x in routes) > 1})
    return {"generatedAt": datetime.now(timezone.utc).isoformat(), "method": "static source inspection; not execution or authorization", "routes": routes, "screens": screens, "components": [str(p.relative_to(ROOT)) for p in sources if p.suffix == ".tsx" and "/routes/" not in str(p)], "modules": modules, "controls": controls, "contracts": contracts, "unresolvedLocalImports": imports, "duplicateRouteDeclarations": duplicates, "originalSources": {"PART_1": "SOURCE_NOT_AVAILABLE", "PART_2": "SOURCE_NOT_AVAILABLE", "PART_3": "SOURCE_NOT_AVAILABLE"}}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="docs/qa/P14_APPLICATION_REALITY_INVENTORY.json")
    args = parser.parse_args()
    result = inspect()
    target = ROOT / args.output
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"routes": len(result["routes"]), "screens": len(result["screens"]), "components": len(result["components"]), "controls": len(result["controls"]), "modules": len(result["modules"]), "unresolvedLocalImports": result["unresolvedLocalImports"], "duplicates": result["duplicateRouteDeclarations"]}, ensure_ascii=False))

if __name__ == "__main__":
    main()