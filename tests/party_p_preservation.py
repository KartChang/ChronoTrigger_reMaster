"""Exact source-only P -> O; never transforms native data or changes assertions."""
from reaction_q_preservation import restore_reaction_q_if_declared
import json,hashlib
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq03p-declared-party-edits.json').read_text())
def restore_party_p_source(name,source,verify_base=True):
    source=restore_reaction_q_if_declared(name,source)
    edits=SPEC['files'].get(name)
    if not edits: raise ValueError('Undeclared P source')
    for e in reversed(edits):
        if not e['after'] or source.count(e['after'])!=1: raise AssertionError('P hunk changed/missing/duplicated')
        source=source.replace(e['after'],e['before'],1)
    if verify_base: assert hashlib.sha256(source.encode()).hexdigest()==SPEC['originalSha256'][name],'P unrelated source drift'
    return source

def restore_party_p_if_declared(name,source):
    source=restore_reaction_q_if_declared(name,source)
    return restore_party_p_source(name,source,verify_base=False) if any(e['after'] in source for e in SPEC['files'].get(name,[])) else source

# A composed inverse retains unrelated bytes for downstream historical hash assertions.
