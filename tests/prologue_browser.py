"""Fresh UI-led prologue, separate from retained checkpoint journeys.
Snapshot and view hooks are read-only. No injected game state, synthetic saves or clock changes.
"""
from pathlib import Path
import hashlib, json, math, subprocess, sys, time
from native_import import import_save, import_context
from playwright.sync_api import sync_playwright
from hd_party_browser import record_hd_party
from meeting_approach import approach_first_meeting
from early_comfort import record_early_comfort

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'test-results'/'prologue';OUT.mkdir(parents=True,exist_ok=True)
checks,errors,waits,requests=[],[],[],[]
server=subprocess.Popen([sys.executable,'-m','http.server','4182','--bind','127.0.0.1'],cwd=ROOT/'dist',stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
def snap(page):return page.evaluate('window.__CHRONO_TEST__.snapshot()')
def passed(name):checks.append(name);print('PASS',name,flush=True)
def wait_game(page,expression,budget=900):
    begin=snap(page)['ticks'];clock=time.monotonic()
    h=page.wait_for_function("""({begin,budget,expression})=>{const t=window.__CHRONO_TEST__,s=t.snapshot();
        if(t.paused()||s.mode!=='explore'||s.ticks<begin||s.ticks-begin>budget)return {ok:false,state:s,paused:t.paused()};
        return Function('s','return ('+expression+')')(s)?{ok:true,state:s}:false;
    }""",arg={'begin':begin,'budget':budget,'expression':expression},polling=100,timeout=120000)
    v=h.json_value();h.dispose();waits.append({'predicate':expression,'wallSeconds':round(time.monotonic()-clock,2),'result':v});assert v['ok'],v

def move(page,axis,target):
    state=snap(page);value=state['players'][0][axis]
    if abs(value-target)<.12:return
    positive=target>value;key=('d' if positive else 'a') if axis=='x' else ('w' if positive else 's')
    speed=2.4 if state['chapter']=='overworld1000' else 4
    page.keyboard.down(key)
    try:wait_game(page,f"s.players[0].{axis}{'>=' if positive else '<='}{target}",math.ceil((abs(target-value)/speed+2)*60))
    finally:page.keyboard.up(key)
def trigger(page,key,expression,budget=250):
    page.keyboard.down(key)
    try:wait_game(page,expression,budget)
    finally:page.keyboard.up(key)
def transition(page,chapter):
    wait_game(page,f"s.chapter==='{chapter}'&&!s.prologue.transition",100)
    page.wait_for_function("window.__CHRONO_TEST__.view().chapter==="+json.dumps(chapter))
def talk(page,title):
    page.keyboard.press('e');page.wait_for_selector('#dialog:not([hidden])');assert title in page.locator('#dialog-title').inner_text()
    page.click('#dialog-close')
def fresh(page,coop=False):
    page.goto('http://127.0.0.1:4182/?test=1',wait_until='load');page.wait_for_function('window.__CHRONO_TEST__!==undefined',timeout=30000)
    page.click('#start-story-coop' if coop else '#start-story')
    assert snap(page)['chapter']=='bedroom';assert snap(page)['prologue']['stage']=='waking'
    page.keyboard.down('d');page.keyboard.down('ArrowRight')
    wait_game(page,"s.prologue.stage==='home'",220)
    page.keyboard.up('d');page.keyboard.up('ArrowRight')
    s=snap(page);assert s['players'][0]['x']==1.5 and s['players'][1]['x']==1.5
    assert page.locator('#p1').is_hidden()
def to_fair(page,prefix):
    record_hd_party(page,OUT,prefix+'-native-party')
    page.screenshot(path=str(OUT/f'{prefix}-bedroom.png'))
    move(page,'x',0);trigger(page,'s',"s.chapter==='home'&&!s.prologue.transition")
    assert snap(page)['players'][0]['x']==4.5 and snap(page)['players'][0]['z']==2.2
    page.screenshot(path=str(OUT/f'{prefix}-home.png'))
    move(page,'x',0);talk(page,'母親');assert snap(page)['prologue']['motherTalked']
    move(page,'z',-4.2);page.keyboard.press('e');transition(page,'overworld1000')
    page.wait_for_function("window.__CHRONO_TEST__.view().mapKind==='overworld'")
    page.screenshot(path=str(OUT/f'{prefix}-overworld.png'))
    # A building footprint is solid. Take its western side instead of walking through it.
    move(page,'x',.1);move(page,'z',5.1);move(page,'x',2)
    assert snap(page)['chapter']=='overworld1000'
    assert '莉妮廣場' in page.locator('#interact-hint').inner_text()
    page.keyboard.press('e');transition(page,'fair')
    assert snap(page)['prologue']['stage']=='fair'
    page.wait_for_function("window.__CHRONO_TEST__.view().prologue.marle")
    assert page.locator('#p1').is_hidden()
    page.screenshot(path=str(OUT/f'{prefix}-fair-entry.png'))
def collide(page):
    approach_first_meeting(page,waits)
    wait_game(page,"s.prologue.elapsed>=.6",100)
    assert snap(page)['prologue']['first']=='unknown'
def pickup(page):
    move(page,'z',-2.8);move(page,'x',-.5);move(page,'z',-.8);talk(page,'掉落的項鍊')
    assert snap(page)['prologue']['pendantPicked']
    move(page,'z',-2.8);move(page,'x',-3.5);move(page,'z',-2.2)
def choice(page,kind,yes):
    page.keyboard.press('e');page.wait_for_selector('#dialog-choices:not([hidden])')
    assert snap(page)['prologue']['choice']==kind
    before=snap(page)
    # Dialog/choice must halt simulation, even while held movement keys arrive.
    page.keyboard.down('d');frame=page.evaluate('window.__CHRONO_TEST__.view().frame')
    page.wait_for_function('window.__CHRONO_TEST__.view().frame>= '+str(frame+2),timeout=15000)
    page.keyboard.up('d');assert snap(page)==before
    page.click('#choice-yes' if yes else '#choice-no');assert snap(page)['prologue']['choice'] is None
    page.click('#dialog-close')
def save_reload(page,name):
    before=snap(page);page.click('#save');page.wait_for_function("document.querySelector('#message').textContent.includes('本機存檔完成')")
    with page.expect_download() as event:page.click('#export')
    path=OUT/name;event.value.save_as(path);data=json.loads(path.read_text());assert data['version']==6
    import_save(page,path,OUT);page.wait_for_function("document.querySelector('#message').textContent.includes('存檔已匯入')")
    now=snap(page);assert now['chapter']==before['chapter'];assert now['prologue']['first']==before['prologue']['first']
    for key in ['stage','checkedMarle','pendantPicked','pendantReturned','motherTalked']:assert now['prologue'][key]==before['prologue'][key]
    assert now['joined']==before['joined'];assert now['players'][0]['x']==before['players'][0]['x']
    return {'file':name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size}

try:
 with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'])
    page=browser.new_page(viewport={'width':1365,'height':900},accept_downloads=True)
    page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None);page.on('request',lambda r:requests.append(r.url))
    receipts=[]
    try:
        fresh(page);to_fair(page,'01');collide(page)
        record_early_comfort(page,OUT,'01-meeting')
        page.screenshot(path=str(OUT/'02-collision.png'))
        talk(page,'女孩');assert snap(page)['prologue']['first']=='marle';pickup(page)
        choice(page,'return',False);assert not snap(page)['prologue']['pendantReturned']
        receipts.append(save_reload(page,'prologue-refused-v6.json'))
        choice(page,'return',True);assert snap(page)['prologue']['pendantReturned']
        choice(page,'company',False);assert snap(page)['prologue']['stage']=='collision';assert page.locator('#p1').is_hidden()
        choice(page,'company',True);assert snap(page)['prologue']['stage']=='companions'
        page.wait_for_function("!document.querySelector('#p1').hidden")
        page.screenshot(path=str(OUT/'03-companions.png'));receipts.append(save_reload(page,'prologue-companions-v6.json'))
        passed('fresh waking, physical stairs, scaled overworld, confirmed entrance, collision, two negative/positive choices and v6 UI round trip')
        # Continue into the existing chapter by real movement; no prebuilt story save.
        move(page,'x',-1);move(page,'z',6.4);talk(page,'露卡')
        move(page,'x',-2.4);move(page,'z',8.4);talk(page,'傳送成功')
        move(page,'z',6.4);move(page,'x',0);talk(page,'瑪兒')
        wait_game(page,"s.opening.phase==='lost'",550)
        move(page,'x',-2.4);move(page,'z',8.5);talk(page,'露卡')
        receipts.append(save_reload(page,'prologue-telepod-pendant-v6.json'))
        talk(page,'克羅諾');wait_game(page,"s.chapter==='canyon'",160)
        assert snap(page)['era']=='middle' and snap(page)['prologue']['first']=='marle'
        assert page.locator('#p1').is_hidden();page.screenshot(path=str(OUT/'04-canyon-from-new-game.png'))
        receipts.append(save_reload(page,'prologue-canyon-v6.json'))
        passed('fresh new game reaches retained telepod disappearance and 600 AD; v6 facts survive old chapter logic')
        # Independent real playthrough: early P2 controls cannot act before the meeting.
        fresh(page,True);to_fair(page,'05');collide(page)
        record_early_comfort(page,OUT,'05-meeting-coop');pickup(page)
        assert snap(page)['prologue']['first']=='pendant'
        before=snap(page)['prologue'];page.keyboard.press('Enter');assert snap(page)['prologue']==before
        choice(page,'return',True);choice(page,'company',True)
        assert snap(page)['joined'];assert snap(page)['prologue']['first']=='pendant'
        before=snap(page)['players'][1]['x'];page.keyboard.down('ArrowRight')
        wait_game(page,f's.players[1].x>{before+.5}',90);page.keyboard.up('ArrowRight')
        page.screenshot(path=str(OUT/'06-pendant-first-coop.png'))
        receipts.append(save_reload(page,'prologue-pendant-first-coop-v6.json'))
        passed('pendant-first is observed separately; P2 cannot choose early but gains genuine control after joining')
        assert not errors,errors
        assert all(u.startswith(('http://127.0.0.1:4182/','data:','blob:')) for u in requests),requests
        report={'status':'passed','passed':checks,'errors':errors,'waits':waits,'saves':receipts,'limitations':['SNES-manual and screenshot reference reconstruction, not original event-code or pixel-exact topology.','Regional overworld; full 1000 AD map and other town interiors remain open.','Software Chromium evidence, not physical-controller performance or 90-point acceptance.']}
    except Exception as e:
        report={'status':'failed','passed':checks,'errors':errors,'waits':waits,'failure':str(e),'saves':receipts}
        try:report['importContext']=import_context(page);report['lastObserved']=snap(page);report['view']=page.evaluate('window.__CHRONO_TEST__.view()');page.screenshot(path=str(OUT/'failure.png'),timeout=15000)
        except Exception as nested:report['observationError']=str(nested)
        raise
    finally:
        (OUT/'prologue-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');browser.close()
finally:
 server.terminate()
 try:server.wait(timeout=10)
 except subprocess.TimeoutExpired:server.kill();server.wait()
