import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as c from '../.test/core.mjs';
import {prologueHint,MARLE_MEETING,DROPPED_PENDANT} from '../.test/prologue-data.mjs';
import {InputBoundary} from '../.test/input-boundary.mjs';
const source=readFileSync(new URL('./meeting-approach-probe.js',import.meta.url),'utf8');
const probe=(s,a={})=>Function('window','document',`return (${source})`)(
 {__CHRONO_TEST__:{snapshot:()=>structuredClone(s),paused:()=>false}},
 {activeElement:{id:'world'}})({axis:'x',target:-3.5,direction:-1,startTick:s.ticks,budget:300,joined:s.joined,...a});
const idle=(s,n)=>{for(let i=0;i<n;i++)c.step(s,c.IDLE,1/60);};
function walk(s,axis,target){const v={x:0,z:0};v[axis]=Math.sign(target-s.players[0][axis]);let n=0;
 while(v[axis]*(target-s.players[0][axis])>.03&&n++<2000){c.step(s,[v,{x:0,z:0}],1/60);if(s.prologue.transition)break;}
 assert.ok(n<2000);}
function fair(joined=false){const s=c.createState('bedroom');s.joined=joined;idle(s,160);
 walk(s,'x',0);walk(s,'z',-4.1);idle(s,35);walk(s,'x',0);c.interactPrologue(s,0);
 walk(s,'z',-4.2);c.interactPrologue(s,0);idle(s,35);walk(s,'x',.1);walk(s,'z',5.1);walk(s,'x',2);c.interactPrologue(s,0);idle(s,35);
 assert.equal(s.chapter,'fair');assert.equal(s.prologue.stage,'fair');return s;}
function leg(s,axis,target,poll,delay){const b=new InputBoundary(s),v={x:0,z:0};v[axis]=Math.sign(target-s.players[0][axis]);
 const args={axis,target,direction:v[axis],startTick:s.ticks,budget:Math.ceil((Math.abs(target-s.players[0][axis])/4+2)*60)};
 let held=[v,{x:0,z:0}],observed;
 do{for(let i=0;i<poll;i++){c.step(s,held,1/60);if(b.consume(s)){held=c.IDLE;break;}}observed=probe(s,args);assert.ok(observed.ok,JSON.stringify(observed));}while(!observed.reached);
 for(let i=0;i<delay;i++){c.step(s,held,1/60);if(b.consume(s))held=c.IDLE;}
 const after=probe(s,args);assert.ok(after.ok&&after.reached);return after;
}
for(const joined of [false,true])for(const poll of [1,6,12])for(const delay of [0,8])test(`meeting boundary survives poll=${poll}/release=${delay}/coop=${joined}`,()=>{
 const s=fair(joined);let r;
 for(const [axis,target] of [['z',-3.1],['x',-3.5],['z',-2.2]]){r=leg(s,axis,target,poll,delay);if(r.collision)break;}
 assert.ok(r.collision);assert.ok(r.distance<.85);idle(s,40);
 assert.equal(s.prologue.first,'unknown');assert.equal(s.prologue.pendantPicked,false);assert.equal(c.activeSlot(s,1),false);
 const before=structuredClone(s.prologue);assert.equal(c.interactPrologue(s,1),null);assert.deepEqual(s.prologue,before);
 assert.equal(c.deserialize(c.serialize(s)).prologue.first,'unknown');
});
test('CI25 observed release overshoot triggers the real meeting before x target; cleared input cannot finish the obsolete leg',()=>{
 const s=fair(true);walk(s,'z',-2.5333333333333385);const b=new InputBoundary(s);let held=[{x:-1,z:0},{x:0,z:0}];
 for(let n=0;n<160;n++){c.step(s,held,1/60);if(b.consume(s))held=c.IDLE;}
 assert.equal(s.prologue.stage,'collision');assert.ok(s.players[0].x>-3.5);assert.deepEqual(held,c.IDLE);
 assert.equal(probe(s).collision,true);assert.equal(probe(s).reached,true);
 assert.equal(s.prologue.first,'unknown');
});
test('meeting probe refuses forged or unrelated termination conditions',()=>{
 const s=fair();const cases=[d=>d.chapter='home',d=>d.mode='battle',d=>d.prologue.stage='companions',d=>d.prologue.first='marle',d=>d.prologue.pendantPicked=true,d=>d.players[0].x=NaN,d=>d.ticks=-1,d=>d.prologue.stage='collision'];
 for(const mutate of cases){const d=structuredClone(s);mutate(d);assert.equal(probe(d,{startTick:s.ticks}).ok,false);}
 assert.equal(probe(s,{startTick:s.ticks-301}).reason,'tick-budget');
 assert.equal(probe(s,{wait:true}),false);
});
function met(){const s=fair();walk(s,'z',-3.1);walk(s,'x',-3.5);walk(s,'z',-2.2);idle(s,40);return s;}
test('meeting HUD names the actual girl interaction without setting first-contact facts',()=>{
 const s=met(),before=c.serialize(s);assert.equal(prologueHint(s.chapter,s.players[0],s.prologue),'E · 查看女孩');assert.equal(c.serialize(s),before);
 assert.equal(c.interactPrologue(s,0).title,'女孩');assert.equal(s.prologue.first,'marle');
});
test('pendant/return/invitation HUD matches actual core action priority and preserves v6 provenance',()=>{
 const s=met();walk(s,'z',-2.8);walk(s,'x',-.5);walk(s,'z',-.8);
 assert.equal(prologueHint(s.chapter,s.players[0],s.prologue),'E · 拾起項鍊');c.interactPrologue(s,0);assert.equal(s.prologue.first,'pendant');
 walk(s,'z',-2.8);walk(s,'x',-3.5);walk(s,'z',-2.2);
 assert.equal(prologueHint(s.chapter,s.players[0],s.prologue),'E · 歸還項鍊');assert.equal(c.interactPrologue(s,0).choice,'return');c.choosePrologue(s,true);
 assert.equal(prologueHint(s.chapter,s.players[0],s.prologue),'E · 回應同行邀請');assert.equal(c.interactPrologue(s,0).choice,'company');c.choosePrologue(s,true);
 const loaded=c.deserialize(c.serialize(s));assert.equal(loaded.prologue.first,'pendant');assert.equal(loaded.prologue.stage,'companions');
});
test('HUD never advertises an early action outside its actual radius or during collision recovery',()=>{
 const s=met(),before=structuredClone(s.prologue);
 assert.ok(!prologueHint('fair',{x:8,z:-6},s.prologue).startsWith('E · '));
 s.prologue.elapsed=.2;assert.ok(!prologueHint('fair',MARLE_MEETING,s.prologue).startsWith('E · '));s.prologue.elapsed=before.elapsed;
 assert.ok(!prologueHint('fair',{x:DROPPED_PENDANT.x+1.25,z:DROPPED_PENDANT.z},s.prologue).startsWith('E · '));
 assert.deepEqual(s.prologue,before);
 // Solo may use Enter; the co-op preset reserves Enter for P2 even before Lucca joins.
 const main=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
 assert.ok(main.includes("+(state.joined?'，E':'，E 或 Enter')"));
});
