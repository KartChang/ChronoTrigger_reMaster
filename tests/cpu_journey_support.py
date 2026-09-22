"""CI-only adapter: replay the EXISTING rescue/trial journeys on native Canvas2D.
No gameplay API, synthetic save, extra browser context, timer or rendering hook.
Ordinary WebGL runs keep their original drivers, outputs and launch arguments.
"""
from pathlib import Path
import hashlib
import json
import math
import os
import sys
import time
import traceback
from cpu_native_route import move_axis

CPU_ARGS = ['--no-sandbox', '--disable-webgl']
SOURCES = {'rescue': 'cpu-renderer/era600/cpu-kingdom-v4.json',
           'trial': 'cpu-renderer/rescue/rescue-returned-v5.json'}

# A single synchronous read pairs the native surface, renderer and game state.
OBSERVE = """()=>{const t=window.__CHRONO_TEST__,s=t.snapshot(),v=t.view(),c=document.getElementById('world');
 const ctx=c.getContext('2d');if(!ctx)throw Error('Expected native CPU canvas');
 const d=ctx.getImageData(0,0,c.width,c.height).data;
 let min=255,max=0,sum=0,opaque=0;for(let i=0;i<d.length;i+=4){
  if(d[i+3]===255)opaque++;for(let k=0;k<3;k++){min=Math.min(min,d[i+k]);max=Math.max(max,d[i+k]);sum+=d[i+k];}}
 return {state:s,viewChapter:v.chapter,renderer:v.renderer,paused:t.paused(),
  pixels:{source:'actual-cpu-canvas',context2d:true,webgl1:c.getContext('webgl')===null,
   webgl2:c.getContext('webgl2')===null,width:c.width,height:c.height,min,max,sum,opaque},
  heap:performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize,
    limit:performance.memory.jsHeapSizeLimit,precision:'browser-reported; not process RSS'}:null};}"""


def enabled_from_environment(env):
    value = env.get('CHRONO_CPU_CHAIN', '')
    if value not in ('', '1'):
        raise ValueError('CHRONO_CPU_CHAIN must be omitted or 1')
    return value == '1'


def controls_peer(state):
    return state['joined'] and (state['trial']['stage'] == 'none' or state['trial']['luccaJoined'])


def assert_observation(value):
    r, p = value['renderer'], value['pixels']
    assert value['state']['chapter'] == value['viewChapter']
    assert r['backend'] == 'cpu-canvas2d' and r['webglVersion'] == 0 and r['canvas2dFallback'] is True
    c = r['cpu']; m = c['textureMemory']
    assert c['profile'] == 'vq02d-existing-scene-cpu-raster'
    assert c['draws'] > 0 and c['triangles'] > 0 and c['fragments'] > 0 and c['unsupportedResources'] == 0
    assert 0 <= m['mipBytes'] <= m['bytes'] <= m['budget'] == 33554432
    assert 0 < m['entries'] <= m['entryLimit'] == 512
    assert p['source'] == 'actual-cpu-canvas' and p['context2d'] is True and p['webgl1'] is True and p['webgl2'] is True
    assert p['width'] == r['width'] and p['height'] == r['height']
    assert 0 < p['width'] * p['height'] <= 307200 and p['opaque'] == p['width'] * p['height']
    assert p['max'] - p['min'] > 16 and p['sum'] > 0
    # This additional route uses the unchanged DEFAULT policy, not a forced quality reduction.
    assert c['sampling']['enabled'] is False and m['mipBytes'] == 0
    assert c['sampling']['alphaCutouts'] == 'nearest'


def _file(path):
    data = path.read_bytes()
    return {'path': path.name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}


