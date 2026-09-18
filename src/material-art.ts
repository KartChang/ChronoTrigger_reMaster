/** Deterministic editable surface set, integer pixels shared by runtime and PNG export. */
export type SurfaceKind='timber'|'plaster'|'roof'|'stone'|'iron';
const COLORS:Record<SurfaceKind,readonly string[]>={
 timber:['#785838','#533d2c','#a47f52','#8d6942'],plaster:['#d0c49e','#b9ad89','#e1d6b1','#c3b58f'],
 roof:['#956c54','#654b3d','#b58c66','#a17655'],stone:['#64717a','#404e5a','#899298','#718087'],
 iron:['#53616b','#2e3e4a','#879298','#66777e']};
export const SURFACE_KINDS:readonly SurfaceKind[]=['timber','plaster','roof','stone','iron'];
export function drawMaterial(c:CanvasRenderingContext2D,kind:SurfaceKind):void{
 const p=COLORS[kind];c.fillStyle=p[0]!;c.fillRect(0,0,64,64);
 if(kind==='plaster'){
  for(let y=0;y<64;y+=4)for(let x=0;x<64;x+=4){const n=(x*13+y*7)%17;c.fillStyle=p[n%4]!;c.fillRect(x,y,n%3+1,1);}
  return;
 }
 if(kind==='iron'){
  c.fillStyle=p[1]!;c.fillRect(0,0,1,64);c.fillRect(0,0,64,1);c.fillStyle=p[2]!;c.fillRect(2,2,1,60);c.fillRect(2,2,60,1);
  for(const x of [6,56])for(const y of [6,56]){c.fillStyle=p[1]!;c.fillRect(x,y,4,4);c.fillStyle=p[2]!;c.fillRect(x,y,2,2);}
  c.fillStyle=p[3]!;for(let y=14;y<52;y+=9)c.fillRect(12,y,24+(y%8),1);return;
 }
 const row=kind==='timber'?16:kind==='roof'?8:16,col=kind==='timber'?32:kind==='roof'?16:32;
 for(let y=0;y<64;y+=row){const offset=(y/row)%2?col/2:0;
  for(let x=-col;x<64;x+=col){const at=x+offset;c.fillStyle=p[1]!;c.fillRect(at,y,col,row);c.fillStyle=p[(x/col+y/row+12)%2?0:3]!;c.fillRect(at+1,y+1,col-2,row-2);c.fillStyle=p[2]!;c.fillRect(at+2,y+1,col-4,1);
   if(kind==='timber'){c.fillStyle=p[1]!;c.fillRect(at+5,y+5,17,1);c.fillRect(at+10,y+11,13,1);c.fillRect(at+3,y+3,1,2);}
   if(kind==='stone'&&(x/col+y/row)%3===0){c.fillStyle=p[1]!;c.fillRect(at+18,y+5,1,5);c.fillRect(at+19,y+9,4,1);}
  }
 }
}
/** Regional symbol, not a full field-scale 3D mountain or a new traversable landmark. */
export function drawMountain(c:CanvasRenderingContext2D):void{
 c.clearRect(0,0,64,48);
 for(let y=6;y<44;y++){
  const half=Math.min(28,Math.floor((y-5)*.75)),x=32-half;
  c.fillStyle='#444e48';c.fillRect(x,y,half*2,1);c.fillStyle='#8a8e75';c.fillRect(x+2,y,Math.max(0,half-1),1);c.fillStyle='#687463';c.fillRect(32,y,Math.max(0,half-2),1);
  if(y>17&&y%5===0){c.fillStyle='#b1aa85';c.fillRect(x+3,y,Math.max(0,half-6),1);}
 }
 c.fillStyle='#dbd5b2';c.fillRect(30,7,4,5);c.fillRect(27,12,10,2);c.fillStyle='#556f50';c.fillRect(4,42,56,3);
}
