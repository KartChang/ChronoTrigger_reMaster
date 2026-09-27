"""Offline integrity only; no new browser journey, waits or capture points."""
import hashlib,json,unittest
from enemy_lifecycle_z_preservation import ROOT,SPEC,restore_lifecycle_z_source,restore_lifecycle_z_if_declared
class LifecycleZ(unittest.TestCase):
    def test_all_declared_sources_keep_original_hashes_and_reject_mutations(self):
        for name,edits in SPEC['files'].items():
            raw=(ROOT/name).read_text();old=restore_lifecycle_z_source(name,raw)
            self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),SPEC['originalSha256'][name],name)
            self.assertEqual(restore_lifecycle_z_if_declared(name,old),old)
            for e in edits:
                for bad in [raw.replace(e['after'],'',1),raw+e['after'],raw+'\n# drift\n']:
                    with self.subTest(name=name),self.assertRaises(AssertionError):restore_lifecycle_z_source(name,bad)
    def test_native_data_is_not_a_source_inverse_input(self):
        for name in ['native.json','src/core.ts','tests/field_enemy_action.py']:
            with self.assertRaises(ValueError):restore_lifecycle_z_source(name,'{}')
    def test_unchanged_program_and_native_inputs(self):
        pin=json.loads((ROOT/'tests/baselines/vq03z-unchanged-inputs.json').read_text());names=list(pin['rootFiles'])
        for directory in pin['roots']:
            for p in (ROOT/directory).rglob('*'):
                if '__pycache__' in p.parts or p.suffix=='.pyc':continue
                self.assertFalse(p.is_symlink())
                if p.is_file():names.append(p.relative_to(ROOT).as_posix())
        rows=[[n,hashlib.sha256((ROOT/n).read_bytes()).hexdigest()] for n in sorted(names) if n not in pin['exclude']]
        self.assertEqual(len(rows),pin['expectedCount']);self.assertEqual(hashlib.sha256(json.dumps(rows,separators=(',',':')).encode()).hexdigest(),pin['sha256'])
if __name__=='__main__':unittest.main()
