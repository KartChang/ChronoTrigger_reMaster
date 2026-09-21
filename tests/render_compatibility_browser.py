"""Actual browser startup/readback and native WebGL-loss faults, not a CPU-renderer mock.
Only CI executes this driver. The controlled Chromium software driver is a test
configuration; a production page cannot force SwiftShader or bypass browser policy.
"""
from pathlib import Path
import hashlib
import json
import os
import subprocess
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'test-results' / 'render-compatibility'
OUT.mkdir(parents=True, exist_ok=True)
BASE = 'http://127.0.0.1:4189/?test=1'
html = (ROOT / 'dist/index.html').read_bytes()
meta = json.loads((ROOT / 'dist/build-meta.json').read_text())
report = {'schema': 'chrono-render-compatibility-v1', 'status': 'running',
          'sourceSha': meta['sourceSha'], 'runId': os.environ.get('GITHUB_RUN_ID'),
          'runAttempt': os.environ.get('GITHUB_RUN_ATTEMPT'),
          'htmlSha256': hashlib.sha256(html).hexdigest(), 'htmlBytes': len(html),
          'cases': [], 'errors': [], 'physicalDevice': False, 'artApproved': False,
          'canvas2dPlayable': False, 'browserPolicyBypassedByPage': False,
          'method': 'controlled software Chromium; native controls and WEBGL_lose_context fault; real canvas pixels'}
server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT,
                          env={**os.environ, 'PORT': '4189'}, stdout=subprocess.DEVNULL)

def snapshot(page):
    return page.evaluate('window.__CHRONO_TEST__.snapshot()')

def view(page):
    return page.evaluate('window.__CHRONO_TEST__.view().renderer')

def frames(page):
    page.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')

def pixels(page):
    # A copy of the real WebGL canvas, not UI text, an expected fixture, or a new scene.
    return page.evaluate('''()=>{const source=document.getElementById('world'),c=document.createElement('canvas');
      c.width=32;c.height=18;const ctx=c.getContext('2d');ctx.drawImage(source,0,0,32,18);
      const d=ctx.getImageData(0,0,32,18).data;let min=255,max=0,sum=0,opaque=0;
      for(let i=0;i<d.length;i++){if(i%4===3){if(d[i]===255)opaque++;}else{min=Math.min(min,d[i]);max=Math.max(max,d[i]);sum+=d[i];}}
      return {source:'actual-webgl-canvas',width:source.width,height:source.height,min,max,sum,opaque,samples:576};}''')

def picture(page, name):
    path = OUT / (name + '.png')
    page.screenshot(path=str(path))
    b = path.read_bytes()
    return {'path': path.name, 'bytes': len(b), 'sha256': hashlib.sha256(b).hexdigest()}

def activate(page, selector):
    page.locator(selector).focus()
    page.keyboard.press('Enter')

