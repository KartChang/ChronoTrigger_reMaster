"""Exact U -> T source inverse. Never transforms native game/state/reports/pixels."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SPEC=json.loads((ROOT/'tests/baselines/vq03u-declared-trial-edits.json').read_text())
def restore_trial_u_source(name,source,verify_base=True):
    edits=SPEC['files'].get(name)
    if not edits:raise ValueError('Undeclared U source')
    for e in reversed(edits):
        if not e['after'] or source.count(e['after'])!=1:raise AssertionError('U hunk changed/missing/duplicated')
        source=source.replace(e['after'],e['before'],1)
    if verify_base:assert hashlib.sha256(source.encode()).hexdigest()==SPEC['originalSha256'][name],'U unrelated source drift'
    return source

def restore_trial_u_if_declared(name,source):
    return restore_trial_u_source(name,source,False) if any(e['after'] in source for e in SPEC['files'].get(name,[])) else source
