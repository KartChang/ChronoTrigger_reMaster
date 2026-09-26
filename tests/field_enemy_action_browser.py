"""Additive N native scenario. Existing opening_browser.py is unchanged.
Identical normal-input prefix to the canyon, then nonlethal attack and natural foe turns.
No injected game/time/save/collision state; not a physical-device or whole-game approval.
"""
from native_chooser import arm_native_chooser, chooser_observation, assert_one_chooser
from pathlib import Path
import json, math, subprocess, sys, time, os
from field_enemy_action import OBSERVE_SCRIPT, assert_action_history, assert_native_report
from native_import import import_save, import_context
from field_enemy_motion import observe_field_enemy_battle
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'test-results'/'field-enemy-action'
OUT.mkdir(parents=True,exist_ok=True)
checks,errors,waits,requests=[],[],[],[]
report={'status':'running','sourceSha':os.environ.get('GITHUB_SHA'),
        'build':json.loads((ROOT/'dist/build-meta.json').read_text()),'nativeInputsOnly':True,
        'physicalDevice':False,'artApproved':False,'wholeGameAccepted':False}
assert report['sourceSha'] and report['sourceSha']==report['build']['sourceSha'], 'Exact CI source required'
server=subprocess.Popen([sys.executable,'-m','http.server','4188','--bind','127.0.0.1'],cwd=ROOT/'dist',stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
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

def wait_motion(page,predicate,budget):
    start=snap(page)['ticks'];began=time.monotonic()
    handle=page.wait_for_function('''({start,budget,predicate})=>{
      const api=window.__CHRONO_TEST__,s=api.snapshot(),m=api.view().fieldEnemyMotion;
      if(api.paused()||s.mode!=='battle'||s.ticks<start||s.ticks-start>budget)return {ok:false,state:s,motion:m};
      return Function('m','return ('+predicate+')')(m)?{ok:true,state:s,motion:m}:false;
    }''',arg={'start':start,'budget':budget,'predicate':predicate},polling='raf',timeout=120000)
    result=handle.json_value();handle.dispose()
    waits.append({'predicate':predicate,'start':start,'budget':budget,'wallSeconds':round(time.monotonic()-began,2),'observed':result})
    assert result['ok'],result

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
            page.goto('http://127.0.0.1:4188/?test=1',wait_until='load')
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
            wait_game(page,'s.players[0].atb>=1',budget=180,modes=('battle',))
            report['beforeAttack']=snap(page)
            page.click('[data-slot="0"][data-action="attack"]')
            wait_motion(page,"m.history.some(h=>h.frame===3&&h.cause.kind==='hurt'&&h.enemyHp===18)",60)
            report['afterAttack']=page.evaluate(OBSERVE_SCRIPT)
            (OUT/'recoil-observation.json').write_text(json.dumps(report['afterAttack'],ensure_ascii=False,indent=2))
            assert_action_history(report['afterAttack'])
            page.screenshot(path=str(OUT/'06-after-recoil-observation.png'))
            passed('normal P1 attack leaves 18 HP and actual uploaded frame3 RGBA in native history')
            # No gameplay action is injected. Let existing ATB produce real enemy attacks.
            wait_motion(page,"m.history.some(h=>h.cause.kind==='attack'&&h.frame===5)&&m.history.some(h=>h.cause.kind==='attack'&&h.frame===4)",450)
            report['afterActions']=page.evaluate(OBSERVE_SCRIPT)
            (OUT/'action-observation.json').write_text(json.dumps(report['afterActions'],ensure_ascii=False,indent=2))
            page.screenshot(path=str(OUT/'07-after-action-observation.png'))
            passed('real enemy turns identify attacker index/origin/tick and upload strike/follow-through poses')
            assert not errors,errors
            external=[u for u in requests if not u.startswith(('http://127.0.0.1:4188/','data:','blob:'))]
            assert not external,external
            report.update(status='passed',checks=len(checks),passed=checks,errors=errors,waits=waits,
                limitations=['Software Chromium only; no local browser run or physical device certification.',
                  'Texture-history RGBA reads are tied to their draw ticks, not full-frame screenshot pixels.',
                  'Screenshots occur after observations; no frame-exact synchronization is claimed.',
                  'No complete direction/movement/death animation, original-speed comfort, audio or whole-game approval.'])
            report['positiveSamples']=assert_native_report(report,os.environ['GITHUB_SHA'],expected_build=('0.9.66','VQ03S'))
            # O additive suffix: all original N actions, captures and assertions above remain.
            from field_enemy_body import observe_native_body_suffix
            observe_native_body_suffix(page,OUT,report['build'],os.environ['GITHUB_SHA'],errors,expected_build=('0.9.66','VQ03S'))
            from party_combat import observe_party_suffix
            observe_party_suffix(page,OUT,report['build'],os.environ['GITHUB_SHA'],errors,expected_build=('0.9.66','VQ03S'))
            from party_reaction import observe_reaction_suffix
            observe_reaction_suffix(page,OUT,report['build'],os.environ['GITHUB_SHA'],errors,expected_build=('0.9.66','VQ03S'))
            from combat_timing import observe_timing_suffix
            observe_timing_suffix(page,OUT,report['build'],os.environ['GITHUB_SHA'],errors,expected_build=('0.9.66','VQ03S'))
        except Exception as exc:
            report.update(status='failed',failure=str(exc),passed=checks,errors=errors,waits=waits)
            try:
                report['lastObservation']=page.evaluate(OBSERVE_SCRIPT)
                report['paused']=page.evaluate('window.__CHRONO_TEST__.paused()')
                page.screenshot(path=str(OUT/'failure.png'),timeout=15000)
            except Exception as observe_error:report['observationError']=str(observe_error)
            raise
        finally:
            (OUT/'field-enemy-action-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
            browser.close()
finally:
    server.terminate()
    try:server.wait(timeout=10)
    except subprocess.TimeoutExpired:server.kill();server.wait()
