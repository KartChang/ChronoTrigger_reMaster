import assert from 'node:assert/strict';
import * as c from '../../.test/core.mjs';
/** Pure-core integration driver: only production inputs, actions and serialize/deserialize.
 * No actor positions, progress flags, resources or clocks are assigned by the driver. */
export function journey(){
 let s=c.createState('bedroom');
 const tick=(n=40)=>{for(let i=0;i<n;i++)c.step(s,c.IDLE,1/60);};
 const move=(axis,target,battle=false)=>{const before=s.chapter,sign=Math.sign(target-s.players[0][axis]);let n=0;
  while(sign*(target-s.players[0][axis])>.055){const v={x:axis==='x'?sign:0,z:axis==='z'?sign:0};c.step(s,[v,v],1/60);
   if(s.chapter!==before||s.prologue.transition||battle&&s.mode==='battle')break;
   if(++n>2500)assert.fail(`Blocked ${s.chapter} ${axis} ${target}: ${JSON.stringify(s.players)}; ${s.mode}`);
  }
 };
 const talk=(title)=>{
  const result=s.trial.stage!=='none'?c.interactTrial(s,0):s.chapter==='fair'?c.interactFair(s,0):['bedroom','home','overworld1000'].includes(s.chapter)?c.interactPrologue(s,0):['cathedral','passage','sanctum'].includes(s.chapter)?c.interactRescue(s,0):s.chapter==='canyon'?c.interactOpening(s,0):c.interactKingdom(s,0);
  if(title)assert(result?.title.includes(title),`Expected ${title}, got ${JSON.stringify(result)} at ${s.chapter} ${JSON.stringify(s.players[0])}`);
  tick();return result;
 };
 const choose=(yes)=>{const result=s.trial.stage!=='none'?c.chooseTrial(s,yes):c.choosePrologue(s,yes);assert(result);tick();return result;};
 const reload=()=>{s=c.deserialize(c.serialize(s));tick();};
 const fight=()=>{assert.equal(s.mode,'battle');for(let n=0;n<18000&&s.mode==='battle';n++){
   c.step(s,c.IDLE,1/60);for(const slot of [0,1]){const p=s.players[slot];if(p.atb>=1&&p.hp>0){if(p.hp<50&&c.useTonic(s,slot))continue;c.action(s,slot,slot===0&&p.mp>=3?'skill':'attack');}}
  }assert.equal(s.mode,'victory');c.leaveBattle(s);tick();};
 const company=(bad=false)=>{
  tick(180);move('x',0);move('z',-4.1);tick();assert.equal(s.chapter,'home');move('x',0);talk('母親');move('z',-4.2);talk();assert.equal(s.chapter,'overworld1000');
  move('x',.1);move('z',5.1);move('x',2);talk();assert.equal(s.chapter,'fair');move('z',-3.1);move('x',-3.5);move('z',-2.2);tick();
  if(!bad)talk('女孩');move('z',-2.8);move('x',-.5);move('z',-.8);talk('項鍊');move('z',-2.8);move('x',-3.5);move('z',-2.2);talk('女孩');
  if(bad){choose(false);talk('女孩');}choose(true);talk('瑪兒');choose(true);assert.equal(s.prologue.stage,'companions');
 };
 const fairConduct=(bad=false)=>{
  move('x',0);move('z',2.4);move('x',5);talk('小女孩');
  move('z',.8);move('x',-9);
  if(!bad){talk('走失');move('x',0);move('x',5);move('z',2.4);tick(200);talk('找到小貓');assert(s.prologue.conduct.catReturned);}
  else {move('z',6.5);talk('老人的午餐');assert(s.prologue.conduct.lunchEaten);}
  move('z',-3.4);move('x',7.5);move('z',-6.3);talk('梅爾基歐');choose(bad);
  move('z',-3.4);talk('瑪兒');assert.equal(s.prologue.conduct.candy,'waiting');
  if(bad)move('x',4);else tick(200);
  assert.equal(s.prologue.conduct.candy,bad?'rushed':'patient');reload();move('z',-3.4);move('x',-1);
 };
 const rescueReturn=()=>{
  move('z',6.4);talk('露卡');move('x',-2.4);move('z',8.4);talk('傳送成功');move('z',6.4);move('x',0);tick(100);talk('瑪兒');tick(450);
  move('x',-2.4);move('z',8.5);talk('露卡');talk('克羅諾');tick(100);assert.equal(s.chapter,'canyon');assert(s.prologue.conduct.sealed);reload();
  move('z',4.8,true);fight();move('x',0);move('z',-6.5);talk('600 年');talk('托魯斯');assert.equal(s.chapter,'truce');
  move('z',1);move('x',-4.5);talk('鎮民');move('x',0);move('z',-4.3);move('x',7.3);talk('森林');move('z',1,true);fight();move('x',0);move('z',8.2);talk('王城');
  move('z',-2.6);move('x',-1);talk('衛兵');move('z',4);move('x',8);move('z',6.2);talk('王后房間');move('z',.6);talk('瑪兒');tick(200);
  move('z',-6.8);talk('王城');move('z',-3.2);move('x',2.5);talk('露卡加入');move('x',0);move('z',-6.8);talk('森林');move('z',.5);move('x',-9);talk('修道院');
  move('z',1);talk('紋章');fight();move('z',4.4);move('x',.5);talk('青蛙加入');move('z',5.8);move('x',-6.8);talk('管風琴');move('x',4);move('z',8.6);talk('密道');
  move('z',-6.15);move('x',-7);talk('回復藥');move('x',0);move('z',.5,true);fight();move('x',0);move('z',8.3);talk('深處');move('z',3.8);talk('大臣的真面目');fight();
  move('z',5.8);move('x',7.8);talk('真正的大臣');move('x',-2.5);move('z',6.8);talk('莉妮王后');move('z',5.5);move('x',0);move('z',-6.9);talk('王城');
  move('z',4);move('x',8);move('z',6.2);talk('王后房間');move('z',.9);talk('瑪兒回來');reload();move('z',-6.8);talk('王城');move('z',4);move('x',0);move('z',-6.8);talk('森林');
  move('z',-6.8);talk('托魯斯');move('x',0);move('z',7.6);talk('山道');move('z',8);talk('回到 1000 年');reload();assert.equal(s.rescue.stage,'returned');
 };
 const court=()=>{move('x',0);move('z',-7.2);talk('送瑪兒');move('x',-2.9);talk('森林');move('z',5.7);talk('王城');move('z',-.5);talk('被捕');assert.equal(s.chapter,'courtroom');reload();};
 const hearing=(bad=false)=>{
  const ask=(kind,yes)=>{for(let n=0;n<6;n++){const d=talk();if(s.trial.choice){assert.equal(s.trial.choice,kind);choose(yes);return;}assert(d.title.startsWith('證人'));}assert.fail('No question');};
  ask('collision',!bad);
  if(s.prologue.conduct.lunchEaten)ask('theft',!bad);
  ask('wealth',bad);
  if(!bad){reload();assert.equal(s.trial.question,1);ask('wealth-confirm',true);}
  let n=0;while(s.trial.question===2){talk();reload();assert(++n<8);}
  assert.equal(s.trial.verdict,bad?'guilty':'not-guilty');talk('空中刑務所');reload();
 };
 return {get s(){return s;},tick,move,talk,choose,reload,fight,company,fairConduct,rescueReturn,court,hearing};
}
