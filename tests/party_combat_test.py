"""Synthetic report checker unit tests, never native observations."""
import unittest,json,copy,hashlib
from pathlib import Path
from party_combat import GOLDEN,assert_party_history,assert_party_report,clip_frame
from party_p_preservation import SPEC,restore_party_p_source,restore_party_p_if_declared
from reaction_q_preservation import restore_reaction_q_if_declared
ROOT=Path(__file__).resolve().parent.parent
SHA='a'*40

def row(pose='attack',frame=0,tick=10):
    c={'kind':'action','tick':10,'pose':pose,'facing':1,'origin':{'x':0,'z':0},'target':{'x':2,'z':0},'effect':{'kind':'hit','actor':0,'origin':{'x':0,'z':0},'x':2,'z':0,'text':'unit-only','style':'fire' if pose=='cast' else 'slash'}}
    if pose=='down':c={'kind':'down','tick':10,'beforeTick':9,'hpBefore':5,'hpAfter':0,'facing':1}
    return {'slot':0,'actor':'crono','tick':tick,'hp':0 if pose=='down' else 10,'mode':'battle','pose':pose,'frame':frame,'facing':1,'reducedMotion':False,'cause':c,'scope':'draw-texture-not-framebuffer','texture':{'width':48,'height':64,'fnv1a32':GOLDEN['cells'][f'crono/{pose}/1/{frame}']['fnv1a32']}}
def record(rows=None):
    return {'state':{'ticks':40,'chapter':'canyon'},'motion':{'tick':40,'chapter':'canyon','profile':'vq03p-party-combat-continuity','disposed':False,'historyLimit':24,'historyDropped':0,'textureReadFailures':0,'stateMutation':False,'additionalGpuResources':0,'approved':False,'reducedMotion':False,'history':rows or [row()]}}
def report():return {'sourceSha':SHA,'build':{'sourceSha':SHA,'version':'0.9.63','batch':'VQ03P'},'status':'passed','nativeInputsOnly':True,'errors':[],'physicalDevice':False,'fullAnimationComplete':False,'artApproved':False,'framebufferSynchronized':False,'observation':record()}
class PartyCombat(unittest.TestCase):
    def test_positive_action_does_not_claim_missing_down(self):
        x=assert_party_report(report(),SHA);self.assertEqual(x,{'sourceActions':1,'actionFrameSamples':1,'observedFalls':0,'completeObservedFalls':0})
    def test_four_down_frames_positive_only_when_observed(self):
        r=record([row('down',f,10+a) for a,f in [(0,0),(8,1),(15,2),(23,3)]]);self.assertEqual(assert_party_history(r)['completeObservedFalls'],1)
    def test_missing_down_phase_stays_incomplete(self):self.assertEqual(assert_party_history(record([row('down')]))['completeObservedFalls'],0)
    def test_wrong_tick_rejected(self):
        r=record();r['motion']['tick']-=1
        with self.assertRaises(AssertionError):assert_party_history(r)
    def test_wrong_source_rejected(self):
        with self.assertRaises(AssertionError):assert_party_report(report(),'b'*40)
    def test_wrong_build_rejected(self):
        r=report();r['build']['batch']='VQ03O'
        with self.assertRaises(AssertionError):assert_party_report(r,SHA)
    def test_wrong_rgba_fingerprint_rejected(self):
        r=record();r['motion']['history'][0]['texture']['fnv1a32']^=1
        with self.assertRaises(AssertionError):assert_party_history(r)
    def test_wrong_source_direction_rejected(self):
        r=record();r['motion']['history'][0]['cause']['target']['z']=9
        with self.assertRaises(AssertionError):assert_party_history(r)
    def test_target_only_event_rejected(self):
        r=record();del r['motion']['history'][0]['cause']['effect']['origin']
        with self.assertRaises((AssertionError,KeyError)):assert_party_history(r)
    def test_wrong_owner_rejected(self):
        r=record();r['motion']['history'][0]['cause']['effect']['guest']=True
        with self.assertRaises(AssertionError):assert_party_history(r)
    def test_wrong_phase_rejected(self):
        r=record([row('attack',3,10)])
        with self.assertRaises(AssertionError):assert_party_history(r)
    def test_fall_without_prior_alive_rejected(self):
        r=record([row('down')]);r['motion']['history'][0]['cause']['hpBefore']=0
        with self.assertRaises(AssertionError):assert_party_history(r)
    def test_empty_or_unread_history_cannot_pass(self):
        r=record();r['motion']['history']=[]
        with self.assertRaises(AssertionError):assert_party_history(r,require_action=True)
        r=record();r['motion']['textureReadFailures']=1
        with self.assertRaises(AssertionError):assert_party_history(r)
    def test_no_state_or_wait_writes_in_readonly_suffix(self):
        import party_combat
        self.assertNotIn('=',party_combat.OBSERVE_SCRIPT.split('return ')[1].replace('=>',''))
        code=(ROOT/'tests/party_combat.py').read_text().split('def observe_party_suffix')[1]
        for forbidden in ('page.click','page.keyboard','wait_for','time.sleep','setTimeout','requestAnimationFrame'):self.assertNotIn(forbidden,code)
    def test_exact_P_to_O_inverse_and_drift_failures(self):
        for p,h in SPEC['originalSha256'].items():
            raw=restore_reaction_q_if_declared(p,(ROOT/p).read_text());old=restore_party_p_source(p,raw);self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),h)
            self.assertEqual(restore_party_p_if_declared(p,old),old)
            self.assertEqual(restore_party_p_if_declared(p,raw+'\n# drift\n'),old+'\n# drift\n')
            e=SPEC['files'][p][0]
            for bad in [raw+e['after'],raw.replace(e['after'],''),raw+'\n# unrelated drift\n']:
                with self.assertRaises(AssertionError):restore_party_p_source(p,bad)
if __name__=='__main__':unittest.main()
