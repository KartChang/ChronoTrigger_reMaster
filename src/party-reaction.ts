import type {State,Effect} from './core';
import {CLIP_MS} from './hero-art';
import type {PoseSample} from './pose-player';

/** Retain the previously drawn direction for a real delivered target hit.
 * This never guesses an attacker, triggers a pose, or changes simulation state. */
export const PARTY_REACTION=Object.freeze({id:'vq03q-party-reaction-continuity',historyLimit:24,approved:false});
type Owner={actor:State['players'][number];key:string};
type Draw={tick:number;facing:number};
type Cause={kind:'delivered-target-hit';tick:number;target:{x:number;z:number};beforeDraw:Draw;effect:Effect};
type Cell={width:number;height:number;fnv1a32:number};
type Row={slot:number;actor:string;tick:number;hp:number;mode:State['mode'];pose:'hurt';frame:number;facing:number;fallbackFacing:number;reducedMotion:boolean;cause:Cause;texture:Cell|null;scope:'draw-texture-not-framebuffer'};
type Result=PoseSample&{facing:number};
const direction=(v:number)=>Number.isInteger(v)&&v>=0&&v<4;
const duration=CLIP_MS.hurt.reduce((n,t)=>n+t,0);
export class PartyReactionMotion {
 private state:State|null=null;
 private chapter='';
 private tick:number|null=null;
 private reduced=false;
 private disposed=false;
 private owners:(Owner|null)[]=[null,null,null];
 private drawn:(Draw|null)[]=[null,null,null];
 private staged:(Draw|null)[]=[null,null,null];
 private locks:(Cause|null)[]=[null,null,null];
 private pending:(Row|null)[]=[null,null,null];
 private keys:(string|null)[]=[null,null,null];
 private history:Row[]=[];
 private dropped=0;
 private readFailures=0;
 begin(s:State,reduced:boolean,owners:(Owner|null)[]):void{
  if(this.disposed)return;
  if(this.state!==s||this.chapter!==s.chapter||(this.tick!==null&&s.ticks<this.tick))this.reset();
  this.state=s;this.chapter=s.chapter;this.tick=s.ticks;this.reduced=reduced;
  for(let i=0;i<3;i++){
   const owner=owners[i]??null,old=this.owners[i];
   if(!owner||old?.actor!==owner.actor||old?.key!==owner.key||owner.actor.hp<=0||s.chapter==='lab'||(s.mode!=='battle'&&s.mode!=='victory'))this.clearSlot(i);
   this.owners[i]=owner;
  }
 }
 private clearSlot(i:number):void{this.drawn[i]=null;this.staged[i]=null;this.locks[i]=null;this.pending[i]=null;this.keys[i]=null;}
 receive(s:State,e:Effect):void{
  if(this.disposed||s!==this.state||s.chapter==='lab'||s.mode!=='battle'||e.kind!=='hit'||e.actor!==undefined||e.guest===true||!Number.isFinite(e.x)||!Number.isFinite(e.z))return;
  // Exact, unique living target only. Near or overlapping actors are not disambiguated.
  const matches=this.owners.flatMap((o,i)=>o&&o.actor.hp>0&&o.actor.x===e.x&&o.actor.z===e.z?[i]:[]);
  if(matches.length!==1)return;
  const i=matches[0]!,before=this.drawn[i];
  if(!before||before.tick>s.ticks||!direction(before.facing)||this.locks[i]?.tick===s.ticks)return;
  this.locks[i]={kind:'delivered-target-hit',tick:s.ticks,target:{x:e.x,z:e.z},beforeDraw:{...before},effect:structuredClone(e)};
 }
 sample(slot:number,result:Result):number{
  const owner=this.owners[slot],s=this.state;let facing=result.facing;
  if(this.disposed||!owner||!s||this.tick===null)return facing;
  const lock=this.locks[slot];
  if(lock){
   const age=(this.tick/60-lock.tick/60)*1000;
   // Pose ownership stays with the existing ActorTimeline. An interrupted reaction
   // cannot resume later simply because another hurt pose happens to be sampled.
   if(owner.actor.hp<=0||result.pose!=='hurt'||age<0||age>=duration)this.locks[slot]=null;
   else {
    facing=lock.beforeDraw.facing;
    const key=`${lock.tick}/${result.frame}/${facing}/${this.reduced}`;
    if(key!==this.keys[slot]){
     this.keys[slot]=key;
     const row:Row={slot,actor:owner.key,tick:this.tick,hp:owner.actor.hp,mode:s.mode,pose:'hurt',frame:result.frame,facing,fallbackFacing:result.facing,reducedMotion:this.reduced,cause:structuredClone(lock),texture:null,scope:'draw-texture-not-framebuffer'};
     this.pending[slot]=row;this.history.push(row);
     if(this.history.length>PARTY_REACTION.historyLimit){this.history.shift();this.dropped++;}
    }
   }
  }
  if(!this.locks[slot]){this.keys[slot]=null;this.pending[slot]=null;}
  this.staged[slot]=owner.actor.hp>0&&s.chapter!=='lab'&&(s.mode==='battle'||s.mode==='victory')&&direction(facing)?{tick:this.tick,facing}:null;
  return facing;
 }
 /** Called by the retained renderer after the real draw. No per-frame readback;
  * fingerprint only a newly observed reaction cell, not the framebuffer. */
 recordDraw(slot:number,read:()=>{width:number;height:number;data:ArrayLike<number>}):void{
  if(this.disposed)return;
  const staged=this.staged[slot];if(staged){this.drawn[slot]={...staged};this.staged[slot]=null;}
  const row=this.pending[slot];if(!row)return;this.pending[slot]=null;
  try{
   const p=read();if(p.width!==48||p.height!==64||p.data.length!==48*64*4)throw Error('Unexpected reaction cell');
   let h=2166136261;for(let i=0;i<p.data.length;i++)h=Math.imul(h^p.data[i]!,16777619);
   row.texture={width:p.width,height:p.height,fnv1a32:h>>>0};
  }catch{this.readFailures++;}
 }
 reset():void{this.state=null;this.chapter='';this.tick=null;this.owners.fill(null);this.drawn.fill(null);this.staged.fill(null);this.locks.fill(null);this.pending.fill(null);this.keys.fill(null);this.history=[];this.dropped=0;this.readFailures=0;}
 dispose():void{this.reset();this.disposed=true;}
 inspect(){return {profile:PARTY_REACTION.id,tick:this.tick,chapter:this.chapter,disposed:this.disposed,reducedMotion:this.reduced,historyLimit:PARTY_REACTION.historyLimit,historyDropped:this.dropped,textureReadFailures:this.readFailures,history:structuredClone(this.history),stateMutation:false,additionalGpuResources:0,approved:false};}
}
