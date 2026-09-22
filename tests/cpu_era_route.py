"""Additional native CPU continuation, not a replacement for the two original cases.
Consumes the same page's actual fair/v2 journey, existing maps and native UI only.
All per-leg budgets and the 30-second wait bound remain unchanged.
"""
from pathlib import Path
import hashlib
import json
import math
import sys
import traceback
from cpu_native_route import move_axis
from native_import import import_save

CHAPTER_CAPTURES = ('fair', 'canyon', 'truce', 'forest', 'castle', 'chamber', 'castle', 'cathedral')

def failure_detail(exc):
    """Keep bare assertions actionable; never substitute a successful report."""
    return {'type': type(exc).__name__, 'message': str(exc) or type(exc).__name__,
            'traceback': ''.join(traceback.format_exception(type(exc), exc, exc.__traceback__))}


def hold_until(page, key, wait, expression, budget):
    """Ordinary native input; release even when activation/wait fails."""
    try:
        page.keyboard.down(key)
        return wait(page, expression, budget)
    finally:
        active_error = sys.exc_info()[1]
        try:
            page.keyboard.up(key)
        except Exception:
            if active_error is None:
                raise


def observe_era_route(page, out, identity, snap, wait, activate, observed):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    r = {'schema': 'chrono-cpu-era600-v1', 'status': 'running', **identity,
         'nativeRoutes': [], 'boundaries': [], 'views': [], 'saves': [], 'errors': [],
         'physicalDevice': False, 'artApproved': False, 'wholeGameAccepted': False}

    def state():
        return snap(page)

    def move(axis, target, coop=False):
        return move_axis(page, axis, target, coop, r['nativeRoutes'])

    def stable():
        return wait(page, "!s.prologue.transition && s.trial.fade===0", 100)

    def talk(title):
        page.keyboard.press('e')
        page.wait_for_selector('#dialog:not([hidden])', timeout=10000)
        assert title in page.locator('#dialog-title').inner_text(), {'title': title, 'state': state()}
        activate(page, '#dialog-close')
        stable()

    def capture(name):
        value = observed(page)
        value['woodland'] = page.evaluate('window.__CHRONO_TEST__.view().storyNpcs.kingdom.woodland')
        path = out / (name + '.png')
        page.screenshot(path=str(path), timeout=15000)
        b = path.read_bytes()
        value['image'] = {'path': path.name, 'bytes': len(b), 'sha256': hashlib.sha256(b).hexdigest()}
        value['state'] = state()
        return value

    def pixels_hash():
        return page.evaluate('''async()=>{const c=document.getElementById('world');
          const bytes=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
          const h=await crypto.subtle.digest('SHA-256',bytes);
          return Array.from(new Uint8Array(h),n=>n.toString(16).padStart(2,'0')).join('');}''')

    def toggle_filter(on):
        page.locator('#cpu-sampling').set_checked(on)
        page.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
        assert page.evaluate('window.__CHRONO_TEST__.view().renderer.cpu.sampling.enabled') == on

    def pause_roundtrip(name):
        page.keyboard.press('Escape')
        page.wait_for_function('window.__CHRONO_TEST__.paused()', timeout=10000)
        before = state()
        page.wait_for_timeout(350)
        assert state() == before
        r[name] = {'before': before, 'after': state(), 'fullStateEqual': True}
        activate(page, '#resume')
        page.wait_for_function('!window.__CHRONO_TEST__.paused()', timeout=10000)

    def stage_companion():
        # Gato's genuine saved formation is wider than a fresh fair formation.
        # Approach with ordinary P2 input, not a substituted starting state.
        before = state()
        target = 1.5
        budget = math.ceil((abs(target-before['players'][1]['x'])/4+2)*60)
        if before['players'][1]['x'] > target:
            hold_until(page, 'ArrowLeft', wait, f's.players[1].x<={target}', budget)
        after = state()
        assert 0 <= after['ticks']-before['ticks'] <= budget
        assert (after['players'][0]['x'], after['players'][0]['z']) == (before['players'][0]['x'], before['players'][0]['z'])
        assert math.hypot(after['players'][1]['x']+2.4, after['players'][1]['z']-9) < 6
        r['companionApproach'] = {'before': before, 'afterRelease': after, 'key': 'ArrowLeft',
                                   'targetUpperX': target, 'budget': budget, 'timeoutMs': 30000}

    def encounter(key, target, predicate):
        before = state()
        budget = math.ceil((abs(target-before['players'][0]['z'])/4+2)*60)
        reached = hold_until(page, key, wait, predicate, budget)
        after = state()
        assert 0 <= after['ticks']-before['ticks'] <= budget
        r['boundaries'].append({'before': before, 'afterRelease': after, 'reached': reached,
                                'key': key, 'target': target, 'budget': budget, 'timeoutMs': 30000})

    def win(count, field):
        before = state()
        assert before['mode'] == 'battle' and len(before['enemies']) == count
        assert before['players'][1]['atb'] == 0
        assert page.locator('[data-slot="1"][data-action="attack"]').is_disabled()
        for _ in range(count):
            wait(page, 's.players[0].atb>=1', 180)
            page.locator('[data-slot="0"][data-action="skill"]').click()
        after = state()
        assert after['mode'] == 'victory' and after[field[0]][field[1]]
        assert all(e['hp'] <= 0 for e in after['enemies'])
        assert after['players'][1]['hp'] == before['players'][1]['hp']
        r.setdefault('battles', []).append({'before': before, 'victory': after, 'soloP1': True})
        activate(page, '#continue')
        stable()

    def own_save(name, version):
        before = state()
        with page.expect_download(timeout=30000) as download:
            activate(page, '#export')
        path = out/name
        download.value.save_as(path)
        raw = path.read_bytes()
        assert json.loads(raw)['version'] == version
        receipt = import_save(page, path, out)
        after = state()
        assert after['chapter'] == before['chapter']
        assert after['fair'] == before['fair']
        assert [(p['x'], p['z'], p['hp'], p['mp']) for p in after['players']] == [(p['x'], p['z'], p['hp'], p['mp']) for p in before['players']]
        r['saves'].append({'path': name, 'version': version, 'bytes': len(raw),
                           'sha256': hashlib.sha256(raw).hexdigest(), 'nativeImport': receipt,
                           'before': before, 'after': after, 'sameRunExport': True})

    try:
        r['entry'] = state()
        assert r['entry']['chapter'] == 'fair' and r['entry']['fair']['gatoWon']
        assert r['entry']['opening']['phase'] == 'none'
        original = (out.parent/'cpu-own-fair-save.json').read_bytes()
        r['sourceSave'] = {'path': '../cpu-own-fair-save.json', 'bytes': len(original), 'sha256': hashlib.sha256(original).hexdigest()}
        # Compare the actual CPU canvas, not whole screenshots whose checkbox differs.
        page.keyboard.press('Escape')
        page.wait_for_function('window.__CHRONO_TEST__.paused()', timeout=10000)
        frozen = state()
        assert page.locator('#cpu-sampling-control').is_visible()
        assert not page.locator('#cpu-sampling').is_checked()
        r['filteringAttempt'] = {'before': frozen, 'stage': 'nearest'}
        unfiltered = capture('sampling-nearest');unfiltered['canvasSha256'] = pixels_hash()
        r['filteringAttempt']['nearest'] = unfiltered
        toggle_filter(True)
        r['filteringAttempt']['stage'] = 'filtered'
        filtered = capture('sampling-filtered');filtered['canvasSha256'] = pixels_hash()
        r['filteringAttempt']['filtered'] = filtered
        assert filtered['renderer']['cpu']['sampling']['minifiedTriangles'] > 0
        assert filtered['renderer']['cpu']['textureMemory']['mipBytes'] > 0
        assert filtered['canvasSha256'] != unfiltered['canvasSha256']
        assert state() == frozen
        toggle_filter(False)
        r['filteringAttempt']['stage'] = 'restored'
        restored = capture('sampling-restored');restored['canvasSha256'] = pixels_hash()
        r['filteringAttempt']['restored'] = restored
        assert restored['canvasSha256'] == unfiltered['canvasSha256']
        assert restored['renderer']['cpu']['textureMemory']['mipBytes'] == 0
        assert state() == frozen
        r['filtering'] = {'before': frozen, 'after': state(), 'nearest': unfiltered,
                          'filtered': filtered, 'restored': restored, 'fullStateEqual': True}
        del r['filteringAttempt']
        # Continue actual gameplay with the user-facing option enabled.
        toggle_filter(True)
        activate(page, '#resume')
        move('x', 0, True);move('z', 6.4, True);talk('露卡')
        move('x', -2.4);move('z', 8.7);talk('短距離傳送成功')
        assert state()['fair']['telepodTested']
        move('z', 7);move('x', 0);stage_companion();talk('瑪兒')
        pause_roundtrip('pendantPause')
        wait(page, "s.opening.phase==='lost'", 400)
        r['views'].append(capture('01-pendant-loss'))
        p2 = {k: state()['players'][1][k] for k in ('x','z','hp','mp')}
        tick = state()['ticks']
        hold_until(page, 'ArrowRight', wait, f's.ticks>={tick+15}', 60)
        assert {k: state()['players'][1][k] for k in p2} == p2
        r['departedP2Inactive'] = True
        move('x', -2.4);move('z', 8.7);talk('露卡');talk('克羅諾')
        wait(page, "s.chapter==='canyon'", 150);stable()
        assert state()['era'] == 'middle'
        r['views'].append(capture('02-canyon'))
        encounter('s', 4.8, "s.mode==='battle'");win(3, ('opening','canyonWon'))
        assert state()['fair']['gatoWon']
        move('z', -6.1);talk('600 年')
        own_save('cpu-opening-v3.json', 3)
        talk('托魯斯')
        assert state()['chapter'] == 'truce'
        r['views'].append(capture('03-truce'))
        move('z', 1);move('x', -4.5);talk('鎮民')
        move('x', 0);move('z', -4.3);move('x', -6.5);talk('旅店')
        assert state()['players'][0]['hp'] == 120 and state()['players'][0]['mp'] == 18
        move('x', 7.3);talk('森林')
        assert state()['chapter'] == 'forest'
        encounter('w', 1, "s.mode==='battle'");win(2, ('kingdom','forestWon'))
        r['views'].append(capture('04-forest'))
        move('x', 0);move('z', 8.2);talk('王城')
        r['views'].append(capture('05-castle'))
        move('z', -2.6);move('x', -1);talk('衛兵')
        move('z', 4);move('x', 8);move('z', 6.2);talk('王后房間')
        move('z', .6);talk('瑪兒')
        pause_roundtrip('queenPause')
        wait(page, "s.kingdom.phase==='missing'", 200)
        r['views'].append(capture('06-chamber'))
        move('z', -6.8);talk('王城');move('z', -3.2);move('x', 2.5);talk('露卡加入')
        before = state();x = before['players'][1]['x']
        hold_until(page, 'ArrowRight', wait, f's.players[1].x>{x+.3}', 100)
        after = state()
        assert (after['players'][0]['x'],after['players'][0]['z']) == (before['players'][0]['x'],before['players'][0]['z'])
        assert page.locator('#p1-name').inner_text() == '露卡'
        r['luccaOwnership'] = {'before': before, 'after': after, 'label': '露卡'}
        r['views'].append(capture('07-lucca'))
        own_save('cpu-kingdom-v4.json', 4)
        move('x', 0, True);move('z', -6.8, True);talk('森林')
        move('z', .5, True);move('x', -9, True);talk('修道院')
        r['views'].append(capture('08-cathedral'))
        r['final'] = state()
        assert tuple(v['chapter'] for v in r['views']) == CHAPTER_CAPTURES
        assert r['final']['kingdom']['forestWon'] and r['final']['fair']['gatoWon']
        r['status'] = 'passed'
    except Exception as exc:
        r['status'] = 'failed';r['failure'] = failure_detail(exc)
        r['errors'].append(r['failure']['message'])
        try:
            r['failureView'] = capture('failure')
        except Exception as capture_error:
            r['captureError'] = str(capture_error)
        raise
    finally:
        (out/'report.json').write_text(json.dumps(r, ensure_ascii=False, indent=2), encoding='utf-8')
    return r
