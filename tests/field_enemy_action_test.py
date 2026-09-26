"""Synthetic validator fixtures and source-only preservation; never native evidence."""
import copy,hashlib,json,unittest,ast
from pathlib import Path
from field_enemy_action import assert_action_history,assert_native_report,MASKS,POINTS,OBSERVE_SCRIPT
from action_n_preservation import SPEC,restore_action_n_source,restore_action_n_if_declared
from body_o_preservation import restore_body_o_if_declared
ROOT=Path(__file__).resolve().parents[1]
def history_fixture():
    enemy={'x':-1.8,'z':2.4,'hp':18};rows=[]
    for kind,t,frame,ht,at in [('hurt',143,3,143,None),('attack',429,4,143,429),('attack',437,5,143,429)]:
        effect={'kind':'hit','x':enemy['x'],'z':enemy['z'],'text':'30','actor':0} if kind=='hurt' else {'kind':'hit','x':0,'z':5,'text':'−12','enemyAction':{'index':0,'tick':429,'origin':{'x':enemy['x'],'z':enemy['z']},'target':{'x':0,'z':5}}}
        rows.append(dict(index=0,name='enemy-0',tick=t,chapter='canyon',mode='battle',frame=frame,hurtTick=ht,attackTick=at,enemyHp=18,reducedMotion=False,cell={'width':24,'height':32},samples=[dict(x=x,y=y,rgba=[70,131,145,255] if c else [0,0,0,0]) for (x,y),c in zip(POINTS,MASKS[frame])],cause=dict(kind=kind,index=0,receivedTick=143 if kind=='hurt' else 429,effect=effect),scope='actual-texture-after-pose-update-not-framebuffer'))
    return {'state':{'ticks':440,'chapter':'canyon','mode':'battle','enemies':[enemy]},'motion':{'profile':'vq03m-field-imp-motion','actionProfile':'vq03n-field-imp-action','tick':440,'active':True,'battle':True,'approved':False,'disposed':False,'historyLimit':24,'historyDropped':0,'history':rows}}
class ActionNativeChecks(unittest.TestCase):
    def test_positive_synthetic_validator(self):
        self.assertEqual(assert_action_history(history_fixture(),require_positive=True),{'recoilSamples':1,'strikeSamples':1,'followSamples':1,'pairedActions':1})
    def test_mutated_metadata_and_pixels_fail_closed(self):
        changes=[lambda r:r['motion'].update(approved=True),lambda r:r['motion'].update(actionProfile='fake'),lambda r:r['motion'].update(historyLimit=99),lambda r:r['motion']['history'][0].update(enemyHp=0),lambda r:r['motion']['history'][0].update(tick=1000),lambda r:r['motion']['history'][0]['samples'][0].update(rgba=[1,1,1,255]),lambda r:r['motion']['history'][1]['cause']['effect'].pop('enemyAction'),lambda r:r['motion']['history'][1]['cause']['effect']['enemyAction'].update(index=1),lambda r:r['motion']['history'][1]['cause']['effect']['enemyAction']['origin'].update(x=99),lambda r:r['motion']['history'][1].update(attackTick=440),lambda r:r['motion']['history'][1].update(frame=2),lambda r:r['motion']['history'][2].update(scope='screenshot'),lambda r:r['motion']['history'][0]['cause']['effect'].pop('actor'),lambda r:r['motion']['history'].pop(0)]
        for f in changes:
            with self.subTest(mutation=f):
                r=history_fixture();f(r)
                with self.assertRaises((AssertionError,KeyError,IndexError,TypeError)):assert_action_history(r,require_positive=True)
    def test_empty_observation_is_not_positive_evidence(self):
        r=history_fixture();r['motion']['history']=[]
        self.assertEqual(assert_action_history(r)['recoilSamples'],0)
        with self.assertRaises(AssertionError):assert_action_history(r,require_positive=True)
    def test_reduced_does_not_pass_positive_gate(self):
        r=history_fixture()
        for h in r['motion']['history']:
            h.update(reducedMotion=True,frame=0)
            for s,c in zip(h['samples'],MASKS[0]):s['rgba']=[70,131,145,255] if c else [0,0,0,0]
        self.assertEqual(assert_action_history(r)['recoilSamples'],0)
        with self.assertRaises(AssertionError):assert_action_history(r,require_positive=True)
    def test_native_source_binding_rejects_missing_or_wrong_build(self):
        for sha in ['', 'not-a-sha', 'a'*40]:
            with self.assertRaises((AssertionError,KeyError)):assert_native_report({'sourceSha':'b'*40},sha)
    def test_old_routes_inputs_assertions_and_held_source_byte_exact(self):
        saved=json.loads((ROOT/'tests/baselines/vq03n-unchanged-inputs.json').read_text())
        for p,h in saved.items():self.assertEqual(hashlib.sha256(restore_body_o_if_declared(p,(ROOT/p).read_text()).encode()).hexdigest(),h,p)
    def test_exact_declared_inverse_keeps_every_old_workflow_step(self):
        for p,h in SPEC['originalSha256'].items():
            raw=restore_body_o_if_declared(p,(ROOT/p).read_text());old=restore_action_n_source(p,raw)
            self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),h,p)
            self.assertEqual(restore_action_n_if_declared(p,old),old)
            for edit in SPEC['files'][p]:
                with self.assertRaises(AssertionError):restore_action_n_source(p,raw+edit['after'])
                with self.assertRaises(AssertionError):restore_action_n_source(p,raw.replace(edit['after'],''))
    def test_native_prefix_keeps_all_existing_route_keys_waits_captures_and_assertions(self):
        old=(ROOT/'tests/opening_browser.py').read_text()
        new=(ROOT/'tests/field_enemy_action_browser.py').read_text()
        first="            page.click('#start-fair-coop')"
        end="            observe_field_enemy_battle(page, OUT)"
        self.assertEqual(old[old.index(first):old.index(end)+len(end)],new[new.index(first):new.index(end)+len(end)])
    def test_nonbattle_or_wrong_historical_source_rejected(self):
        for mutate in [lambda r:r['state'].update(mode='victory'),lambda r:r['motion'].update(battle=False),lambda r:r['motion']['history'][2]['cause']['effect']['enemyAction'].update(tick=430)]:
            r=history_fixture();mutate(r)
            with self.assertRaises(AssertionError):assert_action_history(r,require_positive=True)
    def test_observer_is_read_only_and_scenario_is_additive(self):
        for forbidden in ['setState','set_ticks','localStorage','dispatchEvent','Object.assign','requestAnimationFrame']:
            self.assertNotIn(forbidden,OBSERVE_SCRIPT)
        s=(ROOT/'tests/field_enemy_action_browser.py').read_text();ast.parse(s)
        self.assertIn('page.click(\'[data-slot="0"][data-action="attack"]\')',s)
        self.assertIn('wait_motion(page,',s)
        self.assertNotIn('add_init_script',s)
        self.assertNotIn('page.evaluate("window.__CHRONO_TEST__.snapshot().',s)
        self.assertIn("report['sourceSha']==report['build']['sourceSha']",s)
        wf=(ROOT/'.github/workflows/ci.yml').read_text()
        self.assertEqual(wf.count('run: python tests/field_enemy_action_browser.py'),1)
        self.assertEqual(wf.count('run: python tests/opening_browser.py'),1)
        self.assertIn("status='failed'",s)
