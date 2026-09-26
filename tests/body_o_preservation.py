from party_p_preservation import restore_party_p_if_declared
"""Exact test-only O -> N source inverse; not applied to native evidence."""
import json
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq03o-declared-body-edits.json').read_text())
def restore_body_o_source(name,source):
    source=restore_party_p_if_declared(name,source)
    edits=SPEC['files'].get(name)
    if not edits: raise ValueError('Undeclared O source')
    for e in reversed(edits):
        if not e['after'] or source.count(e['after'])!=1: raise AssertionError('O hunk changed/missing/duplicated')
        source=source.replace(e['after'],e['before'],1)
    return source

def restore_body_o_if_declared(name,source):
    source=restore_party_p_if_declared(name,source)
    return restore_body_o_source(name,source) if any(e['after'] in source for e in SPEC['files'].get(name,[])) else source
