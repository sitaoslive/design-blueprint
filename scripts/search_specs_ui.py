import os, re

keywords = ['pantalla', 'portal', 'dashboard', 'lovable', 'formulario']

for f in sorted(os.listdir('docs/specifications')):
    path = os.path.join('docs/specifications', f)
    with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
        lines = fp.readlines()
    print(f"\n=================== {f} ===================")
    for i, line in enumerate(lines):
        for k in keywords:
            if re.search(r'\b' + k + r'\b', line, re.I):
                print(f"L{i+1}: {line.strip()[:140]}")
                break
