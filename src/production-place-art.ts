import {noise,surfaceWorld} from './surface-layout';
import {woodlandPath} from './woodland-art';
import {KINGDOM_SOLIDS} from './kingdom-data';
/** Authored environmental layers. The town base and its diagnostic pixels stay real;
 * this transparent verge is an additional ground surface, not a replacement sampler. */
export const PLACE_ART=Object.freeze({id:'vq04f-town-court-craft',approved:false,dimensions:{'town-verge':[384,352],'court-oak':[128,128],'court-seat':[128,64],'court-velvet':[64,64]} as const});
export type PlaceSurface=keyof typeof PLACE_ART.dimensions;
export function paintPlaceSurface(kind:PlaceSurface){
 if(!Object.hasOwn(PLACE_ART.dimensions,kind))throw new Error('Unknown place surface');
 const [width,height]=PLACE_ART.dimensions[kind],rgba=new Uint8ClampedArray(width*height*4);
 const put=(x:number,y:number,c:readonly number[])=>{if(x<0||x>=width||y<0||y>=height)return;const i=(y*width+x)*4;rgba[i]=c[0]!;rgba[i+1]=c[1]!;rgba[i+2]=c[2]!;rgba[i+3]=255;};
 if(kind==='town-verge'){
  const path=(x:number,y:number)=>woodlandPath(x,y,width,height,'truce');
  for(let y=2;y<height-2;y++)for(let x=2;x<width-2;x++){
   const on=path(x,y),n=noise(Math.floor(x/3),Math.floor(y/3),704),r=2+Math.floor(n*4);
   const edge=path(x-r,y)!==on||path(x+r,y)!==on||path(x,y-r)!==on||path(x,y+r)!==on;
   // Broken edges retain a broad quiet route; there are no invented exits or obstacles.
   if(edge){const grit=noise(x,y,705);if(on&&grit<.57)put(x,y,n<.4?[131,127,84]:[150,142,96]);else if(!on&&grit<.68)put(x,y,n<.5?[106,121,77]:[151,142,97]);}
   const {x:wx,z}=surfaceWorld(x,y,width,height,'forest');
   for(const h of KINGDOM_SOLIDS.truce){
    const front=h.z-h.d/2,side=Math.abs(wx-h.x);
    // Flush limestone thresholds and muted contact soil follow existing house footprints.
    if(side<.70&&z<front-.06&&z>front-.43){const joint=(x+Math.floor(y/5)*3)%9===0||y%5===0;put(x,y,joint?[106,107,80]:noise(Math.floor(x/9),Math.floor(y/5),709)<.5?[172,165,124]:[158,153,113]);}
    else if(side<h.w/2+.10&&side>h.w/2-.04&&z>front&&z<h.z+h.d/2)put(x,y,[96,109,70]);
   }
  }
  for(let i=0;i<115;i++){
   const y=7+Math.floor(noise(i,19,713)*(height-14)),x=(i%2?164:213)+Math.floor(noise(i,27,713)*7);
   if(!path(x,y))continue;put(x,y,[150,142,104]);put(x+1,y,[166,154,116]);if(i%3===0)put(x+2,y+1,[141,137,96]);
  }
 }else{
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   if(kind==='court-velvet'){
    const weave=(x+2*y)%5===0?5:0,nap=Math.floor(noise(Math.floor(x/8),Math.floor(y/8),721)*7);
    put(x,y,[106+nap+weave,43+nap,48+nap]);
   }else if(kind==='court-seat'){
    const seam=y%16,grain=Math.floor(noise(Math.floor(x/19),y,723)*9),v=seam===0?-16:seam===1?10:0;
    put(x,y,[111+grain+v,78+grain+v,46+Math.floor(grain/2)+v]);
   }else{
    const bend=Math.round(Math.sin(y*.045+x*.07)*2),line=(x+bend+128)%13,grain=Math.floor(noise(x,Math.floor(y/15),725)*8),v=line===0?-14:line===1?7:0;
    put(x,y,[103+grain+v,66+grain+v,39+Math.floor(grain/2)+v]);
   }
  }
 }
 return {width,height,rgba};
}
