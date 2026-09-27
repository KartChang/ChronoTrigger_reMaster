import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {inflateSync} from 'node:zlib';import {readFileSync,mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {EARLY_SCENE_ART,paintEarlySceneSurface} from '../.test/early-scene-art.mjs';
import {bridgeDeckPixels} from '../.test/art-profile.mjs';
import {exportEarlyScenes} from '../scripts/early-scene-export.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const [kind,dimensions]of Object.entries(EARLY_SCENE_ART.dimensions))test('C authored '+kind+' has deterministic, isolated runtime pixels at the declared size',()=>{
 const p=paintEarlySceneSurface(kind),q=paintEarlySceneSurface(kind);assert.deepEqual([p.width,p.height],dimensions);assert.equal(p.rgba.length,p.width*p.height*4);assert.equal(sha(p.rgba),sha(q.rgba));
 assert.equal(EARLY_SCENE_ART.approved,false);assert.notEqual(p.rgba,q.rgba);assert(new Set(p.rgba).size>20);p.rgba.fill(0);assert.notEqual(sha(p.rgba),sha(q.rgba));
 if(kind!=='understory')for(let i=3;i<q.rgba.length;i+=4)assert.equal(q.rgba[i],255,kind+' must not expose void through a floor');
});
test('understory has four genuinely different, transparent-gutter atlas cells without cross-tile bleed',()=>{
 const p=paintEarlySceneSurface('understory'),hashes=[];
 for(let k=0;k<4;k++){const cell=[];for(let y=0;y<128;y++)for(let x=0;x<64;x++){const at=(y*256+k*64+x)*4;cell.push(...p.rgba.subarray(at,at+4));if(x<2||x>61||y<2||y>125)assert.equal(p.rgba[at+3],0);}
  hashes.push(sha(Buffer.from(cell)));assert(cell.some((v,i)=>i%4===3&&v===255));
 }assert.equal(new Set(hashes).size,4);
});
test('bridge deck uses the retained production art/gameplay bounds, not a wider invented walkway',()=>{
 const p=paintEarlySceneSurface('bridge-floor'),b=bridgeDeckPixels(p.height);assert(b.top>0&&b.bottom<p.height);
 for(const y of [b.top-1,b.bottom])for(let x=0;x<p.width;x++)assert(p.rgba[(y*p.width+x)*4]<50);
 for(const y of [b.top,b.bottom-1])assert(p.rgba[(y*p.width+5)*4]>70);
});
test('unknown surfaces fail closed rather than return placeholder success',()=>{for(const kind of ['','unknown','constructor','__proto__',null])assert.throws(()=>paintEarlySceneSurface(kind));});
test('C PNG exports decode to the exact runtime buffer for every surface and retain provenance',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'chrono-c-art-'));try{const m=await exportEarlyScenes(dir);assert.equal(m.assets.length,16);assert.equal(m.approved,false);assert.equal(m.method,'same-runtime-authored-pixels');assert.equal(m.sourceSha256,sha(readFileSync('src/early-scene-art.ts')));
  for(const a of m.assets){const png=readFileSync(join(dir,a.file)),chunks=[];for(let i=8;i<png.length;){const len=png.readUInt32BE(i),type=png.subarray(i+4,i+8).toString();if(type==='IDAT')chunks.push(png.subarray(i+8,i+8+len));i+=len+12;}const scan=inflateSync(Buffer.concat(chunks)),raw=Buffer.alloc(a.width*a.height*4);for(let y=0;y<a.height;y++){assert.equal(scan[y*(a.width*4+1)],0);scan.copy(raw,y*a.width*4,y*(a.width*4+1)+1,(y+1)*(a.width*4+1));}assert.equal(sha(raw),a.rgbaSha256);assert.equal(sha(raw),sha(paintEarlySceneSurface(a.kind).rgba));assert.equal(sha(png),a.pngSha256);}
 }finally{rmSync(dir,{recursive:true,force:true});}
});
