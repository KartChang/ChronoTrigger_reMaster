"""F -> E SOURCE-only inverse. Never transforms native evidence, pixels or State."""
import hashlib,json,zlib,base64
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ENVELOPE=json.loads((ROOT/'tests/baselines/vq04f-declared-art-edits.json').read_text())
if ENVELOPE.get('schema')!='chrono-vq04f-source-only-envelope-v1' or not isinstance(ENVELOPE.get('zlibBase64'),list):raise ValueError('Invalid F source envelope')
RAW=zlib.decompress(base64.b64decode(''.join(ENVELOPE['zlibBase64'])))
if hashlib.sha256(RAW).hexdigest()!=ENVELOPE['decodedSha256']:raise ValueError('F source digest mismatch')
SPEC=json.loads(RAW)
def restore_art_f_source(name,source,verify=True):
    e=SPEC['files'].get(name)
    if not e or not isinstance(source,str):raise ValueError('Undeclared F source')
    for h in reversed(e['hunks']):
        assert h['after'] and source.count(h['after'])==1,'F source missing/duplicate/drift'
        source=source.replace(h['after'],h['before'],1)
    if verify:assert hashlib.sha256(source.encode()).hexdigest()==e['sha256'],'F unrelated source drift'
    return source

def restore_art_f_if_declared(name,source):
    e=SPEC['files'].get(name)
    return restore_art_f_source(name,source,False) if e and any(h['after'] in source for h in e['hunks']) else source

def art_f_frozen_bytes(name,data):
    return restore_art_f_source(name,data.decode()).encode() if name in SPEC['files'] else data
