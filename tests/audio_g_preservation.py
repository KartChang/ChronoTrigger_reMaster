from scenery_h_preservation import restore_scenery_h_if_declared
"""Strict test-only G build/test inverse. Never alters native reports or game state."""
import json
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq03g-declared-audio-edits.json').read_text())
def restore_audio_g_source(name,source):
    source=restore_scenery_h_if_declared(name,source)
    edits=SPEC['files'].get(name)
    if not edits: raise ValueError('undeclared G source')
    for edit in reversed(edits):
        if not edit['after'] or source.count(edit['after'])!=1:
            raise AssertionError('G hunk changed/missing/duplicated')
        source=source.replace(edit['after'],edit['before'],1)
    return source
def restore_audio_g_if_declared(name,source):
    source=restore_scenery_h_if_declared(name,source)
    edits=SPEC['files'].get(name,[])
    return restore_audio_g_source(name,source) if edits and any(e['after'] in source for e in edits) else source
