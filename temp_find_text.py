import re
from pathlib import Path
root = Path('.')
regex = re.compile(r'>([^<>]+)<')
for path in root.rglob('*'):
    if path.suffix not in {'.js', '.jsx', '.ts', '.tsx'}:
        continue
    text = path.read_text(encoding='utf-8')
    for m in regex.finditer(text):
        content = m.group(1)
        if not content.strip():
            continue
        if '{' in content or '}' in content or '/*' in content or '*/' in content:
            continue
        if not re.search(r'[A-Za-z0-9]', content):
            continue
        before = text[:m.start()]
        lastOpen = before.rfind('<Text')
        lastClose = before.rfind('</Text>')
        if lastOpen != -1 and lastClose < lastOpen:
            continue
        print(f'{path}: {repr(content)}')
