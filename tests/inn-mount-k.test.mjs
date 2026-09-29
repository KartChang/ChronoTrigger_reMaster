/** Actual K application and read-only recorded-state OFFLINE fixtures. Not browser/device evidence. */
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {DynamicTexture,Ray,Vector3} from '@babylonjs/core';
import {ArtDirectedWorld as Current} from '../.test/inn-k-world.mjs';import {ArtDirectedWorld as Prior} from '../.test/inn-j-world.mjs';
import {SIGHTLINE_ART,sculptInnSign,sculptCourtDais} from '../.test/inn-k-art.mjs';import {createState} from '../.test/cpu-entry.mjs';
import {productionWorldRig} from './helpers/production-world-rig.mjs';import {assertTownSignOcclusion} from '../scripts/town-route-evidence.mjs';
const f=JSON.parse(readFileSync('tests/fixtures/ci107-inn-stops.json')),sha=x=>createHash('sha256').update(x).digest('hex');
const meshRecord=m=>({name:m.name,position:m.position.asArray(),rotation:m.rotation.asArray(),scale:m.scaling.asArray(),billboard:m.billboardMode,positionData:Array.from(m.getVerticesData('position')??[]),normal:Array.from(m.getVerticesData('normal')??[]),uv:Array.from(m.getVerticesData('uv')??[]),indices:Array.from(m.getIndices()??[])});
function observe(Type,state,size=[208,450],reduced=false){
 const r=productionWorldRig(Type,...size);try{
  const s=structuredClone(state),before=structuredClone(s);r.media.matches=reduced;
  for(let i=0;i<3;i++)r.world.draw(s,0,false,[]);
  assert.deepEqual(s,before);const scene=r.world.engine.scenes[0],o=r.world.inspect(),sign=scene.getMeshByName('inn-sign');
  const frame=sha(r.canvas.pixels());r.world.draw(s,0,false,[]);assert.equal(sha(r.canvas.pixels()),frame,'frozen frame is idempotent');
  return {o,frame,meshes:scene.meshes.map(meshRecord),textures:scene.textures.filter(t=>t instanceof DynamicTexture).map(t=>[t.name,sha(t.getContext().getImageData(0,0,t.getSize().width,t.getSize().height).data)]),signVisibility:sign?.visibility,signMode:sign?.material?.transparencyMode,geometries:scene.geometries.length};
 }finally{r.close();}
}
test('K retains J sign size/aspect and seats it inside the inn facade without touching input arrays',()=>{
 const a=[-.7,-.35,0,.7,-.35,0,.7,.35,0,-.7,.35,0],copy=[...a],b=sculptInnSign(a);assert.deepEqual(a,copy);
 for(let i=0;i<a.length;i++)assert.equal(b[i],i%3===2?a[i]:a[i]*.66+(i%3===0?-.32:-.10));
 const xs=b.filter((_,i)=>i%3===0),ys=b.filter((_,i)=>i%3===1);assert(Math.abs((Math.max(...xs)-Math.min(...xs))/(Math.max(...ys)-Math.min(...ys))-2)<1e-12);
 assert(-4.7+Math.max(...xs)*2.75<-3.8,'sign right edge stays within inn facade');assert(2.4+Math.max(...ys)*2.75<2.85,'panel top remains under eave');
 assert.equal(SIGHTLINE_ART.maxGeometryBytes,16384);assert.equal(SIGHTLINE_ART.signScale,.66);assert.deepEqual(sculptCourtDais(a),a.map((v,i)=>i%3===2?v*.70:v));
});
for(const bad of [[],[NaN,1,2],Array(11).fill(0),Array(12).fill(Infinity)])test('K rejects malformed panel '+bad.length+'/'+bad[0],()=>assert.throws(()=>sculptInnSign(bad)));
for(const stop of f.stops)for(const reduced of[false,true])test('K actual recorded '+stop.name+' pose with reduced='+reduced+' uses real unchanged ray/opacity contract',()=>{
 const a=observe(Current,stop.state,[208,450],reduced),o=a.o.townSignOcclusion;assertTownSignOcclusion(o,stop.state);
 assert.equal(a.signVisibility,o.visibility);assert.equal(a.signMode,o.materialMode);
 if(stop.name==='inn'){assert(o.blockedBy.includes('p0'));assert(o.visibility<1);}else{assert.deepEqual(o.blockedBy,[]);assert.equal(o.visibility,1);}
 assert.equal(a.o.renderer.cpu.unsupportedResources,0);assert.equal(a.o.productionArt.sightlines.bindings,1);assert(a.o.productionArt.sightlines.geometryBytes<=16384);
});
for(const size of [[300,200],[390,844],[844,390]])test('K actual inn '+size.join('x')+' changes only the panel geometry, not actor data or textures',()=>{
 const s=f.stops.find(x=>x.name==='inn').state,a=observe(Current,s,size),b=observe(Prior,s,size);assert.notEqual(a.frame,b.frame);assert.deepEqual(a.textures,b.textures);assert.equal(a.geometries,b.geometries);assert.equal(a.meshes.length,b.meshes.length);
 let changed=0;for(let i=0;i<a.meshes.length;i++){const x=a.meshes[i],y=b.meshes[i];if(JSON.stringify(x)!==JSON.stringify(y)){changed++;assert.equal(x.name,'inn-sign');for(const k of ['position','rotation','scale','billboard','normal','uv','indices'])assert.deepEqual(x[k],y[k],k);}}
 assert.equal(changed,1);for(const key of['partyCombat','actorPlayback','poses','guest','grounding','combatTiming'])assert.deepEqual(a.o[key],b.o[key],key);
});
for(const ch of ['bedroom','downstairs','home','fair','canyon','forest','castle','chamber','cathedral','passage','sanctum','courtroom','cell','prison','bridge','future'])test('K '+ch+' non-target/held actual frame remains J',()=>{
 const s=createState(ch),a=observe(Current,s,[160,100]),b=observe(Prior,s,[160,100]);assert.equal(a.frame,b.frame);assert.deepEqual(a.meshes,b.meshes);assert.deepEqual(a.textures,b.textures);
});
test('K uses actual transformed sign triangles, clears the ray at exit and leaves its buffers unchanged',()=>{
 const r=productionWorldRig(Current,208,450);try{const s=structuredClone(f.stops[2].state);for(let i=0;i<3;i++)r.world.draw(s,0,false,[]);
  const scene=r.world.engine.scenes[0],m=scene.getMeshByName('inn-sign'),geometry=m.geometry,shape=meshRecord(m),camera=scene.activeCamera,forward=camera.getDirection(Vector3.Forward()).normalize();
  const center=Vector3.TransformCoordinates(new Vector3(SIGHTLINE_ART.signInsetX,SIGHTLINE_ART.signDropY,0),m.computeWorldMatrix(true));assert(new Ray(center.subtract(forward.scale(64)),forward,65).intersectsMesh(m,false).hit);
  for(const stop of[f.stops[3],f.stops[0]]){r.world.draw(structuredClone(stop.state),0,false,[]);assert.equal(m.visibility,1);assert.equal(m.geometry,geometry);assert.deepEqual(meshRecord(m),shape);}
  const root=m.parent;r.world.draw(createState('home'),0,false,[]);assert.equal(root.isEnabled(),false);
  root.dispose();assert.equal(r.world.inspect().productionArt.sightlines.bindings,0);
 }finally{r.close();}
});
