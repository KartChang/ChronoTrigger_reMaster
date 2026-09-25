import type {Ink} from './hero-art';
import {noise} from './surface-layout';
/** Authored static replacement textures. Not original game pixels or approved assets. */
export const CANYON_ART={id:'vq03k-quiet-canyon',floor:{width:512,height:448},rock:{width:64,height:64},turf:{width:64,height:64},approved:false,romPixels:false} as const;
/** Keep the existing painted path silhouette; this never defines collision/navigation. */
export function canyonPathBounds(y:number):{left:number;right:number}{
 const center=255+Math.sin(y*.019)*38,half=62+Math.sin(y*.05)*13;
 return {left:center-half,right:center+half};
}
function field(x:number,y:number,seed:number):number{
 const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
 const a=noise(ix,iy,seed)*(1-fx)+noise(ix+1,iy,seed)*fx;
 const b=noise(ix,iy+1,seed)*(1-fx)+noise(ix+1,iy+1,seed)*fx;
 return a*(1-fy)+b*fy;
}
const rect=(c:Ink,x:number,y:number,w:number,h:number,color:string):void=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
/** Broad low-contrast moss and uninterrupted earth, with sparse grouped edge blades. */
export function drawCanyonFloor(c:Ink):void{
 const moss=['#43543c','#4a5b40','#526145','#58674a'] as const;
 const earth=['#817253','#867756','#8d7d5b'] as const;
 for(let y=0;y<448;y+=2){
  const bounds=canyonPathBounds(y);
  for(let x=0;x<512;x+=2){
   const v=field(x/47,y/39,603),path=x>=bounds.left&&x<bounds.right;
   const color=path?earth[Math.min(2,Math.floor(v*3))]!:moss[Math.min(3,Math.floor(v*4))]!;
   rect(c,x,y,2,2,color);
  }
 }
 for(let i=0;i<220;i++){
  const x=2+Math.floor(noise(i,17,603)*505),y=3+Math.floor(noise(i,31,603)*440),p=canyonPathBounds(y);
  if(x>p.left-10&&x<p.right+10)continue;
  rect(c,x,y,4,1,'#63704d');rect(c,x+1,y-2,1,2,'#63704d');rect(c,x-1,y+1,5,1,'#4a583e');
 }
 // A few embedded stones at the path margin, never a repeating stripe across the lane.
 for(let i=0;i<24;i++){
  const y=8+Math.floor(noise(i,43,603)*428),p=canyonPathBounds(y);
  const x=Math.floor(i%2?p.left+5:p.right-9);
  rect(c,x,y,5,2,'#7a7057');rect(c,x+1,y,3,1,'#958469');
 }
}
/** Uneven sediment bands and open fissures instead of a regular brick grid. */
export function drawCanyonRock(c:Ink):void{
 const bands=['#63604f','#696552','#726b57','#676350','#77705b'] as const;
 for(let y=0;y<64;y++)for(let x=0;x<64;x+=2){
  const bend=Math.round(Math.sin(x*.065)*2+Math.sin(x*.16+1));
  const band=Math.floor((y+bend+7)/13)%bands.length;
  rect(c,x,y,2,1,bands[band]!);
 }
 for(const [base,color] of [[12,'#555748'],[27,'#5d5b4b'],[43,'#535546'],[57,'#625e4c']] as const){
  for(let x=0;x<64;x+=2){
   const y=base+Math.round(Math.sin(x*.065)*2+Math.sin(x*.16+1));
   rect(c,x,y,2,1,color);
   if(x%12<8)rect(c,x,y+1,2,1,'#7a735e');
  }
 }
 for(const [x,y,length,sign] of [[18,6,13,1],[49,30,10,-1],[30,46,12,1]]){
  for(let i=0;i<length!;i++)rect(c,x!+sign!*Math.floor(i/4),y!+i,1,1,'#585849');
 }
}
/** One shared 64x64 texture on the existing turf caps; no new decoration geometry. */
export function drawCanyonTurf(c:Ink):void{
 const colors=['#465a3e','#4e6142','#566848'] as const;
 for(let y=0;y<64;y+=2)for(let x=0;x<64;x+=2)
  rect(c,x,y,2,2,colors[Math.min(2,Math.floor(field(x/23,y/19,604)*3))]!);
 for(let i=0;i<16;i++){
  const x=2+Math.floor(noise(i,61,604)*58),y=3+Math.floor(noise(i,71,604)*56);
  rect(c,x,y,3,1,'#68764f');rect(c,x+1,y-1,1,1,'#68764f');
 }
}
