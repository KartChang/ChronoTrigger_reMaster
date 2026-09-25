"""Exact test-only source inverse, never transforms native reports/pixels."""
import json
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq03n-declared-action-edits.json').read_text())
def restore_action_n_source(name,source):
    edits=SPEC['files'].get(name)
    if not edits: raise ValueError('Undeclared N source')
    for e in reversed(edits):
        if not e['after'] or source.count(e['after'])!=1: raise AssertionError('N hunk changed/missing/duplicated')
        source=source.replace(e['after'],e['before'],1)
    return source

def restore_action_n_if_declared(name,source):
    return restore_action_n_source(name,source) if any(e['after'] in source for e in SPEC['files'].get(name,[])) else source
