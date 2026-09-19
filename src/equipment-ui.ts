import {retainPanelPosition} from './modal-focus';
import {GUEST_HP,GUEST_MP} from './rescue-data';
import {EQUIPMENT,GEAR_SLOTS,MEMBERS,MEMBER_NAMES,equipmentBonuses,freeCopies,newEquipment,itemById} from './equipment';
import type {Member} from './equipment';
import {activeSlot,guestKind,cutsceneActive,shopAvailable,equipItem,tradeItem,partyMember,MAX_HP,MAX_MP} from './core';
import type {State} from './core';
/** Adds status/equipment/shop controls to the existing paused inventory, not a second UI runtime. */
export function equipmentPanel(root:HTMLElement,getState:()=>State,changed:(message:string)=>void,canAct:()=>boolean){
 let selected:Member='crono',signature='',detailsOpen=false;
 const addButton=(parent:HTMLElement,text:string,action:()=>void,disabled=false,id?:string)=>{
  const b=document.createElement('button');b.textContent=text;b.disabled=disabled;if(id)b.id=id;b.onclick=()=>{if(canAct())action();};parent.append(b);return b;
 };
 function refresh(force=false):void{
  const s=getState(),e=s.equipment??newEquipment();
  const present=MEMBERS.filter(m=>m==='crono'||(activeSlot(s,1)&&partyMember(s,1)===m)||guestKind(s)===m);
  if(!present.includes(selected))selected='crono';
  const guest=guestKind(s)===selected,actor=guest?s.rescue.guest:s.players[selected==='crono'?0:1];
  const key=JSON.stringify([e,selected,present,actor.hp,actor.mp,s.mode,shopAvailable(s),cutsceneActive(s)]);if(!force&&signature===key)return;signature=key;
  const restorePosition=retainPanelPosition(root);root.replaceChildren();
  const summary=document.createElement('div');summary.className='equipment-summary';root.append(summary);
  const title=document.createElement('h3');title.textContent='角色與裝備';summary.append(title);
  const money=document.createElement('p');money.id='equipment-gold';money.textContent=`旅費 ${e.gold} G`;summary.append(money);
  const actors=document.createElement('div');actors.className='equipment-actions';actors.id='equipment-members';actors.dataset.focusRow='members';actors.tabIndex=-1;actors.setAttribute('role','group');actors.setAttribute('aria-label','目前在場的隊員');root.append(actors);
  for(const m of present)addButton(actors,MEMBER_NAMES[m],()=>{selected=m;refresh(true);},m===selected,`equipment-member-${m}`);
  const bonuses=equipmentBonuses(e,selected),status=document.createElement('p');status.id='equipment-stats';status.tabIndex=-1;status.textContent=`${MEMBER_NAMES[selected]}｜HP ${actor.hp}/${guest?GUEST_HP:MAX_HP} · MP ${actor.mp}/${guest?GUEST_MP:MAX_MP}\n普攻 +${bonuses.attack} · 減傷 ${bonuses.defense}（暫定數值）`;root.append(status);
  const modifiable=s.mode==='explore'&&!cutsceneActive(s);
  for(const slot of GEAR_SLOTS){
   const row=document.createElement('div');row.className='equipment-slot';row.id=`equipment-row-${slot}`;row.dataset.focusRow=slot;row.tabIndex=-1;row.setAttribute('role','group');row.setAttribute('aria-label',slot==='weapon'?'武器':slot==='body'?'身體':'頭部');const label=document.createElement('strong');label.textContent=`${slot==='weapon'?'武器':slot==='body'?'身體':'頭部'}：${itemById(e.worn[selected][slot])!.name}`;row.append(label);
   for(const item of EQUIPMENT.filter(i=>i.slot===slot&&i.members.includes(selected)&&((e.owned[i.id]??0)>0))){
    const wearing=e.worn[selected][slot]===item.id;
    const b=addButton(row,(wearing?'已裝備 ':'換上 ')+item.name,()=>{const ok=equipItem(getState(),selected,item.id);changed(ok?`已換上${item.name}。`:'此時不能更換裝備。');refresh(true);},!modifiable||wearing||freeCopies(e,item.id)<1,`equip-${selected}-${item.id}`);b.dataset.equipmentItem=item.id;b.dataset.member=selected;
   }root.append(row);
  }
  const shop=document.createElement('div');shop.id='equipment-shop';root.append(shop);
  const heading=document.createElement('h3');heading.textContent='梅爾基歐的裝備攤';shop.append(heading);
  if(!shopAvailable(s)){const p=document.createElement('p');p.textContent='到千年祭南側，靠近梅爾基歐，再開啟背包買賣。戰鬥、演出、選擇途中不能交易。';shop.append(p);}
  else for(const item of EQUIPMENT.filter(i=>i.price>0)){
   const row=document.createElement('div');row.className='equipment-shop-row';row.id=`equipment-shop-row-${item.id}`;row.dataset.focusRow=item.id;row.tabIndex=-1;row.setAttribute('role','group');row.setAttribute('aria-label',item.name);const p=document.createElement('span');p.textContent=`${item.name}｜持有 ${e.owned[item.id]??0}（閒置 ${freeCopies(e,item.id)}）`;row.append(p);
   addButton(row,`買入 ${item.price} G`,()=>{const ok=tradeItem(getState(),item.id,1,true);changed(ok?`買入${item.name}。`:'金幣不足、持有已滿，或已離開攤位。');refresh(true);},e.gold<item.price||(e.owned[item.id]??0)>=99,`buy-${item.id}`);
   addButton(row,`賣出 ${Math.floor(item.price/2)} G`,()=>{const ok=tradeItem(getState(),item.id,1,false);changed(ok?`賣出${item.name}。`:'裝備中的物品不能賣出。');refresh(true);},freeCopies(e,item.id)<1,`sell-${item.id}`);shop.append(row);
  }
  // Disclosure state belongs to presentation only; it never migrates or changes a save.
  const details=document.createElement('div');details.className='equipment-details';root.append(details);
  const note=document.createElement('p');note.id='equipment-notes';note.className='equipment-note';note.hidden=!detailsOpen;
  note.textContent='本批初始旅費 400 G；商品與戰鬥加成為暫定重建數值。每次受擊至少受 1 傷害；技能與合技消耗不變。經驗成長、技能學習及戰鬥金幣獎勵尚未接入。';
  const toggle=addButton(details,'暫定數值與裝備說明',()=>{detailsOpen=!detailsOpen;note.hidden=!detailsOpen;toggle.setAttribute('aria-expanded',String(detailsOpen));},false,'equipment-details-toggle');
  toggle.setAttribute('aria-controls',note.id);toggle.setAttribute('aria-expanded',String(detailsOpen));details.append(note);
  restorePosition();
 }
 return {refresh,reset:()=>{selected='crono';signature='';detailsOpen=false;}};
}
