"""Read-only additive observation in the existing native CPU session. No input or state writes."""
import base64
import hashlib

SCRIPT = r'''() => {
 const api=window.__CHRONO_TEST__,state=api.snapshot(),view=api.view(),c=document.getElementById('world');
 const bytes=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
 const art=view.fieldEnemyArt,colors=[[55,125,144,255],[224,209,122,255],[41,43,56,255],[48,45,64,255]];
 const counts=art.rects.map(r=>{
  const values=colors.map(()=>0);
  for(let y=Math.max(0,Math.floor(r.top*c.height));y<Math.min(c.height,Math.ceil(r.bottom*c.height));y++)
   for(let x=Math.max(0,Math.floor(r.left*c.width));x<Math.min(c.width,Math.ceil(r.right*c.width));x++){
    const n=(y*c.width+x)*4;colors.forEach((v,i)=>{if(v.every((a,j)=>a===bytes[n+j]))values[i]++;});
   }
  return {id:r.id,values};
 });
 return {profile:'vq03c-native-field-enemies',state,art,renderer:view.renderer,
  canvas:{width:c.width,height:c.height,source:'actual-cpu-canvas',palette:colors,counts},
  png:c.toDataURL('image/png'),physicalDevice:false,artApproved:false};
}'''

def observe_field_enemies(page, out, chapter, target):
    """Persist available observation/PNG before raising; caller keeps original failure."""
    record = page.evaluate(SCRIPT)
    target[chapter] = record
    png = record.pop('png')
    assert png.startswith('data:image/png;base64,')
    raw = base64.b64decode(png.split(',', 1)[1], validate=True)
    path = out / ('field-' + chapter + '-canvas.png')
    path.write_bytes(raw)
    record['canvasImage'] = {'path': path.name, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()}
    assert record['state']['chapter'] == chapter
    assert record['art']['active'] is True
