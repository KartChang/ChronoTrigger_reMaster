"""Only the declared NPC scene/presentation additions are removable for old-source comparisons."""
import json
from town_camera_preservation import restore_town_camera_if_declared
from woodland_preservation import restore_woodland_source
from pathlib import Path
EDITS=json.loads((Path(__file__).parent/'baselines/vq02q-declared-scene-edits.json').read_text())['files']
def restore_story_source(name, source, include_woodland=True):
    if name == "src/render.ts": source = restore_town_camera_if_declared(name,source)
    if include_woodland and name == "src/kingdom-render.ts": source = restore_woodland_source(name, source)
    if name not in EDITS: raise ValueError('undeclared story source')
    for e in reversed(EDITS[name]):
        if source.count(e['after']) != 1: raise AssertionError('story edit missing, duplicated or modified')
        source=source.replace(e['after'], e['before'], 1)
    return source
