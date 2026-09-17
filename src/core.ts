/** Pure deterministic prototype rules. No renderer, DOM, original ROM data or network. */
export type Era = 'present' | 'future';
export type Mode = 'explore' | 'battle' | 'victory' | 'defeat';
export type Slot = 0 | 1;
export type Vec = { x: number; z: number };
export type Actor = Vec & { hp: number; mp: number; atb: number; facing: number; walking: boolean };
export type Enemy = Vec & { hp: number; atb: number };
export type Effect = { x: number; z: number; text: string; kind: 'hit' | 'heal' | 'combo' };
export type Flags = { repaired: boolean; won: boolean; visitedFuture: boolean };
export type State = {
  mode: Mode; era: Era; joined: boolean; players: [Actor, Actor]; enemies: Enemy[];
  flags: Flags; combo: [boolean, boolean]; log: string[]; effects: Effect[];
  ticks: number; enemyTurn: number;
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
export function createState(): State {
  const actor = (x: number): Actor => ({ x, z: -5, hp: MAX_HP, mp: MAX_MP, atb: 0, facing: 0, walking: false });
  return { mode: 'explore', era: 'present', joined: false, players: [actor(-1), actor(1)],
    enemies: [], flags: { repaired: false, won: false, visitedFuture: false },
    combo: [false, false], log: ['沿石路向北，探索測試村落。'], effects: [], ticks: 0, enemyTurn: 0 };
}
export const distance = (a: Vec, b: Vec): number => Math.hypot(a.x - b.x, a.z - b.z);
export function walkable(x: number, z: number): boolean {
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
  const allowed = (x: number, z: number) => walkable(x, z) && (!s.joined || distance({x,z},peer) <= MAX_SEPARATION);
  const x = p.x + nx * SPEED * dt;
  if (allowed(x,p.z)) { p.walking ||= Math.abs(x-p.x)>0.0001; p.x=x; }
  const z = p.z + nz * SPEED * dt;
  if (allowed(p.x,z)) { p.walking ||= Math.abs(z-p.z)>0.0001; p.z=z; }
  p.facing = Math.abs(nx)>Math.abs(nz) ? (nx>0?1:3) : (nz>0?2:0);
}
export function setCoop(s: State, joined: boolean): boolean {
  if (s.mode !== 'explore') return false;
  s.joined=joined;
  s.combo=[false,false];
  log(s,joined?'P2 已加入：各自控制角色，共享鏡頭。':'P2 已退出：夥伴恢復跟隨與自動攻擊。');
  return true;
}
export function beginBattle(s: State): boolean {
  if (s.mode !== 'explore') return false;
  s.mode='battle'; s.combo=[false,false]; s.enemyTurn=0;
  s.players.forEach((p,i)=>{p.x=-1.5+i*3;p.z=1;p.atb=0;p.walking=false;p.facing=2;});
  s.enemies=[{x:-2,z:4.5,hp:90,atb:0},{x:2,z:4.8,hp:90,atb:0}];
  log(s,'ATB 戰鬥開始。兩人各自下指令；合技需要雙方確認。'); return true;
}
function eligible(s: State, slot: Slot, mp: number): boolean {
  const p=s.players[slot];return s.mode==='battle' && p.hp>0 && p.atb>=1 && p.mp>=mp;
}
function finish(s: State): void {
  if (s.enemies.every(e=>e.hp<=0)) { s.mode='victory';s.flags.won=true;s.combo=[false,false];log(s,'試煉完成！北方時門已可探索。'); }
}
export function action(s: State, slot: Slot, kind: 'attack'|'skill'): boolean {
  const cost=kind==='skill'?3:0;
  if (!eligible(s,slot,cost)) return false;
  const p=s.players[slot]; const target=s.enemies.filter(e=>e.hp>0).sort((a,b)=>distance(a,p)-distance(b,p))[0];
  if (!target) return false;
  s.combo[slot]=false;p.atb=0;p.mp-=cost;
  const damage=kind==='skill'?48:30;target.hp=Math.max(0,target.hp-damage);
  s.effects.push({x:target.x,z:target.z,text:String(damage),kind:'hit'});
  log(s,`P${slot+1} ${kind==='skill'?'施放技能':'攻擊'}：${damage} 傷害。`);finish(s);return true;
}
export function requestCombo(s: State, slot: Slot): boolean {
  if (!eligible(s,slot,4)) return false;
  s.combo[slot]=true;
  if (!s.joined && slot===0 && eligible(s,1,4)) s.combo[1]=true;
  tryCombo(s);return true;
}
function tryCombo(s: State): void {
  if (!s.combo[0] || !s.combo[1] || !eligible(s,0,4) || !eligible(s,1,4)) return;
  s.players.forEach(p=>{p.atb=0;p.mp-=4;});s.combo=[false,false];
  s.enemies.filter(e=>e.hp>0).forEach(e=>{e.hp=Math.max(0,e.hp-72);s.effects.push({x:e.x,z:e.z,text:'72',kind:'combo'});});
  log(s,'雙人合技「共鳴斬」！雙方消耗 ATB 與 4 MP。');finish(s);
}
export function step(s: State, input: Input, delta: number): void {
  if (!Number.isFinite(delta) || delta<=0) return;
  const dt=Math.min(delta,0.05);s.ticks++;
  if (s.mode==='explore') {
    move(s,0,input[0],dt);
    if (s.joined) move(s,1,input[1],dt);
    else {
      const a=s.players[0],b=s.players[1],dist=distance(a,b);
      move(s,1,dist>1.7?{x:(a.x-b.x)/dist,z:(a.z-b.z)/dist}:{x:0,z:0},dt);
    }
    if (!s.flags.won && s.players.some(p=>Math.abs(p.x)<3.3 && p.z>2.4 && p.z<5.8)) beginBattle(s);
    return;
  }
  if (s.mode!=='battle') return;
  s.players.forEach(p=>{if(p.hp>0)p.atb=Math.min(1,p.atb+dt*0.42);});
  if (!s.joined && eligible(s,1,0)) {
    if (s.combo[0] && eligible(s,1,4)) {s.combo[1]=true;tryCombo(s);}
    else if (!s.combo[0]) action(s,1,'attack');
  }
  if(s.mode!=='battle')return;
  for(const e of s.enemies) {
    if(e.hp<=0)continue;
    e.atb+=dt*0.14;
    if(e.atb>=1) {
      e.atb=0;const alive=s.players.filter(p=>p.hp>0);const p=alive[s.enemyTurn++%alive.length];
      if(!p)break;
      p.hp=Math.max(0,p.hp-12);s.effects.push({x:p.x,z:p.z,text:'−12',kind:'hit'});
      if(p.hp===0){const idx=s.players.indexOf(p) as Slot;s.combo[idx]=false;p.atb=0;}
    }
  }
  if(s.players.every(p=>p.hp<=0)){s.mode='defeat';s.combo=[false,false];log(s,'試煉失敗。可回村補給，再次挑戰。');}
}
export function leaveBattle(s: State): void {
  s.mode='explore';s.enemies=[];s.combo=[false,false];
  s.players.forEach((p,i)=>Object.assign(p,{x:-1+i*2,z:-3,hp:MAX_HP,mp:MAX_MP,atb:0,walking:false}));
}
export function repair(s: State): boolean {
  if(s.mode!=='explore'||s.era!=='present'||s.flags.repaired)return false;
  s.flags.repaired=true;log(s,'你修復了村落的晶核。未來會有所不同。');return true;
}
export function travel(s: State): boolean {
  if(s.mode!=='explore')return false;
  s.era=s.era==='present'?'future':'present';if(s.era==='future')s.flags.visitedFuture=true;
  s.players.forEach((p,i)=>{p.x=-0.8+i*1.6;p.z=7;p.walking=false;});
  log(s,s.era==='present'?'回到青翠的現在。':s.flags.repaired?'晶核持續運轉，未來仍有光。':'抵達未來：未修復的晶核已經熄滅。');return true;
}
export type SaveData = {version:1;era:Era;joined:boolean;flags:Flags;players:{x:number;z:number;hp:number;mp:number}[]};
export function serialize(s: State): string {
  if(s.mode!=='explore')throw new Error('請先結束戰鬥再存檔。');
  return JSON.stringify({version:1,era:s.era,joined:s.joined,flags:{...s.flags},players:s.players.map(({x,z,hp,mp})=>({x,z,hp,mp}))} satisfies SaveData);
}
export function deserialize(raw: string): State {
  if(raw.length>65536)throw new Error('存檔太大。');
  const v:unknown=JSON.parse(raw);
  if(!v||typeof v!=='object')throw new Error('存檔格式錯誤。');
  const o=v as Record<string,unknown>;
  if(o.version!==1||!['present','future'].includes(String(o.era))||typeof o.joined!=='boolean')throw new Error('不支援的存檔版本或格式。');
  if(!Array.isArray(o.players)||o.players.length!==2||!o.flags||typeof o.flags!=='object')throw new Error('存檔資料不完整。');
  const f=o.flags as Record<string,unknown>;
  if(['won','repaired','visitedFuture'].some(k=>typeof f[k]!=='boolean'))throw new Error('事件旗標錯誤。');
  const s=createState();s.era=o.era as Era;s.joined=o.joined;
  s.flags={won:f.won as boolean,repaired:f.repaired as boolean,visitedFuture:f.visitedFuture as boolean};
  for(let i=0;i<2;i++) {
    const p=o.players[i];if(!p||typeof p!=='object')throw new Error('角色存檔錯誤。');
    if(['x','z','hp','mp'].some(k=>typeof p[k]!=='number'||!Number.isFinite(p[k])))throw new Error('角色數值錯誤。');
    if(!walkable(p.x,p.z)||p.hp<1||p.hp>MAX_HP||p.mp<0||p.mp>MAX_MP)throw new Error('角色位置或能力值超出範圍。');
    Object.assign(s.players[i]!,{x:p.x,z:p.z,hp:p.hp,mp:p.mp});
  }
  if(s.joined&&distance(s.players[0],s.players[1])>MAX_SEPARATION+0.01)throw new Error('雙人距離超出範圍。');
  s.log=['已讀取存檔。'];return s;
}
