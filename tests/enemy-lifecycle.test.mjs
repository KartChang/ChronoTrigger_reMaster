/** Offline production World regressions; fixtures are not native gameplay evidence. */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../.test/core.mjs';
import {World} from '../.test/cpu-entry.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
function rig(){
 const saved=[globalThis.document,globalThis.window,globalThis.matchMedia],media={matches:false};
 const doc={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};globalThis.matchMedia=()=>media;
 const c=cpuTestCanvas(192,128);c.canvas.ownerDocument=doc;const w=new World(c.canvas);
 return{w,media,close(){w.engine.dispose();[globalThis.document,globalThis.window,globalThis.matchMedia]=saved;}};
}
function seed(chapter){
 const s=core.createState(chapter);s.joined=true;if(chapter==='canyon')s.opening.phase='canyon';
 if(['cathedral','passage','sanctum'].includes(chapter)){
  s.kingdom.phase='rescue';s.era='middle';s.opening={phase:'vista',canyonWon:true,elapsed:0};s.fair.luccaMet=true;s.fair.telepodTested=true;
  Object.assign(s.rescue,{stage:chapter==='cathedral'?'entered':'allied',organOpen:chapter!=='cathedral',guardsWon:chapter==='sanctum'});
 }
 assert(core.beginBattle(s));return s;
}
function draw(k,s,events=[]){const before=structuredClone(s),effects=structuredClone(events);k.w.draw(s,0,false,events);assert.deepEqual(s,before,'render cannot mutate state');assert.deepEqual(events,effects,'render cannot mutate events');return k.w.inspect();}
function tick(s,n=1){for(let i=0;i<n;i++)core.step(s,core.IDLE,1/60);}
function fieldAttack(k,s){
 draw(k,s);let count=0;while(!s.effects.some(e=>e.enemyAction)&&count++<1000)tick(s);
 assert(count<1000,'core must emit a real enemy turn');const events=s.effects.splice(0);draw(k,s,events);tick(s,6);draw(k,s,s.effects.splice(0));
 assert(k.w.inspect().fieldEnemyMotion.actors.find(a=>a.index===0).attackTick!==null);
 assert(Math.hypot(...Object.values(k.w.inspect().fieldEnemyBody.actors.find(a=>a.index===0).offset))>0);
}
for(const chapter of ['canyon','forest'])for(const mutation of ['replace','remove-and-return','dead-and-revive'])test(`Z ${chapter} ${mutation} cannot transfer an old action to slot 0`,()=>{
 const k=rig(),s=seed(chapter);try{
  fieldAttack(k,s);const old=s.enemies[0],before=k.w.inspect(),other=before.fieldEnemyMotion.actors.find(a=>a.index===1);
  if(mutation==='replace')s.enemies[0]=structuredClone(old);
  if(mutation==='remove-and-return'){s.enemies.shift();draw(k,s);s.enemies.unshift(old);}
  if(mutation==='dead-and-revive'){old.hp=0;draw(k,s);old.hp=48;}
  const now=draw(k,s);const a=now.fieldEnemyMotion.actors.find(a=>a.index===0),b=now.fieldEnemyBody.actors.find(a=>a.index===0);
  assert.equal(a.attackTick,null,'a new/revived owner must not inherit source attack');assert.equal(a.hurtTick,null);
  assert.deepEqual(b.offset,{x:0,z:0},'a new/revived owner must not inherit displacement');
  assert.deepEqual(k.w.foes[0].mesh.position.asArray().filter((_,i)=>i!==1),[s.enemies[0].x,s.enemies[0].z]);
  if(mutation==='replace'){assert.deepEqual(now.fieldEnemyMotion.actors.find(a=>a.index===1),other,'unrelated slot keeps its valid event and texture');}
  const frozen=structuredClone(now.fieldEnemyMotion);for(let i=0;i<3;i++)draw(k,s);assert.deepEqual(structuredClone(k.w.inspect().fieldEnemyMotion),frozen,'paused draws never re-upload or resurrect cancelled events');
 }finally{k.close();}
});
for(const chapter of ['canyon','forest','cathedral','passage','sanctum'])for(const mutation of ['revive','replace-dead','replace-live','remove'])test(`Z ${chapter} ${mutation} cancels an already-created death copy`,()=>{
 const k=rig(),s=seed(chapter),field=['canyon','forest'].includes(chapter),body=o=>field?o.fieldEnemyBody:o.rescueEnemyBody;try{
  for(let i=0;i<s.enemies.length;i++)s.enemies[i].hp=i===0?1:0;s.players[0].atb=1;s.targets[0]=0;
  draw(k,s);assert(core.action(s,0,'attack'));const h=body(draw(k,s,s.effects.splice(0)));assert.equal(h.resources.active,1);assert.equal(h.resources.created,1);
  if(mutation==='revive')s.enemies[0].hp=48;
  if(mutation==='replace-dead')s.enemies[0]=structuredClone(s.enemies[0]);
  if(mutation==='replace-live')s.enemies[0]={...s.enemies[0],hp:48};
  if(mutation==='remove')s.enemies=[];
  const after=body(draw(k,s));assert.equal(after.resources.active,0,'copy no longer belongs to a dead current owner');assert.equal(after.resources.created,1);assert.equal(after.resources.released,1);
  for(let i=0;i<3;i++){k.media.matches=i%2===0;const repeated=body(draw(k,s));assert.equal(repeated.resources.active,0);assert.equal(repeated.resources.created,1);assert.equal(repeated.resources.released,1);}
  if(mutation==='revive')assert(after.history.some(h=>(h.kind??h.cause.kind)==='death'&&h.phase==='cancelled'),'revival is cancellation, not a fabricated full death');
 }finally{k.close();}
});
for(const chapter of ['canyon','forest'])for(const malformed of ['origin-missing','target-missing','origin-null','target-null'])test(`Z ${chapter} rejects ${malformed} without breaking render`,()=>{
 const k=rig(),s=seed(chapter);try{
  draw(k,s);tick(s);const p=s.players[0],foe=s.enemies[0];const e={kind:'hit',text:'fixture',x:p.x,z:p.z,enemyAction:{index:0,tick:s.ticks,origin:{x:foe.x,z:foe.z},target:{x:p.x,z:p.z}}};
  const [key,kind]=malformed.split('-');if(kind==='missing')delete e.enemyAction[key];else e.enemyAction[key]=null;
  assert.doesNotThrow(()=>draw(k,s,[e]));assert.equal(k.w.inspect().fieldEnemyMotion.actors.find(a=>a.index===0).attackTick,null);
 }finally{k.close();}
});
for(const chapter of ['canyon','forest'])test(`Z ${chapter} body owner replacement restores its anchor independently of texture`,()=>{
 const k=rig(),s=seed(chapter);try{
  fieldAttack(k,s);const other=structuredClone(k.w.inspect().fieldEnemyBody.actors.find(a=>a.index===1));s.enemies[0]=structuredClone(s.enemies[0]);
  const now=draw(k,s).fieldEnemyBody;assert.deepEqual(now.actors.find(a=>a.index===0).offset,{x:0,z:0});assert.deepEqual(now.actors.find(a=>a.index===1),other);
 }finally{k.close();}
});
for(const chapter of ['canyon','forest'])test(`Z ${chapter} owner replacement cancels both hurt texture and recoil`,()=>{
 const k=rig(),s=seed(chapter);try{
  draw(k,s);s.players[0].atb=1;s.targets[0]=0;assert(core.action(s,0,'attack'));assert(s.enemies[0].hp>0);draw(k,s,s.effects.splice(0));tick(s,6);const before=draw(k,s);
  assert(before.fieldEnemyMotion.actors.find(a=>a.index===0).hurtTick!==null);assert(Math.hypot(...Object.values(before.fieldEnemyBody.actors.find(a=>a.index===0).offset))>0);
  s.enemies[0]=structuredClone(s.enemies[0]);const now=draw(k,s);assert.equal(now.fieldEnemyMotion.actors.find(a=>a.index===0).hurtTick,null);assert.deepEqual(now.fieldEnemyBody.actors.find(a=>a.index===0).offset,{x:0,z:0});
 }finally{k.close();}
});
