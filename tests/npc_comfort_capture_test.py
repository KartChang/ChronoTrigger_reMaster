from fair_trial_preservation import restore_fair_trial_if_declared
"""Pure protocol fixtures and negative cases; not browser/media-device evidence."""
import copy,hashlib,json,tempfile,unittest
from pathlib import Path
from village_capture_test import Page,snap
from npc_comfort_capture import observe_npc_comfort,SNAPSHOT,MEDIA_QUERY,assert_phase
from npc_comfort_preservation import SPEC,restore_npc_comfort_source
ROOT=Path(__file__).resolve().parents[1]

class NpcComfortProtocolTests(unittest.TestCase):
    def page(self):
        p=Page();p.paused=True;p.state['ticks']=140
        return p
    def run_port(self,p,r):
        with tempfile.TemporaryDirectory() as d:
            observe_npc_comfort(p,d,r,snap,snap(p))
            self.assertEqual(len(list((Path(d)/'npc-comfort').glob('*.png'))),3)
    def test_three_actual_protocol_phases_inside_existing_pause_without_keys_or_state_change(self):
        p=self.page();r={};before=snap(p);self.run_port(p,r)
        self.assertEqual(r['status'],'passed');self.assertEqual([v['phase'] for v in r['phases']],['before','reduced','restored'])
        self.assertEqual(r['beforeState'],before);self.assertEqual(r['afterState'],before)
        self.assertEqual([v['observation']['npc']['actors'][0]['frame'] for v in r['phases']],[1,0,1]);self.assertEqual(p.keys,[]);self.assertTrue(p.paused);self.assertFalse(p.reduced)
    def test_original_reduced_preference_is_restored_without_overriding_the_user_choice(self):
        p=self.page();p.reduced=True;r={};self.run_port(p,r);self.assertTrue(p.reduced)
        self.assertTrue(all(v['observation']['npc']['actors'][0]['frame']==0 for v in r['phases']))
    def test_missing_runtime_preference_cannot_look_like_success(self):
        p=self.page();base=p.npc_snapshot
        def wrong():
            value=base()
            if p.reduced:value['npc']['motion']['reducedMotion']=False
            return value
        p.npc_snapshot=wrong;r={}
        with tempfile.TemporaryDirectory() as d,self.assertRaises(AssertionError):observe_npc_comfort(p,d,r,snap,snap(p))
        self.assertEqual(r['status'],'failed');self.assertFalse(p.reduced);self.assertEqual(p.keys,[])
    def test_png_capture_failure_keeps_first_error_and_restores_preference(self):
        p=self.page();old=p.evaluate
        def evaluate(code):
            if 'toDataURL' in code and p.reduced:raise RuntimeError('unit capture failure')
            return old(code)
        p.evaluate=evaluate;r={}
        with tempfile.TemporaryDirectory() as d,self.assertRaisesRegex(RuntimeError,'unit capture failure'):observe_npc_comfort(p,d,r,snap,snap(p))
        self.assertEqual(r['error']['message'],'unit capture failure');self.assertEqual(r['status'],'failed');self.assertFalse(p.reduced)
    def test_unpaused_or_other_chapter_is_not_rewritten_into_a_native_visit(self):
        for chapter,paused in [('forest',True),('truce',False)]:
            p=self.page();p.state['chapter']=chapter;p.paused=paused;r={}
            with tempfile.TemporaryDirectory() as d,self.assertRaises(AssertionError):observe_npc_comfort(p,d,r,snap,snap(p))
            self.assertEqual(p.state['chapter'],chapter);self.assertEqual(p.paused,paused);self.assertEqual(p.keys,[])
    def test_repeated_same_tick_texture_upload_is_rejected(self):
        p=self.page();base=p.npc_snapshot;calls=0
        def repeat():
            nonlocal calls
            v=base();calls+=1;v['npc']['actors'][0]['uploads']+=calls
            return v
        p.npc_snapshot=repeat;r={}
        with tempfile.TemporaryDirectory() as d,self.assertRaises(AssertionError):observe_npc_comfort(p,d,r,snap,snap(p))
        self.assertEqual(r['status'],'failed');self.assertFalse(p.reduced)
    def test_invalid_metadata_is_rejected(self):
        p=self.page();value=p.npc_snapshot()
        for key,bad in [('seed',True),('seed',-1),('frame',True),('frame',4),('uploads',-1),('cell',{'width':24,'height':32})]:
            v=copy.deepcopy(value);v['npc']['actors'][0][key]=bad
            with self.subTest(key=key,bad=bad),self.assertRaises(AssertionError):assert_phase(v,snap(p),False)
    def test_inverse_preserves_exact_D_source_and_does_not_hide_external_edits(self):
        for name,edits in SPEC['files'].items():
            raw=restore_fair_trial_if_declared(name,(ROOT/name).read_text());h=lambda s:hashlib.sha256(s.encode()).hexdigest()
            with self.subTest(name=name):
                self.assertEqual(h(restore_npc_comfort_source(name,raw)),SPEC['originalSha256'][name])
                with self.assertRaises(AssertionError):restore_npc_comfort_source(name,raw+edits[0]['after'])
                self.assertIn(edits[0]['after'],raw)
                with self.assertRaises(AssertionError):restore_npc_comfort_source(name,raw.replace(edits[0]['after'],''))
                self.assertNotEqual(h(restore_npc_comfort_source(name,raw+'\n# outside delta')),SPEC['originalSha256'][name])
if __name__=='__main__':unittest.main()
