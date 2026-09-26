"""Exact-source T observations of actual rescue transforms and copied textures.
This module never drives gameplay. Histories are not synchronized framebuffers.
"""
import json, math, re
from pathlib import Path

MAPS=('cathedral','passage','sanctum')
KINDS=('naga','hench','yakra')
GOLDEN=json.loads((Path(__file__).parent/'fixtures/rescue-enemy-cells.json').read_text())['cells']
OBSERVE_SCRIPT="""()=>{const a=window.__CHRONO_TEST__,v=a.view();return {state:a.snapshot(),body:v.rescueEnemyBody,renderer:v.renderer};}"""
def integer(v): return type(v) is int and v>=0
def finite(v): return type(v) in (float,int) and math.isfinite(v)
def vector(v,n): return type(v) is list and len(v)==n and all(finite(x) for x in v)
def point(v): return type(v) is dict and set(v)=={'x','z'} and all(finite(x) for x in v.values())
def near(a,b): assert finite(a) and finite(b) and abs(a-b)<=1e-7,(a,b)
def pos(v): return {'x':v['x'],'z':v['z']}
def direction(a,b):
    dx,dz=b['x']-a['x'],b['z']-a['z'];n=math.hypot(dx,dz)
    return (dx/n,dz/n) if n>1e-8 else (0,0)
def cell_valid(c,kind):
    assert c in [{p:g[p] for p in ('width','height','fnv1a32')} for key,g in GOLDEN.items() if key.startswith(kind+'/')],c

def assert_body_observation(o):
    s=o['state'];b=o['body'];tick=s['ticks']
    assert integer(tick) and b['tick']==tick and b['chapter']==s['chapter'] and s['chapter'] in MAPS
    assert s['mode'] in ('battle','victory') and b['profile']=='vq03t-rescue-body'
    assert b['disposed'] is False and b['approved'] is False and b['stateMutation'] is False
    assert type(b['reducedMotion']) is bool and b['historyLimit']==24 and integer(b['historyDropped'])
    hist=b['history'];r=b['resources'];ghosts=b['remnants']
    assert len(hist)<=24 and r['limit']==3 and r['maxTextureBytes']==27648
    assert all(integer(r[k]) for k in ('active','rawTextureBytes','created','released','creationFailures'))
    assert r['creationFailures']==0 and r['active']==len(ghosts)<=3
    assert r['created']-r['released']==r['active']
    assert 0<=r['rawTextureBytes']<=27648
    groups={};last=-1
    for h in hist:
        c=h['cause'];i=c['index'];kind=c['foeKind'];t=h['tick'];phase=h['phase']
        assert integer(i) and i<3 and kind in KINDS and integer(t) and last<=t<=tick;last=t
        assert integer(c['tick']) and integer(c['receivedTick']) and c['tick']<=c['receivedTick']<=t
        age=t-c['tick'];effect=c['effect'];foe=s['enemies'][i]
        assert foe['kind']==kind and point(c['target']) and finite(c['hpBefore']) and finite(c['hpAfter'])
        assert finite(effect['x']) and finite(effect['z'])
        assert h['scope']=='transform-texture-not-framebuffer'
        assert vector(h['position'],3) and vector(h['scale'],3) and point(h['offset']) and finite(h['alpha'])
        assert type(h['enabled']) is bool and type(h['originalEnabled']) is bool
        key=(kind,i,c['kind'],c['tick']);group=groups.setdefault(key,{'cause':c,'phases':set(),'positive':False})
        assert group['cause']==c;group['phases'].add(phase)
        if c['kind']=='attack':
            a=effect['enemyAction'];assert effect['kind']=='hit' and 'actor' not in effect and not effect.get('guest')
            assert a['index']==i and a['tick']==c['tick'] and a['origin']==c['origin']==pos(foe)
            assert a['target']==c['target']==pos(effect) and point(c['origin'])
            assert any(pos(p)==c['target'] for p in [*s['players'],s['rescue']['guest']])
            assert c['hpBefore']==c['hpAfter']>0
            anchor=c['origin'];d=direction(c['origin'],c['target']);duration,reach=24,.20
        else:
            assert c['kind'] in ('recoil','death') and effect['kind'] in ('hit','combo') and 'enemyAction' not in effect
            assert effect.get('actor') in (0,1) or effect.get('guest') is True or effect['kind']=='combo'
            assert c['tick']==c['receivedTick'] and c['target']==pos(effect)==pos(foe)
            assert sum(pos(e)==c['target'] for e in s['enemies'])==1
            assert c['hpBefore']>0
            if c['kind']=='recoil':
                assert c['hpAfter']>0 and point(c['origin']) and c['origin']==effect['origin']
                anchor=c['target'];d=direction(c['origin'],c['target']);duration,reach=18,.10
            else:
                assert c['hpAfter']<=0 and h['originalEnabled'] is False
                assert c['origin'] is None or (point(c['origin']) and c['origin']==effect.get('origin'))
                assert h['offset']=={'x':0,'z':0};cell_valid(h['cell'],kind)
                g=h['geometry'];assert vector(g['base'],3) and vector(g['scale'],3) and vector(g['up'],3)
                assert finite(g['height']) and g['height']>0 and g['scale'][1]>0
                near(sum(x*x for x in g['up']),1)
                if phase in ('settle','fade'):
                    assert 0<=age<24 and phase==('settle' if age<12 else 'fade') and h['enabled'] is True
                    ratio=1-.7*age/24;near(h['alpha'],1-age/24)
                    for j in range(3):
                        near(h['scale'][j],g['scale'][j]*(ratio if j==1 else 1))
                        near(h['position'][j],g['base'][j]-g['up'][j]*g['height']*g['scale'][1]*.5*(1-ratio))
                else:
                    assert phase in ('expired','cancelled') and h['enabled'] is False and h['alpha']==0
                    if phase=='expired':assert age>=24
                continue
        assert h['cell'] is None and h['originalEnabled'] is True and h['enabled'] is True and h['alpha']==1
        assert phase in ('start','out','return','restored')
        if phase=='restored':assert age>=duration;k=0
        else:
            assert 0<=age<duration and phase==('start' if age==0 else 'out' if age<duration/2 else 'return')
            k=math.sin(math.pi*age/duration)*reach if age else 0
        for j,name in ((0,'x'),(2,'z')):
            offset=d[0 if name=='x' else 1]*k
            near(h['offset'][name],offset);near(h['position'][j],anchor[name]+offset)
        group['positive'] |= math.hypot(h['offset']['x'],h['offset']['z'])>1e-8
    seen=set();raw=0
    for g in ghosts:
        i=g['index'];assert integer(i) and i<3 and i not in seen;seen.add(i)
        assert s['enemies'][i]['hp']<=0 and g['originalEnabled'] is False
        assert integer(g['deathTick']) and 0<=tick-g['deathTick']<24 and g['textureUploads']==1
        assert g['enabled']==(not b['reducedMotion']);cell_valid(g['cell'],s['enemies'][i]['kind'])
        assert vector(g['position'],3) and vector(g['scale'],3) and finite(g['alpha']) and 0<g['alpha']<=1
        if not b['reducedMotion']:near(g['alpha'],1-(tick-g['deathTick'])/24)
        raw+=g['cell']['width']*g['cell']['height']*4
    assert raw==r['rawTextureBytes']
    return {'sourceActions':sum(g['cause']['kind']=='attack' for g in groups.values()),
            'positiveBodyActions':sum(g['cause']['kind']=='attack' and g['positive'] for g in groups.values()),
            'positiveRecoils':sum(g['cause']['kind']=='recoil' and g['positive'] for g in groups.values()),
            'restoredBodyActions':sum(g['cause']['kind']=='attack' and {'out','return','restored'}<=g['phases'] for g in groups.values()),
            'deathRemnants':sum(g['cause']['kind']=='death' for g in groups.values()),
            'completeRemnants':sum(g['cause']['kind']=='death' and {'settle','fade','expired'}<=g['phases'] for g in groups.values()),
            'cancelledRemnants':sum(g['cause']['kind']=='death' and 'cancelled' in g['phases'] for g in groups.values()),
            'historySamples':len(hist)}

