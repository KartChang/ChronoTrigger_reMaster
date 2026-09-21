"""AST/protocol checks only. No local browser is created by these tests."""
from pathlib import Path
import ast
import unittest

ROOT = Path(__file__).parent
class RenderCompatibilityDriver(unittest.TestCase):
    def setUp(self):
        self.source = (ROOT/'render_compatibility_browser.py').read_text()
        self.tree = ast.parse(self.source)
    def test_fault_is_native_not_a_synthetic_event(self):
        self.assertIn("getExtension('WEBGL_lose_context')", self.source)
        self.assertIn('e.loseContext()', self.source)
        self.assertIn('e.restoreContext()', self.source)
        for text in ['dispatch_event','dispatchEvent','add_init_script','force=True','set_input_files','set_files']:
            self.assertNotIn(text,self.source)
    def test_all_contexts_close_before_next_capability_case(self):
        for fn in self.tree.body:
            if isinstance(fn,ast.FunctionDef) and fn.name.startswith('observe_'):
                guard = next(n for n in fn.body if isinstance(n,ast.Try))
                attrs = [n.func.attr for stmt in guard.finalbody for n in ast.walk(stmt)
                         if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute)]
                self.assertEqual(attrs,['close','close'])
    def test_driver_has_no_new_privileged_software_flag(self):
        self.assertNotIn('--enable-unsafe-swiftshader',self.source)
        self.assertIn('--use-angle=swiftshader',self.source)
        self.assertIn('--disable-webgl2',self.source)
        self.assertIn('--disable-webgl',self.source)
    def test_real_original_canvas_pixels_and_screenshot_hashes_are_retained(self):
        for text in ['ctx.drawImage(source','ctx.getImageData','hashlib.sha256(b).hexdigest()',"page.screenshot(path=str(path))"]:
            self.assertIn(text,self.source)
        self.assertNotIn('fixture',self.source.split('def pixels(page):')[0])
    def test_no_browser_timeout_above_existing_thirty_second_load_limit(self):
        values=[]
        for n in ast.walk(self.tree):
            if isinstance(n,ast.Call):
                for kw in n.keywords:
                    if kw.arg=='timeout' and isinstance(kw.value,ast.Constant):values.append(kw.value.value)
        self.assertTrue(values)
        self.assertTrue(all(0<n<=30000 for n in values))
    def test_new_render_check_is_additive_in_original_validate_job(self):
        workflow=(ROOT.parent/'.github/workflows/ci.yml').read_text()
        self.assertIn('python tests/render_compatibility_browser.py',workflow)
        self.assertIn('node scripts/render-evidence.mjs',workflow)
        self.assertIn('node scripts/ci-evidence.mjs validate',workflow)
        self.assertEqual(workflow.count('timeout-minutes: 45'),2)
        self.assertIn('cancel-in-progress: false',workflow)
