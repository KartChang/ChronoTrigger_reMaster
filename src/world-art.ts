import type {Ink} from './hero-art';
import {noise,surfaceWorld} from './surface-layout';
import type {SurfaceKind} from './surface-layout';
import {drawFairPaving} from './early-art';
export {noise,fairStone,surfaceWorld} from './surface-layout';
export type {SurfaceKind} from './surface-layout';
/** Authored texture, reference-informed density/palette; no image downloads at runtime. */
export function drawSurface(c:Ink,width:number,height:number,kind:SurfaceKind):void{
 if(![width,height].every(n=>Number.isInteger(n)&&n>0&&n<=1024))throw new Error('Invalid ground dimensions');
 if(kind==='fair'){drawFairPaving(c,width,height);return;}
 c.clearRect(0,0,width,height);
 for(let py=0;py<height;py+=2)for(let px=0;px<width;px+=2){
  const {x,z}=surfaceWorld(px,py,width,height,kind),n=noise(px,py),patch=noise(Math.floor(px/19),Math.floor(py/17),600);
  let color:string;
  const centre=Math.sin(z*.43)*.5+Math.sin(z*1.7)*.16;
  const main=Math.abs(x-centre)<.75+noise(Math.floor(py/9),3)*.42,west=z>-.5&&z<1.25&&x<1;
  if(main||west)color=n<.18?'#535540':n<.45?'#394b3b':'#2d4237';
  else color=n<.14?'#708457':n<.32?'#516f4f':patch>.55?'#3d614b':'#2d5141';
  if(Math.abs(x)>8.8&&n>.6)color='#263e36';
  c.fillStyle=color;c.fillRect(px,py,2,2);
 }
 // Sparse grass blades and fallen leaves, not regularly aligned bright rectangles.
 for(let i=0;i<1400;i++){
  const px=Math.floor(noise(i,0)*width),py=Math.floor(noise(i,1)*height);
  c.fillStyle=(i%7?'#81915c':'#a09160');
  c.fillRect(px,py,1,2);if(i%2===0)c.fillRect(px+1,py-1,1,1);
 }
}
/** Uneven stone courses for arch/kerb faces; also exported for authoring review. */
export function drawMasonry(c:Ink,width=128,height=128):void{
 c.fillStyle='#655f52';c.fillRect(0,0,width,height);
 for(let y=0;y<height;y+=12)for(let x=-15;x<width;x+=25){
  const xx=x+((y/12)%2)*12;
  c.fillStyle=noise(x,y)>.5?'#b4ad94':'#a09c88';c.fillRect(xx+1,y+1,23,10);
  c.fillStyle='#d1c9ae';c.fillRect(xx+2,y+1,20,1);c.fillStyle='#817d6c';c.fillRect(xx+2,y+9,20,1);
  if(noise(x,y,29)>.7){c.fillStyle='#707b51';c.fillRect(xx+2,y+8,5,2);}
 }
}
