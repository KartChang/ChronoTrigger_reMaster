"""Additional paused viewport observations of the same actual CPU Truce visit.
No writable hooks, movement, save substitution or hidden-overlay edits.
"""
import base64
import hashlib
import sys
from pathlib import Path
from pause_access import observe_pause_access

VIEWPORTS = ((960, 640), (390, 844), (844, 390))


def observe_village_layouts(page, out, record, snap, observed):
    record.update(schema='chrono-village-layouts-v1', status='running', views=[],
                  physicalDevice=False, artApproved=False)
    original = dict(page.viewport_size)
    assert original == {'width': 960, 'height': 640}, original
    assert snap(page)['chapter'] == 'truce'
    paused_here = False
    try:
        page.keyboard.press('Escape')
        page.wait_for_function('window.__CHRONO_TEST__.paused()', timeout=10000)
        paused_here = True
        frozen = snap(page)
        record['before'] = frozen
        record['beforeCamera'] = page.evaluate('window.__CHRONO_TEST__.view().earlyComfort')
        for i, (width, height) in enumerate(VIEWPORTS):
            page.set_viewport_size({'width': width, 'height': height})
            page.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
            value = observed(page)
            value['state'] = snap(page)
            value['paused'] = page.evaluate('window.__CHRONO_TEST__.paused()')
            value['viewport'] = page.evaluate('({width:innerWidth,height:innerHeight})')
            value['village'] = page.evaluate('window.__CHRONO_TEST__.view().storyNpcs.kingdom.village')
            value['camera'] = page.evaluate('window.__CHRONO_TEST__.view().earlyComfort')
            assert value['state'] == frozen and value['paused'] is True
            assert value['viewport'] == {'width': width, 'height': height}
            record['views'].append(value)  # Keep partial original observation if screenshot fails.
            image = Path(out) / f'village-layout-{i}.png'
            page.screenshot(path=str(image), timeout=15000)
            value['image'] = receipt(image)
            encoded = page.evaluate("document.getElementById('world').toDataURL('image/png')")
            assert encoded.startswith('data:image/png;base64,')
            canvas = Path(out) / f'village-canvas-{i}.png'
            canvas.write_bytes(base64.b64decode(encoded.split(',', 1)[1], validate=True))
            value['canvasImage'] = {**receipt(canvas), 'source': 'actual-cpu-canvas'}
            value['pauseAccess'] = {}
            observe_pause_access(page, out, value['pauseAccess'], snap, observed, frozen, i)
        page.set_viewport_size(original)
        page.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
        record['restoredViewport'] = page.evaluate('({width:innerWidth,height:innerHeight})')
        record['after'] = snap(page)
        record['afterCamera'] = page.evaluate('window.__CHRONO_TEST__.view().earlyComfort')
        assert record['after'] == frozen and record['restoredViewport'] == original
        record['fullStateEqual'] = True
        record['status'] = 'passed'
    except Exception as exc:
        record['status'] = 'failed'
        record['error'] = {'type': type(exc).__name__, 'message': str(exc)}
        raise
    finally:
        active_error = sys.exc_info()[1]
        try:
            page.set_viewport_size(original)
            if paused_here and page.evaluate('window.__CHRONO_TEST__.paused()'):
                page.locator('#resume').focus()
                page.keyboard.press('Enter')
                page.wait_for_function('!window.__CHRONO_TEST__.paused()', timeout=10000)
        except Exception as exc:
            record['cleanupError'] = str(exc)
            record['status'] = 'failed'
            if active_error is None:
                raise


def receipt(path):
    data = path.read_bytes()
    return {'path': path.name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
