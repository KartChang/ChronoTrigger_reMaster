from trial_u_preservation import restore_trial_u_if_declared
"""Exact source-only T -> S. Native state, reports and pixels are never inputs."""
import json,hashlib
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq03t-declared-rescue-body-edits.json').read_text())
def restore_rescue_body_t_source(name,source,verify_base=True):
    source=restore_trial_u_if_declared(name,source)
    edits=SPEC['files'].get(name)
    if not edits:raise ValueError('Undeclared T source')
    for e in reversed(edits):
        if not e['after'] or source.count(e['after'])!=1:raise AssertionError('T hunk changed/missing/duplicated')
        source=source.replace(e['after'],e['before'],1)
    if verify_base:assert hashlib.sha256(source.encode()).hexdigest()==SPEC['originalSha256'][name],'T unrelated source drift'
    return source

def restore_rescue_body_t_if_declared(name,source):
    source=restore_trial_u_if_declared(name,source)
    return restore_rescue_body_t_source(name,source,verify_base=False) if any(e['after'] in source for e in SPEC['files'].get(name,[])) else source
