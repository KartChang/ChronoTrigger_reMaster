"""Validate actual fair observations; checker fixtures are not rendered evidence."""
import math


def assert_cohesion(r):
    assert r['profile']=='vq01y-fair-shadow-and-form' and r['source']=='actual-fair-shadow-and-form',r
    assert r['approved'] is False and r['physicalDevice'] is False and r['artApproved'] is False,r
    s=r['shadow']
    assert s['active'] is True and s['enabled'] is True,s
    assert all(math.isfinite(s[k]) for k in ('darkness','previous','bias','normalBias')),s
    assert abs(s['darkness']-.34)<1e-8 and s['previous']==0,s
    assert s['mapSize']==1024 and s['filter']==6 and abs(s['bias']-.004)<1e-8 and abs(s['normalBias']-.015)<1e-8,s
    forms=r['forms'];assert forms and any(f['casts'] for f in forms) and any(not f['casts'] for f in forms),forms
    parts=[]
    for f in forms:
        assert f['name']=='fair-static-batch' and isinstance(f['casts'],bool) and f['receives'] is True,f
        assert f['parts'] and all(p['casts'] is f['casts'] for p in f['parts']),f
        assert isinstance(f['vertices'],int) and f['vertices']>0 and isinstance(f['triangles'],int) and f['triangles']>0,f
        assert f['normals']==3*f['vertices'] and f['dynamic'] is False and f['collision'] is False and f['pickable'] is False,f
        if any(p['bevel'] is not None for p in f['parts']):assert f['colors']==4*f['vertices'],f
        parts.extend(f['parts'])
    bevels=[p for p in parts if p['bevel'] is not None]
    assert len(bevels)==20 and all(math.isfinite(p['bevel']) and 0<p['bevel']<=1.5*1.85/64 for p in bevels),bevels
    for name in ('bell-post','bell-capital','bell-arch-stone','telepod-beam'):
        matching=[p for p in parts if p['name']==name];assert matching and all(p['casts'] for p in matching),name
    for name in ('fair-plinth','bell-stone-seam','bell-flowerbed','bell-flowers'):
        matching=[p for p in parts if p['name']==name];assert matching and all(not p['casts'] for p in matching),name
    actors=r['actors'];assert len(actors)==4 and len({a['name'] for a in actors})==4,actors
    assert {a['name'] for a in actors}=={'lucca-handdrawn','fair-vendor-cloth','fair-vendor-candy','fair-vendor-craft'},actors
    for a in actors:
        assert all(math.isfinite(a[k]) for k in ('width','height')),a
        assert abs(a['width']-1.36)<1e-6 and abs(a['height']-1.85)<1e-6,a
        assert a['texture']=={'width':48,'height':64} and a['sampling']==1 and a['billboard']==7 and a['unlit'] is True,a
