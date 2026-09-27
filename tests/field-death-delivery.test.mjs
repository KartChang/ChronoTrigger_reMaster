/** Offline production-renderer regressions; no native/browser acceptance. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import * as core from '../.test/core.mjs';
import {World} from '../.test/cpu-entry.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
function seed(chapter,index){
 const s=core.createState(chapter);s.joined=true;if(chapter==='canyon')s.opening.phase='canyon';
 assert(core.beginBattle(s));for(let i=0;i<s.enemies.length;i++)s.enemies[i].hp=i===index?1:0;
 s.players[0].atb=1;s.targets[0]=index;return s;
}
function rig(){
 const saved=[globalThis.document,globalThis.window,globalThis.matchMedia],media={matches:false};
 const doc={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};globalThis.matchMedia=()=>media;
 const c=cpuTestCanvas(192,128);c.canvas.ownerDocument=doc;const w=new World(c.canvas);
 return{w,media,close(){w.engine.dispose();[globalThis.document,globalThis.window,globalThis.matchMedia]=saved;}};
}
function draw(k,s,effects=[]){const before=structuredClone(s),copy=structuredClone(effects);k.w.draw(s,0,false,effects);assert.deepEqual(s,before);assert.deepEqual(effects,copy);return k.w.inspect().fieldEnemyBody;}
function kill(s){assert(core.action(s,0,'attack'));assert.equal(s.mode,'victory');assert.equal(s.effects.length,1);}
for(const chapter of ['canyon','forest'])for(const index of chapter==='canyon'?[0,1,2]:[0,1])test(`Y ${chapter}/${index} queued death preserves its real living source`,()=>{
 const k=rig(),s=seed(chapter,index);try{
  draw(k,s);kill(s);const queue=s.effects,before=structuredClone(s);
  for(let i=0;i<4;i++){const h=draw(k,s);assert.equal(h.resources.created,0);assert.equal(h.resources.active,0);assert.equal(k.w.foes[index].mesh.isEnabled(),false);assert.deepEqual(s,before);assert.equal(s.effects,queue);}
  const effects=queue.splice(0),h=draw(k,s,effects);assert.equal(h.resources.active,1,'delivered event must retain the witnessed living field foe');assert.equal(h.resources.created,1);
  assert.deepEqual(h.history.find(r=>r.kind==='death').cause.effect,effects[0]);
  const receipt=structuredClone(h);for(let i=0;i<3;i++)draw(k,s);assert.deepEqual(k.w.inspect().fieldEnemyBody,receipt);
  for(let i=0;i<24;i++){core.step(s,core.IDLE,1/60);draw(k,s,s.effects.splice(0));}
  const ended=k.w.inspect().fieldEnemyBody;assert.equal(ended.resources.active,0);assert.equal(ended.resources.created,ended.resources.released);assert(ended.history.some(h=>h.kind==='death'&&h.phase==='expired'));
  mkdirSync('test-results/field-death-delivery-offline',{recursive:true});writeFileSync(`test-results/field-death-delivery-offline/${chapter}-${index}.json`,JSON.stringify({scope:'offline production renderer, not native evidence',chapter,index,receipt,ended},null,2));
 }finally{k.close();}
});
for(const chapter of ['canyon','forest'])for(const cancel of ['queue-cleared','owner-replaced','mode-left','first-draw-dead','reduced-delivery','hidden-before-hit','ambiguous-target'])test(`Y ${chapter} ${cancel} cannot invent a field death`,()=>{
 const k=rig(),s=seed(chapter,0);try{
  if(cancel==='hidden-before-hit')k.w.foes[0].mesh.isVisible=false;
  if(cancel!=='first-draw-dead')draw(k,s);kill(s);draw(k,s);
  if(cancel==='queue-cleared'){s.effects.length=0;draw(k,s);}
  if(cancel==='owner-replaced'){s.enemies[0]=structuredClone(s.enemies[0]);draw(k,s);}
  if(cancel==='mode-left'){core.leaveBattle(s);draw(k,s);}
  if(cancel==='reduced-delivery')k.media.matches=true;
  if(cancel==='ambiguous-target'){Object.assign(s.enemies[1],{x:s.enemies[0].x,z:s.enemies[0].z});draw(k,s);}
  draw(k,s,s.effects.splice(0));k.media.matches=false;draw(k,s);assert.equal(k.w.inspect().fieldEnemyBody.resources.active,0);
 }finally{k.close();}
});
