from enemy_lifecycle_z_preservation import restore_lifecycle_z_if_declared
"""Y -> X source-only inverse. Original native data/assertions are not inputs."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SPEC=json.loads((ROOT/'tests/baselines/vq03y-declared-field-build-edits.json').read_text())
def restore_native_build_y_source(name,source,verify_base=True):
    source=restore_lifecycle_z_if_declared(name,source)
    edits=SPEC['files'].get(name)
    if not edits:raise ValueError('Undeclared Y source')
    for e in reversed(edits):
        assert e['after'] and source.count(e['after'])==1,'Y hunk changed/missing/duplicated'
        source=source.replace(e['after'],e['before'],1)
    if verify_base:assert hashlib.sha256(source.encode()).hexdigest()==SPEC['originalSha256'][name],'Y unrelated source drift'
    return source

def restore_native_build_y_if_declared(name,source):
    source=restore_lifecycle_z_if_declared(name,source)
    return restore_native_build_y_source(name,source,False) if any(e['after'] in source for e in SPEC['files'].get(name,[])) else source
