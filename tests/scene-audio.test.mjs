import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SceneAudio} from '../.test/scene-audio.mjs';
import {SCORES,sceneCue,notesAt,noteFrequency} from '../.test/music-score.mjs';
import {createState,serialize} from '../.test/core.mjs';

// Fake Web Audio ports exercise scheduling/lifetimes; these are not real audio evidence.
class Param {
 value=0;calls=[];
 setValueAtTime(v,t){this.value=v;this.calls.push(['set',v,t]);}
 linearRampToValueAtTime(v,t){this.value=v;this.calls.push(['ramp',v,t]);}
 cancelScheduledValues(t){this.calls.push(['cancel',t]);}
}
class Node {
 disconnected=false;connections=[];
 connect(n){this.connections.push(n);return n;}
 disconnect(){this.disconnected=true;this.connections=[];}
}
class Context {
 state='running';currentTime=0;destination={};oscillators=[];gains=[];resumes=0;closed=0;
 createGain(){const n=new Node();n.gain=new Param();this.gains.push(n);return n;}
 createAnalyser(){const n=new Node();n.fftSize=1024;n.getFloatTimeDomainData=a=>a.fill(0);return n;}
 createOscillator(){const n=new Node();n.frequency=new Param();n.start=t=>{n.started=t;};n.stop=t=>{n.stopped=t??this.currentTime;};this.oscillators.push(n);return n;}
 async resume(){this.resumes++;this.state='running';}
 async close(){this.closed++;this.state='closed';}
}
function setup(chapter='fair'){
 const ctx=new Context(),audio=new SceneAudio(()=>ctx),s=createState(chapter);
 audio.setEnabled(true);audio.update(s,false);return {ctx,audio,s};
}
test('default silent has no AudioContext allocation, no notes and no game state mutation',()=>{
 let calls=0;const a=new SceneAudio(()=>{calls++;throw Error('must not allocate');}),s=createState('fair'),before=structuredClone(s);
 for(let i=0;i<100;i++){a.update(s,false);a.effect();}
 assert.equal(calls,0);assert.equal(a.inspect().context,'not-created');assert.equal(a.inspect().notesStarted,0);assert.deepEqual(s,before);
});
test('seven bounded immutable original arrangements use valid notes with finite envelopes',()=>{
 assert.equal(Object.keys(SCORES).length,7);
 for(const score of Object.values(SCORES)){
  assert(Object.isFrozen(score)&&Object.isFrozen(score.notes));assert(score.stepTicks>=12);assert(score.notes.length>10);
  for(const n of score.notes){assert(Object.isFrozen(n));assert(n.step>=0&&n.step<score.steps);assert(n.duration>0&&n.duration<8);assert(n.level>0&&n.level<=.055);assert(Number.isFinite(noteFrequency(n.midi)));}
  assert.throws(()=>{score.notes.push({});});
 }
 assert.equal(noteFrequency(69),440);for(const n of [-1,128,Infinity,NaN])assert.throws(()=>noteFrequency(n));
});
test('scene and combat selection is read-only and handles existing early and later maps',()=>{
 const s=createState('bedroom');assert.equal(sceneCue(s),'hearth');s.chapter='home';assert.equal(sceneCue(s),'hearth');
 s.chapter='fair';assert.equal(sceneCue(s),'fair');s.chapter='truce';assert.equal(sceneCue(s),'road');s.chapter='cell';assert.equal(sceneCue(s),'tension');
 for(const mode of ['battle','victory','defeat']){s.mode=mode;const before=structuredClone(s);assert.equal(sceneCue(s),mode);assert.deepEqual(s,before);}
});
test('loop and one-shot arrangements never replay victory or defeat forever',()=>{
 for(const cue of ['victory','defeat']){const q=SCORES[cue];assert.deepEqual(notesAt(q,q.steps),[]);assert.deepEqual(notesAt(q,10000),[]);}
 assert.deepEqual(notesAt(SCORES.fair,64),notesAt(SCORES.fair,0));
 for(const step of [-1,.5,NaN,Infinity])assert.deepEqual(notesAt(SCORES.fair,step),[]);
});
test('actual runtime creates one graph only after opt-in and schedules bounded notes',()=>{
 const {audio,ctx,s}=setup();assert.equal(audio.inspect().contextCount,1);assert(audio.inspect().notesStarted>0);assert.equal(audio.inspect().masterGain,.55);
 assert.equal(ctx.oscillators[0].started,.008);
 for(const o of ctx.oscillators){assert(o.stopped>o.started);assert(o.frequency.calls.every(c=>Number.isFinite(c[1])));}
 for(let i=0;i<10;i++){audio.setEnabled(false);audio.setEnabled(true);audio.update(s,false);}
 assert.equal(audio.inspect().contextCount,1);assert.equal(ctx.resumes,0);
});
test('same tick and paused frames do not duplicate notes, advance game or transport',()=>{
 const {audio,s}=setup(),before=structuredClone(s),count=audio.inspect().notesStarted,step=audio.inspect().step;
 for(let i=0;i<100;i++)audio.update(s,false);assert.equal(audio.inspect().notesStarted,count);
 audio.hold();for(let i=0;i<100;i++)audio.update(s,true);
 assert.equal(audio.inspect().activeVoices,0);assert.equal(audio.inspect().masterGain,0);
 audio.update(s,false);assert.equal(audio.inspect().notesStarted,count);assert.equal(audio.inspect().step,step);assert.deepEqual(s,before);
});
test('late frames skip expired score steps rather than replaying a note backlog',()=>{
 const {audio,s,ctx}=setup();const before=audio.inspect().notesStarted;
 s.ticks=150;ctx.currentTime=2.5;audio.update(s,false);
 assert.equal(audio.inspect().step,10);assert.equal(audio.inspect().skippedSteps,9);assert.equal(audio.inspect().notesStarted-before,notesAt(SCORES.fair,10).length);
});
test('state replacement and tick rollback clear existing nodes and restart a fresh phrase',()=>{
 const {audio,s,ctx}=setup(),old=[...ctx.oscillators],before=audio.inspect().epoch;
 const fresh=createState('fair');audio.update(fresh,false);assert(audio.inspect().epoch>before);assert(old.every(n=>n.disconnected));
 fresh.ticks=60;audio.update(fresh,false);fresh.ticks=0;audio.update(fresh,false);assert.equal(audio.inspect().step,0);assert.equal(s.ticks,0);
});
test('cue switch stops preceding music without changing gameplay coordinates or flags',()=>{
 const {audio,s,ctx}=setup(),old=[...ctx.oscillators];s.mode='battle';const before=structuredClone(s);
 audio.update(s,false);assert.equal(audio.inspect().cue,'battle');assert(old.every(o=>o.disconnected));assert.deepEqual(s,before);
 s.mode='victory';audio.update(s,false);const count=audio.inspect().notesStarted;s.ticks+=SCORES.victory.steps*SCORES.victory.stepTicks;audio.update(s,false);assert.equal(audio.inspect().notesStarted,count);
});
test('opt-out immediately silences and disconnects all notes; held effects are suppressed',()=>{
 const {audio,ctx,s}=setup();audio.effect(660);const notes=audio.inspect().notesStarted;
 audio.setEnabled(false);assert.equal(audio.inspect().activeVoices,0);assert(ctx.oscillators.every(n=>n.disconnected));assert.equal(audio.inspect().masterGain,0);
 s.ticks+=30;audio.update(s,false);audio.effect();assert.equal(audio.inspect().notesStarted,notes);
});
test('pause/import holds release oscillator AND gain connections; resume does not replay effects',()=>{
 const {audio,ctx,s}=setup();audio.effect(660);const count=audio.inspect().notesStarted;
 audio.hold();audio.effect(800);assert.equal(audio.inspect().activeVoices,0);assert(ctx.gains.slice(1).every(n=>n.disconnected));
 audio.update(s,false);assert.equal(audio.inspect().notesStarted,count);
});
test('polyphony is limited even under repeated input; onended releases each node exactly once',()=>{
 const {audio,ctx}=setup();for(let i=0;i<100;i++)audio.effect(440);
 assert.equal(audio.inspect().activeVoices,16);assert.equal(audio.inspect().peakVoices,16);
 const n=ctx.oscillators[0],ended=n.onended;ended();ended();assert.equal(audio.inspect().activeVoices,15);assert(n.disconnected);assert.equal(n.onended,null);
});
test('fallback reaping prevents retention if ended callbacks are delayed by a busy host',()=>{
 const {audio,ctx,s}=setup();ctx.currentTime=100;audio.update(s,false);assert.equal(audio.inspect().activeVoices,0);assert(ctx.oscillators.every(n=>n.disconnected));
});
test('inspect is detached and cannot set playback flags or alter game/save state',()=>{
 const {audio,s}=setup(),before=structuredClone(s),raw=serialize(s),n=audio.inspect().notesStarted;
 const view=audio.inspect();view.enabled=false;view.cue='defeat';audio.inspect();
 assert.equal(audio.inspect().enabled,true);assert.equal(audio.inspect().notesStarted,n);assert.deepEqual(s,before);assert.equal(serialize(s),raw);
});
test('invalid input tick/frequency never emits nonfinite oscillator values',()=>{
 const {audio,s}=setup();const count=audio.inspect().notesStarted;
 for(const n of [NaN,Infinity,-1,0,4001])audio.effect(n);
 for(const ticks of [NaN,Infinity,-1,.2]){s.ticks=ticks;audio.update(s,false);assert.equal(audio.inspect().activeVoices,0);}
 assert.equal(audio.inspect().notesStarted,count);
});
test('muting before asynchronous resume resolves never starts audio behind a menu',async()=>{
 const ctx=new Context();ctx.state='suspended';let finish;
 ctx.resume=()=>new Promise(resolve=>{finish=()=>{ctx.state='running';resolve();};});
 const a=new SceneAudio(()=>ctx),s=createState('fair');a.setEnabled(true);a.update(s,false);a.setEnabled(false);finish();await Promise.resolve();await Promise.resolve();a.update(s,true);
 assert.equal(a.inspect().enabled,false);assert.equal(a.inspect().notesStarted,0);assert.equal(a.inspect().masterGain,0);
});
test('pending unlock is shared, render frames never repeatedly resume a suspended context',async()=>{
 const ctx=new Context();ctx.state='suspended';let finish,calls=0;ctx.resume=()=>{calls++;return new Promise(resolve=>{finish=()=>{ctx.state='running';resolve();};});};
 const a=new SceneAudio(()=>ctx),s=createState('fair');a.setEnabled(true);
 for(let i=0;i<50;i++){void a.unlock();a.update(s,false);}assert.equal(calls,1);assert.equal(a.inspect().notesStarted,0);
 finish();await Promise.resolve();await Promise.resolve();a.update(s,false);assert(a.inspect().notesStarted>0);
});
test('context interruptions silence notes and wait for a genuine unlock call',async()=>{
 const {audio,ctx,s}=setup();ctx.state='suspended';ctx.onstatechange();assert.equal(audio.inspect().activeVoices,0);
 for(let i=0;i<30;i++)audio.update(s,false);assert.equal(ctx.resumes,0);
 await audio.unlock();audio.update(s,false);assert.equal(ctx.resumes,1);assert.equal(audio.inspect().context,'running');
});
test('unsupported WebAudio fails closed without throwing into gameplay',()=>{
 const a=new SceneAudio(()=>{throw Error('unavailable');}),s=createState('fair'),before=structuredClone(s);
 a.setEnabled(true);a.update(s,false);assert.equal(a.inspect().enabled,false);assert.equal(a.inspect().error,'unavailable');assert.deepEqual(s,before);
});
test('failed resume after mute is ignored, not a stale error overwriting current UI',async()=>{
 const ctx=new Context();ctx.state='suspended';let reject;ctx.resume=()=>new Promise((_,r)=>{reject=r;});
 const a=new SceneAudio(()=>ctx);a.setEnabled(true);a.setEnabled(false);reject(Error('denied'));await Promise.resolve();await Promise.resolve();assert.equal(a.status().error,null);assert(!a.status().enabled);
});
test('disposal closes graph once, including asynchronous resume and scheduled notes',async()=>{
 const {audio,ctx,s}=setup();audio.dispose();audio.dispose();audio.setEnabled(true);await audio.unlock();audio.update(s,false);audio.effect();
 assert.equal(ctx.closed,1);assert.equal(audio.inspect().activeVoices,0);assert(audio.inspect().disposed);assert(ctx.oscillators.every(n=>n.disconnected));
});
test('scheduling failure cleans partial voices, mutes, and leaves actual state untouched',()=>{
 const {audio,ctx,s}=setup();const before=structuredClone(s),factory=ctx.createOscillator.bind(ctx);ctx.createOscillator=()=>{const n=factory();n.start=()=>{throw Error('device failure');};return n;};
 audio.effect();assert.equal(audio.inspect().enabled,false);assert.equal(audio.inspect().activeVoices,0);assert.equal(audio.inspect().error,'device failure');assert.deepEqual(s,before);
});
test('main retains effect-transfer assertions and connects real halt/import/reset boundaries',()=>{
 const main=readFileSync('src/main.ts','utf8');
 assert.match(main,/world.draw\(state,dt,running\|\|!started,takeFrameEffects\(state,running\)\)/);
 assert.match(main,/soundtrack.update\(state,!running\)/);assert.match(main,/if\(halted\(\)\)soundtrack.hold\(\)/);
 assert.match(main,/filePickerOpen=value;if\(value\)soundtrack.hold\(\)/);
 assert.match(main,/function replaceState\(next:State\):void \{\s*soundtrack.reset\(\)/);
 assert.match(main,/if\(document.hidden\)soundtrack.hold\(\)/);
 assert.match(main,/audio:\(\)=>soundtrack.inspect\(\)/);
 assert.doesNotMatch(main,/soundEnabled|new AudioContext/);
 const html=readFileSync('index.html','utf8');assert.match(html,/id="sound"[^>]*aria-pressed="false"/);
});

import ts from 'typescript';
import {createHash} from 'node:crypto';
import {assertAudioEvidence} from '../scripts/audio-evidence.mjs';
const functionFixture=JSON.parse(readFileSync('tests/fixtures/audio-preserved-functions.json','utf8'));
function gameplayFingerprints(source){
 const tree=ts.createSourceFile('main.ts',source,ts.ScriptTarget.Latest,true),found={};
 const additions={replaceState:'\n  soundtrack.reset();',syncModal:'\n if(halted())soundtrack.hold();',updateHud:'\n  syncSoundButton();'};
 for(const n of tree.statements)if(ts.isFunctionDeclaration(n)&&n.name&&Object.hasOwn(functionFixture.functions,n.name.text)){
  let text=n.getText(tree),addition=additions[n.name.text];
  if(addition){assert.equal(text.split(addition).length,2);text=text.replace(addition,'');}
  found[n.name.text]=createHash('sha256').update(text).digest('hex');
 }
 return found;
}
test('all retained gameplay functions match the exact accepted source after only explicit audio calls',()=>{
 assert.equal(Object.keys(functionFixture.functions).length,22);
 assert.deepEqual(gameplayFingerprints(readFileSync('src/main.ts','utf8')),functionFixture.functions);
});
test('a mutation to old movement/action/save logic is not hidden by the explicit audio-call comparison',()=>{
 const source=readFileSync('src/main.ts','utf8');assert(source.includes('const raw=serialize(state)'));
 assert.notDeepEqual(gameplayFingerprints(source.replace('const raw=serialize(state)','const raw=serialize(createState())')),functionFixture.functions);
});
const audioFixture=JSON.parse(readFileSync('tests/fixtures/scene-audio-evidence-unit.json','utf8')).report;
test('checker accepts its explicitly synthetic unit model (not browser or sound evidence)',()=>{assert(assertAudioEvidence(audioFixture));});
for(const [name,mutate] of [
 ['missing report',r=>{delete r.status;}],['fake approval',r=>{r.listeningReview=true;}],
 ['autoplay',r=>{r.initial.contextCount=1;}],['zero energy',r=>{r.playing.rms=0;}],
 ['nonfinite waveform',r=>{r.playing.rms=NaN;}],['unbounded voices',r=>{r.playing.activeVoices=17;}],
 ['missing modal',r=>{r.holds.pop();}],['state changes while paused',r=>{r.holds[0].stateUnchanged=false;}],
 ['menu sound leak',r=>{r.holds[0].observation.activeVoices=1;}],['replayed transport',r=>{r.import.after.epoch=r.import.before.epoch;}],
 ['unmuted final',r=>{r.muted.enabled=true;}],['silenced error',r=>{r.errors.push('device error');}]
])test('checker rejects '+name,()=>{const r=structuredClone(audioFixture);mutate(r);assert.throws(()=>assertAudioEvidence(r));});

test('native Float32 AudioParam rounding is accepted without weakening mute or voice limits',()=>{const r=structuredClone(audioFixture);r.playing.masterGain=Math.fround(.55);assert(assertAudioEvidence(r));r.playing.masterGain=.54;assert.throws(()=>assertAudioEvidence(r));});

// CI43 stopped in pause silence. This model deliberately does not render an
// automation event into Param.value, unlike the eager legacy fake above.
class DeferredParam extends Param {setValueAtTime(v,t){this.calls.push(['set',v,t]);}}
test('master gate is immediate even when the last automated value is not rendered',()=>{
 const ctx=new Context(),original=ctx.createGain.bind(ctx);
 ctx.createGain=()=>{const n=original();if(ctx.gains.length===1)n.gain=new DeferredParam();return n;};
 const a=new SceneAudio(()=>ctx),s=createState('fair');a.setEnabled(true);a.update(s,false);
 assert.equal(a.inspect().masterGain,.55);assert(a.inspect().activeVoices>0);
 ctx.currentTime=7;a.hold();assert.equal(a.inspect().masterGain,0);assert.equal(a.inspect().activeVoices,0);
 assert(ctx.gains[0].gain.calls.every(c=>c[0]==='cancel'&&c[1]===0));
 assert(ctx.gains.slice(1).some(g=>g.gain.calls.some(c=>c[0]==='ramp')),'note envelopes remain scheduled');
 s.ticks+=15;a.update(s,false);assert.equal(a.inspect().masterGain,.55);a.setEnabled(false);assert.equal(a.inspect().masterGain,0);
});
test('master gate does not accumulate frame-rate automation events',()=>{
 const {audio,ctx,s}=setup();for(let i=0;i<1000;i++)audio.update(s,false);
 assert.equal(ctx.gains[0].gain.calls.filter(c=>c[0]==='set').length,0);assert.equal(audio.inspect().masterGain,.55);
 audio.reset();assert.equal(audio.inspect().masterGain,0);assert.equal(audio.inspect().activeVoices,0);
});
test('paused audio inspector never manufactures zero analyser energy',()=>{
 const ctx=new Context();ctx.createAnalyser=()=>{const n=new Node();n.fftSize=1024;n.getFloatTimeDomainData=a=>a.fill(.125);return n;};
 const audio=new SceneAudio(()=>ctx),s=createState('fair');audio.setEnabled(true);audio.update(s,false);audio.hold();
 const v=audio.inspect();assert.equal(v.rms,.125);assert.equal(v.masterGain,0);assert.equal(v.activeVoices,0);
 assert.equal(v.contextTime,0);assert.equal(v.analyserSize,1024);
});
