"""Observe real fair decorations. Synthetic checker fixtures are not browser or hardware evidence."""
import hashlib
import json
import math
import os
import traceback
from pathlib import Path

READ_SCENERY = """() => {const t=window.__CHRONO_TEST__,s=t.snapshot(),v=t.view();return {
 source:'actual-fair-scenery',chapter:s.chapter,tick:s.ticks,frame:v.frame,paused:t.paused(),mode:s.mode,
 viewport:{width:innerWidth,height:innerHeight},bellHeard:s.fair.bellHeard,
 scenery:v.fairMotion.scenery,physicalDevice:false,artApproved:false};} """
VIEWS=(('desktop',1365,900),('portrait',390,844),('short-landscape',844,390))
ANCHORS=((-9.64,2.87,-2.8),(10.06,2.87,2.5),(-9.54,2.87,7.8),(5.06,2.87,7.2))


def signature(m):
    return {'banners':m['scenery']['banners'],'rotations':m['scenery']['rotations']}


def assert_scenery(m):
    assert m['source']=='actual-fair-scenery' and m['chapter']=='fair',m
    assert m['physicalDevice'] is False and m['artApproved'] is False,m
    s=m['scenery'];assert s['profile']=='vq01v-tick-scenery' and s['approved'] is False,s
    assert isinstance(m['tick'],int) and s['tick']==m['tick'] and m['tick']>=0,s
    assert isinstance(s['reducedMotion'],bool) and len(s['banners'])==4,s
    for i,(b,anchor) in enumerate(zip(s['banners'],ANCHORS)):
        assert b['id']=='fair-banner-pivot-'+str(i) and set(b['parts'])=={'vertical-banner','banner-gold-symbol'},b
        assert len(b['anchor'])==len(b['rotation'])==3,b
        assert all(math.isfinite(n) for n in b['anchor']+b['rotation']),b
        assert all(abs(a-e)<1e-7 for a,e in zip(b['anchor'],anchor)),b
        assert abs(b['rotation'][0])<=.06500001 and b['rotation'][1]==0 and abs(b['rotation'][2])<=.02800001,b
        phase=lambda period:(s['tick']%period)/period*math.pi*2
        expected=(0,0,0) if s['reducedMotion'] else (math.sin(phase(300)+i*.83)*.055+math.sin(phase(150)+i*.83)*.01,0,math.sin(phase(420)+i*.83)*.028)
        assert all(abs(a-e)<1e-7 for a,e in zip(b['rotation'],expected)),b
    r=s['rotations'];assert len(r['ring'])==2 and all(math.isfinite(n) for n in [r['gate'],r['pendant'],r['save'],r['robotY'],r['bell'],*r['ring']]),r
    assert abs(r['bell'])<=.02500001 and abs(r['robotY']-1.3)<=.03500001,r
    if s['reducedMotion']:
        assert all(r[k]==0 for k in ('gate','pendant','save','bell')) and r['ring']==[0,0] and r['robotY']==1.3,r


def _frames(page):
    f=page.evaluate('window.__CHRONO_TEST__.view().frame')
    page.wait_for_function('f=>window.__CHRONO_TEST__.view().frame>=f+2',arg=f,timeout=15000)


def _advance(page,m):
    page.wait_for_function('n=>window.__CHRONO_TEST__.view().fairMotion.scenery.tick>=n+12',arg=m['tick'],timeout=15000)
    result=page.evaluate(READ_SCENERY);assert_scenery(result);return result


def record_scenery_views(page,out,name):
    original=page.viewport_size
    reduced=page.evaluate('matchMedia("(prefers-reduced-motion: reduce)").matches')
    assert original is not None,'Explicit viewport is required'
    meta=json.loads(Path('dist/build-meta.json').read_text())
    report={'status':'running','cases':[],'physicalDevice':False,'artApproved':False,
        'sourceSha':meta['sourceSha'],'runId':os.environ.get('GITHUB_RUN_ID'),
        'runAttempt':os.environ.get('GITHUB_RUN_ATTEMPT'),
        'htmlSha256':hashlib.sha256(Path('dist/index.html').read_bytes()).hexdigest()}
    failed=False;paused_here=False
    try:
        for label,w,h in VIEWS:
            case={'name':label};report['cases'].append(case)
            page.set_viewport_size({'width':w,'height':h});page.emulate_media(reduced_motion='no-preference');_frames(page)
            before=page.evaluate(READ_SCENERY);case['before']=before;assert_scenery(before)
            assert not before['paused'] and not before['scenery']['reducedMotion'] and before['viewport']=={'width':w,'height':h},before
            later=_advance(page,before);case['later']=later
            assert signature(before)!=signature(later),'Scenery did not advance with simulation ticks'
            page.screenshot(path=str(out/(name+'-'+label+'-moving.png')))
            page.keyboard.press('Escape');paused_here=True;page.wait_for_selector('#pause-screen:not([hidden])');_frames(page)
            frozen=page.evaluate('window.__CHRONO_TEST__.snapshot()');first=page.evaluate(READ_SCENERY);_frames(page);last=page.evaluate(READ_SCENERY)
            assert_scenery(first);assert_scenery(last)
            assert first['paused'] and last['paused'] and first['scenery']==last['scenery'],'Paused decorations changed'
            assert page.evaluate('window.__CHRONO_TEST__.snapshot()')==frozen,'Paused game state changed'
            case['pause']={'before':first,'after':last,'fullStateUnchanged':True}
            page.screenshot(path=str(out/(name+'-'+label+'-paused.png')))
            page.keyboard.press('Escape');page.wait_for_function('!window.__CHRONO_TEST__.paused()',timeout=15000);paused_here=False
            page.emulate_media(reduced_motion='reduce');_frames(page);first=page.evaluate(READ_SCENERY);assert_scenery(first)
            assert first['scenery']['reducedMotion'],'Reduced-motion preference was not applied'
            last=_advance(page,first);case['reduced']={'before':first,'after':last}
            assert signature(first)==signature(last),'Reduced-motion decorations still animate'
            page.screenshot(path=str(out/(name+'-'+label+'-reduced.png')))
            case['status']='passed'
        report['status']='passed'
    except Exception as exc:
        failed=True;report.update(status='failed',failure=str(exc),traceback=traceback.format_exc())
        try:report['failureObservation']=page.evaluate(READ_SCENERY)
        except Exception as err:report['observationError']=str(err)
        try:page.screenshot(path=str(out/(name+'-failure.png')),timeout=10000)
        except Exception as err:report['captureError']=str(err)
        raise
    finally:
        cleanup_errors=[]
        for action in (lambda:page.keyboard.press('Escape') if paused_here and page.locator('#pause-screen').is_visible() else None,
                       lambda:page.emulate_media(reduced_motion='reduce' if reduced else 'no-preference'),lambda:page.set_viewport_size(original)):
            try:action()
            except Exception as err:cleanup_errors.append(str(err))
        if cleanup_errors:report.update(status='failed',cleanupErrors=cleanup_errors)
        p=out/(name+'-report.json');tmp=p.with_suffix('.json.tmp');tmp.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');tmp.replace(p)
        if cleanup_errors and not failed:raise RuntimeError('Unable to restore scenery observation context: '+str(cleanup_errors))