class CpuJourney:
    def __init__(self, stage, root, env=None):
        if stage not in SOURCES:
            raise ValueError('unknown CPU journey')
        self.enabled = enabled_from_environment(os.environ if env is None else env)
        self.stage, self.root = stage, Path(root)
        self.out = self.root / 'test-results' / 'cpu-renderer' / stage
        self.data = {'schema': 'chrono-cpu-adventure-v1', 'stage': stage, 'status': 'running',
                     'launchArgs': list(CPU_ARGS), 'backendPreference': 'auto',
                     'observations': [], 'nativeRoutes': [], 'encounters': [], 'performanceWindows': [],
                     'errors': [], 'physicalDevice': False, 'artApproved': False, 'wholeGameAccepted': False}
        self.began = time.monotonic()

    def output(self, original):
        return self.out if self.enabled else original

    def source(self, original):
        return self.root / 'test-results' / SOURCES[self.stage] if self.enabled else original

    def begin(self, source, original):
        if not self.enabled:
            return
        meta = json.loads((self.root / 'dist/build-meta.json').read_text())
        html = (self.root / 'dist/index.html').read_bytes()
        assert meta['sourceSha'] == os.environ['GITHUB_SHA'] and len(html) == meta['bytes']
        self.data.update(sourceSha=meta['sourceSha'], runId=os.environ['GITHUB_RUN_ID'],
                         runAttempt=os.environ['GITHUB_RUN_ATTEMPT'], htmlBytes=len(html),
                         htmlSha256=hashlib.sha256(html).hexdigest())
        assert source == self.source(None) and source.read_bytes() == original
        self.data['sourceSave'] = {**_file(source), 'path': SOURCES[self.stage]}
        self.out.mkdir(parents=True, exist_ok=True)
        self._checkpoint()

    def _checkpoint(self):
        # Written on progress/failure as well; a progress report is never acceptance.
        self.out.mkdir(parents=True, exist_ok=True)
        target = self.out / 'cpu-journey.json'
        temporary = target.with_suffix('.json.tmp')
        temporary.write_text(json.dumps(self.data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
        temporary.replace(target)

    def move(self, page, axis, target, battle, wait, snapshot):
        before = snapshot(page)
        if not battle:
            return move_axis(page, axis, target, controls_peer(before), self.data['nativeRoutes'])
        if axis not in ('x', 'z') or not math.isfinite(target):
            raise ValueError('invalid encounter target')
        delta = target - before['players'][0][axis]
        key = ('d' if delta > 0 else 'a') if axis == 'x' else ('w' if delta > 0 else 's')
        arrow = {'d':'ArrowRight', 'a':'ArrowLeft', 'w':'ArrowUp', 's':'ArrowDown'}[key]
        keys = [key, arrow] if controls_peer(before) else [key]
        budget = math.ceil((abs(delta)/4+2)*60)
        record = {'axis': axis, 'target': target, 'before': before, 'budget': budget,
                  'timeoutMs': 30000, 'keys': keys, 'attemptedKeys': [], 'releasedKeys': [], 'status': 'moving'}
        self.data['encounters'].append(record)
        try:
            try:
                for k in keys:
                    record['attemptedKeys'].append(k)
                    page.keyboard.down(k)
                wait(page, f's.mode==="battle" || s.players[0].{axis}{">=" if delta>0 else "<="}{target}',
                     budget, ('explore', 'battle'))
            finally:
                active = sys.exc_info()[1]
                failures = []
                for k in reversed(record['attemptedKeys']):
                    try:
                        page.keyboard.up(k); record['releasedKeys'].append(k)
                    except Exception as exc:
                        failures.append(exc)
                if failures and active is None:
                    raise failures[0]
            after = snapshot(page)
            record['afterRelease'] = after
            assert before['mode'] == 'explore' and after['mode'] == 'battle'
            assert after['chapter'] == before['chapter'] and 0 <= after['ticks']-before['ticks'] <= budget
            record['status'] = 'entered-battle'
        except Exception as exc:
            record.update(status='failed', errorType=type(exc).__name__)
            raise

    def observe(self, page, label):
        if not self.enabled:
            return
        page.wait_for_function('''()=>{const t=window.__CHRONO_TEST__;return t.view().chapter===t.snapshot().chapter
            &&t.view().renderer.cpu?.draws>0;}''', timeout=30000)
        value = page.evaluate(OBSERVE)
        value['label'] = label
        self.data['observations'].append(value)
        assert_observation(value)
        image = self.out / f'cpu-checkpoint-{len(self.data["observations"]):02d}.png'
        page.screenshot(path=str(image), timeout=15000)
        value['image'] = _file(image)
        self._checkpoint()
        s = value['state']
        # Safe, completed exploration checkpoints only. Native frames keep running;
        # no accelerated clock, pause exclusion or fabricated FPS threshold.
        if s['chapter'] == 'futuregate' or (s['chapter'] == 'fair' and s['rescue']['stage'] == 'returned'):
            self.sustain(page, label)

    def sustain(self, page, label):
        for index in range(3):
            before = page.evaluate(OBSERVE)
            assert_observation(before)
            assert not before['paused'] and before['state']['mode'] == 'explore'
            record = {'label': label, 'index': index, 'before': before, 'status': 'running',
                      'requiredDraws': 120, 'timeoutMs': 30000}
            self.data['performanceWindows'].append(record)
            self._checkpoint()
            start = time.monotonic()
            handle = page.wait_for_function('''({draws,chapter})=>{const t=window.__CHRONO_TEST__,s=t.snapshot(),r=t.view().renderer;
                if(t.paused()||s.mode!=='explore'||s.chapter!==chapter||r.cpu.draws<draws)return {ok:false};
                return r.cpu.draws>=draws+120&&r.frames.samples===120?{ok:true}:false;}''',
                arg={'draws': before['renderer']['cpu']['draws'], 'chapter': before['state']['chapter']},
                polling=100, timeout=30000)
            try:
                assert handle.json_value()['ok']
            finally:
                handle.dispose()
            after = page.evaluate(OBSERVE)
            record.update(after=after, wallMs=(time.monotonic()-start)*1000)
            assert_observation(after)
            assert after['state']['ticks'] > before['state']['ticks']
            assert after['renderer']['cpu']['draws']-before['renderer']['cpu']['draws'] >= 120
            assert after['renderer']['frames']['samples'] == 120
            record['status'] = 'observed-not-certified'
            self._checkpoint()

    def finish(self, report_name):
        if not self.enabled:
            return
        original_error = sys.exc_info()[1]
        try:
            report = json.loads((self.out / report_name).read_text())
            self.data['journeyReport'] = _file(self.out / report_name)
            self.data['status'] = 'passed' if report.get('status') == 'passed' and original_error is None else 'failed'
            if original_error is not None:
                self.data['failure'] = {'type': type(original_error).__name__, 'message': str(original_error) or type(original_error).__name__,
                    'traceback': ''.join(traceback.format_exception(type(original_error), original_error, original_error.__traceback__))}
            self.data['files'] = [_file(p) for p in sorted(self.out.iterdir()) if p.is_file()
                                  and p.name != 'cpu-journey.json' and p.suffix in ('.png', '.json')]
            self.data['wallMs'] = (time.monotonic()-self.began)*1000
            if report.get('errors'):
                self.data['errors'].extend(report['errors'])
            self._checkpoint()
        except Exception as exc:
            self.data['status'] = 'failed'
            self.data['errors'].append(str(exc) or type(exc).__name__)
            self._checkpoint()
            if original_error is None:
                raise
