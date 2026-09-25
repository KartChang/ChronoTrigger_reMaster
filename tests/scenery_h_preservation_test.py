"""Offline text regressions only; no browser/state/report alteration."""
from staging_i_preservation import restore_staging_i_if_declared
import unittest,hashlib
from pathlib import Path
from scenery_h_preservation import SPEC,restore_scenery_h_source,restore_scenery_h_if_declared
ROOT=Path(__file__).resolve().parents[1]
class SceneryHPreservationTests(unittest.TestCase):
    def test_exact_original_and_stable_prior_source(self):
        for n in SPEC['files']:
            with self.subTest(path=n):
                base=restore_scenery_h_source(n,(ROOT/n).read_text())
                self.assertEqual(restore_scenery_h_if_declared(n,base),base)
    def test_missing_duplicate_and_unrelated_rejected(self):
        for n,edits in SPEC['files'].items():
            raw=restore_staging_i_if_declared(n,(ROOT/n).read_text())  # Test the original H hunks after the declared I inverse.
            for e in edits:
                for bad in [raw.replace(e['after'],''),raw+e['after']]:
                    with self.subTest(path=n),self.assertRaises(AssertionError):restore_scenery_h_source(n,bad)
            preserved=restore_scenery_h_source(n,raw+'\n# unrelated')
            self.assertTrue(preserved.endswith('\n# unrelated'))
            self.assertNotEqual(hashlib.sha256(preserved.encode()).hexdigest(),SPEC['originalSha256'][n])
    def test_undeclared_rejected(self):
        with self.assertRaises(ValueError):restore_scenery_h_source('src/main.ts','none')
if __name__=='__main__':unittest.main()
