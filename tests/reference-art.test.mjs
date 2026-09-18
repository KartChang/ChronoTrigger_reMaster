import test from 'node:test';
import assert from 'node:assert/strict';
import {surface,png,combatSheet} from '../scripts/asset-export.mjs';
import {drawReferenceHero,COMBAT_POSES,CLIP_MS} from '../.test/hero-art.mjs';
import {PosePlayer} from '../.test/pose-player.mjs';
import {drawSurface,drawMasonry,surfaceWorld,fairStone} from '../.test/world-art.mjs';
for(const hero of ['crono','marle','lucca']){
 test(`${hero} combat atlas contains 80 frame records with exact runtime pixel parity`,()=>{
  const draw=(c,d,f,p)=>drawReferenceHero(c,hero,d,f,p),a=combatSheet(draw,COMBAT_POSES,CLIP_MS);
  assert.equal(a.frames.length,80);assert.equal(Object.keys(a.clips).length,20);
  for(const frame of a.frames){
   const [pose,direction,phase]=frame.name.split('.'),dir=['down','right','up','left'].indexOf(direction);
   const native=surface(24,32);draw(native.ink,dir,Number(phase),pose);
   assert.deepEqual(frame.pivot,{x:12,y:31});assert.equal(frame.durationMs,CLIP_MS[pose][Number(phase)]);
   for(let y=0;y<32;y++){const off=((frame.rect.y+y)*a.sheet.width+frame.rect.x)*4;assert.deepEqual(a.sheet.rgba.subarray(off,off+96),native.rgba.subarray(y*96,(y+1)*96));}
  }
 });
 test(`${hero} action silhouettes differ from idle and collapse lower on defeat`,()=>{
  const draw=(pose,frame=2)=>{const s=surface(24,32);drawReferenceHero(s.ink,hero,0,frame,pose);return s;};
  const idle=draw('idle').rgba;
  for(const p of COMBAT_POSES)assert.notDeepEqual(draw(p).rgba,idle,p);
  const down=draw('down').rgba;let minY=32,maxY=-1;
  for(let y=0;y<32;y++)for(let x=0;x<24;x++)if(down[(y*24+x)*4+3]){minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  assert.ok(minY>=22);assert.ok(maxY<32);
 });
}
test('pose timings select actual frames and return to movement after completion',()=>{const p=new PosePlayer();p.trigger('attack',1);assert.deepEqual(p.sample(1,false),{pose:'attack',frame:0});assert.deepEqual(p.sample(1.11,false),{pose:'attack',frame:1});assert.deepEqual(p.sample(1.21,false),{pose:'attack',frame:2});assert.deepEqual(p.sample(1.31,false),{pose:'attack',frame:3});assert.equal(p.sample(1.5,true).pose,'walk');});
test('paused presentation time does not advance a clip',()=>{const p=new PosePlayer();p.trigger('cast',2);const snapshot=p.sample(2.15,false);for(let i=0;i<10;i++)assert.deepEqual(p.sample(2.15,false),snapshot);});
test('new impact interrupts an older action instead of queuing stale movement',()=>{const p=new PosePlayer();p.trigger('attack',0);p.trigger('hurt',.12);assert.deepEqual(p.sample(.13,false),{pose:'hurt',frame:0});});
test('scene reset clears pending animation without leaking previous-world pose',()=>{const p=new PosePlayer();p.trigger('down',3);p.reset();assert.deepEqual(p.sample(3,false),{pose:'idle',frame:2});});
test('all presentation clips have four positive finite durations',()=>{for(const key of COMBAT_POSES){assert.equal(CLIP_MS[key].length,4);assert.ok(CLIP_MS[key].every(n=>Number.isFinite(n)&&n>0));}});
test('non-finite animation clocks cannot become a permanently stuck pose',()=>{const p=new PosePlayer();assert.throws(()=>p.trigger('hurt',NaN));assert.throws(()=>p.sample(Infinity,false));assert.throws(()=>p.sample(-1,false));});
test('ground authoring puts north at top and preserves world extents',()=>{assert.deepEqual(surfaceWorld(256,256,512,512,'fair'),{x:0,z:1});assert.equal(surfaceWorld(0,0,512,512,'fair').z,11.4);assert.equal(surfaceWorld(512,512,512,512,'fair').z,-9.4);assert.deepEqual(surfaceWorld(192,176,384,352,'forest'),{x:0,z:1});});
test('bell garden remains vegetation while approach paving is stone',()=>{assert.equal(fairStone(-3.5,-.5),false);assert.equal(fairStone(0,-5),true);assert.equal(fairStone(12,0),false);});
test('surface exports are deterministic, distinct and opaque',()=>{for(const kind of ['fair','forest']){const a=surface(64,64),b=surface(64,64);drawSurface(a.ink,64,64,kind);drawSurface(b.ink,64,64,kind);assert.deepEqual(png(a),png(b));for(let i=3;i<a.rgba.length;i+=4)assert.equal(a.rgba[i],255);}const a=surface(64,64),b=surface(64,64);drawSurface(a.ink,64,64,'fair');drawSurface(b.ink,64,64,'forest');assert.notDeepEqual(a.rgba,b.rgba);});
test('texture authoring rejects invalid dimensions and creates repeatable stone courses',()=>{const a=surface(128,128),b=surface(128,128);assert.throws(()=>drawSurface(a.ink,0,128,'fair'));assert.throws(()=>drawSurface(a.ink,4096,128,'forest'));drawMasonry(a.ink);drawMasonry(b.ink);assert.deepEqual(a.rgba,b.rgba);assert.ok(new Set(a.rgba).size>10);});
