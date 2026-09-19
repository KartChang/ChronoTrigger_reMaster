"""Read-only assertions around ordinary Tab keys inside existing game overlays.
Imported by existing same-run journeys; no state injection, direct focus or extra workflow.
"""
import json
from pathlib import Path


def modal_context(page, root_id):
    return page.evaluate('''id=>{
      const root=document.getElementById(id),active=document.activeElement;
      const visible=e=>!e.disabled&&!e.closest('[hidden],[inert]')&&e.tabIndex>=0&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
      const stops=[...root.querySelectorAll('button,a[href],input:not([type="hidden"]),select,textarea,[tabindex]')].filter(visible);
      return {root:id,focused:active?.id||null,inside:root.contains(active),activeModal:document.body.dataset.modal,
        rootInert:!!root.closest('[inert]'),worldInert:!!document.querySelector('#world').closest('[inert]'),
        utilityInert:!!document.querySelector('.utility').closest('[inert]'),
        stopCount:stops.length,index:stops.indexOf(active),ticks:window.__CHRONO_TEST__.snapshot().ticks,mode:window.__CHRONO_TEST__.snapshot().mode,
        resources:window.__CHRONO_TEST__.snapshot().players.map(p=>({hp:p.hp,mp:p.mp})),
        paused:window.__CHRONO_TEST__.paused(),rect:root.querySelector('.dialog')?.getBoundingClientRect().toJSON()};
    }''', root_id)


def record_modal_boundary(page, root_id, output, name):
    """One real full forward and backward Tab cycle must stay inside this overlay."""
    page.wait_for_function('id=>document.body.dataset.modal===id && !document.getElementById(id).hidden',arg=root_id,timeout=15000)
    before=modal_context(page,root_id)
    assert before['inside'] and not before['rootInert'],before
    assert before['worldInert'] and before['utilityInert'],before
    assert before['activeModal']==root_id and before['stopCount']>0,before
    assert before['index']>=0,'Begin at an actual sequential control, not a row anchor'
    observations=[before]
    for key in ('Tab','Shift+Tab'):
        for _ in range(before['stopCount']):
            page.keyboard.press(key)
            now=modal_context(page,root_id)
            assert now['inside'] and now['stopCount']==before['stopCount'],now
            if before['paused']:
                assert now['ticks']==before['ticks'],now
            else:
                assert before['mode'] in ('victory','defeat') and now['mode']==before['mode'],now
                assert now['resources']==before['resources'],now
            observations.append(now)
        assert now['focused']==before['focused'],now
    report={'status':'passed','method':'real Tab and Shift+Tab; read-only DOM and game snapshots','observations':observations,
            'physicalDeviceApproved':False,'accessibilityAuditApproved':False}
    Path(output,name+'-modal-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    return report
