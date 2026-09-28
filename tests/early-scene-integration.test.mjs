/** Frozen C production component/CPU integration. Current D has separate whole-app tests. Offline only. */
import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {readFileSync} from 'node:fs';
import {ArtDirectedWorld as Current} from '../.test/art-directed-world-c.mjs';
import {ArtDirectedWorld as Prior} from '../.test/art-directed-world-b.mjs';
import {createState} from '../.test/cpu-entry.mjs';import {productionWorldRig} from './helpers/production-world-rig.mjs';
import {EARLY_SCENE_ROOTS} from '../.test/early-scene-finish.mjs';import {paintEarlySceneSurface} from '../.test/early-scene-art.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const canyon=JSON.parse(readFileSync('tests/fixtures/ci82-canyon-state.json')).state;
const state=chapter=>chapter==='canyon'?structuredClone(canyon):createState(chapter);
const pose=m=>({name:m.name,position:m.position.asArray(),scale:m.scaling.asArray(),rotation:m.rotation.asArray(),visible:m.isEnabled(),isVisible:m.isVisible,visibility:m.visibility});
const actors=scene=>scene.meshes.filter(m=>m.billboardMode!==0&&!/^(pixel-canopy|oak|rock-ferns|guardia1000(tree|canopy)|early-art-)/.test(m.name)).map(m=>{
 const t=m.material?.diffuseTexture,s=t?.getSize();return {...pose(m),cell:s,pixels:t?.getContext?sha(t.getContext().getImageData(0,0,s.width,s.height).data):null};
});
function observe(Type,chapter){const r=productionWorldRig(Type,240,160);try{const s=state(chapter),before=structuredClone(s);r.world.draw(s,0,false);assert.deepEqual(s,before);const scene=r.world.engine.scenes[0];return {pixels:sha(r.canvas.pixels()),actors:actors(scene),geometry:scene.meshes.filter(m=>!m.name.startsWith('early-art-')).map(pose),camera:[scene.activeCamera.position.asArray(),scene.activeCamera.orthoTop,scene.activeCamera.orthoBottom,scene.activeCamera.orthoLeft,scene.activeCamera.orthoRight],view:r.world.inspect()};}finally{r.close();}}
for(const chapter of Object.values(EARLY_SCENE_ROOTS))test('C '+chapter+' changes actual application pixels while retaining actors, transforms, camera and gameplay',()=>{
 const b=observe(Prior,chapter),c=observe(Current,chapter);assert.notEqual(b.pixels,c.pixels);assert.deepEqual(c.actors,b.actors);assert.deepEqual(c.geometry,b.geometry);assert.deepEqual(c.camera,b.camera);
 for(const k of ['partyCombat','fieldEnemyMotion','fieldEnemyBody','combatTiming','actorPlayback','poses','guest','trialMaps','kingdomNpcs'])assert.deepEqual(c.view[k],b.view[k],k);
 const d=c.view.productionArt.earlyScenes;assert(d.maps.some(m=>m.chapter===chapter&&m.visible));assert.equal(d.approved,false);assert.equal(c.view.renderer.cpu.unsupportedResources,0);assert(c.view.renderer.cpu.textureMemory.bytes<33554432);assert(c.view.renderer.cpu.textureMemory.entries<512);
});
for(const chapter of ['bedroom','downstairs','home','overworld1000','fair','truce','forest','courtroom','guardia1000','futuregate'])test('C non-target '+chapter+' stays byte-identical to B in actual application framebuffer',()=>{
 const b=observe(Prior,chapter),c=observe(Current,chapter);assert.equal(c.pixels,b.pixels);assert.deepEqual(c.actors,b.actors);assert.equal(c.view.productionArt.earlyScenes.textureCount,0);
});
test('C shared scene textures are lazy, match runtime RGBA, and do not grow during redraw or chapter re-entry',()=>{
 const r=productionWorldRig(Current);try{
  assert.equal(r.world.inspectProductionArt().earlyScenes.uploads,0);
  for(const chapter of Object.values(EARLY_SCENE_ROOTS))r.world.draw(state(chapter),0,false);
  const scene=r.world.engine.scenes[0],d=r.world.inspectProductionArt().earlyScenes;assert.equal(d.maps.length,12);assert.equal(d.textureCount,16);assert.equal(d.uploads,16);assert(d.textureBytes<4*1024*1024);
  for(const a of d.surfaces){const t=scene.getTextureByName('early-art-'+a.kind),p=paintEarlySceneSurface(a.kind);assert(t);assert.equal(sha(t.getContext().getImageData(0,0,p.width,p.height).data),sha(p.rgba));}
  const count=[scene.meshes.length,scene.textures.length,scene.materials.length];for(let i=0;i<2;i++)for(const chapter of Object.values(EARLY_SCENE_ROOTS))r.world.draw(state(chapter),0,false);
  assert.deepEqual([scene.meshes.length,scene.textures.length,scene.materials.length],count);assert.equal(r.world.inspectProductionArt().earlyScenes.uploads,16);
  for(const m of scene.meshes.filter(m=>m.name.startsWith('early-art-'))){assert.equal(m.isPickable,false);assert(m.parent);}
  r.world.draw(createState('bedroom'),0,false);assert.equal(sha(r.canvas.pixels()),(()=>{const b=productionWorldRig(Prior);try{b.world.draw(createState('bedroom'),0,false);return sha(b.canvas.pixels());}finally{b.close();}})());
  assert(r.world.inspectProductionArt().earlyScenes.maps.every(m=>!m.visible));r.world.engine.dispose();assert.equal(r.world.inspectProductionArt().earlyScenes.textureCount,0);assert.equal(r.world.inspectProductionArt().earlyScenes.maps.length,0);assert.equal(r.world.inspectProductionArt().earlyScenes.disposed,true);
 }finally{r.close();}
});
test('C never changes transparent prison gate materials, actor visibility, secret-door animation or equipment state',()=>{
 const r=productionWorldRig(Current);try{const s=state('cellblock');r.world.draw(s,0,false);const scene=r.world.engine.scenes[0],gate=scene.getMeshByName('cellblock-locked-gate');assert(gate);assert.equal(gate.material.alpha,.42);assert(!gate.material.name.startsWith('early-art-'));
  const before=structuredClone(s);r.world.draw(s,1/60,true,[]);assert.deepEqual(s,before);assert.equal(gate.material.alpha,.42);
 }finally{r.close();}
});
test('C understory shares one atlas, uses four cells, keeps original canyon actors and stays on outside banks',()=>{
 const r=productionWorldRig(Current);try{r.world.draw(state('canyon'),0,false);const scene=r.world.engine.scenes[0],plants=scene.meshes.filter(m=>m.name.startsWith('early-art-bank-understory-'));assert.equal(plants.length,8);assert.equal(new Set(plants.map(m=>m.material)).size,1);const cells=new Set();for(const m of plants){assert(Math.abs(m.position.x)>=8.7);const uv=m.getVerticesData('uv'),us=uv.filter((_,i)=>i%2===0);assert(Math.min(...us)>=0&&Math.max(...us)<=1);cells.add(Math.min(...us));}assert.equal(cells.size,4);
 }finally{r.close();}
});

for(const [width,height]of [[320,480],[400,800],[1200,800]])test('C current indoor art respects original portrait/landscape framing '+width+'x'+height,()=>{
 const snapshot=Type=>{const r=productionWorldRig(Type,width,height);try{const s=createState('cathedral');r.world.draw(s,0,false);const scene=r.world.engine.scenes[0],camera=scene.activeCamera;return {actors:actors(scene),frame:[r.canvas.canvas.width,r.canvas.canvas.height,camera.orthoTop,camera.orthoBottom,camera.orthoLeft,camera.orthoRight],pixels:sha(r.canvas.pixels()),memory:r.world.inspect().renderer.cpu.textureMemory,unsupported:r.world.inspect().renderer.cpu.unsupportedResources};}finally{r.close();}};
 const b=snapshot(Prior),c=snapshot(Current);assert.deepEqual(c.frame,b.frame);assert.deepEqual(c.actors,b.actors);assert.notEqual(c.pixels,b.pixels);assert.equal(c.unsupported,0);assert(c.memory.bytes<33554432);assert(c.memory.entries<512);
});
