"""Reference-art/targeting integration through real UI. No state mutation hooks.
Existing chapter journeys remain separately required. Read-only render observations
prove clips reached the actual renderer; PNG files alone do not establish playback.
"""
from pathlib import Path
import json,math,subprocess,sys,time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'test-results'/'reference'
OUT.mkdir(parents=True,exist_ok=True)
checks,errors,waits,requests=[],[],[],[]
server=subprocess.Popen([sys.executable,'-m','http.server','4179','--bind','127.0.0.1'],cwd=ROOT/'dist',stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
def snap(page):return page.evaluate('window.__CHRONO_TEST__.snapshot()')
def view(page):return page.evaluate('window.__CHRONO_TEST__.view()')
def passed(name):checks.append(name);print('PASS',name,flush=True)
def wait_game(page,expression,mode='explore',budget=300):
    start=snap(page)['ticks'];began=time.monotonic()
    h=page.wait_for_function('''({start,budget,mode,expression})=>{
        const t=window.__CHRONO_TEST__,s=t.snapshot();
        if(t.paused()||s.mode!==mode||s.ticks<start||s.ticks-start>budget)return{ok:false,state:s};
        return Function('s','return ('+expression+')')(s)?{ok:true,state:s}:false;
    }''',arg={'start':start,'budget':budget,'mode':mode,'expression':expression},polling=100,timeout=90000)
    value=h.json_value();h.dispose();waits.append({'predicate':expression,'wallSeconds':round(time.monotonic()-began,2),'observation':value})
    assert value['ok'],value

def move(page,axis,target,keys,greater=True):
    distance=abs(snap(page)['players'][0][axis]-target)
    for key in keys:page.keyboard.down(key)
    try:wait_game(page,f's.players[0].{axis}{">=" if greater else "<="}{target}',budget=math.ceil((distance/4+2)*60))
    finally:
        for key in keys:page.keyboard.up(key)

def start(page,selector):
    page.goto('http://127.0.0.1:4179/?test=1',wait_until='load')
    page.wait_for_function('window.__CHRONO_TEST__?.view!==undefined',timeout=30000)
    page.click(selector)

def observed_pose(page,slot,pose,after_tick):
    page.wait_for_function('''({slot,pose,after})=>window.__CHRONO_TEST__.view().history.some(p=>p.slot===slot&&p.pose===pose&&p.tick>=after)''',arg={'slot':slot,'pose':pose,'after':after_tick},polling=100,timeout=90000)

try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'])
        page=browser.new_page(viewport={'width':1280,'height':800})
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
        page.on('request',lambda r:requests.append(r.url))
        try:
            start(page,'#start-coop');page.click('#trial')
            wait_game(page,'s.players.every(p=>p.atb>=1)',mode='battle',budget=180)
            page.keyboard.press('r');page.keyboard.press(']')
            assert snap(page)['targets']==[1,0]
            assert [p['mp'] for p in snap(page)['players']]==[18,18]
            assert all(p['atb']==1 for p in snap(page)['players'])
            assert [e['hp'] for e in snap(page)['enemies']]==[90,90]
            assert page.locator('#target-name0').inner_text()=='敵 2'
            assert page.locator('#target-name1').inner_text()=='敵 1'
            page.screenshot(path=str(OUT/'01-independent-targets.png'))
            page.click('[data-slot="0"][data-action="attack"]')
            assert [e['hp'] for e in snap(page)['enemies']]==[90,60]
            page.click('[data-slot="1"][data-action="attack"]')
            assert [e['hp'] for e in snap(page)['enemies']]==[60,60]
            passed('P1 and P2 select and strike independent explicit targets without spending selection resources')
            page.click('[data-target-slot="0"][data-direction="previous"]')
            assert snap(page)['targets']==[0,0]
            passed('target UI remains available while ATB is recharging')
            start(page,'#start-fair-coop')
            page.screenshot(path=str(OUT/'02-reference-fair.png'))
            move(page,'z',-2,['w','ArrowUp']);move(page,'x',-6.8,['a','ArrowLeft'],False);move(page,'z',2.5,['w','ArrowUp'])
            page.keyboard.press('e');page.wait_for_selector('#dialog:not([hidden])')
            assert '岡薩雷斯' in page.locator('#dialog-title').inner_text();page.click('#dialog-close')
            wait_game(page,'s.players.every(p=>p.atb>=1)',mode='battle',budget=180)
            began=snap(page)['ticks'];page.click('[data-slot="0"][data-action="attack"]')
            observed_pose(page,0,'attack',began)
            assert snap(page)['enemies'][0]['hp']==90
            page.screenshot(path=str(OUT/'03-crono-attack.png'))
            began=snap(page)['ticks'];page.click('[data-slot="1"][data-action="skill"]')
            observed_pose(page,1,'cast',began)
            assert snap(page)['enemies'][0]['hp']==42 and snap(page)['players'][1]['mp']==15
            page.screenshot(path=str(OUT/'04-marle-cast.png'))
            passed('authored attack and cast clips reach the live renderer through real combat commands')
            # Let Gato attack once through normal simulation; no hit/HP injection.
            observed_pose(page,0,'hurt',0)
            assert snap(page)['players'][0]['hp']<120
            page.screenshot(path=str(OUT/'05-actual-hit.png'))
            passed('enemy damage produces a real hit reaction without altering combat rules')
            page.keyboard.press('Escape');page.wait_for_function('window.__CHRONO_TEST__.paused()')
            frozen=view(page)['poses'];ticks=snap(page)['ticks'];page.wait_for_timeout(350)
            assert view(page)['poses']==frozen and snap(page)['ticks']==ticks
            page.keyboard.press('Escape');page.wait_for_function('!window.__CHRONO_TEST__.paused()')
            wait_game(page,'s.players[0].atb>=1',mode='battle',budget=180)
            began=snap(page)['ticks'];page.click('[data-slot="0"][data-action="skill"]')
            assert snap(page)['mode']=='victory'
            observed_pose(page,0,'victory',began)
            page.screenshot(path=str(OUT/'06-victory.png'))
            passed('animation pauses with the game and transitions into actual victory after the final hit')
            page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(200)
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            page.screenshot(path=str(OUT/'07-phone-hud.png'))
            assert not errors,errors
            assert not [u for u in requests if not u.startswith(('http://127.0.0.1:4179/','data:','blob:'))],requests
            passed('new texture/target/animation integration has no runtime errors or external requests')
            report={'status':'passed','checks':len(checks),'passed':checks,'waits':waits,'errors':errors,'view':view(page),'limitations':['Reference-informed redraw, not pixel-identical original assets.','Pose history records actual renderer selections, not guaranteed screenshot timing.','Software WebGL is not physical GPU/controller or mobile certification.','No whole-game or 90-point quality acceptance implied.']}
        except Exception as exc:
            report={'status':'failed','passed':checks,'waits':waits,'errors':errors,'failure':str(exc)}
            try:report['state']=snap(page);report['view']=view(page);page.screenshot(path=str(OUT/'failure.png'),timeout=15000)
            except Exception as e:report['observationError']=str(e)
            raise
        finally:
            if 'report' in locals():(OUT/'reference-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
            browser.close()
finally:
    server.terminate()
    try:server.wait(timeout=10)
    except subprocess.TimeoutExpired:server.kill();server.wait()
