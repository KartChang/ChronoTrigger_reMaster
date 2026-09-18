import type {HeroPose,Ink} from './hero-art';
/** Native 48x64 authored pixels. No scaled legacy image, ROM input or sampled pixels.
 * These are production candidates; density and deterministic output are not artistic approval.
 */
export type HDHero='crono'|'marle'|'lucca'|'frog';
export const HD_HERO_IDS:readonly HDHero[]=['crono','marle','lucca','frog'];
export const HD_ART=Object.freeze({id:'party-redraw-48x64-r1',width:48,height:64,padding:2,pivot:{x:24,y:62},sampling:'nearest',method:'native-integer-pixel-redraw',approved:false} as const);
type Palette={ink:string;skin:string;shade:string;light:string;hair:string;hairDark:string;hairLight:string;cloth:string;dark:string;bright:string;boot:string};
const PALETTES:Record<HDHero,Palette>={
 crono:{ink:'#222a38',skin:'#e8b37d',shade:'#a9664f',light:'#ffe0a8',hair:'#c84827',hairDark:'#762f29',hairLight:'#ff9a44',cloth:'#278f98',dark:'#245266',bright:'#72c7ba',boot:'#77503b'},
 marle:{ink:'#34313c',skin:'#edbe8b',shade:'#b87857',light:'#ffe4b4',hair:'#d89b42',hairDark:'#976331',hairLight:'#ffe190',cloth:'#e9edcf',dark:'#91aea0',bright:'#fffae4',boot:'#ad7544'},
 lucca:{ink:'#2c2939',skin:'#e6b789',shade:'#a77259',light:'#ffe0b4',hair:'#796185',hairDark:'#40334f',hairLight:'#b493bb',cloth:'#c89150',dark:'#785647',bright:'#f0d498',boot:'#715744'},
 frog:{ink:'#26333c',skin:'#71a554',shade:'#38634d',light:'#b0cb70',hair:'#81b85e',hairDark:'#42654d',hairLight:'#c6d786',cloth:'#e4dcbb',dark:'#8e9c88',bright:'#faf1cd',boot:'#895940'},
};
const POSES:readonly string[]=['idle','walk','attack','cast','hurt','down','victory'];
export function drawHDHero(c:Ink,hero:HDHero,facing:number,frame:number,pose:HeroPose='idle'):void{
 if(!HD_HERO_IDS.includes(hero)||!Number.isInteger(facing)||facing<0||facing>3||!Number.isInteger(frame)||frame<0||frame>3||!POSES.includes(pose))throw new Error('Invalid HD actor frame');
 c.clearRect(0,0,HD_ART.width,HD_ART.height);
 const p=PALETTES[hero],back=facing===2,side=facing===1||facing===3,left=facing===3;
 const stride=pose==='walk'?(frame===1?2:frame===3?-2:0):0;
 const bob=pose==='walk'&&(frame===1||frame===3)?1:0,recoil=pose==='hurt'&&frame<3?1:0;
 const pixel=(x:number,y:number,col:string)=>{x+=recoil;y+=bob;if(left)x=47-x;if(x<1||x>46||y<1||y>62)return;c.fillStyle=col;c.fillRect(x,y,1,1);};
 const rect=(x:number,y:number,w:number,h:number,col:string)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)pixel(xx,yy,col);};
 const line=(x:number,y:number,ex:number,ey:number,col:string)=>{const dx=Math.abs(ex-x),dy=-Math.abs(ey-y),sx=x<ex?1:-1,sy=y<ey?1:-1;let e=dx+dy;for(;;){pixel(x,y,col);if(x===ex&&y===ey)break;const n=e*2;if(n>=dy){e+=dy;x+=sx;}if(n<=dx){e+=dx;y+=sy;}}};
 const poly=(points:readonly (readonly [number,number])[],col:string)=>{
  const ys=points.map(v=>v[1]);for(let y=Math.min(...ys);y<=Math.max(...ys);y++){
   const hits:number[]=[];for(let i=0;i<points.length;i++){const a=points[i]!,b=points[(i+1)%points.length]!;if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))hits.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}
   hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2)rect(Math.ceil(hits[i]!),y,Math.floor(hits[i+1]!)-Math.ceil(hits[i]!)+1,1,col);
  }
 };
 const ring=(cx:number,cy:number,rx:number,ry:number,col:string,fill:string)=>{
  for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const a=x*x/(rx*rx)+y*y/(ry*ry);if(a<=1)pixel(cx+x,cy+y,a>.60?col:fill);}
 };
 if(pose==='down'&&frame>=2){
  // Independent collapsed pose, not a rotated/scaled upright atlas cell.
  poly([[6,55],[12,48],[24,47],[35,52],[39,59],[31,61],[12,61]],p.ink);
  poly([[8,55],[15,49],[24,49],[30,55],[25,59],[11,59]],p.cloth);line(13,52,23,52,p.bright);line(11,58,26,58,p.dark);
  poly([[25,53],[32,51],[37,56],[34,60],[26,60]],p.boot);line(29,54,34,56,'#d4aa6d');
  ring(13,50,8,7,p.ink,p.hair);ring(12,53,5,4,p.shade,p.skin);line(9,52,13,54,p.ink);line(15,47,19,48,p.hairLight);
  if(hero==='lucca')ring(11,52,3,2,p.ink,'#aacbd0');
  if(hero==='frog'){ring(9,47,3,3,p.shade,p.light);pixel(9,47,p.ink);}
  if(frame===3){rect(19,57,5,2,p.skin);line(30,60,40,60,p.ink);}else rect(18,54,5,2,p.skin);
  return;
 }
 // Back-layer hair/cape has a native-pixel outline and its own silhouette.
 if(hero==='marle'){
  poly([[28,6],[34,4],[39,8],[39,18],[42,26],[37,34],[33,30],[35,23],[32,17]],p.ink);
  poly([[30,7],[35,6],[37,9],[37,19],[39,26],[36,31],[35,28],[36,22],[33,16]],p.hair);
  line(35,9,36,19,p.hairLight);line(37,24,36,29,p.hairLight);rect(29,8,7,3,'#438f91');
 }
 if(hero==='lucca'){
  poly([[14,16],[32,15],[36,28],[34,38],[28,36],[14,38],[11,29]],p.ink);
  poly([[15,17],[30,17],[33,28],[32,35],[28,33],[15,35],[13,28]],p.hairDark);line(15,24,15,33,p.hairLight);line(31,23,32,30,p.hair);
 }
 if(hero==='frog'){
  poly([[12,31],[33,31],[40,51],[34,56],[9,54],[7,50]],p.ink);
  poly([[13,32],[31,32],[37,51],[31,53],[10,51]],'#8d6348');line(13,35,11,49,'#b8915d');line(30,36,33,49,'#594633');
 }
 // Boots, knees and trouser seams use odd-pixel details absent in the legacy cells.
 for(const [x,move,near] of [[16,-stride,true],[26,stride,false]] as const){
  const footY=59-Math.max(0,move);
  poly([[x,44],[x+7,44],[x+6,52],[x+7+move,footY],[x-1+move,footY],[x,51]],p.ink);
  poly([[x+1,45],[x+5,45],[x+4,52],[x+5+move,footY-1],[x+move,footY-1],[x+2,51]],hero==='marle'?p.cloth:hero==='frog'?p.skin:near?'#667d79':'#354955');
  line(x+2,46,x+2,51,hero==='marle'?p.bright:'#98a89c');pixel(x+3,52,p.dark);
  poly([[x-1+move,footY-5],[x+5+move,footY-5],[x+8+move,footY-1],[x+7+move,footY+2],[x-2+move,footY+2]],p.ink);
  rect(x+move,footY-4,5,4,p.boot);rect(x+move,footY,7,1,'#9c6e45');line(x+1+move,footY-3,x+4+move,footY-3,'#d4aa70');pixel(x+2+move,footY-1,'#e8c88a');
 }
 const crouch=(pose==='attack'&&frame===0)||(pose==='hurt'&&frame===2)||(pose==='down')?2:0;
 const torsoY=32+crouch;
 poly([[15,torsoY],[30,torsoY],[34,40],[32,48],[13,48],[11,40]],p.ink);
 poly([[16,torsoY+1],[29,torsoY+1],[31,40],[30,46],[15,46],[13,40]],p.cloth);
 poly([[14,38],[18,39],[18,45],[14,45]],p.dark);poly([[20,34+crouch],[27,35+crouch],[29,40],[21,39]],p.bright);
 line(20,42,28,43,p.dark);line(20,44,26,44,p.bright);pixel(29,38,p.dark);
 rect(14,46,17,3,hero==='crono'?'#605440':'#658477');rect(21,46,4,3,'#c5a45b');rect(22,47,2,1,'#f8dda0');
 if(back){line(22,35+crouch,23,44,p.dark);line(24,36+crouch,25,44,p.bright);}
 // Separate arm poses. Forearm movement does not move body coordinates or collision.
 const raise=pose==='cast'||pose==='victory';
 for(const [x,dir] of [[12,-1],[33,1]] as const){
  const ay=raise?22-frame%2*2:pose==='attack'&&dir===1?32:35+(dir===-1?stride:-stride);
  poly([[x,ay],[x+dir*5,ay+1],[x+dir*6,ay+8],[x+dir*3,ay+13],[x-dir,ay+9]],p.ink);
  poly([[x,ay+1],[x+dir*3,ay+2],[x+dir*4,ay+7],[x+dir*2,ay+10],[x,ay+8]],dir===-1?p.cloth:p.dark);
  rect(Math.min(x,x+dir*3),ay+9,4,4,p.shade);rect(Math.min(x,x+dir*3)+1,ay+9,2,3,p.skin);pixel(x+dir,ay+9,p.light);
 }
 // Face contour, ear, jaw and 1px features.
 const faceX=side?25:23,headY=pose==='hurt'?22:21;
 if(hero==='frog'){
  poly([[13,headY-6],[16,headY-12],[20,headY-11],[26,headY-12],[31,headY-9],[35,headY-1],[33,headY+7],[26,headY+11],[16,headY+9],[10,headY+3]],p.ink);
  poly([[14,headY-5],[18,headY-10],[21,headY-8],[27,headY-10],[30,headY-7],[33,headY],[30,headY+7],[25,headY+9],[16,headY+7],[12,headY+2]],p.skin);
  if(!back){ring(side?29:16,headY-6,4,5,p.shade,p.light);if(!side)ring(28,headY-6,4,5,p.shade,p.light);rect(side?30:16,headY-7,2,4,p.ink);if(!side)rect(28,headY-7,2,4,p.ink);line(15,headY+5,30,headY+5,p.shade);pixel(30,headY+3,p.ink);}
  else {poly([[15,headY-3],[28,headY-5],[32,headY+1],[26,headY+5],[16,headY+3]],p.light);rect(17,headY,2,2,p.shade);rect(28,headY+2,2,1,p.shade);}
 }else{
  poly([[faceX-8,12],[faceX+6,12],[faceX+9,17],[faceX+8,27],[faceX+3,32],[faceX-5,30],[faceX-9,25],[faceX-10,18]],p.ink);
  poly([[faceX-7,15],[faceX+5,14],[faceX+7,18],[faceX+6,26],[faceX+2,30],[faceX-4,28],[faceX-7,24]],p.skin);
  line(faceX-6,23,faceX-4,27,p.shade);line(faceX-4,29,faceX+2,30,p.shade);line(faceX-1,17,faceX+4,18,p.light);
  rect(faceX+7,23,2,3,p.shade);pixel(faceX+7,23,p.light);
  if(hero==='crono'){
   poly([[11,18],[8,12],[14,12],[12,7],[19,9],[19,2],[24,6],[29,3],[30,8],[36,6],[35,12],[40,11],[35,19],[31,21],[15,20]],p.ink);
   poly([[12,16],[11,13],[16,14],[15,9],[20,11],[20,5],[24,9],[28,6],[29,12],[34,9],[32,15],[36,14],[32,19],[15,18]],p.hair);
   poly([[16,11],[20,14],[18,17],[14,15]],p.hairLight);poly([[22,6],[24,10],[23,15],[21,13]],p.hairLight);poly([[28,9],[29,13],[26,18],[25,16]],'#ec682f');line(32,12,30,17,p.hairLight);
   rect(15,19,17,3,'#d9d5b6');rect(16,19,15,1,'#fff0c3');line(16,21,21,21,'#9ca99d');rect(32,20,3,2,'#bdb590');
   poly([[15,30],[27,30],[32,32],[28,35],[17,34],[13,33]],'#b77b38');line(17,31,27,31,'#f1c66a');
   poly([[back?16:29,34],[back?11:34,35],[back?13:36,42],[back?17:32,41],[back?18:31,37]],'#dba94c');
   pixel(back?14:33,38,'#ffe094');
  }else if(hero==='marle'){
   poly([[13,17],[14,10],[20,7],[28,9],[32,14],[32,21],[29,20],[25,15],[19,19],[13,22]],p.hairDark);
   poly([[15,15],[17,10],[23,9],[28,12],[30,17],[27,17],[24,12],[20,16]],p.hair);line(17,12,22,10,p.hairLight);line(24,10,28,14,p.hairLight);
   if(!back){rect(21,32,5,2,p.skin);rect(23,34,2,2,'#aa9254');rect(22,36,4,4,'#367f8a');pixel(23,36,'#c1efe0');pixel(24,38,'#70c7c7');}else{line(22,34,22,43,p.dark);line(24,34,24,43,p.bright);}
   line(17,42,21,41,p.bright);line(26,41,29,42,p.bright);
  }else{
   poly([[13,18],[14,10],[19,6],[29,6],[34,12],[34,19]],p.ink);
   poly([[15,15],[16,10],[20,8],[28,8],[31,12],[32,15]],'#899678');poly([[17,10],[23,8],[28,9],[29,11],[17,12]],'#bcc4a0');
   rect(13,15,21,3,'#c4b185');line(15,15,32,15,'#eee0ac');rect(14,18,19,2,'#72644f');
   rect(29,9,4,4,'#ab7e4c');pixel(30,9,'#e2b768');line(30,10,30,13,'#694e3b');
   line(26,35,24,45,'#75604b');line(28,35,26,45,'#e7be7b');rect(19,39,3,3,'#e6c58b');pixel(20,40,p.dark);
  }
  if(back){
   poly([[15,22],[29,21],[32,24],[29,29],[24,31],[17,29]],p.hair);line(18,23,19,28,p.hairLight);line(24,22,26,28,p.hairDark);pixel(28,27,p.hairLight);
  }else if(hero==='lucca'){
   if(side){ring(30,23,5,4,p.ink,'#b6d5ce');pixel(31,22,'#f0ffec');rect(25,22,1,1,'#747080');}
   else{ring(18,23,5,4,p.ink,'#9fbcbf');ring(29,23,5,4,p.ink,'#c5dbd0');line(22,23,25,23,'#63555b');pixel(17,22,'#e4f5de');pixel(29,22,'#f5ffeb');}
   line(23,29,26,29,p.shade);
  }else{
   const eyes=side?[30]:[19,28];for(const ex of eyes){rect(ex,23,2,3,p.ink);pixel(ex,23,p.light);pixel(ex+1,25,hero==='marle'?'#4c8f85':'#4f7886');}
   if(side){pixel(33,25,p.light);pixel(34,26,p.skin);}else{pixel(24,26,p.light);line(22,29,25,29,p.shade);}
  }
 }
 if(pose==='attack'||(pose==='victory'&&(hero==='crono'||hero==='frog'))){
  if(hero==='crono'||hero==='frog'){
   if(frame<=1||pose==='victory'){poly([[35,37],[39,12],[41,8],[42,13],[38,37]],p.ink);line(37,35,41,11,'#95bdc8');line(38,33,41,13,'#eaffec');line(34,36,40,37,'#ddb96e');rect(35,38,2,5,'#88633e');}
   else{poly([[33,39],[42,25],[45,24],[44,29],[36,43]],p.ink);line(35,39,44,26,'#b6d8d6');line(37,38,44,27,'#fff6d9');line(33,39,37,43,'#c2a167');}
  }else if(hero==='marle'){
   poly([[36,25],[41,28],[44,35],[42,42],[37,47],[38,41],[40,35],[38,30]],'#a87842');line(36,26,37,46,'#eedbad');line(34,35,45,35,'#c4d1c7');pixel(44,34,'#ffffff');
  }else{rect(35,33,10,4,p.ink);rect(36,33,8,1,'#b7c1b3');rect(35,37,3,4,p.boot);pixel(41,35,'#6c878c');if(frame===2){rect(45,32,1,6,'#ffe0a0');pixel(43,31,'#ffd065');}}
 }
 if(pose==='cast'&&frame===2){for(const [x,y] of [[8,20],[36,18],[11,16]] as const){pixel(x,y,'#eaffd2');pixel(x+1,y+1,'#70c8bf');}}
 if(pose==='hurt'&&frame<2&&!back){line(18,24,21,24,p.ink);line(27,24,30,24,p.ink);}
}
