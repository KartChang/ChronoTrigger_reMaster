"""Offline F -> exact E source inverse only, not native evidence rewriting."""
from audio_g_preservation import restore_audio_g_if_declared
import json
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq03f-declared-fair-trial-edits.json').read_text())
def restore_fair_trial_source(name,source):
    source=restore_audio_g_if_declared(name,source)
    edits=SPEC['files'].get(name)
    if not edits: raise ValueError('undeclared fair/trial source')
    for e in reversed(edits):
        if not e['after'] or source.count(e['after'])!=1: raise AssertionError('fair/trial hunk changed/missing/duplicated')
        source=source.replace(e['after'],e['before'],1)
    return source
def restore_fair_trial_if_declared(name,source):
    source=restore_audio_g_if_declared(name,source)
    edits=SPEC['files'].get(name,[])
    return restore_fair_trial_source(name,source) if edits and any(e['after'] in source for e in edits) else source
