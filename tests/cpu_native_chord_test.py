"""Unit-only transport-cost regressions; no browser or successful save fixtures.

CI50's ten released-position records give outer/inner movement-equivalent
costs and six unheld ticks per pulse. The split between individual native
calls below is a MODEL, not a measured browser-internal event timestamp.
"""
from copy import deepcopy
import math
from pathlib import Path
import unittest

import cpu_native_route as route
from cpu_native_route_test import NativePort

# (extra outer-key movement, extra inner-key movement, unheld elapsed ticks).
# Derived from CI50 35669876213, artifact10671110608, source840ffe01882c:
# movement / (4/60) minus ceil(requested hold ms * 60/1000).
CI50_CHORD_COSTS = [(5, 1, 6), (7, 1, 6), (8, 2, 6), (9, 3, 6),
                    (8, 1, 6), (8, 2, 6), (7, 1, 6), (9, 3, 6),
                    (6, 1, 6), (9, 3, 6)]


class TransportKeyboard:
    def __init__(self, page):
        self.page = page
        self.held = set()
        self.events = []
        self.order = []

    def down(self, key):
        outer, inner, idle = self.page.cost()
        self.events.append(('down', key))
        # A pending native call consumes ticks before its event is delivered.
        self.page.step((outer-inner)//2 if self.held else idle//2)
        self.held.add(key)
        self.order.append(key)
        if key == self.page.fail_down:
            raise RuntimeError('native key-down error')

    def up(self, key):
        outer, inner, _ = self.page.cost()
        self.events.append(('up', key))
        if key in self.held:
            # Release inner first, then outer, as native_pulse's finally does.
            delay = inner if key == self.order[-1] and len(self.order) == 2 else outer-inner-(outer-inner)//2
            self.page.step(delay)
            self.held.discard(key)
        if key == self.page.fail_up:
            raise RuntimeError('native key-up error')


class ChordCostPort(NativePort):
    def __init__(self, *args, costs=CI50_CHORD_COSTS, **kwargs):
        super().__init__(*args, **kwargs)
        self.costs = costs
        self.cycles = 0
        self.keyboard = TransportKeyboard(self)

    def cost(self):
        return self.costs[self.cycles % len(self.costs)]

    def evaluate(self, expression):
        assert not self.keyboard.held
        if self.evaluations:
            idle = self.cost()[2]
            self.step(idle-idle//2)
            self.cycles += 1
            self.keyboard.order = []
        return super().evaluate(expression)


class NativeChordTests(unittest.TestCase):
    def test_ci50_coop_primary_arrives_with_original_165_ticks(self):
        page = ChordCostPort(x=0, z=-5, chapter='fair')
        trace = []
        final = page.run('z', -2, coop=True, trace=trace)
        self.assertEqual(trace[0]['budget'], 165)
        self.assertEqual(trace[0]['timeoutMs'], 30000)
        self.assertLessEqual(final['ticks'], 165)
        self.assertLess(abs(final['players'][0]['z']+2), .12)
        self.assertGreater(final['players'][1]['z'], -5)
        self.assertFalse(page.keyboard.held)
        self.assertEqual(trace[0]['status'], 'arrived')

    def test_old_chord_order_reproduces_ci50_oscillation(self):
        page = ChordCostPort(x=0, z=-5, chapter='fair')
        trace = []
        # Reproduce the old native chord's ten RECORDED requested pulses in
        # the port, rather than adding a legacy switch to production movement.
        before = page.evaluate(route.OBSERVATION)
        holds = [250, 250, 0, 0, 17, 0, 17, 0, 17, 0]
        for index, hold in enumerate(holds):
            positive = index < 3 or index % 2 == 0
            keys = ['w', 'ArrowUp'] if positive else ['s', 'ArrowDown']
            route.native_pulse(page, keys, hold)
            trace.append(page.evaluate(route.OBSERVATION))
        self.assertEqual(before['state']['ticks'], 0)
        self.assertGreater(page.state['ticks'], 165)
        self.assertEqual(page.state['ticks'], 172)
        self.assertEqual(len(trace), 10)
        self.assertAlmostEqual(page.state['players'][0]['z'], -2.2)
        self.assertAlmostEqual(page.state['players'][1]['z'], -2.8666666666666667)
        self.assertFalse(page.keyboard.held)

    def test_precision_primary_is_inner_and_coarse_order_is_retained(self):
        for axis in ['x', 'z']:
            for sign in [-1, 1]:
                with self.subTest(axis=axis, sign=sign):
                    page = ChordCostPort(x=0, z=0, chapter='fair')
                    trace = []
                    page.run(axis, sign*3, coop=True, trace=trace)
                    orders = [p['chordOrder'] for p in trace[0]['pulses']]
                    self.assertIn('primary-inner', orders)
                    self.assertIn('primary-outer', orders)
                    first_inner = orders.index('primary-inner')
                    self.assertTrue(all(o == 'primary-inner' for o in orders[first_inner:]))
                    for pulse in trace[0]['pulses']:
                        inner = pulse['chordOrder'] == 'primary-inner'
                        self.assertEqual(pulse['keys'][0].startswith('Arrow'), inner)
                        self.assertEqual(pulse['keys'][1].startswith('Arrow'), not inner)
                        self.assertEqual(pulse['releaseKeys'], list(reversed(pulse['keys'])))
                    events = page.keyboard.events
                    for i in range(0, len(events), 4):
                        outer, inner = events[i:i+2]
                        self.assertEqual(events[i+2:i+4], [('up', inner[1]), ('up', outer[1])])
                    self.assertEqual(trace[0]['arrivalOwner'], 0)
                    self.assertEqual(trace[0]['chordPolicy'], 'vq02i-coarse-preserving-precision-chord')

    def test_costed_directions_and_long_legs_keep_original_budgets(self):
        # 48 combinations, not 48 physical-device or native-browser results.
        for chapter in ['fair', 'overworld1000']:
            for costs in [[(5, 1, 6)], [(8, 2, 6)], [(9, 3, 6)]]:
                for axis in ['x', 'z']:
                    for sign in [-1, 1]:
                        for distance in [3, 7.8]:
                            with self.subTest(chapter=chapter, costs=costs, axis=axis, sign=sign, distance=distance):
                                page = ChordCostPort(x=0, z=0, chapter=chapter, costs=costs)
                                trace = []
                                final = page.run(axis, sign*distance, coop=True, trace=trace)
                                speed = 2.4 if chapter == 'overworld1000' else 4
                                self.assertEqual(trace[0]['budget'], math.ceil((distance/speed+2)*60))
                                self.assertLessEqual(final['ticks'], trace[0]['budget'])
                                self.assertLess(abs(final['players'][0][axis]-sign*distance), .12)
                                self.assertGreater(sign*final['players'][1][axis], 0)
                                self.assertFalse(page.keyboard.held)

    def test_original_fair_route_sequence_keeps_both_owners_released(self):
        page = ChordCostPort(x=0, z=-5, chapter='fair')
        page.state['players'][1]['x'] = 1.9333333333333331
        # Unit port executes original coordinates; not a new game/save fixture.
        for axis, target in [('z', -2), ('x', -6.8), ('z', 2.5), ('z', -2)]:
            trace = []
            final = page.run(axis, target, coop=True, trace=trace)
            self.assertLess(abs(final['players'][0][axis]-target), .12)
            self.assertLessEqual(final['ticks']-trace[0]['before']['state']['ticks'], trace[0]['budget'])
            self.assertFalse(page.keyboard.held)

    def test_every_native_error_releases_all_attempted_keys(self):
        for target in [-2, -4.5]:  # initial coarse chord AND precision chord
            for stage, key in [('down', 'ArrowUp'), ('down', 'w'), ('up', 'w'), ('up', 'ArrowUp'), ('wait', None)]:
                with self.subTest(target=target, stage=stage, key=key):
                    page = ChordCostPort(x=0, z=-5, chapter='fair')
                    setattr(page, 'fail_'+stage, True if stage == 'wait' else key)
                    trace = []
                    with self.assertRaisesRegex(RuntimeError, 'native'):
                        page.run('z', target, coop=True, trace=trace)
                    downs = [k for event, k in page.keyboard.events if event == 'down']
                    ups = [k for event, k in page.keyboard.events if event == 'up']
                    self.assertEqual(sorted(ups), sorted(downs))
                    self.assertFalse(page.keyboard.held)
                    self.assertEqual(trace[0]['status'], 'failed')

    def test_single_player_pulse_still_never_touches_second_owner(self):
        page = NativePort()
        other = deepcopy(page.state['players'][1])
        trace = []
        page.run('x', 0, trace=trace)
        self.assertEqual(page.state['players'][1], other)
        self.assertTrue(all(len(p['keys']) == 1 for p in trace[0]['pulses']))
        self.assertFalse(any(key.startswith('Arrow') for _, key in page.keyboard.events))

    def test_overbudget_near_target_and_blocked_chord_still_fail(self):
        for blocked in [False, True]:
            with self.subTest(blocked=blocked):
                page = ChordCostPort(x=0, z=0, chapter='fair', costs=[(5, 1, 180)])
                page.blocked = blocked
                trace = []
                with self.assertRaisesRegex(AssertionError, 'boundary/budget'):
                    page.run('z', .2, coop=True, trace=trace)
                self.assertGreater(page.state['ticks'], trace[0]['budget'])
                self.assertEqual(trace[0]['status'], 'failed')
                self.assertFalse(page.keyboard.held)
                if not blocked:
                    self.assertLess(abs(page.state['players'][0]['z']-.2), .12)

    def test_boundary_pause_transition_and_single_deadline_remain_failures(self):
        for boundary in ['paused', 'transition', 'deadline']:
            with self.subTest(boundary=boundary):
                page = ChordCostPort(x=0, z=-5, chapter='fair')
                trace = []
                if boundary == 'paused': page.paused = True
                if boundary == 'transition': page.change_chapter_at = 1
                ticks = [0]
                def clock():
                    ticks[0] += 16
                    return ticks[0]
                with self.assertRaisesRegex(AssertionError, 'boundary/budget'):
                    if boundary == 'deadline':
                        route.move_axis(page, 'z', -2, True, trace, clock=clock)
                    else:
                        page.run('z', -2, coop=True, trace=trace)
                self.assertFalse(page.keyboard.held)
                self.assertEqual(trace[0]['timeoutMs'], 30000)

    def test_source_retains_all_original_fair_and_save_assertions(self):
        driver = Path(__file__).with_name('cpu_renderer_browser.py').read_text()
        for text in ["move(page, 'z', -2, True)", "move(page, 'x', -6.8, True)",
                     "move(page, 'z', 2.5, True)", "assert snap(page)['enemies'][0]['hp'] == 90",
                     "assert json.loads(data)['version'] == 2", "assert snap(page) == frozen",
                     "import_save(page, saved, OUT)", "60 <= f['samples'] <= 120"]:
            self.assertIn(text, driver)
