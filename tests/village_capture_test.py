"""Unit protocol ports only; none of this is native evidence or a successful save."""
import base64,copy,tempfile,unittest
from pathlib import Path
from village_capture import observe_village_layouts
from pause_access import DOM_LAYOUT

class Page:
    def __init__(self):
        self.viewport_size={'width':960,'height':640};self.paused=False;self.keyboard=self
        self.state={'chapter':'truce','mode':'explore','ticks':7,'players':[{'x':0,'z':0}]}
        self.fail=None;self.resizes=[];self.keys=[];self.focus_id="resume";self.sampling=True;self.selected="#resume"
    def press(self,key):
        self.keys.append(key)
        if key=='Escape':self.paused=True
        if key=='Enter':self.paused=False
        if key=='Tab':self.focus_id={'resume':'render-quality','render-quality':'cpu-sampling','cpu-sampling':'resume'}[self.focus_id]
        if key=='Space':self.sampling=not self.sampling
    def wait_for_function(self,*a,**kw):pass
    def locator(self,selector):self.selected=selector;return self
    def focus(self):self.focus_id=self.selected.lstrip("#")
    def is_checked(self):return self.sampling
    def set_viewport_size(self,size):
        self.viewport_size=dict(size);self.resizes.append(dict(size))
        if self.fail=='state' and size['width']==390:self.state['ticks']+=1
    def evaluate(self,code):
        if code==DOM_LAYOUT:
            return {'viewport':dict(self.viewport_size),'focus':self.focus_id,'dialog':{'x':12,'y':12,'width':self.viewport_size['width']-24,'height':300},'scrollTop':0,'scrollHeight':296,'clientHeight':296,'controls':[{'id':name,'visible':True,'hit':True,'fontSize':14,'rect':{'x':24,'y':30+i*60,'width':150,'height':44}} for i,name in enumerate(('resume','render-quality','cpu-sampling'))]}
        if code=='document.activeElement.id':return self.focus_id
        if code=='window.__CHRONO_TEST__.paused()':return self.paused
        if 'innerWidth' in code:return dict(self.viewport_size)
        if '.village' in code:return {'profile':'unit-port'}
        if 'toDataURL' in code:
            if self.fail=='base64':return 'data:image/png;base64,INVALID!'
            return 'data:image/png;base64,'+base64.b64encode(b'unit-port-not-native-png').decode()
        return None
    def screenshot(self,path,**kw):
        if self.fail=='screenshot':raise RuntimeError('first capture error')
        Path(path).write_bytes(b'unit-port-not-native-screenshot')

def snap(page):return copy.deepcopy(page.state)
def observed(page):return {'pixels':{'source':'unit-port-not-native'}}
class VillageCaptureTests(unittest.TestCase):
    def run_port(self,page,r,out):observe_village_layouts(page,out,r,snap,observed)
    def test_observer_uses_only_native_pause_resize_and_resume_and_retains_originals(self):
        p=Page();r={}
        with tempfile.TemporaryDirectory() as d:
            self.run_port(p,r,d);self.assertEqual(r['status'],'passed');self.assertEqual(len(list(Path(d).glob('village-layout-*.png')))+len(list(Path(d).glob('village-canvas-*.png'))),6);self.assertEqual(len(list(Path(d).glob('*.png'))),12)
            self.assertEqual(r['before'],r['after']);self.assertTrue(all(v['paused'] for v in r['views']))
        self.assertEqual([key for key in p.keys if key in ('Escape','Enter')],['Escape','Enter']);self.assertEqual(p.keys.count('Tab'),9);self.assertTrue(p.sampling);self.assertFalse(p.paused);self.assertEqual(p.viewport_size,{'width':960,'height':640})
    def test_state_change_fails_and_restores_native_boundary(self):
        p=Page();p.fail='state';r={}
        with tempfile.TemporaryDirectory() as d,self.assertRaises(AssertionError):self.run_port(p,r,d)
        self.assertEqual(r['status'],'failed');self.assertFalse(p.paused);self.assertEqual(p.viewport_size,{'width':960,'height':640})
    def test_screenshot_failure_keeps_observation_and_first_cause(self):
        p=Page();p.fail='screenshot';r={}
        with tempfile.TemporaryDirectory() as d,self.assertRaisesRegex(RuntimeError,'first capture error'):self.run_port(p,r,d)
        self.assertEqual(len(r['views']),1);self.assertEqual(r['error']['message'],'first capture error');self.assertEqual(r['status'],'failed')
    def test_invalid_canvas_encoding_cannot_be_reported_as_passed(self):
        p=Page();p.fail='base64';r={}
        with tempfile.TemporaryDirectory() as d,self.assertRaises(Exception):self.run_port(p,r,d)
        self.assertEqual(r['status'],'failed');self.assertIn('image',r['views'][0]);self.assertNotIn('canvasImage',r['views'][0])
    def test_wrong_entry_is_not_rewritten_into_town(self):
        p=Page();p.state['chapter']='forest';r={}
        with tempfile.TemporaryDirectory() as d,self.assertRaises(AssertionError):self.run_port(p,r,d)
        self.assertEqual(p.state['chapter'],'forest');self.assertEqual(p.keys,[])
if __name__=='__main__':unittest.main()
