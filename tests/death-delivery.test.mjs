/** Offline production-renderer regressions; never native/browser acceptance. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import * as core from '../.test/core.mjs';
import {beginTrialBattle} from '../.test/trial-rules.mjs';
import {World} from '../.test/cpu-entry.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';

const cases=[['tankHead','prisonbridge',0],['tankBody','prisonbridge',1],['tankWheel','prisonbridge',2],['prisonGuard','cellblock',0],['naga','cathedral',0],['hench','passage',0],['yakra','sanctum',0]];
function seed(chapter,index){
 const s=core.createState(chapter);s.joined=true;s.kingdom.phase='rescue';
 if(['prisonbridge','cellblock'].includes(chapter)){
  Object.assign(s.trial,{stage:chapter==='prisonbridge'?'tank':'escape',knocks:3,luccaJoined:chapter==='prisonbridge',guardsWon:chapter==='prisonbridge',fade:0});
  assert(beginTrialBattle(s,chapter==='prisonbridge'?'tank':'cellguards'));
 }else{
  s.era='middle';s.opening={phase:'vista',canyonWon:true,elapsed:0};s.fair.luccaMet=true;s.fair.telepodTested=true;
  Object.assign(s.rescue,{stage:chapter==='cathedral'?'entered':'allied',organOpen:chapter!=='cathedral',guardsWon:chapter==='sanctum'});assert(core.beginBattle(s));
 }
 // Deterministic offline setup. The lethal transition itself is core.action, not a renderer event fabrication.
 for(let i=0;i<s.enemies.length;i++)s.enemies[i].hp=i===index?1:0;
 s.players[0].atb=1;s.targets[0]=index;return s;
}
function rig(){
 const saved=[globalThis.document,globalThis.window,globalThis.matchMedia],media={matches:false};
 const doc={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};globalThis.matchMedia=()=>media;
 const c=cpuTestCanvas(192,128);c.canvas.ownerDocument=doc;const w=new World(c.canvas);
 return {w,media,close(){w.engine.dispose();[globalThis.document,globalThis.window,globalThis.matchMedia]=saved;}};
}
const body=(k,s)=>['prisonbridge','cellblock'].includes(s.chapter)?k.w.inspect().trialMaps.enemyBody:k.w.inspect().rescueEnemyBody;
function draw(k,s,effects=[]){const before=structuredClone(s),copy=structuredClone(effects);k.w.draw(s,0,false,effects);assert.deepEqual(s,before);assert.deepEqual(effects,copy);return body(k,s);}
function lethal(s){assert(core.action(s,0,'attack'));assert.equal(s.mode,'victory');assert.equal(s.effects.length,1);}
for(const [kind,chapter,index] of cases)test(`X queued ${kind} lethal receipt survives paused draws without inventing a death`,()=>{
 const k=rig(),s=seed(chapter,index);try{
  draw(k,s);lethal(s);const queue=s.effects,before=structuredClone(s),created=body(k,s).resources.created;
  for(let i=0;i<4;i++){const h=draw(k,s);assert.equal(h.resources.active,0);assert.equal(h.resources.created,created);assert(!h.history.some(r=>r.cause.kind==='death'));assert.deepEqual(s,before);assert.equal(s.effects,queue);}
  const delivered=queue.splice(0),h=draw(k,s,delivered);
  assert.equal(h.resources.active,1,'Real delivered lethal receipt must retain its previously drawn living source');
  assert.equal(h.resources.created,created+1);assert.equal(h.remnants[0].originalEnabled,false);assert.equal(h.remnants[0].textureUploads,1);
  assert.deepEqual(h.history.find(r=>r.cause.kind==='death').cause.effect,delivered[0]);
  const receipt=structuredClone(h);for(let i=0;i<3;i++)draw(k,s);assert.deepEqual(body(k,s),receipt);
  // Existing core steps advance victory naturally. No production tick, duration or route is changed.
  for(let i=0;i<24;i++){core.step(s,core.IDLE,1/60);draw(k,s,s.effects.splice(0));}
  const ended=body(k,s);assert.equal(ended.resources.active,0);assert.equal(ended.resources.created,ended.resources.released);
  assert(ended.history.some(r=>r.cause.kind==='death'&&r.phase==='expired'));
  mkdirSync('test-results/death-delivery-offline',{recursive:true});writeFileSync(`test-results/death-delivery-offline/${kind}.json`,JSON.stringify({scope:'offline production renderer regression; NOT native evidence',kind,receipt,ended,stateMutation:false},null,2));
 }finally{k.close();}
});
for(const chapter of ['prisonbridge','sanctum'])for(const cancel of ['queue-cleared','owner-replaced','mode-left','first-draw-dead','reduced-delivery'])test(`X ${chapter} ${cancel} cannot revive an unobserved or cancelled death`,()=>{
 const k=rig(),s=seed(chapter,0);try{
  if(cancel!=='first-draw-dead')draw(k,s);lethal(s);draw(k,s);
  if(cancel==='queue-cleared'){s.effects.length=0;draw(k,s);}
  if(cancel==='owner-replaced'){s.enemies[0]=structuredClone(s.enemies[0]);draw(k,s);}
  if(cancel==='mode-left'){core.leaveBattle(s);draw(k,s);}
  if(cancel==='reduced-delivery')k.media.matches=true;
  draw(k,s,s.effects.splice(0));k.media.matches=false;draw(k,s);assert.equal(body(k,s).resources.active,0);
 }finally{k.close();}
});

import {awaitingLethalDelivery} from '../.test/pending-death.mjs';
import {createHash} from 'node:crypto';
import {deathDeliveryXSpec,deathDeliveryXBaseline,deathDeliveryXIfDeclared} from './helpers/death-delivery-x-baseline.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const bad of ['alive','nan-hp','nan-position','outside','foreign-owner','ambiguous','empty','enemy-action','heal','unowned-hit','wrong-target'])test('X read-only pending receipt rejects '+bad,()=>{
 const s=seed('sanctum',0);lethal(s);let foe=s.enemies[0];
 if(bad==='alive')foe.hp=1;if(bad==='nan-hp')foe.hp=NaN;if(bad==='nan-position')foe.x=NaN;if(bad==='outside')s.mode='explore';if(bad==='foreign-owner')foe={...foe};if(bad==='ambiguous')s.enemies.push({...foe});if(bad==='empty')s.effects=[];if(bad==='enemy-action')s.effects[0].enemyAction={index:0,tick:s.ticks,origin:{x:0,z:0},target:{x:foe.x,z:foe.z}};if(bad==='heal')s.effects[0].kind='heal';if(bad==='unowned-hit')delete s.effects[0].actor;if(bad==='wrong-target')s.effects[0].z++;
 const before=structuredClone(s);assert.equal(awaitingLethalDelivery(s,foe),false);assert.deepEqual(s,before);
});
for(const source of ['p1','p2','guest','combo'])test('X read-only pending receipt accepts only real queue ownership '+source,()=>{
 const s=seed('sanctum',0);lethal(s);if(source==='p2')s.effects[0].actor=1;if(source==='guest'){delete s.effects[0].actor;s.effects[0].guest=true;}if(source==='combo'){delete s.effects[0].actor;s.effects[0].kind='combo';}const before=structuredClone(s);assert(awaitingLethalDelivery(s,s.enemies[0]));assert.deepEqual(s,before);
});
for(const name of Object.keys(deathDeliveryXSpec.files))test('X exact inverse rejects missing/duplicate/unrelated drift '+name,()=>{
 const raw=readFileSync(name,'utf8'),old=deathDeliveryXBaseline(name,raw),e=deathDeliveryXSpec.files[name][0];assert.equal(sha(old),deathDeliveryXSpec.originalSha256[name]);assert.equal(deathDeliveryXIfDeclared(name,old),old);
 for(const bad of [raw+e.after,raw.replace(e.after,''),raw+'\n// unrelated drift\n'])assert.throws(()=>deathDeliveryXBaseline(name,bad));
});
test('X core/input/native routes/captures/assertions/W retention/held source remain byte-identical',()=>{
 for(const [name,h]of Object.entries(JSON.parse(readFileSync('tests/baselines/vq03x-unchanged-inputs.json'))))assert.equal(sha(readFileSync(name)),h,name);
});

test('X optional adapter preserves unrelated bytes for original downstream hashes to reject',()=>{for(const name of Object.keys(deathDeliveryXSpec.files)){const raw=readFileSync(name,'utf8'),old=deathDeliveryXBaseline(name,raw),extra='\n// unrelated\n';assert.equal(deathDeliveryXIfDeclared(name,raw+extra),old+extra);assert.notEqual(sha(deathDeliveryXIfDeclared(name,raw+extra)),deathDeliveryXSpec.originalSha256[name]);}});
