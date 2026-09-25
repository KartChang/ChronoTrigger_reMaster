"""I offline source pins, not native gameplay evidence."""
import unittest,hashlib
from pathlib import Path
from staging_i_preservation import SPEC,restore_staging_i_source,restore_staging_i_if_declared
ROOT=Path(__file__).resolve().parents[1]
class StagingIPreservationTests(unittest.TestCase):
    def test_exact_ci79_and_identity(self):
        for n in SPEC['files']:
            original=restore_staging_i_source(n,(ROOT/n).read_text())
            self.assertEqual(hashlib.sha256(original.encode()).hexdigest(),SPEC['originalSha256'][n])
            self.assertEqual(restore_staging_i_if_declared(n,original),original)
    def test_missing_duplicate_and_unrelated(self):
        for n,edits in SPEC['files'].items():
            raw=(ROOT/n).read_text()
            for e in edits:
                for bad in [raw.replace(e['after'],''),raw+e['after']]:
                    with self.assertRaises(AssertionError): restore_staging_i_source(n,bad)
            self.assertNotEqual(hashlib.sha256(restore_staging_i_source(n,raw+'\n# unrelated').encode()).hexdigest(),SPEC['originalSha256'][n])
    def test_undeclared(self):
        with self.assertRaises(ValueError):restore_staging_i_source('src/core.ts','none')
