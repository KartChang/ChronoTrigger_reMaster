import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {visibleSegment,findRoute} from '../.test/navigation.mjs';
const chestRoute=JSON.parse(readFileSync(new URL('./rescue-route.json',import.meta.url),'utf8'));
import * as c from '../.test/core.mjs';
import {RESCUE_POINTS,RESCUE_SOLIDS,rescueWalkable,guestIdentity,nearestRescue} from '../.test/rescue-data.mjs';
const tick=(s,n,input=c.IDLE)=>{for(let i=0;i<n;i++)c.step(s,input,1/60);};
const place=(s,x,z)=>s.players.forEach((p,i)=>Object.assign(p,{x:x+i*1.3,z}));
// Synthetic unit fixtures only. The browser uses an unmodified preceding-run player export.
function seed(){const s=c.createState('forest');s.era='middle';s.joined=true;s.kingdom={phase:'rescue',heardYear:true,forestWon:true,elapsed:0};s.opening={phase:'vista',canyonWon:true,elapsed:0};s.fair.luccaMet=true;s.fair.telepodTested=true;place(s,-8.4,.5);return s;}
function enter(){const s=seed();assert.match(c.interactKingdom(s,0).title,/修道院/);assert.equal(s.chapter,'cathedral');return s;}
function allied(){const s=enter();s.rescue.stage='cleared';place(s,.5,4.4);c.interactRescue(s,0);assert.equal(c.guestKind(s),'frog');return s;}
function passage(){const s=allied();place(s,-6.8,5.8);c.interactRescue(s,0);place(s,4,8.6);c.interactRescue(s,0);assert.equal(s.chapter,'passage');return s;}
function sanctum(){const s=passage();s.rescue.guardsWon=true;place(s,0,8.3);c.interactRescue(s,0);assert.equal(s.chapter,'sanctum');return s;}
function roundTrip(s){const raw=c.serialize(s),r=c.deserialize(raw);assert.deepEqual(JSON.parse(c.serialize(r)),JSON.parse(raw));return r;}
function battle(s){let iterations=0;while(s.mode==='battle'&&iterations++<2400){c.step(s,c.IDLE,1/60);for(const i of [0,1])if(s.mode==='battle'&&s.players[i].atb>=1)c.action(s,i,s.players[i].mp>=3?'skill':'attack');}assert.equal(s.mode,'victory',JSON.stringify({stage:s.rescue.stage,players:s.players,guest:s.rescue.guest,enemies:s.enemies}));return iterations;}
function walk(s,axis,target,paired=true){const sign=Math.sign(target-s.players[0][axis]),input=[{x:0,z:0},{x:0,z:0}];input[0][axis]=sign;if(paired)input[1][axis]=sign;let n=0;while(s.mode==='explore'&&(sign>0?s.players[0][axis]<target:s.players[0][axis]>target)&&n++<1600)c.step(s,input,1/60);assert.ok(n<1600,`${s.chapter} blocked ${axis} ${target}: ${JSON.stringify(s.players)}`);assert.ok(s.players.every(p=>c.walkable(p.x,p.z,s.chapter)));}

