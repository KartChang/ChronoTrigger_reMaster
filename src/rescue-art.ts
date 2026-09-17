import type {Ink,HeroPose} from './hero-art';
import {noise} from './world-art';

/** Hand-drawn Frog silhouette: green face, pale tunic, brown cape, sword. No original pixels sampled. */
export function drawFrog(c:Ink,facing=0,frame=0,pose:HeroPose='walk'):void{
 c.clearRect(0,0,24,32);const phase=frame%4,left=facing===3,back=facing===2,fallen=pose==='down'&&phase>1;
 const stride=pose==='walk'?(phase===1?1:phase===3?-1:0):0;
 const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;if(fallen)c.fillRect(2+Math.round((32-y-h)*.6),24+Math.round(x*.26),Math.max(1,Math.round(h*.6)),Math.max(1,Math.round(w*.26)));else c.fillRect(left?24-x-w:x,y+(pose==='hurt'?1:0),w,h);};
 const o='#293326',green='#709546',dark='#426433',hi='#b9c86a';
 r(5,15,15,14,o);r(6,16,13,11,'#67453d');r(7,17,2,11,'#976a52');r(17,17,2,10,'#433638');
 r(7-stride,25,5,6,o);r(13+stride,25,5,6,o);r(7-stride,28,5,2,'#9a7546');r(13+stride,28,5,2,'#785137');
 r(7,15,11,11,o);r(8,16,9,8,'#d9d7aa');r(8,21,3,3,'#a8b08b');r(8,24,9,2,'#84643a');r(12,24,2,1,'#dac476');
 const arm=pose==='cast'||pose==='victory'?8+phase%2:pose==='attack'?16:18;
 r(4,arm+stride,3,7,o);r(5,arm+stride,2,5,green);r(18,arm-stride,3,7,o);r(18,arm-stride,2,5,hi);
 r(6,6,13,10,o);r(5,9,15,6,o);r(7,7,11,8,green);r(6,10,13,4,hi);r(6,14,13,2,dark);
 r(6,4,5,5,o);r(14,4,5,5,o);r(7,5,3,4,green);r(15,5,3,4,hi);
 if(back){r(7,7,11,7,green);r(7,11,3,2,dark);r(10,7,4,2,hi);r(8,15,9,10,'#815541');r(9,16,3,9,'#ac7c57');}
 else{r(8,6,2,3,'#f0e7ad');r(16,6,2,3,'#f0e7ad');r(9,6,1,3,o);r(16,6,1,3,o);r(8,12,9,1,o);r(10,13,5,1,'#e2d9a4');if(facing===1||left)r(18,10,3,3,hi);}
 if(pose==='attack'||pose==='victory'){
  const x=pose==='victory'?20:phase<2?20:21,y=phase<2?3:12;
  r(x,y,2,16,o);r(x,y,1,14,'#cce0cd');r(x+1,y+2,1,10,'#789ca2');r(x-2,y+13,5,1,'#d2b272');r(x,y+14,1,4,'#715039');
 }
 if(pose==='cast'){r(3,arm-2,1,1,'#d5f2b2');r(21,arm-3,1,1,'#8ed6dc');}
 if(pose==='hurt')r(8,8,3,1,o);
}
export function drawYakra(c:Ink,frame=0):void{
 c.clearRect(0,0,48,48);const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 const o='#443126',dark='#86502c',skin='#c28b43',light='#e6b766',lift=frame%2;
 for(const [x,y] of [[8,9],[15,5],[24,3],[32,5],[39,10]]){r(x!,y!,4,9,o);r(x!+1,y!+1,2,5,'#ddd0a0');}
 r(9,11,31,29,o);r(5,20,38,17,o);r(10,12,28,24,skin);r(7,22,33,12,skin);
 r(13,10,19,8,light);r(10,20,8,13,dark);r(32,18,7,17,dark);r(19,19,14,17,'#d49a4b');r(20,29,12,8,'#e2b66f');
 for(let i=0;i<10;i++)r(12+(i*7)%26,16+(i*11)%18,2,2,i%2?dark:light);
 r(6,34-lift,11,9,o);r(32,34+lift,10,9,o);r(7,36-lift,9,5,dark);r(33,36+lift,8,5,skin);
 for(const x of [7,10,13,33,36,39])r(x,41,2,3,'#e9d7a4');
 r(15,16,9,9,o);r(28,16,9,9,o);r(16,17,7,6,'#e4d09a');r(29,17,7,6,'#e4d09a');r(20,18,2,6,'#563b2a');r(30,18,2,6,'#563b2a');
 r(18,27,16,5,o);r(21,28,2,3,'#e4d9b2');r(29,28,2,3,'#e4d9b2');
}
export function drawNaga(c:Ink,armored=false):void{
 c.clearRect(0,0,24,32);const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 const o='#2c293e',a=armored?'#677692':'#827393',b=armored?'#97a5b0':'#bb98a3';
 r(6,4,12,14,o);r(7,5,10,12,a);r(8,8,8,7,b);r(7,5,10,4,'#524762');r(9,10,2,2,'#e9d9a1');r(14,10,2,2,'#e9d9a1');
 r(5,17,14,9,o);r(7,16,10,8,a);r(8,19,8,5,b);r(3,18,3,7,a);r(18,18,3,7,a);
 r(8,23,9,5,a);r(11,27,10,3,o);r(6,29,15,2,a);r(4,27,5,3,a);r(5,27,9,1,b);
 if(armored){r(8,5,8,2,'#c6c5a4');r(3,13,1,17,'#adac96');r(2,11,3,4,'#dad8be');}
}
export function drawRescueNpc(c:Ink,kind:'nun'|'queen'|'chancellor'):void{
 c.clearRect(0,0,24,32);const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 const o='#35323c',robe=kind==='nun'?'#66687b':kind==='queen'?'#c47c6b':'#717680';
 r(7,4,11,13,o);r(8,5,9,11,kind==='nun'?'#e0dac5':'#9c7548');r(9,8,7,7,'#edc9a2');r(10,11,1,2,o);r(15,11,1,2,o);
 r(6,16,13,14,o);r(7,17,11,12,robe);r(5,29,15,2,o);r(8,18,2,11,'#ddd0a4');r(16,18,2,11,kind==='queen'?'#edc383':'#a5aba5');
 if(kind==='queen'){r(8,3,9,4,'#dab65c');for(const x of [8,12,16])r(x,2,2,3,'#f0d989');r(11,18,4,3,'#f0debe');}
 if(kind==='chancellor'){r(6,7,4,3,'#c9c9b4');r(16,7,3,3,'#c9c9b4');r(10,15,6,3,'#d8d4c0');r(9,19,7,2,'#a38d67');}
}
/** Large-scale mossy stone and red altar carpet, calibrated to the original cathedral screenshot. */
export function drawCathedralFloor(c:Ink,w:number,h:number,crypt=false):void{
 if(![w,h].every(n=>Number.isInteger(n)&&n>0&&n<=1024))throw new Error('Invalid cathedral surface');
 c.clearRect(0,0,w,h);
 for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){
  const row=Math.floor(y/18),xx=x+(row%2)*12,n=noise(Math.floor(xx/24),row,600),edge=xx%24<2||y%18<2;
  const worldX=(x/w-.5)*24,worldZ=1+(.5-y/h)*22;
  const carpet=!crypt&&(Math.abs(worldX)<1.5||(worldZ>5.3&&worldZ<8.2&&Math.abs(worldX)<4.1));
  c.fillStyle=carpet?(Math.abs(worldX)>1.35&&worldZ<5.3?'#b9a160':noise(x,y)>.93?'#8c3532':'#64282b'):edge?'#293832':n>.7?'#596158':n>.3?'#424e48':'#34433d';
  c.fillRect(x,y,2,2);
  if(!carpet&&!edge&&noise(x,y,171)<.035){c.fillStyle='#73796a';c.fillRect(x,y,2,1);}
 }
}
export function drawGlass(c:Ink):void{
 c.clearRect(0,0,40,64);const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 r(3,12,34,50,'#343b43');r(6,6,28,52,'#9f975e');r(12,2,16,6,'#9f975e');
 for(let y=8;y<58;y+=5)for(let x=8;x<32;x+=5)r(x,y,4,4,['#77949a','#bc9d61','#8aab9b','#d4c37d'][(x+y)%4]!);
 r(17,12,7,8,'#e9dba8');r(14,23,13,17,'#bbbf88');r(17,24,7,20,'#e1cc83');r(10,42,22,3,'#a2c2b5');r(19,6,2,54,'#625b41');
}
