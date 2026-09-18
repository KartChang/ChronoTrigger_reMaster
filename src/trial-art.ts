import {bridgeDeckPixels} from './art-profile';
/** Hand-authored reference-study textures. No ROM pixels or extracted audio. */
export function drawTrialFloor(c:CanvasRenderingContext2D,w=384,h=352,kind:'court'|'prison'|'bridge'|'future'='prison'):void{
 c.fillStyle=kind==='bridge'?'#101d33':kind==='court'?'#262b2c':kind==='future'?'#313c43':'#343f49';c.fillRect(0,0,w,h);
 if(kind==='bridge'){
  for(let y=20;y<h;y+=20)for(let x=0;x<w;x+=32){c.fillStyle=['#1b2b47','#233653','#172c40'][(x/32+y/20)%3]!;c.fillRect(x,y+(x%3)*3,28,10);}
  const deck=bridgeDeckPixels(h);
  for(let x=0;x<w;x+=16){c.fillStyle=x%32?'#8d8b7a':'#757970';c.fillRect(x,deck.top,14,deck.bottom-deck.top);c.fillStyle='#b4b299';c.fillRect(x,deck.top,14,2);}
  return;
 }
 const size=kind==='court'?16:24;
 for(let y=0;y<h;y+=size)for(let x=0;x<w;x+=size){
  const n=(x/size+y/size)%2;c.fillStyle=kind==='court'?(n?'#696c65':'#505752'):kind==='future'?(n?'#4b555d':'#414e56'):(n?'#68727a':'#5b6671');c.fillRect(x+1,y+1,size-2,size-2);
  c.fillStyle=kind==='court'?'#858577':'#818b8a';c.fillRect(x+2,y+2,size-4,1);
  if(kind!=='court'&&(x/size+2*y/size)%5===0){c.fillStyle='#3c4751';c.fillRect(x+6,y+4,1,10);c.fillRect(x+6,y+13,5,1);}
 }
 if(kind==='court'){
  c.fillStyle='#313937';c.fillRect(0,0,w,38);c.fillRect(0,0,34,h);c.fillRect(w-34,0,34,h);
  c.fillStyle='#b4985b';c.fillRect(35,38,w-70,2);c.fillRect(34,38,2,h-38);c.fillRect(w-36,38,2,h-38);
 }
}
export function drawCourtWindow(c:CanvasRenderingContext2D):void{
 c.clearRect(0,0,64,80);c.fillStyle='#36372f';c.fillRect(3,4,58,74);
 for(let y=8;y<76;y+=7)for(let x=6;x<59;x+=7){c.fillStyle=['#718d70','#b3a66a','#426f76','#aea77a'][(x+y)%4]!;c.fillRect(x,y,5,5);}
 c.fillStyle='#ccb981';c.fillRect(30,5,3,72);c.fillRect(4,38,56,3);c.fillRect(7,73,50,3);
 for(let i=0;i<13;i++){c.fillRect(7+i*2,39-i*2,3,3);c.fillRect(32+i*2,15+i*2,3,3);}
 c.fillStyle='#ebe0b0';c.fillRect(29,19,7,17);c.fillRect(24,23,17,5);c.fillStyle='#d2b471';c.fillRect(27,49,11,13);
}
export function drawTankPart(c:CanvasRenderingContext2D,part:'head'|'body'|'wheel',frame=0):void{
 c.clearRect(0,0,64,64);const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 if(part==='head'){
  r(6,18,16,41,'#3c302a');for(let y=20;y<59;y+=8){r(8,y,12,6,'#a16d44');r(9,y,10,2,'#c59461');r(9,y+5,11,1,'#5d4332');}
  r(14,9,38,18,'#493b2e');r(18,11,34,12,'#ad7a49');r(18,11,31,3,'#d5ad72');r(38,22,18,5,'#686c60');r(23,5,6,9,'#817258');r(24,4,3,8,'#b5ac87');
  r(34,16,5,4,frame?'#e9db86':'#202e2d');r(34,16,2,2,'#e4d478');r(49,15,9,7,'#c29863');r(52,17,5,2,'#3d392d');
 }else if(part==='body'){
  r(3,28,57,29,'#45392b');r(7,20,48,34,'#89613e');r(14,15,32,6,'#bc9361');r(10,23,40,25,'#a8784b');r(7,30,44,3,'#b88c5d');r(16,36,3,9,'#503e2d');r(23,36,3,9,'#503e2d');r(30,36,3,9,'#503e2d');
  r(9,8,6,15,'#9b8056');r(7,7,10,4,'#c4a66f');r(32,4,5,14,'#626962');r(30,13,12,8,'#777970');r(45,4,2,19,'#776343');r(47,5,11,7,'#aa4c43');r(48,6,8,2,'#c86952');
  if(frame%2){r(30,1,4,3,'#b9c2b0');r(33,0,5,2,'#d3d6ba');}
  for(let x=10;x<52;x+=8){r(x,27,2,2,'#d3b98a');r(x,49,2,2,'#463d2c');}
 }else{
  r(12,16,38,31,'#303937');r(17,11,28,41,'#434b45');r(14,19,34,24,'#6f776b');r(19,15,24,33,'#899081');r(22,22,18,20,'#4f584f');
  r(28,16,6,31,'#b4b49c');r(17,28,28,6,'#b4b49c');r(24,24,14,14,'#4c534b');r(28,28,6,6,'#b29a67');
  if(frame%2){r(19,21,6,5,'#3a423c');r(37,37,5,5,'#3a423c');}
 }
}
