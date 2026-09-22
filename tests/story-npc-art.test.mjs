import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {surface,png} from '../scripts/asset-export.mjs';
import {STORY_NPC_ART,STORY_NPC_KINDS,drawStoryNpc} from '../.test/story-npc-art.mjs';
import {storyNpcBaseline} from './helpers/story-npc-baseline.mjs';
const draw=(kind,frame)=>{const s=surface(48,64);drawStoryNpc(s.ink,kind,frame);return s;};
for(const kind of STORY_NPC_KINDS){
 test(`${kind} authored story cells: four distinct poses, stable feet, binary cutout`,()=>{
  const frames=Array.from({length:4},(_,i)=>draw(kind,i));
  assert.equal(new Set(frames.map(s=>png(s).toString('hex'))).size,4);
  for(const s of frames){
   assert.equal(s.rgba.length,48*64*4);
   const alpha=s.rgba.filter((_,i)=>i%4===3);assert(alpha.includes(0));assert(alpha.includes(255));assert(alpha.every(v=>v===0||v===255));
   assert.deepEqual(s.rgba.subarray(58*48*4),frames[0].rgba.subarray(58*48*4));
   assert(s.rgba.subarray(62*48*4,63*48*4).some(v=>v));
   assert(s.rgba.subarray(63*48*4).every(v=>v===0));
  }
 });
}
test('seven roles use distinct authored palettes and occupational motifs',()=>{
 assert.equal(STORY_NPC_KINDS.length,7);assert.equal(new Set(STORY_NPC_KINDS.map(k=>png(draw(k,0)).toString('hex'))).size,7);
 assert.equal(STORY_NPC_ART.approved,false);assert.equal(STORY_NPC_ART.romPixels,false);
 assert.deepEqual([STORY_NPC_ART.width,STORY_NPC_ART.height,STORY_NPC_ART.frames],[48,64,4]);
});
test('frame normalization is deterministic, clears prior pixels and rejects unknown kind',()=>{
 for(const f of [-4,0,4,NaN,Infinity])assert.deepEqual(draw('nun',f).rgba,draw('nun',0).rgba);
 assert.deepEqual(draw('nun',-1).rgba,draw('nun',3).rgba);
 const s=draw('guard',3);drawStoryNpc(s.ink,'queen',0);assert.deepEqual(s.rgba,draw('queen',0).rgba);
 assert.throws(()=>draw('mother',0),/Unknown story/);assert.throws(()=>draw('__proto__',0),/Unknown story/);
});
const declared=JSON.parse(readFileSync('tests/baselines/vq02q-declared-scene-edits.json','utf8'));
for(const name of Object.keys(declared.files))test(`${name}: only enumerated NPC art/inspection deltas from exact P source`,()=>{
 const s=readFileSync(name,'utf8');const restored=storyNpcBaseline(name,s);
 assert.equal(createHash('sha256').update(restored).digest('hex'),declared.originalSha256[name]);
 const e=declared.files[name][0];assert.throws(()=>storyNpcBaseline(name,s.replace(e.after,'')));
 assert.throws(()=>storyNpcBaseline(name,s+'\n'+e.after));
 // A change outside the declared wires is not erased by the normalization.
 assert.notEqual(createHash('sha256').update(storyNpcBaseline(name,s+'\n// out of scope\n')).digest('hex'),declared.originalSha256[name]);
});
test('held home source and original art remain outside this batch',()=>{
 const b=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');
 assert.doesNotMatch(readFileSync('src/prologue-render.ts','utf8'),/StoryNpc|story-npc/);
 const motion=readFileSync('src/story-npc-motion.ts','utf8');assert.doesNotMatch(motion,/setInterval|setTimeout|Date\.now|Math\.random|\.position\s*\.|\.scaling\s*\.|\.hp\s*=/);
});
