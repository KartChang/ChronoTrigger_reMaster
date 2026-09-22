"""Unit-only exact inverse of reviewed P raster edits; no expected hash update.

The original K/CI57 source hashes stay authoritative for all unchanged bytes.
New renderer semantics separately require byte-exact differential Node tests.
This module does not run in the game or any browser journey.
"""
import json
from pathlib import Path

EDITS = json.loads((Path(__file__).parent/'baselines/vq02p-declared-render-edits.json').read_text())['files']


def restore_render_source(name, source):
    if name not in EDITS:
        raise ValueError('not an explicitly declared renderer edit')
    for edit in EDITS[name]:
        after, before = edit['after'], edit['before']
        if not after or source.count(after) != 1:
            raise AssertionError('declared renderer edit changed or duplicated')
        source = source.replace(after, before, 1)
    return source
