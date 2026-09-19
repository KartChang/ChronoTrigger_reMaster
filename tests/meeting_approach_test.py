"""Unit event ports: test input release and durable failure details, not browser play."""
import ast
import copy
from pathlib import Path
import unittest
from meeting_approach import approach_first_meeting


class Handle:
    def __init__(self, result): self.result = result; self.disposed = False
    def json_value(self): return copy.deepcopy(self.result)
    def dispose(self): self.disposed = True


class Page:
    def __init__(self, fail=None):
        self.state = dict(chapter='fair', mode='explore', joined=True, ticks=20,
                          prologue=dict(stage='fair'), players=[dict(x=0,z=-6.8)])
        self.keys = []; self.fail = fail; self.keyboard = self
    def down(self, key):
        self.keys.append(('down', key))
        if self.fail == 'down': raise RuntimeError('transport stopped during keydown')
    def up(self, key): self.keys.append(('up', key))
    def result(self):
        collision = self.state['prologue']['stage'] == 'collision'
        return dict(ok=True, reached=collision, collision=collision, state=copy.deepcopy(self.state))
    def evaluate(self, expression, args=None):
        return copy.deepcopy(self.state) if args is None else self.result()
    def wait_for_function(self, expression, **kwargs):
        if self.fail == 'wait': raise RuntimeError('observer failed')
        self.state['prologue']['stage'] = 'collision'; self.handle = Handle(self.result())
        return self.handle


class MeetingProtocol(unittest.TestCase):
    def test_real_event_ends_approach_without_second_key(self):
        p = Page(); evidence = []; approach_first_meeting(p, evidence)
        self.assertEqual(p.keys, [('down','w'), ('up','w')])
        self.assertTrue(p.handle.disposed)
        self.assertEqual(evidence[0]['status'], 'collision-observed')

    def test_release_and_failure_trace_even_when_keydown_or_wait_raises(self):
        for stage in ('down','wait'):
            p = Page(stage); evidence = []
            with self.assertRaises(RuntimeError): approach_first_meeting(p, evidence)
            self.assertEqual(p.keys[-1], ('up','w'))
            self.assertEqual(evidence[0]['status'], 'failed')
            self.assertIn('afterFailure', evidence[0])

    def test_browser_preserves_event_and_first_choice_assertions(self):
        source = (Path(__file__).with_name('prologue_browser.py')).read_text()
        tree = ast.parse(source)
        collide = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'collide')
        text = ast.unparse(collide)
        self.assertIn('approach_first_meeting', text)
        self.assertIn("s.prologue.elapsed>=.6", text)
        self.assertIn("['first'] == 'unknown'", text)
        self.assertNotIn('set_input_files', source)
        self.assertIn("['first']=='pendant'", source)
