import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import * as c from '../.test/core.mjs';
import {RESCUE_POINTS,rescueWalkable,nearestRescue} from '../.test/rescue-data.mjs';

const organ=JSON.parse(readFileSync(new URL('./organ-route.json',import.meta.url),'utf8'));
const chest=JSON.parse(readFileSync(new URL('./rescue-route.json',import.meta.url),'utf8'));
const probeText=readFileSync(new URL('./rescue-approach-probe.js',import.meta.url),'utf8');
// Explicit unit doubles only. Real browser journeys never install these surfaces.
function observe(s,route,options={}) {
 const point=nearestRescue(s.players[0].x,s.players[0].z,s.chapter,s.rescue);
 const ui={focused:'world',hidden:false,label:point?.label??'',dialog:false,paused:false,...options};
 const document={activeElement:{id:ui.focused},querySelector:id=>id==='#interact-hint'?{hidden:ui.hidden,textContent:`E · ${ui.label}`}:{hidden:!ui.dialog}};
 const probe=runInNewContext(probeText,{window:{__CHRONO_TEST__:{snapshot:()=>structuredClone(s),paused:()=>ui.paused}},document});
 return probe({chapter:route.chapter,point:route.interaction,startTick:options.startTick??s.ticks,budget:60,joined:options.joined??s.joined,wait:options.wait??false});
}
function fixture(paired=false,chapter='cathedral') {
 const s=c.createState('forest');s.era='middle';s.joined=paired;s.kingdom={phase:'rescue',heardYear:true,forestWon:true,elapsed:0};
 s.opening={phase:'vista',canyonWon:true,elapsed:0};s.fair.luccaMet=true;s.fair.telepodTested=true;
 s.chapter=chapter;s.rescue.stage='allied';s.rescue.organOpen=chapter==='passage';
 s.players.forEach((p,i)=>Object.assign(p,{x:.5+i*1.3,z:4.4}));
 Object.assign(s.rescue.guest,{x:0,z:3});return s;
}
function advance(s,axis,sign,n) {
 const input=[{x:0,z:0},{x:0,z:0}];input[0][axis]=sign;if(s.joined)input[1][axis]=sign;
 for(let i=0;i<n;i++){c.step(s,input,1/60);assert(s.players.every(p=>c.walkable(p.x,p.z,s.chapter)));}
}
function fixedLeg(s,axis,target,poll=1,release=0) {
 const sign=Math.sign(target-s.players[0][axis]);let elapsed=0;
 while(sign*(target-s.players[0][axis])>0&&elapsed<600){advance(s,axis,sign,poll);elapsed+=poll;}
 assert(elapsed<600,'waypoint blocked');advance(s,axis,sign,release);
}
function promptLeg(s,route,poll,release) {
 const final=route.waypoints.at(-1),sign=Math.sign(final.target-s.players[0][final.axis]);let elapsed=0;
 while(!observe(s,route).ready&&elapsed<600){advance(s,final.axis,sign,poll);elapsed+=poll;}
 assert(elapsed<600,'actual prompt not reached');advance(s,final.axis,sign,release);
 const result=observe(s,route);assert(result.ok&&result.ready,JSON.stringify(result));return result;
}

