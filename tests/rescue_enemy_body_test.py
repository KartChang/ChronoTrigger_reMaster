from native_build_y_preservation import restore_native_build_y_if_declared
from trial_u_preservation import restore_trial_u_if_declared
"""Synthetic/offline T fixtures; none of these tests is native gameplay evidence."""
import copy,hashlib,json,unittest,tempfile,inspect
from pathlib import Path
from rescue_enemy_body import assert_body_observation,assert_body_report,capture_rescue_body,write_body_report,OBSERVE_SCRIPT
from rescue_body_t_preservation import SPEC,restore_rescue_body_t_source,restore_rescue_body_t_if_declared
from rescue_enemy_motion import assert_rescue_report
from rescue_enemy_motion_test import report as s_report
ROOT=Path(__file__).resolve().parents[1]
FIXTURE=json.loads((ROOT/'tests/fixtures/rescue-body-offline.json').read_text())
SHA='a'*40

def sample(chapter='sanctum',kind='attack',index=-1):
    v=copy.deepcopy(FIXTURE['observations'][chapter+'-'+kind]);return v[index] if isinstance(v,list) else v

def report():
    obs={}
    for label,chapter in [('naga','cathedral'),('guards','passage'),('yakra','sanctum')]:
        obs[label]=sample(chapter)
        o=sample(chapter,'death');o['state']['mode']='victory';obs[chapter+'-victory']=o
    return {'status':'passed','sourceSha':SHA,'build':{'sourceSha':SHA,'version':'0.9.67','batch':'VQ03T'},'errors':[],'nativeInputsOnly':True,'physicalDevice':False,'fullAnimationComplete':False,'artApproved':False,'framebufferSynchronized':False,'observations':obs}