test('rescue state is independent and absent from pre-cathedral v1-v4 exports',()=>{const a=c.createState(),b=c.createState();a.rescue.tonics=3;assert.equal(b.rescue.tonics,0);assert.equal(JSON.parse(c.serialize(seed())).rescue,undefined);assert.equal(JSON.parse(c.serialize(seed())).version,4);});
test('forest passage enters a real cathedral and upgrades only new progress to v5',()=>{const s=enter();assert.equal(s.rescue.stage,'entered');assert.equal(JSON.parse(c.serialize(s)).version,5);assert.equal(c.guestKind(s),null);roundTrip(s);});
test('cathedral access cannot skip Lucca joining or a distant second player',()=>{const s=seed();s.kingdom.phase='audience';assert.match(c.interactKingdom(s,0).text,/王城/);assert.equal(s.chapter,'forest');const t=seed();Object.assign(t.players[1],{x:-2,z:.5});assert.equal(c.interactKingdom(t,0).title,'等待同行者');assert.equal(t.rescue.stage,'none');});
test('P2 cannot advance investigation or join Frog',()=>{const s=enter();place(s,0,1.8);c.interactRescue(s,1);assert.equal(s.mode,'explore');assert.equal(s.rescue.stage,'entered');s.rescue.stage='cleared';place(s,.5,4.4);c.interactRescue(s,1);assert.equal(c.guestKind(s),null);});
test('crest reveals a real three-enemy ambush and cannot replay during battle',()=>{const s=enter();place(s,0,1.8);c.interactRescue(s,0);assert.equal(s.mode,'battle');assert.deepEqual(s.enemies.map(e=>e.kind),['naga','naga','naga']);assert.equal(c.interactRescue(s,0),null);assert.equal(c.beginBattle(s),false);assert.throws(()=>c.serialize(s));});
test('ambush win exposes Frog but does not secretly add him before dialogue',()=>{const s=enter();c.beginBattle(s);battle(s);assert.equal(s.rescue.stage,'cleared');assert.equal(c.guestKind(s),null);c.leaveBattle(s);assert.equal(c.beginBattle(s),false);place(s,.5,4.4);assert.match(c.interactRescue(s,0).title,/青蛙/);assert.equal(c.guestKind(s),'frog');assert.equal(s.players.length,2);assert.equal(s.rescue.guest.hp,140);roundTrip(s);});
test('ambush defeat does not award victory, join Frog or allow midbattle exit',()=>{const s=enter();c.beginBattle(s);c.leaveBattle(s);assert.equal(s.mode,'battle');s.players.forEach(p=>p.hp=1);s.enemies.forEach(e=>e.atb=1);tick(s,1);assert.equal(s.mode,'defeat');c.leaveBattle(s);assert.equal(s.rescue.stage,'entered');assert.equal(s.rescue.guardsWon,false);assert.equal(s.players[0].hp,120);assert.equal(c.beginBattle(s),true);});
test('organ remains locked until Frog joins and opens only once without moving players',()=>{const s=enter();place(s,-6.8,5.8);c.interactRescue(s,0);assert.equal(s.rescue.organOpen,false);s.rescue.stage='cleared';c.interactRescue(s,0);assert.equal(s.rescue.organOpen,false);const a=allied();place(a,-6.8,5.8);const positions=structuredClone(a.players);c.interactRescue(a,0);assert.equal(a.rescue.organOpen,true);assert.deepEqual(a.players,positions);assert.match(c.interactRescue(a,0).text,/已經/);});
test('hidden door enforces organ and party proximity rather than only coordinates',()=>{const s=allied();place(s,4,8.6);assert.match(c.interactRescue(s,0).text,/機關/);s.rescue.organOpen=true;s.players[1].x=10;assert.equal(c.interactRescue(s,0).title,'等待同行者');assert.equal(s.chapter,'cathedral');place(s,4,8.6);c.interactRescue(s,0);assert.equal(s.chapter,'passage');});
test('supply chest grants exactly three tonics and never refills spent stock',()=>{const s=passage();place(s,-7,-6.1);c.interactRescue(s,0);assert.equal(s.rescue.tonics,3);s.rescue.tonics=1;c.interactRescue(s,0);assert.equal(s.rescue.tonics,1);roundTrip(s);});
test('tonic checks ATB, life, missing HP and stock; no premature spending',()=>{const s=passage();s.rescue.chestOpened=true;s.rescue.tonics=3;c.beginBattle(s);assert.equal(c.useTonic(s,0),false);assert.equal(s.rescue.tonics,3);s.players[0].atb=1;assert.equal(c.useTonic(s,0),false);s.players[0].hp=60;s.players[0].atb=.5;assert.equal(c.useTonic(s,0),false);s.players[0].atb=1;const mp=s.players[0].mp;s.combo[0]=true;assert.equal(c.useTonic(s,0),true);assert.equal(s.players[0].hp,110);assert.equal(s.players[0].mp,mp);assert.equal(s.players[0].atb,0);assert.equal(s.combo[0],false);assert.equal(s.rescue.tonics,2);});
test('Frog walks as an independent third actor without controlling P2',()=>{const s=allied();const p0={...s.players[0]},p2={...s.players[1]},g={...s.rescue.guest};Object.assign(s.rescue.guest,{x:0,z:-5});tick(s,60);assert.deepEqual(s.players[0],{...p0,walking:false});assert.deepEqual(s.players[1],{...p2,walking:false});assert.ok(s.rescue.guest.z>-5);assert.ok(c.walkable(s.rescue.guest.x,s.rescue.guest.z,s.chapter));assert.notEqual(g,s.rescue.guest);});
test('Frog ATB independently attacks and damages a real enemy',()=>{const s=passage();c.beginBattle(s);const hp=s.enemies.map(e=>e.hp);tick(s,160);assert.equal(s.rescue.guest.atb<.1,true);assert.equal(s.enemies.reduce((n,e)=>n+e.hp,0),hp.reduce((a,b)=>a+b,0)-26);assert.ok(s.effects.some(e=>e.guest&&e.text==='26'));assert.ok(s.players.every(p=>p.atb===1));});
test('Frog spends MP and ATB to heal a wounded live ally, not resurrect a fallen one',()=>{const s=passage();c.beginBattle(s);s.players[0].hp=24;s.players[1].hp=0;tick(s,160);assert.equal(s.players[0].hp,60);assert.equal(s.players[1].hp,0);assert.equal(s.rescue.guest.mp,13);assert.ok(s.effects.some(e=>e.guest&&e.kind==='heal'));});
test('Frog with insufficient MP attacks instead of producing a free heal',()=>{const s=passage();c.beginBattle(s);s.players[0].hp=20;s.rescue.guest.mp=2;tick(s,160);assert.equal(s.players[0].hp,20);assert.equal(s.rescue.guest.mp,2);assert.ok(s.effects.some(e=>e.guest&&e.kind==='hit'));});
test('dead Frog neither charges ATB nor heals/attacks; two healthy players may continue',()=>{const s=passage();c.beginBattle(s);s.rescue.guest.hp=0;tick(s,180);assert.equal(s.rescue.guest.atb,0);assert.equal(s.mode,'battle');assert.ok(!s.effects.some(e=>e.guest));});
test('both human characters falling does not end battle while Frog survives',()=>{const s=passage();c.beginBattle(s);s.players.forEach(p=>p.hp=0);tick(s,160);assert.equal(s.mode,'battle');assert.ok(s.effects.some(e=>e.guest));s.rescue.guest.hp=0;tick(s,1);assert.equal(s.mode,'defeat');});
test('enemy turn rotation includes the real third actor',()=>{const s=passage();c.beginBattle(s);s.enemies.forEach(e=>e.atb=1);tick(s,1);assert.deepEqual(s.players.map(p=>p.hp),[108,108]);assert.equal(s.rescue.guest.hp,128);});
test('guard battle completion is independent from ambush, forest and boss state',()=>{const s=passage();c.beginBattle(s);battle(s);assert.equal(s.rescue.guardsWon,true);assert.equal(s.rescue.yakraWon,false);assert.equal(s.kingdom.forestWon,true);assert.equal(s.rescue.stage,'allied');c.leaveBattle(s);assert.equal(c.beginBattle(s),false);roundTrip(s);});
test('boss room door blocks before guards are defeated',()=>{const s=passage();place(s,0,8.4);assert.match(c.interactRescue(s,0).text,/魔物/);assert.equal(s.chapter,'passage');});
test('Yakra has a separate named boss encounter and readable periodic party attack',()=>{const s=sanctum();place(s,0,3.9);assert.match(c.interactRescue(s,0).title,/真面目/);assert.equal(s.enemies.length,1);assert.equal(s.enemies[0].kind,'yakra');assert.equal(s.enemies[0].hp,720);s.rescue.enemyActions=2;s.enemies[0].atb=1;tick(s,1);assert.deepEqual(s.players.map(p=>p.hp),[108,108]);assert.equal(s.rescue.guest.hp,128);assert.match(s.log.at(-1),/尖刺/);});
test('Yakra can be defeated using normal ATB without manufactured state or infinite resources',()=>{const s=sanctum();c.beginBattle(s);const n=battle(s);assert.ok(n>180);assert.equal(s.rescue.yakraWon,true);assert.equal(s.rescue.stage,'allied');assert.ok(s.players.every(p=>p.mp>=0));c.leaveBattle(s);assert.equal(c.beginBattle(s),false);});
test('queen cannot be freed early; prisoner rescue cannot preempt the boss',()=>{const s=sanctum();place(s,-2.5,7.3);c.interactRescue(s,0);assert.equal(s.rescue.stage,'allied');place(s,7.8,6.5);c.interactRescue(s,0);assert.equal(s.rescue.chancellorFreed,false);});
test('queen and real chancellor have separately persisted rescue events',()=>{const s=sanctum();c.beginBattle(s);battle(s);c.leaveBattle(s);place(s,7.8,6.5);c.interactRescue(s,0);assert.equal(s.rescue.chancellorFreed,true);assert.equal(s.rescue.stage,'allied');place(s,-2.5,7.3);c.interactRescue(s,0);assert.equal(s.rescue.stage,'rescued');assert.equal(c.guestKind(s),'frog');roundTrip(s);});
test('escort is an explicit exit event, Frog leaves and Marle returns only in her room',()=>{const s=sanctum();s.rescue.yakraWon=true;s.rescue.stage='rescued';place(s,0,-7);c.interactRescue(s,0);assert.equal(s.chapter,'castle');assert.equal(s.rescue.stage,'homecoming');assert.equal(c.guestKind(s),null);assert.equal(c.activeSlot(s,1),true);place(s,8,6.5);c.interactKingdom(s,0);assert.equal(s.chapter,'chamber');place(s,0,.9);assert.match(c.interactKingdom(s,0).title,/瑪兒/);assert.equal(c.guestKind(s),'marle');assert.equal(s.rescue.stage,'reunited');assert.equal(s.kingdom.phase,'rescue');roundTrip(s);});
test('return gate requires reunion, correct location, P1 and a nearby P2',()=>{const s=allied();s.chapter='canyon';place(s,0,8);assert.equal(c.interactOpening(s,1),null);assert.equal(c.interactOpening(s,0),null);s.rescue.stage='reunited';s.rescue.organOpen=s.rescue.guardsWon=s.rescue.yakraWon=true;assert.equal(c.interactOpening(s,1),null);s.players[1].z=2;assert.equal(c.interactOpening(s,0).title,'等待同行者');place(s,0,8);assert.match(c.interactOpening(s,0).title,/1000/);assert.equal(s.chapter,'fair');assert.equal(s.era,'present');assert.equal(c.guestKind(s),'marle');assert.equal(s.rescue.stage,'returned');roundTrip(s);});
test('returned fair cannot restart the disappearance or practice fight',()=>{const s=allied();s.rescue.stage='returned';s.rescue.organOpen=s.rescue.guardsWon=s.rescue.yakraWon=true;s.chapter='fair';s.era='present';place(s,0,6.2);assert.match(c.interactFair(s,0).title,/回到/);assert.equal(c.beginBattle(s),false);assert.equal(s.opening.phase,'vista');});
test('new input boundary consumes a rescue stage change exactly once',async()=>{const {InputBoundary}=await import('../.test/input-boundary.mjs');const s=enter(),b=new InputBoundary(s);s.rescue.stage='cleared';assert.equal(b.consume(s),true);assert.equal(b.consume(s),false);});
test('v5 includes white-listed guest state and excludes ATB, targeting, plans and effects',()=>{const s=passage();s.rescue.guest.atb=.99;s.rescue.enemyActions=999;s.rescue.guestPlan.path=[{x:0,z:0}];const o=JSON.parse(c.serialize(s));assert.deepEqual(Object.keys(o.rescue.guest).sort(),['hp','mp','x','z']);assert.ok(!('guestPlan'in o.rescue));assert.ok(!('encounter'in o.rescue));const t=roundTrip(s);assert.equal(t.rescue.guest.atb,0);assert.equal(t.rescue.enemyActions,0);assert.equal(t.rescue.encounter,'none');});
for(const [label,edit] of [
 ['missing rescue',o=>delete o.rescue],['array progress',o=>o.rescue=[]],['unknown stage',o=>o.rescue.stage='fake'],['none stage',o=>o.rescue.stage='none'],
 ['missing Lucca',o=>o.kingdom.phase='missing'],['wrong era',o=>o.era='present'],['wrong map',o=>o.chapter='fair'],['unopened passage',o=>o.rescue.organOpen=false],
 ['boss before guards',o=>{o.rescue.yakraWon=true;o.rescue.guardsWon=false;}],['rescue before boss',o=>o.rescue.stage='rescued'],['prisoner before boss',o=>o.rescue.chancellorFreed=true],
 ['early stage with organ',o=>o.rescue.stage='entered'],['fractional medicine',o=>{o.rescue.chestOpened=true;o.rescue.tonics=1.5;}],['unearned medicine',o=>o.rescue.tonics=3],['excess medicine',o=>{o.rescue.chestOpened=true;o.rescue.tonics=4;}],
 ['negative guest HP',o=>o.rescue.guest.hp=-1],['excess guest HP',o=>o.rescue.guest.hp=999],['guest in a wall',o=>o.rescue.guest.x=100],['guest wrong type',o=>o.rescue.guest.mp='16'],['missing guest',o=>delete o.rescue.guest]
])test(`v5 rejects ${label} without changing the source state`,()=>{const s=passage(),before=c.serialize(s),o=JSON.parse(before);edit(o);assert.throws(()=>c.deserialize(JSON.stringify(o)));assert.equal(c.serialize(s),before);});
test('v5 ignores unknown object keys rather than restoring runtime internals',()=>{const s=passage(),o=JSON.parse(c.serialize(s));o.rescue.encounter='yakra';o.rescue.guest.atb=1;o.rescue.guestPlan={path:[{x:99,z:99}]};const r=c.deserialize(JSON.stringify(o));assert.equal(r.rescue.encounter,'none');assert.equal(r.rescue.guest.atb,0);});
test('every rescue interact marker is reachable in collision space; solids reject centres',()=>{for(const map of ['cathedral','passage','sanctum']){for(const p of RESCUE_POINTS[map])assert.equal(rescueWalkable(p.x,p.z,map),true,`${map}/${p.id}`);for(const b of RESCUE_SOLIDS[map])assert.equal(rescueWalkable(b.x,b.z,map),false);assert.equal(rescueWalkable(NaN,0,map),false);}});
test('Frog/Marle identity follows persisted stage rather than renderer assumptions',()=>{const r=enter().rescue;for(const [stage,id] of [['entered',null],['cleared',null],['allied','frog'],['rescued','frog'],['homecoming',null],['reunited','marle'],['returned','marle']]){r.stage=stage;assert.equal(guestIdentity(r),id);}});

