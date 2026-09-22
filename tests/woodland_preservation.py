"""Only reviewed renderer/capture edits are reversible. No runtime or native state use."""
import json
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq02r-declared-woodland-edits.json').read_text())
def restore_woodland_source(name,source):
    if name not in SPEC['files']: raise ValueError('undeclared woodland source')
    for edit in reversed(SPEC['files'][name]):
        before,after=edit['before'],edit['after']
        if not after or source.count(after)!=1: raise AssertionError('woodland edit changed or duplicated')
        source=source.replace(after,before,1)
    return source
