"""Read-only body-transform/texture evidence, never synchronized framebuffer evidence.
Synthetic unit fixtures are not native observations. Production uses only actual delivered
combat effects; the optional native suffix uses real controls and the existing fixed clock.
"""
import math,re,json,time
OBSERVE_SCRIPT=r'''() => {
 const api=window.__CHRONO_TEST__,state=api.snapshot(),view=api.view();
 return {state,body:view.fieldEnemyBody,renderer:view.renderer,paused:api.paused(),
  observation:'read-only-native-session',physicalDevice:false,artApproved:false,
  transformHistoryIsFramebuffer:false};
}'''
POINTS=[(8,15,[224,209,122,255]),(9,16,[41,43,56,255]),(6,29,[48,45,64,255])]
def integer(n):return type(n) is int and n>=0
def finite(n):return type(n) in (float,int) and math.isfinite(n)
def vec(v):return isinstance(v,dict) and all(finite(v[k]) for k in ('x','z'))
def near(a,b):assert finite(a) and abs(a-b)<1e-8,(a,b)
def texture(value):
    assert value['cell']=={'width':24,'height':32}
    assert len(value['samples'])==3
    for p,(x,y,c) in zip(value['samples'],POINTS):assert (p['x'],p['y'],p['rgba'])==(x,y,c)
