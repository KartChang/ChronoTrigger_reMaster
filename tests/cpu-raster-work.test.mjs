import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Matrix} from '@babylonjs/core';
import {CpuRaster,World,createState} from '../.test/cpu-entry.mjs';
import {CpuRaster as Previous} from '../.test/ci57-cpu-raster.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
const original=readFileSync('tests/baselines/ci57-cpu-raster.ts');
const surface=()=>({texture:null,opacity:null,textureAlpha:false,opacityFromRGB:false,alpha:1,cutoff:0,blend:false,emission:[0,0,0]});
const vertex=(x,y,z=0,w=1)=>({x,y,z,w,u:x/2+.5,v:y/2+.5,r:.8,g:.5,b:.3,a:1});
let seed=57;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
const texture=()=>({width:8,height:8,rgba:Uint8ClampedArray.from({length:256},()=>random()*255),invertY:true,wrapU:1,wrapV:2,matrix:Array.from(Matrix.Identity().m)});
function compare(primitives,width=53,height=31){
 const current=new CpuRaster(width,height),previous=new Previous(width,height);
 for(const raster of [current,previous]){raster.clear([.1,.2,.3]);for(const p of primitives)raster.triangle(...p);}
 assert.deepEqual(current.rgba,previous.rgba,'exact RGBA');assert.deepEqual(current.depth,previous.depth,'exact Float32 depth');
 for(const key of ['triangles','fragments','submitted','fastAccepted','trivialRejected','clipped','minifiedTriangles','fractionalTriangles'])assert.equal(current[key],previous[key],key);
 assert(Number.isSafeInteger(current.boundingPixels));assert(Number.isSafeInteger(current.candidatePixels));assert(current.candidatePixels>=0&&current.candidatePixels<=current.boundingPixels);return current;
}
test('oracle is the unedited raster from exact CI57 source, not a rebaselined output',()=>{
 assert.equal(createHash('sha1').update(`blob ${original.length}\0`).update(original).digest('hex'),'ff7029702da8567c765acb4c76cc29442125a7d7');
 assert.equal(createHash('sha256').update(original).digest('hex'),'2416fdd24eb0ff00908ccf1d295abdcb02580a6e574804f8b4d67b39c9e0b654');
 assert(!readFileSync('src/cpu-raster.ts','utf8').includes('baselines'));
});
test('packed clear preserves byte order, clamping, rounding, alpha and memory budget',()=>{
 for(const size of [[1,1],[53,31],[640,480]])for(const color of [[],[0,1,.5],[-1,2,.1],[NaN,Infinity,-Infinity],[.5/255,1.5/255,254.5/255]]){
  const a=new CpuRaster(...size),b=new Previous(...size);a.clear(color);b.clear(color);assert.deepEqual(a.rgba,b.rgba);assert.deepEqual(a.depth,b.depth);
  assert.equal(a.rgba.byteLength+a.depth.byteLength,size[0]*size[1]*8);
 }
});
test('conservative spans discard real outside work without discarding fragments',()=>{
 const r=compare([[vertex(-1,-1),vertex(1,1),vertex(.99,1),surface()]],640,480);
 assert(r.boundingPixels>200000);assert(r.candidatePixels<r.boundingPixels/20);assert(r.fragments>0);
});
test('edges, reversed winding, subpixel slivers and translucent ties remain byte exact',()=>{
 for(const n of [0,1e-12,1e-9,1e-7,.0001,.5])for(const winding of [false,true]){
  const p=[vertex(-1,-1),vertex(1,1),vertex(1-n,1)],m={...surface(),blend:true,alpha:.5};if(winding)p.reverse();
  compare([[...p,m],[...p,m]],32,32);
 }
});
test('viewport, clipping and near-eye cases retain the prior raster result',()=>{
 for(const w of [-1,0,1e-12,1e-9,1e-8,.5,1,2])compare([
  [vertex(-2,-2,0,w),vertex(2,-2),vertex(0,2),surface()],
  [vertex(0,0,.9,w),vertex(.5,.5),vertex(-.5,.5),{...surface(),blend:true,alpha:.4}],
 ]);
});
test('nonfinite vertices remain rejected, not successful empty geometry',()=>{
 for(const key of ['x','y','z','w','u','v','r','g','b','a'])for(const n of [NaN,Infinity,-Infinity]){
  const r=compare([[{...vertex(0,0),[key]:n},vertex(.5,.5),vertex(-.5,.5),surface()]]);assert.equal(r.fragments,0);assert.equal(r.trivialRejected,1);
 }
});
test('4000 deterministic textured, opacity, blend and wrap cases preserve every byte',()=>{
 for(let batch=0;batch<16;batch++){
  const primitives=[];
  for(let i=0;i<250;i++){
   const v=()=>({...vertex(random()*4-2,random()*4-2,random()*3-1.5,random()*2+.01),u:random()*6-3,v:random()*6-3,r:random(),g:random(),b:random(),a:random()});
   const m={...surface(),texture:i%2?texture():null,opacity:i%5?null:texture(),textureAlpha:i%3===0,opacityFromRGB:i%7===0,blend:i%4===0,alpha:i%4===0?.5:1,cutoff:i%3===0?.3:0};
   for(const t of [m.texture,m.opacity])if(t){t.wrapU=i%3;t.wrapV=(i+1)%3;t.invertY=i%2===0;}
   primitives.push([v(),v(),v(),m]);
  }compare(primitives);
 }
});
test('texture updates within a frame and vertex reuse have no stale sampler/projection cache',()=>{
 const a=new CpuRaster(32,32),b=new Previous(32,32),t=texture(),m={...surface(),texture:t},v=vertex(-1,-1);
 a.clear([0,0,0]);b.clear([0,0,0]);
 for(let i=0;i<6;i++){t.matrix[8]=i*.1;t.wrapU=i%3;t.invertY=i%2===0;t.rgba[i]=255-i;v.u=i*.2;v.r=i*.1;
  for(const r of [a,b])r.triangle(v,vertex(1,-1),vertex(0,1),m);
 }assert.deepEqual(a.rgba,b.rgba);assert.deepEqual(a.depth,b.depth);
});
test('clear resets new work counters without allocating another pixel buffer',()=>{
 const r=compare([[vertex(-1,-1),vertex(1,1),vertex(0,1),surface()]]),bytes=r.rgba.buffer,depth=r.depth.buffer;
 assert(r.candidatePixels>0);r.clear([0,0,0]);assert.equal(r.boundingPixels,0);assert.equal(r.candidatePixels,0);assert.equal(r.rgba.buffer,bytes);assert.equal(r.depth.buffer,depth);
});
test('all existing scene graphs in two views and both sampling modes match the CI57 raster',()=>{
 const chapters=[...new Set([...readFileSync('src/fair-data.ts','utf8').split('export type Chapter =')[1].split(';')[0].matchAll(/'([a-z0-9]+)'/g),...readFileSync('src/trial-data.ts','utf8').split('export type TrialMap=')[1].split(';')[0].matchAll(/'([a-z0-9]+)'/g)].map(m=>m[1]))];
 const oldWindow=globalThis.window,oldDocument=globalThis.document,p=cpuTestCanvas(96,64),draw=CpuRaster.prototype.triangle;
 const doc={createElement(tag){return tag==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}};},getElementById(){return null;},addEventListener(){},removeEventListener(){}};
 p.canvas.ownerDocument=doc;globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};
 let world,oracle,current;CpuRaster.prototype.triangle=function(...args){draw.apply(this,args);oracle?.triangle(...args);current=this;};
 let cases=0,saved=0;
 try{world=new World(p.canvas);
  for(const [width,height] of [[96,64],[48,80]])for(const enabled of [false,true]){
   p.canvas.clientWidth=width;p.canvas.clientHeight=height;world.resize();world.engine.setOpaqueMinification(enabled);
   for(const chapter of chapters){
    const state=createState(chapter),before=structuredClone(state);oracle=new Previous(p.canvas.width,p.canvas.height);oracle.clear(world.scene.clearColor.asArray());world.draw(state,0,false);
    assert.deepEqual(p.pixels(),oracle.rgba,`${chapter}/${width}/${enabled} RGBA`);assert.deepEqual(current.depth,oracle.depth);
    assert.equal(current.fragments,oracle.fragments);assert.equal(current.minifiedTriangles,oracle.minifiedTriangles);assert.equal(current.fractionalTriangles,oracle.fractionalTriangles);
    assert.deepEqual(state,before);assert(current.candidatePixels<=current.boundingPixels);saved+=current.boundingPixels-current.candidatePixels;cases++;
   }
  }
  assert(saved>0);console.log(JSON.stringify({kind:'constructed pure rendering unit cases, not browser evidence',cases,chapters:chapters.length,views:2,samplingModes:2,exactPixels:true,avoidedCandidates:saved}));
 }finally{CpuRaster.prototype.triangle=draw;world?.engine.dispose();globalThis.window=oldWindow;globalThis.document=oldDocument;}
});
test('CI57 observation retains failed driver-press behavior rather than declaring it repaired',()=>{
 const d=JSON.parse(readFileSync('tests/fixtures/ci57-driver-plateau.json','utf8'));
 assert.equal(d.runId,'35712112661');assert.equal(d.target,-2);assert.equal(d.lastTicks-d.beforeTicks,169);assert(d.lastTicks-d.beforeTicks>d.budget);
 const driver=d.pulses.filter(p=>p.transport==='driver-press');assert.deepEqual(driver.map(p=>p.holdMs),[50,16,17]);
 for(const p of driver){assert(Math.abs(p.afterRelease-d.target)>.12);assert(Math.abs(Math.abs(p.afterRelease-p.before)-4/60*4)<1e-12);assert(p.driverOperations.some(x=>x.method==='press'&&x.status==='completed'));}
});
