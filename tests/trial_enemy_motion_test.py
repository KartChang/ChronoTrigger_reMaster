from trial_body_v_preservation import restore_trial_body_v_if_declared
"""Synthetic/offline fixtures; none represents provider-native gameplay."""
import copy,json,hashlib,inspect,tempfile,unittest,gzip
from pathlib import Path
from trial_enemy_motion import assert_trial_observation,assert_trial_report,capture_trial_motion,write_trial_motion_report,OBSERVE_SCRIPT
from trial_u_preservation import SPEC,restore_trial_u_source,restore_trial_u_if_declared
ROOT=Path(__file__).resolve().parents[1]
FIX=json.loads(gzip.decompress((ROOT/'tests/fixtures/trial-motion-offline.json.gz').read_bytes()))
SHA='a'*40

def sample(kind='tankBody'):return copy.deepcopy(FIX[kind])
def report():
    guard=sample('prisonGuard');guard['state']['mode']='victory'
    stair=copy.deepcopy(guard);stair['state']['chapter']='prisonstairs';stair['motion']['chapter']='prisonstairs'
    for row in stair['motion']['history']:row['chapter']='prisonstairs'
    tank=sample('tankHead');victory=copy.deepcopy(tank);victory['state']['mode']='victory'
    return {'status':'passed','sourceSha':SHA,'build':{'version':'0.9.68','batch':'VQ03U','sourceSha':SHA},'errors':[],'nativeInputsOnly':True,'physicalDevice':False,'artApproved':False,'fullAnimationComplete':False,'framebufferSynchronized':False,'observations':{'cellguards-victory':guard,'stairguards-victory':stair,'tank-animation':sample('tankBody'),'tank-repair':tank,'tank-victory':victory,'stairguards-victory-2':copy.deepcopy(stair)}}

