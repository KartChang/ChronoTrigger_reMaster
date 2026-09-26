"""Q synthetic verifier and source inverse tests; not native evidence."""
from combat_timing_r_preservation import restore_combat_timing_r_if_declared
import unittest,copy,hashlib,inspect
from pathlib import Path
from party_reaction import GOLDEN,assert_reaction_history,assert_reaction_report,observe_reaction_suffix,OBSERVE_SCRIPT
from reaction_q_preservation import SPEC,restore_reaction_q_source,restore_reaction_q_if_declared
from party_combat import assert_party_report
from party_combat_test import report as p_report
ROOT=Path(__file__).resolve().parent.parent
SHA='a'*40

def row(f=0,t=100):
    c={'kind':'delivered-target-hit','tick':100,'target':{'x':1,'z':2},'beforeDraw':{'tick':99,'facing':3},'effect':{'kind':'hit','x':1,'z':2,'text':'synthetic target-only'}}
    return {'slot':0,'actor':'crono','tick':t,'hp':60,'mode':'battle','pose':'hurt','frame':f,'facing':3,'fallbackFacing':1,'reducedMotion':False,'cause':c,'texture':{'width':48,'height':64,'fnv1a32':GOLDEN['cells'][f'crono/hurt/3/{f}']['fnv1a32']},'scope':'draw-texture-not-framebuffer'}
def record():return {'state':{'ticks':130,'chapter':'canyon'},'motion':{'profile':'vq03q-party-reaction-continuity','tick':130,'chapter':'canyon','disposed':False,'historyLimit':24,'historyDropped':0,'textureReadFailures':0,'stateMutation':False,'additionalGpuResources':0,'approved':False,'reducedMotion':False,'history':[row()]}}
def report():return {'status':'passed','sourceSha':SHA,'build':{'sourceSha':SHA,'version':'0.9.64','batch':'VQ03Q'},'nativeInputsOnly':True,'physicalDevice':False,'fullAnimationComplete':False,'artApproved':False,'framebufferSynchronized':False,'errors':[],'observation':record()}
class Reaction(unittest.TestCase):
    def test_positive_target_only_hit_does_not_invent_attacker(self):self.assertEqual(assert_reaction_report(report(),SHA),{'deliveredHits':1,'reactionFrameSamples':1,'completeObservedReactions':0,'differentFallbackSamples':1})
    def test_all_actual_phases_required_for_complete_sequence(self):
        r=record();r['motion']['history']=[row(f,100+a) for f,a in [(0,0),(1,6),(2,11),(3,17)]];self.assertEqual(assert_reaction_history(r)['completeObservedReactions'],1)
    def test_empty_is_not_positive(self):
        r=record();r['motion']['history']=[]
        with self.assertRaises(AssertionError):assert_reaction_history(r,require_hit=True)
    def test_wrong_fingerprint(self):
        r=record();r['motion']['history'][0]['texture']['fnv1a32']^=1
        with self.assertRaises(AssertionError):assert_reaction_history(r)
    def test_wrong_prior_facing(self):
        r=record();r['motion']['history'][0]['cause']['beforeDraw']['facing']=1
        with self.assertRaises(AssertionError):assert_reaction_history(r)
    def test_missing_actual_prior_draw(self):
        r=record();del r['motion']['history'][0]['cause']['beforeDraw']
        with self.assertRaises(KeyError):assert_reaction_history(r)
    def test_future_prior_draw(self):
        r=record();r['motion']['history'][0]['cause']['beforeDraw']['tick']=101
        with self.assertRaises(AssertionError):assert_reaction_history(r)
    def test_wrong_target(self):
        r=record();r['motion']['history'][0]['cause']['effect']['x']=7
        with self.assertRaises(AssertionError):assert_reaction_history(r)
    def test_outgoing_ownership_is_not_incoming(self):
        for e in [{'actor':0},{'guest':True},{'kind':'heal'},{'kind':'combo'}]:
            r=record();r['motion']['history'][0]['cause']['effect'].update(e)
            with self.assertRaises(AssertionError):assert_reaction_history(r)
    def test_bad_phase_or_expired_hurt(self):
        for t in [99,125,130]:
            r=record();r['motion']['history'][0]['tick']=t
            with self.assertRaises(AssertionError):assert_reaction_history(r)
    def test_dead_or_bad_actor(self):
        for attr,value in [('hp',0),('actor','frog'),('slot',3),('facing',4)]:
            r=record();r['motion']['history'][0][attr]=value
            with self.assertRaises(AssertionError):assert_reaction_history(r)
    def test_same_hit_cannot_change_cause(self):
        r=record();r['motion']['history'].append(row());r['motion']['history'][1]['cause']['beforeDraw']['tick']=98
        with self.assertRaises(AssertionError):assert_reaction_history(r)
    def test_resource_and_dispose_flags(self):
        for k,v in [('disposed',True),('textureReadFailures',1),('stateMutation',True),('additionalGpuResources',1),('approved',True)]:
            r=record();r['motion'][k]=v
            with self.assertRaises(AssertionError):assert_reaction_history(r)
    def test_wrong_source_and_build(self):
        with self.assertRaises(AssertionError):assert_reaction_report(report(),'b'*40)
        r=report();r['build']['batch']='VQ03P'
        with self.assertRaises(AssertionError):assert_reaction_report(r,SHA)
    def test_original_P_default_stays_strict_and_Q_is_explicit(self):
        r=p_report();assert_party_report(r,SHA);r['build'].update(version='0.9.64',batch='VQ03Q')
        with self.assertRaises(AssertionError):assert_party_report(r,SHA)
        assert_party_report(r,SHA,expected_build=('0.9.64','VQ03Q'))
    def test_readonly_suffix_has_no_inputs_waits_or_state_writes(self):
        code=inspect.getsource(observe_reaction_suffix)
        for term in ('page.click','page.keyboard','wait_for','sleep','setTimeout','requestAnimationFrame'):self.assertNotIn(term,code)
        self.assertNotIn('=',OBSERVE_SCRIPT.split('return ')[1].replace('=>',''))
    def test_strict_Q_to_P_inverse_and_drift(self):
        for p,h in SPEC['originalSha256'].items():
            raw=restore_combat_timing_r_if_declared(p,(ROOT/p).read_text());old=restore_reaction_q_source(p,raw);self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),h)
            self.assertEqual(restore_reaction_q_if_declared(p,old),old)
            self.assertEqual(restore_reaction_q_if_declared(p,raw+'\n# drift\n'),old+'\n# drift\n')
            e=SPEC['files'][p][0]
            for bad in [raw+e['after'],raw.replace(e['after'],''),raw+'\n# unrelated drift\n']:
                with self.assertRaises(AssertionError):restore_reaction_q_source(p,bad)
if __name__=='__main__':unittest.main()
