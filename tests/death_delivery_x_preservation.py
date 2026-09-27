"""Exact X -> W source-only inverse. Never accepts native report/state/pixels."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SPEC=json.loads((ROOT/'tests/baselines/vq03x-declared-death-delivery-edits.json').read_text())
def restore_death_delivery_x_source(name,source,verify_base=True):
    edits=SPEC['files'].get(name)
    if not edits:raise ValueError('Undeclared X source')
    for e in reversed(edits):
        assert e['after'] and source.count(e['after'])==1,'X hunk changed/missing/duplicated'
        source=source.replace(e['after'],e['before'],1)
    if verify_base:assert hashlib.sha256(source.encode()).hexdigest()==SPEC['originalSha256'][name],'X unrelated source drift'
    return source

def restore_death_delivery_x_if_declared(name,source):
    return restore_death_delivery_x_source(name,source,False) if any(e['after'] in source for e in SPEC['files'].get(name,[])) else source
