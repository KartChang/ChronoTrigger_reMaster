import {impMIfDeclared} from './helpers/imp-m-baseline.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {canyonTerraceData,canyonTerrace,CANYON_RELIEF} from '../.test/canyon-relief.mjs';
import {CANYON_CANOPY,drawCanyonCanopyAtlas,canyonCanopyUV} from '../.test/canyon-canopy-art.mjs';
import {drawTrialOak} from '../.test/trial-detail-art.mjs';
import {buildCanyon as liveCanyon} from '../.test/canyon-render.mjs';
import {buildCanyon as oldCanyon} from '../.test/canyon-l-prior-canyon.mjs';
import {World as LiveWorld,createState} from '../.test/cpu-entry.mjs';
import {World as OldWorld} from '../.test/canyon-l-prior-world.mjs';
import {surface,png} from '../scripts/asset-export.mjs';
import {festivalTestScene} from './festival-test-scene.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {canyonLBaseline,canyonLIfDeclared,canyonLSpec} from './helpers/canyon-l-baseline.mjs';
const fixture=JSON.parse(readFileSync('tests/fixtures/ci82-canyon-state.json'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const textureBytes=t=>Buffer.from(t.getContext().getImageData(0,0,t.getSize().width,t.getSize().height).data);
const buildCanyon=process.env.CHRONO_L_PRECHANGE==='1'?oldCanyon:liveCanyon;
const World=process.env.CHRONO_L_PRECHANGE==='1'?OldWorld:LiveWorld;
const vec=(a,b)=>a.map((v,i)=>v-b[i]);const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
for(let variant=0;variant<4;variant++)test('L terrace '+variant+' is closed/outward/bounded with deterministic clipped corners',()=>{
 for(const cap of [false,true]){
  const w=4+(cap?.1:0),h=cap?.12:2.4,d=5+(cap?.1:0),g=canyonTerraceData(w,h,d,variant,cap);
  assert.deepEqual(g.positions,canyonTerraceData(w,h,d,variant,cap).positions);assert.equal(g.indices.length/3,28);assert.equal(g.positions.length/3,48);assert.equal(g.uvs.length,96);
  const p=Array.from({length:48},(_,i)=>g.positions.slice(i*3,i*3+3));
  for(const [axis,size] of [[0,w],[1,h],[2,d]]){assert.equal(Math.min(...p.map(v=>v[axis])),-size/2);assert.equal(Math.max(...p.map(v=>v[axis])),size/2);}
  const edges=new Map();
  for(let i=0;i<g.indices.length;i+=3){const ix=g.indices.slice(i,i+3),a=p[ix[0]],b=p[ix[1]],c=p[ix[2]],n=cross(vec(a,b),vec(c,b)),center=a.map((v,j)=>(v+b[j]+c[j])/3);
   assert(Math.hypot(...n)>1e-8);assert(dot(n,center)>0,'outward Babylon winding');assert(dot(n,g.normals.slice(ix[0]*3,ix[0]*3+3))>0);
   for(let k=0;k<3;k++){const key=[p[ix[k]].join(','),p[ix[(k+1)%3]].join(',')].sort().join('|');edges.set(key,(edges.get(key)??0)+1);}
  }
  assert([...edges.values()].every(n=>n===2),'closed manifold after welding coincident positions');assert(g.uvs.every(v=>v>=0&&v<=1));
  for(let i=0;i<g.normals.length;i+=3)assert(Math.abs(Math.hypot(...g.normals.slice(i,i+3))-1)<1e-6);
  assert(!p.some(v=>Math.abs(v[0])===w/2&&Math.abs(v[2])===d/2&&v[1]===h/2));
 }
});
test('L invalid geometry fails before allocating a scene mesh',()=>{const r=festivalTestScene();try{const n=r.scene.meshes.length;for(const args of [[NaN,2,4,0],[4,Infinity,4,0],[0,2,4,0],[4,-1,4,0],[4,2,4,-1],[4,2,4,4],[4,2,4,.1],[33,2,4,0],[.01,.12,.01,0,true]])assert.throws(()=>canyonTerrace(r.scene,'invalid',...args),RangeError);assert.equal(r.scene.meshes.length,n);}finally{r.dispose();}});
test('L variant geometry returns detached arrays and cap keeps cliff top inside its small overhang',()=>{
 for(let k=0;k<4;k++){const cliff=canyonTerraceData(4,2.4,5,k),cap=canyonTerraceData(4.1,.12,5.1,k,true);const before=cliff.positions[0];cliff.positions[0]=999;assert.equal(canyonTerraceData(4,2.4,5,k).positions[0],before);const high=canyonTerraceData(4,2.4,5,k).positions.slice(8*3,16*3),low=cap.positions.slice(0,8*3);const matches=new Set();for(let j=0;j<8;j++){const hit=Array.from({length:8},(_,i)=>i).filter(i=>Math.abs(high[j*3]-low[i*3])<.051&&Math.abs(high[j*3+2]-low[i*3+2])<.051);assert.equal(hit.length,1,'one matching corner regardless of opposite face winding');matches.add(hit[0]);assert(Math.abs(low[hit[0]*3])>=Math.abs(high[j*3]));assert(Math.abs(low[hit[0]*3+2])>=Math.abs(high[j*3+2]));}assert.equal(matches.size,8);}
});
test('L canopy atlas contains four exact existing authored variants with transparent gutters',()=>{
 const a=surface(272,80),b=surface(272,80);drawCanyonCanopyAtlas(a.ink);drawCanyonCanopyAtlas(b.ink);assert.equal(Buffer.compare(a.rgba,b.rgba),0);const hashes=new Set();
 for(let k=0;k<4;k++){const s=surface(64,80);drawTrialOak(s.ink,k);hashes.add(sha(s.rgba));for(let y=0;y<80;y++){assert.equal(Buffer.compare(a.rgba.subarray((y*272+k*68+2)*4,(y*272+k*68+66)*4),s.rgba.subarray(y*64*4,(y+1)*64*4)),0);for(const x of [k*68,k*68+1,k*68+66,k*68+67])assert.equal(a.rgba[(y*272+x)*4+3],0);}}
 assert.equal(hashes.size,4);assert.equal(CANYON_CANOPY.approved,false);assert.equal(CANYON_RELIEF.approved,false);
});
test('L canopy UVs select isolated tiles without mutating input or mirroring lighting',()=>{
 const src=[0,0,1,0,1,1,0,1];for(let k=0;k<4;k++){const uv=canyonCanopyUV(src,k);assert.deepEqual(src,[0,0,1,0,1,1,0,1]);assert.equal(uv[0],(k*68+2)/272);assert.equal(uv[2],(k*68+66)/272);assert.equal(uv[5],1);assert(uv[2]>uv[0]);}
 for(const k of [-1,4,NaN,1.5])assert.throws(()=>canyonCanopyUV(src,k),RangeError);for(const uv of [[],[0],[-1,0],[NaN,0],[2,1]])assert.throws(()=>canyonCanopyUV(uv,0),RangeError);
});
function sceneRig(){const r=festivalTestScene();r.engine.createCanvas=(w,h)=>cpuTestCanvas(w,h).canvas;return r;}
const sig=m=>{m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox;return {name:m.name,position:m.position.asArray(),rotation:m.rotation.asArray(),scale:m.scaling.asArray(),billboard:m.billboardMode,min:b.minimum.asArray(),max:b.maximum.asArray()};};
const data=m=>JSON.stringify([m.getVerticesData('position'),m.getIndices(),m.getVerticesData('uv')]);
test('L runtime terrace topology changes only the eight cliff/cap meshes; transforms/bounds/casters stay',()=>{
 const a=sceneRig(),b=sceneRig();try{buildCanyon(a.scene,a.shadow);oldCanyon(b.scene,b.shadow);assert.equal(a.scene.meshes.length,b.scene.meshes.length);assert.equal(a.scene.materials.length,b.scene.materials.length);assert.equal(a.scene.textures.length,b.scene.textures.length);let changed=0;
  for(let i=0;i<a.scene.meshes.length;i++){const m=a.scene.meshes[i],o=b.scene.meshes[i];assert.deepEqual(sig(m),sig(o));if(['terrace-cliff','terrace-turf'].includes(m.name)){assert.equal(m.getIndices().length/3,28);assert.notEqual(data(m),data(o));changed++;}else if(m.name!=='pixel-canopy')assert.equal(data(m),data(o));}
  assert.equal(changed,8);assert.deepEqual(a.shadow.getShadowMap().renderList.map(m=>m.name),b.shadow.getShadowMap().renderList.map(m=>m.name));
 }finally{a.dispose();b.dispose();}
});
test('L runtime reuses one atlas/material for eight trees and exact K floor/rock/turf',()=>{
 const a=sceneRig(),b=sceneRig();try{buildCanyon(a.scene,a.shadow);oldCanyon(b.scene,b.shadow);for(const name of ['canyon-floor','stratified-rock','canyon-turf'])assert.equal(sha(textureBytes(a.scene.textures.find(t=>t.name===name))),sha(textureBytes(b.scene.textures.find(t=>t.name===name))));const trees=a.scene.meshes.filter(m=>m.name==='pixel-canopy');assert.equal(trees.length,8);assert.equal(new Set(trees.map(m=>m.material)).size,1);assert.equal(new Set(trees.map(m=>JSON.stringify(m.getVerticesData('uv')))).size,4);const t=trees[0].material.diffuseTexture;assert.deepEqual({...t.getSize()},{width:272,height:80});assert.equal(t.samplingMode,1);assert.equal(t.hasAlpha,true);const atlas=surface(272,80);drawCanyonCanopyAtlas(atlas.ink);assert.equal(sha(textureBytes(t)),sha(atlas.rgba));}finally{a.dispose();b.dispose();}
});
function rig(w,h){const saved={window:globalThis.window,document:globalThis.document,matchMedia:globalThis.matchMedia},media={matches:false,addEventListener(){},removeEventListener(){}};const doc={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};globalThis.matchMedia=()=>media;globalThis.document=doc;globalThis.window={devicePixelRatio:1,matchMedia:()=>media,addEventListener(){},removeEventListener(){},navigator:{}};const ca=cpuTestCanvas(w,h),cb=cpuTestCanvas(w,h);ca.canvas.ownerDocument=cb.canvas.ownerDocument=doc;const a=new World(ca.canvas),b=new OldWorld(cb.canvas);return {a,b,ca,cb,media,close(){a.engine.dispose();b.engine.dispose();Object.assign(globalThis,saved);}};}
for(const [w,h] of [[192,128],[96,160],[160,96]])test(`L actual offline World ${w}x${h} changes pixels, preserves state/camera/enemies and exact reduced roundtrip`,()=>{
 const r=rig(w,h);try{const s=structuredClone(fixture.state);r.a.draw(s,0,false);r.b.draw(structuredClone(s),0,false);assert.notEqual(Buffer.compare(Buffer.from(r.ca.pixels()),Buffer.from(r.cb.pixels())),0);assert.deepEqual(s,fixture.state);assert.deepEqual(r.a.camera.position.asArray(),r.b.camera.position.asArray());assert.deepEqual(r.a.inspect().fieldEnemyArt,r.b.inspect().fieldEnemyArt);const before=Buffer.from(r.ca.pixels());r.media.matches=true;r.a.draw(s,0,false);r.media.matches=false;r.a.draw(s,0,false);assert.equal(Buffer.compare(before,Buffer.from(r.ca.pixels())),0);assert.deepEqual(s,fixture.state);assert.equal(r.a.inspect().renderer.cpu.unsupportedResources,0);}finally{r.close();}
});
test('L other eight maps keep original offline pixels with no current scene substituted',()=>{const r=rig(128,96);try{for(const chapter of ['lab','fair','truce','forest','castle','courtroom','guardia1000','prisoncell']){const s=createState(chapter);r.a.draw(s,0,false);r.b.draw(structuredClone(s),0,false);assert.equal(Buffer.compare(Buffer.from(r.ca.pixels()),Buffer.from(r.cb.pixels())),0,chapter);}}finally{r.close();}});
test('L repeated draws, hidden scene and disposal do not grow resources or update static atlas/geometry',()=>{
 const r=rig(128,96);try{const s=structuredClone(fixture.state);r.a.draw(s,0,false);r.a.draw(createState('fair'),0,false);r.a.draw(s,0,false);const counts=[r.a.scene.meshes.length,r.a.scene.materials.length,r.a.scene.textures.length],t=r.a.scene.textures.find(t=>t.name==='canyon-tree');let uploads=0;t.update=()=>uploads++;const cliff=r.a.scene.meshes.find(m=>m.name==='terrace-cliff'),vertices=cliff.getVerticesData('position');for(let i=0;i<20;i++){r.a.draw(s,0,false);r.a.draw(createState('fair'),0,false);}assert.equal(uploads,0);assert.equal(cliff.getVerticesData('position'),vertices);assert.deepEqual([r.a.scene.meshes.length,r.a.scene.materials.length,r.a.scene.textures.length],counts);r.a.scene.dispose();assert.equal(r.a.scene.meshes.length,0);assert.equal(r.a.scene.textures.length,0);}finally{r.close();}
});
for(const name of Object.keys(canyonLSpec.files))test('L strict original whole-file hash and missing/duplicate/unrelated guards: '+name,()=>{
 const raw=impMIfDeclared(name,readFileSync(name,'utf8')),prior=canyonLBaseline(name,raw);assert.equal(sha(prior),canyonLSpec.originalSha256[name]);assert.equal(canyonLIfDeclared(name,prior),prior);for(const e of canyonLSpec.files[name]){assert.throws(()=>canyonLBaseline(name,raw.replace(e.after,'')));assert.throws(()=>canyonLBaseline(name,raw+e.after));}assert.notEqual(sha(canyonLBaseline(name,raw+'\n// unrelated')),canyonLSpec.originalSha256[name]);
});
test('L original fixture, renderer, held home and unknown inverse are bound explicitly',()=>{
 assert.equal(sha(readFileSync('tests/baselines/ci82-canyon-render.ts')),canyonLSpec.originalSha256['src/canyon-render.ts']);assert.equal(fixture.sourceSha,'64732e5907e653f5e2fb7ed20f70856ed7f5da00');assert.equal(fixture.runId,'36157428126');const p=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(Buffer.from('blob '+p.length+'\0')).update(p).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');assert.throws(()=>canyonLBaseline('src/core.ts',''));
});
if(process.env.CHRONO_L_OFFLINE_DIR){const dir=process.env.CHRONO_L_OFFLINE_DIR;mkdirSync(dir,{recursive:true});const r=rig(678,452);try{r.a.draw(structuredClone(fixture.state),0,false);r.b.draw(structuredClone(fixture.state),0,false);for(const [name,canvas] of [['canyon-after',r.ca],['canyon-before',r.cb]])writeFileSync(dir+'/'+name+'.png',png({width:canvas.canvas.width,height:canvas.canvas.height,rgba:Buffer.from(canvas.pixels())}));writeFileSync(dir+'/scope.json',JSON.stringify({scope:'Offline Node CPU fixture from CI82 state; not browser/gameplay replay; text/curves omitted',source:fixture.sourceSha,run:fixture.runId,requested:[678,452],actual:[r.ca.canvas.width,r.ca.canvas.height],renderer:r.a.inspect().renderer,artApproved:false},null,2));}finally{r.close();}}
