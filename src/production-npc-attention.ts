import {activeSlot,cutsceneActive} from './core';
import type {State} from './core';
export type NpcAttentionPose=Readonly<{facing:number;pose:'ambient'|'greet'}>;
const HOME: NpcAttentionPose=Object.freeze({facing:0,pose:'ambient'});
export const NPC_ATTENTION=Object.freeze({id:'vq04g-live-npc-attention',radius:3.25,releaseRadius:3.6,greetRadius:1.9,greetReleaseRadius:2.3,targetHysteresis:.3,axisHysteresis:.2,limit:12,approved:false});
type Target=Readonly<{slot:number;x:number;z:number}>;
type Choice=NpcAttentionPose&Readonly<{slot:number}>;
/** Read-only presentation of the existing living party. No timers, NPC movement,
 * quest interaction or State mutation. The original NPC producer supplies frames. */
export class NpcAttention {
 private chapter='';private tick:number|null=null;private targets:Target[]=[];private choices=new Map<string,Choice>();
 begin(s:State):void{
  if(this.chapter!==s.chapter||this.tick!==null&&s.ticks<this.tick)this.choices.clear();
  this.chapter=s.chapter;this.tick=s.ticks;this.targets=[];
  if(!['truce','castle','cathedral','sanctum'].includes(s.chapter)||s.mode!=='explore'||cutsceneActive(s)||!Number.isSafeInteger(s.ticks)||s.ticks<0){this.choices.clear();return;}
  for(const slot of [0,1] as const){const p=s.players[slot];if(activeSlot(s,slot)&&p.hp>0&&Number.isFinite(p.x)&&Number.isFinite(p.z))this.targets.push({slot,x:p.x,z:p.z});}
 }
 select(name:string,x:number,z:number):NpcAttentionPose{
  if(typeof name!=='string'||!name||!Number.isFinite(x)||!Number.isFinite(z)||!this.targets.length){this.choices.delete(name);return HOME;}
  const old=this.choices.get(name),candidates=this.targets.map(t=>({...t,d:Math.hypot(t.x-x,t.z-z)})).sort((a,b)=>a.d-b.d||a.slot-b.slot);
  let chosen=candidates[0]!;const retained=old&&candidates.find(t=>t.slot===old.slot);
  if(retained&&retained.d<=chosen.d+NPC_ATTENTION.targetHysteresis)chosen=retained;
  if(chosen.d>(old?NPC_ATTENTION.releaseRadius:NPC_ATTENTION.radius)){this.choices.delete(name);return HOME;}
  if(!old&&this.choices.size>=NPC_ATTENTION.limit)return HOME;
  const dx=chosen.x-x,dz=chosen.z-z,oldHorizontal=old&&(old.facing===1||old.facing===3);
  const horizontal=old&&Math.abs(Math.abs(dx)-Math.abs(dz))<=NPC_ATTENTION.axisHysteresis?oldHorizontal:Math.abs(dx)>Math.abs(dz);
  const facing=chosen.d<.05?(old?.facing??0):horizontal?(dx>0?1:3):(dz>0?2:0);
  const pose=chosen.d<=(old?.pose==='greet'?NPC_ATTENTION.greetReleaseRadius:NPC_ATTENTION.greetRadius)?'greet':'ambient';
  const choice:Choice={facing,pose,slot:chosen.slot};this.choices.set(name,choice);return {facing,pose};
 }
 clear():void{this.targets=[];this.choices.clear();this.tick=null;this.chapter='';}
 inspect(){return {profile:NPC_ATTENTION.id,chapter:this.chapter,tick:this.tick,targets:this.targets.map(t=>({...t})),choices:[...this.choices].map(([name,c])=>({name,...c})),limit:NPC_ATTENTION.limit,directionalMovementEnabled:false,approved:false};}
}
