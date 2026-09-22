import test from 'node:test';
import assert from 'node:assert/strict';
import {NullEngine,Scene,DynamicTexture,StandardMaterial,MeshBuilder,TransformNode,Texture} from '@babylonjs/core';
import {StoryNpcMotion} from '../.test/story-npc-motion.mjs';
import {drawStoryNpc} from '../.test/story-npc-art.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {ambientFrame} from '../.test/actor-motion.mjs';
function setup(){
 const e=new NullEngine();e.createCanvas=(w,h)=>cpuTestCanvas(w,h).canvas;
 const s=new Scene(e),motion=new StoryNpcMotion(s);
 function add(name='npc',kind='resident',width=48){
  const t=new DynamicTexture(name,{width,height:64},s,false,Texture.NEAREST_SAMPLINGMODE);drawStoryNpc(t.getContext(),kind,0);t.update();
  const m=new StandardMaterial(name,s);m.diffuseTexture=m.emissiveTexture=t;m.disableLighting=true;
  const b=MeshBuilder.CreatePlane(name,{width:1.32,height:1.8},s);b.position.set(-4.5,1,1);b.material=m;
  return {b,t,m,pixels:()=>Buffer.from(t.getContext().getImageData(0,0,width,64).data)};
 }
 return {e,s,motion,add,close(){s.dispose();e.dispose();}};
}
test('tick-driven NPC uploads only at pose transitions and keeps world transform fixed',()=>{
 const p=setup();try{const a=p.add();p.motion.add(a.b,'resident');const pose=[...a.b.position.asArray(),...a.b.scaling.asArray(),...a.b.rotation.asArray()],first=a.pixels();
 p.motion.draw(0);p.motion.draw(89);assert.equal(p.motion.inspect().actors[0].uploads,0);
 p.motion.draw(90);assert.equal(p.motion.inspect().actors[0].frame,1);assert.notDeepEqual(a.pixels(),first);
 const frozen=a.pixels(),report=p.motion.inspect();for(let i=0;i<30;i++)p.motion.draw(90);assert.deepEqual(p.motion.inspect(),report);assert.deepEqual(a.pixels(),frozen);
 p.motion.draw(180);assert.equal(p.motion.inspect().actors[0].frame,2);p.motion.draw(189);assert.equal(p.motion.inspect().actors[0].frame,3);
 p.motion.draw(240);assert.deepEqual(a.pixels(),first);assert.equal(p.motion.inspect().actors[0].uploads,4);
 assert.deepEqual([...a.b.position.asArray(),...a.b.scaling.asArray(),...a.b.rotation.asArray()],pose);
 }finally{p.close();}
});
test('disabled map and hidden actor do no texture work; re-entry uses current tick without catchup',()=>{
 const p=setup();try{const a=p.add(),root=new TransformNode('map',p.s);a.b.parent=root;p.motion.add(a.b,'resident');root.setEnabled(false);
 const initial=a.pixels();for(const tick of [90,180,189,330])p.motion.draw(tick);assert.equal(p.motion.inspect().actors.length,0);assert.deepEqual(a.pixels(),initial);
 root.setEnabled(true);p.motion.draw(330);assert.equal(p.motion.inspect().actors[0].frame,1);assert.equal(p.motion.inspect().actors[0].uploads,1);
 a.b.setEnabled(false);p.motion.draw(430);a.b.setEnabled(true);assert.equal(p.motion.inspect().actors[0].uploads,1);
 }finally{p.close();}
});
test('staggered actors use deterministic ambient timing and one texture each',()=>{
 const p=setup();try{const items=['resident','innkeeper','guard','king','nun','queen','chancellor'].map((kind,i)=>{const a=p.add('npc'+i,kind);p.motion.add(a.b,kind);return a;});
 const textures=p.s.textures.length;p.motion.draw(160);for(const [i,a] of p.motion.inspect().actors.entries())assert.equal(a.frame,ambientFrame(160,i));
 for(let tick=0;tick<480;tick+=7)p.motion.draw(tick);assert.equal(p.s.textures.length,textures);assert.equal(new Set(items.map(a=>a.t)).size,7);
 }finally{p.close();}
});
test('inspection is a detached observation and does not mutate binding or pixels',()=>{
 const p=setup();try{const a=p.add();p.motion.add(a.b,'resident');const before=a.pixels(),r=p.motion.inspect();r.actors[0].frame=999;r.actors[0].cell.width=1;r.actors.pop();assert.equal(p.motion.inspect().actors.length,1);assert.equal(p.motion.inspect().actors[0].cell.width,48);assert.equal(p.motion.inspect().actors[0].frame,0);assert.deepEqual(before,a.pixels());}finally{p.close();}
});
test('duplicate bindings and incompatible texture cells fail rather than allocate silently',()=>{
 const p=setup();try{const a=p.add();p.motion.add(a.b,'resident');assert.throws(()=>p.motion.add(a.b,'resident'),/Duplicate/);const b=p.add('bad','guard',24);assert.throws(()=>p.motion.add(b.b,'guard'),/cell mismatch/);}finally{p.close();}
});
test('disposed actors are skipped and scene disposal releases all motion references',()=>{
 const p=setup();try{const a=p.add();p.motion.add(a.b,'resident');a.b.dispose();assert.doesNotThrow(()=>p.motion.draw(90));assert.equal(p.motion.inspect().actors.length,0);
 const b=p.add('other','queen');p.motion.add(b.b,'queen');p.s.dispose();assert.equal(p.motion.inspect().actors.length,0);assert.doesNotThrow(()=>p.motion.draw(180));}finally{p.e.dispose();}
});

