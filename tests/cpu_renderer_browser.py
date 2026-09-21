"""Default auto fallback with native WebGL disabled, never a synthetic GPU context.
Independent CI-only journey; original full WebGL/story/audio suites remain required.
Only normal buttons, keyboard and the shared native chooser change game state.
"""
from pathlib import Path
import hashlib
import json
import math
import os
import subprocess
import time
from playwright.sync_api import sync_playwright
from native_chooser import arm_native_chooser
from native_import import import_save

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'test-results' / 'cpu-renderer'
OUT.mkdir(parents=True, exist_ok=True)
BASE = 'http://127.0.0.1:4190/?test=1'
html = (ROOT / 'dist/index.html').read_bytes()
meta = json.loads((ROOT / 'dist/build-meta.json').read_text())
report = {'schema': 'chrono-cpu-renderer-v1', 'status': 'running',
          'sourceSha': meta['sourceSha'], 'runId': os.environ.get('GITHUB_RUN_ID'),
          'runAttempt': os.environ.get('GITHUB_RUN_ATTEMPT'),
          'htmlSha256': hashlib.sha256(html).hexdigest(), 'htmlBytes': len(html),
          'launchArgs': ['--no-sandbox', '--disable-webgl'], 'backendPreference': 'auto',
          'cases': [], 'errors': [], 'physicalDevice': False, 'artApproved': False,
          'wholeGameAccepted': False, 'method': 'default fallback; native input and original scene graph'}
server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT,
                          env={**os.environ, 'PORT': '4190'}, stdout=subprocess.DEVNULL)


def snap(page):
    return page.evaluate('window.__CHRONO_TEST__.snapshot()')


def wait_game(page, expression, budget=300):
    begin = snap(page)['ticks']
    handle = page.wait_for_function('''({begin,budget,expression})=>{
      const t=window.__CHRONO_TEST__,s=t.snapshot();
      if(t.paused()||s.ticks<begin||s.ticks-begin>budget)return {ok:false,state:s};
      return Function('s','return ('+expression+')')(s)?{ok:true,state:s}:false;
    }''', arg={'begin': begin, 'budget': budget, 'expression': expression}, timeout=30000, polling=100)
    value = handle.json_value()
    handle.dispose()
    assert value['ok'], value
    return value['state']


def activate(page, selector):
    page.locator(selector).focus()
    page.keyboard.press('Enter')


def move(page, axis, target, coop=False):
    state = snap(page)
    value = state['players'][0][axis]
    if abs(target-value) < .12:
        return
    positive = target > value
    key = ('d' if positive else 'a') if axis == 'x' else ('w' if positive else 's')
    arrows = {'d': 'ArrowRight', 'a': 'ArrowLeft', 'w': 'ArrowUp', 's': 'ArrowDown'}
    keys = [key, arrows[key]] if coop else [key]
    for key in keys:
        page.keyboard.down(key)
    try:
        speed = 2.4 if state['chapter'] == 'overworld1000' else 4
        wait_game(page, f"s.players[0].{axis}{'>=' if positive else '<='}{target}",
                  math.ceil((abs(target-value)/speed+2)*60))
    finally:
        for key in keys:
            page.keyboard.up(key)


def picture(page, name):
    path = OUT/(name+'.png')
    page.screenshot(path=str(path), timeout=15000)
    data = path.read_bytes()
    return {'path': path.name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}


