"""Unit protocol ports only; none of this is native evidence or a successful save."""
import base64,copy,tempfile,unittest
from pathlib import Path
from village_capture import observe_village_layouts
from pause_access import DOM_LAYOUT
from npc_comfort_capture import SNAPSHOT, MEDIA_QUERY

class Page:
    def __init__(self):
        self.viewport_size={'width':960,'height':640};self.paused=False;self.keyboard=self
        self.state={'chapter':'truce','mode':'explore','ticks':7,'players':[{'x':0,'z':0}]}
        self.fail=None;self.resizes=[];self.keys=[];self.focus_id="resume";self.sampling=True;self.selected="#resume";self.reduced=False;self.npc_frames=[0,0];self.npc_uploads=[0,0]
    def emulate_media(self, reduced_motion):
        self.reduced = reduced_motion == 'reduce'
    def npc_snapshot(self):
        actors=[]
        for seed,(name,kind) in enumerate([('townsperson','resident'),('innkeeper','innkeeper')]):
            t=(self.state['ticks']+seed*37)%240
            frame=0 if self.reduced or t<90 else 1 if t<180 else 2 if t<189 else 3
            if self.npc_frames[seed] != frame:self.npc_frames[seed]=frame;self.npc_uploads[seed]+=1
            actors.append({'name':name,'kind':kind,'seed':seed,'frame':frame,'uploads':self.npc_uploads[seed],'cell':{'width':48,'height':64}})
        return {'chapter':self.state['chapter'],'paused':self.paused,'mediaReduce':self.reduced,
                'npc':{'profile':'vq02q-story-npc-cloth-and-silhouette','approved':False,
                'motion':{'profile':'vq03e-npc-motion-preference','clock':'simulation-ticks','tick':self.state['ticks'],'reducedMotion':self.reduced,'bindingCount':2,'stateMutation':False},'actors':actors},
                'renderer':{'backend':'cpu-canvas2d','webglVersion':0,'width':120,'height':80,'samplingEnabled':self.sampling},'viewport':dict(self.viewport_size),'focus':self.focus_id}
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
        if code == MEDIA_QUERY:return self.reduced
        if code == SNAPSHOT:return self.npc_snapshot()
        if code==DOM_LAYOUT:
            return {'viewport':dict(self.viewport_size),'focus':self.focus_id,'dialog':{'x':12,'y':12,'width':self.viewport_size['width']-24,'height':300},'scrollTop':0,'scrollHeight':296,'clientHeight':296,'controls':[{'id':name,'visible':True,'hit':True,'fontSize':14,'rect':{'x':24,'y':30+i*60,'width':150,'height':44}} for i,name in enumerate(('resume','render-quality','cpu-sampling'))]}
        if code=='window.__CHRONO_TEST__.view().earlyComfort':return {'viewport':dict(self.viewport_size),'unitOnly':True}
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