def assert_body_history(record,*,positive_motion=False,positive_death=False):
    s=record['state'];b=record['body'];tick=s['ticks']
    assert integer(tick) and b['tick']==tick and b['chapter']==s['chapter']=='canyon'
    assert s['mode']=='battle' and b['profile']=='vq03o-field-body-response'
    assert b['disposed'] is False and b['approved'] is False and b['reducedMotion'] is False
    assert record['paused'] is False and record['observation']=='read-only-native-session'
    assert record['transformHistoryIsFramebuffer'] is False
    assert record['physicalDevice'] is False and record['artApproved'] is False
    assert b['historyLimit']==24 and integer(b['historyDropped']) and len(b['history'])<=24
    r=b['resources'];assert r['limit']==3 and integer(r['active']) and r['active']<=3
    assert r['rawTextureBytes']==r['active']*3072 and r['created']-r['released']==r['active'] and r['creationFailures']==0
    assert len(b['remnants'])==r['active']
    attacks={};recoils=[];deaths={};last=-1
    for h in b['history']:
        t=h['tick'];i=h['index'];c=h['cause'];e=c['effect'];kind=h['kind'];age=t-c['tick']
        assert integer(t) and last<=t<=tick;last=t
        assert type(i) is int and 0<=i<len(s['enemies']) and i<3
        assert c['index']==i and c['kind']==kind and integer(c['tick']) and integer(c['receivedTick']) and c['tick']<=c['receivedTick']<=t
        assert vec(c['target']) and vec(h['offset']) and len(h['position'])==3 and all(map(finite,h['position']))
        assert len(h['scale'])==3 and all(map(finite,h['scale'])) and h['scope']=='render-only-transform-not-framebuffer'
        foe=s['enemies'][i];assert c['target']=={'x':e['x'],'z':e['z']}
        if kind=='attack':
            a=e['enemyAction'];assert e['kind']=='hit' and 'actor' not in e and not e.get('guest')
            assert a=={'index':i,'tick':c['tick'],'origin':c['origin'],'target':c['target']}
            assert c['origin']=={'x':foe['x'],'z':foe['z']} and c['hpBefore']==c['hpAfter'] and c['hpAfter']>0
            duration,reach=24,.20;origin=c['origin'];target=c['target']
        elif kind=='recoil':
            assert e['kind'] in ('hit','combo') and 'enemyAction' not in e
            assert e.get('actor') in (0,1) or e.get('guest') is True or e['kind']=='combo'
            assert c['origin']==e['origin'] and vec(c['origin']) and c['tick']==c['receivedTick']
            assert c['hpBefore']>c['hpAfter']>0 and c['target']=={'x':foe['x'],'z':foe['z']}
            duration,reach=18,.10;origin=c['origin'];target=c['target']
        else:
            assert kind=='death' and e['kind'] in ('hit','combo') and 'enemyAction' not in e
            assert e.get('actor') in (0,1) or e.get('guest') is True or e['kind']=='combo'
            assert c['hpBefore']>0 and c['hpAfter']==foe['hp']==0
            assert c['target']=={'x':foe['x'],'z':foe['z']} and c['tick']==c['receivedTick']
            assert c['origin']==e.get('origin') and (c['origin'] is None or vec(c['origin']))
            assert h['originalEnabled'] is False and h['offset']=={'x':0,'z':0}
            texture(h['texture']);key=(i,c['tick']);deaths.setdefault(key,set()).add(h['phase'])
            if h['phase']=='expired':
                assert age>=24 and h['enabled'] is False and h['alpha']==0
            else:
                assert 0<=age<24 and h['enabled'] is True and h['phase']==('settle' if age<12 else 'fade')
                near(h['alpha'],1-age/24);near(h['scale'][1],1.3*(1-.7*age/24))
            continue
        assert h['originalEnabled'] is True and h['enabled'] is True and h['alpha']==1
        assert 0<=age<duration and h['phase']==('out' if age<duration/2 else 'return')
        dx=target['x']-origin['x'];dz=target['z']-origin['z'];d=math.hypot(dx,dz)
        weight=math.sin(math.pi*age/duration) if age else 0
        near(h['offset']['x'],dx/d*reach*weight if d>1e-8 else 0)
        near(h['offset']['z'],dz/d*reach*weight if d>1e-8 else 0)
        near(h['position'][0],foe['x']+h['offset']['x']);near(h['position'][2],foe['z']+h['offset']['z'])
        if kind=='attack':attacks.setdefault((i,c['tick']),set()).add(h['phase'])
        elif math.hypot(h['offset']['x'],h['offset']['z'])>.001:recoils.append(h)
    for g in b['remnants']:
        assert g['originalEnabled'] is False and g['textureUploads']==1 and g['hpBefore']>0 and g['hpAfter']==0
        assert g['enabled'] is True and 0<=tick-g['deathTick']<24
        texture({'cell':g['cell'],'samples':g['pixels']})
    pairs=sum(phases=={'out','return'} for phases in attacks.values())
    completed=sum({'settle','fade','expired'}<=phases for phases in deaths.values())
    if positive_motion:assert pairs>0 and len(recoils)>0,'No positive source-bound movement/recoil'
    if positive_death:assert completed>0 and r['active']==0 and r['created']>0,'No witnessed and expired death remnant'
    return {'pairedBodyActions':pairs,'positiveBodyRecoils':len(recoils),'completeRemnants':completed}

def assert_body_report(report,expected_sha,*,expected_build=('0.9.62','VQ03O')):
    assert re.fullmatch('[0-9a-f]{40}',expected_sha)
    assert report['sourceSha']==report['build']['sourceSha']==expected_sha
    assert (report['build']['version'],report['build']['batch'])==expected_build
    assert report['status']=='passed' and report['nativeInputsOnly'] is True and report['errors']==[]
    a=report['beforeLethal']['state'];b=report['afterLethal']['state'];i=report['targetIndex']
    assert sorted(e['hp'] for e in a['enemies'])==[18,48,48] and a['enemies'][i]['hp']==18
    assert a['players'][0]['atb']>=1 and b['enemies'][i]['hp']==0 and len(b['enemies'])==3
    assert all(x['hp']==y['hp'] for n,(x,y) in enumerate(zip(a['enemies'],b['enemies'])) if n!=i)
    assert a['players'][0]['mp']==b['players'][0]['mp']
    assert a['ticks']<=b['ticks']<=report['expired']['state']['ticks']
    motion=assert_body_history(report['beforeLethal'],positive_motion=True)
    assert_body_history(report['afterLethal'])
    death=assert_body_history(report['expired'],positive_death=True)
    assert any(h['kind']=='death' and h['index']==i and h['cause']['hpBefore']==18 and h['cause']['effect'].get('actor')==0 and h['cause']['effect']['text']=='30' for h in report['expired']['body']['history'])
    assert report['physicalDevice'] is False and report['artApproved'] is False and report['wholeGameAccepted'] is False
    return {**motion,'completeRemnants':death['completeRemnants']}

