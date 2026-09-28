/** Current F application tests use the real CPU renderer with an OFFLINE canvas port.
 * No browser/native State, save, time or collision is created or injected. */
import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {readFileSync} from 'node:fs';
import {TransformNode,MeshBuilder,StandardMaterial,DynamicTexture} from '@babylonjs/core';
import {ArtDirectedWorld as Current} from '../.test/art-directed-world.mjs';import {ArtDirectedWorld as Prior} from '../.test/art-directed-world-e.mjs';
import {World,createState} from '../.test/cpu-entry.mjs';import {productionWorldRig} from './helpers/production-world-rig.mjs';
import {installProductionPlaces} from '../.test/production-place-finish.mjs';import {paintPlaceSurface} from '../.test/production-place-art.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex'),canyon=JSON.parse(readFileSync('tests/fixtures/ci82-canyon-state.json')).state;
const state=ch=>{const s=ch==='canyon'?structuredClone(canyon):createState(ch);if(ch==='cathedral')s.rescue.stage='entered';return s;};
function bytes(t){const s=t.getSize();return new Uint8ClampedArray(t.getContext().getImageData(0,0,s.width,s.height).data);}
function observed(Type,ch){const r=productionWorldRig(Type,240,160);try{const s=state(ch),before=structuredClone(s);r.world.draw(s,0,false,[]);assert.deepEqual(s,before);const sc=r.world.engine.scenes[0],v=r.world.inspect(),cam=sc.activeCamera;
 const resources=sc.meshes.filter(m=>!m.name.startsWith('place-art-')).map(m=>({name:m.name,p:m.position.asArray(),s:m.scaling.asArray(),r:m.rotation.asArray(),positions:m.getVerticesData('position')&&Array.from(m.getVerticesData('position')),enabled:m.isEnabled()}));
 const textures=sc.textures.filter(t=>!t.name.startsWith('place-art-')&&t instanceof DynamicTexture).map(t=>({name:t.name,hash:sha(bytes(t))}));
 return {frame:sha(r.canvas.pixels()),v,resources,textures,camera:[cam.position.asArray(),cam.orthoTop,cam.orthoBottom,cam.orthoLeft,cam.orthoRight]};}finally{r.close();}}
