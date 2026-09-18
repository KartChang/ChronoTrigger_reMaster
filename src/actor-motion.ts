/** Authored presentation timing, not a claim of the original ROM's frame durations. */
export const MOTION_PROFILE='outlined-live-actors-r2';
export function ambientFrame(ticks:number,seed=0):number{
 const t=((Math.max(0,Math.floor(Number.isFinite(ticks)?ticks:0))+seed*37)%240+240)%240;
 return t<90?0:t<180?1:t<189?2:3;
}
export function readyFrame(ticks:number):number{return Math.floor(Math.max(0,Number.isFinite(ticks)?ticks:0)/18)%4;}
