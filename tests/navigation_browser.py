"""Actual held-input route around the lab house, then drop-in/drop-out follower.
No state injection, teleports or mocked gameplay. Uses its own local server.
"""
import json,math,os,subprocess,time
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'test-results'/'navigation';OUT.mkdir(parents=True,exist_ok=True)
passed=[];errors=[];observations=[]
server=subprocess.Popen(['node','scripts/serve.mjs'],cwd=ROOT,env={**os.environ,'PORT':'4180'},stdout=subprocess.DEVNULL)
def snap(page):return page.evaluate('window.__CHRONO_TEST__.snapshot()')
def wait_axis(page,slot,key,axis,target,increasing=True):
    page.keyboard.down(key)
    try:
        page.wait_for_function('''([slot,axis,target,increasing])=>{
          const s=window.__CHRONO_TEST__.snapshot();
          const v=s.players[slot][axis];return increasing?v>=target:v<=target;
        }''',arg=[slot,axis,target,increasing],timeout=90000)
    finally:page.keyboard.up(key)
    observations.append(snap(page))
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'])
        context=browser.new_context(viewport={'width':1280,'height':800})
        page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto('http://127.0.0.1:4180/?test=1',wait_until='load')
        page.wait_for_function('window.__CHRONO_TEST__!==undefined')
        page.click('#start-coop')
        wait_axis(page,1,'ArrowLeft','x',-8,False)
        wait_axis(page,1,'ArrowUp','z',-1.5)
        wait_axis(page,0,'a','x',-4.8,False)
        wait_axis(page,0,'w','z',5)
        wait_axis(page,0,'a','x',-8,False)
        before=snap(page)
        assert before['joined'] and before['mode']=='explore'
        assert before['players'][0]['z']>4.9 and before['players'][1]['z']<-.1
        passed.append('players reach opposite sides of the solid house through real keys')
        page.click('#coop');assert snap(page)['joined'] is False
        end=time.monotonic()+120;last=snap(page)
        while True:
            now=snap(page);a,b=now['players']
            assert now['mode']=='explore' and now['joined'] is False
            assert a['x']==before['players'][0]['x'] and a['z']==before['players'][0]['z']
            elapsed=now['ticks']-last['ticks'];old=last['players'][1]
            assert math.hypot(b['x']-old['x'],b['z']-old['z'])<=elapsed*4/60+.08,'follower teleported'
            if math.hypot(a['x']-b['x'],a['z']-b['z'])<1.8:break
            assert time.monotonic()<end,'follower failed to route around house'
            observations.append(now);last=now;page.wait_for_timeout(150)
        passed.append('solo companion walks around house without moving P1 or teleporting')
        page.screenshot(path=str(OUT/'01-follower-arrived.png'))
        page.click('#coop');assert snap(page)['joined'] is True
        before=snap(page);ticks=before['ticks']
        page.wait_for_function('(n)=>window.__CHRONO_TEST__.snapshot().ticks>n+30',arg=ticks,timeout=30000)
        after=snap(page)
        assert after['players'][1]['x']==before['players'][1]['x'] and after['players'][1]['z']==before['players'][1]['z']
        passed.append('rejoining P2 restores exclusive manual ownership')
        assert not errors,errors
        browser.close()
    report={'status':'passed','checks':len(passed),'passed':passed,'errors':errors,'observations':observations}
    (OUT/'navigation-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
except Exception as e:
    (OUT/'navigation-report.json').write_text(json.dumps({'status':'failed','failure':str(e),'passed':passed,'errors':errors,'observations':observations},ensure_ascii=False,indent=2),encoding='utf-8');raise
finally:
    server.terminate();server.wait(timeout=10)