def observed(page):
    # Direct read of the canvas painted by CPU. No substitute canvas/expected pixels.
    result = page.evaluate('''()=>{const t=window.__CHRONO_TEST__,c=document.getElementById('world'),ctx=c.getContext('2d');
      const d=ctx.getImageData(0,0,c.width,c.height).data;
      let min=255,max=0,sum=0,opaque=0;for(let i=0;i<d.length;i++){
        if(i%4===3){if(d[i]===255)opaque++;}else{min=Math.min(min,d[i]);max=Math.max(max,d[i]);sum+=d[i];}}
      return {renderer:t.view().renderer,chapter:t.snapshot().chapter,tick:t.snapshot().ticks,
        ui:{cpuNotePresent:!document.getElementById('cpu-render-note').hidden,help:document.querySelector('.render-help').textContent},
        pixels:{source:'actual-cpu-canvas',webgl2:c.getContext('webgl2')===null,webgl1:c.getContext('webgl')===null,
        context2d:!!ctx,width:c.width,height:c.height,min,max,sum,opaque}};}''')
    r, p = result['renderer'], result['pixels']
    assert r['backend'] == 'cpu-canvas2d' and r['webglVersion'] == 0 and r['canvas2dFallback']
    assert r['cpu']['profile'] == 'vq02d-existing-scene-cpu-raster'
    assert r['cpu']['fragments'] > 0 and r['cpu']['triangles'] > 0 and r['cpu']['unsupportedResources'] == 0, r
    assert r['cpu']['textureMemory']['bytes'] <= r['cpu']['textureMemory']['budget'] == 33554432
    assert p['width']*p['height'] <= 640*480 and p['opaque'] == p['width']*p['height']
    assert p['webgl1'] and p['webgl2'] and p['context2d'] and p['max']-p['min'] > 16 and p['sum'] > 0, p
    work = r['cpu']['work']
    assert work['profile'] == 'vq02e-conservative-cpu-work'
    assert work['consideredSubmeshes'] > 0 and 0 <= work['culledSubmeshes'] <= work['consideredSubmeshes']
    assert work['shadedVertices'] > 0 and work['fastAccepted'] > 0
    assert work['submittedTriangles'] == work['fastAccepted'] + work['trivialRejected'] + work['clipped']
    assert result['ui']['cpuNotePresent'] and '預設嘗試 CPU 相容繪圖' in result['ui']['help']
    return result


def start(page, selector):
    started = time.monotonic()
    page.goto(BASE, wait_until='load', timeout=30000)
    page.wait_for_function("window.__CHRONO_TEST__?.view().renderer.cpu?.draws>0", timeout=30000)
    assert page.locator('#render-unavailable').is_hidden()
    activate(page, selector)
    return round((time.monotonic()-started)*1000, 2)


def observe_home(page):
    case = {'name': 'fresh-home-to-fair', 'status': 'running', 'views': []}
    report['cases'].append(case)
    case['loadMs'] = start(page, '#start-story')
    wait_game(page, "s.prologue.stage==='home'", 220)
    assert snap(page)['chapter'] == 'bedroom'
    case['views'].append({**observed(page), 'image': picture(page, 'home-bedroom')})
    move(page, 'x', 0)
    page.keyboard.down('s')
    try:
        wait_game(page, "s.chapter==='home'&&!s.prologue.transition", 250)
    finally:
        page.keyboard.up('s')
    move(page, 'x', 0)
    page.keyboard.press('e')
    page.wait_for_selector('#dialog:not([hidden])', timeout=10000)
    assert '母親' in page.locator('#dialog-title').inner_text()
    activate(page, '#dialog-close')
    assert snap(page)['prologue']['motherTalked']
    case['views'].append({**observed(page), 'image': picture(page, 'home-downstairs')})
    move(page, 'z', -4.2)
    page.keyboard.press('e')
    wait_game(page, "s.chapter==='overworld1000'&&!s.prologue.transition", 100)
    case['views'].append({**observed(page), 'image': picture(page, 'home-overworld')})
    move(page, 'x', .1)
    move(page, 'z', 5.1)
    move(page, 'x', 2)
    assert '莉妮廣場' in page.locator('#interact-hint').inner_text()
    page.keyboard.press('e')
    wait_game(page, "s.chapter==='fair'&&!s.prologue.transition", 100)
    case['views'].append({**observed(page), 'image': picture(page, 'home-fair')})
    assert snap(page)['prologue']['stage'] == 'fair'
    case.update(status='passed', actualStairs=True, motherTalked=True, originalMapTransitions=True)


