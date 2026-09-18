import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deserialize,serialize,step,interactFair,activeSlot,guestKind,action,cycleTarget,selectedEnemy,requestCombo,leaveBattle,IDLE,walkable,cutsceneActive,interactTrial,chooseTrial,useInventory} from '../.test/core.mjs';
import {trialEvidence,trialMoveAllowed,beginTrialBattle} from '../.test/trial-rules.mjs';
import {trialWalkable,trialMap} from '../.test/trial-data.mjs';
import {InputBoundary} from '../.test/input-boundary.mjs';
const raw=readFileSync(new URL('./fixtures/returned-ci13-v5.json',import.meta.url),'utf8');
// Isolated rules tests use explicit positions/readiness. Browser acceptance never writes state.
const settle=s=>{for(let i=0;i<20;i++)step(s,IDLE,.05);};
function at(s,x,z){assert(walkable(x,z,s.chapter),`${s.chapter} ${x},${z}`);s.players.forEach((p,i)=>Object.assign(p,{x:x+i*.3,z}));Object.assign(s.rescue.guest,{x:x-.3,z});}
function talk(s,x,z){if(x!==undefined)at(s,x,z);const r=interactTrial(s,0);settle(s);return r;}
function escort(){const s=deserialize(raw);at(s,0,-7.5);assert(interactFair(s,0));settle(s);assert.equal(s.chapter,'overworld1000');return s;}
function court(){const s=escort();talk(s,-2.9,4.5);talk(s,0,6);talk(s,0,0);assert.equal(s.chapter,'courtroom');return s;}
function cell(){const s=court();talk(s,0,-2);chooseTrial(s,true);talk(s);chooseTrial(s,false);talk(s);talk(s);assert.equal(s.chapter,'cellblock');return s;}
function fight(s){for(let n=0;n<1000&&s.mode==='battle';n++){step(s,IDLE,.05);for(const i of [0,1])if(s.players[i].atb>=1)action(s,i,'attack');}assert.equal(s.mode,'victory');leaveBattle(s);settle(s);}
function escape(wait=false){const s=cell();if(wait){for(let i=0;i<3;i++){talk(s,-3.2,-4);chooseTrial(s,true);settle(s);}talk(s,0,-6);}else{for(let i=0;i<3;i++)talk(s,0,-1.3);fight(s);}return s;}
function warden(wait=false){const s=escape(wait);talk(s,0,6);at(s,0,-.5);step(s,IDLE,.05);assert.equal(s.mode,'battle');fight(s);talk(s,0,6);assert.equal(s.chapter,'warden');return s;}
function tank(){const s=warden();talk(s,-4,2);talk(s,0,6);at(s,3.7,0);step(s,IDLE,.05);assert.equal(s.trial.encounter,'tank');return s;}

