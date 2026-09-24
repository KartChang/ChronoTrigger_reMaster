"""Read-only portrait stops on the six ORIGINAL native Truce movement legs.

No new route, clock, gameplay hook, save or input injection. Pausing/resuming and
resizing use the native controls; raw failed observations are retained in-place.
"""
import base64
import sys
import time
from pathlib import Path
from village_capture import receipt

FRAME = '()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))'
PAUSED = 'window.__CHRONO_TEST__.paused()'
VIEWPORT = '({width:innerWidth,height:innerHeight})'


VISIBILITY = r'''() => {
    // VQ03D: read only the existing stopped CPU scene and original canvas.
    const view = window.__CHRONO_TEST__.view(), canvas = document.getElementById('world');
    const context = canvas.getContext('2d'), width = canvas.width, height = canvas.height;
    const samples = view.earlyComfort.rects.filter(r => ['p0','p1','guest'].includes(r.id)).map(r => {
        const points = [];
        for (const dy of [.82,.9,.96]) for (const dx of [.3,.5,.7]) {
            const x = Math.max(0,Math.min(width-1,Math.floor((r.left+(r.right-r.left)*dx)*width)));
            const y = Math.max(0,Math.min(height-1,Math.floor((r.top+(r.bottom-r.top)*dy)*height)));
            points.push({x,y,rgba:Array.from(context.getImageData(x,y,1,1).data)});
        }
        return {id:r.id,points};
    });
    return {profile:'vq03d-native-visibility',woodland:view.woodlandOcclusion,
        blend:view.renderer.cpu.transparency,lowerBody:{source:'actual-cpu-canvas',width,height,samples},
        physicalDevice:false,artApproved:false};
}'''

class TownRouteCapture:
    def __init__(self, page, out, record, snap, observed, routes):
        self.page, self.out, self.record = page, Path(out), record
        self.snap, self.observed, self.routes = snap, observed, routes
        self.original = dict(page.viewport_size)
        self.paused_here = False
        record.update(schema='chrono-town-route-readability-v1', status='running',
                      stops=[], routeStart=len(routes), originalViewport=self.original,
                      nativeVideoWindow={'clock':'host-monotonic-us','startUs':time.monotonic_ns()//1000},
                      physicalDevice=False, artApproved=False, motionVideo=False)

    def _pause(self):
        assert not self.page.evaluate(PAUSED), 'route stop must begin in native exploration'
        self.page.keyboard.press('Escape')
        self.page.wait_for_function(PAUSED, timeout=10000)
        self.paused_here = True
        return self.snap(self.page)

    def _resume(self):
        self.page.locator('#resume').focus()
        self.page.keyboard.press('Enter')
        self.page.wait_for_function('!window.__CHRONO_TEST__.paused()', timeout=10000)
        self.paused_here = False

    def _capture(self, name, frozen):
        p, r = self.page, self.record
        p.evaluate(FRAME)
        value = self.observed(p)
        value.update(name=name, videoClockUs=time.monotonic_ns()//1000, viewport=p.evaluate(VIEWPORT), state=self.snap(p),
                     paused=p.evaluate(PAUSED), routeEnd=len(self.routes),
                     camera=p.evaluate('window.__CHRONO_TEST__.view().earlyComfort'),
                     signOcclusion=p.evaluate('window.__CHRONO_TEST__.view().townSignOcclusion'),
                     buildingOcclusion=p.evaluate('window.__CHRONO_TEST__.view().townBuildingOcclusion'),
                     visibility=p.evaluate(VISIBILITY))
        r['stops'].append(value)  # Failed partial capture belongs to the original report.
        assert value['state'] == frozen and value['paused'] is True
        assert value['viewport'] == {'width':390, 'height':844}
        image = self.out / f'town-route-{name}.png'
        p.screenshot(path=str(image), timeout=15000)
        value['image'] = receipt(image)
        encoded = p.evaluate("document.getElementById('world').toDataURL('image/png')")
        assert encoded.startswith('data:image/png;base64,')
        canvas = self.out / f'town-route-{name}-canvas.png'
        canvas.write_bytes(base64.b64decode(encoded.split(',',1)[1], validate=True))
        value['canvasImage'] = {**receipt(canvas), 'source':'actual-cpu-canvas'}
        value['after'] = self.snap(p)
        assert value['after'] == frozen
        value['fullStateEqual'] = True

    def _error(self, exc):
        self.record.update(status='failed', error={'type':type(exc).__name__, 'message':str(exc)})

    def __enter__(self):
        try:
            assert self.original == {'width':960,'height':640}
            assert self.snap(self.page)['chapter'] == 'truce'
            frozen = self._pause()
            self.record['beforeResize'] = frozen
            self.page.set_viewport_size({'width':390,'height':844})
            self._capture('entry', frozen)
            self._resume()
            return self
        except Exception as exc:
            self._error(exc)
            self._restore()
            raise

    def stop(self, name):
        try:
            frozen = self._pause()
            self._capture(name, frozen)
            self._resume()
        except Exception as exc:
            self._error(exc)
            raise

    def _restore(self):
        p = self.page
        primary = sys.exc_info()[1]
        try:
            if not self.paused_here and not p.evaluate(PAUSED):
                self._pause()
            frozen = self.snap(p)
            self.record['beforeRestore'] = frozen
            p.set_viewport_size(self.original)
            p.evaluate(FRAME)
            self.record['afterRestore'] = self.snap(p)
            self.record['restoredViewport'] = p.evaluate(VIEWPORT)
            assert self.record['afterRestore'] == frozen
            assert self.record['restoredViewport'] == self.original
            if self.paused_here:
                self._resume()
        except Exception as exc:
            self.record['cleanupError'] = str(exc)
            self.record['status'] = 'failed'
            if primary is None:
                raise

    def __exit__(self, kind, exc, tb):
        if exc is not None:
            self._error(exc)
        self.record['routeEnd'] = len(self.routes)
        self.record['nativeVideoWindow']['endUs'] = time.monotonic_ns()//1000
        self._restore()
        if exc is None and self.record['status'] != 'failed':
            self.record['status'] = 'passed'
        return False
