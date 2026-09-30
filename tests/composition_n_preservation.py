"""N -> M source-only preservation; never transforms native/image/State data."""
import hashlib,json
from row_o_preservation import SPEC as O_SPEC,restore_row_o_if_declared,row_o_frozen_bytes
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SPEC=json.loads((ROOT/'tests/baselines/vq04n-declared-art-edits.json').read_text())
SPEC['newPaths'].extend(O_SPEC['newPaths'])
if SPEC.get('schema')!='chrono-vq04n-source-only-v1':raise ValueError('Invalid N declaration')
def restore_composition_n_source(name,source,verify=True):
    source=restore_row_o_if_declared(name,source)
    e=SPEC['files'].get(name)
    if not e or not isinstance(source,str):raise ValueError('Undeclared N source')
    for h in reversed(e['hunks']):
        assert h['after'] and source.count(h['after'])==1,'N missing/duplicate source'
        source=source.replace(h['after'],h['before'],1)
    if verify:assert hashlib.sha256(source.encode()).hexdigest()==e['sha256'],'N unrelated source drift'
    return source
def restore_composition_n_if_declared(name,source):
    source=restore_row_o_if_declared(name,source)
    e=SPEC['files'].get(name)
    return restore_composition_n_source(name,source,False) if e and isinstance(source,str) and any(h['after'] in source for h in e['hunks']) else source
def composition_n_frozen_bytes(name,data):
    data=row_o_frozen_bytes(name,data)
    return restore_composition_n_source(name,data.decode()).encode() if name in SPEC['files'] else data
