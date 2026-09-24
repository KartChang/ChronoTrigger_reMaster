"""Preservation rejection tests, never native gameplay evidence."""
import hashlib
import json
from pathlib import Path
import unittest
from cpu_render_preservation import EDITS, restore_render_source
from visibility_preservation import restore_visibility_if_declared

ROOT=Path(__file__).resolve().parents[1]
PINNED=json.loads((ROOT/'tests/cpu-journey-preservation.json').read_text())['files']


class RenderPreservationTests(unittest.TestCase):
    def test_exact_inverse_matches_unchanged_original_hashes(self):
        for name in EDITS:
            with self.subTest(name=name):
                source=restore_render_source(name,(ROOT/name).read_text())
                self.assertEqual(hashlib.sha256(source.encode()).hexdigest(),PINNED[name])

    def test_each_declared_change_rejects_modified_or_missing_content(self):
        for name, edits in EDITS.items():
            source=restore_visibility_if_declared(name,(ROOT/name).read_text())
            for i,edit in enumerate(edits):
                for replacement in ('',edit['after'].replace(' ', '\t', 1)):
                    with self.subTest(name=name,edit=i,replacement=bool(replacement)):
                        changed=source.replace(edit['after'],replacement,1)
                        self.assertNotEqual(changed,source)
                        with self.assertRaises(AssertionError):
                            restore_render_source(name,changed)

    def test_duplicate_declared_block_is_rejected(self):
        for name, edits in EDITS.items():
            source=(ROOT/name).read_text()+edits[0]['after']
            with self.assertRaises(AssertionError):restore_render_source(name,source)

    def test_mutation_outside_declared_blocks_still_fails_old_hash(self):
        name='src/cpu-raster.ts';source=(ROOT/name).read_text();changed=source.replace('mode===2?', 'mode===3?',1)
        self.assertNotEqual(changed,source)
        try:restored=restore_render_source(name,changed)
        except AssertionError:return
        self.assertNotEqual(hashlib.sha256(restored.encode()).hexdigest(),PINNED[name])

    def test_other_source_is_not_exempted(self):
        for name in ['src/core.ts','src/main.ts','src/input.ts','src/prologue-render.ts']:
            with self.assertRaises(ValueError):restore_render_source(name,'arbitrary changed code')


if __name__=='__main__':unittest.main()
