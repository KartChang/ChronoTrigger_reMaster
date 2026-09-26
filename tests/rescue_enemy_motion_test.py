"""S verifier tests: explicit synthetic fixtures, not provider/native observations."""
import unittest,copy,hashlib,inspect,json
from pathlib import Path
from rescue_enemy_motion import GOLDEN,OBSERVE_SCRIPT,assert_rescue_history,assert_rescue_report,capture_rescue_enemies,write_rescue_report,frame_at
from rescue_s_preservation import SPEC,restore_rescue_s_source,restore_rescue_s_if_declared
from combat_timing import assert_timing_report
from combat_timing_test import report as r_report
ROOT=Path(__file__).resolve().parent.parent
SHA='a'*40

def observation(kind='naga',hurt=False):
    idx={'naga':0,'hench':1,'yakra':2}[kind];chapter=['cathedral','passage','sanctum'][idx]
    effect={'kind':'hit','text':'explicit offline synthetic','x':0,'z':-1,'enemyAction':{'index':0,'tick':100,'origin':{'x':0,'z':2},'target':{'x':0,'z':-1}}}
    cause={'kind':'attack','index':0,'tick':100,'receivedTick':100,'effect':effect}
    ages=[0,8,16,24]
    if hurt:
        cause={'kind':'hurt','index':0,'tick':100,'receivedTick':100,'effect':{'kind':'hit','actor':0,'x':0,'z':2,'text':'explicit offline synthetic'}}
        ages=[0,8,18,24]
    rows=[]
    for age in ages:
        c=copy.deepcopy(cause) if age<(18 if hurt else 24) else None
        f=frame_at(100+age,0,kind,0,False,c)
        rows.append({'index':0,'kind':kind,'tick':100+age,'mode':'battle','hp':30,'atb':0,'frame':f,'reducedMotion':False,'cause':c,'cell':{k:GOLDEN['cells'][f'{kind}/{f}'][k] for k in ['width','height','fnv1a32']},'scope':'texture-not-framebuffer'})
    return {'state':{'ticks':124,'chapter':chapter,'mode':'battle','enemies':[{'kind':kind,'hp':30,'x':0,'z':2}],'players':[{'x':0,'z':-1},{'x':2,'z':-1}],'rescue':{'guest':{'x':0,'z':-2}}},'motion':{'profile':'vq03s-rescue-enemy-motion','artProfile':'vq03s-rescue-enemy-poses','clock':'simulation-ticks','tick':124,'chapter':chapter,'active':True,'disposed':False,'reducedMotion':False,'historyLimit':24,'historyDropped':0,'textureReadFailures':0,'stateMutation':False,'additionalGpuResources':0,'approved':False,'history':rows,'cache':[None,None,None]}}

def report():return {'sourceSha':SHA,'build':{'sourceSha':SHA,'version':'0.9.66','batch':'VQ03S'},'status':'passed','errors':[],'nativeInputsOnly':True,'physicalDevice':False,'artApproved':False,'fullAnimationComplete':False,'framebufferSynchronized':False,'observations':{label:observation(kind) for label,kind in zip(['naga','guards','yakra'],['naga','hench','yakra'])}}

