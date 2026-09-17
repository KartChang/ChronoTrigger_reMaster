import {newKingdom,kingdomMap,kingdomWalkable,nearestKingdom} from './kingdom-data';
import type {Kingdom,KingdomMap} from './kingdom-data';
import {newOpening,cinematic,marlePresent,canyonWalkable,CANYON_EXIT} from './story-data';
import type {Opening} from './story-data';
import {fairWalkable,nearestFair,newFairFlags} from './fair-data';
import type {Chapter,FairFlags} from './fair-data';
/** Pure deterministic prototype rules. No renderer, DOM, original ROM data or network. */
export type Era = 'present' | 'future' | 'middle';
export type Mode = 'explore' | 'battle' | 'victory' | 'defeat';
export type Slot = 0 | 1;
export type Vec = { x: number; z: number };
export type Actor = Vec & { hp: number; mp: number; atb: number; facing: number; walking: boolean };
export type Enemy = Vec & { hp: number; atb: number };
export type Effect = { x: number; z: number; text: string; kind: 'hit' | 'heal' | 'combo'; actor?:Slot; origin?:Vec; style?:'slash'|'shot'|'fire'|'spin' };
export type Flags = { repaired: boolean; won: boolean; visitedFuture: boolean };
export type State = {
  mode: Mode; era: Era; joined: boolean; players: [Actor, Actor]; enemies: Enemy[];
  targets: [number|null,number|null]; flags: Flags; combo: [boolean, boolean]; log: string[]; effects: Effect[];
  ticks: number; enemyTurn: number; chapter: Chapter; fair: FairFlags; opening: Opening; kingdom:Kingdom;
};
export type Input = [Vec, Vec];
export const MAX_HP = 120;
export const MAX_MP = 18;
export const SPEED = 4;
export const MAX_SEPARATION = 9;
export const IDLE: Input = [{ x: 0, z: 0 }, { x: 0, z: 0 }];
export const OBSTACLES = [
  { x: -8, z: 2, w: 4.2, d: 3.6 },
  { x: 6, z: 6, w: 3.8, d: 3.4 },
  { x: -10.5, z: -1, w: 1.8, d: 1.8 },
  { x: 5.8, z: -5, w: 1.8, d: 1.8 },
  { x: -5.5, z: 7.5, w: 1.8, d: 1.8 },
];
export function createState(chapter: Chapter = 'lab'): State {
  const actor = (x: number): Actor => ({ x, z: -5, hp: MAX_HP, mp: MAX_MP, atb: 0, facing: 0, walking: false });
  return { mode: 'explore', era: 'present', joined: false, players: [actor(-1), actor(1)],
    enemies: [], flags: { repaired: false, won: false, visitedFuture: false },
    targets: [null,null], combo: [false, false], log: [chapter==='fair'?'千年祭：同行之後、傳送實驗之前。':'沿石路向北，探索測試村落。'], effects: [], ticks: 0, enemyTurn: 0, chapter, fair: newFairFlags(), opening:newOpening(), kingdom:newKingdom() };
}
export const activeSlot=(s:State,slot:Slot):boolean=>slot===0||s.kingdom.phase==='rescue'||(s.kingdom.phase==='none'&&marlePresent(s.opening.phase));
export const cutsceneActive=(s:State):boolean=>cinematic(s.opening.phase)||s.kingdom.phase==='erasing';
export const distance = (a: Vec, b: Vec): number => Math.hypot(a.x - b.x, a.z - b.z);
export function walkable(x: number, z: number, chapter: Chapter = 'lab'): boolean {
  if(kingdomMap(chapter))return kingdomWalkable(x,z,chapter);
  if(chapter==='fair')return fairWalkable(x,z);
  if(chapter==='canyon')return canyonWalkable(x,z);
  if (!Number.isFinite(x) || !Number.isFinite(z) || x < -12.6 || x > 12.6 || z < -8.6 || z > 10.6) return false;
  if (x > 8.8 && x < 11.8 && Math.abs(z + 1) > 1.05) return false;
  return !OBSTACLES.some(o => Math.abs(x-o.x) < o.w/2+0.25 && Math.abs(z-o.z) < o.d/2+0.25);
}
function log(s: State, text: string): void { s.log.push(text); if (s.log.length > 5) s.log.shift(); }
function move(s: State, slot: Slot, vector: Vec, dt: number): void {
  const p = s.players[slot], peer = s.players[slot === 0 ? 1 : 0];
  const len = Math.hypot(vector.x, vector.z);
  p.walking = false;
  if (len < 0.05) return;
  const nx = vector.x / Math.max(1, len), nz = vector.z / Math.max(1, len);
  const allowed = (x: number, z: number) => walkable(x, z, s.chapter) && (!s.joined || !activeSlot(s,1) || distance({x,z},peer) <= MAX_SEPARATION);
  const x = p.x + nx * SPEED * dt;
  if (allowed(x,p.z)) { p.walking ||= Math.abs(x-p.x)>0.0001; p.x=x; }
  const z = p.z + nz * SPEED * dt;
  if (allowed(p.x,z)) { p.walking ||= Math.abs(z-p.z)>0.0001; p.z=z; }
  p.facing = Math.abs(nx)>Math.abs(nz) ? (nx>0?1:3) : (nz>0?2:0);
}
export function setCoop(s: State, joined: boolean): boolean {
  if (s.mode !== 'explore'||cutsceneActive(s)) return false;
  s.joined=joined;
  s.combo=[false,false];
  log(s,!activeSlot(s,1)?'瑪兒暫時離隊；雙人設定保留，但此段由克羅諾行動。':joined?'P2 已加入：各自控制角色，共享鏡頭。':'P2 已退出：夥伴恢復跟隨與自動攻擊。');
  return true;
}
export function beginBattle(s: State): boolean {
  if (s.mode !== 'explore'||cutsceneActive(s)) return false;
  if(kingdomMap(s.chapter)&&(s.chapter!=='forest'||s.kingdom.forestWon))return false;
  if(s.chapter==='fair'&&s.opening.phase!=='none')return false;
  if(s.chapter==='canyon'&&(s.opening.phase!=='canyon'||s.opening.canyonWon))return false;
  s.mode='battle'; s.targets=[null,null]; s.combo=[false,false]; s.enemyTurn=0;
  s.players.forEach((p,i)=>{p.x=-1.5+i*3;p.z=1;p.atb=0;p.walking=false;p.facing=2;});
  s.enemies=s.chapter==='forest'?[{x:-1.8,z:2.8,hp:48,atb:0},{x:1.8,z:2.8,hp:48,atb:0}]:s.chapter==='canyon'?[{x:-1.8,z:2.4,hp:48,atb:0},{x:1.8,z:3,hp:48,atb:0},{x:.2,z:1.5,hp:48,atb:0}]:s.chapter==='fair'?[{x:-7,z:4.8,hp:120,atb:0}]:[{x:-2,z:4.5,hp:90,atb:0},{x:2,z:4.8,hp:90,atb:0}];
  if(s.chapter==='fair')s.players.forEach((p,i)=>{p.x=-8.5+i*3;p.z=2;});
  if(s.chapter==='canyon')s.players[0].x=0,s.players[0].z=5;
  if(s.chapter==='forest')s.players.forEach((p,i)=>Object.assign(p,{x:-1.5+i*3,z:-1}));
  log(s,s.chapter==='forest'?'草叢裡有動靜……！':s.chapter==='canyon'?'魔物攔住山道。克羅諾獨自迎戰。':'ATB 戰鬥開始。兩人各自下指令；合技需要雙方確認。'); return true;
}
function eligible(s: State, slot: Slot, mp: number): boolean {
  const p=s.players[slot];return activeSlot(s,slot)&&!cutsceneActive(s)&&s.mode==='battle' && p.hp>0 && p.atb>=1 && p.mp>=mp;
}
function finish(s: State): void {
  if (s.enemies.every(e=>e.hp<=0)) { s.mode='victory';if(s.chapter==='forest')s.kingdom.forestWon=true;else if(s.chapter==='canyon')s.opening.canyonWon=true;else if(s.chapter==='fair')s.fair.gatoWon=true;else s.flags.won=true;s.combo=[false,false];log(s,s.chapter==='forest'?'林間小路恢復了寧靜。王城就在北方。':s.chapter==='canyon'?'攔路的魔物倒下了。沿山道向南走。':s.chapter==='fair'?'機器人挑戰完成。可返回廣場或前往露卡的展示區。':'試煉完成！北方時門已可探索。'); }
}
/** UI target choice is transient, per-player and never part of a save file. */
export function selectedEnemy(s:State,slot:Slot):number|null {
 if(s.mode!=='battle'||!activeSlot(s,slot)||s.players[slot].hp<=0)return null;
 const chosen=s.targets[slot];
 if(chosen!==null&&s.enemies[chosen]&&s.enemies[chosen]!.hp>0)return chosen;
 let result:number|null=null,min=Infinity;
 s.enemies.forEach((e,i)=>{const d=distance(e,s.players[slot]);if(e.hp>0&&d<min){result=i;min=d;}});
 return result;
}
export function cycleTarget(s:State,slot:Slot,direction:1|-1):boolean {
 if((direction!==1&&direction!==-1)||cutsceneActive(s)||(slot===1&&!s.joined))return false;
 const current=selectedEnemy(s,slot);if(current===null)return false;
 const alive=s.enemies.map((e,i)=>e.hp>0?i:-1).filter(i=>i>=0);
 const at=alive.indexOf(current);s.targets[slot]=alive[(at+direction+alive.length)%alive.length]!;
 return true;
}
export function action(s: State, slot: Slot, kind: 'attack'|'skill'): boolean {
  const cost=kind==='skill'?3:0;
  if (!eligible(s,slot,cost)) return false;
  const p=s.players[slot],index=selectedEnemy(s,slot);const target=index===null?undefined:s.enemies[index];
  if (!target) return false;
  s.combo[slot]=false;p.atb=0;p.mp-=cost;
  const damage=kind==='skill'?48:30;target.hp=Math.max(0,target.hp-damage);
  s.effects.push({x:target.x,z:target.z,text:String(damage),kind:'hit',actor:slot,origin:{x:p.x,z:p.z},style:kind==='skill'?(slot===1&&s.kingdom.phase==='rescue'?'fire':'spin'):slot===1?'shot':'slash'});
  log(s,`P${slot+1} ${kind==='skill'?'施放技能':'攻擊'}：${damage} 傷害。`);finish(s);return true;
}
export function requestCombo(s: State, slot: Slot): boolean {
  if (!activeSlot(s,1)||!eligible(s,slot,4)) return false;
  s.combo[slot]=true;
  if (!s.joined && slot===0 && eligible(s,1,4)) s.combo[1]=true;
  tryCombo(s);return true;
}
function tryCombo(s: State): void {
  if (!s.combo[0] || !s.combo[1] || !eligible(s,0,4) || !eligible(s,1,4)) return;
  s.players.forEach(p=>{p.atb=0;p.mp-=4;});s.combo=[false,false];
  s.enemies.filter(e=>e.hp>0).forEach(e=>{e.hp=Math.max(0,e.hp-72);s.effects.push({x:e.x,z:e.z,text:'72',kind:'combo',style:'spin'});});
  log(s,'雙人合技「共鳴斬」！雙方消耗 ATB 與 4 MP。');finish(s);
}
export function step(s: State, input: Input, delta: number): void {
  if (!Number.isFinite(delta) || delta<=0) return;
  const dt=Math.min(delta,0.05);s.ticks++;
  if(s.kingdom.phase==='erasing'){s.kingdom.elapsed+=dt;if(s.kingdom.elapsed>=2.2){s.kingdom.phase='missing';s.kingdom.elapsed=0;log(s,'瑪兒的身影消失了。先回大廳看看。');}return;}
  if(cutsceneActive(s)){stepOpening(s,dt);return;}
  if (s.mode==='explore') {
    move(s,0,input[0],dt);
    if (s.joined && activeSlot(s,1)) move(s,1,input[1],dt);
    else if(activeSlot(s,1)) {
      const a=s.players[0],b=s.players[1],dist=distance(a,b);
      move(s,1,dist>1.7?{x:(a.x-b.x)/dist,z:(a.z-b.z)/dist}:{x:0,z:0},dt);
    }
    if(s.chapter==='forest'&&!s.kingdom.forestWon&&s.players[0].z>.2)beginBattle(s);
    if(s.chapter==='canyon'&&!s.opening.canyonWon&&s.players[0].z<5.5)beginBattle(s);
    if (s.chapter==='lab' && !s.flags.won && s.players.some(p=>Math.abs(p.x)<3.3 && p.z>2.4 && p.z<5.8)) beginBattle(s);
    return;
  }
  if (s.mode!=='battle') return;
  s.players.forEach((p,i)=>{if(activeSlot(s,i as Slot)&&p.hp>0)p.atb=Math.min(1,p.atb+dt*0.42);});
  if (!s.joined && eligible(s,1,0)) {
    if (s.combo[0] && eligible(s,1,4)) {s.combo[1]=true;tryCombo(s);}
    else if (!s.combo[0]) action(s,1,'attack');
  }
  if(s.mode!=='battle')return;
  for(const e of s.enemies) {
    if(e.hp<=0)continue;
    e.atb+=dt*0.14;
    if(e.atb>=1) {
      e.atb=0;const alive=s.players.filter((p,i)=>activeSlot(s,i as Slot)&&p.hp>0);const p=alive[s.enemyTurn++%alive.length];
      if(!p)break;
      p.hp=Math.max(0,p.hp-12);s.effects.push({x:p.x,z:p.z,text:'−12',kind:'hit'});
      if(p.hp===0){const idx=s.players.indexOf(p) as Slot;s.combo[idx]=false;p.atb=0;}
    }
  }
  if(s.players.every((p,i)=>!activeSlot(s,i as Slot)||p.hp<=0)){s.mode='defeat';s.combo=[false,false];log(s,s.chapter==='canyon'?'克羅諾倒下了。可回山道入口重新整裝。':'試煉失敗。可回村補給，再次挑戰。');}
}
export function leaveBattle(s: State): void {
  if((s.chapter==='canyon'||kingdomMap(s.chapter))&&s.mode!=='victory'&&s.mode!=='defeat')return;
  s.mode='explore';s.enemies=[];s.targets=[null,null];s.combo=[false,false];
  if(s.chapter==='forest'){s.players.forEach((p,i)=>Object.assign(p,{x:-1+i*2,z:s.kingdom.forestWon?3.5:-6,hp:MAX_HP,mp:MAX_MP,atb:0,walking:false}));return;}
  if(s.chapter==='canyon'){
    s.players.forEach(p=>Object.assign(p,{x:0,z:s.opening.canyonWon?4.5:8,hp:MAX_HP,mp:MAX_MP,atb:0,walking:false}));return;
  }
  s.players.forEach((p,i)=>Object.assign(p,{x:s.chapter==='fair'?-8+i*2:-1+i*2,z:s.chapter==='fair'?1:-3,hp:MAX_HP,mp:MAX_MP,atb:0,walking:false}));
}
export function repair(s: State): boolean {
  if(s.chapter!=='lab'||s.mode!=='explore'||s.era!=='present'||s.flags.repaired)return false;
  s.flags.repaired=true;log(s,'你修復了村落的晶核。未來會有所不同。');return true;
}
export function travel(s: State): boolean {
  if(s.chapter!=='lab'||s.mode!=='explore')return false;
  s.era=s.era==='present'?'future':'present';if(s.era==='future')s.flags.visitedFuture=true;
  s.players.forEach((p,i)=>{p.x=-0.8+i*1.6;p.z=7;p.walking=false;});
  log(s,s.era==='present'?'回到青翠的現在。':s.flags.repaired?'晶核持續運轉，未來仍有光。':'抵達未來：未修復的晶核已經熄滅。');return true;
}
export type SaveData = {version:1|2|3|4;kingdom?:Omit<Kingdom,'elapsed'>;opening?:{phase:Opening['phase'];canyonWon:boolean};chapter?:Chapter;fair?:FairFlags;era:Era;joined:boolean;flags:Flags;players:{x:number;z:number;hp:number;mp:number}[]};
export function serialize(s: State): string {
  if(s.mode!=='explore'||cutsceneActive(s))throw new Error('請先結束戰鬥或演出再存檔。');
  if(s.kingdom.phase!=='none')return JSON.stringify({version:4,chapter:s.chapter,era:s.era,joined:s.joined,flags:{...s.flags},fair:{...s.fair},opening:{phase:s.opening.phase,canyonWon:s.opening.canyonWon},kingdom:{phase:s.kingdom.phase,heardYear:s.kingdom.heardYear,forestWon:s.kingdom.forestWon},players:s.players.map(({x,z,hp,mp})=>({x,z,hp,mp}))} satisfies SaveData);
  if(s.opening.phase!=='none')return JSON.stringify({version:3,chapter:s.chapter,era:s.era,joined:s.joined,flags:{...s.flags},fair:{...s.fair},opening:{phase:s.opening.phase,canyonWon:s.opening.canyonWon},players:s.players.map(({x,z,hp,mp})=>({x,z,hp,mp}))} satisfies SaveData);
  return JSON.stringify({version:s.chapter==='fair'?2:1,...(s.chapter==='fair'?{chapter:s.chapter,fair:{...s.fair}}:{}),era:s.era,joined:s.joined,flags:{...s.flags},players:s.players.map(({x,z,hp,mp})=>({x,z,hp,mp}))} satisfies SaveData);
}
export function deserialize(raw: string): State {
  if(raw.length>65536)throw new Error('存檔太大。');
  const v:unknown=JSON.parse(raw);
  if(!v||typeof v!=='object')throw new Error('存檔格式錯誤。');
  const o=v as Record<string,unknown>;
  if((o.version!==1&&o.version!==2&&o.version!==3&&o.version!==4)||(typeof o.era!=='string'||!['present','future','middle'].includes(o.era))||typeof o.joined!=='boolean')throw new Error('不支援的存檔版本或格式。');
  if(!Array.isArray(o.players)||o.players.length!==2||!o.flags||typeof o.flags!=='object')throw new Error('存檔資料不完整。');
  const f=o.flags as Record<string,unknown>;
  if(['won','repaired','visitedFuture'].some(k=>typeof f[k]!=='boolean'))throw new Error('事件旗標錯誤。');
  if(o.version===1&&o.era==='middle')throw new Error('舊存檔不支援此時代。');
  if(o.version===4&&(typeof o.chapter!=='string'||(!kingdomMap(o.chapter)&&o.chapter!=='canyon')))throw new Error('王國存檔地圖錯誤。');
  const s=createState(o.version===4?o.chapter as Chapter:o.version===3&&o.chapter==='canyon'?'canyon':o.version!==1?'fair':'lab');s.era=o.era as Era;s.joined=o.joined;
  if(o.version===2||o.version===3||o.version===4){
    if((o.version===2&&(o.chapter!=='fair'||o.era!=='present'))||!o.fair||typeof o.fair!=='object'||Array.isArray(o.fair))throw new Error('千年祭存檔格式錯誤。');
    const fair=o.fair as Record<string,unknown>;
    for(const key of Object.keys(s.fair) as (keyof FairFlags)[]){
      if(typeof fair[key]!=='boolean')throw new Error('千年祭事件旗標錯誤。');
      s.fair[key]=fair[key] as boolean;
    }
    if(s.fair.telepodTested&&!s.fair.luccaMet)throw new Error('傳送事件缺少前置進度。');
  }
  if(o.version===3){
    if(!o.opening||typeof o.opening!=='object'||Array.isArray(o.opening))throw new Error('開場存檔格式錯誤。');
    const op=o.opening as Record<string,unknown>;
    if((typeof op.phase!=='string'||!['lost','pendant','canyon','vista'].includes(op.phase))||typeof op.canyonWon!=='boolean'||!s.fair.telepodTested)throw new Error('開場進度錯誤。');
    const inCanyon=op.phase==='canyon'||op.phase==='vista';
    if(o.chapter!==(inCanyon?'canyon':'fair')||o.era!==(inCanyon?'middle':'present')||(!inCanyon&&op.canyonWon)||(op.phase==='vista'&&!op.canyonWon))throw new Error('時代與事件進度不一致。');
    s.opening={phase:op.phase as Opening['phase'],elapsed:0,canyonWon:op.canyonWon};
  }
  if(o.version===4){
    const op=o.opening as Record<string,unknown>|undefined,k=o.kingdom as Record<string,unknown>|undefined;
    if(o.era!=='middle'||!op||typeof op!=='object'||Array.isArray(op)||op.phase!=='vista'||op.canyonWon!==true||!s.fair.telepodTested)throw new Error('王國事件缺少開場進度。');
    if(!k||typeof k!=='object'||Array.isArray(k)||typeof k.phase!=='string'||!['arrival','audience','missing','rescue'].includes(k.phase)||typeof k.heardYear!=='boolean'||typeof k.forestWon!=='boolean')throw new Error('王國進度錯誤。');
    if((s.chapter==='chamber'&&k.phase==='arrival')||(['audience','missing','rescue'].includes(k.phase)&&!k.forestWon)||(['castle','chamber'].includes(s.chapter)&&!k.forestWon))throw new Error('王城前置條件不一致。');
    s.opening={phase:'vista',elapsed:0,canyonWon:true};s.kingdom={phase:k.phase as Kingdom['phase'],heardYear:k.heardYear,forestWon:k.forestWon,elapsed:0};
  }
  s.flags={won:f.won as boolean,repaired:f.repaired as boolean,visitedFuture:f.visitedFuture as boolean};
  for(let i=0;i<2;i++) {
    const p=o.players[i];if(!p||typeof p!=='object')throw new Error('角色存檔錯誤。');
    if(['x','z','hp','mp'].some(k=>typeof p[k]!=='number'||!Number.isFinite(p[k])))throw new Error('角色數值錯誤。');
    if(!walkable(p.x,p.z,s.chapter)||p.hp<1||p.hp>MAX_HP||p.mp<0||p.mp>MAX_MP)throw new Error('角色位置或能力值超出範圍。');
    Object.assign(s.players[i]!,{x:p.x,z:p.z,hp:p.hp,mp:p.mp});
  }
  if(s.joined&&activeSlot(s,1)&&distance(s.players[0],s.players[1])>MAX_SEPARATION+0.01)throw new Error('雙人距離超出範圍。');
  s.log=['已讀取存檔。'];return s;
}

