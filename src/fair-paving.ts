import type {Ink} from './hero-art';
import type {DynamicTexture} from '@babylonjs/core';
import {drawSurface} from './world-art';
import {fairStone,surfaceWorld} from './surface-layout';

/** Recompose the retained paving at human scale; this is not a new map or collision authority. */
export const FAIR_PAVING_PROFILE='vq01x-retained-plaza-composition';
export const PAVING_PROBES:readonly (readonly [number,number])[]=[[128,400],[256,400],[277,320],[190,335],[256,48],[22,300]];
export type PavingRegion='garden'|'edge-course'|'promenade'|'bell-border'|'bell-apron'|'field';
const mix=(a:string,b:string,t:number)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
export function pavingRegion(x:number,z:number):PavingRegion{
 if(!Number.isFinite(x)||!Number.isFinite(z))throw new Error('Invalid paving coordinate');
 if(!fairStone(x,z))return 'garden';
 const edge=Math.min(11.2-Math.abs(x),z+8,10.8-z);
 if(edge<.20)return 'edge-course';
 const bell=Math.hypot((x+3.5)*.88,z+.5);
 if(bell>2.66&&bell<2.86)return 'bell-border';
 if(bell<2.66)return 'bell-apron';
 if(Math.abs(x)<1.15||Math.abs(z+7.1)<.65)return 'promenade';
 return 'field';
}
/** Muted joints stop the repeated grid competing with character silhouettes. */
export function pavingColour(colour:string,region:PavingRegion):string{
 if(!/^#[0-9a-f]{6}$/i.test(colour))throw new Error('Retained painter must use RGB hex');
 if(region==='garden')return colour;
 const base=mix(colour,colour==='#817e67'?'#aaa592':'#b2b0a2',colour==='#817e67'?.46:.34);
 switch(region){
  case 'edge-course':return mix(base,'#939784',.23);
  case 'promenade':return mix(base,'#cebd9b',.22);
  case 'bell-border':return mix(base,'#828b7e',.32);
  case 'bell-apron':return mix(base,'#c1b9a6',.16);
  default:return base;
 }
}
/** Same 512-square GPU texture; virtual 2x painter density, not a 1024-square allocation.
 * Garden pixels, cardinal orientation and the existing fairStone mask are retained exactly.
 */
export function drawFairPlaza(c:Ink,width=512,height=512):void{
 if(width!==512||height!==512)throw new Error('Fair plaza requires the retained 512-square texture');
 drawSurface(c,width,height,'fair');
 const colours=new Map<string,string>();
 const dense:Ink={fillStyle:'#000000',clearRect(){throw new Error('Unexpected retained-painter clear');},fillRect(px,py,w,h){
  const p=surfaceWorld(px,py,width*2,height*2,'fair');
  if(!fairStone(p.x,p.z))return; // Do not turn the saved grass accents into paving.
  const x=Math.floor(px/2),y=Math.floor(py/2),rw=Math.max(1,Math.ceil(w/2)),rh=Math.max(1,Math.ceil(h/2));
  for(let dy=y;dy<Math.min(height,y+rh);dy++)for(let dx=x;dx<Math.min(width,x+rw);dx++){
   // The original painter stamps 2x2 pixels; match that mask, including its boundary texels.
   const mask=surfaceWorld(Math.floor(dx/2)*2,Math.floor(dy/2)*2,width,height,'fair');
   if(!fairStone(mask.x,mask.z))continue;
   const world=surfaceWorld(dx,dy,width,height,'fair');
   const region=pavingRegion(world.x,world.z),key=String(this.fillStyle)+'/'+region;
   let colour=colours.get(key);if(!colour){colour=pavingColour(String(this.fillStyle),region);colours.set(key,colour);}
   c.fillStyle=colour;c.fillRect(dx,dy,1,1);
  }
 }};
 drawSurface(dense,width*2,height*2,'fair');
}
/** Small live CPU-canvas strips, never a fabricated pass bit or a per-frame GPU readback.
 * This is used by the existing read-only observation API, not by draw().
 */
export function inspectFairPlaza(texture:DynamicTexture){
 const ctx=texture.getContext();
 return {profile:FAIR_PAVING_PROFILE,source:'actual-fair-paving-canvas',approved:false,
  texture:texture.name,width:texture.getSize().width,height:texture.getSize().height,
  samples:PAVING_PROBES.map(([x,y])=>({x,y,rgba:Array.from(ctx.getImageData(x,y,16,1).data)}))};
}
