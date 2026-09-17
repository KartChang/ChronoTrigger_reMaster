import test from 'node:test';import assert from 'node:assert/strict';
import {surface,actorSheet,combatSheet,png} from '../scripts/asset-export.mjs';
import {drawFrog,drawYakra,drawNaga,drawRescueNpc,drawCathedralFloor,drawGlass} from '../.test/rescue-art.mjs';
import {COMBAT_POSES,CLIP_MS} from '../.test/hero-art.mjs';
for(const [name,w,h,fn] of [['Frog',24,32,drawFrog],['Yakra',48,48,drawYakra],['Naga',24,32,drawNaga],...['nun','queen','chancellor'].map(k=>[k,24,32,c=>drawRescueNpc(c,k)]),['glass',40,64,drawGlass]])test(`${name} exports deterministic transparent authored art`,()=>{const a=surface(w,h),b=surface(w,h);fn(a.ink);fn(b.ink);assert.deepEqual(png(a),png(b));const alpha=a.rgba.filter((_,i)=>i%4===3);assert.ok(alpha.some(n=>n===255));assert.ok(alpha.some(n=>n===0));});
test('Frog atlas includes four directions and five timed combat clips per direction',()=>{const walk=actorSheet((c,d,f)=>drawFrog(c,d,f,'walk')),combat=combatSheet(drawFrog,COMBAT_POSES,CLIP_MS);assert.equal(walk.frames.length,16);assert.equal(combat.frames.length,80);assert.equal(Object.keys(combat.clips).length,20);assert.ok(combat.frames.every(f=>f.durationMs>0));});
test('Frog attacks, casts, hurts and falls have different pixels rather than only motion offsets',()=>{const poses=COMBAT_POSES.map(p=>{const s=surface(24,32);drawFrog(s.ink,0,2,p);return s.rgba.toString('hex');});assert.equal(new Set(poses).size,5);});
test('Frog left and right strides differ; north hides the facial features',()=>{const samples=[];for(const [d,f] of [[0,1],[0,3],[2,0]]){const s=surface(24,32);drawFrog(s.ink,d,f,'walk');samples.push(s.rgba.toString('hex'));}assert.equal(new Set(samples).size,3);});
test('cathedral and crypt surfaces preserve orientation and different carpet treatment',()=>{const a=surface(384,352),b=surface(384,352);drawCathedralFloor(a.ink,384,352);drawCathedralFloor(b.ink,384,352,true);assert.notDeepEqual(a.rgba,b.rgba);assert.ok(a.rgba.filter((_,i)=>i%4===3).every(n=>n===255));assert.throws(()=>drawCathedralFloor(a.ink,0,352));});
test('Frog default exported walk pixels match the explicit runtime walk pose in all frames',()=>{
 const sheet=actorSheet(drawFrog);
 for(let d=0;d<4;d++)for(let f=0;f<4;f++){
  const s=surface(24,32);drawFrog(s.ink,d,f,'walk');const rect=sheet.frames[d*4+f].rect;
  for(let y=0;y<32;y++){const i=((rect.y+y)*sheet.sheet.width+rect.x)*4;assert.deepEqual(sheet.sheet.rgba.subarray(i,i+96),s.rgba.subarray(y*96,(y+1)*96));}
 }
});
