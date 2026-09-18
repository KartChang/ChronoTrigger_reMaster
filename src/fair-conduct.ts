import type {State,Slot,Vec} from './core';
import {CONDUCT_POINTS as P} from './fair-conduct-data';
import {newFollowPlan,followVector} from './navigation';
import {fairWalkable} from './fair-data';
const distance=(a:Vec,b:Vec)=>Math.hypot(a.x-b.x,a.z-b.z);
const log=(s:State,text:string)=>{s.log.push(text);if(s.log.length>5)s.log.shift();};
export const conductActive=(s:State)=>!!s.prologue.conduct&&!s.prologue.conduct.sealed&&s.chapter==='fair'&&s.opening.phase==='none'&&s.kingdom.phase==='none';
export const shopping=(s:State)=>conductActive(s)&&s.prologue.conduct?.candy==='waiting';
export function sealConduct(s:State):void{const c=s.prologue.conduct;if(!c)return;c.sealed=true;c.cat.following=false;c.catPlan=newFollowPlan();}
export function tickConduct(s:State,dt:number):void{
 const c=s.prologue.conduct;if(!c)return;
 if(!conductActive(s)){if(c.cat.following){c.cat.following=false;c.cat={...P.cat,following:false,facing:0};c.catPlan=newFollowPlan();}return;}
 if(s.mode!=='explore'||s.prologue.choice||s.prologue.transition)return;
 if(c.candy==='waiting'){
  if(distance(s.players[0],P.candy)>2.4){c.candy='rushed';c.candyElapsed=0;log(s,'瑪兒：等一下，別拉著我走！我還沒選好呢。');}
  else {c.candyElapsed+=dt;if(c.candyElapsed>=3){c.candy='patient';c.candyElapsed=0;log(s,'瑪兒挑好了糖果，開心地回到你身旁。');}}
 }
 if(c.cat.following&&!c.catReturned){
  const cat=c.cat,v=followVector(c.catPlan,cat,s.players[0],'fair',s.ticks,fairWalkable);
  for(const axis of ['x','z'] as const){const value=cat[axis]+v[axis]*4*dt;const x=axis==='x'?value:cat.x,z=axis==='z'?value:cat.z;if(fairWalkable(x,z))cat[axis]=value;}
  if(Math.hypot(v.x,v.z)>.05)cat.facing=Math.abs(v.x)>Math.abs(v.z)?(v.x>0?1:3):(v.z>0?2:0);
 }
}
export function interactConduct(s:State,slot:Slot):{title:string;text:string}|null{
 if(!conductActive(s)||s.mode!=='explore'||s.prologue.choice||s.prologue.transition||!['fair','companions'].includes(s.prologue.stage)||slot!==0)return null;
 const c=s.prologue.conduct!,p=s.players[0],near=(q:Vec,r=1.25)=>distance(p,q)<r;
 if(c.candy==='waiting')return {title:'瑪兒',text:'等一下，讓我選好糖果。'};
 if(near(P.girl)){
  c.askedGirl=true;
  if(!c.catReturned&&c.cat.following&&distance(c.cat,P.girl)<2.2){c.catReturned=true;c.cat.following=false;return {title:'找到小貓了',text:'小女孩抱住跟在你身後的貓，向你道謝。'};}
  return {title:'小女孩',text:c.catReturned?'謝謝你幫我找回小貓！':'我的貓不見了……牠好像跑到廣場西邊去了。'};
 }
 if(!c.catReturned&&!c.cat.following&&near(c.cat,.95)){c.cat.following=true;return {title:'走失的小貓',text:'貓抬起頭叫了一聲，跟在你身後。帶牠回去找主人吧。'};}
 if(near(P.lunch)){
  if(c.lunchEaten)return {title:'空午餐袋',text:'只剩下空紙袋。老人還在附近找他的午餐。'};
  c.lunchEaten=true;s.players.forEach(p=>{p.hp=120;p.mp=18;});return {title:'老人的午餐',text:'你吃掉了放在長凳旁的午餐，恢復了體力。老人轉過身，發現自己的午餐不見了。'};
 }
 if(near(P.merchant)&&s.prologue.stage==='companions'){
  if(c.saleAttempted)return {title:'梅爾基歐',text:'瑪兒已經說過，那條項鍊是家傳的寶物，她不會賣。'};
  s.prologue.choice='sell-pendant';return {title:'梅爾基歐',text:'你朋友的項鍊很特別。能替我問她，願不願意賣給我嗎？'};
 }
 if(near(P.candy)&&s.prologue.stage==='companions'){
  if(c.candy!=='unseen')return {title:'糖果攤',text:'剛才買糖的事情已經結束。攤位又迎來新的客人。'};
  if(s.joined&&distance(s.players[0],s.players[1])>3.5)return {title:'瑪兒',text:'等我過來，再一起看看糖果吧。'};
  c.candy='waiting';c.candyElapsed=0;return {title:'瑪兒',text:'等一下，我想買點糖果。讓我選一下，好嗎？'};
 }
 return null;
}
export function chooseConduct(s:State,yes:boolean):{title:string;text:string}|null{
 if(!conductActive(s)||s.mode!=='explore'||s.prologue.choice!=='sell-pendant'||s.prologue.stage!=='companions')return null;
 s.prologue.choice=null;const c=s.prologue.conduct!;
 if(yes){c.saleAttempted=true;return {title:'瑪兒',text:'這是家傳的寶物，不能賣！'};}
 c.saleDeclined=true;return {title:'梅爾基歐',text:'原來如此。不是自己的東西，的確不能隨便作主。'};
}
