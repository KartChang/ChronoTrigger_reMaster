"""Readonly actual trial texture evidence. Never changes game, clocks, saves or reports."""
import json,re,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CELLS=json.loads((ROOT/'tests/fixtures/trial-enemy-cells.json').read_text())['cells']
OBSERVE_SCRIPT='''()=>{const t=window.__CHRONO_TEST__;return {state:t.snapshot(),motion:t.view().trialMaps.enemyMotion};}'''
KINDS=('prisonGuard','tankHead','tankBody','tankWheel')
def integer(n):return isinstance(n,int) and not isinstance(n,bool)
def finite(n):return isinstance(n,(int,float)) and not isinstance(n,bool) and math.isfinite(n)
def assert_trial_observation(o):
    s=o['state'];m=o['motion'];assert m['profile']=='vq03u-trial-enemy-motion' and m['artProfile']=='vq03u-trial-enemy-cells'
    assert m['clock']=='simulation-ticks' and m['tick']==s['ticks'] and m['chapter']==s['chapter']
    assert integer(m['tick']) and m['tick']>=0
    assert m['stateMutation'] is False and m['additionalGpuResources']==0 and m['approved'] is False and m['disposed'] is False
    assert m['historyLimit']==24 and len(m['history'])<=24 and m['textureReadFailures']==0 and integer(m['historyDropped']) and m['historyDropped']>=0
    groups={};previous=-1
    for h in m['history']:
        assert h['chapter']==s['chapter'] and h['chapter'] in ('cellblock','prisonstairs','prisonbridge') and h['mode']=='battle'
        assert integer(h['tick']) and previous<=h['tick']<=s['ticks'];previous=h['tick']
        assert integer(h['index']) and 0<=h['index']<3 and h['kind'] in KINDS
        if h['kind']=='prisonGuard':assert h['chapter'] in ('cellblock','prisonstairs') and h['index']<2
        else:assert h['chapter']=='prisonbridge' and h['index']==('tankHead','tankBody','tankWheel').index(h['kind'])
        assert finite(h['hp']) and h['hp']>0 and finite(h['atb']) and isinstance(h['reducedMotion'],bool)
        assert h['scope']=='texture-not-framebuffer' and integer(h['frame']) and 0<=h['frame']<=4
        expected_cell=CELLS[f"{h['kind']}/{h['frame']}"];assert h['cell']=={k:expected_cell[k] for k in ('width','height','fnv1a32')}
        cause=h['cause'];expected=0 if h['kind']=='prisonGuard' else (h['tick']//18)%2
        if cause:
            assert cause['kind'] in ('attack','repair','hurt') and cause['index']==h['index']
            assert integer(cause['tick']) and 0<=cause['tick']<=cause['receivedTick']<=h['tick'] and integer(cause['receivedTick'])
            age=h['tick']-cause['tick'];e=cause['effect'];assert finite(e['x']) and finite(e['z'])
            if cause['kind']=='hurt':
                assert age<18 and cause['tick']==cause['receivedTick'] and all(finite(cause[k]) for k in ('hpBefore','hpAfter')) and cause['hpBefore']>cause['hpAfter']>0
                assert e.get('enemyAction') is None and e['kind'] in ('hit','combo') and (e.get('actor') in (0,1) or e.get('guest') is True or e['kind']=='combo')
                assert re.fullmatch(r'[1-9][0-9]*',e['text']);expected=4
            else:
                assert age<24;expected=2 if age<8 else 3 if age<16 else 1
                a=e['enemyAction'];assert a['index']==h['index'] and a['tick']==cause['tick'] and e.get('actor') is None and not e.get('guest')
                assert all(finite(a[p][q]) for p in ('origin','target') for q in ('x','z')) and a['target']=={'x':e['x'],'z':e['z']}
                assert s['enemies'][h['index']]['kind']==h['kind']
                foe=s['enemies'][h['index']];assert a['origin']=={'x':foe['x'],'z':foe['z']}
                if cause['kind']=='repair':
                    assert h['kind']=='tankHead' and e['kind']=='heal' and re.fullmatch(r'\+[1-9][0-9]*',e['text']) and int(e['text'][1:])<=35
                    assert any(f['kind'] in ('tankBody','tankWheel') and f['x']==e['x'] and f['z']==e['z'] for f in s['enemies'])
                else:assert h['kind']!='tankHead' and e['kind']=='hit' and re.fullmatch(r'−[1-9][0-9]*',e['text'])
            key=(h['index'],cause['kind'],cause['tick']);g=groups.setdefault(key,{'kind':h['kind'],'operation':cause['kind'],'frames':set(),'effects':e})
            assert g['effects']==e
            if not h['reducedMotion']:g['frames'].add(h['frame'])
        if h['reducedMotion']:expected=0
        assert h['frame']==expected,(h['kind'],h['tick'],h['frame'],expected)
    gs=list(groups.values())
    return {'textureSamples':len(m['history']),'sourceActions':sum(g['operation']=='attack' for g in gs),'repairActions':sum(g['operation']=='repair' for g in gs),'livingRecoils':sum(g['operation']=='hurt' for g in gs),'pairedStrikeFollow':sum(g['operation']!='hurt' and {2,3}<=g['frames'] for g in gs),'completeActionClips':sum(g['operation']!='hurt' and {1,2,3}<=g['frames'] for g in gs),'guardActions':sum(g['kind']=='prisonGuard' and g['operation']=='attack' for g in gs),'bodyActions':sum(g['kind']=='tankBody' and g['operation']=='attack' for g in gs),'wheelActions':sum(g['kind']=='tankWheel' and g['operation']=='attack' for g in gs)}
def assert_trial_report(r,expected_sha,*,require_actions=True,expected_build=('0.9.68','VQ03U')):
    assert re.fullmatch(r'[0-9a-f]{40}',expected_sha) and r['sourceSha']==r['build']['sourceSha']==expected_sha
    assert (r['build']['version'],r['build']['batch'])==tuple(expected_build)
    assert r['status']=='passed' and r['errors']==[] and r['nativeInputsOnly'] is True
    for name in ('physicalDevice','artApproved','fullAnimationComplete','framebufferSynchronized'):assert r[name] is False
    required=('cellguards-victory','stairguards-victory','tank-animation','tank-repair','tank-victory','stairguards-victory-2')
    assert tuple(r['observations'])==required
    out={}
    for name,o in r['observations'].items():
        assert o['state']['mode']==('victory' if 'victory' in name else 'battle')
        out[name]=assert_trial_observation(o)
    if require_actions:
        assert sum(x['sourceActions'] for x in out.values())>0,'No actual outgoing trial action'
        assert out['tank-repair']['repairActions']>0,'No actual head repair action'
    return out

def capture_trial_motion(page,out,label,observations):
    """One read, following an existing boundary; no interaction or wait."""
    key=label if label not in observations else label+'-2'
    assert key not in observations
    o=page.evaluate(OBSERVE_SCRIPT);(out/f'trial-enemy-{key}-observation.json').write_text(json.dumps(o,ensure_ascii=False,indent=2),encoding='utf-8')
    observations[key]=o;assert_trial_observation(o)

def write_trial_motion_report(out,observations,build,sha,errors,*,expected_build=('0.9.68','VQ03U')):
    r={'status':'running','sourceSha':sha,'build':build,'nativeInputsOnly':True,'physicalDevice':False,'artApproved':False,'fullAnimationComplete':False,'framebufferSynchronized':False,'observations':observations,'errors':list(errors)}
    try:
        r['status']='passed';r['positiveSamples']=assert_trial_report(r,sha,expected_build=expected_build)
        r['limitations']=['Read-only source/cell observations,not synchronized framebuffer or original-speed evidence.','Observation histories overlap: per-boundary action counts must not be added as unique events.','Missing guard/part phases stay evidence gaps; no native state/time/save/collision changes.']
    except Exception as exc:r.update(status='failed',failure=str(exc));raise
    finally:(out/'trial-enemy-motion-report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
