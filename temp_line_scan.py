import re
from pathlib import Path
pattern = re.compile(r'>[^<]+<')
for path in Path('src').rglob('*.jsx'):
    for i, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
        if '<Text' in line or '</Text>' in line:
            continue
        if pattern.search(line):
            print(f'{path}:{i}: {line}')
