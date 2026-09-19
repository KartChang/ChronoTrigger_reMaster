/** Early-scene presentation only. These bounds neither move actors nor relax collisions. */
export const EARLY_COMFORT = Object.freeze({
 id:'vq01b-readable-actors', approved:false,
 chapters:['bedroom','home','fair'] as readonly string[],
 cameraHeight:23, cameraBack:26, portraitThreshold:.85,
 minimumPortraitHalf:{room:6.2,fair:7.2},
 insets:{left:.045,right:.045,top:.12,bottom:.20},
 fadeVisibility:.30, fadeTicks:9, clearHoldTicks:12,
});
export type GroundPoint=Readonly<{x:number;z:number}>;
export type ComfortActor=GroundPoint & Readonly<{id:string;halfWidth:number;height:number;groundY:number}>;
export type CameraBase=Readonly<{x:number;z:number;half:number}>;
export type CameraFrame={x:number;z:number;half:number;ratio:number;active:boolean;portrait:boolean;bounds:{left:number;right:number;top:number;bottom:number};actors:{id:string;left:number;right:number;top:number;bottom:number}[]};
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const length=Math.hypot(EARLY_COMFORT.cameraHeight,EARLY_COMFORT.cameraBack);
export const SCREEN_UP=Object.freeze({x:0,y:EARLY_COMFORT.cameraBack/length,z:EARLY_COMFORT.cameraHeight/length});
const finiteActor=(a:ComfortActor)=>[a.x,a.z,a.halfWidth,a.height,a.groundY].every(Number.isFinite)&&a.height>0&&a.halfWidth>0;
/** Keep whole visible actors inside reserved UI margins. Portrait pans instead of shrinking a solo room to an icon.
 * The miniature overworld and later chapters deliberately retain their existing camera policies.
 */
export function frameEarlyActors(chapter:string,ratio:number,base:CameraBase,actors:readonly ComfortActor[],battle=false):CameraFrame{
 const r=Number.isFinite(ratio)&&ratio>0?ratio:1;
 const clean=actors.filter(finiteActor),active=EARLY_COMFORT.chapters.includes(chapter)&&clean.length>0;
 const portrait=active&&r<EARLY_COMFORT.portraitThreshold;
 let half=base.half,x=base.x,z=base.z;
 const inset={...EARLY_COMFORT.insets,bottom:battle?.36:EARLY_COMFORT.insets.bottom};
 if(active){
  const left=Math.min(...clean.map(a=>a.x-a.halfWidth)),right=Math.max(...clean.map(a=>a.x+a.halfWidth));
  const bottom=Math.min(...clean.map(a=>a.z*SCREEN_UP.z+a.groundY*SCREEN_UP.y-.06));
  const top=Math.max(...clean.map(a=>a.z*SCREEN_UP.z+a.groundY*SCREEN_UP.y+a.height));
  if(portrait){half=Math.min(half,chapter==='fair'?EARLY_COMFORT.minimumPortraitHalf.fair:EARLY_COMFORT.minimumPortraitHalf.room);x=(left+right)/2;z=(top+bottom)/(2*SCREEN_UP.z);}
  // Separation, not a hard zoom cap, determines the minimum needed for both human players.
  half=Math.max(half,(right-left+.24)/(2*r*(1-inset.left-inset.right)),(top-bottom+.24)/(2*(1-inset.top-inset.bottom)));
  if(chapter!=='fair'){const limit=Math.max(0,6-half*r);x=clamp(x,-limit,limit);}
  const l=-half*r*(1-2*inset.left),rr=half*r*(1-2*inset.right),b=-half*(1-2*inset.bottom),t=half*(1-2*inset.top);
  x=clamp(x,right-rr+.08,left-l-.08);
  z=clamp(z,(top-t+.08)/SCREEN_UP.z,(bottom-b-.08)/SCREEN_UP.z);
 }
 const bounds={left:inset.left,right:1-inset.right,top:inset.top,bottom:1-inset.bottom};
 return {x,z,half,ratio:r,active,portrait,bounds,actors:active?clean.map(a=>{
  const feet=(a.z-z)*SCREEN_UP.z+a.groundY*SCREEN_UP.y;
  return {id:a.id,left:.5+(a.x-a.halfWidth-x)/(2*half*r),right:.5+(a.x+a.halfWidth-x)/(2*half*r),top:.5-(feet+a.height)/(2*half),bottom:.5-(feet-.06)/(2*half)};
 }):[]};
}
/** Exact texture-foot pivot, including a changed camera up vector. No artificial Y-only lift. */
export function billboardCenter(foot:Readonly<{x:number;y:number;z:number}>,up:Readonly<{x:number;y:number;z:number}>,height:number,pivotY=62,cellHeight=64){
 if(![foot.x,foot.y,foot.z,up.x,up.y,up.z,height,pivotY,cellHeight].every(Number.isFinite)||height<=0||cellHeight<=0||pivotY<0||pivotY>cellHeight)throw new Error('Invalid billboard anchor');
 const n=Math.hypot(up.x,up.y,up.z);if(n<1e-9)throw new Error('Missing camera up');
 const shift=height*(pivotY/cellHeight-.5)/n;
 return {x:foot.x+up.x*shift,y:foot.y+up.y*shift,z:foot.z+up.z*shift};
}
/** Analytic response: splitting the same simulated time into frames yields the same opacity. */
export function approachVisibility(current:number,target:number,ticks:number):number{
 if(![current,target,ticks].every(Number.isFinite))return 1;
 if(ticks<=0)return current;
 const value=target+(current-target)*Math.exp(-ticks/EARLY_COMFORT.fadeTicks);
 return Math.abs(value-target)<.001?target:clamp(value,0,1);
}
