import test from 'node:test';
import assert from 'node:assert/strict';
import {World,createState} from '../.test/detail-baseline-cpu-entry.mjs';
import {World as OriginalWorld} from '../.test/woodland-baseline-cpu-entry.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {assertWoodland} from '../scripts/woodland-evidence.mjs';
const setup=()=>{
 const oldWindow=globalThis.window,oldDocument=globalThis.document;
 const doc={createElement(tag){return tag==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}};},getElementById(){return null;},addEventListener(){},removeEventListener(){}};
 globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};
 const a=cpuTestCanvas(160,104),b=cpuTestCanvas(160,104);a.canvas.ownerDocument=b.canvas.ownerDocument=doc;
 const current=new World(a.canvas),original=new OriginalWorld(b.canvas);
 return {a,b,current,original,dispose(){current.engine.dispose();original.engine.dispose();globalThis.window=oldWindow;globalThis.document=oldDocument;}};
};
function shape(w){return w.scene.meshes.filter(m=>m.isEnabled()).map(m=>({name:m.name,position:m.position.asArray(),scaling:m.scaling.asArray(),rotation:m.rotation.asArray(),vertices:m.getTotalVertices(),indices:m.getTotalIndices()}));}
test('actual CPU world consumes new forest/Truce textures but keeps original scene geometry, state and bounded memory',()=>{
 const k=setup();try{
  for(const chapter of ['truce','forest','castle','chamber','fair','bedroom','downstairs','overworld']){
   const s=createState(chapter),before=structuredClone(s);k.current.draw(s,0,false);k.original.draw(structuredClone(s),0,false);
   assert.deepEqual(s,before);assert.deepEqual(shape(k.current),shape(k.original),chapter+' original object anchors and geometry');
   const info=k.current.inspect().storyNpcs.kingdom.woodland;assertWoodland(info,chapter);
   if(['truce','forest'].includes(chapter)){assert.notDeepEqual(k.a.pixels(),k.b.pixels());const snap=structuredClone(info);info.ground.samples[0].rgba[0]=999;assert.deepEqual(k.current.inspect().storyNpcs.kingdom.woodland,snap);}
   else assert.deepEqual(k.a.pixels(),k.b.pixels(),chapter+' untouched pixels');
   const r=k.current.inspectRenderer();assert.equal(r.cpu.unsupportedResources,0);assert(r.cpu.textureMemory.bytes<=33554432);assert(r.cpu.textureMemory.entries<=512);
  }
 }finally{k.dispose();}
});
test('repeated map round trips do not multiply tree planes or textures, and frozen source ticks leave pixels unchanged',()=>{
 const k=setup();try{
  const states=['forest','truce','castle'].map(c=>createState(c));
  for(const s of states)k.current.draw(s,0,false);
  const count=k.current.scene.meshes.length,textures=k.current.scene.textures.length;
  for(let i=0;i<6;i++)for(const s of states){k.current.draw(s,0,false);const pixels=k.a.pixels().slice();k.current.draw(s,0,false);assert.deepEqual(k.a.pixels(),pixels);assertWoodland(k.current.inspect().storyNpcs.kingdom.woodland,s.chapter);}
  assert.equal(k.current.scene.meshes.length,count);assert.equal(k.current.scene.textures.length,textures);
 }finally{k.dispose();}
});
