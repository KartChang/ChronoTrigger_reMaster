import {canyonLIfDeclared} from './helpers/canyon-l-baseline.mjs';
// Historical K vs CI81 comparison uses explicit pre-L ports. Current L has separate tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildCanyon} from '../.test/canyon-l-prior-canyon.mjs';
import {buildCanyon as oldCanyon} from '../.test/canyon-prior.mjs';
import {World,createState} from '../.test/canyon-l-prior-world.mjs';
import {World as OldWorld} from '../.test/canyon-prior-world.mjs';
import {drawCanyonFloor,drawCanyonRock,drawCanyonTurf,canyonPathBounds,CANYON_ART} from '../.test/canyon-art.mjs';
import {drawWoodlandOak} from '../.test/woodland-art.mjs';
import {surface,png} from '../scripts/asset-export.mjs';
import {festivalTestScene} from './festival-test-scene.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {canyonKBaseline,canyonKIfDeclared,canyonKSpec} from './helpers/canyon-k-baseline.mjs';
const fixture=JSON.parse(readFileSync('tests/fixtures/ci81-canyon-state.json'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const pixels=t=>Buffer.from(t.getContext().getImageData(0,0,t.getSize().width,t.getSize().height).data);
const definitions=[['floor',512,448,drawCanyonFloor],['rock',64,64,drawCanyonRock],['turf',64,64,drawCanyonTurf]];
const geometry=scene=>scene.meshes.map(m=>({name:m.name,parent:m.parent?.name,position:m.position.asArray(),scaling:m.scaling.asArray(),rotation:m.rotation.asArray(),enabled:m.isEnabled(),visible:m.isVisible,billboard:m.billboardMode,vertices:sha(Buffer.from(new Float32Array(m.getVerticesData('position')??[]).buffer)),uv:sha(Buffer.from(new Float32Array(m.getVerticesData('uv')??[]).buffer)),indices:sha(Buffer.from(new Uint32Array(m.getIndices()??[]).buffer))}));
function sceneRig(){const r=festivalTestScene();r.engine.createCanvas=(w,h)=>cpuTestCanvas(w,h).canvas;return r;}
function variation(p,w,h){let delta=0,n=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const at=(y*w+x)*4;for(const to of [x+1<w?at+4:-1,y+1<h?at+w*4:-1])if(to>=0){for(let c=0;c<3;c++)delta+=Math.abs(p[at+c]-p[to+c]);n+=3;}}return delta/n;}
for(const [name,w,h,draw] of definitions)test('K '+name+' painter is deterministic integer opaque bounded output',()=>{
 const a=surface(w,h),b=surface(w,h);draw(a.ink);draw(b.ink);assert.equal(Buffer.compare(a.rgba,b.rgba),0);for(let i=3;i<a.rgba.length;i+=4)assert.equal(a.rgba[i],255);assert(new Set(Array.from({length:w*h},(_,i)=>a.rgba.subarray(i*4,i*4+3).toString('hex'))).size>=3);assert.equal(CANYON_ART.approved,false);assert.equal(CANYON_ART.romPixels,false);
});
test('K painted route keeps the prior sinusoidal extent without writing game data',()=>{
 for(let y=0;y<448;y++){const p=canyonPathBounds(y),c=255+Math.sin(y*.019)*38,w=62+Math.sin(y*.05)*13;assert.equal(p.left,c-w);assert.equal(p.right,c+w);assert(p.left>100&&p.right<400);}
 const s=surface(512,448);drawCanyonFloor(s.ink);for(let y=0;y<448;y+=2){const p=canyonPathBounds(y),x=Math.floor((p.left+p.right)/4)*2;assert(['817253','867756','8d7d5b'].includes(s.rgba.subarray((y*512+x)*4,(y*512+x)*4+3).toString('hex')));}
});
test('K original CI81 canyon module is exact; held home and gameplay code remain outside the edit',()=>{
 assert.equal(sha(readFileSync('tests/baselines/ci81-canyon-render.ts')),canyonKSpec.priorCanyonSha256);
 const raw=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(Buffer.from('blob '+raw.length+'\0')).update(raw).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');
 assert.equal(fixture.sourceSha,'235fcf143a853cdeb8599b3f8703b090542eda5a');assert.equal(String(fixture.runId),'36125796673');assert.equal(fixture.state.chapter,'canyon');
});
test('K static scene retains every original mesh transform, UV, collider-free geometry and caster',()=>{
 const a=sceneRig(),b=sceneRig();try{const current=buildCanyon(a.scene,a.shadow),old=oldCanyon(b.scene,b.shadow);assert.deepEqual(geometry(a.scene),geometry(b.scene));assert.equal(a.scene.materials.length,b.scene.materials.length);assert.equal(a.scene.textures.length,b.scene.textures.length+1);assert.deepEqual(a.shadow.getShadowMap().renderList.map(m=>m.name),b.shadow.getShadowMap().renderList.map(m=>m.name));current.root.setEnabled(true);old.root.setEnabled(true);assert.deepEqual(geometry(a.scene),geometry(b.scene));}finally{a.dispose();b.dispose();}
});
test('K runtime floor/rock/turf pixels exactly match same export painters and preserve dimensions',()=>{
 const r=sceneRig();try{buildCanyon(r.scene,r.shadow);for(const [name,w,h,draw] of definitions){const t=r.scene.textures.find(t=>t.name===({floor:'canyon-floor',rock:'stratified-rock',turf:'canyon-turf'}[name]));assert(t);assert.deepEqual({...t.getSize()},{width:w,height:h});assert.equal(t.samplingMode,1);assert.equal(t.hasAlpha,false);const a=surface(w,h);draw(a.ink);assert.equal(sha(pixels(t)),sha(a.rgba));}}finally{r.dispose();}
});
test('K path/rock adjacent color variation is lower than original striped/brick texture (offline metric only)',()=>{
 const a=sceneRig(),b=sceneRig();try{buildCanyon(a.scene,a.shadow);oldCanyon(b.scene,b.shadow);for(const name of ['canyon-floor','stratified-rock']){const t=a.scene.textures.find(t=>t.name===name),o=b.scene.textures.find(t=>t.name===name),{width,height}=t.getSize();assert(variation(pixels(t),width,height)<variation(pixels(o),width,height),name);}}finally{a.dispose();b.dispose();}
});
test('K turf caps share exactly one static texture; eight original trees share unchanged authored oak',()=>{
 const r=sceneRig();try{buildCanyon(r.scene,r.shadow);const caps=r.scene.meshes.filter(m=>m.name==='terrace-turf');assert(caps.length>0);assert.equal(new Set(caps.map(m=>m.material)).size,1);assert.equal(caps[0].material.diffuseTexture.name,'canyon-turf');assert.deepEqual(caps[0].material.diffuseColor.asArray(),[1,1,1]);const trees=r.scene.meshes.filter(m=>m.name==='pixel-canopy');assert.equal(trees.length,8);assert.equal(new Set(trees.map(m=>m.material.diffuseTexture)).size,1);const t=trees[0].material.diffuseTexture;assert.deepEqual({...t.getSize()},{width:64,height:80});assert.equal(t.samplingMode,1);assert.equal(t.hasAlpha,true);const oak=surface(64,80);drawWoodlandOak(oak.ink);assert.equal(sha(pixels(t)),sha(oak.rgba));}finally{r.dispose();}
});
function rig(w,h){const saved={window:globalThis.window,document:globalThis.document,matchMedia:globalThis.matchMedia},media={matches:false,addEventListener(){},removeEventListener(){}};const doc={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};globalThis.matchMedia=()=>media;globalThis.document=doc;globalThis.window={devicePixelRatio:1,matchMedia:()=>media,addEventListener(){},removeEventListener(){},navigator:{}};const ca=cpuTestCanvas(w,h),cb=cpuTestCanvas(w,h);ca.canvas.ownerDocument=cb.canvas.ownerDocument=doc;let a,b;try{a=new World(ca.canvas);b=new OldWorld(cb.canvas);}catch(e){a?.engine.dispose();Object.assign(globalThis,saved);throw e;}return {a,b,ca,cb,media,close(){a.engine.dispose();b.engine.dispose();Object.assign(globalThis,saved);}};}
for(const [w,h] of [[192,128],[96,160],[160,96]])test(`K current offline World ${w}x${h}: actual changed pixels, original state/actors/camera and exact preference roundtrip`,()=>{
 const r=rig(w,h);try{const s=structuredClone(fixture.state),o=structuredClone(s);r.a.draw(s,0,false);r.b.draw(o,0,false);assert.notEqual(Buffer.compare(Buffer.from(r.ca.pixels()),Buffer.from(r.cb.pixels())),0);assert.deepEqual(s,fixture.state);assert.deepEqual(o,fixture.state);assert.deepEqual(geometry(r.a.scene),geometry(r.b.scene));assert.deepEqual(r.a.camera.position.asArray(),r.b.camera.position.asArray());assert.deepEqual(r.a.inspect().fieldEnemyArt,r.b.inspect().fieldEnemyArt);const before=Buffer.from(r.ca.pixels());r.media.matches=true;r.a.draw(s,0,false);r.media.matches=false;r.a.draw(s,0,false);assert.equal(Buffer.compare(before,Buffer.from(r.ca.pixels())),0);assert.deepEqual(s,fixture.state);}finally{r.close();}
});
test('K other eight existing maps keep the same offline pixels, not an alternate reduced-quality scene',()=>{
 const r=rig(128,96);try{for(const chapter of ['lab','fair','truce','forest','castle','courtroom','guardia1000','prisoncell']){const s=createState(chapter);r.a.draw(s,0,false);r.b.draw(structuredClone(s),0,false);assert.equal(Buffer.compare(Buffer.from(r.ca.pixels()),Buffer.from(r.cb.pixels())),0,chapter);}}finally{r.close();}
});
test('K repeated draws/hidden scene never repaint textures or grow scene resources; disposal releases them',()=>{
 const r=rig(128,96);try{const s=structuredClone(fixture.state);r.a.draw(s,0,false);const selected=r.a.scene.textures.filter(t=>['canyon-floor','stratified-rock','canyon-turf','canyon-tree'].includes(t.name));assert.equal(selected.length,4);const counts=[r.a.scene.meshes.length,r.a.scene.materials.length,r.a.scene.textures.length];let uploads=0;for(const t of selected)t.update=()=>{uploads++;};for(let i=0;i<20;i++){r.a.draw(s,0,false);r.a.draw(createState('fair'),0,false);}assert.equal(uploads,0);assert.deepEqual([r.a.scene.meshes.length,r.a.scene.materials.length,r.a.scene.textures.length],counts);assert.equal(r.a.scene.getTransformNodeByName('truce-canyon-600').isEnabled(),false);r.a.scene.dispose();assert.equal(r.a.scene.textures.length,0);assert.equal(r.a.scene.meshes.length,0);}finally{r.close();}
});
for(const [name,edits] of Object.entries(canyonKSpec.files))test('K strict CI81 script inverse and negative guards: '+name,()=>{
 const raw=canyonLIfDeclared(name,readFileSync(name,'utf8')),prior=canyonKBaseline(name,raw);assert.equal(sha(prior),canyonKSpec.originalSha256[name]);assert.equal(canyonKIfDeclared(name,prior),prior);for(const e of edits){assert.throws(()=>canyonKBaseline(name,raw.replace(e.after,'')));assert.throws(()=>canyonKBaseline(name,raw+e.after));}assert.notEqual(sha(canyonKBaseline(name,raw+'\n// unrelated')),canyonKSpec.originalSha256[name]);
});
test('K undeclared script is rejected; export registration is explicit and marks no asset approved',()=>{
 assert.throws(()=>canyonKBaseline('src/core.ts',''));const source=readFileSync('scripts/asset-export.mjs','utf8');for(const id of ['canyon-floor','canyon-rock','canyon-turf','canyon-oak'])assert(source.includes("'"+id+"'"));assert(source.includes("stage:'reference-review-not-approved'"));
});
// Optional separate explicitly offline inspection output. Never used by browser assertions.
if(process.env.CHRONO_K_OFFLINE_DIR){const out=process.env.CHRONO_K_OFFLINE_DIR;mkdirSync(out,{recursive:true});const r=rig(678,452);try{r.a.draw(structuredClone(fixture.state),0,false);r.b.draw(structuredClone(fixture.state),0,false);for(const [name,canvas] of [['canyon-after',r.ca],['canyon-before',r.cb]])writeFileSync(out+'/'+name+'.png',png({width:canvas.canvas.width,height:canvas.canvas.height,rgba:Buffer.from(canvas.pixels())}));writeFileSync(out+'/scope.json',JSON.stringify({scope:'Explicit Node CPU port of original CI81 state; no browser, no text/curves, not native gameplay.',source:fixture.sourceSha,run:fixture.runId,requestedCanvas:[678,452],buffer:[r.ca.canvas.width,r.ca.canvas.height],newArtApproved:false},null,2));}finally{r.close();}}
