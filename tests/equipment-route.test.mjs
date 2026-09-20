import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as c from '../.test/core.mjs';
import {Vector3,Mesh,MeshBuilder} from '@babylonjs/core';
import {festivalTestScene} from './festival-test-scene.mjs';
import {buildFair} from '../.test/fair-render.mjs';
import {EarlyOcclusion} from '../.test/early-occlusion.mjs';
import {fairOcclusionPoints} from '../.test/fair-occlusion-points.mjs';
import {CONDUCT_POINTS} from '../.test/fair-conduct-data.mjs';

// Unmodified player export from CI34 good-lane prologue, not a manufactured save.
// This file is used ONLY for isolated Node regression tests, never browser input.
const raw=readFileSync(new URL('./fixtures/ci34-companions-v6.json',import.meta.url),'utf8');
const route=JSON.parse(readFileSync(new URL('./equipment-route.json',import.meta.url),'utf8'));
const fresh=()=>c.deserialize(raw);
function advance(s,axis,direction,count){
 const input=[{x:0,z:0},{x:0,z:0}];input[0][axis]=direction;
 for(let n=0;n<count;n++){
  c.step(s,input,1/60);
  assert(s.players.every(p=>c.walkable(p.x,p.z,s.chapter)),'collision must remain authoritative');
 }
}
function leg(s,w,poll,release,guard=true){
 const delta=w.target-s.players[0][w.axis],direction=Math.sign(delta);
 if(Math.abs(delta)<.12)return;
 const budget=Math.ceil((Math.abs(delta)/4+2)*60);let ticks=0;
 while(direction*(w.target-s.players[0][w.axis])>0&&ticks<=budget){advance(s,w.axis,direction,poll);ticks+=poll;}
 assert(ticks<=budget,`blocked ${w.axis} leg to ${w.target} at ${JSON.stringify(s.players[0])}`);
 advance(s,w.axis,direction,release);c.step(s,c.IDLE,1/60);
 if(guard)assert(s.players[0][w.axis]>=w.releaseBand[0]&&s.players[0][w.axis]<=w.releaseBand[1]);
}

test('CI34 companion export is exact, and merchant radius/position match existing core',()=>{
 assert.equal(createHash('sha256').update(raw).digest('hex'),'782d1dc8f23f05ec80c83bd5523c4c79eca40e63443e84500457570e70105db5');
 assert.equal(JSON.parse(raw).version,6);assert.equal(fresh().prologue.stage,'companions');
 assert.equal(route.merchant.x,CONDUCT_POINTS.merchant.x);assert.equal(route.merchant.z,CONDUCT_POINTS.merchant.z);
 assert(readFileSync(new URL('../src/core.ts',import.meta.url),'utf8').includes('distance(s.players[0],CONDUCT_POINTS.merchant)<1.8'));
 assert.equal(route.merchant.radius,1.8);
});

test('CI34 observed candy collision remains solid; longer holding cannot reach old cross-fair target',()=>{
 const s=fresh();
 // Explicit diagnostic fixture reproducing the raw failure observation, not a browser state write.
 Object.assign(s.players[0],{x:5.4,z:-3});
 const before={x:s.players[0].x,z:s.players[0].z};advance(s,'x',1,600);
 assert.deepEqual({x:s.players[0].x,z:s.players[0].z},before);
 assert.equal(c.walkable(5.5,-3,'fair'),false);assert.equal(c.shopAvailable(s),false);
 assert.equal(c.tradeItem(s,'bronze-katana',1,true),false);assert.equal(s.equipment,null);
});

test('old canopy-return route reproduces candy blockage after six extra release ticks',()=>{
 const s=fresh();
 for(const [axis,target] of [['z',-3.4],['x',-8],['z',-4.05]])leg(s,{axis,target},1,0,false);
 leg(s,{axis:'z',target:-3.4},1,6,false);
 assert(s.players[0].z>-3.05);
 assert.throws(()=>leg(s,{axis:'x',target:7.5},6,0,false),/blocked/);
 assert(s.players[0].x<5.46);assert.equal(s.equipment,null);
});

