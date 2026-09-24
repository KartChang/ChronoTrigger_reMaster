"""Offline observer ports test retention and cleanup; never native screenshots."""
import base64
import copy
import tempfile
import unittest
from pathlib import Path
from town_route_capture import TownRouteCapture

class Keyboard:
    def __init__(self, page): self.page=page
    def press(self, key):
        self.page.keys.append(key)
        if key=='Escape': self.page.paused=True
        elif key=='Enter': self.page.paused=False

class Page:
    def __init__(self):
        self.viewport_size={'width':960,'height':640};self.paused=False;self.keys=[];self.keyboard=Keyboard(self)
        self.state={'chapter':'truce','ticks':10,'players':[{'x':0,'z':6.4}]};self.fail=None
    def evaluate(self, code):
        if code=='window.__CHRONO_TEST__.paused()':return self.paused
        if 'innerWidth' in code:return dict(self.viewport_size)
        if 'toDataURL' in code:return 'data:image/png;base64,'+base64.b64encode(b'unit-only-image').decode()
        if 'earlyComfort' in code:return {'unitOnly':True}
        if 'townSignOcclusion' in code:return {'unitOnly':True}
        if 'townBuildingOcclusion' in code:return {'unitOnly':True}
        if 'requestAnimationFrame' in code:return None
        raise AssertionError(code)
    def wait_for_function(self, code, timeout): assert timeout==10000
    def set_viewport_size(self, value):self.viewport_size=dict(value)
    def locator(self, selector):assert selector=='#resume';return self
    def focus(self):pass
    def screenshot(self,path,timeout):
        if self.fail:raise self.fail
        Path(path).write_bytes(b'unit-only-image')

def snap(p):return copy.deepcopy(p.state)
def observed(p):return {'chapter':'truce','renderer':{'unitOnly':True},'pixels':{'unitOnly':True}}

class TownRouteTests(unittest.TestCase):
    def test_original_route_reference_and_native_pause_resize_restore(self):
        p=Page();r={};routes=[{}]*9
        with tempfile.TemporaryDirectory() as d:
            with TownRouteCapture(p,d,r,snap,observed,routes) as t:
                self.assertEqual(p.viewport_size,{'width':390,'height':844});self.assertFalse(p.paused)
                for name,count in [('resident',2),('inn',3),('exit',1)]:routes.extend([{}]*count);t.stop(name)
            self.assertEqual(r['status'],'passed');self.assertEqual(r['routeStart'],9);self.assertEqual(r['routeEnd'],15)
            self.assertEqual([s['name'] for s in r['stops']],['entry','resident','inn','exit'])
            self.assertEqual(p.viewport_size,{'width':960,'height':640});self.assertFalse(p.paused)
            self.assertTrue(all(s['state']==s['after'] and s['fullStateEqual'] for s in r['stops']))
            self.assertTrue(set(p.keys)<= {'Escape','Enter'})
            self.assertTrue(all(s['buildingOcclusion']=={'unitOnly':True} for s in r['stops']))
    def test_entry_screenshot_failure_retains_partial_and_restores(self):
        p=Page();r={};primary=RuntimeError('capture failed');p.fail=primary
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaises(RuntimeError) as e:
                with TownRouteCapture(p,d,r,snap,observed,[{}]*9):pass
        self.assertIs(e.exception,primary);self.assertEqual(r['status'],'failed');self.assertEqual(len(r['stops']),1)
        self.assertEqual(p.viewport_size,{'width':960,'height':640});self.assertFalse(p.paused)
    def test_movement_failure_is_not_marked_success_or_masked_by_cleanup(self):
        p=Page();r={};primary=RuntimeError('native leg failed')
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaises(RuntimeError) as e:
                with TownRouteCapture(p,d,r,snap,observed,[{}]*9):raise primary
        self.assertIs(e.exception,primary);self.assertEqual(r['status'],'failed');self.assertIn('native leg',r['error']['message']);self.assertFalse(p.paused)
    def test_state_change_during_pause_fails_and_keeps_observation(self):
        p=Page();r={};n=0
        def changed(page):
            nonlocal n
            n+=1;value=snap(page)
            if n==3:value['ticks']+=1
            return value
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaises(AssertionError):
                with TownRouteCapture(p,d,r,changed,observed,[{}]*9):pass
        self.assertEqual(r['status'],'failed');self.assertTrue(r['stops']);self.assertFalse(p.paused)

if __name__=='__main__':unittest.main()
