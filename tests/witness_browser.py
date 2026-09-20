"""Fresh UI-led story to both trial outcomes (one route per CI matrix job).
No prior save import, generated test fixtures, writable hooks or accelerated clocks.
All reloads consume only JSON this browser actually exported through the game UI.
"""
from native_chooser import arm_native_chooser, chooser_observation, assert_one_chooser
from pathlib import Path
import hashlib, json, math, os, subprocess, sys, time
from native_import import import_save, import_context
from playwright.sync_api import sync_playwright
from rescue_route import approach_supply_chest, approach_organ, input_context
ROOT=Path(__file__).resolve().parents[1]
ROUTE=os.environ.get('WITNESS_ROUTE','good')
assert ROUTE in ('good','bad')
BAD=ROUTE=='bad'
OUT=ROOT/'test-results'/('witness-'+ROUTE);OUT.mkdir(parents=True,exist_ok=True)
checks,errors,waits,saves,requests=[],[],[],[],[]
chest_approaches=[]
organ_approaches=[]
server=subprocess.Popen([sys.executable,'-m','http.server','4184','--bind','127.0.0.1'],cwd=ROOT/'dist',stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
def snap(p):return p.evaluate('window.__CHRONO_TEST__.snapshot()')
def wait(p,expression,budget=300,modes=('explore',)):
    start=snap(p)['ticks'];began=time.monotonic()
    h=p.wait_for_function('''({expression,start,budget,modes})=>{const t=window.__CHRONO_TEST__,s=t.snapshot();
      if(t.paused()||s.ticks<start||s.ticks-start>budget||!modes.includes(s.mode))return {ok:false,state:s,paused:t.paused()};
      return Function('s','return ('+expression+')')(s)?{ok:true}:false;
    }''',arg={'expression':expression,'start':start,'budget':budget,'modes':list(modes)},polling=100,timeout=120000)
    v=h.json_value();h.dispose();waits.append({'expression':expression,'wallSeconds':round(time.monotonic()-began,2),'result':v});assert v['ok'],v

def stable(p):
    start=snap(p)['ticks']
    wait(p,f's.ticks>{start} && !s.prologue.transition && s.trial.fade===0 && !(s.prologue.stage==="collision" && s.prologue.elapsed<.6)',100,('explore','battle','victory','defeat'))
    p.wait_for_function('window.__CHRONO_TEST__.view().chapter===window.__CHRONO_TEST__.snapshot().chapter',timeout=30000)

def move(p,axis,target,battle=False):
    s=snap(p);delta=target-s['players'][0][axis]
    if abs(delta)<.08:return
    key=('d' if delta>0 else 'a') if axis=='x' else ('w' if delta>0 else 's')
    speed=2.4 if s['chapter']=='overworld1000' else 4
    collision='s.prologue.stage==="collision" || ' if s['prologue']['stage']=='fair' else ''
    expression=f'{collision}s.chapter!=={json.dumps(s["chapter"])} || !!s.prologue.transition || s.mode==="battle" || s.players[0].{axis}{">=" if delta>0 else "<="}{target}'
    p.keyboard.down(key)
    try:wait(p,expression,math.ceil((abs(delta)/speed+2)*60),('explore','battle') if battle else ('explore',))
    finally:p.keyboard.up(key)

def talk(p,title=None,choice=None,shot=None):
    p.keyboard.press('e');p.wait_for_selector('#dialog:not([hidden])')
    got=p.locator('#dialog-title').inner_text()
    if title:assert title in got,{'expected':title,'got':got,'state':snap(p)}
    if shot:p.screenshot(path=str(OUT/shot))
    if choice is not None:
        assert snap(p)['trial']['choice'] or snap(p)['prologue']['choice']
        p.click('#choice-yes' if choice else '#choice-no')
        p.wait_for_selector('#dialog-close:not([hidden])')
    p.click('#dialog-close');stable(p)
    return got

def plain_interact(p):
    p.keyboard.press('e');stable(p)

def passed(name):checks.append(name);print('PASS',name,flush=True)
def save_reload(p,name):
    before=snap(p)
    p.click('#save');p.wait_for_function("document.querySelector('#message').textContent.includes('存檔完成')")
    with p.expect_download() as download:p.click('#export')
    path=OUT/name;download.value.save_as(str(path));raw=path.read_bytes();data=json.loads(raw)
    import_save(p,path,OUT)
    p.wait_for_function("document.querySelector('#message').textContent.includes('存檔已匯入')");stable(p)
    after=snap(p);assert after['chapter']==before['chapter']
    assert after['prologue']['conduct']==before['prologue']['conduct'] or all(after['prologue']['conduct'][k]==before['prologue']['conduct'][k] for k in ('sealed','askedGirl','catReturned','lunchEaten','saleAttempted','saleDeclined','returnRefused','candy'))
    if data['version']==7:
        assert after['trial']['hearing']==before['trial']['hearing']
        assert after['trial']['verdict']==before['trial']['verdict']
        assert after['trial']['ethers']==before['trial']['ethers']
    saves.append({'file':name,'sha256':hashlib.sha256(raw).hexdigest(),'version':data['version']});return data

def fight(p):
    assert snap(p)['mode']=='battle'
    for _ in range(80):
        wait(p,'s.mode!=="battle" || s.players[0].hp>0 && s.players[0].atb>=1',240,('battle','victory','defeat'))
        s=snap(p)
        if s['mode']=='victory':break
        assert s['mode']=='battle',s
        a=s['players'][0]
        if a['hp']>0 and a['atb']>=1:p.keyboard.press('u' if a['hp']<50 and s['rescue']['tonics']>0 else 'k' if a['mp']>=3 else 'j')
    assert snap(p)['mode']=='victory',snap(p)
    p.click('#continue');stable(p)

def fresh_company(p):
    p.goto('http://127.0.0.1:4184/?test=1',wait_until='load');p.wait_for_function('window.__CHRONO_TEST__ !== undefined',timeout=30000);p.click('#start-story')
    wait(p,'s.prologue.stage==="home"',200);stable(p)
    move(p,'x',0);move(p,'z',-4.1);stable(p);assert snap(p)['chapter']=='home'
    move(p,'x',0);talk(p,'母親');move(p,'z',-4.2);plain_interact(p);assert snap(p)['chapter']=='overworld1000'
    move(p,'x',.1);move(p,'z',5.1);move(p,'x',2);plain_interact(p);assert snap(p)['chapter']=='fair'
    move(p,'z',-3.1);move(p,'x',-3.5);move(p,'z',-2.2);stable(p)
    if not BAD:talk(p,'女孩')
    move(p,'z',-2.8);move(p,'x',-.5);move(p,'z',-.8);talk(p,'項鍊');move(p,'z',-2.8);move(p,'x',-3.5);move(p,'z',-2.2)
    if BAD:talk(p,'女孩',choice=False)
    talk(p,'女孩',choice=True);talk(p,'瑪兒',choice=True);assert snap(p)['prologue']['stage']=='companions'

def fair_conduct(p):
    move(p,'x',0);move(p,'z',2.4);move(p,'x',5);talk(p,'小女孩')
    move(p,'z',.8);move(p,'x',-9)
    if not BAD:
        talk(p,'走失');save_reload(p,'cat-follow-v6.json');move(p,'x',0);move(p,'x',5);move(p,'z',2.4)
        wait(p,'Math.hypot(s.prologue.conduct.cat.x-5,s.prologue.conduct.cat.z-2.4)<2.2',240)
        talk(p,'找到小貓',shot='01-cat-return.png');assert snap(p)['prologue']['conduct']['catReturned']
    else:
        move(p,'z',6.5);talk(p,'老人的午餐',shot='01-lunch.png');assert snap(p)['prologue']['conduct']['lunchEaten']
    move(p,'z',-3.4);move(p,'x',7.5);move(p,'z',-6.3);talk(p,'梅爾基歐',choice=BAD,shot='02-pendant-offer.png')
    move(p,'z',-3.4);talk(p,'瑪兒');assert snap(p)['prologue']['conduct']['candy']=='waiting'
    if BAD:move(p,'x',4)
    else:
        p.keyboard.press('Escape');p.wait_for_function('window.__CHRONO_TEST__.paused()');frozen=snap(p)
        p.wait_for_timeout(300);assert snap(p)==frozen
        p.keyboard.press('Escape');wait(p,'s.prologue.conduct.candy==="patient"',240)
    assert snap(p)['prologue']['conduct']['candy']==('rushed' if BAD else 'patient')
    p.screenshot(path=str(OUT/'03-candy-outcome.png'));save_reload(p,'fair-conduct-v6.json')
    move(p,'z',-3.4);move(p,'x',-1)
    passed('fresh witnessed cat/lunch/pendant/candy actions persist; no constructed save or writable state hook')

def rescue_return(p):
    move(p,'z',6.4);talk(p,'露卡');move(p,'x',-2.4);move(p,'z',8.4);talk(p,'傳送成功');move(p,'z',6.4);move(p,'x',0);talk(p,'瑪兒')
    wait(p,'s.opening.phase==="lost"',550);move(p,'x',-2.4);move(p,'z',8.5);talk(p,'露卡');talk(p,'克羅諾');wait(p,'s.chapter==="canyon"',160);stable(p)
    assert snap(p)['prologue']['conduct']['sealed'];save_reload(p,'canyon-conduct-v6.json')
    move(p,'z',4.8,True);fight(p);move(p,'x',0);move(p,'z',-6.5);talk(p,'600 年');talk(p,'托魯斯')
    move(p,'z',1);move(p,'x',-4.5);talk(p,'鎮民');move(p,'x',0);move(p,'z',-4.3);move(p,'x',7.3);talk(p,'森林');move(p,'z',1,True);fight(p)
    move(p,'x',0);move(p,'z',8.2);talk(p,'王城');move(p,'z',-2.6);move(p,'x',-1);talk(p,'衛兵');move(p,'z',4);move(p,'x',8);move(p,'z',6.2);talk(p,'王后房間');move(p,'z',.6);talk(p,'瑪兒')
    wait(p,'s.kingdom.phase==="missing"',220);move(p,'z',-6.8);talk(p,'王城');move(p,'z',-3.2);move(p,'x',2.5);talk(p,'露卡加入')
    move(p,'x',0);move(p,'z',-6.8);talk(p,'森林');move(p,'z',.5);move(p,'x',-9);talk(p,'修道院');move(p,'z',1);talk(p,'紋章');fight(p)
    move(p,'z',4.4);move(p,'x',.5);talk(p,'青蛙加入');approach_organ(p,move,snap,organ_approaches);talk(p,'管風琴',shot='03a-organ-activation.png');
    assert snap(p)['rescue']['organOpen'] and snap(p)['rescue']['tonics']==0
    save_reload(p,'organ-conduct-v6.json');talk(p,'管風琴');assert snap(p)['rescue']['organOpen']
    passed('same fresh character activates the actual organ prompt and preserves sealed fair facts across its own v6 export/import')
    move(p,'x',4);move(p,'z',8.6);talk(p,'密道')
    approach_supply_chest(p,move,snap,chest_approaches);talk(p,'回復藥');assert snap(p)['rescue']['chestOpened'] and snap(p)['rescue']['tonics']==3;move(p,'x',0);move(p,'z',.5,True);fight(p);move(p,'x',0);move(p,'z',8.3);talk(p,'深處');move(p,'z',3.8);talk(p,'大臣的真面目');fight(p)
    move(p,'z',5.8);move(p,'x',7.8);talk(p,'真正的大臣');move(p,'x',-2.5);move(p,'z',6.8);talk(p,'莉妮王后');move(p,'z',5.5);move(p,'x',0);move(p,'z',-6.9);talk(p,'王城')
    move(p,'z',4);move(p,'x',8);move(p,'z',6.2);talk(p,'王后房間');move(p,'z',.9);talk(p,'瑪兒回來');move(p,'z',-6.8);talk(p,'王城');move(p,'z',4);move(p,'x',0);move(p,'z',-6.8);talk(p,'森林')
    move(p,'z',-6.8);talk(p,'托魯斯');move(p,'x',0);move(p,'z',7.6);talk(p,'山道');move(p,'z',8);talk(p,'回到 1000 年')
    save_reload(p,'returned-conduct-v6.json');assert snap(p)['rescue']['stage']=='returned'
    passed('the same fresh character actually crossed 600 AD, won existing battles, rescued queen and returned with sealed facts')

def ask(p,kind,yes):
    for attempt in range(6):
        p.keyboard.press('e');p.wait_for_selector('#dialog:not([hidden])')
        s=snap(p);title=p.locator('#dialog-title').inner_text()
        if s['trial']['choice']:
            assert s['trial']['choice']==kind,{'expected':kind,'state':s}
            p.click('#choice-yes' if yes else '#choice-no');p.wait_for_selector('#dialog-close:not([hidden])');p.click('#dialog-close');stable(p);return
        assert title.startswith('證人'),title
        p.screenshot(path=str(OUT/f'05-before-{kind}-{attempt}.png'));p.click('#dialog-close');stable(p)
    raise AssertionError('Expected a hearing question')

def hearing(p):
    move(p,'x',0);move(p,'z',-7.2);talk(p,'送瑪兒');move(p,'x',-2.9);talk(p,'森林');move(p,'z',5.7);talk(p,'王城');move(p,'z',-.5);talk(p,'被捕')
    save_reload(p,'court-start-v7.json');assert snap(p)['trial']['hearing']['rules']=='fair-witness-v1'
    p.wait_for_function('''()=>{const v=window.__CHRONO_TEST__.view().trialMaps,b=v.windowBounds;return v.npcTextures.length>=10&&v.npcTextures.every(t=>t.width===48&&t.height===64)&&b&&b.left>=0&&b.right<=1&&b.top>=.065&&b.bottom<=1}''',timeout=20000)
    p.screenshot(path=str(OUT/'04-court-framing.png'))
    ask(p,'collision',not BAD)
    if BAD:ask(p,'theft',False)
    ask(p,'wealth',False)
    save_reload(p,'wealth-confirm-pending-v7.json');assert snap(p)['trial']['question']==1
    ask(p,'wealth-confirm',True)
    n=0
    while snap(p)['trial']['question']==2:
        title=talk(p,shot=f'05-hearing-{n}.png');save_reload(p,f'hearing-{n}-v7.json');n+=1;assert n<8
    s=snap(p);assert s['trial']['verdict']==('guilty' if BAD else 'not-guilty')
    assert s['trial']['hearing']['heard']==(3 if BAD else 1)
    text=p.locator('#jury-status').inner_text();assert text.count('有罪')==(6 if BAD else 0)
    assert text.count('無罪')==(1 if BAD else 7)
    talk(p,'空中刑務所');save_reload(p,'verdict-cell-v7.json')
    if not BAD:
        move(p,'x',3);talk(p,'支持者的物資',shot='06-jail-gift.png');assert snap(p)['trial']['ethers']==3
        talk(p,'空包裹');assert snap(p)['trial']['ethers']==3;save_reload(p,'gift-taken-v7.json')
        p.click('#bag');assert '乙太 3' in p.locator('#inventory-stock').inner_text();assert p.locator('[data-bag-item="ether"][data-bag-slot="0"]').is_disabled();p.screenshot(path=str(OUT/'07-gift-inventory.png'));p.click('#inventory-close');stable(p)
    else:
        assert snap(p)['trial']['ethers']==0
        p.screenshot(path=str(OUT/'06-guilty-cell.png'))
    passed('recorded same-playthrough evidence produces '+('six guilty votes after two denials, without gift' if BAD else 'seven not-guilty votes and exactly one three-ether parcel'))

try:
 with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE_PATH'),headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'])
    p=browser.new_page(viewport={'width':1200,'height':800},accept_downloads=True);arm_native_chooser(p)
    p.on('pageerror',lambda e:errors.append(str(e)));p.on('console',lambda m:errors.append(m.text) if m.type=='error' else None);p.on('request',lambda r:requests.append(r.url))
    try:
        fresh_company(p);fair_conduct(p);rescue_return(p);hearing(p)
        assert not errors,errors
        assert all(u.startswith(('http://127.0.0.1:4184/','data:','blob:')) for u in requests),requests
        report={'status':'passed','route':ROUTE,'sourceSha':os.environ.get('GITHUB_SHA'),'htmlSha256':hashlib.sha256((ROOT/'dist/index.html').read_bytes()).hexdigest(),'passed':checks,'errors':errors,'waits':waits,'saves':saves,'limitations':['Project-specific deterministic jury policy; original hidden cat RNG/flag bug is not reproduced or ROM-verified.','Old compressed maps, authored balance and limited NPC animation remain; not final artwork, full-game or physical-device >=90 approval.']}
    except Exception as exc:
        report={'status':'failed','route':ROUTE,'failure':str(exc),'passed':checks,'errors':errors,'waits':waits,'saves':saves}
        try:report['importContext']=import_context(p);report['lastObserved']=snap(p);report['view']=p.evaluate('window.__CHRONO_TEST__.view()');report['inputContext']=input_context(p);report['focused']=report['inputContext']['focused'];p.screenshot(path=str(OUT/'failure.png'),timeout=15000)
        except Exception as observation:report['observationError']=str(observation)
        raise
    finally:
        if 'report' in locals():
            report.update(organApproaches=organ_approaches,chestApproaches=chest_approaches,browserVersion=browser.version,sourceSha=os.environ.get('GITHUB_SHA'),htmlSha256=hashlib.sha256((ROOT/'dist/index.html').read_bytes()).hexdigest())
            (OUT/'witness-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
        browser.close()
finally:
 server.terminate()
 try:server.wait(timeout=10)
 except subprocess.TimeoutExpired:server.kill();server.wait()
