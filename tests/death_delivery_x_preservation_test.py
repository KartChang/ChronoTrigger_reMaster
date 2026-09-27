"""Offline source-integrity regression; not browser/native acceptance."""
import hashlib,json,unittest
from death_delivery_x_preservation import ROOT,SPEC,restore_death_delivery_x_source,restore_death_delivery_x_if_declared
class DeathDeliveryXPreservation(unittest.TestCase):
    def test_exact_w_bytes_and_identity(self):
        for name in SPEC['files']:
            with self.subTest(name=name):
                raw=(ROOT/name).read_text();old=restore_death_delivery_x_source(name,raw)
                self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),SPEC['originalSha256'][name])
                self.assertEqual(restore_death_delivery_x_if_declared(name,old),old)
    def test_missing_duplicate_altered_and_unrelated_fail_closed(self):
        for name,edits in SPEC['files'].items():
            raw=(ROOT/name).read_text()
            for e in edits:
                for bad in [raw.replace(e['after'],'',1),raw+e['after'],raw.replace(e['after'],e['after']+'// altered\n',1),raw+'\n// unrelated\n']:
                    with self.subTest(name=name),self.assertRaises(AssertionError):restore_death_delivery_x_source(name,bad)
    def test_optional_adapter_never_erases_unrelated_bytes(self):
        for name in SPEC['files']:
            raw=(ROOT/name).read_text();old=restore_death_delivery_x_source(name,raw);extra='\n# unrelated\n'
            self.assertEqual(restore_death_delivery_x_if_declared(name,raw+extra),old+extra)
            self.assertNotEqual(hashlib.sha256((old+extra).encode()).hexdigest(),SPEC['originalSha256'][name])
    def test_undeclared_source_rejected(self):
        for name in ['src/core.ts','tests/trial_browser.py','native-report.json']:
            with self.assertRaises(ValueError):restore_death_delivery_x_source(name,'{}')
    def test_native_routes_gameplay_limits_and_held_inputs_unchanged(self):
        pins=json.loads((ROOT/'tests/baselines/vq03x-unchanged-inputs.json').read_text())
        for name,digest in pins.items():
            with self.subTest(name=name):self.assertEqual(hashlib.sha256((ROOT/name).read_bytes()).hexdigest(),digest)
if __name__=='__main__':unittest.main()
