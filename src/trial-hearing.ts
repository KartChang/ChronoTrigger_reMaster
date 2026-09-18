import type {State} from './core';
export type Hearing={rules:'fair-witness-v1';theftDenied:boolean|null;wealthConfirmed:boolean|null;heard:number;giftTaken:boolean};
export const newHearing=():Hearing=>({rules:'fair-witness-v1',theftDenied:null,wealthConfirmed:null,heard:0,giftTaken:false});
export type WitnessKind='girl'|'elder'|'merchant'|'shopper';
export function witnessScenes(s:State):{kind:WitnessKind;title:string;text:string}[]{
 const c=s.prologue.conduct;if(!c)return [];const result:{kind:WitnessKind;title:string;text:string}[]=[];
 if(c.catReturned)result.push({kind:'girl',title:'證人：小女孩',text:'他帶回了我的小貓。我很感謝他。'});
 if(c.lunchEaten)result.push({kind:'elder',title:'證人：午餐的主人',text:'就是這個年輕人。他吃掉了我留在長凳旁的午餐。'});
 const rebuttal=s.trial.wealthMotive===false&&s.trial.hearing?.wealthConfirmed===false;
 if(rebuttal&&(c.saleAttempted||c.returnRefused||s.prologue.first==='pendant'))result.push({kind:'shopper',title:'證人：項鍊的經過',text:[s.prologue.first==='pendant'?'他先撿起項鍊，才去關心跌倒的女孩。':'',c.returnRefused?'女孩請他歸還時，他曾經拒絕。':'',c.saleAttempted?'他還替商人問過，能不能買下那條項鍊。':''].filter(Boolean).join('\n')});
 if(rebuttal&&c.candy==='rushed')result.push({kind:'shopper',title:'證人：糖果攤的客人',text:'女孩還在挑糖果，他就拉著她離開。我聽到她喊著要他等一下。'});
 return result;
}
/** Explicit reconstruction policy, not a claim of ROM-exact hidden juror code.
 * Cat return overrides the earlier request; untouched cat evidence stays unknown (no invented RNG).
 * Ruleset is saved so old seven-slot provisional verdicts are never silently recalculated. */
