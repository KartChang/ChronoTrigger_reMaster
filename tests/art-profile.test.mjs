import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ART_PROFILE,cameraHalf,bridgeDeckPixels,tankVisualFrame,materialFor} from '../.test/art-profile.mjs';
import {drawMaterial,drawMountain,SURFACE_KINDS} from '../.test/material-art.mjs';
import {drawTrialFloor,drawTankPart} from '../.test/trial-art.mjs';
import {trialWalkable} from '../.test/trial-data.mjs';
import {surface,png} from '../scripts/asset-export.mjs';
for(const kind of SURFACE_KINDS)test(`${kind}: opaque, varied and deterministic runtime/export surface`,()=>{
 const a=surface(64,64),b=surface(64,64);drawMaterial(a.ink,kind);drawMaterial(b.ink,kind);assert.deepEqual(png(a),png(b));
 assert(a.rgba.filter((_,i)=>i%4===3).every(v=>v===255));const colors=new Set();for(let i=0;i<a.rgba.length;i+=4)colors.add(a.rgba.subarray(i,i+3).toString('hex'));assert(colors.size>=3);
});
test('material IDs are semantic; home is timber, prison is stone, unrelated bright UI remains flat',()=>{
 for(const [name,expected] of [['tiny-roof','roof'],['tiny-plaster','plaster'],['north-wall','timber'],['wall-planks','timber'],['back-wall','stone'],['cell-bars','iron'],['bed-frame','timber'],['morning-window',null],['torch-flame',null]])assert.equal(materialFor(name),expected);
});
test('regional mountain is transparent and a tapered symbol, not a cuboid landmark',()=>{const s=surface(64,48);drawMountain(s.ink);const count=y=>Array.from({length:64},(_,x)=>s.rgba[(y*64+x)*4+3]).filter(v=>v===255).length;assert.equal(count(0),0);assert(count(12)<count(30));assert.equal(s.rgba[3],0);assert(png(s).length>150);});
for(const ratio of [1365/900,1200/800,650/900,390/844,4/3])test(`camera profile retains world/home/field distinction at aspect ${ratio}`,()=>{
 for(const [chapter,rule] of [['overworld1000','world'],['home','home'],['bedroom','home'],['courtroom','field'],['fair','field'],['lab','lab']]){const value=cameraHalf(chapter,ratio),p=ART_PROFILE.camera[rule];assert(value>=p.minimumHalfHeight);assert(value*ratio>=p.minimumHalfWidth-1e-9);}
 assert(cameraHalf('overworld1000',ratio)>cameraHalf('home',ratio));
});
test('invalid viewport ratios have bounded fallback, not a corrupted camera',()=>{for(const r of [NaN,Infinity,-1,0])assert.equal(cameraHalf('home',r),cameraHalf('home',1));});
test('bridge pixels and collision share physical deck geometry without relaxing collision',()=>{
 const bridge=ART_PROFILE.bridge,pixels=bridgeDeckPixels(352),s=surface(384,352);drawTrialFloor(s.ink,384,352,'bridge');
 assert.equal(bridge.deckHalfDepth-bridge.actorMargin,1.55);assert(trialWalkable(0,1.55,'prisonbridge'));assert(!trialWalkable(0,1.551,'prisonbridge'));
 assert(pixels.top>=129&&pixels.top<=131);assert.equal(pixels.bottom,352-pixels.top);
 for(const z of [-1.55,0,1.55]){const y=Math.floor(352*(.5-z/bridge.depth));assert(y>=pixels.top&&y<pixels.bottom);const rgb=s.rgba.subarray((y*384+10)*4,(y*384+10)*4+3).toString('hex');assert(['8d8b7a','757970'].includes(rgb));}
 for(const h of [0,-1,1.1])assert.throws(()=>bridgeDeckPixels(h));
});
test('tank animation is bounded by simulation ticks; pausing does not advance it',()=>{
 for(const ticks of [0,1,17,18,35,36,1000]){const frame=tankVisualFrame(ticks,true);assert([0,1].includes(frame));assert.equal(tankVisualFrame(ticks,true),frame);assert.equal(tankVisualFrame(ticks,false),0);}
 assert.equal(tankVisualFrame(17,true),0);assert.equal(tankVisualFrame(18,true),1);assert.equal(tankVisualFrame(36,true),0);assert.equal(tankVisualFrame(NaN,true),0);
});
for(const part of ['head','body','wheel'])test(`tank ${part} two-frame export matches distinct runtime poses`,()=>{const a=surface(64,64),b=surface(64,64);drawTankPart(a.ink,part,0);drawTankPart(b.ink,part,1);assert.notDeepEqual(a.rgba,b.rgba);});
test('production constants are consumed by camera, scene construction, collision and exporter',()=>{
 const read=p=>readFileSync(p,'utf8');assert.match(read('src/render.ts'),/cameraHalf\(this.chapter/);assert.match(read('src/trial-data.ts'),/ART_PROFILE.bridge.deckHalfDepth-ART_PROFILE.bridge.actorMargin/);
 for(const path of ['src/prologue-render.ts','src/trial-render.ts'])assert.match(read(path),/boxTextureUV\(w,h,d\)/);
 assert.match(read('scripts/asset-export.mjs'),/production-profile.json/);assert.match(read('src/trial-render.ts'),/tankVisualFrame\(s.ticks/);
 assert.equal(ART_PROFILE.assets.romExtracted,false);assert.equal(ART_PROFILE.assets.externalAtlasRuntime,false);
});

test('prison interiors retain party panels and commands; compact home/world UI is not a global interior rule',()=>{
 const css=readFileSync('src/adventure.css','utf8');
 assert.doesNotMatch(css,/body\[data-map-kind="interior"\] #party/);
 assert.match(css,/body\[data-map-kind="interior"\]\[data-inventory-items="false"\] #party \.player/);
 assert.match(css,/body\[data-map-kind="overworld"\]\[data-mode="explore"\] #party/);
 // Equipment is available before prison; compact interiors must remain independent of that button.
 const main=readFileSync('src/main.ts','utf8');
 assert.match(main,/\$\('bag'\)\.hidden=!started;/);
 assert.match(main,/dataset\.inventoryItems=String\(trialActive\(state\)\)/);
 assert.match(main,/\$\('inventory-items-section'\)\.hidden=!trialActive\(state\)/);
});
