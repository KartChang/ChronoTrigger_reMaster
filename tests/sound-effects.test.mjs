import {impMIfDeclared} from './helpers/imp-m-baseline.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {SceneAudio} from '../.test/scene-audio.mjs';
import {SOUND_EFFECTS,SOUND_EFFECT_PROFILE,effectScore} from '../.test/sound-effect-score.mjs';
import {AudioPorts,startAudio} from './helpers/audio-ports.mjs';
const near=(actual,expected)=>assert(Math.abs(actual-expected)<1e-12,`${actual} != ${expected}`);

test('seven original synthesis motifs cover the retained frequency API with immutable bounded data',()=>{
 assert.equal(SOUND_EFFECT_PROFILE,'vq03g-authored-effect-motifs');
 assert.deepEqual(Object.keys(SOUND_EFFECTS),['262','330','440','520','620','660','800']);
 assert.equal(new Set(Object.values(SOUND_EFFECTS).map(s=>s.id)).size,7);
 assert(Object.isFrozen(SOUND_EFFECTS));
 for(const score of Object.values(SOUND_EFFECTS)){
  assert(Object.isFrozen(score)&&Object.isFrozen(score.notes));
  assert(score.notes.length>0&&score.notes.length<=3);
  assert(score.notes.reduce((s,n)=>s+n.level,0)<=.04+1e-12);
  for(const n of score.notes){
   assert(Object.isFrozen(n));assert(['sine','triangle'].includes(n.wave));
   for(const f of [n.frequency,n.endFrequency])assert(Number.isFinite(f)&&f>=40&&f<=4000);
   assert(n.offset>=0&&n.duration>=.015&&n.offset+n.duration+.055<=.5);
   assert(n.level>0&&n.level<=.04);assert.throws(()=>{n.level=1;});
  }
  assert.throws(()=>score.notes.push({}));
 }
});
for(const frequency of Object.keys(SOUND_EFFECTS).map(Number))test(`motif ${frequency} uses one anchor, exact authored ramps/envelopes and owned nodes`,()=>{
 const {audio,context,state}=startAudio(SceneAudio),before=JSON.stringify(state);
 const start=context.oscillators.length,voiceStart=audio.inspect().notesStarted;
 audio.effect(frequency);
 const notes=SOUND_EFFECTS[frequency].notes,created=context.oscillators.slice(start),gains=context.gains.slice(-notes.length);
 assert.equal(created.length,notes.length);assert.equal(audio.inspect().notesStarted-voiceStart,notes.length);
 notes.forEach((n,i)=>{
  const t=2.008+n.offset,end=t+n.duration+.055,o=created[i],g=gains[i];
  assert.equal(o.type,n.wave);near(o.starts[0],t);near(o.stops[0],end);
  assert.deepEqual(o.frequency.calls[0],['set',n.frequency,t]);
  if(n.endFrequency!==n.frequency)assert.deepEqual(o.frequency.calls[1],['ramp',n.endFrequency,t+n.duration]);
  else assert.equal(o.frequency.calls.length,1);
  assert.deepEqual(g.gain.calls,[['set',0,t],['ramp',n.level,t+.014],['set',n.level*.7,t+Math.max(.015,n.duration*.45)],['ramp',0,end]]);
  assert.deepEqual(o.connections,[g]);assert.deepEqual(g.connections,[context.gains[0]]);
 });
 assert.equal(audio.inspect().effects.last,SOUND_EFFECTS[frequency].id);
 assert.equal(audio.inspect().effects.motifsStarted,1);assert.equal(audio.inspect().effects.voicesStarted,notes.length);
 assert.equal(JSON.stringify(state),before);
 audio.hold();assert.equal(audio.inspect().activeVoices,0);
 for(const o of created){assert.equal(o.disconnects,1);assert.equal(o.onended,null);assert.equal(o.stops.length,2);}
 for(const g of gains)assert.equal(g.disconnects,1);
});
test('unknown valid frequencies retain the original one-note effect and 660 remains a shared chime',()=>{
 for(const f of [40,123.45,439.5,4000]){
  const score=effectScore(f);assert.equal(score.id,'tone');assert.equal(score.notes.length,1);
  assert.deepEqual(score.notes[0],{frequency:f,endFrequency:f,offset:0,duration:.12,level:.04,wave:'triangle'});
 }
 assert.equal(effectScore(660).id,'chime');assert.equal(effectScore(440).id,'interact');
});
for(const frequency of [NaN,Infinity,-Infinity,-1,0,39.99,4000.1,null,'440',{}])test(`invalid effect ${String(frequency)} is rejected without allocating nodes`,()=>{
 assert.equal(effectScore(frequency),null);
 const {audio,context}=startAudio(SceneAudio),before=audio.inspect(),count=context.oscillators.length;
 audio.effect(frequency);assert.deepEqual(audio.inspect(),before);assert.equal(context.oscillators.length,count);
});
test('delayed motif notes use a single audio-clock anchor even if node construction takes time',()=>{
 const {audio,context}=startAudio(SceneAudio),create=context.createOscillator.bind(context),first=context.oscillators.length;
 context.createOscillator=()=>{context.currentTime+=.001;return create();};audio.effect(520);
 const offsets=SOUND_EFFECTS[520].notes.map(n=>n.offset);
 context.oscillators.slice(first).forEach((o,i)=>near(o.starts[0],2.008+offsets[i]));
});
for(const action of ['hold','mute','reset','dispose'])test(`${action} immediately releases scheduled motif tails and never queues a replay`,()=>{
 const {audio,context,state}=startAudio(SceneAudio);audio.effect(520);const old=context.oscillators.slice(-3),count=audio.inspect().effects.voicesStarted;
 if(action==='mute')audio.setEnabled(false);else audio[action]();
 assert.equal(audio.inspect().masterGain,0);assert.equal(audio.inspect().activeVoices,0);
 assert(old.every(o=>o.disconnects===1&&o.stops.at(-1)===2));
 if(action!=='reset')audio.effect(620);
 for(let i=0;i<20;i++)audio.update(state,true);
 audio.update(state,false);assert.equal(audio.inspect().effects.voicesStarted,count);
});
test('effect overload retains 16 voices, drops excess without allocation or deferred replay',()=>{
 const {audio,context,state}=startAudio(SceneAudio);
 for(let i=0;i<50;i++)audio.effect(520);
 assert.equal(audio.inspect().activeVoices,16);assert.equal(audio.inspect().peakVoices,16);
 assert.equal(audio.inspect().effects.voicesStarted,16);assert.equal(audio.inspect().effects.motifsStarted,6);
 const count=context.oscillators.length;for(let i=0;i<20;i++)audio.effect(800);assert.equal(context.oscillators.length,count);
 context.currentTime=100;audio.update(state,false);
 assert.equal(audio.inspect().activeVoices,0);assert.equal(audio.inspect().effects.voicesStarted,16);
});
test('late ended notifications and manual reap cannot double-release effect ownership',()=>{
 const {audio,context,state}=startAudio(SceneAudio);audio.effect(330);const nodes=context.oscillators.slice(-2),callbacks=nodes.map(o=>o.onended);
 context.currentTime=10;audio.update(state,false);callbacks.forEach(cb=>{cb();cb();});
 assert.equal(audio.inspect().activeVoices,0);assert(nodes.every(n=>n.disconnects===1));
});
test('default, suspended and held graphs suppress all authored effects',()=>{
 const ctx=new AudioPorts(),audio=new SceneAudio(()=>ctx);for(const f of Object.keys(SOUND_EFFECTS))audio.effect(Number(f));
 assert.equal(ctx.oscillators.length,0);assert.equal(audio.inspect().contextCount,0);
 audio.setEnabled(true);ctx.state='suspended';for(const f of Object.keys(SOUND_EFFECTS))audio.effect(Number(f));
 assert.equal(ctx.oscillators.length,0);assert.equal(audio.inspect().effects.motifsStarted,0);
});
test('diagnostic effect counters are detached, not physical listening or full audio approval',()=>{
 const {audio}=startAudio(SceneAudio);audio.effect(620);const view=audio.inspect();
 assert.equal(view.effects.originalSamples,false);assert.equal(view.effects.listeningVerified,false);
 assert.equal(view.physicalAudioVerified,false);assert.equal(view.approved,false);
 view.effects.motifsStarted=999;view.effects.last='changed';assert.equal(audio.inspect().effects.motifsStarted,1);assert.equal(audio.inspect().effects.last,'restore');
});
// Exact accepted CI76 program pins: new effects cannot silently alter game triggers,
// music scores, authored visuals, CPU decoder, native route or frozen-state gates.
const preserved=JSON.parse(readFileSync('tests/fixtures/audio-g-preserved.json','utf8'));
for(const [path,sha] of Object.entries(preserved.files))test('G preserves exact source '+path,()=>{
 assert.equal(createHash('sha256').update(impMIfDeclared(path,readFileSync(path,'utf8'))).digest('hex'),sha);
});

