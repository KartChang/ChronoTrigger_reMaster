"""Unit-only regression models for CPU native-driver readback overhead.

These models do not operate a browser or constitute native acceptance evidence.
"""
import math
import unittest
from cpu_native_route import move_axis
from cpu_native_route_test import NativePort


# Derived ONLY as a regression port model from CI49's 29 native pulse records.
# Source 8c9f8a26, run 35641527652, artifact 10659285772. These tick-cost
# pairs are not a browser replay, native success evidence, or a game/save fixture.
CI49_COSTS = [(0, 5), (0, 6), (0, 5), (0, 5), (0, 4), (0, 6), (2, 4), (1, 4), (1, 4), (1, 4), (0, 5), (1, 4), (0, 5), (1, 4), (0, 5), (0, 6), (0, 5), (1, 4), (1, 4), (1, 4), (1, 4), (0, 5), (1, 4), (1, 4), (1, 4), (1, 4), (1, 4), (1, 5), (1, 4)]


class ReadbackCostPort(NativePort):
    """Charge unheld observation ticks missing from the original test port."""
    def __init__(self, *args, costs=CI49_COSTS, **kwargs):
        super().__init__(*args, **kwargs)
        self.costs = costs
        self.cycles = 0
        self.release_ticks, self.read_ticks = costs[0]

    def evaluate(self, expression):
        assert not self.keyboard.held
        if self.evaluations:
            self.step(self.read_ticks)
            self.cycles += 1
            self.release_ticks, self.read_ticks = self.costs[self.cycles % len(self.costs)]
        return super().evaluate(expression)


class NativeRouteReadbackCostTests(unittest.TestCase):
    def test_ci49_overworld_observation_cost_stays_in_original_budget(self):
        page = ReadbackCostPort(x=.04, z=-2.7, chapter='overworld1000')
        trace = []
        final = page.run('z', 5.1, trace=trace)
        self.assertEqual(trace[0]['budget'], 315)
        self.assertLessEqual(final['ticks'], 315)
        self.assertLess(abs(final['players'][0]['z']-5.1), .12)
        self.assertFalse(page.keyboard.held)
        self.assertEqual(trace[0]['status'], 'arrived')

    def test_long_legs_with_readback_cost_keep_speed_and_budget(self):
        for chapter in ['bedroom', 'overworld1000']:
            for idle in [3, 5, 7]:
                for axis in ['x', 'z']:
                    for sign in [-1, 1]:
                        with self.subTest(chapter=chapter, idle=idle, axis=axis, sign=sign):
                            page = ReadbackCostPort(x=0, z=0, chapter=chapter, costs=[(1, idle)])
                            trace = []
                            final = page.run(axis, sign*7.8, trace=trace)
                            speed = 2.4 if chapter == 'overworld1000' else 4
                            self.assertEqual(trace[0]['budget'], math.ceil((7.8/speed+2)*60))
                            self.assertLessEqual(final['ticks'], trace[0]['budget'])
                            self.assertLess(abs(final['players'][0][axis]-sign*7.8), .12)
                            self.assertFalse(page.keyboard.held)

    def test_readback_cost_is_not_subtracted_from_elapsed_budget(self):
        page = ReadbackCostPort(x=0, z=0, costs=[(1, 150)])
        trace = []
        with self.assertRaisesRegex(AssertionError, 'boundary/budget'):
            page.run('x', 1, trace=trace)
        self.assertEqual(trace[0]['budget'], 135)
        self.assertEqual(trace[0]['status'], 'failed')
        self.assertFalse(page.keyboard.held)

    def test_tolerance_cannot_override_an_exhausted_budget(self):
        page = ReadbackCostPort(x=0, z=0, costs=[(0, 150)])
        trace = []
        with self.assertRaisesRegex(AssertionError, 'boundary/budget'):
            page.run('x', .2, trace=trace)
        self.assertLess(abs(page.state['players'][0]['x']-.2), .12)
        self.assertGreater(page.state['ticks'], trace[0]['budget'])
        self.assertEqual(trace[0]['status'], 'failed')

    def test_observation_cost_does_not_reset_wall_deadline(self):
        page = ReadbackCostPort(x=0, z=0, costs=[(1, 3)])
        trace = []
        calls = [0]
        def clock():
            calls[0] += 1
            return calls[0]*8
        with self.assertRaisesRegex(AssertionError, 'boundary/budget'):
            move_axis(page, 'x', 7.8, evidence=trace, clock=clock)
        self.assertEqual(trace[0]['timeoutMs'], 30000)
        self.assertFalse(page.keyboard.held)

    def test_coop_readback_cost_still_releases_both_native_owners(self):
        page = ReadbackCostPort(x=0, z=0, costs=[(1, 5)])
        trace = []
        final = page.run('z', 7.8, coop=True, trace=trace)
        self.assertLess(abs(final['players'][0]['z']-7.8), .12)
        self.assertLessEqual(final['ticks'], trace[0]['budget'])
        self.assertGreater(final['players'][1]['z'], 0)
        self.assertFalse(page.keyboard.held)

    def test_blocked_costed_port_never_fabricates_arrival(self):
        page = ReadbackCostPort(x=0, z=0, costs=[(1, 5)])
        page.blocked = True
        trace = []
        with self.assertRaisesRegex(AssertionError, 'boundary/budget'):
            page.run('z', 7.8, trace=trace)
        self.assertEqual(page.state['players'][0]['z'], 0)
        self.assertEqual(trace[0]['status'], 'failed')
        self.assertFalse(page.keyboard.held)

    def test_long_coarse_pulses_shorten_at_released_target(self):
        page = ReadbackCostPort(x=.04, z=-2.7, chapter='overworld1000')
        trace = []
        page.run('z', 5.1, trace=trace)
        holds = [p['holdMs'] for p in trace[0]['pulses']]
        self.assertEqual(trace[0]['policy'], 'vq02h-distance-scaled-native-pulses')
        self.assertEqual(trace[0]['maxHoldMs'], 250)
        self.assertTrue(all(0 <= ms <= 250 for ms in holds))
        self.assertGreater(max(holds), 100)
        self.assertLess(holds[-1], max(holds))
        self.assertLess(len(holds), len(CI49_COSTS))
        self.assertLess(abs(trace[0]['afterRelease']['state']['players'][0]['z']-5.1), .12)
