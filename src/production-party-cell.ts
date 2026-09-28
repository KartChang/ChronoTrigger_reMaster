import type {Ink,HeroPose} from './hero-art';
import {HD_HERO_IDS,drawHDHero} from './hd-hero-art';
import {drawProductionParty} from './production-party-art';
export const PARTY_POSES:readonly HeroPose[]=['idle','ready','walk','attack','cast','hurt','down','victory'];
export function decodePartyCell(code:number){
 if(!Number.isInteger(code)||code<0||code>=512)throw new RangeError('Invalid party cell code');
 return {hero:HD_HERO_IDS[Math.floor(code/128)]!,pose:PARTY_POSES[Math.floor(code%128/16)]!,facing:Math.floor(code%16/4),frame:code%4};
}
/** Native integer authoring canvas. Only one temporary cell; no DOM or native data. */
export function partyCell(code:number,legacy=false):Uint8ClampedArray{
 const {hero,pose,facing,frame}=decodePartyCell(code),data=new Uint8ClampedArray(48*64*4);let style:Ink['fillStyle']='#000000';
 const colours=new Map<string,readonly number[]>();
 const rect=(x:number,y:number,w:number,h:number,col:readonly number[])=>{if(![x,y,w,h].every(Number.isInteger)||w<0||h<0)throw new RangeError('Noninteger authoring rectangle');for(let yy=Math.max(0,y);yy<Math.min(64,y+h);yy++)for(let xx=Math.max(0,x);xx<Math.min(48,x+w);xx++)data.set(col,(yy*48+xx)*4);};
 const ink:Ink={get fillStyle(){return style;},set fillStyle(v){style=v;},clearRect:(x,y,w,h)=>rect(x,y,w,h,[0,0,0,0]),fillRect:(x,y,w,h)=>{
  if(typeof style!=='string'||!/^#[a-f0-9]{6}$/i.test(style))throw new TypeError('Opaque hex pigment required');
  let col=colours.get(style);if(!col){col=[parseInt(style.slice(1,3),16),parseInt(style.slice(3,5),16),parseInt(style.slice(5,7),16),255];colours.set(style,col);}rect(x,y,w,h,col);
 }};
 (legacy?drawHDHero:drawProductionParty)(ink,hero,facing,frame,pose);return data;
}
export function partyFingerprint(data:ArrayLike<number>):number{let h=2166136261;for(let i=0;i<data.length;i++)h=Math.imul(h^data[i]!,16777619);return h>>>0;}
export function equalPartyPixels(a:ArrayLike<number>,b:ArrayLike<number>):boolean{if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;}
