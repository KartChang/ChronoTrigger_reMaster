// Keep the phase-aware regressions in the existing registered camera suite.
import './town-party-evidence.test.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {assertTownCameraLayouts} from '../scripts/town-camera-evidence.mjs';
import {townCameraFixture,townPartyStateFixture} from './helpers/town-camera-fixture.mjs';
import {townDetailFixture} from './helpers/village-detail-fixture.mjs';
function fixture(){
 const beforeCamera=townCameraFixture({width:480,height:320},7);
 const state=townPartyStateFixture();
 return {before:structuredClone(state),beforeCamera,afterCamera:structuredClone(beforeCamera),views:[[960,640],[390,844],[844,390]].map(([w,h])=>{
  const renderer={width:Math.floor(w/2),height:Math.floor(h/2)},details=townDetailFixture(renderer);
  if(w<h)details.sign.projection.rect.y=renderer.height*.3;
  return {renderer,state:structuredClone(state),village:{details},camera:townCameraFixture(renderer,7,details.sign.projection)};
 })};
}
test('X unit schema passes without mutating an observation, not a native receipt',()=>{const f=fixture(),s=JSON.stringify(f);assert(assertTownCameraLayouts(f));assert.equal(JSON.stringify(f),s);});
for(const [name,mutate] of [
 ['missing view',f=>f.views.pop()],['absent camera',f=>delete f.views[1].camera],['forged active',f=>f.views[1].camera.camera.active=false],
 ['wrong canvas',f=>f.views[1].renderer.width++],['tick change',f=>f.views[1].camera.motion.tick++],['lost player',f=>f.views[1].camera.rects.shift()],
 ['lost second owner',f=>{f.before.joined=true;f.views.forEach(v=>v.state.joined=true);f.views[1].camera.rects=f.views[1].camera.rects.filter(x=>x.id!=='p1');f.views[1].camera.camera.actors=f.views[1].camera.camera.actors.filter(x=>x.id!=='p1');}],
 ['oversized empty view',f=>f.views[1].camera.camera.half=100],['small hero',f=>{f.views[1].camera.rects[0].bottom=.251;}],
 ['clipped subject',f=>f.views[1].camera.rects[0].right=1],['wrong projection',f=>f.views[1].village.details.sign.projection.rect.x++],
 ['changed restore',f=>f.afterCamera.camera.x++],['landscape changed',f=>f.views[2].camera.townProfile='vq02x-town-portrait'],['NaN projection',f=>f.views[1].camera.rects[0].left=NaN]
])test('X evidence rejects '+name,()=>{const f=fixture();mutate(f);const before=JSON.stringify(f);assert.throws(()=>assertTownCameraLayouts(f),/Town (?:camera|party) evidence/);assert.equal(JSON.stringify(f),before);});
test('X observer and gate only append to the original native capture',()=>{
 const source=readFileSync('tests/village_capture.py','utf8');for(const token of ['beforeCamera','afterCamera',"value['camera']","observe_pause_access","village-layout-","village-canvas-","record['after'] == frozen"])assert(source.includes(token));
 assert(!source.includes('town-camera-fixture'));assert(!source.includes('.state ='));assert(!source.includes('setTimeout'));
 const gate=readFileSync('scripts/village-evidence.mjs','utf8');assert(gate.includes('assertPauseAccess'));assert(gate.includes('assertTownDetails'));assert(gate.includes('assertTownCameraLayouts(r)'));
});
