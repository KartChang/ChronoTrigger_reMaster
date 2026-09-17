import type {Ink} from './hero-art';
export type SurfaceKind='fair'|'forest';
export function noise(x:number,y:number,seed=1995):number{
 let n=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^seed;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;
}
/** Top-left canvas origin, north at the top. Babylon ground UVs use update(true). */
export function surfaceWorld(px:number,py:number,width:number,height:number,kind:SurfaceKind):{x:number;z:number}{
 const w=kind==='fair'?26.8:24,h=kind==='fair'?20.8:22;
 return{x:(px/width-.5)*w,z:1+(.5-py/height)*h};
}
export function fairStone(x:number,z:number):boolean{
 const garden=Math.abs(x+3.5)<1.7&&Math.abs(z+.5)<1.4;
 const rim=Math.abs(x)>11.2||z<-8||z>10.8;
 return !garden&&!rim;
}
/** Authored texture, reference-informed density/palette; no image downloads at runtime. */
export function drawSurface(c:Ink,width:number,height:number,kind:SurfaceKind):void{
 if(![width,height].every(n=>Number.isInteger(n)&&n>0&&n<=1024))throw new Error('Invalid ground dimensions');
 c.clearRect(0,0,width,height);
 for(let py=0;py<height;py+=2)for(let px=0;px<width;px+=2){
  const {x,z}=surfaceWorld(px,py,width,height,kind),n=noise(px,py),patch=noise(Math.floor(px/19),Math.floor(py/17),600);
  let color:string;
  if(kind==='fair'&&fairStone(x,z)){
   const row=Math.floor(py/9),xx=px+(row%2)*5,cell=Math.floor(xx/13),rx=((xx%13)+13)%13,ry=py%9;
   const tone=noise(cell,row,1000),edge=rx<2||ry<2||(rx<4&&ry<4);
   color=edge?(patch>.5?'#666250':'#575747'):tone>.66?'#b6ac87':tone>.33?'#a49878':'#938b6f';
   if(!edge&&ry===2&&rx>3)color='#c5b999';
   if(!edge&&ry>6)color='#807960';
   if(!edge&&n<.09)color='#8d866d';
  }else if(kind==='fair'){
   color=n<.18?'#778744':n<.47?'#5c7338':patch>.4?'#4a6232':'#425c32';
  }else{
   const centre=Math.sin(z*.43)*.5+Math.sin(z*1.7)*.16;
   const main=Math.abs(x-centre)<.75+noise(Math.floor(py/9),3)*.42;
   const west=z>-.5&&z<1.25&&x<1;
   if(main||west)color=n<.18?'#535540':n<.45?'#394b3b':'#2d4237';
   else color=n<.14?'#708457':n<.32?'#516f4f':patch>.55?'#3d614b':'#2d5141';
   if(Math.abs(x)>8.8&&n>.6)color='#263e36';
  }
  c.fillStyle=color;c.fillRect(px,py,2,2);
 }
 // Sparse grass blades and fallen leaves, not regularly aligned bright rectangles.
 for(let i=0;i<(kind==='fair'?700:1400);i++){
  const px=Math.floor(noise(i,0)*width),py=Math.floor(noise(i,1)*height),p=surfaceWorld(px,py,width,height,kind);
  if(kind==='fair'&&fairStone(p.x,p.z))continue;
  c.fillStyle=kind==='fair'?(i%3?'#8b9a50':'#a4ac63'):(i%7?'#81915c':'#a09160');
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