for(const poll of [1,6,12])for(const release of [0,3,6,12])
test(`actual collision-safe canopy/merchant route: polling ${poll}, delayed release ${release}`,()=>{
 const s=fresh(),facts=structuredClone(s.prologue.conduct),flags=structuredClone(s.fair);
 for(const w of route.routes['to-canopy'])leg(s,w,poll,release);
 assert(s.players[0].z>-4.25&&s.players[0].z<=-4);
 // NullEngine geometry check only: the changed stop still uses the real canopy,
 // not a synthetic blocker or a removed browser occlusion assertion.
 const k=festivalTestScene();try{
  const fair=buildFair(k.scene,k.shadow);fair.root.setEnabled(true);
  const mesh=MeshBuilder.CreatePlane('route-player',{width:1.35,height:1.85},k.scene);
  mesh.billboardMode=Mesh.BILLBOARDMODE_ALL;
  mesh.position.copyFrom(new Vector3(s.players[0].x,.14,s.players[0].z).add(k.camera.getDirection(Vector3.Up()).scale(1.85*(62/64-.5))));
  const o=new EarlyOcclusion(k.scene);
  o.update(s.ticks,'fair',k.camera.getDirection(Vector3.Forward()),fairOcclusionPoints([{id:'p0',mesh}]));
  assert(o.inspect().groups.some(g=>g.id==='vq01-festival-cloth-canopy'&&g.blocked));o.dispose();
 }finally{k.dispose();}
 assert.equal(c.shopAvailable(s),false);assert.equal(s.equipment,null);
 // Simulated paused observation has no input; no gameplay clock shortcuts are used.
 for(const w of route.routes['to-merchant'])leg(s,w,poll,release);
 assert.deepEqual(s.prologue.conduct,facts);assert.deepEqual(s.fair,flags);
 assert.equal(s.prologue.stage,'companions');assert.equal(s.joined,false);
 const d=Math.hypot(s.players[0].x-route.merchant.x,s.players[0].z-route.merchant.z);
 assert(d<route.merchant.radius,`merchant distance ${d}`);assert.equal(c.shopAvailable(s),true);
 assert.equal(s.equipment,null,'viewing/reaching the shop must not create gear');
 assert(c.tradeItem(s,'bronze-katana',1,true));assert.equal(s.equipment.gold,250);
 assert(c.equipItem(s,'crono','bronze-katana'));
 const v8=JSON.parse(c.serialize(s));assert.equal(v8.version,8);assert.equal(JSON.parse(v8.adventure).version,6);
 assert.deepEqual(c.deserialize(JSON.stringify(v8)).equipment,s.equipment);
 const loaded=c.deserialize(JSON.stringify(v8));
 for(const w of route.routes['leave-merchant'])leg(loaded,w,poll,release);
 assert.equal(c.shopAvailable(loaded),false);
 for(const w of route.routes['to-gato'])leg(loaded,w,poll,release);
 assert.equal(loaded.mode,'explore');assert.deepEqual(loaded.equipment,s.equipment);
 assert(Math.hypot(loaded.players[0].x-route.gato.x,loaded.players[0].z-route.gato.z)<route.gato.radius);
 assert.match(c.interactFair(loaded,0).title,/岡薩雷斯/);assert.equal(loaded.mode,'battle');
 assert.equal(loaded.players[0].atb,0);assert.equal(loaded.fair.gatoWon,false);

});

test('browser consumes both shared routes and still performs native canopy/pause and merchant checks',()=>{
 const source=readFileSync(new URL('./equipment_browser.py',import.meta.url),'utf8');
 assert(source.includes("walk_equipment_route(page,move,snap,observations,'to-canopy')"));
 assert(source.includes("walk_equipment_route(page,move,snap,observations,'to-merchant')"));
 assert(source.includes("record_festival(page,OUT,'00-cloth-canopy-occlusion',require_blocked=True,pause_probe=True)"));
 assert(source.includes('textContent.includes("裝備買賣")'));
 assert(!source.includes('ci34-companions-v6.json'),'browser must use its own same-run export');
});
