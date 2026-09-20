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

class QuietGeometry(unittest.TestCase):
    def quiet(self):
        m = fixture(); m['hint']['visible'] = False
        return m

    def test_quiet_retains_named_action_and_44px_button_without_duplicate(self):
        from early_comfort import assert_quiet_geometry
        assert_quiet_geometry(self.quiet())

    def test_hidden_action_duplicate_small_clipped_or_wrong_action_fails(self):
        from early_comfort import assert_quiet_geometry
        changes = [lambda m: m['hint'].update(visible=True), lambda m: m['button'].update(visible=False),
                   lambda m: m['button'].update(font=15), lambda m: m['button']['rect'].update(height=43),
                   lambda m: m['button']['rect'].update(x=-1), lambda m: m['button']['rect'].update(right=400),
                   lambda m: m['note']['rect'].update(bottom=760), lambda m: m.update(label='互動')]
        for change in changes:
            m = self.quiet(); change(m)
            with self.assertRaises(AssertionError): assert_quiet_geometry(m)

    def test_css_only_suppresses_duplicate_for_quiet_first_contact_exploration(self):
        from pathlib import Path
        css = (Path(__file__).parents[1]/'src/adventure.css').read_text()
        selector = 'body[data-adventure="true"][data-early-meeting="true"][data-hud="quiet"][data-mode="explore"] #interact-hint'
        self.assertIn(selector+'{display:none}', css)
        self.assertNotIn(selector.replace('[data-hud="quiet"]', '[data-hud="guide"]')+'{display:none}', css)

    def test_full_guide_original_checker_still_rejects_missing_hint(self):
        with self.assertRaises(AssertionError): assert_geometry(self.quiet())
