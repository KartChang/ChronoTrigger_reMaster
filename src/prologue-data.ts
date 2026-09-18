import {newConduct,saveConduct,restoreConduct} from './fair-conduct-data';
import type {FairConduct} from './fair-conduct-data';
/** SNES-reference prologue. All coordinates/timing/art are authored reconstruction values. */
export type PrologueMap='bedroom'|'home'|'overworld1000';
export type PrologueStage='legacy'|'waking'|'home'|'fair'|'collision'|'companions';
export type Prologue={conduct:FairConduct|null;stage:PrologueStage;elapsed:number;first:'unknown'|'marle'|'pendant';checkedMarle:boolean;pendantPicked:boolean;pendantReturned:boolean;motherTalked:boolean;choice:'return'|'company'|'sell-pendant'|null;transition:{to:PrologueMap|'fair';x:number;z:number;elapsed:number;entered:boolean}|null};
export const newPrologue=(fresh=false):Prologue=>({conduct:fresh?newConduct():null,stage:fresh?'waking':'legacy',elapsed:0,first:'unknown',checkedMarle:false,pendantPicked:false,pendantReturned:false,motherTalked:false,choice:null,transition:null});
export const prologueMap=(id:string):id is PrologueMap=>['bedroom','home','overworld1000'].includes(id);
export const PROLOGUE_NAMES:Record<PrologueMap,string>={bedroom:'克羅諾的房間',home:'克羅諾的家',overworld1000:'托魯斯周邊 · 大地圖'};
export const MARLE_MEETING={x:-3.5,z:-1.7},DROPPED_PENDANT={x:-.5,z:-.2};
export const WORLD_HOME={x:2,z:-1},WORLD_FAIR={x:2,z:6};
export const WORLD_SOLIDS=[{x:2,z:-.2,w:1.65,d:1.35},{x:-2.3,z:-1.1,w:1.65,d:1.35},{x:-4.1,z:1.6,w:1.65,d:1.35},{x:4.3,z:-4.5,w:1.65,d:1.35}] as const;
export const HOME_SOLIDS={bedroom:[{x:3.6,z:1.6,w:2.3,d:3.6},{x:-3.7,z:3.4,w:3.1,d:1.8},{x:3.8,z:4.3,w:3.3,d:.6}],home:[{x:-2.4,z:.2,w:2.5,d:2.5},{x:-4.7,z:3.6,w:2,d:1.7},{x:2,z:4.4,w:2.2,d:.7}]} as const;
export function overworldLand(x:number,z:number):boolean{
 return Number.isFinite(x)&&Number.isFinite(z)&&z>=-7.8&&z<=8.8&&x>=-9.6&&x<=8.5&&!(x>5.5&&z<-2)&&!(x<-6.2&&z<-4.6)&&!(x>7&&z>6.7);
}
export function prologueWalkable(x:number,z:number,map:PrologueMap):boolean{
 if(map==='overworld1000')return overworldLand(x,z)&&!WORLD_SOLIDS.some(o=>Math.abs(x-o.x)<o.w/2+.12&&Math.abs(z-o.z)<o.d/2+.12)&&!(x<-3.8&&z>4.5)&&!(x>5&&z>1&&z<4.2);
 if(!Number.isFinite(x)||!Number.isFinite(z)||Math.abs(x)>5.75||z< -4.6||z>4.6)return false;
 return !HOME_SOLIDS[map].some(o=>Math.abs(x-o.x)<o.w/2+.22&&Math.abs(z-o.z)<o.d/2+.22);
}
export function prologueHint(chapter:string,p:{x:number;z:number},q:Prologue):string{
 const near=(x:number,z:number,r=1.6)=>Math.hypot(p.x-x,p.z-z)<r;
 if(q.stage==='waking')return '母親拉開窗簾，鐘聲從廣場傳來。';
 if(chapter==='bedroom')return near(0,-4.1)?'往南走下樓梯':near(3.6,1.6,2.5)?'E · 床鋪':'往南走下樓，到鎮上看看。';
 if(chapter==='home')return near(0,-4.2)?'E · 出門':near(0,2)?'E · 母親':near(4.7,3.8)?'往北走上樓梯':'母親在窗邊；南方是家門。';
 if(chapter==='overworld1000')return near(WORLD_HOME.x,WORLD_HOME.z,1.25)?'克羅諾的家 · E 進入':near(WORLD_FAIR.x,WORLD_FAIR.z,1.25)?'莉妮廣場 · E 進入':'沿陸地向北前往千年祭。';
 if(chapter==='fair'&&q.stage!=='legacy'&&q.stage!=='companions')return q.stage==='fair'?'鐘台前有個匆忙的女孩。':!q.pendantPicked?'女孩與掉落的項鍊都在鐘台附近。':!q.pendantReturned?'靠近女孩，歸還項鍊。':'再和女孩說話，回應同行的邀請。';
 return '';
}
/** Persist only facts witnessed by this playthrough; no inferred trial verdict or legacy choices. */
export type PrologueSave=Pick<Prologue,'stage'|'first'|'checkedMarle'|'pendantPicked'|'pendantReturned'|'motherTalked'> & {conduct?:Record<string,unknown>};
export function prologueSave(p:Prologue):PrologueSave{return {...(p.conduct?{conduct:saveConduct(p.conduct)}:{}),stage:p.stage,first:p.first,checkedMarle:p.checkedMarle,pendantPicked:p.pendantPicked,pendantReturned:p.pendantReturned,motherTalked:p.motherTalked};}
export function restorePrologue(v:unknown):Prologue{
 if(!v||typeof v!=='object'||Array.isArray(v))throw new Error('初始開場資料錯誤。');
 const o=v as Record<string,unknown>,p=newPrologue();
 if(typeof o.stage!=='string'||typeof o.first!=='string'||!['home','fair','collision','companions'].includes(o.stage)||!['unknown','marle','pendant'].includes(o.first))throw new Error('初始開場進度錯誤。');
 p.stage=o.stage as PrologueStage;p.first=o.first as Prologue['first'];
 for(const k of ['checkedMarle','pendantPicked','pendantReturned','motherTalked'] as const){if(typeof o[k]!=='boolean')throw new Error('初始開場旗標錯誤。');p[k]=o[k];}
 if((p.first==='unknown'&&(p.checkedMarle||p.pendantPicked))||(p.first==='marle'&&!p.checkedMarle)||(p.first==='pendant'&&!p.pendantPicked)||(p.pendantReturned&&(!p.pendantPicked||!p.checkedMarle))||(p.stage==='companions'&&!p.pendantReturned)||(['home','fair'].includes(p.stage)&&(p.first!=='unknown'||p.pendantReturned)))throw new Error('初遇事件順序不一致。');
 p.conduct=restoreConduct(o.conduct);
 if(p.conduct&&['home','fair'].includes(p.stage)&&(p.conduct.saleAttempted||p.conduct.saleDeclined||p.conduct.returnRefused||p.conduct.candy!=='unseen'||p.conduct.sealed))throw new Error('初遇之前不得有同行經歷。');
 if(p.stage==='collision')p.elapsed=.6;
 return p;
}
