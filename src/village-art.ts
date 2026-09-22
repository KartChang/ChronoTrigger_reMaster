import type {Ink} from './hero-art';
/** Original, deterministic town surfaces. No ROM pixels, fonts or game-state input. */
export const VILLAGE_ART={id:'vq02s-town-craft',cell:{width:64,height:64},sign:{width:80,height:40},approved:false,romPixels:false} as const;
export const VILLAGE_SURFACES=['plaster','timber','stone','slate','clay','door'] as const;
export type VillageSurface=typeof VILLAGE_SURFACES[number];
export function drawVillageSurface(c:Ink,kind:VillageSurface):void{
 if(!VILLAGE_SURFACES.includes(kind))throw new Error('Unknown village surface');
 const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 c.clearRect(0,0,64,64);
 if(kind==='plaster'){
  r(0,0,64,64,'#c4baa0');
  for(const [x,y,w,h] of [[3,9,17,12],[39,4,20,9],[26,37,29,14],[6,52,16,8]])r(x!,y!,w!,h!,'#bcb39c');
  for(const [x,y,w,h] of [[7,12,11,6],[30,19,23,14],[4,32,17,9]])r(x!,y!,w!,h!,'#cec3a8');
  r(0,59,64,5,'#b3ab95');r(4,60,16,2,'#b9ae97');r(48,57,11,3,'#bab198');
 }else if(kind==='slate'||kind==='clay'){
  const p=kind==='slate'?['#465765','#637582','#71828a','#516570']:['#6f4e3e','#92694e','#a47c59','#805d46'];
  r(0,0,64,64,p[0]!);
  for(let row=0;row<4;row++)for(let col=-1;col<4;col++){
   const x=col*20+(row%2)*10,y=row*16;
   r(x+1,y+1,19,14,p[1]!);r(x+2,y+2,17,2,p[2]!);r(x+1,y+12,19,3,p[3]!);
   if((row+col+5)%3===0)r(x+4,y+6,8,1,p[2]!);
  }
 }else if(kind==='stone'){
  r(0,0,64,64,'#686e65');
  const p=['#949789','#878d80','#9c9e8e'];
  for(let row=0;row<4;row++)for(let col=-1;col<3;col++){
   const x=col*28+(row%2)*14,y=row*16;
   r(x+1,y+1,26,14,p[(row+col+4)%3]!);r(x+2,y+2,24,2,'#a6a798');r(x+2,y+13,24,2,'#788072');
   if((row+col+4)%2===0){r(x+7,y+6,8,2,'#939789');r(x+9,y+8,11,1,'#8b9182');}
  }
 }else{
  const door=kind==='door';r(0,0,64,64,door?'#63503f':'#675341');
  for(let x=0;x<64;x+=16){r(x,0,1,64,'#493f34');r(x+1,0,2,64,'#8a7051');r(x+13,0,2,64,'#574735');}
  for(const [x,y,h] of [[7,5,17],[10,33,21],[25,12,24],[39,4,19],[42,38,17],[56,21,25]]){
   r(x!,y!,1,h!,'#775e45');r(x!+2,y!+3,1,Math.max(2,h!-7),'#5a4938');
  }
  r(22,39,4,2,'#504334');r(21,41,6,2,'#504334');r(23,43,3,3,'#504334');r(23,41,2,1,'#967854');
  if(door){for(const y of [13,48]){r(2,y,60,4,'#343c3b');r(5,y+1,2,1,'#9b977c');r(57,y+1,2,1,'#9b977c');}r(47,29,4,8,'#2d3635');r(48,30,2,6,'#c3a370');}
 }
}
/** A bed pictogram and pixel-letter INN stay legible without platform font rasterization. */
export function drawVillageSign(c:Ink):void{
 const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 c.clearRect(0,0,80,40);r(2,0,76,40,'#343b33');r(0,2,80,36,'#343b33');
 r(3,3,74,34,'#b6a078');r(5,5,70,30,'#5d5140');r(7,7,66,26,'#665843');r(7,29,66,4,'#514838');
 r(12,14,3,13,'#e1d0a1');r(15,21,16,4,'#e1d0a1');r(28,17,3,10,'#e1d0a1');r(16,16,5,4,'#eee1bb');r(21,18,7,3,'#b6b58c');
 const glyphs=['111/010/010/010/111','1001/1101/1011/1001/1001','1001/1101/1011/1001/1001'];
 let x=38;for(const glyph of glyphs){const rows=glyph.split('/');rows.forEach((row,y)=>[...row].forEach((v,dx)=>{if(v==='1')r(x+dx*2,13+y*2,2,2,'#e8d8af');}));x+=rows[0]!.length*2+3;}
 r(7,7,2,2,'#d4c198');r(71,7,2,2,'#d4c198');r(7,31,2,2,'#a28e6d');r(71,31,2,2,'#a28e6d');
}
