"""Same-run, real UI continuation from rescue to trial, prison, tank, reunion and 2300.
No state injection, constructed saves, teleports, ROM input or accelerated clocks.
Alternate route reloads only the cell save exported by this very browser journey.
"""
from native_chooser import arm_native_chooser, chooser_observation, assert_one_chooser
from pathlib import Path
import hashlib, json, math, subprocess, sys, time
from native_import import import_save, import_context
from playwright.sync_api import sync_playwright
from hd_party_browser import record_hd_party
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'test-results'/'trial';OUT.mkdir(parents=True,exist_ok=True)
SOURCE=ROOT/'test-results'/'rescue'/'rescue-returned-v5.json'
checks,errors,waits,requests=[],[],[],[]
server=subprocess.Popen([sys.executable,'-m','http.server','4183','--bind','127.0.0.1'],cwd=ROOT/'dist',stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
def snap(page):return page.evaluate('window.__CHRONO_TEST__.snapshot()')
def passed(name):checks.append(name);print('PASS',name,flush=True)
def wait_game(page,expression,budget=240,modes=('explore',)):
    start=snap(page)['ticks'];began=time.monotonic()
    h=page.wait_for_function('''({start,budget,modes,expression})=>{
        const t=window.__CHRONO_TEST__,s=t.snapshot();
        if(t.paused()||!modes.includes(s.mode)||s.ticks<start||s.ticks-start>budget)return {ok:false,state:s,paused:t.paused()};
        return Function('s','return ('+expression+')')(s)?{ok:true,state:s}:false;
    }''',arg={'start':start,'budget':budget,'modes':list(modes),'expression':expression},polling=100,timeout=120000)
    r=h.json_value();h.dispose();waits.append({'predicate':expression,'wallSeconds':round(time.monotonic()-began,2),'observed':r});assert r['ok'],r

def stable(page):
    tick=snap(page)['ticks'];wait_game(page,f's.trial.fade===0 && s.ticks>{tick}',90,('explore','battle','victory','defeat'))
    page.wait_for_function('''()=>{const t=window.__CHRONO_TEST__;return t.view().chapter===t.snapshot().chapter}''',timeout=30000)

def move(page,axis,target,battle=False):
    delta=target-snap(page)['players'][0][axis]
    if abs(delta)<.03:return
    keys=({'x':('d','ArrowRight'),'z':('w','ArrowUp')} if delta>0 else {'x':('a','ArrowLeft'),'z':('s','ArrowDown')})[axis]
    for key in keys:page.keyboard.down(key)
    try:wait_game(page,f's.mode==="battle" || s.players[0].{axis}{">=" if delta>0 else "<="}{target}',math.ceil((abs(delta)/4+2)*60),('explore','battle') if battle else ('explore',))
    finally:
        for key in keys:page.keyboard.up(key)

def talk(page,title,choice=None,shot=None):
    page.keyboard.press('e');page.wait_for_selector('#dialog:not([hidden])')
    actual=page.locator('#dialog-title').inner_text();assert title in actual,{'expected':title,'actual':actual,'state':snap(page)}
    if shot:page.screenshot(path=str(OUT/shot))
    if choice is not None:
        assert snap(page)['trial']['choice'] is not None
        page.click('#choice-yes' if choice else '#choice-no')
        page.wait_for_selector('#dialog-close:not([hidden])')
    page.click('#dialog-close');stable(page)

def export(page,name):
    with page.expect_download() as d:page.click('#export')
    d.value.save_as(str(OUT/name));return json.loads((OUT/name).read_text())

def save_reload(page,name):
    before=snap(page);page.click('#save');page.wait_for_function("document.querySelector('#message').textContent.includes('存檔完成')")
    data=export(page,name);assert data['version']==7
    page.reload(wait_until='load');page.wait_for_function('window.__CHRONO_TEST__ !== undefined',timeout=30000)
    page.click('#start-fair-coop');page.click('#load')
    page.wait_for_function('(chapter)=>window.__CHRONO_TEST__.snapshot().chapter===chapter',arg=data['chapter'],timeout=30000);stable(page)
    after=snap(page)
    assert after['trial']['stage']==before['trial']['stage']
    assert after['trial']['history']==before['trial']['history']==data['history']
    assert after['trial']['ethers']==data['trial']['ethers'] and after['rescue']['tonics']==data['tonics']
    assert after['joined']==data['joined']
    assert [p['hp'] for p in after['players']]==[p['hp'] for p in data['players']]
    return data

def fight(page):
    page.wait_for_function('document.body.dataset.mode==="battle"')
    assert page.locator('#p0').is_visible(), 'Indoor ATB panel must remain visible'
    assert page.locator('[data-slot="0"][data-action="attack"]').is_visible()
    for _ in range(70):
        wait_game(page,'s.mode!=="battle" || s.players.some((p,i)=>p.hp>0 && p.atb>=1 && (i===0 || s.trial.luccaJoined))',210,('battle','victory','defeat'))
        s=snap(page)
        if s['mode']=='victory':break
        assert s['mode']=='battle',s
        for i,attack,skill,tonic in [(0,'j','k','u'),(1,',','.','\\')]:
            s=snap(page)
            if s['mode']!='battle':break
            if i==1 and not s['trial']['luccaJoined']:continue
            a=s['players'][i]
            if a['hp']>0 and a['atb']>=1:
                page.keyboard.press(tonic if a['hp']<55 and s['rescue']['tonics']>0 else skill if i==0 and a['mp']>=3 else attack)
        if snap(page)['mode']=='victory':break
    assert snap(page)['mode']=='victory',snap(page)
    page.click('#continue');stable(page)

def to_warden(page):
    move(page,'x',0);move(page,'z',5.6);talk(page,'階梯塔')
    move(page,'z',-.5,battle=True);assert snap(page)['mode']=='battle';fight(page)
    move(page,'z',5.6);talk(page,'露卡趕到了' if not snap(page)['trial']['luccaJoined'] else '看守室')
    assert snap(page)['chapter']=='warden' and snap(page)['trial']['luccaJoined']

try:
    assert SOURCE.exists(),'Run rescue_browser.py first; its unchanged real same-run export is required.'
    original=SOURCE.read_bytes();source=json.loads(original)
    assert source['version']==5 and source['rescue']['stage']=='returned'
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'])
        page=browser.new_page(viewport={'width':1200,'height':800},accept_downloads=True);arm_native_chooser(page)
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
        page.on('request',lambda r:requests.append(r.url))
        try:
            page.goto('http://127.0.0.1:4183/?test=1',wait_until='load');page.wait_for_function('window.__CHRONO_TEST__ !== undefined',timeout=30000)
            page.click('#start-fair-coop');import_save(page,SOURCE,OUT)
            page.wait_for_function('window.__CHRONO_TEST__.snapshot().rescue.stage==="returned"',timeout=30000);stable(page)
            move(page,'x',0);move(page,'z',-7.2);talk(page,'送瑪兒回王城')
            assert snap(page)['chapter']=='overworld1000' and snap(page)['trial']['stage']=='escort'
            assert page.locator('#p1').is_hidden()
            page.screenshot(path=str(OUT/'01-escort-world.png'))
            move(page,'x',-2.9);talk(page,'加爾迪亞森林')
            move(page,'z',5.7);talk(page,'加爾迪亞王城')
            move(page,'z',-.5);talk(page,'被捕')
            assert snap(page)['chapter']=='courtroom'
            page.wait_for_function('''()=>{const v=window.__CHRONO_TEST__.view().trialMaps,b=v.windowBounds;return b&&b.top>=.065&&b.left>=0&&b.right<=1&&b.bottom<=1&&v.npcTextures.length>=10&&v.npcTextures.every(t=>t.width===48&&t.height===64)}''',timeout=20000)
            page.screenshot(path=str(OUT/'02-courtroom.png'))
            passed('real returned v5 follows fair exit, miniature world, forest and castle arrest; P2 never takes Marle')
            talk(page,'大臣的質問',choice=True);talk(page,'大臣的質問',choice=False)
            talk(page,'裁決',shot='03-testimony.png')
            assert snap(page)['prologue']['first']=='unknown'
            assert '未記錄' in page.locator('#jury-status').inner_text()
            talk(page,'空中刑務所');cell=save_reload(page,'trial-cell-v7.json')
            assert cell['trial']['question']==3 and cell['trial']['verdict']=='not-guilty'
            assert json.loads(cell['history'])['rescue']['stage']=='returned'
            passed('court answers, unknown legacy witness facts and v7 cell save survive genuine IndexedDB reload')
            old=snap(page)['players'][1];input_tick=snap(page)['ticks']
            page.keyboard.down('ArrowUp')
            try:wait_game(page,f's.ticks>={input_tick+20}',90)
            finally:page.keyboard.up('ArrowUp')
            now=snap(page)['players'][1];assert now['x']==old['x'] and now['z']==old['z']
            move(page,'z',-1.3);talk(page,'衛兵');talk(page,'衛兵');talk(page,'鐵門打開了',shot='04-cell-guards.png');fight(page)
            assert snap(page)['trial']['cellOpen'] and not snap(page)['trial']['luccaJoined']
            move(page,'z',2.5);move(page,'x',6);talk(page,'處刑室')
            move(page,'z',2);move(page,'x',2.1);talk(page,'救出弗里茲',shot='05-fritz.png')
            assert snap(page)['trial']['fritzFreed']
            move(page,'x',0);move(page,'z',-5.8);talk(page,'獨房')
            to_warden(page)
            assert page.locator('#p1').is_visible() and page.locator('#p1-name').inner_text()=='露卡'
            passed('three real knocks lead to solo ATB escape; separate Fritz rescue; Lucca returns with P2 ownership at supervisor')
            move(page,'z',2);move(page,'x',2.1);talk(page,'龍戰車說明書')
            move(page,'x',-4);stock=snap(page)['rescue']['tonics'];talk(page,'補給箱');assert snap(page)['rescue']['tonics']==stock+2
            talk(page,'補給箱');assert snap(page)['rescue']['tonics']==stock+2
            page.click('#bag');assert page.locator('[data-bag-item="ether"][data-bag-slot="1"]').is_disabled()
            page.click('#inventory-close');stable(page)
            save_reload(page,'trial-supplies-v7.json');page.screenshot(path=str(OUT/'06-warden.png'))
            move(page,'x',0);move(page,'z',5.7);talk(page,'吊橋')
            move(page,'x',3.6,battle=True);assert snap(page)['trial']['encounter']=='tank'
            page.wait_for_function('window.__CHRONO_TEST__.view().trialMaps.assetProfile==="snes-reference-hd2d-r1"')
            first_frame=page.evaluate('window.__CHRONO_TEST__.view().trialMaps.tankFrame')
            page.wait_for_function('(first)=>window.__CHRONO_TEST__.view().trialMaps.tankFrame!==first',arg=first_frame,timeout=30000)
            second_frame=page.evaluate('window.__CHRONO_TEST__.view().trialMaps.tankFrame')
            assert {first_frame,second_frame}=={0,1}
            page.screenshot(path=str(OUT/'07a-dragon-animation.png'))
            page.keyboard.press('r')
            assert snap(page)['targets'][0]==1
            wait_game(page,'s.players[0].atb>=1 && s.players[1].atb>=1',210,('battle',))
            before=snap(page);page.keyboard.press('j');page.keyboard.press('.')
            after=snap(page);assert after['enemies'][0]['hp']==before['enemies'][0]['hp']
            assert after['enemies'][1]['hp']<before['enemies'][1]['hp']
            assert after['players'][1]['mp']==before['players'][1]['mp']-3
            wait_game(page,'s.trial.headRepairs>0',300,('battle',))
            assert snap(page)['enemies'][1]['hp']>after['enemies'][1]['hp']
            record_hd_party(page,OUT,'07-native-party-battle')
            page.screenshot(path=str(OUT/'07-dragon-tank.png'))
            passed('horizontal bridge has three live independently targeted parts; fire is blocked on head and actual head action repairs damaged body')
            wait_game(page,'s.players[1].atb>=1',210,('battle',));page.click('#bag')
            frozen=snap(page);paused_tank_frame=page.evaluate('window.__CHRONO_TEST__.view().trialMaps.tankFrame');page.keyboard.press('j');page.keyboard.press('r');page.wait_for_timeout(250)
            assert snap(page)['ticks']==frozen['ticks'] and snap(page)['enemies']==frozen['enemies']
            assert page.evaluate('window.__CHRONO_TEST__.view().trialMaps.tankFrame')==paused_tank_frame
            assert page.locator('[data-bag-item="ether"][data-bag-slot="1"]').is_enabled()
            ethers=frozen['trial']['ethers'];page.click('[data-bag-item="ether"][data-bag-slot="1"]')
            used=snap(page);assert used['trial']['ethers']==ethers-1 and used['players'][1]['mp']>frozen['players'][1]['mp'] and used['players'][1]['atb']==0
            assert page.locator('[data-bag-item="ether"][data-bag-slot="1"]').is_disabled()
            page.set_viewport_size({'width':650,'height':900});page.screenshot(path=str(OUT/'08-inventory-portrait.png'))
            bounds=page.locator('.inventory-dialog').bounding_box();assert bounds and bounds['x']>=0 and bounds['x']+bounds['width']<=650 and bounds['y']>=0 and bounds['y']+bounds['height']<=900
            page.set_viewport_size({'width':1200,'height':800});page.click('#inventory-close');stable(page)
            page.keyboard.press('q');fight(page)
            assert snap(page)['trial']['tankWon']
            passed('real inventory pauses simulation; full-target guard and one-time ether consumption/ATB are enforced; portrait menu fits viewport')
            move(page,'x',-6.5);talk(page,'加爾迪亞王城')
            move(page,'z',1.7);talk(page,'瑪兒')
            assert snap(page)['trial']['marleJoined'] and snap(page)['trial']['luccaJoined']
            page.screenshot(path=str(OUT/'09-castle-reunion.png'))
            move(page,'z',-5.6);talk(page,'加爾迪亞森林')
            move(page,'x',5.1);move(page,'z',4);talk(page,'陌生的穹頂')
            assert snap(page)['chapter']=='futuregate' and snap(page)['era']=='future'
            save_reload(page,'trial-future-v7.json');page.screenshot(path=str(OUT/'10-future-arrival.png'))
            passed('defeated tank unlocks castle reunion, Marle remains third ally, forest Gate and 2300 arrival persist in v7')
            import_save(page,OUT/'trial-cell-v7.json',OUT)
            page.wait_for_function('window.__CHRONO_TEST__.snapshot().chapter==="cellblock"',timeout=30000);stable(page)
            move(page,'x',-3.1)
            talk(page,'獨房的床鋪',choice=False);assert snap(page)['trial']['days']==0
            for day in range(1,4):talk(page,'獨房的床鋪',choice=True);assert snap(page)['trial']['days']==day
            assert snap(page)['chapter']=='execution' and snap(page)['trial']['route']=='wait' and snap(page)['trial']['luccaJoined']
            page.screenshot(path=str(OUT/'11-lucca-execution-rescue.png'))
            save_reload(page,'trial-wait-route-v7.json')
            move(page,'z',-5.7);talk(page,'獨房');to_warden(page)
            assert snap(page)['trial']['experience']==30 and not snap(page)['trial']['fritzFreed']
            passed('same-browser real cell export also supports declining wait, three-day execution rescue and merged escape without false Fritz/XP flags')
            assert not errors,errors
            assert not [u for u in requests if not u.startswith(('http://127.0.0.1:4183/','data:','blob:'))],requests
            report={'status':'passed','assetProfile':'snes-reference-hd2d-r1','tankVisualFrames':[first_frame,second_frame],'passed':checks,'errors':errors,'waits':waits,'sourceSave':'rescue/rescue-returned-v5.json from preceding same-run journey','sourceSaveSha256':hashlib.sha256(original).hexdigest(),'alternateRouteSaveSha256':hashlib.sha256((OUT/'trial-cell-v7.json').read_bytes()).hexdigest(),'limitations':['Reconstructed prison topology and combat balance, not exact original maps or data.','Missing fair witness cases and original seven-juror algorithm are not certified; unknown facts remain unknown.','Three prison days use explicit rest transitions, not original clock timing.','XP recorded, not a finished leveling/equipment/roster system.','Only arrival in 2300 is implemented here; full future route remains open.','Software-GPU keyboard evidence; no physical device/music/90-point/full-game acceptance.']}
        except Exception as exc:
            report={'status':'failed','passed':checks,'errors':errors,'waits':waits,'failure':str(exc)}
            try:
                report['importContext']=import_context(page);report['lastObserved']=snap(page);report['paused']=page.evaluate('window.__CHRONO_TEST__.paused()');report['view']=page.evaluate('window.__CHRONO_TEST__.view()');report['fps']=page.locator('#fps').inner_text();page.screenshot(path=str(OUT/'failure.png'),timeout=15000)
            except Exception as e:report['observationError']=str(e)
            raise
        finally:
            if 'report' in locals():(OUT/'trial-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
            browser.close()
finally:
    server.terminate()
    try:server.wait(timeout=10)
    except subprocess.TimeoutExpired:server.kill();server.wait()
