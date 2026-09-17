import {drawReferenceHero} from './hero-art';
import type {HeroPose} from './hero-art';
/** Original pixel drawings made for this reconstruction; no sampled sprite sheets. */
type Ink=Pick<CanvasRenderingContext2D,'fillStyle'|'fillRect'|'clearRect'>;
export function drawAdventureHero(c:Ink,slot:number,facing:number,frame:number,pose:HeroPose='walk'):void{
 drawReferenceHero(c,slot===0?'crono':'marle',facing,frame,pose);
}
export function drawImp(c:Ink):void{
  c.clearRect(0,0,24,32);const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  r(4,7,3,6,'#342e42');r(17,7,3,6,'#342e42');r(5,8,2,4,'#d5a85e');r(17,8,2,4,'#d5a85e');
  r(5,12,14,12,'#26394a');r(6,12,12,9,'#377d90');r(8,11,8,3,'#65a4a4');r(8,15,3,3,'#e0d17a');r(14,15,3,3,'#e0d17a');r(9,16,1,2,'#292b38');r(14,16,1,2,'#292b38');
  r(8,22,9,5,'#826349');r(3,21,4,5,'#468391');r(18,21,3,5,'#468391');r(6,26,5,4,'#344d5a');r(13,26,5,4,'#344d5a');r(6,29,5,2,'#302d40');r(13,29,5,2,'#302d40');
}
/** Deterministic crown made of layered pixel clusters, used as a billboard in a 3D world. */
export function drawTree(c:Ink):void{
 c.clearRect(0,0,64,80);const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 // Forked trunk and spreading roots keep the lower silhouette readable in dark forest.
 for(let y=30;y<77;y++){
  const spread=y>62?Math.floor((y-62)*.66):0;
  r(27-spread,y,11+spread*2,1,'#393c2d');
  r(29-Math.floor(spread*.6),y,4,1,'#826e48');r(35+Math.floor(spread*.6),y,2,1,'#665c3b');
 }
 for(let y=36;y<57;y++){const d=Math.floor((57-y)*.55);r(29-d,y,4,1,'#5e5537');r(35+d,y,3,1,'#494831');}
 const disc=(cx:number,cy:number,rad:number,col:string)=>{for(let y=-rad;y<=rad;y++){const w=Math.floor(Math.sqrt(rad*rad-y*y));r(cx-w,cy+y,w*2+1,1,col);}};
 for(const [x,y,rad] of [[15,27,13],[30,17,15],[47,25,13],[24,36,15],[42,37,13]])disc(x!,y!,rad!,'#2c4330');
 let seed=600;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<210;i++){
  const x=Math.floor(5+random()*54),y=Math.floor(4+random()*43);
  if(((x-32)/29)**2+((y-27)/25)**2>1)continue;
  const shade=['#3c5934','#536a39','#697c40','#778947','#52693b'][i%5]!;
  disc(x,y,2+Math.floor(random()*4),shade);
 }
 for(let i=0;i<490;i++){
  const x=Math.floor(7+random()*50),y=Math.floor(4+random()*42);
  if(((x-32)/27)**2+((y-26)/23)**2>1)continue;
  r(x,y,1+i%2,1,i%4?'#9da762':'#bdbe7d');
 }
}

/** Authored Lucca silhouette: round glasses, violet hair, cap and tunic. */
export function drawLucca(c:Ink,facing=0,frame=0,pose:HeroPose='walk'):void{
 drawReferenceHero(c,'lucca',facing,frame,pose);
}
export function drawResident(c:Ink,kind:'resident'|'guard'|'king'):void{
 c.clearRect(0,0,24,32);const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const o='#2d3039',coat=kind==='guard'?'#899fa4':kind==='king'?'#864452':'#7e9671';
 r(7,25,5,6,o);r(13,25,5,6,o);r(6,16,13,11,o);r(7,17,11,8,coat);r(5,19,3,6,coat);r(18,19,3,6,coat);
 r(7,6,12,11,o);r(8,8,10,8,'#e0b38c');r(8,6,10,4,'#6b5448');r(9,12,2,2,o);r(15,12,2,2,o);
 if(kind==='guard'){r(7,5,12,6,coat);r(9,4,8,3,'#d4dcce');r(12,10,2,6,'#c5d0ca');r(3,14,2,17,'#927749');r(3,12,2,4,'#d2d8cb');r(6,21,6,7,'#526476');}
 if(kind==='king'){r(7,3,12,5,'#bb964b');r(8,3,2,3,'#f3d07e');r(12,1,2,6,'#f3d07e');r(17,3,2,3,'#f3d07e');r(7,17,2,9,'#dfc285');r(17,17,2,9,'#dfc285');r(10,14,6,3,'#d8cbb2');}
}

export function drawGato(c:Ink):void{
 c.clearRect(0,0,48,48);const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 const o='#392e3b',iron='#918f82',hi='#ddd4ac',red='#ab3f58',shade='#682d48';
 for(let y=10;y<40;y++){const span=Math.floor(Math.sqrt(Math.max(0,15*15-(y-25)*(y-25))));r(24-span,y,span*2+1,1,o);if(span>2)r(25-span,y,span*2-2,1,y<19?'#ce6370':red);}
 r(15,2,18,11,o);r(17,3,14,9,iron);r(19,2,2,8,hi);r(28,3,2,8,'#595d5c');r(19,6,10,5,shade);r(20,7,3,2,'#f5cd65');r(26,7,3,2,'#f5cd65');
 r(23,0,2,4,iron);r(16,11,17,3,'#d49b7d');r(19,15,11,17,o);r(20,16,9,15,iron);r(21,17,2,12,hi);
 for(let y=18;y<29;y+=3)r(24,y,4,1,'#484d4d');
 for(const x of [4,36]){r(x+2,17,6,14,o);r(x+3,18,4,12,iron);r(x+3,20,3,2,hi);r(x,28,11,10,o);r(x+1,29,9,8,red);r(x+2,30,6,2,'#df8790');r(x+2,35,7,2,shade);}
 for(const x of [13,28]){r(x,37,8,9,o);r(x+1,38,6,7,iron);r(x+1,43,7,3,'#625e60');r(x+1,39,5,2,hi);}
}
