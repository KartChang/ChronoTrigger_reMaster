"""Opt-in to the actual Web Audio graph using existing native controls.
No AudioContext mock, clock acceleration, added import, or writable game hook.
Software Chromium/analyser evidence is not listening or physical speaker evidence.
"""
import json
from pathlib import Path

def audio(page):
    return page.evaluate('window.__CHRONO_TEST__.audio()')

def wait_playing(page,after=0,cue=None):
    handle=page.wait_for_function('''({after,cue})=>{
      const a=window.__CHRONO_TEST__.audio();
      return a.error || (a.enabled && !a.blocked && a.context==='running' && a.notesStarted>after && a.activeVoices>0 && a.rms>.00001 && (!cue||a.cue===cue)) ? a : false;
    }''',arg={'after':after,'cue':cue},timeout=15000,polling=100)
    result=handle.json_value();handle.dispose()
    assert result['error'] is None and result['rms']>.00001,result
    assert result['activeVoices']<=result['voiceLimit']==16,result
    return result

def wait_silent(page):
    handle=page.wait_for_function('''()=>{const a=window.__CHRONO_TEST__.audio();return a.error || (a.activeVoices===0 && a.masterGain===0 && a.rms<.000001) ? a : false;}''',timeout=10000,polling=100)
    result=handle.json_value();handle.dispose()
    assert result['error'] is None and result['activeVoices']==0 and result['masterGain']==0,result
    assert result['rms']<.000001,result
    return result

def begin_audio_observation(page,activate,out=None):
    initial=audio(page)
    assert initial['context']=='not-created' and initial['contextCount']==0 and not initial['enabled'],initial
    activate(page,'sound')
    assert page.locator('#sound').get_attribute('aria-pressed')=='true'
    result={'method':'real keyboard controls and native import; actual Web Audio analyser',
            'initial':initial,'playing':wait_playing(page,after=2,cue='hearth'),
            'holds':[],'errors':[],'physicalDevice':False,'listeningReview':False,'artApproved':False}
    for name,open_key,close_key in [('pause','Escape','Escape'),('inventory','i','i'),('dialog','h','Escape')]:
        page.keyboard.press(open_key)
        assert page.evaluate('window.__CHRONO_TEST__.paused()')
        frozen=page.evaluate('window.__CHRONO_TEST__.snapshot()')
        try:
            held=wait_silent(page)
        except Exception as exc:
            failure={'status':'failed','phase':name,'error':str(exc),'partial':result,
                     'kind':'actual failed observation; not a successful final report'}
            try:
                failure.update(lastAudio=audio(page),paused=page.evaluate('window.__CHRONO_TEST__.paused()'),
                               snapshot=page.evaluate('window.__CHRONO_TEST__.snapshot()'),
                               hidden=page.evaluate('document.hidden'),focused=page.evaluate('document.activeElement?.id'))
            except Exception as observation_error:
                failure['observationError']=str(observation_error)
            if out is not None:
                Path(out).mkdir(parents=True,exist_ok=True)
                (Path(out)/'scene-audio-failure.json').write_text(json.dumps(failure,ensure_ascii=False,indent=2),encoding='utf-8')
            raise
        assert held['blocked']
        # Read real frames; no writes, synthetic clicks or simulated time.
        page.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
        after=page.evaluate('window.__CHRONO_TEST__.snapshot()')
        assert after==frozen,(name,frozen,after)
        assert audio(page)['notesStarted']==held['notesStarted']
        page.keyboard.press(close_key)
        result['holds'].append({'name':name,'observation':held,'stateUnchanged':after==frozen,
                                'resumed':wait_playing(page,after=held['notesStarted'])})
    return result

def finish_audio_observation(page,activate,result,existing_import,out):
    # The original journey's first v6 import, not an additional file selection.
    before,opened=existing_import['audioBefore'],existing_import['audioChooserOpen']
    assert before['enabled'] and opened['enabled'] and opened['blocked'],existing_import
    assert opened['activeVoices']==0 and opened['masterGain']==0,existing_import
    after=wait_playing(page,after=before['notesStarted'],cue='fair')
    assert after['epoch']>before['epoch'] and after['contextCount']==1,after
    result['import']={'originalJourneyImport':True,'result':existing_import['result'],
                      'before':before,'opened':opened,'after':after}
    activate(page,'sound')
    assert page.locator('#sound').get_attribute('aria-pressed')=='false'
    result['muted']=wait_silent(page)
    assert not result['muted']['enabled'] and result['muted']['contextCount']==1
    result['status']='passed'
    (out/'scene-audio-report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    return result
