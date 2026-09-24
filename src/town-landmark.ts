import {frameTownActors,townPortrait} from './town-camera';
import type {CameraBase,ComfortActor} from './early-comfort';

/** Optional landmarks may add context, but may not force an otherwise readable party to shrink.
 * Hysteresis is geometric, not a timer. Camera easing and separated-party safety remain upstream.
 */
export const TOWN_LANDMARK=Object.freeze({id:'vq03b-party-first-landmark',enterExpansion:1.5,exitExpansion:1.6,approved:false});
export class TownLandmark {
 private retained=false;
 private observation:Record<string,unknown>={profile:TOWN_LANDMARK.id,active:false,approved:false};
 reset():void{this.retained=false;this.observation={profile:TOWN_LANDMARK.id,active:false,approved:false};}
 select(chapter:string,ratio:number,base:CameraBase,subjects:readonly ComfortActor[]):boolean{
  if(!townPortrait(chapter,ratio)){this.reset();return false;}
  const party=subjects.filter(s=>s.id!=='inn-sign'),landmark=subjects.filter(s=>s.id==='inn-sign');
  if(!party.some(s=>s.id==='p0')){this.reset();return false;}
  const partyHalf=frameTownActors(chapter,ratio,base,party).half;
  const withLandmarkHalf=frameTownActors(chapter,ratio,base,subjects).half;
  const wasRetained=this.retained,limit=wasRetained?TOWN_LANDMARK.exitExpansion:TOWN_LANDMARK.enterExpansion;
  this.retained=landmark.length===1&&withLandmarkHalf<=partyHalf*limit;
  this.observation={profile:TOWN_LANDMARK.id,active:true,approved:false,ratio,wasRetained,retained:this.retained,limit,partyHalf,withLandmarkHalf,
   candidates:subjects.map(s=>({...s}))};
  return this.retained;
 }
 inspect(){return structuredClone(this.observation);}
}
