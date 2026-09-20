"""Actual DOM measurements for the exploration dock; no state writes or synthesized clicks."""
import json
import math
import traceback

READ_DOCK = """() => {
 const rect=r=>({x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height});
 const visible=e=>!!e&&!e.hidden&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden';
 const ids=['p0-name','p1-name','interact','interact-hint','guest-panel','control-hint','fps'];
 const items=ids.map(id=>{const e=document.getElementById(id),v=visible(e),style=getComputedStyle(e);
  const range=document.createRange();range.selectNodeContents(e);
  return {id,visible:v,text:e.textContent.trim(),font:parseFloat(style.fontSize),rect:rect(e.getBoundingClientRect()),
   textRects:v?[...range.getClientRects()].filter(r=>r.width>0&&r.height>0).map(rect):[]};});
 const button=document.getElementById('interact'),r=button.getBoundingClientRect(),hits=[];
 for(const x of [.25,.5,.75])for(const y of [.25,.5,.75]){
  const top=document.elementFromPoint(r.x+r.width*x,r.y+r.height*y);
  hits.push({inside:!!top&&(top===button||button.contains(top)),top:top?.id||top?.tagName||null});
 }
 const dock=document.getElementById('exploration-dock'),state=window.__CHRONO_TEST__.snapshot();
 return {source:'actual-exploration-DOM',width:innerWidth,height:innerHeight,mode:document.body.dataset.hud,
  chapter:state.chapter,gameMode:state.mode,early:document.body.dataset.earlyMeeting,coarse:matchMedia('(pointer:coarse)').matches,
  dock:rect(dock.getBoundingClientRect()),passive:getComputedStyle(dock).pointerEvents,items,hits,
  physicalDevice:false,artApproved:false};
}"""

def assert_dock(m):
    assert m['source']=='actual-exploration-DOM' and m['gameMode']=='explore',m
    assert m['physicalDevice'] is False and m['artApproved'] is False and m['passive']=='none',m
    w,h=m['width'],m['height']
    def bounds(r):
        assert all(math.isfinite(r[k]) for k in ('x','y','right','bottom','width','height')),r
        assert r['width']>0 and r['height']>0 and r['x']>=-1 and r['y']>=-1 and r['right']<=w+1 and r['bottom']<=h+1,r
    bounds(m['dock'])
    items={i['id']:i for i in m['items']}
    for required in ('interact','control-hint','fps'):
        assert required in items and items[required]['visible'] and items[required]['text'],items
    assert items['interact']['rect']['height']>=44 and items['interact']['font']>=16,items['interact']
    assert items['control-hint']['font']>=11,items['control-hint']
    assert len(m['hits'])==9 and all(p['inside'] for p in m['hits']),m['hits']
    shown=[i for i in m['items'] if i['visible']]
    for i in shown:
        bounds(i['rect'])
        assert i['rect']['y']>=m['dock']['y']-1 and i['rect']['bottom']<=m['dock']['bottom']+1,i
        for t in i['textRects']:
            bounds(t)
            assert t['x']>=i['rect']['x']-1 and t['right']<=i['rect']['right']+1 and t['y']>=i['rect']['y']-1 and t['bottom']<=i['rect']['bottom']+1,i
    # Element bounds deliberately reject even a pointer-pass-through visual overlap.
    for n,a in enumerate(shown):
        for b in shown[n+1:]:
            x=min(a['rect']['right'],b['rect']['right'])-max(a['rect']['x'],b['rect']['x'])
            y=min(a['rect']['bottom'],b['rect']['bottom'])-max(a['rect']['y'],b['rect']['y'])
            assert x<=1 or y<=1,{'overlap':[a,b]}
    if items['interact-hint']['visible']:
        assert items['interact-hint']['rect']['bottom']<=items['interact']['rect']['y'],m


def observe_dock(page):
    measured=page.evaluate(READ_DOCK)
    assert_dock(measured)
    return measured


def record_dock_views(page,out,name):
    """Use the existing preference control; restore it and size without concealing a failure."""
    from early_comfort import set_guide
    original=page.viewport_size
    original_mode=page.evaluate('document.body.dataset.hud')
    report={'status':'running','cases':[],'physicalDevice':False,'artApproved':False}
    failed=False
    try:
        for label,w,h in [('desktop',1365,900),('portrait',390,844),('short-landscape',844,390),('narrow',320,568),('short',568,320)]:
            page.set_viewport_size({'width':w,'height':h})
            for mode in ('guide','quiet'):
                set_guide(page,mode)
                frame=page.evaluate('window.__CHRONO_TEST__.view().frame')
                page.wait_for_function('f=>window.__CHRONO_TEST__.view().frame>=f+2',arg=frame,timeout=15000)
                m=page.evaluate(READ_DOCK);report['cases'].append({'name':label,**m});assert_dock(m)
                page.screenshot(path=str(out/f'{name}-{label}-{mode}.png'))
        report['status']='passed'
    except Exception as exc:
        failed=True;report.update(status='failed',failure=str(exc),traceback=traceback.format_exc())
        try:
            report['failureObservation']=page.evaluate(READ_DOCK)
            page.screenshot(path=str(out/f'{name}-failure.png'),timeout=10000)
        except Exception as capture:report['captureError']=str(capture)
        raise
    finally:
        try:
            page.set_viewport_size(original)
            set_guide(page,original_mode)
        except Exception as cleanup:
            report['cleanupError']=str(cleanup)
            if not failed:
                report.update(status='failed',failure='Unable to restore exploration view');raise
        finally:(out/f'{name}-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
