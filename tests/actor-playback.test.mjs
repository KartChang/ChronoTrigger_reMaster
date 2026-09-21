import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ActorTimeline,victoryFrame} from '../.test/actor-timeline.mjs';
import {HeroFrameCache} from '../.test/hero-frame-cache.mjs';
import {drawHDHero,HD_HERO_IDS} from '../.test/hd-hero-art.mjs';
import {surface} from '../scripts/asset-export.mjs';
import {actorBaseline} from './helpers/actor-baseline.mjs';
const at=(x=0,z=0,scale=1,seed=0,reducedMotion=false)=>Object.freeze({x,z,scale,seed,reducedMotion});
const hash=b=>createHash('sha256').update(b).digest('hex');
test('C wiring reverses exactly to CI44, while native assets and gameplay source remain unchanged',()=>{
 assert.equal(hash(actorBaseline(readFileSync('src/render.ts','utf8'))),'e1e49124a8c47af7580e4a386c9bc43182035dec34b79a875eb90a06fdef7811');
 for(const [p,h] of Object.entries({'src/hd-hero-art.ts':'5669a62f90149d6162036190ebae9616cb76db39b8bb36ca4d60c246a65ec39a','src/main.ts':'89c2980be9219b0cd80408b10524250e9a97afa3321a39acb782f8cfc484d120','src/core.ts':'d8a7cf8f2f0bf9f66715a22e4a4896f6b74415b19e48c660e392bd56278ecd6d'}))assert.equal(hash(readFileSync(p)),h,p);
 assert.throws(()=>actorBaseline(readFileSync('src/render.ts','utf8').replace('private heroFrames=new HeroFrameCache(96,drawHDHero);','private heroFrames=null;')));
});
for(const hero of HD_HERO_IDS)test(`${hero}: all 128 retained native frames replay byte-exactly, including warm cache`,()=>{
 const c=new HeroFrameCache();
 for(const pose of ['idle','ready','walk','attack','cast','hurt','down','victory'])for(let dir=0;dir<4;dir++)for(let frame=0;frame<4;frame++){
  const original=surface(48,64),actual=surface(48,64);drawHDHero(original.ink,hero,dir,frame,pose);
  c.draw(actual.ink,hero,dir,frame,pose);assert.deepEqual(actual.rgba,original.rgba);
  actual.ink.fillStyle='#ff00ff';actual.ink.fillRect(0,0,48,64);c.draw(actual.ink,hero,dir,frame,pose);assert.deepEqual(actual.rgba,original.rgba);
 }
 const s=c.inspect();assert.equal(s.hits,128);assert.equal(s.misses,128);assert.equal(s.entries,96);assert.equal(s.evictions,32);assert.equal(s.additionalGpuTextures,0);assert(s.cachedSpans<s.nativePaintCalls);assert(s.spanBytes<=96*48*64*6);
});
test('cache is true LRU, bounded and clearable without retaining a canvas',()=>{
 const c=new HeroFrameCache(2),s=surface(48,64);for(const n of [0,1,0,2,0,1])c.draw(s.ink,'crono',0,n,'walk');const a=c.inspect();assert.equal(a.entries,2);assert.equal(a.hits,2);assert.equal(a.evictions,2);c.clear();assert.equal(c.inspect().entries,0);assert.equal(c.inspect().spanBytes,0);c.draw(s.ink,'crono',0,0,'idle');assert.equal(c.inspect().entries,1);
 for(const n of [0,-1,1.5,513,NaN])assert.throws(()=>new HeroFrameCache(n));
 for(const bad of [['nohero',0,0,'idle'],['crono',5,0,'idle'],['crono',0,8,'idle'],['crono',0,0,'bad']])assert.throws(()=>c.draw(s.ink,...bad));
});
test('gait advances from actual travel, not time spent walking into a wall',()=>{
 const p=new ActorTimeline();p.sample(0,true,false,at());assert.equal(p.sample(60,true,false,at()).frame,0);
 assert.equal(p.sample(61,true,false,at(.5)).frame,1);assert.equal(p.sample(62,true,false,at(1)).frame,2);assert.equal(p.sample(63,true,false,at(1.5)).frame,3);assert.equal(p.sample(64,true,false,at(1.85)).frame,0);
 const before=p.inspect();for(let i=0;i<30;i++)p.sample(64,true,false,at(1.85));assert.deepEqual(p.inspect(),before);
});
test('render cadence does not change gait at the same simulated position and tick',()=>{
 const a=new ActorTimeline(),b=new ActorTimeline();a.sample(0,true,false,at());b.sample(0,true,false,at());
 for(let tick=1;tick<=120;tick++){a.sample(tick,true,false,at(tick*.04));if(tick%12===0)b.sample(tick,true,false,at(tick*.04));}
 assert.equal(a.inspect().current.frame,b.inspect().current.frame);assert(Math.abs(a.inspect().current.distance-b.inspect().current.distance)<1e-8);
});
test('turns count travelled path; stop, relocation, scaling, rollback and state reset do not replay stale strides',()=>{
 const p=new ActorTimeline();p.sample(1,true,false,at());p.sample(2,true,false,at(.5));assert.equal(p.sample(3,true,false,at(0)).frame,2);
 p.sample(4,false,false,at());assert.equal(p.sample(5,true,false,at()).frame,0);p.sample(6,true,false,at(100));assert.equal(p.inspect().current.distance,0);
 p.sample(7,true,false,at(100,0,.4));assert.equal(p.inspect().current.distance,0);p.trigger('attack',7);p.sample(1,false,false,at());assert.equal(p.inspect().current.pose,'idle');p.reset();assert.equal(p.inspect().current,null);
});
test('scaled world actors traverse a proportional gait cycle rather than sliding at field cadence',()=>{
 const a=new ActorTimeline(),b=new ActorTimeline();a.sample(0,true,false,at());b.sample(0,true,false,at(0,0,.4));
 for(let i=1;i<10;i++)assert.equal(a.sample(i,true,false,at(i*.21)).frame,b.sample(i,true,false,at(i*.21*.4,0,.4)).frame);
});
test('fixed tick action clips preserve durations, interruption, pause and cleanup',()=>{
 const p=new ActorTimeline();p.trigger('attack',60);assert.deepEqual(p.sample(60,false,true,at()),{pose:'attack',frame:0});assert.equal(p.sample(67,false,true,at()).frame,1);assert.equal(p.sample(73,false,true,at()).frame,2);assert.equal(p.sample(80,false,true,at()).frame,3);
 const hold=p.inspect();for(let i=0;i<50;i++)p.sample(80,false,true,at());assert.deepEqual(p.inspect(),hold);
 p.trigger('hurt',81);assert.deepEqual(p.sample(81,false,true,at()),{pose:'hurt',frame:0});assert.equal(p.sample(120,false,true,at()).pose,'ready');
});
test('ambient actors are dephased and reduced motion suppresses decorative movement, not essential attack or walking',()=>{
 const p=new ActorTimeline(),q=new ActorTimeline();assert.notEqual(p.sample(75,false,false,at()).frame,q.sample(75,false,false,at(0,0,1,1)).frame);
 for(const battle of [false,true])for(const tick of [90,180,239])assert.equal(p.sample(tick,false,battle,at(0,0,1,0,true)).frame,0);
 p.trigger('cast',240);assert.equal(p.sample(249,false,true,at(0,0,1,0,true)).frame,1);
 for(const tick of [0,15,30,60]){assert.equal(victoryFrame(tick,true),0);assert.equal(victoryFrame(tick,false),Math.floor(tick/15)%4);}
});
test('observations are copied and history is bounded; invalid presentation data fails explicitly',()=>{
 const p=new ActorTimeline();for(let t=0;t<300;t++)p.sample(t,true,false,at(t*.5));assert(p.inspect().history.length<=24);const r=p.inspect();r.current.frame=99;r.history.length=0;assert.notEqual(p.inspect().current.frame,99);assert(p.inspect().history.length);
 for(const tick of [-1,NaN,Infinity,.5]){assert.throws(()=>p.sample(tick,false,false,at()));assert.throws(()=>p.trigger('cast',tick));}
 for(const step of [at(NaN),at(0,Infinity),at(0,0,0),at(0,0,-1)])assert.throws(()=>p.sample(301,false,false,step));
});
