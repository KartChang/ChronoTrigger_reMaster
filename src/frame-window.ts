/** Bounded render-loop interval observations. Not GPU time or a device benchmark.
 * Pause/start/resume boundaries are excluded; active long frames are retained. */
export class FrameWindow {
 private values:number[]=[];private active=false;private boundary=true;private rejected=0;
 sample(ms:number,active:boolean):void {
  this.active=active;
  if(!active){this.boundary=true;return;}
  if(this.boundary){this.values=[];this.boundary=false;return;}
  if(!Number.isFinite(ms)||ms<=0||ms>60000){this.rejected++;return;}
  this.values.push(ms);if(this.values.length>120)this.values.shift();
 }
 reset():void{this.values=[];this.active=false;this.boundary=true;this.rejected=0;}
 inspect(){
  const n=this.values.length,sorted=[...this.values].sort((a,b)=>a-b);
  const mean=n?this.values.reduce((a,b)=>a+b,0)/n:null;
  return {profile:'vq02f-active-frame-window' as const,active:this.active,samples:n,capacity:120,ready:n>=30,
   meanMs:mean,p95Ms:n?sorted[Math.ceil(n*.95)-1]!:null,maxMs:n?sorted[n-1]!:null,
   fps:mean===null?null:1000/mean,rejected:this.rejected,physicalDeviceApproved:false};
 }
}
export type FrameObservation=ReturnType<FrameWindow['inspect']>;
