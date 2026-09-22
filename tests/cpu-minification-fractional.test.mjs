import test from 'node:test';
import assert from 'node:assert/strict';
import {CpuRaster} from '../.test/cpu-raster.mjs';
import {opaqueMipChain} from '../.test/cpu-minification.mjs';
import {World,createState} from '../.test/cpu-entry.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';

const identity=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
const vertex=(x,y,u,v,w=1)=>({x,y,z:0,w,u,v,r:1,g:1,b:1,a:1});
const texture=()=>{
 const base={width:8,height:8,rgba:Uint8ClampedArray.from({length:256},(_,i)=>i%4===3?255:((Math.floor(i/4)%8+Math.floor(i/32))%2)*255)};
 return {...base,mips:opaqueMipChain(base,4096),matrix:identity,invertY:true,wrapU:1,wrapV:1};
};
function raster(span=.75,options={}){
 const r=new CpuRaster(4,4),m={texture:texture(),opacity:null,textureAlpha:false,opacityFromRGB:false,alpha:1,cutoff:0,blend:false,emission:[0,0,0],...options};
 r.clear([0,0,0]);
 r.triangle(vertex(-1,1,0,span),vertex(1,1,span,span),vertex(1,-1,span,0),m);
 r.triangle(vertex(-1,1,0,span),vertex(1,-1,span,0),vertex(-1,-1,0,0),m);
 return r;
}

test('mild 1.5 texel footprint filters real fragments instead of a zero-triangle dead zone',()=>{
 const t=texture(),nearest=raster(.75,{texture:{...t,mips:undefined}}),filtered=raster(.75,{texture:t});
 assert.equal(filtered.minifiedTriangles,2);
 assert.notDeepEqual(filtered.rgba,nearest.rgba);
 assert.deepEqual(filtered.depth,nearest.depth);
 assert.equal(filtered.fragments,nearest.fragments);
 const mix=Math.log2(1.5);
 for(let i=0;i<filtered.rgba.length;i++)assert.equal(filtered.rgba[i],i%4===3?255:Math.round(nearest.rgba[i]*(1-mix)+128*mix));
});

test('existing World fair at original CPU densities changes only opt-in sampling and restores exactly',()=>{
 // Existing scene constructors + rect-only Canvas2D unit port; not a browser or save fixture.
 const oldWindow=globalThis.window,oldDocument=globalThis.document,p=cpuTestCanvas(960,640);
 const doc={createElement(tag){return tag==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}};},getElementById(){return null;},addEventListener(){},removeEventListener(){}};
 p.canvas.ownerDocument=doc;globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};
 let world;
 try{
  world=new World(p.canvas);const state=createState('fair'),saved=structuredClone(state);
  world.draw(state,0,false);
  for(const width of [678,543,452]){
   world.engine.setHardwareScalingLevel(960/width);
   world.engine.setOpaqueMinification(false);world.draw(state,0,false);
   const nearest=p.pixels().slice(),before=world.inspectRenderer().cpu;
   world.engine.setOpaqueMinification(true);world.draw(state,0,false);
   const after=world.inspectRenderer().cpu;
   assert(after.sampling.minifiedTriangles>0,`original fair at ${width}px`);
   assert.notDeepEqual(p.pixels(),nearest);
   assert.equal(after.triangles,before.triangles);assert.equal(after.fragments,before.fragments);
   assert(after.textureMemory.mipBytes>0&&after.textureMemory.bytes<=after.textureMemory.budget);
   assert(after.textureMemory.entries<=after.textureMemory.entryLimit);
   world.engine.setOpaqueMinification(false);world.draw(state,0,false);
   assert.deepEqual(p.pixels(),nearest);assert.equal(world.inspectRenderer().cpu.textureMemory.mipBytes,0);
   assert.deepEqual(state,saved);
  }
 }finally{world?.engine.dispose();globalThis.window=oldWindow;globalThis.document=oldDocument;}
});

const {opaqueMipBlend}=await import('../.test/cpu-minification.mjs');
const footprint=(rho,count=3,m=identity)=>opaqueMipBlend({sx:0,sy:0,u:0,v:0,iw:1},{sx:8/rho,sy:0,u:1,v:0,iw:1},{sx:0,sy:8/rho,u:0,v:1,iw:1},8,8,m,count);

test('fractional selection covers mild minification continuously through every power-of-two boundary',()=>{
 for(const rho of [1.000001,1.019191,1.272581,1.5,1.999999,2,2.000001,3,3.999999,4,4.000001,7.999999,8,100]){
  const s=footprint(rho),lod=Math.min(3,Math.log2(rho));
  assert(s);assert.equal(s.lower,Math.floor(lod));assert.equal(s.upper,Math.min(3,s.lower+1));
  assert(Math.abs(s.mix-(s.upper===s.lower?0:lod-s.lower))<1e-10);
 }
 for(const rho of [.25,.999999,1])assert.equal(footprint(rho),null);
});

