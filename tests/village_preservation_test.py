import hashlib,unittest
from pathlib import Path
from village_preservation import SPEC,restore_village_source
ROOT=Path(__file__).resolve().parents[1]
class VillagePreservationTests(unittest.TestCase):
    def test_each_exact_ci60_source_remains_recoverable(self):
        for name in SPEC['files']:
            with self.subTest(name=name):
                self.assertEqual(hashlib.sha256(restore_village_source(name,(ROOT/name).read_text()).encode()).hexdigest(),SPEC['originalSha256'][name])
    def test_missing_duplicate_and_unrelated_changes_not_exempted(self):
        for name,edits in SPEC['files'].items():
            source=(ROOT/name).read_text()
            for edit in edits:
                for bad in (source.replace(edit['after'],'',1),source+edit['after']):
                    with self.subTest(name=name),self.assertRaises(AssertionError):restore_village_source(name,bad)
            self.assertNotEqual(hashlib.sha256(restore_village_source(name,source+'\n# unrelated\n').encode()).hexdigest(),SPEC['originalSha256'][name])
    def test_rules_and_held_home_have_no_exemption(self):
        for name in ('src/core.ts','src/main.ts','src/input.ts','src/prologue-render.ts'):
            with self.assertRaises(ValueError):restore_village_source(name,'changed')
if __name__=='__main__':unittest.main()
