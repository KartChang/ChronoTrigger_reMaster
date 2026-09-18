import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {surface,png} from '../scripts/asset-export.mjs';
import {WITNESS_KINDS,WITNESS_SIZE,drawWitness,drawFairProp} from '../.test/witness-art.mjs';
import {cameraHalf} from '../.test/art-profile.mjs';
for(const kind of WITNESS_KINDS)test(`native ${kind}: reproducible transparent image, bounded pixels and sub-2x detail`,()=>{
 const a=surface(48,64),b=surface(48,64);drawWitness(a.ink,kind);drawWitness(b.ink,kind);assert.deepEqual(png(a),png(b));
 const colors=new Set();for(let i=0;i<a.rgba.length;i+=4)if(a.rgba[i+3])colors.add(a.rgba.subarray(i,i+3).toString('hex'));assert(colors.size>=10);
 assert(a.rgba.filter((_,i)=>i%4===3).some(x=>x===0));assert.equal(a.rgba[3],0);
 const edge=(x,y)=>a.rgba.subarray((y*48+x)*4,(y*48+x+1)*4).toString('hex');let detail=0;
 for(let y=0;y<64;y+=2)for(let x=0;x<48;x+=2)if(new Set([edge(x,y),edge(x+1,y),edge(x,y+1),edge(x+1,y+1)]).size>1)detail++;
 assert(detail>30,'not a scaled-up 24x32 bitmap');assert.deepEqual(WITNESS_SIZE.pivot,{x:24,y:62});
});
test('eight NPC roles produce distinct authored silhouettes/color details',()=>{
 const values=WITNESS_KINDS.map(kind=>{const s=surface(48,64);drawWitness(s.ink,kind);return png(s).toString('hex');});assert.equal(new Set(values).size,8);
});
for(const kind of ['cat','lunch','parcel'])test(`${kind} is a separate transparent integer-pixel prop`,()=>{const a=surface(32,32),b=surface(32,32);drawFairProp(a.ink,kind);drawFairProp(b.ink,kind);assert.deepEqual(png(a),png(b));assert(a.rgba.some(x=>x));assert.equal(a.rgba[3],0);});
test('cat tail frame changes use new authored pixels',()=>{const a=surface(32,32),b=surface(32,32);drawFairProp(a.ink,'cat',0);drawFairProp(b.ink,'cat',1);assert.notDeepEqual(a.rgba,b.rgba);});
for(const ratio of [1.5,1365/900,650/900,390/844])test(`court framing reserves more vertical space than generic field at ${ratio}`,()=>{
 assert(cameraHalf('courtroom',ratio)>cameraHalf('fair',ratio));
 // Conservative projected height of resized north stained glass at the fixed camera.
 const top=(4.1*26+6.65*23)/Math.hypot(23,26),normalized=.5-top/(2*cameraHalf('courtroom',ratio));assert(normalized>=.065);
});
test('runtime, export and browser all consume the new NPCs and framing evidence',()=>{
 const read=p=>readFileSync(p,'utf8');assert.match(read('src/trial-render.ts'),/drawWitness\(ctx,'judge'\),48,64/);assert.match(read('src/fair-render.ts'),/conductView.draw\(s\)/);
 assert.match(read('scripts/asset-export.mjs'),/witness.drawWitness/);assert.match(read('tests/witness_browser.py'),/windowBounds/);
 const ci=read('.github/workflows/ci.yml');assert.match(ci,/route: \[good, bad\]/);assert.match(ci,/python tests\/rescue_browser.py/);assert.match(ci,/python tests\/trial_browser.py/);
 assert.doesNotMatch(read('tests/witness_browser.py'),/\.evaluate\([^\n]*(?:Object.assign|s\.chapter\s*=|\.hp\s*=)/);
});
