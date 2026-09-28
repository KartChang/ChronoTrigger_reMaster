"""Offline source-only contracts. Not native timing or rendering evidence."""
import hashlib,json,unittest
from cpu_hot_loop_i_preservation import ROOT,SPEC,restore_cpu_i_source,restore_cpu_i_if_declared
class CpuHotLoopI(unittest.TestCase):
    def test_round_trip_and_mutation_rejection(self):
        for n,e in SPEC['files'].items():
            raw=(ROOT/n).read_text();old=restore_cpu_i_source(n,raw)
            self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),e['sha256'])
            self.assertEqual(restore_cpu_i_if_declared(n,old),old)
            for h in e['hunks']:
                for bad in [raw.replace(h['after'],'',1),raw+h['after'],raw+'\n# drift\n']:
                    with self.subTest(name=n),self.assertRaises(AssertionError):restore_cpu_i_source(n,bad)
    def test_current_and_H_producer(self):
        from current_build import EXPECTED_BUILD,expected_build_from_source
        self.assertEqual(EXPECTED_BUILD,('0.9.82','VQ04I'))
        self.assertEqual(expected_build_from_source(restore_cpu_i_source('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text())),('0.9.81','VQ04H'))
    def test_untouched_H_inputs(self):
        pin=json.loads((ROOT/'tests/baselines/vq04i-unchanged-inputs.json').read_text());names=list(pin['rootFiles'])
        for d in pin['roots']:
            for p in (ROOT/d).rglob('*'):
                if '__pycache__' in p.parts or p.suffix=='.pyc':continue
                self.assertFalse(p.is_symlink())
                if p.is_file():names.append(p.relative_to(ROOT).as_posix())
        rows=[[n,hashlib.sha256((ROOT/n).read_bytes()).hexdigest()] for n in sorted(names) if n not in pin['exclude']]
        self.assertEqual(len(rows),pin['expectedCount']);self.assertEqual(hashlib.sha256(json.dumps(rows,separators=(',',':')).encode()).hexdigest(),pin['sha256'])
    def test_inverse_rejects_native_reports_images_state_routes(self):
        for n in ['native.json','image.png','src/core.ts','src/render.ts','src/cpu-engine.ts','src/prologue-render.ts','tests/cpu_native_pair.py','tests/party_combat.py']:
            with self.subTest(name=n),self.assertRaises(ValueError):restore_cpu_i_source(n,'{}')
if __name__=='__main__':unittest.main()
