import {ambientFrame,readyFrame} from './actor-motion';
import {CLIP_MS} from './hero-art';
import type {HeroPose} from './hero-art';
export type TimedPose=keyof typeof CLIP_MS;
export type PoseSample={pose:HeroPose;frame:number};
/** Presentation clock only. Pausing is represented by not advancing `now`. */
export class PosePlayer {
 private active:{pose:TimedPose;start:number}|null=null;
 trigger(pose:TimedPose,now:number):void{if(!Number.isFinite(now)||now<0)throw new Error('Invalid presentation time');this.active={pose,start:now};}
 reset():void{this.active=null;}
 sample(now:number,walking:boolean,battle=false):PoseSample{
  if(!Number.isFinite(now)||now<0)throw new Error('Invalid presentation time');
  if(this.active){
   const ms=Math.max(0,now-this.active.start)*1000,durations=CLIP_MS[this.active.pose];let edge=0;
   for(let i=0;i<durations.length;i++){edge+=durations[i]!;if(ms<edge)return{pose:this.active.pose,frame:i};}
   this.active=null;
  }
  return {pose:walking?'walk':battle?'ready':'idle',frame:walking?Math.floor(now*8)%4:battle?readyFrame(now*60):ambientFrame(now*60)};
 }
}
