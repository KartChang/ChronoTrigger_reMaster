"""Read-only presentation observations within an EXISTING paused native visit.
No keys, walking, sleeps, state setters, synthetic saves or browser launches.
"""
import base64
import hashlib
import json
import os
import sys
from pathlib import Path

FRAME_BOUNDARY='()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))'
MEDIA_QUERY="matchMedia('(prefers-reduced-motion: reduce)').matches"
SNAPSHOT="""key=>{const t=window.__CHRONO_TEST__,s=t.snapshot(),v=t.view(),r=v.renderer;
 return {chapter:s.chapter,paused:t.paused(),mediaReduce:matchMedia('(prefers-reduced-motion: reduce)').matches,
 groups:key==='fair-witnesses'?{conduct:{profile:v.fairMotion.profile,motion:v.fairMotion.motion,actors:v.fairMotion.actors},vendors:v.fairMotion.vendors}:
 key==='fair-vendors'?{vendors:v.fairMotion.vendors}:{trial:v.trialMaps.motion},
 gate:key==='forest-gate'?v.trialMaps.forestGate:null,
 renderer:{backend:r.backend,webglVersion:r.webglVersion,width:r.width,height:r.height,mode:r.mode,
 samplingEnabled:r.cpu?.sampling.enabled??null},viewport:{width:innerWidth,height:innerHeight},focus:document.activeElement.id};}"""
KEY_CHAPTER={'fair-witnesses':'fair','fair-vendors':'fair','courtroom':'courtroom','forest-gate':'guardia1000'}


def assert_phase(o,state,reduced,key):
    assert key in KEY_CHAPTER and o['chapter']==state['chapter']==KEY_CHAPTER[key]
    assert o['paused'] is True and o['mediaReduce'] is reduced
    expected={'conduct','vendors'} if key=='fair-witnesses' else {'vendors'} if key=='fair-vendors' else {'trial'}
    assert set(o['groups'])==expected
    for name,g in o['groups'].items():
        assert g['profile']=='outlined-live-actors-r2'
        m=g['motion']
        assert m['profile']=='vq03f-witness-motion-preference' and m['clock']=='simulation-ticks'
        assert m['tick']==state['ticks'] and m['reducedMotion'] is reduced and m['stateMutation'] is False
        assert type(m['bindingCount']) is int and m['bindingCount']>=len(g['actors'])>0
        assert len({a['seed'] for a in g['actors']})==len(g['actors'])
        kinds=sorted(a['kind'] for a in g['actors'])
        if name=='conduct': assert kinds==['elder','girl','merchant']
        elif name=='vendors': assert kinds==['shopper']*3
        elif key=='courtroom': assert kinds==['defender','judge','prosecutor']
        elif key=='forest-gate': assert kinds==['guard']*3 and state['trial']['stage']=='flight'
        for a in g['actors']:
            assert type(a['seed']) is int and a['seed']>=0 and type(a['uploads']) is int and a['uploads']>=1
            t=(state['ticks']+a['seed']*37)%240
            frame=0 if reduced or t<90 else 1 if t<180 else 2 if t<189 else 3
            assert type(a['frame']) is int and a['frame']==frame and a['cell']=={'width':48,'height':64}
    if key=='forest-gate':
        g=o['gate'];assert g['name']=='forest-time-gate' and g['visible'] is True
        assert g['position']==[5.5,1.35,4]
        assert abs(g['rotation'][0]-1.5707963267948966)<1e-12 and g['rotation'][1]==0
        assert g['rotation'][2]==(0 if reduced else state['ticks']/180)
    else: assert o['gate'] is None


def source_identity():
    root=Path(__file__).resolve().parents[1]
    meta=json.loads((root/'dist/build-meta.json').read_text());html=(root/'dist/index.html').read_bytes()
    assert meta['sourceSha']==os.environ['GITHUB_SHA'] and meta['bytes']==len(html)
    return {'sourceSha':meta['sourceSha'],'runId':os.environ['GITHUB_RUN_ID'],
            'runAttempt':os.environ['GITHUB_RUN_ATTEMPT'],'htmlBytes':len(html),'htmlSha256':hashlib.sha256(html).hexdigest()}


def observe_witness_comfort(page,out,key,snap):
    assert key in KEY_CHAPTER
    folder=Path(out)/'fair-trial-comfort'/key;folder.mkdir(parents=True,exist_ok=True)
    r={'schema':'chrono-native-fair-trial-comfort-v1','status':'running','key':key,'phases':[],
       'physicalDevice':False,'artApproved':False,'realTimeComfortApproved':False}
    original=None
    try:
        r.update(source_identity())
        assert page.evaluate('window.__CHRONO_TEST__.paused()') is True
        frozen=snap(page);assert frozen['chapter']==KEY_CHAPTER[key]
        # Let the existing renderer observe the already-frozen dialog/pause state.
        page.evaluate(FRAME_BOUNDARY);assert snap(page)==frozen
        original=page.evaluate(MEDIA_QUERY);assert type(original) is bool
        r.update(originalReduce=original,beforeState=frozen)
        for phase,reduced in [('before',original),('reduced',True),('restored',original)]:
            if phase!='before':
                page.emulate_media(reduced_motion='reduce' if reduced else 'no-preference')
                page.evaluate(FRAME_BOUNDARY)
            first=page.evaluate(SNAPSHOT,key);assert snap(page)==frozen
            assert_phase(first,frozen,reduced,key)
            page.evaluate(FRAME_BOUNDARY);repeat=page.evaluate(SNAPSHOT,key)
            assert repeat==first and snap(page)==frozen
            item={'phase':phase,'state':snap(page),'observation':first,'repeated':repeat};r['phases'].append(item)
            encoded=page.evaluate("document.getElementById('world').toDataURL('image/png')")
            assert encoded.startswith('data:image/png;base64,')
            raw=base64.b64decode(encoded.split(',',1)[1],validate=True)
            (folder/(phase+'.png')).write_bytes(raw)
            item['image']={'path':phase+'.png','source':'actual-native-canvas','bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
        first,last=r['phases'][0],r['phases'][2]
        assert first['image']=={**last['image'],'path':'before.png'}
        for k in ['renderer','viewport','focus']:assert first['observation'][k]==last['observation'][k]
        r['afterState']=snap(page);assert r['beforeState']==r['afterState']
        r['fullStateEqual']=True;r['status']='passed'
    except Exception as exc:
        r['status']='failed';r['error']={'type':type(exc).__name__,'message':str(exc)}
        raise
    finally:
        original_error=sys.exc_info()[1]
        try:
            if original is not None:
                page.emulate_media(reduced_motion='reduce' if original else 'no-preference')
                page.evaluate(FRAME_BOUNDARY);assert page.evaluate(MEDIA_QUERY) is original
                assert snap(page)==r['beforeState']
        except Exception as exc:
            r['cleanupError']=str(exc);r['status']='failed'
            if original_error is None:raise
        finally:
            (folder/'report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    raw=(folder/'report.json').read_bytes()
    return {'key':key,'path':'fair-trial-comfort/'+key+'/report.json','bytes':len(raw),
            'sha256':hashlib.sha256(raw).hexdigest(),'state':r['beforeState']}