class RescueBody(unittest.TestCase):
    def test_all_types_exact_actual_offline_transforms(self):
        for ch in ['cathedral','passage','sanctum']:
            self.assertGreater(assert_body_observation(sample(ch))['positiveBodyActions'],0)
            self.assertEqual(assert_body_observation(sample(ch,'recoil'))['positiveRecoils'],1)
            self.assertEqual(assert_body_observation(sample(ch,'death'))['completeRemnants'],1)
    def test_report_checks_all_six_boundaries(self):self.assertEqual(len(assert_body_report(report(),SHA)),6)
    def test_wrong_source_build_or_status_rejected(self):
        for key,val in [('sourceSha','b'*40),('status','failed'),('errors',['actual error']),('nativeInputsOnly',False),('framebufferSynchronized',True),('physicalDevice',True),('artApproved',True),('fullAnimationComplete',True)]:
            r=report();r[key]=val
            with self.assertRaises(AssertionError):assert_body_report(r,SHA)
        r=report();r['build']['version']='0.9.66'
        with self.assertRaises(AssertionError):assert_body_report(r,SHA)
    def test_missing_order_or_boundary_is_not_completed(self):
        r=report();del r['observations']['sanctum-victory']
        with self.assertRaises(AssertionError):assert_body_report(r,SHA)
    def test_positive_actions_are_not_inferred_from_empty_history(self):
        r=report()
        for o in r['observations'].values():o['body']['history']=[]
        with self.assertRaises(AssertionError):assert_body_report(r,SHA)
    def test_death_absence_remains_a_gap(self):
        r=report()
        for label,o in r['observations'].items():
            if label.endswith('victory'):o['body']['history']=[]
        v=assert_body_report(r,SHA);self.assertEqual(sum(x['completeRemnants'] for x in v.values()),0)
    def test_attack_origin_target_and_effect_binding(self):
        for part,key,val in [('cause','origin',{'x':9,'z':2}),('cause','target',{'x':9,'z':2}),('effect','kind','heal'),('effect','actor',0)]:
            o=sample();h=o['body']['history'][0];(h['cause'] if part=='cause' else h['cause']['effect'])[key]=val
            with self.assertRaises(AssertionError):assert_body_observation(o)
    def test_transform_tick_phase_and_flags(self):
        for key,val in [('tick',-1),('phase','invented'),('offset',{'x':9,'z':0}),('position',[99,1,99]),('alpha',.7),('originalEnabled',False),('enabled',False),('scope','framebuffer')]:
            o=sample();o['body']['history'][1][key]=val
            with self.assertRaises(AssertionError):assert_body_observation(o)
    def test_recoil_does_not_infer_missing_origin(self):
        o=sample(kind='recoil');o['body']['history'][0]['cause']['origin']=None
        with self.assertRaises(AssertionError):assert_body_observation(o)
    def test_death_requires_actual_previous_live_hp(self):
        for key,val in [('hpBefore',0),('hpAfter',2)]:
            o=sample(kind='death');o['body']['history'][0]['cause'][key]=val
            with self.assertRaises(AssertionError):assert_body_observation(o)
    def test_original_enemy_must_be_disabled(self):
        o=sample(kind='death',index=0);o['body']['remnants'][0]['originalEnabled']=True
        with self.assertRaises(AssertionError):assert_body_observation(o)
    def test_texture_dimensions_and_fingerprint_rejected(self):
        for key,val in [('width',47),('height',47),('fnv1a32',0)]:
            o=sample(kind='death');o['body']['history'][0]['cell'][key]=val
            with self.assertRaises(AssertionError):assert_body_observation(o)
    def test_actual_fade_scale_and_grounding(self):
        for part,key,val in [('row','alpha',.9),('row','scale',[1,.9,1]),('row','position',[0,0,0]),('geometry','height',9),('geometry','up',[0,0,0])]:
            o=sample(kind='death');h=o['body']['history'][1];(h if part=='row' else h['geometry'])[key]=val
            with self.assertRaises(AssertionError):assert_body_observation(o)
    def test_expiry_cannot_be_early_or_enabled(self):
        for key,val in [('tick',10),('alpha',.5),('enabled',True)]:
            o=sample(kind='death');o['body']['history'][-1][key]=val
            with self.assertRaises(AssertionError):assert_body_observation(o)
    def test_resource_bounds_failures_and_duplicate_slots(self):
        for key,val in [('active',4),('rawTextureBytes',99999),('creationFailures',1),('released',999)]:
            o=sample(kind='death',index=0);o['body']['resources'][key]=val
            with self.assertRaises(AssertionError):assert_body_observation(o)
        o=sample(kind='death',index=0);o['body']['remnants']*=2
        with self.assertRaises(AssertionError):assert_body_observation(o)
    def test_static_copy_single_upload_not_per_frame(self):
        o=sample(kind='death',index=1);o['body']['remnants'][0]['textureUploads']=2
        with self.assertRaises(AssertionError):assert_body_observation(o)
    def test_observer_only_reads_and_preserves_report_input(self):
        calls=[];o=sample()
        class Page:
            def evaluate(self,script):calls.append(script);return copy.deepcopy(o)
        with tempfile.TemporaryDirectory() as d:
            out=Path(d);observations={};before=copy.deepcopy(o)
            capture_rescue_body(Page(),out,'yakra',observations)
            self.assertEqual(observations['yakra'],before);self.assertEqual(len(calls),1)
            self.assertEqual(json.loads((out/'rescue-body-yakra-observation.json').read_text()),before)
        self.assertNotIn('step(',OBSERVE_SCRIPT);self.assertNotIn('setState',OBSERVE_SCRIPT)
    def test_report_write_is_independent_and_failure_retained(self):
        r=report()
        with tempfile.TemporaryDirectory() as d:
            out=Path(d);marker=out/'rescue-report.json';marker.write_text('original immutable')
            write_body_report(out,r['observations'],r['build'],SHA,[])
            self.assertEqual(marker.read_text(),'original immutable')
            with self.assertRaises(AssertionError):write_body_report(out,r['observations'],r['build'],SHA,['failure'])
            self.assertEqual(json.loads((out/'rescue-enemy-body-report.json').read_text())['status'],'failed')
    def test_S_default_build_still_strict_and_explicit_T_allowed(self):
        r=s_report();r['build'].update(version='0.9.67',batch='VQ03T')
        with self.assertRaises(AssertionError):assert_rescue_report(r,SHA)
        self.assertGreater(sum(x['sourceActions'] for x in assert_rescue_report(r,SHA,expected_build=('0.9.67','VQ03T')).values()),0)
    def test_all_declared_source_inverses_reject_missing_duplicate_unrelated(self):
        for name,edits in SPEC['files'].items():
            raw=restore_trial_u_if_declared(name,(ROOT/name).read_text());base=restore_rescue_body_t_source(name,raw);self.assertEqual(hashlib.sha256(base.encode()).hexdigest(),SPEC['originalSha256'][name])
            self.assertEqual(restore_rescue_body_t_if_declared(name,base),base)
            for bad in (raw+edits[0]['after'],raw.replace(edits[0]['after'],''),raw+'\n# unrelated\n'):
                with self.assertRaises(AssertionError):restore_rescue_body_t_source(name,bad)
    def test_original_core_and_workflow_bytes_preserved(self):
        for name,h in json.loads((ROOT/'tests/baselines/vq03t-unchanged-inputs.json').read_text()).items():self.assertEqual(hashlib.sha256(restore_native_build_y_if_declared(name,(ROOT/name).read_text()).encode()).hexdigest(),h,name)
    def test_original_native_route_is_retained_by_exact_inverse(self):
        name='tests/rescue_browser.py';base=restore_rescue_body_t_source(name,(ROOT/name).read_text());self.assertEqual(hashlib.sha256(base.encode()).hexdigest(),SPEC['originalSha256'][name])
        self.assertNotIn('wait_for',inspect.getsource(capture_rescue_body));self.assertNotIn('keyboard',inspect.getsource(capture_rescue_body))

if __name__=='__main__':unittest.main()
