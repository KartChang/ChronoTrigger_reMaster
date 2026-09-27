/** VQ04C authored production pixels. No sampled images, ROM, font or network inputs.
 * The runtime and asset exporter call these same deterministic integer-pixel painters.
 * Architectural surfaces are not substitutes for full character/direction animation art.
 */
import {bridgeDeckPixels} from './art-profile';
export type SceneSurface='royal-floor'|'abbey-floor'|'crypt-floor'|'prison-floor'|'bridge-floor'|'chamber-floor'|'limestone'|'column-stone'|'crypt-stone'|'carved-oak'|'ironwork'|'royal-runner'|'linen'|'quilt'|'lancet-glass'|'understory';
export const EARLY_SCENE_ART=Object.freeze({id:'vq04c-early-scene-art',approved:false,dimensions:{
 'royal-floor':[384,352],'abbey-floor':[384,352],'crypt-floor':[384,352],'prison-floor':[384,352],'bridge-floor':[384,352],'chamber-floor':[384,352],
 'limestone':[128,128],'column-stone':[128,128],'crypt-stone':[128,128],'carved-oak':[128,128],'ironwork':[64,64],'royal-runner':[96,256],'linen':[96,96],'quilt':[128,128],'lancet-glass':[128,160],'understory':[256,128]
} as const});
export type ScenePixels={width:number;height:number;rgba:Uint8ClampedArray};
type RGB=readonly[number,number,number];
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const mix=(a:RGB,b:RGB,t:number):RGB=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
function noise(x:number,y:number,s=1){let n=Math.imul(x+s*17,374761393)^Math.imul(y+s*31,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
class Canvas implements ScenePixels{
 readonly rgba:Uint8ClampedArray;
 constructor(readonly width:number,readonly height:number){this.rgba=new Uint8ClampedArray(width*height*4);}
 p(x:number,y:number,c:RGB,a=255){x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=this.width||y>=this.height)return;const i=(y*this.width+x)*4;this.rgba[i]=c[0];this.rgba[i+1]=c[1];this.rgba[i+2]=c[2];this.rgba[i+3]=a;}
 r(x:number,y:number,w:number,h:number,c:RGB){for(let yy=Math.max(0,Math.round(y));yy<Math.min(this.height,y+h);yy++)for(let xx=Math.max(0,Math.round(x));xx<Math.min(this.width,x+w);xx++)this.p(xx,yy,c);}
 line(x:number,y:number,ex:number,ey:number,c:RGB,w=1){const n=Math.max(1,Math.ceil(Math.max(Math.abs(ex-x),Math.abs(ey-y))));for(let i=0;i<=n;i++)this.r(x+(ex-x)*i/n,y+(ey-y)*i/n,w,w,c);}
 poly(points:readonly (readonly[number,number])[],c:RGB){const ys=points.map(p=>p[1]);for(let y=Math.ceil(Math.min(...ys));y<=Math.max(...ys);y++){const hits:number[]=[];for(let i=0;i<points.length;i++){const a=points[i]!,b=points[(i+1)%points.length]!;if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))hits.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2)this.r(Math.ceil(hits[i]!),y,Math.floor(hits[i+1]!)-Math.ceil(hits[i]!)+1,1,c);}}
 ellipse(cx:number,cy:number,rx:number,ry:number,c:RGB){for(let y=-ry;y<=ry;y++){const dx=Math.floor(rx*Math.sqrt(Math.max(0,1-y*y/(ry*ry))));this.r(cx-dx,cy+y,dx*2+1,1,c);}}
}
const dark:RGB=[36,40,40],gold:RGB=[184,148,78],brightGold:RGB=[220,193,127];
function diamond(p:Canvas,x:number,y:number,size:number){p.poly([[x,y-size],[x+size,y],[x,y+size],[x-size,y]],gold);p.poly([[x,y-size+2],[x+size-2,y],[x,y+size-2],[x-size+2,y]],[99,55,53]);p.r(x-1,y-1,3,3,brightGold);}
function tiles(p:Canvas,kind:SceneSurface){
 const crypt=kind==='crypt-floor',prison=kind==='prison-floor',abbey=kind==='abbey-floor',chamber=kind==='chamber-floor';
 const base:RGB=crypt?[65,76,66]:prison?[74,84,88]:abbey?[127,125,105]:[139,143,134];
 const mortar:RGB=crypt?[38,49,43]:prison?[44,54,59]:[108,112,104],tw=prison?24:32,th=prison?20:24;
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
  const row=Math.floor(y/th),xx=(x+(row%2)*tw/2)%tw,col=Math.floor((x+(row%2)*tw/2)/tw),yy=y%th;
  const t=noise(col,row,81),bevel=xx<2||yy<2,edge=xx>tw-3||yy>th-3;
  const vein=Math.sin((x+Math.sin(y*.032)*20)*.042+y*.019+Math.floor(t*5));
  let c=mix(base,[base[0]+22,base[1]+19,base[2]+13],t*.55);
  c=mix(c,[base[0]-25,base[1]-24,base[2]-20],vein>.84?.11:0);
  if(bevel)c=xx===0||yy===0?mortar:mix(base,[227,224,198],.16);else if(edge)c=mix(c,mortar,.24);
  const light=clamp(1-Math.abs(x-(p.width*.22+y*.18))/(p.width*.62))*.075;
  const wallShade=Math.pow(Math.min(1,Math.min(x,p.width-1-x)/38),.35);
  c=mix(c,[40,49,49],(1-wallShade)*.13);p.p(x,y,mix(c,[224,209,159],light));
 }
 // Sparse chips and fissures, not dense random dots on every walkable pixel.
 for(let i=0;i<(prison||crypt?85:32);i++){
  const x=Math.floor(noise(i,2,7)*(p.width-10))+4,y=Math.floor(noise(i,3,7)*(p.height-10))+4;
  if(i%3===0){p.line(x,y,x+4,y+2,mortar);p.line(x+4,y+2,x+6,y+6,mortar);}else p.r(x,y,2,1,mortar);
 }
 // Border courses indicate the room edge, not an added collider or changed map extent.
 for(const x of [9,p.width-12]){p.r(x,0,2,p.height,mortar);p.r(x+3,0,1,p.height,mix(base,[213,199,151],.4));}
 if(!prison&&!crypt&&!chamber){const l=155,r=229;
  p.r(l-3,0,r-l+6,p.height,[65,49,44]);
  for(let y=0;y<p.height;y++)for(let x=l;x<r;x++){
   const edge=Math.min(x-l,r-1-x),fold=Math.sin((x-l)*.23)*.018;
   p.p(x,y,edge===3||edge===7?gold:mix([107,44,53],[138,63,66],.35+fold+noise(x,y,33)*.03));
  }
  for(let y=28;y<p.height;y+=74)diamond(p,192,y,8);
  if(abbey){for(let y=28;y<p.height;y+=74){p.line(182,y,178,y,gold);p.line(202,y,206,y,gold);}}
 }
}
function bridge(p:Canvas){
 // The original bridge's land/void boundary is retained from its authored layout:
 // Bounds are shared with the original gameplay/art contract, never guessed here.
 const {top,bottom}=bridgeDeckPixels(p.height);
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
  if(y<top||y>=bottom){const layer=Math.floor(y/18),streak=noise(Math.floor(x/35),layer,54);p.p(x,y,mix([19,34,48],[37,54,65],streak*.42));}
  else{const plank=Math.floor(x/12),u=x%12,grain=Math.sin(y*.18+Math.sin(y*.043)*2+plank*1.7),edge=u<1||u>10;
   p.p(x,y,edge?[50,59,54]:mix([101,106,84],[155,151,111],noise(plank,1,21)*.35+(grain+1)*.12));
   if((y===top+7||y===bottom-8)&&(u===3||u===8))p.p(x,y,[57,64,58]);
  }
 }
}
function masonry(p:Canvas,cold:boolean){
 const base:RGB=cold?[65,82,79]:[150,147,125];
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
  const row=Math.floor(y/24),u=(x+row%2*32)%64,v=y%24,t=noise(Math.floor((x+row%2*32)/64),row,11);
  let c=mix(base,[base[0]+19,base[1]+17,base[2]+12],t*.5);
  if(u<2||v<2)c=cold?[35,50,48]:[82,89,80];else if(u<4||v<4)c=mix(c,[218,211,164],.28);else if(u>60||v>20)c=mix(c,[45,59,52],.25);
  p.p(x,y,c);
 }
 for(let i=0;i<24;i++){const x=Math.floor(noise(i,3)*120)+3,y=Math.floor(noise(i,4)*120)+3;p.line(x,y,x+3,y+1,cold?[49,68,60]:[105,110,91]);}
}
/** Fine carved shaft channels read as stone fluting, not brickwork on a cylinder. */
function column(p:Canvas){
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
  const flute=x%16,bevel=flute<3?.11:flute<6?.40:flute<11?.62:.27;
  let c=mix([105,110,97],[188,183,148],bevel+noise(x,Math.floor(y/3),44)*.035);
  if(y<7||y>120)c=mix(c,[80,89,77],.28);
  else if(y===8||y===119)c=mix(c,[218,207,164],.25);
  p.p(x,y,c);
 }
}
function oak(p:Canvas){
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
  const u=x%32,flow=Math.sin(y*.068+x*.87+Math.sin(y*.025+x)*1.2);
  let c=mix([87,61,40],[150,106,59],(flow+1)*.17+noise(Math.floor(x/32),1,31)*.2);
  if(u<2)c=[49,43,35];else if(u<4)c=mix(c,[199,155,86],.35);
  p.p(x,y,c);
 }
 for(const y of [5,119]){p.r(1,y,126,4,[54,43,31]);p.r(2,y,124,1,[177,130,70]);}
 for(const x of [6,118]){p.r(x,5,4,116,[58,44,32]);p.r(x,6,1,114,[172,124,69]);}
 for(const [x,y] of [[9,9],[119,9],[9,119],[119,119]] as const){p.r(x-2,y-2,4,4,[67,65,53]);p.p(x-1,y-1,[178,153,95]);}
}
function runner(p:Canvas){
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){const u=Math.min(x,p.width-1-x),stripe=u===4||u===8;p.p(x,y,stripe?gold:mix([99,41,51],[147,69,74],.27+Math.sin(x*.2)*.05));}
 for(let y=28;y<p.height;y+=68)diamond(p,p.width/2,y,9);
}
function textile(p:Canvas,quilt:boolean){for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
 const edge=Math.min(x,y,p.width-1-x,p.height-1-y),crease=Math.sin((x+Math.sin(y*.036)*4)*.12),stitch=quilt&&(x%24===0||y%24===0);
 const base:RGB=quilt?[71,102,115]:[195,189,152],light:RGB=quilt?[129,162,166]:[232,221,182];
 let c=mix(base,light,(crease+1)*.18+noise(x,y,51)*.02);if(edge<3||stitch)c=mix(c,[48,74,81],quilt?.38:.16);p.p(x,y,c);
}}
function glass(p:Canvas){
 const cx=p.width/2;
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
  const margin=11,arch=16+Math.abs(x-cx)*.83,inside=x>=margin&&x<p.width-margin&&y>=arch&&y<p.height-8;
  if(!inside){p.p(x,y,[61,69,65]);continue;}
  const lead=x%26<3||y%28<3||Math.abs(x-cx)<2||Math.abs(y-83)<2;
  const c=lead?gold:([ [98,145,145],[149,168,142],[168,150,106],[89,122,146] ] as const)[(Math.floor(x/26)+Math.floor(y/28))%4]!;
  p.p(x,y,mix(c,[249,224,160],lead?0:clamp(1-Math.hypot((x-cx)/60,(y-66)/90))*.27));
 }
 p.poly([[64,38],[78,60],[64,85],[50,60]],gold);p.poly([[64,43],[73,60],[64,76],[55,60]],[232,218,162]);
 p.line(9,151,119,151,brightGold,3);
}
function understory(p:Canvas){
 for(let variant=0;variant<4;variant++){
  const ox=variant*64,cx=ox+32;
  if(variant===3){p.poly([[ox+9,117],[ox+7,104],[ox+18,90],[ox+39,85],[ox+55,101],[ox+57,116]],dark);p.poly([[ox+10,114],[ox+11,104],[ox+21,92],[ox+38,88],[ox+52,102],[ox+53,113]],[100,110,85]);p.poly([[ox+13,101],[ox+23,93],[ox+37,91],[ox+47,101],[ox+28,104]],[157,153,110]);p.line(ox+24,104,ox+21,112,[56,73,57]);}
  const base=variant===3?98:119,branches=variant===2?7:9;
  for(let j=0;j<branches;j++){
   const angle=(j/(branches-1)-.5)*2.15,len=variant===1?42:31+noise(j,variant,43)*22,ex=cx+Math.sin(angle)*len*.44,ey=base-Math.cos(angle)*len;
   p.line(cx,base,ex,ey,[40,65,41],2);p.line(cx,base,ex,ey,[85,113,52]);
   for(let k=2;k<9;k++){const t=k/10,x=cx+(ex-cx)*t,y=base+(ey-base)*t,leaf=(1-t)*9+2;
    p.line(x,y,x-leaf,y-3,[53,89,44],2);p.line(x,y,x+leaf,y-4,[114,140,62],2);
   }
  }
  if(variant===2)for(let j=0;j<5;j++){const x=cx-17+j*8,y=70+noise(j,2,7)*10;p.line(x,117,x,y,[58,86,41]);p.r(x-2,y-2,4,3,[229,201,127]);p.p(x,y-2,[255,232,174]);}
 }
}
export function paintEarlySceneSurface(kind:SceneSurface):ScenePixels{
 const size=Object.hasOwn(EARLY_SCENE_ART.dimensions,kind)?EARLY_SCENE_ART.dimensions[kind]:null;if(!size)throw new RangeError('Unknown early scene surface');
 const p=new Canvas(size[0],size[1]);
 if(kind==='bridge-floor')bridge(p);else if(kind.endsWith('-floor'))tiles(p,kind);
 else if(kind==='column-stone')column(p);else if(kind==='limestone'||kind==='crypt-stone')masonry(p,kind==='crypt-stone');
 else if(kind==='carved-oak')oak(p);else if(kind==='royal-runner')runner(p);
 else if(kind==='linen'||kind==='quilt')textile(p,kind==='quilt');else if(kind==='lancet-glass')glass(p);else if(kind==='understory')understory(p);
 else for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){const edge=x%16;p.p(x,y,mix([49,63,68],[147,159,148],(edge<3?.48:edge>13?.06:.18)+(noise(Math.floor(x/2),y,73)-.5)*.055+Math.sin(y*.31)*.009));if(x%16===7&&y%32===7){p.r(x-1,y-1,3,3,[36,46,50]);p.p(x-1,y-1,[173,177,146]);}}
 return p;
}
