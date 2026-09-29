from roof_m_preservation import SPEC as M_SPEC,restore_roof_m_if_declared,roof_m_frozen_bytes
"""L -> K SOURCE-only inverse. Not a native/image/State transformation."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SPEC=json.loads((ROOT/'tests/baselines/vq04l-declared-art-edits.json').read_text())
if SPEC.get('schema')!='chrono-vq04l-source-only-v1':raise ValueError('Invalid L source declaration')
SPEC['newPaths'].extend(M_SPEC['newPaths'])
def restore_grove_l_source(name,source,verify=True):
    source=restore_roof_m_if_declared(name,source)
    e=SPEC['files'].get(name)
    if not e or not isinstance(source,str):raise ValueError('Undeclared L source')
    for h in reversed(e['hunks']):
        assert h['after'] and source.count(h['after'])==1,'L missing/duplicate source'
        source=source.replace(h['after'],h['before'],1)
    if verify:assert hashlib.sha256(source.encode()).hexdigest()==e['sha256'],'L unrelated source drift'
    return source
def restore_grove_l_if_declared(name,source):
    source=restore_roof_m_if_declared(name,source)
    e=SPEC['files'].get(name)
    return restore_grove_l_source(name,source,False) if e and isinstance(source,str) and any(h['after'] in source for h in e['hunks']) else source
def grove_l_frozen_bytes(name,data):
    data=roof_m_frozen_bytes(name,data)
    return restore_grove_l_source(name,data.decode()).encode() if name in SPEC['files'] else data
