from production_character_e_preservation import SPEC as E_SPEC,restore_art_e_if_declared,art_e_frozen_bytes
"""D source-only inverse. Does not accept native reports, gameplay or image data."""
import hashlib,json,zlib,base64
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ENCODED=json.loads((ROOT/'tests/baselines/vq04d-declared-art-edits.json').read_text())
SPEC=json.loads(zlib.decompress(base64.b64decode(ENCODED['zlibBase64'])))
SPEC['newPaths']+=E_SPEC['newPaths']
def restore_art_d_source(name,source,verify=True):
    source=restore_art_e_if_declared(name,source)
    e=SPEC['files'].get(name)
    if not e:raise ValueError('Undeclared D source')
    for h in reversed(e['hunks']):
        assert h['after'] and source.count(h['after'])==1,'D source missing/duplicate/drift'
        source=source.replace(h['after'],h['before'],1)
    if verify:assert hashlib.sha256(source.encode()).hexdigest()==e['sha256'],'D unrelated source drift'
    return source

def restore_art_d_if_declared(name,source):
    source=restore_art_e_if_declared(name,source)
    e=SPEC['files'].get(name)
    return restore_art_d_source(name,source,False) if e and any(h['after'] in source for h in e['hunks']) else source

def art_d_frozen_bytes(name,data):
    data=art_e_frozen_bytes(name,data)
    return restore_art_d_source(name,data.decode()).encode() if name in SPEC['files'] else data
