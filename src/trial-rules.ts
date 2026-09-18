import {equipmentBonuses} from './equipment';
import {newHearing,witnessEvidence,jailGift,hearingChoice,hearingDialog,restoreHearing} from './trial-hearing';
import type {Actor,Enemy,Slot,State,Vec} from './core';
import {newFollowPlan} from './navigation';
import {newTrial,trialMap,trialWalkable,trialStageAllows,TRIAL_NAMES,WORLD_GUARDIA,TANK_PARTS} from './trial-data';
import type {Trial,TrialMap} from './trial-data';
import {prologueWalkable,WORLD_FAIR} from './prologue-data';
export type TrialDialog={title:string;text:string};
const dist=(a:Vec,b:Vec)=>Math.hypot(a.x-b.x,a.z-b.z);
const log=(s:State,text:string)=>{s.log.push(text);if(s.log.length>5)s.log.shift();};
export const trialActive=(s:State)=>s.trial.stage!=='none';
export const trialP2=(s:State)=>s.trial.luccaJoined;
export const trialGuest=(s:State)=>s.trial.stage==='escort'||s.trial.marleJoined;
export function trialMoveAllowed(s:State,_x:number,z:number):boolean{return !(s.chapter==='cellblock'&&s.trial.stage==='cell'&&!s.trial.cellOpen&&z>-.9);}
function together(s:State):boolean{return !s.joined||!trialP2(s)||dist(s.players[0],s.players[1])<=3.5;}
export function enterTrialMap(s:State,chapter:TrialMap|'overworld1000',x:number,z:number):void{
 s.chapter=chapter;s.era=chapter==='futuregate'?'future':'present';s.mode='explore';s.enemies=[];s.effects=[];s.targets=[null,null];s.combo=[false,false];s.followPlan=newFollowPlan();s.rescue.guestPlan=newFollowPlan();
 s.players.forEach((p,i)=>Object.assign(p,{x:x+i*.8,z,walking:false,atb:0,facing:2}));
 Object.assign(s.rescue.guest,{x:x-.8,z,atb:0,walking:false,facing:2});s.trial.fade=.32;
}
/** history is the genuine serialized returned checkpoint, captured before any new chapter mutation. */
export function startTrial(s:State,history:string):TrialDialog|null{
 if(s.trial.stage!=='none'||s.rescue.stage!=='returned'||s.chapter!=='fair'||s.mode!=='explore'||dist(s.players[0],{x:0,z:-7.7})>1.5||!together(s))return null;
 s.trial=newTrial();s.trial.hearing=s.prologue.conduct?newHearing():null;s.trial.history=history;s.trial.stage='escort';enterTrialMap(s,'overworld1000',WORLD_FAIR.x,WORLD_FAIR.z-1.6);
 return {title:'送瑪兒回王城',text:'露卡先回去整理時門裝置。瑪兒希望你陪她回家。\n沿大地圖往西北，穿過加爾迪亞森林。P2 設定保留，露卡再次加入時恢復操作。'};
}
export function trialHint(s:State):string{
 const t=s.trial,p=s.players[0];const near=(x:number,z:number)=>dist(p,{x,z})<1.7;
 switch(s.chapter){
 case 'overworld1000':return near(WORLD_GUARDIA.x,WORLD_GUARDIA.z)?'加爾迪亞森林 · E 進入':'向西北走，靠近森林入口再按 E。';
 case 'guardia1000':return t.stage==='flight'?'向東北的光芒走，與同伴一起調查時門。':'沿林間小路向北，護送瑪兒回王城。';
 case 'hall1000':return t.stage==='flight'?(t.marleJoined?'由南方城門逃往森林。':'瑪兒就在大廳中央。'):'前方的衛兵攔住了去路。';
 case 'courtroom':return t.question<2?'E · 回答大臣的質問':t.question===2?'E · 聽取證詞與裁決':'E · 接受拘禁，進入獨房';
 case 'cellblock':if(jailGift(s)>0&&!t.hearing?.giftTaken)return '床鋪對面的包裹，是有人送來的物資。靠近按 E。';return !t.cellOpen?'南側獨房：床鋪可等待；中央鐵門可敲擊；左邊水碗可恢復。':'鐵門已開，向北穿過走廊；東側小門通往處刑室。';
 case 'execution':return '靠近受困的弗里茲，檢查斷頭台。南門回獨房走廊。';
 case 'prisonstairs':return t.guardsWon?'向北登上階梯，前往看守室。':'衛兵守住階梯。通過此處才能登上吊橋。';
 case 'warden':return '看守桌上有戰車說明，西側有補給箱；北門通往吊橋。';
 case 'prisonbridge':return t.tankWon?'沿吊橋向西穿過缺口，回到王城。':'龍戰車擋住吊橋。頭部會修復其他部位，先選擇攻擊部位。';
 case 'futuregate':return '破損的穹頂下，時門逐漸平息。這裡是 2300 年；可保存旅程。';
 default:return '';
 }
}
export function trialChoiceLabels(s:State):[string,string]{switch(s.trial.choice){case 'theft':return ['承認吃過','否認'];case 'wealth-confirm':return ['一點也沒有','有一點'];case 'collision':return ['是我撞到她','是她撞到我'];case 'wealth':return ['曾動過念頭','沒有'];case 'wait':return ['在床上等到隔天','先不等'];default:return ['是','否'];}}
/** Unrecorded fair witnesses are explicitly absent, not retroactively invented.
 * Exact seven-juror ROM logic remains unverified; these are transparent reconstruction rules. */
