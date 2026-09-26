"""Read-only P evidence. Canvas-cell fingerprints are not synchronized framebuffer evidence.
The unchanged painter's complete cell table is independently checked by Node; FNV1a is
an observation fingerprint, not a security signature or an art/comfort certification.
"""
import json,math,re
from pathlib import Path
GOLDEN=json.loads((Path(__file__).parent/'fixtures/party-combat-frames.json').read_text())
CLIPS={'attack':[100,90,100,180],'cast':[130,130,160,180],'down':[120,120,140,400]}
OBSERVE_SCRIPT="""()=>{const a=window.__CHRONO_TEST__;return {state:a.snapshot(),motion:a.view().partyCombat};}"""
def integer(v):return type(v) is int and v>=0
def finite(v):return type(v) in (int,float) and math.isfinite(v)
def vec(v):return isinstance(v,dict) and finite(v.get('x')) and finite(v.get('z'))
def facing(origin,target):
    assert vec(origin) and vec(target)
    x=target['x']-origin['x'];z=target['z']-origin['z'];assert math.hypot(x,z)>=1e-8
    return (1 if x>0 else 3) if abs(x)>abs(z) else (2 if z>0 else 0)
def clip_frame(pose,tick,start):
    # Match the retained PosePlayer clock, including its ordinary IEEE-754 subtraction.
    ms=(tick/60-start/60)*1000 if pose!='down' else (tick-start)*1000/60
    edge=0
    for i,duration in enumerate(CLIPS[pose]):
        edge+=duration
        if ms<edge:return i
    return 3 if pose=='down' else None

def assert_party_history(record,*,require_action=False):
    s=record['state'];m=record['motion'];tick=s['ticks']
    assert integer(tick) and m['tick']==tick and m['chapter']==s['chapter']
    assert m['profile']=='vq03p-party-combat-continuity' and m['disposed'] is False
    assert m['historyLimit']==24 and integer(m['historyDropped']) and len(m['history'])<=24
    assert m['textureReadFailures']==0 and m['stateMutation'] is False and m['additionalGpuResources']==0 and m['approved'] is False
    assert type(m['reducedMotion']) is bool
    assert s['chapter']!='lab'
    last=-1;actions=set();downs={};action_frames=0
    for h in m['history']:
        slot=h['slot'];t=h['tick'];c=h['cause'];kind=c['kind'];p=h['pose'];f=h['frame'];d=h['facing'];hero=h['actor']
        assert type(slot) is int and 0<=slot<=2 and integer(t) and last<=t<=tick;last=t
        assert type(f) is int and 0<=f<4 and type(d) is int and 0<=d<4
        assert hero in (['crono'] if slot==0 else ['marle','lucca'] if slot==1 else ['frog','marle'])
        assert h['scope']=='draw-texture-not-framebuffer' and h['mode'] in ('battle','victory') and type(h['reducedMotion']) is bool
        assert integer(c['tick']) and c['tick']<=t and d==c['facing']
        if kind=='action':
            assert h['hp']>0 and p==c['pose'] and p in ('attack','cast')
            e=c['effect'];assert e['kind']=='hit' or (slot==2 and e['kind']=='heal')
            assert 'enemyAction' not in e and c['origin']==e['origin'] and c['target']=={'x':e['x'],'z':e['z']}
            assert d==facing(c['origin'],c['target'])
            if slot==2:assert e.get('guest') is True and 'actor' not in e
            else:assert e.get('actor')==slot and e.get('guest') is not True
            assert p==('cast' if e['kind']=='heal' or e.get('style') in ('fire','spin') else 'attack')
            assert f==clip_frame(p,t,c['tick'])
            actions.add((slot,c['tick']));action_frames+=1
        else:
            assert kind=='down' and h['hp']==0 and p=='down'
            assert integer(c['beforeTick']) and c['beforeTick']<c['tick'] and c['hpBefore']>0 and c['hpAfter']==0
            assert f==clip_frame('down',t,c['tick'])
            downs.setdefault((slot,c['tick']),set()).add(f)
        assert h['texture']=={'width':48,'height':64,'fnv1a32':GOLDEN['cells'][f'{hero}/{p}/{d}/{f}']['fnv1a32']}
    if require_action:assert actions,'No actual outgoing party action observed'
    return {'sourceActions':len(actions),'actionFrameSamples':action_frames,'observedFalls':len(downs),'completeObservedFalls':sum(v=={0,1,2,3} for v in downs.values())}

def assert_party_report(report,expected_sha):
    assert re.fullmatch('[0-9a-f]{40}',expected_sha)
    assert report['sourceSha']==report['build']['sourceSha']==expected_sha
    assert (report['build']['version'],report['build']['batch'])==('0.9.63','VQ03P')
    assert report['status']=='passed' and report['nativeInputsOnly'] is True and report['errors']==[]
    assert report['physicalDevice'] is False and report['fullAnimationComplete'] is False and report['artApproved'] is False
    assert report['framebufferSynchronized'] is False
    return assert_party_history(report['observation'],require_action=True)

def observe_party_suffix(page,out,build,source_sha,errors):
    """After every existing N/O route/key/wait/capture/assertion. No added inputs/waits.
    Native down absence remains an evidence gap; do not invent or force a death.
    """
    r={'status':'running','sourceSha':source_sha,'build':build,'nativeInputsOnly':True,'physicalDevice':False,'fullAnimationComplete':False,'artApproved':False,'framebufferSynchronized':False}
    try:
        v=page.evaluate(OBSERVE_SCRIPT);r['observation']=v
        (out/'party-combat-observation.json').write_text(json.dumps(v,ensure_ascii=False,indent=2),encoding='utf-8')
        assert not errors,errors
        r.update(status='passed',errors=list(errors))
        r['positiveSamples']=assert_party_report(r,source_sha)
        r['nativeDownObserved']=r['positiveSamples']['completeObservedFalls']>0
        r['limitations']=['Source-facing actual canvas cells only; no claim of synchronized framebuffer or complete clip unless all phases observed.','An absent native down sequence stays open, even if offline unit/CPU tests pass.','Original N/O keys, waits, captures and thresholds unchanged; this suffix only reads.']
    except Exception as exc:
        r.update(status='failed',failure=str(exc),errors=list(errors));raise
    finally:(out/'party-combat-report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
