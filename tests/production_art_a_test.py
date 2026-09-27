from production_art_b_preservation import SPEC as B_SPEC,restore_art_b_if_declared,art_b_frozen_bytes
"""No browser/native route is run or modified by these source integrity tests."""
import hashlib,json,unittest
from production_art_a_preservation import ROOT,SPEC,restore_art_a_source
class ProductionArtA(unittest.TestCase):
    def test_declared_source_inverse_and_negative_mutations(self):
        for name,edits in SPEC['files'].items():
            raw=restore_art_b_if_declared(name,(ROOT/name).read_text());old=restore_art_a_source(name,raw)
            self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),SPEC['originalSha256'][name])
            for e in edits:
                for bad in [raw.replace(e['after'],'',1),raw+e['after'],raw+'\n# unrelated\n']:
                    with self.subTest(name=name),self.assertRaises(AssertionError):restore_art_a_source(name,bad)
    def test_no_report_or_game_state_inverse(self):
        for path in ['report.json','src/core.ts','src/prologue-render.ts','tests/trial_browser.py']:
            with self.assertRaises(ValueError):restore_art_a_source(path,'{}')
    def test_core_native_and_held_inputs_are_byte_exact(self):
        pin=json.loads((ROOT/'tests/baselines/vq04a-unchanged-inputs.json').read_text());names=list(pin['rootFiles'])
        for directory in pin['roots']:
            for p in (ROOT/directory).rglob('*'):
                if '__pycache__' in p.parts or p.suffix=='.pyc':continue
                self.assertFalse(p.is_symlink())
                if p.is_file():names.append(p.relative_to(ROOT).as_posix())
        rows=[[n,hashlib.sha256(art_b_frozen_bytes(n,(ROOT/n).read_bytes())).hexdigest()] for n in sorted(names) if n not in pin['exclude'] and n not in B_SPEC['newPaths']]
        self.assertEqual(len(rows),pin['expectedCount']);self.assertEqual(hashlib.sha256(json.dumps(rows,separators=(',',':')).encode()).hexdigest(),pin['sha256'])
    def test_producer_art_profile_is_published_from_source_not_concept_image(self):
        from current_build import expected_build_from_source
        EXPECTED_BUILD=expected_build_from_source(restore_art_b_if_declared('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text()))
        self.assertEqual(EXPECTED_BUILD,('0.9.74','VQ04A'))
        self.assertIn("import {ArtDirectedWorld as World} from './art-directed-world';",(ROOT/'src/main.ts').read_text())
        self.assertNotIn('imagegen',(ROOT/'scripts/build.mjs').read_text())
if __name__=='__main__':unittest.main()
