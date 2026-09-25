import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Vector3} from '@babylonjs/core';
import {buildTrial} from '../.test/trial-render.mjs';
import {buildTrial as priorTrial} from '../.test/staging-i-prior-trial.mjs';
import {World,createState} from '../.test/cpu-entry.mjs';
import {World as PriorWorld} from '../.test/staging-i-prior.mjs';
import {bindCourtStaging} from '../.test/court-staging.mjs';
import {drawWoodlandOak} from '../.test/woodland-art.mjs';
import {drawTrialSceneryFloor} from '../.test/trial-scenery-art.mjs';
import {festivalTestScene} from './festival-test-scene.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {surface} from '../scripts/asset-export.mjs';
import {stagingIBaseline,stagingIIfDeclared} from './helpers/staging-i-baseline.mjs';
const fixture=JSON.parse(readFileSync('tests/fixtures/ci79-staging-states.json'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const selected=n=>/^courtroom(juror-[0-6]|defender|prosecutor|judge|testimony-(girl|elder|merchant|shopper))$/.test(n);
const hashPixels=t=>sha(Buffer.from(t.getContext().getImageData(0,0,t.getSize().width,t.getSize().height).data));
test('court staging rejects non-court roots',()=>{const r=festivalTestScene();try{const trial=buildTrial(r.scene,r.shadow);trial.draw(structuredClone(fixture.states['forest-gate']));assert.throws(()=>bindCourtStaging(r.scene.getTransformNodeByName('trial-guardia1000')));}finally{r.dispose();}});
test('current court support pivots restore full adult bodies without adding resources or changing state',()=>{
 const r=festivalTestScene(),p=festivalTestScene();try{const trial=buildTrial(r.scene,r.shadow),old=priorTrial(p.scene,p.shadow),s=structuredClone(fixture.states.courtroom),before=structuredClone(s);
 old.draw(structuredClone(s));trial.draw(s);const counts=[r.scene.meshes.length,r.scene.textures.length];assert.deepEqual(counts,[p.scene.meshes.length,p.scene.textures.length]);const info=trial.inspect().courtStaging;assert.equal(info.bindingCount,14);assert.equal(info.actors.length,10);
 for(const a of info.actors){assert(a.footError<1e-5,a.name+':'+a.footError);assert.equal(a.foot.y,(a.name.includes('juror')?.55:.72)+.04);const prior=p.scene.getMeshByName(a.name);assert.equal(a.foot.x,prior.position.x);assert.equal(a.foot.z,prior.position.z);assert(Math.abs(a.height-1.7)<1e-6);}
 for(let i=0;i<30;i++)trial.draw(s,i%2===0);assert.deepEqual([r.scene.meshes.length,r.scene.textures.length],counts);assert.deepEqual(s,before);info.actors[0].foot.x=200;assert.notEqual(trial.inspect().courtStaging.actors[0].foot.x,200);
 }finally{r.dispose();p.dispose();}
});
for(const eye of [[0,23,-26],[7,18,-21],[-6,15,-18]])test('court texture-foot follows actual camera up '+eye,()=>{const r=festivalTestScene();try{const trial=buildTrial(r.scene,r.shadow),s=structuredClone(fixture.states.courtroom);r.camera.position.set(...eye);r.camera.setTarget(Vector3.Zero());r.scene.updateTransformMatrix(true);trial.draw(s);for(const a of trial.inspect().courtStaging.actors)assert(a.footError<1e-5,a.name+':'+a.footError);}finally{r.dispose();}});
test('all fourteen static court bindings include middle-dais testimony supports',()=>{
 const r=festivalTestScene();try{const trial=priorTrial(r.scene,r.shadow),s=structuredClone(fixture.states.courtroom);trial.draw(s);const root=r.scene.getTransformNodeByName('trial-courtroom');
 // Geometry-unit visibility only, not an injected native journey or game-state change.
 for(const m of root.getChildMeshes())if(m.name.includes('testimony-'))m.setEnabled(true);const binding=bindCourtStaging(root);binding.draw();const all=binding.inspect().actors;assert.equal(all.length,14);
 for(const a of all){assert(a.footError<1e-5);if(a.name.includes('testimony-'))assert.equal(a.foot.y,.53);}assert.deepEqual(s,fixture.states.courtroom);
 }finally{r.dispose();}
});
test('hidden and disposed court bindings stop writes and release references',()=>{
 const r=festivalTestScene();try{const trial=priorTrial(r.scene,r.shadow);trial.draw(structuredClone(fixture.states.courtroom));const root=r.scene.getTransformNodeByName('trial-courtroom'),binding=bindCourtStaging(root);binding.draw();const m=r.scene.getMeshByName('courtroomdefender');
 trial.draw(createState('hall1000'));const pos=m.position.asArray();binding.draw();assert.deepEqual(m.position.asArray(),pos);assert.equal(binding.inspect().actors.length,0);m.dispose();assert.equal(binding.inspect().bindingCount,13);r.scene.dispose();binding.draw();assert.equal(binding.inspect().bindingCount,0);assert.equal(r.scene.textures.length,0);
 }finally{r.dispose();}
});
test('current forest canopy uses exact existing clustered oak pixels in nearest-alpha original cells',()=>{const r=festivalTestScene();try{const trial=buildTrial(r.scene,r.shadow);trial.draw(structuredClone(fixture.states['forest-gate']));const expected=surface(64,80);drawWoodlandOak(expected.ink);const trees=r.scene.meshes.filter(m=>/^guardia1000(tree|canopy)$/.test(m.name));assert.equal(trees.length,15);for(const m of trees){const t=m.material.diffuseTexture;assert.equal(t.samplingMode,1);assert.equal(t.hasAlpha,true);assert.equal(hashPixels(t),sha(expected.rgba));}assert.deepEqual(trial.inspect().forestGate.position,[5.5,1.35,4]);}finally{r.dispose();}});
function rig(w,h){
 const saved={window:globalThis.window,document:globalThis.document,matchMedia:globalThis.matchMedia},media={matches:false,addEventListener(){},removeEventListener(){}};const doc={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.matchMedia=()=>media;globalThis.document=doc;globalThis.window={devicePixelRatio:1,matchMedia:()=>media,addEventListener(){},removeEventListener(){},navigator:{}};
 const ca=cpuTestCanvas(w,h),cb=cpuTestCanvas(w,h);ca.canvas.ownerDocument=cb.canvas.ownerDocument=doc;let a,b;try{a=new World(ca.canvas);b=new PriorWorld(cb.canvas);}catch(e){a?.engine.dispose();Object.assign(globalThis,saved);throw e;}
 return {a,b,ca,cb,media,close(){a.engine.dispose();b.engine.dispose();Object.assign(globalThis,saved);}};
}
function geometry(scene){return scene.meshes.map(m=>({name:m.name,parent:m.parent?.name,position:selected(m.name)?'declared-pivot':m.position.asArray(),scaling:selected(m.name)?'declared-court-scale':m.scaling.asArray(),rotation:m.rotation.asArray(),enabled:m.isEnabled(),visible:m.isVisible,billboard:m.billboardMode,vertices:sha(Buffer.from(new Float32Array(m.getVerticesData('position')??[]).buffer)),indices:sha(Buffer.from(new Uint32Array(m.getIndices()??[]).buffer))}));}
for(const [w,h] of [[192,128],[96,160],[160,96]])test(`current I offline ${w}x${h}: actual new pixels, original topology and exact preference restoration`,()=>{
 const r=rig(w,h);try{for(const s0 of Object.values(fixture.states)){const s=structuredClone(s0),before=structuredClone(s);r.media.matches=false;r.a.draw(s,0,false);r.b.draw(structuredClone(s),0,false);const pixels=Buffer.from(r.ca.pixels());assert.notEqual(Buffer.compare(pixels,Buffer.from(r.cb.pixels())),0,s.chapter);assert.deepEqual(geometry(r.a.scene),geometry(r.b.scene));
 const floor=r.a.scene.getMeshByName(s.chapter+'-ground').material.diffuseTexture,expected=surface(384,352);drawTrialSceneryFloor(expected.ink,384,352,s.chapter);assert.equal(hashPixels(floor),sha(expected.rgba),'H ground preserved');const counts=[r.a.scene.meshes.length,r.a.scene.textures.length];
 r.media.matches=true;r.a.draw(s,0,false);const reduced=Buffer.from(r.ca.pixels());r.a.draw(s,0,false);assert.equal(Buffer.compare(reduced,Buffer.from(r.ca.pixels())),0);r.media.matches=false;r.a.draw(s,0,false);assert.equal(Buffer.compare(pixels,Buffer.from(r.ca.pixels())),0,s.chapter+' exact frozen restoration');assert.deepEqual(s,before);assert.deepEqual([r.a.scene.meshes.length,r.a.scene.textures.length],counts);
 if(s.chapter==='courtroom')for(const a of r.a.inspect().trialMaps.courtStaging.actors)assert(a.footError<1e-5,a.name);
 }}finally{r.close();}
});
test('other eight fair/trial maps retain exact CI79 offline pixels and mesh geometry',()=>{const r=rig(192,128);try{for(const chapter of ['fair','hall1000','cellblock','execution','prisonstairs','warden','prisonbridge','futuregate']){const s=createState(chapter==='fair'?'bedroom':chapter);s.chapter=chapter;s.mode='explore';s.ticks=140;if(chapter==='fair')s.prologue.stage='fair';const original=structuredClone(s);r.a.draw(s,0,false);r.b.draw(structuredClone(s),0,false);assert.equal(Buffer.compare(Buffer.from(r.ca.pixels()),Buffer.from(r.cb.pixels())),0,chapter);assert.deepEqual(geometry(r.a.scene),geometry(r.b.scene));assert.deepEqual(s,original);}}finally{r.close();}});
const spec=JSON.parse(readFileSync('tests/baselines/vq03i-declared-staging-edits.json'));
for(const [name,edits] of Object.entries(spec.files))test('I exact CI79 inverse and missing/duplicate guards: '+name,()=>{const raw=readFileSync(name,'utf8'),original=stagingIBaseline(name,raw);assert.equal(sha(original),spec.originalSha256[name]);assert.equal(stagingIIfDeclared(name,original),original);for(const e of edits){assert.throws(()=>stagingIBaseline(name,raw.replace(e.after,'')));assert.throws(()=>stagingIBaseline(name,raw+e.after));}assert.notEqual(sha(stagingIBaseline(name,raw+'\n// unrelated')),spec.originalSha256[name]);});
test('I has no clock, gameplay, collision or network writes; held prologue preserved',()=>{assert.doesNotMatch(readFileSync('src/court-staging.ts','utf8'),/Math\.random|Date\.|performance\.|setTimeout|setInterval|document|window|fetch\(|TRIAL_SOLIDS|\.ticks|\.players/);const held=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(`blob ${held.length}\0`).update(held).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');assert.equal(fixture.run,'36109184360');});
