"""Isolated checker/failure-cleanup tests; these do not claim a rendered scene."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from fair_ground_browser import assert_ground,record_ground_views,READ_GROUND


def fixture():
    return {'profile':'vq01s-static-ground-depth','source':'actual-fair-ground-buffer','approved':False,
        'vertices':1089,'triangles':2048,'colourValues':4356,'useVertexColors':True,'hasVertexAlpha':False,
        'dynamic':False,'min':.77,'max':.97,'alphaMin':1,'alphaMax':1,'checksum':'d143ac21',
        'position':[0,.04,1],'texture':{'width':512,'height':512,'sampling':8,'mipmaps':True,'anisotropy':4},
        'collision':False,'visible':True}


class Page:
    def __init__(self,*,bad=False,capture_error=False,restore_error=False):
        self.viewport_size={'width':1200,'height':900};self.sizes=[];self.pictures=[]
        self.bad=bad;self.capture_error=capture_error;self.restore_error=restore_error
    def set_viewport_size(self,size):
        if size=={'width':1200,'height':900} and self.restore_error:raise RuntimeError('restore-error')
        self.viewport_size=copy.deepcopy(size);self.sizes.append(size)
    def evaluate(self,expression):
        if expression!=READ_GROUND:return 4
        g=fixture()
        if self.bad:g['colourValues']=0
        return {'source':'actual-fair-ground-view','chapter':'fair','ground':g,'viewport':self.viewport_size,'physicalDevice':False,'artApproved':False}
    def wait_for_function(self,*args,**kwargs):pass
    def screenshot(self,*,path,**kwargs):
        self.pictures.append((path,copy.deepcopy(self.viewport_size)))
        if self.capture_error:raise RuntimeError('capture-error')


class GroundChecker(unittest.TestCase):
    def test_valid(self):assert_ground(fixture())
    def test_missing_colours(self):
        g=fixture();g['colourValues']=0
        with self.assertRaises(AssertionError):assert_ground(g)
    def test_flat_tone_rejected(self):
        g=fixture();g.update(min=1,max=1)
        with self.assertRaises(AssertionError):assert_ground(g)
    def test_alpha_rejected(self):
        g=fixture();g['alphaMin']=.8
        with self.assertRaises(AssertionError):assert_ground(g)
    def test_sampler_or_mips_rejected(self):
        for field,value in [('sampling',1),('mipmaps',False),('width',64)]:
            g=fixture();g['texture'][field]=value
            with self.assertRaises(AssertionError):assert_ground(g)
    def test_nonfinite(self):
        g=fixture();g['min']=float('nan')
        with self.assertRaises(AssertionError):assert_ground(g)
    def test_geometry_or_collision(self):
        for field,value in [('vertices',4),('collision',True),('dynamic',True),('position',[0,1,1])]:
            g=fixture();g[field]=value
            with self.assertRaises(AssertionError):assert_ground(g)
    def test_viewports_and_cleanup(self):
        with tempfile.TemporaryDirectory() as temp:
            p=Page();out=Path(temp);record_ground_views(p,out,'ground')
            report=json.loads((out/'ground-report.json').read_text());self.assertEqual(report['status'],'passed');self.assertEqual(len(report['cases']),3)
            self.assertEqual(p.viewport_size,{'width':1200,'height':900});self.assertEqual(len(p.pictures),3)
    def test_failure_captured_before_viewport_cleanup(self):
        with tempfile.TemporaryDirectory() as temp:
            p=Page(bad=True);out=Path(temp)
            with self.assertRaises(AssertionError):record_ground_views(p,out,'ground')
            report=json.loads((out/'ground-report.json').read_text());self.assertEqual(report['status'],'failed')
            self.assertIn('failureObservation',report);self.assertEqual(p.pictures[-1][1],{'width':1365,'height':900});self.assertEqual(p.viewport_size,{'width':1200,'height':900})
    def test_capture_cleanup_do_not_replace_original_failure(self):
        with tempfile.TemporaryDirectory() as temp:
            p=Page(bad=True,capture_error=True,restore_error=True);out=Path(temp)
            with self.assertRaises(AssertionError):record_ground_views(p,out,'ground')
            report=json.loads((out/'ground-report.json').read_text());self.assertEqual(report['captureError'],'capture-error');self.assertEqual(report['cleanupError'],'restore-error');self.assertEqual(report['status'],'failed')
    def test_failed_restore_rejects_otherwise_passed_capture(self):
        with tempfile.TemporaryDirectory() as temp:
            p=Page(restore_error=True);out=Path(temp)
            with self.assertRaisesRegex(RuntimeError,'restore-error'):record_ground_views(p,out,'ground')
            self.assertEqual(json.loads((out/'ground-report.json').read_text())['status'],'failed')
