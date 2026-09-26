from rescue_s_preservation import restore_rescue_s_if_declared
"""R synthetic verifier/negative tests. None of these fixtures are native evidence."""
import unittest,copy,math,inspect,json,hashlib
from pathlib import Path
from combat_timing import assert_timing_history,assert_timing_report,observe_timing_suffix,OBSERVE_SCRIPT
from party_reaction import assert_reaction_report
from party_reaction_test import report as q_report
from combat_timing_r_preservation import SPEC,restore_combat_timing_r_source,restore_combat_timing_r_if_declared
ROOT=Path(__file__).resolve().parent.parent
SHA='a'*40

def observation():
    src={'id':1,'tick':100,'effect':{'kind':'hit','actor':0,'origin':{'x':0,'z':0},'x':2,'z':0,'style':'slash','text':'offline synthetic'}}
    rows=[]
    for kind,age,phase in [('lunge',0,'start'),('number',0,'start'),('stroke',0,'start'),('lunge',13,'middle'),('stroke',18,'middle'),('lunge',26,'expired'),('stroke',37,'expired'),('number',38,'middle'),('number',76,'expired')]:
        t=age/60;a={'position':[2,2.2+t*.8,0],'enabled':True,'disposed':phase=='expired'}
        if kind=='lunge':
            push=0 if t>=.42 else math.sin(t/.42*math.pi);off=.55*push
            a={'position':[off,.789,0.57],'enabled':True,'disposed':False,'logical':{'x':0,'z':0},'shadow':[off,.14,0],'offset':{'x':off,'z':0}}
        if kind=='stroke':a={'position':[2,1.3,0],'scale':[1+t*.6]*3,'alpha':max(0,1-t/.6),'enabled':True,'disposed':phase=='expired'}
        rows.append({'kind':kind,'tick':100+age,'ageTicks':age,'seconds':t,'phase':phase,'reducedMotion':False,'source':copy.deepcopy(src),'actual':a,'scope':'draw-transform-not-framebuffer'})
    return {'state':{'ticks':176,'chapter':'canyon'},'motion':{'profile':'vq03r-simulation-combat-timing','clock':'simulation-ticks','tick':176,'disposed':False,'reducedMotion':False,'historyLimit':24,'historyDropped':0,'stateMutation':False,'additionalGpuResources':0,'approved':False,'history':rows},'transient':{'floats':0,'strokes':0}}

def report():return {'status':'passed','sourceSha':SHA,'build':{'sourceSha':SHA,'version':'0.9.65','batch':'VQ03R'},'nativeInputsOnly':True,'physicalDevice':False,'fullAnimationComplete':False,'artApproved':False,'framebufferSynchronized':False,'errors':[],'observation':observation()}

class Timing(unittest.TestCase):
    def test_complete_shared_real_source_relationship(self):self.assertEqual(assert_timing_report(report(),SHA)['completeCombinedEvents'],1)
    def test_empty_or_partial_history_is_not_a_complete_native_event(self):
        for keep in [[],observation()['motion']['history'][:5]]:
            o=observation();o['motion']['history']=keep
            with self.assertRaises(AssertionError):assert_timing_history(o,require_complete=True)
    def test_wrong_clock_tick_age(self):
        for key,value in [('seconds',.1),('ageTicks',1),('tick',99)]:
            o=observation();o['motion']['history'][0][key]=value
            with self.assertRaises(AssertionError):assert_timing_history(o)
    def test_mismatched_effect_same_source_id(self):
        o=observation();o['motion']['history'][3]['source']['effect']['text']='different'
        with self.assertRaises(AssertionError):assert_timing_history(o)
    def test_fabricated_lunge_without_actual_owner_or_origin(self):
        for key in ['actor','origin']:
            o=observation()
            for h in o['motion']['history']:del h['source']['effect'][key]
            with self.assertRaises((AssertionError,KeyError)):assert_timing_history(o)
    def test_wrong_direction_or_actual_foot(self):
        for key in ['offset','shadow']:
            o=observation();a=o['motion']['history'][3]['actual']
            if key=='offset':a[key]['x']=-1
            else:a[key][0]=-1
            with self.assertRaises(AssertionError):assert_timing_history(o)
    def test_number_position_and_rise(self):
        for coord in [0,1,2]:
            o=observation();o['motion']['history'][7]['actual']['position'][coord]+=1
            with self.assertRaises(AssertionError):assert_timing_history(o)
    def test_stroke_scale_and_alpha(self):
        for key in ['scale','alpha']:
            o=observation();a=o['motion']['history'][4]['actual'];a[key]=[1,1,1] if key=='scale' else 1
            with self.assertRaises(AssertionError):assert_timing_history(o)
    def test_expiry_requires_actual_disposal(self):
        for index in [6,8]:
            o=observation();o['motion']['history'][index]['actual']['disposed']=False
            with self.assertRaises(AssertionError):assert_timing_history(o)
    def test_early_expiry_or_late_active_rejected(self):
        for index,phase in [(4,'expired'),(8,'middle')]:
            o=observation();o['motion']['history'][index]['phase']=phase
            with self.assertRaises(AssertionError):assert_timing_history(o)
    def test_transforms_are_not_synchronized_framebuffer(self):
        r=report();r['framebufferSynchronized']=True
        with self.assertRaises(AssertionError):assert_timing_report(r,SHA)
    def test_wrong_source_or_build(self):
        r=report()
        with self.assertRaises(AssertionError):assert_timing_report(r,'b'*40)
        r['build']['batch']='VQ03Q'
        with self.assertRaises(AssertionError):assert_timing_report(r,SHA)
    def test_prior_Q_default_strict_and_R_explicit(self):
        r=q_report();assert_reaction_report(r,SHA);r['build'].update(version='0.9.65',batch='VQ03R')
        with self.assertRaises(AssertionError):assert_reaction_report(r,SHA)
        assert_reaction_report(r,SHA,expected_build=('0.9.65','VQ03R'))
    def test_disposed_oversized_or_mutating_inspector_rejected(self):
        for key,value in [('disposed',True),('stateMutation',True),('additionalGpuResources',1),('historyLimit',100),('approved',True)]:
            o=observation();o['motion'][key]=value
            with self.assertRaises(AssertionError):assert_timing_history(o)
    def test_suffix_is_readonly_no_wait_input_or_tick_write(self):
        code=inspect.getsource(observe_timing_suffix)
        for term in ['page.click','page.keyboard','wait_for','sleep','setTimeout','requestAnimationFrame']:self.assertNotIn(term,code)
        self.assertNotIn('=',OBSERVE_SCRIPT.split('return ')[1].replace('=>',''))
    def test_all_exact_R_source_inverses_and_negative_drift(self):
        for name,h in SPEC['originalSha256'].items():
            raw=restore_rescue_s_if_declared(name,(ROOT/name).read_text());old=restore_combat_timing_r_source(name,raw)
            self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),h);self.assertEqual(restore_combat_timing_r_if_declared(name,old),old)
            e=SPEC['files'][name][0]
            for bad in [raw+e['after'],raw.replace(e['after'],''),raw+'\n# unrelated\n']:
                with self.assertRaises(AssertionError):restore_combat_timing_r_source(name,bad)
if __name__=='__main__':unittest.main()
