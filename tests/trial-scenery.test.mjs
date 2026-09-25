import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {drawTrialSceneryFloor,trialSceneryPixel,courtFixtureDetails,TRIAL_SCENERY} from '../.test/trial-scenery-art.mjs';
import {World,createState} from '../.test/cpu-entry.mjs';
import {World as PriorWorld} from '../.test/scenery-h-prior.mjs';
import {buildTrial} from '../.test/trial-render.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {festivalTestScene} from './festival-test-scene.mjs';
import {surface} from '../scripts/asset-export.mjs';
import {sceneryHBaseline,sceneryHIfDeclared} from './helpers/scenery-h-baseline.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const fixture=JSON.parse(readFileSync('tests/fixtures/ci78-scenery-states.json'));
const paint=(kind,w=384,h=352)=>{const s=surface(w,h);drawTrialSceneryFloor(s.ink,w,h,kind);return s;};
for(const kind of ['guardia1000','courtroom']){
 test(kind+' painter is deterministic, opaque, bounded and has a restrained authored palette',()=>{
  const a=paint(kind),b=paint(kind),colors=new Set();assert.deepEqual(a.rgba,b.rgba);
  for(let i=0;i<a.rgba.length;i+=4){assert.equal(a.rgba[i+3],255);colors.add(a.rgba.subarray(i,i+3).toString('hex'));}
  assert(colors.size>=6&&colors.size<=16);assert.deepEqual(TRIAL_SCENERY,{width:384,height:352,worldWidth:16,worldDepth:14});
 });
 test(kind+' export scaling uses integer boundaries and covers nonstandard dimensions',()=>{
  for(const [w,h] of [[16,16],[97,83],[768,704]]){const a=paint(kind,w,h);for(let i=3;i<a.rgba.length;i+=4)assert.equal(a.rgba[i],255);}
  const calls=[];drawTrialSceneryFloor({fillStyle:'',fillRect(...v){calls.push(v);}},97,83,kind);assert(calls.every(a=>a.every(Number.isInteger)));
 });
}
for(const [w,h,k] of [[0,352,'courtroom'],[384,Infinity,'courtroom'],[384,15,'courtroom'],[2049,352,'guardia1000'],[384.5,352,'courtroom'],[384,352,'bad']])test('invalid floor input is rejected before paint '+[w,h,k],()=>{
 let calls=0;assert.throws(()=>drawTrialSceneryFloor({fillRect(){calls++;}},w,h,k),RangeError);assert.equal(calls,0);
});
test('north-up mapping matches existing 16x14 floor and original gate/castle coordinates',()=>{
 assert.deepEqual(trialSceneryPixel(-8,7),{x:0,y:0});assert.deepEqual(trialSceneryPixel(8,-7),{x:384,y:352});
 assert.deepEqual(trialSceneryPixel(5.5,4),{x:324,y:75});assert.deepEqual(trialSceneryPixel(0,0),{x:192,y:176});assert.throws(()=>trialSceneryPixel(NaN,0));
});
test('forest center and branch to gate remain quiet earth; leaves stay outside the path',()=>{
 const s=paint('guardia1000'),earth=new Set(['61583d','685e41','6c6245']);
 for(const [x,z] of [[0,-6],[0,-3],[-.1,0],[0,3],[0,6],[2.5,2],[5.5,4]]){
  const p=trialSceneryPixel(x,z);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)assert(earth.has(s.rgba.subarray(((p.y+dy)*384+p.x+dx)*4,((p.y+dy)*384+p.x+dx)*4+3).toString('hex')),[x,z]);
 }
});
test('fixture facings are immutable, uniquely named, thin and restricted to existing furniture',()=>{
 const a=courtFixtureDetails(),b=courtFixtureDetails();assert.notEqual(a,b);assert.deepEqual(a,b);assert.equal(a.length,31);assert.equal(new Set(a.map(p=>p.name)).size,31);assert(Object.isFrozen(a));
 for(const p of a){assert(Object.isFrozen(p));assert(p.d<=.07&&p.h<.7&&p.w<=2.3);assert(Object.values(p).filter(v=>typeof v==='number').every(Number.isFinite));assert(p.name.startsWith('scenery-'));}
 assert.throws(()=>a[0].x=100);assert.throws(()=>a.pop());
});
test('actual trial roots cache floor/details, keep actors/gate in place, hide and release resources',()=>{
 const r=festivalTestScene();try{const trial=buildTrial(r.scene,r.shadow);
  for(const [key,s0] of Object.entries(fixture.states)){
   const s=structuredClone(s0),state=structuredClone(s);trial.draw(s,false);const meshCount=r.scene.meshes.length,texCount=r.scene.textures.length;
   const floor=r.scene.getMeshByName(s.chapter+'-ground');assert.deepEqual(floor.position.asArray(),[0,.02,0]);
   const bounds=floor.getBoundingInfo().boundingBox;assert.equal(bounds.maximum.x-bounds.minimum.x,16);assert.equal(bounds.maximum.z-bounds.minimum.z,14);
   const tex=floor.material.diffuseTexture;assert.deepEqual({...tex.getSize()},{width:384,height:352});
   const pixels=Buffer.from(tex.getContext().getImageData(0,0,384,352).data);assert.equal(Buffer.compare(pixels,paint(s.chapter).rgba),0,'runtime floor must use H painter');
   for(let i=0;i<8;i++)trial.draw(s,i%2===0);assert.equal(r.scene.meshes.length,meshCount);assert.equal(r.scene.textures.length,texCount);assert.deepEqual(s,state);
   if(key==='forest-gate')assert.deepEqual(trial.inspect().forestGate.position,[5.5,1.35,4]);
  }
  trial.draw(createState('hall1000'));assert(r.scene.meshes.filter(m=>m.name.includes('-scenery-')).every(m=>!m.isEnabled()));
  r.scene.dispose();assert.equal(r.scene.meshes.length,0);assert.equal(r.scene.textures.length,0);
 }finally{r.dispose();}
});
function cpuRig(w,h){
 const saved={window:globalThis.window,document:globalThis.document,matchMedia:globalThis.matchMedia},media={matches:false,addEventListener(){},removeEventListener(){}};
 const doc={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.matchMedia=()=>media;globalThis.document=doc;globalThis.window={devicePixelRatio:1,matchMedia:()=>media,addEventListener(){},removeEventListener(){},navigator:{}};
 const ca=cpuTestCanvas(w,h),cb=cpuTestCanvas(w,h);ca.canvas.ownerDocument=cb.canvas.ownerDocument=doc;let a,b;
 try{a=new World(ca.canvas);b=new PriorWorld(cb.canvas);}catch(e){a?.engine.dispose();Object.assign(globalThis,saved);throw e;}
 return {a,b,ca,cb,media,close(){a.engine.dispose();b.engine.dispose();Object.assign(globalThis,saved);}};
}
function geometry(scene){return scene.meshes.filter(m=>!m.name.includes('-scenery-')).map(m=>({name:m.name,parent:m.parent?.name,position:m.position.asArray(),rotation:m.rotation.asArray(),scaling:m.scaling.asArray(),enabled:m.isEnabled(),visible:m.isVisible,billboard:m.billboardMode,vertices:sha(Buffer.from(new Float32Array(m.getVerticesData('position')??[]).buffer)),indices:sha(Buffer.from(new Uint32Array(m.getIndices()??[]).buffer))}));}
for(const [w,h] of [[192,128],[96,160],[160,96]])test(`actual H offline CPU ${w}x${h}: new scenery, exact preference restoration and unchanged original geometry/state`,()=>{
 const r=cpuRig(w,h);try{
  for(const s0 of Object.values(fixture.states)){
   const s=structuredClone(s0),original=structuredClone(s);r.media.matches=false;r.a.draw(s,0,false);r.b.draw(structuredClone(s),0,false);
   const pixels=Buffer.from(r.ca.pixels());assert.notEqual(Buffer.compare(pixels,Buffer.from(r.cb.pixels())),0,s.chapter+' H must render, not bypassed');assert.deepEqual(geometry(r.a.scene),geometry(r.b.scene));
   const beforeResources=[r.a.scene.meshes.length,r.a.scene.textures.length];
   r.media.matches=true;r.a.draw(s,0,false);const reduced=Buffer.from(r.ca.pixels());r.a.draw(s,0,false);assert.deepEqual(Buffer.from(r.ca.pixels()),reduced);
   r.media.matches=false;r.a.draw(s,0,false);assert.deepEqual(Buffer.from(r.ca.pixels()),pixels,s.chapter+' exact frozen restoration');assert.deepEqual(s,original);assert.deepEqual([r.a.scene.meshes.length,r.a.scene.textures.length],beforeResources);
  }
 }finally{r.close();}
});
test('all eight other fair/trial maps retain exact CI78 offline pixels and original geometry',()=>{
 const r=cpuRig(192,128);try{for(const chapter of ['fair','hall1000','cellblock','execution','prisonstairs','warden','prisonbridge','futuregate']){
  const s=createState(chapter==='fair'?'bedroom':chapter);s.chapter=chapter;s.mode='explore';s.ticks=140;if(chapter==='fair')s.prologue.stage='fair';const before=structuredClone(s);
  r.a.draw(s,0,false);r.b.draw(structuredClone(s),0,false);assert.deepEqual(Buffer.from(r.ca.pixels()),Buffer.from(r.cb.pixels()),chapter);assert.deepEqual(geometry(r.a.scene),geometry(r.b.scene));assert.deepEqual(s,before);
 }}finally{r.close();}
});
const spec=JSON.parse(readFileSync('tests/baselines/vq03h-declared-scenery-edits.json'));
for(const [name,edits] of Object.entries(spec.files))test('H strict inverse preserves exact CI78 and rejects missing/duplicate hunks and retains unrelated bytes: '+name,()=>{
 const raw=readFileSync(name,'utf8'),original=sceneryHBaseline(name,raw);assert.equal(sha(original),spec.originalSha256[name]);assert.equal(sceneryHIfDeclared(name,original),original);
 for(const e of edits){assert.throws(()=>sceneryHBaseline(name,raw.replace(e.after,'')));assert.throws(()=>sceneryHBaseline(name,raw+e.after));}
 assert.notEqual(sha(sceneryHBaseline(name,raw+'\n// unrelated')),spec.originalSha256[name]);
 assert(sceneryHBaseline(name,raw+'\n// unrelated').endsWith('\n// unrelated'));
});
test('scenery contains no clocks, browser, gameplay writes, imported media or new collision logic',()=>{
 assert.doesNotMatch(readFileSync('src/trial-scenery-art.ts','utf8'),/Math\.random|Date\.|performance\.|setTimeout|setInterval|document|window|fetch\(|TRIAL_SOLIDS|\.ticks|\.players/);
 const raw=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');
});
