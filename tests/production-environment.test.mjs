/** CPU component fixtures are not a browser journey, a device result, or a visual score. */
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {ArtDirectedWorld} from '../.test/art-directed-world.mjs';
import {World} from '../.test/cpu-entry.mjs';import {createState} from '../.test/core.mjs';
import {productionWorldRig} from './helpers/production-world-rig.mjs';
const canyon=JSON.parse(readFileSync('tests/fixtures/ci82-canyon-state.json')).state;
const states=JSON.parse(readFileSync('tests/fixtures/ci78-scenery-states.json')).states;
const fixtures=[['canyon',canyon,'truce-canyon-600',5,1],['courtroom',states.courtroom,'trial-courtroom',8,15],['forest',states['forest-gate'],'trial-guardia1000',1,0]];
const sha=x=>createHash('sha256').update(x).digest('hex');
const actors=scene=>scene.meshes.filter(m=>/^(player-|enemy-|guest|ownership-|label)/.test(m.name)).map(m=>({name:m.name,position:m.position.asArray(),scale:m.scaling.asArray(),rotation:m.rotation.asArray(),enabled:m.isEnabled()}));
function frame(Type,state,w=240,h=160){const r=productionWorldRig(Type,w,h);try{const copy=structuredClone(state),before=structuredClone(copy);r.world.draw(copy,0,false);assert.deepEqual(copy,before,'presentation cannot write State/events/ticks/HP');const scene=r.world.engine.scenes[0],camera=scene.activeCamera,details=r.world.inspect();return {pixels:sha(r.canvas.pixels()),actors:actors(scene),details,camera:[camera.orthoLeft,camera.orthoRight,camera.orthoTop,camera.orthoBottom],matrices:scene.meshes.filter(m=>!m.name.startsWith('production-')).map(m=>({name:m.name,position:m.position.asArray(),scale:m.scaling.asArray(),rotation:m.rotation.asArray()}))};}finally{r.close();}}
for(const [name,state,root,uploads,added] of fixtures){
 test('actual application '+name+' binds runtime textures and preserves actors/core',()=>{
  const base=frame(World,state),art=frame(ArtDirectedWorld,state);assert.notEqual(art.pixels,base.pixels,'actual engine output changes, not just exported PNGs');assert.deepEqual(art.actors,base.actors);assert.deepEqual(art.matrices,base.matrices);
  for(const key of ['partyCombat','fieldEnemyBody','fieldEnemyMotion','combatTiming','actorPlayback','guest','poses','prologue'])assert.deepEqual(art.details[key],base.details[key],key);
  const d=art.details.productionArt;assert.equal(d.uploads,uploads);assert.equal(d.maps.length,1);assert.equal(d.maps[0].addedMeshes,added);assert(d.maps[0].visible);assert.equal(d.approved,false);assert.equal(d.conceptImagesEmbedded,false);
  assert.equal(art.details.renderer.cpu.unsupportedResources,0);assert(art.details.renderer.cpu.textureMemory.bytes<33554432);assert(art.details.renderer.cpu.textureMemory.entries<512);
 });
 test(name+' paused/reduced repeated draws are lazy, source-stable, and do not allocate again',()=>{
  const r=productionWorldRig(ArtDirectedWorld);try{const s=structuredClone(state),before=structuredClone(s);r.world.draw(s,0,false);const scene=r.world.engine.scenes[0],counts=[scene.meshes.length,scene.materials.length,scene.textures.length],d=r.world.inspect().productionArt;
   for(let i=0;i<4;i++)r.world.draw(s,0,false);r.media.matches=true;r.world.draw(s,0,false);assert.deepEqual(s,before);assert.deepEqual([scene.meshes.length,scene.materials.length,scene.textures.length],counts);assert.equal(r.world.inspect().productionArt.uploads,d.uploads);assert.equal(r.world.inspect().productionArt.textureBytes,d.textureBytes);
   for(const m of scene.getTransformNodeByName(root).getChildMeshes().filter(m=>m.name.startsWith('production-')))assert.equal(m.isPickable,false);
   d.maps[0].surfaces.push('injected');d.textures[0].kind='mutated';assert(!r.world.inspect().productionArt.maps[0].surfaces.includes('injected'));assert.notEqual(r.world.inspect().productionArt.textures[0].kind,'mutated');
   r.world.engine.dispose();assert.equal(r.world.inspectProductionArt().disposed,true);assert.equal(r.world.inspectProductionArt().textureBytes,0);
  }finally{r.close();}
 });
}
for(const chapter of ['bedroom','home','overworld1000','fair'])test('held/non-target '+chapter+' pixels, actors and camera stay exactly base World',()=>{
 const s=createState(chapter),base=frame(World,s),art=frame(ArtDirectedWorld,s);assert.equal(art.pixels,base.pixels);assert.deepEqual(art.actors,base.actors);assert.deepEqual(art.camera,base.camera);assert.deepEqual(art.matrices,base.matrices);assert.equal(art.details.productionArt.uploads,0);
});
test('reframing stays landscape/portrait bounded with both jury banks inside court camera',()=>{
 for(const [w,h]of [[480,320],[320,480]]){const r=productionWorldRig(ArtDirectedWorld,w,h);try{r.world.draw(structuredClone(states.courtroom),0,false);const c=r.world.engine.scenes[0].activeCamera;assert(c.orthoLeft<=-9);assert(c.orthoRight>=9);assert(c.orthoTop>=7.8);assert.equal(c.orthoBottom,-c.orthoTop);}finally{r.close();}}
});
test('chapter transitions hide scene-owned art, retain bounded cache and restore held home appearance',()=>{
 const held=createState('bedroom'),base=frame(World,held),r=productionWorldRig(ArtDirectedWorld,240,160);try{
  for(const [,s]of fixtures)r.world.draw(structuredClone(s),0,false);const all=r.world.inspect().productionArt;assert.equal(all.uploads,13);assert(all.textureBytes<6*1024*1024);
  r.world.draw(held,0,false);assert.equal(sha(r.canvas.pixels()),base.pixels);assert(r.world.inspect().productionArt.maps.every(m=>!m.visible));assert.equal(r.world.inspect().productionArt.uploads,13);
  const scene=r.world.engine.scenes[0];assert(scene.meshes.filter(m=>m.name.startsWith('production-')).every(m=>!m.isEnabled()));assert(r.world.inspectRenderer().cpu.textureMemory.bytes<33554432);
 }finally{r.close();}
});
