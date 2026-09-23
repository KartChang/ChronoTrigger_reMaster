"""Native keyboard/viewport observations while the original Truce state is paused.
Read-only DOM geometry; no injected click/focus/scroll, time or game mutations on
successful capture. Cleanup restores settings without hiding an earlier failure.
"""
import base64
import hashlib
import sys
from pathlib import Path

DOM_LAYOUT = r'''()=>{
 const root=document.querySelector('#pause-screen .dialog');
 const rect=e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height};};
 return {viewport:{width:innerWidth,height:innerHeight},dialog:rect(root),
   scrollTop:root.scrollTop,scrollHeight:root.scrollHeight,clientHeight:root.clientHeight,
   focus:document.activeElement?.id,controls:['resume','render-quality','cpu-sampling'].map(id=>{
    const input=document.getElementById(id),target=id==='cpu-sampling'?input.closest('label'):input;
    const b=target.getBoundingClientRect(),hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);
    return {id,rect:rect(target),fontSize:parseFloat(getComputedStyle(target).fontSize),
      visible:!!target.getClientRects().length&&!target.closest('[hidden],[inert]')&&!input.disabled,
      hit:!!hit&&(hit===target||target.contains(hit))};})};}'''


def receipt(path):
    data=path.read_bytes()
    return {'path':path.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}


def assert_layout(value):
    assert value['focus'] in ('resume','render-quality','cpu-sampling'), value
    viewport,dialog=value['viewport'],value['dialog']
    assert [c['id'] for c in value['controls']]==['resume','render-quality','cpu-sampling']
    for c in value['controls']:
        b=c['rect']
        assert c['visible'] and c['hit'] and c['fontSize']>=14, c
        assert b['width']>=44 and b['height']>=44, c
        assert b['x']>=max(0,dialog['x']) and b['y']>=max(0,dialog['y']), c
        assert b['x']+b['width']<=min(viewport['width'],dialog['x']+dialog['width'])+.01, c
        assert b['y']+b['height']<=min(viewport['height'],dialog['y']+dialog['height'])+.01, c


def observe_pause_access(page,out,record,snap,observed,frozen,index):
    record.update(schema='chrono-pause-access-v1',status='running',keys=[],focusOrder=[],steps=[],physicalDevice=False)
    original=page.locator('#cpu-sampling').is_checked()
    record['originalSampling']=original
    def key_state():
        return {'paused':page.evaluate('window.__CHRONO_TEST__.paused()'), 'state':snap(page),
                'focus':page.evaluate('document.activeElement.id'),
                'sampling':page.locator('#cpu-sampling').is_checked()}
    def frame(step=None):
        page.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
        if step is not None:step['after']=key_state()  # Retain the actual failed key before any assertion.
        assert page.evaluate('window.__CHRONO_TEST__.paused()') is True
        assert snap(page)==frozen
    def press(key,expected):
        step={'key':key,'before':key_state(),'completed':False}
        record['steps'].append(step)
        page.keyboard.press(key);record['keys'].append(key);frame(step)
        actual=page.evaluate('document.activeElement.id')
        record['focusOrder'].append(actual)
        assert actual==expected, {'key':key,'expected':expected,'actual':actual}
        step['completed']=True
    try:
        record['before']=snap(page)
        assert record['before']==frozen
        record['initial']=page.evaluate(DOM_LAYOUT);assert_layout(record['initial'])
        assert record['initial']['focus']=='resume'
        press('Tab','render-quality');record['qualityFocus']=page.evaluate(DOM_LAYOUT);assert_layout(record['qualityFocus'])
        press('Tab','cpu-sampling');record['samplingFocus']=page.evaluate(DOM_LAYOUT);assert_layout(record['samplingFocus'])
        if original:press('Space','cpu-sampling')
        frame();assert not page.locator('#cpu-sampling').is_checked()
        value=observed(page);value['state']=snap(page);value['paused']=page.evaluate('window.__CHRONO_TEST__.paused()')
        record['nearest']=value  # Keep the acquired observation even if DOM screenshot fails.
        image=Path(out)/f'pause-controls-{index}.png'
        page.screenshot(path=str(image),timeout=15000);value['image']=receipt(image)
        encoded=page.evaluate("document.getElementById('world').toDataURL('image/png')")
        assert encoded.startswith('data:image/png;base64,')
        canvas=Path(out)/f'village-nearest-{index}.png'
        canvas.write_bytes(base64.b64decode(encoded.split(',',1)[1],validate=True))
        value['canvasImage']={**receipt(canvas),'source':'actual-cpu-canvas'}
        if original:press('Space','cpu-sampling')
        press('Tab','resume')
        record['restoredSampling']=page.locator('#cpu-sampling').is_checked()
        record['after']=snap(page)
        assert record['restoredSampling']==original and record['after']==frozen
        record['status']='passed'
    except Exception as exc:
        record['status']='failed';record['error']={'type':type(exc).__name__,'message':str(exc)}
        raise
    finally:
        active_error=sys.exc_info()[1]
        try:
            # Failure-only cleanup may focus a UI control, never synthesize evidence.
            if page.locator('#cpu-sampling').is_checked()!=original:
                page.locator('#cpu-sampling').focus();page.keyboard.press('Space');frame()
        except Exception as exc:
            record['cleanupError']=str(exc);record['status']='failed'
            if active_error is None:raise
