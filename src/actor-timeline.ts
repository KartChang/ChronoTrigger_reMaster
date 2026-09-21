import {PosePlayer} from './pose-player';
import type {TimedPose,PoseSample} from './pose-player';
import {ambientFrame,readyFrame} from './actor-motion';
export const ACTOR_TIMELINE_PROFILE='vq02c-tick-and-distance-playback';
export type ActorStep=Readonly<{x:number;z:number;scale:number;seed:number;reducedMotion:boolean}>;
type FrameRecord=PoseSample&{tick:number;distance:number;cycle:number};
/** Presentation only. Travel is measured from the existing actor position; this
 * never moves an actor, advances ATB or changes a save. Retained clips are reused. */
export class ActorTimeline {
 private poses=new PosePlayer();
 private previous:(ActorStep&{tick:number;walking:boolean})|null=null;
 private distance=0;
 private records:FrameRecord[]=[];
 private current:FrameRecord|null=null;
 trigger(pose:TimedPose,tick:number){this.validTick(tick);this.poses.trigger(pose,tick/60);}
 reset(){this.poses.reset();this.previous=null;this.distance=0;this.records=[];this.current=null;}
 private validTick(tick:number){if(!Number.isSafeInteger(tick)||tick<0)throw Error('Invalid actor tick');}
 sample(tick:number,walking:boolean,battle:boolean,step:ActorStep):PoseSample {
  this.validTick(tick);
  if(!Number.isFinite(step.x)||!Number.isFinite(step.z)||!Number.isFinite(step.scale)||step.scale<=0||!Number.isSafeInteger(step.seed)||typeof step.reducedMotion!=='boolean')throw Error('Invalid actor step');
  if(this.previous&&tick<this.previous.tick)this.reset();
  const last=this.previous,cycle=1.85*step.scale;
  // A teleport, map scale change or stopped actor does not synthesize footsteps.
  if(!walking||!last||!last.walking||last.scale!==step.scale)this.distance=0;
  else if(tick>last.tick){
   const travel=Math.hypot(step.x-last.x,step.z-last.z);
   if(travel>4*step.scale)this.distance=0;else this.distance+=travel;
  }
  this.previous={...step,tick,walking};
  let result=this.poses.sample(tick/60,walking,battle);
  if(result.pose==='walk')result={pose:'walk',frame:Math.floor((this.distance+1e-10)/cycle*4)%4};
  else if(result.pose==='idle')result={pose:'idle',frame:step.reducedMotion?0:ambientFrame(tick,step.seed)};
  else if(result.pose==='ready')result={pose:'ready',frame:step.reducedMotion?0:readyFrame(tick+step.seed*37)};
  const record={...result,tick,distance:this.distance,cycle};
  if(!this.current||result.pose!==this.current.pose||result.frame!==this.current.frame){this.records.push(record);if(this.records.length>24)this.records.shift();}
  this.current=record;
  return result;
 }
 inspect(){return {profile:ACTOR_TIMELINE_PROFILE,clock:'simulation-ticks',reducedMotion:this.previous?.reducedMotion??false,current:this.current?{...this.current}:null,history:this.records.map(r=>({...r})),stateMutation:false};}
}
export function victoryFrame(tick:number,reducedMotion:boolean){return reducedMotion?0:Math.floor(tick/15)%4;}
