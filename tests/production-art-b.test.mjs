/** FROZEN B application/CPU integration; current C has its own actual-app tests. Offline fixtures are not native evidence. */
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {ArtDirectedWorld as Current} from '../.test/art-directed-world-b.mjs';
import {ArtDirectedWorld as Prior} from '../.test/art-directed-world-a.mjs';
import {World,createState} from '../.test/cpu-entry.mjs';
import {productionWorldRig} from './helpers/production-world-rig.mjs';
import {paintProductionForestFloor} from '../.test/production-art.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
const canyon=JSON.parse(readFileSync('tests/fixtures/ci82-canyon-state.json')).state;
const states=JSON.parse(readFileSync('tests/fixtures/ci78-scenery-states.json')).states;
const matrix=scene=>scene.meshes.filter(m=>!m.name.startsWith('production-')).map(m=>({name:m.name,pos:m.position.asArray(),scale:m.scaling.asArray(),rotation:m.rotation.asArray(),enabled:m.isEnabled()}));
function observe(Type,state,w=300,h=200){const r=productionWorldRig(Type,w,h);try{const s=structuredClone(state),before=structuredClone(s);r.world.draw(s,0,false);assert.deepEqual(s,before);const view=r.world.inspect();return {image:sha(r.canvas.pixels()),view,matrix:matrix(r.world.engine.scenes[0]),actors:r.world.engine.scenes[0].meshes.filter(m=>/^(player-|guest-companion|enemy-)/.test(m.name)).map(m=>({name:m.name,data:m.material?.diffuseTexture?.getContext?sha(m.material.diffuseTexture.getContext().getImageData(0,0,m.material.diffuseTexture.getSize().width,m.material.diffuseTexture.getSize().height).data):null}))};}finally{r.close();}}
for(const [name,state]of [['canyon',canyon],['courtroom',states.courtroom],['forest',states['forest-gate']]])test('B '+name+' changes actual production pixels without modifying existing actors, geometry or state',()=>{
 const a=observe(Prior,state),b=observe(Current,state);assert.notEqual(a.image,b.image);assert.deepEqual(a.matrix,b.matrix);assert.deepEqual(a.actors,b.actors,'party/enemy actual source cells stay original');
 for(const key of ['partyCombat','fieldEnemyMotion','fieldEnemyBody','combatTiming','actorPlayback','poses','guest'])assert.deepEqual(a.view[key],b.view[key],key);
 assert.equal(b.view.productionArt.approved,false);assert.equal(b.view.renderer.cpu.unsupportedResources,0);assert(b.view.renderer.cpu.textureMemory.bytes<33554432);assert(b.view.renderer.cpu.textureMemory.entries<512);
});
for(const [w,h]of [[1200,800],[1280,720],[600,400],[320,480],[400,800]])test('court composition retains original .065 top-safe window at '+w+'x'+h,()=>{
 const r=productionWorldRig(Current,w,h);try{r.world.draw(structuredClone(states.courtroom),0,false);const v=r.world.inspect().trialMaps,b=v.windowBounds,c=r.world.engine.scenes[0].activeCamera;
 assert(b&&b.top>=.065&&b.left>=0&&b.right<=1&&b.bottom<=1,JSON.stringify(b));assert(v.npcTextures.length>=10);assert(v.npcTextures.every(t=>t.width===48&&t.height===64));assert(c.orthoLeft<=-9&&c.orthoRight>=9);
 }finally{r.close();}
});
test('same offline court fixture reproduces A framing failure and B clears it without a new wait or input',()=>{
 const a=observe(Prior,states.courtroom,600,400),b=observe(Current,states.courtroom,600,400);assert(a.view.trialMaps.windowBounds.top<.065);assert(b.view.trialMaps.windowBounds.top>=.065);
 const raw=readFileSync('tests/trial_browser.py','utf8');assert(raw.includes('b.top>=.065'));assert(raw.includes('timeout=20000'));
});
test('forest surface reuses its existing texture and exact authored pixel buffer',()=>{
 const r=productionWorldRig(Current);try{r.world.draw(structuredClone(states['forest-gate']),0,false);const scene=r.world.engine.scenes[0],floor=scene.getMeshByName('guardia1000-ground'),t=floor.material.diffuseTexture,p=paintProductionForestFloor(),d=r.world.inspectProductionArt();
 assert.deepEqual([t.getSize().width,t.getSize().height],[384,352]);assert.equal(sha(t.getContext().getImageData(0,0,384,352).data),sha(p.rgba));assert.equal(d.refinishedExistingTextures.length,1);assert.equal(d.uploads,1);assert.equal(d.actors.bindings,0);
 const count=scene.textures.length;for(let i=0;i<3;i++)r.world.draw(structuredClone(states['forest-gate']),0,false);assert.equal(scene.textures.length,count);assert.equal(r.world.inspectProductionArt().refinishedExistingTextures.length,1);
 }finally{r.close();}
});
test('side pilasters share court stone, are non-pickable, and remain outside the original actor corridor',()=>{
 const r=productionWorldRig(Current);try{r.world.draw(structuredClone(states.courtroom),0,false);const scene=r.world.engine.scenes[0],pillars=scene.meshes.filter(m=>m.name.startsWith('production-court-side-'));assert.equal(pillars.length,12);
 for(const m of pillars){assert.equal(Math.abs(m.position.x),7.7);assert.equal(m.isPickable,false);assert(m.material.name.startsWith('production-court-stone:'));}assert.equal(r.world.inspectProductionArt().maps[0].addedMeshes,27);
 const count=[scene.meshes.length,scene.materials.length,scene.textures.length],pixels=sha(r.canvas.pixels()),d=r.world.inspectProductionArt();for(let i=0;i<3;i++)r.world.draw(structuredClone(states.courtroom),0,false);
 assert.deepEqual([scene.meshes.length,scene.materials.length,scene.textures.length],count);assert.equal(sha(r.canvas.pixels()),pixels);assert.equal(r.world.inspectProductionArt().actors.finishedUploads,d.actors.finishedUploads);
 }finally{r.close();}
});
for(const chapter of ['bedroom','downstairs','home','overworld1000','fair'])test('B preserves non-target '+chapter+' without party painting changes',()=>{
 const s=createState(chapter),a=observe(World,s),b=observe(Current,s);assert.equal(a.image,b.image);assert.deepEqual(a.actors,b.actors);assert.equal(b.view.productionArt.actors.bindings,0);
});
test('court/forest/canyon transitions keep held bedroom framebuffer exact and borrowed cast resources bounded',()=>{
 const expected=observe(World,createState('bedroom')).image,r=productionWorldRig(Current,300,200);try{
  for(const state of [states.courtroom,states['forest-gate'],canyon,createState('bedroom')])r.world.draw(structuredClone(state),0,false);
  assert.equal(sha(r.canvas.pixels()),expected);const d=r.world.inspectProductionArt();assert.equal(d.uploads,13);assert(d.textureBytes<6*1024*1024);assert(d.actors.retainedCpuBytes<=24*48*64*4*2);assert.equal(d.actors.additionalGpuTextures,0);assert(d.maps.every(m=>!m.visible));
  r.world.draw(structuredClone(states.courtroom),0,false);const pixel=sha(r.canvas.pixels());r.world.draw(structuredClone(states.courtroom),0,false);assert.equal(sha(r.canvas.pixels()),pixel);
  r.world.engine.dispose();assert.equal(r.world.inspectProductionArt().actors.bindings,0);assert.equal(r.world.inspectProductionArt().disposed,true);
 }finally{r.close();}
});
test('original four-argument draw delivers real queued frame effects unchanged',()=>{
 const s=structuredClone(canyon),effects=[{kind:'hit',x:0,z:0,origin:{x:0,z:1},actor:0,amount:1}];const captured=[];
 // Subclass dispatch is observed at the existing prototype, not a replacement app mode.
 const parent=Object.getPrototypeOf(Current.prototype),old=parent.draw;parent.draw=function(...args){captured.push(args);};
 const r=productionWorldRig(Current);try{r.world.draw(s,.01,true,effects);assert.equal(captured.length,1);assert.equal(captured[0][0],s);assert.equal(captured[0][3],effects);assert.deepEqual(captured[0].slice(1,3),[.01,true]);}finally{parent.draw=old;r.close();}
});
