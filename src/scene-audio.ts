import {MUSIC_PROFILE,SCORES,sceneCue,notesAt,noteFrequency} from './music-score';
import type {AudioScene,Cue,Voice} from './music-score';

const VOICE_LIMIT=16,MASTER_LEVEL=.55;
type Playing={osc:OscillatorNode;gain:GainNode;end:number};
/** Optional presentation only. No timers, network, samples, state writes or autoplay. */
export class SceneAudio {
 private context:AudioContext|undefined;
 private master:GainNode|undefined;
 private analyser:AnalyserNode|undefined;
 private voices=new Set<Playing>();
 private pending:Promise<void>|null=null;
 private requested=false;
 private blocked=true;
 private disposed=false;
 private failure:string|null=null;
 private state:AudioScene|undefined;
 private cue:Cue|null=null;
 private anchor=0;
 private lastTick=0;
 private cursor=-1;
 private epoch=0;
 private total=0;
 private peak=0;
 private skipped=0;
 private contexts=0;
 private requestId=0;
 constructor(private readonly factory:()=>AudioContext=()=>new AudioContext()){}
 setEnabled(enabled:boolean):void {
  if(this.disposed)return;
  this.requestId++;this.requested=enabled;this.failure=null;this.reset();
  if(enabled)void this.unlock();
 }
 /** Call only from real keyboard/pointer activation; never from the render loop. */
 async unlock():Promise<void> {
  if(!this.requested||this.disposed||this.pending)return;
  const request=this.requestId;
  try {
   if(!this.context){
    const ctx=this.factory();this.context=ctx;this.contexts++;
    this.master=ctx.createGain();this.master.gain.value=0;
    this.analyser=ctx.createAnalyser();this.analyser.fftSize=1024;
    this.master.connect(this.analyser);this.analyser.connect(ctx.destination);
    ctx.onstatechange=()=>{if(ctx.state!=='running')this.hold();};
   }
   if(this.context.state==='closed')throw new Error('Audio context closed');
   if(this.context.state!=='running'){
    const pending=this.context.resume();this.pending=pending;
    try {await pending;} finally {if(this.pending===pending)this.pending=null;}
   }
   // A slow resume may finish after mute, import, a pause or disposal.
   if(!this.requested||this.blocked||this.disposed){this.silence();return;}
  } catch(error){if(request===this.requestId&&this.requested&&!this.disposed)this.fail(error);}
 }
 reset():void {this.silence();this.state=undefined;this.cue=null;this.cursor=-1;this.epoch++;}
 hold():void {this.blocked=true;this.silence();}
 update(s:AudioScene,halted:boolean):void {
  if(this.disposed)return;
  try {
   if(!Number.isSafeInteger(s.ticks)||s.ticks<0){this.hold();return;}
   const cue=sceneCue(s);
   if(this.state!==s||this.cue!==cue||s.ticks<this.lastTick){
    this.silence();this.state=s;this.cue=cue;this.anchor=s.ticks;this.cursor=-1;this.epoch++;
   }
   this.lastTick=s.ticks;
   if(halted||!this.requested||this.context?.state!=='running'){this.hold();return;}
   this.blocked=false;
   const ctx=this.context;
   this.master!.gain.setValueAtTime(MASTER_LEVEL,ctx.currentTime);
   this.reap();
   const score=SCORES[cue],step=Math.floor((s.ticks-this.anchor)/score.stepTicks);
   if(step<=this.cursor)return;
   // Never play a backlog after a stalled frame. A paused tick does not advance.
   if(this.cursor>=0)this.skipped+=Math.max(0,step-this.cursor-1);
   this.cursor=step;
   for(const n of notesAt(score,step))this.play(noteFrequency(n.midi),n.duration*score.stepTicks/60,n.voice,n.level);
  } catch(error){this.fail(error);}
 }
 effect(frequency=440):void {
  if(!Number.isFinite(frequency)||frequency<40||frequency>4000||!this.requested||this.blocked||this.context?.state!=='running'||this.disposed)return;
  try {this.reap();this.play(frequency,.12,'lead',.04);}catch(error){this.fail(error);}
 }
 private play(frequency:number,duration:number,voice:Voice,level:number):void {
  if(this.voices.size>=VOICE_LIMIT)return;
  const ctx=this.context!,now=ctx.currentTime+.008,osc=ctx.createOscillator(),gain=ctx.createGain();
  const playing:Playing={osc,gain,end:now+duration+.055};this.voices.add(playing);
  try {
   osc.type=voice==='harmony'?'sine':'triangle';osc.frequency.setValueAtTime(frequency,now);
   gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(level,now+.014);
   gain.gain.setValueAtTime(level*.7,now+Math.max(.015,duration*.45));gain.gain.linearRampToValueAtTime(0,playing.end);
   osc.connect(gain);gain.connect(this.master!);osc.onended=()=>this.release(playing);
   osc.start(now);osc.stop(playing.end);this.total++;this.peak=Math.max(this.peak,this.voices.size);
  } catch(error){this.release(playing,true);throw error;}
 }
 private release(p:Playing,stop=false):void {
  if(!this.voices.delete(p))return;
  p.osc.onended=null;
  if(stop)try {p.osc.stop();}catch{}
  try {p.osc.disconnect();}catch{}
  try {p.gain.disconnect();}catch{}
 }
 private reap():void {for(const p of this.voices)if(p.end<=this.context!.currentTime)this.release(p,true);}
 private silence():void {
  if(this.context&&this.master)try {this.master.gain.cancelScheduledValues(this.context.currentTime);this.master.gain.setValueAtTime(0,this.context.currentTime);}catch{}
  for(const p of [...this.voices])this.release(p,true);
 }
 private fail(error:unknown):void {this.requested=false;this.blocked=true;this.failure=error instanceof Error?error.message:String(error);this.silence();}
 dispose():void {
  if(this.disposed)return;
  this.disposed=true;this.requestId++;this.requested=false;this.hold();
  if(this.context){this.context.onstatechange=null;void this.context.close().catch(()=>{});}
  this.master?.disconnect();this.analyser?.disconnect();
 }
 status(){return {enabled:this.requested,error:this.failure};}
 /** Copies observed transport/node/analyser values; does not change game or audio transport. */
 inspect(){
  let rms=0;
  if(this.analyser&&this.context?.state==='running'){
   const samples=new Float32Array(this.analyser.fftSize);this.analyser.getFloatTimeDomainData(samples);
   rms=Math.sqrt(samples.reduce((sum,n)=>sum+n*n,0)/samples.length);
  }
  return {profile:MUSIC_PROFILE,enabled:this.requested,blocked:this.blocked,context:this.context?.state??'not-created',contextCount:this.contexts,
   cue:this.cue,step:this.cursor,epoch:this.epoch,notesStarted:this.total,activeVoices:this.voices.size,peakVoices:this.peak,voiceLimit:VOICE_LIMIT,
   masterGain:this.master?.gain.value??0,rms,skippedSteps:this.skipped,error:this.failure,disposed:this.disposed,
   source:'live-web-audio-nodes-and-analyser',originalSoundtrack:false,physicalAudioVerified:false,approved:false};
 }
}
