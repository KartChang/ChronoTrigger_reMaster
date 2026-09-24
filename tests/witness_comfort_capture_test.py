"""Protocol doubles/AST contracts only; not a browser, physical device or native PNG test."""
import ast,base64,copy,hashlib,json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
import witness_comfort_capture as c
from fair_trial_preservation import SPEC,restore_fair_trial_source
ROOT=Path(__file__).resolve().parents[1]
IDENTITY={'sourceSha':'a'*40,'runId':'1','runAttempt':'1','htmlBytes':123,'htmlSha256':'b'*64}
class Page:
    def __init__(self,key='fair-witnesses',reduced=False):
        self.key=key;self.reduced=reduced;self.paused=True;self.state={'chapter':c.KEY_CHAPTER[key],'ticks':140,'trial':{'stage':'flight'}};self.frame=None;self.uploads=0;self.fail_png=False
    def snapshot(self):
        names={'conduct':['girl','elder','merchant'],'vendors':['shopper']*3} if self.key=='fair-witnesses' else {'vendors':['shopper']*3} if self.key=='fair-vendors' else {'trial':['judge','defender','prosecutor'] if self.key=='courtroom' else ['guard']*3}
        if self.frame!=self.reduced:self.frame=self.reduced;self.uploads+=1
        groups={}
        for group,kinds in names.items():
            actors=[]
            for seed,kind in enumerate(kinds):
                t=(140+seed*37)%240;frame=0 if self.reduced or t<90 else 1 if t<180 else 2 if t<189 else 3
                actors.append({'name':kind+str(seed),'kind':kind,'seed':seed,'frame':frame,'uploads':self.uploads,'cell':{'width':48,'height':64}})
            groups[group]={'profile':'outlined-live-actors-r2','motion':{'profile':'vq03f-witness-motion-preference','clock':'simulation-ticks','tick':140,'reducedMotion':self.reduced,'bindingCount':len(kinds),'stateMutation':False},'actors':actors}
        return {'chapter':self.state['chapter'],'paused':self.paused,'mediaReduce':self.reduced,'groups':groups,'gate':{'name':'forest-time-gate','visible':True,'position':[5.5,1.35,4],'rotation':[1.5707963267948966,0,0 if self.reduced else 140/180]} if self.key=='forest-gate' else None,'renderer':{'backend':'unit-port','width':1,'height':1},'viewport':{'width':960,'height':640},'focus':'resume'}
    def evaluate(self,code,arg=None):
        if code==c.SNAPSHOT:return self.snapshot()
        if code==c.MEDIA_QUERY:return self.reduced
        if code==c.FRAME_BOUNDARY:return None
        if code=='window.__CHRONO_TEST__.paused()':return self.paused
        if 'toDataURL' in code:
            if self.reduced and self.fail_png:raise RuntimeError('unit PNG port failure')
            return 'data:image/png;base64,'+base64.b64encode(b'unit-protocol-not-native-PNG').decode()
        raise AssertionError('unknown port '+code)
    def emulate_media(self,reduced_motion):self.reduced=reduced_motion=='reduce'
def snap(p):return copy.deepcopy(p.state)
class CaptureTests(unittest.TestCase):
    def run_capture(self,p,d):
        with patch.object(c,'source_identity',return_value=IDENTITY):return c.observe_witness_comfort(p,d,p.key,snap)
    def test_all_four_boundaries_keep_original_state_and_restore_preferences(self):
        for key in c.KEY_CHAPTER:
            with self.subTest(key=key),tempfile.TemporaryDirectory() as d:
                p=Page(key);before=snap(p);ref=self.run_capture(p,d);r=json.loads((Path(d)/ref['path']).read_text())
                self.assertEqual(r['status'],'passed');self.assertEqual(snap(p),before);self.assertFalse(p.reduced)
                self.assertEqual(len(r['phases']),3);self.assertEqual(r['phases'][0]['image']['sha256'],r['phases'][2]['image']['sha256'])
    def test_preserves_original_reduced_preference(self):
        with tempfile.TemporaryDirectory() as d:
            p=Page(reduced=True);self.run_capture(p,d);self.assertTrue(p.reduced)
    def test_unpaused_is_rejected_and_failure_persisted(self):
        with tempfile.TemporaryDirectory() as d:
            p=Page();p.paused=False
            with self.assertRaises(AssertionError):self.run_capture(p,d)
            self.assertEqual(json.loads((Path(d)/'fair-trial-comfort/fair-witnesses/report.json').read_text())['status'],'failed')
    def test_capture_failure_preserves_first_error_and_restores_preference(self):
        with tempfile.TemporaryDirectory() as d:
            p=Page();p.fail_png=True
            with self.assertRaisesRegex(RuntimeError,'unit PNG port failure'):self.run_capture(p,d)
            self.assertFalse(p.reduced);r=json.loads((Path(d)/'fair-trial-comfort/fair-witnesses/report.json').read_text());self.assertEqual(r['error']['message'],'unit PNG port failure')
    def test_wrong_frame_and_changed_state_are_rejected(self):
        p=Page();o=p.snapshot();o['groups']['conduct']['actors'][0]['frame']=9
        with self.assertRaises(AssertionError):c.assert_phase(o,snap(p),False,p.key)
        p.state['chapter']='forest'
        with self.assertRaises(AssertionError):c.assert_phase(p.snapshot(),snap(p),False,p.key)
    def test_production_observer_has_no_state_setters_input_or_sleep(self):
        raw=(ROOT/'tests/witness_comfort_capture.py').read_text();tree=ast.parse(raw)
        forbidden={'keyboard','mouse','click','press','sleep','wait_for_timeout','add_init_script','set_input_files','launch','new_page','set_viewport_size'}
        for n in ast.walk(tree):
            if isinstance(n,ast.Attribute):self.assertNotIn(n.attr,forbidden)
        for token in ['Object.assign','localStorage.setItem','indexedDB.open','dispatchEvent']:self.assertNotIn(token,raw)
    def test_native_wires_preserve_original_calls_and_cpu_only_trial(self):
        cpu=(ROOT/'tests/cpu_renderer_browser.py').read_text();keyboard=(ROOT/'tests/keyboard_browser.py').read_text();trial=(ROOT/'tests/trial_browser.py').read_text()
        self.assertIn("observe_witness_comfort(page, OUT, 'fair-vendors', snap)",cpu)
        self.assertIn("observe_witness_comfort(p, OUT, 'fair-witnesses', snap)",keyboard)
        self.assertIn('if cpu.enabled:',trial);self.assertIn("state['trial']['choice']=='collision'",trial);self.assertIn("state['trial']['stage']=='flight'",trial)
    def test_strict_inverse_keeps_all_E_pins_and_rejects_missing_duplicate_hunks(self):
        for name,edits in SPEC['files'].items():
            raw=(ROOT/name).read_text();h=lambda s:hashlib.sha256(s.encode()).hexdigest()
            with self.subTest(name=name):
                self.assertEqual(h(restore_fair_trial_source(name,raw)),SPEC['originalSha256'][name])
                with self.assertRaises(AssertionError):restore_fair_trial_source(name,raw+edits[0]['after'])
                with self.assertRaises(AssertionError):restore_fair_trial_source(name,raw.replace(edits[0]['after'],''))
                self.assertNotEqual(h(restore_fair_trial_source(name,raw+'\n# outside')),SPEC['originalSha256'][name])
if __name__=='__main__':unittest.main()
