from production_art_b_preservation import SPEC as B_SPEC,restore_art_b_if_declared,art_b_frozen_bytes
"""Declared source inverse for frozen component tests, never native/game/pixel input."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SPEC=json.loads((ROOT/'tests/baselines/vq04a-declared-art-edits.json').read_text())
SPEC['newPaths']+=B_SPEC['newPaths']
def restore_art_a_source(name,source,verify_base=True):
    source=restore_art_b_if_declared(name,source)
    edits=SPEC['files'].get(name)
    if not edits:raise ValueError('Undeclared art source')
    for e in reversed(edits):
        assert e['after'] and source.count(e['after'])==1,'Art hunk changed/missing/duplicated'
        source=source.replace(e['after'],e['before'],1)
    if verify_base:assert hashlib.sha256(source.encode()).hexdigest()==SPEC['originalSha256'][name],'Unrelated art source drift'
    return source

def restore_art_a_if_declared(name,source):
    source=restore_art_b_if_declared(name,source)
    return restore_art_a_source(name,source,False) if any(e['after'] in source for e in SPEC['files'].get(name,[])) else source

def art_a_frozen_bytes(name,data):
    data=art_b_frozen_bytes(name,data)
    return restore_art_a_source(name,data.decode()).encode() if name in SPEC['files'] else data
