"""Actual first-meeting HUD geometry; resizing is not a physical-device certification."""
import json
from early_camera import observe_camera

METRICS = """() => {
 const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};
 const hint=document.querySelector('#interact-hint'),button=document.querySelector('#interact');
 const read=e=>({rect:rect(e),font:Number.parseFloat(getComputedStyle(e).fontSize),visible:!e.hidden&&e.getClientRects().length>0,text:e.textContent});
 return {width:innerWidth,height:innerHeight,early:document.body.dataset.earlyMeeting,
  coarse:matchMedia('(pointer:coarse)').matches,hint:read(hint),button:read(button),
  label:document.querySelector('#interact-label').textContent,
  note:read(document.querySelector('#story-coop-note')),
  source:'actual-page-DOM',deviceEvidence:false};
}"""


TOOLBAR_METRICS = """() => {
 const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
 const visible=e=>!e.hidden&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden';
 const note=document.querySelector('#story-coop-note');
 const bands=[...document.querySelectorAll('header,.utility button')].filter(visible).map(rect);
 const controls=[...document.querySelectorAll('header button,.utility button')].filter(e=>visible(e)&&!e.disabled).map(e=>{
  const r=rect(e),hits=[];
  for(const x of [.25,.5,.75])for(const y of [.25,.5,.75]){
   const top=document.elementFromPoint(r.x+r.width*x,r.y+r.height*y);
   hits.push({inside:!!top&&(top===e||e.contains(top)),top:top?.id||top?.className||top?.tagName||null});
  }
  return {id:e.id,rect:r,hits};
 });
 return {source:'actual-DOM-hit-testing',width:innerWidth,height:innerHeight,mode:document.body.dataset.hud,
  note:{visible:visible(note),rect:rect(note),pointerEvents:getComputedStyle(note).pointerEvents,inToolbar:note.parentElement?.matches('.utility')===true},bands,controls,
  layout:{header:rect(document.querySelector('header')),toolbar:rect(document.querySelector('.utility')),
   wrapper:rect(document.querySelector('.hud-toolbar'))}};
}"""


def assert_toolbar(m):
    assert m['source'] == 'actual-DOM-hit-testing' and m['controls'], m
    assert any(c['id'] == 'display' for c in m['controls']), m
    for c in m['controls']:
        r = c['rect']
        assert r['width'] > 0 and r['height'] > 0 and r['x'] >= 0 and r['y'] >= 0 and r['right'] <= m['width']+1 and r['bottom'] <= m['height']+1, c
        assert len(c['hits']) == 9 and all(h['inside'] for h in c['hits']), c
    if m['note']['visible']:
        r = m['note']['rect']
        assert m['note']['pointerEvents'] == 'none' and m['note']['inToolbar'], m
        assert r['y'] >= max(b['bottom'] for b in m['bands'])+3, m
        assert r['right'] <= m['width']+1 and r['bottom'] <= m['height']+1, m


def record_toolbar(page, report, phase):
    measured = page.evaluate(TOOLBAR_METRICS)
    report['toolbarChecks'].append({'phase': phase, **measured})
    assert_toolbar(measured)


def assert_geometry(m):
    assert m['early'] == 'true' and m['source'] == 'actual-page-DOM', m
    for key in ('hint', 'button'):
        e = m[key]
        r = e['rect']
        assert e['visible'] and e['font'] >= 16, (key, e)
        assert r['width'] > 0 and r['height'] > 0, (key, r)
        assert r['x'] >= 0 and r['y'] >= 0 and r['right'] <= m['width'] + 1 and r['bottom'] <= m['height'] + 1, (key, r)
    assert m['button']['rect']['height'] >= 44, m
    assert m['hint']['rect']['bottom'] <= m['button']['rect']['y'], m
    if m['note']['visible']:
        assert m['note']['rect']['bottom'] <= m['hint']['rect']['y'], m
    assert m['hint']['text'].startswith('E · ') and m['label'] == m['hint']['text'][4:], m


