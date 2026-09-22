import type {Ink} from './hero-art';
import {noise,surfaceWorld} from './surface-layout';
/** Authored 600-era surfaces only. No changes to collision, world scale or held home art. */
export const WOODLAND_ART={id:'vq02r-clustered-woodland',ground:{width:384,height:352},oak:{width:64,height:80},fern:{width:24,height:32},approved:false,romPixels:false} as const;
export type WoodlandKind='truce'|'forest';
const groundColors={forest:['#344e40','#3c5845','#48634a','#536c4e'],truce:['#62784e','#6a8053','#748957','#7e915e']} as const;
/** Preserve the existing painted route predicates, including the forest's west spur. */
export function woodlandPath(px:number,py:number,width:number,height:number,kind:WoodlandKind):boolean{
 if(kind==='truce')return (px>=162&&px<222)||(px>=75&&px<213&&py>=93&&py<119)||(px>=80&&px<328&&py>=253&&py<287);
 const {x,z}=surfaceWorld(px,py,width,height,'forest');
 const centre=Math.sin(z*.43)*.5+Math.sin(z*1.7)*.16;
 return Math.abs(x-centre)<.75+noise(Math.floor(py/9),3)*.42||(z>-.5&&z<1.25&&x<1);
}
function field(x:number,y:number):number{
 const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
 const a=noise(ix,iy,600)*(1-fx)+noise(ix+1,iy,600)*fx,b=noise(ix,iy+1,600)*(1-fx)+noise(ix+1,iy+1,600)*fx;
 return a*(1-fy)+b*fy;
}
export function drawWoodlandGround(c:Ink,width:number,height:number,kind:WoodlandKind):void{
 if(width!==384||height!==352||!Object.hasOwn(groundColors,kind))throw new Error('Unsupported woodland surface');
 const colors=groundColors[kind];
 c.clearRect(0,0,width,height);
 for(let y=0;y<height;y+=2)for(let x=0;x<width;x+=2){
  const v=field(x/39,y/31),path=woodlandPath(x,y,width,height,kind);
  c.fillStyle=path?(kind==='forest'?(v<.46?'#696d50':'#737757'):(v<.46?'#aa9770':'#b09e78')):colors[Math.min(3,Math.floor(v*4))]!;
  c.fillRect(x,y,2,2);
 }
 // Sparse grouped blades, not a full-field spray of single bright pixels.
 for(let i=0;i<230;i++){
  const x=Math.floor(noise(i,17,600)*(width-5))+2,y=Math.floor(noise(i,31,600)*(height-5))+2;
  if(woodlandPath(x,y,width,height,kind))continue;
  c.fillStyle=kind==='forest'?'#617650':'#89985f';c.fillRect(x,y,3,1);c.fillRect(x+1,y-2,1,2);
  c.fillStyle=kind==='forest'?'#425e44':'#687e51';c.fillRect(x-1,y+1,4,1);
 }
 // Fallen-leaf pairs stay muted, with substantial quiet ground between them.
 for(let i=0;i<48;i++){
  const x=Math.floor(noise(i,53,600)*(width-6))+2,y=Math.floor(noise(i,79,600)*(height-4))+2;
  c.fillStyle=kind==='forest'?'#7a7954':'#8a855d';c.fillRect(x,y,3,1);c.fillRect(x+2,y+1,2,1);
 }
}
/** Stepped leaf masses and directional bark; same 64x80 cell and contact row 76. */
export function drawWoodlandOak(c:Ink):void{
 c.clearRect(0,0,64,80);
 const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 const outline='#303e36',bark='#716449',barkDark='#4e4e3b',barkLight='#98805a';
 for(let y=31;y<77;y++){
  const spread=y>62?Math.floor((y-62)*.66):0;
  r(27-spread,y,11+spread*2,1,outline);r(29-Math.floor(spread*.6),y,4,1,bark);r(35+Math.floor(spread*.6),y,2,1,barkDark);
 }
 for(let y=38;y<60;y++){const spread=Math.floor((59-y)*.52);r(29-spread,y,4,1,barkDark);r(30-spread,y,1,1,barkLight);r(35+spread,y,3,1,bark);}
 r(29,52,1,15,barkLight);r(32,56,1,17,barkDark);r(34,60,1,9,barkLight);r(25,70,2,4,barkLight);r(39,72,3,2,bark);
 const lobe=(cx:number,cy:number,rx:number,ry:number,col:string)=>{
  for(let y=-ry;y<=ry;y++){
   const half=Math.floor(rx*Math.sqrt(Math.max(0,1-y*y/(ry*ry))));
   const notch=(y+ry)%7===0?1:0;r(cx-half+notch,cy+y,Math.max(1,half*2+1-notch*2),1,col);
  }
 };
 // Deliberately offset silhouettes: broad oak boughs, rather than a circular canopy.
 const lobes=[[17,30,15,13],[32,17,16,15],[48,30,14,12],[27,41,16,12],[45,43,13,9],[12,40,10,9]] as const;
 for(const [x,y,rx,ry] of lobes)lobe(x,y,rx,ry,outline);
 for(const [x,y,rx,ry] of lobes){lobe(x,y-1,rx-2,ry-2,'#466344');lobe(x-2,y-3,rx-4,ry-5,'#5e794e');}
 for(const [x,y,rx,ry] of [[28,12,9,7],[15,26,9,5],[44,23,8,5],[28,34,9,5],[46,38,7,4],[12,37,5,3]])lobe(x!,y!,rx!,ry!,'#7e9159');
 for(const [x,y,w] of [[22,9,7],[25,7,4],[11,23,7],[40,20,6],[22,31,8],[44,35,5]])r(x!,y!,w!,1,'#a0aa70');
 for(const [x,y,w] of [[7,35,5],[17,42,8],[34,27,7],[45,45,5],[28,48,7],[50,32,6]]){r(x!,y!,w!,1,'#344e3b');r(x!+1,y!+1,Math.max(1,w!-3),1,'#3c573e');}
}
/** Replaces only the existing rock-fern card; no new plane, object or obstacle. */
export function drawWoodlandFern(c:Ink):void{
 c.clearRect(0,0,24,32);
 const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 const fronds=[[-1,10,13],[-1,7,10],[-1,4,7],[1,10,12],[1,7,8],[1,4,6],[0,0,17]];
 for(const [sign,reach,rise] of fronds){
  for(let step=0;step<=rise!;step++){
   const x=12+Math.round(sign!*reach!*step/rise!),y=27-step;
   r(x,y,1,1,'#526a43');
   if(step>1&&step<rise!-1&&step%3===0){const w=step>rise!*.7?2:3;r(x-w,y,w,1,'#69824e');r(x+1,y-1,w,1,'#8b9b60');}
  }
 }
 r(9,27,8,2,'#384d39');r(11,26,3,3,'#63774a');r(8,29,10,1,'#344437');
}
