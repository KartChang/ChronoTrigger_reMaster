"""Additional W diagnostic contract; never converts a report or its observations."""
POLICY='vq03w-semantic-trial-history'
def assert_trial_history_contract(m):
    assert m['historyPolicy']==POLICY
    assert m['historyLimit']==24 and len(m['history'])<=24
    counters=m['historyEvictions'];assert set(counters)=={'idle','superseded','duplicate','capacity'}
    assert all(type(x) is int and x>=0 for x in counters.values())
    assert type(m['historyDropped']) is int and m['historyDropped']==sum(counters.values())
    previous=-1
    for row in m['history']:
        assert type(row['tick']) is int and previous<=row['tick']<=m['tick'];previous=row['tick']
        assert row['scope']=='texture-not-framebuffer'
    return {'policy':POLICY,'retained':len(m['history']),'evicted':dict(counters),'contiguousTimeline':False}
