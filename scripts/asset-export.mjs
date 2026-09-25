import {exportHDAssets} from './hd-asset-export.mjs';
import {deflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

/** Minimal integer pixel surface for exporting the same rect-based art used at runtime.
 * Deliberately rejects unsupported colors/fractional rectangles rather than silently
 * pretending to implement a general Canvas renderer. This is not ROM extraction.
 */
export function surface(width,height){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>2048||height>2048)throw new Error('Invalid pixel dimensions');
  const rgba=Buffer.alloc(width*height*4);
  const ink={fillStyle:'#000000',fillRect(x,y,w,h){paint(x,y,w,h,this.fillStyle);},clearRect(x,y,w,h){paint(x,y,w,h,null);}};
  function paint(x,y,w,h,hex){
    if(![x,y,w,h].every(Number.isInteger)||w<0||h<0)throw new Error('Only nonnegative integer pixel rectangles supported');
    if(hex!==null&&!/^#[0-9a-f]{6}$/i.test(hex))throw new Error('Unsupported pixel color');
    const color=hex===null?[0,0,0,0]:[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16),255];
    for(let yy=Math.max(0,y);yy<Math.min(height,y+h);yy++)for(let xx=Math.max(0,x);xx<Math.min(width,x+w);xx++)rgba.set(color,(yy*width+xx)*4);
  }
  return {width,height,rgba,ink};
}
const table=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function chunk(kind,data){
  const type=Buffer.from(kind),body=Buffer.concat([type,data]),out=Buffer.alloc(data.length+12);
  out.writeUInt32BE(data.length);body.copy(out,4);let crc=0xffffffff;
  for(const b of body)crc=table[(crc^b)&255]^(crc>>>8);
  out.writeUInt32BE((crc^0xffffffff)>>>0,out.length-4);return out;
}
export function png({width,height,rgba}){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||rgba.length!==width*height*4)throw new Error('Invalid PNG surface');
  const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
  const scan=Buffer.alloc(height*(width*4+1));
  for(let y=0;y<height;y++)rgba.copy(scan,y*(width*4+1)+1,y*width*4,(y+1)*width*4);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(scan)),chunk('IEND',Buffer.alloc(0))]);
}
export function actorSheet(draw){
  const sheet=surface(112,144),frames=[],clips={};const directions=['down','right','up','left'];
  for(let facing=0;facing<4;facing++){
    const indices=[];
    for(let phase=0;phase<4;phase++){
      const frame=surface(24,32);draw(frame.ink,facing,phase);
      const x=phase*28+2,y=facing*36+2;
      for(let row=0;row<32;row++)frame.rgba.copy(sheet.rgba,((y+row)*112+x)*4,row*24*4,(row+1)*24*4);
      const index=frames.length;indices.push(index);
      frames.push({index,name:`walk.${directions[facing]}.${phase}`,rect:{x,y,w:24,h:32},pivot:{x:12,y:31},durationMs:125});
    }
    clips[`idle.${directions[facing]}`]={frames:[indices[0]],loop:true};
    clips[`walk.${directions[facing]}`]={frames:indices,loop:true};
  }
  return {sheet,frames,clips};
}
export function combatSheet(draw,poses,durations){
  const sheet=surface(112,poses.length*4*36),frames=[],clips={};
  const directions=['down','right','up','left'];
  for(let poseIndex=0;poseIndex<poses.length;poseIndex++){
    const pose=poses[poseIndex];
    if(!Array.isArray(durations[pose])||durations[pose].length!==4)throw new Error('Missing four-frame clip timing');
    for(let facing=0;facing<4;facing++){
      const indices=[];
      for(let phase=0;phase<4;phase++){
        const frame=surface(24,32);draw(frame.ink,facing,phase,pose);
        const x=phase*28+2,y=(poseIndex*4+facing)*36+2;
        for(let row=0;row<32;row++)frame.rgba.copy(sheet.rgba,((y+row)*112+x)*4,row*24*4,(row+1)*24*4);
        const index=frames.length;indices.push(index);
        frames.push({index,name:`${pose}.${directions[facing]}.${phase}`,rect:{x,y,w:24,h:32},pivot:{x:12,y:31},durationMs:durations[pose][phase]});
      }
      clips[`${pose}.${directions[facing]}`]={frames:indices,loop:false};
    }
  }
  return {sheet,frames,clips};
}
export async function exportAssets(root=process.cwd()){
  const {build}=await import('esbuild');const out=resolve(root,'dist/art');await mkdir(out,{recursive:true});
  const modules={};
  for(const name of ['canyon-art','woodland-art','pixel-art','hero-art','world-art','fair-paving','rescue-art','prologue-art','trial-art','trial-scenery-art','material-art','art-profile','hd-hero-art','witness-art']){
    const bundle=resolve(root,`.test/${name}-export.mjs`);
    await build({entryPoints:[resolve(root,`src/${name}.ts`)],bundle:true,outfile:bundle,format:'esm',platform:'node'});
    modules[name]=await import(pathToFileURL(bundle).href+'?export');
  }
  const prologue=modules['prologue-art'],trial=modules['trial-art'],materials=modules['material-art'],profile=modules['art-profile'].ART_PROFILE;
  await writeFile(resolve(out,'production-profile.json'),JSON.stringify(profile,null,2));
  const art=modules['pixel-art'],hero=modules['hero-art'],world=modules['world-art'],rescue=modules['rescue-art'];
  const sources=['src/canyon-art.ts','src/canyon-render.ts','src/woodland-art.ts','src/surface-layout.ts','src/early-art.ts','src/surface-layout.ts','src/pixel-art.ts','src/hero-art.ts','src/world-art.ts','src/fair-paving.ts','src/rescue-art.ts','src/prologue-art.ts','src/prologue-data.ts','src/trial-art.ts','src/trial-scenery-art.ts','src/trial-render.ts','src/trial-data.ts','src/art-profile.ts','src/material-art.ts','src/material-runtime.ts','src/hd-hero-art.ts','src/witness-art.ts','src/actor-motion.ts','src/npc-motion.ts','src/pixel-presentation.ts'];const hash=createHash('sha256');
  for(const source of sources){hash.update(source+'\0');hash.update(await readFile(resolve(root,source)));hash.update('\0');}
  const sourceSha256=hash.digest('hex');
  const inventory=[];
  async function save(id,sheet,metadata){
    const bytes=png(sheet);await writeFile(resolve(out,id+'.png'),bytes);
    const data={schemaVersion:1,id,image:id+'.png',size:{w:sheet.width,h:sheet.height},sampling:'nearest',padding:2,stage:'reference-review-not-approved',provenance:{method:'hand-authored redraw guided by identified original screenshots; no sampled pixels',sources,sourceSha256,referenceIndex:'assets/reference-index.json',romExtracted:false,originalCharacterRightsCleared:false},...metadata};
    await writeFile(resolve(out,id+'.json'),JSON.stringify(data,null,2));
    inventory.push({id,frames:data.frames.length,width:sheet.width,height:sheet.height,sha256:createHash('sha256').update(bytes).digest('hex'),stage:data.stage});
  }
  for(const [id,draw] of [['crono',(c,d,f,p)=>art.drawAdventureHero(c,0,d,f,p)],['marle',(c,d,f,p)=>art.drawAdventureHero(c,1,d,f,p)],['lucca',art.drawLucca],['frog',rescue.drawFrog]]){
    const {sheet,frames,clips}=actorSheet(draw);await save(id,sheet,{frames,clips,combatSheet:id+'-combat.json'});
    const combat=combatSheet(draw,hero.COMBAT_POSES,hero.CLIP_MS);
    await save(id+'-combat',combat.sheet,{frames:combat.frames,clips:combat.clips,limitations:['Project-specific four-frame actions; not original animation timing or frames.','Imported-edited atlas playback is not implemented.']});
  }
  for(const part of ['head','body','wheel']){
    const sheet=surface(132,68),frames=[];
    for(let phase=0;phase<2;phase++){
      const frame=surface(64,64);trial.drawTankPart(frame.ink,part,phase);const x=phase*66+1,y=2;
      for(let row=0;row<64;row++)frame.rgba.copy(sheet.rgba,((y+row)*132+x)*4,row*64*4,(row+1)*64*4);
      frames.push({index:phase,rect:{x,y,w:64,h:64},pivot:{x:32,y:63},durationMs:profile.animation.tankFrameTicks/profile.animation.fixedHz*1000});
    }
    await save('dragon-tank-'+part,sheet,{padding:1,frames,clips:{idle:{frames:[0],loop:true},battle:{frames:[0,1],loop:true}},animationClock:profile.animation.clock});
  }
  for(const [id,w,h,draw] of [['canyon-oak',64,80,modules['woodland-art'].drawWoodlandOak],['imp',24,32,art.drawImp],['tree',64,80,art.drawTree],['gato',48,48,art.drawGato],['yakra',48,48,rescue.drawYakra],['naga',24,32,rescue.drawNaga],['hench',24,32,c=>rescue.drawNaga(c,true)],...['nun','queen','chancellor'].map(k=>[k,24,32,c=>rescue.drawRescueNpc(c,k)]),...['resident','guard','king'].map(k=>[k,24,32,c=>art.drawResident(c,k)])]){
    const s=surface(w,h);draw(s.ink);await save(id,s,{padding:0,frames:[{index:0,rect:{x:0,y:0,w,h},pivot:{x:w/2,y:h-1}}],clips:{idle:{frames:[0],loop:true}}});
  }
  for(const [id,w,h,draw] of [...materials.SURFACE_KINDS.map(k=>['material-'+k,64,64,c=>materials.drawMaterial(c,k)]),['canyon-floor',512,448,modules['canyon-art'].drawCanyonFloor],['canyon-rock',64,64,modules['canyon-art'].drawCanyonRock],['canyon-turf',64,64,modules['canyon-art'].drawCanyonTurf],['regional-mountain',64,48,materials.drawMountain],...['court','prison','bridge','future'].map(k=>['trial-'+k+'-floor',384,352,c=>trial.drawTrialFloor(c,384,352,k)]),...['courtroom','guardia1000'].map(k=>['scenery-'+k+'-floor',384,352,c=>modules['trial-scenery-art'].drawTrialSceneryFloor(c,384,352,k)]),['court-window',64,80,trial.drawCourtWindow],['home-wood-floor',384,352,c=>prologue.drawRoomFloor(c,384,352)],['truce-regional-map',384,352,c=>prologue.drawRegionalMap(c,384,352)],['fair-ground',512,512,(c)=>modules['fair-paving'].drawFairPlaza(c)],['forest-ground',384,352,(c)=>world.drawSurface(c,384,352,'forest')],['masonry',128,128,(c)=>world.drawMasonry(c)],['cathedral-floor',384,352,c=>rescue.drawCathedralFloor(c,384,352)],['crypt-floor',384,352,c=>rescue.drawCathedralFloor(c,384,352,true)],['stained-glass',40,64,rescue.drawGlass]]){
    const s=surface(w,h);draw(s.ink);await save(id,s,{padding:0,frames:[{index:0,rect:{x:0,y:0,w,h}}],clips:{},orientation:'top is north (+z) for ground maps; Babylon texture update uses invertY=true',usage:'Same authoring code is used by the engine DynamicTexture, not an external runtime request.'});
  }
  const witness=modules['witness-art'];
  for(const kind of witness.WITNESS_KINDS){
    const canvas=surface(208,68),frames=[];
    for(let phase=0;phase<4;phase++){
      const frame=surface(48,64);witness.drawWitness(frame.ink,kind,phase);const x=phase*52+2,y=2;
      for(let row=0;row<64;row++)frame.rgba.copy(canvas.rgba,((row+y)*canvas.width+x)*4,row*48*4,(row+1)*48*4);
      frames.push({index:phase,rect:{x,y,w:48,h:64},pivot:witness.WITNESS_SIZE.pivot,durationMs:[1500,1500,150,850][phase]});
    }
    await save('witness-'+kind,canvas,{padding:2,frames,clips:{idle:{frames:[0,1,2,3],loop:true}},limitations:['Four authored ambient poses; not complete four-direction movement or original timing.']});
  }
  for(const kind of ['cat','lunch','parcel']){
    const count=kind==='cat'?2:1,canvas=surface(count*34,36),frames=[];
    for(let phase=0;phase<count;phase++){
      const frame=surface(32,32);witness.drawFairProp(frame.ink,kind,phase);
      const x=phase*34+1,y=2;for(let row=0;row<32;row++)frame.rgba.copy(canvas.rgba,((row+y)*canvas.width+x)*4,row*32*4,(row+1)*32*4);
      frames.push({index:phase,rect:{x,y,w:32,h:32},pivot:{x:16,y:31},durationMs:300});
    }
    await save('fair-'+kind,canvas,{padding:1,frames,clips:{idle:{frames:[0],loop:true},...(kind==='cat'?{follow:{frames:[0,1],loop:true}}:{})}});
  }
  inventory.push(...await exportHDAssets(out,modules['hd-hero-art'],hero.CLIP_MS,sourceSha256));
  const report={stage:'reference-review-not-final-art',images:inventory.length,frames:inventory.reduce((n,a)=>n+a.frames,0),sourceSha256,productionProfile:profile.id,assets:inventory,limitations:['References calibrate silhouettes, palette and surface treatment; compressed layouts and project animation timings are not exact original reconstruction.','Walk cycle has three distinct poses over four timed frames; phases 0 and 2 repeat.','Combat clips require live gameplay review. Portraits, music, full cast and remaining world assets are still incomplete.','Exports are review/editing artifacts. External PNG re-import is not implemented.']};
  await writeFile(resolve(out,'asset-report.json'),JSON.stringify(report,null,2));return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const report=await exportAssets();console.log(`Exported ${report.images} review PNG sheets / ${report.frames} frame records. NOT final approved art.`);
}
