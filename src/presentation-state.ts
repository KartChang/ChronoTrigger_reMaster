import type {Effect,State} from './core';

/** The frame owner transfers events only while gameplay is running.
 * Drawing must not shift/splice State.effects, including during native dialogs.
 */
export function takeFrameEffects(state:Pick<State,'effects'>,running:boolean):Effect[]{
 return running?state.effects.splice(0):[];
}

/** Visible reading time, not time spent in a menu, native picker or hidden tab. */
export class FeedbackClock {
 private remaining=0;
 show(milliseconds=4500):void {
  this.remaining=Number.isFinite(milliseconds)?Math.max(0,milliseconds):0;
 }
 advance(seconds:number,paused:boolean):boolean {
  if(!paused&&Number.isFinite(seconds)&&seconds>0)this.remaining=Math.max(0,this.remaining-seconds*1000);
  return this.remaining>0;
 }
}
