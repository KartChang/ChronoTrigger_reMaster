import type {Ink} from './hero-art';
import {noise,fairStone,surfaceWorld} from './surface-layout';
/** VQ01 authored surface palette. These are review assets, not sampled game images. */
export const EARLY_ART={id:'vq01-warm-house-festival',approved:false,romPixels:false} as const;
const mix=(a:string,b:string,t:number)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
/** Long, staggered boards. Sunlight is a continuous colour field, never striped scanlines. */
export function drawHomeFloor(c:Ink,w=384,h=352):void{
 const boards=['#947352','#997955','#8e6e50','#9e7b58','#927352'];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const col=Math.floor(x/24),offset=Math.floor(noise(col,1,43)*72),row=Math.floor((y+offset)/88),ry=(y+offset)%88,rx=x%24;
  const n=noise(col,row,91);let color=boards[Math.floor(n*boards.length)]!;
  if(rx===0||ry===0)color='#765940';else if(rx===1||ry===1)color=mix(color,'#c0a277',.3);
  // Occasional grain segments; no high-frequency identical stripes across every board.
  if(rx===6+Math.floor(n*8)&&ry>23&&ry<48&&n>.58)color=mix(color,'#61472f',.14);
  if(ry===80&&(rx===4||rx===19))color='#7f6247';
  const edge=Math.min(x,w-1-x,y,h-1-y);color=mix(color,'#453e34',Math.max(0,1-edge/22)*.28);
  const depth=y/h,left=w*(.40-.16*depth),right=w*(.62+.05*depth);
  if(y<h*.7&&x>left&&x<right){const feather=Math.min(1,(x-left)/10,(right-x)/10,(h*.7-y)/20);color=mix(color,'#e2c895',Math.max(0,feather)*.19);}
  c.fillStyle=color;c.fillRect(x,y,1,1);
 }
}
/** A broad paving vocabulary with muted grout and irregular repairs, not a repeated brick wallpaper. */
export function drawFairPaving(c:Ink,w:number,h:number):void{
 const stones=['#aaa084','#b5a98c','#a59c83','#b0a68c','#beb095'];
 for(let py=0;py<h;py+=2)for(let px=0;px<w;px+=2){
  const {x,z}=surfaceWorld(px,py,w,h,'fair');let color:string;
  if(fairStone(x,z)){
   const row=Math.floor(py/18),offset=Math.floor(noise(row,7)*15),xx=px+offset,cell=Math.floor(xx/26),rx=xx%26,ry=py%18;
   const n=noise(cell,row,341);color=stones[Math.floor(n*stones.length)]!;
   if(rx<2||ry<2)color='#817e67';else if(ry<4&&rx>3)color=mix(color,'#dbca9c',.23);else if(ry>15)color=mix(color,'#686a56',.2);
   // Main promenade is subtly warmer; the garden boundary remains the shared original shape.
   if(Math.abs(x)<1.15||z< -6.7)color=mix(color,'#cab78e',.13);
   if(noise(Math.floor(px/4),Math.floor(py/4),81)>.984)color=mix(color,'#737762',.25);
  }else{
   const broad=noise(Math.floor(px/22),Math.floor(py/20),600),n=noise(px,py);
   color=broad>.55?'#647c4c':'#5c7549';if(n>.88)color='#788853';else if(n<.08)color='#546f45';
  }
  c.fillStyle=color;c.fillRect(px,py,2,2);
 }
 // Small, clustered foliage accents only outside the shared paved area.
 for(let i=0;i<180;i++){const px=Math.floor(noise(i,6)*w),py=Math.floor(noise(i,7)*h),p=surfaceWorld(px,py,w,h,'fair');if(fairStone(p.x,p.z))continue;c.fillStyle=i%8?'#91a063':'#cfb784';c.fillRect(px,py,2,2);if(i%3===0)c.fillRect(px+2,py-2,1,2);}
}
export type EarlyPropArt='rug'|'curtain'|'quilt'|'sign'|'wall-print';
export const EARLY_PROP_IDS:readonly EarlyPropArt[]=['rug','curtain','quilt','sign','wall-print'];
export function drawEarlyProp(c:Ink,kind:EarlyPropArt,w=128,h=128):void{
 c.clearRect(0,0,w,h);
 const rect=(x:number,y:number,ww:number,hh:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,Math.max(0,ww),Math.max(0,hh));};
 if(kind==='rug'){
  rect(1,2,w-2,h-4,'#665c4b');rect(4,5,w-8,h-10,'#a2916d');rect(7,8,w-14,h-16,'#52695f');rect(10,11,w-20,h-22,'#6d8070');
  for(let x=10;x<w-10;x+=12){rect(x,8,5,2,'#c0b187');rect(x,h-10,5,2,'#c0b187');}
  for(let y=12;y<h-12;y+=12){rect(7,y,2,5,'#c0b187');rect(w-9,y,2,5,'#c0b187');}
  for(let y=24;y<h-18;y+=28)for(let x=22;x<w-18;x+=28)for(let k=0;k<9;k++){const half=4-Math.abs(4-k);rect(x-half,y+k,half*2+1,1,k%2?'#9b9f79':'#abb18a');}
  for(let x=3;x<w-3;x+=4){rect(x,0,1,3,'#b2a181');rect(x,h-3,1,3,'#b2a181');}
 }else if(kind==='curtain'){
  for(let x=0;x<w;x++){const t=(Math.sin(x/w*Math.PI*8)+1)/2;rect(x,0,1,h,mix('#9f9a7d','#d1c7a4',t*.7));}
  rect(0,4,w,2,'#b7ae8e');rect(0,h-8,w,3,'#a39170');rect(0,h-4,w,1,'#d6c8a3');
 }else if(kind==='quilt'){
  rect(0,0,w,h,'#aa7567');
  for(let y=0;y<h;y+=16)for(let x=0;x<w;x+=16){rect(x+1,y+1,14,14,(x/16+y/16)%2?'#b58674':'#a67768');rect(x+2,y+2,12,1,'#c49d84');}
  rect(0,0,w,9,'#d5c6a5');rect(0,h-7,w,7,'#815a53');rect(4,8,3,h-15,'#c9b28b');rect(w-7,8,3,h-15,'#c9b28b');
 }else if(kind==='sign'){
  rect(0,0,w,h,'#564635');rect(3,3,w-6,h-6,'#ba9b68');rect(5,5,w-10,h-10,'#856847');
  // An authored sun/leaf emblem, not illegible text painted into a world texture.
  const cx=Math.floor(w/2),cy=Math.floor(h/2);for(let y=-18;y<=18;y++)for(let x=-18;x<=18;x++)if(x*x+y*y<18*18)rect(cx+x,cy+y,1,1,x+y<0?'#d7c18b':'#b49a64');
  rect(cx-3,cy+12,6,17,'#d7c18b');rect(cx-18,cy+22,36,3,'#d7c18b');
 }else{
  rect(0,0,w,h,'#6c513b');rect(4,4,w-8,h-8,'#b99d72');rect(9,9,w-18,h-18,'#849c99');
  for(let y=Math.floor(h*.35);y<h-10;y++)for(let x=10;x<w-10;x++){const ridge=h*.54-Math.sin(x*.07)*h*.15;if(y>ridge)rect(x,y,1,1,y>h*.74?'#8b9b72':'#647f74');}
  rect(Math.floor(w*.67),Math.floor(h*.21),12,12,'#d8c598');rect(9,h-18,w-18,8,'#adac87');
 }
}
