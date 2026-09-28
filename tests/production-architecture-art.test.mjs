import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {ARCHITECTURE_ART,reshapeArchitecture} from '../.test/production-architecture-art.mjs';
const box=Array.from({length:24},(_,i)=>[i%2?2.5:-2.5,i%4<2?-.09:.09,i%8<4?-1.9:1.9]).flat();
for(const rotation of [0,.48,-.48])test('H authored parent-space affine compression preserves all XZ/UV anchors at roof rotation '+rotation,()=>{
 const copy=[...box],out=reshapeArchitecture(box,3.35,rotation,.33,.82),c=Math.cos(rotation),s=Math.sin(rotation);
 for(let i=0;i<out.length;i+=3){const x=c*box[i]-s*box[i+1],y=s*box[i]+c*box[i+1]+3.35;assert(Math.abs(c*out[i]-s*out[i+1]-x)<1e-12);assert(Math.abs(s*out[i]+c*out[i+1]+3.35-(.33+(y-.33)*.82))<1e-12);assert.equal(out[i+2],box[i+2]);}assert.deepEqual(box,copy);assert.notEqual(out,box);
});
test('H rejects invalid geometry/scale without partial mutation',()=>{for(const args of [[[],0,0,0,.8],[box,NaN,0,0,.8],[box,0,Infinity,0,.8],[box,0,0,NaN,.8],[box,0,0,0,0],[box,0,0,0,1.1],[box.map((x,i)=>i===20?NaN:x),0,0,0,.8]])assert.throws(()=>reshapeArchitecture(...args),RangeError);});
test('H recipe bounds and independent export are truthful and from the exact runtime author module',async()=>{const {exportArchitecture}=await import('../scripts/architecture-model-export.mjs');const m=await exportArchitecture('.test/architecture-export-check');assert.deepEqual(m.profile,ARCHITECTURE_ART);assert.equal(m.nativeEvidence,false);assert.equal(m.approved,false);assert.equal(m.newBitmapAssets,0);assert.equal(m.profile.maxAdditionalGeometryBytes,110*912);assert.equal(m.sourceSha256,createHash('sha256').update(readFileSync('src/production-architecture-art.ts')).digest('hex'));});
