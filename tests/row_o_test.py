"""Offline author preservation; not native gameplay evidence."""
import hashlib,json,unittest
from row_o_preservation import ROOT,SPEC,restore_row_o_source,restore_row_o_if_declared
class RowO(unittest.TestCase):
    def test_exact_predecessor_and_mutations(self):
        for n,e in SPEC['files'].items():
            raw=(ROOT/n).read_text();old=restore_row_o_source(n,raw)
            self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),e['sha256']);self.assertEqual(restore_row_o_if_declared(n,old),old)
            for h in e['hunks']:
                for bad in [raw.replace(h['after'],'',1),raw+h['after'],raw+'\n# unrelated drift\n']:
                    with self.subTest(name=n),self.assertRaises(AssertionError):restore_row_o_source(n,bad)
    def test_versions_and_actual_build(self):
        from current_build import EXPECTED_BUILD,expected_build_from_source
        self.assertEqual(EXPECTED_BUILD,('0.9.88','VQ04O'))
        self.assertEqual(expected_build_from_source(restore_row_o_source('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text())),('0.9.87','VQ04N'))
    def test_all_undeclared_n_inputs(self):
        p=json.loads((ROOT/'tests/baselines/vq04o-unchanged-inputs.json').read_text());names=list(p['rootFiles'])
        for d in p['roots']:
            for f in (ROOT/d).rglob('*'):
                if '__pycache__' in f.parts or f.suffix=='.pyc':continue
                self.assertFalse(f.is_symlink())
                if f.is_file():names.append(f.relative_to(ROOT).as_posix())
        rows=[[n,hashlib.sha256((ROOT/n).read_bytes()).hexdigest()] for n in sorted(names) if n not in p['exclude']]
        self.assertEqual(len(rows),p['expectedCount']);self.assertEqual(hashlib.sha256(json.dumps(rows,separators=(',',':')).encode()).hexdigest(),p['sha256'])
    def test_no_native_or_state_transform(self):
        for n in ['native.json','image.png','src/core.ts','src/render.ts','src/prologue-render.ts','tests/rescue_browser.py','tests/witness_browser.py']:
            with self.assertRaises(ValueError):restore_row_o_source(n,'{}')
if __name__=='__main__':unittest.main()
