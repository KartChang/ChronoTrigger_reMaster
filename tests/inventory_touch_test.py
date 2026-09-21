"""Failure-path unit probes; mock contexts are never reported as browser evidence."""
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
from unittest.mock import patch
import unittest
import inventory_touch


class TouchFailureRetention(unittest.TestCase):
    def exercise(self, *, hook_fails=False, close_fails=False, trace_fails=False, page_fails=False):
        with TemporaryDirectory() as folder:
            root=Path(folder);out=root/'out';out.mkdir();(root/'dist').mkdir();(root/'tests').mkdir()
            (root/'dist/index.html').write_text('UNIT ONLY - not a playable')
            source=root/'unit.json';source.write_text('{"unitFixture":true}')
            failure=TimeoutError('unit reproduction: navigation load timed out')
            events=[]
            class Page:
                def on(self,*args):pass
                def goto(self,*args,**kwargs):events.append('goto');raise failure
                def evaluate(self,*args):
                    if hook_fails:raise RuntimeError('hook unavailable')
                    return {'unitFixture':True}
                def screenshot(self,**kwargs):events.append('screenshot')
            class Tracing:
                def start(self,**kwargs):events.append('trace-start')
                def stop(self,**kwargs):
                    events.append('trace-stop')
                    if trace_fails:raise RuntimeError('trace failed')
                    Path(kwargs['path']).write_bytes(b'unit trace')
            class Context:
                tracing=Tracing()
                def new_page(self):
                    events.append('new-page')
                    if page_fails:raise failure
                    return Page()
                def close(self):
                    events.append('close')
                    if close_fails:raise RuntimeError('close failed')
            browser=SimpleNamespace(contexts=[],new_context=lambda **kwargs:Context())
            def snapshot(page):
                if hook_fails:raise RuntimeError('hook unavailable')
                return {'unitFixture':True}
            with patch.object(inventory_touch,'Path',side_effect=lambda _:root/'tests/inventory_touch.py'),patch.object(inventory_touch,'arm_native_chooser'),self.assertRaises(TimeoutError) as seen:
                inventory_touch.record_touch_inventory(browser,source,out,lambda *a,**k:self.fail('Import must not run after failed load'),snapshot)
            self.assertIs(seen.exception,failure)
            report=json.loads((out/'inventory-touch-report.json').read_text())
            self.assertEqual(report['status'],'failed');self.assertEqual(report['observations'],[])
            self.assertEqual(report['exceptionType'],'TimeoutError');self.assertIn('navigation load timed out',report['failure'])
            self.assertFalse((out/'inventory-touch-report.json.tmp').exists())
            self.assertEqual(events.count('goto'),0 if page_fails else 1)
            self.assertEqual(events.count('close'),1);self.assertEqual(events.count('trace-stop'),1)
            if not page_fails:self.assertIn('screenshot',events)
            if close_fails:self.assertEqual(report['cleanupError'],'close failed')
            if trace_fails:self.assertEqual(report['traceError'],'trace failed')
            return report

    def test_navigation_failure_retains_trace_and_atomic_report(self):self.exercise()
    def test_missing_hook_still_retains_failure_screenshot(self):self.exercise(hook_fails=True)
    def test_close_failure_cannot_replace_original_navigation_timeout(self):self.exercise(close_fails=True)
    def test_trace_failure_cannot_replace_original_navigation_timeout(self):self.exercise(trace_fails=True)
    def test_new_page_failure_is_still_reported_and_context_closed(self):self.exercise(page_fails=True)

if __name__=='__main__':unittest.main()
