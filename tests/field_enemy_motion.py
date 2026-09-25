"""Independent check of actual read-only M observations, not a replacement C gate."""
def assert_field_enemy_motion(record):
    s=record['state']; m=record['motion']; art=record['art']
    assert m['profile']=='vq03m-field-imp-motion' and m['active'] is True
    assert m['approved'] is False and m['disposed'] is False
    tick=s['ticks']; assert type(tick) is int and tick>=0
    assert m['tick']==tick and type(m['reducedMotion']) is bool
    assert m['battle']==(s['mode']=='battle')
    actors=m['actors']; assert [a['name'] for a in actors]==[a['name'] for a in art['actors']]
    assert s['chapter'] in ['canyon','forest'] and s['mode'] in ['explore','battle']
    count=sum(e['hp']>0 for e in s['enemies'][:3]) if s['mode']=='battle' else (3 if s['chapter']=='canyon' else 2)
    assert len(actors)==count
    masks=[[0,0,1,0],[0,1,0,0],[1,1,0,0],[0,0,0,1],[0,1,0,1],[0,0,1,1]]
    for a in actors:
        i=a['index']; assert type(i) is int and i in range(3) and a['name']=='enemy-'+str(i)
        assert a['cell']=={'width':24,'height':32} and a['tick']==tick
        assert type(a['uploads']) is int and a['uploads']>=0
        hurt=a['hurtTick']
        assert hurt is None or (type(hurt) is int and 0<=hurt<=tick)
        if s['mode']=='explore': assert hurt is None
        attack=a.get('attackTick')
        if attack is not None:
            assert m['actionProfile']=='vq03n-field-imp-action'
            assert type(attack) is int and 0<=attack<=tick and s['mode']=='battle'
        if m['reducedMotion']: expected=0
        elif hurt is not None and tick-hurt<18: expected=3
        elif attack is not None and tick-attack<24: expected=4 if tick-attack<8 else 5 if tick-attack<16 else 2
        elif m['battle']: expected=1 if ((tick+i*11)//24)%4==3 else 2
        else: expected=int((tick+i*37)%180>=150)
        assert a['frame']==expected
        assert len(a['samples'])==4
        for sample,(x,y),colored in zip(a['samples'],[(3,19),(3,20),(3,25),(21,22)],masks[expected]):
            assert (sample['x'],sample['y'])==(x,y)
            assert sample['rgba']==([70,131,145,255] if colored else [0,0,0,0])
    return True


BATTLE_SCRIPT = r'''() => {
 const api=window.__CHRONO_TEST__,state=api.snapshot(),view=api.view();
 return {profile:'vq03m-native-field-battle-observation',state,art:view.fieldEnemyArt,
  motion:view.fieldEnemyMotion,renderer:view.renderer,physicalDevice:false,artApproved:false};
}'''

def observe_field_enemy_battle(page,out):
    """Read once after the existing battle screenshot; no new input, waits or screenshot.
    Observation time is not claimed to be the exact preceding screenshot frame.
    """
    import json
    from pathlib import Path
    record=page.evaluate(BATTLE_SCRIPT)
    (Path(out)/'field-enemy-battle-motion.json').write_text(json.dumps(record,ensure_ascii=False,indent=2))
    assert record['state']['mode']=='battle'
    assert_field_enemy_motion(record)
    return record