def runtime_observation(page):
    # Wait for real render-loop samples, never inject timings or game state.
    page.wait_for_function("""()=>{const r=window.__CHRONO_TEST__.view().renderer;
      return r.frames?.active && r.frames.samples>=60 && document.getElementById('fps').textContent.includes(' FPS');}""", timeout=15000)
    observed = page.evaluate("""()=>({renderer:window.__CHRONO_TEST__.view().renderer,
      label:document.getElementById('fps').textContent,title:document.getElementById('fps').title,
      build:document.getElementById('build-info').textContent})""")
    f = observed['renderer']['frames']
    assert f['ready'] and f['active'] and 60 <= f['samples'] <= 120
    assert f['meanMs'] > 0 and f['fps'] > 0 and f['p95Ms'] <= f['maxMs']
    assert abs(f['fps'] * f['meanMs'] - 1000) < .000001
    assert observed['label'].startswith('CPU／Canvas2D') and 'WebGL' not in observed['label']
    assert meta['version'] in observed['build'] and meta['sourceSha'][:8] in observed['build']
    return observed


def observe_fair(page):
    case = {'name': 'fair-coop-combat-save', 'status': 'running', 'views': []}
    report['cases'].append(case)
    case['loadMs'] = start(page, '#start-fair-coop')
    assert snap(page)['joined']
    before = snap(page)
    page.keyboard.down('d')
    try:
        wait_game(page, f"s.players[0].x>{before['players'][0]['x']+.3}", 90)
    finally:
        page.keyboard.up('d')
    after_p1 = snap(page)
    assert after_p1['players'][1]['x'] == before['players'][1]['x']
    page.keyboard.down('ArrowRight')
    try:
        wait_game(page, f"s.players[1].x>{after_p1['players'][1]['x']+.3}", 90)
    finally:
        page.keyboard.up('ArrowRight')
    after_p2 = snap(page)
    assert after_p2['players'][0]['x'] == after_p1['players'][0]['x']
    case['ownership'] = {'before': before, 'afterP1': after_p1, 'afterP2': after_p2}
    active_diagnostics = runtime_observation(page)
    page.keyboard.press('Escape')
    page.wait_for_function('window.__CHRONO_TEST__.paused()', timeout=10000)
    frozen = snap(page)
    assert page.locator('#cpu-render-note').is_visible()
    page.keyboard.down('a')
    page.wait_for_timeout(350)
    page.keyboard.up('a')
    assert snap(page) == frozen
    for name, size in [('desktop', {'width': 960, 'height': 640}), ('portrait', {'width': 390, 'height': 844}),
                       ('short-landscape', {'width': 844, 'height': 390})]:
        page.set_viewport_size(size)
        page.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert page.locator('#resume').is_visible()
        case['views'].append({**observed(page), 'viewport': name, 'image': picture(page, 'cpu-'+name)})
        assert snap(page) == frozen
    page.set_viewport_size({'width': 960, 'height': 640})
    presentation = {'active': active_diagnostics, 'before': frozen}
    for mode in ['quality', 'compatibility']:
        page.locator('#render-quality').select_option(mode)
        page.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
        presentation[mode] = {**observed(page), 'image': picture(page, 'cpu-'+mode)}
        presentation[mode+'State'] = snap(page)
        assert presentation[mode+'State'] == frozen
        assert presentation[mode]['renderer']['mode'] == mode
    q, c = presentation['quality']['renderer'], presentation['compatibility']['renderer']
    assert c['width']*c['height'] < q['width']*q['height'] and c['scaling'] > q['scaling']
    page.locator('#render-quality').select_option('auto')
    case['presentation'] = presentation
    activate(page, '#resume')
    page.wait_for_function('!window.__CHRONO_TEST__.paused()', timeout=10000)
    case['pauseStateUnchanged'] = True
    move(page, 'z', -2, True)
    move(page, 'x', -6.8, True)
    move(page, 'z', 2.5, True)
    page.keyboard.press('e')
    page.wait_for_selector('#dialog:not([hidden])', timeout=10000)
    assert '岡薩雷斯' in page.locator('#dialog-title').inner_text()
    activate(page, '#dialog-close')
    wait_game(page, "s.mode==='battle'&&s.players.every(p=>p.atb>=1)", 180)
    page.locator('[data-slot="0"][data-action="attack"]').click()
    assert snap(page)['enemies'][0]['hp'] == 90
    page.locator('[data-slot="1"][data-action="skill"]').click()
    assert snap(page)['enemies'][0]['hp'] == 42 and snap(page)['players'][1]['mp'] == 15
    wait_game(page, 's.players[0].atb>=1', 180)
    page.locator('[data-slot="0"][data-action="skill"]').click()
    assert snap(page)['mode'] == 'victory'
    case['victory'] = {**observed(page), 'image': picture(page, 'cpu-gato-victory'), 'state': snap(page)}
    activate(page, '#continue')
    assert snap(page)['mode'] == 'explore' and snap(page)['fair']['gatoWon']
    # Retain an export actually made by this same CPU playthrough; never manufacture one.
    before_save = snap(page)
    activate(page, '#save')
    page.wait_for_function("document.getElementById('message').textContent.includes('本機存檔完成')", timeout=10000)
    with page.expect_download(timeout=30000) as download:
        activate(page, '#export')
    saved = OUT/'cpu-own-fair-save.json'
    download.value.save_as(saved)
    data = saved.read_bytes()
    assert json.loads(data)['version'] == 2
    move(page, 'z', -2, True)
    activate(page, '#load')
    page.wait_for_function("document.getElementById('message').textContent.includes('讀檔完成')", timeout=10000)
    assert snap(page)['players'][0]['x'] == before_save['players'][0]['x']
    assert snap(page)['players'][0]['z'] == before_save['players'][0]['z']
    receipt = import_save(page, saved, OUT)
    after_import = snap(page)
    assert after_import['joined'] and after_import['fair']['gatoWon']
    assert after_import['players'][0]['x'] == before_save['players'][0]['x']
    assert after_import['players'][0]['z'] == before_save['players'][0]['z']
    case['save'] = {'sameRunExport': True, 'indexedDbReload': True, 'nativeImport': receipt,
                    'path': saved.name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'version': 2,
                    'before': before_save, 'after': after_import}
    case['afterImport'] = {**observed(page), 'image': picture(page, 'cpu-after-import')}
    case['status'] = 'passed'


