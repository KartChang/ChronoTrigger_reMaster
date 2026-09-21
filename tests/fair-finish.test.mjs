import {runtimeBaselineBytes} from './helpers/runtime-baseline.mjs';
// VQ02C reverses only declared actor wiring before preserving the original CI44 source pins.
import {actorBaselineBytes} from './helpers/actor-baseline.mjs';
// VQ02B explicitly advances only renderer/main pins for requested context/density wiring.
// Original draw/camera/scene functions are verified in render-preserved.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {HemisphericLight,PointLight,Vector3,MeshBuilder,StandardMaterial,VertexBuffer} from '@babylonjs/core';
import {festivalTestScene} from './festival-test-scene.mjs';
import {buildFair} from '../.test/fair-render.mjs';
import {contactGeometry,FAIR_TREE_ROOTS} from '../.test/fair-finish.mjs';
import {createState} from '../.test/core.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
function setup(){const k=festivalTestScene();const sky=new HemisphericLight('sky',Vector3.Up(),k.scene);sky.intensity=.75;const lamp=new PointLight('warm-lamp',new Vector3(0,2,0),k.scene);const outside=MeshBuilder.CreateBox('outside',{size:1},k.scene);outside.material=new StandardMaterial('outside',k.scene);const f=buildFair(k.scene,k.shadow),s=createState('fair');f.root.setEnabled(true);f.draw(s,0);return {...k,sky,lamp,outside,f,s};}
test('fair fill is isolated without changing the original light energy or other scene meshes',()=>{
 const k=setup();try{const r=k.f.inspect().finish;assert.equal(k.sky.intensity,.75);assert.equal(k.shadow.getLight().intensity,1);assert.equal(r.fill.intensity,.28);assert(r.fill.onlyFair&&r.fill.enabled);assert(r.excluded.length===2&&r.excluded.every(e=>e.complete));
 assert(k.sky.canAffectMesh(k.outside)&&k.lamp.canAffectMesh(k.outside));const fill=k.scene.getLightByName('fair-local-skylight');assert(!fill.canAffectMesh(k.outside));const ground=k.scene.getMeshByName('fair-ground');assert(!k.sky.canAffectMesh(ground)&&!k.lamp.canAffectMesh(ground));assert(k.shadow.getLight().canAffectMesh(ground));assert(fill.canAffectMesh(ground));
 }finally{k.dispose();}
});
test('opaque scene materials keep warm key shadows, matte cloth, and separate bronze specular',()=>{
 const k=setup();try{const r=k.f.inspect().finish;assert(r.key.receivesKey);assert(r.metals.length>=5);assert(r.metals.every(m=>m.power===48&&m.specular[0]===.24));
 const bell=k.scene.getMeshByName('leene-bell');assert(k.shadow.getShadowMap().renderList.includes(bell));const cloth=k.scene.getMeshByName('cloth-curved-awning-0');assert(cloth.material.specularColor.equalsFloats(0,0,0));assert(k.scene.getMeshByName('fair-ground').material.specularColor.equalsFloats(0,0,0));
 }finally{k.dispose();}
});
test('all six retained tree texture roots meet their real mesh-matrix ground contacts',()=>{
 const k=setup();try{const r=k.f.inspect().finish;assert.equal(r.contacts.length,6);for(const [i,c] of r.contacts.entries()){assert(c.footError<1e-5);assert.deepEqual([c.foot.x,c.foot.z],FAIR_TREE_ROOTS[i]);assert(c.shadow.visible);assert(Math.abs(c.shadow.y-.075)<1e-6);}assert.equal(k.f.inspect().vendorContacts.length,4);
 }finally{k.dispose();}
});
test('tree grounding follows changed view direction, never a fixed world-y offset',()=>{
 const k=setup();try{for(const p of [[0,18,-30],[0,30,-18],[2,23,-26]]){k.camera.position.copyFromFloats(...p);k.camera.setTarget(Vector3.Zero());k.f.draw(k.s,100);assert(k.f.inspect().finish.contacts.every(c=>c.footError<1e-5));}
 }finally{k.dispose();}
});
test('soft contacts have radial zero-alpha borders, immutable geometry and no extra texture',()=>{
 const d=contactGeometry();assert.equal(d.positions.length/3,97);assert.equal(d.indices.length/3,168);assert(d.indices.every(i=>i>=0&&i<97));assert(d.colors.filter((_,i)=>i%4===3).slice(-24).every(a=>a===0));
 const k=setup();try{const r=k.f.inspect().finish;assert.deepEqual(r.softShadows,{count:8,vertices:776,triangles:1344,alphaMin:0,alphaMax:1,dynamic:false,decorativeOnly:true});assert.equal(k.scene.getMaterialByName('fair-soft-contact').diffuseTexture,null);for(const m of k.scene.meshes.filter(m=>m.metadata?.presentation===r.profile)){assert(!m.isPickable&&!m.checkCollisions);assert(m.hasVertexAlpha);assert(!k.shadow.getShadowMap().renderList.includes(m));}}
 finally{k.dispose();}
});
test('paused ticks, viewport resizing and import rollback preserve buffers and game state',()=>{
 const k=setup();try{const initial=structuredClone(k.s),data=k.scene.getMeshByName('fair-tree-soft-contact-0').getVertexBuffer(VertexBuffer.ColorKind),count=k.scene.meshes.length,lights=k.scene.lights.length;for(const t of [0,200,200,0]){k.s.ticks=t;const before=structuredClone(k.s);k.f.draw(k.s,10000,true);assert.deepEqual(k.s,before);assert.equal(k.scene.meshes.length,count);assert.equal(k.scene.lights.length,lights);assert.equal(k.scene.getMeshByName('fair-tree-soft-contact-0').getVertexBuffer(VertexBuffer.ColorKind),data);}k.s.ticks=0;assert.deepEqual(k.s,initial);}
 finally{k.dispose();}
});
test('map root disable also disables the local fill and all added contact meshes',()=>{
 const k=setup();try{k.f.root.setEnabled(false);const r=k.f.inspect().finish;assert(!r.fill.enabled);assert.equal(r.contacts.length,0);for(const m of k.scene.meshes.filter(m=>m.metadata?.presentation===r.profile))assert(!m.isEnabled());k.f.root.setEnabled(true);assert(k.f.inspect().finish.fill.enabled);}
 finally{k.dispose();}
});
test('disposing the fair restores only its exclusions, not an unrelated exclusion',()=>{
 const k=setup();try{k.sky.excludedMeshes.push(k.outside);k.f.root.dispose();assert.equal(k.sky.excludedMeshes.length,1);assert.equal(k.sky.excludedMeshes[0],k.outside);assert.equal(k.lamp.excludedMeshes.length,0);assert.equal(k.scene.getLightByName('fair-local-skylight'),null);assert.equal(k.scene.getMaterialByName('fair-soft-contact'),null);}
 finally{k.dispose();}
});
test('inspection exposes actual material damage and cannot mutate live state',()=>{
 const k=setup();try{const first=k.f.inspect().finish;first.metals[0].specular[0]=999;assert.notEqual(k.f.inspect().finish.metals[0].specular[0],999);k.scene.getMeshByName('leene-bell').material.specularPower=1;assert(k.f.inspect().finish.metals.some(m=>m.mesh==='leene-bell'&&m.power===1));}
 finally{k.dispose();}
});
test('tree and actor source pixels, global renderer and HUD remain byte-identical',()=>{
 for(const [p,h] of Object.entries({'src/render.ts':'e1e49124a8c47af7580e4a386c9bc43182035dec34b79a875eb90a06fdef7811','src/main.ts':'89c2980be9219b0cd80408b10524250e9a97afa3321a39acb782f8cfc484d120','src/hd-hero-art.ts':'5669a62f90149d6162036190ebae9616cb76db39b8bb36ca4d60c246a65ec39a'}))assert.equal(sha(actorBaselineBytes(p,runtimeBaselineBytes(p,readFileSync(p)))),h);
 const k=setup();try{for(const name of ['lucca-handdrawn','gato-handdrawn','fair-vendor-cloth','fair-tree']){const m=k.scene.getMeshByName(name).material;assert(m.disableLighting);assert.equal(m.diffuseTexture.samplingMode,1);}}
 finally{k.dispose();}
});
