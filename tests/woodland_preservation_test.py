from pathlib import Path
import hashlib,unittest
from woodland_preservation import restore_woodland_source,SPEC
ROOT=Path(__file__).resolve().parents[1]
class WoodlandPreservationTests(unittest.TestCase):
    def test_original_ci59_hashes_unchanged(self):
        for name in SPEC['files']:
            with self.subTest(name=name):
                restored=restore_woodland_source(name,(ROOT/name).read_text())
                self.assertEqual(hashlib.sha256(restored.encode()).hexdigest(),SPEC['originalSha256'][name])
    def test_each_missing_or_duplicate_hunk_rejected(self):
        for name,edits in SPEC['files'].items():
            source=(ROOT/name).read_text()
            for i,e in enumerate(edits):
                for changed in [source.replace(e['after'],'',1),source+e['after']]:
                    with self.subTest(name=name,index=i),self.assertRaises(AssertionError):restore_woodland_source(name,changed)
    def test_unrelated_content_is_never_erased(self):
        for name in SPEC['files']:
            b=restore_woodland_source(name,(ROOT/name).read_text()+'\n# MUTATED\n')
            self.assertNotEqual(hashlib.sha256(b.encode()).hexdigest(),SPEC['originalSha256'][name])
    def test_no_exemption_for_rules_or_held_home(self):
        for name in ['src/core.ts','src/input.ts','src/main.ts','src/prologue-render.ts']:
            with self.assertRaises(ValueError):restore_woodland_source(name,'changed')
if __name__=='__main__':unittest.main()