def assert_quiet_geometry(m):
    assert m['early'] == 'true' and m['source'] == 'actual-page-DOM', m
    assert not m['hint']['visible'], m
    e = m['button']; r = e['rect']
    assert e['visible'] and e['font'] >= 16 and r['height'] >= 44, m
    assert r['width'] > 0 and r['x'] >= 0 and r['y'] >= 0 and r['right'] <= m['width'] + 1 and r['bottom'] <= m['height'] + 1, m
    assert m['hint']['text'].startswith('E · ') and m['label'] == m['hint']['text'][4:], m
    if m['note']['visible']:
        assert m['note']['rect']['bottom'] <= r['y'], m


def set_guide(page, mode):
    if page.evaluate('document.body.dataset.hud') != mode:
        # Use the actual preference button, never set body.dataset from the test.
        page.locator('#display').click()
    page.wait_for_function('(mode)=>document.body.dataset.hud===mode', arg=mode)
    assert page.locator('#display').get_attribute('aria-pressed') == str(mode == 'guide').lower()



def capture_comfort_failure(page, report, out, prefix):
    """Retain the failing viewport before finally restores size/mode; never mask the root."""
    last = report['toolbarChecks'][-1] if report['toolbarChecks'] else None
    report['lastMeasuredPhase'] = last['phase'] if last else 'before-first-toolbar-check'
    capture = {'viewport': page.viewport_size, 'physicalDevice': False}
    report['failureCapture'] = capture
    try:
        capture['toolbar'] = page.evaluate(TOOLBAR_METRICS)
    except Exception as exc:
        capture['measurementError'] = str(exc)
    try:
        name = f'{prefix}-comfort-failure.png'
        page.screenshot(path=str(out / name))
        capture['screenshot'] = name
    except Exception as exc:
        capture['screenshotError'] = str(exc)


def record_early_comfort(page, out, prefix):
    report = {'status': 'running', 'cases': [], 'quietCases': [], 'toolbarChecks': [], 'physicalDevice': False}
    original = page.viewport_size
    original_mode = page.evaluate('document.body.dataset.hud')
    before = page.evaluate('window.__CHRONO_TEST__.snapshot().prologue')
    try:
        for label, width, height in [('desktop', 1365, 900), ('portrait', 390, 844), ('short-landscape', 844, 390)]:
            page.set_viewport_size({'width': width, 'height': height})
            page.wait_for_function("([w,h])=>innerWidth===w&&innerHeight===h&&document.body.dataset.earlyMeeting==='true'&&document.querySelector('#interact-hint').textContent.startsWith('E · ')&&document.querySelector('#interact-label').textContent===document.querySelector('#interact-hint').textContent.slice(4)", arg=[width,height])
            record_toolbar(page, report, label+'-before-guide')
            set_guide(page, 'guide')
            record_toolbar(page, report, label+'-guide')
            m = page.evaluate(METRICS)
            m['hudMode'] = 'guide'
            m['framing'] = observe_camera(page, readable_portrait=True)
            report['cases'].append({'name': label, **m})
            assert_geometry(m)
            assert page.evaluate('window.__CHRONO_TEST__.snapshot().prologue') == before
            page.screenshot(path=str(out / f'{prefix}-comfort-{label}.png'))
            set_guide(page, 'quiet')
            record_toolbar(page, report, label+'-quiet')
            quiet = page.evaluate(METRICS)
            quiet['hudMode'] = 'quiet'
            quiet['framing'] = observe_camera(page, readable_portrait=True)
            report['quietCases'].append({'name': label, **quiet})
            assert_quiet_geometry(quiet)
            assert page.evaluate('window.__CHRONO_TEST__.snapshot().prologue') == before
            assert page.evaluate('document.activeElement?.id') == 'world'
            page.screenshot(path=str(out / f'{prefix}-quiet-{label}.png'))
        report['status'] = 'passed'
    except Exception as exc:
        report.update(status='failed', failure=str(exc))
        capture_comfort_failure(page, report, out, prefix)
        raise
    finally:
        (out / f'{prefix}-comfort-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        page.set_viewport_size(original)
        set_guide(page, original_mode)
