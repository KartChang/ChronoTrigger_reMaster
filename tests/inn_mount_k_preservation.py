from grove_l_preservation import SPEC as L_SPEC,restore_grove_l_if_declared,grove_l_frozen_bytes
"""K -> J SOURCE-only inverse; not for native reports, images, State or saves."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SPEC=json.loads((ROOT/'tests/baselines/vq04k-declared-art-edits.json').read_text())
if SPEC.get('schema')!='chrono-vq04k-source-only-v1':raise ValueError('Invalid K source declaration')
SPEC['newPaths'].extend(L_SPEC['newPaths'])
def restore_inn_k_source(name,source,verify=True):
    source=restore_grove_l_if_declared(name,source)
    e=SPEC['files'].get(name)
    if not e or not isinstance(source,str):raise ValueError('Undeclared K source')
    for h in reversed(e['hunks']):
        assert h['after'] and source.count(h['after'])==1,'K missing/duplicate source'
        source=source.replace(h['after'],h['before'],1)
    if verify:assert hashlib.sha256(source.encode()).hexdigest()==e['sha256'],'K unrelated source drift'
    return source
def restore_inn_k_if_declared(name,source):
    source=restore_grove_l_if_declared(name,source)
    e=SPEC['files'].get(name)
    return restore_inn_k_source(name,source,False) if e and any(h['after'] in source for h in e['hunks']) else source
def inn_k_frozen_bytes(name,data):
    data=grove_l_frozen_bytes(name,data)
    return restore_inn_k_source(name,data.decode()).encode() if name in SPEC['files'] else data
