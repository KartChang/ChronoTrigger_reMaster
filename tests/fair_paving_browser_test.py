"""Synthetic negative-checker tests; no browser run or physical device evidence."""
import copy,unittest
from fair_paving_browser import assert_paving,EXPECTED
BASE={'profile':'vq01x-retained-plaza-composition','source':'actual-fair-paving-canvas','approved':False,'texture':'fair-ground-reference','width':512,'height':512,'samples':EXPECTED['samples']}
class PavingChecks(unittest.TestCase):
 def test_expected(self):assert_paving(copy.deepcopy(BASE))
 def test_old_profile(self):
  p=copy.deepcopy(BASE);p['profile']='vq01s-static-ground-depth'
  with self.assertRaises(AssertionError):assert_paving(p)
 def test_wrong_texture(self):
  p=copy.deepcopy(BASE);p['texture']='unbound'
  with self.assertRaises(AssertionError):assert_paving(p)
 def test_resolution(self):
  p=copy.deepcopy(BASE);p['height']=1024
  with self.assertRaises(AssertionError):assert_paving(p)
 def test_missing_strip(self):
  p=copy.deepcopy(BASE);p['samples'].pop()
  with self.assertRaises(AssertionError):assert_paving(p)
 def test_changed_pixel(self):
  p=copy.deepcopy(BASE);p['samples'][0]['rgba'][0]^=1
  with self.assertRaises(AssertionError):assert_paving(p)
 def test_wrong_location(self):
  p=copy.deepcopy(BASE);p['samples'][0]['x']+=1
  with self.assertRaises(AssertionError):assert_paving(p)
 def test_no_approval(self):
  p=copy.deepcopy(BASE);p['approved']=True
  with self.assertRaises(AssertionError):assert_paving(p)