test('full paired cathedral rescue and return to 1000 AD uses walk, battle, dialogue and save APIs',()=>{
 let s=enter();walk(s,'z',1);c.interactRescue(s,0);battle(s);c.leaveBattle(s);
 walk(s,'z',4.4);walk(s,'x',.5);c.interactRescue(s,0);assert.equal(c.guestKind(s),'frog');
 walk(s,'z',5.8);walk(s,'x',-6.8);c.interactRescue(s,0);assert.equal(s.rescue.organOpen,true);
 walk(s,'x',4);walk(s,'z',8.6);c.interactRescue(s,0);assert.equal(s.chapter,'passage');s=roundTrip(s);
 for(const waypoint of chestRoute.waypoints)walk(s,waypoint.axis,waypoint.target);c.interactRescue(s,0);assert.equal(s.rescue.tonics,3);
 walk(s,'x',0);walk(s,'z',.5);battle(s);c.leaveBattle(s);walk(s,'x',0);walk(s,'z',8.3);c.interactRescue(s,0);assert.equal(s.chapter,'sanctum');
 walk(s,'z',3.8);c.interactRescue(s,0);battle(s);c.leaveBattle(s);assert.equal(s.rescue.yakraWon,true);
 walk(s,'z',5.8);walk(s,'x',7.8);c.interactRescue(s,0);assert.equal(s.rescue.chancellorFreed,true);
 walk(s,'x',-2.5);walk(s,'z',6.8);c.interactRescue(s,0);assert.equal(s.rescue.stage,'rescued');s=roundTrip(s);
 walk(s,'z',5.5);walk(s,'x',0);walk(s,'z',-6.9);c.interactRescue(s,0);assert.equal(s.rescue.stage,'homecoming');
 walk(s,'z',4);walk(s,'x',8);walk(s,'z',6.2);c.interactKingdom(s,0);walk(s,'z',.9);c.interactKingdom(s,0);assert.equal(c.guestKind(s),'marle');s=roundTrip(s);
 walk(s,'z',-6.8);c.interactKingdom(s,0);walk(s,'z',4);walk(s,'x',0);walk(s,'z',-6.8);c.interactKingdom(s,0);assert.equal(s.chapter,'forest');
 walk(s,'z',-6.8);c.interactKingdom(s,0);assert.equal(s.chapter,'truce');walk(s,'x',0);walk(s,'z',7.6);c.interactKingdom(s,0);assert.equal(s.chapter,'canyon');
 walk(s,'z',8);c.interactOpening(s,0);assert.equal(s.rescue.stage,'returned');assert.equal(s.chapter,'fair');assert.equal(s.rescue.chancellorFreed,true);assert.equal(c.guestKind(s),'marle');roundTrip(s);
});


