/** Authored/export cells only. These assertions are not native gameplay approval. */
import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {readFileSync} from 'node:fs';import {inflateSync} from 'node:zlib';
import {NativeActorPixels,sameActorPixels} from '../.test/native-actor-pixels.mjs';
import {storyNpcProductionCell,legacyStoryNpcCell,STORY_NPC_PRODUCTION} from '../.test/production-story-npc-art.mjs';
import {authoredCombatCell,COMBAT_ART} from '../.test/production-combat-art.mjs';
import {STORY_NPC_KINDS,drawStoryNpc} from '../.test/story-npc-art.mjs';
import {HD_HERO_IDS,drawHDHero} from '../.test/hd-hero-art.mjs';import {surface} from '../scripts/asset-export.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
function bounds(data,bottom,minColours=10){let count=0,maxY=0;const colours=new Set();assert.equal(data.length,12288);for(let y=0;y<64;y++)for(let x=0;x<48;x++){const i=(y*48+x)*4;assert([0,255].includes(data[i+3]));if(data[i+3]){count++;maxY=Math.max(maxY,y);assert(x>=2&&x<=45&&y>=2&&y<=bottom);colours.add(data.slice(i,i+3).join(','));}}assert(count>200&&count<1800);assert(maxY>=59);assert(colours.size>=minColours);}
for(const kind of STORY_NPC_KINDS)for(const pose of ['ambient','walk','greet'])test('E NPC '+kind+' '+pose+' all sixteen authored cells keep native bounds/pivot and independent bytes',()=>{
 const hashes=[];for(let facing=0;facing<4;facing++)for(let frame=0;frame<4;frame++){const out=storyNpcProductionCell(kind,frame,facing,pose);assert.deepEqual(out,storyNpcProductionCell(kind,frame,facing,pose));bounds(out,62);assert.notEqual(sha(out),sha(legacyStoryNpcCell(kind,frame)));hashes.push(sha(out));const copy=out.slice();out.fill(0);assert.deepEqual(storyNpcProductionCell(kind,frame,facing,pose),copy);}
 assert(new Set(hashes).size>=6);assert.deepEqual(STORY_NPC_PRODUCTION.pivot,{x:24,y:63});
});
for(const hero of HD_HERO_IDS)for(const pose of COMBAT_ART.poses)test('E staged combat '+hero+' '+pose+' all directions/frames are authored and not legacy impersonation',()=>{
 const hashes=[];for(let facing=0;facing<4;facing++)for(let frame=0;frame<4;frame++){const out=authoredCombatCell(hero,facing,frame,pose),old=surface(48,64);drawHDHero(old.ink,hero,facing,frame,pose);assert.notEqual(sha(out),sha(old.rgba));assert.deepEqual(out,authoredCombatCell(hero,facing,frame,pose));bounds(out,61,pose==='down'?8:10);hashes.push(sha(out));}
 assert(new Set(hashes).size>=4);assert.equal(COMBAT_ART.runtimeApplied,false);assert.deepEqual(COMBAT_ART.pivot,{x:24,y:62});
});
test('E legacy matcher calls the unchanged source painter, and inputs fail closed',()=>{
 for(const kind of STORY_NPC_KINDS)for(let f=0;f<4;f++){const old=surface(48,64);drawStoryNpc(old.ink,kind,f);assert.deepEqual(Buffer.from(legacyStoryNpcCell(kind,f)),old.rgba);}
 for(const bad of [-1,4,.5,NaN,Infinity]){assert.throws(()=>storyNpcProductionCell('guard',bad));assert.throws(()=>storyNpcProductionCell('guard',0,bad));assert.throws(()=>authoredCombatCell('crono',0,bad,'attack'));assert.throws(()=>authoredCombatCell('crono',bad,0,'attack'));}
 assert.throws(()=>storyNpcProductionCell('mother',0));assert.throws(()=>storyNpcProductionCell('guard',0,0,'death'));assert.throws(()=>authoredCombatCell('crono',0,0,'idle'));assert.throws(()=>authoredCombatCell('mother',0,0,'hurt'));
 assert.equal(sameActorPixels([1],[1]),true);assert.equal(sameActorPixels([1],null),false);assert.equal(sameActorPixels([1],[1,2]),false);assert.equal(sameActorPixels([1],[2]),false);
});
test('E integer authoring clips, mirrors and clears without translucent or external image input',()=>{
 const a=new NativeActorPixels();for(const args of [[0,0,-1,1],[.5,0,1,1],[0,NaN,1,1]])assert.throws(()=>a.rect(...args,'#123456'));
 assert.throws(()=>a.line(.5,0,2,3,'#123456'));assert.throws(()=>a.polygon([[0,0],[1,1]],'#123456'));assert.throws(()=>a.oval(0,0,0,1,'#123456'));assert.throws(()=>a.dot(0,0,'red'));
 a.rect(-1,-1,3,3,'#123456');assert.deepEqual(Array.from(a.data.slice(0,4)),[18,52,86,255]);const saved=a.data.slice();a.mirror();a.mirror();assert.deepEqual(a.data,saved);a.border();assert(a.data.every(v=>v===0));
 const ink=a.ink();ink.fillStyle='#ffeedd';ink.fillRect(4,4,2,2);ink.clearRect(4,4,2,2);assert(a.data.every(v=>v===0));
});
test('E eleven PNG sheets decode to all 592 exact authored cells and truthful activation flags',async()=>{
 const {exportProductionCharacters}=await import('../scripts/production-character-export.mjs'),out='.test/e-export-check',m=await exportProductionCharacters(out);assert.equal(m.assets.length,11);assert.equal(m.approved,false);assert.equal(m.nativeEvidence,false);assert.equal(m.runtimeCombatCellSlots,0);assert.equal(m.runtimeNpcAmbientCellSlots,28);let cells=0,active=0;
 for(const a of m.assets){const z=readFileSync(out+'/'+a.file);assert.equal(sha(z),a.pngSha256);let at=8;const parts=[];while(at<z.length){const n=z.readUInt32BE(at);if(z.toString('ascii',at+4,at+8)==='IDAT')parts.push(z.subarray(at+8,at+8+n));at+=n+12;}const rows=inflateSync(Buffer.concat(parts)),pix=Buffer.alloc(a.width*a.height*4),stride=a.width*4;assert.equal(rows.length,a.height*(stride+1));for(let y=0;y<a.height;y++){assert.equal(rows[y*(stride+1)],0);rows.copy(pix,y*stride,y*(stride+1)+1,(y+1)*(stride+1));}assert.equal(sha(pix),a.rgbaSha256);
  for(const c of a.cells){cells++;const npc=a.name.startsWith('story-'),id=a.name.slice(npc?6:7),expected=npc?storyNpcProductionCell(id,c.frame,c.facing,c.pose):authoredCombatCell(id,c.facing,c.frame,c.pose);assert.equal(c.rgbaSha256,sha(expected));assert.deepEqual(c.pivot,npc?[24,63]:[24,62]);assert.equal(c.runtimeApplied,npc&&c.pose==='ambient'&&c.facing===0);if(c.runtimeApplied)active++;for(let y=0;y<64;y++)assert.deepEqual(pix.subarray(((c.y+y)*a.width+c.x)*4,((c.y+y)*a.width+c.x+48)*4),Buffer.from(expected.subarray(y*192,(y+1)*192)));}
 }assert.equal(cells,592);assert.equal(active,28);
});
