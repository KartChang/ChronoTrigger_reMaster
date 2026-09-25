"""Read-only N history checks. Unit fixtures are not native evidence.
History pixels are actual texture reads at draw ticks, NOT full-frame screenshots.
"""
import re
MASKS=[[0,0,1,0],[0,1,0,0],[1,1,0,0],[0,0,0,1],[0,1,0,1],[0,0,1,1]]
POINTS=[(3,19),(3,20),(3,25),(21,22)]
def integer(n): return type(n) is int and n>=0

def assert_action_history(record, *, require_positive=False):
    state=record['state']; m=record['motion']; tick=state['ticks']
    assert integer(tick) and m['tick']==tick
    assert m['profile']=='vq03m-field-imp-motion' and m['actionProfile']=='vq03n-field-imp-action'
    assert m['active'] is True and m['approved'] is False and m['disposed'] is False
    assert state['chapter'] in ['canyon','forest'] and state['mode']=='battle' and m['battle'] is True
    assert m['historyLimit']==24 and integer(m['historyDropped']) and len(m['history'])<=24
    last=-1; hurt=[]; strikes={}; follows={}
    for h in m['history']:
        i=h['index']; t=h['tick']; cause=h['cause']; effect=cause['effect']; enemy=state['enemies'][i]
        assert type(i) is int and 0<=i<3 and h['name']=='enemy-'+str(i)
        assert integer(t) and last<=t<=tick; last=t
        assert h['chapter']==state['chapter'] and h['mode']=='battle'
        assert h['scope']=='actual-texture-after-pose-update-not-framebuffer'
        assert h['cell']=={'width':24,'height':32} and h['enemyHp']>0
        assert type(h['reducedMotion']) is bool
        received=cause['receivedTick']; assert integer(received) and received<=t and cause['index']==i
        ht=h['hurtTick']; at=h['attackTick']
        assert ht is None or (integer(ht) and ht<=t)
        assert at is None or (integer(at) and at<=t)
        if h['reducedMotion']: expected=0
        elif ht is not None and t-ht<18: expected=3
        elif at is not None and t-at<24: expected=4 if t-at<8 else 5 if t-at<16 else 2
        else: expected=1 if ((t+i*11)//24)%4==3 else 2
        assert type(h['frame']) is int and h['frame']==expected
        assert len(h['samples'])==4
        for s,(x,y),c in zip(h['samples'],POINTS,MASKS[expected]):
            assert (s['x'],s['y'])==(x,y) and s['rgba']==([70,131,145,255] if c else [0,0,0,0])
        if cause['kind']=='hurt':
            assert ht==received and t-ht<18 and 'enemyAction' not in effect
            assert effect['kind'] in ['hit','combo']
            assert effect.get('actor') in [0,1] or effect.get('guest') is True or effect['kind']=='combo'
            assert abs(effect['x']-enemy['x'])<.01 and abs(effect['z']-enemy['z'])<.01
            if h['frame']==3 and not h['reducedMotion']: hurt.append(h)
        else:
            assert cause['kind']=='attack' and effect['kind']=='hit'
            assert 'actor' not in effect and not effect.get('guest',False)
            a=effect['enemyAction']; assert a['index']==i and a['tick']==at and at<=received and t-at<24
            assert a['origin']=={'x':enemy['x'],'z':enemy['z']}
            assert a['target']=={'x':effect['x'],'z':effect['z']}
            key=(i,at)
            if h['frame']==4: strikes[key]=h
            if h['frame']==5: follows[key]=h
    if require_positive:
        assert any(h['enemyHp']==18 and h['cause']['effect'].get('actor')==0 and h['cause']['effect']['text']=='30' for h in hurt),'No observed living, nonlethal native frame3'
        assert strikes.keys() & follows.keys(),'No same-action observed strike/follow-through frames4/5'
    return {'recoilSamples':len(hurt),'strikeSamples':len(strikes),'followSamples':len(follows),'pairedActions':len(strikes.keys() & follows.keys())}

OBSERVE_SCRIPT=r'''() => {
 const api=window.__CHRONO_TEST__,state=api.snapshot(),view=api.view();
 return {state,motion:view.fieldEnemyMotion,art:view.fieldEnemyArt,renderer:view.renderer,
   observation:'read-only-native-session',textureHistoryIsFramebuffer:false,physicalDevice:false,artApproved:false};
}'''

def assert_native_report(report, expected_sha):
    assert re.fullmatch('[0-9a-f]{40}',expected_sha)
    assert report['sourceSha']==expected_sha and report['build']['sourceSha']==expected_sha
    assert report['build']['version']=='0.9.61' and report['build']['batch']=='VQ03N'
    assert report['status']=='passed' and report['nativeInputsOnly'] is True
    before=report['beforeAttack']; after=report['afterAttack']['state']
    assert before['chapter']==after['chapter']=='canyon' and before['mode']==after['mode']=='battle'
    assert len(before['enemies'])==len(after['enemies'])==3
    assert all(e['hp']==48 for e in before['enemies']) and before['players'][0]['atb']>=1
    assert before['ticks']<=after['ticks']<=report['afterActions']['state']['ticks']
    assert_action_history(report['afterAttack'])
    changes=[b['hp']-a['hp'] for b,a in zip(before['enemies'],after['enemies'])]
    assert sorted(changes)==[0,0,30] and sorted(a['hp'] for a in after['enemies'])==[18,48,48]
    assert before['players'][0]['mp']==after['players'][0]['mp']
    assert report['afterActions']['state']['players'][0]['hp']<before['players'][0]['hp']
    assert sorted(e['hp'] for e in report['afterActions']['state']['enemies'])==[18,48,48]
    assert report['errors']==[]
    return assert_action_history(report['afterActions'],require_positive=True)
