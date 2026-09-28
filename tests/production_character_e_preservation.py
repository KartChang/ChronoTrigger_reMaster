from production_place_f_preservation import SPEC as F_SPEC,restore_art_f_if_declared,art_f_frozen_bytes
"""E -> D declared SOURCE-only inverse. Never native, image, State or route input."""
import hashlib,json,zlib,base64
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
# Lossless whole-spec compression; decoded hunks are byte-identical to the prior encoding.
ENCODED=json.loads((ROOT/'tests/baselines/vq04e-declared-art-edits.json').read_text())
if ENCODED.get('schema')!='chrono-vq04e-source-only-envelope-v1' or not isinstance(ENCODED.get('zlibBase64'),list):raise ValueError('Invalid E source envelope')
DECODED=zlib.decompress(base64.b64decode(''.join(ENCODED['zlibBase64'])))
if hashlib.sha256(DECODED).hexdigest()!=ENCODED['decodedSha256']:raise ValueError('E source envelope digest mismatch')
SPEC=json.loads(DECODED)
SPEC['newPaths']+=F_SPEC['newPaths']
def restore_art_e_source(name,source,verify=True):
    source=restore_art_f_if_declared(name,source)
    e=SPEC['files'].get(name)
    if not e or not isinstance(source,str):raise ValueError('Undeclared E source')
    for h in reversed(e['hunks']):
        assert h['after'] and source.count(h['after'])==1,'E source missing/duplicate/drift'
        source=source.replace(h['after'],h['before'],1)
    if verify:assert hashlib.sha256(source.encode()).hexdigest()==e['sha256'],'E unrelated source drift'
    return source

def restore_art_e_if_declared(name,source):
    source=restore_art_f_if_declared(name,source)
    e=SPEC['files'].get(name)
    return restore_art_e_source(name,source,False) if e and any(h['after'] in source for h in e['hunks']) else source

def art_e_frozen_bytes(name,data):
    data=art_f_frozen_bytes(name,data)
    return restore_art_e_source(name,data.decode()).encode() if name in SPEC['files'] else data