class RescueMotion(unittest.TestCase):
    def test_three_original_encounters_and_paired_source_frames(self):
        r=assert_rescue_report(report(),SHA)
        self.assertTrue(all(x['pairedStrikeFollow']==1 and x['recoverySequences']==1 for x in r.values()))
    def test_exact_living_recoil(self):self.assertEqual(assert_rescue_history(observation(hurt=True))['livingRecoilEvents'],1)
    def test_wrong_cell_size_fingerprint_or_frame(self):
        for key,v in [('width',25),('height',33),('fnv1a32',0)]:
            o=observation();o['motion']['history'][0]['cell'][key]=v
            with self.assertRaises(AssertionError):assert_rescue_history(o)
        o=observation();o['motion']['history'][0]['frame']=4
        with self.assertRaises(AssertionError):assert_rescue_history(o)
    def test_wrong_tick_and_nonmonotone_history(self):
        for value in [-1,.5,True,99,125]:
            o=observation();o['motion']['history'][1]['tick']=value
            with self.assertRaises(AssertionError):assert_rescue_history(o)
    def test_target_is_not_an_attacker(self):
        o=observation();del o['motion']['history'][0]['cause']['effect']['enemyAction']
        with self.assertRaises((AssertionError,KeyError)):assert_rescue_history(o)
    def test_wrong_source_origin_index_or_target(self):
        for key,value in [('index',1),('tick',101),('origin',{'x':5,'z':2}),('target',{'x':5,'z':-1})]:
            o=observation();o['motion']['history'][0]['cause']['effect']['enemyAction'][key]=value
            with self.assertRaises(AssertionError):assert_rescue_history(o)
    def test_wrong_recipient_position(self):
        o=observation()
        for h in o['motion']['history']:
            if h['cause']:h['cause']['effect']['x']=99;h['cause']['effect']['enemyAction']['target']['x']=99
        with self.assertRaises(AssertionError):assert_rescue_history(o)
    def test_same_attack_cannot_change_its_cause_halfway(self):
        o=observation();o['motion']['history'][1]['cause']['effect']['text']='other'
        with self.assertRaises(AssertionError):assert_rescue_history(o)
    def test_expired_cause_and_future_delivery_rejected(self):
        for mutation in ['expired','future']:
            o=observation()
            if mutation=='expired':o['motion']['history'][-1]['cause']=copy.deepcopy(o['motion']['history'][0]['cause'])
            else:o['motion']['history'][0]['cause']['receivedTick']=101
            with self.assertRaises(AssertionError):assert_rescue_history(o)
    def test_wrong_hurt_target_hp_or_actor(self):
        for mut in ['target','hp','actor']:
            o=observation(hurt=True);h=o['motion']['history'][0]
            if mut=='target':h['cause']['effect']['x']=99
            if mut=='hp':h['hp']=0
            if mut=='actor':del h['cause']['effect']['actor']
            with self.assertRaises(AssertionError):assert_rescue_history(o)
    def test_no_attack_does_not_count_as_positive_native_evidence(self):
        r=report()
        for o in r['observations'].values():o['motion']['history']=[]
        with self.assertRaises(AssertionError):assert_rescue_report(r,SHA)
        self.assertTrue(all(x['sourceActions']==0 for x in assert_rescue_report(r,SHA,require_attack=False).values()))
    def test_wrong_build_and_sha_rejected(self):
        r=report()
        with self.assertRaises(AssertionError):assert_rescue_report(r,'b'*40)
        r['build']['version']='0.9.65'
        with self.assertRaises(AssertionError):assert_rescue_report(r,SHA)
    def test_prior_R_default_remains_strict_with_explicit_S_override(self):
        r=r_report();assert_timing_report(r,SHA);r['build'].update(version='0.9.66',batch='VQ03S')
        with self.assertRaises(AssertionError):assert_timing_report(r,SHA)
        assert_timing_report(r,SHA,expected_build=('0.9.66','VQ03S'))
    def test_no_full_animation_or_synchronous_framebuffer_claims(self):
        for key in ['physicalDevice','artApproved','fullAnimationComplete','framebufferSynchronized']:
            r=report();r[key]=True
            with self.assertRaises(AssertionError):assert_rescue_report(r,SHA)
    def test_history_cap_profiles_and_read_failure(self):
        for key,value in [('historyLimit',25),('profile','other'),('textureReadFailures',1),('disposed',True),('stateMutation',True),('additionalGpuResources',1),('clock','wall-time')]:
            o=observation();o['motion'][key]=value
            with self.assertRaises(AssertionError):assert_rescue_history(o)
    def test_only_original_three_maps(self):
        o=observation();o['state']['chapter']=o['motion']['chapter']='forest'
        with self.assertRaises(AssertionError):assert_rescue_history(o)
    def test_readonly_captures_never_wait_or_issue_inputs(self):
        source=inspect.getsource(capture_rescue_enemies)+inspect.getsource(write_rescue_report)
        for term in ['page.keyboard','page.click','wait_for','sleep','setTimeout','requestAnimationFrame']:self.assertNotIn(term,source)
        self.assertNotIn('=',OBSERVE_SCRIPT.split('return ')[1].replace('=>',''))
    def test_original_rescue_route_exact_source_inverse(self):
        name='tests/rescue_browser.py';raw=(ROOT/name).read_text();old=restore_rescue_s_source(name,raw)
        self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),SPEC['originalSha256'][name])
        self.assertEqual(raw.count('capture_rescue_enemies(page,OUT,'),3)
        self.assertEqual(raw.count('page.screenshot('),old.count('page.screenshot('))
    def test_all_declared_source_inverses_with_negative_missing_duplicate_drift(self):
        for name,h in SPEC['originalSha256'].items():
            raw=(ROOT/name).read_text();old=restore_rescue_s_source(name,raw);self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),h)
            self.assertEqual(restore_rescue_s_if_declared(name,old),old);e=SPEC['files'][name][0]
            for bad in [raw+e['after'],raw.replace(e['after'],''),raw+'\n# unrelated\n']:
                with self.assertRaises(AssertionError):restore_rescue_s_source(name,bad)
if __name__=='__main__':unittest.main()
