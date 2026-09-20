"""Read-only observation of native HD textures in the actual game renderer.
Called by existing same-run journeys; never changes state, inputs, clocks or saves.
"""
import json
from actor_grounding import record_grounding

def record_hd_party(page, output, name):
    page.wait_for_function('''()=>{const t=window.__CHRONO_TEST__,v=t?.view();
      return v?.actorArt?.profile==='party-redraw-48x64-vq01'
        && v.actorArt.textures.every(x=>x.width===48&&x.height===64)
        && v.actorArt.guestTexture.width===48&&v.actorArt.guestTexture.height===64;
    }''', timeout=15000)
    result=page.evaluate('''()=>{const t=window.__CHRONO_TEST__,s=t.snapshot(),v=t.view();
       return {chapter:s.chapter,tick:s.ticks,frame:v.frame,actorArt:v.actorArt,poses:v.poses,guest:v.guest};}''')
    assert result['actorArt']['approved'] is False
    (output/(name+'-hd-textures.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    page.screenshot(path=str(output/(name+'-hd-actual.png')))
    if result['chapter'] != 'lab':
        record_grounding(page,output,name+'-grounding')
    return result