test('the retained no-argument effect API uses the 440 interaction motif',()=>{
 const {audio}=startAudio(SceneAudio);audio.effect();assert.equal(audio.inspect().effects.last,'interact');assert.equal(audio.inspect().effects.voicesStarted,1);
});

import {SceneAudio as AcceptedAudio} from '../.test/audio-g-baseline.mjs';
function scheduleDigest(context){
 return context.oscillators.map((o,i)=>({wave:o.type,frequency:o.frequency.calls,start:o.starts,stop:o.stops,disconnected:o.disconnects,envelope:context.gains[i+1].gain.calls}));
}
for(const [chapter,mode,era] of [['home','explore','present'],['fair','explore','present'],['truce','explore','past'],['cell','explore','present'],['fair','battle','present'],['fair','victory','present'],['fair','defeat','present']])test(`retained ${chapter}/${mode} music has exact accepted scheduling through skips/holds/reset`,()=>{
 const context=new AudioPorts(),priorContext=new AudioPorts(),audio=new SceneAudio(()=>context),prior=new AcceptedAudio(()=>priorContext);
 let state={chapter,mode,era,ticks:0},oldState=structuredClone(state);audio.setEnabled(true);prior.setEnabled(true);
 for(let i=0;i<160;i++){
  context.currentTime=priorContext.currentTime=i/8;state.ticks=oldState.ticks=i*8;
  if(i===40){audio.hold();prior.hold();}
  if(i===100){audio.reset();prior.reset();}
  if(i===120){state=structuredClone(state);oldState=structuredClone(oldState);}
  const held=i>=40&&i<45;audio.update(state,held);prior.update(oldState,held);
  assert.deepEqual(scheduleDigest(context),scheduleDigest(priorContext));
  const current=audio.inspect(),previous=prior.inspect();delete current.effects;
  assert.deepEqual(current,previous);
 }
 audio.setEnabled(false);prior.setEnabled(false);assert.deepEqual(scheduleDigest(context),scheduleDigest(priorContext));
 assert.deepEqual(state,oldState);
});
