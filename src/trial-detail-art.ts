import type {Ink} from './hero-art';
import {drawWoodlandOak} from './woodland-art';
/** Static, authored variations for the existing 1000AD cards; no time or game state. */
export const TRIAL_DETAIL_ART={id:'vq03j-static-detail',oak:{width:64,height:80,variants:4},dais:{width:128,height:160},approved:false,romPixels:false} as const;
type Lobe=readonly [number,number,number,number];
const crowns:readonly (readonly Lobe[])[]=[
 [[17,30,15,13],[32,17,16,15],[48,30,14,12],[27,41,16,12],[45,43,13,9],[12,40,10,9]],
 [[19,22,14,12],[37,15,14,13],[48,31,13,13],[28,35,17,14],[13,37,11,10],[44,45,12,8]],
 [[13,31,11,12],[29,21,17,16],[48,27,13,12],[21,42,15,10],[43,40,16,12],[34,46,12,7]],
 [[19,30,16,15],[39,18,15,16],[51,37,11,10],[34,39,16,13],[13,44,10,8],[44,46,12,7]]
];
const palettes=[['#466344','#5e794e','#7e9159'],['#425e44','#58754e','#758958'],['#4b6545','#607a4e','#82925c'],['#405e46','#56714f','#74875a']] as const;
export function drawTrialOak(c:Ink,variant:number):void{
 if(!Number.isInteger(variant)||variant<0||variant>=4)throw new RangeError('Unknown trial oak variation');
 // Variant zero remains the exact accepted oak. All variants retain its contact row and roots.
 drawWoodlandOak(c);if(variant===0)return;
 c.clearRect(0,0,64,54);
 const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 for(let y=31;y<54;y++){r(27,y,11,1,'#303e36');r(29,y,4,1,'#716449');r(35,y,2,1,'#4e4e3b');}
 for(let y=38;y<54;y++){const d=Math.floor((59-y)*.52);r(29-d,y,4,1,'#4e4e3b');r(30-d,y,1,1,'#98805a');r(35+d,y,3,1,'#716449');}
 const lobe=(cx:number,cy:number,rx:number,ry:number,color:string)=>{
  for(let y=-ry;y<=ry;y++){const half=Math.floor(rx*Math.sqrt(Math.max(0,1-y*y/(ry*ry))));const notch=(y+ry)%7===0?1:0;r(cx-half+notch,cy+y,Math.max(1,half*2+1-notch*2),1,color);}
 };
 const mass=crowns[variant]!,p=palettes[variant]!;
 for(const [x,y,rx,ry] of mass)lobe(x,y,rx,ry,'#303e36');
 for(const [x,y,rx,ry] of mass){lobe(x,y-1,rx-2,ry-2,p[0]);lobe(x-2,y-3,rx-4,Math.max(2,ry-5),p[1]);}
 // The upper-left light stays consistent: silhouettes vary, lighting is never mirrored.
 for(const [x,y,rx,ry] of mass)lobe(x-3,y-5,Math.max(3,rx-7),Math.max(2,ry-8),p[2]);
}
/** Packed opaque atlas: top 128x128, side strip 128x32. Broad low-contrast stone, not noisy speckle. */
export function drawCourtDais(c:Ink):void{
 c.clearRect(0,0,128,160);
 const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 r(0,0,128,128,'#666b60');
 for(let y=0,row=0;y<128;y+=16,row++)for(let x=-24+(row%2)*16;x<128;x+=32){const left=Math.max(0,x),right=Math.min(128,x+31),bottom=Math.min(128,y+15);if(right>left){r(left,y,right-left,bottom-y,(row+Math.floor((x+24)/32))%3?'#707568':'#767a6c');r(left,y,right-left,1,'#7c8070');}}
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const d=(x-63.5)**2+(y-63.5)**2;if(d>=55**2&&d<58**2)r(x,y,1,1,'#85826a');else if(d>=58**2&&d<59**2)r(x,y,1,1,'#5e6459');}
 // Side UVs never sample the cap: a shallow bevel and broad courses, with two-pixel padding.
 r(0,128,128,32,'#5b625a');r(0,131,128,3,'#898872');r(0,134,128,2,'#737a68');r(0,155,128,3,'#454f49');
 for(let x=0;x<128;x+=16)r(x,137,1,17,'#505a52');
}
