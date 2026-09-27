/** Bounded selection of already drawn trial samples. Never synthesizes frames or events. */
export const TRIAL_MOTION_HISTORY = Object.freeze({id:'vq03w-semantic-trial-history',limit:24});
export type TrialHistoryKey={index:number;chapter:string;kind:string;frame:number;reducedMotion:boolean;cause:{kind:string;tick:number}|null};
export type TrialHistoryEviction='idle'|'superseded'|'duplicate'|'capacity';
const sameFamily=(a:TrialHistoryKey,b:TrialHistoryKey)=>a.index===b.index&&a.chapter===b.chapter&&a.kind===b.kind&&a.cause?.kind===b.cause?.kind;
/** Called only on overflow (25 actual samples); returned index is removed in place. */
export function trialHistoryEviction(rows:readonly TrialHistoryKey[]):{index:number;reason:TrialHistoryEviction}{
 if(rows.length!==TRIAL_MOTION_HISTORY.limit+1)throw new RangeError('Trial history overflow must contain exactly 25 samples');
 let index=rows.findIndex(row=>row.cause===null);
 if(index>=0)return {index,reason:'idle'};
 // A newer event of the same actor/operation can supersede older observations.
 // A peer's repeated attacks cannot evict the latest head repair or living recoil.
 index=rows.findIndex(row=>rows.some(next=>sameFamily(row,next)&&next.cause!.tick>row.cause!.tick));
 if(index>=0)return {index,reason:'superseded'};
 index=rows.findIndex((row,i)=>rows.some((next,j)=>j>i&&sameFamily(row,next)&&next.cause!.tick===row.cause!.tick&&next.frame===row.frame&&next.reducedMotion===row.reducedMotion));
 if(index>=0)return {index,reason:'duplicate'};
 return {index:0,reason:'capacity'};
}
