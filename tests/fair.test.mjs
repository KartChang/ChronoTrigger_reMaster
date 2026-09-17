import test from 'node:test';
import assert from 'node:assert/strict';
import * as c from '../.test/core.mjs';
const at=(s,x,z,slot=0)=>Object.assign(s.players[slot],{x,z});
const tick=(s,n=150,input=c.IDLE)=>{for(let i=0;i<n;i++)c.step(s,input,1/60);};
const data=()=>JSON.parse(c.serialize(c.createState('fair')));

test('fair starts at post-meeting checkpoint with independent fresh flags',()=>{const a=c.createState('fair'),b=c.createState('fair');a.fair.bellHeard=true;assert.equal(b.fair.bellHeard,false);assert.equal(a.chapter,'fair');assert.equal(a.mode,'explore');});
test('fair uses authored stall footprints rather than village walls and river',()=>{assert.equal(c.walkable(7.5,-1.5,'fair'),false);assert.equal(c.walkable(-8,-5.8,'fair'),false);assert.equal(c.walkable(-8,2,'fair'),true);assert.equal(c.walkable(10,3,'fair'),true);assert.equal(c.walkable(99,0,'fair'),false);});
test('actual simulated movement cannot pass through a fair stall',()=>{const s=c.createState('fair');at(s,7.5,-4);tick(s,150,[{x:0,z:1},{x:0,z:0}]);assert.ok(s.players[0].z < -3);});
test('fair central route does not trigger the old automatic slime encounter',()=>{const s=c.createState('fair');at(s,0,2);tick(s,40,[{x:0,z:1},{x:0,z:0}]);assert.equal(s.mode,'explore');assert.equal(s.enemies.length,0);});
test('distant interaction cannot set chapter flags',()=>{const s=c.createState('fair');c.interactFair(s,0);assert.equal(s.fair.bellHeard,false);assert.equal(s.fair.luccaMet,false);});
test('bell is repeatable without unrelated event changes',()=>{const s=c.createState('fair');at(s,-3.5,-1);c.interactFair(s,0);c.interactFair(s,0);assert.equal(s.fair.bellHeard,true);assert.equal(s.fair.telepodTested,false);});
test('unjoined P2 cannot interact with fair events',()=>{const s=c.createState('fair');at(s,-3.5,-1,1);assert.equal(c.interactFair(s,1),null);assert.equal(s.fair.bellHeard,false);});
test('joined P2 can independently interact with bell',()=>{const s=c.createState('fair');s.joined=true;at(s,-3.5,-1,1);c.interactFair(s,1);assert.equal(s.fair.bellHeard,true);});
test('telepod requires prior Lucca dialogue without moving anyone',()=>{const s=c.createState('fair');at(s,-2.4,9);const before=structuredClone(s.players);c.interactFair(s,0);assert.deepEqual(s.players,before);assert.equal(s.fair.telepodTested,false);});
test('Lucca demonstration does not require optional Gato battle',()=>{const s=c.createState('fair');at(s,0,7);c.interactFair(s,0);assert.equal(s.fair.luccaMet,true);assert.equal(s.fair.gatoWon,false);at(s,-2.4,9);c.interactFair(s,0);assert.equal(s.fair.telepodTested,true);assert.equal(s.players[0].x,2.4);assert.equal(s.era,'present');assert.equal(s.chapter,'fair');});
test('coop telepod refuses to violate shared camera separation',()=>{const s=c.createState('fair');s.joined=true;s.fair.luccaMet=true;at(s,-2.4,9);at(s,-9,8,1);c.interactFair(s,0);assert.equal(s.fair.telepodTested,false);assert.equal(s.players[0].x,-2.4);});
test('coop telepod moves only the requesting actor',()=>{const s=c.createState('fair');s.joined=true;s.fair.luccaMet=true;at(s,0,7);at(s,-2.4,9,1);const before={...s.players[0]};c.interactFair(s,1);assert.deepEqual(s.players[0],before);assert.equal(s.players[1].x,2.4);assert.equal(s.fair.telepodTested,true);});
test('Gato encounter has one prototype opponent and blocks travel and dialogue exploits',()=>{const s=c.createState('fair');at(s,-7,3.4);c.interactFair(s,0);assert.equal(s.mode,'battle');assert.equal(s.enemies.length,1);assert.equal(s.enemies[0].hp,120);assert.equal(c.interactFair(s,0),null);assert.equal(c.travel(s),false);assert.throws(()=>c.serialize(s));});
test('Gato co-op combo and victory do not overwrite laboratory quest flags',()=>{const s=c.createState('fair');s.joined=true;c.beginBattle(s);tick(s);c.requestCombo(s,0);assert.equal(s.enemies[0].hp,120);c.requestCombo(s,1);assert.equal(s.enemies[0].hp,48);assert.deepEqual(s.players.map(p=>p.mp),[14,14]);tick(s);c.action(s,0,'attack');c.action(s,1,'attack');assert.equal(s.mode,'victory');assert.equal(s.fair.gatoWon,true);assert.equal(s.flags.won,false);c.leaveBattle(s);assert.equal(s.mode,'explore');assert.equal(s.chapter,'fair');assert.ok(s.players.every(p=>c.walkable(p.x,p.z,'fair')));});
test('Gato defeat never grants a victory flag',()=>{const s=c.createState('fair');s.joined=true;c.beginBattle(s);s.players.forEach(p=>p.hp=1);tick(s,900);assert.equal(s.mode,'defeat');assert.equal(s.fair.gatoWon,false);});
test('laboratory v1 save remains v1 and loads unchanged',()=>{const s=c.createState();c.repair(s);c.travel(s);const raw=c.serialize(s);assert.equal(JSON.parse(raw).version,1);const loaded=c.deserialize(raw);assert.equal(loaded.chapter,'lab');assert.deepEqual(loaded.flags,s.flags);assert.equal(loaded.era,'future');});
test('fair v2 save round trip preserves chapter, party and event sequence',()=>{const s=c.createState('fair');s.joined=true;s.fair={bellHeard:true,gatoWon:true,luccaMet:true,telepodTested:true};const raw=c.serialize(s);assert.equal(JSON.parse(raw).version,2);const loaded=c.deserialize(raw);assert.equal(loaded.chapter,'fair');assert.deepEqual(loaded.fair,s.fair);assert.equal(loaded.joined,true);});
test('v2 cannot load an unknown chapter or an unimplemented era',()=>{for(const change of [{chapter:'missing'},{era:'future'},{fair:null},{fair:[]},{version:3}]){const d=data();Object.assign(d,change);assert.throws(()=>c.deserialize(JSON.stringify(d)));}});
test('fair save rejects nonboolean and inconsistent event flags',()=>{for(const change of [{gatoWon:'yes'},{luccaMet:false,telepodTested:true}]){const d=data();Object.assign(d.fair,change);assert.throws(()=>c.deserialize(JSON.stringify(d)));}});
test('fair save validates against fair collisions and filters injected runtime fields',()=>{let d=data();d.players[0].x=7.5;d.players[0].z=-1.5;assert.throws(()=>c.deserialize(JSON.stringify(d)));d=data();d.players[0].atb=999;d.fair.hacked=true;const loaded=c.deserialize(JSON.stringify(d));assert.equal(loaded.players[0].atb,0);assert.equal(loaded.fair.hacked,undefined);});

