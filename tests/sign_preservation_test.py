"""Unit-only W inverse: complete hashes, missing/duplicate edits and exclusions."""
import unittest,hashlib
from pathlib import Path
from sign_preservation import restore_sign_source,SPEC
from town_camera_preservation import restore_town_camera_if_declared
ROOT=Path(__file__).resolve().parents[1]
class SignPreservationTests(unittest.TestCase):
    def test_exact_v_hashes(self):
        for name,want in SPEC['originalSha256'].items():
            with self.subTest(name=name):self.assertEqual(hashlib.sha256(restore_sign_source(name,(ROOT/name).read_text()).encode()).hexdigest(),want)
    def test_last_edit_missing_or_duplicated_fails(self):
        for name,edits in SPEC['files'].items():
            s=restore_town_camera_if_declared(name,(ROOT/name).read_text());a=edits[-1]['after'];self.assertEqual(s.count(a),1)
            for changed in [s.replace(a,''),s+a]:
                with self.subTest(name=name),self.assertRaises(AssertionError):restore_sign_source(name,changed,include_town=False)
    def test_unrelated_content_cannot_be_erased(self):
        for name,want in SPEC['originalSha256'].items():
            actual=restore_sign_source(name,(ROOT/name).read_text()+'\n# unrelated change\n')
            self.assertNotEqual(hashlib.sha256(actual.encode()).hexdigest(),want)
    def test_no_exemptions_for_game_or_browser_inputs(self):
        for name in ['src/main.ts','src/core.ts','src/render.ts','src/input.ts','src/prologue-render.ts','src/cpu-engine.ts','.github/workflows/ci.yml','tests/cpu_era_route.py']:
            with self.subTest(name=name),self.assertRaises(ValueError):restore_sign_source(name,'changed')
if __name__=='__main__':unittest.main()
