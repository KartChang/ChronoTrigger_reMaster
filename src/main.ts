import {buildLabel,renderLabel} from './runtime-info';
import {showRenderFailure} from './render-status';
import {SceneAudio} from './scene-audio';
import {takeFrameEffects,FeedbackClock} from './presentation-state';
import {ModalFocus,jumpInventorySection} from './modal-focus';
import {bindSaveImport} from './save-import';
import {equipmentPanel} from './equipment-ui';
import {trialActive,trialHint,trialChoiceLabels,trialEvidence} from './trial-rules';
import {trialMap,TRIAL_NAMES,TANK_PART_NAMES} from './trial-data';
import {interactTrial,chooseTrial,useInventory} from './core';
import {prologueMap,PROLOGUE_NAMES,prologueHint} from './prologue-data';
import {interactPrologue,choosePrologue} from './core';
import {rescueMap,nearestRescue,RESCUE_NAMES,rescueObjective,GUEST_HP,GUEST_MP} from './rescue-data';
import {InputBoundary} from './input-boundary';
import {kingdomMap,nearestKingdom,KINGDOM_NAMES} from './kingdom-data';
import {nearestFair} from './fair-data';
import type {Chapter} from './fair-data';
import {createState,shopAvailable,guestKind,interactRescue,useTonic,cycleTarget,selectedEnemy,interactKingdom,interactFair,interactOpening,activeSlot,cutsceneActive,step,beginBattle,setCoop,action,requestCombo,leaveBattle,repair,travel,serialize,deserialize,distance,MAX_HP,MAX_MP} from './core';
import type {State,Slot} from './core';
import {Controls} from './input';
import type {Command} from './input';
import {World} from './render';
import * as storage from './save';

