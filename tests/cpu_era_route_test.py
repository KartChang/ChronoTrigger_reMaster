"""Native-driver port/contracts only. No browser, successful game/save fixture or CI report generation."""
import ast
import json
from pathlib import Path
import re
import unittest
from types import SimpleNamespace
from cpu_era_route import hold_until, CHAPTER_CAPTURES

ROOT = Path(__file__).resolve().parents[1]

class KeyboardPort:
    def __init__(self, down_error=None, up_error=None):
        self.calls = []
        self.down_error, self.up_error = down_error, up_error
    def down(self, key):
        self.calls.append(('down', key))
        if self.down_error:
            raise self.down_error
    def up(self, key):
        self.calls.append(('up', key))
        if self.up_error:
            raise self.up_error

class CpuEraRouteContracts(unittest.TestCase):
    def test_hold_returns_same_observation_with_original_budget(self):
        keyboard = KeyboardPort();page = SimpleNamespace(keyboard=keyboard)
        observation = object();calls = []
        def wait(p, expression, budget):
            calls.append((p, expression, budget))
            return observation
        self.assertIs(hold_until(page, 'w', wait, 's.mode==="battle"', 143), observation)
        self.assertEqual(calls, [(page, 's.mode==="battle"', 143)])
        self.assertEqual(keyboard.calls, [('down', 'w'), ('up', 'w')])

    def test_failed_keydown_still_releases_attempted_key(self):
        failure = ValueError('down failed');keyboard = KeyboardPort(down_error=failure)
        with self.assertRaises(ValueError) as raised:
            hold_until(SimpleNamespace(keyboard=keyboard), 's', lambda *_: self.fail('wait must not run'), 'p', 100)
        self.assertIs(raised.exception, failure)
        self.assertEqual(keyboard.calls, [('down', 's'), ('up', 's')])

    def test_predicate_failure_still_releases(self):
        failure = AssertionError('budget exhausted');keyboard = KeyboardPort()
        def wait(*_):
            raise failure
        with self.assertRaises(AssertionError) as raised:
            hold_until(SimpleNamespace(keyboard=keyboard), 'ArrowLeft', wait, 'p', 165)
        self.assertIs(raised.exception, failure)
        self.assertEqual(keyboard.calls[-1], ('up', 'ArrowLeft'))

    def test_cleanup_does_not_mask_primary_failure(self):
        primary = ValueError('down');keyboard = KeyboardPort(primary, RuntimeError('up'))
        with self.assertRaises(ValueError) as raised:
            hold_until(SimpleNamespace(keyboard=keyboard), 'ArrowRight', lambda *_: None, 'p', 60)
        self.assertIs(raised.exception, primary)

    def test_cleanup_failure_is_not_silently_successful(self):
        keyboard = KeyboardPort(up_error=RuntimeError('up'))
        with self.assertRaisesRegex(RuntimeError, 'up'):
            hold_until(SimpleNamespace(keyboard=keyboard), 'w', lambda *_: object(), 'p', 100)

    def test_all_authored_movement_legs_match_the_new_ledger_contract(self):
        tree = ast.parse((ROOT/'tests/cpu_era_route.py').read_text())
        calls = sorted((n for n in ast.walk(tree) if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id=='move'), key=lambda n:(n.lineno,n.col_offset))
        actual = [[ast.literal_eval(n.args[0]),ast.literal_eval(n.args[1]),ast.literal_eval(n.args[2]) if len(n.args)>2 else False] for n in calls]
        script = (ROOT/'scripts/cpu-era-evidence.mjs').read_text()
        raw = re.search(r'export const ERA_MOVES = (\[[\s\S]*?\n\]);', script).group(1)
        raw = re.sub(r'(?<![\w\d])(-?)\.(\d)',r'\g<1>0.\2',raw.replace("'", '"'))
        self.assertEqual(actual, json.loads(raw))
        self.assertEqual(len(actual), 30)

    def test_chapter_contract_preserves_existing_maps_and_both_reunions(self):
        self.assertEqual(CHAPTER_CAPTURES, ('fair','canyon','truce','forest','castle','chamber','castle','cathedral'))

    def test_existing_original_cpu_cases_run_before_additional_continuation(self):
        source = (ROOT/'tests/cpu_renderer_browser.py').read_text()
        self.assertLess(source.index('            observe_home(page)'), source.index('            observe_fair(page)'))
        self.assertLess(source.index('            observe_fair(page)'), source.index('            observe_era_route(page'))
        self.assertIn("(out.parent/'cpu-own-fair-save.json').read_bytes()", (ROOT/'tests/cpu_era_route.py').read_text())

    def test_no_positive_save_payload_or_writable_game_hook(self):
        source = (ROOT/'tests/cpu_era_route.py').read_text()
        self.assertIn('download.value.save_as(path)',source)
        self.assertIn('receipt = import_save(page, path, out)',source)
        for forbidden in ['set_input_files(', 'dispatch_event(', '.clock.', 'localStorage.setItem', '__CHRONO_TEST__.set', '.teleport(', 'setState(', 'indexedDB.open(']:
            self.assertNotIn(forbidden,source)
        self.assertIn('page.locator(\'#cpu-sampling\').set_checked(on)',source)

if __name__ == '__main__':
    unittest.main()
