"""Source provenance only; no browser or gameplay replay."""
import hashlib,unittest
from pathlib import Path
from canyon_l_preservation import SPEC,restore_canyon_l_source,restore_canyon_l_if_declared
ROOT=Path(__file__).resolve().parents[1]
class CanyonLPreservationTests(unittest.TestCase):
    def test_exact_ci82_source(self):
        for n in SPEC['files']:
            original=restore_canyon_l_source(n,(ROOT/n).read_text())
            self.assertEqual(hashlib.sha256(original.encode()).hexdigest(),SPEC['originalSha256'][n])
            self.assertEqual(restore_canyon_l_if_declared(n,original),original)
    def test_negative_guards(self):
        for n,edits in SPEC['files'].items():
            raw=(ROOT/n).read_text()
            for e in edits:
                for bad in [raw.replace(e['after'],''),raw+e['after']]:
                    with self.assertRaises(AssertionError):restore_canyon_l_source(n,bad)
            self.assertNotEqual(hashlib.sha256(restore_canyon_l_source(n,raw+'\n# unrelated').encode()).hexdigest(),SPEC['originalSha256'][n])
    def test_original_renderer_and_unknown(self):
        self.assertEqual(hashlib.sha256((ROOT/'tests/baselines/ci82-canyon-render.ts').read_bytes()).hexdigest(),SPEC['originalSha256']['src/canyon-render.ts'])
        with self.assertRaises(ValueError):restore_canyon_l_source('src/core.ts','x')
