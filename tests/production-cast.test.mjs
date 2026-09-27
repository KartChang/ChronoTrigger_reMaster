/** Current courtroom cast finish; no gameplay or native evidence is generated here. */
import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';import {inflateSync} from 'node:zlib';
import {DynamicTexture,MeshBuilder,StandardMaterial,Texture} from '@babylonjs/core';
import {finishActorPixels,installProductionActorFinish,ACTOR_FINISH} from '../.test/production-actor-finish.mjs';
import {drawWitness,WITNESS_KINDS} from '../.test/witness-art.mjs';
import {World} from '../.test/cpu-entry.mjs';import {productionWorldRig} from './helpers/production-world-rig.mjs';import {surface} from '../scripts/asset-export.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
for(const kind of WITNESS_KINDS)test(kind+' all four ambient frames preserve alpha, keyline and pixel coordinates',()=>{
 for(let f=0;f<4;f++){const p=surface(48,64);drawWitness(p.ink,kind,f);const raw=new Uint8ClampedArray(p.rgba),before=raw.slice(),out=finishActorPixels(raw);assert.deepEqual(raw,before);assert.notEqual(sha(raw),sha(out));assert.deepEqual(out,finishActorPixels(raw));
  for(let i=0;i<out.length;i+=4){assert.equal(out[i+3],raw[i+3]);if(Math.max(...raw.subarray(i,i+3))<78||raw[i+3]!==255)assert.deepEqual(out.subarray(i,i+4),raw.subarray(i,i+4));}
 }
});
test('cast finish rejects wrong size and never manufactures transparent pixels',()=>{for(const data of [new Uint8ClampedArray(0),new Uint8ClampedArray(48*63*4)])assert.throws(()=>finishActorPixels(data));assert.throws(()=>finishActorPixels(new Uint8ClampedArray(48*64*4),64,48));});
function setup(name='courtroomjudge'){
 const r=productionWorldRig(World),scene=r.world.engine.scenes[0],pass=installProductionActorFinish(scene),t=new DynamicTexture('cast-test',{width:48,height:64},scene,false,Texture.NEAREST_SAMPLINGMODE),mat=new StandardMaterial('cast-test-material',scene),m=MeshBuilder.CreatePlane(name,{},scene);mat.diffuseTexture=t;m.material=mat;
 const read=()=>new Uint8ClampedArray(t.getContext().getImageData(0,0,48,64).data);
 const paint=(f=0)=>{drawWitness(t.getContext(),'judge',f);t.update();};
 return {...r,scene,pass,t,m,read,paint};
}
test('borrowed texture handles repeated upload, new ambient frame, chapter exit/reentry and original upload semantics',()=>{
 const r=setup();try{r.paint();const raw=r.read(),original=r.t.update,count=r.scene.textures.length;r.pass.begin('courtroom');r.scene.onBeforeRenderObservable.notifyObservers(r.scene);assert.notEqual(r.t.update,original);assert.deepEqual(r.read(),finishActorPixels(raw));
  const first=r.read(),calls=r.pass.inspect().finishedUploads;for(let i=0;i<3;i++)r.t.update();assert.deepEqual(r.read(),first);assert.equal(r.pass.inspect().finishedUploads,calls);assert.equal(r.scene.textures.length,count);
  r.paint(2);const source=surface(48,64);drawWitness(source.ink,'judge',2);assert.deepEqual(r.read(),finishActorPixels(new Uint8ClampedArray(source.rgba)));
  r.pass.begin('bedroom');assert.deepEqual(r.read(),new Uint8ClampedArray(source.rgba));r.pass.begin('courtroom');r.scene.onBeforeRenderObservable.notifyObservers(r.scene);assert.deepEqual(r.read(),finishActorPixels(new Uint8ClampedArray(source.rgba)));
  r.t.dispose();assert.equal(r.t.update,original);assert.equal(r.pass.inspect().bindings,0);
 }finally{r.close();}
});
for(const name of ['player-0','player-1','guest-companion','enemy-0','mother','courtroom-judge-rostrum'])test('finish never binds protected/non-cast texture '+name,()=>{
 const r=setup(name);try{r.paint();const raw=r.read(),old=r.t.update;r.pass.begin('courtroom');r.scene.onBeforeRenderObservable.notifyObservers(r.scene);assert.equal(r.t.update,old);assert.deepEqual(r.read(),raw);assert.equal(r.pass.inspect().bindings,0);}finally{r.close();}
});
test('cast adapter caps bindings, retains bounded CPU pixels and releases only its own adapter',()=>{
 const r=setup();try{r.paint();for(let i=0;i<30;i++){const t=new DynamicTexture('cast-'+i,{width:48,height:64},r.scene,false),m=MeshBuilder.CreatePlane('courtroomjuror-'+i,{},r.scene);m.material=new StandardMaterial('cast-m'+i,r.scene);m.material.diffuseTexture=t;drawWitness(t.getContext(),'guard',0);t.update();}
 r.pass.begin('courtroom');r.scene.onBeforeRenderObservable.notifyObservers(r.scene);const d=r.pass.inspect();assert.equal(d.bindings,ACTOR_FINISH.maxBindings);assert.equal(d.retainedCpuBytes,24*48*64*4*2);assert.equal(d.additionalGpuTextures,0);r.world.engine.dispose();assert.equal(r.pass.inspect().bindings,0);assert(r.pass.inspect().disposed);
 }finally{r.close();}
});
test('cast and forest export uses exact runtime source pixels, not concept imagery or new-party claims',async()=>{
 const {exportProductionActors}=await import('../scripts/production-actor-export.mjs'),out='.test/production-cast-export-check',manifest=await exportProductionActors(out);assert.equal(manifest.assets.length,9);assert.equal(manifest.posesRedrawn,false);assert.equal(manifest.partyEnemyPaintersRetained,true);
 for(const item of manifest.assets){const raw=readFileSync(out+'/'+item.file);assert.equal(sha(raw),item.pngSha256);let at=8;const parts=[];while(at<raw.length){const n=raw.readUInt32BE(at);if(raw.toString('ascii',at+4,at+8)==='IDAT')parts.push(raw.subarray(at+8,at+8+n));at+=n+12;}const decoded=inflateSync(Buffer.concat(parts)),pixels=Buffer.alloc(item.width*item.height*4),stride=item.width*4;for(let y=0;y<item.height;y++){assert.equal(decoded[y*(stride+1)],0);decoded.copy(pixels,y*stride,y*(stride+1)+1,(y+1)*(stride+1));}assert.equal(sha(pixels),item.rgbaSha256);
  if(item.name.startsWith('witness-')){for(let f=0;f<4;f++){const p=surface(48,64);drawWitness(p.ink,item.name.slice(8),f);const expected=finishActorPixels(new Uint8ClampedArray(p.rgba));for(let y=0;y<64;y++)assert.deepEqual(pixels.subarray((y*192+f*48)*4,(y*192+f*48+48)*4),Buffer.from(expected.subarray(y*48*4,(y+1)*48*4)));}}
 }
});