import {World,createState} from '../.test/cpu-entry.mjs';
import {assertStoryNpcs} from '../scripts/story-npc-evidence.mjs';
test('existing World maps show authored roles under original story visibility; CPU cache, palette and rules remain coherent',()=>{
 const oldWindow=globalThis.window,oldDocument=globalThis.document,p=cpuTestCanvas(192,128);
 const doc={createElement(tag){if(tag==='canvas')return cpuTestCanvas(1,1).canvas;return {style:{}};},getElementById(){return null;},addEventListener(){},removeEventListener(){}};
 p.canvas.ownerDocument=doc;globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};
 let world;try{
  world=new World(p.canvas);
  for(const [chapter,mode,stage,yakraWon,chancellorFreed] of [['truce','explore','none',false,false],['castle','explore','none',false,false],['cathedral','explore','entered',false,false],['cathedral','battle','entered',false,false],['cathedral','explore','cleared',false,false],['sanctum','explore','allied',false,false],['sanctum','battle','boss',false,false],['sanctum','explore','rescued',true,true],['chamber','explore','homecoming',true,true],['fair','explore','returned',true,true]]){
   const s=createState(chapter);s.mode=mode;Object.assign(s.rescue,{stage,yakraWon,chancellorFreed});s.ticks=90;
   const before=structuredClone(s);world.draw(s,0,false);assert.deepEqual(s,before);
   assertStoryNpcs({state:s,storyNpcs:world.inspect().storyNpcs});
   const actors=world.inspect().storyNpcs;const frozen=p.pixels().slice();
   for(let i=0;i<3;i++)world.draw(s,0,false);assert.deepEqual(world.inspect().storyNpcs,actors);assert.deepEqual(p.pixels(),frozen);
   assert.equal(world.inspectRenderer().cpu.unsupportedResources,0);assert(world.inspectRenderer().cpu.textureMemory.bytes<=33554432);
  }
  const s=createState('truce');s.ticks=0;world.draw(s,0,false);
  const names=['townsperson','innkeeper'];const transforms=names.map(n=>{const m=world.scene.getMeshByName(n);return {name:n,pos:m.position.asArray(),vertices:Array.from(m.getVerticesData('position'))};});
  assert.deepEqual(transforms.map(t=>[t.pos[0],t.pos[2]]),[[-4.5,1],[-6.5,-3.3]]);
  const count=world.scene.textures.length,mem=world.inspectRenderer().cpu.textureMemory.entries;
  for(const tick of [90,180,189,240,330]){s.ticks=tick;world.draw(s,0,false);}
  assert.equal(world.scene.textures.length,count);assert.equal(world.inspectRenderer().cpu.textureMemory.entries,mem);
  for(const t of transforms){const m=world.scene.getMeshByName(t.name);assert.deepEqual(m.position.asArray(),t.pos);assert.deepEqual(Array.from(m.getVerticesData('position')),t.vertices);assert(m.material.useEmissiveAsIllumination);assert.equal(m.material.diffuseTexture.getSize().width,48);}
 }finally{world?.engine.dispose();globalThis.window=oldWindow;globalThis.document=oldDocument;}
});

test('inspection reads the actual texture dimensions, not only the art profile constants',()=>{const p=setup();try{const a=p.add();p.motion.add(a.b,'resident');const t=new DynamicTexture('wrong-cell',{width:96,height:64},p.s,false);a.m.diffuseTexture=t;assert.deepEqual(p.motion.inspect().actors[0].cell,{width:96,height:64});}finally{p.close();}});
