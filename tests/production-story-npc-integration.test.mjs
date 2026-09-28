/** E owned texture and actual application tests. OFFLINE, not native/device evidence. */
import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {readFileSync} from 'node:fs';
import {DynamicTexture,MeshBuilder,StandardMaterial,TransformNode,Texture} from '@babylonjs/core';
import {World,createState} from '../.test/cpu-entry.mjs';import {ArtDirectedWorld as Current} from '../.test/art-directed-world.mjs';import {ArtDirectedWorld as Prior} from '../.test/art-directed-world-d.mjs';
import {installProductionStoryNpcs,STORY_NPC_BINDING_LIMIT} from '../.test/production-story-npc-finish.mjs';import {legacyStoryNpcCell,storyNpcProductionCell} from '../.test/production-story-npc-art.mjs';import {productionWorldRig} from './helpers/production-world-rig.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const roles=[['townsperson','kingdom-truce','truce','resident'],['innkeeper','kingdom-truce','truce','innkeeper'],['king','kingdom-castle','castle','king'],['guard','kingdom-castle','castle','guard'],['disguised-nun','cathedral-set','cathedral','nun'],['false-chancellor','sanctum-set','sanctum','chancellor'],['true-chancellor','sanctum-set','sanctum','chancellor'],['queen-leene','sanctum-set','sanctum','queen']];
const bytes=t=>new Uint8ClampedArray(t.getContext().getImageData(0,0,48,64).data);
function write(t,data){const c=t.getContext(),im=c.createImageData(48,64);im.data.set(data);c.putImageData(im,0,0);}
function setup(row=roles[0],size={width:48,height:64}){
 const r=productionWorldRig(World),scene=r.world.engine.scenes[0];for(const m of scene.meshes)m.setEnabled(false);
 const root=new TransformNode(row[1],scene),mesh=MeshBuilder.CreatePlane(row[0],{},scene),mat=new StandardMaterial('E-owned-material',scene),t=new DynamicTexture('E-owned-texture',size,scene,false,Texture.NEAREST_SAMPLINGMODE);mesh.parent=root;mesh.material=mat;mat.diffuseTexture=t;
 let uploads=0,calledArgs,calledThis,throwNext=false;const sentinel={owned:true},original=t.update;
 t.update=function(...args){uploads++;calledArgs=args;calledThis=this;if(throwNext){throwNext=false;throw sentinel;}original.apply(this,args);return sentinel;};const originalUpload=t.update;
 const pass=installProductionStoryNpcs(scene),notify=()=>scene.onBeforeRenderObservable.notifyObservers(scene);
 const paint=f=>{write(t,legacyStoryNpcCell(row[3],f));return t.update(false,false);};
 return {...r,scene,root,mesh,mat,t,pass,notify,paint,read:()=>bytes(t),count:()=>uploads,args:()=>calledArgs,context:()=>calledThis,throwNext:()=>{throwNext=true;},sentinel,originalUpload,row};
}
for(const row of roles)test('E '+row[0]+' matches all four legacy frames and uploads true redrawn pixels once with original call parameters',()=>{
 const r=setup(row);try{r.paint(0);r.pass.begin(row[2]);r.notify();for(let f=0;f<4;f++){const before=r.count();assert.equal(r.paint(f),r.sentinel);assert.equal(r.count(),before+1);assert.deepEqual(r.args(),[false,false]);assert.equal(r.context(),r.t);assert.deepEqual(r.read(),storyNpcProductionCell(row[3],f));assert.equal(r.pass.inspect().actors[0].frame,f);assert.equal(r.pass.inspect().actors[0].styled,true);}
  const count=r.count(),pixels=r.read();for(let i=0;i<6;i++){r.pass.begin(row[2]);r.notify();}assert.equal(r.count(),count);assert.deepEqual(r.read(),pixels);assert.equal(r.t.update(true,false),r.sentinel);assert.deepEqual(r.args(),[true,false]);r.throwNext();assert.throws(()=>r.t.update(false,true),e=>e===r.sentinel);assert.deepEqual(r.args(),[false,true]);assert.deepEqual(r.read(),pixels);
  assert.equal(r.pass.inspect().additionalGpuTextures,0);assert.equal(r.pass.inspect().retainedCpuBytes,24576);
 }finally{r.close();}
});
test('E unknown or forged source cells fail closed, do not retry on static draws, then recover on a real source upload',()=>{
 const r=setup();try{r.paint(0);r.pass.begin('truce');r.notify();const raw=legacyStoryNpcCell('resident',1);raw[2000]^=1;write(r.t,raw);r.t.update(false,false);assert.deepEqual(r.read(),raw);assert.equal(r.pass.inspect().actors[0].styled,false);const before=r.count(),comparisons=r.pass.inspect().sourceComparisons;
  for(let i=0;i<12;i++){r.pass.begin('truce');r.notify();}assert.equal(r.count(),before);assert.equal(r.pass.inspect().sourceComparisons,comparisons);r.pass.begin('bedroom');assert.deepEqual(r.read(),raw);r.pass.begin('truce');r.notify();assert.deepEqual(r.read(),raw);r.paint(2);assert.deepEqual(r.read(),storyNpcProductionCell('resident',2));
  // Another role's valid pixels must not authorize repainting this role.
  const other=legacyStoryNpcCell('guard',0);write(r.t,other);r.t.update();assert.deepEqual(r.read(),other);
 }finally{r.close();}
});
for(const row of [['mother','kingdom-truce','truce','resident'],['townsperson','held-home','truce','resident'],['__proto__','kingdom-truce','truce','resident']])test('E rejects non-allowlisted name/root '+row[0]+'/'+row[1],()=>{
 const r=setup(row);try{r.paint(0);r.pass.begin(row[2]);r.notify();assert.equal(r.t.update,r.originalUpload);assert.equal(r.pass.inspect().bindings,0);assert.deepEqual(r.read(),legacyStoryNpcCell(row[3],0));}finally{r.close();}
});
test('E rejects wrong chapter, non-native texture size, invisible actors and shared texture ownership',()=>{
 const r=setup();try{r.paint(0);r.pass.begin('home');r.notify();assert.equal(r.pass.inspect().bindings,0);r.pass.begin('truce');r.mesh.isVisible=false;r.notify();assert.equal(r.pass.inspect().bindings,0);r.mesh.isVisible=true;r.mesh.visibility=0;r.notify();assert.equal(r.pass.inspect().bindings,0);r.mesh.visibility=1;
  const other=MeshBuilder.CreatePlane('held-resident',{},r.scene);other.material=new StandardMaterial('other',r.scene);other.material.diffuseTexture=r.t;r.notify();assert.equal(r.pass.inspect().bindings,0);other.dispose();r.notify();assert.equal(r.pass.inspect().bindings,1);
 }finally{r.close();}
 const wrong=setup(roles[0],{width:32,height:32});try{wrong.pass.begin('truce');wrong.notify();assert.equal(wrong.pass.inspect().bindings,0);assert.equal(wrong.t.update,wrong.originalUpload);}finally{wrong.close();}
});
for(const change of ['name','parent','shared','material','resize'])test('E detaches on changed '+change+' without contaminating a held/new owner',()=>{
 const r=setup();try{r.paint(0);r.pass.begin('truce');r.notify();assert.equal(r.pass.inspect().bindings,1);
  if(change==='name')r.mesh.name='mother';else if(change==='parent')r.mesh.parent=new TransformNode('held-home',r.scene);else if(change==='shared'){const m=MeshBuilder.CreatePlane('mother',{},r.scene);m.material=new StandardMaterial('held-material',r.scene);m.material.diffuseTexture=r.t;}else if(change==='material')r.mesh.material=new StandardMaterial('replacement',r.scene);else r.t.scaleTo(32,32);
  r.notify();assert.equal(r.pass.inspect().bindings,0);assert.equal(r.t.update,r.originalUpload);if(change!=='resize')assert.deepEqual(r.read(),legacyStoryNpcCell('resident',0));
  assert.equal(r.pass.inspect().retainedCpuBytes,0);
 }finally{r.close();}
});
test('E rebinds a replacement private texture and cleans old disposal observers/references',()=>{
 const r=setup();try{r.paint(0);r.pass.begin('truce');r.notify();let previous=r.t;
  const liveObservers=o=>o.observers.filter(x=>!x._willBeUnregistered).length;
  for(let i=0;i<16;i++){const t=new DynamicTexture('replacement-'+i,{width:48,height:64},r.scene,false);write(t,legacyStoryNpcCell('resident',i%4));t.update();r.mat.diffuseTexture=t;r.notify();assert.equal(r.pass.inspect().bindings,1);assert.equal(r.pass.inspect().retainedCpuBytes,24576);assert.equal(liveObservers(previous.onDisposeObservable),0);assert.equal(liveObservers(r.mesh.onDisposeObservable),1);assert.deepEqual(bytes(t),storyNpcProductionCell('resident',i%4));previous.dispose();assert.equal(r.pass.inspect().bindings,1);previous=t;}
  r.mesh.dispose();assert.equal(r.pass.inspect().bindings,0);assert.equal(r.pass.inspect().retainedCpuBytes,0);assert.deepEqual(bytes(previous),legacyStoryNpcCell('resident',3));
 }finally{r.close();}
});
test('E held chapter roundtrip restores actual raw pixels, and disposal preserves later upload ownership',()=>{
 const r=setup();try{r.paint(3);r.pass.begin('truce');r.notify();r.pass.begin('home');assert.deepEqual(r.read(),legacyStoryNpcCell('resident',3));assert.equal(r.pass.inspect().actors[0].styled,false);r.pass.begin('truce');r.notify();assert.deepEqual(r.read(),storyNpcProductionCell('resident',3));
  const later=function(){return 'later';};r.t.update=later;r.world.engine.dispose();assert.equal(r.t.update,later);assert.equal(r.pass.inspect().bindings,0);assert.equal(r.pass.inspect().retainedCpuBytes,0);assert.equal(r.pass.inspect().disposed,true);assert.throws(()=>installProductionStoryNpcs(r.scene));
 }finally{r.close();}
});
test('E binding cap bounds retained CPU cells and introduces no additional GPU texture',()=>{
 const r=setup();try{r.paint(0);for(let i=0;i<20;i++){const m=MeshBuilder.CreatePlane('townsperson',{},r.scene);m.parent=r.root;m.material=new StandardMaterial('extra-'+i,r.scene);const t=new DynamicTexture('extra-'+i,{width:48,height:64},r.scene,false);m.material.diffuseTexture=t;write(t,legacyStoryNpcCell('resident',i%4));t.update();}const textures=r.scene.textures.length;r.pass.begin('truce');r.notify();assert.equal(r.pass.inspect().bindings,STORY_NPC_BINDING_LIMIT);assert.equal(r.pass.inspect().retainedCpuBytes,STORY_NPC_BINDING_LIMIT*24576);assert.equal(r.scene.textures.length,textures);r.world.engine.dispose();assert.equal(r.pass.inspect().bindings,0);assert.equal(r.pass.inspect().retainedCpuBytes,0);
 }finally{r.close();}
});
const canyon=JSON.parse(readFileSync('tests/fixtures/ci82-canyon-state.json')).state;
// Explicit OFFLINE scene fixture: the bare createState factory does not enter the rescue quest.
// No browser/native state, save, clock or collision is injected or rewritten.
const state=ch=>{const s=ch==='canyon'?structuredClone(canyon):createState(ch);if(ch==='cathedral')s.rescue.stage='entered';return s;};
function observe(Type,ch){const r=productionWorldRig(Type,240,160);try{const s=state(ch),before=structuredClone(s);r.world.draw(s,0,false,[]);assert.deepEqual(s,before);const scene=r.world.engine.scenes[0],view=r.world.inspect(),meshes=scene.meshes.map(m=>({name:m.name,p:m.position.asArray(),s:m.scaling.asArray(),r:m.rotation.asArray(),enabled:m.isEnabled(),visible:m.isVisible})),cam=scene.activeCamera;return {pixels:sha(r.canvas.pixels()),view,meshes,camera:[cam.position.asArray(),cam.orthoLeft,cam.orthoRight,cam.orthoTop,cam.orthoBottom],textures:scene.textures.length};}finally{r.close();}}
for(const ch of ['truce','castle','cathedral','sanctum'])test('E actual '+ch+' application changes story NPC pixels, not state, motion, camera, geometry or texture count',()=>{
 const d=observe(Prior,ch),e=observe(Current,ch);assert.notEqual(e.pixels,d.pixels);assert.deepEqual(e.meshes,d.meshes);assert.deepEqual(e.camera,d.camera);assert.equal(e.textures,d.textures);for(const k of ['partyCombat','fieldEnemyMotion','fieldEnemyBody','combatTiming','actorPlayback','poses','guest','trialMaps','kingdomNpcs'])assert.deepEqual(e.view[k],d.view[k],k);assert(e.view.productionArt.storyNpcs.redrawnUploads>0);assert.equal(e.view.productionArt.storyNpcs.directionalMovementEnabled,false);assert.equal(e.view.renderer.cpu.unsupportedResources,0);assert(e.view.renderer.cpu.textureMemory.bytes<33554432);
});
for(const ch of ['bedroom','home','downstairs','canyon','courtroom','fair','forest','overworld1000','cellblock','hall1000','guardia1000','futuregate'])test('E non-target/held '+ch+' remains D-identical in actual application framebuffer',()=>{assert.equal(observe(Current,ch).pixels,observe(Prior,ch).pixels);});
test('E actual application map re-entry and held home leave state/timing unchanged and resources bounded',()=>{
 const r=productionWorldRig(Current,240,160);try{const sequence=['truce','castle','cathedral','sanctum','bedroom','home','downstairs'];const states=sequence.map(state),before=structuredClone(states);for(const s of states)r.world.draw(s,0,false,[]);const scene=r.world.engine.scenes[0],counts=[scene.meshes.length,scene.textures.length];for(let round=0;round<3;round++)for(const s of states)r.world.draw(s,0,false,[]);assert.deepEqual(states,before);assert.deepEqual([scene.meshes.length,scene.textures.length],counts);assert.equal(sha(r.canvas.pixels()),observe(Prior,'downstairs').pixels);assert(r.world.inspectProductionArt().storyNpcs.actors.every(a=>!a.styled));assert(r.world.inspectProductionArt().storyNpcs.bindings<=STORY_NPC_BINDING_LIMIT);
 }finally{r.close();}
});
