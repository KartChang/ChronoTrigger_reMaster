"""Fair slice acceptance via real UI/keys. Snapshots observe; no game-state writes.
Uses a fresh browser context and its own HTTP origin. Not physical device certification.
"""
from native_chooser import arm_native_chooser, chooser_observation, assert_one_chooser
from pathlib import Path
import json, math, subprocess, sys, time
from native_import import import_save, import_context
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'test-results' / 'fair'
OUT.mkdir(parents=True, exist_ok=True)
checks, errors, waits, requests = [], [], [], []
server = subprocess.Popen([sys.executable, '-m', 'http.server', '4176', '--bind', '127.0.0.1'], cwd=ROOT/'dist', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def snapshot(page):
    return page.evaluate('window.__CHRONO_TEST__.snapshot()')

def record(name):
    checks.append(name)
    print('PASS', name, flush=True)

def wait_game(page, expression, mode='explore', budget=300):
    start = snapshot(page)['ticks']
    began = time.monotonic()
    observation = page.wait_for_function("""({start,budget,mode,expression})=>{
        const t=window.__CHRONO_TEST__,s=t.snapshot();
        // Expression is fixed test code, never untrusted input or a mutation.
        const ready=Function('s','return ('+expression+')')(s);
        if(t.paused()||s.mode!==mode||s.ticks<start||s.ticks-start>budget)
            return {ok:false,paused:t.paused(),state:s};
        return ready?{ok:true,state:s}:false;
    }""",arg={'start':start,'budget':budget,'mode':mode,'expression':expression},polling=100,timeout=90000)
    observed=observation.json_value();observation.dispose()
    waits.append({'predicate':expression,'start':start,'budget':budget,'elapsed':round(time.monotonic()-began,2),'observed':observed})
    assert observed['ok'],observed

def move(page, axis, target, keys, greater=True):
    distance=abs(snapshot(page)['players'][0][axis]-target)
    for key in keys:page.keyboard.down(key)
    try:
        wait_game(page,f's.players[0].{axis}{">=" if greater else "<="}{target}',budget=math.ceil((distance/4+2)*60))
    finally:
        for key in keys:page.keyboard.up(key)

def talk(page, title):
    page.keyboard.press('e')
    page.wait_for_selector('#dialog:not([hidden])')
    assert title in page.locator('#dialog-title').inner_text()
    page.click('#dialog-close')

def start(page, selector):
    page.goto('http://127.0.0.1:4176/?test=1',wait_until='load')
    page.wait_for_function('window.__CHRONO_TEST__ !== undefined',timeout=30000)
    page.click(selector)

try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'])
        page=browser.new_page(viewport={'width':1365,'height':900},accept_downloads=True);arm_native_chooser(page)
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
        page.on('request',lambda r:requests.append(r.url))
        try:
            start(page,'#start-fair')
            assert snapshot(page)['chapter']=='fair'
            assert snapshot(page)['joined'] is False
            assert page.locator('#location').inner_text()=='千年祭 · 鐘之廣場'
            page.screenshot(path=str(OUT/'01-fair-arrival.png'))
            record('fair entry displays the chapter and independent authored scenery')
            move(page,'x',-3.4,['a'],False)
            move(page,'z',-1.7,['w'])
            talk(page,'莉妮之鐘')
            assert snapshot(page)['fair']['bellHeard'] is True
            assert snapshot(page)['fair']['telepodTested'] is False
            record('walking to bell triggers only its own event')
            page.keyboard.press('c')
            assert snapshot(page)['joined'] is True
            move(page,'x',-6.8,['a'],False)
            move(page,'z',2.5,['w'])
            talk(page,'岡薩雷斯')
            assert snapshot(page)['mode']=='battle'
            assert len(snapshot(page)['enemies'])==1
            wait_game(page,'s.players.every(p=>p.atb>=1)',mode='battle',budget=180)
            page.click('[data-slot="0"][data-action="combo"]')
            assert snapshot(page)['enemies'][0]['hp']==120
            assert [p['mp'] for p in snapshot(page)['players']]==[18,18]
            page.click('[data-slot="1"][data-action="combo"]')
            assert snapshot(page)['enemies'][0]['hp']==48
            assert [p['mp'] for p in snapshot(page)['players']]==[14,14]
            page.screenshot(path=str(OUT/'02-gato-coop.png'))
            wait_game(page,'s.players.every(p=>p.atb>=1)',mode='battle',budget=180)
            page.click('[data-slot="0"][data-action="attack"]')
            page.click('[data-slot="1"][data-action="attack"]')
            assert snapshot(page)['mode']=='victory'
            assert snapshot(page)['fair']['gatoWon'] is True
            assert snapshot(page)['flags']['won'] is False
            page.click('#continue')
            assert snapshot(page)['mode']=='explore'
            assert all(p['hp']==120 for p in snapshot(page)['players'])
            record('optional Gato challenge uses two confirmations and returns to the fair')
            move(page,'x',-1,['d','ArrowRight'])
            move(page,'z',6.4,['w','ArrowUp'])
            talk(page,'露卡')
            assert snapshot(page)['fair']['luccaMet'] is True
            move(page,'x',-2.4,['a'],False)
            move(page,'z',8.7,['w'])
            peer_before=snapshot(page)['players'][1]
            talk(page,'短距離傳送成功')
            assert snapshot(page)['fair']['telepodTested'] is True
            assert snapshot(page)['players'][0]['x']==2.4
            assert snapshot(page)['players'][1]==peer_before
            assert snapshot(page)['era']=='present'
            page.screenshot(path=str(OUT/'03-telepod.png'))
            record('Lucca unlocks short-range telepod without moving the other player or inventing time travel')
            page.click('#save')
            page.wait_for_function("document.querySelector('#message').textContent.includes('存檔完成')")
            saved=snapshot(page)
            with page.expect_download() as download:page.click('#export')
            download.value.save_as(str(OUT/'fair-save-v2.json'))
            exported=json.loads((OUT/'fair-save-v2.json').read_text())
            assert exported['version']==2 and exported['chapter']=='fair'
            assert exported['fair']==saved['fair']
            record('fair v2 export preserves chapter and exact event progress')
            start(page,'#start')
            page.click('#load')
            page.wait_for_function("document.querySelector('#message').textContent.includes('尚無本機存檔')")
            assert snapshot(page)['chapter']=='lab'
            page.click('#save')
            page.wait_for_function("document.querySelector('#message').textContent.includes('存檔完成')")
            start(page,'#start-fair')
            page.click('#load')
            page.wait_for_function('window.__CHRONO_TEST__.snapshot().fair.telepodTested')
            assert snapshot(page)['fair']==saved['fair']
            assert [[p[k] for k in ('x','z','hp','mp')] for p in snapshot(page)['players']]==[[p[k] for k in ('x','z','hp','mp')] for p in saved['players']]
            assert snapshot(page)['joined'] is True
            record('separate lab/fair IndexedDB slots survive reload without overwriting each other')
            corrupt={**exported,'fair':{**exported['fair'],'luccaMet':False}}
            before=snapshot(page)
            import_save(page,{'name':'invalid-fair.json','mimeType':'application/json','buffer':json.dumps(corrupt).encode()},OUT,expected='rejected',label='invalid-fair-event-sequence')
            page.wait_for_function("document.querySelector('#message').textContent.includes('匯入失敗')")
            after=snapshot(page)
            assert after['fair']==before['fair'] and after['players']==before['players']
            record('invalid imported event sequence is rejected without destroying progress')
            page.set_viewport_size({'width':390,'height':844})
            page.wait_for_timeout(200)
            assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
            page.screenshot(path=str(OUT/'04-fair-phone.png'))
            assert not errors,errors
            external=[url for url in requests if not url.startswith(('http://127.0.0.1:4176/','data:','blob:'))]
            assert not external,external
            record('fair responsive layout has no horizontal overflow, runtime errors or external assets')
            report={'status':'passed','checks':len(checks),'passed':checks,'errors':errors,'waits':waits,'limitations':['Software Chromium is not a hardware FPS benchmark.','Phone viewport is not physical iOS/Android testing.','Scene is an authored reconstruction blockout, not the original map or full opening chapter.']}
            (OUT/'fair-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
        except Exception as exc:
            report={'status':'failed','passed':checks,'failure':str(exc),'errors':errors,'waits':waits}
            try:
                report['importContext']=import_context(page);report['lastObserved']=snapshot(page)
                report['paused']=page.evaluate('window.__CHRONO_TEST__.paused()')
                report['fps']=page.locator('#fps').inner_text()
                page.screenshot(path=str(OUT/'failure.png'),timeout=15000)
            except Exception as observation_error:report['observationError']=str(observation_error)
            (OUT/'fair-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
            raise
        finally:
            browser.close()
finally:
    server.terminate()
    try:server.wait(timeout=10)
    except subprocess.TimeoutExpired:server.kill();server.wait()
