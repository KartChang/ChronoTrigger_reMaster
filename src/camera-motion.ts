import {SCREEN_UP} from './early-comfort';
import type {CameraBase,CameraFrame} from './early-comfort';

export const CAMERA_MOTION = Object.freeze({id:'vq01c-safe-camera-response',responseTicks:8,approved:false});
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const copy=(f:CameraFrame):CameraFrame=>({...f,bounds:{...f.bounds},actors:f.actors.map(a=>({...a}))});
// Exact identity of the framing request, including safety extents. A different
// actor, viewport, or constraint invalidates any reversible paused preference.
const sameTarget=(a:CameraFrame,b:CameraFrame):boolean=>
 a.x===b.x&&a.z===b.z&&a.half===b.half&&a.ratio===b.ratio&&a.active===b.active&&a.portrait===b.portrait&&
 a.bounds.left===b.bounds.left&&a.bounds.right===b.bounds.right&&a.bounds.top===b.bounds.top&&a.bounds.bottom===b.bounds.bottom&&
 a.actors.length===b.actors.length&&a.actors.every((v,i)=>{const w=b.actors[i]!;return v.id===w.id&&v.left===w.left&&v.right===w.right&&v.top===w.top&&v.bottom===w.bottom;});
/** Reproject the same world-space actor extents after a proposed camera movement.
 * Constraint correction has priority over easing. It never edits game actors.
 */
export function constrainCameraResponse(target:CameraFrame,proposed:CameraBase):CameraFrame{
 if(!target.active||!target.actors.length)return copy(target);
 const r=target.ratio,b=target.bounds;
 const actors=target.actors.map(a=>({id:a.id,
  left:target.x+(a.left-.5)*2*target.half*r,right:target.x+(a.right-.5)*2*target.half*r,
  top:target.z*SCREEN_UP.z+(.5-a.top)*2*target.half,bottom:target.z*SCREEN_UP.z+(.5-a.bottom)*2*target.half}));
 const left=Math.min(...actors.map(a=>a.left)),right=Math.max(...actors.map(a=>a.right));
 const top=Math.max(...actors.map(a=>a.top)),bottom=Math.min(...actors.map(a=>a.bottom));
 const half=Math.max(proposed.half,(right-left+.16)/(2*r*(b.right-b.left)),(top-bottom+.16)/(2*(b.bottom-b.top)));
 const x=clamp(proposed.x,right-2*half*r*(b.right-.5)+.08,left-2*half*r*(b.left-.5)-.08);
 const z=clamp(proposed.z,(top-2*half*(.5-b.top)+.08)/SCREEN_UP.z,(bottom-2*half*(.5-b.bottom)-.08)/SCREEN_UP.z);
 return {...target,x,z,half,bounds:{...b},actors:actors.map(a=>({id:a.id,
  left:.5+(a.left-x)/(2*half*r),right:.5+(a.right-x)/(2*half*r),
  top:.5-(a.top-z*SCREEN_UP.z)/(2*half),bottom:.5-(a.bottom-z*SCREEN_UP.z)/(2*half)}))};
}

/** A small presentation filter for the existing early camera; fixed simulation time, not render Hz.
 * Expansion is immediate to protect a separated party. Contraction/panning ease without overshoot.
 * Inactive maps, resize, story context changes, clock reset and reduced-motion preference snap safely.
 */
export class EarlyCameraMotion {
 private frame:CameraFrame|null=null;
 private tick:number|null=null;
 private context='';
 private reduced=false;
 private reason='initial';
 private lastTarget:CameraFrame|null=null;
 private frozenNormal:CameraFrame|null=null;
 reset():void{this.frame=null;this.tick=null;this.context='';this.reason='reset';this.lastTarget=null;this.frozenNormal=null;}
 update(ticks:number,context:string,target:CameraFrame,reducedMotion=false):CameraFrame{
  const valid=Number.isFinite(ticks)&&ticks>=0&&[target.x,target.z,target.half,target.ratio].every(Number.isFinite)&&target.half>0&&target.ratio>0;
  if(!valid){this.reset();throw new Error('Invalid early camera response input');}
  const old=this.frame;
  const sameFrozen=!!old&&target.active&&ticks===this.tick&&context===this.context&&!!this.lastTarget&&sameTarget(target,this.lastTarget);
  if(!sameFrozen)this.frozenNormal=null;
  // Preserve the actual eased frame only for a reversible same-tick preference
  // change. Reduced mode still snaps safely; resumed simulation keeps old policy.
  if(sameFrozen&&reducedMotion&&!this.reduced)this.frozenNormal=copy(old!);
  const restore=sameFrozen&&!reducedMotion&&this.reduced&&this.frozenNormal!==null;
  const snap=!old||!target.active||context!==this.context||ticks<this.tick!||target.ratio!==old.ratio||reducedMotion!==this.reduced||reducedMotion;
  const elapsed=this.tick===null?0:ticks-this.tick;
  this.context=context;this.tick=ticks;this.reduced=reducedMotion;
  if(restore){this.frame=copy(this.frozenNormal!);this.frozenNormal=null;this.reason='frozen-preference-restored';}
  else if(snap){this.frame=copy(target);this.reason=reducedMotion?'reduced-motion':!target.active?'outside-early-scene':'context-or-viewport';}
  else if(elapsed===0){this.frame=constrainCameraResponse(target,old);this.reason='same-simulation-tick';}
  else{
   const a=-Math.expm1(-elapsed/CAMERA_MOTION.responseTicks);
   const half=target.half>=old.half?target.half:old.half+(target.half-old.half)*a;
   this.frame=constrainCameraResponse(target,{x:old.x+(target.x-old.x)*a,z:old.z+(target.z-old.z)*a,half});
   this.reason='eased-and-safety-constrained';
  }
  this.lastTarget=copy(target);
  return copy(this.frame);
 }
 inspect(){return {profile:CAMERA_MOTION.id,tick:this.tick,context:this.context,reducedMotion:this.reduced,reason:this.reason,approved:false};}
}