/** Only called through exploration interaction; no renderer owns chapter progression. */
export function interactFair(s: State, slot: Slot): {title:string;text:string}|null {
  if(s.chapter!=='fair'||s.mode!=='explore'||cutsceneActive(s)||!activeSlot(s,slot)||(slot===1&&!s.joined))return null;
  const opening=interactOpening(s,slot);if(opening)return opening;
  if(s.opening.phase!=='none')return {title:'露卡',text:'先找回瑪兒留下的項鍊。裝置在北方左側。'};
  const point=nearestFair(s.players[slot].x,s.players[slot].z);
  if(!point)return {title:'千年祭廣場',text:'靠近鐘台、機器人、糖果攤或北方展示區，再按互動。'};
  switch(point.id){
    case 'bell':
      s.fair.bellHeard=true;
      return {title:'莉妮之鐘',text:'清亮的鐘聲響過廣場。\n瑪兒抬頭望著鐘，露出笑容。遠處，露卡的展示正要開始。'};
    case 'gato':
      beginBattle(s);
      return {title:'岡薩雷斯 · Gato',text:'機器人伸出拳套，邀請你們挑戰。\n\n這場試作保留 ATB，可各自下指令，也可兩人確認合技。能力數值與技能為暫定測試值，不是原作數據。'};
    case 'lucca':
      if(s.fair.telepodTested){
        if(beginOpening(s,slot))return {title:'瑪兒',text:'看起來很有趣。接下來換我試試！'};
        return {title:'露卡',text:'克羅諾，和瑪兒一起靠近展示台吧。'};
      }
      s.fair.luccaMet=true;
      return {title:'露卡的展示',text:'克羅諾，來得正好！站到左側平台上，我們把你送到另一邊。'};
    case 'telepod':{
      if(!s.fair.luccaMet)return {title:'裝置尚未啟動',text:'先和前方的露卡交談，確認實驗已準備完成。'};
      const peer=s.players[slot===0?1:0],target={x:2.4,z:9};
      if(s.joined&&distance(peer,target)>MAX_SEPARATION)return {title:'等待同行者',text:'請另一位玩家一起靠近展示區，再啟動傳送。'};
      s.fair.telepodTested=true;Object.assign(s.players[slot],target,{walking:false});
      if(!s.joined)Object.assign(peer,{x:1,z:7,walking:false});
      s.effects.push({...target,text:'傳送完成',kind:'heal'});
      return {title:'短距離傳送成功',text:'光線散去，你已站在另一側的平台。\n瑪兒興奮地望向露卡。回到露卡身旁，繼續展示。'};
    }
    case 'candy':return {title:'糖果攤',text:'彩色糖果排滿木盤。\n瑪兒停下腳步，仔細挑選著。今天的廣場比平常熱鬧多了。'};
    case 'save':return {title:'試玩存檔點',text:'可用右側「存檔」保存本章，或匯出備份。\n千年祭存檔為 v2；舊村落 v1 存檔仍可讀取。'};
  }
}

