/** VQ04A authored environment surfaces. Pure pixel data, not a screenshot/backplate of gameplay.
 * No ROM/image/AI-service inputs: the two approved concept images inform the palette only.
 * Coordinates of paths, texture pivots and existing geometry remain in their established units.
 */
import {canyonPathBounds} from './canyon-art';
export type ProductionSurface='canyon-ground'|'canyon-rock'|'canyon-turf'|'canopy-atlas'|'mountain-distance'|'court-ground'|'court-dais'|'court-stone'|'court-wood'|'court-timber'|'court-velvet'|'court-window'|'court-banner';
export const PRODUCTION_ART=Object.freeze({id:'vq04b-authored-environment',approved:false,romPixels:false,
 dimensions:{'canyon-ground':[768,672],'canyon-rock':[128,128],'canyon-turf':[128,128],'canopy-atlas':[544,160],
  'mountain-distance':[640,256],'court-ground':[768,704],'court-dais':[256,320],'court-stone':[128,128],
  'court-wood':[128,128],'court-timber':[128,128],'court-velvet':[64,256],'court-window':[256,160],'court-banner':[96,256]} as const});
export type PixelSurface={width:number;height:number;rgba:Uint8ClampedArray};
type RGB=readonly[number,number,number];
const clamp=(v:number,l=0,h=1)=>Math.max(l,Math.min(h,v));
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const mix=(a:RGB,b:RGB,t:number):RGB=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
function hash(x:number,y:number,seed=1):number{let n=Math.imul(x+seed*23,374761393)^Math.imul(y+seed*17,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
function field(x:number,y:number,seed=1):number{const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);return lerp(lerp(hash(ix,iy,seed),hash(ix+1,iy,seed),sx),lerp(hash(ix,iy+1,seed),hash(ix+1,iy+1,seed),sx),sy);}
class Paint implements PixelSurface{
 readonly rgba:Uint8ClampedArray;
 constructor(readonly width:number,readonly height:number){this.rgba=new Uint8ClampedArray(width*height*4);}
 pixel(x:number,y:number,c:RGB,alpha=255):void{if(x<0||y<0||x>=this.width||y>=this.height)return;const i=(Math.floor(y)*this.width+Math.floor(x))*4;this.rgba[i]=c[0];this.rgba[i+1]=c[1];this.rgba[i+2]=c[2];this.rgba[i+3]=alpha;}
 at(x:number,y:number):RGB{const i=(Math.floor(y)*this.width+Math.floor(x))*4;return [this.rgba[i]!,this.rgba[i+1]!,this.rgba[i+2]!];}
 rect(x:number,y:number,w:number,h:number,c:RGB):void{for(let py=Math.max(0,Math.floor(y));py<Math.min(this.height,y+h);py++)for(let px=Math.max(0,Math.floor(x));px<Math.min(this.width,x+w);px++)this.pixel(px,py,c);}
 line(ax:number,ay:number,bx:number,by:number,c:RGB,width=1):void{const steps=Math.max(1,Math.ceil(Math.max(Math.abs(bx-ax),Math.abs(by-ay))));for(let i=0;i<=steps;i++)this.rect(Math.round(lerp(ax,bx,i/steps)),Math.round(lerp(ay,by,i/steps)),width,width,c);}
 ellipse(cx:number,cy:number,rx:number,ry:number,c:RGB):void{for(let y=-ry;y<=ry;y++){const half=Math.floor(rx*Math.sqrt(Math.max(0,1-y*y/(ry*ry))));this.rect(cx-half,cy+y,half*2+1,1,c);}}
 blit(source:PixelSurface,x:number,y:number):void{for(let j=0;j<source.height;j++)for(let i=0;i<source.width;i++){const at=(j*source.width+i)*4;if(source.rgba[at+3])this.pixel(x+i,y+j,[source.rgba[at]!,source.rgba[at+1]!,source.rgba[at+2]!],source.rgba[at+3]);}}
}
const gold:RGB=[210,170,80],goldLight:RGB=[248,223,151],ink:RGB=[31,39,34];
function crest(p:Paint,cx:number,cy:number,s:number):void{
 // Authored sun-and-wings heraldry, not copied ROM signage or text.
 for(let i=0;i<8;i++){const a=i*Math.PI/4;p.line(cx+Math.cos(a)*s*.35,cy+Math.sin(a)*s*.35,cx+Math.cos(a)*s,cy+Math.sin(a)*s,gold,Math.max(1,s/8));}
 p.ellipse(cx,cy,Math.max(2,Math.floor(s*.33)),Math.max(2,Math.floor(s*.33)),goldLight);
 p.line(cx-s*.72,cy+s*.45,cx,cy+s*.8,gold);p.line(cx,cy+s*.8,cx+s*.72,cy+s*.45,gold);
}
function tuft(p:Paint,x:number,y:number,size:number,color:RGB,seed:number):void{
 const dark=mix(color,[27,48,29],.4);p.ellipse(x,y,Math.max(2,size),2,dark);
 for(let k=0;k<5;k++){const dx=Math.round((hash(k,seed,3)-.5)*size*2),rise=2+Math.round(hash(k,seed,4)*size*1.6);p.line(x,y,x+dx,y-rise,color);if(k%2===0)p.pixel(x+dx,y-rise-1,mix(color,[222,217,116],.25));}
}
function canyonGround(p:Paint):void{
 for(let y=0;y<p.height;y++){
  const bounds=canyonPathBounds(y/1.5),left=bounds.left*1.5,right=bounds.right*1.5;
  for(let x=0;x<p.width;x++){
   const path=x>=left&&x<right,broad=field(x/68,y/60,601),grain=hash(x,y,602),fine=field(x/11,y/9,606);
   let c:RGB;
   if(path){const center=(left+right)/2,wear=clamp(1-Math.abs(x-center)/((right-left)*.46));c=mix([123,98,61],[186,154,100],broad*.55+wear*.35+fine*.10);c=mix(c,[91,75,52],grain<.012?.17:grain<.04?.045:0);if(grain>.992)c=mix(c,[225,197,144],.16);}
   else{c=mix([43,67,38],[117,139,64],broad*.75+fine*.25);const edge=Math.min(Math.abs(x-left),Math.abs(x-right));if(edge<8)c=mix(c,[128,123,65],(1-edge/8)*.6);c=mix(c,[29,58,38],grain<.08?.15:0);}
   // Large contiguous pools of warm light; the travel corridor stays quiet and readable.
   const light=clamp(1-Math.abs(x-(210+y*.23))/245)*.12;p.pixel(x,y,mix(c,[224,199,127],light));
  }
 }
 for(let i=0;i<1050;i++){const x=8+Math.floor(hash(i,2,6)*(p.width-16)),y=12+Math.floor(hash(i,3,6)*(p.height-24)),b=canyonPathBounds(y/1.5);if(x>b.left*1.5+2&&x<b.right*1.5-2)continue;tuft(p,x,y,2+Math.floor(hash(i,4,6)*4),mix([66,96,44],[152,161,79],hash(i,5,6)),i);if(i%19===0){p.rect(x,y-5,2,2,[234,216,138]);p.pixel(x+1,y-6,[255,240,178]);}}
 for(let i=0;i<185;i++){const y=10+Math.floor(hash(i,8,6)*(p.height-20)),b=canyonPathBounds(y/1.5),x=Math.floor((i%2?b.left:b.right)*1.5+(hash(i,9,6)-.5)*20),r=1+Math.floor(hash(i,10,6)*3);p.ellipse(x,y+1,r+1,2,[85,85,60]);p.ellipse(x,y,r,1,[170,159,116]);}
}
function canyonRock(p:Paint):void{
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
  const bend=Math.sin(x*.09)*2+Math.sin(x*.031)*4,sy=(y+bend+128)%128,band=Math.floor(sy/16),line=sy%16;
  let c=mix([78,76,59],[156,140,103],field(x/22,y/11,62)*.55+hash(band,2,61)*.20+.15);
  if(line<2)c=mix(c,[40,49,40],.7);else if(line<4)c=mix(c,[206,184,132],.45);else if(line>13)c=mix(c,[55,61,45],.25);
  c=mix(c,[206,190,149],hash(x,y,44)>.92?.16:0);p.pixel(x,y,c);
 }
 for(let i=0;i<28;i++){const x=Math.floor(hash(i,1,16)*128),y=Math.floor(hash(i,3,16)*128);let ox=x;for(let j=0;j<7+hash(i,4,16)*19;j++){const nx=x+Math.floor(Math.sin(j*.23+i)*3);p.line(ox,y+j-1,nx,y+j,[58,61,48]);p.pixel(nx-1,y+j,[166,149,107]);ox=nx;}}
 for(let i=0;i<110;i++){const x=Math.floor(hash(i,9,16)*128),y=Math.floor(hash(i,8,16)*22);tuft(p,x,y,2,mix([50,74,41],[124,141,68],hash(i,5,16)),i);}
}
function turf(p:Paint):void{
 for(let y=0;y<128;y++)for(let x=0;x<128;x++)p.pixel(x,y,mix([43,73,39],[130,146,67],field(x/23,y/21,617)*.85+hash(x,y,62)*.15));
 for(let i=0;i<210;i++){const x=Math.floor(hash(i,4,18)*128),y=Math.floor(hash(i,7,18)*128);tuft(p,x,y,2,mix([65,97,43],[167,171,87],hash(i,5,18)),i);}
}
function oak(variant:number):PixelSurface{
 const p=new Paint(128,160),sway=[-3,5,-6,2][variant]!;
 // Forked trunk with a continuous root; the silhouette is not six stacked discs.
 for(let y=58;y<154;y++){
  const bend=Math.round(Math.sin((y-70)*.035+variant)*2),root=Math.max(0,(y-134)*.44),x=62+bend;
  p.rect(x-6-root,y,15+root*2,1,ink);p.rect(x-4-root*.65,y,7+root*.45,1,[105,82,46]);
  p.rect(x-2-root*.45,y,3,1,[159,127,71]);p.rect(x+4,y,4+root*.5,1,[48,55,35]);
 }
 const limbs:[[number,number],[number,number]][]=[[[62,113],[21+sway,64]],[[63,104],[96+sway,53]],[[62,95],[57+sway,20]],[[61,120],[104,87]],[[61,107],[36,45]]];
 for(const [a,b]of limbs){p.line(a[0],a[1],b[0],b[1],ink,6);p.line(a[0]-1,a[1],b[0],b[1],[124,104,61],3);p.line(a[0]-1,a[1],b[0]-1,b[1],[180,145,77]);}
 const clusters:{x:number;y:number;rx:number;ry:number;seed:number}[]=[];
 for(let i=0;i<41;i++){
  const angle=i*2.399963+variant*.43,r=Math.sqrt((i+.6)/42),cx=63+sway*.4+Math.cos(angle)*r*44,cy=55+Math.sin(angle)*r*38;
  const rx=10+hash(i,8,300+variant)*10,ry=7+hash(i,9,300+variant)*9;
  clusters.push({x:cx,y:cy,rx,ry,seed:i+variant*51});
 }
 clusters.sort((a,b)=>b.y-a.y); // overhanging upper foliage interrupts lower clusters.
 for(const q of clusters){
  for(let y=Math.max(2,Math.floor(q.y-q.ry-2));y<Math.min(115,q.y+q.ry+2);y++)for(let x=Math.max(2,Math.floor(q.x-q.rx-2));x<Math.min(126,q.x+q.rx+2);x++){
   const dx=(x-q.x)/q.rx,dy=(y-q.y)/q.ry,edge=dx*dx+dy*dy;
   const scallop=field(x/3,y/3,q.seed+600)*.18;if(edge>1+scallop)continue;
   const light=clamp(.56-dx*.19-dy*.32+(1-q.y/110)*.10),leaf=field(x/4,y/3,q.seed+200);
   let c=mix([22,52,36],[147,170,71],light*.78+leaf*.22);
   if(edge>.90){const occupied=p.rgba[(y*128+x)*4+3]===255;c=mix(c,[23,46,31],occupied?.13:.53);}
   else if(dy<-.38&&leaf>.48)c=mix(c,[205,209,104],.16);
   // Broken leaf tips have a common top-left light, not a field of glitter dots.
   if(y%3===0&&x%5<2&&leaf>.63&&edge<.86)c=mix(c,[195,205,101],.16);
   p.pixel(x,y,c);
  }
 }
 // A few fine hanging sprays and bark fissures carry the silhouette at close zoom.
 for(let i=0;i<17;i++){
  const x=17+hash(i,4,variant+91)*94,y=76+hash(i,8,variant+91)*24;
  if(p.rgba[(Math.floor(y)*128+Math.floor(x))*4+3])tuft(p,Math.floor(x),Math.floor(y+3),2,[96,139,57],i);
 }
 for(let i=0;i<12;i++){const x=59+i%6,y=106+i*4;if(y<151){p.line(x,y,x+1,y+6,[54,54,34]);p.pixel(x-1,y,[182,143,77]);}}
 return p;
}
function mountains(p:Paint):void{
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
  let c=mix([116,166,184],[224,218,184],y/p.height);
  const cloud=field(x/75,y/14,409)*field(x/39,y/22,801);if(y<98)c=mix(c,[237,233,209],clamp((cloud-.24)*1.8)*.7);
  p.pixel(x,y,c);
 }
 // Unequal, angular summits: three distance layers share atmospheric perspective.
 for(let layer=0;layer<3;layer++){
  const span=67-layer*10,knots:number[]=[];for(let i=0;i<15;i++)knots.push(34+layer*37+hash(i,19,33+layer)*72);
  for(let x=0;x<p.width;x++){
   const part=x/span,index=Math.floor(part),f=part-index,ridge=lerp(knots[index]!,knots[index+1]!,f)+field(x/11,0,901+layer)*9;
   for(let y=Math.floor(ridge);y<p.height;y++){
    const fog=clamp((y-ridge)/125)*.7,face=field(x/11,(y-x*.5)/44,177+layer);
    let c=mix(([[104,142,155],[77,119,129],[48,91,96]] as const)[layer]!,[192,205,183],fog);
    c=mix(c,[191,190,144],face*(1-fog)*.22);
    const seam=(x*.29+y*.68)%19;if(seam<1.5&&y<ridge+52)c=mix(c,[52,90,102],.12*(1-layer*.2));
    if(y<ridge+2&&layer<2)c=mix(c,[224,223,189],.25);
    p.pixel(x,y,c);
   }
  }
 }
 // A distant forest, individual tapered crowns rather than rectangular skyline bars.
 for(let i=0;i<160;i++){
  const x=Math.floor(hash(i,3,166)*p.width),y=227+Math.floor(hash(i,5,166)*24),h=4+hash(i,7,166)*13;
  for(let k=0;k<h;k++){const half=(h-k)*.27;p.rect(x-half,y-k,half*2+1,1,mix([44,79,71],[93,127,103],hash(i,5,688)));}
 }
}
function courtStone(p:Paint):void{
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
  const row=Math.floor(y/32),xx=(x+(row%2)*32)%64,yy=y%32,n=hash(Math.floor((x+(row%2)*32)/64),row,43);
  let c=mix([54,63,66],[112,115,106],n*.55+field(x/9,y/8,915)*.23+.15);
  if(xx<2||yy<2)c=[32,43,47];else if(yy<4||xx<4)c=mix(c,[200,191,160],.34);else if(xx>60||yy>28)c=mix(c,[22,35,43],.24);
  p.pixel(x,y,c);
 }
 for(let i=0;i<20;i++){const x=5+Math.floor(hash(i,6,98)*112),y=4+Math.floor(hash(i,9,98)*117);p.line(x,y,x+3,y+7,[53,62,61]);}
}
function courtFloor(p:Paint):void{
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
  const row=Math.floor(y/64),xx=(x+(row%2)*48)%96,yy=y%64,n=hash(Math.floor((x+(row%2)*48)/96),row,190);
  let c=mix([76,83,85],[121,125,117],n*.7+field(x/26,y/20,190)*.3);
  if(xx<2||yy<2)c=[55,65,67];else if(xx<4||yy<4)c=mix(c,[205,202,177],.2);
  const vein=Math.abs(Math.sin(x*.021+y*.037+field(x/47,y/42,19)*2));if(vein>.991)c=mix(c,[56,67,68],.14);
  // Baked window illumination works on CPU too. No shader-only reflections or extra lights.
  const beam=Math.min(...[125,274,434].map(origin=>Math.abs(x-(origin+y*.43)))),light=clamp((38-beam)/26)*clamp(1-y/790)*.44;
  c=mix(c,[244,221,158],light);const edge=Math.min(x,p.width-1-x);c=mix(c,[26,37,43],clamp(1-edge/82)*.34);p.pixel(x,y,c);
 }
 for(const x of [56,704]){p.rect(x,0,8,p.height,[77,72,54]);p.rect(x+2,0,2,p.height,gold);p.rect(x+5,0,1,p.height,[214,195,136]);}
 for(let y=356;y<p.height;y++)for(let x=330;x<438;x++){
  const edge=Math.min(x-330,437-x),weave=hash(x,y,707);let c=mix([90,26,37],[139,48,51],field(x/35,y/31,77));if(edge<3)c=[85,65,41];else if(edge<6)c=gold;else if(edge===10||edge===14)c=[181,137,63];else if(weave>.92)c=mix(c,[189,96,67],.2);p.pixel(x,y,c);
 }
 for(const y of [432,551,663])crest(p,384,y,19);
}
function courtDais(p:Paint):void{
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){
  const row=Math.floor(y/32),xx=(x+(row%2)*24)%64,yy=y%32;
  let c=mix([80,89,85],[140,143,128],field(x/17,y/21,119));if(xx<2||yy<2)c=[66,75,74];else if(yy<4)c=mix(c,[223,210,172],.23);
  const d=Math.hypot(x-127.5,y-127.5);if(d>111&&d<115)c=gold;else if(d>=115&&d<120)c=[63,74,72];
  if(y>131&&x>109&&x<147){c=x<113||x>143?gold:[117,40,45];}p.pixel(x,y,c);
 }
 for(const y of [179,230])crest(p,128,y,7);
 for(let y=256;y<320;y++)for(let x=0;x<256;x++){let c:RGB=y<264?[135,139,122]:y<270?[178,170,137]:y>310?[44,55,57]:[85,96,92];if(x%32<2&&y>270&&y<311)c=[52,67,66];p.pixel(x,y,c);}
}
function wood(p:Paint,emblem=true):void{
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){
  const grain=field(x/3,y/52,715),edge=Math.min(x,127-x,y,127-y);let c=mix([63,38,27],[133,88,44],grain*.55+field(x/24,y/24,815)*.45);
  if(emblem){if(edge<4)c=[50,37,29];else if(edge<7)c=[177,135,67];else if(edge<11)c=[104,68,34];else if(edge<15)c=[169,120,59];else if(edge<18)c=[48,34,27];}
  else{if(edge<3)c=[49,35,25];else if(edge<5)c=[147,107,59];if(x%42<2)c=mix(c,[35,28,25],.4);if(y===8)c=mix(c,[216,168,89],.25);}
  p.pixel(x,y,c);
 }
 if(emblem){crest(p,64,64,22);p.line(22,25,106,25,[197,157,91]);p.line(22,103,106,103,[72,46,28]);}
}
function velvet(p:Paint,banner:boolean):void{
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
  if(banner&&y>232-Math.abs(x-p.width/2)*.42)continue;
  const fold=.5+Math.sin(x/p.width*Math.PI*(banner?5:2))*.3+Math.sin(x*.47)*.1;let c=mix([64,18,30],[167,52,50],fold);if(hash(x,y,3)>.97)c=mix(c,[203,95,68],.13);const edge=Math.min(x,p.width-1-x);if(banner&&(edge<4||Math.abs(y-(230-Math.abs(x-p.width/2)*.42))<3))c=gold;p.pixel(x,y,c);
 }
 if(banner){crest(p,p.width/2,86,25);p.rect(4,15,p.width-8,2,gold);for(let i=0;i<12;i++){const x=5+i*7;p.line(x,231-Math.abs(x-48)*.42,x+1,238-Math.abs(x-48)*.42,gold);}}
}
function courtWindow(p:Paint):void{
 // Three lancets and a central medallion. Transparent corners preserve the wall surround.
 for(let y=4;y<156;y++)for(let x=4;x<252;x++){
  const arch=32-Math.sqrt(Math.max(0,120**2-(x-128)**2))*.2;if(y<arch)continue;
  const pane=Math.floor((x-8)/80),xx=(x-8)%80,yy=y%24;let c:RGB=mix([56,94,101],[157,180,151],hash(Math.floor(x/10),Math.floor(y/12),15)*.5+y/240);
  if(xx<6||xx>73||yy<3)c=[69,68,52];else if(xx<9||yy<5)c=gold;
  if(pane===1&&x>108&&x<148)c=mix(c,[223,212,146],.35);
  if(x<9||x>246||y>149)c=[203,182,122];p.pixel(x,y,c);
 }
 crest(p,128,72,30);p.rect(122,73,12,61,gold);p.rect(126,70,4,63,goldLight);p.rect(89,91,78,6,gold);
}
export function paintProductionSurface(kind:ProductionSurface):PixelSurface{
 if(!Object.hasOwn(PRODUCTION_ART.dimensions,kind))throw new RangeError('Unknown production surface');const dims=PRODUCTION_ART.dimensions[kind];if(!dims)throw new RangeError('Unknown production surface');const p=new Paint(dims[0],dims[1]);
 switch(kind){case 'canyon-ground':canyonGround(p);break;case 'canyon-rock':canyonRock(p);break;case 'canyon-turf':turf(p);break;
 case 'canopy-atlas':for(let i=0;i<4;i++)p.blit(oak(i),i*136+4,0);break;case 'mountain-distance':mountains(p);break;
 case 'court-ground':courtFloor(p);break;case 'court-stone':courtStone(p);break;case 'court-dais':courtDais(p);break;
 case 'court-wood':wood(p);break;case 'court-timber':wood(p,false);break;case 'court-velvet':velvet(p,false);break;case 'court-banner':velvet(p,true);break;case 'court-window':courtWindow(p);break;}
 return {width:p.width,height:p.height,rgba:p.rgba};
}

