/** Actual production application and isolated real upload boundary, OFFLINE only. */
import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {readFileSync} from 'node:fs';
import {DynamicTexture,MeshBuilder,StandardMaterial,Texture} from '@babylonjs/core';
import {ArtDirectedWorld as Current} from '../.test/art-directed-world.mjs';import {ArtDirectedWorld as Prior} from '../.test/art-directed-world-c.mjs';
import {World,createState} from '../.test/cpu-entry.mjs';import {productionWorldRig} from './helpers/production-world-rig.mjs';
import {installProductionPartyArt} from '../.test/production-party-finish.mjs';import {partyCell,decodePartyCell,PARTY_POSES} from '../.test/production-party-cell.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const canyon=JSON.parse(readFileSync('tests/fixtures/ci82-canyon-state.json')).state;
const state=ch=>ch==='canyon'?structuredClone(canyon):createState(ch);
function setup(name='player-0'){
 const r=productionWorldRig(World),scene=r.world.engine.scenes[0];for(const m of scene.meshes)m.setEnabled(false);const t=new DynamicTexture('D-adapter-test',{width:48,height:64},scene,false,Texture.NEAREST_SAMPLINGMODE),m=MeshBuilder.CreatePlane(name,{},scene);m.material=new StandardMaterial('D-adapter-material',scene);m.material.diffuseTexture=t;
 let sampled={pose:'idle',frame:0,facing:0},uploads=0,calledArgs=null;const original=t.update;t.update=function(...args){uploads++;calledArgs=args;return original.apply(t,args);};const pass=installProductionPartyArt(scene,()=>sampled);
 const read=()=>new Uint8ClampedArray(t.getContext().getImageData(0,0,48,64).data);
 const paint=(code)=>{const d=decodePartyCell(code);sampled={pose:d.pose,frame:d.frame,facing:d.facing};const c=t.getContext(),i=c.createImageData(48,64);i.data.set(partyCell(code,true));c.putImageData(i,0,0);t.update(false,false);};
 return {...r,scene,t,m,pass,read,paint,setPose:p=>{sampled=p;},count:()=>uploads,args:()=>calledArgs,notify:()=>scene.onBeforeRenderObservable.notifyObservers(scene)};
}
for(let h=0;h<4;h++)test('D actual texture upload replaces all exploration cells for hero '+h+' and retains all action/reaction cells',()=>{
 const r=setup();try{r.paint(h*128);r.pass.begin('canyon');r.notify();for(let n=0;n<128;n++){r.paint(h*128+n);assert.deepEqual(r.read(),partyCell(h*128+n));assert.deepEqual(r.args(),[false,false]);}
  assert.equal(r.pass.inspect().additionalGpuTextures,0);assert(r.pass.inspect().retainedCpuBytes<=196608);
 }finally{r.close();}
});
test('D stops raw-byte aliases from replacing protected poses; unknown source pixels fail closed',()=>{
 const r=setup();try{r.paint(0);r.pass.begin('canyon');r.notify();r.paint(PARTY_POSES.indexOf('hurt')*16);assert.deepEqual(r.read(),partyCell(PARTY_POSES.indexOf('hurt')*16,true));r.setPose({pose:'idle',facing:0,frame:0});const c=r.t.getContext();c.fillStyle='#fe0123';c.fillRect(23,32,1,1);const altered=r.read();r.t.update();assert.deepEqual(r.read(),altered);assert(r.pass.inspect().unknownUploads>0);
 }finally{r.close();}
});
test('D no repeated uploads on static/protected renders, context arguments preserved, held roundtrip and resource release',()=>{
 const r=setup();try{r.paint(0);const original=r.t.update;r.pass.begin('canyon');r.notify();const styled=r.read(),count=r.count();for(let i=0;i<10;i++)r.notify();assert.equal(r.count(),count);r.t.update(true,false);assert.deepEqual(r.args(),[true,false]);assert.deepEqual(r.read(),styled);
  r.paint(PARTY_POSES.indexOf('down')*16);const protectedCount=r.count();for(let i=0;i<10;i++)r.notify();assert.equal(r.count(),protectedCount);
  r.paint(0);r.pass.begin('bedroom');assert.deepEqual(r.read(),partyCell(0,true));r.pass.begin('canyon');r.notify();assert.deepEqual(r.read(),partyCell(0));r.t.dispose();assert.equal(r.t.update,original);assert.equal(r.pass.inspect().bindings,0);r.world.engine.dispose();assert(r.pass.inspect().disposed);
 }finally{r.close();}
});
for(const name of ['mother','meeting-marle','enemy-0','courtroomjudge','player-4'])test('D excludes non-party/held actor '+name,()=>{const r=setup(name);try{r.paint(0);const old=r.t.update;r.pass.begin('canyon');r.notify();assert.equal(r.t.update,old);assert.deepEqual(r.read(),partyCell(0,true));assert.equal(r.pass.inspect().bindings,0);}finally{r.close();}});
test('D binding CPU memory is capped even for extra matching slots; disposal does not remove a later owner',()=>{
 const r=setup();try{r.paint(0);for(let i=0;i<12;i++){const t=new DynamicTexture('dextra'+i,{width:48,height:64},r.scene,false),m=MeshBuilder.CreatePlane('player-0',{},r.scene);m.material=new StandardMaterial('dm'+i,r.scene);m.material.diffuseTexture=t;const c=t.getContext(),p=c.createImageData(48,64);p.data.set(partyCell(0,true));c.putImageData(p,0,0);t.update();}r.pass.begin('canyon');r.notify();assert.equal(r.pass.inspect().bindings,8);assert.equal(r.pass.inspect().retainedCpuBytes,196608);const later=function(){};r.t.update=later;r.world.engine.dispose();assert.equal(r.t.update,later);assert.equal(r.pass.inspect().bindings,0);
 }finally{r.close();}
});
function observe(Type,ch){const r=productionWorldRig(Type,240,160);try{const s=state(ch),before=structuredClone(s);r.world.draw(s,0,false);assert.deepEqual(s,before);const scene=r.world.engine.scenes[0];return {pixels:sha(r.canvas.pixels()),view:r.world.inspect(),geometry:scene.meshes.filter(m=>m.name!=='production-canyon-rear-bank').map(m=>({name:m.name,pos:m.position.asArray(),sc:m.scaling.asArray(),rot:m.rotation.asArray(),enabled:m.isEnabled()})),camera:[scene.activeCamera.position.asArray(),scene.activeCamera.orthoLeft,scene.activeCamera.orthoTop,scene.activeCamera.orthoRight,scene.activeCamera.orthoBottom],textures:scene.textures.length};}finally{r.close();}}
for(const ch of ['canyon','fair','castle','cathedral','courtroom','cellblock','hall1000','sanctum'])test('D actual current app changes party/scene pixels in '+ch+' without changing gameplay, camera or existing geometry',()=>{
 const c=observe(Prior,ch),d=observe(Current,ch);assert.notEqual(d.pixels,c.pixels);assert.deepEqual(d.geometry,c.geometry);assert.deepEqual(d.camera,c.camera);for(const k of ['partyCombat','fieldEnemyMotion','fieldEnemyBody','combatTiming','actorPlayback','poses','guest','trialMaps','kingdomNpcs'])assert.deepEqual(d.view[k],c.view[k],k);assert(d.view.productionArt.party.paintedUploads>0);assert.equal(d.textures-c.textures,ch==='canyon'?1:0);assert.equal(d.view.renderer.cpu.unsupportedResources,0);assert(d.view.renderer.cpu.textureMemory.bytes<33554432);
});
for(const ch of ['bedroom','home','downstairs'])test('D entire held '+ch+' framebuffer stays C-exact even after exploration',()=>{
 const c=observe(Prior,ch),d=observe(Current,ch);assert.equal(d.pixels,c.pixels);const r=productionWorldRig(Current,240,160);try{r.world.draw(state('canyon'),0,false);r.world.draw(state(ch),0,false);assert.equal(sha(r.canvas.pixels()),c.pixels);assert(r.world.inspectProductionArt().party.actors.every(a=>!a.styled));}finally{r.close();}
});
test('D rear bank stays beyond traversal, scene re-entry allocates once and four-argument event delivery remains unchanged',()=>{
 const r=productionWorldRig(Current);try{const s=state('canyon'),before=structuredClone(s);r.world.draw(s,0,false,[]);const scene=r.world.engine.scenes[0],plane=scene.getMeshByName('production-canyon-rear-bank');assert(plane);assert.equal(plane.isPickable,false);assert.equal(plane.position.z,12.25);r.world.draw(state('bedroom'),0,false);r.world.draw(s,0,false,[]);const counts=[scene.meshes.length,scene.textures.length];for(let n=0;n<3;n++){r.world.draw(state('bedroom'),0,false);r.world.draw(s,0,false,[]);}assert.deepEqual([scene.meshes.length,scene.textures.length],counts);assert.deepEqual(s,before);assert.equal(r.world.inspectProductionArt().canyonHorizon.rawTextureBytes,262144);r.world.engine.dispose();assert(r.world.inspectProductionArt().canyonHorizon.disposed);
 }finally{r.close();}
});