test('a missing mip chain or invalid footprint preserves the nearest path',()=>{
 const a={sx:0,sy:0,u:0,v:0,iw:1},b={...a,sx:4,u:1},c={...a,sy:4,v:1};
 for(const count of [0,-1,NaN,Infinity,.5])assert.equal(opaqueMipBlend(a,b,c,8,8,identity,count),null);
 for(const bad of [NaN,Infinity,-Infinity]){
  for(const key of ['sx','sy','u','v','iw'])assert.equal(opaqueMipBlend({...a,[key]:bad},b,c,8,8,identity,3),null);
  for(const i of [0,1,4,5,8,9]){const m=[...identity];m[i]=bad;assert.equal(opaqueMipBlend(a,b,c,8,8,m,3),null);}
 }
 for(const iw of [0,-1,.5])assert.equal(opaqueMipBlend({...a,iw},b,c,8,8,identity,3),null);
 for(const dim of [0,-1,NaN,Infinity])assert.equal(opaqueMipBlend(a,b,c,dim,8,identity,3),null);
 assert.equal(opaqueMipBlend(a,b,c,8,8,[],3),null);assert.equal(opaqueMipBlend(a,a,c,8,8,identity,3),null);
});

test('UV scale, rotation and reflection choose the same physical footprint',()=>{
 const rotate=[...identity];rotate[0]=0;rotate[1]=1;rotate[4]=-1;rotate[5]=0;
 const reflect=[...identity];reflect[0]=-1;reflect[5]=-1;
 assert.deepEqual(footprint(1.5,3,rotate),footprint(1.5));assert.deepEqual(footprint(1.5,3,reflect),footprint(1.5));
 const scale=[...identity];scale[0]=2;scale[5]=2;assert.deepEqual(footprint(.75,3,scale),footprint(1.5));
});

test('opaque fractional blending never changes cutout, opacity, blended or translucent pixels',()=>{
 for(const change of [{textureAlpha:true},{opacity:texture()},{blend:true},{cutoff:.4},{alpha:.5}]){
  const t=texture(),on=raster(.75,{...change,texture:t}),off=raster(.75,{...change,texture:{...t,mips:undefined}});
  assert.equal(on.minifiedTriangles,0);assert.equal(on.fractionalTriangles,0);assert.deepEqual(on.rgba,off.rgba);assert.deepEqual(on.depth,off.depth);
 }
});

test('vertex alpha also stays on the exact original nearest path',()=>{
 const t=texture(),v=[vertex(-1,1,0,.75),vertex(1,1,.75,.75),vertex(1,-1,.75,0)];v[1].a=.5;
 const draw=texture=>{const r=new CpuRaster(4,4);r.clear([0,0,0]);r.triangle(...v,{texture,opacity:null,textureAlpha:false,opacityFromRGB:false,alpha:1,cutoff:0,blend:false,emission:[0,0,0]});return r;};
 const on=draw(t),off=draw({...t,mips:undefined});assert.equal(on.minifiedTriangles,0);assert.deepEqual(on.rgba,off.rgba);assert.deepEqual(on.depth,off.depth);
});

test('perspective w variation retains nearest colors and original depth',()=>{
 const t=texture(),v=[vertex(-1,1,0,1),vertex(1,1,1,1),vertex(1,-1,1,0,2)];
 const draw=texture=>{const r=new CpuRaster(4,4);r.clear([0,0,0]);r.triangle(...v,{texture,opacity:null,textureAlpha:false,opacityFromRGB:false,alpha:1,cutoff:0,blend:false,emission:[0,0,0]});return r;};
 const on=draw(t),off=draw({...t,mips:undefined});assert.equal(on.minifiedTriangles,0);assert.deepEqual(on.rgba,off.rgba);assert.deepEqual(on.depth,off.depth);
});

test('clipped opaque triangles retain coverage and depth when fractional sampling is enabled',()=>{
 const t=texture(),v=[vertex(-2,1,0,1.125),vertex(1,1,1.125,1.125),vertex(1,-1,1.125,0)];
 const draw=texture=>{const r=new CpuRaster(4,4);r.clear([0,0,0]);r.triangle(...v,{texture,opacity:null,textureAlpha:false,opacityFromRGB:false,alpha:1,cutoff:0,blend:false,emission:[0,0,0]});return r;};
 const on=draw(t),off=draw({...t,mips:undefined});assert(on.fractionalTriangles>0);assert.deepEqual(on.depth,off.depth);assert.equal(on.fragments,off.fragments);assert.notDeepEqual(on.rgba,off.rgba);
});

test('exact mip levels need no second sample and frame clearing resets fractional counters',()=>{
 const exact=raster(1),mild=raster(.75);
 assert.equal(exact.minifiedTriangles,2);assert.equal(exact.fractionalTriangles,0);assert.equal(mild.fractionalTriangles,2);
 mild.clear([0,0,0]);assert.equal(mild.fractionalTriangles,0);assert.equal(mild.minifiedTriangles,0);
});

test('magnification and missing mip levels remain byte-identical to original nearest output',()=>{
 for(const span of [.125,.5]){const t=texture(),on=raster(span,{texture:t}),off=raster(span,{texture:{...t,mips:undefined}});assert.equal(on.minifiedTriangles,0);assert.deepEqual(on.rgba,off.rgba);assert.deepEqual(on.depth,off.depth);}
});
