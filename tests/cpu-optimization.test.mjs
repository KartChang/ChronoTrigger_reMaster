import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Scene,FreeCamera,Camera,Vector3,MeshBuilder,StandardMaterial,Color3,DirectionalLight,HemisphericLight,VertexBuffer,Matrix} from '@babylonjs/core';
import {CpuEngine,CpuRaster,Ci46CpuRaster,Ci46CpuScene,renderCompatibleScene,inspectCpuRendering,World,createState,clipOutcode,outsideClipVolume} from '../.test/cpu-entry.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
const vertex=(x,y,z=0,w=1)=>({x,y,z,w,u:x/2+.5,v:y/2+.5,r:.8,g:.5,b:.3,a:1});
const surface=()=>({texture:null,opacity:null,textureAlpha:false,opacityFromRGB:false,alpha:1,cutoff:0,blend:false,emission:[0,0,0]});
let seed=46;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
const texture=()=>({width:4,height:4,rgba:Uint8ClampedArray.from({length:64},()=>random()*255),invertY:true,wrapU:1,wrapV:2,matrix:Array.from(Matrix.Identity().m)});
function parity(primitives,width=53,height=31){const current=new CpuRaster(width,height),prior=new Ci46CpuRaster(width,height);for(const r of [current,prior]){r.clear([.1,.2,.3]);for(const [a,b,c,m] of primitives)r.triangle(a,b,c,m);}assert.deepEqual(current.rgba,prior.rgba);assert.deepEqual(current.depth,prior.depth);assert.equal(current.triangles,prior.triangles);assert.equal(current.fragments,prior.fragments);assert.equal(current.submitted,current.fastAccepted+current.trivialRejected+current.clipped);return current;}
test('test-only raster/scene oracles are exact CI46 source blobs, not a parallel production renderer',()=>{
 for(const [name,hash] of Object.entries(JSON.parse(readFileSync('tests/baselines/CI46.json','utf8'))))assert.equal(createHash('sha1').update(`blob ${readFileSync('tests/baselines/'+name).length}\0`).update(readFileSync('tests/baselines/'+name)).digest('hex'),hash);
 assert(!readFileSync('src/cpu-scene.ts','utf8').includes('baselines'));
});
test('outcodes reject only a shared outside plane; boundary, invalid and eye-plane cases remain conservative',()=>{
 assert.equal(clipOutcode(0,0,0,1),0);assert.equal(clipOutcode(1,0,0,1),0);assert.equal(clipOutcode(2,0,0,1),2);assert.equal(clipOutcode(NaN,0,0,1),64);
 const m=Matrix.Identity().m;assert(outsideClipVolume([2,0,0,3,1,0],m,0,2));assert(!outsideClipVolume([-2,0,0,2,1,0],m,0,2));assert(!outsideClipVolume([2,0,0,NaN,1,0],m,0,2));assert(!outsideClipVolume([2,0,0],m,0,2));
 const p=[2,0,0,3,1,0];assert(outsideClipVolume(p,m,0,2));p[0]=0;assert(!outsideClipVolume(p,m,0,2));
});
test('triangle shortcuts preserve RGBA/depth for inside, outside, clipping, near-zero w and invalid attributes',()=>{
 const inputs=[[-.5,-.5,.5,.5,0,.7],[2,0,3,0,2,1],[-2,-2,2,-2,0,2],[0,0,0,0,0,0]].map(a=>[vertex(a[0],a[1]),vertex(a[2],a[3]),vertex(a[4],a[5]),surface()]);
 for(const w of [-1,0,1e-12,1e-9,1e-8])inputs.push([vertex(0,0,0,w),vertex(.5,.5),vertex(-.5,.5),surface()]);
 for(const k of ['x','y','z','w','u','v','r','g','b','a'])for(const n of [NaN,Infinity,-Infinity])inputs.push([{...vertex(0,0),[k]:n},vertex(.5,.5),vertex(-.5,.5),surface()]);
 const r=parity(inputs);assert(r.fastAccepted>0&&r.trivialRejected>0&&r.clipped>0);
});
test('5000 deterministic textured/blended/clipped triangles retain every prior pixel, depth and fragment',()=>{
 for(let batch=0;batch<20;batch++){
  const primitives=[];for(let i=0;i<250;i++){
   const v=()=>({...vertex(random()*4-2,random()*4-2,random()*3-1.5,random()*2+.01),u:random()*6-3,v:random()*6-3,r:random(),g:random(),b:random(),a:random()});
   const m={...surface(),texture:i%2?texture():null,opacity:i%5?null:texture(),textureAlpha:i%3===0,opacityFromRGB:i%7===0,blend:i%4===0,alpha:i%4===0?.5:1,cutoff:i%3===0?.3:0};primitives.push([v(),v(),v(),m]);
  }parity(primitives);
 }
});
test('shared quad edges and reversed winding keep translucent seams and depth ties identical',()=>{
 for(const winding of [false,true]){const a=vertex(-1,-1),b=vertex(1,-1),c=vertex(1,1),d=vertex(-1,1),m={...surface(),blend:true,alpha:.5};parity(winding?[[c,b,a,m],[d,c,a,m]]:[[a,b,c,m],[a,c,d,m]],32,32);}
});
function setup(){const p=cpuTestCanvas(64,48),engine=new CpuEngine(p.canvas,p.context);engine.createCanvas=(w,h)=>cpuTestCanvas(w,h).canvas;const scene=new Scene(engine),camera=new FreeCamera('camera',new Vector3(0,0,-5),scene);camera.mode=Camera.ORTHOGRAPHIC_CAMERA;camera.setTarget(Vector3.Zero());camera.orthoLeft=-2;camera.orthoRight=2;camera.orthoTop=1.5;camera.orthoBottom=-1.5;scene.activeCamera=camera;return {...p,engine,scene,camera,prior:new Ci46CpuScene(engine),dispose(){scene.dispose();engine.dispose();}};}
function sceneParity(k){renderCompatibleScene(k.engine,k.scene);const before=k.pixels().slice(),info=inspectCpuRendering(k.engine);k.prior.draw(k.scene);assert.deepEqual(k.pixels(),before);return info.cpu.work;}
test('offscreen shading is skipped without changing live lights, moved meshes or stale geometry bounds',()=>{
 const k=setup();try{const h=new HemisphericLight('sky',Vector3.Up(),k.scene),d=new DirectionalLight('key',new Vector3(-.4,-1,.3),k.scene),m=new StandardMaterial('paint',k.scene);m.diffuseColor=new Color3(.7,.5,.2);
 const visible=MeshBuilder.CreateBox('inside',{},k.scene);visible.material=m;
 const offscreen=MeshBuilder.CreateBox('outside',{updatable:true},k.scene);offscreen.position.x=100;offscreen.material=m;
 let w=sceneParity(k);assert(w.culledSubmeshes>0&&w.shadedVertices>0);d.direction.set(1,-1,.1);h.intensity=.2;sceneParity(k);
 offscreen.position.x=.7;w=sceneParity(k);assert.equal(w.culledSubmeshes,0);
 offscreen.position.x=100;const data=offscreen.getVerticesData(VertexBuffer.PositionKind);for(let i=0;i<data.length;i+=3)data[i]-=100;offscreen.updateVerticesData(VertexBuffer.PositionKind,data,false);w=sceneParity(k);assert.equal(w.culledSubmeshes,0);
 offscreen.scaling.set(-1,2,.5);sceneParity(k);visible.setEnabled(false);sceneParity(k);
 }finally{k.dispose();}
});
test('full existing chapter scene graphs retain CI46 CPU pixels in landscape and portrait unit views',()=>{
 const chapters=[...new Set([...readFileSync('src/fair-data.ts','utf8').split('export type Chapter =')[1].split(';')[0].matchAll(/'([a-z0-9]+)'/g),...readFileSync('src/trial-data.ts','utf8').split('export type TrialMap=')[1].split(';')[0].matchAll(/'([a-z0-9]+)'/g)].map(m=>m[1]))];
 const oldWindow=globalThis.window,oldDocument=globalThis.document,p=cpuTestCanvas(96,64);const doc={createElement(tag){return tag==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}};},getElementById(){return null;},addEventListener(){},removeEventListener(){}};
 p.canvas.ownerDocument=doc;globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};
 let world;try{world=new World(p.canvas);const prior=new Ci46CpuScene(world.engine);let culled=0;
  for(const [width,height] of [[96,64],[48,80]]){p.canvas.clientWidth=width;p.canvas.clientHeight=height;world.resize();for(const chapter of chapters){const state=createState(chapter),before=structuredClone(state);world.draw(state,0,false);const pixels=p.pixels().slice();prior.draw(world.scene);assert.deepEqual(p.pixels(),pixels,`${chapter}/${width} pixel parity`);assert.deepEqual(state,before);culled+=world.inspectRenderer().cpu.work.culledSubmeshes;}}
  assert(culled>0);console.log(JSON.stringify({kind:'unit constructed states; not native browser evidence',chapters:chapters.length,viewports:2,byteExact:true,culled}));
 }finally{world?.engine.dispose();globalThis.window=oldWindow;globalThis.document=oldDocument;}
});
test('CPU pause explanation has valid sibling paragraphs and no WebGL-only instruction',()=>{const html=readFileSync('index.html','utf8');assert(html.includes('</select></p>'));assert(!html.includes('</p></p>'));assert(html.includes('WebGL 無法使用時，預設嘗試 CPU 相容繪圖。'));});
