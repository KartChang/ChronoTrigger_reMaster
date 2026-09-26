"""Readonly Q native evidence. Prior drawn facing is not an inferred attacker direction.
Actual cell fingerprints refer to draw history, never to a synchronized screenshot.
"""
import json,re
from pathlib import Path
from party_combat import integer,finite,vec,clip_frame
GOLDEN=json.loads((Path(__file__).parent/'fixtures/party-reaction-frames.json').read_text())
OBSERVE_SCRIPT="""()=>{const a=window.__CHRONO_TEST__;return {state:a.snapshot(),motion:a.view().partyCombat.reactions};}"""
DURATIONS=[90,90,100,130]
def hurt_frame(tick,start):
    ms=(tick/60-start/60)*1000;edge=0
    for i,d in enumerate(DURATIONS):
        edge+=d
        if 0<=ms<edge:return i
    return None

def assert_reaction_history(record,*,require_hit=False):
    s=record['state'];m=record['motion'];tick=s['ticks']
    assert integer(tick) and m['tick']==tick and m['chapter']==s['chapter'] and s['chapter']!='lab'
    assert m['profile']=='vq03q-party-reaction-continuity' and m['disposed'] is False
    assert m['historyLimit']==24 and integer(m['historyDropped']) and len(m['history'])<=24
    assert m['textureReadFailures']==0 and m['stateMutation'] is False and m['additionalGpuResources']==0 and m['approved'] is False
    assert type(m['reducedMotion']) is bool
    groups={};different=0;last=-1
    for h in m['history']:
        slot=h['slot'];t=h['tick'];c=h['cause'];p=c['beforeDraw'];e=c['effect'];d=h['facing'];f=h['frame'];hero=h['actor']
        assert type(slot) is int and 0<=slot<=2 and integer(t) and last<=t<=tick;last=t
        assert hero in (['crono'] if slot==0 else ['marle','lucca'] if slot==1 else ['frog','marle'])
        assert type(d) is int and 0<=d<4 and type(f) is int and 0<=f<4
        assert type(h['fallbackFacing']) is int and 0<=h['fallbackFacing']<4
        assert h['pose']=='hurt' and finite(h['hp']) and h['hp']>0 and h['mode'] in ('battle','victory')
        assert h['scope']=='draw-texture-not-framebuffer' and type(h['reducedMotion']) is bool
        assert c['kind']=='delivered-target-hit' and integer(c['tick']) and integer(p['tick']) and p['tick']<=c['tick']<=t
        assert p['facing']==d and e['kind']=='hit' and 'actor' not in e and e.get('guest') is not True
        assert vec(c['target']) and c['target']=={'x':e['x'],'z':e['z']}
        assert f==hurt_frame(t,c['tick'])
        assert h['texture']=={'width':48,'height':64,'fnv1a32':GOLDEN['cells'][f'{hero}/hurt/{d}/{f}']['fnv1a32']}
        key=(slot,c['tick'])
        if key not in groups:groups[key]={'cause':c,'frames':set()}
        assert groups[key]['cause']==c
        groups[key]['frames'].add(f);different+=h['fallbackFacing']!=d
    if require_hit:assert groups,'No real delivered party reaction observed'
    return {'deliveredHits':len(groups),'reactionFrameSamples':len(m['history']),'completeObservedReactions':sum(g['frames']=={0,1,2,3} for g in groups.values()),'differentFallbackSamples':different}

def assert_reaction_report(report,expected_sha,*,expected_build=('0.9.64','VQ03Q')):
    assert re.fullmatch('[0-9a-f]{40}',expected_sha)
    assert report['sourceSha']==report['build']['sourceSha']==expected_sha
    assert (report['build']['version'],report['build']['batch'])==expected_build
    assert report['status']=='passed' and report['nativeInputsOnly'] is True and report['errors']==[]
    assert report['physicalDevice'] is False and report['fullAnimationComplete'] is False and report['artApproved'] is False and report['framebufferSynchronized'] is False
    return assert_reaction_history(report['observation'],require_hit=True)

def observe_reaction_suffix(page,out,build,source_sha,errors,*,expected_build=('0.9.64','VQ03Q')):
    """Append only reads after every original N/O/P input, wait, capture and assertion."""
    r={'status':'running','sourceSha':source_sha,'build':build,'nativeInputsOnly':True,'physicalDevice':False,'fullAnimationComplete':False,'artApproved':False,'framebufferSynchronized':False}
    try:
        v=page.evaluate(OBSERVE_SCRIPT);r['observation']=v
        (out/'party-reaction-observation.json').write_text(json.dumps(v,ensure_ascii=False,indent=2),encoding='utf-8')
        assert not errors,errors
        r.update(status='passed',errors=list(errors))
        r['positiveSamples']=assert_reaction_report(r,source_sha,expected_build=expected_build)
        r['limitations']=['Only delivered target hits and previously drawn facing; no attacker inferred from target-only data.','History is actual retained canvas cells, not synchronous framebuffer or full animation approval.','No original route, input, wait, capture or threshold changed. Missing native selector-change and down coverage remains open.']
    except Exception as exc:
        r.update(status='failed',failure=str(exc),errors=list(errors));raise
    finally:(out/'party-reaction-report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
