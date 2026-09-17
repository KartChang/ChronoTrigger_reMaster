/** Compact authored route, not a ROM map. Coordinates also drive collision and NPC placement. */
export type KingdomMap = 'truce'|'forest'|'castle'|'chamber';
export type KingdomPhase = 'none'|'arrival'|'audience'|'erasing'|'missing'|'rescue';
export type Kingdom = {phase:KingdomPhase;heardYear:boolean;forestWon:boolean;elapsed:number};
export const newKingdom=():Kingdom=>({phase:'none',heardYear:false,forestWon:false,elapsed:0});
export const kingdomMap=(chapter:string):chapter is KingdomMap=>['truce','forest','castle','chamber'].includes(chapter);
export type Solid={x:number;z:number;w:number;d:number};
export type Place={id:string;label:string;x:number;z:number};
export const KINGDOM_SOLIDS:Record<KingdomMap,Solid[]>={
 truce:[{x:-7,z:4,w:5,d:4},{x:7,z:4,w:4.5,d:3.6},{x:-6.5,z:-1.5,w:5,d:3.2},{x:6.5,z:-.6,w:3,d:2}],
 forest:[{x:-8,z:-4,w:3,d:2},{x:7,z:-3,w:3,d:2},{x:-6,z:5,w:4,d:3},{x:7.5,z:6,w:3,d:3}],
 castle:[{x:-6,z:1,w:1,d:1},{x:6,z:1,w:1,d:1},{x:-6,z:6,w:1,d:1},{x:6,z:6,w:1,d:1},{x:0,z:8.8,w:3,d:1.2}],
 chamber:[{x:-6,z:4,w:3.5,d:4},{x:6.5,z:7,w:3,d:1.5},{x:6.5,z:1.5,w:2,d:2}],
};
export const KINGDOM_POINTS:Record<KingdomMap,Place[]>={
 truce:[{id:'resident',label:'鎮民',x:-4.5,z:1},{id:'inn',label:'旅店 · 休息',x:-6.5,z:-4},{id:'canyon',label:'托魯斯山道',x:0,z:8.5},{id:'forest',label:'加爾迪亞森林',x:8,z:-5}],
 forest:[{id:'town',label:'返回托魯斯',x:0,z:-7.5},{id:'castle',label:'加爾迪亞王城',x:0,z:9},{id:'cathedral',label:'西方修道院方向',x:-9.5,z:.5}],
 castle:[{id:'exit',label:'返回森林',x:0,z:-7.5},{id:'guard',label:'衛兵',x:-1.8,z:-2.5},{id:'king',label:'國王',x:0,z:7.2},{id:'stairs',label:'東側樓梯 · 王后房間',x:8,z:6.6},{id:'lucca',label:'露卡',x:2,z:-3.2}],
 chamber:[{id:'stairs',label:'返回王城大廳',x:0,z:-7.5},{id:'queen',label:'王后？',x:0,z:2}],
};
export function kingdomWalkable(x:number,z:number,chapter:KingdomMap):boolean{
 if(!Number.isFinite(x)||!Number.isFinite(z)||x<-10.8||x>10.8||z<-8.5||z>10.5)return false;
 return !KINGDOM_SOLIDS[chapter].some(r=>Math.abs(x-r.x)<r.w/2+.25&&Math.abs(z-r.z)<r.d/2+.25);
}
export function nearestKingdom(x:number,z:number,chapter:KingdomMap,phase:KingdomPhase):Place|undefined{
 let best:Place|undefined,min=1.8;
 for(const p of KINGDOM_POINTS[chapter]){
  if(p.id==='lucca'&&phase!=='missing')continue;
  if(p.id==='queen'&&(phase==='missing'||phase==='rescue'))continue;
  const d=Math.hypot(x-p.x,z-p.z);if(d<min){min=d;best=p;}
 }
 return best;
}
export const KINGDOM_NAMES:Record<KingdomMap,string>={truce:'托魯斯 · 600 年',forest:'加爾迪亞森林',castle:'加爾迪亞王城',chamber:'王后房間'};
