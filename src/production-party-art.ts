import {drawHDHero,HD_HERO_IDS,HD_ART} from './hd-hero-art';
import type {HDHero} from './hd-hero-art';
import type {HeroPose,Ink} from './hero-art';

/** Authored at native resolution, not a recolour, resized image or ROM extraction.
 * Action/reaction cells remain exact legacy pixels while their native evidence is pinned.
 * The geometry/clock profile remains HD_ART; this is a separately reported paint profile.
 */
export const PARTY_ART=Object.freeze({id:'vq04d-party-exploration-redraw',width:48,height:64,pivot:HD_ART.pivot,padding:2,
 approved:false,redrawnPoses:['idle','walk','ready','victory'] as readonly HeroPose[],
 retainedPoses:['attack','cast','hurt','down'] as readonly HeroPose[]});
type Point=readonly[number,number];
type Palette={hair:string;hairShade:string;hairLight:string;skin:string;skinShade:string;skinLight:string;coat:string;shade:string;light:string;boots:string};
const colours:Record<HDHero,Palette>={
 crono:{hair:'#ba4728',hairShade:'#782f26',hairLight:'#f59645',skin:'#e3b78c',skinShade:'#b57659',skinLight:'#ffe0ac',coat:'#367c91',shade:'#26495d',light:'#74b9bd',boots:'#8b5938'},
 marle:{hair:'#c29844',hairShade:'#8a6033',hairLight:'#ffe097',skin:'#efc09a',skinShade:'#bd8066',skinLight:'#ffe4bb',coat:'#e5e7d3',shade:'#9aaf9f',light:'#fff8df',boots:'#b77841'},
 lucca:{hair:'#83618d',hairShade:'#47394f',hairLight:'#b994c1',skin:'#e6b38b',skinShade:'#af745c',skinLight:'#ffddb0',coat:'#b6854b',shade:'#705238',light:'#dfb776',boots:'#674d3c'},
 frog:{hair:'#6f9850',hairShade:'#385b45',hairLight:'#b4cf79',skin:'#81a666',skinShade:'#4b7151',skinLight:'#d0dc93',coat:'#d7d6bd',shade:'#869789',light:'#fff0cb',boots:'#85523a'},
};
const INK='#20272b';
/** Four directions, original 4-slot contact/stride cycle and original pivots. */
export function drawProductionParty(c:Ink,hero:HDHero,facing:number,frame:number,pose:HeroPose='idle'):void{
 if(!HD_HERO_IDS.includes(hero)||!Number.isInteger(facing)||facing<0||facing>3||!Number.isInteger(frame)||frame<0||frame>3||!['idle','walk','ready','victory','attack','cast','hurt','down'].includes(pose))throw new RangeError('Invalid production party cell');
 if(PARTY_ART.retainedPoses.includes(pose)){drawHDHero(c,hero,facing,frame,pose);return;}
 c.clearRect(0,0,48,64);
 const p=colours[hero],side=facing===1||facing===3,back=facing===2,left=facing===3;
 const stride=pose==='walk'?(frame===1?3:frame===3?-3:0):0;
 const lift=pose==='walk'&&stride!==0?-1:pose==='idle'&&frame===1?-1:0;
 const blink=(pose==='idle'||pose==='ready')&&frame===2,raised=pose==='victory';
 function dot(x:number,y:number,col:string){if(left)x=47-x;if(x<2||x>45||y<2||y>61)return;c.fillStyle=col;c.fillRect(x,y,1,1);}
 function rect(x:number,y:number,w:number,h:number,col:string){for(let j=0;j<h;j++)for(let i=0;i<w;i++)dot(x+i,y+j,col);}
 function line(x:number,y:number,bx:number,by:number,col:string){let dx=Math.abs(bx-x),dy=-Math.abs(by-y),sx=x<bx?1:-1,sy=y<by?1:-1,e=dx+dy;for(;;){dot(x,y,col);if(x===bx&&y===by)break;const n=e*2;if(n>=dy){e+=dy;x+=sx;}if(n<=dx){e+=dx;y+=sy;}}}
 function poly(v:readonly Point[],col:string){for(let y=Math.min(...v.map(p=>p[1]));y<=Math.max(...v.map(p=>p[1]));y++){const xs:number[]=[];for(let i=0;i<v.length;i++){const a=v[i]!,b=v[(i+1)%v.length]!;if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)rect(Math.ceil(xs[i]!),y,Math.floor(xs[i+1]!)-Math.ceil(xs[i]!)+1,1,col);}}
 function oval(x:number,y:number,rx:number,ry:number,col:string){for(let j=-ry;j<=ry;j++){const w=Math.floor(rx*Math.sqrt(Math.max(0,1-j*j/(ry*ry))));rect(x-w,y+j,w*2+1,1,col);}}
 // The rear silhouette is drawn first: tied hair, short bob, cloak and scabbard.
 if(hero==='marle'){
  const sway=stride>0?2:stride<0?-1:0;
  poly([[29,12+lift],[35,8+lift],[40,12+lift],[39,25+lift],[42+sway,34+lift],[38+sway,40+lift],[33+sway,36+lift],[34,25+lift]],INK);
  poly([[31,13+lift],[35,10+lift],[38,13+lift],[37,25+lift],[40+sway,34+lift],[37+sway,37+lift],[35+sway,34+lift],[36,23+lift]],p.hair);
  line(35,13+lift,35,24+lift,p.hairLight);line(36,26+lift,38+sway,33+lift,p.hairLight);
  rect(29,14+lift,7,3,'#39878c');rect(30,14+lift,4,1,'#9bd4c0');
 }
 if(hero==='lucca'){
  poly([[14,20+lift],[33,19+lift],[37,31+lift],[32,36+lift],[16,35+lift],[12,30+lift]],INK);
  poly([[16,21+lift],[32,21+lift],[34,30+lift],[30,33+lift],[16,33+lift],[14,28+lift]],p.hair);
  line(16,25+lift,17,32+lift,p.hairLight);line(30,25+lift,32,30+lift,p.hairShade);
 }
 if(hero==='frog'){
  poly([[14,32+lift],[31,30+lift],[35,37],[39,53],[33,57],[9,55],[7,51]],INK);
  poly([[15,34+lift],[30,33+lift],[33,39],[36,53],[30,54],[10,52]],'#835b43');
  poly([[13,36],[17,35],[14,49],[11,52]],'#c09663');line(29,36,33,52,'#4f4234');
 }else if(hero==='crono'){
  line(side?16:12,33+lift,side?12:9,55,'#1f2d34');line(side?17:13,33+lift,side?13:10,55,'#695947');
 }
 // Two individually articulated legs and asymmetrical boots. The plant stays at y=61.
 const legs:readonly (readonly [number,number])[]=side?[[21,-stride],[27,stride]]:[[16,-stride],[27,stride]];
 for(const [x,step]of legs){const top=45,foot=step>0?59-step:60;
  poly([[x!,top],[x!+6,top],[x!+6,51],[x!+step!,foot-3],[x!+step!+7,foot-1],[x!+step!+7,61],[x!+step!-2,61],[x!+step!-2,foot-3],[x!-1,51]],INK);
  poly([[x!+1,top+1],[x!+5,top+1],[x!+4,52],[x!+step!+3,foot-2],[x!+step!,foot-2],[x!+1,51]],hero==='frog'?p.skin:hero==='marle'?p.coat:'#647d78');
  line(x!+1,47,x!+1,51,hero==='frog'?p.skinLight:hero==='marle'?p.light:'#a3afa0');
  rect(x!+step!-1,foot-2,6,Math.max(1,60-(foot-2)),p.boots);rect(x!+step!-1,60,8,1,'#c49a64');
  rect(x!+step!-2,61,10,1,INK);
  line(x!+step!,foot-2,x!+step!+4,foot-2,'#e1ba7e');dot(x!+step!+5,59,'#5d4436');
 }
 // Relaxed pear-shaped tunic rather than a rectangular chest plate.
 const ty=31+lift;
 poly(side?[[20,ty],[29,ty],[33,39+lift],[30,49],[18,48],[16,40+lift]]:[[16,ty],[29,ty],[33,35+lift],[34,45],[31,49],[13,49],[11,44],[12,36+lift]],INK);
 poly(side?[[21,ty+1],[28,ty+1],[30,39+lift],[29,47],[20,46],[18,40+lift]]:[[17,ty+1],[28,ty+1],[31,37+lift],[31,45],[29,47],[15,47],[13,43],[14,37+lift]],p.coat);
 poly(side?[[19,36+lift],[22,38+lift],[21,45],[19,44]]:[[14,35+lift],[18,36+lift],[18,43],[16,46],[14,43]],p.shade);
 line(side?25:23,34+lift,side?28:27,41+lift,p.light);line(side?21:19,43,side?29:29,44,p.shade);
 if(back){line(23,33+lift,24,44,p.shade);line(25,34+lift,26,42,p.light);}
 if(hero==='crono'){
  poly(side?[[21,30+lift],[30,30+lift],[33,34+lift],[27,36+lift],[22,34+lift]]:[[14,30+lift],[29,30+lift],[32,33+lift],[25,36+lift],[16,34+lift]],'#d7a24e');
  line(16,31+lift,28,31+lift,'#ffe1a0');poly([[15,34+lift],[19,35+lift],[17,44],[13,42]],'#a96c35');
 }else if(hero==='marle'){
  rect(side?20:14,45,side?11:17,3,'#3c8584');line(side?21:15,45,side?29:30,45,'#91c5b1');
  if(!back){oval(side?27:24,34+lift,2,2,'#b08d3e');dot(side?27:24,33+lift,'#ffe59b');}
 }else if(hero==='lucca'){
  line(side?22:18,33+lift,side?29:28,45,'#574833');line(side?23:19,33+lift,side?30:29,45,'#d0b076');
  rect(side?19:13,41,6,5,'#695641');rect(side?20:14,41,4,1,'#d4af69');dot(side?22:16,43,'#ffe0a0');
 }else{line(15,35+lift,20,37+lift,'#a7b5a0');line(28,34+lift,29,42,p.shade);}
 if(hero!=='marle'){rect(side?18:13,46,side?13:19,2,'#735334');rect(side?25:23,46,3,2,'#dec47d');}
 // Bent elbows and exposed hands; readiness and victory do not change the clock.
 for(const [x,dir]of (side?[[18,-1],[31,1]]:[[13,-1],[32,1]]) as [number,number][]){
  const raise=raised||(pose==='ready'&&dir===1),swing=pose==='walk'?(dir===1?-stride:stride):0;
  const shoulder=34+lift,end=raise?24-(frame%2):45+swing;
  poly([[x,shoulder],[x+dir*4,shoulder+2],[x+dir*6,raise?29:39+swing],[x+dir*5,end],[x+dir,end+1],[x-dir,raise?32:40+swing]],INK);
  poly([[x,shoulder+1],[x+dir*2,shoulder+3],[x+dir*4,raise?30:39+swing],[x+dir*3,end-1],[x+dir,end-1],[x,raise?33:39+swing]],dir<0?p.coat:p.shade);
  const hx=Math.min(x+dir,x+dir*4);rect(hx,end-2,4,4,INK);rect(hx+1,end-2,2,3,p.skin);dot(hx+1,end-2,p.skinLight);
 }
 // Jaw and ears are distinct from the hair mass. Face height is 16 native pixels.
 const cx=side?26:23,hy=21+lift;
 if(hero==='frog'){
  oval(cx,hy+1,12,10,INK);oval(cx,hy+1,10,8,p.skin);oval(cx-2,hy+5,8,4,p.skinLight);
  if(!back){for(const ex of side?[cx+5]:[cx-7,cx+6]){oval(ex,hy-6,5,6,INK);oval(ex,hy-6,4,5,p.skinLight);if(blink)line(ex-2,hy-6,ex+2,hy-6,INK);else{rect(ex,hy-8,2,5,INK);dot(ex,hy-8,'#fff7d0');}}line(cx-7,hy+5,cx+7,hy+5,p.skinShade);dot(cx+8,hy+3,INK);}
  else{poly([[cx-7,hy-4],[cx-3,hy-7],[cx+5,hy-5],[cx+8,hy+2],[cx+3,hy+5],[cx-6,hy+2]],p.hairLight);dot(cx-5,hy-1,p.hairShade);dot(cx+4,hy+2,p.hairShade);}
 }else{
  oval(cx,hy+1,9,10,INK);oval(cx,hy+1,8,8,p.skin);poly([[cx-7,hy],[cx-4,hy+4],[cx+3,hy+6],[cx+4,hy+8],[cx-3,hy+8],[cx-7,hy+4]],p.skinShade);
  oval(cx+8,hy+3,2,3,INK);rect(cx+8,hy+2,2,3,p.skin);line(cx-1,hy-4,cx+5,hy-3,p.skinLight);
  if(back){oval(cx,hy,9,9,p.hairShade);oval(cx-1,hy-2,7,7,p.hair);line(cx-5,hy-3,cx-3,hy+5,p.hairLight);}
  if(hero==='crono'){
   poly(side?[[16,21+lift],[12,15+lift],[17,15+lift],[13,10+lift],[20,11+lift],[20,5+lift],[26,10+lift],[31,6+lift],[31,12+lift],[38,12+lift],[34,17+lift],[37,19+lift],[31,23+lift]]:[[13,22+lift],[9,16+lift],[14,16+lift],[10,10+lift],[18,12+lift],[17,5+lift],[23,10+lift],[28,5+lift],[29,12+lift],[35,8+lift],[34,15+lift],[39,14+lift],[34,22+lift]],INK);
   poly([[14,19+lift],[13,17+lift],[17,17+lift],[14,13+lift],[21,15+lift],[20,9+lift],[24,14+lift],[27,10+lift],[28,16+lift],[32,13+lift],[31,18+lift],[35,17+lift],[31,21+lift]],p.hair);
   line(16,13+lift,20,18+lift,p.hairLight);line(21,10+lift,24,17+lift,p.hairLight);line(28,13+lift,28,18+lift,'#e57334');
   rect(side?19:15,20+lift,side?14:17,2,'#f4dfb1');line(side?19:15,22+lift,side?31:31,22+lift,'#a39478');
   if(back){rect(20,21+lift,4,3,'#f4dfb1');line(21,24+lift,18,29+lift,'#d0b28b');line(24,24+lift,25,29+lift,'#d0b28b');}
  }else if(hero==='marle'){
   poly([[14,23+lift],[12,17+lift],[16,11+lift],[24,8+lift],[31,12+lift],[34,18+lift],[31,22+lift],[28,16+lift],[22,17+lift],[18,22+lift]],INK);
   poly([[15,19+lift],[15,16+lift],[18,12+lift],[24,10+lift],[29,13+lift],[31,17+lift],[28,15+lift],[22,15+lift],[18,19+lift]],p.hair);
   line(18,14+lift,23,11+lift,p.hairLight);line(16,18+lift,20,16+lift,'#ffe8a7');
  }else{
   poly([[12,19+lift],[14,11+lift],[19,7+lift],[29,7+lift],[34,12+lift],[35,19+lift],[38,21+lift],[12,22+lift],[9,20+lift]],INK);
   poly([[14,18+lift],[16,12+lift],[20,9+lift],[28,9+lift],[32,13+lift],[33,19+lift]],'#ad875a');
   line(20,10+lift,19,17+lift,'#edd09b');line(29,11+lift,31,17+lift,'#6c5a43');rect(12,19+lift,24,2,'#d9bb83');rect(11,21+lift,26,1,'#5b4935');
   rect(23,8+lift,3,4,'#647685');dot(24,9+lift,'#bacccc');
  }
  if(!back){
   if(hero==='lucca'){
    for(const ex of side?[31]:[18,29]){oval(ex,25+lift,5,4,INK);oval(ex,25+lift,4,3,'#bfd7d1');if(blink)line(ex-2,26+lift,ex+2,26+lift,'#5c7180');else{rect(ex,24+lift,2,3,'#384655');dot(ex-2,23+lift,'#f3fff0');}}
    if(!side)line(22,25+lift,25,25+lift,INK);
   }else{for(const ex of side?[30]:[19,28]){if(blink)line(ex-1,25+lift,ex+2,25+lift,INK);else{rect(ex-1,24+lift,3,3,p.skinLight);rect(ex,24+lift,2,3,INK);dot(ex,24+lift,hero==='marle'?'#398c81':'#45666d');}}}
   dot(side?34:24,27+lift,p.skinLight);line(side?29:22,29+lift,side?31:25,29+lift,p.skinShade);
  }
 }
 if(pose==='ready'&&(hero==='crono'||hero==='frog')){line(37,39,42,15,INK);line(38,38,43,15,INK);line(38,36,42,17,'#e1f1e8');line(39,31,42,18,'#8cadb6');line(35,38,40,39,'#d6b375');rect(36,40,2,4,'#865b3c');}
 if(pose==='ready'&&hero==='marle'){line(37,27,42,33,'#ab763c');line(42,33,38,43,'#ab763c');line(37,27,38,43,'#f0d3a0');line(34,35,44,35,'#879ba2');}
 if(pose==='ready'&&hero==='lucca'){rect(34,32,10,4,INK);rect(35,32,8,1,'#b4c4c5');rect(34,36,3,3,p.boots);}
 if(pose==='idle'&&frame===3){dot(side?29:29,41,p.light);line(side?21:16,41,side?21:17,44,p.shade);}
}
