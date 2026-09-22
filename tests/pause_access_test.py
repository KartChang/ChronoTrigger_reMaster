"""Protocol unit ports, not screenshot or native success evidence."""
import copy,tempfile,unittest
from pathlib import Path
from pause_access import observe_pause_access,assert_layout,DOM_LAYOUT
from village_capture_test import Page,snap,observed
class PauseAccessTests(unittest.TestCase):
    def page(self):
        p=Page();p.paused=True;return p
    def run_capture(self,p,r,d):return observe_pause_access(p,d,r,snap,observed,snap(p),0)
    def test_native_keyboard_roundtrip_retains_full_state_and_original_sampling(self):
        p=self.page();r={};before=snap(p)
        with tempfile.TemporaryDirectory() as d:
            self.run_capture(p,r,d);self.assertEqual(len(list(Path(d).glob('*.png'))),2)
        self.assertEqual(r['status'],'passed');self.assertEqual(r['keys'],['Tab','Tab','Space','Space','Tab']);self.assertEqual(r['focusOrder'][-1],'resume');self.assertEqual(p.state,before);self.assertTrue(p.sampling);self.assertTrue(p.paused)
    def test_already_nearest_does_not_toggle_or_invent_default_state(self):
        p=self.page();p.sampling=False;r={}
        with tempfile.TemporaryDirectory() as d:self.run_capture(p,r,d)
        self.assertFalse(r['originalSampling']);self.assertFalse(r['restoredSampling']);self.assertNotIn('Space',r['keys'])
    def test_clipped_hidden_tiny_and_obscured_control_is_rejected(self):
        for field,value in [('hit',False),('visible',False),('fontSize',13)]:
            p=self.page();v=p.evaluate(DOM_LAYOUT);v['controls'][1][field]=value
            with self.subTest(field=field),self.assertRaises(AssertionError):assert_layout(v)
        for field,value in [('height',43),('y',390),('width',43),('x',-10)]:
            p=self.page();v=p.evaluate(DOM_LAYOUT);v['controls'][2]['rect'][field]=value
            with self.subTest(field=field),self.assertRaises(AssertionError):assert_layout(v)
    def test_wrong_keyboard_focus_keeps_first_actual_failure(self):
        p=self.page();r={};old=p.press
        def wrong(key):
            old(key)
            if key=='Tab':p.focus_id='world'
        p.press=wrong
        with tempfile.TemporaryDirectory() as d,self.assertRaises(AssertionError):self.run_capture(p,r,d)
        self.assertEqual(r['status'],'failed');self.assertEqual(r['focusOrder'],['world']);self.assertTrue(p.paused)
    def test_screenshot_failure_restores_sampling_without_claiming_success(self):
        p=self.page();p.fail='screenshot';r={}
        with tempfile.TemporaryDirectory() as d,self.assertRaisesRegex(RuntimeError,'first capture error'):self.run_capture(p,r,d)
        self.assertEqual(r['error']['message'],'first capture error');self.assertEqual(r['status'],'failed');self.assertIn('nearest',r);self.assertNotIn('image',r['nearest']);self.assertTrue(p.sampling);self.assertTrue(p.paused)
    def test_bad_canvas_retains_raw_dom_observation(self):
        p=self.page();p.fail='base64';r={}
        with tempfile.TemporaryDirectory() as d,self.assertRaises(Exception):self.run_capture(p,r,d)
        self.assertIn('image',r['nearest']);self.assertNotIn('canvasImage',r['nearest']);self.assertTrue(p.sampling);self.assertEqual(r['status'],'failed')
    def test_no_game_state_rewrite_to_hide_pause_mutation(self):
        p=self.page();r={};old=p.press
        def mutate(key):
            old(key)
            if key=='Space':p.state['ticks']+=1
        p.press=mutate
        with tempfile.TemporaryDirectory() as d,self.assertRaises(AssertionError):self.run_capture(p,r,d)
        self.assertEqual(r['status'],'failed');self.assertGreater(p.state['ticks'],7)
    def test_cleanup_error_does_not_replace_first_capture_error(self):
        p=self.page();p.fail='screenshot';r={}
        p.focus=lambda:(_ for _ in ()).throw(RuntimeError('cleanup focus error'))
        with tempfile.TemporaryDirectory() as d,self.assertRaisesRegex(RuntimeError,'first capture error'):self.run_capture(p,r,d)
        self.assertEqual(r['error']['message'],'first capture error');self.assertIn('cleanup focus error',r['cleanupError'])
if __name__=='__main__':unittest.main()
