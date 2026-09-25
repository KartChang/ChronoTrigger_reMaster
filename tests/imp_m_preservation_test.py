"""Source pinning only, no native state/evidence transforms."""
import hashlib,unittest
from pathlib import Path
from action_n_preservation import restore_action_n_if_declared
from imp_m_preservation import SPEC,restore_imp_m_source,restore_imp_m_if_declared
ROOT=Path(__file__).resolve().parents[1]
class ImpMSourceTests(unittest.TestCase):
    def test_exact_and_identity(self):
        for n in SPEC['files']:
            old=restore_imp_m_source(n,(ROOT/n).read_text())
            self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),SPEC['originalSha256'][n])
            self.assertEqual(restore_imp_m_if_declared(n,old),old)
    def test_missing_duplicate_unrelated(self):
        for n,edits in SPEC['files'].items():
            s=restore_action_n_if_declared(n,(ROOT/n).read_text())
            for e in edits:
                for bad in [s+e['after'],s.replace(e['after'],'',1)]:
                    with self.assertRaises(AssertionError):restore_imp_m_source(n,bad)
            self.assertNotEqual(hashlib.sha256(restore_imp_m_source(n,s+'\n# unrelated').encode()).hexdigest(),SPEC['originalSha256'][n])
    def test_original_renderer_and_forbidden(self):
        self.assertEqual(hashlib.sha256((ROOT/'tests/baselines/ci83-render.ts').read_bytes()).hexdigest(),SPEC['originalSha256']['src/render.ts'])
        with self.assertRaises(ValueError):restore_imp_m_source('src/core.ts','x')
