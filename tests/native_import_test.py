"""Protocol-unit tests only: no browser/OS picker or gameplay certification."""
from copy import deepcopy
import ast
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest

from native_import import import_save, _ATTEMPTS


class Handle:
    def __init__(self, value): self.value = value
    def json_value(self): return deepcopy(self.value)
    def dispose(self): pass


class PagePort:
    def __init__(self, outcome='imported'):
        self.outcome = outcome
        self.order = []
        self.phase = 'closed'
        self.events = [{'sequence': 1, 'event': 'imported', 'phase': 'closed'}]
        self.frame = 10
        self.focus = 'import'
        self.message = '存檔已匯入'
        self.armed = False
        self.fail_at = None
        self.element_id = 'save-file'
        self.keyboard = SimpleNamespace(press=self.activate)
        self.element = SimpleNamespace(get_attribute=lambda name: self.element_id if name == 'id' else 'file')

    def context(self):
        return deepcopy({'focused': self.focus, 'picker': self.phase,
            'importDisabled': False, 'paused': self.phase in ('open', 'reading'),
            'message': self.message, 'chapter': 'fair', 'ticks': 20,
            'lifecycle': {'phase': self.phase, 'events': self.events}})

    def evaluate(self, expression):
        if expression == 'window.__CHRONO_TEST__.snapshot()': return {'chapter': 'fair', 'ticks': 20}
        if expression == 'window.__CHRONO_TEST__.view().frame': return self.frame
        return self.context()

    def locator(self, selector):
        return SimpleNamespace(click=lambda: self.activate('click'), tap=lambda: self.activate('tap'), input_value=lambda: '')

    def expect_file_chooser(self, timeout):
        owner = self
        class Event:
            value = owner
            def __enter__(self):
                owner.armed = True; owner.order.append('armed'); return self
            def __exit__(self, kind, value, tb):
                owner.armed = False
                if owner.fail_at == 'chooser': raise TimeoutError('no chooser event')
                owner.order.append('event-observed')
        return Event()

    def activate(self, kind):
        assert self.armed, 'native activation must not precede interception'
        self.order.append(kind)
        self.phase = 'open'
        self.events.append({'sequence': len(self.events)+1, 'event': 'requested', 'phase': 'open'})

    def is_multiple(self): return False

    def set_files(self, selection):
        self.order.append('set-files')
        self.phase = 'error' if self.outcome == 'read-error' else 'closed'
        self.focus = 'world'
        self.message = {'imported': '存檔已匯入', 'read-error': '匯入失敗', 'empty-selection': '已取消匯入', 'cancelled': '已取消匯入'}[self.outcome]
        self.events.append({'sequence': len(self.events)+1, 'event': self.outcome, 'phase': self.phase})

    def wait_for_function(self, expression, *, arg=None, timeout=None):
        if arg is not None:
            if self.fail_at == 'terminal': raise TimeoutError('no terminal event')
            selected = next((e for e in self.events if e['sequence']>arg['sequence'] and e['event'] in arg['terminals']), None)
            assert selected, 'must not accept the prior imported event'
            return Handle(selected)
        self.frame += 2
        return Handle(True)


