// VQ02C source comparison only: original methods remain checked after explicit actor wiring.
import {actorBaseline} from './helpers/actor-baseline.mjs';
// VQ02B explicitly advances only renderer/main pins for requested context/density wiring.
// Original draw/camera/scene functions are verified in render-preserved.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {bannerPose,sceneryPose,sceneryTick} from '../.test/fair-scenery-motion.mjs';
import {buildFair} from '../.test/fair-render.mjs';
import {createState} from '../.test/core.mjs';
import {festivalTestScene} from './festival-test-scene.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
test('tick input is finite, nonnegative and discrete even for corrupted observations',()=>{
 for(const t of [NaN,Infinity,-Infinity,-1])assert.equal(sceneryTick(t),0);
 assert.equal(sceneryTick(12.9),12);assert.equal(sceneryTick(1e100),Number.MAX_SAFE_INTEGER);
});
test('banner index is bounded',()=>{for(const n of [-1,4,NaN,.5])assert.throws(()=>bannerPose(0,n),RangeError);});
test('each banner stays within a bounded nonflashing sway envelope',()=>{
 for(let t=0;t<4200;t+=3)for(let i=0;i<4;i++){const p=bannerPose(t,i);assert(Math.abs(p.x)<=.06500001);assert(Math.abs(p.z)<=.02800001);}
});
test('wind phases differ by banner and move continuously with fixed ticks',()=>{
 const poses=Array.from({length:4},(_,i)=>bannerPose(100,i));assert.equal(new Set(poses.map(p=>p.x)).size,4);
 for(let t=0;t<1000;t++){const a=bannerPose(t,2),b=bannerPose(t+1,2);assert(Math.abs(a.x-b.x)<.002);assert(Math.abs(a.z-b.z)<.001);}
});
test('sampled pose is independent of rendering frequency and read order',()=>{
 const end=sceneryPose(420);for(let t=0;t<420;t++)sceneryPose(t);assert.deepEqual(sceneryPose(420),end);
 for(let i=0;i<4;i++)assert.deepEqual(bannerPose(18.9,i),bannerPose(18,i));
});
test('reduced motion keeps original rest transforms while ticks advance',()=>{
 for(const t of [0,50,1e6]){const {tick,reducedMotion,...p}=sceneryPose(t,true);assert(reducedMotion);assert(Object.values(p).every(x=>x===0));for(let i=0;i<4;i++)assert.deepEqual(bannerPose(t,i,true),{x:0,z:0});}
});
test('rotation wraps and samples remain finite at save extremes',()=>{
 for(const t of [0,1,Number.MAX_SAFE_INTEGER,Infinity])for(const n of Object.values(sceneryPose(t)).filter(n=>typeof n==='number'))assert(Number.isFinite(n));
 for(const t of [0,754,2094,1508,1e6]){const p=sceneryPose(t);assert(p.gate>=0&&p.gate<Math.PI*2);assert(p.ring>=0&&p.ring<Math.PI*2);}
});
test('actual four top-fixed banner assemblies preserve original parts and keep collision disabled',()=>{
 const k=festivalTestScene();try{const f=buildFair(k.scene,k.shadow),s=createState('fair');f.root.setEnabled(true);f.draw(s,0,true);
 const v=f.inspect().scenery;assert.equal(v.banners.length,4);assert.equal(v.approved,false);
 for(const b of v.banners){assert.deepEqual(b.parts.sort(),['banner-gold-symbol','vertical-banner']);assert.equal(b.anchor[1],2.87);assert.deepEqual(b.rotation,[0,0,0]);const node=k.scene.getTransformNodeByName(b.id);assert(node.getChildMeshes().every(m=>!m.checkCollisions&&!m.isPickable));}
 assert.equal(k.scene.meshes.filter(m=>m.name==='vertical-banner').length,4);
 }finally{k.dispose();}
});
test('full fair presentation freezes at fixed ticks despite different render times; game state is immutable',()=>{
 const k=festivalTestScene();try{const f=buildFair(k.scene,k.shadow),s=createState('fair');f.root.setEnabled(true);s.ticks=120;s.fair.bellHeard=true;const before=structuredClone(s);f.draw(s,1);const a=f.inspect().scenery;
 for(const time of [1,9,1000]){f.draw(s,time);assert.deepEqual(f.inspect().scenery,a);assert.deepEqual(s,before);}
 s.ticks+=10;f.draw(s,1000);assert.notDeepEqual(f.inspect().scenery.banners,a.banners);assert.deepEqual(f.inspect().scenery.banners.map(b=>b.anchor),a.banners.map(b=>b.anchor));
 }finally{k.dispose();}
});
test('save rewind and a replaced state cannot retain a prior animation phase',()=>{
 const k=festivalTestScene();try{const f=buildFair(k.scene,k.shadow),s=createState('fair');f.root.setEnabled(true);s.ticks=90;f.draw(s,0);const initial=f.inspect().scenery;s.ticks=900;f.draw(s,0);const loaded=structuredClone(s);loaded.ticks=90;f.draw(loaded,9000);assert.deepEqual(f.inspect().scenery,initial);
 }finally{k.dispose();}
});
test('reduced media freezes only decorations; story gate and pendant remain visible when required',()=>{
 const k=festivalTestScene();try{const f=buildFair(k.scene,k.shadow),s=createState('fair');f.root.setEnabled(true);s.opening.phase='lost';s.fair.bellHeard=true;s.ticks=101;f.draw(s,1,true);const a=f.inspect().scenery;
 assert(k.scene.getMeshByName('opening-gate').isEnabled());assert(k.scene.getMeshByName('dropped-pendant').isEnabled());assert(a.banners.every(b=>b.rotation.every(n=>n===0)));assert.equal(a.rotations.bell,0);assert.equal(a.rotations.robotY,1.3);assert(a.rotations.ring.every(n=>n===0));
 s.ticks=202;f.draw(s,999,true);assert.deepEqual(f.inspect().scenery.rotations,a.rotations);assert.deepEqual(f.inspect().scenery.banners,a.banners);
 f.draw(s,999,false);assert(f.inspect().scenery.banners.some(b=>b.rotation.some(n=>n!==0)));
 }finally{k.dispose();}
});
test('observations are copies and cannot modify actual banner geometry',()=>{
 const k=festivalTestScene();try{const f=buildFair(k.scene,k.shadow),s=createState('fair');f.draw(s,0);const a=f.inspect().scenery;a.banners[0].anchor[0]=900;assert.notEqual(f.inspect().scenery.banners[0].anchor[0],900);}finally{k.dispose();}
});

test('World is pinned to VQ02B context/density integration; retained methods are separately fingerprinted',()=>{
 const source=actorBaseline(readFileSync('src/render.ts','utf8'));assert.equal(sha(source),'e1e49124a8c47af7580e4a386c9bc43182035dec34b79a875eb90a06fdef7811');
});

test('fair view reads live media preference without caller or global input changes',()=>{
 const original=globalThis.matchMedia,media={matches:false};globalThis.matchMedia=()=>media;
 const k=festivalTestScene();try{const f=buildFair(k.scene,k.shadow),s=createState('fair');s.ticks=100;f.draw(s,0);assert.equal(f.inspect().scenery.reducedMotion,false);media.matches=true;f.draw(s,1);assert.equal(f.inspect().scenery.reducedMotion,true);assert(f.inspect().scenery.banners.every(b=>b.rotation.every(n=>n===0)));}finally{k.dispose();if(original===undefined)delete globalThis.matchMedia;else globalThis.matchMedia=original;}
});
