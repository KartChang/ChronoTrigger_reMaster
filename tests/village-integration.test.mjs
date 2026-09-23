import test from 'node:test';import assert from 'node:assert/strict';
import {World,createState} from '../.test/detail-baseline-cpu-entry.mjs';
import {World as OriginalWorld} from '../.test/village-baseline-cpu-entry.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';import {assertVillage} from '../scripts/village-evidence.mjs';
function setup(){
 const ow=globalThis.window,od=globalThis.document;
 const doc={createElement(tag){return tag==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}};},getElementById(){return null;},addEventListener(){},removeEventListener(){}};
 globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};
 const a=cpuTestCanvas(192,128),b=cpuTestCanvas(192,128);a.canvas.ownerDocument=b.canvas.ownerDocument=doc;
 const current=new World(a.canvas),original=new OriginalWorld(b.canvas);
 return {a,b,current,original,close(){current.engine.dispose();original.engine.dispose();globalThis.window=ow;globalThis.document=od;}};
}
const shape=w=>w.scene.meshes.filter(m=>m.isEnabled()).map(m=>({name:m.name,position:m.position.asArray(),scaling:m.scaling.asArray(),rotation:m.rotation.asArray(),vertices:m.getTotalVertices(),indices:m.getTotalIndices(),billboard:m.billboardMode,receiveShadows:m.receiveShadows}));
test('only Truce existing building surfaces change; original R geometry, NPCs, other chapters and rules remain',()=>{
 const k=setup();try{
  for(const chapter of ['truce','forest','castle','chamber','fair','bedroom','downstairs','overworld','cathedral','future']){
   const s=createState(chapter),before=structuredClone(s);k.current.draw(s,0,false);k.original.draw(structuredClone(s),0,false);assert.deepEqual(s,before);assert.deepEqual(shape(k.current),shape(k.original),chapter);
   assertVillage(k.current.inspect().storyNpcs.kingdom.village,chapter);
   if(chapter==='truce'){
    assert.notDeepEqual(k.a.pixels(),k.b.pixels());const info=k.current.inspect().storyNpcs.kingdom.village,copy=structuredClone(info);info.surfaces[0].samples[0].rgba[0]=999;assert.deepEqual(k.current.inspect().storyNpcs.kingdom.village,copy);
    assert(k.current.scene.textures.filter(t=>t.name!=='truce-planter-craft').length-k.original.scene.textures.length===6);
    assert.equal(k.current.scene.textures.filter(t=>t.name==='truce-planter-craft').length,1);
   }else assert.deepEqual(k.a.pixels(),k.b.pixels(),chapter+' untouched');
   const c=k.current.inspectRenderer().cpu;assert.equal(c.unsupportedResources,0);assert(c.textureMemory.bytes<=33554432&&c.textureMemory.entries<=512);
  }
 }finally{k.close();}
});
test('town finishing is cached across repeated map visits; same paused state has identical pixels',()=>{
 const k=setup();try{
  const states=['truce','forest','castle'].map(c=>createState(c));for(const s of states)k.current.draw(s,0,false);
  const meshes=k.current.scene.meshes.length,textures=k.current.scene.textures.length;
  for(let i=0;i<6;i++)for(const s of states){k.current.draw(s,0,false);const a=k.a.pixels().slice();k.current.draw(s,0,false);assert.deepEqual(k.a.pixels(),a);assert.equal(k.current.scene.meshes.length,meshes);assert.equal(k.current.scene.textures.length,textures);}
 }finally{k.close();}
});
