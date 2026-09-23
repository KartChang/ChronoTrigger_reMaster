"""Protocol and source tests only. These are not native camera or device evidence."""
import hashlib,tempfile,unittest
from pathlib import Path
from village_capture_test import Page,snap,observed
from village_capture import observe_village_layouts
from town_camera_preservation import SPEC,restore_town_camera_if_declared,restore_sign_occlusion_if_declared
ROOT=Path(__file__).resolve().parents[1]
class TownCameraCaptureTests(unittest.TestCase):
    def test_same_paused_visit_retains_every_original_png_and_readonly_camera(self):
        p=Page();r={};state=snap(p)
        with tempfile.TemporaryDirectory() as d:
            observe_village_layouts(p,d,r,snap,observed)
            self.assertEqual(len(list(Path(d).glob('*.png'))),12)
            self.assertEqual(r['beforeCamera'],r['afterCamera'])
            self.assertEqual([v['camera']['viewport'] for v in r['views']],[{'width':960,'height':640},{'width':390,'height':844},{'width':844,'height':390}])
        self.assertEqual(snap(p),state);self.assertFalse(p.paused)
    def test_camera_observation_kept_when_first_screenshot_fails(self):
        p=Page();p.fail='screenshot';r={}
        with tempfile.TemporaryDirectory() as d,self.assertRaisesRegex(RuntimeError,'first capture error'):
            observe_village_layouts(p,d,r,snap,observed)
        self.assertIn('camera',r['views'][0]);self.assertEqual(r['status'],'failed');self.assertNotIn('afterCamera',r);self.assertFalse(p.paused)
    def test_exact_w_sources_remain_reconstructible(self):
        for name,want in SPEC['originalSha256'].items():
            with self.subTest(name=name):
                source=restore_town_camera_if_declared(name,(ROOT/name).read_text())
                self.assertEqual(hashlib.sha256(source.encode()).hexdigest(),want)
    def test_duplicate_or_missing_x_edit_cannot_hide_in_old_contracts(self):
        for name,edits in SPEC['files'].items():
            source=restore_sign_occlusion_if_declared(name,(ROOT/name).read_text());after=edits[-1]['after']
            for change in [source+after,source.replace(after,'',1)]:
                with self.subTest(name=name),self.assertRaises(AssertionError):restore_town_camera_if_declared(name,change,include_sign=False)
if __name__=='__main__':unittest.main()
