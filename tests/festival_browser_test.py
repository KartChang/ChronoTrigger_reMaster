"""Synthetic checker fixtures, not successful browser evidence or invented player saves."""
import copy
import unittest
from pathlib import Path
from festival_browser import assert_festival
from actor_grounding_test import example


def fixture():
    groups=['vq01-festival-'+n+'-canopy' for n in ('cloth','candy','craft')]
    contacts=[]
    for name in ('cloth','candy','craft'):
        a=copy.deepcopy(example()['grounding']['actors'][0]);a['id']='fair-vendor-'+name;contacts.append(a)
    return {'source':'actual-festival-scene','chapter':'fair','physicalDevice':False,'artApproved':False,
        'festival':{'profile':'vq01-festival','approved':False,'collisionSource':'FAIR_STALLS','geometry':{
            'decorativeOnly':True,'meshes':161,'vertices':15817,'triangles':20440,'canopyGroups':groups,
            'awnings':[{'id':g+str(i),'group':g,'vertices':36,'triangles':32,'heightSpan':.36} for g in groups for i in range(8)]}},
        'vendors':{'actors':[{'name':a['id'],'kind':'shopper','frame':0} for a in contacts]},'vendorContacts':contacts,
        'bell':{'parts':['leene-bell','bell-rim','bell-interior','bell-clapper'],'swing':0},
        'occlusion':{'method':'parallel-orthographic-triangle-rays','approved':False,'samples':18,'meshRayTests':400,
            'groups':[{'id':g,'meshes':11,'visibility':1,'blocked':False} for g in groups]}}


class FestivalChecker(unittest.TestCase):
    def test_valid(self):assert_festival(fixture(),require_clear=True)
    def test_blocked(self):
        m=fixture();m['occlusion']['groups'][0].update(blocked=True,visibility=.5);assert_festival(m,require_blocked=True)
    def test_no_hit_not_accepted_as_occlusion(self):
        with self.assertRaises(AssertionError):assert_festival(fixture(),require_blocked=True)
    def test_stale_fade_after_import(self):
        m=fixture();m['occlusion']['groups'][0]['visibility']=.4
        with self.assertRaises(AssertionError):assert_festival(m,require_clear=True)
    def test_flat_awnings(self):
        m=fixture();m['festival']['geometry']['awnings'][0]['heightSpan']=0
        with self.assertRaises(AssertionError):assert_festival(m)
    def test_missing_group(self):
        m=fixture();m['occlusion']['groups'].pop()
        with self.assertRaises(AssertionError):assert_festival(m)
    def test_hidden_contact_shadow(self):
        m=fixture();m['vendorContacts'][0]['shadow']['visible']=False
        with self.assertRaises(AssertionError):assert_festival(m)
    def test_geometry_cannot_claim_physical(self):
        m=fixture();m['physicalDevice']=True
        with self.assertRaises(AssertionError):assert_festival(m)
    def test_cannot_modify_collision(self):
        m=fixture();m['festival']['geometry']['decorativeOnly']=False
        with self.assertRaises(AssertionError):assert_festival(m)
    def test_nan_visibility(self):
        m=fixture();m['occlusion']['groups'][0]['visibility']=float('nan')
        with self.assertRaises(AssertionError):assert_festival(m)
    def test_actual_routes_and_no_writable_hook(self):
        root=Path(__file__).parent
        text=(root/'equipment_browser.py').read_text();self.assertIn("move(page,'x',-8);move(page,'z',-4.05)",text)
        self.assertIn("require_blocked=True,pause_probe=True",text);self.assertIn("'06-festival-import-reset',require_clear=True",text)
        helper=(root/'festival_browser.py').read_text()
        self.assertNotIn('force=True',helper);self.assertNotIn('set_input_files',helper);self.assertNotIn('dataset.',helper)
        self.assertIn('assert _state(page)==frozen',helper);self.assertIn("assert first['occlusion']==later['occlusion']",helper)
        self.assertIn("'failureObservation'",helper)
