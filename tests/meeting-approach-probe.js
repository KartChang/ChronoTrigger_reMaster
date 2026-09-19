({axis,target,direction,startTick,budget,joined,wait=false}) => {
  // Read-only observer: a genuine first collision is the end of this approach,
  // even when InputBoundary clears held input before the coordinate target.
  const t=window.__CHRONO_TEST__,s=t.snapshot(),p=s.players[0],q=s.prologue;
  const ui={focused:document.activeElement?.id||null,paused:t.paused()};
  const distance=Math.hypot(p.x+3.5,p.z+1.7);
  let reason=null;
  if(s.chapter!=='fair'||s.mode!=='explore')reason='wrong-context';
  else if(s.joined!==joined)reason='ownership-changed';
  else if(ui.paused||ui.focused!=='world')reason='input-not-owned';
  else if(!['fair','collision'].includes(q.stage)||q.first!=='unknown'||q.checkedMarle||q.pendantPicked||q.pendantReturned||q.choice||q.transition)reason='unexpected-story';
  else if(!Number.isFinite(p.x)||!Number.isFinite(p.z)||!Number.isFinite(s.ticks)||s.ticks<startTick)reason='invalid-state';
  else if(s.ticks-startTick>budget)reason='tick-budget';
  else if(!['x','z'].includes(axis)||!Number.isFinite(target)||![-1,1].includes(direction))reason='invalid-leg';
  const collision=q.stage==='collision';
  if(!reason&&collision&&distance>=.85)reason='collision-out-of-range';
  const reached=!reason&&(collision||direction*(p[axis]-target)>=0);
  const result={ok:!reason,reached,collision,reason,distance,state:s,ui};
  return wait&&!reason&&!reached?false:result;
}
