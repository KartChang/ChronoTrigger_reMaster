import {createState,step,beginBattle,setCoop,action,requestCombo,leaveBattle,repair,travel,serialize,deserialize,distance,MAX_HP,MAX_MP} from './core';
import type {State,Slot} from './core';
import {Controls} from './input';
import type {Command} from './input';
import {World} from './render';
import * as storage from './save';

const $=<T extends HTMLElement=HTMLElement>(id:string):T=>{const el=document.getElementById(id);if(!el)throw new Error(`Missing UI element ${id}`);return el as T;};
let state=createState(),started=false,manualPause=false,dialogOpen=false,last=performance.now(),accumulator=0,hudTime=0,messageUntil=0,previousLog='';
let soundEnabled=false,audio:AudioContext|undefined;
const controls=new Controls(command);
const halted=()=>!started||manualPause||dialogOpen||document.hidden;
const asError=(e:unknown)=>e instanceof Error?e.message:String(e);
function announce(text:string):void{$('message').textContent=text;$('message').classList.add('show');messageUntil=performance.now()+4500;}
function tone(frequency=440):void{
  if(!soundEnabled)return;
  try{audio??=new AudioContext();void audio.resume().catch(()=>{});const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='triangle';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.04,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+.13);}catch{soundEnabled=false;$('sound').textContent='音效不可用';}
}
function showDialog(title:string,text:string):void{dialogOpen=true;controls.clear();$('dialog-title').textContent=title;$('dialog-text').textContent=text;$('dialog').hidden=false;$('dialog-close').focus();}
function closeDialog():void{dialogOpen=false;$('dialog').hidden=true;controls.clear();last=performance.now();accumulator=0;}
function togglePause():void{if(!started)return;manualPause=!manualPause;controls.clear();$('pause-screen').hidden=!manualPause;last=performance.now();accumulator=0;}
function start(coop:boolean):void{started=true;state.joined=coop;$('start-screen').hidden=true;controls.clear();last=performance.now();accumulator=0;announce(coop?'雙人已啟動：P1 WASD，P2 方向鍵。':'WASD 移動；靠近物件按 E。也可直接點「練習戰鬥」。');updateHud();}
function nearest(slot:Slot):'crystal'|'gate'|'save'|null{
  const p=state.players[slot];const options:[number,'crystal'|'gate'|'save'][]=[[distance(p,{x:-5,z:-1}),'crystal'],[distance(p,{x:0,z:9}),'gate'],[distance(p,{x:-8,z:-5}),'save']];options.sort((a,b)=>a[0]-b[0]);return options[0]![0]<2.05?options[0]![1]:null;
}
function interact(slot:Slot):void{
  if(state.mode!=='explore'){announce('戰鬥中請使用攻擊、技能或合技。');return;}
  switch(nearest(slot)){
    case 'crystal':{
      const changed=repair(state);tone(620);
      showDialog(changed?'晶核重新亮起':state.era==='future'?'未來的回聲':'村落的晶核',changed?'你修復了供應村落能源的晶核。\n前往北方時門，看看這個選擇如何影響未來。\n\n這是用來驗證跨時代事件的原創測試情節。':state.era==='future'?(state.flags.repaired?'因為過去的修復，這裡仍有光，也長出了新芽。':'這裡的晶核已經熄滅。回到過去修復它，再來看看。'):'晶核已修復。北方時門可以往返現在與未來。');break;
    }
    case 'gate':travel(state);tone(800);showDialog(state.era==='future'?'抵達未來':'回到現在',state.era==='future'?(state.flags.repaired?'村落被歲月改變，但你修復的晶核仍在運轉。\n晶核周圍長出了新芽。':'村落一片冷色。晶核沒有被修復，燈光已經熄滅。\n回到現在改變它，再穿越一次。'):'事件旗標仍然保留。你可以存檔、補給，或再次進行試煉。');break;
    case 'save':void saveGame();break;
    default:announce('靠近左側晶核、藍色存檔石或北方時門，再按互動。');
  }
}
function command(slot:Slot,cmd:Command):void{
  if(cmd==='pause'){togglePause();return;}
  if(cmd==='join'){
    if(!started||manualPause||dialogOpen)return;
    if(!setCoop(state,!state.joined))announce('請在探索模式加入或退出 P2。');updateHud();return;
  }
  if(dialogOpen){if(cmd==='interact' && (slot===0||state.joined))closeDialog();return;}
  if(halted()||(slot===1&&!state.joined))return;
  if(cmd==='interact'){interact(slot);return;}
  const accepted=cmd==='combo'?requestCombo(state,slot):action(state,slot,cmd);
  if(accepted)tone(cmd==='combo'?660:cmd==='skill'?520:330);
  else announce(state.mode==='battle'?'需要存活、ATB 全滿，並有足夠 MP。技能 3 MP，合技每人 4 MP。':'探索模式不會揮砍；靠近敵人或選「練習戰鬥」進入 ATB。');
  updateHud();
}
async function saveGame():Promise<void>{try{const raw=serialize(state);await storage.save(raw);announce('本機存檔完成。建議另行匯出 JSON 備份。');}catch(e){announce('存檔未完成：'+asError(e)+' 可改用「匯出」。');}}
async function loadGame():Promise<void>{if(state.mode!=='explore'){announce('請先結束戰鬥。');return;}try{const raw=await storage.load();if(raw===null){announce('尚無本機存檔。');return;}state=deserialize(raw);controls.clear();updateHud();announce('讀檔完成。');}catch(e){announce('讀檔未完成：'+asError(e));}}
$('start').onclick=()=>start(false);$('start-coop').onclick=()=>start(true);
$('pause').onclick=togglePause;$('resume').onclick=togglePause;$('dialog-close').onclick=closeDialog;
$('coop').onclick=()=>command(1,'join');$('interact').onclick=()=>command(0,'interact');
$('save').onclick=()=>{if(started&&!halted())void saveGame();};$('load').onclick=()=>{if(started&&!halted())void loadGame();};
$('trial').onclick=()=>{if(!halted()){if(beginBattle(state))announce('練習戰鬥開始。等待 ATB 充滿。');else announce('請先完成目前戰鬥。');updateHud();}};
$('sound').onclick=()=>{soundEnabled=!soundEnabled;$('sound').textContent='音效：'+(soundEnabled?'開':'關');tone();};
$('export').onclick=()=>{try{if(!started||halted())return;const blob=new Blob([serialize(state)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='chrono-hd2d-save-v1.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('已匯出存檔。');}catch(e){announce(asError(e));}};
$('import').onclick=()=>{if(started&&!halted()&&state.mode==='explore')$('save-file').click();else announce('請在探索模式匯入存檔。');};
$('save-file').onchange=async()=>{const input=$<HTMLInputElement>('save-file');const file=input.files?.[0];if(!file)return;try{if(file.size>65536)throw new Error('存檔不得超過 64 KiB。');state=deserialize(await file.text());controls.clear();updateHud();announce('存檔已匯入，請再按「存檔」保存到本機。');}catch(e){announce('匯入失敗：'+asError(e));}finally{input.value='';}};
$('continue').onclick=()=>{leaveBattle(state);$('result').hidden=true;controls.clear();updateHud();};
document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button=>button.onclick=()=>command(Number(button.dataset.slot) as Slot,button.dataset.action as Command));
document.addEventListener('visibilitychange',()=>{controls.clear();if(document.hidden&&started){manualPause=true;$('pause-screen').hidden=false;}last=performance.now();accumulator=0;});
function updateHud():void{
  $('era').textContent=state.era==='present'?'PRESENT · 現在':'FUTURE · 未來';$('location').textContent=state.era==='present'?'時門村落':'時門村落 · 歲月之後';
  $('coop').textContent=state.joined?'退出 P2 · C':'加入 P2 · C';($('coop') as HTMLButtonElement).disabled=state.mode!=='explore';
  $('party-mode').textContent=state.joined?'LOCAL CO-OP · 雙人':'SOLO + COMPANION';$('p2-control').textContent=state.joined?'方向鍵移動 · Enter 互動':'夥伴自動跟隨／攻擊';
  const flags:[string,boolean,string][]=[['q-repair',state.flags.repaired,'修復晶核'],['q-battle',state.flags.won,'完成試煉'],['q-future',state.flags.visitedFuture,'穿越時門']];for(const[id,yes,text]of flags)$(id).textContent=(yes?'✓ ':'○ ')+text;
  $('objective').textContent=!state.flags.repaired?'前往左側晶核，按 E 修復。':!state.flags.won?'沿中央石路向北，進行 ATB 試煉。':!state.flags.visitedFuture?'靠近北方時門，按 E 前往未來。':'小型試玩目標已完成。可以往返時代、存檔或再戰。';
  state.players.forEach((p,i)=>{
    $('hp'+i).style.width=`${p.hp/MAX_HP*100}%`;$('hp-text'+i).textContent=`${p.hp}/${MAX_HP}`;
    $('mp'+i).textContent=`MP ${p.mp} / ${MAX_MP}`;$('atb'+i).style.width=`${p.atb*100}%`;$('atb-text'+i).textContent=state.mode==='battle'?(p.atb>=1?'READY':`${Math.floor(p.atb*100)}%`):'探索';
    document.querySelectorAll<HTMLButtonElement>(`[data-slot="${i}"]`).forEach(b=>{const cost=b.dataset.action==='skill'?3:b.dataset.action==='combo'?4:0;b.disabled=halted()||state.mode!=='battle'||p.hp<=0||p.atb<1||p.mp<cost||(i===1&&!state.joined);b.classList.toggle('queued',b.dataset.action==='combo'&&state.combo[i]===true);});
  });
  $('combo-status').textContent=state.combo[0]||state.combo[1]?'合技準備中：等待另一名角色確認。':'合技：雙方 ATB 全滿，各需 4 MP。';
  $('battle-banner').hidden=state.mode!=='battle';$('enemy-hp').textContent=state.enemies.map((e,i)=>`敵 ${i+1} · HP ${e.hp}/90`).join('　');
  const hint=state.mode==='explore'?nearest(0):null;$('interact-hint').hidden=!hint||!started||dialogOpen;$('interact-hint').textContent=hint==='crystal'?'E · 檢查晶核':hint==='gate'?'E · 穿越時門':'E · 保存進度';
  const end=state.mode==='victory'||state.mode==='defeat';$('result').hidden=!end;$('result-title').textContent=state.mode==='victory'?'試煉完成':'這次，先回去休息';$('result-text').textContent=state.mode==='victory'?'雙人合作與 ATB 原型已完成這場試煉。\n返回村落會補滿 HP／MP，接著可以探索北方時門。':'兩名角色都倒下了。\n返回村落會補滿 HP／MP，再嘗試使用技能或合技。';
  const message=state.log[state.log.length-1]??'';if(started&&message!==previousLog){previousLog=message;announce(message);}
}
try{
  const world=new World($<HTMLCanvasElement>('world'));
  world.draw(state,0,false);
  $<HTMLButtonElement>('start').disabled=false;$<HTMLButtonElement>('start-coop').disabled=false;$('start').textContent='開始冒險';
  let frame=0;
  world.start(()=>{
    const now=performance.now(),dt=Math.min((now-last)/1000,.1);last=now;
    // Poll controller edges even while manually paused, so Start can resume. Movement is gated below.
    const input=controls.poll();
    if(!halted()){
      accumulator+=dt;
      while(accumulator>=1/60){step(state,input,1/60);accumulator-=1/60;}
    }else accumulator=0;
    world.draw(state,dt,!halted()||!started);
    hudTime+=dt;if(hudTime>.08){updateHud();hudTime=0;}
    if(now>messageUntil)$('message').classList.remove('show');
    if(frame++%30===0)$('fps').textContent=`WEBGL · ${Math.round(world.engine.getFps())} FPS`;
  });
  const win=window as unknown as {__CHRONO_TEST__?:{snapshot:()=>State;paused:()=>boolean}};
  if(new URLSearchParams(location.search).get('test')==='1'||document.documentElement.dataset.test==='1')win.__CHRONO_TEST__={snapshot:()=>structuredClone(state),paused:halted};
}catch(error){const el=document.createElement('div');el.className='fatal';const title=document.createElement('h2');title.textContent='無法建立 3D 畫面';const p=document.createElement('p');p.textContent='請使用開啟硬體加速的近期 Chrome／Edge 瀏覽器。錯誤：'+asError(error);el.append(title,p);document.body.append(el);console.error(error);}