/** Begin only at the actual stage, after the normal demonstration. The scripted sequence temporarily owns movement; it does not imply a P2 vote. */
export function beginOpening(s:State,slot:Slot):boolean{
  if(s.chapter!=='fair'||s.mode!=='explore'||s.opening.phase!=='none'||!s.fair.luccaMet||!s.fair.telepodTested||slot!==0)return false;
  if(distance(s.players[0],{x:0,z:7.2})>2.05||distance(s.players[1],{x:-2.4,z:9})>6)return false;
  s.opening.phase='approach';s.opening.elapsed=0;s.combo=[false,false];
  s.players.forEach(p=>p.walking=false);return true;
}
function stepOpening(s:State,dt:number):void{
  const op=s.opening;op.elapsed+=dt;
  if(op.phase==='approach'){
    const p=s.players[1],target={x:-2.4,z:9},d=distance(p,target);
    if(d>.05){const f=Math.min(1,dt*3/d);p.x+=(target.x-p.x)*f;p.z+=(target.z-p.z)*f;p.facing=2;p.walking=true;}
    else {p.walking=false;op.phase='resonance';op.elapsed=0;log(s,'項鍊突然發光，平台上方的空間開始扭曲。');}
  }else if(op.phase==='resonance'&&op.elapsed>=2){
    op.phase='lost';op.elapsed=0;s.players[1].walking=false;log(s,'瑪兒消失在光裡。平台上只剩下一條項鍊。');
  }else if(op.phase==='crossing'&&op.elapsed>=1.4){
    s.chapter='canyon';s.era='middle';op.phase='canyon';op.elapsed=0;
    s.players.forEach(p=>Object.assign(p,{x:0,z:8,walking:false,atb:0,facing:0}));
    log(s,'鳥鳴取代了廣場的喧鬧。這裡……不是千年祭。');
  }
}
export function interactOpening(s:State,slot:Slot):{title:string;text:string}|null{
  if(s.mode!=='explore'||cutsceneActive(s)||slot!==0)return null;
  if(s.chapter==='fair'&&distance(s.players[0],{x:-2.4,z:9})<2.05){
    if(s.opening.phase==='lost'){
      s.opening.phase='pendant';return {title:'露卡',text:'那是她留下的項鍊……你要去找她？\n我會再啟動一次裝置。準備好後，就站上平台。'};
    }
    if(s.opening.phase==='pendant'){
      s.opening.phase='crossing';s.opening.elapsed=0;
      return {title:'克羅諾',text:'你握緊項鍊，踏進扭曲的光裡。'};
    }
  }
  if(s.chapter==='canyon'&&distance(s.players[0],CANYON_EXIT)<2.05){
    if(!s.opening.canyonWon)return {title:'山道',text:'魔物擋在山道上。先想辦法通過這裡。'};
    if(s.opening.phase==='vista'){if(s.joined&&activeSlot(s,1)&&distance(s.players[0],s.players[1])>3.5)return {title:'等待同行者',text:'一起靠近山道出口，再往山下走。'};if(s.kingdom.phase==='none')s.kingdom.phase='arrival';return changeKingdomMap(s,'truce',0,6.4);}
    s.opening.phase='vista';return {title:'600 年 · 托魯斯山道',text:'山下有房屋與炊煙。沿著路走，或許能打聽到瑪兒的消息。\n\n再按一次 E，前往托魯斯。'};
  }
  return null;
}