export function trialEvidence(s:State):{jurors:('guilty'|'not-guilty'|'unknown')[];lines:string[]}{
 if(s.trial.hearing)return witnessEvidence(s);
 const p=s.prologue,t=s.trial;
 const first=p.first==='unknown'?'unknown':p.first==='pendant'?'guilty':'not-guilty';
 const jurors:('guilty'|'not-guilty'|'unknown')[]=['unknown','unknown','unknown',t.wealthMotive?'guilty':first,t.wealthMotive===null?'unknown':t.wealthMotive?'guilty':'not-guilty','unknown',t.blamedMarle===null?'unknown':t.blamedMarle?'guilty':'not-guilty'];
 const lines=[p.first==='unknown'?'項鍊證詞：此存檔未記錄初遇先後，不採作證據。':p.first==='pendant'?'項鍊證詞：先拾起項鍊，之後才關心跌倒的女孩。':'項鍊證詞：先關心跌倒的女孩，之後才拾起項鍊。',
 p.stage==='legacy'?'歸還項鍊：舊存檔未記錄。':p.pendantReturned?'項鍊已歸還給瑪兒。':'項鍊尚未歸還。',
 '尋貓、午餐、販賣項鍊與糖果等證詞尚未完整記錄，不捏造證人。',
 `當庭回答：${t.blamedMarle===null?'未答':t.blamedMarle?'認為瑪兒先撞上自己':'承認自己先撞到瑪兒'}；${t.wealthMotive===null?'未答':t.wealthMotive?'承認曾受財富吸引':'否認財富動機'}。`];
 return {jurors,lines};
}
export function chooseTrial(s:State,yes:boolean):TrialDialog|null{
 const t=s.trial;if(!t.choice||s.mode!=='explore'||t.fade>0)return null;
 const enhanced=hearingChoice(s,yes);if(enhanced)return enhanced;
 const choice=t.choice;t.choice=null;
 if(choice==='collision'&&s.chapter==='courtroom'&&t.question===0){t.blamedMarle=!yes;t.question=1;return {title:'王國法庭',text:'法庭記下了你的回答。大臣繼續詢問你接近公主的動機。'};}
 if(choice==='wealth'&&s.chapter==='courtroom'&&t.question===1){t.wealthMotive=yes;t.question=2;return {title:'王國法庭',text:'接下來核對祭典上的證詞。沒有記錄的行為，不會替你補成既定事實。'};}
 if(choice==='wait'&&s.chapter==='cellblock'&&t.stage==='cell'){
  if(!yes)return {title:'獨房',text:'你站起身，查看鐵門與走廊。'};
  t.days++;s.players[0].hp=120;s.players[0].mp=18;
  if(t.days>=3){t.route='wait';t.cellOpen=true;t.stage='escape';t.luccaJoined=true;enterTrialMap(s,'execution',0,-3);return {title:'露卡的救援',text:'衛兵把你帶到處刑室。槍聲突然響起，露卡及時制止了處刑。\n露卡重新加入；一起尋找逃出刑務所的路。'};}
  t.fade=.32;return {title:`獨房 · 第 ${t.days} 天`,text:'時間在石牆間流逝。走廊裡傳來衛兵的腳步。還可以繼續等待，或設法打開鐵門。'};
 }
 return null;
}
export function interactTrial(s:State,slot:Slot):TrialDialog|null{
 const t=s.trial;if(!trialActive(s)||s.mode!=='explore'||t.fade>0||t.choice||slot!==0)return null;
 const p=s.players[0],near=(x:number,z:number,r=1.65)=>dist(p,{x,z})<r;
 const go=(map:TrialMap|'overworld1000',x:number,z:number,text:string):TrialDialog=>{
  if(!together(s))return {title:'等待同行者',text:'一起靠近出口再前進。'};
  enterTrialMap(s,map,x,z);return {title:map==='overworld1000'?'托魯斯周邊':TRIAL_NAMES[map],text};
 };
 if(s.chapter==='overworld1000'&&near(WORLD_GUARDIA.x,WORLD_GUARDIA.z,1.25))return go('guardia1000',0,-5.6,'離開縮尺大地圖，進入林間小路。王城在北方。');
 if(s.chapter==='guardia1000'){
  if(t.stage==='escort'&&near(0,6))return go('hall1000',0,-5.3,'瑪兒走進了熟悉的王城，衛兵卻突然圍住你。');
  if(t.stage==='escort'&&near(0,-6))return go('overworld1000',WORLD_GUARDIA.x,WORLD_GUARDIA.z-1.3,'回到大地圖。');
  if(t.stage==='flight'&&t.marleJoined&&near(5.5,4,1.6)){
   if(!together(s))return {title:'時門',text:'露卡還沒跟上，一起靠近時門。'};
   t.stage='future';enterTrialMap(s,'futuregate',0,-3.5);return {title:'陌生的穹頂',text:'追兵被拋在光芒之外。你們跌進一座破舊的建築，四周只剩冰冷的金屬與塵土。\n牆上的年代標記：2300 年。'};
  }
 }
 if(s.chapter==='hall1000'){
  if(t.stage==='escort'&&near(0,0)){t.stage='court';enterTrialMap(s,'courtroom',0,-2);return {title:'被捕',text:'大臣指控你綁架公主。瑪兒出聲反對，仍無法阻止衛兵把你帶往法庭。\n克羅諾必須獨自面對質問。'};}
  if(t.stage==='flight'&&!t.marleJoined&&near(0,1)){t.marleJoined=true;Object.assign(s.rescue.guest,{x:-.8,z:0,hp:140,mp:16});return {title:'瑪兒',text:'瑪兒擋住衛兵，堅持和你們一起離開。\n克羅諾與露卡仍由 P1、P2 操作；瑪兒是自主同伴。南門通往森林。'};}
  if(t.stage==='flight'&&t.marleJoined&&near(0,-6))return go('guardia1000',0,5.3,'衛兵追出城門。林間東北方出現了熟悉的光芒。');
 }
 if(s.chapter==='courtroom'&&near(0,-1,2.4)){
  const enhanced=hearingDialog(s);if(enhanced)return enhanced;
  if(t.question===0){t.choice='collision';return {title:'大臣的質問',text:'祭典上，是誰先撞到對方？'};}
  if(t.question===1){t.choice='wealth';return {title:'大臣的質問',text:'公主的財富，是否曾讓你動過念頭？'};}
  if(t.question===2){const e=trialEvidence(s);t.verdict=e.jurors.filter(x=>x==='guilty').length>=4?'guilty':'not-guilty';t.question=3;
   return {title:'裁決',text:e.lines.join('\n')+`\n\n${t.verdict==='guilty'?'有罪':'綁架罪證據不足'}。法庭仍裁定拘禁三日。\n大臣卻另外命令刑務所準備處刑。`};}
  if(t.question===3){t.stage='cell';enterTrialMap(s,'cellblock',0,-4);return {title:'空中刑務所',text:'鐵門在身後關上。牢房裡有床鋪與水碗。\n可以等待三天，也可以反覆敲門，尋找逃走的機會。'};}
 }
 if(s.chapter==='cellblock'){
  if(near(3,-4)&&jailGift(s)>0){if(t.hearing!.giftTaken)return {title:'空包裹',text:'物資已經收下，包裹不會重複出現。'};const n=jailGift(s);t.hearing!.giftTaken=true;t.ethers+=n;return {title:'支持者的物資',text:`收下乙太 ×${n}。有人相信你的清白，把這些東西送到牢房。`};}
  if(t.stage==='cell'&&near(0,-1.3)){t.knocks=Math.min(3,t.knocks+1);if(t.knocks===3){t.route='breakout';beginTrialBattle(s,'cellguards');return {title:'鐵門打開了',text:'衛兵被敲門聲激怒，打開鐵門。趁機擊退他們，戰鬥仍採 ATB。'};}return {title:'衛兵',text:t.knocks===1?'安靜！別再敲門。':'再吵，就讓你吃點苦頭。'};}
  if(t.stage==='cell'&&near(-3.2,-4)){t.choice='wait';return {title:'獨房的床鋪',text:'躺下休息，等到隔天？這段等待會推進一個牢房日。'};}
  if(near(-3.4,-1.7)){s.players[0].hp=120;s.players[0].mp=18;return {title:'水碗',text:'清水讓你恢復精神與體力。'};}
  if(t.cellOpen&&near(6,2.5))return go('execution',0,-5.2,'處刑室裡有人被困在斷頭台上。');
  if(t.cellOpen&&near(0,6))return go('prisonstairs',0,-5.5,'狹窄的階梯通向另一座塔。');
 }
 if(s.chapter==='execution'){
  if(near(2.1,2)){if(t.fritzFreed)return {title:'弗里茲',text:'謝謝你！我會回托魯斯父親的店裡。'};t.fritzFreed=true;return {title:'救出弗里茲',text:'你鬆開斷頭台的束縛。弗里茲終於能站起來，答應回托魯斯與父親團聚。'};}
  if(near(0,-6))return go('cellblock',4.8,2.5,'回到獨房走廊。');
 }
 if(s.chapter==='prisonstairs'){
  if(near(0,-6))return go('cellblock',0,4.6,'沿階梯返回獨房走廊。');
  if(near(0,6)){
   if(!t.guardsWon)return {title:'階梯守衛',text:'衛兵還擋在階梯中央。'};
   if(!together(s))return {title:'等待同行者',text:'一起靠近樓梯出口。'};
   const joining=!t.luccaJoined;t.luccaJoined=true;t.stage=t.tankWon?'flight':'tank';
   enterTrialMap(s,'warden',0,-5.2);return {title:joining?'露卡趕到了':'看守室',text:joining?'露卡找到你的蹤跡，趕來一起逃出刑務所。\nP2 恢復控制露卡。桌上放著戰車的說明書。':'守衛留下了戰車的說明書，旁邊有一個補給箱。'};
  }
 }
 if(s.chapter==='warden'){
  if(near(2.1,2)){t.manualRead=true;return {title:'龍戰車說明書',text:'頭部會修復戰車其他部位。頭部的護盾能抵擋火焰與雷電。\n先破壞頭部，再處理車體與車輪；兩位玩家可以獨立選擇目標。'};}
  if(near(-4,2)){if(t.suppliesTaken)return {title:'補給箱',text:'箱子已經空了。'};t.suppliesTaken=true;t.ethers+=2;s.rescue.tonics+=2;return {title:'補給箱',text:'取得回復藥 ×2、乙太 ×2。背包可以選擇使用對象；戰鬥使用消耗該角色的 ATB。'};}
  if(near(0,-6))return go('prisonstairs',0,4.8,'返回階梯塔。');
  if(near(0,6))return go('prisonbridge',5,0,'吊橋懸在深谷上方。沉重的機械聲從另一側傳來。');
 }
 if(s.chapter==='prisonbridge'&&t.tankWon&&near(-6.5,0))return go('hall1000',0,4.5,'戰車殘骸落下，通路重新出現。沿塔樓回到王城大廳。');
 if(s.chapter==='futuregate')return {title:'班哥巨蛋 · 2300 年',text:'瑪兒難以相信眼前的景象。露卡檢查時門鑰匙，確認大家都平安。\n此處保存審判與越獄進度；巨蛋外的未來世界仍待下一段接續。'};
 return null;
}
export function tickTrial(s:State,dt:number):boolean{
 if(s.trial.fade>0){s.trial.fade=Math.max(0,s.trial.fade-dt);s.players.forEach(p=>p.walking=false);return true;}
 return false;
}
export function trialTriggers(s:State):void{
 if(s.mode!=='explore')return;
 if(s.chapter==='prisonstairs'&&!s.trial.guardsWon&&s.players[0].z>-.6)beginTrialBattle(s,'stairguards');
 if(s.chapter==='prisonbridge'&&!s.trial.tankWon&&s.players[0].x<3.8)beginTrialBattle(s,'tank');
}
export function beginTrialBattle(s:State,encounter:Exclude<Trial['encounter'],'none'>):boolean{
 if(!trialActive(s)||s.mode!=='explore'||s.trial.fade>0)return false;
 if(encounter==='cellguards'&&(s.chapter!=='cellblock'||s.trial.knocks!==3||s.trial.cellOpen))return false;
 if(encounter==='stairguards'&&(s.chapter!=='prisonstairs'||s.trial.guardsWon))return false;
 if(encounter==='tank'&&(s.chapter!=='prisonbridge'||s.trial.tankWon||!s.trial.guardsWon||!s.trial.luccaJoined))return false;
 s.trial.encounter=encounter;s.mode='battle';s.combo=[false,false];s.targets=[null,null];s.followPlan=newFollowPlan();
 const z=encounter==='cellguards'?-3:-2.2;s.players.forEach((p,i)=>Object.assign(p,{x:i===0?-1:1,z,atb:0,walking:false,facing:2}));
 if(encounter==='tank')s.players.forEach((p,i)=>Object.assign(p,{x:3.7+i*1.1,z:i?.6:-.6,facing:3}));
 s.enemies=encounter==='tank'?TANK_PARTS.map(e=>({...e,maxHp:e.hp,atb:0})):[-1.4,1.4].map(x=>({x,z:encounter==='cellguards'?-1.6:1.5,hp:60,maxHp:60,atb:0,kind:'prisonGuard' as const}));
 log(s,encounter==='tank'?'龍戰車啟動。頭部開始運轉，準備修復車體。':'衛兵拔出武器。等待 ATB，選擇攻擊。');return true;
}
export function trialDamage(s:State,e:Enemy,amount:number,fire:boolean):number{
 if(s.trial.encounter==='tank'&&e.kind==='tankHead'&&fire){log(s,'頭部護盾擋住了火焰。改用物理攻擊！');return 0;}
 return amount;
}
export function tickTrialEnemies(s:State,dt:number):void{
 const alive=()=>s.players.filter((p,i)=>p.hp>0&&(i===0||trialP2(s)));
 for(const e of s.enemies){
  if(e.hp<=0)continue;e.atb+=dt*(e.kind==='tankHead'?.18:.14);if(e.atb<1)continue;e.atb=0;
  if(e.kind==='tankHead'){
   let healed=false;for(const target of s.enemies){if(target!==e&&target.hp>0&&target.hp<(target.maxHp??target.hp)){const amount=Math.min(35,target.maxHp!-target.hp);target.hp+=amount;healed=true;s.effects.push({x:target.x,z:target.z,text:`+${amount}`,kind:'heal'});}}
   if(healed){s.trial.headRepairs++;log(s,'龍戰車頭部修復了受損部位。');}continue;
  }
  const allies=alive();if(!allies.length)return;
  const targets=e.kind==='tankWheel'?allies:[allies[s.enemyTurn++%allies.length]!];
  for(const a of targets){const base=e.kind==='tankBody'?16:e.kind==='tankWheel'?10:7,n=Math.max(1,base-equipmentBonuses(s.equipment,s.players.indexOf(a)===0?'crono':'lucca').defense);a.hp=Math.max(0,a.hp-n);s.effects.push({x:a.x,z:a.z,text:`−${n}`,kind:'hit'});if(a.hp===0){a.atb=0;s.combo[s.players.indexOf(a) as Slot]=false;}}
 }
}
export function finishTrialBattle(s:State):void{
 if(s.mode!=='battle'||!s.enemies.every(e=>e.hp<=0))return;
 s.mode='victory';s.combo=[false,false];const t=s.trial;
 if(t.encounter==='cellguards'){t.cellOpen=true;t.stage='escape';t.experience+=30;}
 if(t.encounter==='stairguards'){t.guardsWon=true;t.experience+=30;}
 if(t.encounter==='tank'){t.tankWon=true;t.stage='flight';t.experience+=100;}
 log(s,t.tankWon?'龍戰車停止運轉。吊橋的另一側重新露出通路。':'衛兵倒下了，前方的路已經打開。');
}
export function leaveTrialBattle(s:State):void{
 if(s.mode!=='victory'&&s.mode!=='defeat')return;
 const defeat=s.mode==='defeat',map=s.chapter as TrialMap;let z=s.trial.encounter==='cellguards'?-.2:s.trial.encounter==='tank'?3.7:2.8;
 if(defeat){z=s.trial.encounter==='cellguards'?-4:-5.3;s.players.forEach(p=>{p.hp=120;p.mp=18;});}
 else s.players.forEach(p=>{p.hp=Math.max(1,p.hp);});
 const tank=s.trial.encounter==='tank';s.trial.encounter='none';enterTrialMap(s,map,tank?(defeat?5:0):0,tank?0:z);
}
/** One stock, one mutation. Menu pause is owned by main; battle item use still consumes readiness. */
export function useInventory(s:State,kind:'tonic'|'ether',slot:Slot):boolean{
 if(!trialActive(s)||(s.mode!=='explore'&&s.mode!=='battle')||s.trial.fade>0||s.trial.choice||s.prologue.choice||s.prologue.transition)return false;
 if(slot===1&&(!trialP2(s)||(!s.joined&&s.mode==='battle')))return false;
 const p=s.players[slot];if(p.hp<=0||(s.mode==='battle'&&p.atb<1))return false;
 const available=kind==='tonic'?s.rescue.tonics:s.trial.ethers,missing=kind==='tonic'?120-p.hp:18-p.mp;
 if(available<=0||missing<=0)return false;
 const n=Math.min(kind==='tonic'?50:10,missing);if(kind==='tonic'){s.rescue.tonics--;p.hp+=n;}else{s.trial.ethers--;p.mp+=n;}
 if(s.mode==='battle'){p.atb=0;s.combo[slot]=false;}
 s.effects.push({x:p.x,z:p.z,text:`+${n}`,kind:'heal'});log(s,`${slot===0?'克羅諾':'露卡'}使用${kind==='tonic'?'回復藥':'乙太'}，恢復 ${n} ${kind==='tonic'?'HP':'MP'}。`);return true;
}
/** Strict whitelist. Transient questions, enemies and animation clocks are never loaded. */
export function restoreTrial(raw:unknown,chapter:unknown):Trial{
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||typeof chapter!=='string')throw new Error('審判存檔格式錯誤。');
 const o=raw as Record<string,unknown>,t=newTrial();t.hearing=restoreHearing(o.hearing);
 if(typeof o.stage!=='string'||!['escort','court','cell','escape','tank','flight','future'].includes(o.stage))throw new Error('審判階段錯誤。');t.stage=o.stage as Trial['stage'];
 for(const k of ['cellOpen','guardsWon','fritzFreed','luccaJoined','marleJoined','manualRead','suppliesTaken','tankWon'] as const){if(typeof o[k]!=='boolean')throw new Error('審判旗標錯誤。');t[k]=o[k];}
 for(const [k,max] of [['question',3],['knocks',3],['days',3],['ethers',t.hearing?5:2],['experience',160],['headRepairs',10000]] as const){const n=o[k];if(typeof n!=='number'||!Number.isInteger(n)||n<0||n>max)throw new Error('審判數值錯誤。');(t as unknown as Record<string,unknown>)[k]=n;}
 for(const k of ['blamedMarle','wealthMotive'] as const){if(o[k]!==null&&typeof o[k]!=='boolean')throw new Error('審判回答錯誤。');t[k]=o[k] as boolean|null;}
 if(!['pending','guilty','not-guilty'].includes(String(o.verdict))||!['unknown','breakout','wait'].includes(String(o.route)))throw new Error('裁決與逃脫路線錯誤。');t.verdict=o.verdict as Trial['verdict'];t.route=o.route as Trial['route'];
 if(!trialStageAllows(t,chapter))throw new Error('審判階段與地圖不一致。');
 if((t.question>=1)!==(t.blamedMarle!==null)||((t.question>=2||!!t.hearing&&t.question===1&&t.wealthMotive===false)!==(t.wealthMotive!==null))||(t.question===3)!==(t.verdict!=='pending'))throw new Error('問答順序不一致。');
 if((t.stage==='escort'&&t.question!==0)||(!['escort','court'].includes(t.stage)&&t.question!==3))throw new Error('審判前置事件不一致。');
 if((t.route==='breakout'&&t.knocks!==3)||(t.route==='wait'&&t.days!==3)||(t.cellOpen&&t.route==='unknown')||(['escape','tank','flight','future'].includes(t.stage)&&!t.cellOpen))throw new Error('牢房事件不一致。');
 if((t.luccaJoined&&!t.cellOpen)||(t.route==='wait'&&!t.luccaJoined)||(t.guardsWon&&!t.cellOpen)||(['tank','flight','future'].includes(t.stage)&&(!t.guardsWon||!t.luccaJoined)))throw new Error('越獄前置事件不一致。');
 if((t.fritzFreed&&!t.cellOpen)||((t.manualRead||t.suppliesTaken)&&!t.luccaJoined)||(t.ethers>0&&!t.suppliesTaken&&!t.hearing?.giftTaken))throw new Error('越獄物品或救援不一致。');
 if(['escort','court'].includes(t.stage)&&(t.knocks!==0||t.days!==0||t.route!=='unknown'||t.cellOpen||t.guardsWon||t.fritzFreed||t.luccaJoined||t.manualRead||t.suppliesTaken||t.headRepairs!==0))throw new Error('審判之前不得提前越獄。');
 if(t.stage==='cell'&&(t.cellOpen||t.guardsWon||t.fritzFreed||t.luccaJoined||t.route==='wait'||t.days===3||t.headRepairs!==0))throw new Error('獨房尚未解鎖逃脫事件。');
 if(t.stage==='escape'&&(t.manualRead||t.suppliesTaken||t.headRepairs!==0))throw new Error('尚未到達看守室。');
 if((t.route==='breakout'&&t.days===3)||(t.route==='unknown'&&t.knocks===3))throw new Error('等待與敲門路線不一致。');
 if(t.stage==='flight'&&chapter==='prisonbridge'&&t.marleJoined)throw new Error('吊橋尚未與瑪兒重聚。');
 if(t.stage==='escape'&&t.route==='breakout'&&t.luccaJoined)throw new Error('露卡尚未在看守室加入。');
 if(t.stage==='flight'&&chapter==='guardia1000'&&!t.marleJoined)throw new Error('尚未與瑪兒重聚。');
 if(t.tankWon!==['flight','future'].includes(t.stage)||(t.marleJoined&&!t.tankWon)||(t.stage==='future'&&!t.marleJoined))throw new Error('龍戰車與逃離進度不一致。');
 const expected=(t.cellOpen&&t.route==='breakout'?30:0)+(t.guardsWon?30:0)+(t.tankWon?100:0);if(t.experience!==expected)throw new Error('戰鬥獎勵不一致。');
 return t;
}
export function saveTrial(t:Trial):Record<string,unknown>{const {history:_,fade:_f,choice:_c,encounter:_e,...persistent}=t;return persistent;}
export function trialPositionValid(chapter:string,p:Actor):boolean{return trialMap(chapter)?trialWalkable(p.x,p.z,chapter):chapter==='overworld1000'&&prologueWalkable(p.x,p.z,'overworld1000');}
