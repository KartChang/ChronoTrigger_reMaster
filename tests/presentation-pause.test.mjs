import {FieldEnemyMotion} from '../.test/field-enemy-motion.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../.test/render.mjs';
import {createState,beginBattle,step,IDLE,action,leaveBattle} from '../.test/core.mjs';

// Executes the production draw method through effect delivery only. Mesh/GPU
// work is replaced by ports; this is not a screenshot or browser acceptance.
const stop=Symbol('end-of-effect-stage');
function effectStage(state,animate,effects=[]){
 const delivered=[];
 const port={fieldEnemyMotion:new FieldEnemyMotion(),chapter:state.chapter,presentationState:state,time:0,era:state.era,flag:state.flags.repaired,
  prologueWorld:{draw(){}},fairWorld:{draw(){}},kingdomWorld:{draw(){}},rescueWorld:{draw(){}},trialWorld:{draw(){}},
  effect:e=>delivered.push(e),posePlayers:[{sample(){throw stop;}}]};
 assert.throws(()=>World.prototype.draw.call(port,state,1/60,animate,effects),e=>e===stop);
 return delivered;
}
function battleWithPendingEffects(){
 const s=createState();assert(beginBattle(s));
 for(let i=0;i<180;i++)step(s,IDLE,1/60);
 assert(action(s,0,'attack'));assert(s.effects.length>0);
 return s;
}
test('production draw while paused never drains queued real combat events or changes the state',()=>{
 const s=battleWithPendingEffects(),before=structuredClone(s);
 for(let i=0;i<3;i++){assert.deepEqual(effectStage(s,false),[]);assert.deepEqual(s,before);}
});
test('production active draw presents only explicitly delivered events without consuming state',()=>{
 const s=battleWithPendingEffects(),before=structuredClone(s),delivered=[...s.effects];
 assert.deepEqual(effectStage(s,true,delivered),delivered);assert.deepEqual(s,before);
});

