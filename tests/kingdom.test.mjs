import test from 'node:test';
import assert from 'node:assert/strict';
import * as c from '../.test/core.mjs';
const at=(s,x,z,i=0)=>Object.assign(s.players[i],{x,z});
const ticks=(s,n,input=c.IDLE)=>{for(let i=0;i<n;i++)c.step(s,input,1/60);};
const snapshot=s=>JSON.parse(c.serialize(s));
// Explicit unit fixtures, never used by a browser test or exposed as runtime test hooks.
function vista(){const s=c.createState('fair');s.chapter='canyon';s.era='middle';s.joined=true;s.fair.luccaMet=true;s.fair.telepodTested=true;s.opening={phase:'vista',elapsed:0,canyonWon:true};s.players.forEach(p=>Object.assign(p,{x:0,z:-6}));return s;}
function town(){const s=vista();c.interactOpening(s,0);assert.equal(s.chapter,'truce');return s;}
function forest(){const s=town();at(s,8,-5);c.interactKingdom(s,0);assert.equal(s.chapter,'forest');return s;}
function castle(){const s=forest();s.kingdom.forestWon=true;at(s,0,9);c.interactKingdom(s,0);assert.equal(s.chapter,'castle');return s;}
function audience(){const s=castle();at(s,-1.8,-2.5);c.interactKingdom(s,0);assert.equal(s.kingdom.phase,'audience');return s;}
function chamber(){const s=audience();at(s,8,6.6);c.interactKingdom(s,0);assert.equal(s.chapter,'chamber');return s;}
function missing(){const s=chamber();at(s,0,1);c.interactKingdom(s,0);ticks(s,140);assert.equal(s.kingdom.phase,'missing');return s;}
function reunited(){const s=missing();at(s,0,-7);c.interactKingdom(s,0);at(s,2,-3.2);c.interactKingdom(s,0);assert.equal(s.kingdom.phase,'rescue');return s;}
function walk(s,axis,target,direction,paired=false){
 const input=[{x:0,z:0},{x:0,z:0}];input[0][axis]=direction;if(paired)input[1][axis]=direction;
 let count=0;while((direction>0?s.players[0][axis]<target:s.players[0][axis]>target)&&s.mode==='explore'&&count++<700)c.step(s,input,1/60);
 assert.ok(count<700,`stuck ${s.chapter} ${axis} ${target}`);
}

