"""Compare bounded live canvas strips with deterministic source-art expectations, not art approval."""
import json
from pathlib import Path
EXPECTED=json.loads((Path(__file__).parent/'fixtures/fair-paving-unit.json').read_text())

def assert_paving(p):
    assert p['profile']=='vq01x-retained-plaza-composition' and p['source']=='actual-fair-paving-canvas',p
    assert p['approved'] is False and p['texture']=='fair-ground-reference',p
    assert p['width']==p['height']==512,p
    assert p['samples']==EXPECTED['samples'],'Live paving pixels differ from source-art expectation'
    for s in p['samples']:
        assert len(s['rgba'])==64 and all(type(v) is int and 0<=v<=255 for v in s['rgba']),s
        assert all(s['rgba'][i]==255 for i in range(3,64,4)),s

def capture_paving(page):
    value=page.evaluate('window.__CHRONO_TEST__.view().fairMotion.paving')
    assert_paving(value)
    return value
