import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {VertexBuffer,Texture,MeshBuilder} from '@babylonjs/core';
import {festivalTestScene} from './festival-test-scene.mjs';
import {fairGroundTone,shadeFairGround} from '../.test/fair-ground.mjs';
import {buildFair} from '../.test/fair-render.mjs';
import {createState} from '../.test/core.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const setup=()=>{const k=festivalTestScene();const fair=buildFair(k.scene,k.shadow);fair.root.setEnabled(true);return {...k,fair,ground:k.scene.getMeshByName('fair-ground')};};

test('tone is deterministic, opaque and bounded across the entire original field',()=>{
 for(let z=-9.4;z<=11.4;z+=.2)for(let x=-13.4;x<=13.4;x+=.2){const a=fairGroundTone(x,z);assert.deepEqual(a,fairGroundTone(x,z));assert.equal(a[3],1);assert(a.slice(0,3).every(v=>Number.isFinite(v)&&v>=.74&&v<=1));}
});
test('broad field has no lattice seam or high-frequency board-sized contrast jumps',()=>{
 for(let z=-9;z<11;z+=.17)for(let x=-13;x<13;x+=.19){const a=fairGroundTone(x,z),b=fairGroundTone(x+.01,z+.01);assert(Math.max(...a.map((v,i)=>Math.abs(v-b[i])))<.006);}
});
test('promenade and bell foreground read above the outer rim without changing pixels',()=>{
 assert(fairGroundTone(0,1)[0]>fairGroundTone(12,1)[0]+.08);
 assert(fairGroundTone(-3.5,-.5)[0]>fairGroundTone(-8,1)[0]+.02);
 assert(fairGroundTone(5,-7.1)[0]>fairGroundTone(5,0)[0]+.025);
 assert.notDeepEqual(fairGroundTone(4,4),fairGroundTone(4,7));
});
test('invalid positions cannot partially publish a colour buffer',()=>{
 for(const value of [NaN,Infinity,-Infinity])assert.throws(()=>fairGroundTone(value,0),/Non-finite/);
 const k=festivalTestScene();try{const mesh=MeshBuilder.CreateGround('bad',{width:2,height:2},k.scene);const positions=mesh.getVerticesData(VertexBuffer.PositionKind);positions[3]=NaN;mesh.setVerticesData(VertexBuffer.PositionKind,positions);assert.throws(()=>shadeFairGround(mesh));assert.equal(mesh.getVerticesData(VertexBuffer.ColorKind),null);}finally{k.dispose();}
});
test('actual fair uses exactly one opaque static colour buffer and original ground dimensions',()=>{
 const k=setup();try{const g=k.fair.inspect().ground;assert.equal(g.profile,'vq01s-static-ground-depth');assert.equal(g.source,'actual-fair-ground-buffer');assert.equal(g.vertices,1089);assert.equal(g.triangles,2048);assert.equal(g.colourValues,4356);assert(g.useVertexColors);assert.equal(g.hasVertexAlpha,false);assert.equal(g.dynamic,false);assert.equal(g.alphaMin,1);assert.equal(g.alphaMax,1);assert(g.max-g.min>.1);assert.equal(g.collision,false);assert.deepEqual(g.position,[0,.04,1]);assert.equal(k.scene.meshes.filter(m=>m.name==='fair-ground').length,1);
 const p=k.ground.getVerticesData(VertexBuffer.PositionKind),xs=[],zs=[];for(let i=0;i<p.length;i+=3){xs.push(p[i]);zs.push(p[i+2]);assert.equal(p[i+1],0);}assert(Math.abs(Math.max(...xs)-Math.min(...xs)-26.8)<1e-5);assert(Math.abs(Math.max(...zs)-Math.min(...zs)-20.8)<1e-5);
 }finally{k.dispose();}
});
test('minification uses mips while near pixels keep nearest filtering; no new atlas',()=>{
 const k=setup();try{const g=k.fair.inspect().ground;assert.deepEqual(g.texture,{width:512,height:512,sampling:Texture.NEAREST_NEAREST_MIPLINEAR,mipmaps:true,anisotropy:4});assert.equal(k.scene.textures.filter(t=>t.name==='fair-ground-reference').length,1);assert.equal(k.ground.material.diffuseTexture.name,'fair-ground-reference');}finally{k.dispose();}
});
test('saved painters, garden topology, actor paint and held renderer remain byte-identical',()=>{
 for(const [p,h] of Object.entries({'src/early-art.ts':'12b0f9db63ff3cf0e22bda3a758ca3d3a33995c6c74c4c7b431a8a94f38a4b10','src/surface-layout.ts':'5a0e6520e80dbd609b6e5ebaab93c78e5be1a67b5b3068261336a36d8d7fb995','src/hd-hero-art.ts':'5669a62f90149d6162036190ebae9616cb76db39b8bb36ca4d60c246a65ec39a'}))assert.equal(sha(readFileSync(p)),h);
 const b=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');
});
test('sampling changes are confined to the ground, never transparent actor textures',()=>{
 const k=setup();try{for(const id of ['lucca-handdrawn','fair-vendor-cloth','gato-handdrawn'])assert.equal(k.scene.getMeshByName(id).material.diffuseTexture.samplingMode,Texture.NEAREST_SAMPLINGMODE);}finally{k.dispose();}
});
test('ground has no clock or per-frame uploads across pause, tick rollback or mode changes',()=>{
 const k=setup();try{const s=createState('fair'),before=structuredClone(s),g=k.fair.inspect().ground,buffer=k.ground.getVertexBuffer(VertexBuffer.ColorKind);k.fair.draw(s,0);assert.deepEqual(s,before);
 const tex=k.ground.material.diffuseTexture;tex.update=()=>assert.fail('ground uploaded from draw');
 for(const ticks of [0,0,1,30,30,600,1,0]){s.ticks=ticks;k.fair.draw(s,ticks/60);assert.deepEqual(k.fair.inspect().ground,g);assert.equal(k.ground.getVertexBuffer(VertexBuffer.ColorKind),buffer);}
 }finally{k.dispose();}
});
test('inspection reflects a real buffer mutation rather than an always-passed contract',()=>{
 const k=setup();try{const before=k.fair.inspect().ground;const values=k.ground.getVerticesData(VertexBuffer.ColorKind);values[0]=.1;k.ground.setVerticesData(VertexBuffer.ColorKind,values,false,4);const after=k.fair.inspect().ground;assert.notEqual(after.checksum,before.checksum);assert(after.min<.2);after.texture.width=1;assert.equal(k.fair.inspect().ground.texture.width,512);}finally{k.dispose();}
});
test('viewport changes cannot change world-space colours or allocate more ground resources',()=>{
 const k=setup();try{const before=k.fair.inspect().ground,n=k.scene.textures.length;for(const [w,h] of [[1365,900],[390,844],[844,390]]){k.camera.orthoLeft=-8*w/h;k.camera.orthoRight=8*w/h;k.scene.render();assert.deepEqual(k.fair.inspect().ground,before);assert.equal(k.scene.textures.length,n);}}finally{k.dispose();}
});
test('disposal does not leave a cross-scene ground material or colour cache',()=>{
 const a=setup(),b=setup();const expected=b.fair.inspect().ground;assert.notEqual(a.ground.material,b.ground.material);a.dispose();assert.deepEqual(b.fair.inspect().ground,expected);b.dispose();
});
