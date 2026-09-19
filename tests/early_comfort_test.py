"""Synthetic geometry tests validate assertions, not a real viewport or screenshot."""
import copy
import unittest
from early_comfort import assert_geometry


def fixture():
    element = lambda y, h: {'visible': True, 'font': 16, 'text': 'E · 查看女孩',
                           'rect': dict(x=10, y=y, width=300, height=h, right=310, bottom=y+h)}
    return dict(width=390, height=844, early='true', source='actual-page-DOM',
                label='查看女孩', hint=element(620,48), button=element(710,44), note=element(120,24))


class Geometry(unittest.TestCase):
    def test_valid_bounds(self):
        assert_geometry(fixture())

    def test_small_clipped_overlapping_or_wrong_labels_fail(self):
        cases = [lambda m: m['hint'].update(font=15), lambda m: m['button']['rect'].update(height=43),
                 lambda m: m['hint']['rect'].update(right=410), lambda m: m['hint']['rect'].update(x=-1),
                 lambda m: m['hint']['rect'].update(bottom=750), lambda m: m['note']['rect'].update(bottom=700),
                 lambda m: m.update(label='買東西'), lambda m: m.update(early='false'),
                 lambda m: m['hint'].update(visible=False)]
        for change in cases:
            m = copy.deepcopy(fixture()); change(m)
            with self.assertRaises(AssertionError):
                assert_geometry(m)
