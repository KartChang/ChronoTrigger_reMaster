"""Source-bound readonly R transform evidence. History is not a framebuffer or playback."""
import json,math,re
from party_combat import integer,finite,vec
OBSERVE_SCRIPT="""()=>{const a=window.__CHRONO_TEST__,v=a.view();return {state:a.snapshot(),motion:v.combatTiming,transient:v.transient};}"""
DURATION={'lunge':.42,'stroke':.6,'number':1.25}
def close(a,b):
    assert finite(a) and finite(b) and math.isclose(a,b,abs_tol=1e-8,rel_tol=1e-8),(a,b)
def vector(v,n=3):return isinstance(v,list) and len(v)==n and all(finite(x) for x in v)

def assert_timing_history(observation,*,require_complete=False):
    s=observation['state'];m=observation['motion'];tick=s['ticks'];groups={};sources={};last=-1
    assert integer(tick) and m['tick']==tick
    assert m['profile']=='vq03r-simulation-combat-timing' and m['clock']=='simulation-ticks'
    assert m['disposed'] is False and m['stateMutation'] is False and m['additionalGpuResources']==0 and m['approved'] is False
    assert m['historyLimit']==24 and integer(m['historyDropped']) and len(m['history'])<=24
    assert type(m['reducedMotion']) is bool
    for h in m['history']:
        kind=h['kind'];src=h['source'];e=src['effect'];t=h['tick'];a=h['actual'];phase=h['phase'];reduced=h['reducedMotion']
        assert kind in DURATION and integer(src['id']) and src['id']>0 and integer(src['tick'])
        assert integer(t) and src['tick']<=t<=tick and t>=last;last=t
        assert h['scope']=='draw-transform-not-framebuffer' and type(reduced) is bool
        assert h['ageTicks']==t-src['tick'];age=h['ageTicks']/60;close(h['seconds'],age)
        assert e['kind'] in ('hit','heal','combo') and finite(e['x']) and finite(e['z']) and isinstance(e['text'],str)
        if src['id'] in sources:assert sources[src['id']]==src
        sources[src['id']]=src
        assert vector(a['position']) and type(a['enabled']) is bool and type(a['disposed']) is bool
        duration=DURATION[kind];expired=age>=duration if kind=='lunge' else age>duration
        assert phase in ('start','middle','expired','interrupted')
        if phase=='expired':assert expired
        elif phase=='interrupted':assert kind=='lunge'
        else:assert not expired and phase==('middle' if age>=duration/2 else 'start')
        if kind=='lunge':
            assert type(e.get('actor')) is int and e['actor'] in (0,1) and vec(e['origin'])
            assert e.get('style') in ('slash','shot','fire','spin') and e.get('guest') is not True
            assert vec(a['logical']) and vec(a['offset']) and vector(a['shadow']) and a['disposed'] is False
            d=math.hypot(e['x']-e['origin']['x'],e['z']-e['origin']['z']) or 1
            push=0 if reduced or expired or phase=='interrupted' else math.sin(age/.42*math.pi)
            for axis,coord in [('x',0),('z',2)]:
                off=(e[axis]-e['origin'][axis])/d*.55*push;close(a['offset'][axis],off)
                # Grounding applies billboard pivot separately; the shadow gives the actual foot.
                if s['chapter']!='lab':close(a['shadow'][coord],a['logical'][axis]+off)
        elif kind=='number':
            close(a['position'][0],e['x']);close(a['position'][2],e['z']);close(a['position'][1],2.2+(0 if reduced else age*.8))
            assert a['disposed']==expired
        else:
            assert e.get('style') in ('slash','shot','fire','spin') and vector(a['scale'])
            for x in a['scale']:close(x,1+age*.6)
            close(a['position'][0],e['x']);close(a['position'][1],1.3);close(a['position'][2],e['z'])
            close(a['alpha'],0 if reduced else max(0,1-age/.6));assert a['disposed']==expired
            if not expired:assert a['enabled']==(not reduced)
        groups.setdefault((src['id'],kind),set()).add(phase)
    complete={k:sum(kind==k and {'start','middle','expired'}<=phases for (_,kind),phases in groups.items()) for k in DURATION}
    joined=sum(all({'start','middle','expired'}<=groups.get((id,k),set()) for k in DURATION) for id in sources)
    if require_complete:assert joined>0,'No complete real delivered lunge/stroke/number event observed'
    return {'sourceEvents':len(sources),'transformSamples':len(m['history']),'completeLunges':complete['lunge'],'completeStrokes':complete['stroke'],'completeNumbers':complete['number'],'completeCombinedEvents':joined}

def assert_timing_report(report,expected_sha):
    assert re.fullmatch('[0-9a-f]{40}',expected_sha)
    assert report['sourceSha']==report['build']['sourceSha']==expected_sha
    assert (report['build']['version'],report['build']['batch'])==('0.9.65','VQ03R')
    assert report['status']=='passed' and report['errors']==[] and report['nativeInputsOnly'] is True
    for key in ['physicalDevice','fullAnimationComplete','artApproved','framebufferSynchronized']:assert report[key] is False
    return assert_timing_history(report['observation'],require_complete=True)

def observe_timing_suffix(page,out,build,source_sha,errors):
    """Append only reads after all original N/O/P/Q operations and assertions."""
    r={'status':'running','sourceSha':source_sha,'build':build,'nativeInputsOnly':True,'physicalDevice':False,'fullAnimationComplete':False,'artApproved':False,'framebufferSynchronized':False}
    try:
        v=page.evaluate(OBSERVE_SCRIPT);r['observation']=v
        (out/'combat-timing-observation.json').write_text(json.dumps(v,ensure_ascii=False,indent=2),encoding='utf-8')
        assert not errors,errors
        r.update(status='passed',errors=list(errors));r['positiveSamples']=assert_timing_report(r,source_sha)
        r['limitations']=['Actual mesh transform/expiry history, not synchronized framebuffer or original-speed comfort.','No gameplay input, wait, time, save or collision injection; all prior routes retained.','No physical-device, full-animation, audio listening or whole-game acceptance.']
    except Exception as exc:
        r.update(status='failed',failure=str(exc),errors=list(errors));raise
    finally:(out/'combat-timing-report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
