"""Actual CI scene/contacts and native keyboard route observations; no writable state hooks.
Unit fixtures only validate this checker. They are not browser or physical-device evidence.
"""
import hashlib
import json
import math
import traceback
from actor_grounding import assert_contacts
from fair_ground_browser import assert_ground,record_ground_views
from exploration_hud import record_dock_views

READ = """() => {const t=window.__CHRONO_TEST__,s=t.snapshot(),v=t.view();return {
 source:'actual-festival-scene',chapter:s.chapter,tick:s.ticks,frame:v.frame,paused:t.paused(),
 viewport:{width:innerWidth,height:innerHeight},festival:v.fairMotion.festival,
 vendors:v.fairMotion.vendors,vendorContacts:v.fairMotion.vendorContacts,bell:v.fairMotion.bell,
 ground:v.fairMotion.ground,occlusion:v.festivalOcclusion,physicalDevice:false,artApproved:false};} """


def assert_festival(m, *, require_blocked=False, require_clear=False):
    assert m['source']=='actual-festival-scene' and m['chapter']=='fair',m
    assert m['physicalDevice'] is False and m['artApproved'] is False,m
    assert_ground(m['ground'])
    f=m['festival'];g=f['geometry'];o=m['occlusion']
    assert f['profile']=='vq01-festival' and f['approved'] is False and f['collisionSource']=='FAIR_STALLS',f
    assert g['decorativeOnly'] and g['meshes']>0 and g['vertices']>0 and g['triangles']>0,g
    groups={'vq01-festival-'+s+'-canopy' for s in ('cloth','candy','craft')}
    assert set(g['canopyGroups'])==groups and len(g['awnings'])==24,g
    assert len({a['id'] for a in g['awnings']})==24,g
    for a in g['awnings']:
        assert a['group'] in groups and a['vertices']==36 and a['triangles']==32,a
        assert math.isfinite(a['heightSpan']) and a['heightSpan']>.35,a
    assert len(m['vendors']['actors'])==3 and all(a['kind']=='shopper' for a in m['vendors']['actors']),m['vendors']
    assert len({a['name'] for a in m['vendors']['actors']})==3,m['vendors']
    assert_contacts(m['vendorContacts'])
    assert {'fair-vendor-cloth','fair-vendor-candy','fair-vendor-craft'}<={a['id'] for a in m['vendorContacts']},m
    assert set(m['bell']['parts'])=={'leene-bell','bell-rim','bell-interior','bell-clapper'},m['bell']
    assert o['method']=='parallel-orthographic-triangle-rays' and o['approved'] is False,o
    assert o['samples']>=9 and o['meshRayTests']>0,o
    assert len(o['groups'])==3 and {g['id'] for g in o['groups']}==groups,o
    for group in o['groups']:
        assert group['meshes']>0 and math.isfinite(group['visibility']) and .299999<=group['visibility']<=1,group
    if require_blocked:
        assert any(g['id']=='vq01-festival-cloth-canopy' and g['blocked'] and g['visibility']<1 for g in o['groups']),o
    if require_clear:
        assert all(not g['blocked'] and g['visibility']==1 for g in o['groups']),o


def _state(page):
    return page.evaluate('window.__CHRONO_TEST__.snapshot()')


def _frames(page):
    frame=page.evaluate('window.__CHRONO_TEST__.view().frame')
    page.wait_for_function('f=>window.__CHRONO_TEST__.view().frame>=f+2',arg=frame,timeout=15000)


def record_festival(page,out,name,*,require_blocked=False,require_clear=False,pause_probe=False):
    report={'status':'running','physicalDevice':False,'artApproved':False}
    paused_here=False
    try:
        _frames(page)
        m=page.evaluate(READ);report['observation']=m
        assert_festival(m,require_blocked=require_blocked,require_clear=require_clear)
        page.screenshot(path=str(out/(name+'.png')))
        if pause_probe:
            record_ground_views(page,out,name+'-ground')
            record_dock_views(page,out,name+'-dock')
            page.keyboard.press('Escape');page.wait_for_selector('#pause-screen:not([hidden])');paused_here=True
            _frames(page)
            frozen=_state(page);first=page.evaluate(READ)
            _frames(page);later=page.evaluate(READ)
            assert first['paused'] and later['paused'],later
            assert _state(page)==frozen,{'failure':'full game state changed while paused'}
            assert first['occlusion']==later['occlusion'],{'before':first,'after':later}
            assert first['ground']==later['ground'],{'before':first,'after':later}
            assert first['vendors']==later['vendors'] and first['bell']==later['bell'],{'before':first,'after':later}
            report['pauseProbe']={'before':first,'after':later,'fullStateUnchanged':True,
                'stateSha256':hashlib.sha256(json.dumps(frozen,sort_keys=True).encode()).hexdigest()}
            page.screenshot(path=str(out/(name+'-paused.png')))
        report['status']='passed'
        return m
    except Exception as exc:
        report.update(status='failed',failure=str(exc),traceback=traceback.format_exc())
        try:
            report['failureObservation']=page.evaluate(READ)
            page.screenshot(path=str(out/(name+'-failure.png')),timeout=10000)
        except Exception as capture:
            report['captureError']=str(capture)
        raise
    finally:
        try:
            if paused_here and page.locator('#pause-screen').is_visible():
                page.keyboard.press('Escape')
                page.wait_for_function('!window.__CHRONO_TEST__.paused()&&document.activeElement?.id==="world"',timeout=15000)
        except Exception as cleanup:
            report['cleanupError']=str(cleanup)
            if report['status']!='failed':
                report.update(status='failed',failure='Unable to resume native pause menu')
                raise
        finally:
            (out/(name+'-report.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
