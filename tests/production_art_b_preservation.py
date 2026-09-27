"""Exact source-only B -> A compatibility. Never accepts native/game/pixel data."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SPEC=json.loads((ROOT/'tests/baselines/vq04b-declared-art-edits.json').read_text())
def restore_art_b_source(name,source,verify=True):
    e=SPEC['files'].get(name)
    if not e:raise ValueError('Undeclared B source')
    for h in reversed(e['hunks']):
        assert h['after'] and source.count(h['after'])==1,'B source missing/duplicate/drift'
        source=source.replace(h['after'],h['before'],1)
    if verify:assert hashlib.sha256(source.encode()).hexdigest()==e['sha256'],'B unrelated source drift'
    return source

def restore_art_b_if_declared(name,source):
    e=SPEC['files'].get(name)
    return restore_art_b_source(name,source,False) if e and any(h['after'] in source for h in e['hunks']) else source

def art_b_frozen_bytes(name,data):
    return restore_art_b_source(name,data.decode()).encode() if name in SPEC['files'] else data
