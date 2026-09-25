"""Source provenance checks only; not browser gameplay."""
import unittest,hashlib
from pathlib import Path
from canyon_k_preservation import SPEC,restore_canyon_k_source,restore_canyon_k_if_declared
ROOT=Path(__file__).resolve().parents[1]
class CanyonKPreservationTests(unittest.TestCase):
    def test_exact_ci81_and_identity(self):
        for n in SPEC['files']:
            original=restore_canyon_k_source(n,(ROOT/n).read_text())
            self.assertEqual(hashlib.sha256(original.encode()).hexdigest(),SPEC['originalSha256'][n])
            self.assertEqual(restore_canyon_k_if_declared(n,original),original)
    def test_missing_duplicate_and_unrelated(self):
        for n,edits in SPEC['files'].items():
            raw=(ROOT/n).read_text()
            for e in edits:
                for bad in [raw.replace(e['after'],''),raw+e['after']]:
                    with self.assertRaises(AssertionError):restore_canyon_k_source(n,bad)
            self.assertNotEqual(hashlib.sha256(restore_canyon_k_source(n,raw+'\n# unrelated').encode()).hexdigest(),SPEC['originalSha256'][n])
    def test_original_canyon_fixture_and_undeclared(self):
        self.assertEqual(hashlib.sha256((ROOT/'tests/baselines/ci81-canyon-render.ts').read_bytes()).hexdigest(),SPEC['priorCanyonSha256'])
        with self.assertRaises(ValueError):restore_canyon_k_source('src/core.ts','x')
