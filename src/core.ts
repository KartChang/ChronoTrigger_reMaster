import {newEquipment,equipmentBonuses,tradeEquipment,wearEquipment,restoreEquipment} from './equipment';
import type {EquipmentState,Member} from './equipment';
import {CONDUCT_POINTS} from './fair-conduct-data';
import {validateHearing} from './trial-hearing';
import {tickConduct,shopping,interactConduct,chooseConduct,sealConduct} from './fair-conduct';
import {newTrial,trialMap} from './trial-data';
import type {Trial} from './trial-data';
import {trialWalkable} from './trial-data';
import {trialActive,trialP2,trialGuest,trialMoveAllowed,startTrial,tickTrial,trialTriggers,trialDamage,tickTrialEnemies,finishTrialBattle,leaveTrialBattle,saveTrial,restoreTrial,trialPositionValid,trialEvidence} from './trial-rules';
export {interactTrial,chooseTrial,useInventory} from './trial-rules';
import {newPrologue,prologueMap,prologueWalkable,prologueSave,restorePrologue,MARLE_MEETING,DROPPED_PENDANT,WORLD_HOME,WORLD_FAIR} from './prologue-data';
import type {Prologue,PrologueMap} from './prologue-data';
import {newRescue,rescueMap,rescueWalkable,nearestRescue,RESCUE_NAMES,guestIdentity,GUEST_HP,GUEST_MP} from './rescue-data';
import type {Rescue,RescueMap,RescueStage} from './rescue-data';
import {newFollowPlan,followVector} from './navigation';
import type {FollowPlan} from './navigation';
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
export type Enemy = Vec & { hp: number; atb: number; kind?:'naga'|'hench'|'yakra'|'prisonGuard'|'tankHead'|'tankBody'|'tankWheel'; maxHp?:number };
export type EnemyAction = { index:number; tick:number; origin:Vec; target:Vec };
export type Effect = { enemyAction?:EnemyAction; x: number; z: number; text: string; kind: 'hit' | 'heal' | 'combo'; actor?:Slot; guest?:boolean; origin?:Vec; style?:'slash'|'shot'|'fire'|'spin' };
export type Flags = { repaired: boolean; won: boolean; visitedFuture: boolean };
export type State = {
  equipment:EquipmentState|null;
  trial:Trial; prologue:Prologue; followPlan: FollowPlan; mode: Mode; era: Era; joined: boolean; players: [Actor, Actor]; enemies: Enemy[];
  targets: [number|null,number|null]; flags: Flags; combo: [boolean, boolean]; log: string[]; effects: Effect[];
  ticks: number; enemyTurn: number; chapter: Chapter; fair: FairFlags; opening: Opening; kingdom:Kingdom; rescue:Rescue;
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
  const prologue=newPrologue(chapter==='bedroom');
  const initial=[actor(-1),actor(1)] as [Actor,Actor];
  if(chapter==='bedroom')initial.forEach(p=>Object.assign(p,{x:1.5,z:1.4,facing:0}));
  return { equipment:null,trial:newTrial(),prologue,followPlan:newFollowPlan(), mode: 'explore', era: 'present', joined: false, players: initial,
    enemies: [], flags: { repaired: false, won: false, visitedFuture: false },
    targets: [null,null], combo: [false, false], log: [chapter==='bedroom'?'母親：克羅諾，起床了！':chapter==='fair'?'千年祭：同行之後、傳送實驗之前。':'沿石路向北，探索測試村落。'], effects: [], ticks: 0, enemyTurn: 0, chapter, fair: newFairFlags(), opening:newOpening(), kingdom:newKingdom(), rescue:newRescue() };
}
export const activeSlot=(s:State,slot:Slot):boolean=>slot===0||(trialActive(s)?trialP2(s):((s.prologue.stage==='legacy'||s.prologue.stage==='companions')&&(s.kingdom.phase==='rescue'||(s.kingdom.phase==='none'&&marlePresent(s.opening.phase)))));
export const cutsceneActive=(s:State):boolean=>s.trial.fade>0||cinematic(s.opening.phase)||s.kingdom.phase==='erasing'||s.prologue.stage==='waking'||(s.prologue.stage==='collision'&&s.prologue.elapsed<.6)||!!s.prologue.transition;
export const distance = (a: Vec, b: Vec): number => Math.hypot(a.x - b.x, a.z - b.z);
export function walkable(x: number, z: number, chapter: Chapter = 'lab'): boolean {
  if(prologueMap(chapter))return prologueWalkable(x,z,chapter);
  if(trialMap(chapter))return trialWalkable(x,z,chapter);
  if(rescueMap(chapter))return rescueWalkable(x,z,chapter);
  if(kingdomMap(chapter))return kingdomWalkable(x,z,chapter);
  if(chapter==='fair')return fairWalkable(x,z);
  if(chapter==='canyon')return canyonWalkable(x,z);
  if (!Number.isFinite(x) || !Number.isFinite(z) || x < -12.6 || x > 12.6 || z < -8.6 || z > 10.6) return false;
  if (x > 8.8 && x < 11.8 && Math.abs(z + 1) > 1.05) return false;
  return !OBSTACLES.some(o => Math.abs(x-o.x) < o.w/2+0.25 && Math.abs(z-o.z) < o.d/2+0.25);
}
function log(s: State, text: string): void { s.log.push(text); if (s.log.length > 5) s.log.shift(); }
function move(s: State, slot: Slot, vector: Vec, dt: number): void {
  if(slot===1&&shopping(s))return;
  const p = s.players[slot], peer = s.players[slot === 0 ? 1 : 0];
  const len = Math.hypot(vector.x, vector.z);
  p.walking = false;
  if (len < 0.05) return;
  const nx = vector.x / Math.max(1, len), nz = vector.z / Math.max(1, len);
  const allowed = (x: number, z: number) => walkable(x, z, s.chapter) && trialMoveAllowed(s,x,z) && (!s.joined || !activeSlot(s,1) || distance({x,z},peer) <= MAX_SEPARATION);
  const x = p.x + nx * (s.chapter==='overworld1000'?2.4:SPEED) * dt;
  if (allowed(x,p.z)) { p.walking ||= Math.abs(x-p.x)>0.0001; p.x=x; }
  const z = p.z + nz * (s.chapter==='overworld1000'?2.4:SPEED) * dt;
  if (allowed(p.x,z)) { p.walking ||= Math.abs(z-p.z)>0.0001; p.z=z; }
  p.facing = Math.abs(nx)>Math.abs(nz) ? (nx>0?1:3) : (nz>0?2:0);
}
export function setCoop(s: State, joined: boolean): boolean {
  if (s.mode !== 'explore'||cutsceneActive(s)) return false;
  s.joined=joined;s.followPlan=newFollowPlan();
  s.combo=[false,false];
  log(s,!activeSlot(s,1)?'瑪兒暫時離隊；雙人設定保留，但此段由克羅諾行動。':joined?'P2 已加入：各自控制角色，共享鏡頭。':'P2 已退出：夥伴恢復跟隨與自動攻擊。');
  return true;
}
export function beginBattle(s: State): boolean {
  if (s.mode !== 'explore'||cutsceneActive(s)||prologueMap(s.chapter)||(s.chapter==='fair'&&!['legacy','fair','companions'].includes(s.prologue.stage))) return false;
  if(trialActive(s))return false;
  if(rescueMap(s.chapter))return beginRescueBattle(s);
  if(kingdomMap(s.chapter)&&(s.chapter!=='forest'||s.kingdom.forestWon))return false;
  if(s.chapter==='fair'&&s.opening.phase!=='none')return false;
  if(s.chapter==='canyon'&&(s.opening.phase!=='canyon'||s.opening.canyonWon))return false;
  s.followPlan=newFollowPlan();s.mode='battle'; s.targets=[null,null]; s.combo=[false,false]; s.enemyTurn=0;
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
  if(trialActive(s)){finishTrialBattle(s);return;}
  if(rescueMap(s.chapter)){finishRescueBattle(s);return;}
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
  const damage=trialDamage(s,target,kind==='skill'?48:30+equipmentBonuses(s.equipment,partyMember(s,slot)).attack,kind==='skill'&&slot===1&&s.kingdom.phase==='rescue');target.hp=Math.max(0,target.hp-damage);
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
  s.enemies.filter(e=>e.hp>0).forEach(e=>{const damage=trialDamage(s,e,72,s.kingdom.phase==='rescue');e.hp=Math.max(0,e.hp-damage);s.effects.push({x:e.x,z:e.z,text:String(damage),kind:'combo',style:'spin'});});
  log(s,'雙人合技「共鳴斬」！雙方消耗 ATB 與 4 MP。');finish(s);
}
export function step(s: State, input: Input, delta: number): void {
  if (!Number.isFinite(delta) || delta<=0) return;
  const dt=Math.min(delta,0.05);s.ticks++;
  if(tickTrial(s,dt))return;
  if(stepPrologue(s,dt))return;
  if(s.kingdom.phase==='erasing'){s.kingdom.elapsed+=dt;if(s.kingdom.elapsed>=2.2){s.kingdom.phase='missing';s.kingdom.elapsed=0;log(s,'瑪兒的身影消失了。先回大廳看看。');}return;}
  if(cutsceneActive(s)){stepOpening(s,dt);return;}
  if (s.mode==='explore') {
    move(s,0,input[0],dt);
    if (s.joined && activeSlot(s,1)) move(s,1,input[1],dt);
    else if(activeSlot(s,1)) {
      const a=s.players[0],b=s.players[1];
      move(s,1,followVector(s.followPlan,b,a,s.chapter,s.ticks,(x,z)=>walkable(x,z,s.chapter)),dt);
    }
    stepGuest(s,dt);tickConduct(s,dt);
    if(trialActive(s)){trialTriggers(s);return;}
    prologueTriggers(s);
    if(s.chapter==='passage'&&!s.rescue.guardsWon&&s.players[0].z>.2)beginRescueBattle(s);
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
  stepGuest(s,dt);
  if(s.mode!=='battle')return;
  if(trialActive(s))tickTrialEnemies(s,dt);
  else for(const e of s.enemies) {
    if(e.hp<=0)continue;
    e.atb+=dt*(e.kind==='yakra'?.22:.14);
    if(e.atb>=1) {
      e.atb=0;const alive=livingAllies(s);if(!alive.length)break;
      const pulse=e.kind==='yakra'&&++s.rescue.enemyActions%3===0;
      const targets=pulse?alive:[alive[s.enemyTurn++%alive.length]!];
      for(const target of targets)damageAlly(s,target,e.kind==='yakra'?(pulse?12:18):12,e);
      if(pulse)log(s,'亞克拉甩出尖刺，掃向整支隊伍！');
    }
  }
  if(livingAllies(s).length===0){s.mode='defeat';s.combo=[false,false];log(s,s.chapter==='canyon'?'克羅諾倒下了。可回山道入口重新整裝。':'試煉失敗。可回村補給，再次挑戰。');}
}
export function leaveBattle(s: State): void {
  if(trialActive(s)){leaveTrialBattle(s);return;}
  if(rescueMap(s.chapter)){leaveRescueBattle(s);return;}
  if((s.chapter==='canyon'||kingdomMap(s.chapter))&&s.mode!=='victory'&&s.mode!=='defeat')return;
  s.followPlan=newFollowPlan();s.mode='explore';s.enemies=[];s.targets=[null,null];s.combo=[false,false];
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
export type SaveData = {version:1|2|3|4|5;rescue?:RescueSave;kingdom?:Omit<Kingdom,'elapsed'>;opening?:{phase:Opening['phase'];canyonWon:boolean};chapter?:Chapter;fair?:FairFlags;era:Era;joined:boolean;flags:Flags;players:{x:number;z:number;hp:number;mp:number}[]};
function serializeLegacy(s: State): string {
  if(s.mode!=='explore'||cutsceneActive(s))throw new Error('請先結束戰鬥或演出再存檔。');
  if(s.rescue.stage!=='none')return JSON.stringify({...rescueSaveBase(s),version:5,rescue:saveRescue(s)} satisfies SaveData);
  if(s.kingdom.phase!=='none')return JSON.stringify({version:4,chapter:s.chapter,era:s.era,joined:s.joined,flags:{...s.flags},fair:{...s.fair},opening:{phase:s.opening.phase,canyonWon:s.opening.canyonWon},kingdom:{phase:s.kingdom.phase,heardYear:s.kingdom.heardYear,forestWon:s.kingdom.forestWon},players:s.players.map(({x,z,hp,mp})=>({x,z,hp,mp}))} satisfies SaveData);
  if(s.opening.phase!=='none')return JSON.stringify({version:3,chapter:s.chapter,era:s.era,joined:s.joined,flags:{...s.flags},fair:{...s.fair},opening:{phase:s.opening.phase,canyonWon:s.opening.canyonWon},players:s.players.map(({x,z,hp,mp})=>({x,z,hp,mp}))} satisfies SaveData);
  return JSON.stringify({version:s.chapter==='fair'?2:1,...(s.chapter==='fair'?{chapter:s.chapter,fair:{...s.fair}}:{}),era:s.era,joined:s.joined,flags:{...s.flags},players:s.players.map(({x,z,hp,mp})=>({x,z,hp,mp}))} satisfies SaveData);
}
export function deserialize(raw: string): State {
  if(raw.length>65536)throw new Error('存檔太大。');
  const v:unknown=JSON.parse(raw);
  if(!v||typeof v!=='object')throw new Error('存檔格式錯誤。');
  const o=v as Record<string,unknown>;
  if(o.version===8){
   if(o.schema!=='equipment-v1'||typeof o.adventure!=='string'||o.adventure.length>49152)throw new Error('裝備存檔格式錯誤。');
   const a:unknown=JSON.parse(o.adventure);if(!a||typeof a!=='object'||Array.isArray(a)||!Number.isInteger((a as {version:number}).version)||(a as {version:number}).version<1||(a as {version:number}).version>7)throw new Error('禁止巢狀裝備存檔。');
   const gear=restoreEquipment(o.equipment),s=deserialize(o.adventure);s.equipment=gear;return s;
  }
  if(o.version===7)return restoreV7(o);
  if(o.version===6)return restoreV6(o);
  if((o.version!==1&&o.version!==2&&o.version!==3&&o.version!==4&&o.version!==5)||(typeof o.era!=='string'||!['present','future','middle'].includes(o.era))||typeof o.joined!=='boolean')throw new Error('不支援的存檔版本或格式。');
  if(!Array.isArray(o.players)||o.players.length!==2||!o.flags||typeof o.flags!=='object')throw new Error('存檔資料不完整。');
  const f=o.flags as Record<string,unknown>;
  if(['won','repaired','visitedFuture'].some(k=>typeof f[k]!=='boolean'))throw new Error('事件旗標錯誤。');
  if(o.version===1&&o.era==='middle')throw new Error('舊存檔不支援此時代。');
  if(o.version===5&&(typeof o.chapter!=='string'||(!rescueMap(o.chapter)&&!kingdomMap(o.chapter)&&o.chapter!=='canyon'&&o.chapter!=='fair')))throw new Error('救援存檔地圖錯誤。');
  if(o.version===4&&(typeof o.chapter!=='string'||(!kingdomMap(o.chapter)&&o.chapter!=='canyon')))throw new Error('王國存檔地圖錯誤。');
  const s=createState(o.version===4||o.version===5?o.chapter as Chapter:o.version===3&&o.chapter==='canyon'?'canyon':o.version!==1?'fair':'lab');s.era=o.era as Era;s.joined=o.joined;
  if(o.version===2||o.version===3||o.version===4||o.version===5){
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
  if(o.version===4||o.version===5){
    const op=o.opening as Record<string,unknown>|undefined,k=o.kingdom as Record<string,unknown>|undefined;
    if((o.era!=='middle'&&!(o.version===5&&o.chapter==='fair'&&o.era==='present'))||!op||typeof op!=='object'||Array.isArray(op)||op.phase!=='vista'||op.canyonWon!==true||!s.fair.telepodTested)throw new Error('王國事件缺少開場進度。');
    if(!k||typeof k!=='object'||Array.isArray(k)||typeof k.phase!=='string'||!['arrival','audience','missing','rescue'].includes(k.phase)||typeof k.heardYear!=='boolean'||typeof k.forestWon!=='boolean')throw new Error('王國進度錯誤。');
    if((s.chapter==='chamber'&&k.phase==='arrival')||(['audience','missing','rescue'].includes(k.phase)&&!k.forestWon)||(['castle','chamber'].includes(s.chapter)&&!k.forestWon))throw new Error('王城前置條件不一致。');
    s.opening={phase:'vista',elapsed:0,canyonWon:true};s.kingdom={phase:k.phase as Kingdom['phase'],heardYear:k.heardYear,forestWon:k.forestWon,elapsed:0};
  }
  if(o.version===5)restoreRescue(s,o.rescue);
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
  const conduct=interactConduct(s,slot);if(conduct)return conduct;
  if(!['legacy','companions'].includes(s.prologue.stage))return interactPrologue(s,slot);
  if(s.prologue.stage==='companions'&&s.opening.phase==='none'&&s.kingdom.phase==='none'&&distance(s.players[slot],{x:0,z:-7.7})<1.5){startPrologueTravel(s,'overworld1000',WORLD_FAIR.x,WORLD_FAIR.z-1.6);return null;}
  if(s.rescue.stage==='returned'){if(slot===0&&partyTogether(s)){const result=startTrial(s,serializeAdventure(s));if(result)return result;}return {title:'千年祭 · 回到 1000 年',text:'瑪兒希望你送她回王城。沿廣場南方走，靠近出口按 E。'};}
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
    case 'save':return {title:'試玩存檔點',text:'可用右側「存檔」保存本章，或匯出備份。\n存檔依實際進度保存；舊版本仍可讀取。'};
  }
}

/** Begin only at the actual stage, after the normal demonstration. The scripted sequence temporarily owns movement; it does not imply a P2 vote. */
export function beginOpening(s:State,slot:Slot):boolean{
  if(s.chapter!=='fair'||!['legacy','companions'].includes(s.prologue.stage)||s.mode!=='explore'||s.opening.phase!=='none'||!s.fair.luccaMet||!s.fair.telepodTested||slot!==0)return false;
  if(distance(s.players[0],{x:0,z:7.2})>2.05||distance(s.players[1],{x:-2.4,z:9})>6)return false;
  sealConduct(s);s.opening.phase='approach';s.opening.elapsed=0;s.combo=[false,false];
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
  if(s.chapter==='canyon'&&s.rescue.stage==='reunited'&&slot===0&&s.mode==='explore'&&s.players[0].z>7.4){
   if(!partyTogether(s))return {title:'等待同行者',text:'靠近時門，一起回去。'};
   s.rescue.stage='returned';s.chapter='fair';s.era='present';s.players.forEach((p,i)=>Object.assign(p,{x:i*1.3,z:6.2,walking:false,atb:0}));s.followPlan=newFollowPlan();placeGuest(s);
   return {title:'回到 1000 年',text:'露卡啟動時門鑰匙。熟悉的鐘聲再次傳來。\n三人回到千年祭廣場。沿南方出口回到大地圖，護送瑪兒回王城。'};
  }
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
 placeGuest(s);
 return {title:chapter==='truce'?'托魯斯':chapter==='forest'?'加爾迪亞森林':chapter==='castle'?'加爾迪亞王城':chapter==='chamber'?'王后房間':'托魯斯山道',text:chapter==='truce'?'屋舍散落在小路旁。旅店亮著燈，路邊有人正在交談。':chapter==='forest'?'樹葉掩住天空。北方的小路通往王城。':chapter==='castle'?'靴底踏上石板。衛兵正在大廳前值守。':chapter==='chamber'?'房間裡，有個熟悉的身影……':'回到了山道。南方仍通往托魯斯。'};
}
export function interactKingdom(s:State,slot:Slot):{title:string;text:string}|null{
 if(!kingdomMap(s.chapter)||s.mode!=='explore'||cutsceneActive(s)||!activeSlot(s,slot)||(slot===1&&!s.joined))return null;
 const reunion=s.chapter==='chamber'&&s.rescue.stage==='homecoming'&&distance(s.players[slot],{x:0,z:2})<1.8;
 const point=reunion?{id:'reunion'}:nearestKingdom(s.players[slot].x,s.players[slot].z,s.chapter,s.kingdom.phase);
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
  if(point.id==='cathedral'){
   if(s.kingdom.phase!=='rescue')return result('西方的修道院','林外可見修道院的屋頂。先去王城找瑪兒的消息。');
   if(!partyTogether(s))return result('等待同行者','兩人一起靠近修道院入口。');
   if(s.rescue.stage==='none')s.rescue.stage='entered';
   return {...enterRescueMap(s,'cathedral',0,-6.8),title:'西方的修道院'};
  }
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
  if(s.rescue.stage==='homecoming'&&distance(s.players[0],{x:0,z:2})<1.8){
   s.rescue.stage='reunited';Object.assign(s.rescue.guest,{hp:GUEST_HP,mp:GUEST_MP,atb:0});placeGuest(s);
   return result('瑪兒回來了','克羅諾、露卡！剛才四周一片漆黑……\n你們找到了莉妮王后？謝謝你們沒有放棄我。\n三人重聚。露卡拿出了開啟時門的裝置；沿山道北方回到千年祭吧。');
  }
  if(point.id==='stairs')return moveTo('castle',8,5);
  if(point.id==='queen'&&s.kingdom.phase==='audience'){
   s.kingdom.phase='erasing';s.kingdom.elapsed=0;s.players.forEach(p=>p.walking=false);
   return result('瑪兒','克羅諾！你真的來找我了。\n大家把我當成這裡的王后，我還沒來得及解釋。\n……等等，身體好冷。你還看得見我嗎？');
  }
 }
 return null;
}

export const guestKind=(s:State):'frog'|'marle'|null=>trialActive(s)?(trialGuest(s)?'marle':null):guestIdentity(s.rescue);
export const partyTogether=(s:State):boolean=>!s.joined||!activeSlot(s,1)||distance(s.players[0],s.players[1])<=3.5;
function livingAllies(s:State):Actor[]{
 const allies=s.players.filter((p,i)=>activeSlot(s,i as Slot)&&p.hp>0);
 if(guestKind(s)&&s.rescue.guest.hp>0)allies.push(s.rescue.guest);
 return allies;
}
function damageAlly(s:State,p:Actor,amount:number,attacker:Enemy):void{
 amount=Math.max(1,amount-equipmentBonuses(s.equipment,p===s.rescue.guest?(guestKind(s)??'frog'):partyMember(s,s.players.indexOf(p) as Slot)).defense);
 p.hp=Math.max(0,p.hp-amount);s.effects.push({x:p.x,z:p.z,text:`−${amount}`,kind:'hit',
  // Presentation metadata on the real delivered attack, never inferred from its target.
  ...((s.chapter==='canyon'||s.chapter==='forest'||rescueMap(s.chapter))?{enemyAction:{index:s.enemies.indexOf(attacker),tick:s.ticks,origin:{x:attacker.x,z:attacker.z},target:{x:p.x,z:p.z}}}:{})});
 if(p.hp===0){p.atb=0;const i=s.players.indexOf(p);if(i>=0)s.combo[i as Slot]=false;}
}
function placeGuest(s:State):void{
 s.rescue.guestPlan=newFollowPlan();
 const a=s.players[0],g=s.rescue.guest;
 for(const [dx,dz] of [[-.9,-.7],[.9,-.7],[-.9,0],[0,0]]){
  if(walkable(a.x+dx!,a.z+dz!,s.chapter)){Object.assign(g,{x:a.x+dx!,z:a.z+dz!,atb:0,walking:false,facing:2});break;}
 }
}
function stepGuest(s:State,dt:number):void{
 if(!guestKind(s)||cutsceneActive(s))return;
 const g=s.rescue.guest;
 if(g.hp<=0){g.walking=false;return;}
 if(s.mode==='explore'){
  const v=followVector(s.rescue.guestPlan,g,s.players[0],s.chapter,s.ticks,(x,z)=>walkable(x,z,s.chapter));
  g.walking=false;
  for(const axis of ['x','z'] as const){const value=g[axis]+v[axis]*SPEED*dt;const x=axis==='x'?value:g.x,z=axis==='z'?value:g.z;if(walkable(x,z,s.chapter)){g.walking ||=Math.abs(value-g[axis])>.0001;g[axis]=value;}}
  if(Math.hypot(v.x,v.z)>.05)g.facing=Math.abs(v.x)>Math.abs(v.z)?(v.x>0?1:3):(v.z>0?2:0);
  return;
 }
 if(s.mode!=='battle')return;
 g.atb=Math.min(1,g.atb+dt*.38);if(g.atb<1)return;
 const allies=livingAllies(s),wounded=allies.filter(p=>p.hp<(p===g?GUEST_HP:MAX_HP)*.55).sort((a,b)=>a.hp/(a===g?GUEST_HP:MAX_HP)-b.hp/(b===g?GUEST_HP:MAX_HP))[0];
 const name=guestKind(s)==='frog'?'青蛙':'瑪兒';
 if(wounded&&g.mp>=3){
  const heal=Math.min(36,(wounded===g?GUEST_HP:MAX_HP)-wounded.hp);g.mp-=3;g.atb=0;wounded.hp+=heal;
  s.effects.push({x:wounded.x,z:wounded.z,text:`+${heal}`,kind:'heal',guest:true,origin:{x:g.x,z:g.z}});log(s,`${name}為受傷的同伴回復體力。`);return;
 }
 const target=s.enemies.filter(e=>e.hp>0).sort((a,b)=>distance(a,g)-distance(b,g))[0];if(!target)return;
 const amount=26+equipmentBonuses(s.equipment,guestKind(s)??'frog').attack;g.atb=0;target.hp=Math.max(0,target.hp-amount);s.effects.push({x:target.x,z:target.z,text:String(amount),kind:'hit',guest:true,origin:{x:g.x,z:g.z},style:guestKind(s)==='frog'?'slash':'shot'});log(s,`${name}攻擊：${amount} 傷害。`);finish(s);
}
export function useTonic(s:State,slot:Slot):boolean{
 if(!eligible(s,slot,0)||s.rescue.tonics<=0||s.players[slot].hp>=MAX_HP)return false;
 const p=s.players[slot],heal=Math.min(50,MAX_HP-p.hp);s.rescue.tonics--;p.atb=0;p.hp+=heal;s.combo[slot]=false;
 s.effects.push({x:p.x,z:p.z,text:`+${heal}`,kind:'heal'});log(s,`P${slot+1} 使用回復藥，恢復 ${heal} HP。`);return true;
}
function beginRescueBattle(s:State):boolean{
 const r=s.rescue;
 if(!rescueMap(s.chapter)||s.mode!=='explore'||cutsceneActive(s))return false;
 const kind=s.chapter==='cathedral'&&r.stage==='entered'?'naga':s.chapter==='passage'&&r.stage==='allied'&&r.organOpen&&!r.guardsWon?'guards':s.chapter==='sanctum'&&r.stage==='allied'&&r.guardsWon&&!r.yakraWon?'yakra':null;
 if(!kind)return false;
 r.encounter=kind;r.enemyActions=0;r.guestPlan=newFollowPlan();s.followPlan=newFollowPlan();s.mode='battle';s.targets=[null,null];s.combo=[false,false];s.enemyTurn=0;
 s.players.forEach((p,i)=>Object.assign(p,{x:-1.5+i*3,z:-1,atb:0,walking:false,facing:2}));
 Object.assign(r.guest,{x:0,z:-2.6,atb:0,walking:false,facing:2});
 s.enemies=kind==='yakra'?[{x:0,z:3.2,hp:720,maxHp:720,atb:0,kind:'yakra'}]:[-1.5,0,1.5].map((x,i)=>({x,z:1.6+(i%2)*1.2,hp:kind==='naga'?60:64,maxHp:kind==='naga'?60:64,atb:0,kind:kind==='naga'?'naga' as const:'hench' as const}));
 log(s,kind==='yakra'?'大臣露出了真面目——亞克拉！':kind==='naga'?'修女的外表褪去，魔物包圍了你們。':'密道裡的魔物攔住去路。');return true;
}
function finishRescueBattle(s:State):void{
 if(s.mode!=='battle'||s.enemies.length===0||s.enemies.some(e=>e.hp>0))return;
 if(s.rescue.encounter==='naga')s.rescue.stage='cleared';
 if(s.rescue.encounter==='guards')s.rescue.guardsWon=true;
 if(s.rescue.encounter==='yakra')s.rescue.yakraWon=true;
 s.mode='victory';s.combo=[false,false];log(s,s.rescue.encounter==='yakra'?'亞克拉倒下了。王后就在前方！':'戰鬥結束。繼續調查修道院。');
}
function leaveRescueBattle(s:State):void{
 if(s.mode!=='victory'&&s.mode!=='defeat')return;
 const win=s.mode==='victory';s.mode='explore';s.enemies=[];s.targets=[null,null];s.combo=[false,false];s.followPlan=newFollowPlan();
 s.players.forEach((p,i)=>Object.assign(p,{x:-.65+i*1.3,z:win?2.7:-6.5,hp:MAX_HP,mp:MAX_MP,atb:0,walking:false,facing:2}));
 Object.assign(s.rescue.guest,{hp:GUEST_HP,mp:GUEST_MP});s.rescue.encounter='none';placeGuest(s);
}
function enterRescueMap(s:State,map:RescueMap,x:number,z:number):{title:string;text:string}{
 s.chapter=map;s.era='middle';s.followPlan=newFollowPlan();s.enemies=[];s.targets=[null,null];s.combo=[false,false];s.effects=[];
 s.players.forEach((p,i)=>Object.assign(p,{x:x+i*1.3,z,walking:false,atb:0,facing:2}));placeGuest(s);
 return {title:RESCUE_NAMES[map],text:map==='cathedral'?'昏暗的石柱間，燭火靜靜燃燒。地上似乎有一件不屬於這裡的東西。':map==='passage'?'管風琴打開了隱藏的道路。深處傳來窸窣的聲響。':s.rescue.yakraWon?'房間已經安靜下來。':'王后被困在房間深處。那位大臣的笑容，有些不對勁。'};
}
export function interactRescue(s:State,slot:Slot):{title:string;text:string}|null{
 if(!rescueMap(s.chapter)||s.mode!=='explore'||cutsceneActive(s)||!activeSlot(s,slot)||(slot===1&&!s.joined))return null;
 const r=s.rescue,point=nearestRescue(s.players[slot].x,s.players[slot].z,s.chapter,r);if(!point)return null;
 const result=(title:string,text:string)=>({title,text});
 if(slot!==0)return result('同行','調查與換圖由 P1 帶領；戰鬥時可獨立下指令。');
 const together=()=>result('等待同行者','兩人先靠近彼此，再一起前進。');
 if(s.chapter==='cathedral'){
  if(point.id==='exit')return partyTogether(s)?changeKingdomMap(s,'forest',-8,.5):together();
  if(point.id==='crest'&&r.stage==='entered'){beginRescueBattle(s);return result('王家的紋章','露卡撿起地上的飾物。這是王家的紋章！\n周圍的修女突然露出獠牙，朝你們撲來。');}
  if(point.id==='frog'&&r.stage==='cleared'){
   r.stage='allied';Object.assign(r.guest,{hp:GUEST_HP,mp:GUEST_MP});placeGuest(s);
   return result('青蛙加入隊伍','披著斗篷的青蛙收起長劍。\n他也在追查莉妮王后的下落，決定與你們同行。\n青蛙是第三名實際參戰的同伴，自動攻擊或照顧傷者；P1／P2 仍控制克羅諾與露卡。');
  }
  if(point.id==='organ'){
   if(r.stage==='entered'||r.stage==='cleared')return result('管風琴','先處理禮拜堂中的異狀，再和那位劍士談談。');
   const wasOpen=r.organOpen;r.organOpen=true;return result('管風琴',wasOpen?'機關已經啟動。祭壇右後方的暗門仍然敞開。':'最後一個音落下，石牆緩緩移開。\n祭壇右後方露出一條通往深處的密道。');
  }
  if(point.id==='door')return !r.organOpen?result('石牆','牆面上沒有把手。附近也許有隱藏的機關。'):partyTogether(s)?enterRescueMap(s,'passage',0,-6.8):together();
 }
 if(s.chapter==='passage'){
  if(point.id==='exit')return partyTogether(s)?enterRescueMap(s,'cathedral',4,7.4):together();
  if(point.id==='chest'){
   if(r.chestOpened)return result('木箱','箱子已空。回復藥不會重複出現。');
   r.chestOpened=true;r.tonics=3;return result('找到回復藥','取得 3 份回復藥。\n戰鬥中等 ATB 充滿，可用面板上的「回復藥」恢復自己的 HP。');
  }
  if(point.id==='door')return !r.guardsWon?result('密道守衛','先通過前方的魔物。'):partyTogether(s)?enterRescueMap(s,'sanctum',0,-6.8):together();
 }
 if(s.chapter==='sanctum'){
  if(point.id==='chancellor'&&!r.yakraWon){beginRescueBattle(s);return result('大臣的真面目','那不是加爾迪亞的大臣！\n偽裝崩解，巨大的亞克拉擋在王后前方。小心牠蓄力後的尖刺。');}
  if(point.id==='queen'){
   if(!r.yakraWon)return result('莉妮王后','王后就在前面，但亞克拉阻住了去路。');
   if(r.stage==='allied')r.stage='rescued';
   return result('莉妮王后獲救','莉妮王后終於安全了。\n東側木箱裡似乎還有動靜；準備好後，從房間南方離開，護送王后回城。');
  }
  if(point.id==='prisoner'){
   if(!r.yakraWon)return result('上鎖的木箱','戰鬥還沒結束，無法安全接近。');
   const already=r.chancellorFreed;r.chancellorFreed=true;return result('真正的大臣',already?'大臣已經獲救，正準備返回王城。':'箱子打開，真正的大臣跌了出來。\n他感激地向你们道謝。原來亞克拉一直冒用他的身分。');
  }
  if(point.id==='exit'){
   if(!partyTogether(s))return together();
   if(r.stage==='rescued'){
    r.stage='homecoming';changeKingdomMap(s,'castle',0,-5.8);
    return {title:'護送王后返回王城',text:'莉妮王后平安歸來。青蛙向國王致意，暫時離開隊伍。\n克羅諾與露卡抬頭望向東側樓梯：瑪兒應該也回來了。'};
   }
   return enterRescueMap(s,'passage',0,7.5);
  }
 }
 return null;
}

export type RescueSave={stage:RescueStage;organOpen:boolean;guardsWon:boolean;yakraWon:boolean;chancellorFreed:boolean;chestOpened:boolean;tonics:number;guest:{x:number;z:number;hp:number;mp:number}};
function saveRescue(s:State):RescueSave{
 const r=s.rescue,{x,z,hp,mp}=r.guest;return {stage:r.stage,organOpen:r.organOpen,guardsWon:r.guardsWon,yakraWon:r.yakraWon,chancellorFreed:r.chancellorFreed,chestOpened:r.chestOpened,tonics:r.tonics,guest:{x,z,hp,mp}};
}
function rescueSaveBase(s:State):SaveData{
 return {version:5,chapter:s.chapter,era:s.era,joined:s.joined,flags:{...s.flags},fair:{...s.fair},opening:{phase:s.opening.phase,canyonWon:s.opening.canyonWon},kingdom:{phase:s.kingdom.phase,heardYear:s.kingdom.heardYear,forestWon:s.kingdom.forestWon},players:s.players.map(({x,z,hp,mp})=>({x,z,hp,mp}))};
}
function restoreRescue(s:State,raw:unknown):void{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('救援進度格式錯誤。');
 const o=raw as Record<string,unknown>,r=newRescue();
 if(typeof o.stage!=='string'||!['entered','cleared','allied','rescued','homecoming','reunited','returned'].includes(o.stage))throw new Error('不支援的救援階段。');
 r.stage=o.stage as RescueStage;
 for(const key of ['organOpen','guardsWon','yakraWon','chancellorFreed','chestOpened'] as const){if(typeof o[key]!=='boolean')throw new Error('救援旗標錯誤。');r[key]=o[key] as boolean;}
 if(typeof o.tonics!=='number'||!Number.isInteger(o.tonics)||o.tonics<0||o.tonics>3||(!r.chestOpened&&o.tonics!==0))throw new Error('回復藥存量不一致。');r.tonics=o.tonics;
 if(s.kingdom.phase!=='rescue'||!s.kingdom.forestWon)throw new Error('救援缺少露卡加入的前置條件。');
 const early=r.stage==='entered'||r.stage==='cleared';
 if((early&&(r.organOpen||r.guardsWon||r.yakraWon||r.chestOpened))||(r.guardsWon&&!r.organOpen)||(r.yakraWon&&!r.guardsWon)||(r.chancellorFreed&&!r.yakraWon)||(r.chestOpened&&!r.organOpen))throw new Error('修道院事件前置條件不一致。');
 if(['rescued','homecoming','reunited','returned'].includes(r.stage)&&!r.yakraWon)throw new Error('王后救援尚未完成。');
 if((s.chapter==='passage'&&!r.organOpen)||(s.chapter==='sanctum'&&!r.guardsWon))throw new Error('所在地尚未開啟。');
 if(r.stage==='returned'?(s.chapter!=='fair'||s.era!=='present'):(s.chapter==='fair'||s.era!=='middle'))throw new Error('救援時代與地圖不一致。');
 const g=o.guest;if(!g||typeof g!=='object'||Array.isArray(g))throw new Error('第三名隊員資料錯誤。');const p=g as Record<string,unknown>;
 for(const key of ['x','z','hp','mp'] as const)if(typeof p[key]!=='number'||!Number.isFinite(p[key]))throw new Error('第三名隊員數值錯誤。');
 const x=p.x as number,z=p.z as number,hp=p.hp as number,mp=p.mp as number;
 if(hp<1||hp>GUEST_HP||mp<0||mp>GUEST_MP||!walkable(x,z,s.chapter))throw new Error('第三名隊員位置或能力超出範圍。');
 Object.assign(r.guest,{x,z,hp,mp});s.rescue=r;
}


/** Additive opening: the old fair/checkpoint state never acquires invented trial choices. */
export function serialize(s:State):string{
 const adventure=serializeAdventure(s);return s.equipment?JSON.stringify({version:8,schema:'equipment-v1',adventure,equipment:restoreEquipment(s.equipment)}):adventure;
}
/** Adventure-only checkpoint retains unchanged v1-v7 story provenance inside v8. */
function serializeAdventure(s:State):string{
 if(shopping(s))throw new Error('請等瑪兒選好糖果，再存檔。');
 if(trialActive(s)){
  if(s.mode!=='explore'||cutsceneActive(s)||s.trial.choice)throw new Error('請先結束戰鬥、選擇或演出再存檔。');
  return JSON.stringify({version:7,history:s.trial.history,chapter:s.chapter,era:s.era,joined:s.joined,trial:saveTrial(s.trial),tonics:s.rescue.tonics,players:s.players.map(({x,z,hp,mp})=>({x,z,hp,mp})),guest:(({x,z,hp,mp})=>({x,z,hp,mp}))(s.rescue.guest)});
 }
 if(s.prologue.stage==='legacy')return serializeLegacy(s);
 if(s.mode!=='explore'||cutsceneActive(s)||s.prologue.choice)throw new Error('請先完成演出或選擇再存檔。');
 const base=prologueMap(s.chapter)?{era:s.era,joined:s.joined,flags:{...s.flags},fair:{...s.fair},players:s.players.map(({x,z,hp,mp})=>({x,z,hp,mp}))}:JSON.parse(serializeLegacy(s));
 return JSON.stringify({...base,version:6,chapter:s.chapter,prologue:prologueSave(s.prologue)});
}
function restoreV6(o:Record<string,unknown>):State{
 if(typeof o.chapter!=='string'||typeof o.joined!=='boolean')throw new Error('開場存檔地圖或雙人設定錯誤。');
 const p=restorePrologue(o.prologue),chapter=o.chapter;
 let s:State;
 if(prologueMap(chapter)){
  if(!['home','companions'].includes(p.stage)||o.era!=='present'||typeof o.joined!=='boolean'||o.opening!==undefined||o.kingdom!==undefined||o.rescue!==undefined)throw new Error('家中或大地圖存檔不一致。');
  s=createState(chapter);s.joined=o.joined;
  for(const key of ['flags','fair'] as const){const f=o[key];if(!f||typeof f!=='object'||Array.isArray(f))throw new Error('開場資料缺漏。');for(const k of Object.keys(s[key])){const v=(f as Record<string,unknown>)[k];if(typeof v!=='boolean')throw new Error('開場旗標錯誤。');if(v&&(key==='flags'||(p.stage!=='companions'&&['luccaMet','telepodTested'].includes(k))))throw new Error('開場存檔含有未經歷事件。');(s[key] as Record<string,boolean>)[k]=v;}}
  if(s.fair.telepodTested&&!s.fair.luccaMet)throw new Error('傳送前置事件錯誤。');
  if(!Array.isArray(o.players)||o.players.length!==2)throw new Error('開場角色錯誤。');
  o.players.forEach((v:unknown,i:number)=>{if(!v||typeof v!=='object'||Array.isArray(v))throw new Error('開場角色錯誤。');const a=v as Record<string,number>;if(['x','z','hp','mp'].some(k=>typeof a[k]!=='number'||!Number.isFinite(a[k]))||!walkable(a.x!,a.z!,chapter)||a.hp!<1||a.hp!>MAX_HP||a.mp!<0||a.mp!>MAX_MP)throw new Error('開場角色位置或能力錯誤。');Object.assign(s.players[i]!,{x:a.x,z:a.z,hp:a.hp,mp:a.mp});});
 }else{
  const version=o.rescue?5:o.kingdom?4:o.opening?3:2;
  if(chapter==='lab'||(p.stage!=='companions'&&(chapter!=='fair'||version!==2))||p.stage==='home')throw new Error('初遇與章節不一致。');
  s=deserialize(JSON.stringify({...o,version,joined:false}));s.joined=o.joined;
  if(p.stage!=='companions'&&(s.fair.luccaMet||s.fair.telepodTested))throw new Error('初遇前不得已有祭典進度。');
 }
 s.prologue=p;
 if(p.conduct){if(!fairWalkable(p.conduct.cat.x,p.conduct.cat.z))throw new Error('貓的位置不可通行。');if(s.opening.phase!=='none'&&!p.conduct.sealed)throw new Error('穿越之後不得改寫祭典經歷。');}
 if(s.joined&&activeSlot(s,1)&&distance(s.players[0],s.players[1])>MAX_SEPARATION+.01)throw new Error('雙人距離超出範圍。');
 s.log=['已讀取存檔；初遇選擇保留。'];return s;
}
function startPrologueTravel(s:State,to:PrologueMap|'fair',x:number,z:number):void{
 if(!partyTogether(s)){log(s,'一起靠近入口，再前往下一個地方。');return;}
 s.prologue.transition={to,x,z,elapsed:0,entered:false};s.followPlan=newFollowPlan();s.players.forEach(p=>p.walking=false);
}
function stepPrologue(s:State,dt:number):boolean{
 const q=s.prologue,t=q.transition;
 if(t){t.elapsed+=dt;if(t.elapsed>=.22&&!t.entered){s.chapter=t.to;s.players.forEach((p,i)=>Object.assign(p,{x:t.x+(i? .8:0),z:t.z,walking:false,facing:t.to==='home'?0:2}));t.entered=true;if(t.to==='fair'&&q.stage==='home')q.stage='fair';s.followPlan=newFollowPlan();}if(t.elapsed>=.48)q.transition=null;return true;}
 if(q.stage==='collision'&&q.elapsed<.6){q.elapsed=Math.min(.6,q.elapsed+dt);return true;}
 if(q.stage==='waking'){q.elapsed+=dt;if(q.elapsed>=2.6){q.stage='home';q.elapsed=0;log(s,'母親：千年祭已經開始了，露卡不是邀你去看她的發明嗎？');}return true;}
 return !!q.choice;
}
function prologueTriggers(s:State):void{
 if(s.prologue.stage==='legacy'||cutsceneActive(s))return;
 const p=s.players[0];
 if(s.chapter==='bedroom'&&distance(p,{x:0,z:-4.1})<.65)startPrologueTravel(s,'home',4.5,2.2);
 else if(s.chapter==='home'&&distance(p,{x:4.7,z:3.8})<.65)startPrologueTravel(s,'bedroom',0,-2.5);
 else if(s.chapter==='fair'&&s.prologue.stage==='fair'&&distance(p,MARLE_MEETING)<.85){s.prologue.stage='collision';s.prologue.elapsed=0;p.walking=false;log(s,'砰！女孩跌坐在鐘台前，項鍊掉到了另一邊。');}
}
export type PrologueDialog={title:string;text:string;choice?:'return'|'company'};
export function interactPrologue(s:State,slot:Slot):PrologueDialog|null{
 if(slot!==0||s.mode!=='explore'||cutsceneActive(s)||s.prologue.choice||s.prologue.stage==='legacy')return null;
 const conduct=interactConduct(s,slot);if(conduct)return conduct;
 const p=s.players[0],q=s.prologue,near=(x:number,z:number,r=1.6)=>distance(p,{x,z})<r;
 if(s.chapter==='bedroom'){
  if(near(3.6,1.6,2.6)){s.players.forEach(p=>{p.hp=MAX_HP;p.mp=MAX_MP;});return {title:'克羅諾的房間',text:'在熟悉的床鋪休息，體力恢復了。窗外傳來千年祭的鐘聲。'};}
  return {title:'克羅諾的房間',text:'南方的樓梯通往一樓。'};
 }
 if(s.chapter==='home'){
  if(near(0,-4.2)){startPrologueTravel(s,'overworld1000',WORLD_HOME.x,WORLD_HOME.z-1.7);return null;}
  if(near(0,2)){q.motherTalked=true;return {title:'母親',text:'露卡在廣場準備了新的發明。去看看吧，玩得開心一點。'};}
  return {title:'克羅諾的家',text:'南方是家門，東北角的樓梯通往房間。'};
 }
 if(s.chapter==='overworld1000'){
  if(near(WORLD_HOME.x,WORLD_HOME.z,1.25)){startPrologueTravel(s,'home',0,-2.5);return null;}
  if(near(WORLD_FAIR.x,WORLD_FAIR.z,1.25)){startPrologueTravel(s,'fair',0,-6.8);return null;}
  return null;
 }
 if(s.chapter!=='fair'||q.stage==='companions')return null;
 if(near(0,-7.7,1.5)){if(q.stage==='fair'){q.stage='home';startPrologueTravel(s,'overworld1000',WORLD_FAIR.x,WORLD_FAIR.z-1.6);}else return {title:'鐘台前的女孩',text:'項鍊的主人還在等著。先把事情處理好吧。'};return null;}
 if(q.stage==='fair'){
  const point=nearestFair(p.x,p.z);
  if(point?.id==='gato'){beginBattle(s);return {title:'岡薩雷斯',text:'機器人邀請你挑戰。此時克羅諾獨自應戰；戰鬥仍採 ATB。'};}
  if(point?.id==='bell'){s.fair.bellHeard=true;return {title:'莉妮之鐘',text:'鐘聲迴盪在祭典上方。鐘台前有個匆忙的女孩。'};}
  if(point?.id==='candy')return {title:'糖果攤',text:'木盤上擺著各色糖果。'};
  return {title:'千年祭',text:'逛逛祭典，或到鐘台前看看。'};
 }
 const marle=distance(p,MARLE_MEETING),pendant=distance(p,DROPPED_PENDANT);
 if(!q.pendantPicked&&pendant<1.25&&pendant<marle){q.pendantPicked=true;if(q.first==='unknown')q.first='pendant';log(s,'拾起了女孩掉落的項鍊。');return {title:'掉落的項鍊',text:'地上閃亮的項鍊被你拾起。女孩仍在鐘台前。'};}
 if(marle<1.65){q.checkedMarle=true;if(q.first==='unknown')q.first='marle';if(!q.pendantPicked)return {title:'女孩',text:'好痛……你沒事吧？咦，我的項鍊不見了！'};
  q.choice=q.pendantReturned?'company':'return';return q.choice==='return'?{title:'女孩',text:'那是我的項鍊，可以還給我嗎？',choice:'return'}:{title:'瑪兒',text:'謝謝你！我叫瑪兒。可以陪我逛逛祭典嗎？',choice:'company'};
 }
 return null;
}
export function choosePrologue(s:State,yes:boolean):PrologueDialog|null{
 const q=s.prologue;if(q.choice==='sell-pendant')return chooseConduct(s,yes);
 if(s.mode!=='explore'||cutsceneActive(s)||s.chapter!=='fair'||q.stage!=='collision'||!q.choice)return null;
 const choice=q.choice;q.choice=null;
 if(!yes){if(choice==='return'&&q.conduct)q.conduct.returnRefused=true;return {title:'女孩',text:choice==='return'?'這條項鍊對我很重要，請再想一想。':'那我先在這裡等一下。'};}
 if(choice==='return'){if(!q.pendantPicked||!q.checkedMarle)return null;q.pendantReturned=true;return {title:'女孩',text:'太好了！這是我很珍惜的東西，謝謝你。'};}
 if(!q.pendantReturned)return null;q.stage='companions';Object.assign(s.players[1],{x:MARLE_MEETING.x,z:MARLE_MEETING.z,walking:false,facing:0});s.followPlan=newFollowPlan();log(s,'瑪兒加入同行。露卡的展示在廣場北方。');
 return {title:'瑪兒',text:'走吧！去看看露卡的發明。'};
}

/** v7 keeps the real pre-trial save as immutable history, so v1–v6 migration does not forge facts. */
function restoreV7(o:Record<string,unknown>):State{
 if(typeof o.history!=='string'||o.history.length>16384)throw new Error('缺少原始回歸存檔。');
 const history:unknown=JSON.parse(o.history);
 if(!history||typeof history!=='object'||!Number.isInteger((history as {version:number}).version)||(history as {version:number}).version>6)throw new Error('不允許巢狀審判存檔。');
 const s=deserialize(o.history);if(s.rescue.stage!=='returned'||s.chapter!=='fair'||s.era!=='present')throw new Error('審判缺少真實救援回歸進度。');
 const baseTonics=s.rescue.tonics,t=restoreTrial(o.trial,o.chapter);t.history=o.history;s.trial=t;
 s.chapter=o.chapter as Chapter;s.era=t.stage==='future'?'future':'present';
 if(o.era!==s.era||typeof o.joined!=='boolean'||!Array.isArray(o.players)||o.players.length!==2)throw new Error('審判角色或時代錯誤。');s.joined=o.joined;
 const loadActor=(v:unknown,p:Actor,maxHp:number,maxMp:number)=>{if(!v||typeof v!=='object'||Array.isArray(v))throw new Error('角色格式錯誤。');const a=v as Record<string,unknown>;
  for(const k of ['x','z','hp','mp'])if(typeof a[k]!=='number'||!Number.isFinite(a[k]))throw new Error('角色數值錯誤。');
  const next={...p,x:a.x as number,z:a.z as number,hp:a.hp as number,mp:a.mp as number};
  if(!Number.isInteger(next.hp)||!Number.isInteger(next.mp)||next.hp<1||next.hp>maxHp||next.mp<0||next.mp>maxMp||!trialPositionValid(s.chapter,next)||!trialMoveAllowed(s,next.x,next.z))throw new Error('審判角色位置或能力超出範圍。');Object.assign(p,next,{atb:0,walking:false});
 };
 s.players.forEach((p,i)=>loadActor((o.players as unknown[])[i],p,MAX_HP,MAX_MP));loadActor(o.guest,s.rescue.guest,GUEST_HP,GUEST_MP);
 if(s.joined&&activeSlot(s,1)&&distance(s.players[0],s.players[1])>MAX_SEPARATION+.01)throw new Error('雙人距離超出範圍。');
 if(typeof o.tonics!=='number'||!Number.isInteger(o.tonics)||o.tonics<0||o.tonics>baseTonics+(t.suppliesTaken?2:0))throw new Error('回復藥來源不一致。');s.rescue.tonics=o.tonics;
 const computed=(trialEvidence(s).jurors.filter(x=>x==='guilty').length>=4?'guilty':'not-guilty');if(t.verdict!=='pending'&&t.verdict!==computed)throw new Error('裁決與記錄不一致。');
 validateHearing(s);
 s.log=['已讀取審判與越獄存檔；舊旅程與未記錄的選擇保持原樣。'];return s;
}


/** Menus follow the current story roster; no party swap or third human slot. */
export const partyMember=(s:State,slot:Slot):Member=>slot===0?'crono':s.kingdom.phase==='rescue'?'lucca':'marle';
const equipmentEditable=(s:State):boolean=>s.mode==='explore'&&!cutsceneActive(s)&&!shopping(s)&&!s.prologue.choice&&!s.trial.choice;
export function shopAvailable(s:State):boolean{
 return equipmentEditable(s)&&s.chapter==='fair'&&s.opening.phase==='none'&&s.rescue.stage==='none'&&s.kingdom.phase==='none'&&!!s.prologue.conduct&&!s.prologue.conduct.sealed&&['fair','companions'].includes(s.prologue.stage)&&distance(s.players[0],CONDUCT_POINTS.merchant)<1.8;
}
export function equipItem(s:State,member:Member,id:string):boolean{
 if(!equipmentEditable(s)||(member!=='crono'&&!(activeSlot(s,1)&&partyMember(s,1)===member)&&guestKind(s)!==member))return false;
 const next=wearEquipment(s.equipment??newEquipment(),member,id);if(!next)return false;s.equipment=next;return true;
}
export function tradeItem(s:State,id:string,quantity:number,buy:boolean):boolean{
 if(!shopAvailable(s))return false;const next=tradeEquipment(s.equipment??newEquipment(),id,quantity,buy);if(!next)return false;s.equipment=next;return true;
}
