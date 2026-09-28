from npc_attention_g_preservation import SPEC as G_SPEC,restore_art_g_if_declared,art_g_frozen_bytes
"""F offline source contract, not native/browser/physical-device evidence."""
import hashlib,json,unittest
from production_place_f_preservation import ROOT,SPEC,restore_art_f_source,restore_art_f_if_declared
class ProductionPlaceF(unittest.TestCase):
    def test_declared_sources_and_mutation_rejection(self):
        for n,e in SPEC['files'].items():
            raw=restore_art_g_if_declared(n,(ROOT/n).read_text());old=restore_art_f_source(n,raw)
            self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),e['sha256']);self.assertEqual(restore_art_f_if_declared(n,old),old)
            for h in e['hunks']:
                for bad in [raw.replace(h['after'],'',1),raw+h['after'],raw+'\n# drift\n']:
                    with self.subTest(name=n),self.assertRaises(AssertionError):restore_art_f_source(n,bad)
    def test_current_producer_and_e_predecessor_are_distinct(self):
        from current_build import EXPECTED_BUILD,expected_build_from_source
        self.assertEqual(expected_build_from_source(restore_art_g_if_declared('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text())),('0.9.79','VQ04F'))
        self.assertEqual(expected_build_from_source(restore_art_f_source('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text())),('0.9.78','VQ04E'))
    def test_all_other_e_input_bytes_remain_pinned(self):
        pin=json.loads((ROOT/'tests/baselines/vq04f-unchanged-inputs.json').read_text());names=list(pin['rootFiles'])
        for d in pin['roots']:
            for p in (ROOT/d).rglob('*'):
                if '__pycache__' in p.parts or p.suffix=='.pyc':continue
                self.assertFalse(p.is_symlink())
                if p.is_file():names.append(p.relative_to(ROOT).as_posix())
        rows=[[n,hashlib.sha256(art_g_frozen_bytes(n,(ROOT/n).read_bytes())).hexdigest()] for n in sorted(names) if n not in pin['exclude'] and n not in G_SPEC['newPaths']]
        self.assertEqual(len(rows),pin['expectedCount']);self.assertEqual(hashlib.sha256(json.dumps(rows,separators=(',',':')).encode()).hexdigest(),pin['sha256'])
    def test_native_gameplay_and_image_inputs_are_forbidden(self):
        for n in ['native.json','image.png','src/core.ts','src/render.ts','src/prologue-render.ts','tests/party_combat.py','tests/fixtures/party-combat-frames.json']:
            with self.subTest(name=n),self.assertRaises(ValueError):restore_art_f_source(n,'{}')
if __name__=='__main__':unittest.main()
