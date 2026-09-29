"""J -> I SOURCE-only preservation. Never an image, game-state or native-report transform."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SPEC=json.loads((ROOT/'tests/baselines/vq04j-declared-art-edits.json').read_text())
if SPEC.get('schema')!='chrono-vq04j-source-only-v1':raise ValueError('Invalid J source declaration')
def restore_sight_j_source(name,source,verify=True):
    e=SPEC['files'].get(name)
    if not e or not isinstance(source,str):raise ValueError('Undeclared J source')
    for h in reversed(e['hunks']):
        assert h['after'] and source.count(h['after'])==1,'J missing/duplicate source'
        source=source.replace(h['after'],h['before'],1)
    if verify:assert hashlib.sha256(source.encode()).hexdigest()==e['sha256'],'J unrelated source drift'
    return source
def restore_sight_j_if_declared(name,source):
    e=SPEC['files'].get(name)
    return restore_sight_j_source(name,source,False) if e and any(h['after'] in source for h in e['hunks']) else source
def sight_j_frozen_bytes(name,data):
    return restore_sight_j_source(name,data.decode()).encode() if name in SPEC['files'] else data
