/** Read-only evidence oracle for the existing Truce party. `joined` is a control
 * preference, not story availability. Kept independent of the renderer; tests
 * compare every branch with the unchanged production activeSlot/guestKind rules.
 */
const stages={
 prologue:['legacy','waking','home','fair','collision','companions'],
 opening:['none','approach','resonance','lost','pendant','crossing','canyon','vista'],
 kingdom:['none','arrival','audience','erasing','missing','rescue'],
 rescue:['none','entered','cleared','allied','rescued','homecoming','reunited','returned'],
 trial:['none','escort','court','cell','escape','tank','flight','future']
};
const need=(ok,why)=>{if(!ok)throw Error('Town party evidence: '+why);};
export function expectedTownParty(state){
 need(state?.chapter==='truce','Truce snapshot required');
 need(typeof state.joined==='boolean'&&Array.isArray(state.players)&&state.players.length===2,'complete control and slot state');
 for(const [key,values] of Object.entries(stages))need(values.includes(state[key]?.[key==='opening'||key==='kingdom'?'phase':'stage']),'known '+key+' phase');
 need(typeof state.trial.luccaJoined==='boolean'&&typeof state.trial.marleJoined==='boolean','complete trial membership');
 const trial=state.trial.stage!=='none';
 const second=trial?state.trial.luccaJoined:
  ['legacy','companions'].includes(state.prologue.stage)&&
  (state.kingdom.phase==='rescue'||(state.kingdom.phase==='none'&&['none','approach','resonance'].includes(state.opening.phase)));
 const guest=trial?(state.trial.stage==='escort'||state.trial.marleJoined):
  ['allied','rescued','reunited','returned'].includes(state.rescue.stage);
 return ['p0',...(second?['p1']:[]),...(guest?['guest']:[])];
}
export function assertTownPartyCoverage(state,ids){
 const expected=[...expectedTownParty(state),'inn-sign'];
 if(!Array.isArray(ids)||JSON.stringify(ids)!==JSON.stringify(expected)){
  const e=Error('Town camera evidence: exact story-active party and nearby landmark retained');
  e.observation=structuredClone({kind:'town-party-coverage',joined:state.joined,
   prologueStage:state.prologue.stage,openingPhase:state.opening.phase,kingdomPhase:state.kingdom.phase,
   rescueStage:state.rescue.stage,trialStage:state.trial.stage,
   expectedIds:expected,observedIds:ids??null});
  throw e;
 }
 return true;
}
