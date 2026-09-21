"""Read actual fair lighting/material/mesh data. Unit fixtures are not rendered evidence."""
import math
from fair_cohesion_browser import assert_cohesion

READ_FINISH = '() => window.__CHRONO_TEST__.view().fairMotion.finish'
ROOTS=((-11.5,8),(11.5,-6),(-12.9,-5),(12.9,7),(-10.5,11),(8,11))


def assert_finish(r):
    assert r['profile']=='vq01w-fair-light-and-contact' and r['source']=='actual-fair-light-material-contact',r
    assert r['approved'] is False and r['physicalDevice'] is False and r['artApproved'] is False,r
    f=r['fill'];assert f['enabled'] is True and f['onlyFair'] is True and f['included']>0,f
    assert math.isfinite(f['intensity']) and abs(f['intensity']-.28)<1e-8,f
    assert len(f['diffuse'])==len(f['ground'])==3 and all(math.isfinite(n) and 0<=n<=1 for n in f['diffuse']+f['ground']),f
    assert f['diffuse'][2]>f['diffuse'][0] and max(f['ground'])<.35,f
    assert r['key']['receivesKey'] is True and r['key']['enabled'] is True,r['key']
    assert r['excluded'] and all(e['complete'] is True and e['count']>0 for e in r['excluded']),r['excluded']
    assert len(r['metals'])>=5 and any(m['mesh']=='leene-bell' for m in r['metals']),r['metals']
    for m in r['metals']:
        assert m['power']==48 and len(m['specular'])==3,m
        assert all(math.isfinite(a) and abs(a-b)<1e-7 for a,b in zip(m['specular'],(.24,.19,.12))),m
    contacts=r['contacts'];assert len(contacts)==6 and len({c['id'] for c in contacts})==6,contacts
    for i,(c,p) in enumerate(zip(contacts,ROOTS)):
        assert c['id']=='fair-tree-'+str(i) and c['shadow']['visible'] is True,c
        assert math.isfinite(c['footError']) and c['footError']<1e-4,c
        assert all(abs(c['foot'][key]-expected)<1e-6 for key,expected in zip(('x','y','z'),(p[0],.075,p[1]))),c
        assert all(math.isfinite(c['actualFoot'][key]) and abs(c['actualFoot'][key]-c['foot'][key])<1e-4 and abs(c['shadow'][key]-c['foot'][key])<1e-6 for key in ('x','y','z')),c
    assert r['softShadows']=={'count':8,'vertices':776,'triangles':1344,'alphaMin':0,'alphaMax':1,'dynamic':False,'decorativeOnly':True},r['softShadows']


def capture_finish(page):
    r=page.evaluate(READ_FINISH);assert_finish(r);assert_cohesion(r['cohesion']);return r
