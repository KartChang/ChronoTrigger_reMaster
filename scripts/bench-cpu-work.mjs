/** Reproducible local CPU microbenchmark, NOT browser/physical FPS evidence.
 * Run npm test first. Uses a labelled rect-only canvas unit port, same scene and
 * exact CI46 shader/raster oracle. No game state writes through a browser hook. */
import {CpuScene,Ci46CpuScene,World,createState} from '../.test/cpu-entry.mjs';
import {cpuTestCanvas} from '../tests/cpu-test-canvas.mjs';
import assert from 'node:assert/strict';
const oldWindow=globalThis.window,oldDocument=globalThis.document;
const p=cpuTestCanvas(640,480),doc={createElement(tag){return tag==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}};},getElementById(){return null;},addEventListener(){},removeEventListener(){}};
p.canvas.ownerDocument=doc;globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};
const percentile=(values,f)=>[...values].sort((a,b)=>a-b)[Math.floor((values.length-1)*f)];
const report={kind:'Node CPU microbenchmark on rect-only canvas unit port; not browser or physical-device evidence',referenceSource:'54d46a47ca23791ee5579eb7cd027ee189711dfb',samplesPerImplementation:15,cases:[]};
let world;
try{
 world=new World(p.canvas);world.setRenderMode('quality');const current=new CpuScene(world.engine),baseline=new Ci46CpuScene(world.engine);
 for(const chapter of ['bedroom','overworld1000','fair']){
  world.draw(createState(chapter),0,false);const samples={baseline:[],current:[]};
  for(let i=0;i<20;i++){
   const order=i%2?[['current',current],['baseline',baseline]]:[['baseline',baseline],['current',current]];let first;
   for(const [name,renderer] of order){const start=performance.now();renderer.draw(world.scene);const elapsed=performance.now()-start;if(i>=5)samples[name].push(elapsed);if(!first)first=p.pixels().slice();else assert.deepEqual(p.pixels(),first,'same-scene pixel parity');}
  }
  report.cases.push({chapter,width:world.engine.getRenderWidth(),height:world.engine.getRenderHeight(),rgbaExact:true,baselineMedianMs:percentile(samples.baseline,.5),currentMedianMs:percentile(samples.current,.5),baselineP95Ms:percentile(samples.baseline,.95),currentP95Ms:percentile(samples.current,.95),work:current.inspect().work,samples});
 }
}finally{world?.engine.dispose();globalThis.window=oldWindow;globalThis.document=oldDocument;}
console.log(JSON.stringify(report,null,2));