/** Repaint the already-owned 384x352 forest floor, with the established three
 * path segments. This does not allocate another GPU texture or alter navigation. */
export function paintProductionForestFloor():PixelSurface{
 const p=new Paint(384,352);
 const segment=(x:number,z:number,ax:number,az:number,bx:number,bz:number)=>{const dx=bx-ax,dz=bz-az,t=clamp(((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz));return Math.hypot(x-ax-t*dx,z-az-t*dz);};
 const trail=(x:number,z:number)=>Math.min(segment(x,z,0,-7,-.35,-1),segment(x,z,-.35,-1,0,6.8),segment(x,z,-.1,.3,5.5,4));
 for(let y=0;y<352;y++)for(let x=0;x<384;x++){
  const wx=(x+.5)/24-8,wz=7-(y+.5)/352*14,d=trail(wx,wz),n=field(x/43,y/39,1017),fine=field(x/8,y/7,821);
  let c:RGB=d<.82?mix([89,76,45],[130,111,64],n*.75+fine*.25):d<1.14?mix([62,75,37],[94,95,44],n):mix([27,54,36],[67,92,45],n*.7+fine*.3);
  const light=clamp(1-Math.abs(x-(73+y*.46))/140)*.20;c=mix(c,[204,199,103],light);
  // Quiet walking area; paired leaf litter is outside the real trail.
  if(d>1.5&&hash(Math.floor(x/3),Math.floor(y/2),981)>.955)c=mix(c,[124,144,62],.22);
  p.pixel(x,y,c);
 }
 for(let i=0;i<165;i++){const x=8+Math.floor(hash(i,1,606)*368),y=8+Math.floor(hash(i,2,606)*336);if(trail(x/24-8,7-y/352*14)<1.45)continue;tuft(p,x,y,1+Math.floor(hash(i,3,606)*2),mix([60,86,39],[137,157,73],hash(i,4,606)),i);}
 return p;
}