test('genuine CI13 fixture is v5 returned and old facts remain unknown',()=>{const s=deserialize(raw);assert.equal(JSON.parse(raw).version,5);assert.equal(s.rescue.stage,'returned');assert.equal(s.prologue.first,'unknown');assert.equal(s.trial.stage,'none');});
test('returned fair is not auto-advanced or overwritten on load',()=>{const s=deserialize(raw);assert.equal(interactTrial(s,0),null);step(s,IDLE,.05);assert.equal(s.chapter,'fair');assert.equal(JSON.parse(serialize(s)).version,5);});
test('enter region via the southern exit; escort is Crono and autonomous Marle, never P2 Marle',()=>{const s=escort();assert.equal(activeSlot(s,1),false);assert.equal(guestKind(s),'marle');assert.equal(s.joined,true);assert.equal(JSON.parse(s.trial.history).rescue.stage,'returned');});
test('world destination requires interaction, not walking into arbitrary room scale',()=>{const s=escort();at(s,-2.9,4.5);step(s,IDLE,.05);assert.equal(s.chapter,'overworld1000');talk(s);assert.equal(s.chapter,'guardia1000');assert(trialMap(s.chapter));});
test('court P2 cannot answer; no absent witness is invented',()=>{const s=court();assert.equal(interactTrial(s,1),null);assert.equal(guestKind(s),null);talk(s,0,-2);assert.equal(s.trial.choice,'collision');assert.throws(()=>serialize(s));chooseTrial(s,true);talk(s);chooseTrial(s,false);const e=trialEvidence(s);assert.equal(e.jurors.filter(x=>x==='unknown').length,5);assert(e.lines[0].includes('未記錄'));});
test('court answers are stored and repeated choice cannot rewrite answer',()=>{const s=court();talk(s,0,-2);chooseTrial(s,false);assert.equal(chooseTrial(s,true),null);assert.equal(s.trial.blamedMarle,true);talk(s);chooseTrial(s,true);talk(s);assert.equal(s.trial.question,3);assert.equal(s.trial.wealthMotive,true);});
test('cell cannot be walked through before the door is opened',()=>{const s=cell();at(s,0,-1.1);for(let i=0;i<120;i++)step(s,[{x:0,z:1},{x:0,z:1}],1/60);assert(s.players[0].z<=-.9);assert.equal(s.players[1].z,-1.1);assert.equal(trialMoveAllowed(s,0,0),false);});
test('three actual knocks, solo guard battle and no P2 commands during imprisonment',()=>{const s=cell();talk(s,0,-1.3);talk(s);assert.equal(s.mode,'explore');talk(s);assert.equal(s.mode,'battle');s.players[1].atb=1;assert.equal(action(s,1,'attack'),false);assert.equal(requestCombo(s,0),false);assert.throws(()=>serialize(s));fight(s);assert.equal(s.trial.route,'breakout');assert.equal(s.trial.cellOpen,true);assert.equal(s.trial.experience,30);});
test('wait choice can be declined; only three accepted days trigger Lucca rescue',()=>{const s=cell();talk(s,-3.2,-4);chooseTrial(s,false);assert.equal(s.trial.days,0);for(let i=1;i<=3;i++){talk(s,-3.2,-4);chooseTrial(s,true);assert.equal(s.trial.days,i);settle(s);}assert.equal(s.chapter,'execution');assert.equal(s.trial.route,'wait');assert(activeSlot(s,1));assert.equal(s.trial.experience,0);});
test('optional Fritz rescue is separate, persisted, and idempotent',()=>{const s=escape();talk(s,6,2.5);assert.equal(s.chapter,'execution');talk(s,2.1,2);assert(s.trial.fritzFreed);const before=serialize(s);talk(s);assert.equal(s.trial.experience,30);assert.equal(deserialize(before).trial.fritzFreed,true);});
test('Lucca joins at supervisor after solo escape; P2 settings survive',()=>{const s=warden();assert.equal(s.trial.luccaJoined,true);assert(activeSlot(s,1));assert(s.joined);assert.equal(guestKind(s),null);assert.equal(s.trial.guardsWon,true);});
test('waiting path also reaches supervisor without duplicate recruitment or fake XP',()=>{const s=warden(true);assert.equal(s.trial.luccaJoined,true);assert.equal(s.trial.experience,30);});
test('manual and supplies are distinct optional actions; supplies cannot be farmed',()=>{const s=warden(),n=s.rescue.tonics;talk(s,2.1,2);assert(s.trial.manualRead);assert.equal(s.rescue.tonics,n);talk(s,-4,2);assert.equal(s.rescue.tonics,n+2);assert.equal(s.trial.ethers,2);talk(s);assert.equal(s.trial.ethers,2);});
test('tank is in-place on a horizontal bridge, three independently targetable parts',()=>{const s=tank();assert.equal(s.chapter,'prisonbridge');assert.equal(s.enemies.length,3);assert(s.players[0].x>0);assert(s.enemies.every(e=>e.x<0));assert(trialWalkable(5,0,'prisonbridge'));assert(!trialWalkable(0,2,'prisonbridge'));const p0=selectedEnemy(s,0);cycleTarget(s,1,1);assert.equal(selectedEnemy(s,0),p0);});
test('head blocks Lucca fire without refunding MP/ATB; physical attack works',()=>{const s=tank();s.targets[1]=0;s.players[1].atb=1;const hp=s.enemies[0].hp,mp=s.players[1].mp;assert(action(s,1,'skill'));assert.equal(s.enemies[0].hp,hp);assert.equal(s.players[1].mp,mp-3);assert.equal(s.players[1].atb,0);s.players[1].atb=1;assert(action(s,1,'attack'));assert.equal(s.enemies[0].hp,hp-30);});
test('head repairs living damaged parts, not destroyed parts, and stops after head destroyed',()=>{const s=tank();s.enemies[1].hp-=60;s.enemies[2].hp=0;s.enemies[0].atb=.999;step(s,IDLE,.05);assert.equal(s.enemies[1].hp,175);assert.equal(s.enemies[2].hp,0);assert.equal(s.trial.headRepairs,1);s.enemies[0].hp=0;s.enemies[1].hp=100;for(let i=0;i<150;i++)step(s,IDLE,.05);assert.equal(s.enemies[1].hp,100);});
test('combo requires both actual ready players and does not bypass fire shield',()=>{const s=tank();s.targets=[0,0];s.players.forEach(p=>p.atb=1);const hp=s.enemies[0].hp;requestCombo(s,0);assert.equal(s.enemies[1].hp,200);requestCombo(s,1);assert.equal(s.enemies[0].hp,hp);assert.equal(s.enemies[1].hp,128);});
test('inventory atomic deduction, full/empty/readiness/defeated guards',()=>{const s=tank();s.players[0].mp=2;assert.equal(useInventory(s,'ether',0),false);assert.equal(s.trial.ethers,2);s.players[0].atb=1;assert(useInventory(s,'ether',0));assert.equal(s.trial.ethers,1);assert.equal(s.players[0].mp,12);assert.equal(s.players[0].atb,0);assert.equal(useInventory(s,'ether',0),false);s.players[0].atb=1;s.players[0].hp=0;assert.equal(useInventory(s,'ether',0),false);});
test('full HP tonic is not wasted and inactive P2 cannot consume a stock',()=>{const s=cell(),n=s.rescue.tonics;assert.equal(useInventory(s,'tonic',1),false);s.players[0].hp=120;assert.equal(useInventory(s,'tonic',0),false);assert.equal(s.rescue.tonics,n);});
test('v7 full roundtrip retains actual v5 history and stock/provenance; transient clocks reset',()=>{const s=warden();talk(s,-4,2);s.players[0].mp=0;assert(useInventory(s,'ether',0));const encoded=serialize(s),d=deserialize(encoded);assert.equal(JSON.parse(encoded).version,7);assert.equal(d.trial.history,s.trial.history);assert.equal(d.prologue.first,'unknown');assert.equal(d.trial.ethers,1);assert.equal(d.rescue.tonics,s.rescue.tonics);assert.equal(d.trial.fade,0);assert.equal(d.trial.encounter,'none');assert.equal(d.chapter,'warden');});
test('defeat retries the same fight, not falsely marking tank complete or refunding inventory',()=>{const s=tank();s.players[0].atb=1;s.players[0].mp=0;useInventory(s,'ether',0);s.mode='defeat';leaveBattle(s);settle(s);assert.equal(s.chapter,'prisonbridge');assert.equal(s.players[0].x,5);assert.equal(s.trial.tankWon,false);assert.equal(s.trial.ethers,1);assert.equal(s.trial.experience,60);});
test('tank defeat unlocks reunion, Marle does not steal P2, actual Gate reaches future',()=>{const s=tank();fight(s);assert(s.trial.tankWon);assert.equal(s.trial.experience,160);talk(s,-6.5,0);assert.equal(s.chapter,'hall1000');talk(s,0,1);assert(s.trial.marleJoined);assert.equal(guestKind(s),'marle');assert(activeSlot(s,1));talk(s,0,-6);talk(s,5.5,4);assert.equal(s.chapter,'futuregate');assert.equal(s.era,'future');assert.equal(deserialize(serialize(s)).trial.stage,'future');});
test('input boundary consumes chapter/fade/recruitment exactly once',()=>{const s=cell(),b=new InputBoundary(s);s.trial.fade=.3;assert.equal(b.consume(s),true);assert.equal(b.consume(s),false);settle(s);assert.equal(b.consume(s),true);s.trial.luccaJoined=true;assert.equal(b.consume(s),true);assert.equal(b.consume(s),false);});
for(const [name,modify] of [
 ['future without tank',o=>{o.chapter='futuregate';o.era='future';o.trial.stage='future';}],
 ['missing answer',o=>{o.trial.blamedMarle=null;}],
 ['forged XP',o=>{o.trial.experience=159;}],
 ['supply before unlocked',o=>{o.trial.suppliesTaken=false;o.trial.ethers=2;}],
 ['unreachable closed cell location',o=>{o.chapter='cellblock';o.trial.stage='cell';o.trial.cellOpen=false;o.players[0].z=4;}],
 ['nested v7 history',o=>{o.history=JSON.stringify({version:7});}],
 ['wrong era',o=>{o.era='middle';}],
 ['missing return checkpoint',o=>{const h=JSON.parse(o.history);h.rescue.stage='reunited';o.history=JSON.stringify(h);}],
 ['invalid position',o=>{o.players[0].x=999;}],
 ['fractional item count',o=>{o.tonics=.5;}],
 ['negative stock',o=>{o.trial.ethers=-1;}],
 ['stock not from real entry or chest',o=>{o.tonics=99;}],
 ['false answer type',o=>{o.trial.wealthMotive='no';}],
 ['unknown stage',o=>{o.trial.stage='completed';}],
 ['invented conviction',o=>{o.trial.verdict='guilty';}],
])test(`v7 rejects ${name}`,()=>{const s=warden();talk(s,-4,2);const o=JSON.parse(serialize(s));modify(o);assert.throws(()=>deserialize(JSON.stringify(o)));});
for(const map of ['guardia1000','hall1000','courtroom','cellblock','execution','prisonstairs','warden','prisonbridge','futuregate'])test(`${map} rejects non-finite/boundary positions`,()=>{assert(!trialWalkable(NaN,0,map));assert(!trialWalkable(0,Infinity,map));assert(!trialWalkable(99,0,map));});

test('inventory cannot mutate an earlier chapter before its boundary is enabled',()=>{const s=deserialize(raw),before=s.rescue.tonics;s.players[0].hp=1;assert.equal(useInventory(s,'tonic',0),false);assert.equal(s.rescue.tonics,before);});
test('v7 rejects prison events before arrest instead of accepting a coherent-looking forged escort',()=>{const o=JSON.parse(serialize(escort()));o.trial.knocks=3;o.trial.route='breakout';assert.throws(()=>deserialize(JSON.stringify(o)));});
test('v7 rejects flight in forest before Marle reunion',()=>{const s=tank();fight(s);const o=JSON.parse(serialize(s));o.chapter='guardia1000';assert.throws(()=>deserialize(JSON.stringify(o)));});

test('v7 rejects unreachable warden before its mandatory recruitment transition',()=>{const s=escape(true),o=JSON.parse(serialize(s));o.chapter='warden';assert.throws(()=>deserialize(JSON.stringify(o)));});
test('v7 does not allow prison supplies while still on execution rescue',()=>{const s=escape(true),o=JSON.parse(serialize(s));o.trial.suppliesTaken=true;o.trial.ethers=2;assert.throws(()=>deserialize(JSON.stringify(o)));});
