import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {surface,png} from './asset-export.mjs';
/** General atlas packing for native redraws, without a scaling/interpolation stage. */
export function hdSheet(draw,profile,durations){
 const {width:w,height:h,padding:pad}=profile,cols=8;
 const plan=[];for(const pose of ['idle','walk','attack','cast','hurt','down','victory'])for(let direction=0;direction<4;direction++)for(let frame=0;frame<(pose==='idle'?1:4);frame++)plan.push({pose,direction,frame});
 const sheet=surface(cols*(w+2*pad),Math.ceil(plan.length/cols)*(h+2*pad)),frames=[],clips={};
 for(const [i,p] of plan.entries()){
  const single=surface(w,h);draw(single.ink,p.direction,p.frame,p.pose);
  const x=(i%cols)*(w+2*pad)+pad,y=Math.floor(i/cols)*(h+2*pad)+pad;
  for(let row=0;row<h;row++)single.rgba.copy(sheet.rgba,((y+row)*sheet.width+x)*4,row*w*4,(row+1)*w*4);
  const key=p.pose+'.'+['down','right','up','left'][p.direction];
  frames.push({index:i,name:key+'.'+p.frame,rect:{x,y,w,h},pivot:profile.pivot,durationMs:p.pose==='walk'?125:p.pose==='idle'?250:durations[p.pose][p.frame]});
  (clips[key]??={frames:[],loop:p.pose==='idle'||p.pose==='walk'}).frames.push(i);
 }
 return {sheet,frames,clips};
}
export async function exportHDAssets(out,hd,durations,sourceSha256){
 const inventory=[];
 for(const hero of hd.HD_HERO_IDS){
  const {sheet,frames,clips}=hdSheet((c,d,f,p)=>hd.drawHDHero(c,hero,d,f,p),hd.HD_ART,durations),id=hero+'-hd',bytes=png(sheet);
  const metadata={schemaVersion:1,id,image:id+'.png',size:{w:sheet.width,h:sheet.height},nativeCell:{w:hd.HD_ART.width,h:hd.HD_ART.height},sampling:'nearest',padding:hd.HD_ART.padding,stage:'native-redraw-review-not-approved',profile:hd.HD_ART.id,frames,clips,provenance:{method:hd.HD_ART.method,source:'src/hd-hero-art.ts',sourceSha256,romExtracted:false,legacyImageResampled:false,aiImageGenerated:false,originalCharacterRightsCleared:false}};
  await writeFile(resolve(out,id+'.png'),bytes);await writeFile(resolve(out,id+'.json'),JSON.stringify(metadata,null,2));
  inventory.push({id,frames:frames.length,width:sheet.width,height:sheet.height,sha256:createHash('sha256').update(bytes).digest('hex'),stage:metadata.stage,nativeCell:metadata.nativeCell});
 }
 await writeFile(resolve(out,'hd-party-report.json'),JSON.stringify({profile:hd.HD_ART,assets:inventory,limitations:['Authored native-resolution pixel candidates, not AI image generation or original sprite extraction.','Four party characters only; old NPC/enemy/world art has not all been redrawn.','A larger atlas does not establish visual quality, original fidelity, physical-device performance or 90-point acceptance.']},null,2));
 return inventory;
}