/** Chapter boundaries are user interactions, never renderer side effects. */
function changeKingdomMap(s:State,chapter:KingdomMap|'canyon',x:number,z:number):{title:string;text:string}{
 s.chapter=chapter;s.era='middle';s.enemies=[];s.combo=[false,false];s.effects=[];
 s.players.forEach((p,i)=>Object.assign(p,{x:x+(activeSlot(s,1)?i*1.3:0),z,walking:false,atb:0,facing:2}));
 return {title:chapter==='truce'?'托魯斯':chapter==='forest'?'加爾迪亞森林':chapter==='castle'?'加爾迪亞王城':chapter==='chamber'?'王后房間':'托魯斯山道',text:chapter==='truce'?'屋舍散落在小路旁。旅店亮著燈，路邊有人正在交談。':chapter==='forest'?'樹葉掩住天空。北方的小路通往王城。':chapter==='castle'?'靴底踏上石板。衛兵正在大廳前值守。':chapter==='chamber'?'房間裡，有個熟悉的身影……':'回到了山道。南方仍通往托魯斯。'};
}
export function interactKingdom(s:State,slot:Slot):{title:string;text:string}|null{
 if(!kingdomMap(s.chapter)||s.mode!=='explore'||cutsceneActive(s)||!activeSlot(s,slot)||(slot===1&&!s.joined))return null;
 const point=nearestKingdom(s.players[slot].x,s.players[slot].z,s.chapter,s.kingdom.phase);
 if(!point)return null;
 const result=(title:string,text:string)=>({title,text});
 if(point.id==='resident'){s.kingdom.heardYear=true;return result('托魯斯的鎮民','今年是加爾迪亞曆六百年。你連這個也不知道？\n前些天失蹤的王后已經回城，大家總算能鬆口氣。');}
 if(point.id==='inn'){s.players.forEach((p,i)=>{if(activeSlot(s,i as Slot)){p.hp=MAX_HP;p.mp=MAX_MP;}});return result('托魯斯旅店','爐火暖了起來。你稍作休息，恢復了體力。\n若要去王城，從東南小路進森林，再向北走。');}
 if(slot!==0)return result('同行','這段對話與換圖由 P1 帶領。');
 const moveTo=(map:KingdomMap|'canyon',x:number,z:number)=>{
  if(s.joined&&activeSlot(s,1)&&distance(s.players[0],s.players[1])>3.5)return result('等待同行者','先靠近彼此，再一起前往下一個地方。');
  return changeKingdomMap(s,map,x,z);
 };
 if(s.chapter==='truce'){
  if(point.id==='forest')return moveTo('forest',0,-6.5);
  if(point.id==='canyon')return moveTo('canyon',0,-6);
 }
 if(s.chapter==='forest'){
  if(point.id==='town')return moveTo('truce',7,-5);
  if(point.id==='castle')return s.kingdom.forestWon?moveTo('castle',0,-6.5):result('林間小路','先通過前方的魔物。');
  if(point.id==='cathedral')return result('西方的修道院',s.kingdom.phase==='rescue'?'露卡望向林外：先從西邊的修道院找起。\n\n本版先到這裡。修道院內部、青蛙與王后救援尚未接上。':'林外可以看見修道院的屋頂。先去王城找瑪兒的消息。');
 }
 if(s.chapter==='castle'){
  if(point.id==='exit')return moveTo('forest',0,8);
  if(point.id==='guard'){
   if(s.kingdom.phase==='arrival'){s.kingdom.phase='audience';return result('王城衛兵','站住！……王后說認識你？\n那就進去吧。她正在東側樓上的房間等候。');}
   return result('王城衛兵','王后回來後，搜索隊已經撤回。要見她，走東側樓梯。');
  }
  if(point.id==='king')return result('加爾迪亞國王','王后平安回來，比什麼都重要。\n年輕人，若你知道她遭遇了什麼，請務必告訴我。');
  if(point.id==='stairs')return s.kingdom.phase==='arrival'?result('王城衛兵','先在大廳向衛兵說明來意。'):moveTo('chamber',0,-6);
  if(point.id==='lucca'&&s.kingdom.phase==='missing'){
   s.kingdom.phase='rescue';Object.assign(s.players[1],{x:s.players[0].x+1.3,z:s.players[0].z,hp:MAX_HP,mp:MAX_MP,atb:0,walking:false,facing:0});
   // Placement is explicit and validated, not an invisible replacement for the missing Marle.
   if(!walkable(s.players[1].x,s.players[1].z,s.chapter))Object.assign(s.players[1],{x:1,z:-4});
   return result('露卡加入隊伍','克羅諾！我終於追上你了。\n瑪兒是這個王國的公主。人們把她當成祖先莉妮王后，停止了搜救。真正的王后若遇害，瑪兒也就不會存在。\n我們得去找到真正的王后！');
  }
 }
 if(s.chapter==='chamber'){
  if(point.id==='stairs')return moveTo('castle',8,5);
  if(point.id==='queen'&&s.kingdom.phase==='audience'){
   s.kingdom.phase='erasing';s.kingdom.elapsed=0;s.players.forEach(p=>p.walking=false);
   return result('瑪兒','克羅諾！你真的來找我了。\n大家把我當成這裡的王后，我還沒來得及解釋。\n……等等，身體好冷。你還看得見我嗎？');
  }
 }
 return null;
}
