import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {NullEngine,Scene,MeshBuilder,DynamicTexture,StandardMaterial,Texture} from '@babylonjs/core';
import {NpcMotion} from '../.test/npc-motion.mjs';
import {WITNESS_KINDS,drawWitness} from '../.test/witness-art.mjs';
import {ambientFrame} from '../.test/actor-motion.mjs';
import {World,createState} from '../.test/cpu-entry.mjs';
import {World as EWorld} from '../.test/fair-trial-original.mjs';
import {buildTrial} from '../.test/trial-render.mjs';
import {buildFairConduct} from '../.test/fair-conduct-render.mjs';
import {festivalTestScene} from './festival-test-scene.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {fairTrialBaseline} from './helpers/fair-trial-baseline.mjs';
function rig(){const engine=new NullEngine();engine.createCanvas=(w,h)=>cpuTestCanvas(w,h).canvas;const scene=new Scene(engine),motion=new NpcMotion(scene);
 const add=(name='actor',kind='girl',w=48,h=64)=>{const tex=new DynamicTexture(name,{width:w,height:h},scene,false,Texture.NEAREST_SAMPLINGMODE);drawWitness(tex.getContext(),kind,0);tex.update();const mat=new StandardMaterial(name,scene);mat.diffuseTexture=mat.emissiveTexture=tex;mat.disableLighting=true;const mesh=MeshBuilder.CreatePlane(name,{width:1.2,height:1.7},scene);mesh.material=mat;return {mesh,tex,pixels:()=>Buffer.from(tex.getContext().getImageData(0,0,48,64).data)};};
 return {engine,scene,motion,add,close(){scene.dispose();engine.dispose();}};
}
for(const kind of WITNESS_KINDS)test('unit '+kind+': original 4-frame painter, reduced rest, exact current-tick restoration',()=>{const p=rig();try{
 const a=p.add('actor',kind);p.motion.add(a.mesh,kind);const zero=a.pixels(),count=p.scene.textures.length;
 for(const tick of [0,90,180,189,240,479]){p.motion.draw(tick);const before=a.pixels(),n=p.motion.inspect().actors[0],frame=ambientFrame(tick);
  assert.equal(n.frame,frame);p.motion.draw(tick,true);assert.deepEqual(a.pixels(),zero);
  const reduced=p.motion.inspect();for(let i=0;i<5;i++)p.motion.draw(tick,true);assert.deepEqual(p.motion.inspect(),reduced);
  assert.equal(reduced.actors[0].uploads,n.uploads+(frame===0?0:1));p.motion.draw(tick,false);assert.deepEqual(a.pixels(),before);
 }
 assert.equal(p.scene.textures.length,count);assert.deepEqual(a.mesh.position.asArray(),[0,0,0]);assert.deepEqual(a.mesh.scaling.asArray(),[1,1,1]);
}finally{p.close();}});
test('hidden/disabled/zero-visibility NPCs do no uploads; re-enabled actors use current tick',()=>{const p=rig();try{const a=p.add();p.motion.add(a.mesh,'girl');p.motion.draw(0);const before=a.pixels();
 for(const flag of ['disabled','invisible','zero']){a.mesh.setEnabled(flag!=='disabled');a.mesh.isVisible=flag!=='invisible';a.mesh.visibility=flag==='zero'?0:1;p.motion.draw(180,true);p.motion.draw(180,false);assert.deepEqual(a.pixels(),before);assert.equal(p.motion.inspect().actors.length,0);}
 a.mesh.setEnabled(true);a.mesh.isVisible=true;a.mesh.visibility=1;p.motion.draw(189);assert.equal(p.motion.inspect().actors[0].frame,3);assert.equal(p.motion.inspect().actors[0].uploads,2);
}finally{p.close();}});
test('parent disable also suppresses uploads; dispose releases bindings without shifting seeds',()=>{const p=rig();try{const a=p.add('a'),b=p.add('b','guard');p.motion.add(a.mesh,'girl');p.motion.add(b.mesh,'guard');b.mesh.parent=a.mesh;a.mesh.setEnabled(false);p.motion.draw(90);assert.equal(p.motion.inspect().actors.length,0);b.mesh.parent=null;a.mesh.dispose();
 assert.equal(p.motion.inspect().motion.bindingCount,1);p.motion.draw(140);assert.equal(p.motion.inspect().actors[0].seed,1);assert.equal(p.motion.inspect().actors[0].frame,ambientFrame(140,1));
 for(let i=0;i<12;i++){const t=p.add('temp'+i);p.motion.add(t.mesh,'girl');t.mesh.dispose();assert.equal(p.motion.inspect().motion.bindingCount,1);}
 p.scene.dispose();assert.equal(p.motion.inspect().motion.bindingCount,0);
}finally{p.engine.dispose();}});
test('invalid ownership, duplicate binding, shared or wrong-sized texture are rejected without changing bindings',()=>{const p=rig(),q=rig();try{const a=p.add();p.motion.add(a.mesh,'girl');assert.throws(()=>p.motion.add(a.mesh,'girl'),/Duplicate/);const cross=q.add();assert.throws(()=>p.motion.add(cross.mesh,'guard'),/ownership/);const bad=p.add('small','girl',24,32);assert.throws(()=>p.motion.add(bad.mesh,'girl'),/cell/);const shared=p.add('shared');shared.mesh.material=a.mesh.material;assert.throws(()=>p.motion.add(shared.mesh,'guard'),/private/);shared.mesh.dispose();assert.throws(()=>p.motion.add(shared.mesh,'guard'),/ownership/);assert.equal(p.motion.inspect().motion.bindingCount,1);
}finally{p.close();q.close();}});
for(const [tick,flag] of [[NaN,false],[Infinity,false],[-1,false],[.5,false],[Number.MAX_SAFE_INTEGER+1,false],[true,false],[1,'true'],[1,null]])test('invalid input leaves presentation unchanged '+String(tick)+'/'+String(flag),()=>{const p=rig();try{const a=p.add();p.motion.add(a.mesh,'girl');const before=p.motion.inspect(),pixels=a.pixels();assert.throws(()=>p.motion.draw(tick,flag),/Invalid/);assert.deepEqual(p.motion.inspect(),before);assert.deepEqual(a.pixels(),pixels);}finally{p.close();}});
test('readback is detached and does not expose mutable NPC state',()=>{const p=rig();try{const a=p.add();p.motion.add(a.mesh,'girl');p.motion.draw(140);const before=p.motion.inspect(),r=p.motion.inspect();r.actors[0].cell.width=1;r.actors[0].seed=100;r.motion.bindingCount=0;assert.deepEqual(p.motion.inspect(),before);}finally{p.close();}});
test('trial forest gate rests under reduce and restores exact authored phase; geometry and story unchanged',()=>{const p=festivalTestScene();try{const view=buildTrial(p.scene,p.shadow),s=createState('guardia1000');s.trial.stage='flight';s.trial.marleJoined=true;s.ticks=431;const before=structuredClone(s);
 view.draw(s,false);const normal=view.inspect(),count=p.scene.textures.length;assert.equal(normal.forestGate.rotation[2],431/180);assert.equal(normal.forestGate.visible,true);
 view.draw(s,true);let reduced=view.inspect();assert.equal(reduced.forestGate.rotation[2],0);assert(reduced.motion.actors.every(a=>a.frame===0));for(let i=0;i<3;i++)view.draw(s,true);assert.deepEqual(view.inspect(),reduced);assert.deepEqual(s,before);
 view.draw(s,false);assert.deepEqual(view.inspect().forestGate,normal.forestGate);assert.equal(p.scene.textures.length,count);
 const copy=view.inspect().forestGate;copy.position[0]=100;assert.equal(view.inspect().forestGate.position[0],5.5);
}finally{p.dispose();}});
test('necessary cat follow position/facing and prison gate open state are not frozen by reduce',()=>{const p=festivalTestScene();try{const parent=MeshBuilder.CreateBox('unit-parent',{},p.scene),fair=buildFairConduct(p.scene,parent),s=createState('bedroom');s.chapter='fair';s.prologue.stage='fair';s.prologue.conduct.cat.following=true;s.prologue.conduct.cat.x=2;s.prologue.conduct.cat.z=3;s.prologue.conduct.cat.facing=3;s.ticks=140;const before=structuredClone(s);fair.draw(s,true);const cat=p.scene.getMeshByName('fair-following-cat');assert.deepEqual(cat.position.asArray(),[2,.4,3]);assert.equal(cat.scaling.x,-1);assert.deepEqual(s,before);
 const trial=buildTrial(p.scene,p.shadow),cell=createState('cellblock');cell.trial.stage='cell';cell.ticks=140;trial.draw(cell,true);const gate=p.scene.getMeshByName('cellblock-locked-gate');assert(gate.isEnabled());cell.trial.cellOpen=true;const opened=structuredClone(cell);trial.draw(cell,true);assert(!gate.isEnabled());assert.deepEqual(cell,opened);
}finally{p.dispose();}});
test('World normal-mode CPU bytes equal exact E across fair and trial maps; reduce/restoration never changes game state',()=>{
 const old={window:globalThis.window,document:globalThis.document,matchMedia:globalThis.matchMedia};const media={matches:false,addEventListener(){},removeEventListener(){}};
 const doc={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.matchMedia=()=>media;globalThis.document=doc;globalThis.window={devicePixelRatio:1,matchMedia:()=>media,addEventListener(){},removeEventListener(){},navigator:{}};let a,b;
 try{const ca=cpuTestCanvas(192,128),cb=cpuTestCanvas(192,128);ca.canvas.ownerDocument=cb.canvas.ownerDocument=doc;a=new World(ca.canvas);b=new EWorld(cb.canvas);
  for(const chapter of ['fair','courtroom','guardia1000','hall1000','cellblock','execution','prisonstairs','warden','prisonbridge','futuregate']){
   const s=createState(chapter==='fair'?'bedroom':chapter);s.chapter=chapter;s.mode='explore';s.ticks=140;if(chapter==='fair')s.prologue.stage='fair';if(chapter==='guardia1000'){s.trial.stage='flight';s.trial.marleJoined=true;}const before=structuredClone(s);
   media.matches=false;a.draw(s,0,false);b.draw(structuredClone(s),0,false);assert.deepEqual(ca.pixels(),cb.pixels(),chapter+' normal exact E');assert.deepEqual(s,before);const count=a.scene.textures.length;
   media.matches=true;a.draw(s,0,false);const v=a.inspect();const groups=chapter==='fair'?[v.fairMotion,v.fairMotion.vendors]:[v.trialMaps.motion];for(const g of groups){assert(g.motion.reducedMotion);assert(g.actors.every(x=>x.frame===0));}
   a.draw(s,0,false);assert.deepEqual(s,before);media.matches=false;a.draw(s,0,false);assert.deepEqual(ca.pixels(),cb.pixels(),chapter+' restored exact E');assert.equal(a.scene.textures.length,count);
  }
 }finally{a?.engine.dispose();b?.engine.dispose();Object.assign(globalThis,old);}
});
const spec=JSON.parse(readFileSync('tests/baselines/vq03f-declared-fair-trial-edits.json'));
for(const [name,edits] of Object.entries(spec.files))test('F source inverse retains original E pin '+name,()=>{const raw=readFileSync(name,'utf8'),sha=b=>createHash('sha256').update(b).digest('hex');assert.equal(sha(fairTrialBaseline(name,raw)),spec.originalSha256[name]);assert.throws(()=>fairTrialBaseline(name,raw+edits[0].after));assert.throws(()=>fairTrialBaseline(name,raw.replace(edits[0].after,'')));assert.notEqual(sha(fairTrialBaseline(name,raw+'\n// unrelated')),spec.originalSha256[name]);});
test('held prologue and original painters remain unchanged; no timers/state writes in NPC motion',()=>{const raw=readFileSync('src/prologue-render.ts'),blob=createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex');assert.equal(blob,'2711a74185aacf3c6bddf9db85ba99a2afbc507a');assert.doesNotMatch(readFileSync('src/npc-motion.ts','utf8'),/setTimeout|setInterval|Date\.now|Math\.random|\.position\s*\.|\.scaling\s*\./);});