test('real fair route remains walkable with six-tick observation intervals',()=>{
  const s=c.createState('fair');
  const walk=(axis,target,direction,both=false)=>{
    let polls=0;
    while((direction>0?s.players[0][axis]<target:s.players[0][axis]>target)&&polls++<150){
      const v={x:0,z:0};v[axis]=direction;
      for(let i=0;i<6;i++)c.step(s,[v,both?v:{x:0,z:0}],1/60);
    }
    assert.ok(polls<150,`blocked walking ${axis} to ${target}`);
  };
  walk('x',-3.4,-1);walk('z',-1.7,1);c.interactFair(s,0);assert.equal(s.fair.bellHeard,true);
  c.setCoop(s,true);walk('x',-6.8,-1);walk('z',2.5,1);c.interactFair(s,0);assert.equal(s.mode,'battle');
  for(let i=0;i<180;i++)c.step(s,c.IDLE,1/60);
  c.requestCombo(s,0);c.requestCombo(s,1);
  for(let i=0;i<180;i++)c.step(s,c.IDLE,1/60);
  c.action(s,0,'attack');c.action(s,1,'attack');assert.equal(s.mode,'victory');c.leaveBattle(s);
  walk('x',-1,1,true);walk('z',6.4,1,true);c.interactFair(s,0);assert.equal(s.fair.luccaMet,true);
  walk('x',-2.4,-1);walk('z',8.7,1);c.interactFair(s,0);assert.equal(s.fair.telepodTested,true);
  assert.equal(c.deserialize(c.serialize(s)).chapter,'fair');
});
