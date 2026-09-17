import test from 'node:test';
import assert from 'node:assert/strict';
import {inflateSync} from 'node:zlib';
import {surface,png,actorSheet} from '../scripts/asset-export.mjs';
import {drawAdventureHero,drawLucca} from '../.test/pixel-art.mjs';
test('pixel export retains transparent padding and exact RGBA colors',()=>{const s=surface(4,4);s.ink.fillStyle='#123456';s.ink.fillRect(1,1,1,1);assert.deepEqual([...s.rgba.slice(20,24)],[18,52,86,255]);assert.deepEqual([...s.rgba.slice(0,4)],[0,0,0,0]);s.ink.clearRect(1,1,1,1);assert.equal(s.rgba[23],0);});
test('exporter rejects unsupported colors instead of inventing output',()=>{const s=surface(2,2);s.ink.fillStyle='red';assert.throws(()=>s.ink.fillRect(0,0,1,1));assert.throws(()=>surface(0,5));assert.throws(()=>s.ink.clearRect(.5,0,1,1));});
test('PNG dimensions and decoded scanlines agree with source pixels',()=>{const s=surface(3,2);s.ink.fillStyle='#ff7f00';s.ink.fillRect(1,0,2,2);const bytes=png(s);assert.equal(bytes.readUInt32BE(16),3);assert.equal(bytes.readUInt32BE(20),2);const data=[];for(let p=8;p<bytes.length;){const n=bytes.readUInt32BE(p),type=bytes.toString('ascii',p+4,p+8);if(type==='IDAT')data.push(bytes.subarray(p+8,p+8+n));p+=12+n;}const raw=inflateSync(Buffer.concat(data));assert.equal(raw.length,26);assert.deepEqual(raw.subarray(1,13),s.rgba.subarray(0,12));assert.deepEqual(raw.subarray(14,26),s.rgba.subarray(12));});
for(const [name,draw] of [['crono',(c,d,f)=>drawAdventureHero(c,0,d,f)],['marle',(c,d,f)=>drawAdventureHero(c,1,d,f)],['lucca',drawLucca]]){
 test(`${name}: four directions, grounded pivots and three distinct walking poses`,()=>{const a=actorSheet(draw);assert.equal(a.frames.length,16);assert.equal(Object.keys(a.clips).length,8);for(let d=0;d<4;d++){const poses=[];for(let f=0;f<4;f++){const s=surface(24,32);draw(s.ink,d,f);poses.push(s.rgba.toString('hex'));const frame=a.frames[d*4+f];assert.deepEqual(frame.pivot,{x:12,y:31});for(let y=0;y<32;y++){const offset=((frame.rect.y+y)*112+frame.rect.x)*4;assert.deepEqual(a.sheet.rgba.subarray(offset,offset+96),s.rgba.subarray(y*96,(y+1)*96));}}assert.equal(poses[0],poses[2]);assert.notEqual(poses[1],poses[3]);assert.equal(new Set(poses).size,3);}});
}
test('atlas encoder is byte-for-byte deterministic',()=>{const draw=(c,d,f)=>drawAdventureHero(c,0,d,f);assert.deepEqual(png(actorSheet(draw).sheet),png(actorSheet(draw).sheet));});
