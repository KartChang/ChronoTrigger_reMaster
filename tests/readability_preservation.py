"""Exact, enumerated T inverse for old-source checks, never native mutation."""
from sign_preservation import restore_sign_source
import json
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq02t-declared-readability-edits.json').read_text())
def restore_readability_source(name,source):
    if name == 'scripts/cpu-era-evidence.mjs': source = restore_sign_source(name,source)
    if name not in SPEC['files']: raise ValueError('undeclared readability source')
    for edit in reversed(SPEC['files'][name]):
        before,after=edit['before'],edit['after']
        if not after or source.count(after)!=1: raise AssertionError('readability edit changed or duplicated')
        source=source.replace(after,before,1)
    return source
