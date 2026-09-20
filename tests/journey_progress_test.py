import ast
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from journey_progress import write_progress


class JourneyProgressTest(unittest.TestCase):
    def test_partial_record_preserves_actual_last_wait_without_becoming_acceptance(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'trial-progress.json'
            checks = ['unit-only completed action']
            waits = [{'observed': {'state': {'ticks': 42}, 'paused': False}}]
            write_progress(path, checks, waits, phase='alternate-wait-route-start')
            r = json.loads(path.read_text())
            self.assertEqual(r['status'], 'incomplete')
            self.assertFalse(r['acceptance'])
            self.assertEqual(r['lastWait'], waits[-1])
            self.assertEqual(r['passedChecks'], checks)
            self.assertEqual(r['phase'], 'alternate-wait-route-start')
            self.assertFalse(path.with_suffix('.json.tmp').exists())

    def test_empty_waits_are_explicitly_unobserved(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'trial-progress.json'
            write_progress(path, [], [], phase='starting')
            self.assertIsNone(json.loads(path.read_text())['lastWait'])

    def test_failed_replacement_keeps_the_previous_complete_checkpoint(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'trial-progress.json'
            write_progress(path, [], [], phase='before')
            with patch.object(Path, 'replace', side_effect=OSError('unit simulated storage failure')):
                with self.assertRaises(OSError):
                    write_progress(path, ['next'], [], phase='after')
            self.assertEqual(json.loads(path.read_text())['phase'], 'before')

    def test_trial_records_both_alternate_route_boundaries_and_never_reads_progress_as_save(self):
        source = (Path(__file__).parent / 'trial_browser.py').read_text()
        tree = ast.parse(source)
        calls = [n for n in ast.walk(tree) if isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == 'write_progress']
        self.assertEqual(len(calls), 3)
        self.assertIn("phase='alternate-wait-route-start'", source)
        self.assertIn("phase='alternate-wait-route-saved'", source)
        self.assertNotIn("import_save(page,OUT/'trial-progress.json'", source)


if __name__ == '__main__':
    unittest.main()
