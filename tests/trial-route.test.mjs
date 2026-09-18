import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deserialize,serialize,step,IDLE,interactFair,interactTrial,chooseTrial,action,leaveBattle} from '../.test/core.mjs';
// Deterministic collision/path integration. No position or flag assignment, no fabricated save.
// This complements, and does not replace, the real browser/renderer acceptance.
test('both prison routes are reachable by fixed-step walking, actions and actual generated saves',()=>{
 let s=deserialize(readFileSync(new URL('./fixtures/returned-ci13-v5.json',import.meta.url),'utf8'));
 const settle=()=>{for(let n=0;n<25;n++)step(s,IDLE,1/60);};
 const move=(axis,target,battle=false)=>{const sign=Math.sign(target-s.players[0][axis]),v={x:axis==='x'?sign:0,z:axis==='z'?sign:0};let ticks=0;
  while(sign*(target-s.players[0][axis])>.035){step(s,[v,v],1/60);if(battle&&s.mode==='battle')return;if(++ticks>900)assert.fail(`Blocked ${s.chapter} ${axis}→${target}: ${JSON.stringify(s.players)} ${s.mode}`);}
 };
 const talk=(title,yes)=>{const r=s.chapter==='fair'?interactFair(s,0):interactTrial(s,0);assert(r&&r.title.includes(title),`Expected ${title}, got ${r?.title}, chapter ${s.chapter}, positions ${JSON.stringify(s.players)}`);if(yes!==undefined)assert(chooseTrial(s,yes));settle();};
 const fight=()=>{for(let n=0;n<12000&&s.mode==='battle';n++){step(s,IDLE,1/60);for(const i of [0,1])if(s.players[i].atb>=1)action(s,i,i===0&&s.players[i].mp>=3?'skill':'attack');}assert.equal(s.mode,'victory');leaveBattle(s);settle();};
 const toWarden=()=>{move('x',0);move('z',5.6);talk('階梯塔');move('z',-.5,true);fight();move('z',5.6);talk(s.trial.luccaJoined?'看守室':'露卡趕到了');};
 move('x',0);move('z',-7.2);talk('送瑪兒回王城');move('x',-2.9);talk('加爾迪亞森林');move('z',5.7);talk('加爾迪亞王城');move('z',-.5);talk('被捕');
 talk('大臣的質問',true);talk('大臣的質問',false);talk('裁決');talk('空中刑務所');const cell=serialize(s);s=deserialize(cell);settle();
 move('z',-1.3);talk('衛兵');talk('衛兵');talk('鐵門打開了');fight();
 move('z',2.5);move('x',6);talk('處刑室');move('z',2);move('x',2.1);talk('救出弗里茲');move('x',0);move('z',-5.8);talk('獨房');toWarden();
 move('z',2);move('x',2.1);talk('龍戰車說明書');move('x',-4);talk('補給箱');s=deserialize(serialize(s));settle();
 move('x',0);move('z',5.7);talk('吊橋');move('x',3.6,true);fight();move('x',-6.5);talk('加爾迪亞王城');move('z',1.7);talk('瑪兒');move('z',-5.6);talk('加爾迪亞森林');move('x',5.1);move('z',4);talk('陌生的穹頂');
 assert.equal(s.chapter,'futuregate');assert(s.trial.fritzFreed);assert.equal(deserialize(serialize(s)).trial.experience,160);
 s=deserialize(cell);settle();move('x',-3.1);talk('獨房的床鋪',false);for(let day=1;day<=3;day++){talk('獨房的床鋪',true);assert.equal(s.trial.days,day);}
 assert.equal(s.chapter,'execution');s=deserialize(serialize(s));settle();move('z',-5.7);talk('獨房');toWarden();assert.equal(s.chapter,'warden');assert.equal(s.trial.route,'wait');assert.equal(s.trial.fritzFreed,false);assert.equal(s.trial.experience,30);
});
