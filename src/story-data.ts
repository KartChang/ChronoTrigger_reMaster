/** Hand-authored opening sequence. Layout, timing and combat numbers are reconstruction values. */
export type OpeningPhase = 'none'|'approach'|'resonance'|'lost'|'pendant'|'crossing'|'canyon'|'vista';
export type Opening = {phase:OpeningPhase;elapsed:number;canyonWon:boolean};
export const newOpening=():Opening=>({phase:'none',elapsed:0,canyonWon:false});
export const cinematic=(phase:OpeningPhase):boolean=>['approach','resonance','crossing'].includes(phase);
export const marlePresent=(phase:OpeningPhase):boolean=>['none','approach','resonance'].includes(phase);
/** The canyon has connected terraces, with one eastern and one western turn. */
export const CANYON_ROCKS=[
  {x:-7,z:6,w:4,d:4,h:2.4}, {x:7.7,z:5,w:3.5,d:5.2,h:3.1},
  {x:-5.8,z:-2,w:4.6,d:4,h:2.7}, {x:7.6,z:-5,w:4,d:5,h:2.3},
] as const;
export function canyonWalkable(x:number,z:number):boolean{
  if(!Number.isFinite(x)||!Number.isFinite(z)||x<-10.8||x>10.8||z<-8.5||z>10.5)return false;
  return !CANYON_ROCKS.some(r=>Math.abs(x-r.x)<r.w/2+.25&&Math.abs(z-r.z)<r.d/2+.25);
}
export const CANYON_EXIT={x:0,z:-7.1};
