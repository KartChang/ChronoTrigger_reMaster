"""Synthetic negatives and wiring only; the real DOM runs exclusively in the CI journeys."""
import copy
import inspect
import unittest
from html.parser import HTMLParser
from pathlib import Path
from unittest.mock import Mock
from exploration_hud import assert_dock,record_dock_views,READ_DOCK

ROOT=Path(__file__).parents[1]
def rect(x,y,w,h):return dict(x=x,y=y,width=w,height=h,right=x+w,bottom=y+h)
def sample():
    positions={'interact':rect(80,640,180,44),'p0-name':rect(10,690,70,20),'p1-name':rect(210,690,70,20),
       'control-hint':rect(10,720,370,32),'fps':rect(280,760,100,12),'interact-hint':rect(80,590,180,36),'guest-panel':rect(10,560,120,24)}
    return dict(source='actual-exploration-DOM',gameMode='explore',width=390,height=844,mode='guide',passive='none',dock=rect(10,550,370,222),
        physicalDevice=False,artApproved=False,hits=[dict(inside=True,top='interact') for _ in range(9)],
        items=[dict(id=k,visible=True,text=k,font=16 if k=='interact' else 14,rect=v,textRects=[v.copy()]) for k,v in positions.items()])
def item(m,id):return next(i for i in m['items'] if i['id']==id)

class DockGeometry(unittest.TestCase):
    def test_valid_flow_with_and_without_optional_names_and_hint(self):
        m=sample();assert_dock(m)
        for k in ['p0-name','p1-name','interact-hint','guest-panel']:item(m,k)['visible']=False
        assert_dock(m)
    def test_historical_footer_hint_overlapping_name_is_rejected(self):
        m=sample();v=item(m,'control-hint');v['rect']=rect(10,694,370,32);v['textRects']=[v['rect'].copy()]
        with self.assertRaises(AssertionError):assert_dock(m)
    def test_finite_and_viewport_bounds_are_required(self):
        for change in [lambda m:item(m,'interact')['rect'].update(x=-2),lambda m:item(m,'fps')['rect'].update(right=400),lambda m:m['dock'].update(y=-5),lambda m:item(m,'p0-name')['rect'].update(bottom=float('nan'))]:
            m=sample();change(m)
            with self.assertRaises(AssertionError):assert_dock(m)
    def test_clipped_text_is_not_accepted_just_because_element_fits(self):
        for coordinate,value in [('right',600),('bottom',900),('x',-10)]:
            m=sample();item(m,'control-hint')['textRects'][0][coordinate]=value
            with self.assertRaises(AssertionError):assert_dock(m)
    def test_native_button_size_and_all_nine_hits_are_required(self):
        for change in [lambda m:item(m,'interact')['rect'].update(height=43),lambda m:item(m,'interact').update(font=15),lambda m:m['hits'][4].update(inside=False,top='control-hint'),lambda m:m.update(hits=[]),lambda m:m.update(passive='auto')]:
            m=sample();change(m)
            with self.assertRaises(AssertionError):assert_dock(m)
    def test_hidden_or_empty_primary_information_is_rejected(self):
        for k in ('interact','control-hint','fps'):
            for field,value in [('visible',False),('text','')]:
                m=sample();item(m,k)[field]=value
                with self.assertRaises(AssertionError):assert_dock(m)
    def test_one_pixel_precision_is_not_permission_for_visual_overlap(self):
        m=sample();item(m,'fps')['rect']=rect(280,752,100,12);item(m,'fps')['textRects']=[rect(280,752,100,12)];assert_dock(m)
        item(m,'fps')['rect']=rect(280,750,100,12);item(m,'fps')['textRects']=[rect(280,750,100,12)]
        with self.assertRaises(AssertionError):assert_dock(m)
    def test_synthetic_device_or_wrong_mode_cannot_pass(self):
        for change in [lambda m:m.update(source='unit-only'),lambda m:m.update(physicalDevice=True),lambda m:m.update(artApproved=True),lambda m:m.update(gameMode='battle')]:
            m=sample();change(m)
            with self.assertRaises(AssertionError):assert_dock(m)

