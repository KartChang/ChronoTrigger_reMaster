"""Unit doubles for host-side key cleanup/diagnostics, NOT browser acceptance."""
import copy
import unittest
from rescue_route import approach_interaction, ORGAN_ROUTE


class HandleDouble:
    def __init__(self, value):
        self.value = value
        self.disposed = False

    def json_value(self):
        return copy.deepcopy(self.value)

    def dispose(self):
        self.disposed = True


class PageDouble:
    def __init__(self, joined=False):
        self.state = {'chapter': 'cathedral', 'mode': 'explore', 'joined': joined,
                      'ticks': 10, 'players': [{'x': .5, 'z': 5}, {'x': 1.8, 'z': 5}]}
        self.keys = []
        self.keyboard = self
        self.before_ready = False
        self.after_ready = True
        self.eval_count = 0
        self.wait_error = self.down_error = self.up_error = None
        self.wait_ok = True
        self.handle = None
        self.wait_args = None

    def down(self, key):
        self.keys.append(('down', key))
        if key == self.down_error:
            raise RuntimeError('keydown unavailable')

    def up(self, key):
        self.keys.append(('up', key))
        if key == self.up_error:
            raise RuntimeError('keyup unavailable')

    def observation(self, ready):
        return {'ok': True, 'ready': ready, 'distance': 1.6, 'state': copy.deepcopy(self.state),
                'ui': {'focused': 'world'}, 'reason': None}

    def evaluate(self, source, args=None):
        if args is None:
            return {'focused': 'world'}
        self.eval_count += 1
        return self.observation(self.before_ready if self.eval_count == 1 else self.after_ready)

    def wait_for_function(self, source, *, arg, polling, timeout):
        self.wait_args = (arg, polling, timeout)
        if self.wait_error:
            raise self.wait_error
        value = self.observation(True)
        value['ok'] = self.wait_ok
        self.handle = HandleDouble(value)
        return self.handle


class HostApproachTests(unittest.TestCase):
    def call(self, page, evidence, move=None):
        return approach_interaction(page, move or (lambda *_: None),
                                    lambda _: copy.deepcopy(page.state), evidence,
                                    ORGAN_ROUTE, 'organ-route.json')

    def test_solo_keys_are_released_and_handle_disposed(self):
        p, trace = PageDouble(), []
        before = copy.deepcopy(p.state)
        self.call(p, trace)
        self.assertEqual(p.keys, [('down', 'a'), ('up', 'a')])
        self.assertTrue(p.handle.disposed)
        self.assertEqual(trace[0]['status'], 'reached')
        self.assertEqual(trace[0]['waypoints'][-1]['stop'], 'visible-in-range-prompt')
        self.assertEqual(p.state, before)
        self.assertEqual(p.wait_args[1:], (100, 120000))
        self.assertEqual(p.wait_args[0]['budget'], 230)  # Original distance/speed+2s budget.

    def test_joined_keys_never_reassign_ownership(self):
        p, trace = PageDouble(True), []
        self.call(p, trace)
        self.assertEqual(p.keys, [('down', 'a'), ('down', 'ArrowLeft'), ('up', 'ArrowLeft'), ('up', 'a')])
        self.assertTrue(p.wait_args[0]['joined'])

    def test_already_interactable_needs_no_movement_key(self):
        p, trace = PageDouble(), []
        p.before_ready = True
        self.call(p, trace)
        self.assertEqual(p.keys, [])
        self.assertIsNone(p.wait_args)

    def test_wait_timeout_still_releases_all_keys_and_retains_failure(self):
        p, trace = PageDouble(True), []
        p.wait_error = TimeoutError('synthetic timeout for unit test')
        with self.assertRaises(TimeoutError):
            self.call(p, trace)
        self.assertEqual(p.keys[-2:], [('up', 'ArrowLeft'), ('up', 'a')])
        self.assertEqual(trace[0]['status'], 'failed')
        self.assertEqual(trace[0]['inputAfterFailure']['focused'], 'world')

    def test_rejected_probe_is_not_retried_or_relabelled_as_success(self):
        p, trace = PageDouble(True), []
        p.wait_ok = False
        with self.assertRaises(AssertionError):
            self.call(p, trace)
        self.assertTrue(p.handle.disposed)
        self.assertEqual(trace[0]['status'], 'failed')
        self.assertEqual(len(p.keys), 4)

    def test_second_keydown_exception_releases_both_attempted_keys(self):
        p, trace = PageDouble(True), []
        p.down_error = 'ArrowLeft'
        with self.assertRaisesRegex(RuntimeError, 'keydown'):
            self.call(p, trace)
        self.assertEqual(p.keys[-2:], [('up', 'ArrowLeft'), ('up', 'a')])
        self.assertEqual(trace[0]['status'], 'failed')

    def test_one_release_exception_does_not_prevent_the_other_release(self):
        p, trace = PageDouble(True), []
        p.up_error = 'ArrowLeft'
        with self.assertRaises(AssertionError):
            self.call(p, trace)
        self.assertEqual(p.keys[-1], ('up', 'a'))
        self.assertEqual(trace[0]['waypoints'][-1]['releaseErrors'][0]['key'], 'ArrowLeft')

    def test_prompt_disappearing_after_release_is_a_failure(self):
        p, trace = PageDouble(), []
        p.after_ready = False
        with self.assertRaises(AssertionError):
            self.call(p, trace)
        self.assertEqual(trace[0]['status'], 'failed')
        self.assertFalse(trace[0]['waypoints'][-1]['probeAfter']['ready'])

    def test_wrong_chapter_retains_trace_without_keys(self):
        p, trace = PageDouble(), []
        p.state['chapter'] = 'passage'
        with self.assertRaises(AssertionError):
            self.call(p, trace)
        self.assertEqual(p.keys, [])
        self.assertEqual(trace[0]['status'], 'failed')

    def test_intermediate_failure_retains_after_release_observation(self):
        p, trace = PageDouble(), []
        def failed_move(*_):
            raise RuntimeError('synthetic intermediate failure')
        with self.assertRaises(RuntimeError):
            self.call(p, trace, failed_move)
        self.assertIn('afterRelease', trace[0]['waypoints'][0])
        self.assertEqual(p.keys, [])


if __name__ == '__main__':
    unittest.main()
