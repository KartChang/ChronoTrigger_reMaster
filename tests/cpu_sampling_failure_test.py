"""Error/trace contracts only, not native reports or successful save fixtures."""
import ast
from pathlib import Path
import unittest
from cpu_era_route import failure_detail

class SamplingFailureTests(unittest.TestCase):
    def test_bare_assertion_has_a_nonempty_type_and_trace(self):
        try:
            assert False
        except AssertionError as exc:
            r = failure_detail(exc)
        self.assertEqual(r['message'], 'AssertionError')
        self.assertEqual(r['type'], 'AssertionError')
        self.assertIn('test_bare_assertion', r['traceback'])

    def test_message_and_original_cause_are_preserved(self):
        try:
            try:
                raise ValueError('sampling input')
            except ValueError as cause:
                raise RuntimeError('capture failed') from cause
        except RuntimeError as exc:
            r = failure_detail(exc)
        self.assertEqual(r['message'], 'capture failed')
        self.assertIn('ValueError: sampling input', r['traceback'])
        self.assertIn('RuntimeError: capture failed', r['traceback'])

    def test_partial_attempt_is_retained_before_the_original_filter_assertions(self):
        source = (Path(__file__).parent/'cpu_era_route.py').read_text()
        self.assertLess(source.index("r['filteringAttempt']['filtered'] = filtered"), source.index("assert filtered['renderer']['cpu']['sampling']['minifiedTriangles'] > 0"))
        self.assertLess(source.index("r['filteringAttempt']['restored'] = restored"), source.index("assert restored['canvasSha256'] == unfiltered['canvasSha256']"))
        self.assertIn("r['failure'] = failure_detail(exc)", source)
        tree = ast.parse(source)
        handler = next(n for n in ast.walk(tree) if isinstance(n, ast.ExceptHandler) and n.name == 'exc')
        self.assertIsInstance(handler.body[-1], ast.Raise)

if __name__ == '__main__':
    unittest.main()
