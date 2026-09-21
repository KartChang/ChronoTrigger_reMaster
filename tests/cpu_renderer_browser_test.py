"""Protocol/AST unit checks, not a local browser run."""
from pathlib import Path
import ast
import unittest

ROOT = Path(__file__).resolve().parents[1]


class CpuBrowserProtocol(unittest.TestCase):
    def setUp(self):
        self.source = (ROOT/'tests/cpu_renderer_browser.py').read_text()
        self.tree = ast.parse(self.source)

    def test_default_no_webgl_is_a_native_browser_precondition(self):
        self.assertIn("'--disable-webgl'", self.source)
        self.assertIn("'backendPreference': 'auto'", self.source)
        self.assertNotIn('renderer=webgl', self.source)
        for token in ['--enable-unsafe', '--use-angle', 'add_init_script', 'dispatchEvent', 'dispatch_event',
                      'force=True', 'set_input_files', 'set_files', 'localStorage.setItem', 'indexedDB.open']:
            self.assertNotIn(token, self.source)

    def test_direct_original_canvas_and_original_scene_observations(self):
        for token in ["c.getContext('2d')", "c.getContext('webgl')===null", "c.getContext('webgl2')===null",
                      'ctx.getImageData(0,0,c.width,c.height)', "'actual-cpu-canvas'", 'unsupportedResources']:
            self.assertIn(token, self.source)
        self.assertNotIn("document.createElement('canvas')", self.source)

    def test_only_own_export_enters_shared_native_import(self):
        self.assertIn('arm_native_chooser(page)', self.source)
        self.assertIn('download.value.save_as(saved)', self.source)
        self.assertIn('import_save(page, saved, OUT)', self.source)
        self.assertNotIn('write_text', self.source.split('finally:\n    (OUT')[0])

    def test_real_story_coop_and_battle_controls_are_present(self):
        for token in ["'#start-story'", "'#start-fair-coop'", "'ArrowRight'", "'母親'", "'岡薩雷斯'", "'#continue'", "'#save'", "'#load'"]:
            self.assertIn(token, self.source)

    def test_all_explicit_timeouts_within_existing_thirty_seconds(self):
        values = [k.value.value for n in ast.walk(self.tree) if isinstance(n, ast.Call)
                  for k in n.keywords if k.arg == 'timeout' and isinstance(k.value, ast.Constant)]
        self.assertTrue(values)
        self.assertTrue(all(0 < v <= 30000 for v in values))

    def test_full_existing_ci_retained_with_additive_cpu_gate(self):
        workflow = (ROOT/'.github/workflows/ci.yml').read_text()
        for command in ['python tests/cpu_renderer_browser.py', 'node scripts/cpu-evidence.mjs',
                        'python tests/reference_browser.py', 'python tests/render_compatibility_browser.py',
                        'python tests/trial_browser.py', 'python tests/equipment_browser.py']:
            self.assertIn(command, workflow)
        self.assertEqual(workflow.count('timeout-minutes: 45'), 2)
        self.assertIn('cancel-in-progress: false', workflow)
