from grove_l_preservation import SPEC as L_SPEC,restore_grove_l_if_declared,grove_l_frozen_bytes
"""Offline K source tests. No native browser or game-state substitution."""
import hashlib,json,unittest
from inn_mount_k_preservation import ROOT,SPEC,restore_inn_k_source,restore_inn_k_if_declared
class InnMountK(unittest.TestCase):
    def test_exact_predecessor(self):
        for n,e in SPEC['files'].items():
            raw=restore_grove_l_if_declared(n,(ROOT/n).read_text());old=restore_inn_k_source(n,raw)
            self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),e['sha256'])
            self.assertEqual(restore_inn_k_if_declared(n,old),old)
            for h in e['hunks']:
                for bad in [raw.replace(h['after'],'',1),raw+h['after'],raw+'\n# unrelated\n']:
                    with self.subTest(name=n),self.assertRaises(AssertionError):restore_inn_k_source(n,bad)
    def test_versions(self):
        from current_build import EXPECTED_BUILD,expected_build_from_source
        self.assertEqual(expected_build_from_source(restore_grove_l_if_declared('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text())),('0.9.84','VQ04K'))
        self.assertEqual(expected_build_from_source(restore_inn_k_source('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text())),('0.9.83','VQ04J'))
    def test_pinned_inputs(self):
        p=json.loads((ROOT/'tests/baselines/vq04k-unchanged-inputs.json').read_text());names=list(p['rootFiles'])
        for d in p['roots']:
            for f in (ROOT/d).rglob('*'):
                if '__pycache__' in f.parts or f.suffix=='.pyc':continue
                self.assertFalse(f.is_symlink())
                if f.is_file():names.append(f.relative_to(ROOT).as_posix())
        rows=[[n,hashlib.sha256(grove_l_frozen_bytes(n,(ROOT/n).read_bytes())).hexdigest()] for n in sorted(names) if n not in p['exclude'] and n not in L_SPEC['newPaths']]
        self.assertEqual(len(rows),p['expectedCount']);self.assertEqual(hashlib.sha256(json.dumps(rows,separators=(',',':')).encode()).hexdigest(),p['sha256'])
    def test_forbidden(self):
        for n in ['report.json','image.png','src/core.ts','src/render.ts','src/town-sign-occlusion.ts','scripts/town-route-evidence.mjs']:
            with self.assertRaises(ValueError):restore_inn_k_source(n,'{}')
if __name__=='__main__':unittest.main()
