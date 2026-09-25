"""Exact H source inverse for historical offline contracts; never native evidence."""
from staging_i_preservation import restore_staging_i_if_declared
import json
from pathlib import Path
SPEC=json.loads((Path(__file__).parent/'baselines/vq03h-declared-scenery-edits.json').read_text())
def restore_scenery_h_source(name,source):
    source=restore_staging_i_if_declared(name,source)
    edits=SPEC['files'].get(name)
    if not edits: raise ValueError('Undeclared H source')
    for edit in reversed(edits):
        if not edit['after'] or source.count(edit['after'])!=1:
            raise AssertionError('H hunk changed/missing/duplicated')
        source=source.replace(edit['after'],edit['before'],1)
    return source
def restore_scenery_h_if_declared(name,source):
    source=restore_staging_i_if_declared(name,source)
    edits=SPEC['files'].get(name,[])
    return restore_scenery_h_source(name,source) if edits and any(e['after'] in source for e in edits) else source
