"""Source-only exact J inverse, not a native evidence transform."""
import json
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq03j-declared-detail-edits.json').read_text())
def restore_detail_j_source(name,source):
    edits=SPEC['files'].get(name)
    if not edits: raise ValueError('Undeclared J source')
    for e in reversed(edits):
        if not e['after'] or source.count(e['after'])!=1: raise AssertionError('J hunk changed/missing/duplicated')
        source=source.replace(e['after'],e['before'],1)
    return source
def restore_detail_j_if_declared(name,source):
    edits=SPEC['files'].get(name,[])
    return restore_detail_j_source(name,source) if any(e['after'] in source for e in edits) else source
