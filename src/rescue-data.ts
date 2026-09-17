import type {Actor} from './core';
import {newFollowPlan} from './navigation';
import type {FollowPlan} from './navigation';
import type {Solid,Place} from './kingdom-data';

/** Condensed, authored cathedral route; not extracted original geometry or combat data. */
export type RescueMap='cathedral'|'passage'|'sanctum';
export type RescueStage='none'|'entered'|'cleared'|'allied'|'rescued'|'homecoming'|'reunited'|'returned';
export type Encounter='none'|'naga'|'guards'|'yakra';
export type Rescue={stage:RescueStage;organOpen:boolean;guardsWon:boolean;yakraWon:boolean;chancellorFreed:boolean;chestOpened:boolean;tonics:number;guest:Actor;guestPlan:FollowPlan;encounter:Encounter;enemyActions:number};
export const rescueMap=(s:string):s is RescueMap=>['cathedral','passage','sanctum'].includes(s);
export const GUEST_HP=140,GUEST_MP=16;
export const newRescue=():Rescue=>({stage:'none',organOpen:false,guardsWon:false,yakraWon:false,chancellorFreed:false,chestOpened:false,tonics:0,guest:{x:0,z:-5,hp:GUEST_HP,mp:GUEST_MP,atb:0,facing:2,walking:false},guestPlan:newFollowPlan(),encounter:'none',enemyActions:0});
export const guestIdentity=(r:Rescue):'frog'|'marle'|null=>r.stage==='allied'||r.stage==='rescued'?'frog':r.stage==='reunited'||r.stage==='returned'?'marle':null;
export const RESCUE_NAMES:Record<RescueMap,string>={cathedral:'瑪諾利亞修道院',passage:'修道院 · 密道',sanctum:'修道院 · 深處'};
export const RESCUE_SOLIDS:Record<RescueMap,Solid[]>={
 cathedral:[...[-5,5].flatMap(x=>[-4,0,4].map(z=>({x,z,w:3.2,d:1.1}))),{x:0,z:8.5,w:3.8,d:1.8},{x:-6.8,z:7.6,w:2.8,d:2.4},...[-9,9].flatMap(x=>[-5,1,7].map(z=>({x,z,w:1.1,d:1.1})))],
 passage:[{x:-6,z:2,w:3,d:7},{x:6,z:2,w:3,d:7},{x:-7,z:-5,w:2.2,d:1.4}],
 sanctum:[...[-6,6].flatMap(x=>[-3,3,8].map(z=>({x,z,w:1.1,d:1.1}))),{x:0,z:9,w:3.4,d:1.3},{x:7.8,z:7.7,w:2,d:1.7}],
};
export function rescueWalkable(x:number,z:number,map:RescueMap):boolean{
 if(!Number.isFinite(x)||!Number.isFinite(z)||x< -10.8||x>10.8||z< -8.4||z>10.2)return false;
 return !RESCUE_SOLIDS[map].some(b=>Math.abs(x-b.x)<b.w/2+.25&&Math.abs(z-b.z)<b.d/2+.25);
}
export const RESCUE_POINTS:Record<RescueMap,Place[]>={
 cathedral:[{id:'exit',label:'返回森林',x:0,z:-7.5},{id:'crest',label:'地上的王家紋章',x:0,z:1.8},{id:'frog',label:'披著斗篷的劍士',x:1.2,z:4.8},{id:'organ',label:'管風琴',x:-6.8,z:5.8},{id:'door',label:'祭壇後的暗門',x:4,z:9}],
 passage:[{id:'exit',label:'返回禮拜堂',x:0,z:-7.5},{id:'chest',label:'木箱',x:-7,z:-6.1},{id:'door',label:'深處的房間',x:0,z:9}],
 sanctum:[{id:'exit',label:'返回密道',x:0,z:-7.5},{id:'chancellor',label:'大臣？',x:0,z:4.5},{id:'queen',label:'莉妮王后',x:-2.5,z:7.4},{id:'prisoner',label:'上鎖的木箱',x:7.8,z:6.5}],
};
export function nearestRescue(x:number,z:number,map:RescueMap,r:Rescue):Place|undefined{
 let best:Place|undefined,min=1.8;
 for(const p of RESCUE_POINTS[map]){
  if(p.id==='crest'&&r.stage!=='entered')continue;
  if(p.id==='frog'&&r.stage!=='cleared')continue;
  if(p.id==='chancellor'&&r.yakraWon)continue;
  const d=Math.hypot(x-p.x,z-p.z);if(d<min){min=d;best=p;}
 }
 return best;
}
export function rescueObjective(r:Rescue):string{
 if(r.stage==='entered')return '地上似乎有王家的紋章。靠近中央調查。';
 if(r.stage==='cleared')return '危機暫時解除。與前方的青蛙劍士交談。';
 if(r.stage==='homecoming')return '莉妮王后已平安。到王城東側樓上確認瑪兒的情況。';
 if(r.stage==='reunited')return '瑪兒回來了！沿山道往北，到時門返回千年祭。';
 if(r.stage==='returned')return '已返回 1000 年。下一段：護送瑪兒回城與審判（尚未開放）。';
 if(r.stage==='rescued')return '王后已獲救。可檢查東側木箱，再從南方離開護送她回城。';
 if(r.yakraWon)return '擊敗亞克拉。與房間深處的莉妮王后交談。';
 if(!r.organOpen)return '青蛙已同行。試著彈奏禮拜堂西北方的管風琴。';
 if(!r.guardsWon)return '通過祭壇右後方暗門，深入密道。木箱裡有補給。';
 return '密道深處有人呼救。調查那位可疑的大臣。';
}
