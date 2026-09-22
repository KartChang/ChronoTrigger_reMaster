"""Deterministic native-input port tests, NOT browser/CPU performance evidence."""
from copy import deepcopy
from pathlib import Path
import ast
import math
import unittest
from cpu_native_route import move_axis, native_pulse, ARRIVAL_EPSILON, OBSERVATION


class Keyboard:
    def __init__(self, page):
        self.page = page
        self.held = set()
        self.events = []

    def down(self, key):
        self.events.append(('down', key))
        self.held.add(key)
        if key == self.page.fail_down:
            raise RuntimeError('native key-down error')

    def up(self, key):
        self.events.append(('up', key))
        if self.page.overshoot and key == 'a':
            # CI48's first horizontal leg passed x=0 and stopped at x=-0.9.
            self.page.step(36)
            self.page.overshoot = False
        else:
            self.page.step(self.page.release_ticks)
        self.held.discard(key)
        if key == self.page.fail_up:
            raise RuntimeError('native key-up error')


    def press(self, key, delay=0):
        # Conservative unit port: the same down/wait/up costs as before.
        # This does NOT claim the driver's native latency is zero.
        self.down(key)
        if delay:
            self.page.wait_for_timeout(delay)
        self.up(key)


class NativePort:
    def __init__(self, x=1.5, z=1.4, chapter='bedroom', release_ticks=2, overshoot=False):
        self.state = {'chapter': chapter, 'mode': 'explore', 'ticks': 0,
                      'players': [{'x': x, 'z': z}, {'x': x+.8, 'z': z}]}
        self.keyboard = Keyboard(self)
        self.release_ticks, self.overshoot = release_ticks, overshoot
        self.fail_down = self.fail_up = None
        self.paused = self.blocked = self.fail_wait = False
        self.seconds = 0
        self.evaluations = 0
        self.change_chapter_at = None

    def step(self, ticks):
        speed = (2.4 if self.state['chapter'] == 'overworld1000' else 4)/60
        for _ in range(ticks):
            self.seconds += 1/60
            if self.paused:
                continue
            self.state['ticks'] += 1
            if self.change_chapter_at == self.state['ticks']:
                self.state['chapter'] = 'home'
            if not self.blocked:
                for slot, choices in enumerate([{'d': ('x', 1), 'a': ('x', -1), 'w': ('z', 1), 's': ('z', -1)},
                                                {'ArrowRight': ('x', 1), 'ArrowLeft': ('x', -1), 'ArrowUp': ('z', 1), 'ArrowDown': ('z', -1)}]):
                    for key in self.keyboard.held:
                        if key in choices:
                            axis, sign = choices[key]
                            self.state['players'][slot][axis] += speed*sign

    def wait_for_timeout(self, ms):
        if self.fail_wait:
            raise RuntimeError('native wait error')
        if not self.overshoot:
            self.step(math.ceil(ms*60/1000))

    def evaluate(self, expression):
        assert expression == OBSERVATION  # no injected state, clock or synthetic event
        assert not self.keyboard.held      # every position is inspected after release
        self.evaluations += 1
        return {'state': deepcopy(self.state), 'paused': self.paused}

    def run(self, axis='x', target=0, coop=False, trace=None):
        return move_axis(self, axis, target, coop, trace, clock=lambda: self.seconds)


