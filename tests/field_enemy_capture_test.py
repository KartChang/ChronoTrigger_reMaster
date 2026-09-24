"""Observer wiring tests only. Fake bytes are never claimed as native evidence."""
import base64
import hashlib
import tempfile
import unittest
from pathlib import Path
from field_enemy_capture import observe_field_enemies, SCRIPT

class Page:
    def __init__(self, chapter='canyon', active=True):
        self.chapter, self.active, self.calls = chapter, active, []
    def evaluate(self, script):
        self.calls.append(script)
        return {'state': {'chapter': self.chapter}, 'art': {'active': self.active},
                'png': 'data:image/png;base64,'+base64.b64encode(b'unit-only-png-bytes').decode()}

class CaptureTests(unittest.TestCase):
    def test_one_read_no_keys_and_bytes_persisted(self):
        with tempfile.TemporaryDirectory() as root:
            page, result = Page(), {}
            observe_field_enemies(page, Path(root), 'canyon', result)
            self.assertEqual(page.calls, [SCRIPT])
            self.assertEqual(result['canyon']['canvasImage']['sha256'], hashlib.sha256(b'unit-only-png-bytes').hexdigest())
            self.assertNotIn('png', result['canyon'])
            self.assertTrue((Path(root)/'field-canyon-canvas.png').exists())
    def test_failure_preserves_raw_observation_and_available_png(self):
        with tempfile.TemporaryDirectory() as root:
            result = {}
            with self.assertRaises(AssertionError): observe_field_enemies(Page('forest', False), Path(root), 'forest', result)
            self.assertIn('forest', result)
            self.assertTrue((Path(root)/'field-forest-canvas.png').exists())
    def test_script_reads_current_canvas_and_does_not_change_simulation(self):
        self.assertIn('api.snapshot()', SCRIPT)
        self.assertIn('api.view()', SCRIPT)
        self.assertIn("c.getContext('2d').getImageData", SCRIPT)
        for forbidden in ['keyboard', 'dispatchEvent', 'setTimeout', 'localStorage', 'indexedDB', 'state.ticks=', 'requestAnimationFrame', 'set_checked']:
            self.assertNotIn(forbidden, SCRIPT)
    def test_same_original_route_observes_before_forest_encounter(self):
        source=(Path(__file__).parent/'cpu_era_route.py').read_text()
        self.assertEqual(source.count("observe_field_enemies(page, out, 'forest'"), 1)
        self.assertLess(source.index("observe_field_enemies(page, out, 'forest'"),source.index("encounter('w', 1"))
        self.assertIn("r['views'].append(capture('04-forest'))",source)
        self.assertIn("CHAPTER_CAPTURES = ('fair', 'canyon', 'truce', 'forest'",source)

if __name__=='__main__': unittest.main()
