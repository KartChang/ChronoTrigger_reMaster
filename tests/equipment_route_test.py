"""Unit doubles for route diagnostics only; no browser/device acceptance."""
import copy
import unittest
from unittest.mock import patch
from equipment_route import ROUTE, walk_equipment_route


class Page:
    def __init__(self):
        self.ui = dict(focused='world', paused=False, dialogOpen=False,
                       inventoryOpen=False, hint='', hintHidden=True)
        self.state = dict(chapter='fair', mode='explore', joined=False, ticks=10,
                          prologue={'stage': 'companions'}, players=[{'x': -3.6, 'z': -2.0}])

    def evaluate(self, expression):
        return copy.deepcopy(self.ui)


def snapshot(page):
    return copy.deepcopy(page.state)


class EquipmentRouteTests(unittest.TestCase):
    def setUp(self):
        self.page, self.evidence, self.calls = Page(), [], []

    def move(self, page, axis, target):
        self.calls.append((axis, target))
        page.state['players'][0][axis] = target
        page.state['ticks'] += 1

    def route(self, name='to-canopy', move=None):
        return walk_equipment_route(self.page, move or self.move, snapshot, self.evidence, name)

    def test_shared_waypoints_and_after_release_are_retained_without_changing_snapshot(self):
        trace = self.route()
        self.assertEqual(trace['status'], 'reached')
        self.assertEqual(self.calls, [(w['axis'], w['target']) for w in ROUTE['routes']['to-canopy']])
        self.assertEqual(trace['before']['players'][0], {'x': -3.6, 'z': -2.0})
        self.assertEqual(len(trace['legs']), 3)
        self.assertTrue(all('afterRelease' in leg and 'inputAfter' in leg for leg in trace['legs']))
        self.assertFalse(trace['physicalDevice']); self.assertFalse(trace['artApproved'])

    def test_merchant_turns_south_in_centre_before_crossing_fair(self):
        self.route(); trace = self.route('to-merchant')
        self.assertEqual(self.calls[-3:], [('x', 0), ('z', -5.8), ('x', 7)])
        self.assertLess(trace['distance'], ROUTE['merchant']['radius'])

    def test_unknown_route_never_calls_driver(self):
        with self.assertRaisesRegex(ValueError, 'Unknown'):
            self.route('shortcut')
        self.assertEqual(self.calls, []); self.assertEqual(self.evidence, [])

    def test_invalid_initial_context_never_sends_movement(self):
        changes = [('chapter', 'lab'), ('mode', 'battle'), ('joined', True), ('ticks', float('nan'))]
        for key, value in changes:
            with self.subTest(key=key):
                self.setUp(); self.page.state[key] = value
                with self.assertRaises(AssertionError): self.route()
                self.assertEqual(self.calls, []); self.assertEqual(self.evidence[0]['status'], 'failed')
        self.setUp(); self.page.state['prologue']['stage'] = 'collision'
        with self.assertRaises(AssertionError): self.route()
        self.assertEqual(self.calls, [])

    def test_modal_or_lost_focus_stops_before_first_key(self):
        for key, value in [('paused', True), ('dialogOpen', True), ('inventoryOpen', True), ('focused', 'save-file')]:
            with self.subTest(key=key):
                self.setUp(); self.page.ui[key] = value
                with self.assertRaises(AssertionError): self.route()
                self.assertEqual(self.calls, [])

    def test_out_of_aisle_after_keyup_does_not_start_next_leg(self):
        def overshot(page, axis, target):
            self.move(page, axis, target); page.state['players'][0][axis] = -4.3
        with self.assertRaises(AssertionError): self.route(move=overshot)
        self.assertEqual(len(self.calls), 1)
        self.assertEqual(self.evidence[0]['legs'][0]['afterRelease']['players'][0]['z'], -4.3)
        self.assertEqual(self.evidence[0]['status'], 'failed')

    def test_driver_failure_is_original_and_retains_post_release_diagnostics(self):
        original = RuntimeError('original movement budget exhausted')
        def failed(page, axis, target):
            self.move(page, axis, target); raise original
        with self.assertRaises(RuntimeError) as raised: self.route(move=failed)
        self.assertIs(raised.exception, original)
        self.assertEqual(len(self.calls), 1)
        self.assertIn('afterRelease', self.evidence[0]['legs'][0])

    def test_diagnostic_error_does_not_replace_movement_failure(self):
        original = RuntimeError('original movement failure')
        def failed(page, axis, target):
            self.move(page, axis, target)
            page.evaluate = lambda expression: (_ for _ in ()).throw(ValueError('lost page'))
            raise original
        with self.assertRaises(RuntimeError) as raised: self.route(move=failed)
        self.assertIs(raised.exception, original)
        self.assertIn('captureError', self.evidence[0]['legs'][0])

    def test_context_change_after_keyup_stops_next_leg(self):
        for change in ['focus', 'clock', 'stage', 'joined', 'coordinate']:
            with self.subTest(change=change):
                self.setUp()
                def changed(page, axis, target):
                    self.move(page, axis, target)
                    if change == 'focus': page.ui['focused'] = 'import'
                    elif change == 'clock': page.state['ticks'] = 0
                    elif change == 'stage': page.state['prologue']['stage'] = 'fair'
                    elif change == 'joined': page.state['joined'] = True
                    else: page.state['players'][0]['x'] = float('nan')
                with self.assertRaises(AssertionError): self.route(move=changed)
                self.assertEqual(len(self.calls), 1)

    def test_in_band_endpoint_still_needs_real_merchant_distance(self):
        self.route()
        def far_corner(page, axis, target):
            self.move(page, axis, target)
            if axis == 'x' and target == 7:
                page.state['players'][0] = {'x': 8.6, 'z': -7.4}
        with patch.dict(ROUTE, merchant={**ROUTE['merchant'], 'radius': 1.0}):
            with self.assertRaises(AssertionError): self.route('to-merchant', far_corner)
        self.assertEqual(self.evidence[-1]['status'], 'failed')
        self.assertGreater(self.evidence[-1]['distance'], 1.0)


if __name__ == '__main__':
    unittest.main()
