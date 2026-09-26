/** Explicit synthetic/unit fixtures and current CPU renderer, never native evidence. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as live from '../.test/core.mjs';
import * as prior from '../.test/action-n-prior-core.mjs';
import {IMP_ACTION,impActionFrame,drawImpActionFrame} from '../.test/imp-action.mjs';
import {impFrame,drawImpFrame} from '../.test/imp-motion.mjs';
import {World} from '../.test/cpu-entry.mjs';
import {surface} from '../scripts/asset-export.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {actionNSpec,actionNBaseline,actionNIfDeclared} from './helpers/action-n-baseline.mjs';
import {bodyOIfDeclared} from './helpers/body-o-baseline.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const blob=b=>createHash('sha1').update(`blob ${Buffer.byteLength(b)}\0`).update(b).digest('hex');
const withoutMetadata=s=>{s=structuredClone(s);for(const e of s.effects)delete e.enemyAction;return s;};
const battle=chapter=>{const s=live.createState(chapter);if(chapter==='canyon')s.opening.phase='canyon';assert(live.beginBattle(s));return s;};
const advance=(s,n)=>{for(let i=0;i<n;i++)live.step(s,live.IDLE,1/60);};
const draw=(w,s)=>{const effects=s.effects.splice(0);const copy=structuredClone(s),ecopy=structuredClone(effects);w.draw(s,0,false,effects);assert.deepEqual(s,copy);assert.deepEqual(effects,ecopy);return w.inspect().fieldEnemyMotion;};
function rig(){const d=globalThis.document,w=globalThis.window,mm=globalThis.matchMedia;const media={matches:false};
 const doc={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.document=doc;globalThis.window={devicePixelRatio:1,addEventListener(){},removeEventListener(){},navigator:{}};globalThis.matchMedia=()=>media;
 const c=cpuTestCanvas(96,64);c.canvas.ownerDocument=doc;const world=new World(c.canvas);
 return {world,media,c,close(){world.engine.dispose();globalThis.document=d;globalThis.window=w;globalThis.matchMedia=mm;}};
}
const frame=f=>{const s=surface(24,32);drawImpActionFrame(s.ink,f);return s.rgba;};
const masks=[[0,0,1,0],[0,1,0,0],[1,1,0,0],[0,0,0,1],[0,1,0,1],[0,0,1,1]];
const checkSamples=a=>{assert.equal(a.samples.length,4);for(const [i,p] of a.samples.entries()){assert.deepEqual([p.x,p.y],[[3,19],[3,20],[3,25],[21,22]][i]);assert.deepEqual(p.rgba,masks[a.frame][i]?[70,131,145,255]:[0,0,0,0]);}};
for(const name of Object.keys(actionNSpec.files))test('N exact inverse and negative source guards: '+name,()=>{
 const raw=bodyOIfDeclared(name,readFileSync(name,'utf8')),old=actionNBaseline(name,raw);assert.equal(sha(old),actionNSpec.originalSha256[name]);assert.equal(actionNIfDeclared(name,old),old);
 for(const e of actionNSpec.files[name]){assert.throws(()=>actionNBaseline(name,raw+e.after));assert.throws(()=>actionNBaseline(name,raw.replace(e.after,'')));}
 assert.notEqual(sha(actionNBaseline(name,raw+'\n// unrelated drift\n')),actionNSpec.originalSha256[name]);
});
test('N retains held prologue and M runtime foundation byte-for-byte',()=>{
 assert.equal(blob(readFileSync('src/prologue-render.ts')),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');
 const orig=JSON.parse(readFileSync('tests/baselines/vq03n-unchanged-inputs.json','utf8'));
 for(const [p,h] of Object.entries(orig))assert.equal(sha(bodyOIfDeclared(p,readFileSync(p,'utf8'))),h,p);
});
for(const chapter of ['canyon','forest','lab','fair'])test('N pure-rule parity against exact M core for '+chapter,()=>{
 const a=battle(chapter),b=structuredClone(a);
 for(let tick=0;tick<1000;tick++){
  live.step(a,live.IDLE,1/60);prior.step(b,prior.IDLE,1/60);
  assert.deepEqual(withoutMetadata(a),b,'all rules/effects except explicit metadata at tick '+tick);
  if(tick===180||tick===700){const x=live.action(a,0,'attack'),y=prior.action(b,0,'attack');assert.equal(x,y);assert.deepEqual(withoutMetadata(a),b);}
 }
 for(const e of a.effects.filter(e=>e.enemyAction)){assert(['canyon','forest'].includes(chapter));assert.equal(e.kind,'hit');assert.equal(e.actor,undefined);assert.equal(e.guest,undefined);const source=a.enemies[e.enemyAction.index];assert.deepEqual(e.enemyAction.origin,{x:source.x,z:source.z});assert.deepEqual(e.enemyAction.target,{x:e.x,z:e.z});}
 if(['lab','fair'].includes(chapter))assert.equal(a.effects.some(e=>e.enemyAction),false);
});
test('N lethal timing, defeat, ATB and save output stay identical to M',()=>{
 const a=battle('canyon'),b=structuredClone(a);
 for(let tick=0;tick<1800;tick++){live.step(a,live.IDLE,1/60);prior.step(b,prior.IDLE,1/60);assert.deepEqual(withoutMetadata(a),b);}
 assert.equal(a.mode,'defeat');live.leaveBattle(a);prior.leaveBattle(b);assert.deepEqual(live.serialize(a),prior.serialize(b));
 for(const kind of ['attack','skill']){const x=battle('canyon'),y=structuredClone(x);for(const s of [x,y]){s.enemies=s.enemies.slice(0,1);s.enemies[0].hp=30;s.players[0].atb=1;}assert.equal(live.action(x,0,kind),prior.action(y,0,kind));assert.deepEqual(withoutMetadata(x),y);assert.equal(x.mode,'victory');}
});
test('N six unique arm poses preserve every M byte for frames 0..3 and C colors/face/feet',()=>{
 const base=frame(0),colors=new Set();for(let n=0;n<base.length;n+=4)colors.add(base.subarray(n,n+4).join(','));
 assert.equal(new Set([0,1,2,3,4,5].map(f=>sha(frame(f)))).size,6);
 for(let f=0;f<6;f++){const b=frame(f);if(f<4){const s=surface(24,32);drawImpFrame(s.ink,f);assert.deepEqual(b,s.rgba);}
  for(let n=0;n<b.length;n+=4)assert(colors.has(b.subarray(n,n+4).join(',')));
  for(let y=0;y<32;y++)for(let x=0;x<24;x++)if(!((x>=2&&x<=6&&y>=19&&y<=25)||(x>=18&&x<=21&&y>=19&&y<=25))){const n=(y*24+x)*4;assert.deepEqual(b.subarray(n,n+4),base.subarray(n,n+4));}
  checkSamples({frame:f,samples:[[3,19],[3,20],[3,25],[21,22]].map(([x,y])=>({x,y,rgba:[...b.subarray((y*24+x)*4,(y*24+x)*4+4)]}))});
 }
});
for(const age of [0,7,8,15,16,23,24,100])test('N source-tick attack phase boundary '+age,()=>{
 const t=100+age,expected=age<8?4:age<16?5:age<24?2:impFrame(t,0,true,false);
 assert.equal(impActionFrame(t,0,true,false,null,100),expected);assert.equal(impActionFrame(t,0,true,true,null,100),0);
 assert.equal(impActionFrame(t,0,true,false,t,100),3);assert.equal(impActionFrame(t,0,false,false,null,100),impFrame(t,0,false,false));
});
test('N invalid/future actions and invalid frames cannot invent a phase or modify pixels',()=>{
 for(const a of [null,-1,NaN,Infinity,101,.5])assert.equal(impActionFrame(100,1,true,false,null,a),impFrame(100,1,true,false));
 for(const t of [-1,.5,NaN,Infinity])assert.throws(()=>impActionFrame(t,0,true,false,null,0),RangeError);
 const s=surface(24,32);drawImpActionFrame(s.ink,0);const before=sha(s.rgba);for(const f of [-1,6,NaN,.5]){assert.throws(()=>drawImpActionFrame(s.ink,f),RangeError);assert.equal(sha(s.rgba),before);}
});
test('N real core events drive actual CPU attack texture and bounded immutable history',()=>{
 const k=rig();try{const s=battle('canyon');draw(k.world,s);const resources=[k.world.scene.meshes.length,k.world.scene.materials.length,k.world.scene.textures.length],geo=k.world.foes.map(f=>[f.mesh.position.asArray(),f.mesh.scaling.asArray()]);
  while(!s.effects.some(e=>e.enemyAction))advance(s,1);
  const emitted=structuredClone(s.effects);let m=draw(k.world,s);assert.equal(m.actionProfile,IMP_ACTION.id);assert(m.actors.every(a=>a.frame===4));assert.equal(m.history.length,3);for(const h of m.history){checkSamples(h);assert.equal(h.cause.kind,'attack');assert.deepEqual(h.cause.effect,emitted.find(e=>e.enemyAction.index===h.index));assert.equal(h.attackTick,s.ticks);assert.equal(h.enemyHp,48);}
  const frozen=structuredClone(m);for(let i=0;i<3;i++)k.world.draw(s,90,false);assert.deepEqual(structuredClone(k.world.inspect().fieldEnemyMotion),frozen,'fixed tick does not replay or age action');
  advance(s,8);m=draw(k.world,s);assert(m.actors.every(a=>a.frame===5));m.actors.forEach(checkSamples);
  advance(s,8);m=draw(k.world,s);assert(m.actors.every(a=>a.frame===2));advance(s,8);m=draw(k.world,s);for(const a of m.actors)assert.equal(a.frame,impFrame(s.ticks,a.index,true,false));
  assert.deepEqual(k.world.foes.map(f=>[f.mesh.position.asArray(),f.mesh.scaling.asArray()]),geo,'no simulation/mesh position or scale mutation');
  assert.deepEqual([k.world.scene.meshes.length,k.world.scene.materials.length,k.world.scene.textures.length],resources.map((n,i)=>n+(i===0||i===1||i===2?3:0)),'only original hit-number effects are added');
  const before=k.world.inspect().fieldEnemyMotion;m.history[0].samples[0].rgba[0]=999;m.history[0].cause.effect.enemyAction.origin.x=999;assert.deepEqual(k.world.inspect().fieldEnemyMotion,before);
 }finally{k.close();}
});
test('N actual nonlethal player action produces living frame3; lethal hides at the original time',()=>{
 const k=rig();try{const s=battle('canyon');draw(k.world,s);advance(s,143);assert(live.action(s,0,'attack'));assert.equal(s.enemies.find(e=>e.hp===18)?.hp,18);let m=draw(k.world,s);const h=m.history.find(h=>h.frame===3);assert(h);assert.equal(h.enemyHp,18);assert.equal(h.cause.effect.actor,0);assert.equal(h.cause.effect.text,'30');checkSamples(h);
  advance(s,18);m=draw(k.world,s);assert(m.actors.every(a=>a.frame!==3));
  advance(s,125);assert(live.action(s,0,'skill'));m=draw(k.world,s);assert.equal(s.enemies[h.index].hp,0);assert(!m.actors.some(a=>a.index===h.index));assert.equal(m.history.filter(v=>v.cause.kind==='hurt').length,1,'lethal does not synthesize another living recoil');
 }finally{k.close();}
});
test('N rejects target-only, stale, inconsistent and contradictory attack metadata',()=>{
 const k=rig();try{const s=battle('canyon');advance(s,1);draw(k.world,s);const good={kind:'hit',text:'−12',x:0,z:5,enemyAction:{index:0,tick:s.ticks,origin:{x:-1.8,z:2.4},target:{x:0,z:5}}};
  const cases=[{kind:'hit',x:-1.8,z:2.4,text:'12'},...[
   e=>e.enemyAction.index=3,e=>e.enemyAction.index=.5,e=>e.enemyAction.tick=2,e=>e.enemyAction.tick=-1,e=>e.enemyAction.origin.x=99,e=>e.enemyAction.target.z=99,e=>e.enemyAction.origin.z=NaN,e=>e.actor=0,e=>e.guest=true,e=>e.kind='heal'
  ].map(f=>{const e=structuredClone(good);f(e);return e;})];
  for(const e of cases){k.world.draw(s,0,false,[e]);assert.equal(k.world.inspect().fieldEnemyMotion.history.length,0);}
  s.ticks=100;k.world.draw(s,0,false,[good]);assert.equal(k.world.inspect().fieldEnemyMotion.history.length,0,'expired event is not restarted at reception');
 }finally{k.close();}
});
test('N reduced motion retains native provenance without claiming visible strike; rebase/dispose clear it',()=>{
 const k=rig();try{const s=battle('canyon');draw(k.world,s);while(!s.effects.some(e=>e.enemyAction))advance(s,1);k.media.matches=true;let m=draw(k.world,s);assert(m.actors.every(a=>a.frame===0));assert(m.history.every(h=>h.reducedMotion&&h.frame===0));
  k.media.matches=false;m=draw(k.world,s);assert(m.actors.every(a=>a.frame===4));k.world.draw(structuredClone(s),0,false);m=k.world.inspect().fieldEnemyMotion;assert.equal(m.history.length,0);assert(m.actors.every(a=>a.attackTick===null));
  const ctrl=k.world.fieldEnemyMotion;ctrl.dispose();assert.equal(ctrl.inspect().history.length,0);assert.equal(ctrl.inspect().disposed,true);
 }finally{k.close();}
});
test('N history is bounded, detached and never uploads invisible sprites',()=>{
 const k=rig();try{const s=battle('canyon');draw(k.world,s);const ctrl=k.world.fieldEnemyMotion,f=k.world.foes[0];let uploads=0;const u=f.texture.update.bind(f.texture);f.texture.update=(...a)=>{uploads++;return u(...a);};
  for(let i=0;i<40;i++){s.ticks=30*i;ctrl.begin(s,false);ctrl.receive(s,{kind:'combo',x:s.enemies[0].x,z:s.enemies[0].z,text:'unit-only'});ctrl.update(f,0);}let m=ctrl.inspect();assert.equal(m.history.length,24);assert.equal(m.historyDropped,16);
  f.mesh.isVisible=false;const old=uploads;s.ticks+=30;ctrl.begin(s,false);ctrl.update(f,0);assert.equal(uploads,old);assert.equal(ctrl.inspect().actors.some(a=>a.index===0),false);
  f.mesh.isVisible=true;s.ticks=1;ctrl.begin(s,false);ctrl.update(f,0);m=ctrl.inspect();assert.equal(m.history.length,0);assert.equal(m.historyDropped,0);
 }finally{k.close();}
});
