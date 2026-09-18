import {newFollowPlan} from './navigation';
import type {FollowPlan} from './navigation';
/** Observed facts only. Null on older saves means never recorded, not innocent/guilty. */
export type FairConduct={
 schema:1;sealed:boolean;askedGirl:boolean;catReturned:boolean;lunchEaten:boolean;
 saleAttempted:boolean;saleDeclined:boolean;returnRefused:boolean;
 candy:'unseen'|'waiting'|'patient'|'rushed';candyElapsed:number;
 cat:{x:number;z:number;following:boolean;facing:number};catPlan:FollowPlan;
};
export const CONDUCT_POINTS={girl:{x:5,z:2.4},cat:{x:-9,z:.8},lunch:{x:-9,z:6.5},merchant:{x:7.5,z:-6.3},candy:{x:7.5,z:-3.1}} as const;
export const newConduct=():FairConduct=>({schema:1,sealed:false,askedGirl:false,catReturned:false,lunchEaten:false,saleAttempted:false,saleDeclined:false,returnRefused:false,candy:'unseen',candyElapsed:0,cat:{...CONDUCT_POINTS.cat,following:false,facing:0},catPlan:newFollowPlan()});
export function saveConduct(c:FairConduct):Record<string,unknown>{
 if(c.candy==='waiting')throw new Error('請等瑪兒選好糖果，再保存旅程。');
 const {catPlan:_,candyElapsed:_t,...facts}=c;return {...facts,cat:{...facts.cat}};
}
export function restoreConduct(raw:unknown):FairConduct|null{
 if(raw===undefined)return null;
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('祭典經歷格式錯誤。');
 const o=raw as Record<string,unknown>,c=newConduct();if(o.schema!==1)throw new Error('祭典經歷版本錯誤。');
 for(const k of ['sealed','askedGirl','catReturned','lunchEaten','saleAttempted','saleDeclined','returnRefused'] as const){if(typeof o[k]!=='boolean')throw new Error('祭典經歷旗標錯誤。');c[k]=o[k];}
 if(typeof o.candy!=='string'||!['unseen','patient','rushed'].includes(o.candy))throw new Error('買糖事件尚未完成。');c.candy=o.candy as FairConduct['candy'];
 if(!o.cat||typeof o.cat!=='object'||Array.isArray(o.cat))throw new Error('貓的位置錯誤。');const a=o.cat as Record<string,unknown>;
 if(typeof a.following!=='boolean'||!['x','z','facing'].every(k=>typeof a[k]==='number'&&Number.isFinite(a[k])))throw new Error('貓的資料錯誤。');
 const x=a.x as number,z=a.z as number,f=a.facing as number;
 if(Math.abs(x)>12.6||z< -8.6||z>10.6||!Number.isInteger(f)||f<0||f>3||(c.catReturned&&(!c.askedGirl||a.following))||(c.sealed&&a.following))throw new Error('尋貓事件不一致。');
 c.cat={x,z,following:a.following,facing:f};return c;
}
