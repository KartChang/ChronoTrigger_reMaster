import {activeSlot,guestKind} from './core';
import {PartyReactionMotion} from './party-reaction';
import type {State,Effect,Vec} from './core';
import {CLIP_MS} from './hero-art';
import type {PoseSample} from './pose-player';

/** Reuses retained directional sprites/clips. No rules, clock, position or save writes. */
export const PARTY_COMBAT=Object.freeze({id:'vq03p-party-combat-continuity',historyLimit:24,approved:false});
type Actor=State['players'][number];
type Observed={actor:Actor;key:string;hp:number;tick:number;mode:State['mode'];facing:number};
type Lock={kind:'action';tick:number;pose:'attack'|'cast';facing:number;origin:Vec;target:Vec;effect:Effect};
type Down={kind:'down';tick:number;beforeTick:number;hpBefore:number;hpAfter:0;facing:number};
type Result=PoseSample&{facing:number};
type Pixels={width:number;height:number;fnv1a32:number};
type Entry={slot:number;actor:string;tick:number;hp:number;mode:State['mode'];pose:PoseSample['pose'];frame:number;facing:number;reducedMotion:boolean;cause:Lock|Down;texture:Pixels|null;scope:'draw-texture-not-framebuffer'};
const finite=(v:Vec|undefined):v is Vec=>!!v&&Number.isFinite(v.x)&&Number.isFinite(v.z);
export function actionFacing(origin:Vec,target:Vec):number|null{
 if(!finite(origin)||!finite(target))return null;
 const x=target.x-origin.x,z=target.z-origin.z;if(Math.hypot(x,z)<1e-8)return null;
 return Math.abs(x)>Math.abs(z)?(x>0?1:3):(z>0?2:0);
}
export function fallenFrame(ageTicks:number):number{
 const ms=Math.max(0,ageTicks)*1000/60;let edge=0;
 for(let i=0;i<3;i++){edge+=CLIP_MS.down[i]!;if(ms<edge)return i;}
 return 3; // Hold while HP stays zero; never return to idle by finishing the clip.
}
export function rgbaFingerprint(bytes:ArrayLike<number>):number{
 let h=2166136261;for(let i=0;i<bytes.length;i++)h=Math.imul(h^bytes[i]!,16777619);return h>>>0;
}
export class PartyCombatMotion {
 private reactions=new PartyReactionMotion();
 private state:State|null=null;
 private chapter='';
 private tick:number|null=null;
 private reduced=false;
 private disposed=false;
 private previous:(Observed|null)[]=[null,null,null];
 private locks:(Lock|null)[]=[null,null,null];
 private downs:(Down|null)[]=[null,null,null];
 private current:(Result|null)[]=[null,null,null];
 private pending:(Entry|null)[]=[null,null,null];
 private keys:(string|null)[]=[null,null,null];
 private history:Entry[]=[];
 private dropped=0;
 private readFailures=0;
 private actors(s:State):({actor:Actor;key:string}|null)[]{
  return [activeSlot(s,0)?{actor:s.players[0],key:'crono'}:null,activeSlot(s,1)?{actor:s.players[1],key:s.kingdom.phase==='rescue'?'lucca':'marle'}:null,guestKind(s)?{actor:s.rescue.guest,key:guestKind(s)!}:null];
 }
 begin(s:State,reduced:boolean):void{
  if(this.disposed)return;
  if(this.state!==s||this.chapter!==s.chapter||(this.tick!==null&&s.ticks<this.tick))this.reset();
  this.state=s;this.chapter=s.chapter;this.tick=s.ticks;this.reduced=reduced;
  this.reactions.begin(s,reduced,this.actors(s));
  this.actors(s).forEach((entry,i)=>{
   const old=this.previous[i];
   if(!entry){this.previous[i]=null;this.locks[i]=null;this.downs[i]=null;this.current[i]=null;this.pending[i]=null;this.keys[i]=null;return;}
   const {actor,key}=entry;
   if(old&&(old.actor!==actor||old.key!==key)){this.locks[i]=null;this.downs[i]=null;this.keys[i]=null;}
   if(actor.hp>0)this.downs[i]=null;
   else {
    this.locks[i]=null;
    // An already-dead load/first draw or frozen final defeat does not invent a fall.
    if(s.chapter!=='lab'&&old?.actor===actor&&old.key===key&&old.hp>0&&old.tick<s.ticks&&old.mode==='battle'&&s.mode==='battle')
     this.downs[i]={kind:'down',tick:s.ticks,beforeTick:old.tick,hpBefore:old.hp,hpAfter:0,facing:this.current[i]?.facing??old.facing};
   }
   if(s.mode!=='battle'&&s.mode!=='victory'){this.locks[i]=null;this.downs[i]=null;}
   this.previous[i]={actor,key,hp:actor.hp,tick:s.ticks,mode:s.mode,facing:actor.facing};
  });
 }
 receive(s:State,e:Effect):void{
  this.reactions.receive(s,e);
  if(this.disposed||s!==this.state||s.chapter==='lab'||(s.mode!=='battle'&&s.mode!=='victory')||e.enemyAction||!finite(e.origin)||!finite(e))return;
  // Only explicit outgoing ownership. Target-only hits and origin-less combos never identify an actor.
  const i=e.guest===true&&e.actor===undefined?2:e.guest!==true&&(e.actor===0||e.actor===1)?e.actor:null;
  if(i===null||!(e.kind==='hit'||(i===2&&e.kind==='heal')))return;
  const owner=this.actors(s)[i];if(!owner||owner.actor.hp<=0||owner.actor.x!==e.origin.x||owner.actor.z!==e.origin.z)return;
  const facing=actionFacing(e.origin,e);if(facing===null)return;
  const pose=e.kind==='heal'||e.style==='fire'||e.style==='spin'?'cast':'attack';
  this.locks[i]={kind:'action',tick:s.ticks,pose,facing,origin:{x:e.origin.x,z:e.origin.z},target:{x:e.x,z:e.z},effect:structuredClone(e)};
 }
 downPose(slot:number):PoseSample{
  const d=this.downs[slot];return {pose:'down',frame:d&&this.tick!==null?fallenFrame(this.tick-d.tick):3};
 }
 sample(slot:number,base:PoseSample,fallbackFacing:number):Result{
  if(!Number.isInteger(slot)||slot<0||slot>2)throw new RangeError('Invalid party slot');
  const result={...base,facing:fallbackFacing},owner=this.previous[slot],s=this.state;
  if(this.disposed||!owner||!s||this.tick===null)return result;
  let cause:Lock|Down|null=null;
  if(owner.hp<=0){Object.assign(result,this.downPose(slot));const down=this.downs[slot];if(down){result.facing=down.facing;cause=down;}}
  else {
   const lock=this.locks[slot];
   if(lock){const age=(this.tick/60-lock.tick/60)*1000,duration=CLIP_MS[lock.pose].reduce((n,t)=>n+t,0);
    if(age<0||age>=duration)this.locks[slot]=null;
    else if(base.pose===lock.pose){result.facing=lock.facing;cause=lock;}
    else if(base.pose==='hurt'||base.pose==='down')this.locks[slot]=null;
   }
  }
  result.facing=this.reactions.sample(slot,result);
  this.current[slot]={...result};
  if(cause&&s.chapter!=='lab'){
   const key=`${cause.kind}/${cause.tick}/${result.pose}/${result.frame}/${result.facing}/${this.reduced}`;
   if(this.keys[slot]!==key){
    this.keys[slot]=key;
    const row:Entry={slot,actor:owner.key,tick:this.tick,hp:owner.hp,mode:s.mode,...result,reducedMotion:this.reduced,cause:structuredClone(cause),texture:null,scope:'draw-texture-not-framebuffer'};
    this.pending[slot]=row;this.history.push(row);if(this.history.length>PARTY_COMBAT.historyLimit){this.history.shift();this.dropped++;}
   }
  }else this.keys[slot]=null;
  return result;
 }
 /** Read the actual existing canvas only on a newly observed pose, after normal drawing.
  * Failure is explicit diagnostic data, never a fabricated hash or a gameplay failure. */
 recordDraw(slot:number,read:()=>{width:number;height:number;data:ArrayLike<number>}):void{
  this.reactions.recordDraw(slot,read);
  const row=this.pending[slot];if(!row||this.disposed)return;this.pending[slot]=null;
  try{const p=read();if(p.width!==48||p.height!==64||p.data.length!==48*64*4)throw Error('Unexpected party cell');row.texture={width:p.width,height:p.height,fnv1a32:rgbaFingerprint(p.data)};}
  catch{this.readFailures++;}
 }
 reset():void{this.reactions.reset();this.state=null;this.chapter='';this.tick=null;this.previous.fill(null);this.locks.fill(null);this.downs.fill(null);this.current.fill(null);this.pending.fill(null);this.keys.fill(null);this.history=[];this.dropped=0;this.readFailures=0;}
 dispose():void{this.reset();this.reactions.dispose();this.disposed=true;}
 inspect(){return {profile:PARTY_COMBAT.id,tick:this.tick,chapter:this.chapter,reducedMotion:this.reduced,disposed:this.disposed,historyLimit:PARTY_COMBAT.historyLimit,historyDropped:this.dropped,textureReadFailures:this.readFailures,current:structuredClone(this.current),history:structuredClone(this.history),reactions:this.reactions.inspect(),stateMutation:false,additionalGpuResources:0,approved:false};}
}