export function witnessEvidence(s:State):{jurors:('guilty'|'not-guilty'|'unknown')[];lines:string[]}{
 const c=s.prologue.conduct,h=s.trial.hearing,t=s.trial;if(!c||!h)throw new Error('祭典證詞缺少原始經歷。');
 const vote=(b:boolean)=>b?'guilty' as const:'not-guilty' as const;
 const jurors=[vote(c.saleAttempted||c.returnRefused),c.catReturned?'not-guilty' as const:c.askedGirl?'guilty' as const:'unknown' as const,vote(c.candy==='rushed'),vote(t.wealthMotive===true||s.prologue.first==='pendant'),vote(t.wealthMotive===true||h.wealthConfirmed===true),vote(c.lunchEaten),vote(t.blamedMarle===true||h.theftDenied===true)];
 return {jurors,lines:[`項鍊：${s.prologue.first==='marle'?'先關心女孩':'先拾取項鍊'}；${c.returnRefused?'曾拒絕歸還':'沒有拒絕歸還'}；${c.saleAttempted?'曾詢問出售':'沒有嘗試出售'}。`,`尋貓：${c.catReturned?'已送回主人身邊':c.askedGirl?'接受求助後沒有送回':'沒有這項證詞'}。`,`午餐：${c.lunchEaten?'確實吃過':'沒有吃過'}。`,`買糖：${c.candy==='rushed'?'催促離開':c.candy==='patient'?'等候挑選完成':'沒有發生催促'}。`,`當庭回答：${t.blamedMarle?'歸咎瑪兒':'承認碰撞'}；${h.theftDenied===true?'否認吃過午餐；':''}${t.wealthMotive||h.wealthConfirmed?'承認財富動機':'否認財富動機'}。`]};
}
export function jailGift(s:State):number{
 if(!s.trial.hearing||s.trial.question!==3||s.trial.verdict!=='not-guilty')return 0;
 const n=witnessEvidence(s).jurors.filter(v=>v==='not-guilty').length;return n>=6?3:n>=4?1:0;
}
export function hearingChoice(s:State,yes:boolean):{title:string;text:string}|null{
 const t=s.trial,h=t.hearing;if(!h||s.chapter!=='courtroom'||s.mode!=='explore'||t.fade>0)return null;
 if(t.choice==='collision'&&t.question===0){t.blamedMarle=!yes;t.question=1;}
 else if(t.choice==='theft'&&t.question===1&&s.prologue.conduct?.lunchEaten&&h.theftDenied===null)h.theftDenied=!yes;
 else if(t.choice==='wealth'&&t.question===1&&t.wealthMotive===null){t.wealthMotive=yes;if(yes)t.question=2;}
 else if(t.choice==='wealth-confirm'&&t.question===1&&t.wealthMotive===false&&h.wealthConfirmed===null){h.wealthConfirmed=!yes;t.question=2;}
 else return null;
 t.choice=null;return {title:'王國法庭',text:'回答已記錄。大臣示意繼續審理。'};
}
export function hearingDialog(s:State):{title:string;text:string}|null{
 const t=s.trial,h=t.hearing;if(!h)return null;
 if(t.question===0){t.choice='collision';return {title:'大臣的質問',text:'祭典上，究竟是誰先撞到對方？'};}
 if(t.question===1){
  const early=witnessScenes(s).filter(w=>w.kind==='girl'||w.kind==='elder');
  const next=early[h.heard];
  if(next&&(next.kind==='girl'||h.theftDenied!==null)){h.heard++;return {title:next.title,text:next.text};}
  if(s.prologue.conduct?.lunchEaten&&h.theftDenied===null){t.choice='theft';return {title:'大臣的質問',text:'你是否吃過不屬於自己的午餐？'};}
  if(t.wealthMotive===null){t.choice='wealth';return {title:'大臣的質問',text:'公主的財富，曾經讓你動過念頭嗎？'};}
  if(t.wealthMotive===false&&h.wealthConfirmed===null){t.choice='wealth-confirm';return {title:'再次確認',text:'你確定嗎？一點也沒有受到她的財富吸引？'};}
 }
 if(t.question===2){const witnesses=witnessScenes(s);if(h.heard<witnesses.length){const w=witnesses[h.heard++]!;return {title:w.title,text:w.text};}
  const e=witnessEvidence(s);t.verdict=e.jurors.filter(v=>v==='guilty').length>=4?'guilty':'not-guilty';t.question=3;
  return {title:'裁決',text:t.verdict==='guilty'?'陪審員的多數意見：有罪。\n判處單獨監禁，三日後處刑。':'陪審員的多數意見：無罪。\n但私自帶公主離城，仍須單獨監禁三日。'};
 }
 return null;
}
export function restoreHearing(raw:unknown):Hearing|null{
 if(raw===undefined||raw===null)return null;
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('證詞聆訊格式錯誤。');const o=raw as Record<string,unknown>;
 if(o.rules!=='fair-witness-v1'||typeof o.giftTaken!=='boolean'||typeof o.heard!=='number'||!Number.isInteger(o.heard)||o.heard<0||o.heard>4)throw new Error('證詞聆訊進度錯誤。');
 for(const k of ['theftDenied','wealthConfirmed'])if(o[k]!==null&&typeof o[k]!=='boolean')throw new Error('當庭答覆錯誤。');
 return {rules:'fair-witness-v1',theftDenied:o.theftDenied as boolean|null,wealthConfirmed:o.wealthConfirmed as boolean|null,heard:o.heard,giftTaken:o.giftTaken};
}
export function validateHearing(s:State):void{
 const t=s.trial,h=t.hearing,c=s.prologue.conduct;
 if(!h){if(c)throw new Error('新祭典記錄缺少聆訊版本。');return;}
 if(!c?.sealed)throw new Error('證詞不是封存的祭典經歷。');
 if((t.question===0&&(h.theftDenied!==null||h.wealthConfirmed!==null))||(h.theftDenied!==null&&!c.lunchEaten)||(t.question>=2&&c.lunchEaten&&h.theftDenied===null)||(h.wealthConfirmed!==null&&(t.wealthMotive!==false||t.question<2))||(t.question>=2&&t.wealthMotive===false&&h.wealthConfirmed===null))throw new Error('聆訊答覆順序不一致。');
 const count=witnessScenes(s).length;
 const early=(c.catReturned?1:0)+(c.lunchEaten?1:0);
 if(h.heard>count||(t.question===0&&h.heard!==0)||(t.question===1&&h.heard>early)||(t.question>=2&&h.heard<early)||(t.question===3&&h.heard!==count)||(c.lunchEaten&&h.theftDenied===null&&h.heard>(c.catReturned?1:0))||(t.wealthMotive!==null&&h.heard<early))throw new Error('證人尚未全部作證。');
 if(h.giftTaken&&(['escort','court'].includes(t.stage)||jailGift(s)===0))throw new Error('牢房物資來源錯誤。');
 if(t.ethers>(t.suppliesTaken?2:0)+(h.giftTaken?jailGift(s):0))throw new Error('乙太數量超過真實取得量。');
}
