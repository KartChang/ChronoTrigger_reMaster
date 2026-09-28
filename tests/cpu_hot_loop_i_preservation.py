"""I -> H SOURCE-only inverse. Not usable on native reports, pixels or game State."""
import hashlib,json,zlib,base64
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
E=json.loads((ROOT/'tests/baselines/vq04i-declared-cpu-edits.json').read_text())
if E.get('schema')!='chrono-vq04i-source-only-envelope-v1' or not isinstance(E.get('zlibBase64'),list):raise ValueError('Invalid I source envelope')
RAW=zlib.decompress(base64.b64decode(''.join(E['zlibBase64'])))
if hashlib.sha256(RAW).hexdigest()!=E['decodedSha256']:raise ValueError('I source digest mismatch')
SPEC=json.loads(RAW)
def restore_cpu_i_source(name,source,verify=True):
    e=SPEC['files'].get(name)
    if not e or not isinstance(source,str):raise ValueError('Undeclared I source')
    for h in reversed(e['hunks']):
        assert h['after'] and source.count(h['after'])==1,'I source missing/duplicate/drift'
        source=source.replace(h['after'],h['before'],1)
    if verify:assert hashlib.sha256(source.encode()).hexdigest()==e['sha256'],'I unrelated source drift'
    return source

def restore_cpu_i_if_declared(name,source):
    e=SPEC['files'].get(name)
    return restore_cpu_i_source(name,source,False) if e and any(h['after'] in source for h in e['hunks']) else source

def cpu_i_frozen_bytes(name,data):
    return restore_cpu_i_source(name,data.decode()).encode() if name in SPEC['files'] else data
