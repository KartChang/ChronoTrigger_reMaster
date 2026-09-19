"""Read-only camera evidence attached to real journeys, never synthetic game progression.
Window resize and reduced-motion media emulation are not physical-device acceptance.
"""
import hashlib
import json
import math
import traceback

READ = """() => {
 const t=window.__CHRONO_TEST__,s=t.snapshot(),v=t.view(),r=document.querySelector('#world').getBoundingClientRect();
 return {source:'actual-scene-vertex-projection',chapter:s.chapter,mode:s.mode,stage:s.prologue.stage,
  tick:s.ticks,frame:v.frame,paused:t.paused(),viewport:{width:r.width,height:r.height},
  camera:v.earlyComfort,focus:document.activeElement?.id,physicalDevice:false};
}"""


def assert_camera(m, *, readable_portrait=False):
    assert m['source'] == 'actual-scene-vertex-projection', m
    assert m['chapter'] in ('bedroom', 'home', 'fair') and m['stage'] != 'waking', m
    c = m['camera']; f = c['camera']; r = m['viewport']['width'] / m['viewport']['height']
    assert c['profile'] == 'vq01b-readable-actors' and f['active'], m
    assert c['fullScenePublished'] is False and c['motion']['approved'] is False, m
    assert all(math.isfinite(f[k]) for k in ('x', 'z', 'half', 'ratio')) and f['half'] > 0, m
    assert abs(f['ratio'] - r) < .002, m
    actual = c['rects']; predicted = f['actors']; ids = [a['id'] for a in actual]
    assert 'p0' in ids and len(ids) == len(set(ids)) and set(ids) == {a['id'] for a in predicted}, m
    for a in actual:
        assert all(math.isfinite(a[k]) for k in ('left','right','top','bottom')), a
        assert a['right'] > a['left'] and a['bottom'] > a['top'], a
        for k, sign in [('left',1),('right',-1),('top',1),('bottom',-1)]:
            assert sign * (a[k] - f['bounds'][k]) >= -.002, (k,a,f)
    if readable_portrait and r < .85:
        p = next(a for a in actual if a['id'] == 'p0')
        # Apply only to stationary single-person / pre-join meeting checks, not a separated co-op battle.
        assert f['portrait'] and (p['bottom']-p['top']) * m['viewport']['height'] >= 80, m


def observe_camera(page, *, readable_portrait=False):
    start = page.evaluate('window.__CHRONO_TEST__.view().frame')
    page.wait_for_function("""start=>{const v=window.__CHRONO_TEST__.view(),r=document.querySelector('#world').getBoundingClientRect();
      return v.frame>=start+2&&v.earlyComfort?.camera?.active&&Math.abs(v.earlyComfort.camera.ratio-r.width/r.height)<.002;}""", arg=start, timeout=15000)
    m = page.evaluate(READ)
    assert_camera(m, readable_portrait=readable_portrait)
    return m


def _hash(state):
    return hashlib.sha256(json.dumps(state, sort_keys=True, separators=(',',':'), ensure_ascii=False).encode()).hexdigest()


def record_camera_viewports(page, out, prefix, *, pause_probe=False):
    original = page.viewport_size
    report = {'status':'running','cases':[],'physicalDevice':False}
    before = page.evaluate('window.__CHRONO_TEST__.snapshot()')
    try:
        for name,w,h in [('desktop',1365,900),('portrait',390,844),('short-landscape',844,390)]:
            page.set_viewport_size({'width':w,'height':h})
            m = observe_camera(page, readable_portrait=True)
            report['cases'].append({'name':name,**m})
            now = page.evaluate('window.__CHRONO_TEST__.snapshot()')
            assert now['chapter'] == before['chapter'] and now['prologue'] == before['prologue'], now
            assert [(p['x'],p['z'],p['hp'],p['mp']) for p in now['players']] == [(p['x'],p['z'],p['hp'],p['mp']) for p in before['players']], now
            page.screenshot(path=str(out / f'{prefix}-camera-{name}.png'))
        if pause_probe:
            page.keyboard.press('Escape'); page.wait_for_selector('#pause-screen:not([hidden])')
            frozen = page.evaluate('window.__CHRONO_TEST__.snapshot()')
            first = observe_camera(page); later = observe_camera(page)
            assert first['paused'] and later['paused']
            for k in ('x','z','half'):
                assert abs(first['camera']['camera'][k]-later['camera']['camera'][k]) < 1e-7, (first,later)
            assert page.evaluate('window.__CHRONO_TEST__.snapshot()') == frozen
            page.emulate_media(reduced_motion='reduce')
            page.wait_for_function('window.__CHRONO_TEST__.view().earlyComfort.motion.reducedMotion===true', timeout=15000)
            reduced = observe_camera(page)
            assert reduced['camera']['motion']['reason'] == 'reduced-motion'
            assert page.evaluate('window.__CHRONO_TEST__.snapshot()') == frozen
            page.screenshot(path=str(out / f'{prefix}-camera-paused-reduced.png'))
            report['pauseProbe'] = {'before':first,'after':later,'reduced':reduced,'frozenStateSha256':_hash(frozen),'fullStateUnchanged':True,'mediaEmulated':True}
            page.emulate_media(reduced_motion='no-preference')
            page.wait_for_function('window.__CHRONO_TEST__.view().earlyComfort.motion.reducedMotion===false', timeout=15000)
            assert page.evaluate('window.__CHRONO_TEST__.snapshot()') == frozen
            page.keyboard.press('Escape')
            page.wait_for_function('!window.__CHRONO_TEST__.paused()&&document.activeElement?.id==="world"',timeout=15000)
        report['status'] = 'passed'
    except Exception as exc:
        report.update(status='failed',errorType=type(exc).__name__,failure=str(exc),traceback=traceback.format_exc())
        try: report['lastObserved'] = page.evaluate(READ)
        except Exception as nested: report['observationError'] = str(nested)
        raise
    finally:
        (out / f'{prefix}-camera-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
        page.set_viewport_size(original)