def observe_webgl(playwright, version):
    args = ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader']
    if version == 1:
        args.append('--disable-webgl2')
    browser = playwright.chromium.launch(headless=True, args=args)
    context = browser.new_context(viewport={'width': 1365, 'height': 900}, device_scale_factor=1)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    case = {'name': f'software-webgl{version}', 'status': 'running', 'browser': browser.version, 'errors': errors}
    report['cases'].append(case)
    try:
        page.goto(BASE, wait_until='load', timeout=30000)
        page.wait_for_function('window.__CHRONO_TEST__!==undefined', timeout=30000)
        activate(page, '#start-coop')
        page.wait_for_function('window.__CHRONO_TEST__.snapshot().ticks>6', timeout=10000)
        initial = view(page)
        assert initial['webglVersion'] == version, initial
        assert initial['backendHint'] == 'software' and initial['mode'] == 'auto', initial
        assert initial['scaling'] > 1 and initial['browserChoosesBackend'] and not initial['forcedSoftware'], initial
        before = snapshot(page)
        page.keyboard.down('d')
        try:
            page.wait_for_function('(x)=>window.__CHRONO_TEST__.snapshot().players[0].x>x+.1',
                                   arg=before['players'][0]['x'], timeout=10000)
        finally:
            page.keyboard.up('d')
        after = snapshot(page)
        assert after['players'][1]['x'] == before['players'][1]['x']
        page.keyboard.press('Escape')
        assert page.evaluate('window.__CHRONO_TEST__.paused()')
        frozen = snapshot(page)
        select = page.locator('#render-quality')
        select.focus()
        # Native HTMLSelectElement keyboard ownership, not a writable test hook.
        page.keyboard.press('Home')
        page.keyboard.press('ArrowDown')
        frames(page)
        quality = view(page)
        assert select.input_value() == 'quality' and quality['scaling'] == 1, quality
        page.keyboard.press('End')
        frames(page)
        compatibility = view(page)
        assert select.input_value() == 'compatibility' and compatibility['scaling'] > 1, compatibility
        assert compatibility['width'] < quality['width'] and compatibility['height'] < quality['height']
        assert snapshot(page) == frozen
        activate(page, '#resume')
        page.wait_for_function('!window.__CHRONO_TEST__.paused()', timeout=10000)
        frames(page)
        sample = pixels(page)
        assert sample['max'] - sample['min'] > 16 and sample['sum'] > 0 and sample['opaque'] == 576, sample
        case.update({'renderer': initial, 'independentP1Movement': True,
                     'quality': quality, 'compatibility': compatibility, 'manualStateUnchanged': True,
                     'pixels': sample, 'image': picture(page, case['name'])})
        if version == 2:
            # Native GL extension, not a synthetic event; the page has no state setter.
            extension = page.evaluate_handle('''()=>document.getElementById('world').getContext('webgl2').getExtension('WEBGL_lose_context')''')
            assert extension.evaluate('(e)=>e!==null')
            extension.evaluate('(e)=>e.loseContext()')
            page.wait_for_function("!document.getElementById('render-state').hidden", timeout=10000)
            assert page.evaluate('window.__CHRONO_TEST__.paused()')
            held = snapshot(page)
            page.keyboard.down('d')
            page.keyboard.press('c')
            page.keyboard.press('Escape')
            page.wait_for_timeout(350)
            assert snapshot(page) == held
            page.keyboard.up('d')
            case['lostImage'] = picture(page, 'context-lost')
            extension.evaluate('(e)=>e.restoreContext()')
            page.wait_for_function("document.getElementById('render-state').hidden && !window.__CHRONO_TEST__.paused()", timeout=30000)
            page.wait_for_function('(t)=>window.__CHRONO_TEST__.snapshot().ticks>t', arg=held['ticks'], timeout=10000)
            resumed = snapshot(page)
            assert resumed['players'][0]['x'] == held['players'][0]['x'] and resumed['joined'] == held['joined']
            sample_after = pixels(page)
            assert sample_after['max'] - sample_after['min'] > 16
            case['contextLoss'] = {'method': 'native-WEBGL_lose_context', 'frozenStateUnchanged': True,
                                   'heldTick': held['ticks'], 'resumedTick': resumed['ticks'],
                                   'inputCleared': True, 'restoredPixels': sample_after,
                                   'savedAutomatically': False}
            case['restoredImage'] = picture(page, 'context-restored')
            extension.dispose()
        assert not errors, errors
        case['status'] = 'passed'
    except Exception as exc:
        case['error'] = str(exc)
        try:
            case['lastRenderer'] = view(page)
            case['failureImage'] = picture(page, 'failed-' + case['name'])
        except Exception as observation_error:
            case['observationError'] = str(observation_error)
        raise
    finally:
        context.close()
        browser.close()

def observe_unavailable(playwright):
    browser = playwright.chromium.launch(headless=True, args=['--no-sandbox', '--disable-webgl'])
    context = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    case = {'name': 'webgl-unavailable', 'status': 'running', 'browser': browser.version, 'errors': errors}
    report['cases'].append(case)
    try:
        page.goto(BASE, wait_until='load', timeout=30000)
        page.wait_for_selector('#render-unavailable', timeout=30000)
        assert page.locator('#render-unavailable').get_attribute('role') == 'alertdialog'
        assert page.locator('#render-reload').is_visible()
        assert page.evaluate('document.activeElement.id') == 'render-reload'
        assert page.locator('#start-story').is_disabled()
        assert page.evaluate('window.__CHRONO_TEST__===undefined')
        # Unsupported WebGL is caught and rendered; not an unhandled JS exception.
        assert not errors, errors
        case.update({'caughtFailure': True, 'focused': 'render-reload', 'startDisabled': True,
                     'testStateUnavailable': True, 'image': picture(page, 'webgl-unavailable')})
        with page.expect_navigation(wait_until='load', timeout=30000):
            page.keyboard.press('Enter')
        page.wait_for_selector('#render-unavailable', timeout=30000)
        case['nativeReloadWorked'] = True
        case['status'] = 'passed'
    finally:
        context.close()
        browser.close()

try:
    with sync_playwright() as playwright:
        observe_webgl(playwright, 2)
        observe_webgl(playwright, 1)
        observe_unavailable(playwright)
    report['status'] = 'passed'
    print('PASS software WebGL2/WebGL1, native context loss/restoration, resolution controls and no-WebGL recovery', flush=True)
except Exception as exc:
    report['status'] = 'failed'
    report['errors'].append(str(exc))
    raise
finally:
    (OUT / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    server.terminate()
    server.wait(timeout=5)
