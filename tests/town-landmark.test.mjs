import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {TownLandmark,TOWN_LANDMARK} from '../.test/town-landmark.mjs';
import {World,createState} from '../.test/cpu-entry.mjs';
import {World as OldWorld} from '../.test/landmark-baseline-cpu-entry.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {landmarkBaseline} from './helpers/landmark-baseline.mjs';
import {assertTownLandmarkRoute} from '../scripts/town-landmark-evidence.mjs';
const original=JSON.parse(readFileSync('tests/fixtures/ci69-town-landmark-regression.json'));
const spec=JSON.parse(readFileSync('tests/baselines/vq03b-declared-landmark-edits.json'));
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const [path,edits] of Object.entries(spec.files))test('B preserves exact A source contract: '+path,()=>{
 const s=readFileSync(path,'utf8');assert.equal(hash(landmarkBaseline(path,s)),spec.originalSha256[path]);
 for(const e of edits){assert.throws(()=>landmarkBaseline(path,s+e.after));assert.throws(()=>landmarkBaseline(path,s.replace(e.after,'')));}
 assert.notEqual(hash(landmarkBaseline(path,s+'\n// other drift\n')),spec.originalSha256[path]);
});
const base={x:0,z:0,half:20},actor=(id,x,z=0)=>({id,x,z,halfWidth:.7,height:1.85,groundY:.14});
test('B geometric hysteresis retains nearby context without a party-cropping zoom cap',()=>{
 const l=new TownLandmark(),party=[actor('p0',0)],inn=x=>actor('inn-sign',x);
 assert(l.select('truce',.46,base,[...party,inn(0)]));
 // Locate costs straddling the two policy thresholds using independent spans.
 const atCost=c=>c*7.2*2*.46*.91-1.56;
 assert(l.select('truce',.46,base,[...party,inn(atCost(1.55))]));
 assert.equal(l.select('truce',.46,base,[...party,inn(atCost(1.61))]),false);
 assert.equal(l.select('truce',.46,base,[...party,inn(atCost(1.55))]),false);
 assert(l.select('truce',.46,base,[...party,inn(atCost(1.49))]));
 const a=l.inspect();a.candidates[0].x=100;assert.equal(l.inspect().candidates[0].x,0);
 for(const ratio of [0,-1,Infinity,NaN,1.5]){assert.equal(l.select('truce',ratio,base,party),false);assert.equal(l.inspect().active,false);}
 assert.equal(l.select('forest',.46,base,party),false);assert.equal(l.select('truce',.46,base,[actor('p1',0)]),false);
 const far=[actor('p0',-20),actor('p1',20),actor('guest',0)];l.select('truce',.46,base,far);assert(l.inspect().partyHalf>20);assert.equal(TOWN_LANDMARK.approved,false);
});
function rig(width=390,height=844,dpr=1){
 const ow=globalThis.window,od=globalThis.document;const doc={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.document=doc;globalThis.window={devicePixelRatio:dpr,addEventListener(){},removeEventListener(){},navigator:{}};
 const a=cpuTestCanvas(width,height),b=cpuTestCanvas(width,height);a.canvas.ownerDocument=b.canvas.ownerDocument=doc;
 const current=new World(a.canvas),old=new OldWorld(b.canvas);
 return{a,b,current,old,close(){current.engine.dispose();old.engine.dispose();globalThis.window=ow;globalThis.document=od;}};
}
const geometry=m=>({name:m.name,position:m.position.asArray(),scale:m.scaling.asArray(),rotation:m.rotation.asArray(),vertices:m.getTotalVertices(),indices:m.getTotalIndices(),material:m.material?.name});
const safe=c=>{for(const a of c.rects)assert(a.left>=.045-1e-5&&a.right<=.955+1e-5&&a.top>=.12-1e-5&&a.bottom<=.80+1e-5);};
for(const dpr of [1,2])test('B four real CI69 stop states are offline-only regressions, DPR '+dpr,()=>{
 const k=rig(390,844,dpr),stops=[];try{
  for(const v of original.stops){const s=structuredClone(v.state),frozen=structuredClone(s);k.current.draw(s,0,false);k.old.draw(structuredClone(s),0,false);
   const c=k.current.inspect().earlyComfort,o=k.old.inspect().earlyComfort,renderer=k.current.inspectRenderer();safe(c);
   assert.deepEqual(s,frozen);assert.deepEqual(k.current.scene.meshes.map(geometry),k.old.scene.meshes.map(geometry));
   stops.push({state:s,camera:c,renderer});
   if(v.name==='exit'){assert.equal(c.landmark.retained,false);assert(c.camera.half<o.camera.half*.6);assert.equal(c.rects.length,1);assert((c.rects[0].bottom-c.rects[0].top)*renderer.height>=30);}
   else{assert(c.landmark.retained);assert.deepEqual(k.a.pixels(),k.b.pixels());assert.deepEqual(c.camera,o.camera);}
   const n=[k.current.scene.meshes.length,k.current.scene.materials.length,k.current.scene.textures.length];const image=k.a.pixels().slice();
   for(let i=0;i<3;i++){k.current.draw(s,0,false);assert.deepEqual(k.a.pixels(),image);assert.deepEqual(s,frozen);}
   assert.deepEqual([k.current.scene.meshes.length,k.current.scene.materials.length,k.current.scene.textures.length],n);
  }
  assert(assertTownLandmarkRoute({stops}));
  for(const mutate of [s=>s[3].camera.landmark.retained=true,s=>s[3].camera.rects=[],s=>s[3].camera.landmark.partyHalf=100,s=>s[3].camera.landmark.candidates.pop(),s=>s[3].camera.camera.half=30,s=>s[3].camera.landmark.limit=2]){const broken=structuredClone(stops);mutate(broken);assert.throws(()=>assertTownLandmarkRoute({stops:broken}));}
 }finally{k.close();}
});
test('B actual separated P2 and third member remain inside the unchanged HUD bounds',()=>{
 const k=rig(156,338);try{const s=createState('truce');s.kingdom.phase='rescue';s.rescue.stage='allied';s.joined=true;
  Object.assign(s.players[0],{x:-15,z:-5});Object.assign(s.players[1],{x:15,z:6});Object.assign(s.rescue.guest,{x:0,z:0});
  const frozen=structuredClone(s);k.current.draw(s,0,false);const c=k.current.inspect().earlyComfort;assert(c.rects.some(a=>a.id==='p1'));assert(c.rects.some(a=>a.id==='guest'));safe(c);assert(c.camera.half>20);assert.deepEqual(s,frozen);
 }finally{k.close();}
});
test('B other chapters and Truce landscape keep exact A pixels, geometry and resource counts',()=>{
 for(const portrait of [false,true]){const k=rig(portrait?156:180,portrait?338:120);try{
  for(const chapter of ['forest','castle','chamber','fair','bedroom','downstairs','overworld','cathedral','future',...(!portrait?['truce']:[])]){
   const s=createState(chapter);k.current.draw(s,0,false);k.old.draw(structuredClone(s),0,false);assert.deepEqual(k.a.pixels(),k.b.pixels(),chapter);assert.deepEqual(k.current.scene.meshes.map(geometry),k.old.scene.meshes.map(geometry));
  }
  for(const c of ['forest','truce','castle'])k.current.draw(createState(c),0,false);const n=[k.current.scene.meshes.length,k.current.scene.materials.length,k.current.scene.textures.length];
  for(let i=0;i<6;i++)for(const c of ['forest','truce','castle']){k.current.draw(createState(c),0,false);assert.deepEqual([k.current.scene.meshes.length,k.current.scene.materials.length,k.current.scene.textures.length],n);}
 }finally{k.close();}}
});
test('B reduced motion, frozen resize and native-profile restore do not change state or actor scale',()=>{
 const k=rig(960,640),s=structuredClone(original.stops[3].state);try{const frozen=structuredClone(s);k.current.draw(s,0,false);const before=k.current.inspect().earlyComfort.camera;
 for(const [width,height]of [[390,844],[844,390],[960,640]]){k.a.canvas.clientWidth=width;k.a.canvas.clientHeight=height;k.current.resize();k.current.draw(s,0,false);assert.deepEqual(s,frozen);}
 assert.deepEqual(k.current.inspect().earlyComfort.camera,before);
 k.current.reducedMotion={matches:true};k.a.canvas.clientWidth=390;k.a.canvas.clientHeight=844;k.current.resize();k.current.draw(s,0,false);assert.equal(k.current.inspect().earlyComfort.camera.half,7.2);
 }finally{k.close();}
});
test('B metadata is current and forbidden game/held source cannot be inverted',()=>{
 assert.match(readFileSync('scripts/build.mjs','utf8'),/version:'0\.9\.49',batch:'VQ03B'/);
 for(const p of ['src/core.ts','src/main.ts','src/prologue-render.ts','src/input.ts','src/cpu-raster.ts','.github/workflows/ci.yml'])assert.throws(()=>landmarkBaseline(p,'modified'));
});
