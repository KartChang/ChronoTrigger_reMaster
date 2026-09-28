from production_party_d_preservation import SPEC as D_SPEC,restore_art_d_if_declared,art_d_frozen_bytes
"""Declared source-only C -> B inverse. No native, route, pixels or state input."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SPEC=json.loads((ROOT/'tests/baselines/vq04c-declared-art-edits.json').read_text())
SPEC['newPaths']+=D_SPEC['newPaths']
def restore_art_c_source(name,source,verify=True):
    source=restore_art_d_if_declared(name,source)
    e=SPEC['files'].get(name)
    if not e:raise ValueError('Undeclared C source')
    for h in reversed(e['hunks']):
        assert h['after'] and source.count(h['after'])==1,'C source missing/duplicate/drift'
        source=source.replace(h['after'],h['before'],1)
    if verify:assert hashlib.sha256(source.encode()).hexdigest()==e['sha256'],'C unrelated source drift'
    return source

def restore_art_c_if_declared(name,source):
    source=restore_art_d_if_declared(name,source)
    e=SPEC['files'].get(name)
    return restore_art_c_source(name,source,False) if e and any(h['after'] in source for h in e['hunks']) else source

def art_c_frozen_bytes(name,data):
    data=art_d_frozen_bytes(name,data)
    return restore_art_c_source(name,data.decode()).encode() if name in SPEC['files'] else data