import {takeFrameEffects,FeedbackClock} from '../.test/presentation-state.mjs';
import {readFileSync} from 'node:fs';
import {bindSaveImport} from '../.test/save-import.mjs';
import {deserialize,serialize} from '../.test/core.mjs';
test('frame owner transfers ordered effects exactly once and preserves queue identity',()=>{
 const s=battleWithPendingEffects(),queue=s.effects,before=structuredClone(s),events=[...queue];
 assert.deepEqual(takeFrameEffects(s,false),[]);assert.deepEqual(s,before);
 assert.deepEqual(takeFrameEffects(s,true),events);assert.equal(s.effects,queue);assert.equal(queue.length,0);
 assert.deepEqual(takeFrameEffects(s,true),[]);before.effects=[];assert.deepEqual(s,before);
});
function presentationPort(){
 const disposals=[],owned=id=>({mesh:{material:{dispose:(...args)=>disposals.push([id,'material',...args])},dispose:()=>disposals.push([id,'mesh'])},time:0});
 const port={fieldEnemyMotion:new FieldEnemyMotion(),floats:[owned('number')],slashes:[owned('stroke')],posePlayers:[{reset:()=>disposals.push(['p1'])},{reset:()=>disposals.push(['p2'])}],guestPose:{reset:()=>disposals.push(['guest'])},poseHistory:[{}],guestView:{pose:'hurt',frame:3},lunges:[{time:0,dx:.5,dz:.4},{time:.2,dx:-.5,dz:.1}]};
 return {port,disposals};
}
test('same-scene state replacement clears old numbers, strokes, lunges and pose history',()=>{
 const {port,disposals}=presentationPort();World.prototype.resetTransientPresentation.call(port);
 assert.deepEqual(port.floats,[]);assert.deepEqual(port.slashes,[]);assert.deepEqual(port.poseHistory,[]);
 assert(port.lunges.every(l=>l.time===1&&l.dx===0&&l.dz===0));assert.deepEqual(port.guestView,{pose:'idle',frame:0});
 assert.deepEqual(disposals.slice(0,4),[['number','material',true,true],['number','mesh'],['stroke','material',true,true],['stroke','mesh']]);
 World.prototype.resetTransientPresentation.call(port);assert.equal(disposals.filter(e=>e[1]==='mesh').length,2);
});
test('production resets presentation on a new state identity even with the same chapter',()=>{
 const s=createState('fair');let resets=0;
 const port={fieldEnemyMotion:new FieldEnemyMotion(),presentationState:createState('fair'),chapter:'fair',resetTransientPresentation(){resets++;},time:0,prologueWorld:{draw(){throw stop;}}};
 for(let i=0;i<2;i++)assert.throws(()=>World.prototype.draw.call(port,s,0,false),e=>e===stop);
 assert.equal(resets,1);assert.equal(port.presentationState,s);
 s.chapter='home';port.resize=()=>{throw stop;};assert.throws(()=>World.prototype.draw.call(port,s,0,false),e=>e===stop);
 assert.equal(resets,2);
});
test('feedback retains its remaining reading time across menus, native dialogs and hidden tabs',()=>{
 const timer=new FeedbackClock();assert(!timer.advance(1,false));timer.show();assert(timer.advance(2,false));
 for(let i=0;i<20;i++)assert(timer.advance(3600,true));
 assert(timer.advance(2.49,false));assert(!timer.advance(.02,false));
 timer.show();assert(timer.advance(4.49,false));assert(!timer.advance(.02,false));
});
test('invalid timing never prematurely expires feedback or makes an infinite message',()=>{
 const timer=new FeedbackClock();timer.show();for(const dt of [NaN,Infinity,-1,0])assert(timer.advance(dt,false));
 assert(!timer.advance(4.5,false));for(const n of [NaN,Infinity,-1]){timer.show(n);assert(!timer.advance(0,false));}
});
test('native selection and pending file read keep actual state and queued effects frozen',async()=>{
 let s=battleWithPendingEffects();
 for(let i=0;i<1000&&s.mode==='battle';i++){if(s.players[0].atb>=1)action(s,0,s.players[0].mp>=3?'skill':'attack');step(s,IDLE,1/60);}
 assert.equal(s.mode,'victory');leaveBattle(s);assert.equal(s.mode,'explore');
 const before=structuredClone(s),listeners={};let busy=false,resolveRead;
 const input={value:'',files:[],dataset:{},click(){},addEventListener:(name,fn)=>listeners[name]=fn};
 const picker=bindSaveImport(input,{canStart:()=>!busy,busy:b=>{busy=b;},apply:raw=>{s=deserialize(raw);},notice(){},released(){}});
 assert(picker.request());
 for(let i=0;i<3;i++){assert.deepEqual(takeFrameEffects(s,!busy),[]);effectStage(s,false);assert.deepEqual(s,before);}
 input.files=[{size:1,text:()=>new Promise(resolve=>{resolveRead=resolve;})}];listeners.change();assert.equal(picker.inspect().phase,'reading');
 listeners.cancel();assert(busy);assert.deepEqual(takeFrameEffects(s,!busy),[]);assert.deepEqual(s,before);
 resolveRead('{invalid');await new Promise(r=>setImmediate(r));assert(!busy);assert.equal(picker.inspect().phase,'error');assert.deepEqual(s,before);
 assert.deepEqual(takeFrameEffects(s,!busy),before.effects);
});
test('normal queued visual effects remain excluded from the existing save format',()=>{
 const s=battleWithPendingEffects();
 for(let i=0;i<1000&&s.mode==='battle';i++){if(s.players[0].atb>=1)action(s,0,'attack');step(s,IDLE,1/60);}
 assert.equal(s.mode,'victory');leaveBattle(s);assert(s.effects.length);const raw=serialize(s);
 takeFrameEffects(s,true);assert.equal(serialize(s),raw);assert.deepEqual(deserialize(raw).effects,[]);
});
test('production wiring freezes feedback and transfers effects outside the readonly draw',()=>{
 const main=readFileSync('src/main.ts','utf8'),render=readFileSync('src/render.ts','utf8');
 assert.match(main,/world.draw\(state,dt,running\|\|!started,takeFrameEffects\(state,running\)\)/);
 assert.match(main,/feedbackClock.advance\(dt,halted\(\)\)/);
 assert.doesNotMatch(render,/s\.effects\.(shift|splice|pop|push)\(/);
 assert.match(render,/presentationState!==s\|\|this.chapter!==s.chapter/);
});