try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, args=report['launchArgs'])
        context = browser.new_context(viewport={'width': 960, 'height': 640}, device_scale_factor=1, accept_downloads=True)
        page = context.new_page()
        arm_native_chooser(page)
        page.on('pageerror', lambda e: report['errors'].append(str(e)))
        requests = []
        page.on('request', lambda r: requests.append(r.url))
        report['browser'] = browser.version
        try:
            observe_home(page)
            observe_fair(page)
            assert not report['errors'], report['errors']
            assert not [u for u in requests if not u.startswith(('http://127.0.0.1:4190/', 'data:', 'blob:'))], requests
            report['status'] = 'passed'
            print('PASS native no-WebGL CPU scenes, fresh transitions, independent P1/P2, ATB victory, native own-save roundtrip', flush=True)
        except Exception as exc:
            report['failure'] = str(exc)
            try:
                report['lastState'] = snap(page)
                report['lastView'] = page.evaluate('window.__CHRONO_TEST__.view()')
                report['failureImage'] = picture(page, 'failure')
            except Exception as capture:
                report['captureError'] = str(capture)
            raise
        finally:
            context.close()
            browser.close()
except Exception as exc:
    report['status'] = 'failed'
    report['errors'].append(str(exc))
    raise
finally:
    (OUT/'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    server.terminate()
    server.wait(timeout=5)
