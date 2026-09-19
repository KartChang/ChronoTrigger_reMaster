"""Actual first-meeting HUD geometry; resizing is not a physical-device certification."""
import json

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


def record_early_comfort(page, out, prefix):
    report = {'status': 'running', 'cases': [], 'physicalDevice': False}
    original = page.viewport_size
    before = page.evaluate('window.__CHRONO_TEST__.snapshot().prologue')
    try:
        for label, width, height in [('desktop', 1365, 900), ('portrait', 390, 844), ('short-landscape', 844, 390)]:
            page.set_viewport_size({'width': width, 'height': height})
            page.wait_for_function("([w,h])=>innerWidth===w&&innerHeight===h&&document.body.dataset.earlyMeeting==='true'&&document.querySelector('#interact-hint').textContent.startsWith('E · ')&&document.querySelector('#interact-label').textContent===document.querySelector('#interact-hint').textContent.slice(4)", arg=[width,height])
            m = page.evaluate(METRICS)
            report['cases'].append({'name': label, **m})
            assert_geometry(m)
            assert page.evaluate('window.__CHRONO_TEST__.snapshot().prologue') == before
            page.screenshot(path=str(out / f'{prefix}-comfort-{label}.png'))
        report['status'] = 'passed'
    except Exception as exc:
        report.update(status='failed', failure=str(exc))
        raise
    finally:
        (out / f'{prefix}-comfort-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        page.set_viewport_size(original)
