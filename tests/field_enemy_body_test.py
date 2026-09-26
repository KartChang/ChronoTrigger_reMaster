"""Synthetic offline fixtures for fail-closed checker tests; never native evidence."""
import ast,copy,hashlib,json,math,unittest
from pathlib import Path
from field_enemy_body import assert_body_history,assert_body_report,OBSERVE_SCRIPT,POINTS
from body_o_preservation import SPEC,restore_body_o_source,restore_body_o_if_declared
ROOT=Path(__file__).resolve().parents[1]
def fixture(death=False):
    foe={'x':1.8,'z':3,'hp':0 if death else 18};origin={'x':0,'z':5};target={'x':1.8,'z':3}
    rows=[]
    for kind,t,at,phase in [('recoil',100,100,'out'),('recoil',109,100,'return'),('attack',200,200,'out'),('attack',212,200,'return')]+([('death',300,300,'settle'),('death',312,300,'fade'),('death',324,300,'expired')] if death else []):
        is_attack=kind=='attack';o=target if is_attack else origin;tar=origin if is_attack else target
        e={'kind':'hit',**tar,'text':'−12' if is_attack else '30'}
        if is_attack:e['enemyAction']={'index':0,'tick':at,'origin':o,'target':tar}
        else:e.update(actor=0,origin=o)
        cause=dict(kind=kind,index=0,tick=at,receivedTick=at,origin=o,target=tar,effect=e,hpBefore=48 if kind=='recoil' else 18,hpAfter=0 if kind=='death' else 18)
        duration=18 if kind=='recoil' else 24;reach=.1 if kind=='recoil' else .2;dx=tar['x']-o['x'];dz=tar['z']-o['z'];d=math.hypot(dx,dz);w=math.sin(math.pi*(t-at)/duration) if kind!='death' else 0
        offset={'x':dx/d*reach*w,'z':dz/d*reach*w}
        h=dict(index=0,tick=t,kind=kind,cause=cause,phase=phase,position=[1.8+offset['x'],1,3+offset['z']],offset=offset,enabled=phase!='expired',originalEnabled=kind!='death',alpha=(1-(t-at)/24 if kind=='death' else 1),scale=[1,1.3*(1-.7*(t-at)/24) if kind=='death' and phase!='expired' else 1.3,1],scope='render-only-transform-not-framebuffer')
        if kind=='death':h['texture']={'cell':{'width':24,'height':32},'samples':[dict(x=x,y=y,rgba=c[:]) for x,y,c in POINTS]}
        rows.append(h)
    return {'state':{'ticks':324 if death else 215,'chapter':'canyon','mode':'battle','enemies':[foe]},'body':{'tick':324 if death else 215,'chapter':'canyon','profile':'vq03o-field-body-response','disposed':False,'approved':False,'reducedMotion':False,'historyLimit':24,'historyDropped':0,'history':rows,'resources':dict(limit=3,active=0,rawTextureBytes=0,created=1 if death else 0,released=1 if death else 0,creationFailures=0),'remnants':[]},'paused':False,'observation':'read-only-native-session','physicalDevice':False,'artApproved':False,'transformHistoryIsFramebuffer':False}
