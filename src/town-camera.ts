import {SCREEN_UP} from './early-comfort';
import type {CameraBase,CameraFrame,ComfortActor} from './early-comfort';
import {constrainCameraResponse} from './camera-motion';

/** Presentation-only framing for the existing Truce scene. No actor/mesh/state edits. */
export const TOWN_CAMERA=Object.freeze({id:'vq02x-town-portrait',portraitThreshold:.85,minimumHalf:7.2,landmarkRange:13,approved:false});
export const townPortrait=(chapter:string,ratio:number)=>chapter==='truce'&&Number.isFinite(ratio)&&ratio>0&&ratio<TOWN_CAMERA.portraitThreshold;
/** Fit actual projected plane extents, including a nearby inn and both human players.
 * A separated party expands immediately through the existing safety filter. No zoom
 * ceiling is used to crop the second player. Other maps and landscape keep their base.
 */
export function frameTownActors(chapter:string,ratio:number,base:CameraBase,subjects:readonly ComfortActor[]):CameraFrame{
 const r=Number.isFinite(ratio)&&ratio>0?ratio:1;
 const bounds={left:.045,right:.955,top:.12,bottom:.80};
 const clean=subjects.filter(a=>[a.x,a.z,a.halfWidth,a.height,a.groundY].every(Number.isFinite)&&a.halfWidth>0&&a.height>0);
 const active=townPortrait(chapter,ratio)&&clean.some(a=>a.id==='p0');
 if(!active)return {...base,ratio:r,active:false,portrait:false,bounds,actors:[]};
 const left=Math.min(...clean.map(a=>a.x-a.halfWidth)),right=Math.max(...clean.map(a=>a.x+a.halfWidth));
 const top=Math.max(...clean.map(a=>a.z*SCREEN_UP.z+a.groundY*SCREEN_UP.y+a.height));
 const bottom=Math.min(...clean.map(a=>a.z*SCREEN_UP.z+a.groundY*SCREEN_UP.y-.06));
 const half=TOWN_CAMERA.minimumHalf,x=(left+right)/2,z=(top+bottom)/(2*SCREEN_UP.z);
 const target:CameraFrame={x,z,half,ratio:r,active:true,portrait:true,bounds,actors:clean.map(a=>{
  const feet=(a.z-z)*SCREEN_UP.z+a.groundY*SCREEN_UP.y;
  return {id:a.id,left:.5+(a.x-a.halfWidth-x)/(2*half*r),right:.5+(a.x+a.halfWidth-x)/(2*half*r),top:.5-(feet+a.height)/(2*half),bottom:.5-(feet-.06)/(2*half)};
 })};
 return constrainCameraResponse(target,target);
}
