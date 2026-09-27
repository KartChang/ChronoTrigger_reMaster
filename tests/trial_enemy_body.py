"""Read-only source/transform/death-copy checks. Never edits game/time/save/collision."""
import json,math,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CELLS=json.loads((ROOT/'tests/fixtures/trial-enemy-cells.json').read_text())['cells']
KINDS=('prisonGuard','tankHead','tankBody','tankWheel')
BOUNDARIES=('cellguards-victory','stairguards-victory','tank-animation','tank-repair','tank-victory','stairguards-victory-2')
OBSERVE_SCRIPT='''()=>{const t=window.__CHRONO_TEST__;return {state:t.snapshot(),body:t.view().trialMaps.enemyBody};}'''
def integer(n):return isinstance(n,int) and not isinstance(n,bool)
def finite(n):return isinstance(n,(int,float)) and not isinstance(n,bool) and math.isfinite(n)
def vec(v):assert isinstance(v,list) and len(v)==3 and all(finite(x) for x in v)
def point(p):assert isinstance(p,dict) and finite(p.get('x')) and finite(p.get('z'))
def same(a,b):assert abs(a-b)<1e-9,(a,b)
def assert_trial_body_observation(o):
    s=o['state'];b=o['body'];assert b['profile']=='vq03v-trial-body' and b['clock']=='simulation-ticks'
    assert b['tick']==s['ticks'] and integer(b['tick']) and b['tick']>=0 and b['chapter']==s['chapter']
    assert b['stateMutation'] is False and b['approved'] is False and b['disposed'] is False
    assert isinstance(b['reducedMotion'],bool) and b['historyLimit']==24 and len(b['history'])<=24 and integer(b['historyDropped']) and b['historyDropped']>=0
    r=b['resources'];assert r['limit']==3 and r['maxTextureBytes']==49152
    for key in ('active','rawTextureBytes','created','released','creationFailures'):assert integer(r[key]) and r[key]>=0
    assert r['active']<=3 and r['active']==len(b['remnants']) and r['created']-r['released']==r['active'] and r['rawTextureBytes']<=49152 and r['creationFailures']==0
    for g in b['remnants']:
        assert g['kind'] in KINDS and integer(g['index']) and 0<=g['index']<3
        assert integer(g['deathTick']) and 0<=g['deathTick']<=b['tick'] and b['tick']-g['deathTick']<24
        assert g['textureUploads']==1 and g['enabled'] is True and g['originalEnabled'] is False
    assert r['rawTextureBytes']==sum(g['cell']['width']*g['cell']['height']*4 for g in b['remnants'])
    groups={};previous=-1
    for h in b['history']:
        c=h['cause'];e=c['effect'];kind=c['foeKind'];i=c['index'];age=h['tick']-c['tick']
        assert kind in KINDS and integer(i) and 0<=i<3 and c['chapter']==s['chapter']
        assert integer(h['tick']) and previous<=h['tick']<=s['ticks'];previous=h['tick']
        assert integer(c['tick']) and 0<=c['tick']<=c['receivedTick']<=h['tick'] and integer(c['receivedTick'])
        if kind=='prisonGuard':assert c['chapter'] in ('cellblock','prisonstairs') and i<2
        else:assert c['chapter']=='prisonbridge' and i==KINDS.index(kind)-1
        assert h['scope']=='transform-texture-not-framebuffer' and isinstance(h['reducedMotion'],bool)
        assert all(isinstance(h[x],bool) for x in ('enabled','originalEnabled'))
        for v in ('base','position','scale'):vec(h[v])
        point(h['offset']);point(e);assert finite(h['alpha']) and finite(c['hpBefore']) and finite(c['hpAfter'])
        foe=s['enemies'][i];assert foe['kind']==kind
        key=(c['chapter'],i,c['kind'],c['tick']);groups.setdefault(key,[]).append(h)
        if c['kind']=='attack':
            assert kind!='tankHead' and e['kind']=='hit' and 'actor' not in e and not e.get('guest')
            a=e['enemyAction'];point(a['origin']);point(a['target'])
            assert a['index']==i and a['tick']==c['tick'] and a['origin']=={'x':foe['x'],'z':foe['z']} and a['target']=={'x':e['x'],'z':e['z']}
            assert any(p['x']==e['x'] and p['z']==e['z'] for p in s['players'])
            assert c['hpBefore']==c['hpAfter'] and c['hpAfter']>0
        else:
            assert c['kind'] in ('recoil','death') and not e.get('enemyAction') and e['kind'] in ('hit','combo')
            assert e.get('actor') in (0,1) or e.get('guest') is True or e['kind']=='combo'
            assert e['x']==foe['x'] and e['z']==foe['z'] and c['hpBefore']>c['hpAfter']
            if c['kind']=='recoil':point(e.get('origin'));assert c['hpAfter']>0
            else:assert c['hpBefore']>0 and c['hpAfter']<=0 and foe['hp']<=0
        if c['kind']!='death':
            duration=24 if c['kind']=='attack' else 18
            assert h['phase'] in ('start','out','return','expired') and h['cell'] is None and h['geometry'] is None
            if h['phase']=='expired':assert age>=duration
            else:assert 0<=age<duration and h['enabled'] and h['originalEnabled']
            if h['phase']=='start':assert age==0
            if h['phase']=='out':assert 0<age<duration/2
            if h['phase']=='return':assert duration/2<=age<duration
            origin=e['enemyAction']['origin'] if c['kind']=='attack' else e['origin'];dx=e['x']-origin['x'];dz=e['z']-origin['z'];length=math.hypot(dx,dz)
            distance=-.10 if c['kind']=='recoil' else {'prisonGuard':.20,'tankBody':-.08,'tankWheel':.10}[kind]
            amount=math.sin(math.pi*age/duration)*distance if 0<age<duration and not h['reducedMotion'] else 0
            x=dx/length*amount if length else 0;z=dz/length*amount if length else 0
            same(h['offset']['x'],x);same(h['offset']['z'],z)
            same(h['position'][0],h['base'][0]+x);same(h['position'][1],h['base'][1]);same(h['position'][2],h['base'][2]+z)
        else:
            assert h['phase'] in ('start','fading','late','expired','cancelled') and h['originalEnabled'] is False
            cell=h['cell'];assert cell in [{x:CELLS[f'{kind}/{f}'][x] for x in ('width','height','fnv1a32')} for f in range(5)]
            geo=h['geometry'];assert geo and finite(geo['height']) and geo['height']>0
            for v in ('base','scale','up'):vec(geo[v])
            if h['phase']=='expired':assert age>=24 and h['enabled'] is False
            elif h['phase']=='cancelled':assert h['enabled'] is False
            else:
                assert 0<=age<24 and h['enabled'] and h['reducedMotion'] is False
                if h['phase']=='start':assert age==0
                if h['phase']=='fading':assert 0<age<12
                if h['phase']=='late':assert 12<=age<24
                q=age/24;same(h['alpha'],.82*(1-q));same(h['scale'][0],geo['scale'][0]);same(h['scale'][1],geo['scale'][1]*(1-.6*q));same(h['scale'][2],geo['scale'][2])
                for j in range(3):same(h['position'][j],geo['base'][j]-geo['up'][j]*geo['height']*geo['scale'][1]*.3*q)
    actions=restored=recoils=deaths=complete=0
    for key,rows in groups.items():
        phases={h['phase'] for h in rows};positive=any(abs(h['offset']['x'])+abs(h['offset']['z'])>1e-9 for h in rows)
        if key[2]=='attack':actions+=positive;restored+=positive and 'expired' in phases
        elif key[2]=='recoil':recoils+=positive
        else:
            deaths+=1;complete+=all(p in phases for p in ('start','fading','late','expired'))
            assert all(h['cell']==rows[0]['cell'] for h in rows),'Copied texture changed'
    return {'transformSamples':len(b['history']),'positiveBodyActions':actions,'restoredBodyActions':restored,'positiveRecoils':recoils,'deathRemnants':deaths,'completeRemnants':complete}