class NativeRouteTests(unittest.TestCase):
    def test_observed_ci48_overshoot_is_not_accepted_as_arrival(self):
        page = NativePort(overshoot=True)
        trace = []
        final = page.run(trace=trace)
        first = trace[0]['pulses'][0]['afterRelease']['state']
        self.assertAlmostEqual(first['players'][0]['x'], -.9)
        self.assertGreater(abs(first['players'][0]['x']), .65)  # outside the unchanged stairs radius
        self.assertLess(abs(final['players'][0]['x']), ARRIVAL_EPSILON)
        self.assertEqual(trace[0]['status'], 'arrived')
        self.assertEqual(trace[0]['budget'], math.ceil((1.5/4+2)*60))
        self.assertLessEqual(final['ticks'], trace[0]['budget'])
        self.assertIn(('down', 'd'), page.keyboard.events)

    def test_release_latency_and_both_directions_converge(self):
        for latency in [0, 1, 2, 3, 4, 6]:
            for axis in ['x', 'z']:
                for target in [-3.4, 0, 2.5]:
                    with self.subTest(latency=latency, axis=axis, target=target):
                        page = NativePort(release_ticks=latency)
                        final = page.run(axis, target)
                        self.assertLess(abs(final['players'][0][axis]-target), .12)
                        self.assertFalse(page.keyboard.held)

    def test_overworld_keeps_original_slower_movement_budget(self):
        page = NativePort(x=.1, z=-2.7, chapter='overworld1000')
        trace = []
        final = page.run('z', 5.1, trace=trace)
        self.assertLess(abs(final['players'][0]['z']-5.1), .12)
        self.assertEqual(trace[0]['budget'], math.ceil((7.8/2.4+2)*60))

    def test_single_player_does_not_move_other_owner(self):
        page = NativePort()
        other = deepcopy(page.state['players'][1])
        page.run()
        self.assertEqual(page.state['players'][1], other)
        self.assertFalse(any(key.startswith('Arrow') for _, key in page.keyboard.events))

    def test_coop_uses_native_keys_and_releases_both(self):
        page = NativePort(release_ticks=1)
        before = page.state['players'][1]['z']
        page.run('z', -2, coop=True)
        self.assertLess(page.state['players'][1]['z'], before)
        self.assertIn(('down', 'ArrowDown'), page.keyboard.events)
        self.assertFalse(page.keyboard.held)

    def test_blocked_route_exhausts_original_budget_instead_of_skipping(self):
        page = NativePort(); page.blocked = True; trace = []
        with self.assertRaisesRegex(AssertionError, 'boundary/budget'):
            page.run(trace=trace)
        self.assertEqual(trace[0]['status'], 'failed')
        self.assertEqual(page.state['players'][0]['x'], 1.5)
        self.assertFalse(page.keyboard.held)

    def test_paused_route_and_unexpected_transition_fail_not_pass(self):
        page = NativePort(); page.paused = True
        with self.assertRaises(AssertionError):
            page.run()
        self.assertEqual(page.keyboard.events, [])
        page = NativePort(); page.change_chapter_at = 1
        with self.assertRaises(AssertionError):
            page.run()
        self.assertFalse(page.keyboard.held)

    def test_wall_deadline_and_tick_budget_do_not_reset_per_pulse(self):
        page = NativePort(); trace = []; calls = [0]
        def clock():
            calls[0] += 1
            return calls[0]*16
        with self.assertRaisesRegex(AssertionError, 'boundary/budget'):
            move_axis(page, 'x', 0, evidence=trace, clock=clock)
        self.assertEqual(trace[0]['timeoutMs'], 30000)
        self.assertFalse(page.keyboard.held)

    def test_failed_second_key_and_wait_release_all_owned_keys(self):
        for failure in ['down', 'wait']:
            page = NativePort()
            if failure == 'down': page.fail_down = 'ArrowLeft'
            else: page.fail_wait = True
            with self.assertRaises(RuntimeError):
                native_pulse(page, ['a', 'ArrowLeft'], 50)
            self.assertFalse(page.keyboard.held)
            self.assertIn(('up', 'a'), page.keyboard.events)
            self.assertIn(('up', 'ArrowLeft'), page.keyboard.events)

    def test_release_error_still_releases_other_key(self):
        page = NativePort(); page.fail_up = 'ArrowLeft'
        with self.assertRaisesRegex(RuntimeError, 'key-up'):
            native_pulse(page, ['a', 'ArrowLeft'], 50)
        self.assertFalse(page.keyboard.held)

    def test_invalid_target_and_already_reached_are_not_movement(self):
        page = NativePort(x=.03)
        self.assertAlmostEqual(page.run()['players'][0]['x'], .03)
        for axis, target in [('y', 0), ('x', math.inf), ('z', math.nan)]:
            with self.assertRaises(ValueError): page.run(axis, target)
        self.assertEqual(page.keyboard.events, [])

    def test_driver_retains_original_route_goals_and_final_assertions(self):
        source = Path(__file__).with_name('cpu_renderer_browser.py').read_text()
        for text in ["s.chapter==='home'&&!s.prologue.transition", "move(page, 'x', 0)",
                     "move(page, 'z', -4.2)", "move(page, 'z', 5.1)", "move(page, 'x', 2)",
                     "import_save(page, saved, OUT)", "case['status'] = 'passed'", "60 <= f['samples'] <= 120"]:
            self.assertIn(text, source)
        helper = Path(__file__).with_name('cpu_native_route.py').read_text()
        ast.parse(source); ast.parse(helper)
        for text in ['dispatchEvent', 'dispatch_event', 'add_init_script', 'set_input_files', 'clock.install']:
            self.assertNotIn(text, helper)
