"""Only the declared NPC scene/presentation additions are removable for old-source comparisons."""
import json
from pathlib import Path
EDITS=json.loads((Path(__file__).parent/'baselines/vq02q-declared-scene-edits.json').read_text())['files']
def restore_story_source(name, source):
    if name not in EDITS: raise ValueError('undeclared story source')
    for e in reversed(EDITS[name]):
        if source.count(e['after']) != 1: raise AssertionError('story edit missing, duplicated or modified')
        source=source.replace(e['after'], e['before'], 1)
    return source
