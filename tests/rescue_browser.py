"""Actual play from the same-run kingdom v4 export through the cathedral and homecoming.
Only keyboard, visible controls and public save/import UI mutate the game. No state hooks,
constructed saves, teleports or accelerated clocks. Software GPU is not hardware certification.
"""
from native_chooser import arm_native_chooser, chooser_observation, assert_one_chooser
from pathlib import Path
import hashlib, json, math, os, subprocess, sys, time
from rescue_route import approach_supply_chest, approach_organ, input_context
from native_import import import_save, import_context
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'test-results'/'rescue'
OUT.mkdir(parents=True,exist_ok=True)
SOURCE=ROOT/'test-results'/'kingdom'/'kingdom-save-v4.json'
checks, errors, waits, requests=[], [], [], []
feedback_geometry=[]
chest_approaches=[]
organ_approaches=[]
server=subprocess.Popen([sys.executable,'-m','http.server','4181','--bind','127.0.0.1'],cwd=ROOT/'dist',stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
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

def move(page,axis,target,battle=False):
    delta=target-snap(page)['players'][0][axis]
    if abs(delta)<.025:return
    keys=({'x':('d','ArrowRight'),'z':('w','ArrowUp')} if delta>0 else {'x':('a','ArrowLeft'),'z':('s','ArrowDown')})[axis]
    for key in keys:page.keyboard.down(key)
    try:
        wait_game(page,f's.mode==="battle" || s.players[0].{axis}{">=" if delta>0 else "<="}{target}',math.ceil((abs(delta)/4+2)*60),('explore','battle') if battle else ('explore',))
    finally:
        for key in keys:page.keyboard.up(key)

def talk(page,title):
    page.keyboard.press('e');page.wait_for_selector('#dialog:not([hidden])')
    actual=page.locator('#dialog-title').inner_text()
    assert title in actual,{'expected':title,'actual':actual,'state':snap(page)}
    page.click('#dialog-close')

def wait_view(page,expression):
    page.wait_for_function('(expression)=>Function("v","return ("+expression+")")(window.__CHRONO_TEST__.view())',arg=expression,timeout=30000)

def fight(page):
    assert snap(page)['mode']=='battle'
    for _ in range(55):
        wait_game(page,'s.mode!=="battle" || s.players.some(p=>p.hp>0 && p.atb>=1)',210,('battle','victory','defeat'))
        state=snap(page)
        if state['mode']=='victory':break
        assert state['mode']=='battle',state
        for slot,keys in [(0,('k','j')),(1,('.',','))]:
            state=snap(page)
            if state['mode']!='battle':break
            actor=state['players'][slot]
            if actor['hp']>0 and actor['atb']>=1:
                # Keyboard commands remain guarded if the autonomous ally ends the battle
                # between the observation and input. Never click a newly disabled button.
                page.keyboard.press(keys[0] if actor['mp']>=3 else keys[1])
        if snap(page)['mode']=='victory':break
    assert snap(page)['mode']=='victory',snap(page)
    page.click('#continue');assert snap(page)['mode']=='explore'

def export(page,name):
    with page.expect_download() as d:page.click('#export')
    d.value.save_as(str(OUT/name));return json.loads((OUT/name).read_text())

def save_reload(page,stage,chapter,name):
    page.click('#save');page.wait_for_function('document.querySelector("#message").textContent.includes("存檔完成")')
    data=export(page,name)
    assert data['version']==5 and data['rescue']['stage']==stage and data['chapter']==chapter
    page.reload(wait_until='load');page.wait_for_function('window.__CHRONO_TEST__ !== undefined',timeout=30000)
    page.click('#start-fair');page.click('#load')
    page.wait_for_function('([stage,chapter])=>{const s=window.__CHRONO_TEST__.snapshot();return s.rescue.stage===stage && s.chapter===chapter}',arg=[stage,chapter])
    state=snap(page)
    assert state['joined'] is True
    assert state['rescue']['tonics']==data['rescue']['tonics']
    assert state['rescue']['organOpen']==data['rescue']['organOpen']
    assert [p['hp'] for p in state['players']]==[p['hp'] for p in data['players']]
    assert state['rescue']['guest']['hp']==data['rescue']['guest']['hp']
    tick=state['ticks'];wait_game(page,f's.ticks>{tick}',60)
    return data

try:
    assert SOURCE.exists(),'Run kingdom_browser.py first; its unmodified real export is required.'
    original=SOURCE.read_bytes();source=json.loads(original)
    assert source['version']==4 and source['chapter']=='castle' and source['kingdom']['phase']=='rescue'
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE_PATH'),headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'])
        page=browser.new_page(viewport={'width':1200,'height':800},accept_downloads=True);arm_native_chooser(page)
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
        page.on('request',lambda r:requests.append(r.url))
        try:
            page.goto('http://127.0.0.1:4181/?test=1',wait_until='load');page.wait_for_function('window.__CHRONO_TEST__ !== undefined',timeout=30000)
            page.click('#start-fair-coop');import_save(page,SOURCE,OUT)
            page.wait_for_function('window.__CHRONO_TEST__.snapshot().chapter==="castle"')
            assert snap(page)['rescue']['stage']=='none'
            tick=snap(page)['ticks'];wait_game(page,f's.ticks>{tick}',60)
            move(page,'x',0);move(page,'z',-6.8);talk(page,'森林')
            move(page,'z',.5);move(page,'x',-9);talk(page,'修道院')
            assert snap(page)['chapter']=='cathedral' and snap(page)['rescue']['stage']=='entered'
            wait_view(page,'v.rescueMaps.includes("cathedral")')
            page.screenshot(path=str(OUT/'01-cathedral.png'))
            passed('unmodified same-run v4 export continues by walking into the cathedral')

            move(page,'z',1);talk(page,'王家的紋章')
            assert len(snap(page)['enemies'])==3 and snap(page)['mode']=='battle'
            wait_view(page,'!v.guest.visible')
            page.screenshot(path=str(OUT/'02-naga-ambush.png'))
            fight(page)
            assert snap(page)['rescue']['stage']=='cleared'
            move(page,'z',4.4);move(page,'x',.5);talk(page,'青蛙加入')
            assert snap(page)['rescue']['stage']=='allied' and snap(page)['rescue']['guest']['hp']==140
            wait_view(page,'v.guest.visible')
            page.wait_for_function('document.querySelector("#guest-name").textContent==="青蛙"')
            page.screenshot(path=str(OUT/'03-frog-joins.png'))
            passed('Naga ambush resolves before Frog joins as a visible independent third actor')

            # Visit the concealed door before playing the organ; a real lock must refuse it.
            move(page,'z',5.8);move(page,'x',4);move(page,'z',8.6);talk(page,'石牆')
            assert snap(page)['chapter']=='cathedral' and snap(page)['rescue']['organOpen'] is False
            approach_organ(page,move,snap,organ_approaches)
            page.screenshot(path=str(OUT/'04a-organ-approach.png'))
            talk(page,'管風琴')
            assert snap(page)['rescue']['organOpen'] is True
            page.screenshot(path=str(OUT/'04-organ.png'))
            save_reload(page,'allied','cathedral','rescue-organ-v5.json')
            talk(page,'管風琴');assert snap(page)['rescue']['organOpen']
            assert snap(page)['rescue']['tonics']==0
            passed('organ prompt at a solid prop, E activation and actual v5 reload preserve the opened route without awarding chest stock')
            move(page,'x',4);move(page,'z',8.6);talk(page,'密道')
            assert snap(page)['chapter']=='passage'
            approach_supply_chest(page,move,snap,chest_approaches)
            page.screenshot(path=str(OUT/'05a-supply-chest-approach.png'))
            talk(page,'回復藥')
            assert snap(page)['rescue']['tonics']==3 and snap(page)['rescue']['chestOpened']
            talk(page,'木箱');assert snap(page)['rescue']['tonics']==3
            save_reload(page,'allied','passage','rescue-allied-v5.json')
            wait_view(page,'v.guest.visible')
            page.screenshot(path=str(OUT/'05-passage-reload.png'))
            passed('organ lock, one-time supply chest and real v5 reload preserve Frog and route state')

            move(page,'x',0);move(page,'z',.5,battle=True)
            assert snap(page)['rescue']['encounter']=='guards'
            before=[e['hp'] for e in snap(page)['enemies']]
            wait_game(page,'s.rescue.guest.atb<.2 && s.enemies.some((e,i)=>e.hp<'+json.dumps(before)+'[i])',220,('battle',))
            assert all(p['atb']==1 for p in snap(page)['players'])
            page.keyboard.press('Escape');page.wait_for_function('window.__CHRONO_TEST__.paused()')
            frozen=snap(page);page.wait_for_timeout(400)
            assert snap(page)['ticks']==frozen['ticks'] and snap(page)['rescue']['guest']==frozen['rescue']['guest']
            page.keyboard.press('Escape');page.wait_for_function('!window.__CHRONO_TEST__.paused()')
            page.screenshot(path=str(OUT/'06-three-actor-battle.png'))
            passed('Frog spends his own ATB to damage an enemy while both human gauges remain full; pause freezes him')
            fight(page);assert snap(page)['rescue']['guardsWon'] is True
            move(page,'x',0);move(page,'z',8.3);talk(page,'深處')
            move(page,'z',3.8);talk(page,'大臣的真面目')
            assert snap(page)['enemies'][0]['kind']=='yakra' and snap(page)['enemies'][0]['maxHp']==720
            wait_game(page,'s.players[0].hp<120 && s.players[0].atb>=1',390,('battle',))
            old=snap(page)
            page.keyboard.press('u')
            now=snap(page)
            assert now['rescue']['tonics']==old['rescue']['tonics']-1
            assert now['players'][0]['hp']>old['players'][0]['hp']
            assert now['players'][0]['mp']==old['players'][0]['mp']
            assert now['players'][0]['atb']<1
            page.wait_for_function("document.querySelector('#message').textContent.includes('使用回復藥')")
            for width,height in [(1200,800),(650,900)]:
                page.set_viewport_size({'width':width,'height':height})
                measured=page.wait_for_function("""()=>{const m=document.querySelector('#message').getBoundingClientRect(),p=document.querySelector('#party').getBoundingClientRect();
                    return m.height>0&&m.bottom<=p.top-8&&m.top>=0&&m.left>=0&&m.right<=innerWidth?{message:m.toJSON(),party:p.toJSON(),width:innerWidth,height:innerHeight}:false;
                }""",timeout=10000).json_value()
                feedback_geometry.append(measured)
            page.set_viewport_size({'width':1200,'height':800})
            passed('actual recovery message clears content-sized battle panels at desktop and narrow portrait widths')
            page.screenshot(path=str(OUT/'07-yakra-battle.png'))
            passed('Yakra is an actual HP-based encounter; a real tonic input consumes stock and ATB, not MP')
            fight(page)
            assert snap(page)['rescue']['yakraWon'] is True and snap(page)['rescue']['stage']=='allied'
            move(page,'z',5.8);move(page,'x',7.8);talk(page,'真正的大臣')
            assert snap(page)['rescue']['chancellorFreed'] is True
            move(page,'x',-2.5);move(page,'z',6.8);talk(page,'莉妮王后')
            assert snap(page)['rescue']['stage']=='rescued'
            page.screenshot(path=str(OUT/'08-queen-rescued.png'))
            passed('defeating Yakra, freeing the real chancellor and speaking to the queen are separate actual actions')

            move(page,'z',5.5);move(page,'x',0);move(page,'z',-6.9);talk(page,'王城')
            assert snap(page)['chapter']=='castle' and snap(page)['rescue']['stage']=='homecoming'
            wait_view(page,'!v.guest.visible')
            move(page,'z',4);move(page,'x',8);move(page,'z',6.2);talk(page,'王后房間')
            move(page,'z',.9);talk(page,'瑪兒回來了')
            assert snap(page)['rescue']['stage']=='reunited'
            wait_view(page,'v.guest.visible')
            page.wait_for_function('document.querySelector("#guest-name").textContent==="瑪兒"')
            assert page.locator('#p1-name').inner_text()=='露卡'
            page.screenshot(path=str(OUT/'09-reunion.png'))
            save_reload(page,'reunited','chamber','rescue-reunited-v5.json')
            passed('Frog leaves at homecoming; Marle rejoins the actual party without stealing P2 Lucca ownership')

            move(page,'z',-6.8);talk(page,'王城')
            move(page,'z',4);move(page,'x',0);move(page,'z',-6.8);talk(page,'森林')
            move(page,'z',-6.8);talk(page,'托魯斯')
            move(page,'x',0);move(page,'z',7.6);talk(page,'山道')
            move(page,'z',8);talk(page,'回到 1000 年')
            assert snap(page)['rescue']['stage']=='returned' and snap(page)['chapter']=='fair' and snap(page)['era']=='present'
            wait_view(page,'v.guest.visible')
            page.screenshot(path=str(OUT/'10-return-to-1000.png'))
            saved=save_reload(page,'returned','fair','rescue-returned-v5.json')
            assert saved['rescue']['yakraWon'] and saved['rescue']['chancellorFreed']
            assert saved['rescue']['tonics']==2
            assert SOURCE.read_bytes()==original
            assert not errors,errors
            assert not [u for u in requests if not u.startswith(('http://127.0.0.1:4181/','data:','blob:'))],requests
            passed('party walks back through the kingdom and time gate; v5 reload retains the completed rescue in 1000 AD')
            report={'status':'passed','passed':checks,'errors':errors,'waits':waits,'sourceSave':'kingdom/kingdom-save-v4.json from preceding same-run browser journey','sourceSaveSha256':hashlib.sha256(original).hexdigest(),'feedbackGeometry':feedback_geometry,'limitations':['Condensed cathedral layout and paraphrased events; project battle numbers, not original full dungeon or balance.','Third ally is autonomous, not a third human slot or selectable party-roster system.','Software-rendered Chromium keyboard coverage; not hardware performance or physical-controller certification.','No new original soundtrack and no 90-point art or whole-game acceptance.']}
        except Exception as exc:
            report={'status':'failed','passed':checks,'errors':errors,'waits':waits,'failure':str(exc)}
            try:
                report['importContext']=import_context(page);report['lastObserved']=snap(page);report['paused']=page.evaluate('window.__CHRONO_TEST__.paused()');report['fps']=page.locator('#fps').inner_text()
                report['view']=page.evaluate('window.__CHRONO_TEST__.view()');report['inputContext']=input_context(page);report['focused']=report['inputContext']['focused']
                page.screenshot(path=str(OUT/'failure.png'),timeout=15000)
            except Exception as e:report['observationError']=str(e)
            raise
        finally:
            if 'report' in locals():
                report.update(organApproaches=organ_approaches,chestApproaches=chest_approaches,sourceSha=os.environ.get('GITHUB_SHA'),htmlSha256=hashlib.sha256((ROOT/'dist/index.html').read_bytes()).hexdigest(),browserVersion=browser.version,sourceSaveSha256=hashlib.sha256(original).hexdigest())
                (OUT/'rescue-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
            browser.close()
finally:
    server.terminate()
    try:server.wait(timeout=10)
    except subprocess.TimeoutExpired:server.kill();server.wait()
