from rescue_s_preservation import restore_rescue_s_if_declared
"""Exact source-only R -> Q; never transforms native game data, reports or pixels."""
import json,hashlib
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq03r-declared-timing-edits.json').read_text())
def restore_combat_timing_r_source(name,source,verify_base=True):
    source=restore_rescue_s_if_declared(name,source)
    edits=SPEC['files'].get(name)
    if not edits:raise ValueError('Undeclared R source')
    for e in reversed(edits):
        if not e['after'] or source.count(e['after'])!=1:raise AssertionError('R hunk changed/missing/duplicated')
        source=source.replace(e['after'],e['before'],1)
    if verify_base:assert hashlib.sha256(source.encode()).hexdigest()==SPEC['originalSha256'][name],'R unrelated source drift'
    return source

def restore_combat_timing_r_if_declared(name,source):
    source=restore_rescue_s_if_declared(name,source)
    return restore_combat_timing_r_source(name,source,verify_base=False) if any(e['after'] in source for e in SPEC['files'].get(name,[])) else source