def observe_native_body_suffix(page,out,build,source_sha,errors,*,expected_build=('0.9.62','VQ03O')):
    """An additive suffix, after every original N key/wait/capture/assertion.
    Does not change input timing of the existing N scenario. No injected native state.
    """
    r={'status':'running','sourceSha':source_sha,'build':build,'nativeInputsOnly':True,
       'physicalDevice':False,'artApproved':False,'wholeGameAccepted':False,'waits':[]}
    def capture(name):
        v=page.evaluate(OBSERVE_SCRIPT);r[name]=v
        (out/('body-'+name+'.json')).write_text(json.dumps(v,ensure_ascii=False,indent=2),encoding='utf-8')
        return v
    def wait(predicate,budget):
        start=page.evaluate('window.__CHRONO_TEST__.snapshot().ticks');began=time.monotonic()
        h=page.wait_for_function(r'''({start,budget,predicate})=>{
          const api=window.__CHRONO_TEST__,s=api.snapshot(),b=api.view().fieldEnemyBody;
          if(api.paused()||s.mode!=='battle'||s.ticks<start||s.ticks-start>budget)return {ok:false,state:s,body:b};
          return Function('s','b','return ('+predicate+')')(s,b)?{ok:true,state:s,body:b}:false;
        }''',arg={'start':start,'budget':budget,'predicate':predicate},polling='raf',timeout=120000)
        value=h.json_value();h.dispose();r['waits'].append({'start':start,'budget':budget,'predicate':predicate,'wallSeconds':round(time.monotonic()-began,2),'observed':value})
        assert value['ok'],value
    try:
        wait("b.history.some(h=>h.kind==='attack'&&h.phase==='return')&&s.players[0].atb>=1",180)
        initial=page.evaluate(OBSERVE_SCRIPT);i=next(i for i,e in enumerate(initial['state']['enemies']) if e['hp']==18)
        r['targetIndex']=i
        # Existing target-selection UI, not assignment to snapshot/target state.
        for _ in range(3):
            if page.locator('#target-name0').inner_text()=='敵 '+str(i+1):break
            page.click('[data-target-slot="0"][data-direction="next"]')
        assert page.locator('#target-name0').inner_text()=='敵 '+str(i+1)
        capture('beforeLethal');assert_body_history(r['beforeLethal'],positive_motion=True)
        page.click('[data-slot="0"][data-action="attack"]')
        wait(f"s.enemies[{i}].hp===0&&b.history.some(h=>h.index==={i}&&h.kind==='death')",60)
        capture('afterLethal')
        page.screenshot(path=str(out/'08-after-body-death-observation.png'))
        wait(f"b.history.some(h=>h.index==={i}&&h.kind==='death'&&h.phase==='expired')&&b.resources.active===0",60)
        capture('expired');page.screenshot(path=str(out/'09-after-body-expiry-observation.png'))
        assert not errors,errors
        r.update(status='passed',errors=list(errors),limitations=['Transform/texture histories are draw-tick observations, not synchronized framebuffer captures.','Native suffix only; not original-speed comfort, listening, physical-device or full-animation approval.'])
        r['positiveSamples']=assert_body_report(r,source_sha,expected_build=expected_build)
    except Exception as exc:
        r.update(status='failed',failure=str(exc),errors=list(errors))
        try:capture('failureObservation')
        except Exception as observation_error:r['observationError']=str(observation_error)
        raise
    finally:(out/'field-enemy-body-report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
