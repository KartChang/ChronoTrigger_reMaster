"""Real Chromium smoke tests: direct-file launch, real inputs, ATB, save/load and time travel.
Run: python -m pip install -r tests/requirements.txt && python -m playwright install chromium
Requires dist/index.html. This script launches its own localhost server.
Read-only snapshots are enabled only by ?test=1. No state mutation/teleport test hooks.
"""
from pathlib import Path
import json
import os
import subprocess
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'test-results'
OUT.mkdir(exist_ok=True)
results = []
errors = []
requests = []
server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=ROOT, env={**os.environ, 'PORT':'4175'}, stdout=subprocess.DEVNULL)

def passed(name):
    results.append(name)
    print('PASS', name, flush=True)

def snap(page):
    return page.evaluate('window.__CHRONO_TEST__.snapshot()')

def move_axis(page, slot, key, axis, target, greater=True):
    page.keyboard.down(key)
    try:
        page.wait_for_function("([slot,axis,target,greater]) => { const v=window.__CHRONO_TEST__.snapshot().players[slot][axis]; return greater ? v>=target : v<=target; }", arg=[slot,axis,target,greater], timeout=12000)
    finally:
        page.keyboard.up(key)

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'])
        context = browser.new_context(viewport={'width':1365,'height':900},device_scale_factor=1,accept_downloads=True)
        page = context.new_page()
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
        page.on('request',lambda r:requests.append(r.url))
        page.goto((ROOT/'dist/index.html').as_uri()+'?test=1',wait_until='load')
        page.wait_for_function('window.__CHRONO_TEST__ !== undefined',timeout=30000)
        page.screenshot(path=str(OUT/'01-title.png'))
        page.click('#start')
        assert snap(page)['mode']=='explore'
        passed('standalone file:// HTML launches with real WebGL')
        page.goto('http://127.0.0.1:4175/?test=1',wait_until='load')
        page.wait_for_function('window.__CHRONO_TEST__ !== undefined',timeout=30000)
        page.click('#start-coop')
        assert snap(page)['joined'] is True
        start=snap(page)
        move_axis(page,0,'d','x',0)
        after=snap(page)
        assert after['players'][0]['x']>start['players'][0]['x']
        assert after['players'][1]['x']==start['players'][1]['x']
        move_axis(page,1,'ArrowRight','x',2)
        assert snap(page)['players'][1]['x']>1
        passed('P1/P2 keyboard controls have independent ownership')
        page.click('#pause')
        frozen=snap(page)['ticks']
        page.keyboard.down('w');page.wait_for_timeout(300);page.keyboard.up('w')
        assert snap(page)['ticks']==frozen
        page.click('#resume')
        passed('pause freezes simulation and discards movement')
        page.evaluate("""() => {
            const pad=i=>({index:i,connected:true,axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false,value:0})),mapping:'standard'});
            window.__pads=[pad(0),pad(1)];window.__padReads=0;
            Object.defineProperty(navigator,'getGamepads',{value:()=>{window.__padReads++;return window.__pads;},configurable:true});
            window.__pads[0].axes[0]=-1;
        }""")
        p0=snap(page)['players'][0]['x']
        page.wait_for_function('(x)=>window.__CHRONO_TEST__.snapshot().players[0].x<x-.25',arg=p0)
        page.evaluate('window.__pads[0]=null;window.__pads[1].axes[0]=1')
        p0=snap(page)['players'][0]['x'];p1=snap(page)['players'][1]['x']
        page.wait_for_function('(x)=>window.__CHRONO_TEST__.snapshot().players[1].x>x+.25',arg=p1)
        page.evaluate('window.__pads[1].axes[0]=0')
        assert abs(snap(page)['players'][0]['x']-p0)<.08
        passed('gamepad disconnect does not reassign P2 to P1')
        page.evaluate("window.__pads[0]={index:0,connected:true,axes:[0,0],buttons:Array.from({length:16},(_,i)=>({pressed:i===9,value:i===9?1:0})),mapping:'standard'}")
        page.wait_for_function('window.__CHRONO_TEST__.paused()')
        page.wait_for_timeout(300)
        assert page.evaluate('window.__CHRONO_TEST__.paused()') is True
        released_at=page.evaluate('window.__pads[0].buttons[9].pressed=false;window.__padReads')
        # Wait for the real input poll to observe release; software GPU frames can exceed 100 ms.
        page.wait_for_function('(n)=>window.__padReads>n',arg=released_at)
        page.evaluate('window.__pads[0].buttons[9].pressed=true')
        page.wait_for_function('!window.__CHRONO_TEST__.paused()')
        page.evaluate('window.__pads=[]')
        passed('held gamepad Start produces only one pause edge')
        page.click('#save')
        page.wait_for_function("document.querySelector('#message').textContent.includes('存檔完成')")
        saved=snap(page)
        move_axis(page,0,'a','x',-2,False)
        page.click('#load')
        page.wait_for_function('(x)=>Math.abs(window.__CHRONO_TEST__.snapshot().players[0].x-x)<.02',arg=saved['players'][0]['x'])
        passed('IndexedDB save and load restore gameplay state')
        page.screenshot(path=str(OUT/'02-explore.png'))
        page.click('#trial')
        page.wait_for_function('window.__CHRONO_TEST__.snapshot().players.every(p=>p.atb>=1)',timeout=20000)
        page.click('[data-slot="0"][data-action="combo"]')
        assert snap(page)['players'][0]['mp']==18
        assert snap(page)['enemies'][0]['hp']==90
        page.click('[data-slot="1"][data-action="combo"]')
        assert [p['mp'] for p in snap(page)['players']]==[14,14]
        assert [e['hp'] for e in snap(page)['enemies']]==[18,18]
        page.screenshot(path=str(OUT/'03-coop-battle.png'))
        passed('two independent confirmations execute an atomic combo')
        page.wait_for_function('window.__CHRONO_TEST__.snapshot().players.every(p=>p.atb>=1)',timeout=20000)
        page.click('[data-slot="0"][data-action="attack"]')
        page.click('[data-slot="1"][data-action="attack"]')
        assert snap(page)['mode']=='victory'
        page.click('#continue')
        assert snap(page)['mode']=='explore'
        passed('battle victory returns to a healed exploration party')
        move_axis(page,0,'a','x',-4.3,False)
        move_axis(page,0,'w','z',-2.0)
        page.keyboard.press('e')
        page.wait_for_selector('#dialog:not([hidden])')
        assert snap(page)['flags']['repaired'] is True
        page.click('#dialog-close')
        move_axis(page,0,'d','x',-.5)
        page.keyboard.down('w');page.keyboard.down('ArrowUp')
        try:
            page.wait_for_function('window.__CHRONO_TEST__.snapshot().players[0].z>7.35',timeout=20000)
        finally:
            page.keyboard.up('w');page.keyboard.up('ArrowUp')
        page.keyboard.press('e')
        page.wait_for_function("window.__CHRONO_TEST__.snapshot().era==='future'")
        assert snap(page)['flags']['visitedFuture'] is True
        assert snap(page)['flags']['repaired'] is True
        page.click('#dialog-close')
        page.screenshot(path=str(OUT/'04-future.png'))
        passed('real exploration input repairs the past and travels to future')
        page.click('#save')
        page.wait_for_function("document.querySelector('#message').textContent.includes('存檔完成')")
        page.reload(wait_until='load');page.wait_for_function('window.__CHRONO_TEST__ !== undefined')
        page.click('#start');page.click('#load')
        page.wait_for_function("window.__CHRONO_TEST__.snapshot().era==='future'")
        assert snap(page)['flags']['repaired'] is True
        passed('progress survives actual browser reload')
        with page.expect_download() as download:
            page.click('#export')
        download.value.save_as(str(OUT/'exported-save.json'))
        raw=json.loads((OUT/'exported-save.json').read_text())
        assert raw['version']==1 and raw['era']=='future'
        passed('portable save export contains validated progress')
        page.set_viewport_size({'width':390,'height':844})
        page.wait_for_timeout(200)
        assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
        page.screenshot(path=str(OUT/'05-phone-layout.png'))
        page.set_viewport_size({'width':844,'height':390})
        page.wait_for_timeout(200)
        page.screenshot(path=str(OUT/'06-landscape-layout.png'))
        passed('phone/landscape layouts fit viewport (not physical-device certification)')
        external=[url for url in requests if not url.startswith(('file:','http://127.0.0.1:4175/','data:','blob:'))]
        assert not external,external
        assert not errors,errors
        passed('no external resource requests or browser console errors')
        browser.close()
    report={'status':'passed','checks':len(results),'passed':results,'errors':errors,'limitations':['Software-rendered Chromium, not a hardware FPS benchmark.','Gamepad mapping is API-simulated; physical controllers are not verified.','Responsive viewports are not iOS/Android device tests.'],'requests':requests}
    (OUT/'browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
except Exception as exc:
    (OUT/'browser-report.json').write_text(json.dumps({'status':'failed','passed':results,'failure':str(exc),'errors':errors},ensure_ascii=False,indent=2))
    raise
finally:
    server.terminate()
    server.wait(timeout=10)
