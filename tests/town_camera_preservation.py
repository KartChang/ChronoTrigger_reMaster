"""Exact X inverse for old source assertions only; not native state/report mutation."""
import json
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq02x-declared-town-camera-edits.json').read_text())
def restore_town_camera_if_declared(name,source):
    for edit in reversed(SPEC['files'].get(name,[])):
        before,after=edit['before'],edit['after']
        if not after or source.count(after)!=1: raise AssertionError('town camera edit missing, duplicated or changed')
        source=source.replace(after,before,1)
    return source