class BodyEvidence(unittest.TestCase):
    def test_synthetic_positive_math_and_expiry(self):
        self.assertEqual(assert_body_history(fixture(),positive_motion=True),dict(pairedBodyActions=1,positiveBodyRecoils=1,completeRemnants=0))
        self.assertEqual(assert_body_history(fixture(True),positive_motion=True,positive_death=True)['completeRemnants'],1)
    def test_missing_events_are_not_positive(self):
        r=fixture();r['body']['history']=[]
        with self.assertRaises(AssertionError):assert_body_history(r,positive_motion=True)
        with self.assertRaises(AssertionError):assert_body_history(fixture(),positive_death=True)
    def test_bad_transform_action_origin_or_timestamp_rejected(self):
        changes=[lambda h:h.update(tick=999),lambda h:h.update(scope='framebuffer'),lambda h:h['offset'].update(x=99),lambda h:h['position'].__setitem__(0,99),lambda h:h['cause']['effect']['enemyAction'].update(index=1),lambda h:h['cause']['effect']['enemyAction']['origin'].update(x=3),lambda h:h.update(phase='out'),lambda h:h.update(originalEnabled=False)]
        for change in changes:
            r=fixture();change(r['body']['history'][3])
            with self.subTest(change=change),self.assertRaises((AssertionError,KeyError,IndexError)):assert_body_history(r,positive_motion=True)
    def test_false_death_texture_lifetime_and_resource_claims_rejected(self):
        changes=[lambda r:r['body']['history'][4]['cause'].update(hpBefore=0),lambda r:r['body']['history'][4].update(originalEnabled=True),lambda r:r['body']['history'][5].update(alpha=1),lambda r:r['body']['history'][5]['texture']['samples'][0].update(rgba=[0,0,0,0]),lambda r:r['body']['history'][6].update(enabled=True),lambda r:r['body']['resources'].update(rawTextureBytes=3072),lambda r:r['body']['resources'].update(limit=99),lambda r:r['body'].update(disposed=True),lambda r:r.update(paused=True)]
        for change in changes:
            r=fixture(True);change(r)
            with self.subTest(change=change),self.assertRaises((AssertionError,KeyError,IndexError)):assert_body_history(r,positive_death=True)
    def test_source_and_build_mismatch_reject(self):
        for r,sha in [({},''),({'sourceSha':'b'*40},'a'*40),({'sourceSha':'a'*40,'build':{'sourceSha':'a'*40,'version':'0.9.61','batch':'VQ03N'}},'a'*40)]:
            with self.assertRaises((AssertionError,KeyError)):assert_body_report(r,sha)
    def test_source_only_inverse_exact_and_negative(self):
        for p,expected in SPEC['originalSha256'].items():
            raw=(ROOT/p).read_text();old=restore_body_o_source(p,raw)
            self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),expected,p)
            self.assertEqual(restore_body_o_if_declared(p,old),old)
            for e in SPEC['files'][p]:
                with self.assertRaises(AssertionError):restore_body_o_source(p,raw+e['after'])
                with self.assertRaises(AssertionError):restore_body_o_source(p,raw.replace(e['after'],''))
            self.assertNotEqual(hashlib.sha256(restore_body_o_source(p,raw+'\n# unrelated drift\n').encode()).hexdigest(),expected,p)
    def test_existing_native_scenario_is_retained_with_only_explicit_suffix_and_build_binding(self):
        p='tests/field_enemy_action_browser.py';raw=(ROOT/p).read_text();old=restore_body_o_source(p,raw)
        self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),SPEC['originalSha256'][p])
        self.assertLess(raw.index("report['positiveSamples']=assert_native_report"),raw.index('observe_native_body_suffix(page'))
        self.assertIn('expected_build=(\'0.9.62\',\'VQ03O\')',raw);ast.parse(raw)
        for p,h in json.loads((ROOT/'tests/baselines/vq03o-unchanged-inputs.json').read_text()).items():self.assertEqual(hashlib.sha256((ROOT/p).read_bytes()).hexdigest(),h,p)
    def test_observer_and_harness_do_not_mutate_native_state(self):
        s=(ROOT/'tests/field_enemy_body.py').read_text();ast.parse(s)
        for banned in ['setState','set_ticks','dispatchEvent','localStorage','Object.assign','add_init_script','clock.install','set_system_time']:
            self.assertNotIn(banned,OBSERVE_SCRIPT);self.assertNotIn(banned,s)
        self.assertIn('page.click(\'[data-slot="0"][data-action="attack"]\')',s)
        self.assertIn('page.locator(\'#target-name0\')',s)
        self.assertIn('budget',s)
