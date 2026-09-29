"""M -> L source-only inverse. Never used on native/image/State data."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SPEC=json.loads((ROOT/'tests/baselines/vq04m-declared-art-edits.json').read_text())
if SPEC.get('schema')!='chrono-vq04m-source-only-v1':raise ValueError('Invalid M declaration')
def restore_roof_m_source(name,source,verify=True):
    e=SPEC['files'].get(name)
    if not e or not isinstance(source,str):raise ValueError('Undeclared M source')
    for h in reversed(e['hunks']):
        assert h['after'] and source.count(h['after'])==1,'M missing/duplicate source'
        source=source.replace(h['after'],h['before'],1)
    if verify:assert hashlib.sha256(source.encode()).hexdigest()==e['sha256'],'M unrelated source drift'
    return source
def restore_roof_m_if_declared(name,source):
    e=SPEC['files'].get(name)
    return restore_roof_m_source(name,source,False) if e and isinstance(source,str) and any(h['after'] in source for h in e['hunks']) else source
def roof_m_frozen_bytes(name,data):
    return restore_roof_m_source(name,data.decode()).encode() if name in SPEC['files'] else data
