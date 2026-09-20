"""Protocol model and driver wiring checks, not browser or OS-dialog evidence."""
import ast
from contextlib import contextmanager
from pathlib import Path
import unittest
from native_chooser import arm_native_chooser, chooser_observation, assert_one_chooser


class Page:
    def __init__(self):
        self.url = 'about:blank'
        self.handlers = {}
        self.pending = []
        self.changes = []
        self.intercepted = False
        self.activations = 0
        self.os_cancelled = 0

    def on(self, name, callback):
        if name == 'filechooser' and not self.handlers.get(name):
            self.pending.append(True)
            self.changes.append(True)
        self.handlers.setdefault(name, []).append(callback)

    def once(self, name, callback): self.on(name, callback)

    def remove_listener(self, name, callback):
        self.handlers[name].remove(callback)
        if name == 'filechooser' and not self.handlers[name]:
            self.pending.append(False)
            self.changes.append(False)

    def navigate(self):
        # Delayed protocol replies complete while the actual navigation loads.
        while self.pending: self.intercepted = self.pending.pop(0)
        self.url = 'http://unit.invalid/game'

    @contextmanager
    def expect_file_chooser(self):
        def observe(_): pass
        self.on('filechooser', observe)
        try: yield
        finally: self.remove_listener('filechooser', observe)

    def activate(self):
        self.activations += 1
        if not self.intercepted:
            self.os_cancelled += 1
            return
        for callback in list(self.handlers.get('filechooser', [])): callback(object())

    def close(self):
        for callback in self.handlers.get('close', []): callback()


class ChooserLifetime(unittest.TestCase):
    def test_first_activation_without_prearming_can_race_pending_enable(self):
        page = Page(); page.navigate()
        with page.expect_file_chooser(): page.activate()
        self.assertEqual(page.os_cancelled, 1)
        self.assertEqual(page.changes, [True, False])

    def test_prearmed_first_and_repeated_requests_never_toggle_off(self):
        page = Page(); arm_native_chooser(page); page.navigate()
        for _ in range(3):
            before = chooser_observation(page)
            with page.expect_file_chooser(): page.activate()
            assert_one_chooser(page, before)
        self.assertEqual(page.changes, [True])
        self.assertEqual(page.os_cancelled, 0)
        self.assertEqual(page.activations, 3)
        self.assertEqual(chooser_observation(page)['eventsSeen'], 3)

    def test_rearming_is_idempotent_even_after_navigation(self):
        page = Page(); arm_native_chooser(page); page.navigate(); arm_native_chooser(page)
        self.assertEqual(len(page.handlers['filechooser']), 1)
        self.assertEqual(page.changes, [True])

    def test_late_arming_is_rejected_before_registering_any_listener(self):
        page = Page(); page.navigate()
        with self.assertRaises(AssertionError): arm_native_chooser(page)
        self.assertEqual(page.handlers, {})

    def test_unarmed_driver_cannot_activate_or_choose_a_file(self):
        page = Page()
        with self.assertRaises(AssertionError): chooser_observation(page)
        self.assertEqual(page.activations, 0)

    def test_missing_duplicate_or_stale_events_do_not_pass(self):
        page = Page(); arm_native_chooser(page); page.navigate()
        before = chooser_observation(page)
        with self.assertRaises(AssertionError): assert_one_chooser(page, before)
        page.activate(); page.activate()
        with self.assertRaises(AssertionError): assert_one_chooser(page, before)
        with self.assertRaises(AssertionError): assert_one_chooser(page, chooser_observation(page))

    def test_inspection_is_a_copy_and_close_releases_record(self):
        page = Page(); arm_native_chooser(page)
        inspected = chooser_observation(page); inspected['eventsSeen'] = 100
        self.assertEqual(chooser_observation(page)['eventsSeen'], 0)
        page.close()
        with self.assertRaises(AssertionError): chooser_observation(page)

    def test_navigation_keeps_one_subscription_and_listener_never_selects(self):
        page = Page(); arm_native_chooser(page)
        for _ in range(2): page.navigate(); page.activate()
        self.assertEqual(page.changes, [True])
        self.assertEqual(chooser_observation(page)['eventsSeen'], 2)
        self.assertEqual(chooser_observation(page)['armedUrl'], 'about:blank')
        # object() has no set_files API; callback must only count, never fill an input.

    def test_every_import_capable_page_arms_before_its_first_navigation(self):
        files = ['keyboard_browser.py', 'prologue_browser.py', 'witness_browser.py',
                 'opening_browser.py', 'kingdom_browser.py', 'rescue_browser.py',
                 'trial_browser.py', 'fair_browser.py', 'equipment_browser.py', 'inventory_touch.py']
        root = Path(__file__).parent
        for name in files:
            with self.subTest(driver=name):
                tree = ast.parse((root/name).read_text())
                pages = 0
                for parent in ast.walk(tree):
                    for attr in ('body', 'orelse', 'finalbody'):
                        block = getattr(parent, attr, [])
                        if not isinstance(block, list): continue
                        for i, stmt in enumerate(block):
                            if not isinstance(stmt, ast.Assign): continue
                            call = stmt.value
                            if not (isinstance(call, ast.Call) and isinstance(call.func, ast.Attribute) and call.func.attr == 'new_page'): continue
                            pages += 1
                            following = block[i+1]
                            self.assertIsInstance(following, ast.Expr)
                            self.assertEqual(ast.unparse(following.value), 'arm_native_chooser('+ast.unparse(stmt.targets[0])+')')
                self.assertEqual(pages, 1, name)
