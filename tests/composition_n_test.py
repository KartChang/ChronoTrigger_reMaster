"""Offline source preflight only; no local browser/native input injection."""
import hashlib,json,unittest
from composition_n_preservation import ROOT,SPEC,restore_composition_n_source,restore_composition_n_if_declared
class CompositionN(unittest.TestCase):
    def test_exact_predecessor_and_mutations(self):
        for n,e in SPEC['files'].items():
            raw=(ROOT/n).read_text();old=restore_composition_n_source(n,raw)
            self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),e['sha256']);self.assertEqual(restore_composition_n_if_declared(n,old),old)
            for h in e['hunks']:
                for bad in [raw.replace(h['after'],'',1),raw+h['after'],raw+'\n# drift\n']:
                    with self.subTest(name=n),self.assertRaises(AssertionError):restore_composition_n_source(n,bad)
    def test_versions_and_actual_build(self):
        from current_build import EXPECTED_BUILD,expected_build_from_source
        self.assertEqual(EXPECTED_BUILD,('0.9.87','VQ04N'))
        self.assertEqual(expected_build_from_source(restore_composition_n_source('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text())),('0.9.86','VQ04M'))
    def test_all_undeclared_m_inputs(self):
        p=json.loads((ROOT/'tests/baselines/vq04n-unchanged-inputs.json').read_text());names=list(p['rootFiles'])
        for d in p['roots']:
            for f in (ROOT/d).rglob('*'):
                if '__pycache__' in f.parts or f.suffix=='.pyc':continue
                self.assertFalse(f.is_symlink())
                if f.is_file():names.append(f.relative_to(ROOT).as_posix())
        rows=[[n,hashlib.sha256((ROOT/n).read_bytes()).hexdigest()] for n in sorted(names) if n not in p['exclude']]
        self.assertEqual(len(rows),p['expectedCount']);self.assertEqual(hashlib.sha256(json.dumps(rows,separators=(',',':')).encode()).hexdigest(),p['sha256'])
    def test_forbidden_native_and_state(self):
        for n in ['native.json','image.png','src/core.ts','src/render.ts','src/production-roof-art.ts','tests/rescue_browser.py']:
            with self.assertRaises(ValueError):restore_composition_n_source(n,'{}')
if __name__=='__main__':unittest.main()
