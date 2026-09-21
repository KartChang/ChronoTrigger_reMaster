"""Actual Chromium coarse-pointer/tap checks using the same run's unmodified v8.
No physical-device claim, progress injection or fabricated save. Not a local runner.
"""
from native_chooser import arm_native_chooser, chooser_observation, assert_one_chooser
from pathlib import Path
import hashlib, json, os, traceback
from touch_lifecycle import NavigationProbe, navigation_snapshot, require_empty_browser
from inventory_comfort import measure_inventory, assert_inventory_layout, assert_inventory_readability


def record_touch_inventory(browser, source: Path, out: Path, imported, snap):
    context=page=None
    primary_error=None
    tracing=False
    observations,errors,requests=[],[],[]
    report={'status':'started','physicalDevice':False,'sourceSave':source.name,
            'sourceSaveSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
            'sourceSha':os.environ.get('GITHUB_SHA'),'runId':os.environ.get('GITHUB_RUN_ID'),'runAttempt':os.environ.get('GITHUB_RUN_ATTEMPT'),
            'htmlSha256':hashlib.sha256((Path(__file__).resolve().parents[1]/'dist/index.html').read_bytes()).hexdigest(),
            'observations':observations,'errors':errors,'phase':'preflight'}
    try:
        report['browserBeforeTouch']=require_empty_browser(browser)
        context=browser.new_context(viewport={'width':390,'height':700},has_touch=True,is_mobile=True,device_scale_factor=1,accept_downloads=True)
        context.tracing.start(screenshots=True,snapshots=True,sources=False);tracing=True
        page=context.new_page();arm_native_chooser(page)
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
        page.on('request',lambda r:requests.append(r.url))
        probe=NavigationProbe(page);report['navigation']=probe.data
        report['phase']='navigation'
        probe.goto(page,'http://127.0.0.1:4188/?test=1')
        report['navigationState']=navigation_snapshot(page)
        report['phase']='start-ready'
        page.wait_for_function('window.__CHRONO_TEST__ && !document.querySelector("#start-story").disabled')
        page.locator('#start-story').tap()
        report['phase']='waking'
        page.wait_for_function('window.__CHRONO_TEST__.snapshot().prologue.stage==="home"',timeout=120000)
        report['phase']='native-import'
        imported(page,source,activation="tap")
        saved=json.loads(source.read_text(encoding='utf-8'))
        assert snap(page)['equipment']==saved['equipment']
        report['phase']='inventory-taps'
        page.locator('#bag').tap()
        page.wait_for_selector('#inventory-screen:not([hidden])')
        frozen=snap(page)
        for width,height in [(390,700),(568,320)]:
            page.set_viewport_size({'width':width,'height':height})
            page.keyboard.press('Home')
            for shortcut,target in [('inventory-jump-shop','equipment-shop'),('inventory-jump-equipment','equipment-panel')]:
                page.locator('#'+shortcut).tap()
                assert page.evaluate('document.activeElement?.id')==target and snap(page)==frozen
            page.keyboard.press('Home')
            m=measure_inventory(page);assert m['coarse'],m
            assert_inventory_layout(m);readability=assert_inventory_readability(page)
            page.screenshot(path=str(out/f'07-touch-top-{width}x{height}.png'))
            # Playwright tap supplies real browser touch input. No DOM dispatchEvent or state write.
            page.locator('#equipment-details-toggle').tap()
            assert page.locator('#equipment-notes').is_visible()
            assert snap(page)==frozen
            page.screenshot(path=str(out/f'07-touch-details-{width}x{height}.png'))
            page.locator('#equipment-details-toggle').tap()
            assert page.locator('#equipment-notes').is_hidden() and snap(page)==frozen
            observations.append({'viewport':m['viewport'],'layout':m,'readability':readability,'disclosureTapPassed':True,'stateUnchanged':True})
        page.locator('#inventory-close').tap()
        page.wait_for_function('document.activeElement?.id==="world" && document.querySelector("#inventory-screen").hidden')
        assert snap(page)['equipment']==saved['equipment']
        assert not errors,errors
        assert all(u.startswith(('http://127.0.0.1:4188/','data:','blob:')) for u in requests),requests
        assert hashlib.sha256(source.read_bytes()).hexdigest()==report['sourceSaveSha256']
        report.update(status='passed',phase='complete',closeFocus='world')
        return report
    except Exception as exc:
        primary_error=exc
        report.update(status='failed',failure=str(exc),exceptionType=type(exc).__name__,traceback=traceback.format_exc())
        if page is not None:
            try:report['navigationState']=navigation_snapshot(page)
            except Exception as diagnostic:report['navigationObservationError']=str(diagnostic)
            try:report.update(lastObserved=snap(page),focused=page.evaluate('document.activeElement?.id'),importStatus=page.evaluate('window.__CHRONO_TEST__.importStatus()'))
            except Exception as diagnostic:report['observationError']=str(diagnostic)
            # A missing game hook must not prevent retaining the startup failure picture.
            try:page.screenshot(path=str(out/'touch-failure.png'),timeout=15000)
            except Exception as diagnostic:report['captureError']=str(diagnostic)
        raise
    finally:
        cleanup_error=None
        if tracing:
            try:
                context.tracing.stop(path=str(out/'inventory-touch-trace.zip'))
                report['trace']='inventory-touch-trace.zip'
            except Exception as exc:
                cleanup_error=exc;report['traceError']=str(exc)
        if context is not None:
            try:context.close()
            except Exception as exc:
                cleanup_error=cleanup_error or exc;report['cleanupError']=str(exc)
        if cleanup_error is not None:
            report['status']='failed'
            if primary_error is None:report['failure']='Touch evidence cleanup failed: '+str(cleanup_error)
        temporary=out/'inventory-touch-report.json.tmp'
        temporary.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
        temporary.replace(out/'inventory-touch-report.json')
        if cleanup_error is not None and primary_error is None:raise cleanup_error