test('new kingdom progress is independent and absent from old exports',()=>{const a=c.createState('fair'),b=c.createState('fair');a.kingdom.heardYear=true;assert.equal(b.kingdom.heardYear,false);assert.equal(snapshot(b).version,2);assert.equal(snapshot(b).kingdom,undefined);});
test('canyon vista continues to a real 600 AD town with inactive Marle',()=>{const s=town();assert.equal(s.era,'middle');assert.equal(s.kingdom.phase,'arrival');assert.equal(c.activeSlot(s,1),false);assert.equal(s.joined,true);assert.equal(snapshot(s).version,4);});
test('remote and P2 canyon input cannot skip to town',()=>{for(const [x,z,i] of [[0,7,0],[0,-6,1]]){const s=vista();at(s,x,z);assert.equal(c.interactOpening(s,i),null);assert.equal(s.chapter,'canyon');}});
test('resident states year without unlocking castle or reviving Marle',()=>{const s=town();at(s,-4.5,1);assert.match(c.interactKingdom(s,0).text,/六百年/);assert.equal(s.kingdom.heardYear,true);assert.equal(s.kingdom.phase,'arrival');assert.equal(c.activeSlot(s,1),false);});
test('inn restores only present actors; no damage heal through inactive slot',()=>{const s=town();s.players[0].hp=40;s.players[0].mp=2;s.players[1].hp=80;at(s,-6.5,-4);c.interactKingdom(s,0);assert.equal(s.players[0].hp,120);assert.equal(s.players[0].mp,18);assert.equal(s.players[1].hp,80);});
test('town, castle and chamber cannot start a hidden practice battle',()=>{for(const s of [town(),castle(),chamber()]){assert.equal(c.beginBattle(s),false);assert.equal(s.mode,'explore');}});
test('forest entrance is separate from canyon and fair encounter flags',()=>{const s=forest();assert.equal(s.kingdom.forestWon,false);assert.equal(s.opening.canyonWon,true);assert.equal(s.fair.gatoWon,false);ticks(s,110,[{x:0,z:1},{x:0,z:0}]);assert.equal(s.mode,'battle');assert.equal(s.enemies.length,2);assert.ok(s.enemies.every(e=>e.hp===48));});
test('forest victory preserves old flags and opens a walkable northern exit',()=>{const s=forest();c.beginBattle(s);for(let i=0;i<2;i++){ticks(s,145);assert.equal(c.action(s,0,'skill'),true);}assert.equal(s.mode,'victory');assert.equal(s.kingdom.forestWon,true);assert.equal(s.fair.gatoWon,false);c.leaveBattle(s);assert.equal(s.chapter,'forest');assert.equal(c.walkable(s.players[0].x,s.players[0].z,'forest'),true);assert.equal(c.beginBattle(s),false);});
test('forest defeat restores entry without falsely clearing encounter',()=>{const s=forest();c.beginBattle(s);ticks(s,5000);assert.equal(s.mode,'defeat');c.leaveBattle(s);assert.equal(s.kingdom.forestWon,false);assert.equal(s.players[0].z,-6);assert.equal(s.players[0].hp,120);});
test('castle exit cannot bypass uncleared forest',()=>{const s=forest();at(s,0,9);assert.match(c.interactKingdom(s,0).text,/魔物/);assert.equal(s.chapter,'forest');});
test('eastern stairs require guard audience, not a mere coordinate change',()=>{const s=castle();at(s,8,6.6);assert.equal(c.interactKingdom(s,0).title,'王城衛兵');assert.equal(s.chapter,'castle');at(s,-1.8,-2.5);c.interactKingdom(s,0);at(s,8,6.6);c.interactKingdom(s,0);assert.equal(s.chapter,'chamber');});
test('queen reunion starts disappearance but never returns Marle to player ownership',()=>{const s=chamber();at(s,0,1);assert.equal(c.interactKingdom(s,0).title,'瑪兒');assert.equal(c.cutsceneActive(s),true);assert.equal(c.activeSlot(s,1),false);assert.equal(s.kingdom.phase,'erasing');});
test('queen cinematic blocks player movement, save, map exit and co-op toggles',()=>{const s=chamber();at(s,0,1);c.interactKingdom(s,0);const p=structuredClone(s.players);ticks(s,50,[{x:1,z:-1},{x:1,z:1}]);assert.deepEqual(s.players,p);assert.throws(()=>c.serialize(s));assert.equal(c.setCoop(s,false),false);assert.equal(c.interactKingdom(s,0),null);assert.equal(c.beginBattle(s),false);});
test('disappearance resolves at bounded simulation duration',()=>{const s=chamber();at(s,0,1);c.interactKingdom(s,0);ticks(s,120);assert.equal(s.kingdom.phase,'erasing');ticks(s,13);assert.equal(s.kingdom.phase,'missing');assert.equal(s.kingdom.elapsed,0);assert.equal(c.cutsceneActive(s),false);});
test('Lucca cannot join remotely, early, or through an absent P2',()=>{const s=castle();at(s,2,-3.2);assert.equal(c.interactKingdom(s,0),null);const t=missing();at(t,2,-3.2);assert.equal(c.interactKingdom(t,1),null);assert.equal(t.kingdom.phase,'missing');});
test('Lucca really joins after castle dialogue with an independent P2 actor',()=>{const s=reunited();assert.equal(c.activeSlot(s,1),true);assert.equal(s.players[1].hp,120);assert.equal(s.players[1].mp,18);assert.equal(s.joined,true);const x=s.players[1].x,p0={...s.players[0]};ticks(s,10,[{x:0,z:0},{x:1,z:0}]);assert.ok(s.players[1].x>x);assert.deepEqual(s.players[0],p0);});
test('Lucca follows when co-op is disabled and does not get replaced by Marle',()=>{const s=reunited();c.setCoop(s,false);const x=s.players[1].x;ticks(s,70,[{x:-1,z:0},{x:0,z:0}]);assert.notEqual(s.players[1].x,x);assert.equal(s.kingdom.phase,'rescue');});
test('joined co-op waits for companion before changing map, without changing progress',()=>{const s=reunited();at(s,0,-7);at(s,6,-3,1);const before=snapshot(s);assert.equal(c.interactKingdom(s,0).title,'等待同行者');assert.deepEqual(snapshot(s),before);at(s,1,-7,1);c.interactKingdom(s,0);assert.equal(s.chapter,'forest');assert.equal(s.kingdom.phase,'rescue');});
test('v4 round trips every persistent story checkpoint and active party identity',()=>{for(const s of [town(),forest(),castle(),audience(),chamber(),missing(),reunited()]){const next=c.deserialize(c.serialize(s));assert.equal(next.chapter,s.chapter);assert.deepEqual(next.kingdom,s.kingdom);assert.equal(c.activeSlot(next,1),c.activeSlot(s,1));assert.equal(next.joined,s.joined);assert.equal(snapshot(next).version,4);}});
test('v3 canyon import stays v3 until town is entered',()=>{const s=vista(),v3=snapshot(s);assert.equal(v3.version,3);const restored=c.deserialize(JSON.stringify(v3));assert.equal(restored.kingdom.phase,'none');c.interactOpening(restored,0);assert.equal(snapshot(restored).version,4);});
test('v4 rejects transient phase, unknown phase and malformed kingdom objects',()=>{for(const k of [null,[],{}, {phase:'erasing',forestWon:true,heardYear:true},{phase:'invented',forestWon:true,heardYear:true},{phase:'arrival',forestWon:'yes',heardYear:false}]){const data=snapshot(town());data.kingdom=k;assert.throws(()=>c.deserialize(JSON.stringify(data)));}});
test('v4 rejects wrong era, missing opening, forged map and lost preconditions',()=>{for(const edit of [o=>o.era='present',o=>o.chapter='fair',o=>o.chapter='unknown',o=>o.opening.phase='lost',o=>o.opening.canyonWon=false,o=>o.fair.telepodTested=false,o=>delete o.opening]){const o=snapshot(reunited());edit(o);assert.throws(()=>c.deserialize(JSON.stringify(o)));}});
test('v4 rejects audience and rescue without forest victory',()=>{for(const phase of ['audience','missing','rescue']){const o=snapshot(town());o.kingdom.phase=phase;assert.throws(()=>c.deserialize(JSON.stringify(o)));}});
test('v4 rejects arrival inside private queen chamber and invalid coordinates',()=>{const o=snapshot(chamber());o.kingdom.phase='arrival';assert.throws(()=>c.deserialize(JSON.stringify(o)));const q=snapshot(town());q.players[0].x=-7;q.players[0].z=4;assert.throws(()=>c.deserialize(JSON.stringify(q)));});
test('v4 rejects excessive party separation only when Lucca is actually present',()=>{const o=snapshot(reunited());o.players[0]={x:-10,z:-7,hp:120,mp:18};o.players[1]={x:10,z:-7,hp:120,mp:18};assert.throws(()=>c.deserialize(JSON.stringify(o)));o.kingdom.phase='missing';assert.equal(c.activeSlot(c.deserialize(JSON.stringify(o)),1),false);});
test('v4 unknown keys do not overwrite party identity or core rules',()=>{const o=snapshot(town());o.kingdom.luccaJoined=true;o.players[1].atb=1;o.mode='victory';const s=c.deserialize(JSON.stringify(o));assert.equal(c.activeSlot(s,1),false);assert.equal(s.mode,'explore');assert.equal(s.players[1].atb,0);});
test('forest and indoor collision agree with modeled footprints',()=>{for(const [map,x,z] of [['truce',-7,4],['forest',-8,-4],['castle',6,1],['chamber',-6,4]]){assert.equal(c.walkable(x,z,map),false);assert.equal(c.walkable(0,-5,map),true);assert.equal(c.walkable(Infinity,0,map),false);assert.equal(c.walkable(0,-9,map),false);}});
test('combat effects carry presentation metadata without changing damage or resources',()=>{const s=forest();c.beginBattle(s);ticks(s,145);const before={...s.players[0]};assert.equal(c.action(s,0,'attack'),true);assert.equal(s.enemies[0].hp,18);assert.equal(s.players[0].mp,before.mp);const fx=s.effects.at(-1);assert.equal(fx.actor,0);assert.equal(fx.style,'slash');assert.deepEqual(fx.origin,{x:before.x,z:before.z});});
test('completed forest remains cleared across backtracking and save reload',()=>{const s=reunited();at(s,0,-7);at(s,1,-7,1);c.interactKingdom(s,0);const re=c.deserialize(c.serialize(s));ticks(re,15);assert.equal(re.mode,'explore');assert.equal(re.kingdom.forestWon,true);});
test('full route from old canyon exit to Lucca and cathedral boundary uses normal movement',()=>{
 const s=town();walk(s,'z',1,-1);walk(s,'x',-4.5,-1);assert.match(c.interactKingdom(s,0).text,/六百年/);
 // Return to central road before walking around the inn footprint.
 walk(s,'x',0,1);walk(s,'z',-4.3,-1);walk(s,'x',-6.5,-1);assert.equal(c.interactKingdom(s,0).title,'托魯斯旅店');
 walk(s,'x',7.3,1);c.interactKingdom(s,0);assert.equal(s.chapter,'forest');
 walk(s,'z',1,1);assert.equal(s.mode,'battle');for(let i=0;i<2;i++){ticks(s,145);c.action(s,0,'skill');}c.leaveBattle(s);
 walk(s,'x',0,1);walk(s,'z',8.2,1);c.interactKingdom(s,0);assert.equal(s.chapter,'castle');
 walk(s,'z',-2.6,1);walk(s,'x',-1,-1);c.interactKingdom(s,0);assert.equal(s.kingdom.phase,'audience');
 walk(s,'z',4,1);walk(s,'x',8,1);walk(s,'z',6.2,1);c.interactKingdom(s,0);assert.equal(s.chapter,'chamber');
 walk(s,'z',.6,1);c.interactKingdom(s,0);ticks(s,140);assert.equal(s.kingdom.phase,'missing');
 walk(s,'z',-6.8,-1);c.interactKingdom(s,0);assert.equal(s.chapter,'castle');
 walk(s,'z',-3.2,-1);walk(s,'x',2.5,-1);c.interactKingdom(s,0);assert.equal(s.kingdom.phase,'rescue');
 walk(s,'x',0,-1,true);walk(s,'z',-6.8,-1,true);c.interactKingdom(s,0);assert.equal(s.chapter,'forest');
 walk(s,'z',.5,-1,true);walk(s,'x',-9,-1,true);assert.equal(c.interactKingdom(s,0).title,'西方的修道院');
 assert.equal(c.deserialize(c.serialize(s)).kingdom.phase,'rescue');
});
