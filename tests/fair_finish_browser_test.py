"""Synthetic mutation tests of the actual-data checker; no local browser."""
import copy,json,unittest
from pathlib import Path
from fair_finish_browser import assert_finish
BASE=json.loads((Path(__file__).parent/'fixtures/fair-finish-unit.json').read_text())['observation']
class FinishChecks(unittest.TestCase):
 def test_valid(self):assert_finish(copy.deepcopy(BASE))
 def test_isolation(self):
  r=copy.deepcopy(BASE);r['fill']['onlyFair']=False
  with self.assertRaises(AssertionError):assert_finish(r)
 def test_wrong_fill(self):
  r=copy.deepcopy(BASE);r['fill']['intensity']=.75
  with self.assertRaises(AssertionError):assert_finish(r)
 def test_missing_tree(self):
  r=copy.deepcopy(BASE);r['contacts'].pop()
  with self.assertRaises(AssertionError):assert_finish(r)
 def test_floating_tree(self):
  r=copy.deepcopy(BASE);r['contacts'][0]['actualFoot']['y']+=.5
  with self.assertRaises(AssertionError):assert_finish(r)
 def test_fake_foot_error(self):
  r=copy.deepcopy(BASE);r['contacts'][0]['footError']=0;r['contacts'][0]['actualFoot']['x']+=1
  with self.assertRaises(AssertionError):assert_finish(r)
 def test_nan(self):
  r=copy.deepcopy(BASE);r['contacts'][0]['footError']=float('nan')
  with self.assertRaises(AssertionError):assert_finish(r)
 def test_specular(self):
  r=copy.deepcopy(BASE);r['metals'][0]['power']=1
  with self.assertRaises(AssertionError):assert_finish(r)
 def test_alpha_border(self):
  r=copy.deepcopy(BASE);r['softShadows']['alphaMin']=.5
  with self.assertRaises(AssertionError):assert_finish(r)
 def test_external_light(self):
  r=copy.deepcopy(BASE);r['excluded'][0]['complete']=False
  with self.assertRaises(AssertionError):assert_finish(r)
 def test_no_approval(self):
  r=copy.deepcopy(BASE);r['artApproved']=True
  with self.assertRaises(AssertionError):assert_finish(r)
