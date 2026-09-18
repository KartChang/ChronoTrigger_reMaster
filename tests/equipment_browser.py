"""Same-run v6 journey -> visible merchant -> keyboard gear/trade -> v8 -> combat.
Only genuine key presses, native file chooser and player exports change state.
No manufactured save, writable test hook, clock acceleration or synthetic wallet.
"""
from pathlib import Path
import hashlib, json, math, os, subprocess, sys, time
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'test-results' / 'equipment'
SOURCE = ROOT / 'test-results' / 'prologue' / 'prologue-companions-v6.json'
OUT.mkdir(parents=True, exist_ok=True)
checks, observations, waits, errors, requests = [], [], [], [], []
server = subprocess.Popen([sys.executable, '-m', 'http.server', '4188', '--bind', '127.0.0.1'], cwd=ROOT/'dist', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def snap(page):
    return page.evaluate('window.__CHRONO_TEST__.snapshot()')


def focus(page):
    return page.evaluate('document.activeElement?.id')


def wait_game(page, expression, budget=300, modes=('explore',)):
    initial = snap(page)
    began = time.monotonic()
    handle = page.wait_for_function('''({start,expression,budget,modes})=>{
        const t=window.__CHRONO_TEST__,s=t.snapshot();
        if(t.paused()||s.ticks<start||s.ticks-start>budget||!modes.includes(s.mode))
            return {ok:false,state:s,focused:document.activeElement?.id};
        return Function('s','return ('+expression+')')(s)?{ok:true,state:s}:false;
    }''', arg={'start':initial['ticks'],'expression':expression,'budget':budget,'modes':list(modes)}, polling=100, timeout=120000)
    result = handle.json_value()
    handle.dispose()
    waits.append({'expression':expression,'wallSeconds':round(time.monotonic()-began,2),'result':result})
    assert result['ok'], result


def move(page, axis, target):
    initial = snap(page)
    delta = target - initial['players'][0][axis]
    if abs(delta)<.12:
        return
    key = ('d' if delta>0 else 'a') if axis=='x' else ('w' if delta>0 else 's')
    page.keyboard.down(key)
    try:
        wait_game(page,f's.players[0].{axis}{">=" if delta>0 else "<="}{target}',math.ceil((abs(delta)/4+2)*60))
    finally:
        page.keyboard.up(key)


def button(page, id):
    """Tab through real browser focus, never programmatically set focus or click."""
    assert not page.locator('#'+id).is_disabled(), {'disabled':id}
    for _ in range(90):
        if focus(page)==id:
            return
        page.keyboard.press('Tab')
    raise AssertionError({'expectedButton':id,'focused':focus(page)})


def activate(page, id):
    button(page,id)
    page.keyboard.press('Enter')


def exported(page, name):
    button(page,'export')
    with page.expect_download() as event:
        page.keyboard.press('Enter')
    path=OUT/name
    event.value.save_as(str(path))
    data=json.loads(path.read_text(encoding='utf-8'))
    assert data['version']==8 and data['schema']=='equipment-v1',data
    assert data['equipment']['gold']==90 and data['equipment']['worn']['crono']['weapon']=='bronze-katana'
    assert data['equipment']['worn']['crono']['body']=='bronze-mail'
    assert json.loads(data['adventure'])['version']==6
    return path, data


def imported(page, path):
    button(page,'import')
    with page.expect_file_chooser() as event:
        page.keyboard.press('Enter')
    event.value.set_files(str(path))
    page.wait_for_function('document.activeElement?.id==="world" && document.querySelector("#message").textContent.includes("存檔已匯入")')
    assert focus(page)=='world'


def record(page, name):
    observations.append({'name':name,'state':snap(page),'focused':focus(page),'view':page.evaluate('window.__CHRONO_TEST__.view()')})
    page.screenshot(path=str(OUT/(name+'.png')))


def passed(message):
    checks.append(message)
    print('PASS',message,flush=True)


try:
    assert SOURCE.exists(),'Run prologue_browser.py first; its unmodified same-run v6 export is required.'
    source_bytes=SOURCE.read_bytes()
    source=json.loads(source_bytes)
    assert source['version']==6 and source['chapter']=='fair'
    assert source['prologue']['stage']=='companions'
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE_PATH'),headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'])
        page=browser.new_page(viewport={'width':1200,'height':900},accept_downloads=True)
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
        page.on('request',lambda r:requests.append(r.url))
        try:
            page.goto('http://127.0.0.1:4188/?test=1',wait_until='load')
            page.wait_for_function('window.__CHRONO_TEST__ && !document.querySelector("#start-story").disabled')
            page.keyboard.press('ArrowDown');assert focus(page)=='start-story'
            page.keyboard.press('Enter');wait_game(page,'s.prologue.stage==="home"',220)
            imported(page,SOURCE)
            assert snap(page)['equipment'] is None
            facts=snap(page)['prologue']['conduct']
            page.keyboard.press('i')
            assert page.locator('#inventory-screen').is_visible()
            assert page.locator('#buy-bronze-katana').count()==0
            assert '400 G' in page.locator('#equipment-gold').inner_text()
            assert snap(page)['equipment'] is None
            page.keyboard.press('i');assert focus(page)=='world'
            move(page,'z',-3.4);move(page,'x',7.5);move(page,'z',-6.3)
            page.wait_for_function('document.querySelector("#interact-hint").textContent.includes("裝備買賣")')
            record(page,'01-visible-merchant')
            passed('same-run unmodified v6 continues by walking to the actual merchant; viewing status does not create a save migration')

            page.keyboard.press('i')
            assert page.locator('#buy-bronze-katana').is_visible()
            frozen=snap(page)['ticks']
            activate(page,'buy-bronze-katana');assert snap(page)['equipment']['gold']==250
            activate(page,'buy-bronze-mail');assert snap(page)['equipment']['gold']==130
            activate(page,'buy-bronze-helm');assert snap(page)['equipment']['gold']==50
            assert page.locator('#buy-iron-katana').is_disabled()
            activate(page,'equip-crono-bronze-katana')
            assert page.locator('#sell-bronze-katana').is_disabled()
            activate(page,'equip-crono-bronze-mail')
            assert page.locator('#sell-bronze-mail').is_disabled()
            activate(page,'sell-bronze-helm')
            assert snap(page)['equipment']['gold']==90
            assert page.locator('#sell-bronze-helm').is_disabled()
            assert focus(page)=='inventory-close'
            assert snap(page)['ticks']==frozen
            assert snap(page)['prologue']['conduct']==facts
            record(page,'02-keyboard-trade-and-equipped')
            for width,height in [(1200,900),(650,900),(390,700)]:
                page.set_viewport_size({'width':width,'height':height})
                geometry=page.wait_for_function('''()=>{const p=document.querySelector('.inventory-dialog'),r=p.getBoundingClientRect();
                    return r.top>=0&&r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&p.scrollWidth<=p.clientWidth+1?
                    {panel:r.toJSON(),clientWidth:p.clientWidth,scrollWidth:p.scrollWidth,scrollHeight:p.scrollHeight}:false;
                }''',timeout=15000).json_value()
                observations.append({'name':f'panel-{width}x{height}','geometry':geometry})
                page.screenshot(path=str(OUT/f'03-menu-{width}x{height}.png'))
            page.set_viewport_size({'width':1200,'height':900})
            page.keyboard.press('i');assert focus(page)=='world'
            assert snap(page)['equipment']['owned']['bronze-helm']==0
            passed('Tab/Enter purchases, equips and sells only a spare copy; wallet/stock/paused ticks and responsive modal are observed directly')

            activate(page,'save')
            page.wait_for_function('document.querySelector("#message").textContent.includes("本機存檔完成")')
            saved,data=exported(page,'equipment-merchant-v8.json')
            imported(page,saved)
            assert snap(page)['equipment']==data['equipment']
            page.reload(wait_until='load')
            page.wait_for_function('window.__CHRONO_TEST__ && !document.querySelector("#start-story").disabled')
            # Start the same public fair entry and load its real IndexedDB slot.
            for _ in range(3):page.keyboard.press('ArrowDown')
            assert focus(page)=='start-fair'
            page.keyboard.press('Enter');activate(page,'load')
            page.wait_for_function('document.querySelector("#message").textContent.includes("讀檔完成") && window.__CHRONO_TEST__.snapshot().equipment?.gold===90')
            assert snap(page)['equipment']==data['equipment'] and focus(page)=='world'
            move(page,'z',-3.4)
            page.keyboard.press('i');assert page.locator('#buy-bronze-katana').count()==0
            page.keyboard.press('i')
            passed('own v8 export/native import and actual browser reload/IndexedDB load preserve equipment, wallet and v6 adventure without resetting allowance')

            move(page,'x',-7);move(page,'z',3.35)
            page.keyboard.press('c');assert snap(page)['joined']
            page.keyboard.press('e');page.wait_for_selector('#dialog:not([hidden])')
            assert '岡薩雷斯' in page.locator('#dialog-title').inner_text()
            page.keyboard.press('Enter')
            assert snap(page)['mode']=='battle'
            page.keyboard.press('i');frozen=snap(page)['ticks']
            assert page.locator('#equip-crono-wood-katana').is_disabled()
            assert page.locator('#buy-bronze-katana').count()==0
            frame=page.evaluate('window.__CHRONO_TEST__.view().frame')
            page.wait_for_function('(f)=>window.__CHRONO_TEST__.view().frame>=f+2',arg=frame,timeout=15000)
            assert snap(page)['ticks']==frozen
            page.keyboard.press('i')
            # Hold no attack until a genuine enemy turn verifies the equipped defense.
            wait_game(page,'s.players[0].hp<120',550,('battle',))
            assert snap(page)['players'][0]['hp']==111
            assert snap(page)['players'][1]['hp']==120
            before=snap(page)
            page.keyboard.press('j')
            after=snap(page)
            assert after['enemies'][0]['hp']==before['enemies'][0]['hp']-36
            assert after['players'][0]['mp']==before['players'][0]['mp']
            assert after['players'][0]['atb']<1 and after['players'][1]['atb']==1
            record(page,'04-real-equipped-combat')
            for _ in range(15):
                wait_game(page,'s.mode!=="battle"||s.players[0].atb>=1',210,('battle','victory','defeat'))
                if snap(page)['mode']!='battle':break
                page.keyboard.press('j')
            assert snap(page)['mode']=='victory'
            record(page,'05-victory-before-enter')
            page.keyboard.press('Enter');wait_game(page,'s.mode==="explore"',60)
            assert focus(page)=='world' and snap(page)['equipment']==data['equipment']
            final,final_data=exported(page,'equipment-gato-v8.json')
            assert json.loads(final_data['adventure'])['fair']['gatoWon']
            imported(page,final)
            assert snap(page)['fair']['gatoWon'] and snap(page)['equipment']['gold']==90
            record(page,'06-final-import-focus')
            passed('real enemy turn deals 9, normal Crono attack deals 36; battle gear locks, independent P2 ATB, victory Enter and final v8 import all remain functional')
            assert SOURCE.read_bytes()==source_bytes
            assert not errors,errors
            assert all(u.startswith(('http://127.0.0.1:4188/','data:','blob:')) for u in requests),requests
            report={'status':'passed','checks':checks,'waits':waits,'observations':observations,'errors':errors}
        except Exception as exc:
            report={'status':'failed','failure':str(exc),'checks':checks,'waits':waits,'observations':observations,'errors':errors}
            try:
                report.update(lastObserved=snap(page),focused=focus(page),view=page.evaluate('window.__CHRONO_TEST__.view()'))
                page.screenshot(path=str(OUT/'failure.png'),timeout=15000)
            except Exception as observation:
                report['observationError']=str(observation)
            raise
        finally:
            report.update(sourceSha=os.environ.get('GITHUB_SHA'),htmlSha256=hashlib.sha256((ROOT/'dist/index.html').read_bytes()).hexdigest(),sourceSave=str(SOURCE.relative_to(ROOT)),sourceSaveSha256=hashlib.sha256(source_bytes).hexdigest(),browserVersion=browser.version,limits=['Author-defined starter allowance, prices and additive bonuses; not original balance or a growth/skill system.','Software Chromium, not physical-keyboard, gamepad, whole-game or final-art acceptance.'])
            (OUT/'equipment-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
            browser.close()
finally:
    server.terminate()
    try:server.wait(timeout=10)
    except subprocess.TimeoutExpired:server.kill();server.wait()
