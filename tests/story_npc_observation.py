"""Read-only companion gate for authored NPC observations; no browser operations."""
PROFILE = 'vq02q-story-npc-cloth-and-silhouette'

def assert_story_npcs(value):
    state=value['state']; chapter=state['chapter']; mode=state['mode']; rescue=state.get('rescue',{})
    expected={'kingdom': [], 'rescue': []}
    if chapter=='truce': expected['kingdom']=['innkeeper:innkeeper','townsperson:resident']
    if chapter=='castle': expected['kingdom']=['guard:guard','king:king']
    if chapter=='cathedral' and rescue.get('stage')=='entered' and mode=='explore': expected['rescue']=['disguised-nun:nun']*3
    if chapter=='sanctum':
        if not rescue.get('yakraWon',False) and mode=='explore': expected['rescue'].append('false-chancellor:chancellor')
        if mode!='battle': expected['rescue'].append('queen-leene:queen')
        if rescue.get('chancellorFreed',False) and mode=='explore': expected['rescue'].append('true-chancellor:chancellor')
    for owner in ('kingdom','rescue'):
        view=value['storyNpcs'][owner]
        assert view['profile']==PROFILE and view['approved'] is False and isinstance(view['actors'],list)
        assert sorted(a['name']+':'+a['kind'] for a in view['actors'])==sorted(expected[owner])
        for actor in view['actors']:
            assert type(actor['frame']) is int and 0<=actor['frame']<4
            assert type(actor['uploads']) is int and actor['uploads']>=0
            assert actor['cell']=={'width':48,'height':64}
