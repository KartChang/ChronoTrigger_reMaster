"""Exact W inverse for offline source contracts; never changes native reports."""
from town_camera_preservation import restore_town_camera_if_declared
import json
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq02w-declared-sign-edits.json').read_text())
def restore_sign_source(name,source,include_town=True):
    if name not in SPEC['files']: raise ValueError('undeclared sign source')
    if include_town: source = restore_town_camera_if_declared(name,source)
    for edit in reversed(SPEC['files'][name]):
        before,after=edit['before'],edit['after']
        if not after or source.count(after)!=1: raise AssertionError('sign edit changed or duplicated')
        source=source.replace(after,before,1)
    return source
