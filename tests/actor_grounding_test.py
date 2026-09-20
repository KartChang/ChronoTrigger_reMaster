"""Synthetic geometry validates the evidence checker only, never gameplay."""
import copy
import unittest
from actor_grounding import assert_grounding

def example():
    a={'id':'p0','foot':{'x':1.,'y':.14,'z':2.},'actualFoot':{'x':1.,'y':.14,'z':2.},
       'footError':0.,'shadow':{'visible':True,'x':1.,'y':.14,'z':2.},'scale':{'x':1.,'y':1.,'z':1.}}
    npc=copy.deepcopy(a);npc['id']='fair-melchior'
    return {'source':'actual-mesh-texture-pivot','chapter':'fair','stage':'companions','geometryOnly':True,'physicalDevice':False,
            'profile':'party-redraw-48x64-vq01','grounding':{'profile':'vq01l-texture-foot-contact','approved':False,'actors':[a],'history':[copy.deepcopy(a)]},'witnesses':[npc]}

class Checker(unittest.TestCase):
    def test_valid(self):assert_grounding(example(),require_witness=True,require_lunge=True)
    def test_detached_shadow(self):
        m=example();m['grounding']['actors'][0]['shadow']['x']+=.6
        with self.assertRaises(AssertionError):assert_grounding(m)
    def test_floating_foot_even_when_reported_error_forged(self):
        m=example();m['grounding']['actors'][0]['actualFoot']['y']+=.4
        with self.assertRaises(AssertionError):assert_grounding(m)
    def test_hidden_shadow(self):
        m=example();m['grounding']['actors'][0]['shadow']['visible']=False
        with self.assertRaises(AssertionError):assert_grounding(m)
    def test_nonfinite(self):
        m=example();m['grounding']['actors'][0]['actualFoot']['x']=float('nan')
        with self.assertRaises(AssertionError):assert_grounding(m)
    def test_no_lunge_is_not_lunge_evidence(self):
        m=example();m['grounding']['history']=[]
        with self.assertRaises(AssertionError):assert_grounding(m,require_lunge=True)
    def test_missing_npc(self):
        m=example();m['witnesses']=[]
        with self.assertRaises(AssertionError):assert_grounding(m,require_witness=True)
    def test_wrong_art_profile(self):
        m=example();m['profile']='party-redraw-48x64-r2'
        with self.assertRaises(AssertionError):assert_grounding(m)
    def test_duplicate(self):
        m=example();m['grounding']['actors']*=2
        with self.assertRaises(AssertionError):assert_grounding(m)
    def test_no_physical_claim(self):
        m=example();m['physicalDevice']=True
        with self.assertRaises(AssertionError):assert_grounding(m)
