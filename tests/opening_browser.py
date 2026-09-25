"""Opening acceptance: real input -> pendant -> lone 600 AD encounter -> v3 reload.
No mutation hooks, teleports or time acceleration. GPU screenshots are not a hardware benchmark.
"""
from native_chooser import arm_native_chooser, chooser_observation, assert_one_chooser
from pathlib import Path
import json, math, subprocess, sys, time
from native_import import import_save, import_context
from field_enemy_motion import observe_field_enemy_battle
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'test-results'/'opening'
OUT.mkdir(parents=True,exist_ok=True)
checks,errors,waits,requests=[],[],[],[]
server=subprocess.Popen([sys.executable,'-m','http.server','4177','--bind','127.0.0.1'],cwd=ROOT/'dist',stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
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
    observed=handle.json_value();handle.dispose()
    waits.append({'predicate':expression,'start':start,'budget':budget,'wallSeconds':round(time.monotonic()-began,2),'observed':observed})
    assert observed['ok'],observed

def move(page,axis,target,keys,greater=True):
    distance=abs(snap(page)['players'][0][axis]-target)
    for key in keys:page.keyboard.down(key)
    try:wait_game(page,f's.players[0].{axis}{">=" if greater else "<="}{target}',math.ceil((distance/4+2)*60))
    finally:
        for key in keys:page.keyboard.up(key)

def talk(page,title):
    page.keyboard.press('e');page.wait_for_selector('#dialog:not([hidden])')
    assert title in page.locator('#dialog-title').inner_text()
    page.click('#dialog-close')

def export(page,filename):
    with page.expect_download() as download:page.click('#export')
    download.value.save_as(str(OUT/filename))
    return json.loads((OUT/filename).read_text())

try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'])
        page=browser.new_page(viewport={'width':1200,'height':800},accept_downloads=True);arm_native_chooser(page)
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
        page.on('request',lambda r:requests.append(r.url))
        try:
            page.goto('http://127.0.0.1:4177/?test=1',wait_until='load')
            page.wait_for_function('window.__CHRONO_TEST__ !== undefined',timeout=30000)
            page.click('#start-fair-coop')
            assert snap(page)['joined'] is True
            assert snap(page)['opening']['phase']=='none'
            page.screenshot(path=str(OUT/'01-classic-fair.png'))
            passed('classic fair entry retains independently controlled two-player party')
            move(page,'z',6.4,['w','ArrowUp']);talk(page,'露卡')
            move(page,'x',-2.4,['a'],False);move(page,'z',8.7,['w'])
            talk(page,'短距離傳送成功')
            assert snap(page)['fair']['telepodTested'] is True
            move(page,'z',7.0,['s'],False);move(page,'x',0,['a'],False)
            page.keyboard.press('e');page.wait_for_selector('#dialog:not([hidden])')
            assert page.locator('#dialog-title').inner_text()=='瑪兒'
            assert snap(page)['opening']['phase']=='approach'
            page.screenshot(path=str(OUT/'02-marle-volunteers.png'))
            page.click('#dialog-close')
            # Escape is a real user pause input, available even while the cinematic hides utility buttons.
            page.keyboard.press('Escape');page.wait_for_function('window.__CHRONO_TEST__.paused()')
            paused=snap(page);page.wait_for_timeout(350)
            assert snap(page)['ticks']==paused['ticks']
            assert snap(page)['opening']==paused['opening']
            page.keyboard.press('Escape');page.wait_for_function('!window.__CHRONO_TEST__.paused()')
            wait_game(page,"s.opening.phase==='lost'",budget=400)
            assert snap(page)['chapter']=='fair' and snap(page)['era']=='present'
            page.wait_for_function("!document.querySelector('#story-coop-note').hidden")
            page.screenshot(path=str(OUT/'03-pendant-accident.png'))
            passed('Marle volunteers, cinematic respects pause, disappearance leaves pendant in present')
            inactive=tuple(snap(page)['players'][1][k] for k in ('x','z','hp','mp'))
            tick=snap(page)['ticks'];page.keyboard.down('ArrowRight')
            try:wait_game(page,f's.ticks>={tick+15}',budget=60)
            finally:page.keyboard.up('ArrowRight')
            assert tuple(snap(page)['players'][1][k] for k in ('x','z','hp','mp'))==inactive
            assert page.locator('[data-slot="1"][data-action="attack"]').is_disabled()
            passed('departed Marle cannot remain an invisible controllable companion')
            move(page,'x',-2.4,['a'],False);move(page,'z',8.7,['w'])
            talk(page,'露卡');assert snap(page)['opening']['phase']=='pendant'
            pendant=export(page,'pendant-save-v3.json')
            assert pendant['version']==3 and pendant['opening']['phase']=='pendant'
            assert pendant['chapter']=='fair' and pendant['era']=='present'
            talk(page,'克羅諾')
            wait_game(page,"s.chapter==='canyon'",budget=150)
            assert snap(page)['era']=='middle' and snap(page)['opening']['phase']=='canyon'
            assert snap(page)['joined'] is True
            page.screenshot(path=str(OUT/'04-canyon-arrival.png'))
            passed('two ordered interactions recover pendant then reach 600 AD without inventing a second active actor')
            page.keyboard.down('s')
            try:wait_game(page,"s.mode==='battle'",budget=100,modes=('explore','battle'))
            finally:page.keyboard.up('s')
            assert len(snap(page)['enemies'])==3
            assert all(e['hp']==48 for e in snap(page)['enemies'])
            assert snap(page)['players'][1]['atb']==0
            assert page.locator('[data-slot="0"][data-action="combo"]').is_disabled()
            page.screenshot(path=str(OUT/'05-canyon-battle.png'))
            observe_field_enemy_battle(page, OUT)
            for _ in range(3):
                wait_game(page,'s.players[0].atb>=1',budget=180,modes=('battle',))
                page.click('[data-slot="0"][data-action="skill"]')
            assert snap(page)['mode']=='victory'
            assert snap(page)['opening']['canyonWon'] is True
            assert snap(page)['players'][1]['hp']==120
            assert snap(page)['fair']['gatoWon'] is False
            page.click('#continue');assert snap(page)['chapter']=='canyon'
            passed('lone Crono wins three-imp ATB encounter without Marle actions, combo or Gato flag contamination')
            move(page,'z',-6.1,['s'],False);talk(page,'600 年')
            assert snap(page)['opening']['phase']=='vista'
            page.screenshot(path=str(OUT/'06-canyon-path.png'))
            page.click('#save');page.wait_for_function("document.querySelector('#message').textContent.includes('存檔完成')")
            exported=export(page,'opening-save-v3.json')
            assert exported['version']==3 and exported['chapter']=='canyon'
            assert exported['opening']=={'phase':'vista','canyonWon':True}
            page.reload(wait_until='load');page.wait_for_function('window.__CHRONO_TEST__ !== undefined',timeout=30000)
            page.click('#start-fair');page.click('#load')
            page.wait_for_function("window.__CHRONO_TEST__.snapshot().chapter==='canyon'")
            assert snap(page)['opening']=={'phase':'vista','elapsed':0,'canyonWon':True}
            assert snap(page)['joined'] is True
            assert page.locator('[data-slot="1"][data-action="attack"]').is_disabled()
            passed('v3 adventure save reloads the correct map, lone-party state and completed encounter from fair entry')
            before=snap(page)
            corrupt={**exported,'opening':{'phase':'resonance','canyonWon':True}}
            import_save(page,{'name':'bad-opening.json','mimeType':'application/json','buffer':json.dumps(corrupt).encode()},OUT,expected='rejected',label='invalid-opening-phase')
            page.wait_for_function("document.querySelector('#message').textContent.includes('匯入失敗')")
            after=snap(page)
            assert after['opening']==before['opening'] and after['chapter']==before['chapter']
            assert after['players']==before['players']
            assert not errors,errors
            external=[u for u in requests if not u.startswith(('http://127.0.0.1:4177/','data:','blob:'))]
            assert not external,external
            passed('transient/corrupt v3 import is rejected without state loss, console errors or external assets')
            report={'status':'passed','checks':len(checks),'passed':checks,'errors':errors,'waits':waits,'limitations':['Software Chromium, not physical GPU/controller certification.','Hand-authored reconstruction; no ROM data, original soundtrack, full Truce/Guardia maps or final art.','P2 spectates after Marle disappears; no later reunion implemented.']}
        except Exception as exc:
            report={'status':'failed','passed':checks,'failure':str(exc),'errors':errors,'waits':waits}
            try:
                report['importContext']=import_context(page);report['lastObserved']=snap(page)
                report['paused']=page.evaluate('window.__CHRONO_TEST__.paused()')
                report['fps']=page.locator('#fps').inner_text()
                page.screenshot(path=str(OUT/'failure.png'),timeout=15000)
            except Exception as observe_error:report['observationError']=str(observe_error)
            raise
        finally:
            if 'report' in locals():(OUT/'opening-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
            browser.close()
finally:
    server.terminate()
    try:server.wait(timeout=10)
    except subprocess.TimeoutExpired:server.kill();server.wait()
