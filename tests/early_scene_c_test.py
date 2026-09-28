from production_party_d_preservation import SPEC as D_SPEC,art_d_frozen_bytes,restore_art_d_if_declared
"""C source/entrypoint preservation. No browser, injected native state or changed routes."""
import hashlib,json,unittest
from early_scene_c_preservation import ROOT,SPEC,restore_art_c_source
class EarlySceneC(unittest.TestCase):
    def test_roundtrip_and_drift_rejection(self):
        for n,e in SPEC['files'].items():
            raw=(ROOT/n).read_text();self.assertEqual(hashlib.sha256(restore_art_c_source(n,raw).encode()).hexdigest(),e['sha256'])
            for bad in [raw[1:],raw+raw,raw+'\n# unrelated\n']:
                with self.subTest(name=n),self.assertRaises(AssertionError):restore_art_c_source(n,bad)
    def test_producer_bound_build_and_exact_previous_build(self):
        from current_build import EXPECTED_BUILD,expected_build_from_source
        self.assertEqual(expected_build_from_source(restore_art_d_if_declared('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text())),('0.9.76','VQ04C'))
        self.assertEqual(expected_build_from_source(restore_art_c_source('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text())),('0.9.75','VQ04B'))
    def test_native_core_golden_held_and_unchanged_inputs(self):
        pin=json.loads((ROOT/'tests/baselines/vq04c-unchanged-inputs.json').read_text());names=list(pin['rootFiles'])
        for d in pin['roots']:
            for p in (ROOT/d).rglob('*'):
                if '__pycache__' in p.parts or p.suffix=='.pyc':continue
                self.assertFalse(p.is_symlink())
                if p.is_file():names.append(p.relative_to(ROOT).as_posix())
        rows=[[n,hashlib.sha256(art_d_frozen_bytes(n,(ROOT/n).read_bytes())).hexdigest()] for n in sorted(names) if n not in pin['exclude'] and n not in D_SPEC['newPaths']]
        self.assertEqual(len(rows),pin['expectedCount']);self.assertEqual(hashlib.sha256(json.dumps(rows,separators=(',',':')).encode()).hexdigest(),pin['sha256'])
    def test_no_native_game_or_pixel_data_in_source_inverse(self):
        for n in ['src/core.ts','src/render.ts','src/prologue-render.ts','tests/trial_browser.py','native.json','image.png']:
            with self.assertRaises(ValueError):restore_art_c_source(n,'{}')
if __name__=='__main__':unittest.main()
