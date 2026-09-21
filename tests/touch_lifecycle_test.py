"""Synthetic lifecycle regressions only; no browser is launched by these tests."""
import ast
from pathlib import Path
from types import SimpleNamespace
import unittest
from touch_lifecycle import NavigationProbe, require_empty_browser, retire_desktop


class Context:
    def __init__(self, browser):
        self.browser=browser;self.pages=[];self.failure=None
    def close(self):
        if self.failure:raise self.failure
        for page in self.pages:page.closed=True
        self.browser.contexts.remove(self)


class Page:
    def __init__(self, context=None):
        self.context=context;self.closed=False;self.handlers={};self.calls=[];self.failure=None
        if context:context.pages.append(self)
    def is_closed(self):return self.closed
    def on(self, name, callback):self.handlers[name]=callback
    def goto(self, url, **options):
        self.calls.append((url,options))
        if self.failure:raise self.failure
        self.handlers['domcontentloaded']();self.handlers['load']()
        return SimpleNamespace(status=200)


class TouchLifecycleContract(unittest.TestCase):
    def test_existing_desktop_is_rejected_before_touch_creation(self):
        browser=SimpleNamespace(contexts=[]);context=Context(browser);browser.contexts.append(context);Page(context)
        with self.assertRaises(AssertionError):require_empty_browser(browser)

    def test_retire_only_owned_completed_context_and_require_no_live_pages(self):
        browser=SimpleNamespace(contexts=[]);context=Context(browser);browser.contexts.append(context);page=Page(context);report={}
        retire_desktop(browser,page,report)
        self.assertEqual(report,{'status':'passed','contextsBefore':1,'pagesBefore':1,'contextsAfter':0,'pagesAfter':0,'desktopClosed':True})
        self.assertEqual(require_empty_browser(browser),{'contexts':0,'pages':0})

    def test_retirement_failure_is_not_success_or_a_retry(self):
        browser=SimpleNamespace(contexts=[]);context=Context(browser);browser.contexts.append(context);page=Page(context);context.failure=RuntimeError('close failed');report={}
        with self.assertRaisesRegex(RuntimeError,'close failed'):retire_desktop(browser,page,report)
        self.assertEqual(report['status'],'retiring');self.assertFalse(page.closed)

    def test_unrelated_page_or_context_is_not_closed(self):
        for extra in ('page','context'):
            browser=SimpleNamespace(contexts=[]);context=Context(browser);browser.contexts.append(context);page=Page(context)
            if extra=='page':Page(context)
            else:browser.contexts.append(Context(browser))
            with self.subTest(extra=extra),self.assertRaises(AssertionError):retire_desktop(browser,page,{})
            self.assertFalse(page.closed)

    def test_load_keeps_original_30_second_load_condition(self):
        page=Page();probe=NavigationProbe(page);probe.goto(page,'http://127.0.0.1:4188/?test=1')
        self.assertEqual(page.calls,[('http://127.0.0.1:4188/?test=1',{'wait_until':'load','timeout':30000})])
        self.assertEqual(probe.data['status'],'loaded');self.assertEqual(probe.data['httpStatus'],200)
        self.assertEqual([e['event'] for e in probe.data['events']],['domcontentloaded','load'])

    def test_ci37_navigation_timeout_is_propagated_without_retry(self):
        page=Page();original=TimeoutError('Page.goto: Timeout 30000ms exceeded.');page.failure=original;probe=NavigationProbe(page)
        with self.assertRaises(TimeoutError) as seen:probe.goto(page,'http://127.0.0.1:4188/?test=1')
        self.assertIs(seen.exception,original);self.assertEqual(len(page.calls),1)
        self.assertEqual(probe.data['status'],'failed');self.assertIn('30000',probe.data['failure'])

    def test_non_200_document_cannot_be_loaded_successfully(self):
        page=Page();page.goto=lambda *a,**k:SimpleNamespace(status=503);probe=NavigationProbe(page)
        with self.assertRaises(AssertionError):probe.goto(page,'http://127.0.0.1:4188/?test=1')
        self.assertEqual(probe.data['status'],'failed')

    def test_request_telemetry_records_failure_without_embedded_asset_urls(self):
        page=Page();probe=NavigationProbe(page);r=SimpleNamespace(resource_type='document',failure='net::ERR_FAILED')
        page.handlers['request'](r);page.handlers['requestfinished'](r);page.handlers['requestfailed'](r)
        self.assertEqual(probe.data['requests'],1);self.assertEqual(probe.data['finished'],1)
        self.assertEqual(probe.data['failed'],[{'type':'document','failure':'net::ERR_FAILED'}])

    def test_desktop_observation_and_final_import_precede_retirement_and_touch(self):
        text=(Path(__file__).parent/'equipment_browser.py').read_text()
        sequence=["imported(page,final)","desktop_terminal={'lastObserved'",'retire_desktop(browser,page,handoff)','touch=record_touch_inventory']
        offsets=[text.index(s) for s in sequence];self.assertEqual(offsets,sorted(offsets))
        self.assertIn("observationContext='desktop-before-touch-retirement'",text)
        self.assertIn('contextHandoff=handoff',text)

    def test_touch_preflight_and_handlers_precede_navigation_and_real_taps(self):
        text=(Path(__file__).parent/'inventory_touch.py').read_text()
        sequence=['require_empty_browser(browser)','browser.new_context(', 'arm_native_chooser(page)', 'probe=NavigationProbe(page)', 'probe.goto(page',"page.locator('#start-story').tap()",'imported(page,source,activation="tap")']
        offsets=[text.index(s) for s in sequence];self.assertEqual(offsets,sorted(offsets))
        self.assertIn('if cleanup_error is not None and primary_error is None:raise cleanup_error',text)
        self.assertIn("temporary.replace(out/'inventory-touch-report.json')",text)
        self.assertNotIn('wait_until=\'domcontentloaded\'',text)
        ast.parse(text)

if __name__=='__main__':unittest.main()
