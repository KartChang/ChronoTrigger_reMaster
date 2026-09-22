"""Test-only removal of explicitly reviewed S presentation/observation wires."""
from readability_preservation import restore_readability_source
import json
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq02s-declared-village-edits.json').read_text())
def restore_village_source(name,source):
    if name == 'scripts/cpu-era-evidence.mjs': source = restore_readability_source(name,source)
    if name not in SPEC['files']: raise ValueError('undeclared village source')
    for edit in reversed(SPEC['files'][name]):
        before,after=edit['before'],edit['after']
        if not after or source.count(after)!=1: raise AssertionError('village edit changed or duplicated')
        source=source.replace(after,before,1)
    return source
