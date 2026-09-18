/** New native-resolution supporting cast. Authored pixels, never sampled ROM data.
 * The same integer-coordinate painters feed runtime textures and review PNGs. */
export const WITNESS_KINDS=['girl','elder','merchant','shopper','judge','defender','prosecutor','guard'] as const;
export type WitnessArtKind=typeof WITNESS_KINDS[number];
export const WITNESS_SIZE={w:48,h:64,pivot:{x:24,y:62}} as const;
const PALETTES:Record<WitnessArtKind,readonly [string,string,string,string]>={
 girl:['#b76a4d','#713c35','#edcfa1','#74503c'],elder:['#90927e','#4f615c','#e1d6b3','#c2bfa7'],
 merchant:['#4d8187','#2a505d','#d5ba77','#5a4037'],shopper:['#8a728f','#4f426d','#e1c7c2','#775240'],
 judge:['#55556d','#303447','#d9d2b6','#c2c4b5'],defender:['#718a72','#3f5554','#d4c99c','#7d6552'],
 prosecutor:['#886087','#493857','#d3b477','#c3bbaa'],guard:['#7e8c93','#415968','#c3ccc3','#655344']};
export function drawWitness(c:CanvasRenderingContext2D,kind:WitnessArtKind,frame=0):void{
 c.clearRect(0,0,48,64);const [cloth,shade,light,hair]=PALETTES[kind],outline='#191e2a';
 const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y+(frame===1&&y<49&&!(kind==='elder'&&x>=35)?-1:0),w,h);};
 const child=kind==='girl',elder=kind==='elder',robe=kind==='judge'||kind==='prosecutor'||kind==='shopper';
 const headY=child?17:elder?12:8,bodyY=headY+18,bottom=child?56:58;
 // Separate boot shapes and a grounded hem: no opaque background or rectangle silhouette.
 r(16,bottom-4,7,7,outline);r(26,bottom-4,7,7,outline);r(16,bottom-3,5,4,'#715748');r(27,bottom-3,5,4,'#80624b');r(15,bottom+2,9,1,outline);r(26,bottom+2,9,1,outline);
 for(let y=bodyY;y<bottom-3;y++){const half=robe?Math.min(13,7+Math.floor((y-bodyY)/3)):child?8:9;r(24-half,y,half*2,1,outline);r(25-half,y,half*2-2,1,cloth);r(25-half,y,3,1,shade);}
 r(22,bodyY+2,2,bottom-bodyY-7,light);r(30,bodyY+4,2,bottom-bodyY-9,shade);r(17,bottom-6,14,2,shade);
 r(12,bodyY+3,5,14,outline);r(13,bodyY+4,4,10,cloth);r(32,bodyY+3,5,14,outline);r(32,bodyY+4,4,10,cloth);
 r(13,bodyY+14,4,4,'#c58e70');r(32,bodyY+14,4,4,'#dfad88');r(14,bodyY+14,2,2,'#efd0a3');r(33,bodyY+14,2,2,'#efd0a3');
 // Face shading, nose, brows and ears remain separate at native pixel density.
 r(15,headY+2,18,17,outline);r(17,headY,14,21,outline);r(17,headY+3,14,15,'#bc856b');r(18,headY+3,12,13,'#dfac86');r(19,headY+4,10,7,'#eed0a2');
 r(14,headY+8,3,6,'#c38b70');r(31,headY+8,3,6,'#dcab86');r(17,headY+1,14,5,hair);r(15,headY+3,3,9,hair);r(30,headY+3,3,9,hair);
 r(18,headY+7,4,1,shade);r(26,headY+7,4,1,shade);r(19,headY+9,2,frame===2?1:3,outline);r(27,headY+9,2,frame===2?1:3,outline);
 r(23,headY+11,2,3,'#c88b6d');r(22,headY+16,5,1,'#a76e62');r(21,headY+19,6,3,light);
 if(frame===3){r(13,bodyY+12,4,4,'#d5a07f');r(14,bodyY+12,2,2,'#f0d4aa');r(21,bodyY+9,1,7,shade);}
 if(child){
  r(12,headY+2,4,14,hair);r(33,headY+2,4,14,hair);r(11,headY+9,6,3,'#e6c17a');r(32,headY+9,6,3,'#e6c17a');r(13,headY+3,1,9,'#bd8860');r(34,headY+3,1,9,'#bc8460');
  r(17,bodyY+3,14,2,light);r(19,bodyY+6,10,11,'#e8d6b0');r(21,bodyY+8,6,1,'#f3e6c7');r(20,bottom-5,2,3,shade);r(27,bottom-5,2,3,shade);
 }else if(elder){
  r(18,headY,12,3,'#babfab');r(20,headY,8,2,'#e1dec3');r(16,headY+8,6,5,shade);r(26,headY+8,6,5,shade);r(18,headY+9,3,2,'#c8d8ce');r(27,headY+9,3,2,'#c8d8ce');r(22,headY+9,4,1,outline);
  r(18,headY+16,13,5,'#d0c9b1');r(20,headY+20,9,3,'#dcd6be');r(23,headY+22,3,2,'#acb49f');r(37,bodyY+9,2,22,'#805f41');r(35,bodyY+8,4,2,'#b0915b');
 }else if(kind==='merchant'){
  r(14,headY-3,20,7,outline);r(16,headY-5,16,7,shade);r(16,headY-4,14,2,cloth);r(12,headY+2,24,2,light);
  r(19,bodyY+3,12,22,'#c7b182');r(20,bodyY+4,10,1,'#ead7a7');r(21,bodyY+14,8,7,shade);r(22,bodyY+15,6,1,cloth);r(19,headY+15,12,2,hair);
 }else if(kind==='shopper'){
  r(15,headY-1,18,7,cloth);r(17,headY-3,14,4,light);r(14,headY+2,3,14,cloth);r(31,headY+2,4,17,shade);r(33,headY+6,2,10,cloth);
  r(17,bodyY+4,16,3,light);r(17,bodyY+7,3,15,'#b394aa');r(30,bodyY+8,2,18,'#baa3b1');
 }else if(kind==='judge'){
  r(16,headY-2,16,7,'#d4d3bc');r(13,headY+2,5,15,'#b1b9ad');r(30,headY+2,5,15,'#d6d7bf');
  for(let y=headY+4;y<headY+17;y+=3){r(13,y,4,1,'#e3debf');r(30,y,4,1,'#eeead0');}
  r(18,bodyY+1,13,5,'#ece5ca');r(22,bodyY+5,4,11,'#c9cbb9');r(12,bodyY+10,6,3,light);r(33,bodyY+10,5,3,light);
 }else if(kind==='prosecutor'){
  r(20,headY-5,9,6,outline);r(17,headY-2,16,5,shade);r(19,headY-4,11,2,light);r(18,headY+3,13,2,hair);
  r(20,headY+16,8,4,'#d3c5a3');r(17,bodyY,4,21,light);r(29,bodyY,4,21,light);r(22,bodyY+5,4,3,'#b36b55');
 }else if(kind==='defender'){
  r(17,headY,14,3,hair);r(17,headY+3,4,2,'#a48b65');r(17,headY+8,6,5,shade);r(25,headY+8,6,5,shade);r(19,headY+9,3,2,'#c9d8c6');r(26,headY+9,3,2,'#c9d8c6');r(23,headY+9,2,1,outline);
  r(19,bodyY,3,8,light);r(27,bodyY,3,8,light);r(23,bodyY+5,3,12,'#c8af77');
 }else{
  r(14,headY-2,20,9,outline);r(16,headY-4,16,9,cloth);r(18,headY-5,11,2,light);r(23,headY-4,2,8,'#d3d6bf');r(14,headY+4,20,3,shade);r(16,headY+7,3,12,shade);r(30,headY+7,3,12,cloth);
  r(16,bodyY+1,17,13,shade);r(18,bodyY+2,13,10,cloth);r(19,bodyY+3,11,2,light);r(18,bodyY+14,14,3,'#9d7751');r(23,bodyY+14,4,3,'#d9bc78');
  r(38,bodyY-10,2,39,'#846544');r(37,bodyY-13,4,7,shade);r(38,bodyY-16,2,7,light);
 }
 if(frame===2&&(elder||kind==='defender')){r(18,headY+11,4,1,outline);r(27,headY+11,3,1,outline);}
}
export function drawFairProp(c:CanvasRenderingContext2D,kind:'cat'|'lunch'|'parcel',frame=0):void{
 c.clearRect(0,0,32,32);const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 if(kind==='cat'){
  r(6,13,17,13,'#44404a');r(8,12,13,11,'#bca59d');r(11,9,13,12,'#e0cfc2');r(10,5,4,8,'#574953');r(20,5,4,8,'#574953');r(11,7,2,4,'#c18f92');r(21,7,2,4,'#c18f92');
  r(13,13,2,2,'#447777');r(20,13,2,2,'#447777');r(17,16,2,1,'#966c76');r(6,24,5,3,'#c2b4a8');r(18,24,5,3,'#e6dbcb');r(3,17,4,5,'#766773');r(2,11+(frame%2)*2,3,9,'#b9a4a1');r(10,17,5,1,'#f5e5cc');r(21,17,5,1,'#f5e5cc');
 }else if(kind==='lunch'){
  r(3,12,26,15,'#795a42');r(4,13,24,12,'#ceb785');r(5,14,22,1,'#f0dfac');r(7,16,12,7,'#9a653c');r(8,15,10,6,'#d2a466');r(10,15,1,4,'#f1ca81');r(14,15,1,4,'#f1ca81');r(21,15,4,7,'#9a4e44');r(21,13,3,3,'#4e7952');
 }else{
  r(4,8,24,20,'#564737');r(5,9,22,17,'#b38d5d');r(6,10,20,2,'#d5b879');r(5,20,22,2,'#997647');r(14,9,3,18,'#ebe0b7');r(5,15,22,2,'#e3d4a3');r(12,6,5,4,'#dec997');r(17,7,5,3,'#b99a68');
 }
}
