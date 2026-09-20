"""Live fair-ground observations. Synthetic unit fixtures are not browser/GPU evidence."""
import json
import math
import traceback

READ_GROUND = """() => {const t=window.__CHRONO_TEST__,s=t.snapshot(),v=t.view();return {
 source:'actual-fair-ground-view',chapter:s.chapter,frame:v.frame,tick:s.ticks,
 viewport:{width:innerWidth,height:innerHeight},ground:v.fairMotion.ground,
 physicalDevice:false,artApproved:false};} """


def assert_ground(g):
    assert g['profile']=='vq01s-static-ground-depth' and g['source']=='actual-fair-ground-buffer',g
    assert g['approved'] is False and g['visible'] is True and g['collision'] is False,g
    assert g['vertices']==1089 and g['triangles']==2048 and g['colourValues']==4356,g
    assert g['useVertexColors'] is True and g['hasVertexAlpha'] is False and g['dynamic'] is False,g
    assert all(math.isfinite(g[k]) for k in ('min','max','alphaMin','alphaMax')),g
    assert .73999<=g['min']<g['max']<=1.00001 and g['max']-g['min']>.1,g
    assert g['alphaMin']==g['alphaMax']==1,g
    assert isinstance(g['checksum'],str) and 1<=len(g['checksum'])<=8 and all(c in '0123456789abcdef' for c in g['checksum']),g
    assert len(g['position'])==3 and all(abs(a-b)<1e-6 for a,b in zip(g['position'],(0,.04,1))),g
    t=g['texture']
    assert t['width']==t['height']==512 and t['sampling']==8 and t['mipmaps'] is True and t['anisotropy']==4,t


def record_ground_views(page,out,name):
    """Resize the real viewport, inspect actual buffers and retain original screenshots; no state writes."""
    original=page.viewport_size
    assert original is not None,'Viewport must be explicit'
    report={'status':'running','cases':[],'physicalDevice':False,'artApproved':False}
    failed=False
    try:
        baseline=None
        for label,width,height in [('desktop',1365,900),('portrait',390,844),('short-landscape',844,390)]:
            page.set_viewport_size({'width':width,'height':height})
            frame=page.evaluate('window.__CHRONO_TEST__.view().frame')
            page.wait_for_function('f=>window.__CHRONO_TEST__.view().frame>=f+2',arg=frame,timeout=15000)
            observation=page.evaluate(READ_GROUND)
            report['cases'].append({'name':label,**observation})
            assert observation['source']=='actual-fair-ground-view' and observation['chapter']=='fair',observation
            assert observation['viewport']=={'width':width,'height':height},observation
            assert_ground(observation['ground'])
            if baseline is None:baseline=observation['ground']
            else:assert observation['ground']==baseline,'Ground changed when viewport changed'
            page.screenshot(path=str(out/(name+'-'+label+'.png')))
        report['status']='passed'
    except Exception as exc:
        failed=True
        report.update(status='failed',failure=str(exc),traceback=traceback.format_exc())
        try:
            report['failureObservation']=page.evaluate(READ_GROUND)
            page.screenshot(path=str(out/(name+'-failure.png')),timeout=10000)
        except Exception as capture:report['captureError']=str(capture)
        raise
    finally:
        try:page.set_viewport_size(original)
        except Exception as cleanup:
            report['cleanupError']=str(cleanup)
            if not failed:
                report.update(status='failed',failure='Unable to restore viewport')
                raise
        finally:(out/(name+'-report.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
