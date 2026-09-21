import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Vector3,VertexData,VertexBuffer,TransformNode} from '@babylonjs/core';
import {fairStoneGeometry,fairStoneBevel,FAIR_FORM_TEXEL} from '../.test/fair-cohesion.mjs';
import {buildFair} from '../.test/fair-render.mjs';
import {createState} from '../.test/core.mjs';
import {festivalTestScene} from './festival-test-scene.mjs';
const setup=()=>{const k=festivalTestScene();k.shadow.setDarkness(.12);const f=buildFair(k.scene,k.shadow),s=createState('fair');return {...k,f,s};};
const observe=k=>k.scene.onBeforeRenderObservable.notifyObservers(k.scene);
const live=k=>k.f.inspect().finish.cohesion;

test('actor-scale stone chamfer preserves dimensions with a closed manifold, outward normals and immutable colours',()=>{
 for(const dims of [[.35,2.8,.65],[.31,.35,.72],[.58,.35,.8],[.64,.25,.85]]){
  const d=fairStoneGeometry(...dims),normal=[];VertexData.ComputeNormals(d.positions,d.indices,normal);
  assert.equal(d.positions.length,96*3);assert.equal(d.indices.length,44*3);assert.equal(d.colors.length,96*4);
  for(let axis=0;axis<3;axis++){const c=d.positions.filter((_,i)=>i%3===axis);assert.equal(Math.min(...c),-dims[axis]/2);assert.equal(Math.max(...c),dims[axis]/2);}
  const edges=new Map(),key=index=>d.positions.slice(index*3,index*3+3).map(n=>n.toFixed(9)).join(',');
  for(let i=0;i<d.indices.length;i+=3){const tri=d.indices.slice(i,i+3);const p=tri.map(j=>Vector3.FromArray(d.positions,j*3));assert(Vector3.Cross(p[1].subtract(p[0]),p[2].subtract(p[0])).length()>1e-10);
   for(let j=0;j<3;j++){const a=key(tri[j]),b=key(tri[(j+1)%3]),k=[a,b].sort().join('|');edges.set(k,(edges.get(k)??0)+1);}
  }
  assert([...edges.values()].every(n=>n===2),'open or multiply-owned geometric edge');
  for(let i=0;i<d.normals.length;i++){assert(Math.abs(normal[i]-d.normals[i])<1e-6);if(i%3===0){const p=Vector3.FromArray(d.positions,i),n=Vector3.FromArray(d.normals,i);assert(Vector3.Dot(p,n)>0);}}
  assert(fairStoneBevel(...dims)<=1.5*FAIR_FORM_TEXEL);assert(d.colors.every((n,i)=>i%4===3?n===1:n>=.93&&n<=1));
 }
});
test('invalid dimensions fail before a partial geometry can be applied',()=>{for(const n of [0,-1,NaN,Infinity])for(let i=0;i<3;i++){const d=[1,1,1];d[i]=n;assert.throws(()=>fairStoneGeometry(...d));}});
test('fair shadow readability uses and restores the exact existing generator and filter',()=>{
 const k=setup();try{const map=k.shadow.getShadowMap(),filter=k.shadow.filter,bias=k.shadow.bias,normal=k.shadow.normalBias;
 assert.equal(k.shadow.getDarkness(),.12);k.f.root.setEnabled(true);k.f.draw(k.s,0);assert.equal(k.shadow.getDarkness(),.34);assert(live(k).shadow.active);
 assert.equal(k.shadow.getShadowMap(),map);assert.equal(k.shadow.filter,filter);assert.equal(k.shadow.bias,bias);assert.equal(k.shadow.normalBias,normal);
 k.f.root.setEnabled(false);observe(k);assert.equal(k.shadow.getDarkness(),.12);assert(!live(k).shadow.active);
 k.shadow.setDarkness(.61);k.f.root.setEnabled(true);observe(k);assert.equal(k.shadow.getDarkness(),.61);k.f.root.setEnabled(false);observe(k);assert.equal(k.shadow.getDarkness(),.61);
 }finally{k.dispose();}
});
test('disabled parent and map exit restore shadow without a fair draw call',()=>{
 const k=setup();try{const parent=new TransformNode('outside',k.scene);k.f.root.parent=parent;k.f.root.setEnabled(true);observe(k);assert.equal(k.shadow.getDarkness(),.34);
 parent.setEnabled(false);observe(k);assert.equal(k.shadow.getDarkness(),.12);parent.setEnabled(true);observe(k);assert.equal(k.shadow.getDarkness(),.34);
 }finally{k.dispose();}
});
test('disposing an enabled fair restores outside settings and removes its observer',()=>{
 const k=festivalTestScene();try{const count=k.scene.onBeforeRenderObservable.observers.length;k.shadow.setDarkness(.18);const f=buildFair(k.scene,k.shadow);f.root.setEnabled(true);observe(k);assert.equal(k.shadow.getDarkness(),.34);f.root.dispose();assert.equal(k.shadow.getDarkness(),.18);assert.equal(k.scene.onBeforeRenderObservable.observers.filter(o=>!o._willBeUnregistered).length,count);observe(k);assert.equal(k.shadow.getDarkness(),.18);assert(k.shadow.getShadowMap());}finally{k.dispose();}
});
test('merged forms retain only structural casters and full stone edge data',()=>{
 const k=setup();try{const r=live(k);const parts=r.forms.flatMap(f=>f.parts);assert.equal(parts.filter(p=>p.bevel!==null).length,20);
 for(const f of r.forms){assert(f.receives);assert(f.parts.length>0);assert(f.parts.every(p=>p.casts===f.casts));assert.equal(f.normals,f.vertices*3);assert.equal(f.dynamic,false);assert(!f.collision&&!f.pickable);if(f.parts.some(p=>p.bevel!==null))assert.equal(f.colors,f.vertices*4);}
 for(const name of ['bell-post','bell-capital','bell-arch-stone','telepod-beam'])assert(parts.some(p=>p.name===name&&p.casts));
 for(const name of ['fair-plinth','bell-stone-seam','bell-flowerbed','bell-flowers'])assert(parts.some(p=>p.name===name&&!p.casts));
 assert(r.forms.some(f=>f.casts)&&r.forms.some(f=>!f.casts));
 }finally{k.dispose();}
});
test('live inspection reveals lost normals, altered caster membership and mutated actor dimensions',()=>{
 const k=setup();try{const mesh=k.f.root.getChildMeshes().find(m=>m.metadata?.fairParts?.some(p=>p.name==='bell-post'));k.shadow.removeShadowCaster(mesh);assert(live(k).forms.some(f=>!f.casts&&f.parts.some(p=>p.name==='bell-post')));
 mesh.removeVerticesData(VertexBuffer.NormalKind);assert(live(k).forms.some(f=>f.normals===0));
 const actor=k.scene.getMeshByName('lucca-handdrawn'),p=Array.from(actor.getVerticesData(VertexBuffer.PositionKind));for(let i=0;i<p.length;i+=3)p[i]*=2;actor.setVerticesData(VertexBuffer.PositionKind,p,false);assert(Math.abs(live(k).actors.find(a=>a.name==='lucca-handdrawn').width-2.72)<1e-6);
 const r=live(k);r.forms[0].parts[0].name='fake';assert.notEqual(live(k).forms[0].parts[0].name,'fake');
 }finally{k.dispose();}
});
test('retained fair human planes match party scale, texture cells and nearest palettes',()=>{
 const k=setup();try{const r=live(k);assert.equal(r.actors.length,4);for(const a of r.actors){assert(Math.abs(a.width-1.36)<1e-6);assert(Math.abs(a.height-1.85)<1e-6);assert.deepEqual(a.texture,{width:48,height:64});assert.equal(a.sampling,1);assert.equal(a.billboard,7);assert(a.unlit);}
 k.f.root.setEnabled(true);k.f.draw(k.s,0);assert(k.f.inspect().vendorContacts.every(c=>c.footError<1e-5));
 }finally{k.dispose();}
});
test('pause, reduced motion, tick rollback and camera changes allocate no new geometry or texture and never write state',()=>{
 const k=setup();try{k.f.root.setEnabled(true);k.f.draw(k.s,0);const n=[k.scene.meshes.length,k.scene.textures.length],g=live(k).forms;
 for(const tick of [20,20,100,0]){k.s.ticks=tick;const state=structuredClone(k.s);k.camera.position.y+=.5;k.f.draw(k.s,9999,true);assert.deepEqual(k.s,state);assert.deepEqual(live(k).forms,g);assert.deepEqual([k.scene.meshes.length,k.scene.textures.length],n);assert.equal(k.shadow.getDarkness(),.34);assert(k.f.inspect().vendorContacts.every(c=>c.footError<1e-5));}
 }finally{k.dispose();}
});
test('party painter, field ground, original motion, held renderer and input stay byte-identical',()=>{
 const expected={'src/hd-hero-art.ts':'5669a62f90149d6162036190ebae9616cb76db39b8bb36ca4d60c246a65ec39a','src/render.ts':'0b01f8a83d251bdfeb1c9ff679e51e257ddc2258633a378fb03f51a0a91ef9a8','src/input.ts':'f4e49695188d941194c2bcdbc737fa7e0bc9f8d5f1d7d04ca6a325c50d2dded8'};
 for(const [p,h] of Object.entries(expected))assert.equal(createHash('sha256').update(readFileSync(p)).digest('hex'),h);
 const b=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');
});
