import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as c from '../.test/core.mjs';
import {newConduct,restoreConduct,saveConduct} from '../.test/fair-conduct-data.mjs';
import {newHearing,witnessEvidence,witnessScenes,jailGift,validateHearing,restoreHearing} from '../.test/trial-hearing.mjs';
import {trialEvidence,restoreTrial} from '../.test/trial-rules.mjs';
import {journey} from './helpers/witness-route.mjs';
const fixture=readFileSync(new URL('./fixtures/returned-ci13-v5.json',import.meta.url),'utf8');
// Explicit isolated rule fixtures are separate from the two no-state-write full route tests below.
function hearingFixture(){const s=c.deserialize(fixture);s.prologue.conduct=newConduct();s.prologue.conduct.sealed=true;s.prologue.first='marle';s.trial.hearing=newHearing();s.trial.question=3;s.trial.verdict='not-guilty';s.trial.blamedMarle=false;s.trial.wealthMotive=false;s.trial.hearing.wealthConfirmed=false;return s;}
for(const bad of [false,true])test(`full genuine fresh route through 600 rescue reaches ${bad?'guilty':'not-guilty'} hearing and jail`,()=>{
 const j=journey();j.company(bad);j.fairConduct(bad);const facts=saveConduct(j.s.prologue.conduct);j.rescueReturn();
 assert.deepEqual({...saveConduct(j.s.prologue.conduct),sealed:false},facts);j.court();assert(j.s.trial.hearing);j.hearing(bad);
 assert.equal(trialEvidence(j.s).jurors.filter(v=>v==='guilty').length,bad?7:0);
 assert.equal(jailGift(j.s),bad?0:3);assert.equal(j.s.trial.ethers,0);
 if(!bad){j.move('x',3);j.talk('支持者的物資');assert.equal(j.s.trial.ethers,3);j.talk('空包裹');assert.equal(j.s.trial.ethers,3);j.reload();assert(j.s.trial.hearing.giftTaken);}
 const raw=c.serialize(j.s);assert.equal(JSON.parse(raw).version,7);assert.equal(c.deserialize(raw).trial.verdict,bad?'guilty':'not-guilty');
});
test('legacy v5 and old v6 never acquire remembered fair conduct or new jury semantics',()=>{
 const old=c.deserialize(fixture);assert.equal(old.prologue.conduct,null);assert.equal(trialEvidence(old).jurors.filter(v=>v==='unknown').length,7);
 const j=journey();j.company();const save=JSON.parse(c.serialize(j.s));delete save.prologue.conduct;const s=c.deserialize(JSON.stringify(save));assert.equal(s.prologue.conduct,null);assert.equal(JSON.parse(c.serialize(s)).prologue.conduct,undefined);
});
test('cat follows actual paths and cannot grant return remotely; player must escort to owner',()=>{
 const j=journey();j.company();j.move('x',0);j.move('z',2.4);j.move('x',5);j.talk('小女孩');assert(!j.s.prologue.conduct.catReturned);
 j.move('z',.8);j.move('x',-9);j.talk('走失');j.reload();assert(j.s.prologue.conduct.cat.following);
 const cat={...j.s.prologue.conduct.cat};j.move('x',0);j.tick(200);assert(j.s.prologue.conduct.cat.x>cat.x);assert(!j.s.prologue.conduct.catReturned);
});
test('lunch is a one-time fact and cannot repeatedly heal; inactive P2 cannot consume it',()=>{
 const j=journey();j.company();j.move('z',.8);j.move('x',-9);j.move('z',6.5);j.s.players[0].hp=10;
 assert.equal(c.interactFair(j.s,1),null);assert.equal(j.s.players[0].hp,10);j.talk('老人的午餐');assert.equal(j.s.players[0].hp,120);
 j.s.players[0].hp=90;j.talk('空午餐袋');assert.equal(j.s.players[0].hp,90);j.reload();assert(j.s.prologue.conduct.lunchEaten);
});
test('merchant refusal/acceptance are explicit and sticky; no currency or item ownership is invented',()=>{
 const j=journey();j.company();j.move('z',-3.4);j.move('x',7.5);j.move('z',-6.3);j.talk('梅爾基歐');assert.throws(()=>c.serialize(j.s));j.choose(false);assert(j.s.prologue.conduct.saleDeclined);assert(!j.s.prologue.conduct.saleAttempted);
 j.talk('梅爾基歐');j.choose(true);j.talk('梅爾基歐');assert(j.s.prologue.conduct.saleAttempted);assert(j.s.prologue.pendantReturned);assert.equal(j.s.prologue.choice,null);
});
test('candy waiting uses simulation steps, pauses P2 movement and disallows partial saves',()=>{
 const j=journey();j.company();j.move('z',-3.4);j.move('x',7.5);j.tick(200);c.setCoop(j.s,true);j.talk('瑪兒');assert.equal(j.s.prologue.conduct.candy,'waiting');
 assert.throws(()=>c.serialize(j.s));const peer={...j.s.players[1]};for(let i=0;i<40;i++)c.step(j.s,[{x:0,z:0},{x:1,z:0}],1/60);assert.equal(j.s.players[1].x,peer.x);assert.equal(j.s.players[1].z,peer.z);
 j.tick(200);assert.equal(j.s.prologue.conduct.candy,'patient');j.move('x',4);assert.equal(j.s.prologue.conduct.candy,'patient');
});
test('leaving candy early remains rushed after returning and cannot be rewritten by repeating interaction',()=>{
 const j=journey();j.company();j.move('z',-3.4);j.move('x',7.5);j.talk('瑪兒');j.move('x',4);assert.equal(j.s.prologue.conduct.candy,'rushed');j.move('x',7.5);j.talk('糖果攤');j.tick(300);assert.equal(j.s.prologue.conduct.candy,'rushed');
});
for(const count of [4,5,6,7])test(`${count} positive votes grant ${count>=6?3:1} ethers without pretending untracked witnesses existed`,()=>{
 const s=hearingFixture();s.prologue.conduct.askedGirl=true;s.prologue.conduct.catReturned=true;
 if(count<7)s.prologue.conduct.saleAttempted=true;if(count<6)s.prologue.conduct.lunchEaten=true;if(count<5)s.prologue.conduct.candy='rushed';
 assert.equal(witnessEvidence(s).jurors.filter(v=>v==='not-guilty').length,count);assert.equal(jailGift(s),count>=6?3:1);
});
test('unvisited cat vote is unknown; prior request followed by real return has positive deterministic evidence',()=>{
 const s=hearingFixture();assert.equal(witnessEvidence(s).jurors[1],'unknown');s.prologue.conduct.askedGirl=true;assert.equal(witnessEvidence(s).jurors[1],'guilty');s.prologue.conduct.catReturned=true;assert.equal(witnessEvidence(s).jurors[1],'not-guilty');
});
test('conditional witness scenes are only created for actually recorded events',()=>{
 const s=hearingFixture();assert.equal(witnessScenes(s).length,0);s.prologue.conduct.askedGirl=true;s.prologue.conduct.lunchEaten=true;s.prologue.conduct.saleAttempted=true;s.prologue.conduct.candy='rushed';assert.deepEqual(witnessScenes(s).map(w=>w.kind),['elder','shopper','shopper']);
});
for(const [name,change] of [['missing schema',o=>delete o.schema],['array candy',o=>o.candy=['patient']],['unfinished candy',o=>o.candy='waiting'],['bad flag',o=>o.lunchEaten='yes'],['following returned cat',o=>{o.catReturned=true;o.askedGirl=true;o.cat.following=true;}],['unknown owner',o=>o.catReturned=true],['sealed following cat',o=>{o.sealed=true;o.cat.following=true;}],['bad coordinates',o=>o.cat.x=NaN],['invalid facing',o=>o.cat.facing=9]])test(`conduct import rejects ${name}`,()=>{const raw=saveConduct(newConduct());change(raw);assert.throws(()=>restoreConduct(raw));});
for(const raw of [[],null,7,{rules:'next'},{rules:'fair-witness-v1',giftTaken:false,heard:5,theftDenied:null,wealthConfirmed:null}])test(`hearing restore ${JSON.stringify(raw)}`,()=>{if(raw===null)assert.equal(restoreHearing(raw),null);else assert.throws(()=>restoreHearing(raw));});
test('new hearing rejects retroactive gift, omitted evidence, unknown rules and impossible stock',()=>{
 const s=hearingFixture();s.trial.stage='cell';s.trial.hearing.heard=0;validateHearing(s);
 s.trial.ethers=1;assert.throws(()=>validateHearing(s));s.trial.ethers=0;
 s.trial.hearing.giftTaken=true;s.trial.stage='court';assert.throws(()=>validateHearing(s));
 s.trial.stage='cell';s.prologue.conduct.lunchEaten=true;assert.throws(()=>validateHearing(s));
});
test('new hearing cannot fabricate answers before court, skip theft or replace sealed history',()=>{
 const s=hearingFixture();s.trial.stage='escort';s.trial.question=0;s.trial.blamedMarle=null;s.trial.wealthMotive=null;s.trial.verdict='pending';s.trial.hearing.wealthConfirmed=null;s.trial.hearing.theftDenied=false;
 assert.throws(()=>validateHearing(s));s.trial.hearing.theftDenied=null;s.prologue.conduct.sealed=false;assert.throws(()=>validateHearing(s));
});
test('restoreTrial preserves old absent-hearing data and does not silently recompute its version',()=>{
 const s=hearingFixture();const raw={...s.trial,hearing:undefined,stage:'court',question:0,blamedMarle:null,wealthMotive:null,verdict:'pending'};assert.equal(restoreTrial(raw,'courtroom').hearing,null);
});
test('earned court gift survives the actual waiting rescue, merges with supervisor stock once, and is usable',()=>{
 const j=journey();j.company();j.fairConduct();j.rescueReturn();j.court();j.hearing();j.move('x',3);j.talk('支持者的物資');j.reload();
 j.move('x',-3.1);for(let i=0;i<3;i++){j.talk('床鋪');j.choose(true);}assert.equal(j.s.chapter,'execution');j.reload();
 j.move('z',-5.7);j.talk('獨房');j.move('x',0);j.move('z',5.6);j.talk('階梯塔');j.move('z',-.5,true);j.fight();j.move('z',5.6);j.talk('看守室');j.move('z',2);j.move('x',-4);j.talk('補給箱');assert.equal(j.s.trial.ethers,5);j.talk('補給箱');assert.equal(j.s.trial.ethers,5);j.reload();
 assert(c.useInventory(j.s,'ether',0));assert.equal(j.s.trial.ethers,4);j.reload();assert.equal(j.s.trial.ethers,4);
 const raw=JSON.parse(c.serialize(j.s));raw.trial.ethers=6;assert.throws(()=>c.deserialize(JSON.stringify(raw)));raw.trial.ethers=5;raw.trial.hearing.giftTaken=false;assert.throws(()=>c.deserialize(JSON.stringify(raw)));
});
test('primary-script witness order: returned cat only, lunch before wealth, adverse testimony after two denials',()=>{
 const s=hearingFixture();s.prologue.conduct.askedGirl=true;assert.deepEqual(witnessScenes(s),[],'no invented girl complaint');
 s.prologue.conduct.lunchEaten=true;s.prologue.conduct.saleAttempted=true;s.prologue.conduct.candy='rushed';s.trial.wealthMotive=true;s.trial.hearing.wealthConfirmed=null;
 assert.deepEqual(witnessScenes(s).map(w=>w.kind),['elder']);s.trial.wealthMotive=false;s.trial.hearing.wealthConfirmed=false;
 assert.deepEqual(witnessScenes(s).map(w=>w.kind),['elder','shopper','shopper']);
});
test('a confirmed second wealth answer cannot be restored before its question stage has advanced',()=>{
 const s=hearingFixture();s.trial.question=1;s.trial.verdict='pending';s.trial.stage='court';assert.throws(()=>validateHearing(s));
});
