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


class ToolbarGeometry(unittest.TestCase):
    def sample(self):
        return dict(source='actual-DOM-hit-testing',width=390,height=844,
            note=dict(visible=True,pointerEvents='none',inToolbar=True,rect=dict(x=18,y=141,right=259,bottom=170)),
            bands=[dict(bottom=52),dict(bottom=132.25)],
            controls=[dict(id='display',rect=dict(x=20,y=100,right=90,bottom=130,width=70,height=30),hits=[dict(inside=True,top='display') for _ in range(9)])])

    def test_uncovered_wrapped_toolbar(self):
        from early_comfort import assert_toolbar
        assert_toolbar(self.sample())

    def test_historical_108px_notice_and_intercepted_display_are_rejected(self):
        from early_comfort import assert_toolbar
        for change in [lambda m:m['note']['rect'].update(y=108),
                       lambda m:m['controls'][0]['hits'][4].update(inside=False,top='story-coop-note'),
                       lambda m:m['note'].update(pointerEvents='auto'),
                       lambda m:m['controls'][0]['rect'].update(right=450)]:
            m=self.sample();change(m)
            with self.assertRaises(AssertionError):assert_toolbar(m)

    def test_pass_through_is_not_enough_if_notice_still_visually_overlaps(self):
        from early_comfort import assert_toolbar
        m=self.sample();m['note']['rect']['y']=120
        with self.assertRaises(AssertionError):assert_toolbar(m)

    def test_notice_flow_and_template_integration_remain_passive(self):
        from pathlib import Path
        r=Path(__file__).parents[1];css=(r/'src/hud-notice.css').read_text();html=(r/'index.html').read_text()
        self.assertIn('.story-coop-note{pointer-events:none}',css)
        self.assertIn('.utility>.story-coop-note{position:static;flex:1 0 100%;order:1;',css)
        nav=html.split('<nav ',1)[1].split('</nav>',1)[0]
        self.assertIn('id="story-coop-note"',nav)
        self.assertGreater(nav.index('id="story-coop-note"'),nav.index('id="display"'))
        self.assertEqual(html.count('id="story-coop-note"'),1)

    def test_ci31_quiet_header_overlap_is_rejected_even_when_every_hit_passes(self):
        # Focused regression using CI31 coordinates; this is NOT a fresh browser observation.
        from early_comfort import assert_toolbar
        m = self.sample(); m.update(width=1365, height=900)
        m['note']['rect'].update(x=704.3125, y=54, right=1269, bottom=83)
        m['bands'] = [dict(bottom=64), dict(bottom=48)]
        c = m['controls'][0]
        c['rect'] = dict(x=992.3125, y=16, right=1026.3125, bottom=48, width=34, height=32)
        self.assertTrue(all(h['inside'] for h in c['hits']))
        with self.assertRaises(AssertionError):
            assert_toolbar(m)

    def test_header_clearance_boundary_is_preserved(self):
        from early_comfort import assert_toolbar
        for header_bottom in (52, 64, 100):
            m = self.sample(); m['bands'] = [dict(bottom=header_bottom), dict(bottom=48)]
            m['note']['rect']['y'] = header_bottom + 3
            assert_toolbar(m)
            m['note']['rect']['y'] -= .01
            with self.assertRaises(AssertionError):
                assert_toolbar(m)

    def test_header_drives_notice_container_only_during_first_contact(self):
        from pathlib import Path
        from html.parser import HTMLParser
        class Parents(HTMLParser):
            def __init__(self):
                super().__init__(); self.stack = []; self.parents = {}; self.ids = []
            def handle_starttag(self, tag, attrs):
                a = dict(attrs); key = a.get('id') or a.get('class') or tag
                if key in ('header', 'utility glass', 'story-coop-note'):
                    self.parents[key] = self.stack[-1] if self.stack else None
                if 'id' in a: self.ids.append(a['id'])
                if tag not in ('meta', 'link', 'br', 'input', 'img', 'hr'):
                    self.stack.append(key)
            def handle_endtag(self, tag):
                if self.stack: self.stack.pop()
        root = Path(__file__).parents[1]
        parser = Parents(); parser.feed((root/'index.html').read_text())
        self.assertEqual(parser.parents['header'], 'hud-toolbar')
        self.assertEqual(parser.parents['utility glass'], 'hud-toolbar')
        self.assertEqual(parser.parents['story-coop-note'], 'utility glass')
        self.assertEqual(len(parser.ids), len(set(parser.ids)))
        css = (root/'src/hud-notice.css').read_text()
        scope = 'body[data-adventure="true"][data-started="true"][data-early-meeting="true"] '
        self.assertIn(scope+'.hud-toolbar{position:absolute;top:0;left:0;right:0;pointer-events:none}', css)
        self.assertIn(scope+'.hud-toolbar>header{position:relative}', css)
        self.assertIn(scope+'.hud-toolbar>.utility{top:calc(100% + 4px);pointer-events:auto}', css)


class FailureCapture(unittest.TestCase):
    def test_original_viewport_and_last_measurement_are_retained(self):
        from pathlib import Path
        from unittest.mock import Mock
        from early_comfort import capture_comfort_failure, TOOLBAR_METRICS
        page = Mock(); page.viewport_size = dict(width=390, height=844)
        page.evaluate.return_value = {'source': 'synthetic-unit-test-only'}
        report = {'toolbarChecks': [{'phase': 'portrait-before-guide'}]}
        capture_comfort_failure(page, report, Path('/unit-only'), '05')
        self.assertEqual(report['lastMeasuredPhase'], 'portrait-before-guide')
        self.assertEqual(report['failureCapture']['viewport'], page.viewport_size)
        self.assertFalse(report['failureCapture']['physicalDevice'])
        page.evaluate.assert_called_once_with(TOOLBAR_METRICS)
        page.screenshot.assert_called_once_with(path='/unit-only/05-comfort-failure.png')

    def test_capture_errors_do_not_replace_the_original_failure(self):
        from pathlib import Path
        from unittest.mock import Mock
        from early_comfort import capture_comfort_failure
        page = Mock(); page.viewport_size = dict(width=1365, height=900)
        page.evaluate.side_effect = RuntimeError('measurement unavailable')
        page.screenshot.side_effect = RuntimeError('screenshot unavailable')
        report = {'toolbarChecks': [], 'failure': 'original-clearance-root'}
        capture_comfort_failure(page, report, Path('/unit-only'), '05')
        self.assertEqual(report['failure'], 'original-clearance-root')
        self.assertIn('measurement unavailable', report['failureCapture']['measurementError'])
        self.assertIn('screenshot unavailable', report['failureCapture']['screenshotError'])
        self.assertNotIn('screenshot', report['failureCapture'])

    def test_capture_precedes_cleanup_and_existing_report_write(self):
        import inspect
        from early_comfort import record_early_comfort
        source = inspect.getsource(record_early_comfort)
        self.assertLess(source.index('capture_comfort_failure('), source.index('finally:'))
        self.assertLess(source.index('finally:'), source.index('page.set_viewport_size(original)'))
        self.assertLess(source.index('write_text('), source.index('page.set_viewport_size(original)'))
