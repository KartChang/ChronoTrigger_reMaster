"""Exact L source inverse for historical unit pins; never screenshots or native state."""
import json
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq03l-declared-relief-edits.json').read_text())
def restore_canyon_l_source(name,source):
    edits=SPEC['files'].get(name)
    if not edits: raise ValueError('Undeclared L source')
    for e in reversed(edits):
        if not e['after'] or source.count(e['after'])!=1: raise AssertionError('L hunk changed/missing/duplicated')
        source=source.replace(e['after'],e['before'],1)
    return source

def restore_canyon_l_if_declared(name,source):
    edits=SPEC['files'].get(name,[])
    return restore_canyon_l_source(name,source) if any(e['after'] in source for e in edits) else source
