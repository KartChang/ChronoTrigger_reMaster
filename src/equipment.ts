/** Authored first-pass equipment/economy. Prices and bonuses are not ROM-certified.
 * Null in State is the untouched initial kit; first successful mutation persists v8.
 * Inventory counts include equipped copies. The ledger checks conservation, not authenticity.
 */
export const MEMBERS=['crono','marle','lucca','frog'] as const;
export type Member=typeof MEMBERS[number];
export const GEAR_SLOTS=['weapon','body','head'] as const;
export type GearSlot=typeof GEAR_SLOTS[number];
export const MEMBER_NAMES:Record<Member,string>={crono:'克羅諾',marle:'瑪兒',lucca:'露卡',frog:'青蛙'};
export type EquipmentItem={id:string;name:string;slot:GearSlot;members:readonly Member[];price:number;attack:number;defense:number};
export const EQUIPMENT:readonly EquipmentItem[]=[
 {id:'wood-katana',name:'木刀',slot:'weapon',members:['crono'],price:0,attack:0,defense:0},
 {id:'short-bow',name:'短弓',slot:'weapon',members:['marle'],price:0,attack:0,defense:0},
 {id:'air-gun',name:'空氣槍',slot:'weapon',members:['lucca'],price:0,attack:0,defense:0},
 {id:'bronze-sword',name:'青銅劍',slot:'weapon',members:['frog'],price:0,attack:0,defense:0},
 {id:'cloth-tunic',name:'布衣',slot:'body',members:MEMBERS,price:0,attack:0,defense:0},
 {id:'cloth-cap',name:'布帽',slot:'head',members:MEMBERS,price:0,attack:0,defense:0},
 {id:'bronze-katana',name:'青銅刀',slot:'weapon',members:['crono'],price:150,attack:6,defense:0},
 {id:'iron-katana',name:'鐵刀',slot:'weapon',members:['crono'],price:350,attack:12,defense:0},
 {id:'iron-bow',name:'鐵弓',slot:'weapon',members:['marle'],price:150,attack:6,defense:0},
 {id:'dart-gun',name:'針刺槍',slot:'weapon',members:['lucca'],price:150,attack:6,defense:0},
 {id:'steel-sword',name:'鋼劍',slot:'weapon',members:['frog'],price:150,attack:6,defense:0},
 {id:'bronze-mail',name:'青銅甲',slot:'body',members:MEMBERS,price:120,attack:0,defense:3},
 {id:'bronze-helm',name:'青銅盔',slot:'head',members:MEMBERS,price:80,attack:0,defense:2},
];
export const STARTING_GOLD=400;
export const MAX_ITEM_COUNT=99;
export type EquipmentState={schema:1;gold:number;owned:Record<string,number>;bought:Record<string,number>;sold:Record<string,number>;worn:Record<Member,Record<GearSlot,string>>};
export function itemById(id:string):EquipmentItem|undefined{return EQUIPMENT.find(i=>i.id===id);}
export function newEquipment():EquipmentState{
 const weapon:Record<Member,string>={crono:'wood-katana',marle:'short-bow',lucca:'air-gun',frog:'bronze-sword'};
 const owned=Object.fromEntries(EQUIPMENT.map(i=>[i.id,i.price?0:i.slot==='weapon'?1:4]));
 return {schema:1,gold:STARTING_GOLD,owned,bought:{},sold:{},worn:Object.fromEntries(MEMBERS.map(m=>[m,{weapon:weapon[m],body:'cloth-tunic',head:'cloth-cap'}])) as EquipmentState['worn']};
}
export function equipmentBonuses(e:EquipmentState|null,member:Member):{attack:number;defense:number}{
 if(!e)return {attack:0,defense:0};
 return GEAR_SLOTS.reduce((a,slot)=>{const i=itemById(e.worn[member][slot])!;a.attack+=i.attack;a.defense+=i.defense;return a;},{attack:0,defense:0});
}
export function freeCopies(e:EquipmentState,id:string):number{return (e.owned[id]??0)-MEMBERS.reduce((n,m)=>n+GEAR_SLOTS.filter(slot=>e.worn[m][slot]===id).length,0);}
export function tradeEquipment(e:EquipmentState,id:string,quantity:number,buy:boolean):EquipmentState|null{
 const item=itemById(id);if(!item||item.price<=0||typeof buy!=='boolean'||!Number.isSafeInteger(quantity)||quantity<1||quantity>MAX_ITEM_COUNT)return null;
 const cost=(buy?item.price:Math.floor(item.price/2))*quantity;
 if(buy?(e.gold<cost||(e.owned[id]??0)+quantity>MAX_ITEM_COUNT):(freeCopies(e,id)<quantity||e.gold+cost>999999))return null;
 const next=structuredClone(e),ledger=buy?next.bought:next.sold;
 if((ledger[id]??0)+quantity>9999)return null;
 next.gold+=buy?-cost:cost;next.owned[id]=(next.owned[id]??0)+(buy?quantity:-quantity);ledger[id]=(ledger[id]??0)+quantity;
 return next;
}
export function wearEquipment(e:EquipmentState,member:Member,id:string):EquipmentState|null{
 const item=itemById(id);if(!MEMBERS.includes(member)||!item||!item.members.includes(member)||e.worn[member][item.slot]===id||freeCopies(e,id)<1)return null;
 const next=structuredClone(e);next.worn[member][item.slot]=id;return next;
}
export function restoreEquipment(raw:unknown):EquipmentState{
 const fail=():never=>{throw new Error('裝備或金幣資料不一致。');};
 const object=(o:unknown):o is Record<string,unknown>=>!!o&&typeof o==='object'&&!Array.isArray(o);
 if(!object(raw)||raw.schema!==1||!object(raw.owned)||!object(raw.bought)||!object(raw.sold)||!object(raw.worn))return fail();
 const baseline=newEquipment(),next=newEquipment();let gold=STARTING_GOLD;
 for(const field of ['owned','bought','sold'] as const){const source=raw[field] as Record<string,unknown>;
  if(Object.keys(source).some(id=>!itemById(id)))return fail();
  for(const i of EQUIPMENT){const n=Object.hasOwn(source,i.id)?source[i.id]:0;if(typeof n!=='number'||!Number.isSafeInteger(n)||n<0||n>(field==='owned'?MAX_ITEM_COUNT:9999)||(field!=='owned'&&!i.price&&n!==0))return fail();
   if(field==='owned'||n)next[field][i.id]=n;
  }
 }
 for(const i of EQUIPMENT){const buy=next.bought[i.id]??0,sell=next.sold[i.id]??0;if(next.owned[i.id]!==baseline.owned[i.id]!+buy-sell)return fail();gold-=buy*i.price;gold+=sell*Math.floor(i.price/2);}
 if(raw.gold!==gold||!Number.isSafeInteger(gold)||gold<0||gold>999999)return fail();next.gold=gold;
 if(Object.keys(raw.worn).length!==MEMBERS.length||Object.keys(raw.worn).some(m=>!MEMBERS.includes(m as Member)))return fail();
 for(const m of MEMBERS){const worn=raw.worn[m];if(!object(worn)||Object.keys(worn).length!==GEAR_SLOTS.length)return fail();
  for(const slot of GEAR_SLOTS){const id=worn[slot];if(typeof id!=='string')return fail();const i=itemById(id);if(!i||i.slot!==slot||!i.members.includes(m))return fail();next.worn[m][slot]=id;}
 }
 if(EQUIPMENT.some(i=>freeCopies(next,i.id)<0))return fail();return next;
}
