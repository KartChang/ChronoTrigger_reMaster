"""Synthetic checker and error-path tests; no actual browser execution."""
import copy
import json
import math
import os
import tempfile
import unittest
from pathlib import Path
from fair_scenery_browser import assert_scenery,signature,record_scenery_views,ANCHORS


def fixture(tick=100,reduced=False):
    phase=lambda period:tick%period/period*math.pi*2
    banners=[]
    for i,anchor in enumerate(ANCHORS):
        rot=[0,0,0] if reduced else [math.sin(phase(300)+i*.83)*.055+math.sin(phase(150)+i*.83)*.010,0,math.sin(phase(420)+i*.83)*.028]
        banners.append({'id':'fair-banner-pivot-'+str(i),'anchor':list(anchor),'rotation':rot,'parts':['vertical-banner','banner-gold-symbol']})
    return {'source':'actual-fair-scenery','chapter':'fair','tick':tick,'physicalDevice':False,'artApproved':False,
        'scenery':{'profile':'vq01v-tick-scenery','approved':False,'tick':tick,'reducedMotion':reduced,'banners':banners,
        'rotations':{'bell':0,'gate':0,'pendant':0,'ring':[0,0],'save':0,'robotY':1.3}}}


class SceneryChecker(unittest.TestCase):
    def test_normal(self):assert_scenery(fixture())
    def test_reduced(self):assert_scenery(fixture(reduced=True))
    def test_reduced_signature_stable(self):self.assertEqual(signature(fixture(100,True)),signature(fixture(200,True)))
    def test_normal_signature_moves(self):self.assertNotEqual(signature(fixture(100)),signature(fixture(112)))
    def test_missing_banner(self):
        m=fixture();m['scenery']['banners'].pop()
        with self.assertRaises(AssertionError):assert_scenery(m)
    def test_wrong_anchor(self):
        m=fixture();m['scenery']['banners'][0]['anchor'][0]+=.1
        with self.assertRaises(AssertionError):assert_scenery(m)
    def test_nan(self):
        m=fixture();m['scenery']['banners'][0]['rotation'][0]=float('nan')
        with self.assertRaises(AssertionError):assert_scenery(m)
    def test_stale_tick(self):
        m=fixture();m['scenery']['tick']-=1
        with self.assertRaises(AssertionError):assert_scenery(m)
    def test_bounded_but_wrong_pose(self):
        m=fixture();m['scenery']['banners'][0]['rotation']=[0,0,0]
        with self.assertRaises(AssertionError):assert_scenery(m)
    def test_reduced_still_spinning(self):
        m=fixture(reduced=True);m['scenery']['rotations']['ring'][0]=.1
        with self.assertRaises(AssertionError):assert_scenery(m)
    def test_not_hardware(self):
        m=fixture();m['physicalDevice']=True
        with self.assertRaises(AssertionError):assert_scenery(m)
    def test_read_only_and_original_hooks(self):
        s=Path(__file__).with_name('fair_scenery_browser.py').read_text()
        for prohibited in ('force=True','set_input_files','dataset.','wait_for_timeout','setTimeout'):
            self.assertNotIn(prohibited,s)
        self.assertIn("page.emulate_media(reduced_motion='reduce')",s)
        self.assertIn("page.keyboard.press('Escape')",s)
        self.assertIn("'fullStateUnchanged':True",s)
    def test_original_failure_survives_missing_hook_and_cleanup(self):
        class BrokenPage:
            viewport_size={'width':1000,'height':900}
            shots=0
            def evaluate(self,expr):
                if 'matchMedia' in expr:return False
                if expr=='window.__CHRONO_TEST__.view().frame':return 0
                raise RuntimeError('hook unavailable')
            def set_viewport_size(self,v):
                if v==self.viewport_size:raise RuntimeError('viewport cleanup failed')
            def emulate_media(self,**kw):pass
            def wait_for_function(self,*a,**kw):raise TimeoutError('original frame timeout')
            def screenshot(self,**kw):self.shots+=1
        old=os.getcwd()
        with tempfile.TemporaryDirectory() as d:
            try:
                os.chdir(d);Path('dist').mkdir();Path('dist/build-meta.json').write_text(json.dumps({'sourceSha':'a'*40}));Path('dist/index.html').write_text('unit fixture')
                page=BrokenPage()
                with self.assertRaisesRegex(TimeoutError,'original frame timeout'):record_scenery_views(page,Path(d),'probe')
                r=json.loads(Path('probe-report.json').read_text());self.assertEqual(r['status'],'failed');self.assertEqual(page.shots,1);self.assertIn('hook unavailable',r['observationError']);self.assertTrue(r['cleanupErrors']);self.assertFalse(Path('probe-report.json.tmp').exists())
            finally:os.chdir(old)
