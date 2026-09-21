import {drawHDHero,HD_ART} from './hd-hero-art';
import type {HDHero} from './hd-hero-art';
import type {HeroPose,Ink} from './hero-art';
type Frame={spans:Uint16Array;palette:string[];paintCalls:number};
/** Lazy, bounded CPU cache of the UNCHANGED opaque native painter. A cache hit
 * replays final horizontal pixel spans into the existing texture, not a new asset
 * or GPU texture. No canvas, DOM, browser readback or gameplay state is retained. */
export class HeroFrameCache {
 private frames=new Map<string,Frame>();
 private hits=0;private misses=0;private evictions=0;private replayCalls=0;
 constructor(private limit=96,private painter:typeof drawHDHero=drawHDHero){if(!Number.isInteger(limit)||limit<1||limit>512)throw Error('Invalid hero cache limit');}
 private compile(hero:HDHero,facing:number,frame:number,pose:HeroPose):Frame {
  const width=HD_ART.width,height=HD_ART.height,pixels=new Uint16Array(width*height),palette:string[]=[''];
  let fillStyle:Ink['fillStyle']='#000000',paintCalls=0;
  const rect=(x:number,y:number,w:number,h:number,value:number)=>{
   if(![x,y,w,h].every(Number.isInteger)||w<0||h<0)throw Error('Non-native hero rectangle');
   for(let row=Math.max(0,y);row<Math.min(height,y+h);row++)pixels.fill(value,row*width+Math.max(0,x),row*width+Math.min(width,x+w));
  };
  const ink:Ink={get fillStyle(){return fillStyle;},set fillStyle(v){fillStyle=v;},
   clearRect:(x,y,w,h)=>rect(x,y,w,h,0),fillRect:(x,y,w,h)=>{
    if(typeof fillStyle!=='string'||!/^#[a-f0-9]{6}$/i.test(fillStyle))throw Error('Only opaque native hero colours are cacheable');
    let id=palette.indexOf(fillStyle);if(id<0){id=palette.length;palette.push(fillStyle);}rect(x,y,w,h,id);paintCalls++;
   }};
  this.painter(ink,hero,facing,frame,pose);
  const runs:number[]=[];
  for(let y=0;y<height;y++)for(let x=0;x<width;){const id=pixels[y*width+x]!;let end=x+1;while(end<width&&pixels[y*width+end]===id)end++;if(id)runs.push(y*width+x,end-x,id);x=end;}
  return {spans:Uint16Array.from(runs),palette,paintCalls};
 }
 draw(ink:Ink,hero:HDHero,facing:number,frame:number,pose:HeroPose='idle'){
  const key=`${hero}/${facing}/${pose}/${frame}`;let cell=this.frames.get(key);
  if(cell){this.hits++;this.frames.delete(key);this.frames.set(key,cell);}
  else {cell=this.compile(hero,facing,frame,pose);this.misses++;if(this.frames.size===this.limit){this.frames.delete(this.frames.keys().next().value!);this.evictions++;}this.frames.set(key,cell);}
  ink.clearRect(0,0,HD_ART.width,HD_ART.height);
  for(let i=0;i<cell.spans.length;i+=3){const at=cell.spans[i]!;ink.fillStyle=cell.palette[cell.spans[i+2]!]!;ink.fillRect(at%HD_ART.width,Math.floor(at/HD_ART.width),cell.spans[i+1]!,1);this.replayCalls++;}
 }
 clear(){this.frames.clear();}
 inspect(){return {profile:'vq02c-retained-pixel-span-cache',entries:this.frames.size,limit:this.limit,hits:this.hits,misses:this.misses,evictions:this.evictions,replayCalls:this.replayCalls,spanBytes:[...this.frames.values()].reduce((n,f)=>n+f.spans.byteLength,0),nativePaintCalls:[...this.frames.values()].reduce((n,f)=>n+f.paintCalls,0),cachedSpans:[...this.frames.values()].reduce((n,f)=>n+f.spans.length/3,0),additionalGpuTextures:0,artApproved:false};}
}