class Wiring(unittest.TestCase):
    def test_unique_original_controls_in_one_dock_with_touch_outside(self):
        class Parser(HTMLParser):
            def __init__(self):super().__init__();self.stack=[];self.ids=[];self.parents={}
            def handle_starttag(self,tag,attrs):
                a=dict(attrs);key=a.get('id',tag)
                if 'id' in a:self.ids.append(key);self.parents[key]=list(self.stack)
                if tag not in ('meta','link','input','img','br','hr'):self.stack.append(key)
            def handle_endtag(self,tag):
                if self.stack:self.stack.pop()
        p=Parser();p.feed((ROOT/'index.html').read_text())
        self.assertEqual(len(p.ids),len(set(p.ids)))
        for id in ('party','control-hint','guest-panel','interact-hint','fps','interact'):self.assertIn('exploration-dock',p.parents[id])
        for id in ('world','touch','inventory-screen','pause-screen','dialog','message'):self.assertNotIn('exploration-dock',p.parents[id])
        self.assertIn('party',p.parents['interact'])
    def test_presentation_measurement_preserves_battle_rule_and_has_no_state_write(self):
        s=(ROOT/'src/main.ts').read_text();function=s.split('function layoutFeedback():void{',1)[1].split('\n}',1)[0]
        self.assertIn("if(state.mode==='explore')",function)
        self.assertIn("const box=$('party').getBoundingClientRect()",function)
        self.assertIn("'--party-clearance'",function);self.assertIn("'--exploration-clearance'",function)
        self.assertNotRegex(function,r'state\.[\w.]+\s*=(?!=)')
        self.assertNotIn('focus(',function);self.assertNotIn('click(',function)
        self.assertIn("new ResizeObserver(layoutFeedback).observe($('exploration-dock'))",s)
    def test_style_is_exploration_scoped_and_retains_default_battle_containing_blocks(self):
        css=(ROOT/'src/exploration-hud.css').read_text();self.assertIn('#exploration-dock{display:contents}',css)
        for line in css.splitlines():
            if '{' in line and line.startswith('body'):
                self.assertIn('[data-mode="explore"]',line);self.assertIn('[data-started="true"]',line)
        self.assertIn('env(safe-area-inset-bottom)',css);self.assertIn('min-height:44px',css)
        self.assertIn("'src/exploration-hud.css'",(ROOT/'scripts/build.mjs').read_text())
    def test_real_checker_only_reads_dom_and_never_reassigns_game(self):
        self.assertIn('document.elementFromPoint',READ_DOCK);self.assertIn('createRange()',READ_DOCK)
        self.assertNotIn('dataset.hud=',READ_DOCK);self.assertNotIn('localStorage',READ_DOCK)
        self.assertIn('record_dock_views(page,out', (ROOT/'tests/festival_browser.py').read_text())
        self.assertEqual((ROOT/'tests/early_comfort.py').read_text().count('observe_dock(page)'),2)
    def test_failures_capture_before_restore_and_do_not_get_replaced_by_cleanup(self):
        source=inspect.getsource(record_dock_views)
        self.assertLess(source.index("f'{name}-failure.png'"),source.index('page.set_viewport_size(original)'))
        self.assertIn('if not failed:',source);self.assertIn("record_dock_views",source)
    def test_resize_failure_is_recorded_and_original_exception_survives_cleanup(self):
        import tempfile
        from unittest.mock import patch
        page=Mock();page.viewport_size={'width':1365,'height':900};page.evaluate.return_value='quiet'
        page.set_viewport_size.side_effect=[ValueError('original-resize-root'),RuntimeError('cleanup-error')]
        with tempfile.TemporaryDirectory() as d,patch('early_comfort.set_guide'):
            with self.assertRaisesRegex(ValueError,'original-resize-root'):record_dock_views(page,Path(d),'unit')
            import json
            report=json.loads((Path(d)/'unit-report.json').read_text());self.assertEqual(report['status'],'failed')
            self.assertEqual(report['failure'],'original-resize-root');self.assertIn('cleanup-error',report['cleanupError'])

if __name__=='__main__':unittest.main()
