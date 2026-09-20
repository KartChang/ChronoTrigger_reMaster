"""Read-only sprite-pivot/contact evidence from actual rendered journeys.
Geometry, retained-pixel identity and screenshots are not physical-device or art approval.
"""
import json
import math
import traceback

READ = """() => {const t=window.__CHRONO_TEST__,s=t.snapshot(),v=t.view();return {
 source:'actual-mesh-texture-pivot',chapter:s.chapter,stage:s.prologue.stage,mode:s.mode,tick:s.ticks,frame:v.frame,
 profile:v.actorArt.profile,grounding:v.grounding,witnesses:v.fairMotion.contacts,
 physicalDevice:false,geometryOnly:true};}"""


def assert_contacts(actors):
    ids = [a['id'] for a in actors]
    assert len(ids) == len(set(ids)), ids
    for a in actors:
        for key in ('foot','actualFoot','scale'):
            assert all(math.isfinite(a[key][axis]) for axis in ('x','y','z')), a
        error = math.dist([a['foot'][v] for v in ('x','y','z')], [a['actualFoot'][v] for v in ('x','y','z')])
        assert math.isfinite(a['footError']) and error <= 1e-5 and abs(error-a['footError']) < 1e-7, a
        assert a['shadow']['visible'], a
        assert math.dist([a['foot'][v] for v in ('x','y','z')], [a['shadow'][v] for v in ('x','y','z')]) <= 1e-5, a


def assert_grounding(m, *, require_witness=False, require_lunge=False):
    assert m['source'] == 'actual-mesh-texture-pivot' and m['geometryOnly'] and not m['physicalDevice'], m
    assert m['profile'] == 'party-redraw-48x64-vq01', m
    g = m['grounding']
    assert g['profile'] == 'vq01l-texture-foot-contact' and g['approved'] is False, m
    assert_contacts(g['actors'])
    if m['chapter'] != 'lab' and m['stage'] != 'waking':
        assert 'p0' in [a['id'] for a in g['actors']], m
    assert_contacts(m['witnesses'])
    if require_witness:
        assert 'fair-melchior' in [a['id'] for a in m['witnesses']], m
    assert len(g['history']) <= 24, m
    for a in g['history']:
        assert_contacts([a])
    if require_lunge:
        assert any(a['id']=='p0' for a in g['history']), m


def record_grounding(page, out, name, *, require_witness=False, require_lunge=False):
    result = {'status':'running','physicalDevice':False}
    try:
        frame = page.evaluate('window.__CHRONO_TEST__.view().frame')
        page.wait_for_function('f=>window.__CHRONO_TEST__.view().frame>=f+2',arg=frame,timeout=15000)
        m = page.evaluate(READ); result['observation'] = m
        assert_grounding(m,require_witness=require_witness,require_lunge=require_lunge)
        page.screenshot(path=str(out/(name+'.png')))
        result['status'] = 'passed'
        return m
    except Exception as exc:
        result.update(status='failed',errorType=type(exc).__name__,failure=str(exc),traceback=traceback.format_exc())
        raise
    finally:
        (out/(name+'-report.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
