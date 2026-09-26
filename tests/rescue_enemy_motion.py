"""Source-bound S rescue-enemy texture observations; never synchronized screenshots.
The harness uses only its original input route. These functions read and verify it.
"""
import json,re,math
from pathlib import Path
GOLDEN=json.loads((Path(__file__).parent/'fixtures/rescue-enemy-cells.json').read_text())
KINDS=('naga','hench','yakra')
MAPS=('cathedral','passage','sanctum')
OBSERVE_SCRIPT="""()=>{const a=window.__CHRONO_TEST__,v=a.view();return {state:a.snapshot(),motion:v.rescueEnemyMotion,renderer:v.renderer};}"""
def integer(v):return type(v) is int and v>=0

def finite(v):return type(v) in (float,int) and math.isfinite(v)

def frame_at(tick,index,kind,atb,reduced,cause):
    if reduced:return 0
    if cause:
        age=tick-cause['tick']
        if cause['kind']=='hurt' and age<18:return 4
        if cause['kind']=='attack' and age<24:return 2 if age<8 else 3 if age<16 else 1
    if kind=='yakra':return (tick//5)%2 if atb>.78 else 0
    return int(atb>.78 or (tick+index*37)%180>=150)

def assert_rescue_history(o):
    s=o['state'];m=o['motion'];tick=s['ticks']
    assert integer(tick) and m['tick']==tick and m['chapter']==s['chapter'] and s['chapter'] in MAPS
    assert m['profile']=='vq03s-rescue-enemy-motion' and m['artProfile']=='vq03s-rescue-enemy-poses'
    assert m['clock']=='simulation-ticks' and m['disposed'] is False
    assert m['active']==(s['mode']=='battle') and type(m['active']) is bool
    assert m['historyLimit']==24 and integer(m['historyDropped']) and len(m['history'])<=24
    assert m['textureReadFailures']==0 and type(m['reducedMotion']) is bool
    assert m['stateMutation'] is False and m['additionalGpuResources']==0 and m['approved'] is False
    assert len(m['cache'])==3
    actions={};hurts={};counts={k:0 for k in KINDS};last=-1
    for h in m['history']:
        i=h['index'];t=h['tick'];k=h['kind'];f=h['frame'];c=h['cause']
        assert integer(i) and i<3 and k in KINDS and integer(f) and f<5
        assert integer(t) and last<=t<=tick;last=t
        assert h['mode']=='battle' and finite(h['hp']) and h['hp']>0 and finite(h['atb'])
        assert h['scope']=='texture-not-framebuffer' and type(h['reducedMotion']) is bool
        foe=s['enemies'][i];assert foe['kind']==k
        if c is not None:
            assert c['index']==i and integer(c['tick']) and integer(c['receivedTick']) and c['tick']<=c['receivedTick']<=t
            e=c['effect'];assert finite(e['x']) and finite(e['z'])
            if c['kind']=='attack':
                assert t-c['tick']<24 and e['kind']=='hit' and 'actor' not in e and not e.get('guest')
                a=e['enemyAction'];assert a['index']==i and a['tick']==c['tick']
                assert a['origin']=={'x':foe['x'],'z':foe['z']} and a['target']=={'x':e['x'],'z':e['z']}
                assert all(finite(v) for p in (a['origin'],a['target']) for v in p.values())
                assert any(p['x']==e['x'] and p['z']==e['z'] for p in [*s['players'],s['rescue']['guest']])
                key=(i,c['tick']);group=actions.setdefault(key,{'cause':c,'frames':set()});assert group['cause']==c;group['frames'].add(f)
            else:
                assert c['kind']=='hurt' and t-c['tick']<18 and c['tick']==c['receivedTick']
                assert e['kind'] in ('hit','combo') and 'enemyAction' not in e
                assert e.get('actor') in (0,1) or e.get('guest') is True or e['kind']=='combo'
                assert {'x':e['x'],'z':e['z']}=={'x':foe['x'],'z':foe['z']}
                hurts[(i,c['tick'])]=c
        assert f==frame_at(t,i,k,h['atb'],h['reducedMotion'],c)
        cell=GOLDEN['cells'][f'{k}/{f}'];assert h['cell']=={p:cell[p] for p in ('width','height','fnv1a32')}
        counts[k]+=1
    return {'textureSamples':len(m['history']),'observedKinds':counts,'sourceActions':len(actions),'pairedStrikeFollow':sum({2,3}<=g['frames'] for g in actions.values()),'recoverySequences':sum({2,3,1}<=g['frames'] for g in actions.values()),'livingRecoilEvents':len(hurts)}

def assert_rescue_report(r,expected_sha,*,require_attack=True):
    assert re.fullmatch('[0-9a-f]{40}',expected_sha)
    assert r['sourceSha']==r['build']['sourceSha']==expected_sha
    assert (r['build']['version'],r['build']['batch'])==('0.9.66','VQ03S')
    assert r['status']=='passed' and r['errors']==[] and r['nativeInputsOnly'] is True
    for name in ['physicalDevice','artApproved','fullAnimationComplete','framebufferSynchronized']:assert r[name] is False
    assert list(r['observations'])==['naga','guards','yakra']
    results={}
    for label,chapter in zip(['naga','guards','yakra'],MAPS):
        o=r['observations'][label];assert o['state']['chapter']==chapter and o['state']['mode']=='battle'
        results[label]=assert_rescue_history(o)
    if require_attack:assert sum(x['sourceActions'] for x in results.values())>0,'No genuine rescue enemy action was observed; evidence remains missing'
    return results

def capture_rescue_enemies(page,out,label,observations):
    """One readonly evaluation after an existing screenshot; no input or waiting."""
    o=page.evaluate(OBSERVE_SCRIPT)
    (out/f'rescue-enemy-{label}-observation.json').write_text(json.dumps(o,ensure_ascii=False,indent=2),encoding='utf-8')
    observations[label]=o
    assert_rescue_history(o)

def write_rescue_report(out,observations,build,source_sha,errors):
    """Independent report; does not rewrite the original rescue journey report."""
    r={'status':'running','sourceSha':source_sha,'build':build,'nativeInputsOnly':True,'physicalDevice':False,'fullAnimationComplete':False,'artApproved':False,'framebufferSynchronized':False,'observations':observations,'errors':list(errors)}
    try:
        assert not errors,errors
        r['status']='passed';r['positiveSamples']=assert_rescue_report(r,source_sha)
        r['limitations']=['Texture-cell fingerprints only; later screenshots are not synchronized framebuffer evidence.','No additional routes, keys, waits or state/time/save/collision injection.','Limited authored arm poses, not full directional animation or original-speed/device/audio/whole-game approval.']
    except Exception as exc:
        r.update(status='failed',failure=str(exc));raise
    finally:(out/'rescue-enemy-motion-report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
