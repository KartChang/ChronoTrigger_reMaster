import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {NullEngine,Scene,FreeCamera,Vector3,Camera,MeshBuilder,TransformNode,StandardMaterial,Material} from '@babylonjs/core/index.js';
import {TownSignOcclusion,TOWN_SIGN_OCCLUSION} from '../.test/town-sign-occlusion.mjs';
import {World,createState,renderCompatibleScene} from '../.test/building-baseline-cpu-entry.mjs';
import {World as OldWorld} from '../.test/sign-occlusion-baseline-cpu-entry.mjs';
import {buildingIfDeclared} from './helpers/building-baseline.mjs';
import {signOcclusionBaseline} from './helpers/sign-occlusion-baseline.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const spec=JSON.parse(readFileSync('tests/baselines/vq02z-declared-sign-occlusion-edits.json'));
for(const [path,edits] of Object.entries(spec.files))test('Z exact CI67 inverse, with missing/duplicate/extra-edit rejection: '+path,()=>{
 const source=buildingIfDeclared(path,readFileSync(path,'utf8'));assert.equal(hash(signOcclusionBaseline(path,source)),spec.originalSha256[path]);
 for(const e of edits){assert.throws(()=>signOcclusionBaseline(path,source+e.after));assert.throws(()=>signOcclusionBaseline(path,source.replace(e.after,'')));}
 assert.notEqual(hash(signOcclusionBaseline(path,source+'\n// unrelated edit\n')),spec.originalSha256[path]);
});
function rig(){
 const engine=new NullEngine(),scene=new Scene(engine),camera=new FreeCamera('camera',new Vector3(0,0,-20),scene);
 camera.setTarget(Vector3.Zero());camera.mode=Camera.ORTHOGRAPHIC_CAMERA;scene.activeCamera=camera;
 const sign=MeshBuilder.CreatePlane('inn-sign',{width:4,height:4},scene);sign.parent=new TransformNode('kingdom-truce',scene);sign.position.z=-1;
 const material=new StandardMaterial('private-sign',scene);material.transparencyMode=Material.MATERIAL_ALPHATEST;sign.material=material;
 const actor=MeshBuilder.CreatePlane('hero',{width:1.36,height:1.85},scene);actor.position.z=0;
 const c=new TownSignOcclusion(scene);return {engine,scene,camera,sign,material,actor,c,draw(t,id='p0'){c.update(t,'truce',[{id,mesh:actor}]);return c.inspect();},close(){scene.dispose();engine.dispose();}};
}
for(const id of ['p0','p1','guest'])test('Z real triangle hit protects '+id+' and uses alpha blend rather than alpha discard',()=>{
 const k=rig();try{const before={position:k.sign.position.asArray(),scale:k.sign.scaling.asArray(),vertices:Array.from(k.sign.getVerticesData('position'))};
  const o=k.draw(0,id);assert.deepEqual(o.blockedBy,[id]);assert.equal(o.visibility,.3);assert.equal(k.sign.visibility,.3);assert.equal(k.material.transparencyMode,Material.MATERIAL_ALPHABLEND);
  assert.deepEqual({position:k.sign.position.asArray(),scale:k.sign.scaling.asArray(),vertices:Array.from(k.sign.getVerticesData('position'))},before);
  assert.equal(k.material.alpha,1);assert(o.meshRayTests>=1&&o.meshRayTests<=9);assert.equal(o.approved,false);
 }finally{k.close();}
});
for(const [label,setup] of [['beside',k=>k.actor.position.x=9],['behind actor',k=>k.sign.position.z=1],['disabled actor',k=>k.actor.setEnabled(false)],['hidden actor',k=>k.actor.isVisible=false],['zero visibility',k=>k.actor.visibility=0]])test('Z does not fade sign for '+label,()=>{
 const k=rig();try{setup(k);const o=k.draw(0);assert.deepEqual(o.blockedBy,[]);assert.equal(o.visibility,1);assert.equal(k.material.transparencyMode,1);}finally{k.close();}
});
test('Z native-style fixed ticks freeze, hold clear edges, restore opacity and reset',()=>{
 const k=rig();try{
  k.actor.position.x=9;assert.equal(k.draw(0).visibility,1);k.actor.position.x=0;const a=k.draw(1);assert(a.visibility<1&&a.visibility>.3);
  for(let i=0;i<30;i++)assert.deepEqual(k.draw(1),a);
  assert.equal(k.draw(200).visibility,.3);k.actor.position.x=9;assert.equal(k.draw(211).visibility,.3);
  assert(k.draw(213).visibility>.3);assert.equal(k.draw(400).visibility,1);assert.equal(k.material.transparencyMode,1);
  k.actor.position.x=0;k.draw(500);k.c.reset();assert.equal(k.sign.visibility,1);assert.equal(k.material.transparencyMode,1);assert.equal(k.c.inspect().active,false);
  k.draw(0);k.c.update(1,'forest',[]);assert.equal(k.sign.visibility,1);assert.equal(k.c.inspect().owner,null);
 }finally{k.close();}
});
test('Z invalid map owner, shared material, duplicate/unknown actor and nonfinite ticks cannot mutate unrelated objects',()=>{
 const k=rig();try{
  k.sign.parent.name='other-map';assert.equal(k.draw(0).active,false);k.sign.parent.name='kingdom-truce';
  k.actor.material=k.material;assert.equal(k.draw(1).active,false);k.actor.material=null;
  k.c.update(2,'truce',[{id:'p0',mesh:k.actor},{id:'p0',mesh:k.actor},{id:'npc',mesh:k.actor}]);assert.deepEqual(k.c.inspect().subjects,['p0']);assert(k.c.inspect().meshRayTests<=9);
  for(const t of [NaN,-1,Infinity,1.5]){k.c.update(t,'truce',[]);assert.equal(k.c.inspect().active,false);assert.equal(k.sign.visibility,1);}
  const o=k.draw(5);o.blockedBy.push('forged');assert.deepEqual(k.c.inspect().blockedBy,['p0']);k.draw(1);assert.equal(k.sign.visibility,.3);
 }finally{k.close();}
});
function pair(width=195,height=422){
 const oldDoc=globalThis.document,oldWindow=globalThis.window;
 const doc={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};
 const a=cpuTestCanvas(width,height),b=cpuTestCanvas(width,height);a.canvas.ownerDocument=b.canvas.ownerDocument=doc;
 const current=new World(a.canvas),previous=new OldWorld(b.canvas);
 return {a,b,current,previous,close(){current.engine.dispose();previous.engine.dispose();globalThis.document=oldDoc;globalThis.window=oldWindow;}};
}
const geom=m=>({name:m.name,position:m.position.asArray(),scaling:m.scaling.asArray(),rotation:m.rotation.asArray(),vertices:m.getTotalVertices(),indices:m.getTotalIndices(),material:m.material?.name,enabled:m.isEnabled()});
function arrive(){const s=createState('truce');s.opening.phase='vista';s.kingdom.phase='arrival';s.joined=true;return s;}
test('Z actual CPU scene changes only sign-overlap pixels, preserves full state/geometry/textures, and is stable while paused',()=>{
 const k=pair(),s=arrive();try{
  Object.assign(s.players[0],{x:-6.5,z:-4.3});s.ticks=500;const before=structuredClone(s);
  k.current.draw(s,0,false);k.previous.draw(structuredClone(s),0,false);
  const o=k.current.inspect().townSignOcclusion;assert.deepEqual(o.subjects,['p0']);assert.deepEqual(o.blockedBy,['p0']);assert.equal(o.visibility,.3);
  assert.deepEqual(s,before);assert.deepEqual(k.current.scene.meshes.map(geom),k.previous.scene.meshes.map(geom));assert.equal(k.current.scene.textures.length,k.previous.scene.textures.length);
  const pixels=k.a.pixels().slice();assert.notDeepEqual(pixels,k.b.pixels());
  const sign=k.current.scene.getMeshByName('inn-sign');sign.isVisible=false;renderCompatibleScene(k.current.engine,k.current.scene);assert.notDeepEqual(k.a.pixels(),pixels,'faded sign is not wholly discarded');
  // The normal draw restores/uses the exact fade; repeated frozen renders must not drift.
  sign.isVisible=true;k.current.draw(s,0,false);assert.deepEqual(k.a.pixels(),pixels);
  for(let i=0;i<4;i++){k.current.draw(s,0,false);assert.deepEqual(k.a.pixels(),pixels);assert.deepEqual(s,before);}
  assert.equal(k.current.inspectRenderer().cpu.textureMemory.budget,33554432);
 }finally{k.close();}
});
for(const portrait of [false,true])test('Z all other chapters and unobstructed Truce stay pixel-identical '+portrait,()=>{
 const k=pair(portrait?120:180,portrait?240:120);try{
  for(const chapter of ['truce','forest','castle','chamber','fair','bedroom','downstairs','overworld','cathedral','future']){
   const s=chapter==='truce'?arrive():createState(chapter);if(chapter==='truce')Object.assign(s.players[0],{x:0,z:6.4});
   k.current.draw(s,0,false);k.previous.draw(structuredClone(s),0,false);assert.deepEqual(k.a.pixels(),k.b.pixels(),chapter);assert.deepEqual(k.current.scene.meshes.map(geom),k.previous.scene.meshes.map(geom),chapter);
  }
 }finally{k.close();}
});
test('Z map returns, load/reset and landscape/portrait leave no new meshes or textures',()=>{
 const k=pair();try{
  for(const chapter of ['truce','forest','castle'])k.current.draw(createState(chapter),0,false);
  const n=k.current.scene.textures.length,m=k.current.scene.meshes.length;
  for(let i=0;i<6;i++)for(const chapter of ['truce','forest','castle']){k.current.draw(createState(chapter),0,false);assert.equal(k.current.scene.textures.length,n);assert.equal(k.current.scene.meshes.length,m);}
  for(const [width,height] of [[390,844],[844,390],[960,640]]){k.a.canvas.clientWidth=width;k.a.canvas.clientHeight=height;k.current.resize();const s=arrive();k.current.draw(s,0,false);assert.deepEqual(k.current.inspect().townSignOcclusion.blockedBy,[]);}
 }finally{k.close();}
});
test('Z cannot normalize forbidden scene/game/input/save/quality edits',()=>{
 for(const p of ['src/prologue-render.ts','src/core.ts','src/main.ts','src/cpu-raster.ts','src/input.ts','.github/workflows/ci.yml'])assert.throws(()=>signOcclusionBaseline(p,'changed'));
 const b=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${b.length}\0`),b])).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');
 assert.equal(TOWN_SIGN_OCCLUSION.approved,false);
});

test('Z reduced-motion snaps visual opacity without advancing simulation or altering sign pixels',()=>{
 const k=rig();try{k.actor.position.x=9;k.draw(0);k.actor.position.x=0;k.c.update(1,'truce',[{id:'p0',mesh:k.actor}],true);assert.equal(k.c.inspect().visibility,.3);assert.equal(k.c.inspect().reducedMotion,true);
 k.actor.position.x=9;k.c.update(20,'truce',[{id:'p0',mesh:k.actor}],true);assert.equal(k.c.inspect().visibility,1);assert.equal(k.material.transparencyMode,1);
 }finally{k.close();}
});
