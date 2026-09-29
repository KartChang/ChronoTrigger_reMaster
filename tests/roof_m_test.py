"""Offline M source preservation; no native data transformation."""
from composition_n_preservation import SPEC as N_SPEC,restore_composition_n_if_declared,composition_n_frozen_bytes
import hashlib,json,unittest
from roof_m_preservation import ROOT,SPEC,restore_roof_m_source,restore_roof_m_if_declared
class RoofM(unittest.TestCase):
    def test_roundtrip_and_drift(self):
        for n,e in SPEC['files'].items():
            raw=restore_composition_n_if_declared(n,(ROOT/n).read_text());old=restore_roof_m_source(n,raw)
            self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),e['sha256']);self.assertEqual(restore_roof_m_if_declared(n,old),old)
            for h in e['hunks']:
                for bad in [raw.replace(h['after'],'',1),raw+h['after'],raw+'\n# drift\n']:
                    with self.subTest(name=n),self.assertRaises(AssertionError):restore_roof_m_source(n,bad)
    def test_versions(self):
        from current_build import EXPECTED_BUILD,expected_build_from_source
        self.assertEqual(expected_build_from_source(restore_composition_n_if_declared('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text())),('0.9.86','VQ04M'))
        self.assertEqual(expected_build_from_source(restore_roof_m_source('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text())),('0.9.85','VQ04L'))
    def test_unchanged_native_inputs(self):
        p=json.loads((ROOT/'tests/baselines/vq04m-unchanged-inputs.json').read_text());names=list(p['rootFiles'])
        for d in p['roots']:
            for f in (ROOT/d).rglob('*'):
                if '__pycache__' in f.parts or f.suffix=='.pyc':continue
                self.assertFalse(f.is_symlink())
                if f.is_file():names.append(f.relative_to(ROOT).as_posix())
        rows=[[n,hashlib.sha256(composition_n_frozen_bytes(n,(ROOT/n).read_bytes())).hexdigest()] for n in sorted(names) if n not in p['exclude'] and n not in N_SPEC['newPaths']]
        self.assertEqual(len(rows),p['expectedCount']);self.assertEqual(hashlib.sha256(json.dumps(rows,separators=(',',':')).encode()).hexdigest(),p['sha256'])
    def test_forbidden(self):
        for n in ['report.json','image.png','src/core.ts','src/village-art.ts','tests/rescue_browser.py']:
            with self.assertRaises(ValueError):restore_roof_m_source(n,'{}')
if __name__=='__main__':unittest.main()
