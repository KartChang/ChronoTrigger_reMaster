import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {World,createState} from '../.test/town-camera-baseline-cpu-entry.mjs';
import {World as VWorld} from '../.test/sign-baseline-cpu-entry.mjs';
import {assertTownDetails} from '../scripts/village-detail-evidence.mjs';
import {assertTownDetails as assertVDetails} from '../.test/sign-baseline-village-detail-evidence.mjs';
import {signBaseline} from './helpers/sign-baseline.mjs';
import {townCameraIfDeclared} from './helpers/town-camera-baseline.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {townDetailFixture} from './helpers/village-detail-fixture.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const recorded=JSON.parse(readFileSync('tests/fixtures/ci64-recorded-sign-failure.json'));
const spec=JSON.parse(readFileSync('tests/baselines/vq02w-declared-sign-edits.json'));
for(const [name,edits] of Object.entries(spec.files))test('W explicit exact V inverse: '+name,()=>{
 const actual=townCameraIfDeclared(name,readFileSync(name,'utf8'));assert.equal(hash(signBaseline(name,actual,false)),spec.originalSha256[name]);
 assert.throws(()=>signBaseline(name,actual+edits.at(-1).after,false));
 assert.throws(()=>signBaseline(name,actual.replace(edits.at(-1).after,''),false));
 assert.notEqual(hash(signBaseline(name,actual+'\n// unrelated change\n',false)),spec.originalSha256[name]);
});
test('W retains original 40x20 rejection from the untouched CI64 component',()=>{
 const before=JSON.stringify(recorded);assert.equal(recorded.sourceSha,'3cf048e5debba3a679385112c21f45c55c5d0e19');
 assert.equal(recorded.runId,'35847433193');
 for(const [i,v] of recorded.views.entries()){
  if(i===1){assert.throws(()=>assertVDetails(v.details,v.renderer),/readable sign rectangle/);assert.deepEqual(v.renderer,{width:249,height:540,level:1,mode:'auto'});}
  else assert(assertVDetails(v.details,v.renderer));
 }
 assert.equal(JSON.stringify(recorded),before);
});
test('W rejects tiny rectangles and returns the actual values without repairing the report',()=>{
 const v=townDetailFixture();v.sign.projection.rect.width=34;v.sign.projection.rect.height=17;const before=JSON.stringify(v);
 let error;try{assertTownDetails(v,{width:312,height:675});}catch(e){error=e;}
 assert.match(error.message,/readable sign rectangle/);assert.deepEqual(error.observation.required,{width:40,height:20});
 assert.equal(error.observation.projection.rect.width,34);error.observation.projection.rect.width=400;
 assert.equal(JSON.stringify(v),before);assert.throws(()=>assertTownDetails(v,{width:312,height:675}));
});
function pair(width,height,dpr=1){
 const ow=globalThis.window,od=globalThis.document;
 const doc={createElement:tag=>tag==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.document=doc;globalThis.window={devicePixelRatio:dpr,addEventListener(){},removeEventListener(){},navigator:{}};
 const a=cpuTestCanvas(width,height),b=cpuTestCanvas(width,height);a.canvas.ownerDocument=b.canvas.ownerDocument=doc;
 const current=new World(a.canvas),previous=new VWorld(b.canvas);
 return {a,b,current,previous,close(){current.engine.dispose();previous.engine.dispose();globalThis.window=ow;globalThis.document=od;}};
}
const normalized=m=>({name:m.name,position:m.position.asArray(),scaling:m.name==='inn-sign'?[1,1,1]:m.scaling.asArray(),rotation:m.rotation.asArray(),vertices:m.getTotalVertices(),indices:m.getTotalIndices(),billboard:m.billboardMode});
for(const dpr of [1,2])for(const [width,height] of [[960,640],[390,844],[844,390]])test(`W offline real policy tiers and modes at ${width}x${height}, DPR${dpr} (not device evidence)`,()=>{
 const k=pair(width,height,dpr),s=createState('truce');
 // Offline camera reconstruction of the recorded entry, not a game journey.
 s.joined=recorded.offlineCameraInput.joined;recorded.offlineCameraInput.players.forEach((p,i)=>Object.assign(s.players[i],p));
 const before=structuredClone(s);
 try{
  const inspect=(mode,level)=>{
   k.current.draw(s,0,false);k.previous.draw(structuredClone(s),0,false);
   const now=k.current.inspect().storyNpcs.kingdom.village.details,old=k.previous.inspect().storyNpcs.kingdom.village.details;
   const a=k.current.inspectRenderer(),b=k.previous.inspectRenderer();assert.equal(a.mode,mode);assert.equal(a.level,level);
   assert.deepEqual([a.width,a.height,a.scaling],[b.width,b.height,b.scaling]);assert(a.width*a.height<=307200);
   assertTownDetails(now,a);console.log(JSON.stringify({kind:'offline-policy-projection-not-native',viewport:{width,height},dpr,mode,level,canvas:{width:a.width,height:a.height},rect:now.sign.projection.rect,inside:now.sign.projection.inside}));assert.deepEqual(now.sign.scaling,[2.75,2.75,1]);assert.deepEqual(old.sign.scaling,[1.6,1.6,1]);
   assert.deepEqual(now.windows,old.windows);assert.deepEqual(now.sign.position,old.sign.position);
   const r=now.sign.projection.rect,p=old.sign.projection.rect;
   assert(Math.abs(r.width/p.width-2.75/1.6)<1e-5);assert(Math.abs(r.height/p.height-2.75/1.6)<1e-5);
   assert(Math.abs(r.x+r.width/2-(p.x+p.width/2))<1e-5);assert(Math.abs(r.y+r.height/2-(p.y+p.height/2))<1e-5);
   assert.deepEqual(s,before);assert.deepEqual(k.current.scene.meshes.filter(m=>m.isEnabled()).map(normalized),k.previous.scene.meshes.filter(m=>m.isEnabled()).map(normalized));
   assert.equal(k.current.scene.textures.length,k.previous.scene.textures.length);
   if(dpr===1&&mode==='auto'&&level===1){
    const observed=recorded.views.find(v=>v.viewport.width===width);assert.equal(b.width,observed.renderer.width);assert.equal(b.height,observed.renderer.height);
    for(const f of ['x','y','width','height'])assert(Math.abs(p[f]-observed.details.sign.projection.rect[f])<1e-4,`recorded V ${f}`);
   }
  };
  inspect('auto',0);
  // Unit-only telemetry feeds the production policy, not private level writes.
  // Native reports never consume these samples; paused native state stays frozen.
  for(let level=1;level<=3;level++){
   for(let i=0;i<120;i++){k.current.observeRenderFrame(80,true);k.previous.observeRenderFrame(80,true);}
   inspect('auto',level);
  }
  for(const mode of ['quality','compatibility','auto']){k.current.setRenderMode(mode);k.previous.setRenderMode(mode);inspect(mode,0);}
  const a=k.current.inspectRenderer();for(let i=0;i<360;i++)k.current.observeRenderFrame(80,false);
  assert.deepEqual([k.current.inspectRenderer().level,k.a.canvas.width,k.a.canvas.height],[0,a.width,a.height]);
 }finally{k.close();}
});
test('W only the existing sign scale changes across ten scenes, no resource growth on six return cycles',()=>{
 const k=pair(192,128);try{
  for(const chapter of ['truce','forest','castle','chamber','fair','bedroom','downstairs','overworld','cathedral','future']){
   const s=createState(chapter),before=structuredClone(s);k.current.draw(s,0,false);k.previous.draw(structuredClone(s),0,false);assert.deepEqual(s,before);
   assert.deepEqual(k.current.scene.meshes.filter(m=>m.isEnabled()).map(normalized),k.previous.scene.meshes.filter(m=>m.isEnabled()).map(normalized));
   if(chapter!=='truce'){assert.deepEqual(k.a.pixels(),k.b.pixels());assert.equal(k.current.inspect().storyNpcs.kingdom.village,null);}
   else{const a=k.current.inspect().storyNpcs.kingdom.village,b=k.previous.inspect().storyNpcs.kingdom.village;assert.deepEqual({...a,details:null},{...b,details:null});assert.deepEqual(a.details.windows,b.details.windows);}
   assert.equal(k.current.scene.textures.length,k.previous.scene.textures.length);
  }
  const meshes=k.current.scene.meshes.length,textures=k.current.scene.textures.length;
  for(let i=0;i<6;i++)for(const chapter of ['truce','forest','castle']){
   const s=createState(chapter);k.current.draw(s,0,false);const first=k.a.pixels().slice();k.current.draw(s,0,false);assert.deepEqual(first,k.a.pixels());
   assert.equal(k.current.scene.meshes.length,meshes);assert.equal(k.current.scene.textures.length,textures);
  }
 }finally{k.close();}
});
test('W inverse cannot exempt game rules, timing, camera, held home, sampling quality or original artwork',()=>{
 for(const p of ['src/main.ts','src/render.ts','src/core.ts','src/prologue-render.ts','src/kingdom-render.ts','src/input.ts','src/cpu-engine.ts','src/render-capability.ts','src/village-art.ts','.github/workflows/ci.yml'])assert.throws(()=>signBaseline(p,'changed'));
 const b=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${b.length}\0`),b])).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');
});