// Synthetic unit fixtures reproduce input latency without certifying a browser.
test('CI16 south chest edge stays solid; extending the blocked westward hold cannot cross it',()=>{
 const s=passage();walk(s,'z',-6.15);
 tick(s,4,[{x:0,z:1},{x:0,z:1}]); // release arrives four fixed ticks after observation
 assert.ok(s.players[0].z>-5.95);
 tick(s,300,[{x:-1,z:0},{x:-1,z:0}]);
 assert.ok(s.players[0].x>-6 && s.players[0].x<-5.5);
 assert.equal(nearestRescue(s.players[0].x,s.players[0].z,'passage',s.rescue)?.id,'chest');
 const stopped=s.players.map(p=>({x:p.x,z:p.z}));
 tick(s,300,[{x:-1,z:0},{x:-1,z:0}]);
 assert.deepEqual(s.players.map(p=>({x:p.x,z:p.z})),stopped);
 assert.equal(s.rescue.chestOpened,false);assert.equal(s.rescue.tonics,0);
});

test('shared chest approach follows a visible collision-safe segment, not the chest interior',()=>{
 const s=passage();let from={x:s.players[0].x,z:s.players[0].z};
 for(const w of chestRoute.waypoints){const to={...from,[w.axis]:w.target};
  assert.ok(visibleSegment(from,to,(x,z)=>rescueWalkable(x,z,'passage')));from=to;}
 assert.equal(nearestRescue(from.x,from.z,'passage',s.rescue)?.id,chestRoute.interaction.id);
 assert.equal(rescueWalkable(-7,-5,'passage'),false);
});

