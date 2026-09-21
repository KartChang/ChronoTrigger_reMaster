"""Synthetic mutation tests only. No browser is launched or simulated as evidence."""
import copy,json,unittest
from pathlib import Path
from fair_cohesion_browser import assert_cohesion
BASE=json.loads((Path(__file__).parent/'fixtures/fair-cohesion-unit.json').read_text())['observation']
class CohesionChecks(unittest.TestCase):
 def test_valid(self):assert_cohesion(copy.deepcopy(BASE))
 def reject(self,change):
  r=copy.deepcopy(BASE);change(r)
  with self.assertRaises(AssertionError):assert_cohesion(r)
 def test_shadow_black(self):self.reject(lambda r:r['shadow'].update(darkness=0))
 def test_shadow_inactive(self):self.reject(lambda r:r['shadow'].update(active=False))
 def test_shared_shadow_leak(self):self.reject(lambda r:r['shadow'].update(previous=.34))
 def test_changed_bias(self):self.reject(lambda r:r['shadow'].update(bias=.04))
 def test_small_parts_cast_again(self):self.reject(lambda r:next(f for f in r['forms'] if not f['casts']).update(casts=True))
 def test_missing_beveled_form(self):self.reject(lambda r:next(p for f in r['forms'] for p in f['parts'] if p['bevel'] is not None).update(bevel=None))
 def test_lost_normals(self):self.reject(lambda r:r['forms'][0].update(normals=0))
 def test_missing_live_colors(self):self.reject(lambda r:next(f for f in r['forms'] if any(p['bevel'] is not None for p in f['parts'])).update(colors=0))
 def test_changed_actor_scale(self):self.reject(lambda r:r['actors'][0].update(height=3.7))
 def test_nan(self):self.reject(lambda r:r['shadow'].update(darkness=float('nan')))
 def test_approval(self):self.reject(lambda r:r.update(artApproved=True))
 def test_capture_preserves_the_existing_finish_check(self):
  source=Path(__file__).with_name('fair_finish_browser.py').read_text()
  self.assertIn('assert_finish(r);assert_cohesion',source)
  self.assertNotIn('wait_for_timeout',source)