const $=<T extends HTMLElement=HTMLElement>(id:string):T=>{const el=document.getElementById(id);if(!el)throw new Error(`Missing UI element ${id}`);return el as T;};
let state=createState('bedroom'),started=false,manualPause=false,dialogOpen=false,bagOpen=false,last=performance.now(),accumulator=0,hudTime=0,previousLog='';
let filePickerOpen=false,renderBlocked=false;
// A lost rendering context is an input boundary, not a writable hidden menu.
// Keep browser shortcuts and the fatal recovery dialog usable.
for(const event of ['click','pointerdown','keydown'])document.addEventListener(event,e=>{
 if(!renderBlocked||(e instanceof KeyboardEvent&&(e.ctrlKey||e.metaKey||e.altKey))||(e.target instanceof Element&&e.target.closest('#render-unavailable')))return;
 e.preventDefault();e.stopImmediatePropagation();
},true);
const soundtrack=new SceneAudio();
const feedbackClock=new FeedbackClock();
const modalFocus=new ModalFocus(document);
const controls=new Controls(command,{solo:()=>!state.joined,routeUi:routeKeyboardUi});
const inputBoundary=new InputBoundary(state);
function replaceState(next:State):void {
  soundtrack.reset();
  gearPanel.reset();
  state=next;controls.clear();if(started)focusWorld();inputBoundary.rebase(state);
  last=performance.now();accumulator=0;
}
const gearPanel=equipmentPanel($('equipment-panel'),()=>state,message=>{$('inventory-feedback').textContent=message;},()=>bagOpen&&!manualPause&&!document.hidden);
const halted=()=>!started||manualPause||dialogOpen||bagOpen||filePickerOpen||renderBlocked||document.hidden;
const asError=(e:unknown)=>e instanceof Error?e.message:String(e);
function announce(text:string):void{$('message').textContent=text;$('message').classList.add('show');feedbackClock.show();}
function tone(frequency=440):void{soundtrack.effect(frequency);}
function showDialog(title:string,text:string):void{dialogOpen=true;controls.clear();inputBoundary.rebase(state);$('dialog-title').textContent=title;$('dialog-text').textContent=text;$('dialog').hidden=false;const choice=!!state.prologue.choice||!!state.trial.choice;$('dialog-choices').hidden=!choice;$('dialog-close').hidden=choice;const labels=state.trial.choice?trialChoiceLabels(state):['是','不是現在'];$('choice-yes').textContent=labels[0]+' · 1';$('choice-no').textContent=labels[1]+' · 2';syncModal();(choice?$('choice-yes'):$('dialog-close')).focus();}
function focusWorld():void{$('world').focus({preventScroll:true});}
function syncModal():void{
 if(halted())soundtrack.hold();
 const id=!started?'start-screen':manualPause?'pause-screen':dialogOpen?'dialog':bagOpen?'inventory-screen':state.mode==='victory'||state.mode==='defeat'?'result':null;
 const fallback=id==='start-screen'?'start-screen':id==='pause-screen'?'resume':id==='dialog'?(state.prologue.choice||state.trial.choice?'choice-yes':'dialog-close'):id==='inventory-screen'?'inventory-close':'continue';
 const changed=modalFocus.set(id?$(id):null,id?$(fallback):null);
 document.body.dataset.modal=id??'';
 if(changed&&!id&&started&&!filePickerOpen)focusWorld();
}
function closeDialog():void{if(state.prologue.choice||state.trial.choice)return;dialogOpen=false;$('dialog').hidden=true;controls.clear();last=performance.now();accumulator=0;syncModal();}
function togglePause():void{if(!started||filePickerOpen)return;manualPause=!manualPause;controls.clear();$('pause-screen').hidden=!manualPause;last=performance.now();accumulator=0;syncModal();}
function start(coop:boolean,chapter:Chapter='lab'):void{replaceState(createState(chapter));started=true;state.joined=coop;$('start-screen').hidden=true;syncModal();focusWorld();controls.clear();last=performance.now();accumulator=0;announce(chapter==='bedroom'?'晨光照進房間。相遇之前，由克羅諾獨自行動。':coop?'雙人已啟動：P1 WASD，P2 方向鍵。':(chapter==='fair'?'WASD 移動；靠近鐘台、攤位或露卡按 E。':'WASD 移動；靠近物件按 E。也可直接點「練習戰鬥」。'));updateHud();}
function nearest(slot:Slot):'crystal'|'gate'|'save'|null{
  const p=state.players[slot];const options:[number,'crystal'|'gate'|'save'][]=[[distance(p,{x:-5,z:-1}),'crystal'],[distance(p,{x:0,z:9}),'gate'],[distance(p,{x:-8,z:-5}),'save']];options.sort((a,b)=>a[0]-b[0]);return options[0]![0]<2.05?options[0]![1]:null;
}
function interact(slot:Slot):void{
  if(cutsceneActive(state)||!activeSlot(state,slot))return;
  if(trialActive(state)){const result=interactTrial(state,slot);if(result)showDialog(result.title,result.text);else announce(trialHint(state));updateHud();return;}
  if(prologueMap(state.chapter)||(state.chapter==='fair'&&!['legacy','companions'].includes(state.prologue.stage))){const result=interactPrologue(state,slot);if(result)showDialog(result.title,result.text);updateHud();return;}
  if(rescueMap(state.chapter)){const result=interactRescue(state,slot);if(result){if(result.title==='管風琴')tone(262);showDialog(result.title,result.text);}else announce('靠近人物、物件或門口再按互動。');updateHud();return;}
  if(kingdomMap(state.chapter)){const result=interactKingdom(state,slot);if(result)showDialog(result.title,result.text);else announce(state.mode==='battle'?'請使用戰鬥指令。':'靠近人物、門口或小路盡頭，再按互動。');updateHud();return;}
  if(state.chapter==='canyon'){const result=interactOpening(state,slot);if(result)showDialog(result.title,result.text);else announce(state.opening.canyonWon?'沿山道向南走，靠近出口按 E。':'山道前方有魔物的聲音。');updateHud();return;}
  if(state.chapter==='fair'){
    if(state.mode!=='explore'){announce('請使用戰鬥指令。');return;}
    const point=nearestFair(state.players[slot].x,state.players[slot].z);
    if(point?.id==='save'){void saveGame();return;}
    const result=interactFair(state,slot);
    if(result){tone(point?.id==='bell'?660:440);showDialog(result.title,result.text);updateHud();}
    return;
  }
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
  if(filePickerOpen)return; // No gamepad/utility command may change the world behind native import.
  if(cmd==='pause'){if(bagOpen)closeBag();else togglePause();return;}
  if(bagOpen){if(cmd==='interact'&&slot===0)closeBag();return;}
  if(cmd==='join'){
    if(!started||manualPause||dialogOpen)return;
    if(!setCoop(state,!state.joined))announce('請在探索模式加入或退出 P2。');updateHud();return;
  }
  if(dialogOpen){if(cmd==='interact' && activeSlot(state,slot) && (slot===0||state.joined)){if((state.prologue.choice||state.trial.choice)&&slot===0)resolveChoice(document.activeElement?.id!=='choice-no');else closeDialog();}return;}
  if(halted()||cutsceneActive(state)||!activeSlot(state,slot)||(slot===1&&!state.joined))return;
  if(cmd==='interact'){interact(slot);return;}
  if(cmd==='targetPrevious'||cmd==='targetNext'){cycleTarget(state,slot,cmd==='targetNext'?1:-1);updateHud();return;}
  const accepted=cmd==='tonic'?useTonic(state,slot):cmd==='combo'?requestCombo(state,slot):action(state,slot,cmd);
  if(accepted)tone(cmd==='combo'?660:cmd==='skill'?520:330);
  else announce(state.mode==='battle'?'需要存活、ATB 全滿，並有足夠 MP。技能 3 MP，合技每人 4 MP。':(state.chapter==='fair'?'探索時請靠近岡薩雷斯按 E，開始 ATB 挑戰。':'探索模式不會揮砍；靠近敵人或選「練習戰鬥」進入 ATB。'));
  updateHud();
}
async function saveGame():Promise<void>{try{const raw=serialize(state);await storage.save(raw,state.chapter);announce('本機存檔完成。建議另行匯出 JSON 備份。');}catch(e){announce('存檔未完成：'+asError(e)+' 可改用「匯出」。');}}
async function loadGame():Promise<void>{if(state.mode!=='explore'||cutsceneActive(state)){announce('請先結束戰鬥。');return;}try{const raw=await storage.load(state.chapter);if(raw===null){announce('尚無本機存檔。');return;}replaceState(deserialize(raw));updateHud();announce('讀檔完成。');}catch(e){announce('讀檔未完成：'+asError(e));}}
$('start-story').onclick=()=>start(false,'bedroom');$('start-story-coop').onclick=()=>start(true,'bedroom');
$('start').onclick=()=>start(false);$('start-coop').onclick=()=>start(true);
$('start-fair').onclick=()=>start(false,'fair');$('start-fair-coop').onclick=()=>start(true,'fair');
$('pause').onclick=togglePause;$('resume').onclick=togglePause;$('dialog-close').onclick=closeDialog;
$('coop').onclick=()=>command(1,'join');$('interact').onclick=()=>command(0,'interact');
$('save').onclick=()=>{if(started&&!halted())void saveGame();};$('load').onclick=()=>{if(started&&!halted())void loadGame();};
$('trial').onclick=()=>{if(!halted()&&!cutsceneActive(state)){if(beginBattle(state))announce('練習戰鬥開始。等待 ATB 充滿。');else announce('請先完成目前戰鬥。');updateHud();}};
$('sound').onclick=()=>{soundtrack.setEnabled(!soundtrack.status().enabled);syncSoundButton();};
function syncSoundButton():void{const a=soundtrack.status();$('sound').textContent=a.error?'音訊不可用':'音訊：'+(a.enabled?'開':'關');$('sound').setAttribute('aria-pressed',String(a.enabled));}
// Only real user events may resume an opted-in AudioContext. No frame-loop resume.
document.addEventListener('pointerdown',()=>{void soundtrack.unlock();});
document.addEventListener('keydown',()=>{void soundtrack.unlock();});
window.addEventListener('pagehide',()=>soundtrack.hold());
window.addEventListener('beforeunload',()=>soundtrack.dispose());
$('export').onclick=()=>{try{if(!started||halted())return;const blob=new Blob([serialize(state)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=state.equipment?'chrono-equipment-save-v8.json':trialActive(state)?'chrono-trial-save-v7.json':state.prologue.stage!=='legacy'?'chrono-prologue-save-v6.json':state.rescue.stage!=='none'?'chrono-rescue-save-v5.json':state.kingdom.phase!=='none'?'chrono-kingdom-save-v4.json':state.opening.phase!=='none'?'chrono-opening-save-v3.json':state.chapter==='fair'?'chrono-fair-save-v2.json':'chrono-hd2d-save-v1.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('已匯出存檔。');}catch(e){announce(asError(e));}};
const saveImport=bindSaveImport($<HTMLInputElement>('save-file'),{
 canStart:()=>started&&!halted()&&!cutsceneActive(state)&&state.mode==='explore',
 busy:value=>{filePickerOpen=value;if(value)soundtrack.hold();controls.clear();inputBoundary.rebase(state);last=performance.now();accumulator=0;},
 apply:raw=>{replaceState(deserialize(raw));updateHud();},
 notice:announce,
 released:()=>{updateHud();if(started&&!halted())focusWorld();}
});
$('import').onclick=()=>{saveImport.request();};
function continueEncounter():void{if(state.mode!=='victory'&&state.mode!=='defeat')return;leaveBattle(state);$('result').hidden=true;syncModal();controls.clear();inputBoundary.rebase(state);last=performance.now();accumulator=0;focusWorld();updateHud();}
$('continue').onclick=continueEncounter;
document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button=>button.onclick=()=>command(Number(button.dataset.slot) as Slot,button.dataset.action as Command));
document.querySelectorAll<HTMLButtonElement>('[data-target-slot]').forEach(b=>b.onclick=()=>command(Number(b.dataset.targetSlot) as Slot,b.dataset.direction==='previous'?'targetPrevious':'targetNext'));
document.addEventListener('visibilitychange',()=>{if(document.hidden)soundtrack.hold();controls.clear();if(document.hidden&&started&&!filePickerOpen){manualPause=true;$('pause-screen').hidden=false;syncModal();}last=performance.now();accumulator=0;});
function updateHud():void{
  syncSoundButton();
  document.body.dataset.started=String(started);$('control-hint').textContent=state.joined?'P1 WASD／E · P2 方向鍵／Enter · H 操作':'WASD 或方向鍵移動 · E／Enter／空白鍵互動 · H 操作';document.body.dataset.adventure=String(state.chapter!=='lab');document.body.dataset.mode=state.mode;document.body.dataset.cinematic=String(cutsceneActive(state));
  $('p1').hidden=!activeSlot(state,1);
  const captions:Record<State['opening']['phase'],string>={none:'',approach:'瑪兒走上平台。',resonance:'項鍊發光了……！',lost:'瑪兒消失了。找回平台上的項鍊。',pendant:'握緊項鍊，回到左側平台，按 E 追上她。',crossing:'光芒吞沒了周遭的景色。',canyon:state.opening.canyonWon?'沿山道往南，尋找瑪兒的去向。':'陌生的山道。前方傳來魔物的聲音。',vista:'山下有一座城鎮。靠近出口，再按 E 前往托魯斯。'};
  $('story-caption').textContent=captions[state.opening.phase];$('story-caption').hidden=!started||state.opening.phase==='none'||dialogOpen;
  $('story-coop-note').hidden=!state.joined||activeSlot(state,1);

  $('era').textContent=state.era==='present'?'PRESENT · 現在':'FUTURE · 未來';$('location').textContent=state.era==='present'?'時門村落':'時門村落 · 歲月之後';
  $('coop').textContent=state.joined?'退出 P2 · C':'加入 P2 · C';($('coop') as HTMLButtonElement).disabled=state.mode!=='explore'||cutsceneActive(state);
  $('party-mode').textContent=state.joined?'LOCAL CO-OP · 雙人':'SOLO + COMPANION';$('p2-control').textContent=state.joined?'方向鍵移動 · Enter 互動':'夥伴自動跟隨／攻擊';
  const flags:[string,boolean,string][]=[['q-repair',state.flags.repaired,'修復晶核'],['q-battle',state.flags.won,'完成試煉'],['q-future',state.flags.visitedFuture,'穿越時門']];for(const[id,yes,text]of flags)$(id).textContent=(yes?'✓ ':'○ ')+text;
  $('objective').textContent=!state.flags.repaired?'前往左側晶核，按 E 修復。':!state.flags.won?'沿中央石路向北，進行 ATB 試煉。':!state.flags.visitedFuture?'靠近北方時門，按 E 前往未來。':'小型試玩目標已完成。可以往返時代、存檔或再戰。';
  state.players.forEach((p,i)=>{
    const target=selectedEnemy(state,i as Slot);$('target-name'+i).textContent=target===null?'—':(state.chapter==='fair'?'岡薩雷斯':`敵 ${target+1}`);
    document.querySelectorAll<HTMLButtonElement>(`[data-target-slot="${i}"]`).forEach(b=>b.disabled=halted()||cutsceneActive(state)||target===null||(i===1&&!state.joined));
    $('hp'+i).style.width=`${p.hp/MAX_HP*100}%`;$('hp-text'+i).textContent=`${p.hp}/${MAX_HP}`;
    $('mp'+i).textContent=`MP ${p.mp} / ${MAX_MP}`;$('atb'+i).style.width=`${p.atb*100}%`;$('atb-text'+i).textContent=state.mode==='battle'?(p.atb>=1?'READY':`${Math.floor(p.atb*100)}%`):'探索';
    document.querySelectorAll<HTMLButtonElement>(`[data-slot="${i}"]`).forEach(b=>{const cost=b.dataset.action==='skill'?3:b.dataset.action==='combo'?4:0;b.disabled=halted()||cutsceneActive(state)||!activeSlot(state,i as Slot)||(b.dataset.action==='combo'&&!activeSlot(state,1))||state.mode!=='battle'||p.hp<=0||p.atb<1||p.mp<cost||(i===1&&!state.joined);if(b.dataset.action==='tonic'){b.hidden=state.rescue.stage==='none';b.disabled ||=state.rescue.tonics<=0||p.hp>=MAX_HP;b.textContent=`回復藥 ${state.rescue.tonics}`;}b.classList.toggle('queued',b.dataset.action==='combo'&&state.combo[i]===true);});
  });
  $('combo-status').textContent=state.combo[0]||state.combo[1]?'合技準備中：等待另一名角色確認。':'合技：雙方 ATB 全滿，各需 4 MP。';
  $('battle-banner').hidden=state.mode!=='battle';$('enemy-hp').textContent=state.enemies.map((e,i)=>`敵 ${i+1} · HP ${e.hp}/90`).join('　');
  const hint=state.mode==='explore'?nearest(0):null;$('interact-hint').hidden=!hint||!started||dialogOpen;$('interact-hint').textContent=hint==='crystal'?'E · 檢查晶核':hint==='gate'?'E · 穿越時門':'E · 保存進度';
  const end=state.mode==='victory'||state.mode==='defeat';$('result').hidden=!end;$('result-title').textContent=state.mode==='victory'?'試煉完成':'這次，先回去休息';$('result-text').textContent=state.mode==='victory'?'雙人合作與 ATB 原型已完成這場試煉。\n返回村落會補滿 HP／MP，接著可以探索北方時門。':'兩名角色都倒下了。\n返回村落會補滿 HP／MP，再嘗試使用技能或合技。';
  const fair=state.chapter==='fair';
  $('trial').hidden=state.chapter!=='lab';
  $('p0-name').textContent=state.chapter!=='lab'?'克羅諾':'旅人';$('p1-name').textContent=state.kingdom.phase==='rescue'?'露卡':state.chapter!=='lab'?'瑪兒':'守望者';
  $('continue').textContent=fair?'返回廣場／補給':'返回村落／補給';
  $('scene-note').textContent=fair?'千年祭廣場試作 · 自製素材／重排配置／暫定數值':'自製測試素材 · 非原作地圖／角色／劇情';
  if(fair){
    $('era').textContent='1000 AD · MILLENNIAL FAIR';$('location').textContent='千年祭 · 鐘之廣場';
    $('objective').textContent=!state.fair.bellHeard?'逛逛廣場，靠近左側鐘台按 E。':!state.fair.luccaMet?'可向西挑戰機器人，或往北找露卡。':!state.fair.telepodTested?'露卡已準備好。靠近左側傳送圓盤按 E。':'回到露卡身旁，看看瑪兒的傳送展示。';
    const goals:[string,boolean,string][]=[['q-repair',state.fair.bellHeard,'鐘台'],['q-battle',state.fair.gatoWon,'機器人'],['q-future',state.fair.telepodTested,'傳送實驗']];
    for(const[id,yes,text]of goals)$(id).textContent=(yes?'✓ ':'○ ')+text;
    $('enemy-hp').textContent=state.enemies.length?`岡薩雷斯 · HP ${state.enemies[0]!.hp}/120 · 試作數值`:'';
    const point=state.mode==='explore'?nearestFair(state.players[0].x,state.players[0].z):undefined;
    $('interact-hint').hidden=!point||!started||dialogOpen;$('interact-hint').textContent=point?'E · '+point.label:'';
    $('result-title').textContent=state.mode==='victory'?'機器人挑戰完成':'先休息，再來挑戰';
    $('result-text').textContent='返回廣場後恢復 HP／MP。可以繼續找露卡，或保存試玩進度。';
  }
  if(state.chapter==='canyon'){
    $('era').textContent='600 AD';$('location').textContent='托魯斯山道';
    $('continue').textContent=state.mode==='victory'?'繼續前進':'重新整裝';
    $('result-title').textContent=state.mode==='victory'?'戰鬥勝利':'克羅諾倒下了';
    $('result-text').textContent=state.mode==='victory'?'山道安靜了下來。繼續尋找瑪兒。':'回到山道入口，重新嘗試。';
    $('scene-note').textContent='開場篇 · 原創素材重建／山道配置與數值尚未精確還原';
    $('enemy-hp').textContent=state.enemies.map((e,i)=>`魔物 ${i+1} · HP ${e.hp}/48`).join('　');
    $('party-mode').textContent=state.joined?'P2 暫時觀戰':'克羅諾獨自行動';
    $('combo-status').textContent='瑪兒不在隊伍中，暫時不能使用合技。';
    $('interact-hint').hidden=state.mode!=='explore'||state.players[0].z>-5.1||dialogOpen;
    $('interact-hint').textContent='E · 山道出口';
  }

  if(kingdomMap(state.chapter)){
    $('era').textContent='600 AD';$('location').textContent=KINGDOM_NAMES[state.chapter];
    const text=state.kingdom.phase==='erasing'?'瑪兒的身影……正在消失。':state.kingdom.phase==='missing'?'瑪兒消失了。回王城大廳找線索。':state.kingdom.phase==='rescue'?'與露卡一起尋找真正的王后。森林西方通往修道院。':state.chapter==='truce'?'向鎮民打聽消息，沿東南小路前往森林。':state.chapter==='forest'?'穿過森林，向北前往王城。':state.chapter==='castle'?'向衛兵說明來意，再走東侧樓梯。':'靠近房間裡的女孩，按 E。';
    $('story-caption').textContent=text;$('story-caption').hidden=!started||dialogOpen;
    $('objective').textContent=text;$('party-mode').textContent=activeSlot(state,1)?(state.joined?'克羅諾 ＋ 露卡 · 雙人':'克羅諾 ＋ 露卡'):'克羅諾獨自行動';
    const point=nearestKingdom(state.players[0].x,state.players[0].z,state.chapter,state.kingdom.phase);
    $('interact-hint').hidden=!started||dialogOpen||cutsceneActive(state)||state.mode!=='explore'||!point;
    $('interact-hint').textContent=point?'E · '+point.label:'';
    $('scene-note').textContent='王國篇 · 重建地圖／原創素材與對話／非原作精確數值';
    $('enemy-hp').textContent=state.enemies.map((e,i)=>`魔物 ${i+1} · HP ${e.hp}/48`).join('　');
    $('result-title').textContent=state.mode==='victory'?'戰鬥勝利':'重新整裝';$('result-text').textContent=state.mode==='victory'?'小路安靜下來。北方是加爾迪亞王城。':'回到森林入口，再試一次。';$('continue').textContent=state.mode==='victory'?'繼續前進':'回入口休息';
    if(!activeSlot(state,1))$('combo-status').textContent='此時只有克羅諾，無法使用合技。';
  }
  if(state.chapter==='canyon'&&state.kingdom.phase==='rescue'){$('party-mode').textContent=state.joined?'克羅諾 ＋ 露卡 · 雙人':'克羅諾 ＋ 露卡';$('combo-status').textContent='兩人同行，戰鬥仍採 ATB。';}
  const guest=guestKind(state),g=state.rescue.guest;
  $('guest-panel').hidden=!started||!guest;
  $('guest-name').textContent=guest==='frog'?'青蛙':'瑪兒';
  $('guest-stats').textContent=state.mode==='battle'?`HP ${g.hp}/${GUEST_HP} · MP ${g.mp}/${GUEST_MP} · ATB ${Math.floor(g.atb*100)}%`:'第三位同伴 · 自動跟隨';
  if(state.rescue.stage!=='none'){
    const text=rescueObjective(state.rescue);$('objective').textContent=text;$('story-caption').textContent=text;$('story-caption').hidden=!started||dialogOpen;
    $('scene-note').textContent='救援篇 · 原版對照重畫／壓縮路線／暫定戰鬥數值';
    $('party-mode').textContent=guest?(state.joined?'雙人操作 ＋ 同伴 AI':'單人 ＋ 同伴 AI'):(state.joined?'克羅諾 ＋ 露卡 · 雙人':'克羅諾 ＋ 露卡');
    if(rescueMap(state.chapter)){
      $('era').textContent='600 AD';$('location').textContent=RESCUE_NAMES[state.chapter];
      const point=nearestRescue(state.players[0].x,state.players[0].z,state.chapter,state.rescue);
      $('interact-hint').hidden=!started||dialogOpen||state.mode!=='explore'||!point;$('interact-hint').textContent=point?'E · '+point.label:'';
      $('enemy-hp').textContent=state.enemies.map((e,i)=>`${e.kind==='yakra'?'亞克拉':e.kind==='naga'?'娜迦':`守衛 ${i+1}`} · HP ${e.hp}/${e.maxHp??64}`).join('　');
      if(state.enemies[0]?.kind==='yakra'&&state.enemies[0]!.atb>.78)$('enemy-hp').textContent+=' · 正在蓄力！';
      $('result-title').textContent=state.mode==='victory'?(state.rescue.yakraWon?'亞克拉被擊敗':'戰鬥勝利'):'隊伍倒下了';
      $('result-text').textContent=state.mode==='victory'?'危險暫時解除。繼續調查與救援。':'回入口休整。未贏的戰鬥不會被標成已完成。';$('continue').textContent=state.mode==='victory'?'繼續前進':'回入口休整';
    }
    if(state.chapter==='chamber'&&state.rescue.stage==='homecoming'&&distance(state.players[0],{x:0,z:2})<1.8){$('interact-hint').hidden=dialogOpen;$('interact-hint').textContent='E · 瑪兒';}
    if(state.chapter==='canyon'&&state.rescue.stage==='reunited'&&state.players[0].z>7.4){$('interact-hint').hidden=dialogOpen;$('interact-hint').textContent='E · 啟動時門，返回 1000 年';}
  }
  if(prologueMap(state.chapter)||(state.chapter==='fair'&&!['legacy','companions'].includes(state.prologue.stage))){
    const hint=prologueHint(state.chapter,state.players[0],state.prologue);
    $('era').textContent='1000 AD';$('location').textContent=prologueMap(state.chapter)?PROLOGUE_NAMES[state.chapter]:'千年祭 · 初遇';
    $('objective').textContent=hint;$('story-caption').textContent=state.prologue.stage==='waking'?'克羅諾，起床了！今天是千年祭。':'';$('story-caption').hidden=!started||state.prologue.stage!=='waking'||dialogOpen;
    $('interact-hint').hidden=!started||dialogOpen||cutsceneActive(state);$('interact-hint').textContent=hint;
    $('party-mode').textContent=state.joined&&!activeSlot(state,1)?'P2 等待夥伴加入':activeSlot(state,1)?'克羅諾 ＋ 瑪兒':'克羅諾獨自行動';
    $('combo-status').textContent=activeSlot(state,1)?'探索中':'相遇之前沒有第二位角色。';
    $('scene-note').textContent='原作開場對照重建 · 自製素材／区域大地圖／非完整原版拓樸';
    $('q-repair').textContent=(state.prologue.motherTalked?'✓ ':'○ ')+'與母親交談';$('q-battle').textContent=(state.prologue.pendantPicked?'✓ ':'○ ')+'找回項鍊';$('q-future').textContent=(state.prologue.pendantReturned?'✓ ':'○ ')+'歸還項鍊';
  }
  if(state.chapter==='fair'&&state.prologue.stage==='companions'&&state.opening.phase==='none'&&state.kingdom.phase==='none'&&state.players[0].z<-6.2){$('interact-hint').hidden=dialogOpen;$('interact-hint').textContent='E · 離開廣場，返回大地圖';}
  $('bag').hidden=!started;document.body.dataset.inventoryItems=String(trialActive(state));
  if(shopAvailable(state)&&!dialogOpen){$('interact-hint').hidden=!started;$('interact-hint').textContent='E · 梅爾基歐　I · 裝備買賣';}
  if(state.rescue.stage==='returned'&&!trialActive(state)&&state.players[0].z<-6.2){$('interact-hint').hidden=dialogOpen;$('interact-hint').textContent='E · 離開廣場，護送瑪兒回王城';}
  if(trialActive(state)){
    const t=state.trial,hint=trialHint(state);
    $('era').textContent=t.stage==='future'?'2300 AD':'1000 AD';$('location').textContent=trialMap(state.chapter)?TRIAL_NAMES[state.chapter]:'托魯斯周邊 · 大地圖';
    $('objective').textContent=hint;$('story-caption').hidden=true;$('scene-note').textContent='審判與越獄 · 原版參考重建／部分證詞、地圖拓樸與數值待補';
    $('interact-hint').hidden=!started||dialogOpen||bagOpen||cutsceneActive(state)||state.mode!=='explore';$('interact-hint').textContent=hint;
    $('p1-name').textContent='露卡';$('party-mode').textContent=t.luccaJoined?(state.joined?'克羅諾 ＋ 露卡 · 雙人':'克羅諾 ＋ 露卡'):t.stage==='escort'?'護送瑪兒 · P2 等待露卡歸隊':'克羅諾獨自行動 · P2 設定保留';
    $('story-coop-note').hidden=!state.joined||activeSlot(state,1);$('story-coop-note').textContent='P2 等待中 · 露卡再次加入時恢復控制。';
    const name=(kind:string|undefined,i:number)=>kind&&kind in TANK_PART_NAMES?TANK_PART_NAMES[kind as keyof typeof TANK_PART_NAMES]:`衛兵 ${i+1}`;
    $('enemy-hp').textContent=state.enemies.map((e,i)=>`${name(e.kind,i)} · HP ${e.hp}/${e.maxHp??60}`).join('　');
    for(const i of [0,1] as const){const target=selectedEnemy(state,i);$('target-name'+i).textContent=target===null?'—':name(state.enemies[target]?.kind,target);}
    $('continue').textContent=state.mode==='victory'?'繼續前進':'回入口休整';$('result-title').textContent=state.mode==='victory'?(t.tankWon?'龍戰車被摧毀':'戰鬥勝利'):'克羅諾一行倒下了';
    $('result-text').textContent=state.mode==='victory'?`前方的通路已打開。本篇累積經驗 ${t.experience}。`:'回到本區入口休整。敗北不會完成戰鬥，也不會補回已使用的物品。';
    $('q-repair').textContent=(t.question===3?'✓ ':'○ ')+'法庭質問';$('q-battle').textContent=(t.tankWon?'✓ ':'○ ')+'龍戰車';$('q-future').textContent=(t.stage==='future'?'✓ ':'○ ')+'逃入時門';
    $('jury-status').hidden=state.chapter!=='courtroom'||t.question<3;
    $('jury-status').textContent=trialEvidence(state).jurors.map((v,i)=>`${i+1}：${v==='unknown'?'未記錄':v==='guilty'?'有罪':'無罪'}`).join('　');
  }else $('jury-status').hidden=true;
  if(!trialActive(state))$('story-coop-note').textContent=state.prologue.stage!=='legacy'&&!['companions'].includes(state.prologue.stage)?'P2 等待中 · 初遇之前，克羅諾獨自行動。':'P2 觀戰中 · 瑪兒暫時離隊，保留劇情順序。';
  const transition=state.prologue.transition;document.body.dataset.mapKind=state.chapter==='overworld1000'?'overworld':(prologueMap(state.chapter)||(trialMap(state.chapter)&&!['guardia1000','prisonbridge'].includes(state.chapter)))?'interior':'field';
  $('map-fade').style.opacity=transition?String(transition.elapsed<.22?transition.elapsed/.22:Math.max(0,1-(transition.elapsed-.22)/.26)):'0';
  if(state.trial.fade>0)$('map-fade').style.opacity=String(state.trial.fade/.32);$('map-fade').hidden=!transition&&state.trial.fade<=0;
  const earlyMeeting=state.chapter==='fair'&&!['legacy','companions'].includes(state.prologue.stage);
  document.body.dataset.earlyMeeting=String(earlyMeeting);
  const cue=earlyMeeting&&!cutsceneActive(state)&&state.mode==='explore'?prologueHint(state.chapter,state.players[0],state.prologue):'';
  $('interact-label').textContent=cue.startsWith('E · ')?cue.slice(4):'互動';
  $('interact').setAttribute('aria-label',(cue.startsWith('E · ')?cue.slice(4):'互動')+(state.joined?'，E':'，E 或 Enter'));
  syncModal();layoutFeedback();
  const message=state.log[state.log.length-1]??'';if(started&&message!==previousLog){previousLog=message;announce(message);}
}
try{
  const world=new World($<HTMLCanvasElement>('world'));
  const renderStatus=$('render-state');
  const contextHold=(blocked:boolean)=>{
    renderBlocked=blocked;controls.clear();inputBoundary.rebase(state);accumulator=0;last=performance.now();
    if(blocked)soundtrack.hold();
    renderStatus.hidden=!blocked;renderStatus.textContent=blocked?'畫面暫時中斷，遊戲與音訊已暫停。瀏覽器正在嘗試恢復；尚未覆寫存檔。':'';
  };
  world.engine.onContextLostObservable.add(()=>contextHold(true));
  world.engine.onContextRestoredObservable.add(()=>{world.resize();contextHold(false);});
  const quality=$<HTMLSelectElement>('render-quality');quality.onchange=()=>world.setRenderMode(quality.value);
  world.draw(state,0,false);
  $<HTMLButtonElement>('start').disabled=false;$<HTMLButtonElement>('start-coop').disabled=false;$('start').textContent='技術村落 · 單人';
  $<HTMLButtonElement>('start-story').disabled=false;$<HTMLButtonElement>('start-story-coop').disabled=false;
  $<HTMLButtonElement>('start-fair').disabled=false;$<HTMLButtonElement>('start-fair-coop').disabled=false;updateHud();
  $('build-info').textContent=buildLabel();
  let frame=0;

  world.start(()=>{
    const now=performance.now(),frameMs=now-last,dt=Math.min(frameMs/1000,.1);last=now;
    // Poll controller edges even while manually paused, so Start can resume. Movement is gated below.
    const input=renderBlocked?null:controls.poll();
    if(!halted()&&input){
      accumulator+=dt;
      while(accumulator>=1/60){
        step(state,input,1/60);accumulator-=1/60;
        if(inputBoundary.consume(state)){
          controls.clear();accumulator=0;updateHud();break;
        }
      }
    }else accumulator=0;
    const running=!halted();
    world.observeRenderFrame(frameMs,running);
    soundtrack.update(state,!running);
    world.draw(state,dt,running||!started,takeFrameEffects(state,running));
    hudTime+=dt;if(hudTime>.08){updateHud();hudTime=0;}
    if(!feedbackClock.advance(dt,halted()))$('message').classList.remove('show');
    if(frame++%30===0){const label=renderLabel(world.inspectRenderer());$('fps').textContent=label.text;$('fps').title=label.title;}
  });
  const win=window as unknown as {__CHRONO_TEST__?:{snapshot:()=>State;paused:()=>boolean;view:()=>ReturnType<World['inspect']>;audio:()=>ReturnType<typeof soundtrack.inspect>;importStatus:()=>ReturnType<typeof saveImport.inspect>}};
  if(new URLSearchParams(location.search).get('test')==='1'||document.documentElement.dataset.test==='1')win.__CHRONO_TEST__={snapshot:()=>structuredClone(state),paused:halted,view:()=>world.inspect(),audio:()=>soundtrack.inspect(),importStatus:()=>saveImport.inspect()};
}catch(error){renderBlocked=true;soundtrack.hold();controls.clear();const panel=showRenderFailure(document,error);modalFocus.set(panel,$('render-reload'));console.error(error);}

function resolveChoice(yes:boolean):void{
 if(!dialogOpen||(!state.prologue.choice&&!state.trial.choice)||manualPause||document.hidden)return;
 const result=state.trial.choice?chooseTrial(state,yes):choosePrologue(state,yes);controls.clear();inputBoundary.rebase(state);
 if(result)showDialog(result.title,result.text);else closeDialog();updateHud();
}
$('choice-yes').onclick=()=>resolveChoice(true);$('choice-no').onclick=()=>resolveChoice(false);
/** Measure presentation only: wrapped exploration text and battle panels must clear feedback. */
function layoutFeedback():void{
 if(!started)return;
 if(state.mode==='explore'){
  const dock=$('exploration-dock').getBoundingClientRect();
  document.documentElement.style.setProperty('--exploration-clearance',Math.ceil(window.innerHeight-dock.top+12)+'px');
  return;
 }
 if(state.mode!=='battle')return;
 const box=$('party').getBoundingClientRect();
 document.documentElement.style.setProperty('--party-clearance',Math.ceil(window.innerHeight-box.top+12)+'px');
}
new ResizeObserver(layoutFeedback).observe($('party'));
new ResizeObserver(layoutFeedback).observe($('exploration-dock'));window.addEventListener('resize',layoutFeedback);

function openBag():void{
 if(!started||halted()||cutsceneActive(state)||(state.mode!=='explore'&&state.mode!=='battle'))return;
 bagOpen=true;controls.clear();inputBoundary.rebase(state);$('inventory-screen').hidden=false;$('inventory-feedback').textContent='';refreshBag();syncModal();$('inventory-close').focus();
}
function closeBag():void{bagOpen=false;$('inventory-screen').hidden=true;controls.clear();last=performance.now();accumulator=0;syncModal();updateHud();}
function refreshBag():void{
 gearPanel.refresh();
 $('inventory-items-section').hidden=!trialActive(state);
 $('inventory-jump-items').hidden=!trialActive(state);
 $('inventory-stock').hidden=!trialActive(state);$('inventory-actors').hidden=!trialActive(state);
 $('inventory-stock').textContent=`回復藥 ${state.rescue.tonics}　乙太 ${state.trial.ethers}　｜　本篇經驗 ${state.trial.experience}`;
 document.querySelectorAll<HTMLButtonElement>('[data-bag-item]').forEach(b=>{
  const slot=Number(b.dataset.bagSlot) as Slot,p=state.players[slot],tonic=b.dataset.bagItem==='tonic';
  b.disabled=!activeSlot(state,slot)||p.hp<=0||(state.mode==='battle'&&(p.atb<1||(slot===1&&!state.joined)))||(tonic?(state.rescue.tonics<=0||p.hp>=MAX_HP):(state.trial.ethers<=0||p.mp>=MAX_MP));
 });
 $('inventory-actors').textContent=state.players.filter((_,i)=>activeSlot(state,i as Slot)).map((p,i)=>`${i===0?'克羅諾':'露卡'}：HP ${p.hp}/${MAX_HP} · MP ${p.mp}/${MAX_MP}`).join('　');
}
$('bag').onclick=openBag;$('inventory-close').onclick=closeBag;
document.querySelectorAll<HTMLButtonElement>('[data-bag-item]').forEach(b=>b.onclick=()=>{
 if(!bagOpen||manualPause||document.hidden)return;
 const slot=Number(b.dataset.bagSlot) as Slot;
 if(useInventory(state,b.dataset.bagItem==='ether'?'ether':'tonic',slot)){$('inventory-feedback').textContent=state.log.at(-1)??'';tone(620);}
 refreshBag();updateHud();
});


/** UI confirmation is independent of temporary P2 story availability, never of world movement ownership. */
function routeKeyboardUi(code:string,repeat:boolean):boolean|'native'{
 if(filePickerOpen)return 'native'; // The OS picker owns keys; do not synthesize a game action.
 const confirm=['KeyE','Enter','Space'].includes(code),left=['ArrowLeft','KeyA','ArrowUp','KeyW'].includes(code),right=['ArrowRight','KeyD','ArrowDown','KeyS'].includes(code);
 const navigate=(root:string)=>{
  const buttons=[...$(root).querySelectorAll<HTMLButtonElement>('button')].filter(b=>!b.disabled&&!b.hidden&&b.getClientRects().length>0);
  if(!buttons.length)return;const at=buttons.indexOf(document.activeElement as HTMLButtonElement);buttons[at<0?(left?buttons.length-1:0):(at+(left?-1:1)+buttons.length)%buttons.length]!.focus();
 };
 const activate=(fallback:string)=>{const el=document.activeElement;const b=el instanceof HTMLButtonElement&&!el.disabled&&!el.hidden&&el.getClientRects().length>0?el:$(fallback);b.click();};
 if(!started){
  if(left||right||confirm){if(!repeat){if(left||right)navigate('start-screen');else activate('start-story');}return true;}return false;
 }
 if(manualPause){if(['Escape','Enter','Space','KeyE'].includes(code)&&!repeat)togglePause();return code!=='Tab';}
 if(dialogOpen){
  if(!repeat){
   if(state.prologue.choice||state.trial.choice){if(left||right)navigate('dialog-choices');else if(code==='Digit1'||code==='Digit2')resolveChoice(code==='Digit1');else if(confirm)resolveChoice(document.activeElement?.id!=='choice-no');}
   else if(confirm||code==='Escape')closeDialog();
  }return code!=='Tab';
 }
 if(bagOpen){
  if(!repeat){if(['KeyI','KeyE','Escape'].includes(code))closeBag();else if(left||right)navigate('inventory-screen');else if((code==='Enter'||code==='Space')&&document.activeElement instanceof HTMLButtonElement)activate('inventory-close');}
  return code!=='Tab';
 }
 if(state.mode==='victory'||state.mode==='defeat'){if(confirm&&!repeat)continueEncounter();return code!=='Tab'&&code!=='Escape';}
 if((code==='Enter'||code==='Space')&&document.activeElement instanceof HTMLButtonElement&&document.activeElement.closest('.utility,header'))return repeat?true:'native';
 if(code==='KeyI'){if(!repeat)openBag();return true;}
 if(code==='KeyH'){if(!repeat&&!cutsceneActive(state))showControls();return true;}
 return false;
}
function showControls():void{if(!started||halted()||cutsceneActive(state))return;showDialog('操作說明',
 '單人：WASD 或方向鍵移動；E、Enter 或空白鍵互動。\n雙人：P1 WASD／E／J K L；P2 方向鍵／Enter／, . /。Q R 與 [ ] 分別選敵。\n對話／結果：E、Enter 或空白鍵繼續；選項可用方向鍵＋Enter，或 1／2。\nI 背包／角色裝備；靠近梅爾基歐可買賣。H 操作，Esc 暫停。切回頁面後按 Esc 或 Enter 恢復；需要時點一下遊戲畫面。\n劇情離隊期間，雙人模式的 P2 會暫時觀戰，不會接管 P1。');}
$('help').onclick=showControls;
$('display').onclick=()=>{const guide=document.body.dataset.hud!=='guide';document.body.dataset.hud=guide?'guide':'quiet';$('display').setAttribute('aria-pressed',String(guide));focusWorld();};
// Restore world focus after ordinary native utility clicks, but never steal focus from a chooser/modal.
document.querySelector('.utility')?.addEventListener('click',()=>{if(started&&!halted())focusWorld();});
$('world').addEventListener('pointerdown',()=>{if(started&&!dialogOpen&&!bagOpen)focusWorld();});

// In-panel shortcuts move only focus/scroll; they never select a purchase or consume an item.
for(const [button,target] of [['inventory-jump-items','inventory-items-section'],['inventory-jump-equipment','equipment-panel'],['inventory-jump-shop','equipment-shop']])$(button!).onclick=()=>{
 if(bagOpen&&!manualPause&&!document.hidden)jumpInventorySection($('inventory-content'),target!);
};
