"""Exact source-only S -> R; never transform native reports, game state or pixels."""
import json,hashlib
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq03s-declared-rescue-edits.json').read_text())
def restore_rescue_s_source(name,source,verify_base=True):
    edits=SPEC['files'].get(name)
    if not edits:raise ValueError('Undeclared S source')
    for e in reversed(edits):
        if not e['after'] or source.count(e['after'])!=1:raise AssertionError('S hunk changed/missing/duplicated')
        source=source.replace(e['after'],e['before'],1)
    if verify_base:assert hashlib.sha256(source.encode()).hexdigest()==SPEC['originalSha256'][name],'S unrelated source drift'
    return source

def restore_rescue_s_if_declared(name,source):
    return restore_rescue_s_source(name,source,verify_base=False) if any(e['after'] in source for e in SPEC['files'].get(name,[])) else source
