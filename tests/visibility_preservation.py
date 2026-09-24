"""Strict D -> C offline source inverse. Never used by native browser journeys."""
import json
from pathlib import Path
SPEC = json.loads((Path(__file__).parent / 'baselines/vq03d-declared-visibility-edits.json').read_text())

def restore_visibility_source(name, source):
    edits = SPEC['files'].get(name)
    if not edits:
        raise ValueError('undeclared visibility source')
    for edit in reversed(edits):
        if not edit['after'] or source.count(edit['after']) != 1:
            raise AssertionError('visibility edit missing or duplicated')
        source = source.replace(edit['after'], edit['before'], 1)
    return source

def restore_visibility_if_declared(name, source):
    edits = SPEC['files'].get(name, [])
    return restore_visibility_source(name, source) if edits and any(e['after'] in source for e in edits) else source
