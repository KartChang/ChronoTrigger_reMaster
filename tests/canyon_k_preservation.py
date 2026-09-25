"""Exact script-only K inverse for historical tests; never native evidence."""
from canyon_l_preservation import restore_canyon_l_if_declared
import json
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq03k-declared-script-edits.json').read_text())
def restore_canyon_k_source(name,source):
    source=restore_canyon_l_if_declared(name,source)
    edits=SPEC['files'].get(name)
    if not edits: raise ValueError('Undeclared K script')
    for e in reversed(edits):
        if not e['after'] or source.count(e['after'])!=1: raise AssertionError('K hunk changed/missing/duplicated')
        source=source.replace(e['after'],e['before'],1)
    return source
def restore_canyon_k_if_declared(name,source):
    source=restore_canyon_l_if_declared(name,source)
    edits=SPEC['files'].get(name,[])
    return restore_canyon_k_source(name,source) if any(e['after'] in source for e in edits) else source
