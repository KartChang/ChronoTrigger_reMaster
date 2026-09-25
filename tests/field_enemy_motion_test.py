"""Synthetic validator fixtures; never a claim of native gameplay evidence."""
import copy,unittest,ast
from pathlib import Path
from field_enemy_motion import assert_field_enemy_motion

def fixture(chapter='canyon',tick=155,reduced=False):
    masks=[[0,0,1,0],[0,1,0,0]]; actors=[]
    for i in range(3 if chapter=='canyon' else 2):
        f=0 if reduced else int((tick+i*37)%180>=150)
        actors.append(dict(index=i,name='enemy-'+str(i),frame=f,tick=tick,uploads=1,hurtTick=None,cell=dict(width=24,height=32),samples=[dict(x=x,y=y,rgba=[70,131,145,255] if c else [0,0,0,0]) for (x,y),c in zip([(3,19),(3,20),(3,25),(21,22)],masks[f])]))
    return dict(state=dict(chapter=chapter,ticks=tick,mode='explore'),art=dict(actors=[dict(name=a['name']) for a in actors]),motion=dict(profile='vq03m-field-imp-motion',active=True,tick=tick,reducedMotion=reduced,battle=False,approved=False,disposed=False,actors=actors))
class ImpMNativeGateTests(unittest.TestCase):
    def test_phase_and_reduced_synthetic(self):
        for c in ['canyon','forest']:
            for t in [0,23,149,150,155,179,180,400]:
                for r in [False,True]:self.assertTrue(assert_field_enemy_motion(fixture(c,t,r)))
    def test_missing_or_forged_observations(self):
        for mutate in [lambda o:o.pop('motion'),lambda o:o['motion'].update(tick=1),lambda o:o['motion'].update(active=False),lambda o:o['motion'].update(approved=True),lambda o:o['motion']['actors'][0].update(frame=0),lambda o:o['motion']['actors'][0].update(hurtTick=155),lambda o:o['motion']['actors'][0]['samples'][1].update(rgba=[0,0,0,0]),lambda o:o['motion']['actors'].pop(),lambda o:o['motion']['actors'][0].update(index=2),lambda o:o['motion'].update(disposed=True)]:
            o=fixture();mutate(o)
            with self.assertRaises((AssertionError,KeyError)):assert_field_enemy_motion(o)
    def test_capture_writes_png_before_additive_gate(self):
        s=(Path(__file__).parent/'field_enemy_capture.py').read_text()
        self.assertIn('motion:view.fieldEnemyMotion',s)
        self.assertLess(s.index('path.write_bytes(raw)'),s.index('    assert_field_enemy_motion(record)'))
        tree=ast.parse(s);calls=[n for n in ast.walk(tree) if isinstance(n,ast.Call)]
        self.assertEqual(sum(isinstance(n.func,ast.Attribute) and n.func.attr=='evaluate' for n in calls),1)
        for forbidden in ['wait_for_timeout','keyboard','mouse','setState','set_ticks']:
            self.assertNotIn(forbidden,s)

class ImpMBattleObservationTests(unittest.TestCase):
    def test_ready_hurt_and_reduced_synthetic(self):
        masks=[[0,0,1,0],[0,1,0,0],[1,1,0,0],[0,0,0,1]]
        for tick in [0,72,90,150]:
            for reduced in [False,True]:
                for hurt in [None,tick,max(0,tick-18)]:
                    o=fixture(tick=tick,reduced=reduced);o['state'].update(mode='battle',enemies=[{'hp':30}]*3);o['motion']['battle']=True
                    for a in o['motion']['actors']:
                        i=a['index'];f=0 if reduced else (3 if hurt is not None and tick-hurt<18 else (1 if ((tick+i*11)//24)%4==3 else 2))
                        a.update(hurtTick=hurt,frame=f)
                        for sample,c in zip(a['samples'],masks[f]):sample['rgba']=[70,131,145,255] if c else [0,0,0,0]
                    self.assertTrue(assert_field_enemy_motion(o))
                    bad=copy.deepcopy(o);bad['motion']['actors'][0]['hurtTick']=tick+1
                    with self.assertRaises(AssertionError):assert_field_enemy_motion(bad)
    def test_battle_observer_keeps_failure_json_no_inputs_or_waits(self):
        from field_enemy_motion import observe_field_enemy_battle,BATTLE_SCRIPT
        import tempfile,json
        class Page:
            def __init__(self):self.calls=[]
            def evaluate(self,script):self.calls.append(script);return fixture()
        with tempfile.TemporaryDirectory() as d:
            page=Page()
            with self.assertRaises(AssertionError):observe_field_enemy_battle(page,d)
            self.assertEqual(page.calls,[BATTLE_SCRIPT]);self.assertEqual(json.loads((Path(d)/'field-enemy-battle-motion.json').read_text())['state']['mode'],'explore')
        s=(Path(__file__).parent/'opening_browser.py').read_text()
        self.assertEqual(s.count('observe_field_enemy_battle(page, OUT)'),1)
        self.assertLess(s.index("page.screenshot(path=str(OUT/'05-canyon-battle.png'))"),s.index('observe_field_enemy_battle(page, OUT)'))
