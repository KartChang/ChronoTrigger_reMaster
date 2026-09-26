"""Exact source-only Q -> P; never transforms native game data, reports or pixels."""
from combat_timing_r_preservation import restore_combat_timing_r_if_declared
import json,hashlib
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq03q-declared-reaction-edits.json').read_text())
def restore_reaction_q_source(name,source,verify_base=True):
    source=restore_combat_timing_r_if_declared(name,source)
    edits=SPEC['files'].get(name)
    if not edits:raise ValueError('Undeclared Q source')
    for e in reversed(edits):
        if not e['after'] or source.count(e['after'])!=1:raise AssertionError('Q hunk changed/missing/duplicated')
        source=source.replace(e['after'],e['before'],1)
    if verify_base:assert hashlib.sha256(source.encode()).hexdigest()==SPEC['originalSha256'][name],'Q unrelated source drift'
    return source

def restore_reaction_q_if_declared(name,source):
    source=restore_combat_timing_r_if_declared(name,source)
    return restore_reaction_q_source(name,source,verify_base=False) if any(e['after'] in source for e in SPEC['files'].get(name,[])) else source
