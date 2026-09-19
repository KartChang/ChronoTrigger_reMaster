"""Continue from the actual v3 export produced by opening_browser.py in this same CI run.
Imports through the real UI; never edits a save, injects state, teleports or accelerates time.
"""
from pathlib import Path
import json, math, subprocess, sys, time
from native_import import import_save, import_context
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'test-results'/'kingdom'
OUT.mkdir(parents=True,exist_ok=True)
SOURCE=ROOT/'test-results'/'opening'/'opening-save-v3.json'
checks,errors,waits,requests=[],[],[],[]
server=subprocess.Popen([sys.executable,'-m','http.server','4178','--bind','127.0.0.1'],cwd=ROOT/'dist',stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
def snap(page):return page.evaluate('window.__CHRONO_TEST__.snapshot()')
def passed(name):checks.append(name);print('PASS',name,flush=True)
def wait_game(page,expression,budget=300,modes=('explore',)):
    start=snap(page)['ticks'];began=time.monotonic()
    handle=page.wait_for_function("""({start,budget,modes,expression})=>{
        const t=window.__CHRONO_TEST__,s=t.snapshot();
        if(t.paused()||!modes.includes(s.mode)||s.ticks<start||s.ticks-start>budget)
            return {ok:false,state:s,paused:t.paused()};
        return Function('s','return ('+expression+')')(s)?{ok:true,state:s}:false;
    }""",arg={'start':start,'budget':budget,'modes':list(modes),'expression':expression},polling=100,timeout=120000)
    result=handle.json_value();handle.dispose()
    waits.append({'predicate':expression,'wallSeconds':round(time.monotonic()-began,2),'observed':result})
    assert result['ok'],result

def move(page,axis,target,keys,greater=True,modes=('explore',)):
    distance=abs(snap(page)['players'][0][axis]-target)
    for key in keys:page.keyboard.down(key)
    try:wait_game(page,f's.mode==="battle" || s.players[0].{axis}{">=" if greater else "<="}{target}',math.ceil((distance/4+2)*60),modes=modes)
    finally:
        for key in keys:page.keyboard.up(key)

def talk(page,title):
    page.keyboard.press('e');page.wait_for_selector('#dialog:not([hidden])')
    assert title in page.locator('#dialog-title').inner_text()
    page.click('#dialog-close')

def export(page,filename):
    with page.expect_download() as d:page.click('#export')
    d.value.save_as(str(OUT/filename));return json.loads((OUT/filename).read_text())

try:
    assert SOURCE.exists(),'Run opening_browser.py first; a real player export is required.'
    source=json.loads(SOURCE.read_text());assert source['version']==3 and source['opening']['phase']=='vista'
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'])
        page=browser.new_page(viewport={'width':1200,'height':800},accept_downloads=True)
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
        page.on('request',lambda r:requests.append(r.url))
        try:
            page.goto('http://127.0.0.1:4178/?test=1',wait_until='load');page.wait_for_function('window.__CHRONO_TEST__ !== undefined',timeout=30000)
            page.click('#start-fair-coop');import_save(page,SOURCE,OUT)
            page.wait_for_function('window.__CHRONO_TEST__.snapshot().chapter==="canyon"')
            tick=snap(page)['ticks'];wait_game(page,f's.ticks>{tick}',60)
            talk(page,'托魯斯');assert snap(page)['chapter']=='truce'
            assert snap(page)['kingdom']['phase']=='arrival' and snap(page)['joined'] is True
            page.screenshot(path=str(OUT/'01-truce.png'))
            passed('unmodified player-produced v3 export imports and continues into Truce')
            move(page,'z',1,['s'],False);move(page,'x',-4.5,['a'],False);talk(page,'鎮民')
            assert snap(page)['kingdom']['heardYear'] is True
            move(page,'x',0,['d']);move(page,'z',-4.3,['s'],False);move(page,'x',-6.5,['a'],False);talk(page,'旅店')
            assert snap(page)['players'][0]['hp']==120 and snap(page)['players'][0]['mp']==18
            passed('town information and inn are reachable through actual movement and interaction')
            move(page,'x',7.3,['d']);talk(page,'森林');assert snap(page)['chapter']=='forest'
            move(page,'z',1,['w'],modes=('explore','battle'))
            assert snap(page)['mode']=='battle' and len(snap(page)['enemies'])==2
            assert page.locator('[data-slot="1"][data-action="attack"]').is_disabled()
            page.screenshot(path=str(OUT/'02-forest-battle.png'))
            for _ in range(2):
                wait_game(page,'s.players[0].atb>=1',180,('battle',));page.click('[data-slot="0"][data-action="skill"]')
            assert snap(page)['mode']=='victory' and snap(page)['kingdom']['forestWon'] is True
            assert snap(page)['players'][1]['hp']==120
            page.click('#continue')
            passed('forest encounter uses lone Crono and does not resurrect Marle or overwrite old victories')
            move(page,'x',0,['d']);move(page,'z',8.2,['w']);talk(page,'王城')
            assert snap(page)['chapter']=='castle'
            page.screenshot(path=str(OUT/'03-guardia-hall.png'))
            move(page,'z',-2.6,['w']);move(page,'x',-1,['a'],False);talk(page,'衛兵')
            assert snap(page)['kingdom']['phase']=='audience'
            move(page,'z',4,['w']);move(page,'x',8,['d']);move(page,'z',6.2,['w']);talk(page,'王后房間')
            assert snap(page)['chapter']=='chamber'
            passed('guard admission and physical eastern stairs lead to queen chamber')
            move(page,'z',.6,['w'])
            page.keyboard.press('e');page.wait_for_selector('#dialog:not([hidden])')
            assert page.locator('#dialog-title').inner_text()=='瑪兒'
            assert snap(page)['kingdom']['phase']=='erasing'
            page.screenshot(path=str(OUT/'04-queen-reunion.png'));page.click('#dialog-close')
            page.keyboard.press('Escape');page.wait_for_function('window.__CHRONO_TEST__.paused()')
            paused=snap(page);page.wait_for_timeout(350)
            assert snap(page)['kingdom']==paused['kingdom'] and snap(page)['ticks']==paused['ticks']
            page.keyboard.press('Escape');wait_game(page,'s.kingdom.phase==="missing"',200)
            assert page.locator('[data-slot="1"][data-action="attack"]').is_disabled()
            page.screenshot(path=str(OUT/'05-queen-gone.png'))
            passed('queen reunion and disappearance respect pause and do not give P2 phantom control')
            move(page,'z',-6.8,['s'],False);talk(page,'王城');move(page,'z',-3.2,['s'],False);move(page,'x',2.5,['a'],False)
            talk(page,'露卡加入');assert snap(page)['kingdom']['phase']=='rescue'
            page.wait_for_function('document.querySelector("#p1-name").textContent==="露卡"')
            p0=snap(page)['players'][0];x=snap(page)['players'][1]['x']
            page.keyboard.down('ArrowRight')
            try:wait_game(page,f's.players[1].x>{x+.3}',100)
            finally:page.keyboard.up('ArrowRight')
            assert snap(page)['players'][0]['x']==p0['x'] and snap(page)['players'][0]['z']==p0['z']
            page.screenshot(path=str(OUT/'06-lucca-coop.png'))
            passed('Lucca explicitly joins and P2 independently moves the new companion')
            page.click('#save');page.wait_for_function('document.querySelector("#message").textContent.includes("存檔完成")')
            saved=export(page,'kingdom-save-v4.json');assert saved['version']==4 and saved['kingdom']['phase']=='rescue'
            page.reload(wait_until='load');page.wait_for_function('window.__CHRONO_TEST__ !== undefined',timeout=30000)
            page.click('#start-fair');page.click('#load');page.wait_for_function('window.__CHRONO_TEST__.snapshot().kingdom.phase==="rescue"')
            assert snap(page)['chapter']=='castle' and snap(page)['joined'] is True
            assert [p['mp'] for p in snap(page)['players']]==[p['mp'] for p in saved['players']]
            tick=snap(page)['ticks'];wait_game(page,f's.ticks>{tick}',60)
            passed('v4 save reload restores chapter, story flags, co-op and actual Lucca identity')
            move(page,'x',0,['a','ArrowLeft'],False);move(page,'z',-6.8,['s','ArrowDown'],False);talk(page,'森林')
            assert snap(page)['chapter']=='forest' and snap(page)['mode']=='explore'
            move(page,'z',.5,['s','ArrowDown'],False);move(page,'x',-9,['a','ArrowLeft'],False)
            talk(page,'修道院');assert snap(page)['kingdom']['forestWon'] is True
            page.screenshot(path=str(OUT/'07-cathedral-boundary.png'))
            passed('two players backtrack through cleared forest to the cathedral entrance')
            assert not errors,errors
            assert not [u for u in requests if not u.startswith(('http://127.0.0.1:4178/','data:','blob:'))],requests
            report={'status':'passed','passed':checks,'errors':errors,'waits':waits,'sourceSave':'opening/opening-save-v3.json from preceding same-run browser test','limitations':['Compact hand-authored maps and paraphrased dialogue; not exact original assets or numerics.','Software GPU and keyboard only; no physical controller or mobile performance certification.','The rescue journey is covered by the separate same-run rescue_browser.py.']}
        except Exception as exc:
            report={'status':'failed','passed':checks,'errors':errors,'waits':waits,'failure':str(exc)}
            try:
                report['importContext']=import_context(page);report['lastObserved']=snap(page);report['paused']=page.evaluate('window.__CHRONO_TEST__.paused()');report['fps']=page.locator('#fps').inner_text()
                page.screenshot(path=str(OUT/'failure.png'),timeout=15000)
            except Exception as e:report['observationError']=str(e)
            raise
        finally:
            if 'report' in locals():(OUT/'kingdom-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
            browser.close()
finally:
    server.terminate()
    try:server.wait(timeout=10)
    except subprocess.TimeoutExpired:server.kill();server.wait()