for(const paired of [false,true])for(const releaseTicks of [0,3,8])
test(`shared chest approach survives ${releaseTicks} delayed release ticks; ${paired?'paired':'solo follower'}; keeps one-time v5 stock`,()=>{
 let s=passage();s.joined=paired;
 for(const w of chestRoute.waypoints){
  const direction=Math.sign(w.target-s.players[0][w.axis]);walk(s,w.axis,w.target,paired);
  if(direction){const input=[{x:0,z:0},{x:0,z:0}];input[0][w.axis]=direction;if(paired)input[1][w.axis]=direction;tick(s,releaseTicks,input);}
  assert.ok(s.players.every(p=>c.walkable(p.x,p.z,s.chapter)));
 }
 assert.equal(c.interactRescue(s,0).title,'找到回復藥');assert.equal(s.rescue.tonics,3);assert.equal(s.rescue.chestOpened,true);
 c.interactRescue(s,0);assert.equal(s.rescue.tonics,3);s=roundTrip(s);
 c.interactRescue(s,0);assert.equal(s.rescue.tonics,3);assert.equal(s.players.length,2);
 walk(s,'x',0,paired);assert.equal(s.mode,'explore');assert.equal(s.rescue.guardsWon,false);
});

for(const map of ['cathedral','passage','sanctum'])
test(`${map} interactions have collision-checked routes from the south entrance (not only walkable markers)`,()=>{
 for(const p of RESCUE_POINTS[map]){
  const walkable=(x,z)=>rescueWalkable(x,z,map),start={x:0,z:-6.8};
  const route=findRoute(start,p,walkable,.5);
  assert.ok(['found','arrived'].includes(route.reason),`${map}/${p.id}: ${route.reason}`);
  let from=start;for(const to of route.points){assert.ok(visibleSegment(from,to,walkable));from=to;}
  assert.ok(Math.hypot(from.x-p.x,from.z-p.z)<chestRoute.interaction.radius,`${map}/${p.id}`);
 }
});