def assert_body_report(r,expected_sha,*,require_action=True):
    assert re.fullmatch('[0-9a-f]{40}',expected_sha)
    assert r['sourceSha']==r['build']['sourceSha']==expected_sha
    assert (r['build']['version'],r['build']['batch'])==('0.9.67','VQ03T')
    assert r['status']=='passed' and r['errors']==[] and r['nativeInputsOnly'] is True
    for k in ('artApproved','fullAnimationComplete','framebufferSynchronized','physicalDevice'):assert r[k] is False
    required=['naga','cathedral-victory','guards','passage-victory','yakra','sanctum-victory']
    assert list(r['observations'])==required
    out={}
    for label,chapter in zip(required,('cathedral','cathedral','passage','passage','sanctum','sanctum')):
        o=r['observations'][label];assert o['state']['chapter']==chapter
        assert o['state']['mode']==('victory' if label.endswith('-victory') else 'battle')
        out[label]=assert_body_observation(o)
    if require_action:assert sum(v['positiveBodyActions'] for v in out.values())>0,'No actual positive rescue body attack observed'
    return out

def capture_rescue_body(page,out,label,observations):
    """One readonly evaluation; no keys, game writes or added waits."""
    o=page.evaluate(OBSERVE_SCRIPT)
    (out/f'rescue-body-{label}-observation.json').write_text(json.dumps(o,ensure_ascii=False,indent=2),encoding='utf-8')
    observations[label]=o
    assert_body_observation(o)

def write_body_report(out,observations,build,source_sha,errors):
    r={'status':'running','sourceSha':source_sha,'build':build,'nativeInputsOnly':True,'physicalDevice':False,'fullAnimationComplete':False,'artApproved':False,'framebufferSynchronized':False,'observations':observations,'errors':list(errors)}
    try:
        assert not errors,errors
        r['status']='passed';r['positiveSamples']=assert_body_report(r,source_sha)
        r['limitations']=['Actual transforms/static texture copies only; histories are not synchronous framebuffer or original-speed comfort.', 'Existing normal inputs and budgets unchanged; no native state/time/save/collision injection.', 'Victory may freeze simulation before remnant expiry. Missing death phases remain gaps, not fabricated completion.']
    except Exception as exc:
        r.update(status='failed',failure=str(exc));raise
    finally:(out/'rescue-enemy-body-report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
