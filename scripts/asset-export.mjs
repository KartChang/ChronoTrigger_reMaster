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
export async function exportAssets(root=process.cwd()){
  const {build}=await import('esbuild');const out=resolve(root,'dist/art');await mkdir(out,{recursive:true});
  const bundle=resolve(root,'.test/pixel-export.mjs');
  await build({entryPoints:[resolve(root,'src/pixel-art.ts')],bundle:true,outfile:bundle,format:'esm',platform:'node'});
  const art=await import(pathToFileURL(bundle).href+'?export');
  const sourceSha256=createHash('sha256').update(await readFile(resolve(root,'src/pixel-art.ts'))).digest('hex');
  const inventory=[];
  async function save(id,sheet,metadata){
    const bytes=png(sheet);await writeFile(resolve(out,id+'.png'),bytes);
    const data={schemaVersion:1,id,image:id+'.png',size:{w:sheet.width,h:sheet.height},sampling:'nearest',padding:2,stage:'prototype-not-approved',provenance:{method:'export of runtime hand-authored pixel functions',source:'src/pixel-art.ts',sourceSha256,romExtracted:false,originalCharacterRightsCleared:false},...metadata};
    await writeFile(resolve(out,id+'.json'),JSON.stringify(data,null,2));
    inventory.push({id,frames:data.frames.length,width:sheet.width,height:sheet.height,sha256:createHash('sha256').update(bytes).digest('hex'),stage:data.stage});
  }
  for(const [id,draw] of [['crono',(c,d,f)=>art.drawAdventureHero(c,0,d,f)],['marle',(c,d,f)=>art.drawAdventureHero(c,1,d,f)],['lucca',art.drawLucca]]){
    const {sheet,frames,clips}=actorSheet(draw);await save(id,sheet,{frames,clips,missingClips:['attack','cast','hurt','down','victory']});
  }
  for(const [id,w,h,draw] of [['imp',24,32,art.drawImp],['tree',64,80,art.drawTree],...['resident','guard','king'].map(k=>[k,24,32,c=>art.drawResident(c,k)])]){
    const s=surface(w,h);draw(s.ink);await save(id,s,{padding:0,frames:[{index:0,rect:{x:0,y:0,w,h},pivot:{x:w/2,y:h-1}}],clips:{idle:{frames:[0],loop:true}}});
  }
  const report={stage:'prototype-export-not-final-art',images:inventory.length,frames:inventory.reduce((n,a)=>n+a.frames,0),sourceSha256,assets:inventory,limitations:['Same authoring functions as the runtime, not a new high-fidelity art pack.','Walk cycle has three distinct poses over four timed frames; phases 0 and 2 repeat.','Combat poses, portraits, audio and 3D authoring assets remain incomplete.','Exports are editable review artifacts; external atlas import is not implemented.']};
  await writeFile(resolve(out,'asset-report.json'),JSON.stringify(report,null,2));return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const report=await exportAssets();console.log(`Exported ${report.images} prototype PNG sheets / ${report.frames} frame records. NOT final approved art.`);
}
