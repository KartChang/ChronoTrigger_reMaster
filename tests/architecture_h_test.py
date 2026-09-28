from cpu_hot_loop_i_preservation import SPEC as I_SPEC,restore_cpu_i_if_declared,cpu_i_frozen_bytes
"""Offline H source-only contract, not native or device evidence."""
import hashlib,json,unittest
from architecture_h_preservation import ROOT,SPEC,restore_art_h_source,restore_art_h_if_declared
class ArchitectureH(unittest.TestCase):
    def test_sources_and_mutation_rejection(self):
        for n,e in SPEC['files'].items():
            raw=restore_cpu_i_if_declared(n,(ROOT/n).read_text());old=restore_art_h_source(n,raw)
            self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),e['sha256'])
            self.assertEqual(restore_art_h_if_declared(n,old),old)
            for h in e['hunks']:
                for bad in [raw.replace(h['after'],'',1),raw+h['after'],raw+'\n# drift\n']:
                    with self.subTest(name=n),self.assertRaises(AssertionError):restore_art_h_source(n,bad)
    def test_current_and_predecessor_producers(self):
        from current_build import EXPECTED_BUILD,expected_build_from_source
        self.assertEqual(expected_build_from_source(restore_cpu_i_if_declared('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text())),('0.9.81','VQ04H'))
        self.assertEqual(expected_build_from_source(restore_art_h_source('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text())),('0.9.80','VQ04G'))
    def test_undeclared_g_inputs_remain_pinned(self):
        pin=json.loads((ROOT/'tests/baselines/vq04h-unchanged-inputs.json').read_text());names=list(pin['rootFiles'])
        for d in pin['roots']:
            for p in (ROOT/d).rglob('*'):
                if '__pycache__' in p.parts or p.suffix=='.pyc':continue
                self.assertFalse(p.is_symlink())
                if p.is_file():names.append(p.relative_to(ROOT).as_posix())
        rows=[[n,hashlib.sha256(cpu_i_frozen_bytes(n,(ROOT/n).read_bytes())).hexdigest()] for n in sorted(names) if n not in pin['exclude'] and n not in I_SPEC['newPaths']]
        self.assertEqual(len(rows),pin['expectedCount']);self.assertEqual(hashlib.sha256(json.dumps(rows,separators=(',',':')).encode()).hexdigest(),pin['sha256'])
    def test_native_images_state_and_original_routes_are_not_inverse_inputs(self):
        for n in ['native.json','image.png','src/core.ts','src/render.ts','src/prologue-render.ts','tests/npc_comfort_capture.py','tests/party_combat.py']:
            with self.subTest(name=n),self.assertRaises(ValueError):restore_art_h_source(n,'{}')
if __name__=='__main__':unittest.main()
