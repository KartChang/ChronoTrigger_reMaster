"""Actual media-preference observations during an already paused native Truce visit.
No new keys, movement, sleeps, game-state writes, saves or timing allowances.
"""
import base64
import hashlib
import sys
from pathlib import Path

SNAPSHOT = """()=>{const t=window.__CHRONO_TEST__,v=t.view();return {
 chapter:v.chapter,paused:t.paused(),mediaReduce:matchMedia('(prefers-reduced-motion: reduce)').matches,
 npc:v.storyNpcs.kingdom,renderer:{backend:v.renderer.backend,webglVersion:v.renderer.webglVersion,
 width:v.renderer.width,height:v.renderer.height,samplingEnabled:v.renderer.cpu.sampling.enabled},
 viewport:{width:innerWidth,height:innerHeight},focus:document.activeElement.id};}"""
FRAME_BOUNDARY = '()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))'
MEDIA_QUERY = "matchMedia('(prefers-reduced-motion: reduce)').matches"


def assert_phase(value, state, reduced):
    assert state['chapter'] == 'truce' and value['chapter'] == 'truce'
    assert value['paused'] is True and value['mediaReduce'] is reduced
    npc = value['npc']
    assert npc['profile'] == 'vq02q-story-npc-cloth-and-silhouette' and npc['approved'] is False
    motion = npc['motion']
    assert motion['profile'] == 'vq03e-npc-motion-preference'
    assert motion['clock'] == 'simulation-ticks' and motion['tick'] == state['ticks']
    assert motion['reducedMotion'] is reduced and motion['stateMutation'] is False
    assert sorted((a['name'], a['kind']) for a in npc['actors']) == [('innkeeper', 'innkeeper'), ('townsperson', 'resident')]
    assert len({a['seed'] for a in npc['actors']}) == 2 and motion['bindingCount'] == 2
    for a in npc['actors']:
        assert type(a['seed']) is int and a['seed'] >= 0
        assert type(a['frame']) is int and 0 <= a['frame'] < 4
        assert type(a['uploads']) is int and a['uploads'] >= 0
        assert a['cell'] == {'width': 48, 'height': 64}
        t = (state['ticks'] + a['seed'] * 37) % 240
        expected = 0 if reduced or t < 90 else 1 if t < 180 else 2 if t < 189 else 3
        assert a['frame'] == expected, {'actor': a, 'tick': state['ticks'], 'reduced': reduced}


def observe_npc_comfort(page, out, record, snap, frozen):
    record.update(schema='chrono-native-npc-comfort-v1', status='running', phases=[],
                  physicalDevice=False, artApproved=False, realTimeComfortApproved=False)
    assert snap(page) == frozen and frozen['chapter'] == 'truce'
    assert page.evaluate('window.__CHRONO_TEST__.paused()') is True
    original = page.evaluate(MEDIA_QUERY)
    assert type(original) is bool
    record['originalReduce'] = original
    record['beforeState'] = snap(page)
    out = Path(out) / 'npc-comfort'
    out.mkdir(parents=True, exist_ok=True)
    try:
        for name, reduced in [('before', original), ('reduced', True), ('restored', original)]:
            if name != 'before':
                page.emulate_media(reduced_motion='reduce' if reduced else 'no-preference')
                page.evaluate(FRAME_BOUNDARY)
            first = page.evaluate(SNAPSHOT)
            state = snap(page)
            assert state == frozen
            assert_phase(first, state, reduced)
            page.evaluate(FRAME_BOUNDARY)
            repeated = page.evaluate(SNAPSHOT)
            assert repeated == first and snap(page) == frozen
            value = {'phase': name, 'state': state, 'observation': first, 'repeated': repeated}
            record['phases'].append(value)
            encoded = page.evaluate("document.getElementById('world').toDataURL('image/png')")
            assert encoded.startswith('data:image/png;base64,')
            data = base64.b64decode(encoded.split(',', 1)[1], validate=True)
            image = out / (name + '.png')
            image.write_bytes(data)
            value['image'] = {'path': 'npc-comfort/' + image.name, 'source': 'actual-cpu-canvas',
                              'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
        first, last = record['phases'][0], record['phases'][2]
        assert first['image']['sha256'] == last['image']['sha256']
        for key in ('focus', 'viewport', 'renderer'):
            assert first['observation'][key] == last['observation'][key]
        record['afterState'] = snap(page)
        assert record['afterState'] == record['beforeState']
        record['fullStateEqual'] = True
        record['status'] = 'passed'
    except Exception as exc:
        record['status'] = 'failed'
        record['error'] = {'type': type(exc).__name__, 'message': str(exc)}
        raise
    finally:
        error = sys.exc_info()[1]
        try:
            page.emulate_media(reduced_motion='reduce' if original else 'no-preference')
            page.evaluate(FRAME_BOUNDARY)
            assert page.evaluate(MEDIA_QUERY) is original
        except Exception as exc:
            record['cleanupError'] = str(exc)
            record['status'] = 'failed'
            if error is None:
                raise