for(const ch of ['truce','courtroom'])test('F actual '+ch+' composition changes pixels while keeping all existing geometry/actor/base texture bytes and state',()=>{
 const e=observed(Prior,ch),f=observed(Current,ch);assert.notEqual(f.frame,e.frame);assert.deepEqual(f.resources,e.resources);assert.deepEqual(f.textures,e.textures);assert.deepEqual(f.camera,e.camera);
 for(const k of ['partyCombat','fieldEnemyMotion','fieldEnemyBody','combatTiming','actorPlayback','poses','guest','trialMaps','kingdomNpcs','woodland','village'])assert.deepEqual(f.v[k],e.v[k],k);
 const p=f.v.productionArt.places;assert.equal(p.addedMeshes,ch==='truce'?1:15);assert.equal(p.maps.length,1);assert.equal(p.baseTextureWrites,0);assert.equal(p.actorTextureWrites,0);assert.equal(f.v.renderer.cpu.unsupportedResources,0);assert(f.v.renderer.cpu.textureMemory.bytes<33554432);
});
for(const ch of ['bedroom','home','downstairs','canyon','fair','forest','castle','cathedral','sanctum','overworld1000','cellblock','hall1000','guardia1000','futuregate'])test('F held/non-target '+ch+' actual framebuffer remains E-exact',()=>{assert.equal(observed(Current,ch).frame,observed(Prior,ch).frame);});
test('F actual uploaded authored RGBA, no repeated uploads on static draws, bounded mixed-map re-entry and held return',()=>{
 const r=productionWorldRig(Current,192,128);try{const states=['truce','courtroom','bedroom','home','downstairs'].map(state),copy=structuredClone(states);for(const s of states)r.world.draw(s,0,false,[]);const scene=r.world.engine.scenes[0],before=[scene.meshes.length,scene.textures.length],p=r.world.inspectProductionArt().places;
 assert.equal(p.addedMeshes,16);assert.equal(p.textureCount,4);assert.equal(p.materialCount,5);assert.equal(p.textureBytes,384*352*4+128*128*4+128*64*4+64*64*4);
 for(const t of scene.textures.filter(t=>t.name.startsWith('place-art-')))assert.deepEqual(bytes(t),paintPlaceSurface(t.name.slice('place-art-'.length)).rgba);
 for(let n=0;n<3;n++)for(const s of states)r.world.draw(s,0,false,[]);assert.deepEqual(states,copy);assert.deepEqual([scene.meshes.length,scene.textures.length],before);assert.equal(r.world.inspectProductionArt().places.uploads,4);
 const held=productionWorldRig(Prior,192,128);try{held.world.draw(state('downstairs'),0,false,[]);assert.equal(sha(r.canvas.pixels()),sha(held.canvas.pixels()));}finally{held.close();}
 r.world.engine.dispose();assert.equal(r.world.inspectProductionArt().places.disposed,true);assert.equal(r.world.inspectProductionArt().places.textureBytes,0);assert.equal(r.world.inspectProductionArt().places.addedMeshes,0);
 }finally{r.close();}
});
test('F disposal restores only owned furniture assignments and leaves replacement owners/materials alive',()=>{
 const r=productionWorldRig(Prior);try{r.world.draw(state('courtroom'),0,false,[]);const scene=r.world.engine.scenes[0],stand=scene.getMeshByName('courtroom-defendant-stand'),original=stand.material,pass=installProductionPlaces(scene);scene.onBeforeRenderObservable.notifyObservers(scene);assert.notEqual(stand.material,original);assert.equal(pass.inspect().addedMeshes,15);
 const later=new StandardMaterial('later-owner',scene);stand.material=later;pass.dispose();assert.equal(stand.material,later);assert(scene.materials.includes(later));assert(scene.materials.includes(original));assert.equal(pass.inspect().textureCount,0);assert.equal(scene.meshes.filter(m=>m.name.startsWith('place-art-')).length,0);pass.dispose();assert.throws(()=>installProductionPlaces({isDisposed:true}));
 }finally{r.close();}
});
test('F root disposal releases resources and permits a later valid owner without stale callbacks',()=>{
 const r=productionWorldRig(Prior);try{r.world.draw(state('truce'),0,false,[]);const scene=r.world.engine.scenes[0],pass=installProductionPlaces(scene);scene.onBeforeRenderObservable.notifyObservers(scene);const root=scene.getTransformNodeByName('kingdom-truce');assert.equal(pass.inspect().addedMeshes,1);root.dispose();assert.equal(pass.inspect().textureBytes,0);assert.equal(pass.inspect().maps.length,0);
 const next=new TransformNode('kingdom-truce',scene),floor=MeshBuilder.CreateGround('truce-floor',{width:24,height:22},scene);floor.parent=next;floor.position.set(0,.06,1);scene.onBeforeRenderObservable.notifyObservers(scene);assert.equal(pass.inspect().addedMeshes,1);assert.equal(pass.inspect().uploads,2);next.dispose();assert.equal(pass.inspect().addedMeshes,0);pass.dispose();
 }finally{r.close();}
});
test('F unknown root and mismatched known structures fail closed without allocations or material edits',()=>{
 const r=productionWorldRig(World);try{const scene=r.world.engine.scenes[0],pass=installProductionPlaces(scene);for(const name of ['held-home','kingdom-truce','trial-courtroom']){const root=new TransformNode(name,scene),m=MeshBuilder.CreatePlane(name==='trial-courtroom'?'courtroom-judge-rostrum':'truce-floor',{},scene);m.parent=root;m.material=new StandardMaterial('unknown-source',scene);}
 const counts=[scene.meshes.length,scene.textures.length];for(let n=0;n<3;n++)scene.onBeforeRenderObservable.notifyObservers(scene);assert.deepEqual([scene.meshes.length,scene.textures.length],counts);assert.equal(pass.inspect().maps.length,0);assert.equal(pass.inspect().uploads,0);pass.dispose();
 }finally{r.close();}
});
