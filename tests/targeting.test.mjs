import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,beginBattle,selectedEnemy,cycleTarget,action,leaveBattle,serialize,deserialize,step,IDLE} from '../.test/core.mjs';
const battle=()=>{const s=createState('lab');s.joined=true;beginBattle(s);return s;};
test('default target preserves nearest living enemy behavior',()=>{const s=battle();assert.equal(selectedEnemy(s,0),0);assert.equal(selectedEnemy(s,1),1);});
test('players choose different targets independently before ATB fills',()=>{const s=battle(),before=structuredClone(s.players);assert.equal(cycleTarget(s,0,1),true);assert.equal(selectedEnemy(s,0),1);assert.equal(selectedEnemy(s,1),1);assert.deepEqual(s.targets,[1,null]);assert.deepEqual(s.players,before);assert.equal(cycleTarget(s,1,1),true);assert.deepEqual(s.targets,[1,0]);});
test('target selection wraps forward and backward without resource costs',()=>{const s=battle();cycleTarget(s,0,-1);assert.equal(s.targets[0],1);cycleTarget(s,0,1);assert.equal(s.targets[0],0);assert.equal(s.players[0].mp,18);assert.equal(s.players[0].atb,0);});
test('explicit target receives damage, not the nearer enemy',()=>{const s=battle();cycleTarget(s,0,1);s.players[0].atb=1;assert.equal(action(s,0,'attack'),true);assert.deepEqual(s.enemies.map(e=>e.hp),[90,60]);assert.equal(s.players[0].atb,0);assert.equal(s.players[1].atb,0);});
test('dead selected targets fall back to an alive target without wasting action',()=>{const s=battle();cycleTarget(s,0,1);s.enemies[1].hp=0;s.players[0].atb=1;assert.equal(selectedEnemy(s,0),0);assert.equal(action(s,0,'skill'),true);assert.equal(s.enemies[0].hp,42);assert.equal(s.players[0].mp,15);});
test('target cycling skips dead enemies and can retain sole living target',()=>{const s=battle();s.enemies[1].hp=0;cycleTarget(s,0,1);assert.equal(s.targets[0],0);cycleTarget(s,0,-1);assert.equal(s.targets[0],0);});
test('no living enemy produces no target and no cycling',()=>{const s=battle();s.enemies.forEach(e=>e.hp=0);assert.equal(selectedEnemy(s,0),null);assert.equal(cycleTarget(s,0,1),false);});
test('exploration and unjoined player cannot select targets',()=>{const s=createState();assert.equal(cycleTarget(s,0,1),false);beginBattle(s);assert.equal(cycleTarget(s,1,1),false);});
test('dead actor and inactive story companion cannot issue target commands',()=>{const s=battle();s.players[0].hp=0;assert.equal(cycleTarget(s,0,1),false);s.chapter='canyon';s.opening.phase='canyon';assert.equal(cycleTarget(s,1,1),false);});
test('invalid direction and cinematic interaction are rejected',()=>{const s=battle();assert.equal(cycleTarget(s,0,0),false);s.opening.phase='resonance';assert.equal(cycleTarget(s,0,1),false);});
test('leaving and starting an encounter reset transient targets',()=>{const s=battle();cycleTarget(s,0,1);leaveBattle(s);assert.deepEqual(s.targets,[null,null]);beginBattle(s);assert.deepEqual(s.targets,[null,null]);});
test('old save format remains unchanged and ignores untrusted target keys',()=>{const s=createState('lab'),raw=JSON.parse(serialize(s));assert.equal(raw.version,1);assert.equal('targets' in raw,false);raw.targets=[999,-7];assert.deepEqual(deserialize(JSON.stringify(raw)).targets,[null,null]);});
test('target selection does not advance ATB or mutate enemy position',()=>{const s=battle(),before=structuredClone(s.enemies);cycleTarget(s,0,1);assert.deepEqual(s.enemies,before);for(let i=0;i<143;i++)step(s,IDLE,1/60);assert.equal(s.players[0].atb,1);assert.equal(selectedEnemy(s,0),1);});
test('new reference browser approach avoids stalls using actual co-op movement',()=>{
 const s=createState('fair');s.joined=true;
 for(const [axis,target,vector,greater] of [['z',-2,{x:0,z:1},true],['x',-6.8,{x:-1,z:0},false],['z',2.5,{x:0,z:1},true]]){
  let count=0;while(greater?s.players[0][axis]<target:s.players[0][axis]>target){step(s,[vector,vector],1/60);if(++count>400)assert.fail(`approach blocked at ${axis}: ${JSON.stringify(s.players)}`);}
 }
 assert.ok(Math.hypot(s.players[0].x+7,s.players[0].z-3.4)<2.05);
});
