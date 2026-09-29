from inn_mount_k_preservation import SPEC as K_SPEC,restore_inn_k_if_declared,inn_k_frozen_bytes
"""Offline source-only preservation; not a native or browser evidence producer."""
import hashlib,json,unittest
from sightline_j_preservation import ROOT,SPEC,restore_sight_j_source,restore_sight_j_if_declared
class SightlineJ(unittest.TestCase):
    def test_roundtrip(self):
        for n,e in SPEC['files'].items():
            raw=restore_inn_k_if_declared(n,(ROOT/n).read_text());old=restore_sight_j_source(n,raw)
            self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),e['sha256']);self.assertEqual(restore_sight_j_if_declared(n,old),old)
            for h in e['hunks']:
                for bad in [raw.replace(h['after'],'',1),raw+h['after'],raw+'\n# drift\n']:
                    with self.subTest(name=n),self.assertRaises(AssertionError):restore_sight_j_source(n,bad)
    def test_versions(self):
        from current_build import EXPECTED_BUILD,expected_build_from_source
        self.assertEqual(expected_build_from_source(restore_inn_k_if_declared('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text())),('0.9.83','VQ04J'))
        self.assertEqual(expected_build_from_source(restore_sight_j_source('scripts/build.mjs',(ROOT/'scripts/build.mjs').read_text())),('0.9.82','VQ04I'))
    def test_pinned_inputs(self):
        p=json.loads((ROOT/'tests/baselines/vq04j-unchanged-inputs.json').read_text());names=list(p['rootFiles'])
        for d in p['roots']:
            for f in (ROOT/d).rglob('*'):
                if '__pycache__' in f.parts or f.suffix=='.pyc':continue
                self.assertFalse(f.is_symlink())
                if f.is_file():names.append(f.relative_to(ROOT).as_posix())
        rows=[[n,hashlib.sha256(inn_k_frozen_bytes(n,(ROOT/n).read_bytes())).hexdigest()] for n in sorted(names) if n not in p['exclude'] and n not in K_SPEC['newPaths']]
        self.assertEqual(len(rows),p['expectedCount']);self.assertEqual(hashlib.sha256(json.dumps(rows,separators=(',',':')).encode()).hexdigest(),p['sha256'])
    def test_forbidden_inputs(self):
        for n in ['native.json','image.png','src/core.ts','src/render.ts','tests/cpu_native_pair.py','tests/party_combat.py']:
            with self.assertRaises(ValueError):restore_sight_j_source(n,'{}')
if __name__=='__main__':unittest.main()
