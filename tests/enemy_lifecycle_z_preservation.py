from production_art_a_preservation import restore_art_a_if_declared
"""Exact Z -> Y declared source inverse; never native/state/framebuffer input."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SPEC=json.loads((ROOT/'tests/baselines/vq03z-declared-lifecycle-edits.json').read_text())
def restore_lifecycle_z_source(name,source,verify_base=True):
    source=restore_art_a_if_declared(name,source)
    edits=SPEC['files'].get(name)
    if not edits:raise ValueError('Undeclared Z source')
    for e in reversed(edits):
        assert e['after'] and source.count(e['after'])==1,'Z hunk changed/missing/duplicated'
        source=source.replace(e['after'],e['before'],1)
    if verify_base:assert hashlib.sha256(source.encode()).hexdigest()==SPEC['originalSha256'][name],'Z unrelated source drift'
    return source

def restore_lifecycle_z_if_declared(name,source):
    source=restore_art_a_if_declared(name,source)
    return restore_lifecycle_z_source(name,source,False) if any(e['after'] in source for e in SPEC['files'].get(name,[])) else source
