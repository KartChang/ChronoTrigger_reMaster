import test from 'node:test';
import assert from 'node:assert/strict';
import {SceneAudio} from '../.test/scene-audio.mjs';
import {AudioPorts,startAudio} from './helpers/audio-ports.mjs';
const boom=()=>{throw Error('injected allocation/connection failure');};

for(const stage of ['gain','analyser','fftSize','master-connect','analyser-connect','state-handler'])test(`partial ${stage} graph failure closes context and disconnects every allocated node`,async()=>{
 const ctx=new AudioPorts();
 const gain=ctx.createGain.bind(ctx),analyser=ctx.createAnalyser.bind(ctx);
 ctx.createGain=()=>{if(stage==='gain')return boom();const n=gain();if(stage==='master-connect')n.connect=boom;return n;};
 ctx.createAnalyser=()=>{if(stage==='analyser')return boom();const n=analyser();if(stage==='fftSize')Object.defineProperty(n,'fftSize',{set:boom});if(stage==='analyser-connect')n.connect=boom;return n;};
 if(stage==='state-handler')Object.defineProperty(ctx,'onstatechange',{set(value){if(value!==null)boom();}});
 const audio=new SceneAudio(()=>ctx);audio.setEnabled(true);await Promise.resolve();
 assert.equal(audio.status().enabled,false);assert.match(audio.status().error,/injected/);
 assert.equal(audio.inspect().activeVoices,0);assert.equal(audio.inspect().context,'not-created');assert.equal(ctx.closed,1);
 assert([...ctx.gains,...ctx.analysers].every(n=>n.disconnects===1));
});
test('cleanup failures cannot prevent closing a partially constructed context',()=>{
 const ctx=new AudioPorts(),gain=ctx.createGain.bind(ctx);
 ctx.createGain=()=>{const n=gain();n.disconnect=boom;return n;};ctx.createAnalyser=boom;
 Object.defineProperty(ctx,'onstatechange',{set:boom});
 const audio=new SceneAudio(()=>ctx);audio.setEnabled(true);assert.equal(ctx.closed,1);assert.equal(audio.status().enabled,false);
});
test('a user retry after graph allocation failure uses a new silent context, not partial nodes',async()=>{
 const failed=new AudioPorts(),healthy=new AudioPorts();failed.createAnalyser=boom;let calls=0;
 const audio=new SceneAudio(()=>++calls===1?failed:healthy),state={chapter:'fair',era:'present',mode:'explore',ticks:0};
 audio.setEnabled(true);await Promise.resolve();assert.equal(failed.closed,1);
 audio.setEnabled(true);audio.update(state,false);assert.equal(calls,2);assert.equal(audio.status().error,null);
 assert(healthy.oscillators.length>0);assert(failed.gains.every(n=>n.disconnects===1));
 audio.dispose();assert.equal(healthy.closed,1);
});
for(const stage of ['oscillator','gain','frequency','envelope','osc-connect','gain-connect','start','stop'])test(`effect ${stage} failure releases current and previous motif voices`,()=>{
 const {audio,context}=startAudio(SceneAudio);audio.effect(440);
 const createOsc=context.createOscillator.bind(context),createGain=context.createGain.bind(context);
 context.createOscillator=()=>{if(stage==='oscillator')return boom();const n=createOsc();if(stage==='frequency')n.frequency.setValueAtTime=boom;if(stage==='osc-connect')n.connect=boom;if(stage==='start')n.start=boom;if(stage==='stop')n.stop=boom;return n;};
 context.createGain=()=>{if(stage==='gain')return boom();const n=createGain();if(stage==='envelope')n.gain.linearRampToValueAtTime=boom;if(stage==='gain-connect')n.connect=boom;return n;};
 audio.effect(520);
 assert.equal(audio.status().enabled,false);assert.match(audio.status().error,/injected/);
 assert.equal(audio.inspect().activeVoices,0);assert.equal(audio.inspect().masterGain,0);
 assert(context.oscillators.every(n=>n.disconnects===1&&n.onended===null));
 assert(context.gains.slice(1).every(n=>n.disconnects===1));
});
test('failure on the second motif allocation cancels its already scheduled first voice',()=>{
 const {audio,context}=startAudio(SceneAudio),create=context.createGain.bind(context);let calls=0;
 context.createGain=()=>++calls===2?boom():create();audio.effect(520);
 assert.equal(calls,2);assert.equal(audio.inspect().activeVoices,0);assert.equal(audio.inspect().masterGain,0);
 assert(context.oscillators.every(o=>o.disconnects===1));assert.equal(audio.inspect().effects.motifsStarted,1);assert.equal(audio.inspect().effects.voicesStarted,1);assert.match(audio.status().error,/injected/);
});
test('one reused analyser buffer still contains the actual observed energy during holds',()=>{
 const {audio,context}=startAudio(SceneAudio);audio.hold();const before=context.reads.length;
 for(let i=0;i<100;i++){const v=audio.inspect();assert.equal(v.rms,.125);assert.equal(v.masterGain,0);}
 const reads=context.reads.slice(before);assert.equal(reads.length,100);assert.equal(new Set(reads).size,1);assert.equal(reads[0].length,1024);
 const count=context.reads.length;audio.dispose();audio.inspect();assert.equal(context.reads.length,count);
});
for(const failing of ['close','master-disconnect','analyser-disconnect','state-handler'])test(`dispose continues other cleanup after ${failing} throws and is idempotent`,()=>{
 const {audio,context}=startAudio(SceneAudio);audio.effect(520);let closes=0;
 if(failing==='close')context.close=()=>{closes++;return boom();};
 if(failing==='master-disconnect')context.gains[0].disconnect=()=>{context.gains[0].disconnects++;boom();};
 if(failing==='analyser-disconnect')context.analysers[0].disconnect=()=>{context.analysers[0].disconnects++;boom();};
 if(failing==='state-handler')Object.defineProperty(context,'onstatechange',{set:boom});
 assert.doesNotThrow(()=>audio.dispose());assert.doesNotThrow(()=>audio.dispose());
 assert.equal(audio.inspect().activeVoices,0);assert.equal(audio.inspect().disposed,true);assert.equal(audio.status().enabled,false);
 assert.equal(context.gains[0].disconnects,1);assert.equal(context.analysers[0].disconnects,1);
 assert.equal(failing==='close'?closes:context.closed,1);
});
test('pending resume resolved after disposal cannot recreate motif nodes or diagnostic buffers',async()=>{
 const ctx=new AudioPorts();ctx.state='suspended';let resolve;ctx.resume=()=>new Promise(r=>{resolve=r;});
 const audio=new SceneAudio(()=>ctx);audio.setEnabled(true);audio.dispose();resolve();await Promise.resolve();await Promise.resolve();
 audio.update({chapter:'fair',mode:'explore',era:'present',ticks:0},false);audio.effect(520);audio.inspect();
 assert.equal(ctx.oscillators.length,0);assert.equal(ctx.reads.length,0);assert.equal(ctx.closed,1);
});
