"""J offline source pins, not native gameplay evidence."""
from canyon_k_preservation import restore_canyon_k_if_declared
import unittest,hashlib
from pathlib import Path
from detail_j_preservation import SPEC,restore_detail_j_source,restore_detail_j_if_declared
ROOT=Path(__file__).resolve().parents[1]
class DetailJPreservationTests(unittest.TestCase):
    def test_exact_ci80_and_identity(self):
        for n in SPEC['files']:
            original=restore_detail_j_source(n,(ROOT/n).read_text())
            self.assertEqual(hashlib.sha256(original.encode()).hexdigest(),SPEC['originalSha256'][n])
            self.assertEqual(restore_detail_j_if_declared(n,original),original)
    def test_missing_duplicate_and_unrelated(self):
        for n,edits in SPEC['files'].items():
            raw=restore_canyon_k_if_declared(n,(ROOT/n).read_text())
            for e in edits:
                for bad in [raw.replace(e['after'],''),raw+e['after']]:
                    with self.assertRaises(AssertionError): restore_detail_j_source(n,bad)
            self.assertNotEqual(hashlib.sha256(restore_detail_j_source(n,raw+'\n# unrelated').encode()).hexdigest(),SPEC['originalSha256'][n])
    def test_undeclared(self):
        with self.assertRaises(ValueError):restore_detail_j_source('src/core.ts','none')
