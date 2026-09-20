"""Real keyboard-led regressions. Read-only game hooks; no fake saves/state/clocks.
Native import uses Playwright's file chooser with a save exported by this journey.
"""
from native_chooser import arm_native_chooser, chooser_observation, assert_one_chooser
from pathlib import Path
import json,math,subprocess,sys,time
from native_import import import_save
from playwright.sync_api import sync_playwright
from modal_browser import record_modal_boundary
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'test-results'/'keyboard';OUT.mkdir(parents=True,exist_ok=True)
server=subprocess.Popen([sys.executable,'-m','http.server','4186','--bind','127.0.0.1'],cwd=ROOT/'dist',stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
checks=[];errors=[];observations=[]
def snap(p):return p.evaluate('window.__CHRONO_TEST__.snapshot()')
def view(p):return p.evaluate('window.__CHRONO_TEST__.view()')
def focus(p):return p.evaluate('document.activeElement?.id')
def passed(text):checks.append(text);print('PASS',text,flush=True)
def wait(p,expression,budget=400,modes=('explore',)):
    start=snap(p)['ticks']
    h=p.wait_for_function('''({start,budget,modes,expression})=>{const t=window.__CHRONO_TEST__,s=t.snapshot();
    if(t.paused()||!modes.includes(s.mode)||s.ticks-start>budget)return {ok:false,s};
    return Function('s','return ('+expression+')')(s)?{ok:true,s}:false;}''',arg={'start':start,'budget':budget,'modes':list(modes),'expression':expression},polling=100,timeout=120000)
    r=h.json_value();h.dispose();assert r['ok'],r

def open_game(p,index):
    p.goto('http://127.0.0.1:4186/?test=1',wait_until='load');p.wait_for_function('window.__CHRONO_TEST__ && !document.querySelector("#start-story").disabled')
    ids=['start-story','start-story-coop','start-fair','start-fair-coop','start','start-coop']
    # Explicit keyboard traversal from the document, not locator.click/focus.
    for _ in range(index+1):p.keyboard.press('ArrowDown')
    assert focus(p)==ids[index],focus(p)
    p.keyboard.press('Enter');p.wait_for_selector('#start-screen[hidden]',state='attached');assert focus(p)=='world'
    wait(p,'s.prologue.stage!=="waking" && !s.prologue.transition',300)

def move(p,axis,target,keys=None):
    delta=target-snap(p)['players'][0][axis]
    if abs(delta)<.1:return
    key=keys or ({'x':'ArrowRight','z':'ArrowUp'} if delta>0 else {'x':'ArrowLeft','z':'ArrowDown'})[axis]
    p.keyboard.down(key)
    try:wait(p,f's.players[0].{axis}{">=" if delta>0 else "<="}{target}',math.ceil((abs(delta)/(2.4 if snap(p)['chapter']=='overworld1000' else 4)+2)*60))
    finally:p.keyboard.up(key)

def ui_button(p,id):
    # Access the actual toolbar via Tab, preserving browser accessibility defaults.
    for _ in range(45):
        if focus(p)==id:return
        p.keyboard.press('Tab')
    raise AssertionError({'button':id,'focused':focus(p)})

def record(p,name):
    observations.append({'name':name,'state':snap(p),'view':view(p),'focused':focus(p)})
    p.screenshot(path=str(OUT/(name+'.png')))

try:
 with sync_playwright() as pw:
  b=pw.chromium.launch(headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'])
  p=b.new_page(viewport={'width':1200,'height':800},accept_downloads=True);arm_native_chooser(p);p.on('pageerror',lambda e:errors.append(str(e)))
  try:
    open_game(p,0);move(p,'x',0)
    p.keyboard.down('ArrowDown')
    try:wait(p,'s.chapter==="home"',180)
    finally:p.keyboard.up('ArrowDown')
    wait(p,'!s.prologue.transition',90);move(p,'x',0);move(p,'z',2)
    p.keyboard.press('Enter');p.wait_for_selector('#dialog:not([hidden])');assert '母親' in p.locator('#dialog-title').inner_text()
    p.keyboard.press('Enter');p.wait_for_selector('#dialog[hidden]',state='attached');assert focus(p)=='world'
    move(p,'z',.7,'s');passed('keyboard title selection, solo arrows, stairs boundary, mother Enter and WASD resume; no doubled native click')
    p.keyboard.press('h');p.wait_for_selector('#dialog:not([hidden])');assert '操作' in p.locator('#dialog-title').inner_text();record_modal_boundary(p,'dialog',OUT,'01-help-focus');p.keyboard.press('Space');assert focus(p)=='world'
    record(p,'01-home-keyboard')
    move(p,'z',-4.2);p.keyboard.press('Enter');wait(p,'s.chapter==="overworld1000" && !s.prologue.transition',90)
    move(p,'x',.1);move(p,'z',5.1);move(p,'x',2);p.keyboard.press('Enter');wait(p,'s.chapter==="fair" && !s.prologue.transition',90)
    wait(p,'s.ticks>100',200);first=view(p);record(p,'02-idle-first')
    p.wait_for_function('(f)=>window.__CHRONO_TEST__.view().poses[0].frame!==f',arg=first['poses'][0]['frame'],timeout=60000)
    assert view(p)['poses'][0]['pose']=='idle';record(p,'03-idle-next')
    actors=view(p)['presentation']['actors'];assert all(x['emissionOnly'] and x['emissiveColor']==[0,0,0] and x['texture']=={'width':48,'height':64} for x in actors)
    motion=view(p)['fairMotion'];assert len(motion['actors'])>=3,motion
    before=[a['frame'] for a in motion['actors']]
    p.wait_for_function('(f)=>JSON.stringify(window.__CHRONO_TEST__.view().fairMotion.actors.map(a=>a.frame))!==JSON.stringify(f)',arg=before,timeout=60000)
    p.keyboard.press('Escape');frozen=snap(p)['ticks'];v=view(p);p.wait_for_timeout(300)
    assert snap(p)['ticks']==frozen and view(p)['poses']==v['poses'] and view(p)['fairMotion']==v['fairMotion']
    p.keyboard.press('Enter');wait(p,f's.ticks>{frozen}',100)
    passed('actual idle/NPC textures change; runtime single-emission material flags; pause freezes all and Enter resumes')
    open_game(p,2)
    move(p,'z',-3);move(p,'x',-7);move(p,'z',3.35)
    p.keyboard.press('Enter');p.wait_for_selector('#dialog:not([hidden])');p.keyboard.press('Enter')
    wait(p,'s.players[0].atb>=1',210,('battle',));assert view(p)['poses'][0]['pose']=='ready'
    record(p,'04-ready-battle')
    for _ in range(20):
        wait(p,'s.mode!=="battle" || s.players[0].atb>=1',210,('battle','victory','defeat'))
        if snap(p)['mode']!='battle':break
        p.keyboard.press('k' if snap(p)['players'][0]['mp']>=3 else 'j')
    assert snap(p)['mode']=='victory';record_modal_boundary(p,'result',OUT,'04-victory-focus');p.keyboard.press('Enter');wait(p,'s.mode==="explore"',120)
    assert focus(p)=='world';passed('keyboard starts real Gato ATB, ready stance, attacks, victory confirmation and return to exploration')
    ui_button(p,'export')
    with p.expect_download() as d:p.keyboard.press('Enter')
    saved=OUT/'keyboard-fair-v2.json';d.value.save_as(str(saved));data=json.loads(saved.read_text());assert data['version']==2 and data['fair']['gatoWon']
    ui_button(p,'import')
    import_save(p,saved,OUT,activation='Enter');p.wait_for_function('document.activeElement.id==="world" && document.querySelector("#message").textContent.includes("匯入")')
    # A same-map load must not retain the previous battle's numbers/strokes.
    frame=view(p)['frame']
    p.wait_for_function('(f)=>window.__CHRONO_TEST__.view().frame>=f+2',arg=frame,timeout=15000)
    assert view(p)['transient']=={'floats':0,'strokes':0},view(p)['transient']
    assert p.locator('#message').evaluate('(el)=>el.classList.contains("show")')
    p.keyboard.press('Escape');p.wait_for_selector('#pause-screen:not([hidden])')
    paused_state=snap(p)
    # A deliberate reading-time check longer than the existing 4.5s message life;
    # not an increased timeout or simulated clock/progress change.
    p.wait_for_timeout(4600)
    assert snap(p)==paused_state
    assert p.locator('#message').evaluate('(el)=>el.classList.contains("show")')
    record(p,'05-import-feedback-paused')
    p.keyboard.press('Enter');assert focus(p)=='world'
    assert p.locator('#message').evaluate('(el)=>el.classList.contains("show")')
    passed('same-map native import clears stale battle effects; full state and feedback reading time freeze while paused')
    z=snap(p)['players'][0]['z'];move(p,'z',z-.6)
    passed('Tab/Enter toolbar activation, real export/import and canvas focus recovery preserve keyboard movement')
    record(p,'05-after-import')
    def persistent_state():
        current=snap(p)
        return {key:current[key] for key in ('chapter','era','joined','fair','flags','opening','kingdom','prologue','trial','rescue','equipment')}
    stable_state=persistent_state()
    ui_button(p,'import');import_save(p,[],OUT,activation='Space',expected='empty')
    assert persistent_state()==stable_state
    for label,buffer in [('invalid-json',b'{not-json'),('over-limit',b' ' * 65537)]:
        ui_button(p,'import')
        import_save(p,{'name':label+'.json','mimeType':'application/json','buffer':buffer},OUT,activation='Enter',expected='rejected',label=label)
        assert persistent_state()==stable_state
    ui_button(p,'import');import_save(p,saved,OUT,activation='Space')
    assert snap(p)['fair']==data['fair'] and snap(p)['chapter']==data['chapter']
    passed('real chooser empty selection, corrupt/oversize rejection, state preservation and same-file Space recovery; no direct hidden-input assignment')
    open_game(p,3);before=snap(p);p.keyboard.down('ArrowUp')
    try:wait(p,f's.players[1].z>{before["players"][1]["z"]+.6}',100)
    finally:p.keyboard.up('ArrowUp')
    after=snap(p);assert after['players'][0]['x']==before['players'][0]['x'] and after['players'][0]['z']==before['players'][0]['z']
    move(p,'x',-.2,'d');passed('co-op arrows still belong to P2 and WASD to P1, not silently merged')
    p.keyboard.down('ArrowUp');p.keyboard.press('c')
    try:
        assert not snap(p)['joined']
        before=snap(p);wait(p,f's.ticks>{before["ticks"]+15}',100)
        after=snap(p);assert after['players'][0]['z']==before['players'][0]['z']
    finally:p.keyboard.up('ArrowUp')
    move(p,'z',snap(p)['players'][0]['z']+.5)
    passed('held co-op arrows do not leak into P1 after keyboard C; a fresh solo press works')
    assert not errors,errors
    report={'status':'passed','checks':checks,'errors':errors,'observations':observations,'limits':['Software GPU, not physical keyboard/gamepad certification.','File chooser uses same-journey real exported bytes.','Original full-game art, animation and 90-point acceptance remain open.']}
  except Exception as e:
    report={'status':'failed','checks':checks,'failure':str(e),'errors':errors,'observations':observations}
    try:report.update(lastObserved=snap(p),view=view(p),focused=focus(p));p.screenshot(path=str(OUT/'failure.png'))
    except Exception as observation:report['observationError']=str(observation)
    raise
  finally:
    (OUT/'keyboard-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');b.close()
finally:
 server.terminate()
 try:server.wait(timeout=10)
 except subprocess.TimeoutExpired:server.kill();server.wait()
