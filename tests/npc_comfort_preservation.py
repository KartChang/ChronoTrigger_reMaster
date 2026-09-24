"""Strict E -> D offline source inverse, never a runtime/evidence transform."""
import json
from pathlib import Path
SPEC = json.loads((Path(__file__).parent / 'baselines/vq03e-declared-npc-comfort-edits.json').read_text())
def restore_npc_comfort_source(name, source):
    edits = SPEC['files'].get(name)
    if not edits: raise ValueError('undeclared NPC comfort source')
    for e in reversed(edits):
        if not e['after'] or source.count(e['after']) != 1: raise AssertionError('NPC comfort hunk missing/modified/duplicated')
        source = source.replace(e['after'], e['before'], 1)
    return source
def restore_npc_comfort_if_declared(name, source):
    edits = SPEC['files'].get(name, [])
    return restore_npc_comfort_source(name, source) if edits and any(e['after'] in source for e in edits) else source
