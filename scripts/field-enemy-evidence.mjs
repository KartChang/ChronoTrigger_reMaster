import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';
const need=(ok,text)=>{if(!ok)throw Error('Field enemy evidence: '+text);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export const FIELD_PALETTE=[[55,125,144,255],[224,209,122,255],[41,43,56,255],[48,45,64,255]];
const samples=[[0,0,[0,0,0,0]],[6,13,FIELD_PALETTE[0]],[8,15,FIELD_PALETTE[1]],[9,16,FIELD_PALETTE[2]],[6,29,FIELD_PALETTE[3]]];
const crcTable=Array.from({length:256},(_,v)=>{for(let i=0;i<8;i++)v=v&1?0xedb88320^(v>>>1):v>>>1;return v>>>0;});
const crc=b=>{let n=0xffffffff;for(const v of b)n=crcTable[(n^v)&255]^(n>>>8);return(n^0xffffffff)>>>0;};
/** Decode bounded native Canvas PNG bytes for independent pixel counts; no image synthesis. */
export function decodeCanvasPng(bytes){
 need(Buffer.isBuffer(bytes)&&bytes.length>=45&&bytes.length<=4*1024*1024,'PNG byte bound');
 need(bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a','PNG signature');
 let width=0,height=0,channels=0,ended=false;const data=[];
 for(let p=8;p<bytes.length;){
  need(p+12<=bytes.length,'truncated chunk');const n=bytes.readUInt32BE(p),type=bytes.toString('ascii',p+4,p+8);need(p+n+12<=bytes.length,'chunk bounds');
  const body=bytes.subarray(p+8,p+8+n);need(crc(bytes.subarray(p+4,p+8+n))===bytes.readUInt32BE(p+8+n),'chunk CRC');
  if(type==='IHDR'){need(p===8&&n===13,'unique first IHDR');width=body.readUInt32BE(0);height=body.readUInt32BE(4);channels=body[9]===6?4:body[9]===2?3:0;need(width>0&&height>0&&width<=1280&&height<=1280&&width*height<=307200&&body[8]===8&&channels&&body[10]===0&&body[11]===0&&body[12]===0,'bounded 8-bit RGB/RGBA PNG');}
  else if(type==='IDAT')data.push(body);
  else if(type==='IEND'){need(n===0&&p+12===bytes.length,'final IEND');ended=true;}
  else need(type[0]===type[0].toLowerCase(),'unsupported critical chunk');
  p+=n+12;
 }
 need(ended&&data.length>0,'PNG image missing');const stride=width*channels,limit=(stride+1)*height;
 const raw=inflateSync(Buffer.concat(data),{maxOutputLength:limit});need(raw.length===limit,'scanline length');const decoded=Buffer.alloc(stride*height),rgba=Buffer.alloc(width*height*4);
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];need(filter<=4,'PNG filter');for(let x=0;x<stride;x++){
  const at=y*stride+x,a=x>=channels?decoded[at-channels]:0,b=y?decoded[at-stride]:0,c=y&&x>=channels?decoded[at-stride-channels]:0;
  decoded[at]=(raw[y*(stride+1)+1+x]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;
 }}
 for(let i=0;i<width*height;i++){rgba[i*4]=decoded[i*channels];rgba[i*4+1]=decoded[i*channels+1];rgba[i*4+2]=decoded[i*channels+2];rgba[i*4+3]=channels===4?decoded[i*channels+3]:255;}
 return{width,height,rgba};
}
export function paletteCounts(rgba,width,height,rects){return rects.map(r=>{const values=FIELD_PALETTE.map(()=>0);for(let y=Math.max(0,Math.floor(r.top*height));y<Math.min(height,Math.ceil(r.bottom*height));y++)for(let x=Math.max(0,Math.floor(r.left*width));x<Math.min(width,Math.ceil(r.right*width));x++){const n=(y*width+x)*4;FIELD_PALETTE.forEach((v,i)=>{if(v.every((a,j)=>a===rgba[n+j]))values[i]++;});}return{id:r.id,values};});}
export function assertFieldEnemies(o,chapter,bytes){
 need(['canyon','forest'].includes(chapter)&&o?.profile==='vq03c-native-field-enemies','profile/chapter');const s=o.state,a=o.art,c=o.canvas;
 need(s?.chapter===chapter&&s.mode==='explore'&&Number.isSafeInteger(s.ticks)&&s.ticks>=0,'actual pre-encounter state');
 need(chapter==='canyon'?s.opening?.canyonWon===false:s.kingdom?.forestWon===false,'uncleared encounter');
 const ids=Array.from({length:chapter==='canyon'?3:2},(_,i)=>'enemy-'+i);
 need(a?.profile==='vq03c-field-enemy-palette'&&a.chapter===chapter&&a.tick===s.ticks&&a.active===true&&a.approved===false,'runtime palette observation');
 need(same(a.actors?.map(m=>m.name),ids)&&same(a.rects?.map(r=>r.id),ids),'exact visible field enemy ownership');
 for(const m of a.actors){need(m.texture===m.name+'-pixels'&&same(m.cell,{width:24,height:32})&&m.sampling===1&&m.alpha===true&&m.alphaTest===true,'original texture/nearest-alpha');
  need(m.disableLighting===true&&m.emissiveMatchesDiffuse===true&&m.emissionOnly===true&&m.linked===false,'one unlit palette path');
  for(const k of ['emissive','ambient','specular'])need(same(m[k],[0,0,0]),'no added '+k);
  need(same(m.samples,samples.map(([x,y,rgba])=>({x,y,rgba}))),'authored texture pixels');
  need(same(m.scale,[1,1.3,1])&&m.position?.length===3&&m.position.every(Number.isFinite),'existing field scale/position');
 }
 for(const r of a.rects)need([r.left,r.top,r.right,r.bottom].every(Number.isFinite)&&r.left<r.right&&r.top<r.bottom&&r.right>0&&r.left<1&&r.bottom>0&&r.top<1,'visible projected enemy');
 need(o.renderer?.backend==='cpu-canvas2d'&&o.renderer.webglVersion===0&&o.renderer.canvas2dFallback===true,'native CPU renderer');
 need(c?.source==='actual-cpu-canvas'&&same(c.palette,FIELD_PALETTE)&&c.width===o.renderer.width&&c.height===o.renderer.height,'same actual canvas');
 need(o.physicalDevice===false&&o.artApproved===false,'evidence limits');const receipt=o.canvasImage;
 need(receipt?.path==='field-'+chapter+'-canvas.png'&&receipt.bytes===bytes.length&&receipt.sha256===createHash('sha256').update(bytes).digest('hex'),'source-bound PNG receipt');
 const png=decodeCanvasPng(bytes);need(png.width===c.width&&png.height===c.height,'actual PNG IHDR');
 const counts=paletteCounts(png.rgba,png.width,png.height,a.rects);need(same(counts,c.counts),'independent PNG pixel counts');
 // Every visible sprite must retain blue and gold, and the group must retain dark ink.
 for(const r of counts)need(r.values[0]>0&&r.values[1]>0,'field enemy washed out or missing');
 need(counts.some(r=>r.values[2]+r.values[3]>0),'dark outline absent');return true;
}
