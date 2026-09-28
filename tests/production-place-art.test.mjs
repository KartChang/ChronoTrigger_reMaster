import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';import {inflateSync} from 'node:zlib';
import {PLACE_ART,paintPlaceSurface} from '../.test/production-place-art.mjs';
import {exportProductionPlaces} from '../scripts/production-place-export.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const [kind,[w,h]]of Object.entries(PLACE_ART.dimensions))test('F deterministic authored '+kind+' native dimensions and opaque/transparent contract',()=>{
 const p=paintPlaceSurface(kind);assert.equal(p.width,w);assert.equal(p.height,h);assert.equal(p.rgba.length,w*h*4);assert.notEqual(p.rgba,paintPlaceSurface(kind).rgba);assert.equal(sha(p.rgba),sha(paintPlaceSurface(kind).rgba));
 const alpha=p.rgba.filter((_,i)=>i%4===3);assert([...alpha].every(a=>a===0||a===255));const coverage=alpha.filter(a=>a===255).length/(w*h);assert(kind==='town-verge'?coverage>.02&&coverage<.2:coverage===1);assert.equal(PLACE_ART.approved,false);
 const colors=new Set();for(let i=0;i<p.rgba.length;i+=4)if(p.rgba[i+3])colors.add(p.rgba.slice(i,i+3).join(','));assert(colors.size>3);
});
test('F author rejects unknown/prototype selectors and leaves the quiet central route and outer boundary transparent',()=>{
 for(const k of ['unknown','__proto__','constructor',null])assert.throws(()=>paintPlaceSurface(k));const p=paintPlaceSurface('town-verge');
 for(let y=0;y<p.height;y++)for(const x of [0,1,190,191,192,193,382,383])assert.equal(p.rgba[(y*p.width+x)*4+3],0);
 for(const y of [0,1,350,351])for(let x=0;x<p.width;x++)assert.equal(p.rgba[(y*p.width+x)*4+3],0);
});
function decode(bytes){assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');let i=8,w,h,parts=[];while(i<bytes.length){const n=bytes.readUInt32BE(i),tag=bytes.toString('ascii',i+4,i+8),b=bytes.subarray(i+8,i+8+n);if(tag==='IHDR'){w=b.readUInt32BE(0);h=b.readUInt32BE(4);assert.equal(b[8],8);assert.equal(b[9],6);}if(tag==='IDAT')parts.push(b);i+=12+n;}const data=inflateSync(Buffer.concat(parts)),rgba=Buffer.alloc(w*h*4);assert.equal(data.length,(w*4+1)*h);for(let y=0;y<h;y++){assert.equal(data[y*(w*4+1)],0);data.copy(rgba,y*w*4,y*(w*4+1)+1,(y+1)*(w*4+1));}return {width:w,height:h,rgba};}
test('F four exported PNGs decode to actual renderer author bytes, not display images',async()=>{
 const out='.test/place-export-parity',m=await exportProductionPlaces(out);assert.equal(m.approved,false);assert.equal(m.nativeEvidence,false);assert.equal(m.assets.length,4);
 for(const a of m.assets){const p=paintPlaceSurface(a.kind),bytes=readFileSync(out+'/'+a.file),d=decode(bytes);assert.equal(sha(bytes),a.pngSha256);assert.equal(sha(d.rgba),a.rgbaSha256);assert.equal(d.width,p.width);assert.equal(d.height,p.height);assert.deepEqual(d.rgba,Buffer.from(p.rgba));}
});
