import test from 'node:test';import assert from 'node:assert/strict';
import {createState,setCoop,step,IDLE,action,leaveBattle,interactFair,interactOpening,interactKingdom,interactRescue,serialize,deserialize} from '../.test/core.mjs';
import {ERA_MOVES} from '../scripts/cpu-era-evidence.mjs';
// Pure rules integration: ordinary factory, input vectors, interactions and real
// serialization. No state assignment, browser claims, exported file fixture or teleport.
test('CPU continuation route remains reachable from an actual Gato victory through existing rules',()=>{
 let s=createState('fair');assert(setCoop(s,true));const legs=[];
 const tick=(axis=null,dir=0,coop=false,owner=0)=>{const inputs=structuredClone(IDLE);if(axis){inputs[owner][axis]=dir;if(coop)inputs[1][axis]=dir;}step(s,inputs,1/60);};
 const until=(predicate,budget,run=()=>tick())=>{const start=s.ticks;while(!predicate()){assert(s.ticks-start<budget,'rules tick budget '+s.chapter);run();}};
 const move=(axis,target,coop=false,record=true)=>{const begin=s.ticks,budget=Math.ceil((Math.abs(target-s.players[0][axis])/4+2)*60);until(()=>Math.abs(target-s.players[0][axis])<.06,budget,()=>tick(axis,Math.sign(target-s.players[0][axis]),coop));tick();assert(s.ticks-begin<=budget);assert(Math.abs(target-s.players[0][axis])<.12);if(record)legs.push([axis,target,coop]);};
 const talk=title=>{const f=s.chapter==='fair'?interactFair:s.chapter==='canyon'?interactOpening:['cathedral','passage','sanctum'].includes(s.chapter)?interactRescue:interactKingdom;const result=f(s,0);assert(result?.title.includes(title),`${title}: ${JSON.stringify(result)} at ${s.chapter}/${JSON.stringify(s.players)}`);};
 const skill=owner=>{until(()=>s.players[owner].atb>=1,180);assert(action(s,owner,'skill'));};
 const save=version=>{const raw=serialize(s);assert.equal(JSON.parse(raw).version,version);s=deserialize(raw);};
 move('z',-2,true,false);move('x',-6.8,true,false);move('z',2.5,true,false);talk('岡薩雷斯');
 skill(0);skill(1);skill(0);assert.equal(s.mode,'victory');leaveBattle(s);assert(s.fair.gatoWon);save(2);
 move('x',0,true);move('z',6.4,true);talk('露卡');
 move('x',-2.4);move('z',8.7);talk('短距離傳送成功');move('z',7);move('x',0);
 const before=structuredClone(s.players[0]);until(()=>s.players[1].x<=1.5,Math.ceil((Math.abs(1.5-s.players[1].x)/4+2)*60),()=>tick('x',-1,false,1));
 assert.equal(s.players[0].x,before.x);assert(Math.hypot(s.players[1].x+2.4,s.players[1].z-9)<6);
 talk('瑪兒');assert.equal(s.opening.phase,'approach');until(()=>s.opening.phase==='lost',400);
 move('x',-2.4);move('z',8.7);talk('露卡');talk('克羅諾');until(()=>s.chapter==='canyon',150);
 until(()=>s.mode==='battle',100,()=>tick('z',-1));skill(0);skill(0);skill(0);assert.equal(s.mode,'victory');leaveBattle(s);
 move('z',-6.1);talk('600 年');save(3);talk('托魯斯');move('z',1);move('x',-4.5);talk('鎮民');
 move('x',0);move('z',-4.3);move('x',-6.5);talk('旅店');assert.equal(s.players[0].mp,18);
 move('x',7.3);talk('森林');until(()=>s.mode==='battle',233,()=>tick('z',1));skill(0);skill(0);leaveBattle(s);
 move('x',0);move('z',8.2);talk('王城');move('z',-2.6);move('x',-1);talk('衛兵');move('z',4);move('x',8);move('z',6.2);talk('王后房間');
 move('z',.6);talk('瑪兒');assert.equal(s.kingdom.phase,'erasing');until(()=>s.kingdom.phase==='missing',200);
 move('z',-6.8);talk('王城');move('z',-3.2);move('x',2.5);talk('露卡加入');const x=s.players[1].x;
 until(()=>s.players[1].x>x+.3,100,()=>tick('x',1,false,1));save(4);
 move('x',0,true);move('z',-6.8,true);talk('森林');move('z',.5,true);move('x',-9,true);talk('修道院');
 assert.equal(s.chapter,'cathedral');assert(s.kingdom.forestWon);assert(s.fair.gatoWon);assert.deepEqual(legs,ERA_MOVES);
});