def assert_trial_body_report(r,sha,*,require_actions=True):
    assert re.fullmatch(r'[0-9a-f]{40}',sha) and r['sourceSha']==r['build']['sourceSha']==sha
    assert (r['build']['version'],r['build']['batch'])==('0.9.69','VQ03V')
    assert r['status']=='passed' and r['errors']==[] and r['nativeInputsOnly'] is True
    for k in ('physicalDevice','artApproved','fullAnimationComplete','framebufferSynchronized'):assert r[k] is False
    assert tuple(r['observations'])==BOUNDARIES
    out={}
    for name,o in r['observations'].items():
        assert o['state']['mode']==('victory' if 'victory' in name else 'battle');out[name]=assert_trial_body_observation(o)
    if require_actions:assert any(x['positiveBodyActions'] for x in out.values()),'No positive source-directed trial body action'
    return out

def capture_trial_body(page,out,label,observations):
    """A single read after the existing boundary. No key, click, wait or game-state write."""
    key=label if label not in observations else label+'-2';assert key not in observations
    o=page.evaluate(OBSERVE_SCRIPT);(out/f'trial-body-{key}-observation.json').write_text(json.dumps(o,ensure_ascii=False,indent=2),encoding='utf-8')
    observations[key]=o;assert_trial_body_observation(o)

def write_trial_body_report(out,observations,build,sha,errors):
    r={'status':'running','sourceSha':sha,'build':build,'nativeInputsOnly':True,'physicalDevice':False,'artApproved':False,'fullAnimationComplete':False,'framebufferSynchronized':False,'observations':observations,'errors':list(errors)}
    try:
        r['status']='passed';r['positiveSamples']=assert_trial_body_report(r,sha)
        r['limitations']=['Transform/static-texture history is not synchronized framebuffer or original-speed proof.','Per-boundary histories overlap; never sum as independent events.','Victory may stop simulation before the last death expiry; missing phases remain gaps.']
    except Exception as exc:r.update(status='failed',failure=str(exc));raise
    finally:(out/'trial-enemy-body-report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
