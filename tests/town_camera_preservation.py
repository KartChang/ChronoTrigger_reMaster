"""Exact X inverse for old source assertions only; not native state/report mutation."""
import json
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq02x-declared-town-camera-edits.json').read_text())
ZSPEC=json.loads((Path(__file__).parent/'baselines/vq02z-declared-sign-occlusion-edits.json').read_text())
ASPEC=json.loads((Path(__file__).parent/'baselines/vq03a-declared-building-edits.json').read_text())
def restore_building_if_declared(name,source):
    edits=ASPEC['files'].get(name,[])
    if edits and any(e['after'] in source for e in edits):
        for edit in reversed(edits):
            if not edit['after'] or source.count(edit['after'])!=1: raise AssertionError('building edit missing, duplicated or changed')
            source=source.replace(edit['after'],edit['before'],1)
    return source
def restore_sign_occlusion_if_declared(name,source):
    source=restore_building_if_declared(name,source)
    for edit in reversed(ZSPEC['files'].get(name,[])):
        before,after=edit['before'],edit['after']
        if not after or source.count(after)!=1: raise AssertionError('sign occlusion edit missing, duplicated or changed')
        source=source.replace(after,before,1)
    return source
def restore_town_camera_if_declared(name,source,include_sign=True):
    if include_sign: source=restore_sign_occlusion_if_declared(name,source)
    for edit in reversed(SPEC['files'].get(name,[])):
        before,after=edit['before'],edit['after']
        if not after or source.count(after)!=1: raise AssertionError('town camera edit missing, duplicated or changed')
        source=source.replace(after,before,1)
    return source
