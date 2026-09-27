"""New B source checks only. No native wait, route, state or report is changed."""
import hashlib,json,unittest
from production_art_b_preservation import ROOT,SPEC,restore_art_b_source
class ProductionArtB(unittest.TestCase):
    def test_all_changed_sources_round_trip_and_reject_drift(self):
        for n,e in SPEC['files'].items():
            raw=(ROOT/n).read_text();self.assertEqual(hashlib.sha256(restore_art_b_source(n,raw).encode()).hexdigest(),e['sha256'])
            for bad in [raw[1:],raw+raw,raw+'\n# unrelated\n']:
                with self.subTest(name=n),self.assertRaises(AssertionError):restore_art_b_source(n,bad)
    def test_native_and_image_data_cannot_enter_source_inverse(self):
        for n in ['src/core.ts','src/render.ts','src/prologue-render.ts','tests/trial_browser.py','tests/fixtures/party-combat-frames.json','native.json','image.png']:
            with self.assertRaises(ValueError):restore_art_b_source(n,'{}')
    def test_native_core_and_held_source_exact_hashes(self):
        pin=json.loads((ROOT/'tests/baselines/vq04b-unchanged-inputs.json').read_text());names=list(pin['rootFiles'])
        for d in pin['roots']:
            for p in (ROOT/d).rglob('*'):
                if '__pycache__' in p.parts or p.suffix=='.pyc':continue
                self.assertFalse(p.is_symlink())
                if p.is_file():names.append(p.relative_to(ROOT).as_posix())
        rows=[[n,hashlib.sha256((ROOT/n).read_bytes()).hexdigest()] for n in sorted(names) if n not in pin['exclude']]
        self.assertEqual(len(rows),pin['expectedCount']);self.assertEqual(hashlib.sha256(json.dumps(rows,separators=(',',':')).encode()).hexdigest(),pin['sha256'])
    def test_new_build_and_prior_a_build_are_independently_bound_to_source(self):
        from current_build import EXPECTED_BUILD,expected_build_from_source
        self.assertEqual(EXPECTED_BUILD,('0.9.75','VQ04B'))
        self.assertEqual(expected_build_from_source(restore_art_b_source('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text())),('0.9.74','VQ04A'))
if __name__=='__main__':unittest.main()
