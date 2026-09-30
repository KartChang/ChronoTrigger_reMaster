/** A separate severe-stall watchdog for a positively identified software WebGL
 * driver. Raw frame observations and the existing <=250ms budget are untouched.
 * It only requests one of the existing density levels; never changes the backend,
 * scene, simulation, pause state, input, camera or acceptance thresholds. */
export const SOFTWARE_OVERLOAD=Object.freeze({id:'vq04o-software-overload-window',capacity:24,warmup:4,maxLevel:3,minOverruns:12,frameLimitMs:2000,meanLimitMs:250,p90LimitMs:300});
export class SoftwareOverloadBudget {
 private samples:number[]=[];private warmup=SOFTWARE_OVERLOAD.warmup;private level=0;
 private lastWindow:{meanMs:number;p90Ms:number;overruns:number}|null=null;
 sample(milliseconds:number,active:boolean):boolean {
  if(!active){this.samples=[];this.warmup=SOFTWARE_OVERLOAD.warmup;return false;}
  // A single loading/suspend stall is not sustained rendering evidence.
  if(!Number.isFinite(milliseconds)||milliseconds<=0||milliseconds>SOFTWARE_OVERLOAD.frameLimitMs){this.samples=[];return false;}
  if(this.warmup>0){this.warmup--;return false;}
  if(this.level>=SOFTWARE_OVERLOAD.maxLevel)return false;
  this.samples.push(milliseconds);if(this.samples.length<SOFTWARE_OVERLOAD.capacity)return false;
  const values=this.samples;this.samples=[];
  const meanMs=values.reduce((n,v)=>n+v,0)/values.length,p90Ms=[...values].sort((a,b)=>a-b)[Math.ceil(values.length*.9)-1]!;
  const overruns=values.filter(v=>v>250).length;this.lastWindow={meanMs,p90Ms,overruns};
  if(overruns>=SOFTWARE_OVERLOAD.minOverruns&&meanMs>SOFTWARE_OVERLOAD.meanLimitMs&&p90Ms>SOFTWARE_OVERLOAD.p90LimitMs){this.level++;return true;}
  return false;
 }
 reset():void{this.samples=[];this.warmup=SOFTWARE_OVERLOAD.warmup;this.level=0;this.lastWindow=null;}
 inspect(){return {profile:SOFTWARE_OVERLOAD.id,level:this.level,samples:this.samples.length,capacity:SOFTWARE_OVERLOAD.capacity,warmup:this.warmup,lastWindow:this.lastWindow?{...this.lastWindow}:null};}
}
