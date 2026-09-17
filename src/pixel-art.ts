/** Original pixel drawings made for this reconstruction; no sampled sprite sheets. */
type Ink=Pick<CanvasRenderingContext2D,'fillStyle'|'fillRect'|'clearRect'>;
export function drawAdventureHero(c:Ink,slot:number,facing:number,frame:number):void{
  c.clearRect(0,0,24,32);
  const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  const outline='#352b39',skin='#f2c391',shade='#b97960',hair=slot===0?'#b93626':'#c39531',light=slot===0?'#f27537':'#ffe185';
  const blue=slot===0?'#297b95':'#f3eed5',deep=slot===0?'#23465c':'#94b4b1';
  const stride=frame?1:0;
  // Separate boots, trousers, scarf and arms remain readable at native resolution.
  r(7-stride,25,5,6,outline);r(13+stride,25,5,6-stride,outline);
  r(8-stride,24,3,4,'#b18352');r(14+stride,24,3,4-stride,'#d2b174');
  r(7-stride,29,5,2,'#63463b');r(13+stride,28-stride,5,2,'#8f6040');
  r(6,17,13,9,outline);r(7,17,11,7,blue);r(8,19,3,5,deep);r(12,18,5,3,slot===0?'#5598a1':'#ffffe7');
  r(7,24,11,2,'#a47748');r(11,24,2,2,'#e6c87d');
  r(4,18+stride,3,6,outline);r(5,19+stride,2,4,blue);r(5,23+stride,2,3,skin);
  r(18,18-stride,3,6,outline);r(18,19-stride,2,4,deep);r(18,23-stride,2,3,shade);
  // Outlined irregular head silhouette, rather than a rectangular hair block.
  r(7,5,11,12,outline);r(6,8,13,6,outline);r(8,9,9,7,skin);r(7,11,2,4,shade);r(16,12,2,3,shade);
  r(8,6,9,4,hair);r(6,7,3,5,hair);r(17,8,2,5,hair);
  if(slot===0){
    for(const [x,y,w,h] of [[5,4,3,4],[4,3,2,2],[9,1,3,7],[8,0,2,3],[12,3,5,6],[17,3,3,5],[19,2,2,3],[19,7,2,3]])r(x!,y!,w!,h!,outline);
    for(const [x,y,w,h] of [[6,4,2,4],[10,2,2,6],[12,4,5,5],[18,4,2,4],[19,3,1,2]])r(x!,y!,w!,h!,hair);
    r(10,3,1,4,light);r(13,4,2,2,light);r(7,6,2,1,light);r(16,6,3,1,'#df502d');
    r(8,9,10,2,'#e8dfb2');r(7,10,2,3,'#aaae92');
    r(6,16,13,2,'#d18b34');r(9,16,8,1,'#f7cc67');r(17,17,2,5,'#b96c2b');r(18,20,2,3,'#f0b650');
  }else{
    r(17,1,4,4,outline);r(18,2,3,3,hair);r(19,4,3,11,outline);r(19,5,2,8,light);r(18,5,4,2,'#559598');
    r(9,3,8,6,hair);r(10,3,6,3,light);r(7,6,3,4,light);r(13,6,5,3,'#e6bd57');
    r(9,16,7,2,skin);r(12,17,1,2,'#ac863d');r(11,18,3,2,'#d4eeeb');
  }
  if(facing===2){r(7,10,11,6,hair);r(9,10,5,3,light);r(7,14,3,3,hair);r(9,17,7,2,slot===0?'#e1a443':deep);}
  else if(facing===1){r(16,11,2,2,outline);r(18,13,2,2,skin);r(8,10,4,6,hair);}
  else if(facing===3){r(8,11,2,2,outline);r(6,13,2,2,skin);r(14,10,4,6,hair);}
  else{r(9,12,2,2,outline);r(15,12,2,2,outline);r(9,12,1,1,'#fff6d7');r(15,12,1,1,'#fff6d7');r(12,15,2,1,shade);}
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
  r(28,43,10,35,'#493826');r(30,47,4,30,'#8d6540');r(34,48,3,29,'#6c5031');r(24,75,18,3,'#493826');
  const disc=(cx:number,cy:number,rad:number,col:string)=>{for(let y=-rad;y<=rad;y++){const w=Math.floor(Math.sqrt(rad*rad-y*y));r(cx-w,cy+y,w*2+1,1,col);}};
  for(const [x,y,rad] of [[18,32,16],[43,33,17],[32,18,17],[30,46,16]])disc(x!,y!,rad!,'#243f2b');
  let n=1709;const rng=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};
  for(let i=0;i<170;i++){const x=9+rng()*46,y=6+rng()*48;if(((x-32)/27)**2+((y-29)/27)**2>1)continue;disc(Math.floor(x),Math.floor(y),2+Math.floor(rng()*5),['#365d2b','#527a32','#6e923f','#416b2e','#829e49'][Math.floor(rng()*5)]!);}
  for(let i=0;i<80;i++){const x=Math.floor(11+rng()*42),y=Math.floor(8+rng()*39);if(((x-32)/24)**2+((y-26)/22)**2<1)r(x,y,2,1,'#a4b75c');}
}