test('organ and chest targets match the existing production interaction data and radius',()=>{
 for(const route of [organ,chest]){const point=RESCUE_POINTS[route.chapter].find(p=>p.id===route.interaction.id);
  for(const k of ['id','label','x','z'])assert.equal(route.interaction[k],point[k]);assert.equal(route.interaction.radius,1.8);}
});
test('CI17 actual observed organ-edge coordinate is already interactable; no walk-through change is necessary',()=>{
 const s=fixture();Object.assign(s.players[0],{x:-5.116666666666669,z:6.166666666666663});
 assert(rescueWalkable(s.players[0].x,s.players[0].z,'cathedral'));
 const before=structuredClone(s);assert(observe(s,organ).ready);assert.deepEqual(s,before);
 assert.equal(rescueWalkable(-6.8,6.166666666666663,'cathedral'),false);
 const position={x:s.players[0].x,z:s.players[0].z};advance(s,'x',-1,600);
 assert.deepEqual({x:s.players[0].x,z:s.players[0].z},position);
 assert.equal(s.rescue.organOpen,false);assert.match(c.interactRescue(s,0).title,/管風琴/);assert(s.rescue.organOpen);
});
test('old z=5.8 exact-coordinate route reproduces blockage after five extra release ticks',()=>{
 const s=fixture();fixedLeg(s,'z',5.8,1,5);advance(s,'x',-1,300);
 assert(s.players[0].z>6.15&&s.players[0].x>-5.2);assert(observe(s,organ).ready);
 assert.equal(s.rescue.organOpen,false);
});
for(const paired of [false,true])for(const origin of ['frog','door'])for(const poll of [1,6])for(const release of [0,5,12])
test(`organ approach ${origin}, ${paired?'paired':'solo'}, polling ${poll} ticks/release ${release}: prompt, real event, v5 and exit`,()=>{
 let s=fixture(paired);
 if(origin==='door'){s.players.forEach((p,i)=>Object.assign(p,{x:4+i*1.3,z:8.6}));Object.assign(s.rescue.guest,{x:3,z:7});}
 const w=organ.waypoints[0];fixedLeg(s,w.axis,w.target,poll,release);
 promptLeg(s,organ,poll,release);assert.equal(s.rescue.organOpen,false);assert.equal(s.rescue.tonics,0);
 assert.match(c.interactRescue(s,0).title,/管風琴/);assert(s.rescue.organOpen);
 const raw=c.serialize(s);assert.equal(JSON.parse(raw).version,5);s=c.deserialize(raw);
 assert(s.rescue.organOpen);assert.equal(s.rescue.tonics,0);assert.equal(s.joined,paired);
 assert.match(c.interactRescue(s,0).text,/已經/);
 fixedLeg(s,'x',4);fixedLeg(s,'z',8.6);c.interactRescue(s,0);assert.equal(s.chapter,'passage');
});
for(const paired of [false,true])for(const poll of [1,6])for(const release of [0,5,12])
test(`chest prompt stop ${paired?'paired':'solo'}, polling ${poll}/release ${release}: no reward before E and no duplicate stock`,()=>{
 let s=fixture(paired,'passage');s.players.forEach((p,i)=>Object.assign(p,{x:i*1.3,z:-6.8}));Object.assign(s.rescue.guest,{x:0,z:-6.8});
 const w=chest.waypoints[0];fixedLeg(s,w.axis,w.target,poll,release);promptLeg(s,chest,poll,release);
 assert.equal(s.rescue.chestOpened,false);assert.equal(s.rescue.tonics,0);
 assert.match(c.interactRescue(s,0).title,/找到回復藥/);assert.equal(s.rescue.tonics,3);
 s=c.deserialize(c.serialize(s));c.interactRescue(s,0);assert.equal(s.rescue.tonics,3);
});
for(const [name,changes,expected] of [
 ['wrong chapter',{chapter:'passage'},'chapter-changed'],['battle',{mode:'battle'},'mode-changed'],
 ['invalid coordinate',{badPosition:true},'invalid-position'],['clock reset',{tickOffset:-1},'clock-reset'],
 ['elapsed budget',{tickOffset:61},'tick-budget'],['different ownership',{joined:true},'ownership-changed'],
 ['paused',{paused:true},'modal-or-pause'],['dialog',{dialog:true},'modal-or-pause'],['lost focus',{focused:'save-file'},'focus-lost']
])test(`browser probe fails closed for ${name}, even with a matching hint`,()=>{
 const s=fixture();Object.assign(s.players[0],{x:-5.116666666666669,z:6.166666666666663});const before=s.ticks;
 if(changes.chapter)s.chapter=changes.chapter;if(changes.mode)s.mode=changes.mode;if(changes.badPosition)s.players[0].x=NaN;
 if(changes.tickOffset)s.ticks+=changes.tickOffset;
 const result=observe(s,organ,{...changes,label:'管風琴',startTick:before,wait:true});assert.equal(result.ok,false);assert.equal(result.ready,false);assert.equal(result.reason,expected);
});
for(const changes of [{hidden:true},{label:'木箱'},{label:'管風琴附近'},{label:''}])
test(`distance alone is not sufficient: ${JSON.stringify(changes)}`,()=>{
 const s=fixture();Object.assign(s.players[0],{x:-5.116666666666669,z:6.166666666666663});
 assert.equal(observe(s,organ,{...changes,wait:true}),false);
});
test('a stale visible hint cannot replace physical proximity; the probe never mutates state',()=>{
 const s=fixture(),before=structuredClone(s);assert.equal(observe(s,organ,{label:'管風琴',wait:true}),false);assert.deepEqual(s,before);
});
