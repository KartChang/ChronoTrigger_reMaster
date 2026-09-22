/** Node-only differential microbenchmark. Run npm test first. Never browser,
 * gameplay, device or sustained-FPS acceptance; timings are observations only. */
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {CpuRaster,World,createState} from '../.test/cpu-entry.mjs';
import {CpuRaster as Previous} from '../.test/ci57-cpu-raster.mjs';
import {cpuTestCanvas} from '../tests/cpu-test-canvas.mjs';
const oldWindow=globalThis.window,oldDocument=globalThis.document;
const p=cpuTestCanvas(960,640),doc={createElement(tag){return tag==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}};},getElementById(){return null;},addEventListener(){},removeEventListener(){}};
p.canvas.ownerDocument=doc;globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};
const rows=[],nativeTriangle=CpuRaster.prototype.triangle;let packets=[];
CpuRaster.prototype.triangle=function(...args){packets.push(args);nativeTriangle.apply(this,args);};
const stats=values=>{const sorted=[...values].sort((a,b)=>a-b);return {samples:values.length,meanMs:values.reduce((a,b)=>a+b)/values.length,medianMs:sorted[Math.floor(sorted.length/2)],p95Ms:sorted[Math.ceil(sorted.length*.95)-1],maxMs:sorted.at(-1),rawMs:values};};
let world;
try{
 world=new World(p.canvas);
 for(const [chapter,width,height,smoothing] of [['fair',960,640,false],['fair',960,640,true],['fair',390,844,false],['bedroom',960,640,false],['cathedral',960,640,false]]){
  p.canvas.clientWidth=width;p.canvas.clientHeight=height;world.resize();world.engine.setOpaqueMinification(smoothing);
  const state=createState(chapter);if(chapter==='fair'){state.joined=true;state.players[0].x=.2;state.players[0].z=-1.8666666666666643;state.players[1].x=2.2;state.players[1].z=-1.2;state.ticks=411;}
  const before=structuredClone(state);packets=[];const color=world.scene.clearColor.asArray();world.draw(state,0,false);assert.deepEqual(state,before);
  const inputs=packets;packets=[];const current=new CpuRaster(p.canvas.width,p.canvas.height),previous=new Previous(p.canvas.width,p.canvas.height);
  const render=r=>{r.clear(color);for(const args of inputs)nativeTriangleFor(r).apply(r,args);};
  const nativeTriangleFor=r=>r instanceof Previous?Previous.prototype.triangle:nativeTriangle;
  for(let i=0;i<8;i++){render(previous);render(current);}
  assert.deepEqual(current.rgba,previous.rgba);assert.deepEqual(current.depth,previous.depth);assert.equal(current.fragments,previous.fragments);
  const samples={previous:[],current:[]};
  for(let i=0;i<24;i++)for(const key of i%2?['current','previous']:['previous','current']){const t=performance.now();render(key==='current'?current:previous);samples[key].push(performance.now()-t);}
  const a=stats(samples.previous),b=stats(samples.current);
  rows.push({chapter,viewport:{width,height},buffer:{width:p.canvas.width,height:p.canvas.height},smoothing,triangles:current.submitted,fragments:current.fragments,boundingPixels:current.boundingPixels,candidatePixels:current.candidatePixels,exactRgbaDepth:true,previous:a,current:b,meanReduction:1-b.meanMs/a.meanMs});
 }
 const report={schema:'chrono-vq02p-node-raster-benchmark-v1',kind:'Node-only captured existing scene triangles; constructed states; not browser/native gameplay/device evidence',node:process.version,baselineSource:'9425f58c423897be08fe1ca0d810ec9d6088f7b3',baselineBlob:'ff7029702da8567c765acb4c76cc29442125a7d7',scope:'clear, clipping and raster kernel only; excludes scene traversal, actual browser canvas, event dispatch, rendering cadence and GPU',method:'8 warmups each;24 alternating paired timings each;no timing pass threshold',rows,nativeInputRepairAccepted:false,physicalDeviceApproved:false,artApproved:false};
 if(process.argv[2])writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');else console.log(JSON.stringify(report,null,2));
}finally{CpuRaster.prototype.triangle=nativeTriangle;world?.engine.dispose();globalThis.window=oldWindow;globalThis.document=oldDocument;}
