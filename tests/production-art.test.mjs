/** Exact authored asset tests, not native gameplay or artistic approval. */
import test from 'node:test';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {paintProductionSurface,PRODUCTION_ART} from '../.test/production-art.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const kinds=Object.keys(PRODUCTION_ART.dimensions),transparent=new Set(['canopy-atlas','court-window','court-banner']);
for(const kind of kinds)test('production surface '+kind+' has deterministic authored full-size pixels',()=>{
 const a=paintProductionSurface(kind),b=paintProductionSurface(kind);assert.deepEqual([a.width,a.height],PRODUCTION_ART.dimensions[kind]);assert.equal(a.rgba.length,a.width*a.height*4);assert.equal(sha(a.rgba),sha(b.rgba));assert.notEqual(a.rgba,b.rgba);
 let solid=0,clear=0;const colors=new Set();for(let i=0;i<a.rgba.length;i+=4){assert(a.rgba[i+3]===0||a.rgba[i+3]===255,'binary alpha keeps existing nearest cutout');if(a.rgba[i+3]){solid++;colors.add((a.rgba[i]<<16)|(a.rgba[i+1]<<8)|a.rgba[i+2]);}else clear++;}
 assert(solid>512);assert(colors.size>80,kind+' is not a flat-color placeholder');if(transparent.has(kind))assert(clear>512);else assert.equal(clear,0);
 const before=b.rgba[0];a.rgba[0]=255-before;assert.equal(b.rgba[0],before,'independent immutable-by-ownership buffers');
});
test('four authored canopy shapes use identical established normalized UVs and empty gutters',()=>{
 const p=paintProductionSurface('canopy-atlas'),hashes=[];
 for(let variant=0;variant<4;variant++){
  const data=[];for(let y=0;y<p.height;y++)for(let x=0;x<136;x++){const at=(y*p.width+variant*136+x)*4;if(x<4||x>=132)assert.equal(p.rgba[at+3],0,'gutter');else data.push(...p.rgba.subarray(at,at+4));}
  hashes.push(sha(Buffer.from(data)));assert.equal((variant*136+4)/544,(variant*68+2)/272);assert.equal(128/544,64/272);
 }assert.equal(new Set(hashes).size,4);
});
test('the court joinery is authored separately from heraldic benches',()=>assert.notEqual(sha(paintProductionSurface('court-wood').rgba),sha(paintProductionSurface('court-timber').rgba)));
test('bounded static texture budget and unknown surface fail closed',()=>{
 assert.equal(kinds.length,13);const bytes=Object.values(PRODUCTION_ART.dimensions).reduce((n,[w,h])=>n+w*h*4,0);assert(bytes<6*1024*1024);assert.equal(PRODUCTION_ART.approved,false);assert.equal(PRODUCTION_ART.romPixels,false);
 for(const bad of ['',null,undefined,'__proto__','native-report','../media'])assert.throws(()=>paintProductionSurface(bad));
});
test('PNG export decodes to actual runtime pixels and is in the existing CI art artifact',async()=>{
 const {exportProductionArt}=await import('../scripts/production-art-export.mjs');const {readFile,mkdir}=await import('node:fs/promises');const {inflateSync}=await import('node:zlib');
 const out='.test/production-art-export-check';await mkdir(out,{recursive:true});const manifest=await exportProductionArt(out);assert.equal(manifest.assets.length,13);
 for(const item of manifest.assets){const raw=await readFile(out+'/'+item.file);assert.equal(sha(raw),item.pngSha256);assert.equal(item.rgbaSha256,sha(paintProductionSurface(item.kind).rgba));let at=8;const idat=[];while(at<raw.length){const n=raw.readUInt32BE(at),name=raw.toString('ascii',at+4,at+8);if(name==='IDAT')idat.push(raw.subarray(at+8,at+8+n));at+=12+n;}const decoded=inflateSync(Buffer.concat(idat)),pixels=Buffer.alloc(item.rawBytes),stride=item.width*4;
  assert.equal(decoded.length,(stride+1)*item.height);for(let y=0;y<item.height;y++){assert.equal(decoded[y*(stride+1)],0);decoded.copy(pixels,y*stride,y*(stride+1)+1,(y+1)*(stride+1));}assert.equal(sha(pixels),item.rgbaSha256);
 }
 const build=await readFile('scripts/build.mjs','utf8');assert(build.includes("await exportProductionArt('dist/art/production-vq04a');"));assert((await readFile('.github/workflows/ci.yml','utf8')).includes('dist/art/'));
});