class NativeImportProtocolTest(unittest.TestCase):
    def setUp(self):
        _ATTEMPTS.clear()
        self.tmp = TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.out = Path(self.tmp.name)
        self.file = self.out/'unit-existing-file.json'
        self.file.write_bytes(b'unit bytes, not a playable save')

    def read_report(self): return json.loads((self.out/'native-import-report.json').read_text())

    def test_all_native_activations_arm_before_action_and_select_once(self):
        for activation in ('click', 'tap', 'Enter', 'Space'):
            with self.subTest(activation=activation):
                p = PagePort()
                result = import_save(p, self.file, self.out, activation=activation)
                self.assertEqual(p.order, ['armed', activation, 'event-observed', 'set-files'])
                self.assertEqual(result['terminal']['sequence'], 3)
                self.assertTrue(result['frozenWhileSelecting'])
                self.assertEqual(result['status'], 'passed')
        self.assertEqual(len(self.read_report()['attempts']), 4)

    def test_missing_event_retains_failure_without_selecting_or_retrying(self):
        p = PagePort(); p.fail_at = 'chooser'
        with self.assertRaises(TimeoutError): import_save(p, self.file, self.out)
        self.assertEqual(p.order, ['armed', 'click'])
        report = self.read_report()
        self.assertEqual(report['status'], 'failed')
        self.assertEqual(report['attempts'][0]['stage'], 'before-activation')
        self.assertEqual(report['attempts'][0]['after']['picker'], 'open')

    def test_unrelated_input_is_never_filled(self):
        p = PagePort(); p.element_id = 'another-file'
        with self.assertRaises(AssertionError): import_save(p, self.file, self.out)
        self.assertNotIn('set-files', p.order)

    def test_cancellation_cannot_be_misreported_as_import_success(self):
        p = PagePort('cancelled')
        with self.assertRaises(AssertionError): import_save(p, self.file, self.out)
        attempt = self.read_report()['attempts'][0]
        self.assertEqual(attempt['terminal']['event'], 'cancelled')
        self.assertEqual(attempt['stage'], 'selection-supplied')

    def test_terminal_timeout_preserves_selection_stage_and_after_context(self):
        p = PagePort(); p.fail_at = 'terminal'
        with self.assertRaises(TimeoutError): import_save(p, self.file, self.out)
        self.assertEqual(self.read_report()['attempts'][0]['stage'], 'selection-supplied')
        self.assertEqual(p.order.count('set-files'), 1)

    def test_rejection_and_empty_are_explicit_not_story_success(self):
        import_save(PagePort('read-error'), {'name':'invalid.json','mimeType':'application/json','buffer':b'{'}, self.out, expected='rejected')
        import_save(PagePort('empty-selection'), [], self.out, expected='empty')
        report = self.read_report()
        self.assertTrue(report['attempts'][0]['selection']['negativeFixture'])
        self.assertFalse(report['attempts'][1]['selection']['nativeCancelCertified'])
        self.assertFalse(report['physicalDeviceApproved'])
        self.assertNotIn('buffer', json.dumps(report))

    def test_empty_selection_may_report_native_cancel_but_not_success(self):
        result = import_save(PagePort('cancelled'), [], self.out, expected='empty')
        self.assertEqual(result['terminal']['event'], 'cancelled')
        self.assertFalse(result['selection']['nativeCancelCertified'])

    def test_positive_payload_cannot_mint_a_journey_save(self):
        for selection in ({'buffer':b'{}'}, [], None):
            with self.subTest(selection=selection):
                p = PagePort()
                with self.assertRaises(ValueError): import_save(p, selection, self.out)
                self.assertEqual(p.order, [])

    def test_keyboard_activation_refuses_focus_on_another_control(self):
        p = PagePort(); p.focus = 'world'
        with self.assertRaises(AssertionError): import_save(p, self.file, self.out, activation='Enter')
        self.assertEqual(p.order, [])

    def test_busy_request_fails_instead_of_acting_behind_existing_picker(self):
        p = PagePort(); p.phase = 'open'
        with self.assertRaises(AssertionError): import_save(p, self.file, self.out)
        self.assertEqual(p.order, [])

    def test_all_importing_journeys_use_shared_real_chooser_contract(self):
        root = Path(__file__).parent
        expected = {'prologue_browser.py','witness_browser.py','kingdom_browser.py','rescue_browser.py','trial_browser.py','fair_browser.py','opening_browser.py','keyboard_browser.py'}
        found = set()
        for path in root.glob('*_browser.py'):
            nodes = list(ast.walk(ast.parse(path.read_text())))
            forbidden = [node for node in nodes if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == 'set_input_files']
            self.assertFalse(forbidden, path.name)
            if any(isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == 'import_save' for node in nodes): found.add(path.name)
        self.assertEqual(found, expected)


if __name__ == '__main__': unittest.main()
