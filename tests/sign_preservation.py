"""Exact W inverse for offline source contracts; never changes native reports."""
import json
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq02w-declared-sign-edits.json').read_text())
def restore_sign_source(name,source):
    if name not in SPEC['files']: raise ValueError('undeclared sign source')
    for edit in reversed(SPEC['files'][name]):
        before,after=edit['before'],edit['after']
        if not after or source.count(after)!=1: raise AssertionError('sign edit changed or duplicated')
        source=source.replace(after,before,1)
    return source
