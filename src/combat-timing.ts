import type {Effect,Actor} from './core';
import type {Mesh} from '@babylonjs/core';

/** Presentation clock only. Durations/curves are retained; no rule or save writes. */
export const COMBAT_TIMING=Object.freeze({id:'vq03r-simulation-combat-timing',ticksPerSecond:60,lungeSeconds:.42,lungeDistance:.55,strokeSeconds:.6,numberSeconds:1.25,numberRise:.8,historyLimit:24});
type Source={id:number;tick:number;effect:Effect};
export type CombatCue={source:Source;lastPhase?:string};
export type TimedCombatMesh={mesh:Mesh;time:number;cue:CombatCue};
export type CombatLunge={time:number;dx:number;dz:number;cue?:CombatCue;owner?:Actor;identity?:string};
export type TimingKind='lunge'|'stroke'|'number';
type Actual={position:number[];scale?:number[];alpha?:number;enabled:boolean;disposed:boolean;logical?:{x:number;z:number};shadow?:number[];offset?:{x:number;z:number};reason?:string};
type Row={kind:TimingKind;tick:number;ageTicks:number;seconds:number;phase:string;reducedMotion:boolean;source:Source;actual:Actual;scope:'draw-transform-not-framebuffer'};
export function stopLunge(l:CombatLunge):void{l.time=1;l.dx=0;l.dz=0;delete l.cue;delete l.owner;delete l.identity;}
export function lungePush(seconds:number,reduced:boolean):number{return reduced||seconds<0||seconds>=COMBAT_TIMING.lungeSeconds?0:Math.sin(seconds/COMBAT_TIMING.lungeSeconds*Math.PI);}
export class CombatTiming {
 private tick:number|null=null;
 private reduced=false;
 private disposed=false;
 private sequence=0;
 private history:Row[]=[];
 private dropped=0;
 rewound(tick:number):boolean{return this.tick!==null&&tick<this.tick;}
 begin(tick:number,reduced:boolean):void{
  if(this.disposed)return;
  if(!Number.isSafeInteger(tick)||tick<0)throw Error('Invalid combat presentation tick');
  if(this.rewound(tick))this.reset();
  this.tick=tick;this.reduced=reduced;
 }
 /** Called only where the renderer receives an existing effect. No invented actions. */
 delivered(e:Effect):Source{
  if(this.tick===null||this.disposed)throw Error('Combat clock is not active');
  return {id:++this.sequence,tick:this.tick,effect:structuredClone(e)};
 }
 cue(source:Source):CombatCue{return {source};}
 seconds(cue:CombatCue):number{return Math.max(0,((this.tick??cue.source.tick)-cue.source.tick)/COMBAT_TIMING.ticksPerSecond);}
 /** Read after applying the real mesh transform (and after disposal for expiry).
  * Keep phase changes only; at most 24 snapshots, not per-frame GPU readback. */
 record(kind:TimingKind,cue:CombatCue,seconds:number,actual:Actual,status='active'):void{
  if(this.disposed||this.tick===null)return;
  const duration=kind==='lunge'?COMBAT_TIMING.lungeSeconds:kind==='stroke'?COMBAT_TIMING.strokeSeconds:COMBAT_TIMING.numberSeconds;
  const phase=status==='active'?(seconds>=duration/2?'middle':'start'):status;
  const key=`${phase}/${this.reduced}`;if(cue.lastPhase===key)return;cue.lastPhase=key;
  this.history.push({kind,tick:this.tick,ageTicks:this.tick-cue.source.tick,seconds,phase,reducedMotion:this.reduced,source:structuredClone(cue.source),actual:structuredClone(actual),scope:'draw-transform-not-framebuffer'});
  if(this.history.length>COMBAT_TIMING.historyLimit){this.history.shift();this.dropped++;}
 }
 reset():void{this.tick=null;this.sequence=0;this.history=[];this.dropped=0;}
 dispose():void{this.reset();this.disposed=true;}
 inspect(){return {profile:COMBAT_TIMING.id,clock:'simulation-ticks',tick:this.tick,reducedMotion:this.reduced,disposed:this.disposed,historyLimit:COMBAT_TIMING.historyLimit,historyDropped:this.dropped,history:structuredClone(this.history),additionalGpuResources:0,stateMutation:false,approved:false};}
}
