from detail_j_preservation import restore_detail_j_if_declared
"""Exact source-only I inverse; never modifies native observations or game state."""
import json
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq03i-declared-staging-edits.json').read_text())
def restore_staging_i_source(name,source):
    source=restore_detail_j_if_declared(name,source)
    edits=SPEC['files'].get(name)
    if not edits: raise ValueError('Undeclared I source')
    for e in reversed(edits):
        if not e['after'] or source.count(e['after'])!=1: raise AssertionError('I hunk changed/missing/duplicated')
        source=source.replace(e['after'],e['before'],1)
    return source
def restore_staging_i_if_declared(name,source):
    source=restore_detail_j_if_declared(name,source)
    edits=SPEC['files'].get(name,[])
    return restore_staging_i_source(name,source) if any(e['after'] in source for e in edits) else source
