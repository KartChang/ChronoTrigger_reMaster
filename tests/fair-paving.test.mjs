// VQ02B explicitly advances only renderer/main pins for requested context/density wiring.
// Original draw/camera/scene functions are verified in render-preserved.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {surface} from '../scripts/asset-export.mjs';
import {drawSurface,fairStone,surfaceWorld} from '../.test/world-art.mjs';
import {drawFairPlaza,pavingRegion,pavingColour,PAVING_PROBES,inspectFairPlaza} from '../.test/fair-paving.mjs';
import {buildFair} from '../.test/fair-render.mjs';
import {createState} from '../.test/core.mjs';
import {festivalTestScene} from './festival-test-scene.mjs';
const expected=JSON.parse(readFileSync('tests/fixtures/fair-paving-unit.json','utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const sample=s=>PAVING_PROBES.map(([x,y])=>({x,y,rgba:Array.from(s.rgba.subarray((y*512+x)*4,(y*512+x+16)*4))}));
test('retained painter recomposition is deterministic and all pixels remain opaque',()=>{
 const a=surface(512,512),b=surface(512,512);drawFairPlaza(a.ink);drawFairPlaza(b.ink);assert.deepEqual(a.rgba,b.rgba);
 assert.equal(hash(a.rgba),expected.rgbaSha256);assert.deepEqual(sample(a),expected.samples);
 for(let i=3;i<a.rgba.length;i+=4)assert.equal(a.rgba[i],255);
});
test('all garden pixels including original 2x2 boundary stamps remain byte-identical',()=>{
 const a=surface(512,512),b=surface(512,512);drawSurface(a.ink,512,512,'fair');drawFairPlaza(b.ink);let preserved=0;
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){const p=surfaceWorld(x-x%2,y-y%2,512,512,'fair');if(!fairStone(p.x,p.z)){const k=(y*512+x)*4;assert.equal(a.rgba.readUInt32LE(k),b.rgba.readUInt32LE(k));preserved++;}}
 assert(preserved>40000);assert.notEqual(hash(a.rgba),hash(b.rgba));
});
test('field stone course density is twice the retained 512 painter while retaining its vocabulary',()=>{
 const old=surface(1024,1024),now=surface(512,512);drawSurface(old.ink,1024,1024,'fair');drawFairPlaza(now.ink);
 for(let y=80;y<200;y+=3)for(let x=300;x<400;x+=3){const p=surfaceWorld(x,y,512,512,'fair');assert.equal(pavingRegion(p.x,p.z),'field');const i=(y*2*1024+x*2)*4;const c='#'+old.rgba.subarray(i,i+3).toString('hex');assert.equal(now.rgba.subarray((y*512+x)*4,(y*512+x)*4+3).toString('hex'),pavingColour(c,'field').slice(1));}
});
test('composition separates promenade, bell apron and border without paving the bell garden',()=>{
 for(const [x,z,r] of [[0,3,'promenade'],[5,-7.1,'promenade'],[-3.5,-.5,'garden'],[-3.5,-2.7,'bell-apron'],[-3.5,-3.25,'bell-border'],[11.1,0,'edge-course'],[8,5,'field'],[0,11,'garden']])assert.equal(pavingRegion(x,z),r);
 assert.notEqual(pavingColour('#aaa084','promenade'),pavingColour('#aaa084','field'));assert.equal(pavingColour('#647c4c','garden'),'#647c4c');
});
test('joint contrast is reduced rather than a global blur or loss of stone variation',()=>{
 const lum=c=>[1,3,5].reduce((a,i)=>a+parseInt(c.slice(i,i+2),16),0)/3;
 const old=lum('#aaa084')-lum('#817e67'),now=lum(pavingColour('#aaa084','field'))-lum(pavingColour('#817e67','field'));assert(now>3&&now<old);
 assert.notEqual(pavingColour('#aaa084','field'),pavingColour('#beb095','field'));
});
test('invalid dimensions/coordinates/colour fail before partially drawing',()=>{
 const c={fillStyle:'#000000',fillRect(){assert.fail('draw before validation');},clearRect(){assert.fail('clear before validation');}};
 for(const n of [0,-1,NaN,Infinity,511,1024])assert.throws(()=>drawFairPlaza(c,n,512));
 for(const n of [NaN,Infinity,-Infinity])assert.throws(()=>pavingRegion(n,0));assert.throws(()=>pavingColour('rgba(0,0,0,1)','field'));
});
test('real NullEngine texture canvas uses the source-generated expected pixels, not a hardcoded success',()=>{
 const k=festivalTestScene();try{const f=buildFair(k.scene,k.shadow),t=k.scene.getTextureByName('fair-ground-reference');assert.deepEqual(f.inspect().paving.samples,expected.samples);
 const [x,y]=PAVING_PROBES[0];t.getContext().fillStyle='#ff00ff';t.getContext().fillRect(x,y,1,1);assert.notDeepEqual(inspectFairPlaza(t).samples,expected.samples);
 assert.equal(f.inspect().paving.source,'actual-fair-paving-canvas');assert.equal(f.inspect().paving.approved,false);
 }finally{k.dispose();}
});
test('paving does not resize the atlas, add texture/ground mesh, change sampler or upload while drawing',()=>{
 const k=festivalTestScene();try{const f=buildFair(k.scene,k.shadow),s=createState('fair'),t=k.scene.getTextureByName('fair-ground-reference');f.root.setEnabled(true);const before=f.inspect().paving,n=k.scene.textures.length;
 assert.equal(t.getSize().width,512);assert.equal(t.getSize().height,512);assert.equal(t.samplingMode,8);assert.equal(t.anisotropicFilteringLevel,4);assert.equal(k.scene.meshes.filter(m=>m.name==='fair-ground').length,1);
 t.update=()=>assert.fail('per-frame upload');for(const tick of [0,120,120,1,0]){s.ticks=tick;const original=structuredClone(s);f.draw(s,999,true);assert.deepEqual(s,original);assert.deepEqual(f.inspect().paving,before);assert.equal(k.scene.textures.length,n);}
 }finally{k.dispose();}
});
test('retained painter, topology, core/main and held home renderer remain exact blobs',()=>{
 for(const [p,sha] of Object.entries({'src/early-art.ts':'12b0f9db63ff3cf0e22bda3a758ca3d3a33995c6c74c4c7b431a8a94f38a4b10','src/surface-layout.ts':'5a0e6520e80dbd609b6e5ebaab93c78e5be1a67b5b3068261336a36d8d7fb995','src/main.ts':'89c2980be9219b0cd80408b10524250e9a97afa3321a39acb782f8cfc484d120'}))assert.equal(hash(readFileSync(p)),sha);
 const b=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');
});

test('exported fair-ground review sheet uses the same runtime composition and declares its source',()=>{
 const script=readFileSync('scripts/asset-export.mjs','utf8');assert.match(script,/modules\['fair-paving'\]\.drawFairPlaza\(c\)/);assert.match(script,/'src\/fair-paving.ts'/);
});