class TrialMotion(unittest.TestCase):
    def test_all_four_actual_offline_source_cell_sequences(self):
        for k in ('prisonGuard','tankHead','tankBody','tankWheel'):
            v=assert_trial_observation(sample(k));self.assertEqual(v['completeActionClips'],1);self.assertGreater(v['textureSamples'],3)
    def test_full_report_distinguishes_repair_and_damage(self):
        v=assert_trial_report(report(),SHA);self.assertEqual(v['tank-repair']['repairActions'],1);self.assertEqual(v['tank-animation']['bodyActions'],1)
    def test_wrong_sha_version_status_and_promotion_rejected(self):
        for key,val in [('sourceSha','b'*40),('status','failed'),('errors',['real error']),('nativeInputsOnly',False),('artApproved',True),('physicalDevice',True),('fullAnimationComplete',True),('framebufferSynchronized',True)]:
            r=report();r[key]=val
            with self.assertRaises(AssertionError):assert_trial_report(r,SHA)
        r=report();r['build']['version']='0.9.67'
        with self.assertRaises(AssertionError):assert_trial_report(r,SHA)
    def test_empty_samples_do_not_turn_into_attack_or_repair(self):
        r=report()
        for o in r['observations'].values():o['motion']['history']=[]
        with self.assertRaises(AssertionError):assert_trial_report(r,SHA)
        self.assertEqual(assert_trial_report(r,SHA,require_actions=False)['tank-repair']['repairActions'],0)
    def test_missing_boundary_not_complete(self):
        r=report();del r['observations']['tank-victory']
        with self.assertRaises(AssertionError):assert_trial_report(r,SHA)
    def test_phase_and_actual_fingerprint_are_both_required(self):
        for key,val in [('frame',4),('tick',-1),('hp',0),('scope','framebuffer'),('reducedMotion','yes'),('index',9)]:
            o=sample();row=next(h for h in o['motion']['history'] if h['cause']);row[key]=val
            with self.assertRaises(AssertionError):assert_trial_observation(o)
        o=sample();next(h for h in o['motion']['history'] if h['cause'])['cell']['fnv1a32']^=1
        with self.assertRaises(AssertionError):assert_trial_observation(o)
    def test_cause_source_index_origin_target_tick_not_guessed(self):
        for key,val in [('index',0),('tick',-1),('origin',{'x':999,'z':0}),('target',{'x':999,'z':0})]:
            o=sample();row=next(h for h in o['motion']['history'] if h['cause']);row['cause']['effect']['enemyAction'][key]=val
            with self.assertRaises(AssertionError):assert_trial_observation(o)
    def test_head_repair_not_relabelled_as_attack(self):
        o=sample('tankHead');row=next(h for h in o['motion']['history'] if h['cause']);row['cause']['kind']='attack'
        with self.assertRaises(AssertionError):assert_trial_observation(o)
    def test_repair_target_and_amount_are_actual_bounded_delivery(self):
        for key,val in [('text','+500'),('kind','hit'),('actor',0)]:
            o=sample('tankHead');next(h for h in o['motion']['history'] if h['cause'])['cause']['effect'][key]=val
            with self.assertRaises(AssertionError):assert_trial_observation(o)
    def test_tick_and_history_bounds_reject_claimed_observation(self):
        for key,val in [('tick',-1),('historyLimit',25),('textureReadFailures',1),('stateMutation',True),('additionalGpuResources',1),('approved',True),('disposed',True)]:
            o=sample();o['motion'][key]=val
            with self.assertRaises(AssertionError):assert_trial_observation(o)
    def test_history_rows_cannot_be_reordered(self):
        o=sample();o['motion']['history'].reverse()
        with self.assertRaises(AssertionError):assert_trial_observation(o)
    def test_capture_is_one_read_and_separate_json(self):
        o=sample();calls=[]
        class Page:
            def evaluate(self,script):calls.append(script);return copy.deepcopy(o)
        with tempfile.TemporaryDirectory() as t:
            out=Path(t);obs={};capture_trial_motion(Page(),out,'tank-animation',obs)
            self.assertEqual(calls,[OBSERVE_SCRIPT]);self.assertEqual(json.loads((out/'trial-enemy-tank-animation-observation.json').read_text()),o)
        for bad in ('.keyboard','.click','.wait','localStorage','setState'):self.assertNotIn(bad,inspect.getsource(capture_trial_motion))
    def test_original_native_routes_are_exact_after_source_only_inverse(self):
        for name in ('tests/trial_browser.py','tests/rescue_browser.py','tests/field_enemy_action_browser.py'):
            old=restore_trial_u_source(name,(ROOT/name).read_text());self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),SPEC['originalSha256'][name])
    def test_source_inverse_rejects_missing_duplicate_and_unrelated_changes(self):
        for name,edits in SPEC['files'].items():
            raw=restore_trial_body_v_if_declared(name,(ROOT/name).read_text());old=restore_trial_u_source(name,raw);self.assertEqual(restore_trial_u_if_declared(name,old),old)
            e=edits[0]
            for bad in (raw.replace(e['after'],'',1),raw+e['after'],raw+'\n// unrelated drift'):
                with self.assertRaises(AssertionError):restore_trial_u_source(name,bad)
    def test_hurt_requires_real_prior_hp_loss_and_delivery(self):
        o=sample('tankHeadHurt');self.assertEqual(assert_trial_observation(o)['livingRecoils'],1)
        for key,val in [('hpBefore',0),('hpBefore',float('inf')),('hpAfter',0),('hpAfter',999)]:
            o=sample('tankHeadHurt');next(h for h in o['motion']['history'] if h['cause'])['cause'][key]=val
            with self.assertRaises(AssertionError):assert_trial_observation(o)
    def test_offline_negative_relabelled_heal_cannot_be_hurt(self):
        o=sample('tankHeadHurt');next(h for h in o['motion']['history'] if h['cause'])['cause']['effect']['kind']='heal'
        with self.assertRaises(AssertionError):assert_trial_observation(o)
    def test_hidden_dead_or_unknown_history_is_not_native_approval(self):
        o=sample();o['motion']['history']=[];v=assert_trial_observation(o)
        self.assertEqual(v['sourceActions'],0);self.assertEqual(v['completeActionClips'],0)
    def test_report_writer_preserves_failure(self):
        r=report()
        with tempfile.TemporaryDirectory() as t:
            out=Path(t);write_trial_motion_report(out,r['observations'],r['build'],SHA,[])
            self.assertEqual(json.loads((out/'trial-enemy-motion-report.json').read_text())['status'],'passed')
            with self.assertRaises(AssertionError):write_trial_motion_report(out,r['observations'],r['build'],SHA,['actual'])
            self.assertEqual(json.loads((out/'trial-enemy-motion-report.json').read_text())['status'],'failed')
if __name__=='__main__':unittest.main()
