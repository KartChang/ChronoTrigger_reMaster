from enemy_lifecycle_z_preservation import restore_lifecycle_z_if_declared
"""Offline preflight. No browser import, native report rewrite, or timing edits."""
import ast,json,hashlib,unittest
from pathlib import Path
from current_build import ROOT,EXPECTED_BUILD,expected_build_from_source
from native_build_y_preservation import SPEC,restore_native_build_y_source,restore_native_build_y_if_declared
ROUTES={'tests/field_enemy_action_browser.py':5,'tests/rescue_browser.py':2,'tests/trial_browser.py':2}
DECL="const buildInfo={version:'0.9.77',batch:'VQ04D',sourceSha:process.env.GITHUB_SHA??null};"
class CurrentBuild(unittest.TestCase):
    def test_producer_not_report_is_authority(self):
        self.assertEqual(EXPECTED_BUILD,('0.9.77','VQ04D'))
        self.assertEqual(expected_build_from_source('// declaration\n'+DECL+'\n'),EXPECTED_BUILD)
    def test_invalid_missing_duplicate_and_ambiguous_declaration_fail_closed(self):
        for raw in ['',DECL+'\n'+DECL,DECL.replace('0.9.77','NaN'),DECL.replace('VQ04D','report.batch'),DECL.replace('process.env.GITHUB_SHA??null','report.sourceSha'),DECL+'\nconst buildInfo=untrusted;',DECL.replace("version:'0.9.77'",'version:report.version')]:
            with self.subTest(raw=raw),self.assertRaises(ValueError):expected_build_from_source(raw)
    def test_current_native_entrypoints_all_bind_the_producer(self):
        for name,count in ROUTES.items():
            tree=ast.parse((ROOT/name).read_text())
            binds=[k.value for n in ast.walk(tree) if isinstance(n,ast.Call) for k in n.keywords if k.arg=='expected_build']
            self.assertEqual(len(binds),count,name)
            self.assertTrue(all(isinstance(v,ast.Name) and v.id=='EXPECTED_BUILD' for v in binds),name)
    def test_only_metadata_argument_changed_not_native_route_or_assertions(self):
        for name in ROUTES:
            raw=restore_lifecycle_z_if_declared(name,(ROOT/name).read_text());old=restore_native_build_y_source(name,raw)
            normalized=raw.replace('from current_build import EXPECTED_BUILD\n','').replace('expected_build=EXPECTED_BUILD',"expected_build=('0.9.70','VQ03W')")
            self.assertEqual(normalized,old,name)
    def test_all_declared_sources_round_trip_and_mutations_rejected(self):
        for name,edits in SPEC['files'].items():
            raw=restore_lifecycle_z_if_declared(name,(ROOT/name).read_text());old=restore_native_build_y_source(name,raw)
            self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),SPEC['originalSha256'][name])
            for e in edits:
                for bad in [raw.replace(e['after'],'',1),raw+e['after'],raw+'\n# unrelated\n']:
                    with self.subTest(name=name),self.assertRaises(AssertionError):restore_native_build_y_source(name,bad)
            self.assertEqual(restore_native_build_y_if_declared(name,raw+'\n# drift\n'),old+'\n# drift\n')
    def test_native_data_and_undeclared_files_cannot_be_normalized(self):
        for name in ['native.json','src/core.ts','tests/field_enemy_action.py']:
            with self.assertRaises(ValueError):restore_native_build_y_source(name,'{}')
    def test_original_checker_and_protected_input_hashes(self):
        pins=json.loads((ROOT/'tests/baselines/vq03y-unchanged-inputs.json').read_text())
        for name,digest in pins.items():
            with self.subTest(name=name):self.assertEqual(hashlib.sha256(restore_lifecycle_z_if_declared(name,(ROOT/name).read_text()).encode()).hexdigest(),digest)
if __name__=='__main__':unittest.main()
