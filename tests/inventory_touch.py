"""Actual Chromium coarse-pointer/tap checks using the same run's unmodified v8.
No physical-device claim, progress injection or fabricated save. Not a local runner.
"""
from native_chooser import arm_native_chooser, chooser_observation, assert_one_chooser
from pathlib import Path
import json
from inventory_comfort import measure_inventory, assert_inventory_layout, assert_inventory_readability


def record_touch_inventory(browser, source: Path, out: Path, imported, snap):
    context=browser.new_context(viewport={'width':390,'height':700},has_touch=True,is_mobile=True,device_scale_factor=1,accept_downloads=True)
    page=context.new_page();arm_native_chooser(page)
    observations,errors,requests=[],[],[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
    page.on('request',lambda r:requests.append(r.url))
    report={'status':'started','physicalDevice':False,'sourceSave':source.name,'observations':observations,'errors':errors}
    try:
        page.goto('http://127.0.0.1:4188/?test=1',wait_until='load')
        page.wait_for_function('window.__CHRONO_TEST__ && !document.querySelector("#start-story").disabled')
        page.locator('#start-story').tap()
        page.wait_for_function('window.__CHRONO_TEST__.snapshot().prologue.stage==="home"',timeout=120000)
        imported(page,source,activation="tap")
        saved=json.loads(source.read_text(encoding='utf-8'))
        assert snap(page)['equipment']==saved['equipment']
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
        report.update(status='passed',closeFocus='world')
        return report
    except Exception as exc:
        report.update(status='failed',failure=str(exc))
        try:
            report.update(lastObserved=snap(page),focused=page.evaluate('document.activeElement?.id'),importStatus=page.evaluate('window.__CHRONO_TEST__.importStatus()'))
            page.screenshot(path=str(out/'touch-failure.png'),timeout=15000)
        except Exception as diagnostic:report['observationError']=str(diagnostic)
        raise
    finally:
        (out/'inventory-touch-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
        context.close()
